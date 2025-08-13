// api/services/academic.service.js
const AcademicData = require('../models/AcademicData');

/**
 * Devuelve todas las facultades con sus programas y asignaturas.
 */
const getAllAcademicData = async () => {
  const data = await AcademicData.find();
  if (!data || data.length === 0) {
    const error = new Error('No se encontraron datos académicos en la base de datos.');
    error.statusCode = 404;
    throw error;
  }
  return data;
};

/**
 * Crea uno o más programas para una facultad.
 * Acepta dos formatos:
 *  1) { facultad, programas: [ ... ] }
 *  2) { facultad, nombrePrograma, tipo, fechaInicio, fechaFinalizacion, cantidadEstudiantes, asignaturas, nivel }
 */
const createProgram = async (body) => {
  const { facultad } = body;
  if (!facultad || typeof facultad !== 'string' || facultad.trim() === '') {
    const error = new Error('El campo facultad es obligatorio.');
    error.statusCode = 400;
    throw error;
  }

  // Construir array de programas a partir del cuerpo recibido
  let programas = [];
  if (Array.isArray(body.programas)) {
    programas = body.programas;
  } else {
    const {
      nombrePrograma,
      tipo,
      fechaInicio,
      fechaFinalizacion,
      cantidadEstudiantes,
      asignaturas,
      nivel
    } = body;
    programas = [{
      nombrePrograma,
      tipo,
      fechaInicio,
      fechaFinalizacion,
      cantidadEstudiantes,
      asignaturas,
      nivel
    }];
  }

  // Validación mínima de cada programa
  const invalid = programas.find(p =>
    !p || !p.nombrePrograma || !p.tipo || !p.fechaInicio || !p.fechaFinalizacion
  );
  if (invalid) {
    const error = new Error('Faltan campos obligatorios en uno o más programas.');
    error.statusCode = 400;
    throw error;
  }

  // Inserta los programas en el documento de la facultad sin revalidar los existentes
  await AcademicData.updateOne(
    { facultad },
    {
      $setOnInsert: { facultad },
      $push: { programas: { $each: programas } }
    },
    { upsert: true, runValidators: true }
  );

  return { message: 'Programas creados con éxito!', programasAñadidos: programas.length };
};

module.exports = {
  getAllAcademicData,
  createProgram,
};
