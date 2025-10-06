const formulario = document.getElementById('formularioCita');

formulario.addEventListener('submit', e => {
  e.preventDefault();

  const nombres = document.getElementById('nombres').value.trim();
  const apellidos = document.getElementById('apellidos').value.trim();
  const correo = document.getElementById('correo').value.trim();
  const telefono = document.getElementById('telefono').value.trim();
  const fechaInput = document.getElementById('fecha').value;
  const horaInput = document.getElementById('hora').value;

  // ====== Validación AM/PM ======
  if (horario === 'a.m' || horario === 'am') horario = 'AM';
  else if (horario === 'p.m' || horario === 'pm') horario = 'PM';
  else horario = '';

  // ====== Fecha segura (sin desfase UTC) ======
  let fechaFormateada = '';
  if (fechaInput) {
    // dividir yyyy-mm-dd manualmente para evitar error en GitHub Pages
    const [año, mes, dia] = fechaInput.split('-');
    fechaFormateada = `${dia}/${mes}/${año}`;
  }

  // ====== Hora formateada ======
  let horaFormateada = '';
  if (horaInput) {
    const [horasStr, minutos] = horaInput.split(':');
    let horas = parseInt(horasStr);
    let sufijo = horario || (horas >= 12 ? 'PM' : 'AM');
    if (horas > 12) horas -= 12;
    if (horas === 0) horas = 12;
    horaFormateada = `${horas}:${minutos} ${sufijo}`;
  }

  // ====== Objeto a enviar ======
  const datos = {
    nombre: nombres,
    apellido: apellidos,
    correo: correo,
    telefono: telefono,
    fecha: fechaFormateada,
    hora: horaFormateada,
    horario: horario
  };

  // ====== Enviar a SheetBest ======
  fetch("https://api.sheetbest.com/sheets/ea2d4883-550d-4c6d-8fc2-6af289f61a0e", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos)
  })
  .then(res => res.json())
  .then(() => {
    alert("✅ Cita agendada correctamente.");
    formulario.reset();
  })
  .catch(err => {
    alert("❌ Error al enviar los datos. Intenta nuevamente.");
    console.error("Error:", err);
  });
});
