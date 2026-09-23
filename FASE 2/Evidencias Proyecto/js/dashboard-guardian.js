/* Academy7 Apoderado view. */

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


