// --- PROGRESO DE PREGUNTAS ---
let TOTAL_PREGUNTAS = 0;

function inicializarProgreso() {
  try {
    // Cada .tarjeta-pregunta corresponde a una pregunta
    TOTAL_PREGUNTAS = contenedorPreguntas.querySelectorAll('.tarjeta-pregunta').length;
  } catch (_) { TOTAL_PREGUNTAS = 0; }

  if (seccionProgreso) {
    seccionProgreso.setAttribute('aria-valuemin', '0');
    seccionProgreso.setAttribute('aria-valuemax', String(TOTAL_PREGUNTAS));
  }
}

function contarRespondidas() {
  const checked = contenedorPreguntas.querySelectorAll('input[type="radio"]:checked');
  // Contar por nombre de pregunta para evitar duplicados
  const nombres = new Set();
  checked.forEach(i => nombres.add(i.name));
  return nombres.size;
}

function actualizarProgreso() {
  const respondidas = contarRespondidas();
  const total = TOTAL_PREGUNTAS;
  const pct = total > 0 ? Math.round((respondidas / total) * 100) : 0;
  if (textoProgreso) {
    textoProgreso.textContent = `Progreso: ${respondidas} de ${total} preguntas respondidas`;
  }
  if (barraProgreso) {
    barraProgreso.style.width = `${pct}%`;
  }
  if (seccionProgreso) {
    seccionProgreso.setAttribute('aria-valuenow', String(respondidas));
  }
}
/**
 * Lógica específica para el formulario de ESTUDIANTE.
 * Utiliza las herramientas de FormUtils para funcionar.
 */

// --- CONFIGURACIÓN ---
const API_BASE_URL = 'http://localhost:3000/api';
const TIPO_FORMULARIO_ACTUAL = 'estudiante';

// --- ELEMENTOS DEL DOM ---
const contenedorPreguntas = document.getElementById('contenedor-preguntas');
const barraProgreso = document.getElementById('barraProgreso');
const textoProgreso = document.getElementById('textoProgreso');
const seccionProgreso = document.querySelector('.seccion-progreso');
const botonEnviar = document.getElementById('boton-enviar');
const botonSiguiente = document.getElementById('boton-siguiente');
const botonAnterior = document.getElementById('boton-anterior');
const paso1 = document.getElementById('paso-1');
const paso2 = document.getElementById('paso-2');
const paso3 = document.getElementById('paso-3');
const pasoExito = document.getElementById('paso-exito');
// Indicadores de pasos (stepper)
const indPaso1 = document.getElementById('indicador-paso1');
const indPaso2 = document.getElementById('indicador-paso2');
const indPaso3 = document.getElementById('indicador-paso3');

// Selectores en cascada
const selFacultad = document.getElementById('selector-facultad');
const selTipoPrograma = document.getElementById('selector-tipo-programa');
const selPrograma = document.getElementById('selector-programa');
const selAsignatura = document.getElementById('selector-asignatura');
const infoDocente = document.getElementById('info-docente');
const selDocentePlaceholder = document.getElementById('selector-docente-placeholder');
// ... y todos los demás selectores y botones

/**
 * INICIO: Carga los datos y configura los eventos.
 */
document.addEventListener('DOMContentLoaded', () => {
  // Peticiones para obtener la oferta académica y la estructura de preguntas
  Promise.all([
    fetch(`${API_BASE_URL}/academic-data`),
    fetch(`${API_BASE_URL}/forms/${TIPO_FORMULARIO_ACTUAL}`)
  ])
  .then(responses => Promise.all(responses.map(res => res.json())))
  .then(([academicResults, formResults]) => {
    window.academicData = academicResults; // Guarda los datos en el objeto window para fácil acceso
    window.formStructure = formResults;
    
    // Ahora usamos las funciones de utils.js
    // FormUtils.poblarFacultades(academicResults); // Suponiendo que la hemos movido a utils
    FormUtils.generarSeccionesDePreguntas(contenedorPreguntas, formResults);
    
    // Configura los eventos de los botones
    configurarEventos();

    // Poblar selects en cascada
    poblarFacultades(academicResults);

    // Progreso: preparar totales y primer render
    inicializarProgreso();
    actualizarProgreso();
    // Escuchar cambios de respuestas para actualizar progreso en vivo
    contenedorPreguntas.addEventListener('change', (e) => {
      if (e.target && e.target.matches('input[type="radio"]')) {
        actualizarProgreso();
      }
    });

  })
  .catch(error => {
    console.error('❌ Error al cargar datos:', error);
    contenedorPreguntas.innerHTML = '<p class="error">No se pudieron cargar los datos del formulario.</p>';
  });
});

