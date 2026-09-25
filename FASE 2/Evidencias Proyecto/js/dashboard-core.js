/* Academy7 shared navigation and non-role-specific sections. */

function renderPerfil() {
  setGreeting("Mi perfil");
  const subtitle = roleKey === "docente" ? "Información profesional y datos de contacto institucional." : roleKey === "apoderado" ? "Tus datos de contacto y estudiantes asociados." : "Tu información como estudiante del colegio.";
  const extraInfo = roleKey === "docente"
    ? `<div class="info-item"><div class="k">Departamento</div><div class="v">${escapeHTML(currentUser.departamento)}</div></div><div class="info-item"><div class="k">Teléfono</div><div class="v">${escapeHTML(currentUser.telefono)}</div></div>`
    : roleKey === "apoderado"
      ? `<div class="info-item"><div class="k">Teléfono</div><div class="v">${escapeHTML(currentUser.telefono)}</div></div><div class="info-item"><div class="k">Dirección</div><div class="v">${escapeHTML(currentUser.direccion)}</div></div>`
      : `<div class="info-item"><div class="k">Nivel</div><div class="v">${escapeHTML(currentUser.nivel)}</div></div><div class="info-item"><div class="k">Curso</div><div class="v">${escapeHTML(currentUser.curso)}</div></div>`;

  content.innerHTML = `
    ${renderSectionIntro(`Cuenta ${currentUser.rol}`, "Mi perfil", subtitle)}
    <div class="panel profile-panel">
      <div class="profile-header">
        <div class="avatar large role-${roleKey}">${escapeHTML(currentUser.iniciales)}</div>
        <div><h2>${escapeHTML(currentUser.nombre)}</h2><div class="role">${escapeHTML(currentUser.rol)}${currentUser.curso ? ` · ${escapeHTML(currentUser.curso)}` : ""}</div></div>
        <span class="profile-status">Cuenta activa</span>
      </div>
      <div class="info-grid">
        <div class="info-item"><div class="k">RUT</div><div class="v">${escapeHTML(currentUser.rut)}</div></div>
        <div class="info-item"><div class="k">Correo institucional</div><div class="v">${escapeHTML(currentUser.correo)}</div></div>
        ${extraInfo}
      </div>
    </div>
    ${roleKey === "apoderado" ? `<div class="panel section-panel-gap"><div class="panel-heading"><h3>Personas a tu cargo</h3><button class="text-button" data-go="hijos">Ver estudiantes →</button></div><div class="linked-children">${getStudentChildren(currentUser.username).map((child) => `<div class="linked-child"><span class="avatar small">${escapeHTML(child.iniciales)}</span><div><strong>${escapeHTML(child.nombre)}</strong><small>${escapeHTML(child.curso)} · ${escapeHTML(child.nivel)}</small></div></div>`).join("")}</div></div>` : ""}
  `;
  bindGoButtons();
}

// ---------- Cursos ----------

function renderCursos() {
  if (roleKey === "docente") return renderTeacherCourses();
  setGreeting("Mis cursos");
  const courses = getStudentCourses(currentUser.username);
  content.innerHTML = `
    ${renderSectionIntro("Año escolar 2026", "Mis cursos", `Asignaturas registradas en ${escapeHTML(currentUser.nivel)} · ${escapeHTML(currentUser.curso)}.`)}
    <div class="course-grid">
      ${courses.map((course) => `
        <div class="course-card student-course-card">
          <span class="course-kicker">Asignatura</span>
          <h4>${escapeHTML(course.nombre)}</h4>
          <div class="teacher">${escapeHTML(course.profesor)}</div>
          <div class="meta"><span>${escapeHTML(course.sala)}</span><span>${escapeHTML(course.horario)}</span></div>
        </div>
      `).join("")}
    </div>
  `;
}


