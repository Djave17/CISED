// api/routes/evaluation.routes.js
const router = require('express').Router();


const ctrl = require('../controllers/evaluation.controller');

// Rutas
router.post('/:formType', ctrl.create); // crea evaluación (usa formType: estudiante/docente/directivo)
router.get('/', ctrl.list);             // lista evaluaciones (opcional con filtros por query)

module.exports = router;
