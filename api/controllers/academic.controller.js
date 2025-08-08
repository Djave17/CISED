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

// Exporta la función.
module.exports = {
  getAllAcademicData
};