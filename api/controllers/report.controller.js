const reportService = require('../services/report.service');

const getReport = async (req, res) => {
  try {
    const evaluations = await reportService.getReport();
    res.status(200).json(evaluations);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

const getFormStatistics = async (req, res) => {
  try {
    const stats = await reportService.getFormStatistics();
    res.status(200).json(stats);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

module.exports = { getReport, getFormStatistics };