// --- UTILIDADES UI ---
function mostrarAlerta(mensaje, tipo = 'error') {
  // tipos soportados por CSS: 'exito', 'error', 'info'
  const id = 'alerta-flotante-global';
  let alerta = document.getElementById(id);
  if (!alerta) {
    alerta = document.createElement('div');
    alerta.id = id;
    alerta.className = 'alerta-flotante';
    const span = document.createElement('span');
    span.className = 'mensaje-alerta';
    alerta.appendChild(span);
    document.body.appendChild(alerta);
  }
  alerta.classList.remove('exito', 'error', 'info', 'visible');
  alerta.classList.add(tipo);
  alerta.querySelector('.mensaje-alerta').textContent = mensaje;
  // mostrar
  requestAnimationFrame(() => {
    alerta.classList.add('visible');
  });
  // ocultar luego de 3s
  clearTimeout(mostrarAlerta._t);
  mostrarAlerta._t = setTimeout(() => {
    alerta.classList.remove('visible');
  }, 3000);
}

/**
 * Conecta los elementos del HTML con las funciones.
 */
function configurarEventos() {
  // Ejemplo para el botón de enviar
  botonEnviar.addEventListener('click', async () => {
    try {
      botonEnviar.disabled = true;
      botonEnviar.textContent = 'Enviando...';
      
      const datos = FormUtils.recopilarDatos();
      const response = await FormUtils.enviarEvaluacion(TIPO_FORMULARIO_ACTUAL, datos, API_BASE_URL);

      if (!response.ok) throw new Error('Error del servidor');
      
      // Mostrar paso de éxito
      mostrarPaso('exito');

    } catch (error) {
      console.error('Error al enviar:', error);
      // mostrarAlerta('No se pudo enviar la evaluación.', 'error');
      botonEnviar.disabled = false;
      botonEnviar.textContent = 'Enviar Evaluación';
    }
  });

  // Aquí irían los addEventListener para los selectores en cascada.
  botonSiguiente.addEventListener('click', () => avanzarPaso());
  botonAnterior.addEventListener('click', () => retrocederPaso());

  // Estado inicial: solo facultad habilitada
  selTipoPrograma.disabled = true;
  selPrograma.disabled = true;
  selAsignatura.disabled = true;

  selFacultad.addEventListener('change', () => {
    // Limpiar antes de poblar
    limpiarSelect(selTipoPrograma, 'Selecciona tu nivel académico');
    limpiarSelect(selPrograma, 'Selecciona tu programa de estudios');
    limpiarSelect(selAsignatura, 'Selecciona la asignatura a evaluar');
    poblarTiposPrograma();
    infoDocente.textContent = '';
    infoDocente.style.display = 'none';
    selDocentePlaceholder.style.display = '';
    selTipoPrograma.disabled = false;
    selPrograma.disabled = true;
    selAsignatura.disabled = true;
    // limpiar invalidaciones
    selFacultad.removeAttribute('aria-invalid');
    selFacultad.closest('.grupo-campo')?.classList.remove('campo-incompleto');
  });
  selTipoPrograma.addEventListener('change', () => {
    // Limpiar antes de poblar
    limpiarSelect(selPrograma, 'Selecciona tu programa de estudios');
    limpiarSelect(selAsignatura, 'Selecciona la asignatura a evaluar');
    poblarProgramas();
    infoDocente.textContent = '';
    infoDocente.style.display = 'none';
    selDocentePlaceholder.style.display = '';
    selPrograma.disabled = false;
    selAsignatura.disabled = true;
    selTipoPrograma.removeAttribute('aria-invalid');
    selTipoPrograma.closest('.grupo-campo')?.classList.remove('campo-incompleto');
  });
  selPrograma.addEventListener('change', () => {
    // Limpiar antes de poblar
    limpiarSelect(selAsignatura, 'Selecciona la asignatura a evaluar');
    poblarAsignaturas();
    infoDocente.textContent = '';
    infoDocente.style.display = 'none';
    selDocentePlaceholder.style.display = '';
    selAsignatura.disabled = false;
    selPrograma.removeAttribute('aria-invalid');
    selPrograma.closest('.grupo-campo')?.classList.remove('campo-incompleto');
  });
  selAsignatura.addEventListener('change', () => {
    actualizarDocente();
    selAsignatura.removeAttribute('aria-invalid');
    selAsignatura.closest('.grupo-campo')?.classList.remove('campo-incompleto');
    // cuando llega el docente se limpia también
    infoDocente.removeAttribute?.('aria-invalid');
    infoDocente.closest?.('.grupo-campo')?.classList?.remove('campo-incompleto');
    // quitar mensaje de ayuda de docente (si existe)
    const ayudaDoc = document.getElementById('ayuda-docente-valid');
    if (ayudaDoc) ayudaDoc.remove();
  });
}