function renderHorario() {
  setGreeting(roleKey === "docente" ? "Horario de clases" : "Mi horario");
  if (roleKey === "docente") {
    const courses = getTeacherCourses(currentUser.username);
    const schedule = getTeacherSchedule(currentUser.username);
    const classBlocks = courses.reduce((total, course) => total + (course.horarioDetalle || []).length, 0);
    content.innerHTML = `
      ${renderSectionIntro("Agenda docente", "Horario de clases", "Consulta cada clase que impartes y su bloque semanal, separado por curso.")}
      <div class="detail-stat-grid three-col">
        ${renderMiniStat(courses.length, "Clases asignadas", "gold")}
        ${renderMiniStat(classBlocks, "Bloques semanales", "navy")}
        ${renderMiniStat(schedule.length, "Días con clases", "green")}
      </div>
      <div class="panel section-panel-gap teacher-course-schedule-panel">
        <div class="panel-heading"><div><h3>Horario por clase</h3><p class="panel-caption">Cada tarjeta corresponde a un curso que impartes.</p></div><span class="table-note">Año escolar 2026</span></div>
        ${renderTeacherCourseSchedules(courses)}
      </div>
      <div class="panel section-panel-gap">
        <div class="panel-heading"><div><h3>Resumen semanal</h3><p class="panel-caption">Vista agrupada de todos tus bloques de clases.</p></div></div>
        <div class="schedule-panel">${renderSchedule(schedule)}</div>
      </div>
    `;
    return;
  }
  const username = currentUser.username;
  content.innerHTML = `
    ${renderSectionIntro("Año escolar 2026", "Mi horario", `Horario semanal de ${escapeHTML(currentUser.curso)} · ${escapeHTML(currentUser.nivel)}.`)}
    <div class="panel schedule-panel">${renderSchedule(getStudentSchedule(username))}</div>
  `;
}

function renderCalendario() {
  setGreeting("Calendario");
  let events;
  let description;
  if (roleKey === "docente") {
    events = getTeacherEvents(currentUser.username).filter((event) => event.tipo === "evaluacion");
    description = "Evaluaciones por semestre según el nivel del curso, dentro del calendario escolar de lunes a viernes.";
  } else {
    const child = getContextStudent();
    events = child ? getStudentEvents(child.username) : [];
    description = roleKey === "apoderado" ? `Actividades y comunicaciones de ${child ? child.nombre : "tu hijo/a"}.` : "Pruebas, entregas y actividades programadas.";
  }
  content.innerHTML = `
    ${renderSectionIntro(roleKey === "docente" ? "Agenda docente" : roleKey === "apoderado" ? "Agenda familiar" : "Agenda escolar", "Calendario", description)}
    ${roleKey === "apoderado" ? renderChildPicker(getStudentChildren(currentUser.username)) : ""}
    <div class="panel">${roleKey === "docente" ? renderTeacherEvaluationCalendar(events, db.schoolCalendar) : `<div class="calendar-list full-calendar-list">${events.map((event) => `<div class="cal-row"><div class="cal-date"><div class="day">${escapeHTML(event.dia)}</div><div class="mon">${escapeHTML(event.mes)}</div></div><div class="cal-info"><h4>${escapeHTML(event.titulo)}</h4><p>${escapeHTML(event.detalle)}</p></div></div>`).join("") || `<div class="empty-state"><div class="glyph">·</div>No hay eventos programados.</div>`}</div>`}</div>
  `;
  if (roleKey === "apoderado") bindChildPicker();
}

// ---------- Calificaciones, asistencia y amonestaciones ----------

