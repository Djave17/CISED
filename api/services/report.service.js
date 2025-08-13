const Evaluation = require('../models/evaluation');

/**
 * Obtiene todas las evaluaciones para los reportes.
 * @returns {Promise<Array>}
 */
const getReport = async () => {
  try {
    const evaluations = await Evaluation.find();
    return evaluations;
  } catch (error) {
    const newError = new Error('Error al obtener los reportes.');
    newError.statusCode = 500;
    throw newError;
  }
};

module.exports = { getReport };
