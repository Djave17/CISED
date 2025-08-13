/**
 * Servicio para manejar operaciones relacionadas con programas académicos
 */

const API_BASE_URL = '/api/programs';

/**
 * Obtiene todos los programas académicos
 * @returns {Promise<Array>} Lista de programas
 */
export async function getAllPrograms() {
  try {
    const response = await fetch(API_BASE_URL);
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error al obtener los programas:', error);
    throw error;
  }
}

/**
 * Determina el estado de un programa basado en el porcentaje de respuestas
 * @param {number} porcentaje - Porcentaje de respuestas (0-100)
 * @returns {string} Estado del programa
 */
export function determinarEstado(porcentaje) {
  if (porcentaje >= 80) return 'COMPLETADO';
  if (porcentaje >= 50) return 'EN PROGRESO';
  return 'PENDIENTE';
}

/**
 * Procesa los datos de los programas para mostrar en la tabla
 * @param {Array} programas - Lista de programas
 * @returns {Array} Programas procesados con métricas
 */
export function procesarDatosProgramas(programas) {
  return programas.map(programa => {
    // Calcular métricas (valores de ejemplo - ajustar según datos reales)
    const totalAsignaturas = programa.asignaturas?.length || 0;
    const totalRespuestas = programa.respuestas?.length || 0;
    const asignaturasEvaluadas = programa.asignaturasEvaluadas || 0;
    const asignaturasPendientes = totalAsignaturas - asignaturasEvaluadas;
    const porcentajePromedio = totalAsignaturas > 0 
      ? Math.round((asignaturasEvaluadas / totalAsignaturas) * 100) 
      : 0;
    
    const estado = determinarEstado(porcentajePromedio);

    return {
      ...programa,
      metricas: {
        totalAsignaturas,
        totalRespuestas,
        asignaturasEvaluadas,
        asignaturasPendientes,
        porcentajePromedio,
        estado
      }
    };
  });
}
