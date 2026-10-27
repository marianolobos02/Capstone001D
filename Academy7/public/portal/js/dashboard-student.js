/* Academy7 Estudiante view. */

function renderStudentHome() {
  const username = currentUser.username;
  const courses = getStudentCourses(username);
  const events = getStudentEvents(username);
  const grades = getStudentGrades(username);
  const attendance = getStudentAttendance(username);
  const warnings = getStudentWarnings(username);
  const messages = getMessages(username);
  const noLeidos = messages.filter((message) => !message.leido).length;
  const averageGrade = getStudentAverage(username);

  content.innerHTML = `
    ${renderSectionIntro("Panel del estudiante", ROLE_CONFIG.estudiante.description, `Año escolar 2026 · ${currentUser.nivel} · ${currentUser.curso}`)}
    <div class="role-banner student-banner">
      <div><span class="eyebrow inverse">Tu avance este año</span><h3>Hola, ${escapeHTML(fullNameFirst(currentUser.nombre))}</h3><p>Tu asistencia general es ${attendance.percent}%. Sigue revisando tus evaluaciones y actividades próximas.</p></div>
      <div class="attendance-ring" style="--percent:${attendance.percent}%"><strong>${attendance.percent}%</strong><small>asistencia</small></div>
    </div>
    <div class="home-grid">
      <div class="panel">
        <div class="panel-heading"><h3>Próximos eventos</h3><button class="text-button" data-go="calendario">Ver todo →</button></div>
        ${renderEvents(events)}
      </div>
      <div class="mini-stack">
        ${renderMiniStat(courses.length, "Cursos registrados este año", "gold")}
        ${renderMiniStat(averageGrade, "Promedio general actual", "navy")}
        ${renderMiniStat(noLeidos, "Mensajes sin leer", noLeidos ? "brick" : "green")}
      </div>
    </div>
    <div class="quick-panels">
      <div class="panel"><div class="panel-heading"><h3>Asistencia</h3><button class="text-button" data-go="asistencia">Detalle →</button></div>${renderProgress(attendance.percent, `${attendance.attended} de ${attendance.total} clases asistidas`)}<div class="inline-metrics"><span><b>${attendance.absences}</b> inasistencias</span><span><b>${attendance.late}</b> atrasos</span></div></div>
      <div class="panel"><div class="panel-heading"><h3>Estado académico</h3><button class="text-button" data-go="notas">Ver notas →</button></div><div class="status-overview"><span class="status-number">${grades.length}</span><span>evaluaciones registradas<br><small>${warnings.length ? `${warnings.length} amonestación(es) en seguimiento` : "Sin amonestaciones registradas"}</small></span></div></div>
    </div>
  `;
  bindGoButtons();
}


