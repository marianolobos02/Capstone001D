/* Academy7 Docente view: courses, attendance, grades, warnings and messages. */

function renderTeacherHome() {
  const courses = getTeacherCourses(currentUser.username);
  const events = getTeacherEvents(currentUser.username);
  const students = courses.flatMap((course) => course.students);
  const warnings = getTeacherWarnings(currentUser.username);
  const courseAverage = average(students.map((student) => student.promedio));

  content.innerHTML = `
    ${renderSectionIntro("Panel docente", ROLE_CONFIG.docente.description, "Organiza tus clases y realiza seguimiento de cada estudiante.")}
    <div class="role-banner teacher-banner">
      <div><span class="eyebrow inverse">Vista de gestión académica</span><h3>Tu jornada, tus cursos, tu seguimiento</h3><p>Consulta rápidamente el estado de tus ${courses.length} cursos y registra el acompañamiento que necesita cada estudiante.</p></div>
      <div class="banner-mark">${courses.length}</div>
    </div>
    <div class="home-grid">
      <div class="panel">
        <div class="panel-heading"><h3>Próximos compromisos</h3><button class="text-button" data-go="calendario">Ver calendario →</button></div>
        ${renderEvents(events)}
      </div>
      <div class="mini-stack">
        ${renderMiniStat(courses.length, "Cursos a cargo", "gold")}
        ${renderMiniStat(students.length, "Estudiantes registrados", "navy")}
        ${renderMiniStat(warnings.length, "Amonestaciones por revisar", warnings.length ? "brick" : "green")}
      </div>
    </div>
    <div class="panel section-panel-gap">
      <div class="panel-heading"><div><h3>Resumen de cursos</h3><p class="panel-caption">Promedio general de tus estudiantes: <strong>${courseAverage}</strong></p></div><button class="text-button" data-go="cursos">Gestionar cursos →</button></div>
      <div class="course-summary-list">
        ${courses.map((course) => `
          <button class="course-summary-row" data-course-id="${course.id}">
            <span class="course-summary-main"><strong>${escapeHTML(course.nombre)}</strong><small>${escapeHTML(course.curso)} · ${escapeHTML(course.horario)}</small></span>
            <span class="course-summary-meta"><b>${course.students.length}</b><small>alumnos</small></span>
            <span class="course-summary-meta"><b>${average(course.students.map((student) => student.promedio))}</b><small>promedio</small></span>
            <span class="course-summary-arrow">→</span>
          </button>
        `).join("")}
      </div>
    </div>
  `;
  bindGoButtons();
  document.querySelectorAll(".course-summary-row").forEach((button) => {
    button.addEventListener("click", () => renderTeacherCourseDetail(button.dataset.courseId));
  });
}


function renderTeacherCourses() {
  setGreeting("Mis cursos");
  const courses = getTeacherCourses(currentUser.username);
  content.innerHTML = `
    ${renderSectionIntro("Gestión docente", "Mis cursos", "Cada curso contiene su lista de alumnos, calificaciones, asistencia y amonestaciones.")}
    <div class="course-grid teacher-course-grid">
      ${courses.map((course) => {
        const courseWarnings = course.students.reduce((total, student) => total + student.amonestaciones, 0);
        return `
          <div class="course-card teacher-course-card">
            <div class="course-card-top"><span class="course-kicker">Curso a cargo</span>${courseWarnings ? renderPill(`${courseWarnings} amonestaciones`, "brick") : renderPill("Sin alertas", "green")}</div>
            <h4>${escapeHTML(course.nombre)}</h4>
            <div class="teacher">${escapeHTML(course.curso)} · ${escapeHTML(course.sala)}</div>
            <div class="course-teacher-meta"><span><b>${course.students.length}</b> alumnos</span><span><b>${average(course.students.map((student) => student.promedio))}</b> promedio</span></div>
            <div class="course-card-footer"><span>${escapeHTML(course.horario)}</span><button class="btn-outline" data-course-id="${course.id}">Ver gestión →</button></div>
          </div>
        `;
      }).join("")}
    </div>
  `;
  document.querySelectorAll(".teacher-course-card .btn-outline").forEach((button) => {
    button.addEventListener("click", () => renderTeacherCourseDetail(button.dataset.courseId));
  });
}

function getCourseAttendanceRecords(course) {
  return Array.isArray(course.attendanceRecords) ? course.attendanceRecords : [];
}

async function hydrateCourseAttendance(course) {
  if (!window.Academy7Firebase?.isAvailable?.()) return;
  try {
    const remoteRecords = await window.Academy7Firebase.loadCourseAttendance(currentUser.username, course.id);
    if (!remoteRecords.length) return;
    course.attendanceRecords = remoteRecords;
    course.students.forEach((student) => {
      student.asistencia = getStudentCourseAttendance(course, student);
    });
    persistDatabase(db);
    refreshCourseSummaryStats(course);
    course.students.forEach((student) => refreshCourseStudentRows(course, student));
    const attendancePanel = document.getElementById("courseAttendancePanel");
    if (attendancePanel) {
      const count = attendancePanel.querySelector(".attendance-session-count");
      if (count) count.textContent = `${remoteRecords.length} clase(s) registradas`;
    }
  } catch (error) {
    console.warn("Academy7: no se pudo leer asistencia desde Firestore; se conserva el respaldo local.", error);
  }
}

