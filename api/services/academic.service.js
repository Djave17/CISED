const AcademicData = require('../models/AcademicData');
const logger = require('../../lib/logger');
const { isNonEmptyString, hasRequiredFields } = require('../../lib/validators');

async function getAllAcademicData() {
  try {
    return await AcademicData.find();
  } catch (err) {
    logger.error('Error fetching academic data', err);
    throw err;
  }
}

async function addPrograms(facultad, programas) {
  try {
    if (!isNonEmptyString(facultad)) {
      throw new Error('El campo facultad es obligatorio.');
    }
    if (!Array.isArray(programas) || programas.length === 0) {
      throw new Error('Debe proporcionar una lista de programas.');
    }
    const invalid = programas.find(p => !hasRequiredFields(p, ['nombrePrograma', 'tipo', 'fechaInicio', 'fechaFinalizacion']) || p.cantidadEstudiantes == null);
    if (invalid) {
      throw new Error('Faltan campos obligatorios en uno o más programas.');
    }
    let academicData = await AcademicData.findOne({ facultad });
    if (!academicData) {
      academicData = new AcademicData({ facultad, programas: [] });
    }
    academicData.programas.push(...programas);
    await academicData.save();
    return programas.length;
  } catch (err) {
    logger.error('Error adding programs', err);
    throw err;
  }
}

module.exports = { getAllAcademicData, addPrograms };
