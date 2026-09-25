/* Academy7 — semilla ampliada del colegio.
   Genera los cursos 1° Básico–4° Medio, cuentas y relaciones familiares.
   La contraseña inicial de las cuentas generadas es Academy2026! y debe
   cambiarse en un entorno real. */
(function () {
  const GENERATED_PASSWORD = "Academy2026!";
  const firstNames = ["Agustina", "Alejandro", "Antonia", "Benjamín", "Camila", "Catalina", "Constanza", "Daniela", "Diego", "Emilia", "Felipe", "Fernanda", "Florencia", "Gabriel", "Ignacia", "Javiera", "Joaquín", "José", "Josefa", "Juan", "Laura", "Leonardo", "Lucas", "Lucía", "Matías", "Maximiliano", "Martina", "Nicolás", "Pablo", "Renata", "Rodrigo", "Samuel", "Santiago", "Sofía", "Tomás", "Valentina", "Vicente"];
  const masculineFirstNames = ["Alejandro", "Benjamín", "Diego", "Felipe", "Gabriel", "Joaquín", "José", "Juan", "Leonardo", "Lucas", "Matías", "Maximiliano", "Nicolás", "Pablo", "Rodrigo", "Samuel", "Santiago", "Tomás", "Vicente", "Andrés", "Cristóbal", "Esteban", "Ignacio", "Manuel", "Sebastián"];
  const feminineFirstNames = ["Agustina", "Antonia", "Camila", "Catalina", "Constanza", "Daniela", "Emilia", "Fernanda", "Florencia", "Ignacia", "Javiera", "Josefa", "Laura", "Lucía", "Martina", "Renata", "Sofía", "Valentina", "Isidora", "Bárbara", "Carolina", "Elena", "María", "Paula", "Trinidad"];
  const middleNames = ["Antonia", "Andrés", "Belén", "Camilo", "Carolina", "Cristóbal", "Daniel", "Elena", "Esperanza", "Felipe", "Ignacio", "Isidora", "Javier", "José", "Josefina", "Manuel", "María", "Paz", "Sebastián", "Vicente"];
  const masculineMiddleNames = ["Andrés", "Benjamín", "Camilo", "Cristóbal", "Daniel", "Felipe", "Ignacio", "Javier", "José", "Manuel", "Sebastián", "Vicente", "Alejandro", "Tomás", "Matías"];
  const feminineMiddleNames = ["Antonia", "Belén", "Carolina", "Elena", "Esperanza", "Isidora", "Josefina", "María", "Paz", "Sofía", "Valentina", "Javiera", "Catalina", "Emilia", "Fernanda"];
  const lastNames = ["Araya", "Bravo", "Bustos", "Cáceres", "Carrasco", "Castillo", "Contreras", "Cornejo", "Díaz", "Donoso", "Espinoza", "Fernández", "Figueroa", "Fuentes", "Gallardo", "Garrido", "Gómez", "González", "Guajardo", "Herrera", "Jara", "Lagos", "Leiva", "Maldonado", "Martínez", "Méndez", "Muñoz", "Navarro", "Núñez", "Ortega", "Paredes", "Pavez", "Pérez", "Poblete", "Ramírez", "Reyes", "Riquelme", "Rojas", "Salazar", "Sanhueza", "Sepúlveda", "Soto", "Tapia", "Toledo", "Torres", "Valdés", "Vargas", "Vega", "Vera", "Zúñiga"];
  const secondLastNames = ["Aravena", "Baeza", "Barra", "Bernales", "Cabrera", "Campos", "Cárdenas", "Cisternas", "Escobar", "Gutiérrez", "Hernández", "Inostroza", "Jara", "Lara", "Lillo", "López", "Mora", "Morales", "Orellana", "Parra", "Pino", "Quintana", "Rivera", "Rodríguez", "Romero", "Saavedra", "Sáez", "Serrano", "Silva", "Vásquez"];
  const teacherNames = ["Andrea Fernanda Silva Araya", "Ricardo Andrés Peña Muñoz", "Camila Belén Torres Rojas", "Marco Antonio Iturra Soto", "Laura Sofía Bennett Jara", "Diego Alejandro Fuentes Vera", "Paula Carolina Díaz Lagos", "Tomás Ignacio Vera Paredes", "Elisa María Muñoz Reyes", "Nicolás Javier Reyes Silva", "Sofía Valentina León Morales", "Carolina Paz Vidal Aravena", "Felipe Andrés Contreras Soto", "Javiera Belén González Rojas", "Matías Ignacio Herrera Díaz", "Daniela Fernanda Paredes Lara", "Gabriel Antonio Espinoza Campos", "Constanza María Sepúlveda Vera", "Sebastián José Castillo Pérez", "Antonia Paz Fuentes Araya", "Rodrigo Andrés Martínez Silva", "Fernanda Carolina Riquelme Soto", "Joaquín Manuel Salazar Reyes", "Valentina Sofía Navarro Díaz", "Esteban Felipe Carrasco Muñoz", "Isidora Belén Vargas Rojas", "Cristóbal Andrés Poblete Jara", "Renata María Ortega Vera", "Manuel Alejandro Tapia Lagos", "Josefina Paz Cornejo Silva", "Samuel Ignacio Gallardo Paredes", "Catalina Fernanda Leiva Morales", "Ignacio José Bustos Araya", "Florencia Belén Maldonado Soto", "Benjamín Andrés Ramírez Reyes", "María José Figueroa Díaz", "Vicente Tomás Garrido Lara", "Agustina Sofía Donoso Muñoz", "Alejandro Javier Cisternas Rojas", "Emilia Paz Valdés Vera", "Juan Pablo Vega Aravena", "Martina Carolina Sanhueza Silva", "Lucas Andrés Toledo Campos", "Daniela Paz Núñez Reyes", "Maximiliano José Vargas Soto", "Gabriela Fernanda Herrera Lagos", "Pablo Ignacio Pavez Morales", "Trinidad María Escobar Riquelme"];
  const subjects = ["Matemática", "Lenguaje y Comunicación", "Ciencias Naturales", "Historia", "Inglés", "Educación Física", "Artes Visuales", "Tecnología", "Filosofía", "Ciencias", "Geometría", "Música"];
  function subjectsForLevel(level) { const n = Number(String(level.label).match(/\d+/)?.[0] || 1); if (level.label.includes("Básico") && n <= 4) return ["Matemática", "Lenguaje y Comunicación", "Ciencias Naturales", "Historia", "Inglés", "Educación Física", "Artes Visuales"]; if (level.label.includes("Básico")) return ["Matemática", "Lenguaje y Comunicación", "Historia", "Ciencias Naturales", "Inglés", "Educación Física", "Artes Visuales", "Tecnología"]; return ["Matemática", "Lenguaje", "Historia", "Filosofía", "Inglés", "Ciencias", "Educación Física", "Geometría", "Música"]; }
  const subjectRooms = ["Sala 1", "Sala 2", "Sala 3", "Sala 4", "Sala 5", "Gimnasio"];
  const levels = [];
  for (let i = 1; i <= 8; i += 1) levels.push({ label: `${i}° Básico`, slug: `${i}basico`, letters: ["A", "B", "C", "D"] });
  for (let i = 1; i <= 4; i += 1) levels.push({ label: `${i}° Medio`, slug: `${i}medio`, letters: ["A", "B", "C"] });

  function slug(value) {
    return String(value).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "").slice(0, 24);
  }
  function initials(name) { return name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase(); }
  function accountEmail(name, usedEmails) { const parts = String(name).trim().split(/\s+/); const clean = (value) => String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, ""); const first = clean(parts[0]); const firstSurname = clean(parts[2] || parts[1]); const secondSurname = clean(parts[3]); const middle = clean(parts[1]); const base = `${first}${firstSurname}`; const candidates = [base, ...Array.from({ length: secondSurname.length }, (_, index) => `${base}${secondSurname.slice(0, index + 1)}`), ...Array.from({ length: middle.length }, (_, index) => `${base}${secondSurname}${middle.slice(0, index + 1)}`)]; const local = candidates.find((candidate) => !usedEmails?.has(`${candidate}@academy7.cl`)) || `${base}${secondSurname}${middle}${first}`; const email = `${local}@academy7.cl`; usedEmails?.add(email); return email; }
  function finalizeAccountEmails(users) { const clean = (value) => String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, ""); const groups = new Map(); users.forEach((user) => { const parts = String(user.nombre || "").trim().split(/\s+/); const base = `${clean(parts[0])}${clean(parts[2] || parts[1])}`; if (!groups.has(base)) groups.set(base, []); groups.get(base).push({ user, secondSurname: clean(parts[3]), middle: clean(parts[1]) }); }); const used = new Set(); groups.forEach((group, base) => group.forEach(({ user, secondSurname, middle }) => { const prefixes = group.length === 1 ? [""] : Array.from({ length: secondSurname.length }, (_, index) => secondSurname.slice(0, index + 1)); const local = prefixes.map((prefix) => `${base}${prefix}`).concat(`${base}${secondSurname}${middle}${clean(user.nombre)}`).find((candidate) => !used.has(candidate)); used.add(local); user.correo = `${local}@academy7.cl`; })); }
  function teachersForLevel(level) { const cycle = level.label.includes("Básico") && Number(level.label.match(/\d+/)[0]) <= 4 ? 0 : level.label.includes("Básico") ? 14 : 30; const subjects = subjectsForLevel(level); return subjects.reduce((map, subject, index) => { map[subject] = [`docente${String(cycle + index * 2 + 1).padStart(2, "0")}`, `docente${String(cycle + index * 2 + 2).padStart(2, "0")}`]; return map; }, {}); }
  function studentName(index) { const masculine = index % 2 === 1; const firstPool = masculine ? masculineFirstNames : feminineFirstNames; const middlePool = masculine ? masculineMiddleNames : feminineMiddleNames; const poolIndex = Math.floor(index / 2); const firstIndex = poolIndex % firstPool.length; const middleIndex = Math.floor(poolIndex / firstPool.length) % middlePool.length; const lastIndex = (poolIndex * 17) % lastNames.length; const secondLastIndex = (poolIndex * 29) % secondLastNames.length; return `${firstPool[firstIndex]} ${middlePool[middleIndex]} ${lastNames[lastIndex]} ${secondLastNames[secondLastIndex]}`; }
  function makeCourse(id, level, letter, teacherUsername, students) {
    const subject = subjects[id.length % subjects.length];
    return { id, nombre: subject, curso: `${level.label} ${letter}`, sala: subjectRooms[id.length % subjectRooms.length], horario: "Lun / Mié / Vie · 08:00", periodo: "Año escolar 2026", teacherUsername, students, attendanceRecords: [] };
  }
  function makeStudent(username, name, courseLabel, level, index, usedEmails) {
    return { username, password: GENERATED_PASSWORD, nombre: name, rol: "Estudiante", curso: courseLabel, nivel: level, rut: `24.${String(index + 100000).slice(-6)}-${(index % 9) + 1}`, correo: accountEmail(name, usedEmails), iniciales: initials(name) };
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
    const usedEmails = new Set();

    teacherNames.forEach((name, index) => {
      const username = index === 0 ? "asilva" : `docente${String(index + 1).padStart(2, "0")}`;
      const teacher = usersByUsername.get(username) || { username, password: index === 0 ? "colegio2024" : GENERATED_PASSWORD, rol: "Docente" };
      Object.assign(teacher, { nombre: name, correo: accountEmail(name, usedEmails), iniciales: initials(name), departamento: "Equipo académico" });
      usersByUsername.set(username, teacher);
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
    const specialNames = { mrojas: "María Fernanda Rojas González", pmartinez: "Pablo Andrés Martínez Soto", asoto: "Antonia Belén Soto Fuentes", dcastro: "Diego Alejandro Castro Reyes", jgomez: "Joaquín Ignacio Gómez Pérez", lgonzalez: "Lucía Valentina González Araya" };
    const usedStudentNames = new Set(Object.values(specialNames));

    levels.forEach((level) => level.letters.forEach((letter) => {
      const sectionKey = `${level.slug}-${letter}`;
      const courseLabel = `${level.label} ${letter}`;
      const cycleSubjects = subjectsForLevel(level);
      const courseSubject = cycleSubjects[courseIndex % cycleSubjects.length];
      const teacherUsername = `docente${String(courseIndex % teacherNames.length + 1).padStart(2, "0")}`;
      const assignedTeacher = courseIndex % teacherNames.length === 0 ? "asilva" : teacherUsername;
      const names = specialStudents[sectionKey] || [];
      const roster = [];
      const targetSize = 30 + (courseIndex % 7);
      names.forEach((username) => {
        const name = specialNames[username];
        roster.push({ username, nombre: name, promedio: null, asistencia: 0, amonestaciones: 0, ultimaEvaluacion: "", estado: "Pendiente", evaluaciones: {}, warnings: [] });
        const existing = usersByUsername.get(username);
        if (existing) { existing.nombre = name; existing.iniciales = initials(name); existing.curso = courseLabel; existing.nivel = level.label; existing.correo = accountEmail(name, usedEmails); }
        else usersByUsername.set(username, makeStudent(username, name, courseLabel, level.label, studentIndex, usedEmails));
        allStudentUsernames.push(username);
        studentIndex += 1;
      });
      while (roster.length < targetSize) {
        let name;
        do { name = studentName(studentIndex); studentIndex += 1; } while (usedStudentNames.has(name));
        usedStudentNames.add(name);
        const username = `est${String(studentIndex).padStart(4, "0")}`;
        roster.push({ username, nombre: name, promedio: null, asistencia: 0, amonestaciones: 0, ultimaEvaluacion: "", estado: "Pendiente", evaluaciones: {}, warnings: [] });
        usersByUsername.set(username, makeStudent(username, name, courseLabel, level.label, studentIndex, usedEmails));
        allStudentUsernames.push(username);
      }
      const course = makeCourse(`curso-${sectionKey}`, level, letter, assignedTeacher, roster);
      course.nombre = courseSubject;
      course.asignaturas = cycleSubjects;
      course.nombre = courseSubject;
      course.asignaturas = cycleSubjects;
      course.nombre = courseSubject;
      course.asignaturas = cycleSubjects;
      course.docentesPorAsignatura = teachersForLevel(level);
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
      const name = `${firstNames[(guardianIndex + 7) % firstNames.length]} ${middleNames[(guardianIndex + 3) % middleNames.length]} ${lastNames[(guardianIndex + 11) % lastNames.length]} ${secondLastNames[(guardianIndex + 17) % secondLastNames.length]}`;
      usersByUsername.set(username, { username, password: GENERATED_PASSWORD, nombre: name, rol: "Apoderado", correo: accountEmail(name, usedEmails), telefono: `+56 9 7${String(guardianIndex).padStart(7, "0")}`, iniciales: initials(name), direccion: "Santiago" });
      guardianChildren[username] = children;
      i += children.length - 1;
      guardianIndex += 1;
    }
    const demoGuardian = usersByUsername.get("cfuentes") || { username: "cfuentes", password: "colegio2024", rol: "Apoderado" };
    Object.assign(demoGuardian, { nombre: "Carolina Fernanda Fuentes Araya", correo: accountEmail("Carolina Fernanda Fuentes Araya", usedEmails), iniciales: initials("Carolina Fernanda Fuentes Araya") });
    usersByUsername.set("cfuentes", demoGuardian);
    guardianChildren.cfuentes = ["mrojas", "lgonzalez", "jgomez"];

    db.users = [...usersByUsername.values()];
    finalizeAccountEmails(db.users);
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
    db.schoolSeedVersion = "2026-full-school-v2";
    db.accountDefaults = { generatedPassword: GENERATED_PASSWORD, note: "Cambiar las contraseñas iniciales en producción." };
    return db;
  };
})();
