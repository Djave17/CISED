// Importa el modelo de plantillas de formulario.
const QuestionForm = require('../models/QuestionForm');

// Define una función asíncrona para obtener la estructura de un formulario por su tipo.
const getFormByType = async (req, res) => {
  try {
    // Extrae el parámetro 'formType' de la URL (ej: /api/forms/estudiante -> formType = 'estudiante').
    const { formType } = req.params;
    // Busca un único documento que coincida con el tipo de formulario.
    const form = await QuestionForm.findOne({ tipoFormulario: formType });
    
    // Si no se encuentra ningún formulario, devuelve un error 404 (No Encontrado).
    if (!form) {
      return res.status(404).json({ message: 'Formulario no encontrado.' });
    }
    // Si lo encuentra, responde con un estado 200 (OK) y la estructura del formulario en JSON.
    res.status(200).json(form);
  } catch (error) {
    // Si hay un error, devuelve un 500.
    res.status(500).json({ message: 'Error al obtener el formulario.' });
  }
};

// Exporta la función.
module.exports = { getFormByType };
