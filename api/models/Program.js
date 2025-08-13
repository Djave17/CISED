const mongoose = require('mongoose');

const AsignaturaSchema = new mongoose.Schema(
  {
    nombreAsignatura: { type: String, required: true },
    docenteAsignado: { type: String, required: true },
    fechaInicioAsignatura: { type: Date, required: true },
    fechaFinalizacionAsignatura: { type: Date, required: true },
    
  },
  { _id: false }
);



const ProgramSchema = new mongoose.Schema({
  nombrePrograma: { type: String, required: true, trim: true },
  tipo: { type: String, required: true, trim: true },
  fechaInicio: { type: Date, required: true },       
  fechaFinalizacion: { type: Date, required: true },
  cantidadEstudiantes: { type: Number, required: true, min: 0 },
  asignaturas: { type: [AsignaturaSchema], default: [] },
  facultad: { type: String, required: true, trim: true },
  nivel: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Program', ProgramSchema);
