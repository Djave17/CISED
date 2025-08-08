const Evaluation = require('../models/evaluation');

// Retrieve all evaluations for reporting purposes
const getReport = async (req, res) => {
  try {
    const evaluations = await Evaluation.find();
    res.status(200).json(evaluations);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los reportes.' });
  }
};

module.exports = { getReport };
