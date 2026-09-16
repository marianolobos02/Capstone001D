/* =========================================================
   Academy7 — Panel principal multirol
   Vistas disponibles: Docente, Apoderado y Estudiante.
   ========================================================= */

const currentUser = getCurrentUser();
if (!currentUser) {
  window.location.href = "index.html";
  throw new Error("No hay una sesión activa.");
}

const db = getDatabase();
const content = document.getElementById("content");
const roleKey = getRoleKey(currentUser);
let selectedChildUsername = null;

const MESES_LARGO = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
];
const DIAS = [
  "domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"
];

const ROLE_CONFIG = {
  docente: {
    label: "Docente",
    description: "Gestiona tus cursos, estudiantes y seguimiento académico.",
    nav: [
      ["inicio", "Inicio"],
      ["perfil", "Mi perfil"],
      ["cursos", "Mis cursos"],
      ["horario", "Horario de clases"],
      ["calendario", "Calendario"],
      ["amonestaciones", "Amonestaciones"],
      ["mensajes", "Mensajes"]
    ]
  },
  apoderado: {
    label: "Apoderado",
    description: "Acompaña el progreso académico y formativo de tus hijos.",
    nav: [
      ["inicio", "Inicio"],
      ["perfil", "Mi perfil"],
      ["hijos", "Mis hijos"],
      ["asistencia", "Asistencia"],
      ["notas", "Calificaciones"],
      ["amonestaciones", "Amonestaciones"],
      ["calendario", "Calendario"]
    ]
  },
  estudiante: {
    label: "Estudiante",
    description: "Organiza tu año escolar y revisa tu avance académico.",
    nav: [
      ["inicio", "Inicio"],
      ["perfil", "Mi perfil"],
      ["cursos", "Mis cursos"],
      ["horario", "Mi horario"],
      ["calendario", "Calendario"],
      ["notas", "Calificaciones"],
      ["asistencia", "Asistencia"],
      ["amonestaciones", "Amonestaciones"],
      ["mensajes", "Mensajes"]
    ]
  }
};

