/**
 * FormUtils: Un conjunto de herramientas reutilizables para los formularios de evaluación.
 */
const FormUtils = {
    /**
     * Genera las secciones y preguntas en un contenedor específico.
     * @param {HTMLElement} container - El elemento del DOM donde se insertarán las preguntas.
     * @param {Object} formStructure - El objeto con la estructura de secciones y preguntas.
     */
    generarSeccionesDePreguntas: (container, formStructure) => {
      container.innerHTML = ''; // Limpia el contenedor
  
      formStructure.secciones.forEach(seccion => {
        const seccionContainer = document.createElement('div');
        // Usa la clase definida en global.css
        seccionContainer.className = 'subseccion-evaluacion';
  
        const titulo = document.createElement('h3');
        titulo.className = 'titulo-subseccion';
        titulo.textContent = seccion.titulo;
        seccionContainer.appendChild(titulo);
  
        seccion.preguntas.forEach(pregunta => {
          // Lógica para crear la tarjeta de cada pregunta (texto y 5 radios)
          const tarjeta = document.createElement('div');
          tarjeta.className = 'tarjeta-pregunta';

          // Texto de la pregunta
          const p = document.createElement('p');
          p.className = 'texto-pregunta';
          p.textContent = pregunta.texto;
          tarjeta.appendChild(p);

          // Contenedor de opciones 1-5 (alineado con clases de global.css)
          const opciones = document.createElement('div');
          opciones.className = 'grupo-opciones-respuesta';

          for (let valor = 5; valor >= 1; valor--) {
            // Contenedor individual de opción
            const contenedorOpcion = document.createElement('div');
            contenedorOpcion.className = 'contenedor-opcion-respuesta';

            const input = document.createElement('input');
            input.type = 'radio';
            input.name = `resp-${pregunta.id}`;
            input.value = String(valor);
            input.required = true; // Obliga a seleccionar una opción por pregunta
            input.id = `resp-${pregunta.id}-${valor}`;
            input.className = 'input-radio-respuesta';

            const label = document.createElement('label');
            label.setAttribute('for', input.id);
            label.className = 'opcion-respuesta';

            // Contenido visual de la opción
            const etiqueta = document.createElement('div');
            etiqueta.className = 'etiqueta-opcion-respuesta';

            const valorNodo = document.createElement('div');
            valorNodo.className = 'valor-opcion';
            valorNodo.textContent = String(valor);

            const textoNodo = document.createElement('div');
            textoNodo.className = 'texto-opcion';
            // Etiquetas descriptivas (visuales) para cada valor
            const etiquetas = { 5: 'Destacado', 4: 'Competente', 3: 'Bueno', 2: 'Regular', 1: 'Deficiente' };
            textoNodo.textContent = etiquetas[valor] || '';

            etiqueta.appendChild(valorNodo);
            etiqueta.appendChild(textoNodo);
            label.appendChild(etiqueta);

            contenedorOpcion.appendChild(input);
            contenedorOpcion.appendChild(label);
            opciones.appendChild(contenedorOpcion);
          }

          tarjeta.appendChild(opciones);
          seccionContainer.appendChild(tarjeta);

          // Manejo de selección para resaltar la opción escogida
          opciones.addEventListener('change', (e) => {
            if (e.target && e.target.matches('input[type="radio"]')) {
              const name = e.target.name;
              // Quitar selección visual previa
              opciones.querySelectorAll('.opcion-respuesta').forEach(el => {
                el.classList.remove('seleccionada');
              });
              // Marcar la etiqueta asociada al input seleccionado
              const labelSel = opciones.querySelector(`label[for="${e.target.id}"]`);
              if (labelSel) labelSel.classList.add('seleccionada');
              // Quitar estado de incompleta si lo tenía
              tarjeta.classList.remove('pregunta-incompleta');
            }
          });
        });
        container.appendChild(seccionContainer);
      });
    },
  
    /**
     * Recopila los datos del formulario y los prepara para el envío.
     * @returns {Object} - Un objeto con los datos listos para ser enviados.
     */
    recopilarDatos: () => {
      const informacionAcademica = {
        facultad: document.getElementById('selector-facultad').value,
        tipoPrograma: document.getElementById('selector-tipo-programa').value,
        programa: document.getElementById('selector-programa').value,
        asignatura: document.getElementById('selector-asignatura').value,
        docente: document.getElementById('info-docente').textContent
      };
  
      const respuestas = [];
      document.querySelectorAll('input[type="radio"]:checked').forEach(input => {
        respuestas.push({
          preguntaId: input.name.replace('resp-', ''),
          respuesta: parseInt(input.value, 10)
        });
      });
  
      const comentarios = document.getElementById('comentarios').value.trim();
  
      return { informacionAcademica, respuestas, comentarios };
    },
  
    /**
     * Envía la evaluación a la API.
     * @param {string} formType - El tipo de formulario (ej: 'estudiante').
     * @param {Object} data - Los datos recopilados por FormUtils.recopilarDatos().
     * @param {string} apiUrl - La URL base de la API.
     * @returns {Promise} - La promesa de la petición fetch.
     */
    enviarEvaluacion: (formType, data, apiUrl) => {
      return fetch(`${apiUrl}/evaluations/${formType}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
    },
    
    // Aquí se podrían añadir también las funciones para poblar los selectores en cascada.
  };