function renderNotas() {
  setGreeting("Calificaciones");
  const username = getContextUsername();
  const student = getContextStudent();
  const grades = username ? getStudentGrades(username) : [];
  const gradeAverage = username ? getStudentAverage(username) : "—";
  content.innerHTML = `
    ${renderSectionIntro(roleKey === "apoderado" ? "Seguimiento familiar" : "Rendimiento académico", "Calificaciones", roleKey === "apoderado" ? `Notas registradas de ${student ? escapeHTML(student.nombre) : "tu hijo/a"}.` : "Calificaciones registradas durante el año escolar 2026.")}
    ${roleKey === "apoderado" ? renderChildPicker(getStudentChildren(currentUser.username)) : ""}
    <div class="detail-stat-grid three-col"><div class="panel"><div class="stat-highlight"><strong>${gradeAverage}</strong><span>promedio general</span></div></div><div class="panel"><div class="stat-highlight"><strong>${grades.length}</strong><span>evaluaciones registradas</span></div></div><div class="panel"><div class="stat-highlight"><strong>${grades.filter((grade) => grade.nota < 4).length}</strong><span>evaluaciones insuficientes</span></div></div></div>
    <div class="panel section-panel-gap"><div class="responsive-table"><table class="data-table"><thead><tr><th>Asignatura</th><th>Evaluación</th><th>Nota</th><th>Estado</th></tr></thead><tbody>${grades.map((grade) => `<tr><td><strong>${escapeHTML(grade.curso)}</strong></td><td>${escapeHTML(grade.evaluacion)}</td><td><strong class="grade-emphasis">${Number(grade.nota).toFixed(1)}</strong></td><td>${pillForGrade(grade.estado)}</td></tr>`).join("") || `<tr><td colspan="4" class="table-empty">No hay calificaciones registradas.</td></tr>`}</tbody></table></div></div>
  `;
  if (roleKey === "apoderado") bindChildPicker();
}

function renderAsistencia() {
  setGreeting("Asistencia");
  const username = getContextUsername();
  const student = getContextStudent();
  const attendance = username ? getStudentAttendance(username) : { percent: 0, total: 0, attended: 0, absences: 0, late: 0, byCourse: [] };
  content.innerHTML = `
    ${renderSectionIntro(roleKey === "apoderado" ? "Seguimiento familiar" : "Registro escolar", "Asistencia", roleKey === "apoderado" ? `Porcentaje de clases asistidas de ${student ? escapeHTML(student.nombre) : "tu hijo/a"}.` : "Tu porcentaje de clases asistidas y detalle por asignatura.")}
    ${roleKey === "apoderado" ? renderChildPicker(getStudentChildren(currentUser.username)) : ""}
    <div class="attendance-overview panel"><div class="attendance-score"><div class="attendance-ring large-ring" style="--percent:${attendance.percent}%"><strong>${attendance.percent}%</strong><small>asistencia</small></div><div><span class="eyebrow">Resumen anual</span><h3>${attendance.attended} de ${attendance.total} clases asistidas</h3><p>${attendance.percent >= 90 ? "Tu asistencia se encuentra en un rango favorable." : "Revisa tus inasistencias y justificaciones con el colegio."}</p></div></div><div class="attendance-metrics"><div><strong>${attendance.absences}</strong><span>Inasistencias</span></div><div><strong>${attendance.late}</strong><span>Atrasos</span></div><div><strong>${attendance.total}</strong><span>Clases registradas</span></div></div></div>
    <div class="panel section-panel-gap"><div class="panel-heading"><h3>Asistencia por asignatura</h3><span class="table-note">Porcentaje de clases asistidas</span></div><div class="responsive-table"><table class="data-table"><thead><tr><th>Asignatura</th><th>Clases asistidas</th><th>Porcentaje</th><th>Avance</th></tr></thead><tbody>${attendance.byCourse.map((item) => `<tr><td><strong>${escapeHTML(item.curso)}</strong></td><td>${escapeHTML(item.asistidas)}</td><td><strong>${item.porcentaje}%</strong></td><td><div class="table-progress wide"><i><b style="width:${item.porcentaje}%"></b></i></div></td></tr>`).join("") || `<tr><td colspan="4" class="table-empty">No hay detalle por asignatura.</td></tr>`}</tbody></table></div></div>
  `;
  if (roleKey === "apoderado") bindChildPicker();
}

