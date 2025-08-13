// Importa el modelo para poder buscar en la base de datos.
const AcademicData = require('../models/AcademicData');

/**
 * Obtiene todos los datos académicos.
 * @returns {Promise<Array>}
 */
const getAllAcademicData = async () => {
  const data = await AcademicData.find();
  if (!data || data.length === 0) {
    // Lanza un error si no se encuentran datos, que será capturado por el controlador.
    const error = new Error('No se encontraron datos académicos en la base de datos.');
    error.statusCode = 404;
    throw error;
  }
  return data;
};

/**
 * Crea uno o más programas para una facultad.
 * @param {Object} body - El cuerpo de la solicitud.
 * @returns {Promise<Object>}
 */
const createProgram = async (body) => {
  const { facultad } = body;

  if (!facultad || typeof facultad !== 'string' || facultad.trim() === '') {
    const error = new Error('El campo facultad es obligatorio.');
    error.statusCode = 400;
    throw error;
  }

  // Permitir dos formatos: lote { facultad, programas: [...] } o único cuerpo plano
  let programas = [];
  if (Array.isArray(body.programas)) {
    programas = body.programas;
  } else {
    const { nombrePrograma, tipo, fechaInicio, fechaFinalizacion, cantidadEstudiantes, asignaturas } = body;
    programas = [{ nombrePrograma, tipo, fechaInicio, fechaFinalizacion, cantidadEstudiantes, asignaturas }];
  }

  // Validación mínima de cada programa
  const invalid = programas.find(p => !p || !p.nombrePrograma || !p.tipo || !p.fechaInicio || !p.fechaFinalizacion || p.cantidadEstudiantes == null);
  if (invalid) {
    const error = new Error('Faltan campos obligatorios en uno o más programas.');
    error.statusCode = 400;
    throw error;
  }

  // Buscar la facultad; si no existe, crearla
  let academicData = await AcademicData.findOne({ facultad: facultad });
  if (!academicData) {
    academicData = new AcademicData({ facultad, programas: [] });
  }

  // Agregar programas
  academicData.programas.push(...programas);
  await academicData.save();

  return { message: 'Programas creados con éxito!', programasAñadidos: programas.length };
};

// Exporta las funciones.
module.exports = {
  getAllAcademicData,
  createProgram
};
