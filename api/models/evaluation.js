// Importa Mongoose.
const mongoose = require('mongoose');

// Define el schema para una única respuesta a una pregunta.
const answerSchema = new mongoose.Schema({
  preguntaId: { type: String, required: true }, // El ID de la pregunta a la que se responde.
  // La respuesta debe ser un número, es obligatoria y debe estar entre 1 y 5.
  // Esta es la validación clave para tu requerimiento.
  respuesta: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  }
});

// Define el schema principal para una evaluación completada.
const evaluationSchema = new mongoose.Schema({
  // Guarda la información de contexto (facultad, programa, asignatura, docente) como un objeto simple.
  informacionAcademica: { 
    type: Object, 
    required: true 
  },
  // El tipo de formulario que se llenó.
  tipoFormulario: { 
    type: String, 
    required: true, 
    enum: ['estudiante', 'docente', 'directivo']
  },
  // La fecha en que se realizó la evaluación. Se establece automáticamente a la fecha actual si no se proporciona.
  fechaEvaluacion: { 
    type: Date,
    default: Date.now 
  },
  // La evaluación contiene una lista (array) de respuestas.
  respuestas: [answerSchema],
  // Un campo de texto opcional para los comentarios generales.
  comentarios: { 
    type: String 
  }
});

// Crea y exporta el modelo 'Evaluation'.
module.exports = mongoose.model('Evaluation', evaluationSchema);