function escapeHTML(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function fullNameFirst(name) {
  return String(name || "").trim().split(" ")[0] || "";
}

function average(values) {
  const numeric = values.filter((value) => value !== null && value !== undefined && value !== "").map(Number).filter((value) => !Number.isNaN(value));
  return numeric.length ? (numeric.reduce((sum, value) => sum + value, 0) / numeric.length).toFixed(1) : "—";
}

function formatGrade(value) {
  return value === null || value === undefined || value === "" ? "—" : Number(value).toFixed(1);
}

function formatAttendanceDate(isoDate) {
  if (!isoDate) return "";
  const date = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(date.getTime())) return isoDate;
  const label = `${DIAS[date.getDay()]} ${date.getDate()} de ${MESES_LARGO[date.getMonth()]} de ${date.getFullYear()}`;
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function getGuardianChild() {
  const children = getStudentChildren(currentUser.username);
  if (!children.length) return null;
  if (!selectedChildUsername || !children.some((child) => child.username === selectedChildUsername)) {
    selectedChildUsername = children[0].username;
  }
  return children.find((child) => child.username === selectedChildUsername) || children[0];
}

function getContextStudent() {
  if (roleKey === "apoderado") return getGuardianChild();
  if (roleKey === "estudiante") return currentUser;
  return null;
}

function getContextUsername() {
  const student = getContextStudent();
  return student ? student.username : null;
}

function getContextLabel() {
  const student = getContextStudent();
  return student ? student.nombre : "la comunidad Academy7";
}

function setGreeting(sectionLabel) {
  document.getElementById("greetingTitle").textContent = sectionLabel;
}

function initTopbar() {
  document.getElementById("topAvatar").textContent = currentUser.iniciales;
  document.getElementById("topUserName").textContent = currentUser.nombre;
  document.getElementById("topUserRole").textContent = `${currentUser.rol}${currentUser.curso ? ` · ${currentUser.curso}` : ""}`;
  const now = new Date();
  document.getElementById("greetingDate").textContent =
    `${DIAS[now.getDay()]} ${now.getDate()} de ${MESES_LARGO[now.getMonth()]}`;

  const roleConfig = ROLE_CONFIG[roleKey];
  document.getElementById("sidebarRole").innerHTML = `
    <span class="role-label">Sesión activa</span>
    <strong>${escapeHTML(roleConfig.label)}</strong>
  `;
  document.getElementById("navList").innerHTML = roleConfig.nav.map(([section, label]) => `
    <li><button class="nav-link" data-section="${section}"><span class="dot"></span>${label}</button></li>
  `).join("");

  document.querySelectorAll(".nav-link").forEach((button) => {
    button.addEventListener("click", () => goToSection(button.dataset.section));
  });
}

function renderSectionIntro(eyebrow, title, description) {
  return `
    <div class="section-heading">
      <div>
        <div class="eyebrow">${escapeHTML(eyebrow)}</div>
        <h2 class="section-title">${escapeHTML(title)}</h2>
        <p class="section-sub">${escapeHTML(description)}</p>
      </div>
    </div>
  `;
}

function renderMiniStat(number, label, tone = "gold") {
  return `
    <div class="panel mini-stat-panel">
      <div class="mini-stat tone-${tone}">
        <div class="num">${escapeHTML(number)}</div>
        <div class="cap">${escapeHTML(label)}</div>
      </div>
    </div>
  `;
}

function renderProgress(value, label = "Asistencia") {
  const safeValue = Math.max(0, Math.min(100, Number(value) || 0));
  return `
    <div class="progress-wrap">
      <div class="progress-label"><span>${escapeHTML(label)}</span><strong>${safeValue}%</strong></div>
      <div class="progress-track"><span style="width:${safeValue}%"></span></div>
    </div>
  `;
}

function renderPill(status, className = "") {
  return `<span class="pill ${className}">${escapeHTML(status)}</span>`;
}

function pillForGrade(status) {
  if (status === "aprobado") return renderPill("Aprobado", "green");
  if (status === "insuficiente") return renderPill("Insuficiente", "brick");
  return renderPill("Pendiente", "gold");
}

function warningCountForStudent(username) {
  return getStudentWarnings(username).length;
}

function renderEvents(events, emptyText = "No hay eventos próximos.") {
  return `
    <div class="calendar-list">
      ${events.slice(0, 4).map((event) => `
        <div class="cal-row">
          <div class="cal-date">
            <div class="day">${escapeHTML(event.dia)}</div>
            <div class="mon">${escapeHTML(event.mes)}</div>
          </div>
          <div class="cal-info">
            <h4>${escapeHTML(event.titulo)}</h4>
            <p>${escapeHTML(event.detalle)}</p>
          </div>
        </div>
      `).join("") || `<div class="empty-state"><div class="glyph">·</div>${escapeHTML(emptyText)}</div>`}
    </div>
  `;
}

function renderSchedule(schedule, compact = false) {
  if (!schedule.length) {
    return `<div class="empty-state"><div class="glyph">·</div>No hay horario disponible.</div>`;
  }
  return `
    <div class="schedule-grid ${compact ? "compact" : ""}">
      ${schedule.map((day) => `
        <div class="schedule-day">
          <div class="schedule-day-title">${escapeHTML(day.dia)}</div>
          <div class="schedule-blocks">
            ${day.bloques.map((block) => `
              <div class="schedule-block">
                <span class="schedule-time">${escapeHTML(block.hora)}</span>
                <strong>${escapeHTML(block.curso)}</strong>
                <small>${escapeHTML(block.sala)}</small>
              </div>
            `).join("")}
          </div>
        </div>
      `).join("")}
    </div>
  `;
}

function renderChildPicker(children) {
  if (children.length <= 1) return "";
  return `
    <div class="child-picker panel">
      <div>
        <span class="eyebrow">Vista familiar</span>
        <strong>Selecciona a uno de tus hijos</strong>
      </div>
      <div class="child-tabs">
        ${children.map((child) => `
          <button class="child-tab ${child.username === selectedChildUsername ? "active" : ""}" data-child="${child.username}">
            <span class="avatar small">${escapeHTML(child.iniciales)}</span>
            ${escapeHTML(fullNameFirst(child.nombre))} · ${escapeHTML(child.curso)}
          </button>
        `).join("")}
      </div>
    </div>
  `;
}

function bindChildPicker() {
  document.querySelectorAll(".child-tab").forEach((button) => {
    button.addEventListener("click", () => {
      selectedChildUsername = button.dataset.child;
      const activeSection = document.querySelector(".nav-link.active")?.dataset.section || "inicio";
      goToSection(activeSection);
    });
  });
}

// ---------- Inicio ----------

function renderInicio() {
  setGreeting(`Hola, ${fullNameFirst(currentUser.nombre)}`);
  if (roleKey === "docente") return renderTeacherHome();
  if (roleKey === "apoderado") return renderGuardianHome();
  return renderStudentHome();
}

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

function renderGuardianHome() {
  const children = getStudentChildren(currentUser.username);
  const child = getGuardianChild();
  const attendance = child ? getStudentAttendance(child.username) : null;
  const grades = child ? getStudentGrades(child.username) : [];
  const warnings = child ? getStudentWarnings(child.username) : [];
  const events = child ? getStudentEvents(child.username) : [];

  content.innerHTML = `
    ${renderSectionIntro("Panel del apoderado", ROLE_CONFIG.apoderado.description, `${children.length} hijo(s) asociado(s) a tu cuenta`)}
    ${renderChildPicker(children)}
    <div class="role-banner guardian-banner">
      <div><span class="eyebrow inverse">Seguimiento familiar</span><h3>${child ? `Resumen de ${escapeHTML(fullNameFirst(child.nombre))}` : "Sin estudiantes asociados"}</h3><p>${child ? `${escapeHTML(child.curso)} · Revisa su asistencia, calificaciones y situación formativa.` : "Solicita al colegio asociar a tu hijo o hija a tu cuenta."}</p></div>
      ${child ? `<div class="attendance-ring" style="--percent:${attendance.percent}%"><strong>${attendance.percent}%</strong><small>asistencia</small></div>` : ""}
    </div>
    <div class="home-grid">
      <div class="panel">
        <div class="panel-heading"><h3>Próximas actividades</h3><button class="text-button" data-go="calendario">Ver calendario →</button></div>
        ${renderEvents(events, "No hay actividades para este estudiante.")}
      </div>
      <div class="mini-stack">
        ${renderMiniStat(children.length, "Hijos asociados", "gold")}
        ${renderMiniStat(child ? getStudentAverage(child.username) : "—", "Promedio general", "navy")}
        ${renderMiniStat(child ? warnings.length : 0, "Amonestaciones", warnings.length ? "brick" : "green")}
      </div>
    </div>
    ${child ? `<div class="quick-panels"><div class="panel"><div class="panel-heading"><h3>Asistencia de ${escapeHTML(fullNameFirst(child.nombre))}</h3><button class="text-button" data-go="asistencia">Ver detalle →</button></div>${renderProgress(attendance.percent, `${attendance.attended} de ${attendance.total} clases asistidas`)}<div class="inline-metrics"><span><b>${attendance.absences}</b> inasistencias</span><span><b>${attendance.late}</b> atrasos</span></div></div><div class="panel"><div class="panel-heading"><h3>Últimas calificaciones</h3><button class="text-button" data-go="notas">Ver todas →</button></div><div class="compact-grade-list">${grades.slice(0, 3).map((grade) => `<div><span>${escapeHTML(grade.curso)}</span><strong>${Number(grade.nota).toFixed(1)}</strong></div>`).join("")}</div></div></div>` : ""}
  `;
  bindChildPicker();
  bindGoButtons();
}

// ---------- Perfil ----------

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
    persistDatabase(db);
    // No reemplazar toda la vista si el docente ya seleccionó un alumno;
    // el render asíncrono de Firebase no debe borrar su detalle abierto.
    if (document.getElementById("courseAttendancePanel") && !document.querySelector(".student-select-row.selected")) {
      renderTeacherCourseDetail(course.id);
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
    if (document.getElementById("courseAttendancePanel") && !document.querySelector(".student-select-row.selected")) {
      renderTeacherCourseDetail(course.id);
    }
  } catch (error) {
    console.warn("Academy7: no se pudieron leer estudiantes desde Firestore; se conserva el respaldo local.", error);
  }
}

