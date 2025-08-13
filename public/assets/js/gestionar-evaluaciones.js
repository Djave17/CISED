/**
 * Gestionar Evaluaciones - Script principal
 * Carga filtros, respuestas de evaluaciones, calcula métricas y actualiza la UI.
 * Requiere que existan en el HTML:
 * - select#facultad, select#tipoPrograma, select#estado
 * - span#total-respuestas, span#asignaturas-evaluadas, span#asignaturas-pendientes, span#porcentaje-promedio
 * - tabla con id="evaluacionesTable" y un <tbody> en su interior
 */

document.addEventListener('DOMContentLoaded', () => {
    // Referencias a selects de filtro
    const facultadSelect = document.getElementById('facultad');
    const tipoProgramaSelect = document.getElementById('tipoPrograma');
    const estadoSelect = document.getElementById('estado');
  
    // Referencias a tarjetas resumen (ajusta IDs según tu HTML)
    const totalRespuestasEl = document.getElementById('total-respuestas');
    const asignaturasEvaluadasEl = document.getElementById('asignaturas-evaluadas');
    const asignaturasPendientesEl = document.getElementById('asignaturas-pendientes');
    const porcentajePromedioEl = document.getElementById('porcentaje-promedio');
  
    // Otros elementos
    const loadingIndicator = document.getElementById('loading-indicator');
    const errorContainer = document.getElementById('error-container');
    const resultadosContainer = document.getElementById('resultados-container');
    const tbody = document.querySelector('#evaluacionesTable tbody');
  
    // Datos en memoria
    let academicData = [];
    let evaluations = [];
    let filteredPrograms = [];
  
    // Inicializar todo
    init();
  
    async function init() {
      try {
        showLoading(true);
        // Cargamos en paralelo la oferta académica y las evaluaciones
        const [acadRes, evalRes] = await Promise.all([
          fetch('/api/academic-data'),
          fetch('/api/reports')
        ]);
  
        if (!acadRes.ok || !evalRes.ok) {
          throw new Error(`Error al cargar datos: académica(${acadRes.status}), evaluaciones(${evalRes.status})`);
        }
        academicData = await acadRes.json();
        evaluations = await evalRes.json();
  
        populateFilters();
        updateResults();
      } catch (err) {
        showError(err.message);
      } finally {
        showLoading(false);
      }
    }
  
    // Rellena los <select> de facultad y tipo de programa con datos únicos y ordenados
    function populateFilters() {
      const facultades = new Set();
      const tiposPrograma = new Set();
  
      academicData.forEach(item => {
        if (item.facultad) facultades.add(item.facultad);
        (item.programas || []).forEach(prog => {
          if (prog.tipo) tiposPrograma.add(prog.tipo);
        });
      });
  
      [...facultades].sort().forEach(f => {
        const opt = document.createElement('option');
        opt.value = f; opt.textContent = f;
        facultadSelect.appendChild(opt);
      });
  
      [...tiposPrograma].sort().forEach(t => {
        const opt = document.createElement('option');
        opt.value = t; opt.textContent = t;
        tipoProgramaSelect.appendChild(opt);
      });
    }
  
    // Recalcula filtros al cambiar selección
    facultadSelect?.addEventListener('change', updateResults);
    tipoProgramaSelect?.addEventListener('change', updateResults);
    estadoSelect?.addEventListener('change', updateResults);
  
    // Filtra programas según facultad, tipo y estado; calcula métricas y renderiza tabla + tarjetas
    function updateResults() {
      const facSel  = facultadSelect?.value || '';
      const tipoSel = tipoProgramaSelect?.value || '';
      const estSel  = estadoSelect?.value || '';
  
      filteredPrograms = [];
  
      academicData.forEach(fac => {
        if (facSel && facSel !== 'todos' && fac.facultad !== facSel) return;
  
        (fac.programas || []).forEach(prog => {
          if (tipoSel && tipoSel !== 'todos' && prog.tipo !== tipoSel) return;
  
          // Calculamos métricas del programa
          const metricas = computeMetricsForProgram(prog);
  
          // Filtrar también por estado (si no es 'todos')
          if (estSel && estSel !== 'todos' && metricas.estado.toUpperCase() !== estSel.toUpperCase()) return;
  
          filteredPrograms.push({
            facultad: fac.facultad,
            ...prog,
            metricas
          });
        });
      });
  
      renderTable();
      renderSummary();
    }
  
    // Calcula las métricas para un programa usando el array de evaluations
    function computeMetricsForProgram(programa) {
      const totalAsignaturas = Array.isArray(programa.asignaturas) ? programa.asignaturas.length : 0;
  
      // Filtra las evaluaciones que pertenecen a este programa
      const evalsPrograma = evaluations.filter(ev =>
        ev.informacionAcademica &&
        ev.informacionAcademica.programa === programa.nombrePrograma
      );
      const totalRespuestas = evalsPrograma.length;
  
      let asignaturasEvaluadas = 0;
      let asignaturasPendientes = 0;
  
      // Para cada asignatura, calculamos el % de estudiantes que respondieron
      (programa.asignaturas || []).forEach(asig => {
        const evalsAsignatura = evalsPrograma.filter(ev =>
          ev.informacionAcademica &&
          ev.informacionAcademica.asignatura === asig.nombreAsignatura
        );
        const pctAsignatura = (evalsAsignatura.length / programa.cantidadEstudiantes) * 100;
        if (pctAsignatura >= 60) {
          asignaturasEvaluadas++;
        } else {
          asignaturasPendientes++;
        }
      });
  
      const porcentajePromedio = totalAsignaturas > 0
        ? Math.round((asignaturasEvaluadas / totalAsignaturas) * 100)
        : 0;
  
      let estado = 'Pendiente';
      if (porcentajePromedio >= 80) estado = 'COMPLETADO';
      else if (porcentajePromedio >= 60) estado = 'EN PROGRESO';
  
      return { totalAsignaturas, totalRespuestas, asignaturasEvaluadas, asignaturasPendientes, porcentajePromedio, estado };
    }
  
    // Renderiza la tabla de programas con sus métricas
    function renderTable() {
      if (!tbody) return;
  
      if (filteredPrograms.length === 0) {
        tbody.innerHTML = '';
        if (resultadosContainer) {
          resultadosContainer.innerHTML = '<p>No hay programas para los filtros seleccionados.</p>';
        }
        return;
      }
  
      if (resultadosContainer) resultadosContainer.innerHTML = '';
  
      tbody.innerHTML = filteredPrograms.map(prog => {
        const m = prog.metricas;
        const badgeClass = m.estado === 'COMPLETADO'
          ? 'bg-success'
          : m.estado === 'EN PROGRESO'
          ? 'bg-warning'
          : 'bg-danger';
        const barClass = badgeClass;
  
       
  
      
  
        return `
          <tr>
            <td>${prog.nombrePrograma || 'N/A'}</td>
            <td>${prog.tipo || 'N/A'}</td>
            <td class="text-center">${m.totalAsignaturas}</td>
            <td class="text-center">${m.totalRespuestas}</td>
            <td class="text-center">${m.asignaturasEvaluadas}</td>
            <td class="text-center">${m.asignaturasPendientes}</td>
            <td>
              <div class="progress" style="height:20px;">
                <div class="progress-bar ${barClass}" role="progressbar"
                  style="width:${m.porcentajePromedio}%" aria-valuenow="${m.porcentajePromedio}"
                  aria-valuemin="0" aria-valuemax="100">
                  ${m.porcentajePromedio}%
                </div>
              </div>
            </td>
            <td class="text-center">
              <span class="badge ${badgeClass}">${m.estado}</span>
            </td>
          </tr>
        `;
      }).join('');
    }
  
    // Actualiza las tarjetas de resumen superior
    function renderSummary() {
      let totalRespuestas = 0;
      let totalAsignaturas = 0;
      let totalAsignaturasEvaluadas = 0;
  
      filteredPrograms.forEach(p => {
        const m = p.metricas;
        totalRespuestas += m.totalRespuestas;
        totalAsignaturas += m.totalAsignaturas;
        totalAsignaturasEvaluadas += m.asignaturasEvaluadas;
      });
  
      const pendientes = Math.max(totalAsignaturas - totalAsignaturasEvaluadas, 0);
      const pctPromedio = totalAsignaturas > 0
        ? Math.round((totalAsignaturasEvaluadas / totalAsignaturas) * 100)
        : 0;
  
      if (totalRespuestasEl) totalRespuestasEl.textContent = totalRespuestas;
      if (asignaturasEvaluadasEl) asignaturasEvaluadasEl.textContent = totalAsignaturasEvaluadas;
      if (asignaturasPendientesEl) asignaturasPendientesEl.textContent = pendientes;
      if (porcentajePromedioEl) porcentajePromedioEl.textContent = `${pctPromedio}%`;
    }
  
    // Muestra u oculta el loader
    function showLoading(show) {
      if (!loadingIndicator) return;
      loadingIndicator.style.display = show ? 'block' : 'none';
    }
  
    // Muestra un error y lo oculta a los 5 segundos
    function showError(msg) {
      if (!errorContainer) return;
      errorContainer.textContent = msg;
      errorContainer.style.display = 'block';
      setTimeout(() => {
        errorContainer.style.display = 'none';
      }, 5000);
    }
  });
  