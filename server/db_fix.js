const mysql = require('mysql2/promise');
require('dotenv').config();

async function fix() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME
    });

    try {
        console.log('Dropping table book_catalogs...');
        await connection.query('DROP TABLE IF EXISTS book_catalogs');

        console.log('Recreating table book_catalogs...');
        await connection.query(`
            CREATE TABLE book_catalogs (
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
                FOREIGN KEY (major_id) REFERENCES majors(id)
            )
        `);
        console.log('Table book_catalogs recreated successfully.');
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await connection.end();
    }
}

fix();