function getStudentCourseAttendance(course, student) {
  const records = getCourseAttendanceRecords(course)
    .map((session) => session.records?.[student.username])
    .filter(Boolean);
  if (!records.length) return Number(student.asistencia || 0);
  const attended = records.filter((status) => status === "presente" || status === "justificado").length;
  return Math.round((attended / records.length) * 100);
}

function attendanceStatusLabel(status) {
  return ({ presente: "Presente", ausente: "Ausente", justificado: "Justificado" })[status] || "Sin registrar";
}

function renderCourseAttendanceTaking(course) {
  const records = getCourseAttendanceRecords(course);
  const selectedDate = records[records.length - 1]?.fecha || new Date().toISOString().slice(0, 10);
  const currentSession = records.find((session) => session.fecha === selectedDate);
  return `
    <div class="panel attendance-taking-panel section-panel-gap" id="courseAttendancePanel">
      <div class="panel-heading"><div><span class="eyebrow">Registro de asistencia</span><h3>Lista del día: ${escapeHTML(formatAttendanceDate(selectedDate))}</h3><p class="panel-caption">Selecciona una fecha y marca a cada estudiante como Presente, Ausente o Justificado.</p></div><span class="attendance-session-count">${records.length} clase(s) registradas</span></div>
      <form id="courseAttendanceForm" class="course-attendance-form" novalidate>
        <div class="attendance-session-toolbar"><label><span>Fecha de la clase</span><input type="date" name="fecha" value="${selectedDate}" required></label><div class="attendance-legend"><span class="status-dot presente"></span>Presente <span class="status-dot ausente"></span>Ausente <span class="status-dot justificado"></span>Justificado</div></div>
        <div class="responsive-table"><table class="data-table attendance-taking-table"><thead><tr><th>Estudiante</th><th>Porcentaje en el curso</th><th>Estado de esta clase</th></tr></thead><tbody>${course.students.map((student) => { const status = currentSession?.records?.[student.username] || "presente"; return `<tr><td><div class="person-cell"><span class="avatar tiny">${escapeHTML(getInitials(student.nombre))}</span><div><strong>${escapeHTML(student.nombre)}</strong><small>${escapeHTML(student.username)}</small></div></div></td><td><div class="table-progress"><span>${getStudentCourseAttendance(course, student)}%</span><i><b style="width:${getStudentCourseAttendance(course, student)}%"></b></i></div></td><td><div class="attendance-status-options">${["presente", "ausente", "justificado"].map((option) => `<label class="attendance-option ${option} ${status === option ? "selected" : ""}"><input type="radio" name="status-${student.username}" value="${option}" ${status === option ? "checked" : ""} required><span>${attendanceStatusLabel(option)}</span></label>`).join("")}</div></td></tr>`; }).join("")}</tbody></table></div>
        <div class="attendance-form-footer"><span class="save-feedback" id="attendanceSessionFeedback"></span><button type="submit" class="btn-primary compact-button">Guardar asistencia del día</button></div>
      </form>
    </div>
  `;
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
  const warningTotal = course.students.reduce((total, student) => total + student.amonestaciones, 0);

  content.innerHTML = `
    <div class="back-link" id="backToCourses">← Volver a mis cursos</div>
    ${renderSectionIntro("Gestión de curso", `${course.nombre} · ${course.curso}`, `${course.sala} · ${course.horario} · ${course.periodo}`)}
    <div class="detail-stat-grid">
      ${renderMiniStat(course.students.length, "Alumnos en el curso", "gold")}
      ${renderMiniStat(averageGrade, "Promedio del curso", "navy")}
      ${renderMiniStat(`${averageAttendance}%`, "Asistencia promedio", "green")}
      ${renderMiniStat(warningTotal, "Amonestaciones", warningTotal ? "brick" : "green")}
    </div>
    <div class="panel section-panel-gap">
      <div class="panel-heading"><div><h3>Seguimiento de estudiantes</h3><p class="panel-caption">Lista completa con calificaciones, asistencia y situación formativa.</p></div><span class="table-note">Última actualización: hoy</span></div>
      <div class="responsive-table"><table class="data-table teacher-student-table"><thead><tr><th>Alumno</th><th>Promedio</th><th>Asistencia</th><th>Amonestaciones</th><th>Última evaluación</th><th>Estado</th></tr></thead><tbody>
        ${course.students.map((student) => `
          <tr class="student-select-row" data-student-username="${student.username}" tabindex="0" aria-label="Ver detalle de ${escapeHTML(student.nombre)}">
            <td><div class="person-cell"><span class="avatar tiny">${escapeHTML(getInitials(student.nombre))}</span><div><strong>${escapeHTML(student.nombre)}</strong><small>${escapeHTML(student.username)}</small></div></div></td>
            <td><strong class="grade-emphasis">${formatGrade(student.promedio)}</strong></td>
            <td><div class="table-progress"><span>${getStudentCourseAttendance(course, student)}%</span><i><b style="width:${getStudentCourseAttendance(course, student)}%"></b></i></div></td>
            <td>${student.amonestaciones ? renderPill(String(student.amonestaciones), "brick") : renderPill("0", "green")}</td>
            <td>${escapeHTML(student.ultimaEvaluacion)}</td>
            <td>${student.estado === "Regular" ? renderPill(student.estado, "green") : student.estado === "En seguimiento" ? renderPill(student.estado, "gold") : renderPill(student.estado, "brick")}</td>
          </tr>
          ${student.warnings?.length ? `<tr class="warning-detail-row"><td colspan="6"><span class="warning-label">Amonestaciones:</span> ${student.warnings.map((warning) => `${escapeHTML(warning.fecha)} · ${escapeHTML(warning.tipo)} — ${escapeHTML(warning.detalle)}`).join("  ·  ")}</td></tr>` : ""}
        `).join("")}
      </tbody></table></div>
    </div>
    ${renderCourseAttendanceTaking(course)}
    <div class="panel student-detail-panel section-panel-gap" id="teacherStudentDetail"><div class="empty-state compact-empty"><div class="glyph">↓</div>Selecciona un alumno para ver sus notas, asistencia y amonestaciones.</div></div>
  `;
  document.getElementById("backToCourses").addEventListener("click", renderTeacherCourses);
  const selectStudent = (row) => {
    const student = course.students.find((item) => item.username === row.dataset.studentUsername);
    if (!student) return;
    const detail = document.getElementById("teacherStudentDetail");
    detail.innerHTML = renderTeacherStudentDetail(course, student);
    document.querySelectorAll(".student-select-row").forEach((item) => item.classList.toggle("selected", item === row));
    bindTeacherStudentDetailActions(course, student);
    document.getElementById("closeStudentDetail").addEventListener("click", () => {
      detail.innerHTML = `<div class="empty-state compact-empty"><div class="glyph">↓</div>Selecciona un alumno para ver sus notas, asistencia y amonestaciones.</div>`;
      row.classList.remove("selected");
    });
    detail.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  document.querySelectorAll(".student-select-row").forEach((row) => {
    row.addEventListener("click", () => selectStudent(row));
    row.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        selectStudent(row);
      }
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
      renderTeacherCourseDetail(course.id, false);
      document.getElementById("attendanceSessionFeedback")?.replaceChildren(document.createTextNode("Guardado en Firebase"));
    }).catch((error) => {
      console.warn("Academy7: no se pudo guardar en Firestore; se mantuvo el registro local.", error);
      renderTeacherCourseDetail(course.id, false);
      document.getElementById("attendanceSessionFeedback")?.replaceChildren(document.createTextNode("Guardado local; Firebase requiere reglas o autenticación"));
    });
  });
  document.querySelector("#courseAttendanceForm input[name='fecha']")?.addEventListener("change", (event) => {
    if (event.currentTarget.value) renderTeacherCourseDetail(course.id);
  });
  hydrateCourseAttendance(course);
  hydrateCourseStudents(course);
}

