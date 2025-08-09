const Program = require('../models/Program');

// POST /api/programs
// Acepta:
// 1) Un solo programa en el body
// 2) Un objeto { facultad, programas: [ ... ] } para creación en lote
async function createProgram(req, res) {
  try {
    // Caso 2: batch con { facultad, programas: [] }
    if (Array.isArray(req.body?.programas)) {
      const facultadGrupo = req.body.facultad;
      const programas = req.body.programas;

      if (!facultadGrupo || programas.length === 0) {
        return res.status(400).json({ message: 'facultad y programas son requeridos.' });
      }

      // Validar mínimos por cada programa
      const docs = programas.map(p => {
        const {
          nombrePrograma,
          tipo,
          fechaInicio,
          fechaFinalizacion,
          cantidadEstudiantes,
          asignaturas = [],
          nivel = ''
        } = p;

        if (!nombrePrograma || !tipo || !fechaInicio || !fechaFinalizacion) {
          throw new Error('Cada programa debe incluir nombrePrograma, tipo, fechaInicio y fechaFinalizacion');
        }

        return {
          nombrePrograma,
          tipo,
          fechaInicio,
          fechaFinalizacion,
          cantidadEstudiantes,
          asignaturas,
          facultad: facultadGrupo,
          nivel
        };
      });

      const created = await Program.insertMany(docs);
      return res.status(201).json({ message: 'Programas creados', count: created.length, programas: created });
    }

    // Caso 1: un solo programa
    const {
      nombrePrograma,
      tipo,
      fechaInicio,
      fechaFinalizacion,
      cantidadEstudiantes,
      asignaturas = [],
      facultad,
      nivel = ''
    } = req.body;

    if (!nombrePrograma || !tipo || !fechaInicio || !fechaFinalizacion || !facultad) {
      return res.status(400).json({ message: 'Faltan campos obligatorios.' });
    }

    const program = await Program.create({
      nombrePrograma,
      tipo,
      fechaInicio,
      fechaFinalizacion,
      cantidadEstudiantes,
      asignaturas,
      facultad,
      nivel
    });

    return res.status(201).json({ message: 'Programa creado', program });
  } catch (err) {
    console.error('Error creating program:', err);
    return res.status(500).json({ message: 'Error interno al crear el programa' });
  }
}

module.exports = { createProgram };
