/* =========================================================
   Colegio Nuevo Horizonte — Panel principal
   ========================================================= */

// --- Guard de sesión ---
const currentUser = getCurrentUser();
if (!currentUser) {
  window.location.href = "index.html";
}

const db = getDatabase();
const content = document.getElementById("content");

const MESES_LARGO = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
];
const DIAS = [
  "domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"
];

function initTopbar() {
  document.getElementById("topAvatar").textContent = currentUser.iniciales;
  const now = new Date();
  document.getElementById("greetingDate").textContent =
    `${DIAS[now.getDay()]} ${now.getDate()} de ${MESES_LARGO[now.getMonth()]}`;
}

function setGreeting(sectionLabel) {
  document.getElementById("greetingTitle").textContent = sectionLabel;
}

// ---------- Renderizadores de sección ----------

function renderInicio() {
  setGreeting(`Hola, ${currentUser.nombre.split(" ")[0]}`);
  const cursos = db.courses[currentUser.username] || [];
  const eventos = db.calendar[currentUser.username] || [];
  const notas = db.grades[currentUser.username] || [];
  const mensajes = db.messages[currentUser.username] || [];

  const noLeidos = mensajes.filter((m) => !m.leido).length;
  const promedio = notas.length
    ? (notas.reduce((sum, n) => sum + n.nota, 0) / notas.length).toFixed(1)
    : "—";
  const proximoEvento = eventos[0];

  content.innerHTML = `
    <p class="section-sub">Resumen de tu semana en el colegio.</p>

    <div class="home-grid">
      <div class="panel">
        <h3>Próximos eventos</h3>
        <div class="calendar-list">
          ${eventos.slice(0, 3).map((ev) => `
            <div class="cal-row">
              <div class="cal-date">
                <div class="day">${ev.dia}</div>
                <div class="mon">${ev.mes}</div>
              </div>
              <div class="cal-info">
                <h4>${ev.titulo}</h4>
                <p>${ev.detalle}</p>
              </div>
            </div>
          `).join("") || `<div class="empty-state"><div class="glyph">·</div>No hay eventos próximos.</div>`}
        </div>
      </div>

      <div class="mini-stack">
        <div class="panel">
          <div class="mini-stat">
            <div class="num">${cursos.length}</div>
            <div class="cap">Cursos inscritos este semestre</div>
          </div>
        </div>
        <div class="panel">
          <div class="mini-stat">
            <div class="num">${promedio}</div>
            <div class="cap">Promedio general actual</div>
          </div>
        </div>
        <div class="panel">
          <div class="mini-stat">
            <div class="num">${noLeidos}</div>
            <div class="cap">Mensajes sin leer</div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderPerfil() {
  setGreeting("Perfil");
  content.innerHTML = `
    <p class="section-sub">Tu información como estudiante del colegio.</p>

    <div class="panel">
      <div class="profile-header">
        <div class="avatar">${currentUser.iniciales}</div>
        <div>
          <h2>${currentUser.nombre}</h2>
          <div class="role">${currentUser.rol} · ${currentUser.curso}</div>
        </div>
      </div>

      <div class="info-grid">
        <div class="info-item">
          <div class="k">RUT</div>
          <div class="v">${currentUser.rut}</div>
        </div>
        <div class="info-item">
          <div class="k">Curso</div>
          <div class="v">${currentUser.curso}</div>
        </div>
        <div class="info-item">
          <div class="k">Correo institucional</div>
          <div class="v">${currentUser.correo}</div>
        </div>
        <div class="info-item">
          <div class="k">Rol</div>
          <div class="v">${currentUser.rol}</div>
        </div>
      </div>
    </div>
  `;
}

function renderCursos() {
  setGreeting("Cursos");
  const cursos = db.courses[currentUser.username] || [];
  content.innerHTML = `
    <p class="section-sub">Asignaturas en las que estás inscrito/a este semestre.</p>

    <div class="course-grid">
      ${cursos.map((c) => `
        <div class="course-card">
          <h4>${c.nombre}</h4>
          <div class="teacher">${c.profesor}</div>
          <div class="meta">
            <span>${c.sala}</span>
            <span>${c.horario}</span>
          </div>
        </div>
      `).join("")}
    </div>
  `;
}

function renderCalendario() {
  setGreeting("Calendario");
  const eventos = db.calendar[currentUser.username] || [];
  content.innerHTML = `
    <p class="section-sub">Pruebas, entregas y actividades programadas.</p>

    <div class="panel">
      <div class="calendar-list">
        ${eventos.map((ev) => `
          <div class="cal-row">
            <div class="cal-date">
              <div class="day">${ev.dia}</div>
              <div class="mon">${ev.mes}</div>
            </div>
            <div class="cal-info">
              <h4>${ev.titulo}</h4>
              <p>${ev.detalle}</p>
            </div>
          </div>
        `).join("") || `<div class="empty-state"><div class="glyph">·</div>No tienes eventos programados.</div>`}
      </div>
    </div>
  `;
}

function renderNotas() {
  setGreeting("Notas / Calificaciones");
  const notas = db.grades[currentUser.username] || [];

  function pillFor(estado) {
    if (estado === "aprobado") return `<span class="pill green">Aprobado</span>`;
    if (estado === "insuficiente") return `<span class="pill brick">Insuficiente</span>`;
    return `<span class="pill gold">Pendiente</span>`;
  }

  content.innerHTML = `
    <p class="section-sub">Calificaciones registradas en el semestre actual.</p>

    <div class="panel">
      <div class="data-list">
        <div class="data-row head">
          <span>Asignatura</span>
          <span>Evaluación</span>
          <span>Nota</span>
        </div>
        ${notas.map((n) => `
          <div class="data-row">
            <span>${n.curso}</span>
            <span>${n.evaluacion}</span>
            <span>${n.nota.toFixed(1)} ${pillFor(n.estado)}</span>
          </div>
        `).join("")}
      </div>
    </div>
  `;
}

function renderMensajes() {
  setGreeting("Mensajes");
  const mensajes = db.messages[currentUser.username] || [];

  content.innerHTML = `
    <p class="section-sub">Comunicaciones de profesores y del colegio.</p>

    <div class="msg-layout">
      <div class="msg-list" id="msgList">
        ${mensajes.map((m, i) => `
          <button class="msg-item" data-index="${i}">
            <div class="from">
              <span>${m.de}</span>
              ${!m.leido ? '<span class="dot-unread"></span>' : ""}
            </div>
            <div class="preview">${m.asunto}</div>
          </button>
        `).join("")}
      </div>
      <div class="msg-detail" id="msgDetail">
        <div class="empty-state">
          <div class="glyph">·</div>
          Selecciona un mensaje para leerlo.
        </div>
      </div>
    </div>
  `;

  const items = content.querySelectorAll(".msg-item");
  items.forEach((btn) => {
    btn.addEventListener("click", () => {
      const idx = Number(btn.getAttribute("data-index"));
      const m = mensajes[idx];
      m.leido = true;

      // Persistir el estado leído
      db.messages[currentUser.username] = mensajes;
      localStorage.setItem(DB_KEY, JSON.stringify(db));

      items.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      btn.querySelector(".dot-unread")?.remove();

      document.getElementById("msgDetail").innerHTML = `
        <h3>${m.asunto}</h3>
        <div class="meta">De: ${m.de} · ${m.fecha}</div>
        <div class="body">${m.cuerpo.replace(/\n/g, "<br>")}</div>
      `;
    });
  });
}

// ---------- Router de secciones ----------

const sections = {
  inicio: renderInicio,
  perfil: renderPerfil,
  cursos: renderCursos,
  calendario: renderCalendario,
  notas: renderNotas,
  mensajes: renderMensajes
};

function goToSection(name) {
  document.querySelectorAll(".nav-link").forEach((btn) => {
    btn.classList.toggle("active", btn.getAttribute("data-section") === name);
  });
  (sections[name] || renderInicio)();
  document.getElementById("sidebar").classList.remove("open");
  window.scrollTo(0, 0);
}

document.querySelectorAll(".nav-link").forEach((btn) => {
  btn.addEventListener("click", () => goToSection(btn.getAttribute("data-section")));
});

document.getElementById("logoutBtn").addEventListener("click", () => {
  clearSession();
  window.location.href = "index.html";
});

document.getElementById("mobileToggle").addEventListener("click", () => {
  document.getElementById("sidebar").classList.toggle("open");
});

// ---------- Arranque ----------

initTopbar();
goToSection("inicio");