async function hydrateCourseStudents(course) {
  if (!window.Academy7Firebase?.isAvailable?.() || !window.Academy7Firebase.loadCourseStudents) return;
  try {
    const remoteStudents = await window.Academy7Firebase.loadCourseStudents(currentUser.username, course.id);
    let changed = false;
    remoteStudents.forEach((remoteStudent) => {
      const localStudent = course.students.find((student) => student.username === remoteStudent.username);
      if (!localStudent) {
        course.students.push(remoteStudent);
        changed = true;
        return;
      }
      const before = JSON.stringify(localStudent);
      Object.assign(localStudent, remoteStudent);
      delete localStudent.id;
      if (JSON.stringify(localStudent) !== before) changed = true;
    });
    if (!changed) return;
    persistDatabase(db);
    course.students.forEach((student) => refreshCourseStudentRows(course, student));
    refreshCourseSummaryStats(course);
  } catch (error) {
    console.warn("Academy7: no se pudieron leer estudiantes desde Firestore; se conserva el respaldo local.", error);
  }
}

function getStudentCourseAttendance(course, student) {
  const records = getCourseAttendanceRecords(course)
    .map((session) => session.records?.[student.username])
    .filter(Boolean);
  // La asistencia del curso depende exclusivamente de las clases registradas.
  // Nunca se reutiliza el promedio agregado del estudiante, evitando que
  // guardar una nota cambie accidentalmente el porcentaje de asistencia.
  if (!records.length) return 0;
  const attended = records.filter((status) => status === "presente" || status === "justificado").length;
  return Math.round((attended / records.length) * 100);
}

function refreshCourseSummaryStats(course) {
  const gradeStat = document.querySelector("#courseAverageStat .num");
  const attendanceStat = document.querySelector("#courseAttendanceStat .num");
  const gradeAverage = average(course.students.map((student) => student.promedio));
  const attendanceAverage = average(course.students.map((student) => getStudentCourseAttendance(course, student)));
  if (gradeStat) gradeStat.textContent = gradeAverage;
  if (attendanceStat) attendanceStat.textContent = `${attendanceAverage === "—" ? 0 : attendanceAverage}%`;
}

function attendanceStatusLabel(status) {
  return ({ presente: "Presente", ausente: "Ausente", justificado: "Justificado" })[status] || "Sin registrar";
}

function renderCourseAttendanceTaking(course) {
  const records = getCourseAttendanceRecords(course);
  const selectedDate = courseAttendanceDateState[course.id] || records[records.length - 1]?.fecha || new Date().toISOString().slice(0, 10);
  const currentSession = records.find((session) => session.fecha === selectedDate);
  return `
    <div class="panel attendance-taking-panel section-panel-gap" id="courseAttendancePanel">
      <div class="panel-heading"><div><span class="eyebrow">Registro de asistencia</span><h3>Lista del día: ${escapeHTML(formatAttendanceDate(selectedDate))}</h3><p class="panel-caption">Selecciona una fecha y marca a cada estudiante como Presente, Ausente o Justificado.</p></div><span class="attendance-session-count">${records.length} clase(s) registradas</span></div>
      <form id="courseAttendanceForm" class="course-attendance-form" novalidate>
        <div class="attendance-session-toolbar"><label><span>Fecha de la clase</span><input type="date" name="fecha" value="${selectedDate}" required></label><div class="attendance-legend"><span class="status-dot presente"></span>Presente <span class="status-dot ausente"></span>Ausente <span class="status-dot justificado"></span>Justificado</div></div>
        <div class="responsive-table"><table class="data-table attendance-taking-table"><thead><tr><th>Estudiante</th><th>Estado de esta clase</th></tr></thead><tbody>${course.students.map((student) => { const status = currentSession?.records?.[student.username] || "presente"; return `<tr><td><div class="person-cell"><span class="avatar tiny">${escapeHTML(getInitials(student.nombre))}</span><div><strong>${escapeHTML(student.nombre)}</strong><small>${escapeHTML(student.username)}</small></div></div></td><td><div class="attendance-status-options">${["presente", "ausente", "justificado"].map((option) => `<label class="attendance-option ${option} ${status === option ? "selected" : ""}"><input type="radio" name="status-${student.username}" value="${option}" ${status === option ? "checked" : ""} required><span>${attendanceStatusLabel(option)}</span></label>`).join("")}</div></td></tr>`; }).join("")}</tbody></table></div>
        <div class="attendance-form-footer"><span class="save-feedback" id="attendanceSessionFeedback"></span><button type="submit" class="btn-primary compact-button">Guardar asistencia del día</button></div>
      </form>
    </div>
  `;
}

