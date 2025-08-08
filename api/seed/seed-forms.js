// api/seed/seed-forms.js
// Seed minimal QuestionForm documents

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const fs = require('fs');

const QuestionForm = require('../models/QuestionForm');

async function main() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('MONGO_URI no está definido en .env');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log('MongoDB conectado');

    // Cargar y upsert de plantillas
    const files = ['forms.estudiante.json', 'forms.docente.json', 'forms.directivo.json'];
    for (const file of files) {
      const p = path.join(__dirname, file);
      if (!fs.existsSync(p)) {
        console.warn(`Archivo no encontrado, se omite: ${file}`);
        continue;
      }
      const raw = fs.readFileSync(p, 'utf8');
      const doc = JSON.parse(raw);
      const res = await QuestionForm.updateOne(
        { tipoFormulario: doc.tipoFormulario },
        { $set: doc },
        { upsert: true }
      );
      console.log(`Upsert ${doc.tipoFormulario}:`, res.acknowledged ? 'ok' : 'falló');
    }

    console.log('Seed completado.');
  } catch (err) {
    console.error('Error en seed:', err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

main();
