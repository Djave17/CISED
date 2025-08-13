const programService = require('../services/program.service');

async function createProgram(req, res) {
  try {
    const result = await programService.createProgram(req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
}

module.exports = { createProgram };
