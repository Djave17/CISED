(function(window){
  const ID = 'alerta-flotante-global';

  function ensureContainer() {
    let alerta = document.getElementById(ID);
    if (!alerta) {
      alerta = document.createElement('div');
      alerta.id = ID;
      alerta.className = 'alerta-flotante';
      const span = document.createElement('span');
      span.className = 'mensaje-alerta';
      alerta.appendChild(span);
      document.body.appendChild(alerta);
    }
    return alerta;
  }

  function mostrarAlerta(mensaje, tipo = 'info', durationMs = 3000) {
    const alerta = ensureContainer();
    // Resetear clases a formato previo
    alerta.classList.remove('exito', 'error', 'info', 'visible');
    alerta.classList.add(tipo);
    alerta.querySelector('.mensaje-alerta').textContent = mensaje;

    // Mostrar con la clase 'visible' que maneja el CSS existente
    requestAnimationFrame(() => alerta.classList.add('visible'));

    clearTimeout(mostrarAlerta._t);
    mostrarAlerta._t = setTimeout(() => {
      alerta.classList.remove('visible');
    }, durationMs);
  }

  // Helpers estilo dashboard conservando el formato previo (clases CSS)
  function success(msg, ms) { mostrarAlerta(msg, 'exito', ms); }
  function error(msg, ms) { mostrarAlerta(msg, 'error', ms); }
  function info(msg, ms) { mostrarAlerta(msg, 'info', ms); }

  window.UI = { mostrarAlerta, success, error, info };
})(window);
