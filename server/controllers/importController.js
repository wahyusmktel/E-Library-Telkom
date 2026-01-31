const { importQueue } = require('../config/redis');
const XLSX = require('xlsx');
const fs = require('fs');

const getTemplate = (req, res) => {
    const { type } = req.params;
    let data = [];
    let filename = '';

    if (type === 'siswa') {
        data = [['NISN', 'Nama', 'Jenis Kelamin (L/P)', 'Jenjang', 'Kelas', 'Jurusan']];
        filename = 'template_siswa.xlsx';
    } else if (type === 'guru') {
        data = [['NIP', 'Nama', 'Jenis Kelamin (L/P)', 'Mata Pelajaran']];
        filename = 'template_guru.xlsx';
    } else {
        return res.status(400).json({ message: 'Invalid type' });
    }

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
};

const startImport = async (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const { type } = req.params;

    const job = await importQueue.add({
        type,
        filePath: req.file.path,
        userId: req.user.id
    });

    res.json({ jobId: job.id, message: 'Import started' });
};

const getImportStatus = async (req, res) => {
    const job = await importQueue.getJob(req.params.jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    const state = await job.getState();
    const progress = job.progress();
    const result = job.returnvalue;
    const error = job.failedReason;

    res.json({ state, progress, result, error });
};

module.exports = { getTemplate, startImport, getImportStatus };
