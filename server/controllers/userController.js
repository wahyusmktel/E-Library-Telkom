const { getPool } = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const userController = {
    getStudents: async (req, res) => {
        try {
            const pool = getPool();
            const { page = 1, limit = 10, q = '', level, classNames, major } = req.query;
            const offset = (page - 1) * limit;

            let query = `
                SELECT s.*, l.name as level_name, c.name as class_name, m.name as major_name 
                FROM students s
                LEFT JOIN levels l ON s.level_id = l.id
                LEFT JOIN classes c ON s.class_id = c.id
                LEFT JOIN majors m ON s.major_id = m.id
                WHERE s.deleted_at IS NULL
            `;
            const params = [];

            if (q) {
                query += ` AND (s.name LIKE ? OR s.nisn LIKE ?)`;
                params.push(`%${q}%`, `%${q}%`);
            }
            if (level) {
                query += ` AND s.level_id = ?`;
                params.push(level);
            }
            if (classNames) {
                query += ` AND s.class_id = ?`;
                params.push(classNames);
            }
            if (major) {
                query += ` AND s.major_id = ?`;
                params.push(major);
            }

            // Count total for pagination
            const [countRows] = await pool.query(`SELECT COUNT(*) as total FROM (${query}) as t`, params);
            const total = countRows[0].total;

            // Final query with limit/offset
            query += ` ORDER BY s.created_at DESC LIMIT ? OFFSET ?`;
            params.push(parseInt(limit), parseInt(offset));

            const [rows] = await pool.query(query, params);

            res.json({
                data: rows,
                pagination: {
                    total,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(total / limit)
                }
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    getTeachers: async (req, res) => {
        try {
            const pool = getPool();
            const { page = 1, limit = 10, q = '', subject } = req.query;
            const offset = (page - 1) * limit;

            let query = `
                SELECT t.*, s.name as subject_name 
                FROM teachers t
                LEFT JOIN subjects s ON t.subject_id = s.id
                WHERE t.deleted_at IS NULL
            `;
            const params = [];

            if (q) {
                query += ` AND (t.name LIKE ? OR t.nip LIKE ?)`;
                params.push(`%${q}%`, `%${q}%`);
            }
            if (subject) {
                query += ` AND t.subject_id = ?`;
                params.push(subject);
            }

            const [countRows] = await pool.query(`SELECT COUNT(*) as total FROM (${query}) as t`, params);
            const total = countRows[0].total;

            query += ` ORDER BY t.created_at DESC LIMIT ? OFFSET ?`;
            params.push(parseInt(limit), parseInt(offset));

            const [rows] = await pool.query(query, params);

            res.json({
                data: rows,
                pagination: {
                    total,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(total / limit)
                }
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    createStudent: async (req, res) => {
        try {
            const pool = getPool();
            const { nisn, name, gender, level_id, class_id, major_id } = req.body;
            const id = uuidv4();
            await pool.query(
                'INSERT INTO students (id, nisn, name, gender, level_id, class_id, major_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [id, nisn, name, gender, level_id, class_id, major_id]
            );
            res.status(201).json({ message: 'Siswa berhasil ditambahkan' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    updateStudent: async (req, res) => {
        try {
            const pool = getPool();
            const { id } = req.params;
            const { nisn, name, gender, level_id, class_id, major_id } = req.body;
            await pool.query(
                'UPDATE students SET nisn = ?, name = ?, gender = ?, level_id = ?, class_id = ?, major_id = ? WHERE id = ?',
                [nisn, name, gender, level_id, class_id, major_id, id]
            );
            res.json({ message: 'Data siswa berhasil diperbarui' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    softDeleteStudent: async (req, res) => {
        try {
            const pool = getPool();
            const { id } = req.params;
            await pool.query('UPDATE students SET deleted_at = NOW() WHERE id = ?', [id]);
            res.json({ message: 'Siswa berhasil dihapus (soft delete)' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    createTeacher: async (req, res) => {
        try {
            const pool = getPool();
            const { nip, name, gender, subject_id } = req.body;
            const id = uuidv4();
            await pool.query(
                'INSERT INTO teachers (id, nip, name, gender, subject_id) VALUES (?, ?, ?, ?, ?)',
                [id, nip, name, gender, subject_id]
            );
            res.status(201).json({ message: 'Guru berhasil ditambahkan' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    updateTeacher: async (req, res) => {
        try {
            const pool = getPool();
            const { id } = req.params;
            const { nip, name, gender, subject_id } = req.body;
            await pool.query(
                'UPDATE teachers SET nip = ?, name = ?, gender = ?, subject_id = ? WHERE id = ?',
                [nip, name, gender, subject_id, id]
            );
            res.json({ message: 'Data guru berhasil diperbarui' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    softDeleteTeacher: async (req, res) => {
        try {
            const pool = getPool();
            const { id } = req.params;
            await pool.query('UPDATE teachers SET deleted_at = NOW() WHERE id = ?', [id]);
            res.json({ message: 'Guru berhasil dihapus (soft delete)' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
};

module.exports = userController;
