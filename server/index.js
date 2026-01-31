const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
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

// Generic CRUD helper
const setupCRUD = (tableName, path) => {
    app.get(`/api/${path}`, verifyToken, verifyRole(['superadmin']), async (req, res) => {
        try {
            const [rows] = await pool.query(`SELECT * FROM ${tableName} ORDER BY created_at DESC`);
            res.json(rows);
        } catch (error) {
            res.status(500).json({ message: 'Failed to fetch data' });
        }
    });

    app.post(`/api/${path}`, verifyToken, verifyRole(['superadmin']), async (req, res) => {
        try {
            const id = uuidv4();
            const fields = Object.keys(req.body);
            const values = Object.values(req.body);
            const placeholders = fields.map(() => '?').join(', ');

            await pool.query(
                `INSERT INTO ${tableName} (id, ${fields.join(', ')}) VALUES (?, ${placeholders})`,
                [id, ...values]
            );
            res.status(201).json({ id, ...req.body });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Failed to create data' });
        }
    });

    app.put(`/api/${path}/:id`, verifyToken, verifyRole(['superadmin']), async (req, res) => {
        try {
            const modifiableData = { ...req.body };
            delete modifiableData.id;
            delete modifiableData.created_at;

            const fields = Object.keys(modifiableData);
            const values = Object.values(modifiableData);

            if (fields.length === 0) {
                return res.status(400).json({ message: 'No fields to update' });
            }

            const setClause = fields.map(f => `${f} = ?`).join(', ');

            await pool.query(
                `UPDATE ${tableName} SET ${setClause} WHERE id = ?`,
                [...values, req.params.id]
            );
            res.json({ id: req.params.id, ...modifiableData });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Failed to update data' });
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