function renderCourseGradesOverview(course) {
  return `<div class="panel section-panel-gap course-management-panel" id="courseGradesPanel"><div class="panel-heading"><div><span class="eyebrow">Calificaciones</span><h3>Notas del curso</h3><p class="panel-caption">Registra cada evaluación cuando corresponda. Las notas vacías no bloquean el guardado y no se consideran en el promedio.</p></div></div><div class="responsive-table"><table class="data-table inline-grades-table"><thead><tr><th>Estudiante</th><th>Prueba 1</th><th>Prueba 2</th><th>Prueba 3</th><th>Examen</th><th>Promedio</th><th></th></tr></thead><tbody>${course.students.map((student) => { const grades = student.evaluaciones || {}; return `<tr data-grade-student="${escapeHTML(student.username)}"><td><div class="person-cell"><span class="avatar tiny">${escapeHTML(getInitials(student.nombre))}</span><strong>${escapeHTML(student.nombre)}</strong></div></td>${["prueba1", "prueba2", "prueba3", "examen"].map((key) => `<td><span class="grade-view">${formatGrade(grades[key])}</span><input class="inline-grade-input" data-grade="${key}" type="number" min="1" max="7" step="0.1" value="${grades[key] ?? ""}" hidden></td>`).join("")}<td><strong class="grade-emphasis grade-average">${formatGrade(student.promedio)}</strong></td><td><button type="button" class="btn-outline inline-edit-grade" data-student-username="${escapeHTML(student.username)}">Editar notas</button><button type="button" class="btn-primary compact-button inline-save-grade" data-student-username="${escapeHTML(student.username)}" hidden>Guardar</button><span class="save-feedback inline-grade-feedback"></span></td></tr>`; }).join("")}</tbody></table></div></div>`;
}

function renderCourseWarningsOverview(course) {
  return `<div class="panel section-panel-gap course-management-panel" id="courseWarningsPanel"><div class="panel-heading"><div><span class="eyebrow">Amonestaciones</span><h3>Seguimiento de amonestaciones</h3><p class="panel-caption">Selecciona un estudiante para agregar, editar o eliminar una amonestación.</p></div></div><div class="responsive-table"><table class="data-table"><thead><tr><th>Estudiante</th><th>Cantidad</th><th>Detalle</th><th></th></tr></thead><tbody>${course.students.map((student) => { const latest = student.warnings?.[0]; return `<tr><td><div class="person-cell"><span class="avatar tiny">${escapeHTML(getInitials(student.nombre))}</span><strong>${escapeHTML(student.nombre)}</strong></div></td><td>${student.amonestaciones ? renderPill(String(student.amonestaciones), "brick") : renderPill("0", "green")}</td><td>${latest ? `${escapeHTML(latest.fecha)} · ${escapeHTML(latest.tipo)}` : "Sin amonestaciones"}</td><td><button type="button" class="btn-outline warning-student-open" data-student-username="${escapeHTML(student.username)}">Gestionar</button></td></tr>`; }).join("")}</tbody></table></div></div>`;
}

function refreshCourseStudentRows(course, student) {
  const findRow = (selector) => [...document.querySelectorAll(selector)].find((row) => row.dataset.studentUsername === student.username);
  const studentRow = findRow(".student-course-row");
  if (studentRow) {
    const cells = studentRow.querySelectorAll("td");
    if (cells[1]) cells[1].innerHTML = `<strong class="grade-emphasis">${formatGrade(student.promedio)}</strong>`;
    if (cells[2]) cells[2].innerHTML = `<div class="table-progress"><span>${getStudentCourseAttendance(course, student)}%</span><i><b style="width:${getStudentCourseAttendance(course, student)}%"></b></i></div>`;
  }
  const gradesRow = document.querySelector(`#courseGradesPanel tr[data-grade-student="${CSS.escape(student.username)}"]`);
  if (gradesRow) {
    const grades = student.evaluaciones || {};
    const cells = gradesRow.querySelectorAll("td");
    ["prueba1", "prueba2", "prueba3", "examen"].forEach((key, index) => { if (cells[index + 1]) cells[index + 1].textContent = formatGrade(grades[key]); });
    if (cells[5]) cells[5].innerHTML = `<strong class="grade-emphasis">${formatGrade(student.promedio)}</strong>`;
  }
  const warningsRow = findRow("#courseWarningsPanel .warning-student-open")?.closest("tr");
  if (warningsRow) {
    const latest = student.warnings?.[0];
    const cells = warningsRow.querySelectorAll("td");
    if (cells[1]) cells[1].innerHTML = student.amonestaciones ? renderPill(String(student.amonestaciones), "brick") : renderPill("0", "green");
    if (cells[2]) cells[2].textContent = latest ? `${latest.fecha} · ${latest.tipo}` : "Sin amonestaciones";
  }
}

