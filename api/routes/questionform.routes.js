const express = require('express');
const router = express.Router();
const { getFormByType } = require('../controllers/questionform.controller');

// Cuando se reciba una petición GET a una URL con un parámetro (ej: '/api/forms/estudiante'),
// se ejecutará la función getFormByType.
router.get('/:formType', getFormByType);

module.exports = router;
