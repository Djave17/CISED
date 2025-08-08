const Evaluation = require('../models/evaluation');

/*
 * Crea una nueva evaluación en la base de datos.
 * Enriquece los datos del cliente con información del servidor.
 */

/*
 * @param req: Petición del cliente
 * @param res: Respuesta del servidor
 */


// Define una función asíncrona para crear (guardar) una nueva evaluación.
const createEvaluation = async (req, res) => {
  try {
    // Extrae el tipo de formulario de la URL.
    const { formType } = req.params;
    
    // Combina los datos que vienen del frontend (req.body) con el tipo de formulario obtenido de la URL.
    const evaluationData = {
      ...req.body,
      tipoFormulario: formType
    };

    // Crea una nueva instancia del modelo Evaluation con los datos combinados.
    const newEvaluation = new Evaluation(evaluationData);
    // Le pide a Mongoose que guarde el documento en la base de datos.
    await newEvaluation.save();
    
    // Si se guarda correctamente, responde con un estado 201 (Creado) y un mensaje de éxito.
    res.status(201).json({ message: 'Evaluación guardada exitosamente.' });
  } catch (error) {
    // Si el error es de validación (ej: una respuesta no está entre 1 y 5), devuelve un error 400 (Petición Incorrecta).
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Error de validación.', details: error.errors });
    }
    // Para cualquier otro error, devuelve un 500.
    res.status(500).json({ message: 'Error al guardar la evaluación.' });
  }
};

// Exporta la función.
module.exports = { createEvaluation };