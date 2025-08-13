const questionFormService = require('../services/questionform.service');

const getFormByType = async (req, res) => {
  try {
    const { formType } = req.params;
    const form = await questionFormService.getFormByType(formType);
    res.status(200).json(form);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

// Exporta la función.
module.exports = { getFormByType };
