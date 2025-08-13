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
// Get Evaluations 

const getEvaluations = async (req, res) => {
  try {
    const evaluations = await evaluationService.getEvaluations();
    res.status(200).json(evaluations);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

// Exporta la función.

module.exports = { createEvaluation, getEvaluations };


