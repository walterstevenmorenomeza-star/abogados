// servicios.js — robusto: DOMContentLoaded, delegación de click, hover seguro y logs
document.addEventListener('DOMContentLoaded', () => {
  console.log('servicios.js: DOM listo');

  const container = document.querySelector('.grid-servicios');
  if (!container) {
    console.error('servicios.js: No se encontró .grid-servicios. Verifica el HTML y la clase.');
    return;
  }

  const servicios = Array.from(container.querySelectorAll('.servicio'));
  console.log('servicios.js: servicios encontrados =', servicios.length);

  if (!servicios.length) {
    console.warn('servicios.js: no hay elementos .servicio dentro de .grid-servicios.');
    return;
  }

  // Config
  const HOVER_OPEN_DELAY = 120;
  const HOVER_CLOSE_DELAY = 220;
  const DEBOUNCE_MS = 160;
  let lastToggle = 0;
  const hoverOpenTimers = new Map();
  const hoverCloseTimers = new Map();

  // Detecta soporte hover (mouse)
  const supportsHover = window.matchMedia && window.matchMedia('(hover: hover)').matches;
  console.log('servicios.js: soporte hover =', supportsHover);

  // Inicialización accesibilidad y estilos necesarios
  servicios.forEach((s, i) => {
    s.setAttribute('tabindex', '0');
    s.setAttribute('role', 'button');
    s.setAttribute('aria-expanded', 'false');
    // Si el .contenido existe, fijamos estilos base (si aún no los tiene)
    const contenido = s.querySelector('.contenido');
    if (contenido) {
      contenido.style.overflow = 'hidden';
      if (!contenido.style.maxHeight) contenido.style.maxHeight = '0px';
      contenido.style.transition = 'max-height 420ms ease, opacity 220ms ease';
      contenido.style.opacity = '0';
    }
    // debug id para identificar en consola
    s.dataset._idx = i;
  });

  // helpers
  function getContenido(s) { return s.querySelector('.contenido'); }
  function getTitle(s) { const h = s.querySelector('h2'); return h ? h.textContent.trim() : `servicio[${s.dataset._idx}]`; }

  function abrir(s) {
    const now = Date.now();
    if (now - lastToggle < DEBOUNCE_MS) return;
    lastToggle = now;

    // cerrar los demás
    servicios.forEach(x => { if (x !== s) cerrar(x); });

    s.classList.add('activa');
    s.setAttribute('aria-expanded', 'true');

    const contenido = getContenido(s);
    if (contenido) {
      contenido.style.display = 'block';
      const h = contenido.scrollHeight;
      contenido.style.maxHeight = h + 'px';
      contenido.style.opacity = '1';
      // después liberamos maxHeight para permitir contenido dinámico
      setTimeout(() => { if (s.classList.contains('activa')) contenido.style.maxHeight = 'none'; }, 480);
    }
    // smooth scroll para centrar la tarjeta
    try { s.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (err) {}
    console.log('abrir ->', getTitle(s));
  }

  function cerrar(s) {
    const contenido = getContenido(s);
    s.classList.remove('activa');
    s.setAttribute('aria-expanded', 'false');

    if (!contenido) {
      console.log('cerrar (sin contenido) ->', getTitle(s));
      return;
    }

    // si maxHeight es 'none', fijarlo para animar
    if (contenido.style.maxHeight === 'none') {
      contenido.style.maxHeight = contenido.scrollHeight + 'px';
      /* reflow */ contenido.offsetHeight;
    }
    contenido.style.maxHeight = '0px';
    contenido.style.opacity = '0';
    // opcional: tras la animación limpiar display (para evitar ocupar espacio)
    setTimeout(() => {
      if (contenido.style.maxHeight === '0px') contenido.style.display = '';
    }, 520);

    console.log('cerrar ->', getTitle(s));
  }

  function toggle(s) {
    if (s.classList.contains('activa')) cerrar(s);
    else abrir(s);
  }

  // Delegación de click sobre el contenedor: funciona aunque se agreguen elementos
  container.addEventListener('click', (e) => {
    const servicio = e.target.closest('.servicio');
    if (!servicio || !container.contains(servicio)) return;

    // evita togglear si se hizo click en un enlace o control interno
    const tag = e.target.tagName.toLowerCase();
    if (['a', 'button', 'input', 'select', 'label'].includes(tag)) {
      console.log('servicios.js: click sobre control interno, ignorando toggle');
      return;
    }

    toggle(servicio);
  });

  // Teclado en cada tarjeta
  servicios.forEach(s => {
    s.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(s); }
      if (e.key === 'Escape') { cerrar(s); s.blur(); }
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); focusNext(s); }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); focusPrev(s); }
    });
  });

  // Hover: solo si el dispositivo soporta hover
  if (supportsHover) {
    servicios.forEach(s => {
      s.addEventListener('mouseenter', () => {
        if (hoverCloseTimers.has(s)) { clearTimeout(hoverCloseTimers.get(s)); hoverCloseTimers.delete(s); }
        const t = setTimeout(() => abrir(s), HOVER_OPEN_DELAY);
        hoverOpenTimers.set(s, t);
      });
      s.addEventListener('mouseleave', () => {
        if (hoverOpenTimers.has(s)) { clearTimeout(hoverOpenTimers.get(s)); hoverOpenTimers.delete(s); }
        const t = setTimeout(() => cerrar(s), HOVER_CLOSE_DELAY);
        hoverCloseTimers.set(s, t);
      });
    });
  }

  // focus next/prev helpers
  function focusNext(curr) { const i = servicios.indexOf(curr); servicios[(i+1)%servicios.length].focus(); }
  function focusPrev(curr) { const i = servicios.indexOf(curr); servicios[(i-1+servicios.length)%servicios.length].focus(); }

  // click fuera cierra todo
  document.addEventListener('click', (e) => { if (!container.contains(e.target)) servicios.forEach(s => cerrar(s)); });

  // ESC global
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') servicios.forEach(s => cerrar(s)); });

  // inicializa tarjetas que ya están con .activa
  servicios.forEach(s => {
    if (s.classList.contains('activa')) {
      s.setAttribute('aria-expanded','true');
      const c = getContenido(s);
      if (c) c.style.maxHeight = 'none';
    }
  });

  console.log('servicios.js: listo ✔');
});
