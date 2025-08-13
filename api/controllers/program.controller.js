const ProgramService = require('../services/program.service');

// POST /api/programs
// Acepta:
// 1) Un solo programa en el body
// 2) Un objeto { facultad, programas: [ ... ] } para creación en lote
async function createProgram(req, res) {
  try {
    const result = await ProgramService.createProgram(req.body);
    if (Array.isArray(result)) {
      return res.status(201).json({ message: 'Programas creados', count: result.length, programas: result });
    }
    return res.status(201).json({ message: 'Programa creado', program: result });
  } catch (err) {
    if (err.message && (err.message.includes('requeridos') || err.message.startsWith('Cada programa') || err.message === 'Faltan campos obligatorios.')) {
      return res.status(400).json({ message: err.message });
    }
    console.error('Error creating program:', err);
    return res.status(500).json({ message: 'Error interno al crear el programa' });
  }
}

module.exports = { createProgram };
