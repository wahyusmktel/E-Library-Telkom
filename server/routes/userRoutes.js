const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken, verifyRole } = require('../middleware/auth');

// Students
router.get('/students', verifyToken, userController.getStudents);
router.post('/students', verifyToken, verifyRole(['superadmin', 'admin']), userController.createStudent);
router.put('/students/:id', verifyToken, verifyRole(['superadmin', 'admin']), userController.updateStudent);
router.delete('/students/:id', verifyToken, verifyRole(['superadmin', 'admin']), userController.softDeleteStudent);

// Teachers
router.get('/teachers', verifyToken, userController.getTeachers);
router.post('/teachers', verifyToken, verifyRole(['superadmin', 'admin']), userController.createTeacher);
router.put('/teachers/:id', verifyToken, verifyRole(['superadmin', 'admin']), userController.updateTeacher);
router.delete('/teachers/:id', verifyToken, verifyRole(['superadmin', 'admin']), userController.softDeleteTeacher);

module.exports = router;
