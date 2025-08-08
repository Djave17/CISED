// Importa Mongoose.
const mongoose = require('mongoose');

// Define el schema para una única pregunta.
const questionSchema = new mongoose.Schema({
  id: { type: String, required: true },    // Un identificador único para la pregunta (ej: "dominio_tema").
  texto: { type: String, required: true } // El texto de la pregunta que verá el usuario.
});

// Define el schema para una sección del formulario (ej: "Autoreflexión", "Competencia Pedagógica").
const sectionSchema = new mongoose.Schema({
  id: { type: String, required: true },      // ID de la sección (ej: "autoreflexion").
  titulo: { type: String, required: true }, // Título de la sección.
  // Una sección contiene una lista (array) de preguntas.
  preguntas: [questionSchema]
});

// Define el schema principal para la plantilla completa de un formulario.
const questionFormSchema = new mongoose.Schema({
  // Define a qué tipo de formulario pertenece esta plantilla (ej: 'estudiante'). Es único y obligatorio.
  tipoFormulario: { type: String, required: true, unique: true, enum: ['estudiante', 'docente', 'directivo'] },
  // Un formulario se compone de una lista (array) de secciones.
  secciones: [sectionSchema]
});

// Crea y exporta el modelo 'QuestionForm'.
module.exports = mongoose.model('QuestionForm', questionFormSchema);