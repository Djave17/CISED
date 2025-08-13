const evaluationService = require('../services/evaluation.service');

const createEvaluation = async (req, res) => {
  try {
    const { formType } = req.params;
    const result = await evaluationService.createEvaluation(formType, req.body);
    res.status(201).json(result);
  } catch (error) {
    const status = error.statusCode || 500;
    const response = { message: error.message };
    if (error.details) {
      response.details = error.details;
    }
    res.status(status).json(response);
  }
};

// Exporta la función.
module.exports = { createEvaluation };