/* =========================================================
   Colegio Nuevo Horizonte — Datos simulados
   Se inicializan en localStorage la primera vez que se abre.
   ========================================================= */

const DB_KEY = "cnh_db_v1";
const SESSION_KEY = "cnh_session_v1";

function seedDatabase() {
  const db = {
    users: [
      {
        username: "mrojas",
        password: "colegio2024",
        nombre: "María Fernanda Rojas",
        rol: "Estudiante",
        curso: "4to Medio A",
        rut: "21.345.678-9",
        correo: "mfernanda.rojas@colegionh.cl",
        iniciales: "MR"
      },
      {
        username: "jgomez",
        password: "colegio2024",
        nombre: "Joaquín Gómez",
        rol: "Estudiante",
        curso: "3ro Medio B",
        rut: "20.987.654-3",
        correo: "joaquin.gomez@colegionh.cl",
        iniciales: "JG"
      }
    ],
    courses: {
      mrojas: [
        { nombre: "Matemática", profesor: "Prof. Andrea Silva", sala: "Sala 12", horario: "Lun / Mié / Vie · 08:00" },
        { nombre: "Lenguaje y Comunicación", profesor: "Prof. Ricardo Peña", sala: "Sala 5", horario: "Mar / Jue · 09:30" },
        { nombre: "Biología", profesor: "Prof. Camila Torres", sala: "Lab. 2", horario: "Lun / Jue · 11:00" },
        { nombre: "Historia y Geografía", profesor: "Prof. Marco Iturra", sala: "Sala 12", horario: "Mié / Vie · 10:15" },
        { nombre: "Inglés", profesor: "Prof. Laura Bennett", sala: "Sala 8", horario: "Mar / Vie · 08:00" },
        { nombre: "Educación Física", profesor: "Prof. Diego Fuentes", sala: "Gimnasio", horario: "Jue · 14:00" }
      ],
      jgomez: [
        { nombre: "Matemática", profesor: "Prof. Andrea Silva", sala: "Sala 9", horario: "Lun / Mié / Vie · 08:00" },
        { nombre: "Lenguaje y Comunicación", profesor: "Prof. Ricardo Peña", sala: "Sala 4", horario: "Mar / Jue · 09:30" },
        { nombre: "Física", profesor: "Prof. Nicolás Reyes", sala: "Lab. 1", horario: "Lun / Vie · 11:00" },
        { nombre: "Artes Visuales", profesor: "Prof. Sofía León", sala: "Taller 1", horario: "Mié · 13:00" }
      ]
    },
    calendar: {
      mrojas: [
        { dia: "16", mes: "SEP", titulo: "Prueba de Matemática — Unidad 4", detalle: "Sala 12, 08:00 hrs. Contenido: funciones cuadráticas." },
        { dia: "18", mes: "SEP", titulo: "Entrega ensayo de Lenguaje", detalle: "Subir documento a la plataforma antes de las 23:59." },
        { dia: "22", mes: "SEP", titulo: "Salida a terreno — Biología", detalle: "Punto de encuentro: patio central, 09:00 hrs." },
        { dia: "30", mes: "SEP", titulo: "Reunión de apoderados", detalle: "Auditorio principal, 18:30 hrs." }
      ],
      jgomez: [
        { dia: "17", mes: "SEP", titulo: "Laboratorio de Física", detalle: "Lab. 1, traer informe previo impreso." },
        { dia: "19", mes: "SEP", titulo: "Prueba de Lenguaje", detalle: "Sala 4, 09:30 hrs. Comprensión lectora." },
        { dia: "25", mes: "SEP", titulo: "Muestra de Artes Visuales", detalle: "Taller 1, exposición de trabajos del semestre." }
      ]
    },
    grades: {
      mrojas: [
        { curso: "Matemática", evaluacion: "Prueba Unidad 3", nota: 6.2, estado: "aprobado" },
        { curso: "Lenguaje y Comunicación", evaluacion: "Ensayo argumentativo", nota: 5.4, estado: "aprobado" },
        { curso: "Biología", evaluacion: "Informe de laboratorio", nota: 4.8, estado: "aprobado" },
        { curso: "Historia y Geografía", evaluacion: "Control de lectura", nota: 3.9, estado: "insuficiente" },
        { curso: "Inglés", evaluacion: "Speaking test", nota: 6.7, estado: "aprobado" }
      ],
      jgomez: [
        { curso: "Matemática", evaluacion: "Prueba Unidad 3", nota: 5.1, estado: "aprobado" },
        { curso: "Física", evaluacion: "Informe de laboratorio", nota: 4.2, estado: "aprobado" },
        { curso: "Artes Visuales", evaluacion: "Proyecto semestral", nota: 6.9, estado: "aprobado" },
        { curso: "Lenguaje y Comunicación", evaluacion: "Control de lectura", nota: 3.5, estado: "insuficiente" }
      ]
    },
    messages: {
      mrojas: [
        {
          de: "Prof. Andrea Silva",
          asunto: "Material adicional — funciones cuadráticas",
          fecha: "12 sep",
          leido: false,
          cuerpo: "Hola María Fernanda,\n\nTe comparto la guía complementaria para repasar antes de la prueba del lunes. Revisa especialmente los ejercicios 4 al 9.\n\nCualquier duda, la conversamos en la próxima clase.\n\nSaludos,\nProf. Andrea Silva"
        },
        {
          de: "Dirección Académica",
          asunto: "Reunión de apoderados — 30 de septiembre",
          fecha: "10 sep",
          leido: false,
          cuerpo: "Estimada familia,\n\nLes recordamos que la próxima reunión de apoderados se realizará el 30 de septiembre a las 18:30 hrs en el auditorio principal.\n\nSe abordarán temas de cierre de semestre.\n\nAtentamente,\nDirección Académica"
        },
        {
          de: "Prof. Camila Torres",
          asunto: "Salida a terreno confirmada",
          fecha: "5 sep",
          leido: true,
          cuerpo: "Hola a todos,\n\nLa salida a terreno del 22 de septiembre está confirmada. Recuerden traer autorización firmada y ropa cómoda.\n\nNos vemos en el patio central a las 09:00 hrs.\n\nProf. Camila Torres"
        }
      ],
      jgomez: [
        {
          de: "Prof. Nicolás Reyes",
          asunto: "Informe previo — laboratorio",
          fecha: "13 sep",
          leido: false,
          cuerpo: "Hola Joaquín,\n\nNo olvides traer el informe previo impreso para la sesión de laboratorio del jueves. Sin este requisito no podrás participar de la actividad.\n\nSaludos,\nProf. Nicolás Reyes"
        },
        {
          de: "Prof. Sofía León",
          asunto: "Muestra de fin de semestre",
          fecha: "8 sep",
          leido: true,
          cuerpo: "Hola Joaquín,\n\nTu proyecto ha sido seleccionado para la muestra de artes visuales del 25 de septiembre. Por favor confirma tu asistencia para el montaje.\n\nSaludos,\nProf. Sofía León"
        }
      ]
    }
  };

  localStorage.setItem(DB_KEY, JSON.stringify(db));
  return db;
}

function getDatabase() {
  const raw = localStorage.getItem(DB_KEY);
  if (!raw) return seedDatabase();
  try {
    return JSON.parse(raw);
  } catch (e) {
    return seedDatabase();
  }
}

function findUser(username, password) {
  const db = getDatabase();
  return db.users.find(
    (u) => u.username === username.trim() && u.password === password
  );
}

function setSession(username) {
  localStorage.setItem(SESSION_KEY, username);
}

function getSession() {
  return localStorage.getItem(SESSION_KEY);
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

function getCurrentUser() {
  const username = getSession();
  if (!username) return null;
  const db = getDatabase();
  return db.users.find((u) => u.username === username) || null;
}
