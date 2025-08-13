// api/controllers/evaluation.controller.js

const {
  createEvaluation,
  getEvaluations
} = require('../services/evaluation.service');

/**
 * Crea una nueva evaluación a partir del tipo de formulario y del body recibido.
 * La URL debe incluir /api/evaluations/:formType, por ejemplo /api/evaluations/estudiante.
 */
async function create(req, res, next) {
  try {
    const { formType } = req.params;
    const result = await createEvaluation(formType, req.body);
    res.status(201).json(result);
  } catch (err) {
    // Delegamos a un manejador de errores global si existe; si no, respondemos aquí
    const status = err.statusCode || 500;
    res.status(status).json({ message: err.message, details: err.details });
  }
}

/**
 * Lista todas las evaluaciones. Acepta filtros por querystring:
 *  - tipoFormulario: 'estudiante' | 'docente' | 'directivo'
 *  - programa: nombre del programa
 *  - asignatura: nombre de la asignatura
 *  - desde: fecha ISO mínima (createdAt >=)
 *  - hasta: fecha ISO máxima (createdAt <=)
 */
async function list(req, res, next) {
  try {
    const evaluations = await getEvaluations(req.query);
    res.json(evaluations);
  } catch (err) {
    const status = err.statusCode || 500;
    res.status(status).json({ message: err.message });
  }
}

module.exports = { create, list };
