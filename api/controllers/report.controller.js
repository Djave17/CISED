const reportService = require('../services/report.service');

const getReport = async (req, res) => {
  try {
    const evaluations = await reportService.getReport();
    res.status(200).json(evaluations);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

module.exports = { getReport };
