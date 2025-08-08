(function(window){
  function mostrarAlerta(mensaje, tipo = 'error') {
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
    requestAnimationFrame(() => alerta.classList.add('visible'));
    clearTimeout(mostrarAlerta._t);
    mostrarAlerta._t = setTimeout(() => alerta.classList.remove('visible'), 3000);
  }
  window.UI = { mostrarAlerta };
})(window);