function renderTeacherStudentDetail(course, student) {
  const evaluations = student.evaluaciones || {};
  const warnings = student.warnings || [];
  const assessmentRows = [
    ["Prueba 1", evaluations.prueba1],
    ["Prueba 2", evaluations.prueba2],
    ["Prueba 3", evaluations.prueba3],
    ["Examen", evaluations.examen]
  ];

  return `
    <div class="student-detail-header">
      <div class="student-detail-person"><span class="avatar large">${escapeHTML(getInitials(student.nombre))}</span><div><span class="eyebrow">Detalle individual · ${escapeHTML(course.curso)}</span><h3>${escapeHTML(student.nombre)}</h3><p>${escapeHTML(course.nombre)} · ${escapeHTML(course.sala)}</p></div></div>
      <button class="text-button" id="closeStudentDetail">Cerrar detalle ×</button>
    </div>
    <div class="student-detail-grid">
      <div class="student-detail-section"><div class="detail-section-title"><h4>Notas del curso</h4><span class="grade-emphasis">Promedio ${student.promedio === null || student.promedio === undefined ? "—" : Number(student.promedio).toFixed(1)}</span></div><form class="teacher-edit-form" id="gradesForm"><div class="manual-grade-grid">${assessmentRows.map(([label, value]) => `<label><span>${label}</span><input type="number" name="${label.toLowerCase().replace(" ", "")}" min="1" max="7" step="0.1" value="${value === null || value === undefined ? "" : Number(value).toFixed(1)}"></label>`).join("")}</div><button type="submit" class="btn-primary compact-button">Guardar notas</button><span class="save-feedback" id="gradesFeedback"></span></form></div>
      <div class="student-detail-section"><div class="detail-section-title"><h4>Asistencia en este curso</h4><strong class="detail-percent">${getStudentCourseAttendance(course, student)}%</strong></div><div class="attendance-preview">${renderProgress(getStudentCourseAttendance(course, student), `Clases asistidas en ${course.nombre}`)}</div><p class="detail-muted">Este porcentaje se calcula con las clases registradas como Presente o Justificado en este curso.</p></div>
    </div>
    <div class="student-detail-section warnings-section"><div class="detail-section-title"><h4>Amonestaciones</h4>${warnings.length ? renderPill(`${warnings.length} registro(s)`, "brick") : renderPill("Sin registros", "green")}</div><div class="student-warning-list">${warnings.map((warning, index) => `<div class="student-warning-item"><span class="warning-date">${escapeHTML(warning.fecha)}</span><div class="warning-copy"><strong>${escapeHTML(warning.tipo)}</strong><p>${escapeHTML(warning.detalle)}</p></div><div class="warning-actions"><button type="button" class="text-button edit-warning" data-warning-index="${index}">Editar</button><button type="button" class="text-button delete-warning" data-warning-index="${index}">Eliminar</button></div></div>`).join("") || `<p class="detail-muted">Este alumno no tiene amonestaciones registradas en el curso.</p>`}</div><form class="teacher-edit-form warning-form" id="warningForm"><div class="warning-form-title"><strong id="warningFormTitle">Nueva amonestación</strong><button type="button" class="text-button cancel-warning-edit" id="cancelWarningEdit" hidden>Cancelar edición</button></div><div class="warning-form-grid"><label><span>Fecha</span><input type="text" name="fecha" placeholder="ej: 15 sep 2026" required></label><label><span>Motivo / tipo</span><input type="text" name="tipo" placeholder="ej: Inasistencia" required></label><label class="warning-detail-field"><span>Detalle</span><textarea name="detalle" rows="2" placeholder="Describe el motivo de la amonestación" required></textarea></label></div><button type="submit" class="btn-primary compact-button" id="warningSubmitButton">Agregar amonestación</button><span class="save-feedback" id="warningFeedback"></span></form></div>
  `;
}

function bindTeacherStudentDetailActions(course, student) {
  const detail = document.getElementById("teacherStudentDetail");
  if (!detail) return;

  const syncStudentRecord = (feedbackId) => {
    if (!window.Academy7Firebase?.isAvailable?.()) return;
    window.Academy7Firebase.saveStudentRecord(currentUser.username, course.id, student)
      .then(() => document.getElementById(feedbackId)?.replaceChildren(document.createTextNode("Guardado en Firebase")))
      .catch((error) => {
        console.warn("Academy7: no se pudo guardar el registro del estudiante en Firestore; se mantuvo el registro local.", error);
        document.getElementById(feedbackId)?.replaceChildren(document.createTextNode("Guardado local; Firebase requiere reglas o autenticación"));
      });
  };

  const refreshDetail = () => {
    detail.innerHTML = renderTeacherStudentDetail(course, student);
    bindTeacherStudentDetailActions(course, student);
  };

  document.getElementById("gradesForm")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const keys = ["prueba1", "prueba2", "prueba3", "examen"];
    const labels = { prueba1: "Prueba 1", prueba2: "Prueba 2", prueba3: "Prueba 3", examen: "Examen" };
    const nextEvaluations = {};
    keys.forEach((key) => {
      const raw = String(form.get(key) || "").trim();
      if (raw !== "") nextEvaluations[key] = Number(raw);
    });
    const values = Object.values(nextEvaluations);
    if (!values.length || values.some((value) => Number.isNaN(value) || value < 1 || value > 7)) return;
    student.evaluaciones = nextEvaluations;
    student.promedio = Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(1));
    student.ultimaEvaluacion = labels[keys.filter((key) => nextEvaluations[key] !== undefined).at(-1)];
    persistDatabase(db);
    refreshCourseStudentRows(course, student);
    refreshDetail();
    document.getElementById("gradesFeedback")?.replaceChildren(document.createTextNode("Notas guardadas"));
    syncStudentRecord("gradesFeedback");
  });

  let editingWarningIndex = null;
  const warningForm = document.getElementById("warningForm");
  const warningTitle = document.getElementById("warningFormTitle");
  const warningSubmit = document.getElementById("warningSubmitButton");
  const cancelWarningEdit = document.getElementById("cancelWarningEdit");

  document.querySelectorAll(".edit-warning").forEach((button) => {
    button.addEventListener("click", () => {
      editingWarningIndex = Number(button.dataset.warningIndex);
      const warning = student.warnings[editingWarningIndex];
      warningForm.fecha.value = warning.fecha;
      warningForm.tipo.value = warning.tipo;
      warningForm.detalle.value = warning.detalle;
      warningTitle.textContent = "Editar amonestación";
      warningSubmit.textContent = "Guardar cambios";
      cancelWarningEdit.hidden = false;
      warningForm.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  });

  document.querySelectorAll(".delete-warning").forEach((button) => {
    button.addEventListener("click", () => {
      const index = Number(button.dataset.warningIndex);
      student.warnings.splice(index, 1);
      student.amonestaciones = student.warnings.length;
      persistDatabase(db);
      refreshCourseStudentRows(course, student);
      refreshDetail();
      syncStudentRecord("warningFeedback");
    });
  });

  cancelWarningEdit?.addEventListener("click", () => {
    editingWarningIndex = null;
    warningForm.reset();
    warningTitle.textContent = "Nueva amonestación";
    warningSubmit.textContent = "Agregar amonestación";
    cancelWarningEdit.hidden = true;
  });

  warningForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const warning = { fecha: String(form.get("fecha")).trim(), tipo: String(form.get("tipo")).trim(), detalle: String(form.get("detalle")).trim() };
    if (!warning.fecha || !warning.tipo || !warning.detalle) return;
    if (!student.warnings) student.warnings = [];
    if (editingWarningIndex === null) student.warnings.push(warning);
    else student.warnings[editingWarningIndex] = warning;
    student.amonestaciones = student.warnings.length;
    persistDatabase(db);
    refreshCourseStudentRows(course, student);
    refreshDetail();
    syncStudentRecord("warningFeedback");
  });
}

