const Evaluation = require('../models/evaluation');
const logger = require('../../lib/logger');

async function getReport() {
  try {
    return await Evaluation.find();
  } catch (err) {
    logger.error('Error fetching report', err);
    throw err;
  }
}

module.exports = { getReport };
