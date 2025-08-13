const AcademicService = require('../services/academic.service');

// Define la función que se ejecutará.
const getAllAcademicData = async (req, res) => {
  try {
    // Busca TODOS los documentos en la colección 'academicdatas'.
    const data = await AcademicService.getAllAcademicData();

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

    // Permitir dos formatos: lote { facultad, programas: [...] } o único cuerpo plano
    let programas = [];
    if (Array.isArray(req.body.programas)) {
      programas = req.body.programas;
    } else {
      const { nombrePrograma, tipo, fechaInicio, fechaFinalizacion, cantidadEstudiantes, asignaturas } = req.body;
      programas = [{ nombrePrograma, tipo, fechaInicio, fechaFinalizacion, cantidadEstudiantes, asignaturas }];
    }

    const count = await AcademicService.addPrograms(facultad, programas);

    res.status(201).json({ message: 'Programas creados con éxito!', programasAñadidos: count });
  } catch (error) {
    if (error.message && (error.message.includes('obligatorio') || error.message.includes('Faltan campos'))) {
      return res.status(400).json({ message: error.message });
    }
    console.error('Error creating program:', error);
    res.status(500).json({ message: 'Error interno del servidor al crear el programa.' });
  }
};

// Exporta las funciones.
module.exports = {
  getAllAcademicData,
  createProgram
};
