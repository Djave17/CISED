/**
 * Gestionar Evaluaciones - Script principal
 * Carga filtros, respuestas de evaluaciones, calcula métricas y actualiza la UI.
 * Requiere que existan en el HTML:
 * - select#facultad, select#tipoPrograma, select#estado
 * - span#total-respuestas, span#asignaturas-evaluadas, span#asignaturas-pendientes, span#porcentaje-promedio
 * - tabla con id="evaluacionesTable" y un <tbody> en su interior
 */

document.addEventListener('DOMContentLoaded', async () => {
  // Referencias a los elementos del DOM
  const tbody = document.querySelector('#evaluacionesTable tbody');
  const loadingIndicator = document.getElementById('loading-indicator');
  const errorContainer = document.getElementById('error-container');
  
  // Referencias a los filtros
  const facultadSelect = document.getElementById('facultad');
  const tipoSelect = document.getElementById('tipoPrograma');
  const estadoSelect = document.getElementById('estado');

  // Referencias a las tarjetas de resumen
  const totalRespEl = document.getElementById('totalRespuestas');
  const asigEvalEl = document.getElementById('asignaturasEvaluadas');
  const asigPendEl = document.getElementById('asignaturasPendientes');
  const pctPromEl = document.getElementById('porcentajePromedio');

  // Inicializar la aplicación
  init();

  async function init() {
    try {
      showLoading(true);
      
      // Cargar datos en paralelo
      const [academicData, evaluations] = await Promise.all([
        MetricsUtils.fetchAcademicData(),
        MetricsUtils.fetchEvaluations()
      ]);

      // Poblar los filtros con los datos cargados
      populateFilters(academicData);
      
      // Calcular métricas iniciales y actualizar la vista
      actualizarVista();
      
    } catch (error) {
      console.error('Error al inicializar la aplicación:', error);
      showError('Error al cargar los datos. Por favor, intente de nuevo más tarde.');
    } finally {
      showLoading(false);
    }
  }

  // Rellena los selectores de facultad y tipo con valores únicos
  function populateFilters(academicData) {
    // Facultades
    const facultades = new Set(academicData.map(f => f.facultad).filter(Boolean));
    
    if (facultadSelect) {
      facultadSelect.innerHTML = '<option value="todos">Todas las facultades</option>';
      [...facultades].sort().forEach(f => {
        const option = document.createElement('option');
        option.value = f;
        option.textContent = f;
        facultadSelect.appendChild(option);
      });
    }

    // Tipos de programa
    const tipos = new Set();
    academicData.forEach(f => {
      (f.programas || []).forEach(p => {
        if (p.tipo) tipos.add(p.tipo);
      });
    });
    
    if (tipoSelect) {
      tipoSelect.innerHTML = '<option value="todos">Todos los tipos</option>';
      [...tipos].sort().forEach(t => {
        const option = document.createElement('option');
        option.value = t;
        option.textContent = t;
        tipoSelect.appendChild(option);
      });
    }
  }

  // Función principal de actualización
  async function actualizarVista() {
    try {
      showLoading(true);
      
      // Construir filtros para computeAllMetrics
      const filters = {};
      const facVal = facultadSelect?.value;
      const tipoVal = tipoSelect?.value;
      const estVal = estadoSelect?.value;

      if (facVal && facVal !== 'todos') filters.facultad = facVal;
      if (tipoVal && tipoVal !== 'todos') filters.tipo = tipoVal;
      if (estVal && estVal !== 'todos') {
        // Normalizar el estado si es necesario
        const estado = estVal.toLowerCase();
        filters.estado = estado === 'completado' ? 'Completado' : 
                        estado === 'en progreso' ? 'En Progreso' : 'Pendiente';
      }

      // Calcular métricas y programas filtrados
      const { programs, summary } = await MetricsUtils.computeAllMetrics(filters);

      // Actualizar tarjetas
      if (totalRespEl) totalRespEl.textContent = summary.totalRespuestas ?? 0;
      if (asigEvalEl) asigEvalEl.textContent = summary.asignaturasEvaluadas ?? 0;
      if (asigPendEl) asigPendEl.textContent = summary.asignaturasPendientes ?? 0;
      if (pctPromEl) pctPromEl.textContent = `${summary.porcentajePromedio ?? 0}%`;

      // Actualizar la tabla
      if (tbody) {
        if (programs.length === 0) {
          tbody.innerHTML = '<tr><td colspan="8" class="text-center">No hay programas con los filtros seleccionados</td></tr>';
        } else {
          tbody.innerHTML = programs.map(p => {
            const m = p.metricas;
            // Clase para el estado
            const badgeClass = m.estado === 'Completado' ? 'badge bg-success' :
                            m.estado === 'En Progreso' ? 'badge bg-warning' :
                            'badge bg-danger';
            const barClass = m.estado === 'Completado' ? 'bg-success' :
                           m.estado === 'En Progreso' ? 'bg-warning' :
                           'bg-danger';

            return `
              <tr>
                <td>${p.nombrePrograma || 'N/A'}</td>
                <td>${p.tipo || 'N/A'}</td>
                <td class="text-center">${m.totalAsignaturas}</td>
                <td class="text-center">${m.totalRespuestas}</td>
                <td class="text-center">${m.asignaturasEvaluadas}</td>
                <td class="text-center">${m.asignaturasPendientes}</td>
                <td>
                  <div class="progress" style="height: 20px;">
                    <div class="progress-bar ${barClass}"
                         role="progressbar"
                         style="width:${m.porcentajePromedio}%"
                         aria-valuenow="${m.porcentajePromedio}"
                         aria-valuemin="0"
                         aria-valuemax="100">
                      ${m.porcentajePromedio}%
                    </div>
                  </div>
                </td>
                <td class="text-center">
                  <span class="${badgeClass}">${m.estado}</span>
                </td>
              </tr>
            `;
          }).join('');
        }
      }
      
    } catch (error) {
      console.error('Error al actualizar la vista:', error);
      showError('Error al cargar los datos. Por favor, intente de nuevo.');
    } finally {
      showLoading(false);
    }
  }

  // Suscribirse a cambios de los filtros
  facultadSelect?.addEventListener('change', actualizarVista);
  tipoSelect?.addEventListener('change', actualizarVista);
  estadoSelect?.addEventListener('change', actualizarVista);

  // Muestra u oculta el loader
  function showLoading(show) {
    if (!loadingIndicator) return;
    loadingIndicator.style.display = show ? 'flex' : 'none';
  }

  // Muestra un error y lo oculta después de 5 segundos
  function showError(message) {
    if (!errorContainer) return;
    errorContainer.textContent = message;
    errorContainer.style.display = 'block';
    
    setTimeout(() => {
      errorContainer.style.display = 'none';
    }, 5000);
  }
});