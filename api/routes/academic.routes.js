const express = require('express');
const router = express.Router();

// Importa el controlador que acabamos de verificar.
const { getAllAcademicData, createProgram } = require('../controllers/academic.controller');

// Ruta para crear un nuevo programa
router.post('/programs', createProgram);

// Le dice al enrutador:
// Cuando llegue una petición GET a la raíz ('/'), ejecuta la función getAllAcademicData.
router.get('/', getAllAcademicData);

// Exporta el enrutador configurado.
module.exports = router;