function renderAmonestaciones() {
  setGreeting("Amonestaciones");
  if (roleKey === "docente") return renderTeacherWarnings();
  const username = getContextUsername();
  const student = getContextStudent();
  const warnings = username ? getStudentWarnings(username) : [];
  content.innerHTML = `
    ${renderSectionIntro(roleKey === "apoderado" ? "Seguimiento formativo" : "Convivencia escolar", "Amonestaciones", roleKey === "apoderado" ? `Registro de observaciones y amonestaciones de ${student ? escapeHTML(student.nombre) : "tu hijo/a"}.` : "Revisa el estado de tus observaciones formativas y académicas.")}
    ${roleKey === "apoderado" ? renderChildPicker(getStudentChildren(currentUser.username)) : ""}
    <div class="warning-summary ${warnings.length ? "has-warnings" : "clear-warnings"}"><span class="warning-icon">${warnings.length ? "!" : "✓"}</span><div><strong>${warnings.length ? `${warnings.length} registro(s) requieren seguimiento` : "Sin amonestaciones registradas"}</strong><p>${warnings.length ? "Si necesitas más información, comunícate con el profesor jefe o convivencia escolar." : "El estudiante mantiene un registro formativo sin observaciones pendientes."}</p></div></div>
    <div class="warning-list">${warnings.map((warning) => `<article class="warning-card"><div class="warning-card-top"><span class="eyebrow">${escapeHTML(warning.fecha)}</span>${renderPill(warning.estado, warning.estado === "Pendiente" ? "brick" : "gold")}</div><h3>${escapeHTML(warning.tipo)}</h3><div class="warning-course">${escapeHTML(warning.curso)}</div><p>${escapeHTML(warning.detalle)}</p></article>`).join("") || `<div class="panel empty-state"><div class="glyph">✓</div>No existen registros para mostrar.</div>`}</div>
  `;
  if (roleKey === "apoderado") bindChildPicker();
}


function renderMensajes() {
  if (roleKey === "docente") return renderTeacherMessages();
  setGreeting("Mensajes");
  const messages = getMessages(currentUser.username);
  content.innerHTML = `
    ${renderSectionIntro("Comunicaciones", "Mensajes", "Comunicaciones de profesores y del colegio.")}
    <div class="msg-layout">
      <div class="msg-list" id="msgList">${messages.map((message, index) => `<button class="msg-item" data-index="${index}"><div class="from"><span>${escapeHTML(message.de)}</span>${!message.leido ? '<span class="dot-unread"></span>' : ""}</div><div class="preview">${escapeHTML(message.asunto)}</div></button>`).join("") || `<div class="empty-state"><div class="glyph">·</div>No tienes mensajes nuevos.</div>`}</div>
      <div class="msg-detail" id="msgDetail"><div class="empty-state"><div class="glyph">·</div>Selecciona un mensaje para leerlo.</div></div>
    </div>
  `;
  const items = content.querySelectorAll(".msg-item");
  items.forEach((button) => {
    button.addEventListener("click", () => {
      const index = Number(button.dataset.index);
      const message = messages[index];
      message.leido = true;
      db.messages[currentUser.username] = messages;
      persistDatabase(db);
      items.forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      button.querySelector(".dot-unread")?.remove();
      document.getElementById("msgDetail").innerHTML = `<h3>${escapeHTML(message.asunto)}</h3><div class="meta">De: ${escapeHTML(message.de)} · ${escapeHTML(message.fecha)}</div><div class="body">${escapeHTML(message.cuerpo).replace(/\n/g, "<br>")}</div>`;
    });
  });
}

function bindGoButtons() {
  document.querySelectorAll("[data-go]").forEach((button) => {
    button.addEventListener("click", () => goToSection(button.dataset.go));
  });
}

const sections = {
  inicio: renderInicio,
  perfil: renderPerfil,
  cursos: renderCursos,
  horario: renderHorario,
  calendario: renderCalendario,
  notas: renderNotas,
  asistencia: renderAsistencia,
  amonestaciones: renderAmonestaciones,
  hijos: renderHijos,
  mensajes: renderMensajes
};

function goToSection(name) {
  document.querySelectorAll(".nav-link").forEach((button) => {
    button.classList.toggle("active", button.dataset.section === name);
  });
  (sections[name] || renderInicio)();
  document.getElementById("sidebar").classList.remove("open");
  window.scrollTo(0, 0);
}

document.getElementById("logoutBtn").addEventListener("click", async () => {
  try {
    await window.Academy7Firebase?.signOut?.();
  } catch (error) {
    console.warn("Academy7: no se pudo cerrar la sesión de Firebase.", error);
  }
  clearSession();
  window.location.href = "index.html";
});

document.getElementById("mobileToggle").addEventListener("click", () => {
  document.getElementById("sidebar").classList.toggle("open");
});

initTopbar();
goToSection("inicio");
