/* Academy7 — semilla ampliada del colegio.
   Genera los cursos 1° Básico–4° Medio, cuentas y relaciones familiares.
   La contraseña inicial de las cuentas generadas es Academy2026! y debe
   cambiarse en un entorno real. */
(function () {
  const GENERATED_PASSWORD = "Academy2026!";
  const firstNames = ["Agustina", "Alejandro", "Antonia", "Benjamín", "Camila", "Catalina", "Constanza", "Daniela", "Diego", "Emilia", "Felipe", "Fernanda", "Florencia", "Gabriel", "Ignacia", "Javiera", "Joaquín", "José", "Josefa", "Juan", "Laura", "Leonardo", "Lucas", "Lucía", "マルティナ", "Matías", "Maximiliano", "Martina", "Nicolás", "Pablo", "Renata", "Rodrigo", "Samuel", "Santiago", "Sofía", "Tomás", "Valentina", "Vicente"];
  const lastNames = ["Araya", "Bravo", "Cáceres", "Contreras", "Díaz", "Espinoza", "Fuentes", "Garrido", "Gómez", "González", "Herrera", "Leiva", "Maldonado", "Martínez", "Muñoz", "Navarro", "Ortega", "Paredes", "Pérez", "Ramírez", "Reyes", "Rojas", "Sanhueza", "Sepúlveda", "Soto", "Torres", "Valdés", "Vargas", "Vera", "Zúñiga"];
  const teacherNames = ["Andrea Silva", "Ricardo Peña", "Camila Torres", "Marco Iturra", "Laura Bennett", "Diego Fuentes", "Paula Díaz", "Tomás Vera", "Elisa Muñoz", "Nicolás Reyes", "Sofía León", "Carolina Vidal"];
  const subjects = ["Matemática", "Lengua y Literatura", "Ciencias Naturales", "Historia, Geografía y Cs. Sociales", "Inglés", "Educación Física"];
  const subjectRooms = ["Sala 1", "Sala 2", "Sala 3", "Sala 4", "Sala 5", "Gimnasio"];
  const levels = [];
  for (let i = 1; i <= 8; i += 1) levels.push({ label: `${i}° Básico`, slug: `${i}basico`, letters: ["A", "B", "C", "D"] });
  for (let i = 1; i <= 4; i += 1) levels.push({ label: `${i}° Medio`, slug: `${i}medio`, letters: ["A", "B", "C"] });

  function slug(value) {
    return String(value).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "").slice(0, 24);
  }
  function initials(name) { return name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase(); }
  function studentName(index) { return `${firstNames[index % firstNames.length]} ${lastNames[Math.floor(index / firstNames.length) % lastNames.length]}`; }
  function makeCourse(id, level, letter, teacherUsername, students) {
    const subject = subjects[id.length % subjects.length];
    return { id, nombre: subject, curso: `${level.label} ${letter}`, sala: subjectRooms[id.length % subjectRooms.length], horario: "Lun / Mié / Vie · 08:00", periodo: "Año escolar 2026", teacherUsername, students, attendanceRecords: [] };
  }
  function makeStudent(username, name, courseLabel, level, index) {
    return { username, password: GENERATED_PASSWORD, nombre: name, rol: "Estudiante", curso: courseLabel, nivel: level, rut: `24.${String(index + 100000).slice(-6)}-${(index % 9) + 1}`, correo: `${username}@academy7.cl`, iniciales: initials(name) };
  }

  window.Academy7SchoolSeed = function expandSchoolDatabase(db) {
    const usersByUsername = new Map(db.users.map((user) => [user.username, user]));
    const teacherCourses = {};
    const teacherSchedule = {};
    const teacherCalendar = {};
    const teacherMessages = {};
    const guardianChildren = { ...(db.guardianChildren || {}) };
    const coursesByStudent = {};
    const schedules = {};
    const calendar = {};
    const grades = {};
    const attendance = {};
    const warnings = {};
    const messages = {};
    let studentIndex = 0;
    let courseIndex = 0;
    const allStudentUsernames = [];

    teacherNames.forEach((name, index) => {
      const username = index === 0 ? "asilva" : `docente${String(index + 1).padStart(2, "0")}`;
      if (!usersByUsername.has(username)) usersByUsername.set(username, { username, password: GENERATED_PASSWORD, nombre: name, rol: "Docente", correo: `${slug(name)}@academy7.cl`, iniciales: initials(name), departamento: "Equipo académico" });
      teacherCourses[username] = [];
      teacherSchedule[username] = [];
      teacherCalendar[username] = [];
      teacherMessages[username] = [];
    });

    const specialStudents = {
      "4medio-A": ["mrojas", "pmartinez", "asoto", "dcastro"],
      "3medio-B": ["jgomez"],
      "8basico-A": ["lgonzalez"]
    };
    const specialNames = { mrojas: "María Fernanda Rojas", pmartinez: "Pablo Martínez", asoto: "Antonia Soto", dcastro: "Diego Castro", jgomez: "Joaquín Gómez", lgonzalez: "Lucía González" };

    levels.forEach((level) => level.letters.forEach((letter) => {
      const sectionKey = `${level.slug}-${letter}`;
      const courseLabel = `${level.label} ${letter}`;
      const teacherUsername = `docente${String(courseIndex % teacherNames.length + 1).padStart(2, "0")}`;
      const assignedTeacher = courseIndex % teacherNames.length === 0 ? "asilva" : teacherUsername;
      const names = specialStudents[sectionKey] || [];
      const roster = [];
      const targetSize = 30 + (courseIndex % 7);
      names.forEach((username) => {
        const name = specialNames[username];
        roster.push({ username, nombre: name, promedio: null, asistencia: 0, amonestaciones: 0, ultimaEvaluacion: "", estado: "Pendiente", evaluaciones: {}, warnings: [] });
        const existing = usersByUsername.get(username);
        if (existing) { existing.curso = courseLabel; existing.nivel = level.label; existing.correo = `${username}@academy7.cl`; }
        else usersByUsername.set(username, makeStudent(username, name, courseLabel, level.label, studentIndex));
        allStudentUsernames.push(username);
        studentIndex += 1;
      });
      while (roster.length < targetSize) {
        const name = studentName(studentIndex);
        const username = `est${String(studentIndex + 1).padStart(4, "0")}`;
        roster.push({ username, nombre: name, promedio: null, asistencia: 0, amonestaciones: 0, ultimaEvaluacion: "", estado: "Pendiente", evaluaciones: {}, warnings: [] });
        usersByUsername.set(username, makeStudent(username, name, courseLabel, level.label, studentIndex));
        allStudentUsernames.push(username);
        studentIndex += 1;
      }
      const course = makeCourse(`curso-${sectionKey}`, level, letter, assignedTeacher, roster);
      teacherCourses[assignedTeacher].push(course);
      coursesByStudent[roster[0].username] = coursesByStudent[roster[0].username] || [];
      roster.forEach((student) => {
        coursesByStudent[student.username] = coursesByStudent[student.username] || [];
        coursesByStudent[student.username].push({ nombre: course.nombre, profesor: `Prof. ${usersByUsername.get(assignedTeacher).nombre}`, sala: course.sala, horario: course.horario });
        schedules[student.username] = schedules[student.username] || [];
        calendar[student.username] = calendar[student.username] || [];
        grades[student.username] = grades[student.username] || [];
        attendance[student.username] = attendance[student.username] || { percent: 0, total: 0, attended: 0, absences: 0, late: 0, byCourse: [] };
        warnings[student.username] = warnings[student.username] || [];
        messages[student.username] = messages[student.username] || [];
      });
      courseIndex += 1;
    }));

    // Agrupa familias de 1 a 3 estudiantes, dejando los casos de demostración intactos.
    const generatedStudents = allStudentUsernames.filter((username) => !["mrojas", "jgomez", "lgonzalez"].includes(username));
    let guardianIndex = 1;
    for (let i = 0; i < generatedStudents.length; i += 1) {
      const count = guardianIndex % 3 === 0 ? 3 : guardianIndex % 2 === 0 ? 2 : 1;
      const children = generatedStudents.slice(i, i + count);
      if (!children.length) break;
      const username = `apoderado${String(guardianIndex).padStart(4, "0")}`;
      const name = `${firstNames[(guardianIndex + 7) % firstNames.length]} ${lastNames[(guardianIndex + 11) % lastNames.length]}`;
      usersByUsername.set(username, { username, password: GENERATED_PASSWORD, nombre: name, rol: "Apoderado", correo: `${username}@academy7.cl`, telefono: `+56 9 7${String(guardianIndex).padStart(7, "0")}`, iniciales: initials(name), direccion: "Santiago" });
      guardianChildren[username] = children;
      i += children.length - 1;
      guardianIndex += 1;
    }
    guardianChildren.cfuentes = ["mrojas", "lgonzalez", "jgomez"];

    db.users = [...usersByUsername.values()];
    db.teacherCourses = teacherCourses;
    db.teacherSchedule = teacherSchedule;
    db.teacherCalendar = teacherCalendar;
    db.teacherMessages = teacherMessages;
    db.guardianChildren = guardianChildren;
    db.courses = coursesByStudent;
    db.schedules = schedules;
    db.calendar = calendar;
    db.grades = grades;
    db.attendance = attendance;
    db.warnings = warnings;
    db.messages = messages;
    db.schoolSeedVersion = "2026-full-school-v1";
    db.accountDefaults = { generatedPassword: GENERATED_PASSWORD, note: "Cambiar las contraseñas iniciales en producción." };
    return db;
  };
})();
