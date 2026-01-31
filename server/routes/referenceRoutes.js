const express = require('express');
const router = express.Router();
const ref = require('../controllers/referenceController');
const { verifyToken, verifyRole } = require('../middleware/auth');

const setupReferenceRoute = (path, tableName) => {
    router.get(`/${path}`, verifyToken, ref.getAll(tableName));
    router.post(`/${path}`, verifyToken, verifyRole(['superadmin']), ref.create(tableName));
    router.put(`/${path}/:id`, verifyToken, verifyRole(['superadmin']), ref.update(tableName));
    router.delete(`/${path}/:id`, verifyToken, verifyRole(['superadmin']), ref.remove(tableName));
};

setupReferenceRoute('book-categories', 'book_categories');
setupReferenceRoute('book-types', 'book_types');
setupReferenceRoute('levels', 'levels');
setupReferenceRoute('classes', 'classes');
setupReferenceRoute('subjects', 'subjects');
setupReferenceRoute('curriculums', 'curriculums');
setupReferenceRoute('majors', 'majors');
setupReferenceRoute('students', 'students');
setupReferenceRoute('teachers', 'teachers');

module.exports = router;
