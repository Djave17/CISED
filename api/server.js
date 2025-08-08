// api/server.js

// Cargar variables de entorno al inicio
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const app = require('./app'); // Importa la configuración de la app
const connectDB = require('./config/db.config'); // Importa la función de conexión a la BD

// Define el puerto para el servidor. Usará el puerto definido en .env o el 3000 por defecto.
const PORT = process.env.PORT || 3000;

// Función principal para iniciar el servidor
const startServer = async () => {
  try {
    // 1. Conectar a la base de datos
    await connectDB();

    // 2. Iniciar el servidor web para que escuche peticiones
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
    });

  } catch (error) {
    console.error('❌ No se pudo iniciar el servidor.', error);
  }
};

// Llama a la función para iniciar todo el proceso
startServer();