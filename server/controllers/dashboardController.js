const { getPool } = require('../config/db');

exports.getStats = async (req, res) => {
    try {
        const pool = getPool();

        const statsQuery = `
            SELECT
                (SELECT COUNT(*) FROM students WHERE deleted_at IS NULL) as totalStudents,
                (SELECT COUNT(*) FROM teachers WHERE deleted_at IS NULL) as totalTeachers,
                (SELECT COUNT(*) FROM book_catalogs) as totalBooks,
                (SELECT COUNT(*) FROM classes) as totalClasses
        `;

        const activitiesQuery = `
            (SELECT 'student' as type, name, created_at FROM students WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT 5)
            UNION ALL
            (SELECT 'teacher' as type, name, created_at FROM teachers WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT 5)
            ORDER BY created_at DESC
            LIMIT 5
        `;

        const [statsResult] = await pool.query(statsQuery);
        const [activitiesResult] = await pool.query(activitiesQuery);

        res.json({
            stats: statsResult[0],
            recentActivities: activitiesResult
        });
    } catch (error) {
        console.error('Dashboard Stats Error:', error);
        res.status(500).json({ message: error.message });
    }
};
