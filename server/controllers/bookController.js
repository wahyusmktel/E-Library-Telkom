const { getPool } = require('../config/db');
const { generateSignedUrl } = require('../utils/signature');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const getAllBooks = async (req, res) => {
    try {
        const pool = getPool();
        const [rows] = await pool.query('SELECT * FROM book_catalogs WHERE deleted_at IS NULL ORDER BY created_at DESC');
        const books = rows.map(book => ({
            ...book,
            cover_url: book.cover_path ? generateSignedUrl(book.cover_path) : null,
            file_url: book.file_path ? generateSignedUrl(book.file_path) : null
        }));
        res.json(books);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch books' });
    }
};

const createBook = async (req, res) => {
    const id = uuidv4();
    const { title, publisher, isbn, edition, author, category_id, type_id, level_id, class_id, subject_id, curriculum_id, major_id, cover_path, file_path } = req.body;
    const pool = getPool();
    const nullIfEmpty = (val) => (val === '' || val === undefined) ? null : val;

    try {
        await pool.query(
            `INSERT INTO book_catalogs (id, title, publisher, isbn, edition, author, category_id, type_id, level_id, class_id, subject_id, curriculum_id, major_id, cover_path, file_path, upload_by) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                id, title, nullIfEmpty(publisher), nullIfEmpty(isbn), nullIfEmpty(edition),
                nullIfEmpty(author), nullIfEmpty(category_id), nullIfEmpty(type_id),
                nullIfEmpty(level_id), nullIfEmpty(class_id), nullIfEmpty(subject_id),
                nullIfEmpty(curriculum_id), nullIfEmpty(major_id), nullIfEmpty(cover_path),
                nullIfEmpty(file_path), req.user.id
            ]
        );
        res.json({ message: 'Book catalog created', id });
    } catch (error) {
        res.status(500).json({ message: `Failed to create book catalog: ${error.message}` });
    }
};

const updateBook = async (req, res) => {
    const { id } = req.params;
    const pool = getPool();
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
};

const deleteBook = async (req, res) => {
    try {
        const pool = getPool();
        await pool.query('UPDATE book_catalogs SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?', [req.params.id]);
        res.json({ message: 'Deleted successfully (soft-delete)' });
    } catch (error) {
        res.status(500).json({ message: 'Delete failed' });
    }
};

const uploadFile = (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const type = req.query.type === 'cover' ? 'covers' : 'books';
    const relativePath = `public/uploads/${type}/${req.file.filename}`;
    res.json({
        path: relativePath,
        url: generateSignedUrl(relativePath)
    });
};

const remoteDownload = async (req, res) => {
    const { url, type } = req.body;
    if (!url) return res.status(400).json({ message: 'URL is required' });

    res.setHeader('Content-Type', 'application/x-ndjson');
    res.setHeader('Transfer-Encoding', 'chunked');

    const sendProgress = (data) => res.write(JSON.stringify(data) + '\n');

    try {
        const response = await axios({
            method: 'get',
            url: url,
            responseType: 'stream',
            timeout: 60000,
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });

        const totalLength = parseInt(response.headers['content-length'], 10);
        let downloadedLength = 0;
        const extension = path.extname(new URL(url).pathname) || (type === 'cover' ? '.jpg' : '.pdf');
        const filename = `${Date.now()}-${uuidv4()}${extension}`;
        const relativePath = `public/uploads/${type === 'cover' ? 'covers' : 'books'}/${filename}`;
        const absolutePath = path.join(__dirname, '../', relativePath);

        const writer = fs.createWriteStream(absolutePath);
        response.data.on('data', (chunk) => {
            downloadedLength += chunk.length;
            if (totalLength) {
                sendProgress({ type: 'progress', percent: Math.round((downloadedLength / totalLength) * 100) });
            }
        });

        response.data.pipe(writer);
        await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });

        sendProgress({ type: 'success', path: relativePath, url: generateSignedUrl(relativePath) });
        res.end();
    } catch (error) {
        sendProgress({ type: 'error', message: error.message });
        res.end();
    }
};

module.exports = { getAllBooks, createBook, updateBook, deleteBook, uploadFile, remoteDownload };
