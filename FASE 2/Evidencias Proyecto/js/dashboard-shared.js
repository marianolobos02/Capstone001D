/* Academy7 shared dashboard utilities and role context. */

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
const courseViewState = {};
const courseAttendanceDateState = {};
let teacherMessagesHydrated = false;

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