// --- LÓGICA DE PASOS ---
let pasoActual = 1; // 1,2,3

function mostrarPaso(id) {
  // id puede ser número (1,2,3) o 'exito'
  const mostrar = (el, visible) => el.style.display = visible ? '' : 'none';
  mostrar(paso1, id === 1);
  mostrar(paso2, id === 2);
  mostrar(paso3, id === 3);
  mostrar(pasoExito, id === 'exito');

  // Actualizar stepper (activo y aria-selected)
  const numeroPaso = typeof id === 'number' ? id : (id === 'exito' ? null : id);
  if (numeroPaso) {
    [indPaso1, indPaso2, indPaso3].forEach((el, index) => {
      if (!el) return;
      const activo = (index + 1) === numeroPaso;
      el.classList.toggle('activo', activo);
      el.setAttribute('aria-selected', activo ? 'true' : 'false');
    });
  }

  // Barra de progreso: se mantiene sticky via CSS; no se necesita lógica JS

  // Footer buttons
  if (id === 1) {
    botonAnterior.style.display = 'none';
    botonSiguiente.style.display = '';
    botonEnviar.style.display = 'none';
  } else if (id === 2) {
    botonAnterior.style.display = '';
    botonSiguiente.style.display = '';
    botonEnviar.style.display = 'none';
  } else if (id === 3) {
    botonAnterior.style.display = '';
    botonSiguiente.style.display = 'none';
    botonEnviar.style.display = '';
  } else if (id === 'exito') {
    botonAnterior.style.display = 'none';
    botonSiguiente.style.display = 'none';
    botonEnviar.style.display = 'none';
  }
}

