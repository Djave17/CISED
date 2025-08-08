// MONGO DB
const mongoose = require('mongoose');
// Las variables de entorno ya están cargadas en server.js

// Función asíncrona para conectar a la base de datos
// Espera a que la conexión sea establecida antes de continuar
const connectDB = async () => {
  try {
    // Intenta conectarse usando la URI del archivo .env
    await mongoose.connect(process.env.MONGO_URI);

    console.log('✅ Conexión a MongoDB establecida exitosamente.');

  } catch (error) {
    // Si hay un error, lo muestra en la consola y termina el proceso
    console.error('❌ Error al conectar a MongoDB:', error.message);
    process.exit(1); // Detiene la aplicación si no se puede conectar a la BD
  }
};

// Exporta la función para que pueda ser usada en otras partes de la aplicación
module.exports = connectDB;