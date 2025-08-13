// api/services/academic.service.js
const AcademicData = require('../models/AcademicData');

const createProgram = async (body) => {
  const { facultad } = body;
  if (!facultad || typeof facultad !== 'string' || facultad.trim() === '') {
    const error = new Error('El campo facultad es obligatorio.');
    error.statusCode = 400;
    throw error;
  }

  // Acepta tanto array de programas como programa único
  let programas = [];
  if (Array.isArray(body.programas)) {
    programas = body.programas;
  } else {
    const { nombrePrograma, tipo, fechaInicio, fechaFinalizacion, cantidadEstudiantes, asignaturas, nivel } = body;
    programas = [{ nombrePrograma, tipo, fechaInicio, fechaFinalizacion, cantidadEstudiantes, asignaturas, nivel }];
  }

  // Validación mínima
  const invalid = programas.find(p => !p || !p.nombrePrograma || !p.tipo || !p.fechaInicio || !p.fechaFinalizacion);
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
    { upsert: true, runValidators: true }  // solo valida lo que se está añadiendo
  );

  return { message: 'Programas creados con éxito!', programasAñadidos: programas.length };
};

module.exports = {
  getAllAcademicData,
  createProgram,
};
