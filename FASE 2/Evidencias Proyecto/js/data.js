/* =========================================================
   Academy7 — Datos simulados para la evidencia de proyecto
   Tres tipos de cuenta: Docente, Apoderado y Estudiante.
   ========================================================= */

const DB_KEY = "cnh_db_v5";
const SESSION_KEY = "cnh_session_v1";

function seedDatabase() {
  const db = {
    schoolLevels: [
      "1° Básico", "2° Básico", "3° Básico", "4° Básico",
      "5° Básico", "6° Básico", "7° Básico", "8° Básico",
      "1° Medio", "2° Medio", "3° Medio", "4° Medio"
    ],
    users: [
      {
        username: "asilva",
        password: "colegio2024",
        nombre: "Andrea Silva",
        rol: "Docente",
        rut: "15.234.567-8",
        correo: "andrea.silva@academy7.cl",
        telefono: "+56 9 8765 4321",
        departamento: "Departamento de Matemática",
        iniciales: "AS"
      },
      {
        username: "cfuentes",
        password: "colegio2024",
        nombre: "Carolina Fuentes",
        rol: "Apoderado",
        rut: "13.765.432-1",
        correo: "carolina.fuentes@email.cl",
        telefono: "+56 9 6655 4433",
        direccion: "Av. Los Robles 1240, Santiago",
        iniciales: "CF"
      },
      {
        username: "mrojas",
        password: "colegio2024",
        nombre: "María Fernanda Rojas",
        rol: "Estudiante",
        curso: "4° Medio A",
        nivel: "4° Medio",
        rut: "21.345.678-9",
        correo: "mfernanda.rojas@academy7.cl",
        iniciales: "MR"
      },
      {
        username: "jgomez",
        password: "colegio2024",
        nombre: "Joaquín Gómez",
        rol: "Estudiante",
        curso: "3° Medio B",
        nivel: "3° Medio",
        rut: "20.987.654-3",
        correo: "joaquin.gomez@academy7.cl",
        iniciales: "JG"
      },
      {
        username: "lgonzalez",
        password: "colegio2024",
        nombre: "Lucía González",
        rol: "Estudiante",
        curso: "8° Básico A",
        nivel: "8° Básico",
        rut: "22.456.789-0",
        correo: "lucia.gonzalez@academy7.cl",
        iniciales: "LG"
      }
    ],

    /* Cursos registrados por cada estudiante. */
    courses: {
      mrojas: [
        { nombre: "Matemática", profesor: "Prof. Andrea Silva", sala: "Sala 12", horario: "Lun / Mié / Vie · 08:00" },
        { nombre: "Lengua y Literatura", profesor: "Prof. Ricardo Peña", sala: "Sala 5", horario: "Mar / Jue · 09:30" },
        { nombre: "Biología", profesor: "Prof. Camila Torres", sala: "Lab. 2", horario: "Lun / Jue · 11:00" },
        { nombre: "Historia, Geografía y Cs. Sociales", profesor: "Prof. Marco Iturra", sala: "Sala 12", horario: "Mié / Vie · 10:15" },
        { nombre: "Inglés", profesor: "Prof. Laura Bennett", sala: "Sala 8", horario: "Mar / Vie · 08:00" },
        { nombre: "Educación Física", profesor: "Prof. Diego Fuentes", sala: "Gimnasio", horario: "Jue · 14:00" }
      ],
      jgomez: [
        { nombre: "Matemática", profesor: "Prof. Andrea Silva", sala: "Sala 9", horario: "Lun / Mié / Vie · 08:00" },
        { nombre: "Lengua y Literatura", profesor: "Prof. Ricardo Peña", sala: "Sala 4", horario: "Mar / Jue · 09:30" },
        { nombre: "Física", profesor: "Prof. Nicolás Reyes", sala: "Lab. 1", horario: "Lun / Vie · 11:00" },
        { nombre: "Artes Visuales", profesor: "Prof. Sofía León", sala: "Taller 1", horario: "Mié · 13:00" }
      ],
      lgonzalez: [
        { nombre: "Matemática", profesor: "Prof. Andrea Silva", sala: "Sala 3", horario: "Lun / Mié · 08:00" },
        { nombre: "Lengua y Literatura", profesor: "Prof. Paula Díaz", sala: "Sala 3", horario: "Mar / Jue · 09:30" },
        { nombre: "Ciencias Naturales", profesor: "Prof. Tomás Vera", sala: "Lab. 2", horario: "Lun / Vie · 11:00" },
        { nombre: "Historia, Geografía y Cs. Sociales", profesor: "Prof. Elisa Muñoz", sala: "Sala 3", horario: "Mié / Vie · 10:15" },
        { nombre: "Inglés", profesor: "Prof. Laura Bennett", sala: "Sala 8", horario: "Jue · 12:00" }
      ]
    },

    /* Horario semanal de los estudiantes. La estructura sigue los niveles
       chilenos: 1° a 8° Básico y 1° a 4° Medio. */
    schedules: {
      mrojas: [
        { dia: "Lunes", bloques: [{ hora: "08:00–09:30", curso: "Matemática", sala: "Sala 12" }, { hora: "11:00–12:30", curso: "Biología", sala: "Lab. 2" }] },
        { dia: "Martes", bloques: [{ hora: "08:00–09:30", curso: "Inglés", sala: "Sala 8" }, { hora: "09:30–11:00", curso: "Lengua y Literatura", sala: "Sala 5" }] },
        { dia: "Miércoles", bloques: [{ hora: "08:00–09:30", curso: "Matemática", sala: "Sala 12" }, { hora: "10:15–11:45", curso: "Historia, Geografía y Cs. Sociales", sala: "Sala 12" }] },
        { dia: "Jueves", bloques: [{ hora: "09:30–11:00", curso: "Lengua y Literatura", sala: "Sala 5" }, { hora: "11:00–12:30", curso: "Biología", sala: "Lab. 2" }, { hora: "14:00–15:30", curso: "Educación Física", sala: "Gimnasio" }] },
        { dia: "Viernes", bloques: [{ hora: "08:00–09:30", curso: "Inglés", sala: "Sala 8" }, { hora: "10:15–11:45", curso: "Historia, Geografía y Cs. Sociales", sala: "Sala 12" }, { hora: "12:00–13:30", curso: "Matemática", sala: "Sala 12" }] }
      ],
      jgomez: [
        { dia: "Lunes", bloques: [{ hora: "08:00–09:30", curso: "Matemática", sala: "Sala 9" }, { hora: "11:00–12:30", curso: "Física", sala: "Lab. 1" }] },
        { dia: "Martes", bloques: [{ hora: "09:30–11:00", curso: "Lengua y Literatura", sala: "Sala 4" }, { hora: "12:00–13:30", curso: "Inglés", sala: "Sala 7" }] },
        { dia: "Miércoles", bloques: [{ hora: "08:00–09:30", curso: "Matemática", sala: "Sala 9" }, { hora: "13:00–14:30", curso: "Artes Visuales", sala: "Taller 1" }] },
        { dia: "Jueves", bloques: [{ hora: "09:30–11:00", curso: "Lengua y Literatura", sala: "Sala 4" }, { hora: "12:00–13:30", curso: "Inglés", sala: "Sala 7" }] },
        { dia: "Viernes", bloques: [{ hora: "08:00–09:30", curso: "Matemática", sala: "Sala 9" }, { hora: "11:00–12:30", curso: "Física", sala: "Lab. 1" }] }
      ],
      lgonzalez: [
        { dia: "Lunes", bloques: [{ hora: "08:00–09:30", curso: "Matemática", sala: "Sala 3" }, { hora: "11:00–12:30", curso: "Ciencias Naturales", sala: "Lab. 2" }] },
        { dia: "Martes", bloques: [{ hora: "09:30–11:00", curso: "Lengua y Literatura", sala: "Sala 3" }, { hora: "12:00–13:30", curso: "Inglés", sala: "Sala 8" }] },
        { dia: "Miércoles", bloques: [{ hora: "08:00–09:30", curso: "Matemática", sala: "Sala 3" }, { hora: "10:15–11:45", curso: "Historia, Geografía y Cs. Sociales", sala: "Sala 3" }] },
        { dia: "Jueves", bloques: [{ hora: "09:30–11:00", curso: "Lengua y Literatura", sala: "Sala 3" }, { hora: "12:00–13:30", curso: "Inglés", sala: "Sala 8" }] },
        { dia: "Viernes", bloques: [{ hora: "08:00–09:30", curso: "Matemática", sala: "Sala 3" }, { hora: "11:00–12:30", curso: "Ciencias Naturales", sala: "Lab. 2" }, { hora: "10:15–11:45", curso: "Historia, Geografía y Cs. Sociales", sala: "Sala 3" }] }
      ]
    },

    calendar: {
      mrojas: [
        { dia: "16", mes: "SEP", titulo: "Prueba de Matemática — Unidad 4", detalle: "Sala 12, 08:00 hrs. Contenido: funciones cuadráticas." },
        { dia: "18", mes: "SEP", titulo: "Entrega ensayo de Lengua y Literatura", detalle: "Subir documento a la plataforma antes de las 23:59." },
        { dia: "22", mes: "SEP", titulo: "Salida a terreno — Biología", detalle: "Punto de encuentro: patio central, 09:00 hrs." },
        { dia: "30", mes: "SEP", titulo: "Reunión de apoderados", detalle: "Auditorio principal, 18:30 hrs." }
      ],
      jgomez: [
        { dia: "17", mes: "SEP", titulo: "Laboratorio de Física", detalle: "Lab. 1, traer informe previo impreso." },
        { dia: "19", mes: "SEP", titulo: "Prueba de Lengua y Literatura", detalle: "Sala 4, 09:30 hrs. Comprensión lectora." },
        { dia: "25", mes: "SEP", titulo: "Muestra de Artes Visuales", detalle: "Taller 1, exposición de trabajos del semestre." }
      ],
      lgonzalez: [
        { dia: "18", mes: "SEP", titulo: "Control de Matemática", detalle: "Sala 3, 08:00 hrs. Fracciones y proporcionalidad." },
        { dia: "23", mes: "SEP", titulo: "Feria de Ciencias", detalle: "Patio techado, presentar proyecto del curso." },
        { dia: "30", mes: "SEP", titulo: "Reunión de apoderados", detalle: "Auditorio principal, 18:30 hrs." }
      ]
    },

    grades: {
      mrojas: [
        { curso: "Matemática", evaluacion: "Prueba Unidad 3", nota: 6.2, estado: "aprobado" },
        { curso: "Lengua y Literatura", evaluacion: "Ensayo argumentativo", nota: 5.4, estado: "aprobado" },
        { curso: "Biología", evaluacion: "Informe de laboratorio", nota: 4.8, estado: "aprobado" },
        { curso: "Historia, Geografía y Cs. Sociales", evaluacion: "Control de lectura", nota: 3.9, estado: "insuficiente" },
        { curso: "Inglés", evaluacion: "Speaking test", nota: 6.7, estado: "aprobado" },
        { curso: "Educación Física", evaluacion: "Rendimiento físico", nota: 6.5, estado: "aprobado" }
      ],
      jgomez: [
        { curso: "Matemática", evaluacion: "Prueba Unidad 3", nota: 5.1, estado: "aprobado" },
        { curso: "Física", evaluacion: "Informe de laboratorio", nota: 4.2, estado: "aprobado" },
        { curso: "Artes Visuales", evaluacion: "Proyecto semestral", nota: 6.9, estado: "aprobado" },
        { curso: "Lengua y Literatura", evaluacion: "Control de lectura", nota: 3.5, estado: "insuficiente" }
      ],
      lgonzalez: [
        { curso: "Matemática", evaluacion: "Prueba de fracciones", nota: 6.0, estado: "aprobado" },
        { curso: "Lengua y Literatura", evaluacion: "Comprensión lectora", nota: 5.8, estado: "aprobado" },
        { curso: "Ciencias Naturales", evaluacion: "Maqueta del ecosistema", nota: 6.4, estado: "aprobado" },
        { curso: "Historia, Geografía y Cs. Sociales", evaluacion: "Trabajo de investigación", nota: 5.5, estado: "aprobado" },
        { curso: "Inglés", evaluacion: "Vocabulary test", nota: 6.1, estado: "aprobado" }
      ]
    },

    attendance: {
      mrojas: {
        percent: 94,
        total: 112,
        attended: 105,
        absences: 7,
        late: 3,
        byCourse: [
          { curso: "Matemática", porcentaje: 96, asistidas: "24/25" },
          { curso: "Lengua y Literatura", porcentaje: 92, asistidas: "22/24" },
          { curso: "Biología", porcentaje: 95, asistidas: "20/21" },
          { curso: "Historia, Geografía y Cs. Sociales", porcentaje: 91, asistidas: "20/22" },
          { curso: "Inglés", porcentaje: 96, asistidas: "13/14" },
          { curso: "Educación Física", porcentaje: 100, asistidas: "6/6" }
        ]
      },
      jgomez: {
        percent: 88,
        total: 96,
        attended: 84,
        absences: 12,
        late: 5,
        byCourse: [
          { curso: "Matemática", porcentaje: 90, asistidas: "18/20" },
          { curso: "Lengua y Literatura", porcentaje: 87, asistidas: "20/23" },
          { curso: "Física", porcentaje: 86, asistidas: "18/21" },
          { curso: "Artes Visuales", porcentaje: 90, asistidas: "18/20" }
        ]
      },
      lgonzalez: {
        percent: 97,
        total: 104,
        attended: 101,
        absences: 3,
        late: 1,
        byCourse: [
          { curso: "Matemática", porcentaje: 100, asistidas: "22/22" },
          { curso: "Lengua y Literatura", porcentaje: 95, asistidas: "20/21" },
          { curso: "Ciencias Naturales", porcentaje: 96, asistidas: "21/22" },
          { curso: "Historia, Geografía y Cs. Sociales", porcentaje: 95, asistidas: "20/21" },
          { curso: "Inglés", porcentaje: 100, asistidas: "18/18" }
        ]
      }
    },

    warnings: {
      mrojas: [
        { fecha: "04 sep 2026", tipo: "Observación académica", curso: "Historia, Geografía y Cs. Sociales", detalle: "Se recomienda reforzar lectura de fuentes históricas.", estado: "En seguimiento" }
      ],
      jgomez: [
        { fecha: "29 ago 2026", tipo: "Atrasos reiterados", curso: "Convivencia escolar", detalle: "Tres atrasos registrados durante el mes de agosto.", estado: "Informada" },
        { fecha: "12 ago 2026", tipo: "Observación académica", curso: "Lengua y Literatura", detalle: "Evaluación pendiente de recuperación.", estado: "Pendiente" }
      ],
      lgonzalez: []
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
        }
      ],
      lgonzalez: []
    },

    /* Cursos a cargo de la docente. Cada curso contiene su lista de alumnos,
       promedio, asistencia y amonestaciones para gestionar el curso completo. */
    teacherCourses: {
      asilva: [
        {
          id: "mat-4a",
          nombre: "Matemática",
          curso: "4° Medio A",
          sala: "Sala 12",
          horario: "Lun / Mié / Vie · 08:00",
          periodo: "Año escolar 2026",
          students: [
            { username: "mrojas", nombre: "María Fernanda Rojas", promedio: 6.2, asistencia: 94, amonestaciones: 0, ultimaEvaluacion: "Prueba 3", estado: "Regular", evaluaciones: { prueba1: 6.0, prueba2: 6.3, prueba3: 6.2, examen: 6.3 }, warnings: [] },
            { username: "pmartinez", nombre: "Pablo Martínez", promedio: 5.8, asistencia: 91, amonestaciones: 1, ultimaEvaluacion: "Prueba 3", estado: "En seguimiento", evaluaciones: { prueba1: 5.5, prueba2: 5.9, prueba3: 6.0, examen: 5.8 }, warnings: [{ fecha: "02 sep 2026", tipo: "Atraso", detalle: "Ingreso posterior al inicio de la clase." }] },
            { username: "asoto", nombre: "Antonia Soto", promedio: 6.6, asistencia: 98, amonestaciones: 0, ultimaEvaluacion: "Prueba 3", estado: "Regular", evaluaciones: { prueba1: 6.7, prueba2: 6.5, prueba3: 6.8, examen: 6.4 }, warnings: [] },
            { username: "dcastro", nombre: "Diego Castro", promedio: 4.9, asistencia: 86, amonestaciones: 2, ultimaEvaluacion: "Prueba 3", estado: "Prioridad de apoyo", evaluaciones: { prueba1: 4.5, prueba2: 5.1, prueba3: 4.3, examen: 5.7 }, warnings: [{ fecha: "05 sep 2026", tipo: "Rendimiento", detalle: "Resultado insuficiente en la última evaluación." }, { fecha: "29 ago 2026", tipo: "Inasistencia", detalle: "Inasistencia sin justificar." }] }
          ],
          attendanceRecords: []
        },
        {
          id: "mat-3b",
          nombre: "Matemática",
          curso: "3° Medio B",
          sala: "Sala 9",
          horario: "Lun / Mié / Vie · 08:00",
          periodo: "Año escolar 2026",
          students: [
            { username: "jgomez", nombre: "Joaquín Gómez", promedio: 5.1, asistencia: 88, amonestaciones: 1, ultimaEvaluacion: "Prueba 3", estado: "En seguimiento", evaluaciones: { prueba1: 5.0, prueba2: 5.2, prueba3: 4.8, examen: 5.4 }, warnings: [{ fecha: "29 ago 2026", tipo: "Atrasos reiterados", detalle: "Tres atrasos registrados durante el mes." }] },
            { username: "nfuentes", nombre: "Nicolás Fuentes", promedio: 6.0, asistencia: 95, amonestaciones: 0, ultimaEvaluacion: "Prueba 3", estado: "Regular", evaluaciones: { prueba1: 6.2, prueba2: 5.8, prueba3: 6.1, examen: 5.9 }, warnings: [] },
            { username: "cvera", nombre: "Catalina Vera", promedio: 5.5, asistencia: 93, amonestaciones: 0, ultimaEvaluacion: "Prueba 3", estado: "Regular", evaluaciones: { prueba1: 5.4, prueba2: 5.6, prueba3: 5.2, examen: 5.8 }, warnings: [] },
            { username: "fespinoza", nombre: "Felipe Espinoza", promedio: 4.2, asistencia: 82, amonestaciones: 2, ultimaEvaluacion: "Prueba 3", estado: "Prioridad de apoyo", evaluaciones: { prueba1: 4.0, prueba2: 4.5, prueba3: 3.8, examen: 4.5 }, warnings: [{ fecha: "08 sep 2026", tipo: "Rendimiento", detalle: "Dos evaluaciones bajo 4,0 durante el semestre." }, { fecha: "22 ago 2026", tipo: "Convivencia", detalle: "Situación derivada a orientación." }] }
          ],
          attendanceRecords: []
        },
        {
          id: "mat-8a",
          nombre: "Matemática",
          curso: "8° Básico A",
          sala: "Sala 3",
          horario: "Lun / Mié · 08:00",
          periodo: "Año escolar 2026",
          students: [
            { username: "lgonzalez", nombre: "Lucía González", promedio: 6.0, asistencia: 97, amonestaciones: 0, ultimaEvaluacion: "Prueba 3", estado: "Regular", evaluaciones: { prueba1: 5.9, prueba2: 6.2, prueba3: 6.0, examen: 5.9 }, warnings: [] },
            { username: "mreyes", nombre: "Martina Reyes", promedio: 5.7, asistencia: 94, amonestaciones: 0, ultimaEvaluacion: "Prueba 3", estado: "Regular", evaluaciones: { prueba1: 5.6, prueba2: 5.8, prueba3: 5.5, examen: 5.9 }, warnings: [] },
            { username: "bnavarro", nombre: "Benjamín Navarro", promedio: 5.2, asistencia: 90, amonestaciones: 1, ultimaEvaluacion: "Prueba 3", estado: "En seguimiento", evaluaciones: { prueba1: 5.0, prueba2: 5.4, prueba3: 4.8, examen: 5.6 }, warnings: [{ fecha: "03 sep 2026", tipo: "Materiales", detalle: "No presentó materiales de trabajo." }] }
          ],
          attendanceRecords: []
        }
      ]
    },

    teacherSchedule: {
      asilva: [
        { dia: "Lunes", bloques: [{ hora: "08:00–09:30", curso: "Matemática · 4° Medio A", sala: "Sala 12" }, { hora: "09:45–11:15", curso: "Planificación", sala: "Sala docente" }, { hora: "11:30–13:00", curso: "Matemática · 3° Medio B", sala: "Sala 9" }] },
        { dia: "Martes", bloques: [{ hora: "08:00–09:30", curso: "Atención de apoderados", sala: "Sala docente" }, { hora: "10:00–11:30", curso: "Consejo de profesores", sala: "Auditorio" }] },
        { dia: "Miércoles", bloques: [{ hora: "08:00–09:30", curso: "Matemática · 4° Medio A", sala: "Sala 12" }, { hora: "11:30–13:00", curso: "Matemática · 8° Básico A", sala: "Sala 3" }] },
        { dia: "Jueves", bloques: [{ hora: "08:00–09:30", curso: "Evaluación diferenciada", sala: "Sala docente" }, { hora: "11:30–13:00", curso: "Reunión de ciclo", sala: "Sala de reuniones" }] },
        { dia: "Viernes", bloques: [{ hora: "08:00–09:30", curso: "Matemática · 4° Medio A", sala: "Sala 12" }, { hora: "11:30–13:00", curso: "Matemática · 3° Medio B", sala: "Sala 9" }] }
      ]
    },

    teacherCalendar: {
      asilva: [
        { dia: "16", mes: "SEP", titulo: "Aplicación prueba Unidad 4 — 4° Medio A", detalle: "Sala 12, 08:00 hrs. Registrar calificaciones al finalizar." },
        { dia: "18", mes: "SEP", titulo: "Reunión de apoderados — 4° Medio A", detalle: "Auditorio principal, 18:30 hrs." },
        { dia: "23", mes: "SEP", titulo: "Consejo de evaluación", detalle: "Sala de reuniones, 16:00 hrs." },
        { dia: "30", mes: "SEP", titulo: "Cierre de calificaciones del mes", detalle: "Ingresar notas y observaciones pendientes." }
      ]
    },

    teacherMessages: {
      asilva: [
        {
          id: "tm-001",
          destinatario: "apoderado",
          nombre: "Carolina Fuentes",
          relacionado: "María Fernanda Rojas · 4° Medio A",
          asunto: "Seguimiento de asistencia — María Fernanda",
          fecha: "15 sep 2026",
          leido: false,
          cuerpo: "Estimada Carolina,\n\nQuería comentarte que María Fernanda mantiene un 94% de asistencia en Matemática y un buen desempeño general.\n\nSeguiremos reforzando los contenidos de la próxima evaluación.\n\nSaludos,\nProf. Andrea Silva"
        },
        {
          id: "tm-002",
          destinatario: "estudiante",
          nombre: "Joaquín Gómez",
          relacionado: "Matemática · 3° Medio B",
          asunto: "Material de apoyo para Prueba 3",
          fecha: "14 sep 2026",
          leido: false,
          cuerpo: "Hola Joaquín,\n\nTe dejo disponible el material de apoyo para preparar la Prueba 3. Revisa especialmente los ejercicios de funciones.\n\nSi necesitas una tutoría, escríbeme para coordinar un horario.\n\nProf. Andrea Silva"
        },
        {
          id: "tm-003",
          destinatario: "apoderado",
          nombre: "Apoderados 4° Medio A",
          relacionado: "Matemática · 4° Medio A",
          asunto: "Reunión de apoderados — 18 de septiembre",
          fecha: "12 sep 2026",
          leido: true,
          cuerpo: "Estimadas familias,\n\nLes recuerdo que la reunión de apoderados se realizará el viernes 18 de septiembre a las 18:30 hrs en el auditorio principal.\n\nSaludos cordiales,\nProf. Andrea Silva"
        }
      ]
    },

    guardianChildren: {
      cfuentes: ["mrojas", "lgonzalez"]
    }
  };

  // La demo comienza sin notas ni amonestaciones para que el docente las
  // registre manualmente. Los cambios posteriores se mantienen localmente
  // y, cuando Firebase está disponible, también en Firestore.
  Object.values(db.teacherCourses).flat().forEach((course) => {
    course.students.forEach((student) => {
      student.promedio = null;
      student.asistencia = 0;
      student.amonestaciones = 0;
      student.ultimaEvaluacion = "";
      student.estado = "Pendiente";
      student.evaluaciones = {};
      student.warnings = [];
    });
    course.attendanceRecords = [];
  });

  localStorage.setItem(DB_KEY, JSON.stringify(db));
  return db;
}

