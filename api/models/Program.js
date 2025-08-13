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

AsignaturaSchema.path('fechaFinAsignatura').validate(function (value) {
  if (!this.fechaInicioAsignatura || !value) return true;
  return value >= this.fechaInicioAsignatura;
}, 'La fecha de finalización de la asignatura debe ser posterior o igual a la fecha de inicio');

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