function renderTeacherCourseDetail(courseId) {
  const course = getTeacherCourses(currentUser.username).find((item) => item.id === courseId);
  if (!course) return renderTeacherCourses();
  setGreeting(course.curso);
  const averageAttendance = average(course.students.map((student) => getStudentCourseAttendance(course, student)));
  const averageGrade = average(course.students.map((student) => student.promedio));

  content.innerHTML = `
    <div class="back-link" id="backToCourses">← Volver a mis cursos</div>
    ${renderSectionIntro("Gestión de curso", `${course.nombre} · ${course.curso}`, `${course.sala} · ${course.horario} · ${course.periodo}`)}
    <div class="detail-stat-grid">
      ${renderMiniStat(course.students.length, "Alumnos en el curso", "gold")}
      <div class="panel mini-stat-panel" id="courseAverageStat"><div class="mini-stat tone-navy"><div class="num">${averageGrade}</div><div class="cap">Promedio del curso</div></div></div>
      <div class="panel mini-stat-panel" id="courseAttendanceStat"><div class="mini-stat tone-green"><div class="num">${averageAttendance === "—" ? 0 : averageAttendance}%</div><div class="cap">Asistencia promedio</div></div></div>
    </div>
    <div class="course-management-tabs" role="tablist" aria-label="Gestión del curso">
      <button type="button" class="course-tab active" data-course-view="students">Lista de estudiantes</button>
      <button type="button" class="course-tab" data-course-view="attendance">Lista de asistencia</button>
      <button type="button" class="course-tab" data-course-view="grades">Calificaciones</button>
      <button type="button" class="course-tab" data-course-view="warnings">Amonestaciones</button>
    </div>
    <div class="panel section-panel-gap course-management-panel" id="courseStudentsPanel">
      <div class="panel-heading"><div><h3>Seguimiento de estudiantes</h3><p class="panel-caption">Lista completa con calificaciones, asistencia y situación formativa.</p></div><span class="table-note">Última actualización: hoy</span></div>
      <div class="responsive-table"><table class="data-table teacher-student-table"><thead><tr><th>Estudiante</th><th>Promedio</th><th>Porcentaje de asistencia</th></tr></thead><tbody>
        ${course.students.map((student) => `
          <tr class="student-course-row" data-student-username="${escapeHTML(student.username)}" aria-label="${escapeHTML(student.nombre)}">
            <td><div class="person-cell"><span class="avatar tiny">${escapeHTML(getInitials(student.nombre))}</span><div><strong>${escapeHTML(student.nombre)}</strong><small>${escapeHTML(student.username)}</small></div></div></td>
            <td><strong class="grade-emphasis">${formatGrade(student.promedio)}</strong></td>
            <td><div class="table-progress"><span>${getStudentCourseAttendance(course, student)}%</span><i><b style="width:${getStudentCourseAttendance(course, student)}%"></b></i></div></td>
            
          </tr>
        `).join("")}
      </tbody></table></div>
    </div>
    ${renderCourseAttendanceTaking(course)}
    ${renderCourseGradesOverview(course)}
    ${renderCourseWarningsOverview(course)}
    <div class="panel section-panel-gap warning-detail-only" id="courseWarningDetail" hidden></div>
    <div class="panel student-detail-panel section-panel-gap" id="teacherStudentDetail"><div class="empty-state compact-empty"><div class="glyph">↓</div>Selecciona un alumno para ver sus notas, asistencia y amonestaciones.</div></div>
  `;
  document.getElementById("backToCourses").addEventListener("click", renderTeacherCourses);
  const showCourseView = (view) => {
    courseViewState[course.id] = view;
    const panels = { students: "courseStudentsPanel", attendance: "courseAttendancePanel", grades: "courseGradesPanel", warnings: "courseWarningsPanel" };
    Object.entries(panels).forEach(([key, id]) => {
      const panel = document.getElementById(id);
      if (panel) panel.hidden = key !== view;
    });
    document.querySelectorAll(".course-tab").forEach((tab) => tab.classList.toggle("active", tab.dataset.courseView === view));
    const detail = document.getElementById("teacherStudentDetail");
    if (detail) detail.hidden = true;
    const warningDetail = document.getElementById("courseWarningDetail");
    if (warningDetail && view !== "warnings") warningDetail.hidden = true;
  };
  document.querySelectorAll(".course-tab").forEach((tab) => tab.addEventListener("click", () => showCourseView(tab.dataset.courseView)));
  content.onclick = (event) => {
    const tab = event.target.closest(".course-tab");
    if (!tab || !content.contains(tab)) return;
    event.preventDefault();
    event.stopPropagation();
    showCourseView(tab.dataset.courseView);
  };
  showCourseView(courseViewState[course.id] || "students");

  document.querySelectorAll(".inline-edit-grade").forEach((button) => {
    button.addEventListener("click", () => {
      const row = button.closest("tr");
      row.querySelectorAll(".inline-grade-input").forEach((input) => input.removeAttribute("hidden"));
      row.querySelectorAll(".grade-view").forEach((view) => view.setAttribute("hidden", "hidden"));
      button.setAttribute("hidden", "hidden");
      row.querySelector(".inline-save-grade").removeAttribute("hidden");
    });
  });

  document.querySelectorAll(".inline-save-grade").forEach((button) => {
    button.addEventListener("click", () => {
      const row = button.closest("tr");
      const student = course.students.find((item) => item.username === button.dataset.studentUsername);
      if (!student) return;
      const inputs = [...row.querySelectorAll(".inline-grade-input")];
      const invalid = inputs.some((input) => input.value !== "" && (Number.isNaN(Number(input.value)) || Number(input.value) < 1 || Number(input.value) > 7));
      if (invalid) {
        row.querySelector(".inline-grade-feedback").textContent = "Cada nota ingresada debe estar entre 1,0 y 7,0";
        return;
      }
      student.evaluaciones = Object.fromEntries(inputs.map((input) => [input.dataset.grade, input.value === "" ? null : Number(input.value)]));
      const enteredValues = inputs.map((input) => input.value === "" ? null : Number(input.value)).filter((value) => value !== null);
      student.promedio = enteredValues.length ? Number((enteredValues.reduce((sum, value) => sum + value, 0) / enteredValues.length).toFixed(1)) : null;
      const lastEntered = inputs.filter((input) => input.value !== "").pop();
      student.ultimaEvaluacion = lastEntered ? lastEntered.dataset.grade : "";
      student.estado = enteredValues.length ? "Regular" : "Pendiente";
      persistDatabase(db);
      row.querySelectorAll(".grade-view").forEach((view, index) => { view.textContent = formatGrade(student.evaluaciones[inputs[index].dataset.grade]); view.removeAttribute("hidden"); });
      row.querySelectorAll(".inline-grade-input").forEach((input) => { input.setAttribute("hidden", "hidden"); });
      row.querySelector(".grade-average").textContent = formatGrade(student.promedio);
      button.setAttribute("hidden", "hidden");
      row.querySelector(".inline-edit-grade").removeAttribute("hidden");
      row.querySelector(".inline-grade-feedback").textContent = "Guardado";
      if (window.Academy7Firebase?.isAvailable?.()) {
        window.Academy7Firebase.saveStudentRecord(currentUser.username, course.id, student).catch((error) => console.warn("No se pudo guardar la nota en Firebase", error));
      }
      refreshCourseStudentRows(course, student);
      refreshCourseSummaryStats(course);
    });
  });

  document.querySelectorAll(".warning-student-open").forEach((button) => {
    button.addEventListener("click", () => {
      const student = course.students.find((item) => item.username === button.dataset.studentUsername);
      const panel = document.getElementById("courseWarningDetail");
      if (!student || !panel) return;
      showCourseView("warnings");
      panel.hidden = false;
      const renderWarningDetail = () => {
        panel.innerHTML = `<div class="panel-heading"><div><span class="eyebrow">Detalle de amonestaciones</span><h3>${escapeHTML(student.nombre)}</h3><p class="panel-caption">Motivo, fecha y descripción.</p></div></div><div class="student-warning-list">${(student.warnings || []).map((warning, index) => `<article class="student-warning-item"><span class="warning-date">${escapeHTML(warning.fecha)}</span><div class="warning-copy"><strong>${escapeHTML(warning.tipo)}</strong><p>${escapeHTML(warning.detalle)}</p></div><button type="button" class="text-button delete-course-warning" data-index="${index}">Eliminar</button></article>`).join("") || '<p class="detail-muted">Sin amonestaciones registradas.</p>'}</div><form id="courseWarningForm" class="warning-form"><div class="warning-form-grid"><label><span>Fecha</span><input name="fecha" type="date" required></label><label><span>Motivo</span><input name="tipo" required></label><label class="warning-detail-field"><span>Descripción</span><textarea name="detalle" rows="2" required></textarea></label></div><button class="btn-primary compact-button" type="submit">Agregar amonestación</button></form>`;
        panel.querySelectorAll(".delete-course-warning").forEach((removeButton) => removeButton.addEventListener("click", () => {
          student.warnings.splice(Number(removeButton.dataset.index), 1);
          student.amonestaciones = student.warnings.length;
          persistDatabase(db);
          renderWarningDetail();
          refreshCourseStudentRows(course, student);
          if (window.Academy7Firebase?.isAvailable?.()) window.Academy7Firebase.saveStudentRecord(currentUser.username, course.id, student).catch(() => {});
        }));
        panel.querySelector("#courseWarningForm")?.addEventListener("submit", (event) => {
          event.preventDefault();
          const values = new FormData(event.currentTarget);
          if (!student.warnings) student.warnings = [];
          student.warnings.push({ fecha: String(values.get("fecha")), tipo: String(values.get("tipo")).trim(), detalle: String(values.get("detalle")).trim() });
          student.amonestaciones = student.warnings.length;
          persistDatabase(db);
          renderWarningDetail();
          refreshCourseStudentRows(course, student);
          if (window.Academy7Firebase?.isAvailable?.()) window.Academy7Firebase.saveStudentRecord(currentUser.username, course.id, student).catch(() => {});
        });
      };
      renderWarningDetail();
    });
  });

  document.getElementById("courseAttendanceForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const fecha = String(form.get("fecha") || "");
    if (!fecha) return;
    const weekday = new Date(`${fecha}T00:00:00`).getDay();
    if (weekday === 0 || weekday === 6) {
      document.getElementById("attendanceSessionFeedback")?.replaceChildren(document.createTextNode("Selecciona un día de lunes a viernes"));
      return;
    }
    const records = Object.fromEntries(course.students.map((student) => [student.username, String(form.get(`status-${student.username}`) || "presente")]));
    if (Object.values(records).some((status) => !["presente", "ausente", "justificado"].includes(status))) return;
    if (!Array.isArray(course.attendanceRecords)) course.attendanceRecords = [];
    courseAttendanceDateState[course.id] = fecha;
    const existing = course.attendanceRecords.find((session) => session.fecha === fecha);
    if (existing) existing.records = records;
    else course.attendanceRecords.push({ fecha, records });
    course.students.forEach((student) => {
      student.asistencia = getStudentCourseAttendance(course, student);
    });
    persistDatabase(db);
    const feedback = document.getElementById("attendanceSessionFeedback");
    const saveRemote = window.Academy7Firebase?.isAvailable?.()
      ? window.Academy7Firebase.saveCourseAttendance(currentUser.username, course.id, fecha, records)
      : Promise.reject(new Error("Firestore no disponible"));
    saveRemote.then(() => {
      if (window.Academy7Firebase?.isAvailable?.()) {
        course.students.forEach((student) => {
          window.Academy7Firebase.saveStudentRecord(currentUser.username, course.id, student).catch((error) => {
            console.warn("Academy7: no se pudo sincronizar el porcentaje del estudiante.", error);
          });
        });
      }
      refreshCourseSummaryStats(course);
      renderTeacherCourseDetail(course.id, false);
      document.getElementById("attendanceSessionFeedback")?.replaceChildren(document.createTextNode("Guardado en Firebase"));
    }).catch((error) => {
      console.warn("Academy7: no se pudo guardar en Firestore; se mantuvo el registro local.", error);
      renderTeacherCourseDetail(course.id, false);
      document.getElementById("attendanceSessionFeedback")?.replaceChildren(document.createTextNode("Guardado local; Firebase requiere reglas o autenticación"));
    });
  });
  document.querySelector("#courseAttendanceForm input[name='fecha']")?.addEventListener("change", (event) => {
    courseAttendanceDateState[course.id] = event.currentTarget.value;
    if (event.currentTarget.value) renderTeacherCourseDetail(course.id);
  });
  document.querySelectorAll(".attendance-option input").forEach((input) => {
    input.addEventListener("change", () => {
      const group = input.closest(".attendance-status-options");
      group?.querySelectorAll(".attendance-option").forEach((option) => option.classList.toggle("selected", option.querySelector("input") === input));
    });
  });
  hydrateCourseAttendance(course);
  hydrateCourseStudents(course);
}

