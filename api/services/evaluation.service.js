const Evaluation = require('../models/evaluation');
const logger = require('../../lib/logger');

async function createEvaluation(formType, data) {
  try {
    const evaluationData = { ...data, tipoFormulario: formType };
    const evaluation = new Evaluation(evaluationData);
    await evaluation.save();
    return evaluation;
  } catch (err) {
    logger.error('Error saving evaluation', err);
    throw err;
  }
}

module.exports = { createEvaluation };