function avanzarPaso() {
  if (pasoActual === 1) {
    // Validación paso 1: todos los selectores y docente autoasignado
    const invalids = [];
    const check = (el) => {
      if (!el || el.disabled) return;
      if (!el.value) {
        el.setAttribute('aria-invalid', 'true');
        el.closest('.grupo-campo')?.classList.add('campo-incompleto');
        invalids.push(el);
      }
    };
    check(selFacultad);
    check(selTipoPrograma);
    check(selPrograma);
    check(selAsignatura);
    // Docente auto-seleccionado: visible en infoDocente
    const docenteOk = infoDocente && infoDocente.style.display !== 'none' && infoDocente.textContent.trim() !== '';
    if (!docenteOk) {
      infoDocente.setAttribute?.('aria-invalid', 'true');
      infoDocente.closest?.('.grupo-campo')?.classList?.add('campo-incompleto');
      // enfocar asignatura como punto de acción
      if (selAsignatura) invalids.push(selAsignatura);
      // Añadir mensaje de ayuda bajo el grupo de docente si no existe
      const grupoDoc = infoDocente.closest?.('.grupo-campo');
      if (grupoDoc && !document.getElementById('ayuda-docente-valid')) {
        const p = document.createElement('p');
        p.className = 'texto-ayuda';
        p.id = 'ayuda-docente-valid';
        p.textContent = 'Selecciona una asignatura para que se asigne el docente automáticamente.';
        // Insertar después del placeholder o al final del grupo
        const ref = grupoDoc.querySelector('#selector-docente-placeholder') || grupoDoc.lastElementChild;
        if (ref && ref.nextSibling) {
          ref.parentNode.insertBefore(p, ref.nextSibling);
        } else {
          grupoDoc.appendChild(p);
        }
      }
    }
    if (invalids.length) {
      mostrarAlerta('Completa la información académica. Selecciona facultad, programa, asignatura y docente.', 'error');
      try { invalids[0].scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch(_) {}
      return;
    }
    pasoActual = 2;
  } else if (pasoActual === 2) {
    // Validación: todas las preguntas deben estar respondidas
    const tarjetas = document.querySelectorAll('.tarjeta-pregunta');
    let primeraIncompleta = null;
    tarjetas.forEach(tarjeta => {
      // Busca cualquier input radio marcado dentro de la tarjeta
      const respondida = tarjeta.querySelector('input[type="radio"]:checked') !== null;
      if (!respondida) {
        tarjeta.classList.add('pregunta-incompleta');
        if (!primeraIncompleta) primeraIncompleta = tarjeta;
      } else {
        tarjeta.classList.remove('pregunta-incompleta');
      }
    });
    if (primeraIncompleta) {
      mostrarAlerta('Responde todas las preguntas para continuar.', 'error');
      // Desplaza a la primera incompleta y no avanza de paso
      try { primeraIncompleta.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (_) {}
      return; // evita avanzar
    }
    pasoActual = 3;
  }
  mostrarPaso(pasoActual);
}
function retrocederPaso() {
  if (pasoActual === 3) pasoActual = 2;
  else if (pasoActual === 2) pasoActual = 1;
  mostrarPaso(pasoActual);
}

// --- SELECTS EN CASCADA ---
function limpiarSelect(sel, placeholder = '...') {
  while (sel.firstChild) sel.removeChild(sel.firstChild);
  const opt = document.createElement('option');
  opt.value = '';
  opt.textContent = placeholder;
  opt.disabled = false; // se podrá seleccionar como placeholder visible
  opt.selected = true;
  sel.appendChild(opt);
}

function poblarFacultades(data) {
  limpiarSelect(selFacultad, 'Seleccione una facultad');
  data.forEach(item => {
    const opt = document.createElement('option');
    opt.value = item.facultad;
    opt.textContent = item.facultad;
    selFacultad.appendChild(opt);
  });
}

function getFacultadSeleccionada() {
  const nombre = selFacultad.value;
  return (window.academicData || []).find(f => f.facultad === nombre);
}

function poblarTiposPrograma() {
  limpiarSelect(selTipoPrograma, 'Seleccione un tipo');
  const fac = getFacultadSeleccionada();
  if (!fac) return;
  const tipos = Array.from(new Set((fac.programas || []).map(p => p.tipo)));
  tipos.forEach(t => {
    const opt = document.createElement('option');
    opt.value = t;
    opt.textContent = t;
    selTipoPrograma.appendChild(opt);
  });
}

function poblarProgramas() {
  limpiarSelect(selPrograma, 'Seleccione un programa');
  const fac = getFacultadSeleccionada();
  if (!fac) return;
  const tipo = selTipoPrograma.value;
  (fac.programas || []).filter(p => p.tipo === tipo).forEach(p => {
    const opt = document.createElement('option');
    opt.value = p.nombrePrograma;
    opt.textContent = p.nombrePrograma;
    selPrograma.appendChild(opt);
  });
}

function getProgramaSeleccionado() {
  const fac = getFacultadSeleccionada();
  if (!fac) return null;
  const tipo = selTipoPrograma.value;
  const nombre = selPrograma.value;
  return (fac.programas || []).find(p => p.tipo === tipo && p.nombrePrograma === nombre);
}

function poblarAsignaturas() {
  limpiarSelect(selAsignatura, 'Seleccione una asignatura');
  const prog = getProgramaSeleccionado();
  if (!prog) return;
  (prog.asignaturas || []).forEach(a => {
    const opt = document.createElement('option');
    opt.value = a.nombreAsignatura;
    opt.textContent = a.nombreAsignatura;
    selAsignatura.appendChild(opt);
  });
}

function actualizarDocente() {
  const prog = getProgramaSeleccionado();
  const asigNombre = selAsignatura.value;
  if (!prog || !asigNombre) {
    infoDocente.textContent = '';
    infoDocente.style.display = 'none';
    selDocentePlaceholder.style.display = '';
    return;
  }
  const a = (prog.asignaturas || []).find(x => x.nombreAsignatura === asigNombre);
  const nombre = a ? a.docenteAsignado : '';
  if (nombre) {
    infoDocente.textContent = nombre;
    selDocentePlaceholder.style.display = 'none';
    infoDocente.style.display = '';
  } else {
    infoDocente.textContent = '';
    infoDocente.style.display = 'none';
    selDocentePlaceholder.style.display = '';
  }
}

// Mostrar paso inicial
mostrarPaso(1);