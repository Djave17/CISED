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
    const { facultad, nombrePrograma, tipo, fechaInicio, fechaFinalizacion, cantidadEstudiantes, asignaturas } = req.body;

    // Find the AcademicData document for the given faculty
    let academicData = await AcademicData.findOne({ facultad: facultad });

    if (!academicData) {
      // If faculty doesn't exist, return a 404 error
      return res.status(404).json({ message: 'Facultad no encontrada.' });
    }

    // Create the new program object
    const newProgram = {
      nombrePrograma,
      tipo,
      fechaInicio,
      fechaFinalizacion,
      cantidadEstudiantes,
      asignaturas // This array should already be in the correct format from the frontend
    };

    // Push the new program into the programas array
    academicData.programas.push(newProgram);

    // Save the updated document
    await academicData.save();

    res.status(201).json({ message: 'Programa creado con éxito!', program: newProgram });
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