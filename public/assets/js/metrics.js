/**
 * MetricsUtils
 *
 * Este módulo define un conjunto de funciones reutilizables para calcular
 * métricas de participación y respuestas en las evaluaciones docentes. La
 * intención es separar la lógica de cálculo de métricas de la lógica de
 * interfaz de usuario. Todas las funciones se adjuntan al objeto global
 * `MetricsUtils` para que puedan ser utilizadas desde otros scripts sin
 * necesidad de utilizar módulos ES.
 *
 * Las métricas calculadas son:
 *  - totalAsignaturas: número total de asignaturas que tiene un programa.
 *  - totalRespuestas: total de evaluaciones recibidas para el programa.
 *  - asignaturasEvaluadas: asignaturas con un porcentaje de participación ≥ 60 %.
 *  - asignaturasPendientes: asignaturas con participación < 60 %.
 *  - porcentajePromedio: (asignaturasEvaluadas / totalAsignaturas) × 100.
 *  - estado: clasifica el porcentajePromedio en 'COMPLETADO', 'EN PROGRESO' o 'PENDIENTE'.
 *
 * Además se proporciona una función para calcular métricas resumidas
 * agregadas (sumas totales y porcentaje promedio global) a partir de
 * un listado de programas con métricas.
 */

(() => {
    // URL base de la API. Se asume que los endpoints están bajo /api.
    const API_BASE_URL = '/api';
  
    async function fetchAcademicData() {
      const res = await fetch(`${API_BASE_URL}/academic-data`);
      if (!res.ok) throw new Error(`Error al obtener datos académicos: ${res.status}`);
      return res.json();
    }
  
    async function fetchEvaluations() {
      const res = await fetch(`${API_BASE_URL}/reports`);
      if (!res.ok) throw new Error(`Error al obtener evaluaciones: ${res.status}`);
      return res.json();
    }
  
    function flattenPrograms(academicData) {
      const list = [];
      if (!Array.isArray(academicData)) return list;
      academicData.forEach(fac => {
        const facultad = fac.facultad;
        (fac.programas || []).forEach(prog => {
          list.push({ facultad, ...prog });
        });
      });
      return list;
    }
  
    function computeProgramMetrics(programa, evaluations) {
      const totalAsignaturas = Array.isArray(programa.asignaturas)
        ? programa.asignaturas.length
        : 0;
  
      const evalsPrograma = evaluations.filter(ev =>
        ev.informacionAcademica &&
        ev.informacionAcademica.programa === programa.nombrePrograma
      );
      const totalRespuestas = evalsPrograma.length;
  
      let asignaturasEvaluadas = 0;
      let asignaturasPendientes = 0;
  
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
      if (porcentajePromedio >= 80) estado = 'Completado';
      else if (porcentajePromedio >= 60) estado = 'En progreso';
  
      return {
        totalAsignaturas,
        totalRespuestas,
        asignaturasEvaluadas,
        asignaturasPendientes,
        porcentajePromedio,
        estado
      };
    }
  
    function computeSummaryMetrics(programMetricsList) {
      let totalRespuestas = 0;
      let totalAsignaturas = 0;
      let totalAsignaturasEvaluadas = 0;
      programMetricsList.forEach(item => {
        const m = item.metricas;
        totalRespuestas += m.totalRespuestas;
        totalAsignaturas += m.totalAsignaturas;
        totalAsignaturasEvaluadas += m.asignaturasEvaluadas;
      });
      const asignaturasPendientes = Math.max(totalAsignaturas - totalAsignaturasEvaluadas, 0);
      const porcentajePromedio = totalAsignaturas > 0
        ? Math.round((totalAsignaturasEvaluadas / totalAsignaturas) * 100)
        : 0;
      return {
        totalRespuestas,
        totalAsignaturas,
        asignaturasEvaluadas: totalAsignaturasEvaluadas,
        asignaturasPendientes,
        porcentajePromedio
      };
    }
  
    async function computeAllMetrics(filters = {}) {
      const [academicData, evaluations] = await Promise.all([
        fetchAcademicData(),
        fetchEvaluations()
      ]);
      let programs = flattenPrograms(academicData);
      if (filters.facultad && filters.facultad !== 'todos') {
        programs = programs.filter(p => p.facultad === filters.facultad);
      }
      if (filters.tipo && filters.tipo !== 'todos') {
        programs = programs.filter(p => p.tipo === filters.tipo);
      }
      const programsWithMetrics = programs.map(prog => {
        const metricas = computeProgramMetrics(prog, evaluations);
        return { ...prog, metricas };
      });
      let filtered = programsWithMetrics;
      if (filters.estado && filters.estado !== 'todos') {
        const estadoSel = String(filters.estado).trim().toUpperCase();
        filtered = programsWithMetrics.filter(p => p.metricas.estado.toUpperCase() === estadoSel);
      }
      const summary = computeSummaryMetrics(filtered);
      return { programs: filtered, summary };
    }
  
    // Se expone en el ámbito global para que otros scripts puedan usarlo.
    window.MetricsUtils = {
      fetchAcademicData,
      fetchEvaluations,
      flattenPrograms,
      computeProgramMetrics,
      computeSummaryMetrics,
      computeAllMetrics
    };
  })();
  