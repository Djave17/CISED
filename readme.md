

# Sistema de Evaluación Docente - Universidad Americana (UAM)

Este documento detalla la arquitectura, tecnología y funcionamiento del Sistema de Evaluación Docente, diseñado para ser una aplicación web moderna, escalable y de bajo costo.

## 1\. Resumen del Proyecto

El propósito de este proyecto es migrar el sistema de evaluación docente existente, originalmente implementado en Google Apps Script y Google Sheets, a una arquitectura web desacoplada.

**Objetivos Principales:**

  * **Escalabilidad:** Soportar un alto volumen de evaluaciones simultáneas sin degradación del rendimiento.
  * **Bajo Costo:** Utilizar tecnologías serverless y servicios con planes gratuitos/de bajo consumo para minimizar los costos operativos.
  * **Mantenibilidad:** Crear una base de código limpia, modular y bien documentada que facilite futuras actualizaciones.
  * **Análisis de Datos:** Sentar las bases para un futuro dashboard analítico que permita a los directivos tomar decisiones informadas basadas en los datos recopilados.

El sistema consta de tres formularios distintos y anónimos (para estudiantes, pares y directivos), distribuidos mediante enlaces directos.

## 2\. Arquitectura de la Aplicación

La aplicación sigue una arquitectura de servicios desacoplados, separando el frontend (lo que ve el usuario) del backend (la lógica del servidor).

```
+-------------------+      +------------------+      +--------------------------+      +-----------------+
|                   |      |                  |      |                          |      |                 |
|  Cliente (HTML,   |----->|   API Gateway    |----->|   Funciones Serverless   |----->|  Base de Datos  |
|   CSS, JS)        |      |  (Vercel/Netlify)|      |   (Backend - Node.js)    |      | (MongoDB Atlas) |
|                   |      |                  |      |                          |      |                 |
+-------------------+      +------------------+      +--------------------------+      +-----------------+
```

  * **Cliente (Frontend):** Son los archivos estáticos (`.html`, `.css`, `.js`) que se ejecutan en el navegador del usuario. Se alojan en un servicio de hosting estático.
  * **API Gateway:** Es el punto de entrada para todas las solicitudes del cliente. Dirige las peticiones a la función backend correcta de forma segura.
  * **Funciones Serverless (Backend):** Es el código Node.js que reemplaza a `funciones.js`. Se ejecuta solo cuando se recibe una petición, lo que optimiza los costos. Se encarga de la lógica de negocio y la comunicación con la base de datos.
  * **Base de Datos (NoSQL):** MongoDB Atlas almacena todas las respuestas de las evaluaciones en un formato flexible (JSON), ideal para los datos de los formularios.

## 3\. Pila Tecnológica (Stack) 🔧

  * **Frontend:**
      * HTML5
      * CSS3
      * JavaScript (ES6+)
  * **Backend:**
      * Node.js
      * Framework: Express.js
  * **Base de Datos:**
      * NoSQL: MongoDB
      * Servicio: MongoDB Atlas
  * **Despliegue (Alojamiento):**
      * Vercel o Netlify (para frontend y backend serverless).

## 4\. Estructura de Carpetas 📂

```bash
/proyecto-evaluacion/
|
|-- /api/                     # Contiene el código del backend (Funciones Serverless)
|   |-- _lib/                 # Código compartido (ej. conexión a DB)
|   |   |-- database.js
|   |
|   |-- getPreguntas.js       # Función para obtener preguntas
|   |-- registrarEvaluacion.js # Función para guardar respuestas
|
|-- /public/                  # Contiene todos los archivos del frontend
|   |
|   |-- /estudiante/
|   |   |-- index.html
|   |   |-- style.css
|   |   |-- logic.js
|   |
|   |-- /docente/
|   |   |-- index.html
|   |   `-- (y sus archivos css/js)
|   |
|   |-- /directivo/
|   |   |-- index.html
|   |   `-- (y sus archivos css/js)
|
|-- .env                      # Variables de entorno (NO subir a Git)
|-- package.json              # Definición del proyecto y dependencias
|-- README.md                 # Este archivo
```

