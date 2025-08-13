const Program = require('../models/Program');

/**
 * Crea uno o más programas.
 * @param {Object} body - El cuerpo de la solicitud.
 * @returns {Promise<Object>}
 */
const createProgram = async (body) => {
  // Caso de creación en lote
  if (Array.isArray(body?.programas)) {
    const { facultad, programas } = body;

    if (!facultad || programas.length === 0) {
      const error = new Error('La facultad y los programas son requeridos para la creación en lote.');
      error.statusCode = 400;
      throw error;
    }

    const docs = programas.map(p => {
      const { nombrePrograma, tipo, fechaInicio, fechaFinalizacion, cantidadEstudiantes, asignaturas = [], nivel = '' } = p;

      if (!nombrePrograma || !tipo || !fechaInicio || !fechaFinalizacion) {
        throw new Error('Cada programa debe incluir nombrePrograma, tipo, fechaInicio y fechaFinalizacion');
      }

      return {
        nombrePrograma, tipo, fechaInicio, fechaFinalizacion, cantidadEstudiantes, asignaturas, facultad, nivel
      };
    });

    const created = await Program.insertMany(docs);
    return { message: 'Programas creados', count: created.length, programas: created };
  }

  // Caso de un solo programa
  const { nombrePrograma, tipo, fechaInicio, fechaFinalizacion, cantidadEstudiantes, asignaturas = [], facultad, nivel = '' } = body;

  if (!nombrePrograma || !tipo || !fechaInicio || !fechaFinalizacion || !facultad) {
    const error = new Error('Faltan campos obligatorios.');
    error.statusCode = 400;
    throw error;
  }

  const program = await Program.create({
    nombrePrograma, tipo, fechaInicio, fechaFinalizacion, cantidadEstudiantes, asignaturas, facultad, nivel
  });

  return { message: 'Programa creado', program };
};

module.exports = { createProgram };
