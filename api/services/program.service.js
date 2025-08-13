const Program = require('../models/Program');
const logger = require('../../lib/logger');
const { isNonEmptyString, hasRequiredFields } = require('../../lib/validators');

async function createProgram(payload) {
  try {
    if (Array.isArray(payload?.programas)) {
      const facultadGrupo = payload.facultad;
      const programas = payload.programas;
      if (!isNonEmptyString(facultadGrupo) || programas.length === 0) {
        throw new Error('facultad y programas son requeridos.');
      }
      const docs = programas.map(p => {
        const required = ['nombrePrograma', 'tipo', 'fechaInicio', 'fechaFinalizacion'];
        if (!hasRequiredFields(p, required)) {
          throw new Error('Cada programa debe incluir nombrePrograma, tipo, fechaInicio y fechaFinalizacion');
        }
        const { nombrePrograma, tipo, fechaInicio, fechaFinalizacion, cantidadEstudiantes, asignaturas = [], nivel = '' } = p;
        return { nombrePrograma, tipo, fechaInicio, fechaFinalizacion, cantidadEstudiantes, asignaturas, facultad: facultadGrupo, nivel };
      });
      return await Program.insertMany(docs);
    }
    const requiredFields = ['nombrePrograma', 'tipo', 'fechaInicio', 'fechaFinalizacion', 'facultad'];
    if (!hasRequiredFields(payload, requiredFields)) {
      throw new Error('Faltan campos obligatorios.');
    }
    const { nombrePrograma, tipo, fechaInicio, fechaFinalizacion, cantidadEstudiantes, asignaturas = [], facultad, nivel = '' } = payload;
    return await Program.create({ nombrePrograma, tipo, fechaInicio, fechaFinalizacion, cantidadEstudiantes, asignaturas, facultad, nivel });
  } catch (err) {
    logger.error('Error creating program', err);
    throw err;
  }
}

module.exports = { createProgram };