// ---------- Horarios y calendario ----------

function renderHorario() {
  setGreeting(roleKey === "docente" ? "Horario de clases" : "Mi horario");
  if (roleKey === "docente") {
    content.innerHTML = `
      ${renderSectionIntro("Agenda docente", "Horario de clases", "Tus bloques de clases, planificación y reuniones durante la semana.")}
      <div class="panel schedule-panel">${renderSchedule(getTeacherSchedule(currentUser.username))}</div>
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
    events = getTeacherEvents(currentUser.username);
    description = "Pruebas, reuniones y compromisos de tu agenda docente.";
  } else {
    const child = getContextStudent();
    events = child ? getStudentEvents(child.username) : [];
    description = roleKey === "apoderado" ? `Actividades y comunicaciones de ${child ? child.nombre : "tu hijo/a"}.` : "Pruebas, entregas y actividades programadas.";
  }
  content.innerHTML = `
    ${renderSectionIntro(roleKey === "docente" ? "Agenda docente" : roleKey === "apoderado" ? "Agenda familiar" : "Agenda escolar", "Calendario", description)}
    ${roleKey === "apoderado" ? renderChildPicker(getStudentChildren(currentUser.username)) : ""}
    <div class="panel"><div class="calendar-list full-calendar-list">${events.map((event) => `<div class="cal-row"><div class="cal-date"><div class="day">${escapeHTML(event.dia)}</div><div class="mon">${escapeHTML(event.mes)}</div></div><div class="cal-info"><h4>${escapeHTML(event.titulo)}</h4><p>${escapeHTML(event.detalle)}</p></div></div>`).join("") || `<div class="empty-state"><div class="glyph">·</div>No hay eventos programados.</div>`}</div></div>
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

function renderTeacherWarnings() {
  const warnings = getTeacherWarnings(currentUser.username);
  content.innerHTML = `
    ${renderSectionIntro("Gestión formativa", "Amonestaciones", "Revisa las situaciones que requieren seguimiento en tus cursos.")}
    <div class="warning-summary ${warnings.length ? "has-warnings" : "clear-warnings"}"><span class="warning-icon">${warnings.length ? "!" : "✓"}</span><div><strong>${warnings.length ? `${warnings.length} registro(s) activos` : "No hay amonestaciones activas"}</strong><p>Las amonestaciones se muestran asociadas al estudiante y a su curso.</p></div></div>
    <div class="panel section-panel-gap"><div class="responsive-table"><table class="data-table"><thead><tr><th>Fecha</th><th>Estudiante</th><th>Curso</th><th>Tipo</th><th>Detalle</th></tr></thead><tbody>${warnings.map((warning) => `<tr><td>${escapeHTML(warning.fecha)}</td><td><strong>${escapeHTML(warning.alumno)}</strong></td><td>${escapeHTML(warning.curso)}</td><td>${renderPill(warning.tipo, "brick")}</td><td>${escapeHTML(warning.detalle)}</td></tr>`).join("") || `<tr><td colspan="5" class="table-empty">No hay amonestaciones registradas.</td></tr>`}</tbody></table></div></div>
  `;
}

function renderHijos() {
  setGreeting("Mis hijos");
  const children = getStudentChildren(currentUser.username);
  content.innerHTML = `
    ${renderSectionIntro("Cuenta familiar", "Mis hijos", "Selecciona a cada estudiante para revisar su información académica y formativa.")}
    <div class="children-grid">${children.map((child) => {
      const attendance = getStudentAttendance(child.username);
      const grades = getStudentGrades(child.username);
      const warnings = getStudentWarnings(child.username);
      return `<button class="child-card ${child.username === selectedChildUsername ? "active" : ""}" data-child-card="${child.username}"><div class="child-card-head"><span class="avatar large">${escapeHTML(child.iniciales)}</span><span class="child-card-arrow">→</span></div><h3>${escapeHTML(child.nombre)}</h3><p>${escapeHTML(child.curso)} · ${escapeHTML(child.nivel)}</p><div class="child-card-stats"><span><b>${getStudentAverage(child.username)}</b><small>promedio</small></span><span><b>${attendance.percent}%</b><small>asistencia</small></span><span><b>${warnings.length}</b><small>amonestaciones</small></span></div><div class="child-card-footer">${grades.length} evaluaciones registradas · Ver seguimiento</div></button>`;
    }).join("") || `<div class="panel empty-state"><div class="glyph">·</div>No hay hijos asociados a esta cuenta.</div>`}</div>
  `;
  document.querySelectorAll("[data-child-card]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedChildUsername = button.dataset.childCard;
      goToSection("inicio");
    });
  });
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

document.getElementById("logoutBtn").addEventListener("click", () => {
  clearSession();
  window.location.href = "index.html";
});

document.getElementById("mobileToggle").addEventListener("click", () => {
  document.getElementById("sidebar").classList.toggle("open");
});

initTopbar();
goToSection("inicio");
