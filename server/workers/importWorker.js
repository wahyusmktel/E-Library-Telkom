const { importQueue } = require('../config/redis');
const { getPool } = require('../config/db');
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const startImportWorker = () => {
    importQueue.process(async (job) => {
        const { type, filePath } = job.data;
        const absolutePath = path.resolve(filePath);
        const pool = getPool();

        let successCount = 0;
        let failedCount = 0;
        const errors = [];

        try {
            const workbook = XLSX.readFile(absolutePath);
            const sheetName = workbook.SheetNames[0];
            const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
            const total = rows.length;

            // Pre-fetch all majors for smart inference
            const [allMajors] = await pool.query('SELECT id, name FROM majors');

            // Helper to find ID by Name
            const findIdByName = async (table, name) => {
                if (!name) return null;
                const [rows] = await pool.query(`SELECT id FROM ${table} WHERE name = ? LIMIT 1`, [name.trim()]);
                return rows.length > 0 ? rows[0].id : null;
            };

            for (let i = 0; i < total; i++) {
                const row = rows[i];
                const rowNum = i + 2; // Excel row number (1-indexed + header)

                try {
                    if (type === 'siswa') {
                        if (!row.NISN || !row.Nama) throw new Error('NISN dan Nama wajib diisi');

                        const levelId = await findIdByName('levels', row.Jenjang);
                        const classId = await findIdByName('classes', row.Kelas);

                        let majorId = await findIdByName('majors', row.Jurusan);

                        // --- Smart Major Inference ---
                        if (!majorId && row.Kelas) {
                            const className = row.Kelas.toUpperCase();
                            // Find any major name that is contained within the class name
                            const matchedMajor = allMajors.find(m =>
                                className.includes(m.name.toUpperCase())
                            );
                            if (matchedMajor) {
                                majorId = matchedMajor.id;
                            }
                        }

                        // Upsert logic for students using NISN
                        await pool.query(
                            `INSERT INTO students (id, nisn, name, gender, level_id, class_id, major_id) 
                             VALUES (?, ?, ?, ?, ?, ?, ?)
                             ON DUPLICATE KEY UPDATE 
                                name = VALUES(name), 
                                gender = VALUES(gender), 
                                level_id = VALUES(level_id), 
                                class_id = VALUES(class_id), 
                                major_id = VALUES(major_id)`,
                            [uuidv4(), row.NISN, row.Nama, row['Jenis Kelamin (L/P)'], levelId, classId, majorId]
                        );
                    } else if (type === 'guru') {
                        if (!row.Nama) throw new Error('Nama guru wajib diisi');

                        const subjectId = await findIdByName('subjects', row['Mata Pelajaran']);

                        // Upsert logic for teachers using NIP
                        await pool.query(
                            `INSERT INTO teachers (id, nip, name, gender, subject_id) 
                             VALUES (?, ?, ?, ?, ?)
                             ON DUPLICATE KEY UPDATE 
                                name = VALUES(name), 
                                gender = VALUES(gender), 
                                subject_id = VALUES(subject_id)`,
                            [uuidv4(), row.NIP || null, row.Nama, row['Jenis Kelamin (L/P)'], subjectId]
                        );
                    }
                    successCount++;
                } catch (err) {
                    failedCount++;
                    errors.push({
                        row: rowNum,
                        data: row.NISN || row.NIP || row.Nama || 'N/A',
                        reason: err.message
                    });
                }

                await job.progress(Math.round(((i + 1) / total) * 100));
            }

            if (fs.existsSync(absolutePath)) fs.unlinkSync(absolutePath);
            return {
                success: true,
                total,
                successCount,
                failedCount,
                errors
            };
        } catch (error) {
            console.error('Import worker error:', error);
            if (fs.existsSync(absolutePath)) fs.unlinkSync(absolutePath);
            throw error;
        }
    });

    console.log('Import queue worker started with Smart Major Inference logic.');
};

module.exports = { startImportWorker };
