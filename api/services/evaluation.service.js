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

module.exports = { createEvaluation };
