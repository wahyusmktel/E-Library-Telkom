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

        try {
            const workbook = XLSX.readFile(absolutePath);
            const sheetName = workbook.SheetNames[0];
            const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
            const total = rows.length;

            for (let i = 0; i < total; i++) {
                const row = rows[i];
                const id = uuidv4();

                if (type === 'siswa') {
                    await pool.query(
                        'INSERT IGNORE INTO students (id, nisn, name, gender, level_id, class_id, major_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
                        [id, row.NISN, row.Nama, row['Jenis Kelamin (L/P)'], row['ID Jenjang'], row['ID Kelas'], row['ID Jurusan']]
                    );
                } else if (type === 'guru') {
                    await pool.query(
                        'INSERT IGNORE INTO teachers (id, nip, name, gender, subject_id) VALUES (?, ?, ?, ?, ?)',
                        [id, row.NIP, row.Nama, row['Jenis Kelamin (L/P)'], row['ID Mapel']]
                    );
                }

                await job.progress(Math.round(((i + 1) / total) * 100));
            }

            if (fs.existsSync(absolutePath)) fs.unlinkSync(absolutePath);
            return { success: true, count: total };
        } catch (error) {
            console.error('Import worker error:', error);
            if (fs.existsSync(absolutePath)) fs.unlinkSync(absolutePath);
            throw error;
        }
    });

    console.log('Import queue worker started.');
};

module.exports = { startImportWorker };
