// api/controllers/program.controller.js

const programService = require('../services/program.service');
const Program = require('../models/Program');

/**
 * Crea uno o varios programas. Admite:
 *  1) Un objeto con los campos del programa
 *  2) Un objeto { facultad, programas: [ ... ] } para creación en lote
 */
async function createProgram(req, res) {
  try {
    const result = await programService.createProgram(req.body);
    res.status(201).json(result);
  } catch (err) {
    const status = err.statusCode || 500;
    res.status(status).json({ message: err.message });
  }
}

/**
 * PUT /api/programs/:programId/asignaturas
 * Añade una nueva asignatura con fechas de inicio y fin al programa indicado,
 * siempre que no exista ya una asignatura con el mismo nombre.
 */
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
      return res.status(400).json({
        message: 'Campos requeridos: nombreAsignatura, docenteAsignado, fechaInicioAsignatura, fechaFinAsignatura'
      });
    }

    const nombreNorm = String(nombreAsignatura).trim();

    const result = await Program.updateOne(
      { _id: programId, 'asignaturas.nombreAsignatura': { $ne: nombreNorm } },
      {
        $push: {
          asignaturas: {
            nombreAsignatura: nombreNorm,
            docenteAsignado,
            fechaInicioAsignatura,
            fechaFinAsignatura
          }
        }
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Programa no encontrado o la asignatura ya existe' });
    }

    res.status(200).json({ message: 'Asignatura añadida' });
  } catch (err) {
    console.error('Error addAsignatura:', err);
    res.status(500).json({ message: 'Error interno al añadir la asignatura' });
  }
}

/**
 * PATCH /api/programs/:programId/asignaturas
 * Actualiza datos (docente o fechas) de una asignatura existente.
 */
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
    if (fechaFinAsignatura) update['asignaturas.$.fechaFinAsignatura'] = fechaFinAsignatura;

    const result = await Program.updateOne(
      { _id: programId, 'asignaturas.nombreAsignatura': String(nombreAsignatura).trim() },
      { $set: update }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Programa o asignatura no encontrada' });
    }

    res.status(200).json({ message: 'Asignatura actualizada' });
  } catch (err) {
    console.error('Error updateAsignatura:', err);
    res.status(500).json({ message: 'Error interno al actualizar la asignatura' });
  }
}

module.exports = { createProgram, addAsignatura, updateAsignatura };
