const mongoose = require('mongoose');

// Nivel 3: Define una asignatura específica y su docente.
const AsignaturaOfertadaSchema = new mongoose.Schema({
  nombreAsignatura: {
    type: String,
    required: true
  },
  docenteAsignado: {
    type: String,
    required: true
  },
  fechaInicioAsignatura: { type: Date, required: true },
  fechaFinAsignatura:    { type: Date, required: true },

  
});



// Nivel 2: Define el programa con sus datos de gestión y su lista de asignaturas.
const ProgramaSchema = new mongoose.Schema({
  nombrePrograma: {
    type: String,
    required: true
  },
  tipo: {
    type: String,
    required: true,
    enum: ['Maestría', 'Diplomado', 'Curso', 'Especialización']
  },
  // --- DATOS INTERNOS ---
  fechaInicio: {
    type: Date,
    required: true
  },
  fechaFinalizacion: {
    type: Date,
    required: true
  },
  cantidadEstudiantes: {
    type: Number,
    required: true
  },
  // ----------------------
  asignaturas: [AsignaturaOfertadaSchema]
});

// Nivel 1: El modelo principal que agrupa los programas por facultad.
const AcademicDataSchema = new mongoose.Schema({
  facultad: {
    type: String,
    required: true,
    unique: true
  },
  programas: [ProgramaSchema]
});

const AcademicData = mongoose.model('AcademicData', AcademicDataSchema);

module.exports = AcademicData;