// ---------- Horarios y calendario ----------


function renderTeacherWarnings() {
  const warnings = getTeacherWarnings(currentUser.username);
  content.innerHTML = `
    ${renderSectionIntro("Gestión formativa", "Amonestaciones", "Revisa las situaciones que requieren seguimiento en tus cursos.")}
    <div class="warning-summary ${warnings.length ? "has-warnings" : "clear-warnings"}"><span class="warning-icon">${warnings.length ? "!" : "✓"}</span><div><strong>${warnings.length ? `${warnings.length} registro(s) activos` : "No hay amonestaciones activas"}</strong><p>Las amonestaciones se muestran asociadas al estudiante y a su curso.</p></div></div>
    <div class="panel section-panel-gap"><div class="responsive-table"><table class="data-table"><thead><tr><th>Fecha</th><th>Estudiante</th><th>Curso</th><th>Tipo</th><th>Detalle</th></tr></thead><tbody>${warnings.map((warning) => `<tr><td>${escapeHTML(warning.fecha)}</td><td><strong>${escapeHTML(warning.alumno)}</strong></td><td>${escapeHTML(warning.curso)}</td><td>${renderPill(warning.tipo, "brick")}</td><td>${escapeHTML(warning.detalle)}</td></tr>`).join("") || `<tr><td colspan="5" class="table-empty">No hay amonestaciones registradas.</td></tr>`}</tbody></table></div></div>
  `;
}


