const express = require('express');
const router = express.Router();
const { createEvaluation } = require('../controllers/evaluation.controller');

// Cuando se reciba una petición POST a una URL con un parámetro (ej: '/api/evaluations/estudiante'),
// se ejecutará la función createEvaluation.
router.post('/:formType', createEvaluation);

module.exports = router;