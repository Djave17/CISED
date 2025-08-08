´´´app.js´´´

### 1. Importa express y cors

### 2. Crea una instancia de la aplicación Express

### 3. Configura cors para evitar problemas de seguridad del navegador al conectar el frontend

### 4. Configura express.json() para que podamos recibir datos JSON en las peticiones (por ejemplo, los datos del formulario)

### 5. Define una ruta de prueba en la raíz (/) para que podamos verificar que todo funciona

### 6. Exporta la aplicación para que server.js pueda usarla

### 7. Importa los archivos de rutas

### 8. Usa las rutas

### 9. Exporta la aplicación




´´´server.js´´´ 

### 1. Importa la configuración de la app

### 2. Importa la función de conexión a la BD

### 3. Define el puerto para el servidor. Usará el puerto definido en .env o el 3000 por defecto.

### 4. Define una función `startServer` que intenta conectarse a la base de datos y luego inicia el servidor web para que escuche peticiones.

### 5. Llama a la función `startServer` para iniciar todo el proceso.