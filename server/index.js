const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

app.use(cors({
    origin: true, // Reflect the request origin
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'X-Requested-With'],
    optionsSuccessStatus: 200
}));

app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Multer Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const type = req.query.type === 'cover' ? 'covers' : 'books';
        const dir = `public/uploads/${type}`;
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${uuidv4()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit
});

// Signed URL Helpers
const SIGNED_URL_SECRET = process.env.JWT_SECRET || 'secret-key';
function generateSignedUrl(filePath, expiresIn = '1h') {
    const expires = Date.now() + (parseInt(expiresIn) * 3600 * 1000);
    const signature = crypto.createHmac('sha256', SIGNED_URL_SECRET)
        .update(`${filePath}${expires}`)
        .digest('hex');
    return `/api/files/view?path=${encodeURIComponent(filePath)}&expires=${expires}&signature=${signature}`;
}

function verifySignature(filePath, expires, signature) {
    if (Date.now() > parseInt(expires)) return false;
    const expectedSignature = crypto.createHmac('sha256', SIGNED_URL_SECRET)
        .update(`${filePath}${expires}`)
        .digest('hex');
    return signature === expectedSignature;
}

let pool;

async function initDB() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
        });

        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\`;`);
        await connection.end();

        pool = mysql.createPool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });

        console.log('Database connected and initialized.');

        // Initialize tables
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id CHAR(36) PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                role ENUM('superadmin', 'admin', 'user') DEFAULT 'user',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Reference Data Tables
        await pool.query(`CREATE TABLE IF NOT EXISTS book_categories (id CHAR(36) PRIMARY KEY, name VARCHAR(255) NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
        await pool.query(`CREATE TABLE IF NOT EXISTS book_types (id CHAR(36) PRIMARY KEY, name VARCHAR(255) NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
        await pool.query(`CREATE TABLE IF NOT EXISTS levels (id CHAR(36) PRIMARY KEY, name VARCHAR(255) NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
        await pool.query(`CREATE TABLE IF NOT EXISTS classes (id CHAR(36) PRIMARY KEY, name VARCHAR(255) NOT NULL, level_id CHAR(36), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
        await pool.query(`CREATE TABLE IF NOT EXISTS subjects (id CHAR(36) PRIMARY KEY, name VARCHAR(255) NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
        await pool.query(`CREATE TABLE IF NOT EXISTS curriculums (id CHAR(36) PRIMARY KEY, name VARCHAR(255) NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
        await pool.query(`CREATE TABLE IF NOT EXISTS majors (id CHAR(36) PRIMARY KEY, name VARCHAR(255) NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS book_catalogs (
                id CHAR(36) PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                publisher VARCHAR(255),
                isbn VARCHAR(50),
                edition INT,
                author VARCHAR(255),
                category_id CHAR(36),
                type_id CHAR(36),
                level_id CHAR(36),
                class_id CHAR(36),
                subject_id CHAR(36),
                curriculum_id CHAR(36),
                major_id CHAR(36),
                cover_path VARCHAR(255),
                file_path VARCHAR(255),
                upload_by CHAR(36),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                deleted_at TIMESTAMP NULL,
                FOREIGN KEY (category_id) REFERENCES book_categories(id),
                FOREIGN KEY (type_id) REFERENCES book_types(id),
                FOREIGN KEY (level_id) REFERENCES levels(id),
                FOREIGN KEY (class_id) REFERENCES classes(id),
                FOREIGN KEY (subject_id) REFERENCES subjects(id),
                FOREIGN KEY (curriculum_id) REFERENCES curriculums(id),
                FOREIGN KEY (major_id) REFERENCES majors(id),
                FOREIGN KEY (upload_by) REFERENCES users(id)
            )
        `);

        // Seed superadmin
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', ['superadmin@telkom.co.id']);
        if (rows.length === 0) {
            const hashedPassword = await bcrypt.hash('11081995', 10);
            await pool.query(
                'INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)',
                [uuidv4(), 'Super Admin', 'superadmin@telkom.co.id', hashedPassword, 'superadmin']
            );
            console.log('Superadmin seeded.');
        }

    } catch (error) {
        console.error('Database initialization failed:', error);
        process.exit(1);
    }
}

// Middleware for role verification
const verifyToken = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};

const verifyRole = (roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Forbidden: Access denied' });
        }
        next();
    };
};

// Routes
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length === 0) {
            return res.status(401).json({ message: 'Email atau password salah.' });
        }

        const user = rows[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Email atau password salah.' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        });

        res.json({
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.get('/api/me', verifyToken, async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT id, name, email, role FROM users WHERE id = ?', [req.user.id]);

        if (rows.length === 0) {
            return res.status(401).json({ message: 'User not found' });
        }

        res.json({ user: rows[0] });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Signed URL File Viewing
app.get('/api/files/view', (req, res) => {
    const { path: filePath, expires, signature } = req.query;
    if (!filePath || !expires || !signature) return res.status(400).json({ message: 'Missing parameters' });

    if (!verifySignature(filePath, expires, signature)) {
        return res.status(403).json({ message: 'Invalid or expired signature' });
    }

    const absolutePath = path.join(__dirname, filePath);
    if (!fs.existsSync(absolutePath)) return res.status(404).json({ message: 'File not found' });

    res.sendFile(absolutePath);
});

// Advanced Book Catalog Routes
app.post('/api/books/upload', verifyToken, verifyRole(['superadmin']), upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const relativePath = `public/uploads/${req.query.type === 'cover' ? 'covers' : 'books'}/${req.file.filename}`;
    res.json({ path: relativePath });
});

app.post('/api/books/remote-download', verifyToken, verifyRole(['superadmin']), async (req, res) => {
    const { url, type } = req.body;
    if (!url) return res.status(400).json({ message: 'URL is required' });

    try {
        const response = await axios({
            method: 'get',
            url: url,
            responseType: 'stream'
        });

        const extension = path.extname(new URL(url).pathname) || (type === 'cover' ? '.jpg' : '.pdf');
        const filename = `${Date.now()}-${uuidv4()}${extension}`;
        const relativePath = `public/uploads/${type === 'cover' ? 'covers' : 'books'}/${filename}`;
        const absolutePath = path.join(__dirname, relativePath);

        const writer = fs.createWriteStream(absolutePath);
        response.data.pipe(writer);

        await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });

        res.json({ path: relativePath });
    } catch (error) {
        console.error('Remote download failed:', error);
        res.status(500).json({ message: 'Remote download failed' });
    }
});

app.get('/api/book-catalogs', verifyToken, async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM book_catalogs WHERE deleted_at IS NULL ORDER BY created_at DESC');
        // Generate signed URLs for each book
        const books = rows.map(book => ({
            ...book,
            cover_url: book.cover_path ? generateSignedUrl(book.cover_path) : null,
            file_url: book.file_path ? generateSignedUrl(book.file_path) : null
        }));
        res.json(books);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch books' });
    }
});

