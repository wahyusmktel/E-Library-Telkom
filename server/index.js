const app = require('./app');
const { initDB } = require('./config/db');
const { startImportWorker } = require('./workers/importWorker');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        // 1. Initialize Database & Tables
        await initDB();

        // 2. Start Redis Queue Worker
        startImportWorker();

        // 3. Start Express Server
        app.listen(PORT, () => {
            console.log(`🚀 Industry Standard Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
