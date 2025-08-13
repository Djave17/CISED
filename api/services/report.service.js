const Evaluation = require('../models/evaluation');

/**
 * Obtiene todas las evaluaciones para los reportes.
 * @returns {Promise<Array>}
 */
const getReport = async () => {
  try {
    const evaluations = await Evaluation.find();
    return evaluations;
  } catch (error) {
    const newError = new Error('Error al obtener los reportes.');
    newError.statusCode = 500;
    throw newError;
  }
};

/**
 * Calcula estadísticas agregadas para cada tipo de formulario.
 * @returns {Promise<Array>} - Un array con las estadísticas por tipo de formulario.
 * @throws {Error} - Si ocurre un error al calcular las estadísticas.
 * @example
 * const stats = await reportService.getFormStatistics();
 * console.log(stats);
 * Funcion asincrona que solicita a la base de datos todas las evaluaciones
 * y calcula estadísticas agregadas para cada tipo de formulario.
 */
const getFormStatistics = async () => {
  
  // Se solicita a la base de datos todas las evaluaciones
  try {
    // Se calculan las estadísticas agregadas para cada tipo de formulario
    const stats = await Evaluation.aggregate([
      {
        $group: {
          _id: '$tipoFormulario',
          totalResponses: { $sum: 1 },
          uniqueSubjects: { $addToSet: '$informacionAcademica.asignatura' },
          uniqueTeachers: { $addToSet: '$informacionAcademica.docente' }
        }
      },
      {
        $project: {
          _id: 0,
          formType: '$_id',
          totalResponses: 1,
          subjectCount: { $size: '$uniqueSubjects' },
          teacherCount: { $size: '$uniqueTeachers' }
        }
      }
    ]);
    return stats;
  } catch (error) {
    const newError = new Error('Error al calcular las estadísticas.');
    newError.statusCode = 500;
    throw newError;
  }
};

module.exports = { getReport, getFormStatistics };


/*
El proceso se divide en dos pasos:

Agrupar ($group):
Primero, agrupamos todas las evaluaciones por su tipoFormulario.
Dentro de cada grupo, hacemos tres cosas:
totalResponses: Contamos cuántos documentos (evaluaciones) hay en el grupo.
uniqueSubjects: Creamos una lista de asignaturas únicas para ese tipo de formulario, evitando duplicados.
uniqueTeachers: Hacemos lo mismo para los docentes, creando una lista sin duplicados.
Proyectar ($project):
Finalmente, damos formato a la salida para que sea más clara.
Renombramos el campo _id a formType.
En lugar de devolver las listas de asignaturas y docentes, usamos $size para obtener solo el conteo de elementos únicos en cada lista.
*/
