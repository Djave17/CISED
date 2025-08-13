/**
 * Gestionar Evaluaciones - Main Script
 * Carga dinámica de filtros y manejo de interacciones
 */

document.addEventListener('DOMContentLoaded', async () => {
    // Elementos del DOM
    const facultadSelect = document.getElementById('facultad');
    const tipoProgramaSelect = document.getElementById('tipoPrograma');
    const estadoSelect = document.getElementById('estado');
    const loadingIndicator = document.getElementById('loading-indicator');
    const errorContainer = document.getElementById('error-container');
    const resultadosContainer = document.getElementById('resultados-container');
  
    // Datos en memoria para filtrado
    let academicData = [];
    let filteredPrograms = [];
  
    // Inicialización
    try {
      showLoading(true);
      await loadAcademicData();
      populateFilters();
      updateResults();
    } catch (error) {
      showError('Error al cargar los datos académicos: ' + error.message);
    } finally {
      showLoading(false);
    }
  
    // Event Listeners
    facultadSelect?.addEventListener('change', updateResults);
    tipoProgramaSelect?.addEventListener('change', updateResults);
    estadoSelect?.addEventListener('change', updateResults);
  
    /**
     * Carga los datos académicos desde la API
     */
    async function loadAcademicData() {
      try {
        const response = await fetch('/api/academic-data');
        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status}`);
        }
        academicData = await response.json();
      } catch (error) {
        console.error('Error al cargar datos académicos:', error);
        throw error;
      }
    }
  
    /**
     * Rellena los filtros con datos de la API
     */
    function populateFilters() {
      if (!facultadSelect || !tipoProgramaSelect) return;
  
      // Obtener valores únicos
      const facultades = new Set();
      const tiposPrograma = new Set();
  
      academicData.forEach(item => {
        if (item.facultad) facultades.add(item.facultad);
        if (item.programas && Array.isArray(item.programas)) {
          item.programas.forEach(programa => {
            if (programa.tipo) tiposPrograma.add(programa.tipo);
          });
        }
      });
  
      // Ordenar alfabéticamente
      const sortedFacultades = Array.from(facultades).sort();
      const sortedTipos = Array.from(tiposPrograma).sort();
  
      // Poblar select de facultades
      sortedFacultades.forEach(facultad => {
        const option = document.createElement('option');
        option.value = facultad;
        option.textContent = facultad;
        facultadSelect.appendChild(option);
      });
  
      // Poblar select de tipos de programa
      sortedTipos.forEach(tipo => {
        const option = document.createElement('option');
        option.value = tipo;
        option.textContent = tipo;
        tipoProgramaSelect.appendChild(option);
      });
    }
  
    /**
     * Actualiza los resultados según los filtros seleccionados
     */
    function updateResults() {
      if (!resultadosContainer) return;
      
      const facultadSeleccionada = facultadSelect?.value;
      const tipoSeleccionado = tipoProgramaSelect?.value;
      const estadoSeleccionado = estadoSelect?.value;
  
      // Filtrar programas
      filteredPrograms = [];
      academicData.forEach(facultadData => {
        if (facultadSeleccionada && facultadSeleccionada !== 'todos' && 
            facultadData.facultad !== facultadSeleccionada) {
          return;
        }
  
        if (facultadData.programas && Array.isArray(facultadData.programas)) {
          facultadData.programas.forEach(programa => {
            if (tipoSeleccionado && tipoSeleccionado !== 'todos' && 
                programa.tipo !== tipoSeleccionado) {
              return;
            }
            
            // TODO: Implementar filtrado por estado cuando exista el endpoint
            // Por ahora, todos los programas se marcan como pendientes
            const estado = 'Pendiente';
            
            if (estadoSeleccionado && estadoSeleccionado !== 'todos' && 
                estado !== estadoSeleccionado) {
              return;
            }
  
            filteredPrograms.push({
              facultad: facultadData.facultad,
              ...programa,
              estado
            });
          });
        }
      });
  
      renderResults();
    }
  
    /**
     * Renderiza los resultados en la tabla
     */
    function renderResults() {
      if (!resultadosContainer) return;
  
      if (filteredPrograms.length === 0) {
        resultadosContainer.innerHTML = `
          <div class="no-results">
            <i class="fas fa-info-circle"></i>
            <p>No se encontraron programas con los filtros seleccionados</p>
          </div>
        `;
        return;
      }
  
      const tbody = document.querySelector('#evaluacionesTable tbody');
      if (!tbody) return;
      
      tbody.innerHTML = filteredPrograms.map(programa => `
        <tr>
          <td>${programa.nombre || 'N/A'}</td>
          <td>${programa.nivel || programa.tipo || 'N/A'}</td>
          <td class="text-center">${programa.totalAsignaturas || '0'}</td>
          <td class="text-center">${programa.totalRespuestas || '0'}</td>
          <td class="text-center">${programa.asignaturasEvaluadas || '0'}</td>
          <td class="text-center">${programa.asignaturasPendientes || '0'}</td>
          <td>
            <div class="progress" style="height: 20px;">
              <div class="progress-bar bg-success" 
                   role="progressbar" 
                   style="width: ${programa.porcentajePromedio || 0}%"
                   aria-valuenow="${programa.porcentajePromedio || 0}" 
                   aria-valuemin="0" 
                   aria-valuemax="100">
                ${programa.porcentajePromedio || 0}%
              </div>
            </div>
          </td>
          <td class="text-center">
            <span class="badge ${programa.estado === 'COMPLETADO' ? 'bg-success' : programa.estado === 'EN PROGRESO' ? 'bg-warning' : 'bg-danger'}">
              ${programa.estado || 'PENDIENTE'}
            </span>
          </td>
        </tr>
      `).join('');
    }
  
    /**
     * Muestra u oculta el indicador de carga
     * @param {boolean} show - Mostrar u ocultar
     */
    function showLoading(show) {
      if (!loadingIndicator) return;
      loadingIndicator.style.display = show ? 'block' : 'none';
    }
  
    /**
     * Muestra un mensaje de error
     * @param {string} message - Mensaje de error
     */
    function showError(message) {
      if (!errorContainer) return;
      errorContainer.textContent = message;
      errorContainer.style.display = 'block';
      
      // Ocultar después de 5 segundos
      setTimeout(() => {
        errorContainer.style.display = 'none';
      }, 5000);
    }
  });