const QuestionForm = require('../models/QuestionForm');
const logger = require('../../lib/logger');

async function getFormByType(formType) {
  try {
    return await QuestionForm.findOne({ tipoFormulario: formType });
  } catch (err) {
    logger.error('Error fetching form', err);
    throw err;
  }
}

module.exports = { getFormByType };
