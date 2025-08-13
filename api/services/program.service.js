// api/services/program.service.js
const Program = require('../models/Program');

/**
 * Normaliza y valida el array de asignaturas.
 * - Requiere: nombreAsignatura, docenteAsignado, fechaInicioAsignatura, fechaFinAsignatura
 * - Valida: fechaFinAsignatura >= fechaInicioAsignatura
 * - Sanitiza: trim a strings
 */
function normalizeAsignaturas(asignaturas, fechaInicioPrograma, fechaFinPrograma) {
  if (!Array.isArray(asignaturas)) return [];

  return asignaturas.map((a, idx) => {
    const nombreAsignatura = String(a?.nombreAsignatura || '').trim();
    const docenteAsignado = String(a?.docenteAsignado || '').trim();

    // Las fechas deben venir desde el front con estos nombres
    const inicio = a?.fechaInicioAsignatura
      ? new Date(a.fechaInicioAsignatura)
      : null;
    const fin = a?.fechaFinAsignatura
      ? new Date(a.fechaFinAsignatura)
      : null;

    if (!nombreAsignatura || !docenteAsignado || !inicio || !fin) {
      const err = new Error(
        `Asignatura #${idx + 1}: faltan campos requeridos (nombreAsignatura, docenteAsignado, fechaInicioAsignatura, fechaFinAsignatura)`
      );
      err.statusCode = 400;
      throw err;
    }

    if (Number.isNaN(inicio.getTime()) || Number.isNaN(fin.getTime())) {
      const err = new Error(`Asignatura #${idx + 1}: formato de fecha inválido`);
      err.statusCode = 400;
      throw err;
    }

    if (fin < inicio) {
      const err = new Error(`Asignatura #${idx + 1}: fechaFinAsignatura no puede ser anterior a fechaInicioAsignatura`);
      err.statusCode = 400;
      throw err;
    }

    // (Opcional) Validar contra el rango del programa si lo mandas coherente
    if (fechaInicioPrograma && fin < new Date(fechaInicioPrograma)) {
      const err = new Error(`Asignatura #${idx + 1}: la fecha fin es anterior al inicio del programa`);
      err.statusCode = 400;
      throw err;
    }
    if (fechaFinPrograma && inicio > new Date(fechaFinPrograma)) {
      const err = new Error(`Asignatura #${idx + 1}: la fecha inicio es posterior al fin del programa`);
      err.statusCode = 400;
      throw err;
    }

    return {
      nombreAsignatura,
      docenteAsignado,
      // guarda exactamente con los nombres que espera el modelo
      fechaInicioAsignatura: inicio,
      fechaFinAsignatura: fin,
    };
  });
}

/**
 * Crea uno o más programas.
 * - En lote: body = { facultad, programas: [ ... ] }
 * - Individual: body = { nombrePrograma, tipo, fechaInicio, fechaFinalizacion, cantidadEstudiantes, asignaturas, facultad, nivel }
 */
const createProgram = async (body) => {
  // === Creación en lote ===
  if (Array.isArray(body?.programas)) {
    const { facultad, programas } = body;

    if (!facultad || programas.length === 0) {
      const error = new Error('La facultad y los programas son requeridos para la creación en lote.');
      error.statusCode = 400;
      throw error;
    }

    const docs = programas.map((p, i) => {
      const {
        nombrePrograma,
        tipo,
        fechaInicio,
        fechaFinalizacion,
        cantidadEstudiantes,
        asignaturas = [],
        nivel = ''
      } = p || {};

      if (!nombrePrograma || !tipo || !fechaInicio || !fechaFinalizacion) {
        const err = new Error(`Programa #${i + 1}: cada programa debe incluir nombrePrograma, tipo, fechaInicio y fechaFinalizacion`);
        err.statusCode = 400;
        throw err;
      }

      const asignaturasNormalizadas = normalizeAsignaturas(
        asignaturas,
        fechaInicio,
        fechaFinalizacion
      );

      return {
        nombrePrograma: String(nombrePrograma).trim(),
        tipo: String(tipo).trim(),
        fechaInicio: new Date(fechaInicio),
        fechaFinalizacion: new Date(fechaFinalizacion),
        cantidadEstudiantes: Number.isFinite(+cantidadEstudiantes) ? +cantidadEstudiantes : 0,
        asignaturas: asignaturasNormalizadas,
        facultad: String(facultad).trim(),
        nivel: String(nivel || '').trim(),
      };
    });

    const created = await Program.insertMany(docs);
    return { message: 'Programas creados', count: created.length, programas: created };
  }

  // === Creación individual ===
  const {
    nombrePrograma,
    tipo,
    fechaInicio,
    fechaFinalizacion,
    cantidadEstudiantes,
    asignaturas = [],
    facultad,
    nivel = ''
  } = body || {};

  if (!nombrePrograma || !tipo || !fechaInicio || !fechaFinalizacion || !facultad) {
    const error = new Error('Faltan campos obligatorios: nombrePrograma, tipo, fechaInicio, fechaFinalizacion, facultad.');
    error.statusCode = 400;
    throw error;
  }

  const asignaturasNormalizadas = normalizeAsignaturas(
    asignaturas,
    fechaInicio,
    fechaFinalizacion
  );

  const program = await Program.create({
    nombrePrograma: String(nombrePrograma).trim(),
    tipo: String(tipo).trim(),
    fechaInicio: new Date(fechaInicio),
    fechaFinalizacion: new Date(fechaFinalizacion),
    cantidadEstudiantes: Number.isFinite(+cantidadEstudiantes) ? +cantidadEstudiantes : 0,
    asignaturas: asignaturasNormalizadas,
    facultad: String(facultad).trim(),
    nivel: String(nivel || '').trim(),
  });

  return { message: 'Programa creado', program };
};

module.exports = { createProgram };

