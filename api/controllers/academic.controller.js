// Importa el servicio para acceder a la lógica de negocio.
const academicService = require('../services/academic.service');

// Define la función que se ejecutará.
const getAllAcademicData = async (req, res) => {
  try {
    const data = await academicService.getAllAcademicData();
    res.status(200).json(data);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

const createProgram = async (req, res) => {
  try {
    const result = await academicService.createProgram(req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

// Exporta las funciones.
module.exports = {
  getAllAcademicData,
  createProgram
};