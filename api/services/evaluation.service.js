const Evaluation = require('../models/evaluation');

/**
 * Crea una nueva evaluación en la base de datos.
 * @param {string} formType - El tipo de formulario.
 * @param {Object} body - El cuerpo de la solicitud.
 * @returns {Promise<Object>}
 */
const createEvaluation = async (formType, body) => {
  try {
    const evaluationData = {
      ...body,
      tipoFormulario: formType
    };

    const newEvaluation = new Evaluation(evaluationData);
    await newEvaluation.save();

    return { message: 'Evaluación guardada exitosamente.' };
  } catch (error) {
    if (error.name === 'ValidationError') {
      const newError = new Error('Error de validación.');
      newError.statusCode = 400;
      newError.details = error.errors;
      throw newError;
    }
    const newError = new Error('Error al guardar la evaluación.');
    newError.statusCode = 500;
    throw newError;
  }
};

/**
 * Obtiene todas las evaluaciones de la base de datos.
 * @returns {Promise<Array<Object>>} Lista de evaluaciones
 */
// api/services/evaluation.service.js
const getEvaluations = async (filters = {}) => {   // ← plural aquí
  try {
    const { tipoFormulario, programa, asignatura, desde, hasta } = filters;
    const q = {};
    if (tipoFormulario) q.tipoFormulario = tipoFormulario;         
    if (programa)       q['informacionAcademica.programa']   = programa;
    if (asignatura)     q['informacionAcademica.asignatura'] = asignatura;
    if (desde || hasta) {
      q.createdAt = {};
      if (desde) q.createdAt.$gte = new Date(desde);
      if (hasta) q.createdAt.$lte = new Date(hasta);
    }
    return await Evaluation.find(q).lean();
  } catch (error) {
    const newError = new Error('Error al obtener las evaluaciones');
    newError.statusCode = 500;
    throw newError;
  }
};

module.exports = { createEvaluation, getEvaluations };
