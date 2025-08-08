// Importa las librerías necesarias.
const express = require('express');
const cors = require('cors');
const app = express();

// --- Middlewares (Plugins) ---
// Habilita CORS para permitir que el frontend (en otro dominio) se comunique con esta API.
app.use(cors());
// Le dice a Express que entienda las peticiones que vienen en formato JSON.
app.use(express.json());

// --- Importar Archivos de Rutas ---
const academicRoutes = require('./routes/academic.routes');
const questionFormRoutes = require('./routes/questionform.routes');
const evaluationRoutes = require('./routes/evaluation.routes');
const reportRoutes = require('./routes/report.routes');

// --- Usar las Rutas ---
// Le dice a la aplicación que para cualquier URL que empiece con '/api/academic-data', use las reglas de academicRoutes.
app.use('/api/academic-data', academicRoutes);
// Para URLs que empiecen con '/api/forms', usa las reglas de questionFormRoutes.
app.use('/api/forms', questionFormRoutes);
// Para URLs que empiecen con '/api/evaluations', usa las reglas de evaluationRoutes.
app.use('/api/evaluations', evaluationRoutes);
// Para URLs que empiecen con '/api/reports', usa las reglas de reportRoutes.
app.use('/api/reports', reportRoutes);

// Una ruta de bienvenida para verificar fácilmente que la API está funcionando.
app.get('/api', (req, res) => {
  res.json({ message: 'API de Encuestas UAM funcionando.' });
});

// Exporta la 'app' configurada para que server.js pueda usarla.
module.exports = app;