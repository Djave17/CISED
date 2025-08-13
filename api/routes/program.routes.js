const express = require('express');
const router = express.Router();
const { createProgram, addAsignatura, updateAsignatura } = require('../controllers/program.controller');

router.post('/', createProgram);
router.put('/:programId/asignaturas', addAsignatura);     // añade si NO existe
router.patch('/:programId/asignaturas', updateAsignatura); // actualiza si SÍ existe

module.exports = router;
