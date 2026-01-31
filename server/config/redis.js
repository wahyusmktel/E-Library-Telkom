const Bull = require('bull');

const importQueue = new Bull('import-queue', {
    redis: {
        port: process.env.REDIS_PORT || 6379,
        host: process.env.REDIS_HOST || '127.0.0.1'
    }
});

module.exports = { importQueue };
