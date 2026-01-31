const { getPool } = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const getAll = (tableName) => async (req, res) => {
    try {
        const pool = getPool();
        const [rows] = await pool.query(`SELECT * FROM ${tableName} ORDER BY created_at DESC`);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch data' });
    }
};

const create = (tableName) => async (req, res) => {
    const id = uuidv4();
    const data = { id, ...req.body };
    try {
        const pool = getPool();
        await pool.query(`INSERT INTO ${tableName} SET ?`, data);
        res.json({ message: 'Created successfully', id });
    } catch (error) {
        res.status(500).json({ message: 'Failed to create data' });
    }
};

const update = (tableName) => async (req, res) => {
    const { id } = req.params;
    const body = { ...req.body };
    delete body.id;
    delete body.created_at;

    if (Object.keys(body).length === 0) return res.status(400).json({ message: 'No fields to update' });

    try {
        const pool = getPool();
        await pool.query(`UPDATE ${tableName} SET ? WHERE id = ?`, [body, id]);
        res.json({ message: 'Updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Update failed' });
    }
};

const remove = (tableName) => async (req, res) => {
    try {
        const pool = getPool();
        await pool.query(`DELETE FROM ${tableName} WHERE id = ?`, [req.params.id]);
        res.json({ message: 'Deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete data' });
    }
};

module.exports = { getAll, create, update, remove };