async function hydrateTeacherMessages() {
  if (teacherMessagesHydrated || !window.Academy7Firebase?.isAvailable?.() || !window.Academy7Firebase.loadTeacherMessages) return;
  teacherMessagesHydrated = true;
  try {
    const remoteMessages = await window.Academy7Firebase.loadTeacherMessages(currentUser.username);
    if (remoteMessages.length) {
      db.teacherMessages[currentUser.username] = remoteMessages;
      persistDatabase(db);
      if (document.getElementById("teacherMsgList")) renderTeacherMessages("todos");
    }
  } catch (error) {
    console.warn("No se pudieron cargar los mensajes desde Firebase; se conserva el respaldo local.", error);
  }
}

function renderTeacherMessages(filter = "todos") {
  setGreeting("Mensajes");
  const messages = getTeacherMessages(currentUser.username);
  const filteredMessages = filter === "todos" ? messages : messages.filter((message) => message.destinatario === filter);
  const unread = messages.filter((message) => !message.leido).length;
  content.innerHTML = `
    ${renderSectionIntro("Comunicaciones docentes", "Mensajes", "Conversa y realiza seguimiento con apoderados y estudiantes de tus cursos.")}
    <div class="message-toolbar"><div><strong>${messages.length}</strong> conversaciones · <span>${unread} sin leer</span></div><div class="message-filters"><button class="message-filter ${filter === "todos" ? "active" : ""}" data-filter="todos">Todos</button><button class="message-filter ${filter === "apoderado" ? "active" : ""}" data-filter="apoderado">Apoderados</button><button class="message-filter ${filter === "estudiante" ? "active" : ""}" data-filter="estudiante">Estudiantes</button></div></div>
    <div class="msg-layout teacher-msg-layout">
      <div class="msg-list" id="teacherMsgList">${filteredMessages.map((message) => `<button class="msg-item ${message.leido ? "" : "unread"}" data-message-id="${message.id}"><div class="from"><span>${escapeHTML(message.nombre)}</span>${!message.leido ? '<span class="dot-unread"></span>' : ""}</div><div class="preview">${escapeHTML(message.asunto)}</div><div class="message-related">${escapeHTML(message.relacionado)}</div></button>`).join("") || `<div class="empty-state"><div class="glyph">·</div>No hay mensajes para este filtro.</div>`}</div>
      <div class="msg-detail" id="teacherMsgDetail"><div class="empty-state"><div class="glyph">·</div>Selecciona una conversación para leerla.</div></div>
    </div>
    <div class="panel section-panel-gap teacher-message-compose"><div class="panel-heading"><div><span class="eyebrow">Nueva comunicación</span><h3>Enviar mensaje a un estudiante</h3></div></div><form id="teacherMessageForm" class="message-compose-form"><label><span>Estudiante</span><select name="username" required>${getTeacherCourses(currentUser.username).flatMap((course) => course.students.map((student) => `<option value="${escapeHTML(student.username)}">${escapeHTML(student.nombre)} · ${escapeHTML(course.curso)}</option>`)).join("")}</select></label><label><span>Asunto</span><input name="asunto" required placeholder="Asunto del mensaje"></label><label><span>Mensaje</span><textarea name="cuerpo" rows="3" required placeholder="Escribe el mensaje para el estudiante"></textarea></label><button class="btn-primary compact-button" type="submit">Enviar mensaje</button></form></div>
  `;
  document.querySelectorAll(".message-filter").forEach((button) => {
    button.addEventListener("click", () => renderTeacherMessages(button.dataset.filter));
  });
  document.querySelectorAll("#teacherMsgList .msg-item").forEach((button) => {
    button.addEventListener("click", () => {
      const message = messages.find((item) => item.id === button.dataset.messageId);
      if (!message) return;
      message.leido = true;
      db.teacherMessages[currentUser.username] = messages;
      persistDatabase(db);
      document.querySelectorAll("#teacherMsgList .msg-item").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      button.querySelector(".dot-unread")?.remove();
      document.getElementById("teacherMsgDetail").innerHTML = `<div class="message-detail-top"><span class="message-recipient-pill ${message.destinatario}">${message.destinatario === "apoderado" ? "Apoderado" : "Estudiante"}</span><span class="meta">${escapeHTML(message.fecha)}</span></div><h3>${escapeHTML(message.asunto)}</h3><div class="message-recipient">Para: <strong>${escapeHTML(message.nombre)}</strong><span>${escapeHTML(message.relacionado)}</span></div><div class="body">${escapeHTML(message.cuerpo).replace(/\n/g, "<br>")}</div><button class="btn-outline message-reply">Responder a ${escapeHTML(message.nombre)} →</button>`;
    });
  });
  document.getElementById("teacherMessageForm")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const recipient = getUserByUsername(String(values.get("username")));
    const message = { id: `tm-${Date.now()}`, destinatario: "estudiante", nombre: recipient?.nombre || String(values.get("username")), relacionado: "Mensaje docente", asunto: String(values.get("asunto")).trim(), fecha: new Date().toLocaleDateString("es-CL"), leido: true, cuerpo: String(values.get("cuerpo")).trim() };
    if (!db.teacherMessages[currentUser.username]) db.teacherMessages[currentUser.username] = [];
    db.teacherMessages[currentUser.username].unshift(message);
    persistDatabase(db);
    if (window.Academy7Firebase?.isAvailable?.()) window.Academy7Firebase.saveTeacherMessage(currentUser.username, message).catch((error) => console.warn("No se pudo guardar el mensaje en Firebase", error));
    renderTeacherMessages(filter);
  });
  hydrateTeacherMessages();
}


