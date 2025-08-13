// Importa el modelo de plantillas de formulario.
const QuestionForm = require('../models/QuestionForm');

/**
 * Obtiene la estructura de un formulario por su tipo.
 * @param {string} formType - El tipo de formulario.
 * @returns {Promise<Object>}
 */
const getFormByType = async (formType) => {
  const form = await QuestionForm.findOne({ tipoFormulario: formType });

  if (!form) {
    const error = new Error('Formulario no encontrado.');
    error.statusCode = 404;
    throw error;
  }

  return form;
};

module.exports = { getFormByType };
