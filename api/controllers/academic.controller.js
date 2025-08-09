// Importa el modelo para poder buscar en la base de datos.
const AcademicData = require('../models/AcademicData');

// Define la función que se ejecutará.
const getAllAcademicData = async (req, res) => {
  try {
    // Busca TODOS los documentos en la colección 'academicdatas'.
    const data = await AcademicData.find();

    // Si no encuentra nada, devuelve el error 404 que estás viendo.
    if (!data || data.length === 0) {
      return res.status(404).json({ message: 'No se encontraron datos académicos en la base de datos.' });
    }

    // Si encuentra datos, los devuelve con un estado 200 (OK).
    res.status(200).json(data);
  } catch (error) {
    // Si hay un error de conexión, devuelve un error 500.
    res.status(500).json({ message: 'Error interno del servidor al buscar datos.' });
  }
};

const createProgram = async (req, res) => {
  try {
    const { facultad } = req.body;

    if (!facultad || typeof facultad !== 'string' || facultad.trim() === '') {
      return res.status(400).json({ message: 'El campo facultad es obligatorio.' });
    }

    // Permitir dos formatos: lote { facultad, programas: [...] } o único cuerpo plano
    let programas = [];
    if (Array.isArray(req.body.programas)) {
      programas = req.body.programas;
    } else {
      const { nombrePrograma, tipo, fechaInicio, fechaFinalizacion, cantidadEstudiantes, asignaturas } = req.body;
      programas = [{ nombrePrograma, tipo, fechaInicio, fechaFinalizacion, cantidadEstudiantes, asignaturas }];
    }

    // Validación mínima de cada programa
    const invalid = programas.find(p => !p || !p.nombrePrograma || !p.tipo || !p.fechaInicio || !p.fechaFinalizacion || p.cantidadEstudiantes == null);
    if (invalid) {
      return res.status(400).json({ message: 'Faltan campos obligatorios en uno o más programas.' });
    }

    // Buscar la facultad; si no existe, crearla
    let academicData = await AcademicData.findOne({ facultad: facultad });
    if (!academicData) {
      academicData = new AcademicData({ facultad, programas: [] });
    }

    // Agregar programas
    academicData.programas.push(...programas);
    await academicData.save();

    res.status(201).json({ message: 'Programas creados con éxito!', programasAñadidos: programas.length });
  } catch (error) {
    console.error('Error creating program:', error);
    res.status(500).json({ message: 'Error interno del servidor al crear el programa.' });
  }
};

// Exporta las funciones.
module.exports = {
  getAllAcademicData,
  createProgram
};