function getDatabase() {
  const raw = localStorage.getItem(DB_KEY);
  if (!raw) return seedDatabase();
  try {
    const db = JSON.parse(raw);
    if (!db.users || !db.teacherCourses || !db.attendance) return seedDatabase();
    return db;
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

function getUserByUsername(username) {
  const db = getDatabase();
  return db.users.find((u) => u.username === username) || null;
}

function getRoleKey(user) {
  if (!user) return "estudiante";
  return ({ Docente: "docente", Apoderado: "apoderado", Estudiante: "estudiante" })[user.rol] || "estudiante";
}

function getInitials(name) {
  return String(name || "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function getStudentAverage(username) {
  const db = getDatabase();
  const grades = db.grades[username] || [];
  if (!grades.length) return "—";
  return (grades.reduce((sum, item) => sum + Number(item.nota || 0), 0) / grades.length).toFixed(1);
}

function getStudentChildren(username) {
  const db = getDatabase();
  return (db.guardianChildren[username] || [])
    .map((childUsername) => db.users.find((user) => user.username === childUsername))
    .filter(Boolean);
}

function getTeacherWarnings(username) {
  const db = getDatabase();
  return (db.teacherCourses[username] || []).flatMap((course) =>
    course.students.flatMap((student) => (student.warnings || []).map((warning) => ({
      ...warning,
      alumno: student.nombre,
      curso: course.curso,
      username: student.username
    })))
  );
}

function getStudentWarnings(username) {
  const db = getDatabase();
  return db.warnings[username] || [];
}

function getStudentAttendance(username) {
  const db = getDatabase();
  return db.attendance[username] || { percent: 0, total: 0, attended: 0, absences: 0, late: 0, byCourse: [] };
}

function getStudentGrades(username) {
  const db = getDatabase();
  return db.grades[username] || [];
}

function getStudentEvents(username) {
  const db = getDatabase();
  return db.calendar[username] || [];
}

function getStudentCourses(username) {
  const db = getDatabase();
  return db.courses[username] || [];
}

function getStudentSchedule(username) {
  const db = getDatabase();
  return db.schedules[username] || [];
}

function getTeacherCourses(username) {
  const db = getDatabase();
  return db.teacherCourses[username] || [];
}

function getTeacherSchedule(username) {
  const db = getDatabase();
  return db.teacherSchedule[username] || [];
}

function getTeacherEvents(username) {
  const db = getDatabase();
  return db.teacherCalendar[username] || [];
}

function getTeacherMessages(username) {
  const db = getDatabase();
  return db.teacherMessages?.[username] || [];
}

function getMessages(username) {
  const db = getDatabase();
  return db.messages[username] || [];
}

function persistDatabase(db) {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

// La cuenta de prueba activa se usa también desde las tarjetas del login.
window.ACADEMY7_DEMO_ACCOUNTS = [
  { username: "asilva", password: "colegio2024", role: "Docente", name: "Andrea Silva" },
  { username: "cfuentes", password: "colegio2024", role: "Apoderado", name: "Carolina Fuentes" },
  { username: "mrojas", password: "colegio2024", role: "Estudiante", name: "María Fernanda Rojas" }
];

window.Academy7Data = {
  getRoleKey,
  getInitials,
  getStudentAverage,
  getStudentChildren,
  getTeacherWarnings,
  getStudentWarnings,
  getStudentAttendance,
  getStudentGrades,
  getStudentEvents,
  getStudentCourses,
  getStudentSchedule,
  getTeacherCourses,
  getTeacherSchedule,
  getTeacherEvents,
  getTeacherMessages,
  getMessages,
  persistDatabase
};

// Inicializa la demo al abrir el sitio por primera vez.
getDatabase();

// Compatible con páginas de la evidencia que usen estas funciones sin namespace.
function getDataApi() {
  return window.Academy7Data;
}

// Fin de data.js
