/**
 * dashboard-summary.js
 * 
 * Este script se encarga de actualizar los indicadores de la cabecera (Total Respuestas,
 * Asignaturas Evaluadas, Asignaturas Pendientes y Porcentaje Promedio) en el dashboard
 * de Gestionar Evaluaciones.
 * 
 * Utiliza el endpoint /api/reports/summary para obtener los datos actualizados.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Referencias a los selectores de filtros
  const facultadSelect = document.getElementById('facultad');
  const tipoSelect = document.getElementById('tipoPrograma');
  const estadoSelect = document.getElementById('estado');

  // Referencias a las tarjetas resumen (IDs según la plantilla EJS)
  const totalRespuestasEl = document.getElementById('totalRespuestas');
  const asignaturasEvaluadasEl = document.getElementById('asignaturasEvaluadas');
  const asignaturasPendientesEl = document.getElementById('asignaturasPendientes');
  const porcentajePromedioEl = document.getElementById('porcentajePromedio');
  const loadingIndicator = document.getElementById('loading-indicator');

  // Función para actualizar los indicadores de resumen
  async function actualizarResumen() {
    try {
      // Mostrar indicador de carga si existe
      if (loadingIndicator) loadingIndicator.style.display = 'block';
      
      // Construir los parámetros de consulta basados en los filtros seleccionados
      const params = new URLSearchParams();
      
      if (facultadSelect && facultadSelect.value && facultadSelect.value !== 'todos') {
        params.append('facultad', facultadSelect.value);
      }
      
      if (tipoSelect && tipoSelect.value && tipoSelect.value !== 'todos') {
        params.append('tipo', tipoSelect.value);
      }
      
      if (estadoSelect && estadoSelect.value && estadoSelect.value !== 'todos') {
        // Normalizar el estado si es necesario
        const estado = estadoSelect.value.toLowerCase();
        params.append('estado', estado === 'completado' ? 'COMPLETADO' : 
                      estado === 'en progreso' ? 'EN PROGRESO' : 'PENDIENTE');
      }

      // Realizar la petición al endpoint de resumen
      const res = await fetch(`/api/reports/summary?${params.toString()}`);
      
      if (!res.ok) {
        throw new Error(`Error ${res.status} al obtener el resumen`);
      }

      const data = await res.json();
      
      // Actualizar los elementos del DOM con los datos recibidos
      if (totalRespuestasEl) totalRespuestasEl.textContent = data.totalRespuestas?.toLocaleString() ?? '0';
      if (asignaturasEvaluadasEl) asignaturasEvaluadasEl.textContent = data.asignaturasEvaluadas?.toLocaleString() ?? '0';
      if (asignaturasPendientesEl) asignaturasPendientesEl.textContent = data.asignaturasPendientes?.toLocaleString() ?? '0';
      if (porcentajePromedioEl) porcentajePromedioEl.textContent = `${data.porcentajePromedio ?? 0}%`;
      
    } catch (err) {
      console.error('Error al actualizar el resumen:', err);
      // Mostrar mensaje de error en la consola
      if (console && console.error) {
        console.error('Error al cargar el resumen:', err);
      }
    } finally {
      // Ocultar indicador de carga si existe
      if (loadingIndicator) loadingIndicator.style.display = 'none';
    }
  }

  // Suscribirse a los cambios de filtro
  if (facultadSelect) {
    facultadSelect.addEventListener('change', actualizarResumen);
  }
  
  if (tipoSelect) {
    tipoSelect.addEventListener('change', actualizarResumen);
  }
  
  if (estadoSelect) {
    estadoSelect.addEventListener('change', actualizarResumen);
  }

  // También actualizar al hacer clic en "Actualizar" o "Restablecer filtros"
  document.getElementById('refreshData')?.addEventListener('click', (e) => {
    e.preventDefault();
    actualizarResumen();
  });
  
  document.getElementById('resetFilters')?.addEventListener('click', (e) => {
    e.preventDefault();
    // Restablecer los selects y luego volver a calcular
    if (facultadSelect) facultadSelect.value = 'todos';
    if (tipoSelect) tipoSelect.value = 'todos';
    if (estadoSelect) estadoSelect.value = 'todos';
    actualizarResumen();
  });

  // Carga inicial cuando se abre la página
  actualizarResumen();

  // Hacer que la función esté disponible globalmente para ser llamada desde otros scripts si es necesario
  window.actualizarResumen = actualizarResumen;
});