app.post('/api/book-catalogs', verifyToken, verifyRole(['superadmin']), async (req, res) => {
    const id = uuidv4();
    const { title, publisher, isbn, edition, author, category_id, type_id, level_id, class_id, subject_id, curriculum_id, major_id, cover_path, file_path } = req.body;

    try {
        await pool.query(
            `INSERT INTO book_catalogs (id, title, publisher, isbn, edition, author, category_id, type_id, level_id, class_id, subject_id, curriculum_id, major_id, cover_path, file_path, upload_by) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, title, publisher, isbn, edition, author, category_id, type_id, level_id, class_id, subject_id, curriculum_id, major_id, cover_path, file_path, req.user.id]
        );
        res.json({ message: 'Book catalog created', id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to create book catalog' });
    }
});

app.put('/api/book-catalogs/:id', verifyToken, verifyRole(['superadmin']), async (req, res) => {
    const { id } = req.params;
    const body = { ...req.body };
    delete body.id;
    delete body.created_at;
    delete body.updated_at;
    delete body.upload_by;

    try {
        await pool.query('UPDATE book_catalogs SET ? WHERE id = ?', [body, id]);
        res.json({ message: 'Updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Update failed' });
    }
});

app.delete('/api/book-catalogs/:id', verifyToken, verifyRole(['superadmin']), async (req, res) => {
    try {
        await pool.query('UPDATE book_catalogs SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?', [req.params.id]);
        res.json({ message: 'Deleted successfully (soft-delete)' });
    } catch (error) {
        res.status(500).json({ message: 'Delete failed' });
    }
});

// Generic CRUD helper
const setupCRUD = (tableName, path) => {
    app.get(`/api/${path}`, verifyToken, async (req, res) => {
        try {
            const [rows] = await pool.query(`SELECT * FROM ${tableName} ORDER BY created_at DESC`);
            res.json(rows);
        } catch (error) {
            res.status(500).json({ message: 'Failed to fetch data' });
        }
    });

    app.post(`/api/${path}`, verifyToken, verifyRole(['superadmin']), async (req, res) => {
        const id = uuidv4();
        const data = { id, ...req.body };
        try {
            await pool.query(`INSERT INTO ${tableName} SET ?`, data);
            res.json({ message: 'Created successfully', id });
        } catch (error) {
            res.status(500).json({ message: 'Failed to create data' });
        }
    });

    app.put(`/api/${path}/:id`, verifyToken, verifyRole(['superadmin']), async (req, res) => {
        const { id } = req.params;
        const body = { ...req.body };
        delete body.id;
        delete body.created_at;

        if (Object.keys(body).length === 0) {
            return res.status(400).json({ message: 'No fields to update' });
        }

        try {
            await pool.query(`UPDATE ${tableName} SET ? WHERE id = ?`, [body, id]);
            res.json({ message: 'Updated successfully' });
        } catch (error) {
            console.error(`[Error PUT ${path}]`, error);
            res.status(500).json({ message: 'Update failed' });
        }
    });

    app.delete(`/api/${path}/:id`, verifyToken, verifyRole(['superadmin']), async (req, res) => {
        try {
            await pool.query(`DELETE FROM ${tableName} WHERE id = ?`, [req.params.id]);
            res.json({ message: 'Deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Failed to delete data' });
        }
    });
};

setupCRUD('book_categories', 'book-categories');
setupCRUD('book_types', 'book-types');
setupCRUD('levels', 'levels');
setupCRUD('classes', 'classes');
setupCRUD('subjects', 'subjects');
setupCRUD('curriculums', 'curriculums');
setupCRUD('majors', 'majors');

app.post('/api/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Logged out successfully' });
});

initDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});