## 5\. Modelo de Datos (Colección `evaluaciones` en MongoDB)

Cada documento en la colección representará una evaluación completada.

```json
{
  "_id": " ObjectId('...)",
  "tipoFormulario": "estudiante", // "estudiante", "docente" o "directivo"
  "fechaCreacion": "ISODate('2025-08-07T19:30:00Z')",
  "periodoAcademico": "2025-1",
  "informacionAcademica": {
    "facultad": "Ingeniería y Arquitectura",
    "programa": "Ingeniería en Sistemas",
    "asignatura": "Bases de Datos II",
    "docenteEvaluado": "Nombre del Docente"
  },
  "respuestas": {
    "autoreflexion": [
      { "id": "asistencia", "respuesta": 5 },
      { "id": "actividades", "respuesta": 4 }
    ],
    "evaluacionDocente": {
      "introduccion": [
        { "pregunta": "...", "respuesta": 5 }
      ],
      "competencia_pedagogica": [
        { "pregunta": "...", "respuesta": 4 },
        { "pregunta": "...", "respuesta": 5 }
      ]
    },
    "comentarios": "El docente muestra gran dominio pero podría usar más ejemplos prácticos."
  }
}
```

## 6\. API Endpoints

La comunicación entre el frontend y el backend se realiza a través de los siguientes puntos de acceso (endpoints).

#### `GET /api/preguntas/:tipo`

  * **Descripción:** Obtiene la estructura de preguntas para un tipo de formulario específico.
  * **Parámetros:**
      * `:tipo` (string): Puede ser `estudiante`, `docente`, o `directivo`.
  * **Respuesta Exitosa (200 OK):**
    ```json
    {
      "autoreflexion": [...],
      "evaluacionDocente": { ... }
    }
    ```

#### `GET /api/datos-academicos`

  * **Descripción:** Obtiene los datos de facultades, programas y asignaturas.
  * **Respuesta Exitosa (200 OK):**
    ```json
    {
      "facultades": [
        { "nombre": "Ingeniería y Arquitectura", "programas": [...] }
      ]
    }
    ```

#### `POST /api/registrar-evaluacion`

  * **Descripción:** Recibe y guarda una evaluación completada en la base de datos.
  * **Cuerpo de la Petición (Request Body):** Un objeto JSON con la misma estructura del modelo de datos.
  * **Respuesta Exitosa (201 Created):**
    ```json
    {
      "message": "Evaluación registrada exitosamente",
      "evaluacionId": "ObjectId(...)"
    }
    ```

## 7\. Futuro Desarrollo: Dashboard Analítico 🚀

El siguiente gran paso del proyecto será la creación de un dashboard para personal administrativo, que se nutrirá de los datos almacenados. Incluirá:

  * **Vista General:** KPIs, tasa de participación y alertas.
  * **Análisis Comparativo:** Rankings de docentes, mapas de calor por competencias y facultades.
  * **Perfil Individual del Docente:** Evolución histórica, comparativas con promedios y análisis de sentimiento de los comentarios.

## 8\. Instrucciones de Configuración Local

Para ejecutar este proyecto en un entorno de desarrollo local:

1.  **Clonar el repositorio:**
    ```bash
    git clone <url-del-repositorio>
    cd proyecto-evaluacion
    ```
2.  **Instalar dependencias:**
    ```bash
    npm install
    ```
3.  **Configurar variables de entorno:**
      * Crear un archivo `.env` en la raíz del proyecto.
      * Añadir la cadena de conexión de MongoDB Atlas:
        ```
        MONGO_URI=mongodb+srv://<user>:<password>@cluster...
        ```
4.  **Iniciar el servidor de desarrollo:**
    ```bash
    node api/index.js
    ```
5.  Abrir los archivos `index.html` de la carpeta `/public` en un navegador para interactuar con la aplicación.