const db = require('../config/db');

exports.getStats = (req, res) => {
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

    db.query(statsQuery, (err, statsResult) => {
        if (err) return res.status(500).json({ message: err.message });

        db.query(activitiesQuery, (err, activitiesResult) => {
            if (err) return res.status(500).json({ message: err.message });

            res.json({
                stats: statsResult[0],
                recentActivities: activitiesResult
            });
        });
    });
};
