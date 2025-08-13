const programService = require('../services/program.service');

async function createProgram(req, res) {
  try {
    const result = await programService.createProgram(req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
}

const Program = require('../models/Program');

// ...createProgram ya existente

// PUT /api/programs/:programId/asignaturas
async function addAsignatura(req, res) {
  try {
    const { programId } = req.params;
    const {
      nombreAsignatura,
      docenteAsignado,
      fechaInicioAsignatura,
      fechaFinAsignatura,
    } = req.body;

    if (!nombreAsignatura || !docenteAsignado || !fechaInicioAsignatura || !fechaFinAsignatura) {
      return res.status(400).json({ message: 'Campos requeridos: nombreAsignatura, docenteAsignado, fechaInicioAsignatura, fechaFinAsignatura' });
    }

    // Normalizamos nombre para evitar duplicados por casing/espacios
    const nombreNorm = String(nombreAsignatura).trim();

    // Inserta solo si NO existe otra asignatura con ese nombre
    const result = await Program.updateOne(
      { _id: programId, 'asignaturas.nombreAsignatura': { $ne: nombreNorm } },
      { $push: { asignaturas: { nombreAsignatura: nombreNorm, docenteAsignado, fechaInicioAsignatura, fechaFinAsignatura } } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Programa no encontrado o la asignatura ya existe' });
    }

    return res.status(200).json({ message: 'Asignatura añadida' });

  } catch (err) {
    console.error('Error addAsignatura:', err);
    return res.status(500).json({ message: 'Error interno al añadir la asignatura' });
  }
}

// PATCH /api/programs/:programId/asignaturas
// (opcional) Actualiza fechas/docente si la asignatura existe
async function updateAsignatura(req, res) {
  try {
    const { programId } = req.params;
    const {
      nombreAsignatura,
      docenteAsignado,
      fechaInicioAsignatura,
      fechaFinAsignatura,
    } = req.body;

    const update = {};
    if (docenteAsignado) update['asignaturas.$.docenteAsignado'] = docenteAsignado;
    if (fechaInicioAsignatura) update['asignaturas.$.fechaInicioAsignatura'] = fechaInicioAsignatura;
    if (fechaFinAsignatura)    update['asignaturas.$.fechaFinAsignatura']    = fechaFinAsignatura;

    const result = await Program.updateOne(
      { _id: programId, 'asignaturas.nombreAsignatura': String(nombreAsignatura).trim() },
      { $set: update }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Programa o asignatura no encontrada' });
    }

    return res.status(200).json({ message: 'Asignatura actualizada' });
  } catch (err) {
    console.error('Error updateAsignatura:', err);
    return res.status(500).json({ message: 'Error interno al actualizar la asignatura' });
  }
}

module.exports = { createProgram, addAsignatura, updateAsignatura };



