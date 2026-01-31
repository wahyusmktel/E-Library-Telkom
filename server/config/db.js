const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

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

        // Reference Data Tables
        await pool.query(`CREATE TABLE IF NOT EXISTS users (id CHAR(36) PRIMARY KEY, name VARCHAR(255) NOT NULL, email VARCHAR(255) UNIQUE NOT NULL, password VARCHAR(255) NOT NULL, role ENUM('superadmin', 'admin', 'user') DEFAULT 'user', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
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

        // Students & Teachers
        await pool.query(`
            CREATE TABLE IF NOT EXISTS students (
                id CHAR(36) PRIMARY KEY,
                nisn VARCHAR(20) UNIQUE NOT NULL,
                name VARCHAR(255) NOT NULL,
                gender ENUM('L', 'P'),
                level_id CHAR(36),
                class_id CHAR(36),
                major_id CHAR(36),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (level_id) REFERENCES levels(id),
                FOREIGN KEY (class_id) REFERENCES classes(id),
                FOREIGN KEY (major_id) REFERENCES majors(id)
            )
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS teachers (
                id CHAR(36) PRIMARY KEY,
                nip VARCHAR(30) UNIQUE,
                name VARCHAR(255) NOT NULL,
                gender ENUM('L', 'P'),
                subject_id CHAR(36),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (subject_id) REFERENCES subjects(id)
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

        return pool;
    } catch (error) {
        console.error('Database initialization failed:', error);
        throw error;
    }
}

const getPool = () => {
    if (!pool) throw new Error('Database pool not initialized. Call initDB first.');
    return pool;
};

module.exports = { initDB, getPool };
