#!/usr/bin/env node
/*
 * Crea cuentas reales de Firebase Authentication y perfiles/cursos en Firestore.
 * Uso:
 *   npm install firebase-admin
 *   node tools/seed-firebase-school.cjs ./serviceAccountKey.json
 *
 * Nunca publiques la clave de servicio ni el CSV generado por este script.
 */
const fs = require("fs");
const path = require("path");
const { initializeApp, cert } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");

const serviceAccountPath = process.argv[2];
if (!serviceAccountPath) {
  console.error("Uso: node tools/seed-firebase-school.cjs ./serviceAccountKey.json");
  process.exit(1);
}
const serviceAccount = JSON.parse(fs.readFileSync(path.resolve(serviceAccountPath), "utf8"));
initializeApp({ credential: cert(serviceAccount) });
const auth = getAuth();
const db = getFirestore();

const GENERATED_PASSWORD = "Academy2026!";
const firstNames = ["Agustina", "Alejandro", "Antonia", "Benjamín", "Camila", "Catalina", "Constanza", "Daniela", "Diego", "Emilia", "Felipe", "Fernanda", "Florencia", "Gabriel", "Ignacia", "Javiera", "Joaquín", "José", "Josefa", "Juan", "Laura", "Leonardo", "Lucas", "Lucía", "Matías", "Maximiliano", "Martina", "Nicolás", "Pablo", "Renata", "Rodrigo", "Samuel", "Santiago", "Sofía", "Tomás", "Valentina", "Vicente"];
const masculineFirstNames = ["Alejandro", "Benjamín", "Diego", "Felipe", "Gabriel", "Joaquín", "José", "Juan", "Leonardo", "Lucas", "Matías", "Maximiliano", "Nicolás", "Pablo", "Rodrigo", "Samuel", "Santiago", "Tomás", "Vicente", "Andrés", "Cristóbal", "Esteban", "Ignacio", "Manuel", "Sebastián"];
const feminineFirstNames = ["Agustina", "Antonia", "Anita", "Camila", "Catalina", "Constanza", "Daniela", "Emilia", "Fernanda", "Florencia", "Ignacia", "Javiera", "Josefa", "Laura", "Lucía", "Martina", "Renata", "Sofía", "Valentina", "Isidora", "Bárbara", "Carolina", "Elena", "María", "Paula", "Trinidad"];
const middleNames = ["Antonia", "Andrés", "Belén", "Camilo", "Carolina", "Cristóbal", "Daniel", "Elena", "Esperanza", "Felipe", "Ignacio", "Isidora", "Javier", "José", "Josefina", "Manuel", "María", "Paz", "Sebastián", "Vicente"];
const masculineMiddleNames = ["Andrés", "Benjamín", "Camilo", "Cristóbal", "Daniel", "Felipe", "Ignacio", "Javier", "José", "Manuel", "Sebastián", "Vicente", "Alejandro", "Tomás", "Matías"];
const feminineMiddleNames = ["Antonia", "Belén", "Carolina", "Elena", "Esperanza", "Isidora", "Josefina", "María", "Paz", "Sofía", "Valentina", "Javiera", "Catalina", "Emilia", "Fernanda"];
const lastNames = ["Araya", "Bravo", "Bustos", "Cáceres", "Carrasco", "Castillo", "Contreras", "Cornejo", "Díaz", "Donoso", "Espinoza", "Fernández", "Figueroa", "Fuentes", "Gallardo", "Garrido", "Gómez", "González", "Guajardo", "Herrera", "Jara", "Lagos", "Leiva", "Maldonado", "Martínez", "Méndez", "Muñoz", "Navarro", "Núñez", "Ortega", "Paredes", "Pavez", "Pérez", "Poblete", "Ramírez", "Reyes", "Riquelme", "Rojas", "Salazar", "Sanhueza", "Sepúlveda", "Soto", "Tapia", "Toledo", "Torres", "Valdés", "Vargas", "Vega", "Vera", "Zúñiga"];
const secondLastNames = ["Aravena", "Baeza", "Barra", "Bernales", "Cabrera", "Campos", "Cárdenas", "Cisternas", "Escobar", "Gutiérrez", "Hernández", "Inostroza", "Jara", "Lara", "Lillo", "López", "Mora", "Morales", "Orellana", "Parra", "Pino", "Quintana", "Rivera", "Rodríguez", "Romero", "Saavedra", "Sáez", "Serrano", "Silva", "Vásquez"];
const teacherNames = ["Andrea Fernanda Silva Araya", "Ricardo Andrés Peña Muñoz", "Camila Belén Torres Rojas", "Marco Antonio Iturra Soto", "Laura Sofía Bennett Jara", "Diego Alejandro Fuentes Vera", "Paula Carolina Díaz Lagos", "Tomás Ignacio Vera Paredes", "Elisa María Muñoz Reyes", "Nicolás Javier Reyes Silva", "Sofía Valentina León Morales", "Carolina Paz Vidal Aravena", "Felipe Andrés Contreras Soto", "Javiera Belén González Rojas", "Matías Ignacio Herrera Díaz", "Daniela Fernanda Paredes Lara", "Gabriel Antonio Espinoza Campos", "Constanza María Sepúlveda Vera", "Sebastián José Castillo Pérez", "Antonia Paz Fuentes Araya", "Rodrigo Andrés Martínez Silva", "Fernanda Carolina Riquelme Soto", "Joaquín Manuel Salazar Reyes", "Valentina Sofía Navarro Díaz", "Esteban Felipe Carrasco Muñoz", "Isidora Belén Vargas Rojas", "Cristóbal Andrés Poblete Jara", "Renata María Ortega Vera", "Manuel Alejandro Tapia Lagos", "Josefina Paz Cornejo Silva", "Samuel Ignacio Gallardo Paredes", "Catalina Fernanda Leiva Morales", "Ignacio José Bustos Araya", "Florencia Belén Maldonado Soto", "Benjamín Andrés Ramírez Reyes", "María José Figueroa Díaz", "Vicente Tomás Garrido Lara", "Agustina Sofía Donoso Muñoz", "Alejandro Javier Cisternas Rojas", "Emilia Paz Valdés Vera", "Juan Pablo Vega Aravena", "Martina Carolina Sanhueza Silva", "Lucas Andrés Toledo Campos", "Daniela Paz Núñez Reyes", "Maximiliano José Vargas Soto", "Gabriela Fernanda Herrera Lagos", "Pablo Ignacio Pavez Morales", "Trinidad María Escobar Riquelme"];
const subjects = ["Matemática", "Lenguaje y Comunicación", "Ciencias Naturales", "Historia", "Inglés", "Educación Física", "Artes Visuales", "Tecnología", "Filosofía", "Ciencias", "Geometría", "Música"];
function subjectsForLevel(level) { const n = Number(String(level.label).match(/\d+/)?.[0] || 1); if (level.label.includes("Básico") && n <= 4) return ["Matemática", "Lenguaje y Comunicación", "Ciencias Naturales", "Historia", "Inglés", "Educación Física", "Artes Visuales"]; if (level.label.includes("Básico")) return ["Matemática", "Lenguaje y Comunicación", "Historia", "Ciencias Naturales", "Inglés", "Educación Física", "Artes Visuales", "Tecnología"]; return ["Matemática", "Lenguaje", "Historia", "Filosofía", "Inglés", "Ciencias", "Educación Física", "Geometría", "Música"]; }
const levels = [];
for (let i = 1; i <= 8; i++) levels.push({ label: `${i}° Básico`, slug: `${i}basico`, letters: ["A", "B", "C", "D"] });
for (let i = 1; i <= 4; i++) levels.push({ label: `${i}° Medio`, slug: `${i}medio`, letters: ["A", "B", "C"] });
const legacy = new Map([
  ["mrojas", ["María Fernanda Rojas González", "4° Medio A"]], ["jgomez", ["Joaquín Ignacio Gómez Pérez", "3° Medio B"]], ["lgonzalez", ["Lucía Valentina González Araya", "8° Básico A"]],
  ["pmartinez", ["Pablo Andrés Martínez Soto", "4° Medio A"]], ["asoto", ["Antonia Belén Soto Fuentes", "4° Medio A"]], ["dcastro", ["Diego Alejandro Castro Reyes", "4° Medio A"]]
]);
function slug(value) { return String(value).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "").slice(0, 24); }
function initials(name) { return name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase(); }
function alignChildSurname(childName, guardianName) { const child = String(childName || "").trim().split(/\s+/); const guardian = String(guardianName || "").trim().split(/\s+/); if (child.length < 4 || guardian.length < 4) return childName; const guardianIsMother = feminineFirstNames.includes(guardian[0]); const firstSurname = guardianIsMother ? child[2] : guardian[2]; const secondSurname = guardianIsMother ? guardian[3] : child[3]; return `${child[0]} ${child[1]} ${firstSurname} ${secondSurname}`; }
function nameAt(index) { const masculine = index % 2 === 1; const firstPool = masculine ? masculineFirstNames : feminineFirstNames; const middlePool = masculine ? masculineMiddleNames : feminineMiddleNames; const poolIndex = Math.floor(index / 2); const firstIndex = poolIndex % firstPool.length; const middleIndex = Math.floor(poolIndex / firstPool.length) % middlePool.length; const lastIndex = (index * 17) % lastNames.length; const secondLastIndex = (Math.floor(index / lastNames.length) * 7 + index * 3) % secondLastNames.length; return `${firstPool[firstIndex]} ${middlePool[middleIndex]} ${lastNames[lastIndex]} ${secondLastNames[secondLastIndex]}`; }
function teachersForLevel(level) { const cycle = level.label.includes("Básico") && Number(level.label.match(/\d+/)[0]) <= 4 ? 0 : level.label.includes("Básico") ? 14 : 30; const subjects = subjectsForLevel(level); return Object.fromEntries(subjects.map((subject, index) => [subject, [`docente${String(cycle + index * 2 + 1).padStart(2, "0")}`, `docente${String(cycle + index * 2 + 2).padStart(2, "0")}`]])); }
function emailForName(name, usedEmails) { const parts = String(name).trim().split(/\s+/); const clean = (value) => String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, ""); const first = clean(parts[0]); const firstSurname = clean(parts[2] || parts[1]); const secondSurname = clean(parts[3]); const middle = clean(parts[1]); const base = `${first}${firstSurname}`; const candidates = [base, ...Array.from({ length: secondSurname.length }, (_, index) => `${base}${secondSurname.slice(0, index + 1)}`), ...Array.from({ length: middle.length }, (_, index) => `${base}${secondSurname}${middle.slice(0, index + 1)}`)]; const local = candidates.find((candidate) => !usedEmails?.has(`${candidate}@academy7.cl`)) || `${base}${secondSurname}${middle}${first}`; const email = `${local}@academy7.cl`; usedEmails?.add(email); return email; }
function finalizeAccountEmails(accounts) { const clean = (value) => String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, ""); const groups = new Map(); accounts.forEach((account) => { const parts = String(account.nombre || "").trim().split(/\s+/); const base = `${clean(parts[0])}${clean(parts[2] || parts[1])}`; if (!groups.has(base)) groups.set(base, []); groups.get(base).push({ account, secondSurname: clean(parts[3]), middle: clean(parts[1]) }); }); const used = new Set(); groups.forEach((group, base) => group.forEach(({ account, secondSurname, middle }) => { const prefixes = group.length === 1 ? [""] : Array.from({ length: secondSurname.length }, (_, index) => secondSurname.slice(0, index + 1)); const local = prefixes.map((prefix) => `${base}${prefix}`).concat(`${base}${secondSurname}${middle}${clean(account.nombre)}`).find((candidate) => !used.has(candidate)); used.add(local); account.email = `${local}@academy7.cl`; })); }
async function createOrUpdateUser(account) {
  let record;
  try { record = await auth.getUserByEmail(account.email); } catch (error) { if (error.code !== "auth/user-not-found") throw error; }
  if (record) return auth.updateUser(record.uid, { password: account.password, displayName: account.nombre });
  return auth.createUser({ email: account.email, password: account.password, displayName: account.nombre });
}
async function removeStaleAcademyAccounts(accounts) {
  const currentEmails = new Set(accounts.map((account) => account.email.toLowerCase()));
  let page;
  do {
    page = await auth.listUsers(1000, page?.pageToken);
    for (const user of page.users) {
      if (user.email && user.email.toLowerCase().endsWith("@academy7.cl") && !currentEmails.has(user.email.toLowerCase())) {
        await auth.deleteUser(user.uid);
        console.log(`  Cuenta antigua de Academy7 eliminada: ${user.email}`);
      }
    }
  } while (page.pageToken);
  const aliases = await db.collection("loginAliases").get();
  for (const item of aliases.docs) {
    const aliasEmail = String(item.data().email ?? "").toLowerCase();
    if (!currentEmails.has(aliasEmail)) await item.ref.delete();
  }
}
const schoolDays = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];
const morningSlots = ["08:00–08:40", "08:40–09:20", "09:30–10:10", "10:10–10:50", "10:50–11:30", "11:40–12:20", "12:20–13:00"];
const afternoonSlots = ["13:00–13:40", "13:40–14:20", "14:30–15:10", "15:10–15:50", "15:50–16:30", "16:40–17:20", "17:20–18:00"];
const schoolWindows = [[0, 1], [2, 4], [5, 6]];
function scheduleSlotsForCourse(course) {
  const match = String(course.curso).match(/(\d+)° (Básico|Medio)/);
  const level = Number(match?.[1] || 1);
  const morning = match?.[2] === "Básico" ? level >= 5 : level >= 3;
  return morning ? morningSlots : afternoonSlots;
}
const evaluationKeys = ["semestre1Prueba1", "semestre1Prueba2", "semestre1Prueba3", "semestre1Global", "semestre2Prueba1", "semestre2Prueba2", "semestre2Prueba3", "semestre2Global", "examen"];
const evaluationDates = ["2026-04-01", "2026-05-06", "2026-06-10", "2026-07-01", "2026-08-12", "2026-09-09", "2026-10-07", "2026-11-04", "2026-11-25"];
function dateWithOffset(base, offset) { const date = new Date(`${base}T12:00:00`); date.setDate(date.getDate() + offset); return date.toISOString().slice(0, 10); }
function dateOnWeekday(base, weekday) { if (!weekday) return base; const names = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]; const target = names.indexOf(weekday); if (target < 0) return base; const date = new Date(`${base}T12:00:00`); date.setDate(date.getDate() + ((target - date.getDay() + 7) % 7)); return date.toISOString().slice(0, 10); }
function calendarEventsForCourse(course, courseIndex) {
  const match = String(course.curso).match(/(\d+)°/); const level = Number(match?.[1] || 1); const medium = course.curso.includes("Medio"); const spread = courseIndex % 4;
  const bases = medium && level === 4 ? ["2026-04-06", "2026-05-04", "2026-06-01", "2026-07-06", "2026-08-24", "2026-09-21", "2026-10-19", "2026-11-02"] : ["2026-04-06", "2026-05-04", "2026-06-01", "2026-07-06", "2026-09-07", "2026-10-05", "2026-11-02", "2026-12-01"];
  const preferredWeekday = course.asignaturas.find((item) => (item.bloques ?? 1) >= 2)?.dia; const keys = evaluationKeys.filter((key) => key !== "examen"); const events = keys.map((key, index) => ({ key, date: dateOnWeekday(dateWithOffset(bases[index], spread), preferredWeekday) }));
  if (medium) { const subjects = [...new Set(course.asignaturas.map((item) => item.asignatura))]; const examStart = level === 4 ? "2026-11-23" : "2026-12-10"; subjects.forEach((subject, index) => events.push({ key: "examen", subject, date: dateOnWeekday(dateWithOffset(examStart, index), preferredWeekday) })); }
  return events;
}
function buildSchedules(courses) {
  const teacherBusy = new Map();
  courses.forEach((course, courseIndex) => {
    const courseBusy = new Set();
    const schoolSlots = scheduleSlotsForCourse(course);
    course.asignaturas = course.asignaturas.flatMap((subject, subjectIndex) => {
      const teacherList = course.docentesPorAsignatura?.[subject] ?? [];
      const teacherUsername = teacherList[(courseIndex + subjectIndex) % Math.max(teacherList.length, 1)] ?? course.teacherUsername;
      const pattern = subjectIndex % 3;
      const dayCounts = pattern === 0 ? [3, 1] : pattern === 1 ? [2, 2] : [4];
      const teacherKeys = teacherBusy.get(teacherUsername) ?? new Set();
      const sessions = [];
      let sessionNumber = 0;
      for (let dayGroup = 0; dayGroup < dayCounts.length; dayGroup += 1) {
        const dayIndex = (courseIndex + subjectIndex + dayGroup) % schoolDays.length;
        const blockCount = dayCounts[dayGroup]; let selected = null;
        for (let offset = 0; offset <= schoolSlots.length - blockCount; offset += 1) {
          const start = (courseIndex * 2 + subjectIndex + sessionNumber + offset) % (schoolSlots.length - blockCount + 1);
          const keys = Array.from({ length: blockCount }, (_, block) => `${schoolDays[dayIndex]}|${schoolSlots[start + block]}`);
          if (keys.every((key) => !courseBusy.has(key) && !teacherKeys.has(key))) { selected = { start, keys }; break; }
        }
        if (!selected) throw new Error(`No hay bloque disponible para ${teacherUsername} en ${course.curso}`);
        selected.keys.forEach((key) => { teacherKeys.add(key); courseBusy.add(key); });
        sessions.push({ asignatura: subject, teacherUsername, docente: teacherNames[teacherUsername === "asilva" ? 0 : Math.max(0, Number(String(teacherUsername).replace("docente", "")) - 1)] ?? teacherUsername, dia: schoolDays[dayIndex], hora: `${schoolSlots[selected.start]} · ${schoolSlots[selected.start + blockCount - 1]}`, sala: subject === "Educación Física" ? "Gimnasio" : course.sala, bloques: blockCount, bloqueSemanal: sessionNumber + 1, bloquesSemanales: 4 });
        sessionNumber += blockCount;
      }
      teacherBusy.set(teacherUsername, teacherKeys);
      return sessions;
    });
    course.horario = scheduleSlotsForCourse(course) === morningSlots ? "Jornada mañana · 08:00–13:00 · 4 bloques semanales por curso · recreos de 10 minutos" : "Jornada tarde · 13:00–18:00 · 4 bloques semanales por curso · recreos de 10 minutos";
    course.teacherUsername = course.asignaturas[0]?.teacherUsername ?? course.teacherUsername;
  });
  return courses;
}
function renameAccountsToEmailUsernames(accounts, courses, guardians) {
  const mapping = new Map(accounts.map((account) => [account.username, account.email.split("@")[0]]));
  accounts.forEach((account) => { account.username = mapping.get(account.username) ?? account.username; });
  courses.forEach((course) => { course.teacherUsername = mapping.get(course.teacherUsername) ?? course.teacherUsername; course.asignaturas?.forEach((item) => { item.teacherUsername = mapping.get(item.teacherUsername) ?? item.teacherUsername; }); course.students.forEach((student) => { student.username = mapping.get(student.username) ?? student.username; }); });
  guardians.forEach((guardian) => { guardian.children = (guardian.children || []).map((child) => mapping.get(child) ?? child); });
}
async function main() {
  const accounts = [];
  const courses = [];
  const guardians = [];
  const usedStudentNames = new Set([...legacy.values()].map(([nombre]) => nombre));
  const studentUsernames = [];
  const usedEmails = new Set();
  const teacherUsernames = teacherNames.map((name, index) => index === 0 ? "asilva" : `docente${String(index + 1).padStart(2, "0")}`);
  teacherNames.forEach((nombre, index) => accounts.push({ username: teacherUsernames[index], password: index === 0 ? "colegio2024" : GENERATED_PASSWORD, nombre, rol: "Docente", email: emailForName(nombre, usedEmails) }));
  let studentIndex = 0;
  let courseIndex = 0;
  for (const level of levels) for (const letter of level.letters) {
    const courseId = `curso-${level.slug}-${letter}`;
    const teacherUsername = teacherUsernames[courseIndex % teacherUsernames.length];
    const courseStudents = [];
    const cycleSubjects = subjectsForLevel(level);
    const courseSubject = cycleSubjects[courseIndex % cycleSubjects.length];
    const special = [...legacy.entries()].filter(([, [, course]]) => course === `${level.label} ${letter}`);
    for (const [username, [nombre]] of special) {
      courseStudents.push({ username, nombre, password: "colegio2024", email: emailForName(nombre, usedEmails), rol: "Estudiante", curso: `${level.label} ${letter}`, nivel: level.label });
      studentUsernames.push(username);
      studentIndex += 1;
    }
    const targetSize = 30 + (courseIndex % 7);
    while (courseStudents.length < targetSize) {
      let nombre;
      do { nombre = nameAt(studentIndex); studentIndex += 1; } while (usedStudentNames.has(nombre));
      usedStudentNames.add(nombre);
      const username = `est${String(studentIndex).padStart(4, "0")}`;
      courseStudents.push({ username, nombre, password: GENERATED_PASSWORD, email: emailForName(nombre, usedEmails), rol: "Estudiante", curso: `${level.label} ${letter}`, nivel: level.label });
      studentUsernames.push(username);
    }
    courses.push({ id: courseId, teacherUsername, nombre: courseSubject, asignaturas: cycleSubjects, docentesPorAsignatura: teachersForLevel(level), curso: `${level.label} ${letter}`, sala: `Sala ${(courseIndex % 20) + 1}`, horario: "Lun / Mié / Vie · 08:00", periodo: "Año escolar 2026", students: courseStudents });
    courseIndex += 1;
  }
  const uniqueStudents = [...new Map(courses.flatMap((course) => course.students).map((student) => [student.username, student])).values()];
  let guardianIndex = 1;
  for (let i = 0; i < uniqueStudents.length; i += 1) {
    const count = guardianIndex % 3 === 0 ? 3 : guardianIndex % 2 === 0 ? 2 : 1;
    const children = uniqueStudents.slice(i, i + count);
    if (!children.length) break;
    const username = `apoderado${String(guardianIndex).padStart(4, "0")}`;
    const guardianFemale = guardianIndex % 2 === 0; const guardianFirst = (guardianFemale ? feminineFirstNames : masculineFirstNames)[guardianIndex % (guardianFemale ? feminineFirstNames.length : masculineFirstNames.length)]; const guardianMiddle = (guardianFemale ? feminineMiddleNames : masculineMiddleNames)[(guardianIndex + 3) % (guardianFemale ? feminineMiddleNames.length : masculineMiddleNames.length)]; const nombre = `${guardianFirst} ${guardianMiddle} ${lastNames[(guardianIndex + 11) % lastNames.length]} ${secondLastNames[(guardianIndex + 17) % secondLastNames.length]}`;
    guardians.push({ username, password: GENERATED_PASSWORD, nombre, email: emailForName(nombre, usedEmails), rol: "Apoderado", children: children.map((child) => child.username) });
    i += children.length - 1;
    guardianIndex += 1;
  }
  guardians.push({ username: "cfuentes", password: "colegio2024", nombre: "Carolina Fernanda Fuentes Araya", email: emailForName("Carolina Fernanda Fuentes Araya", usedEmails), rol: "Apoderado", children: ["mrojas", "lgonzalez", "jgomez"] });
  const studentsByUsername = new Map(uniqueStudents.map((student) => [student.username, student]));
  guardians.forEach((guardian) => (guardian.children || []).forEach((childUsername) => {
    const child = studentsByUsername.get(childUsername);
    if (child) child.nombre = alignChildSurname(child.nombre, guardian.nombre);
  }));
  accounts.push(...uniqueStudents, ...guardians);
  finalizeAccountEmails(accounts);
  buildSchedules(courses);
  renameAccountsToEmailUsernames(accounts, courses, guardians);

  const credentials = [];
  await removeStaleAcademyAccounts(accounts);
  console.log(`Inicio de sincronización: ${accounts.length} cuentas y ${courses.length} cursos.`);
  console.log("[1/2] Procesando Authentication y perfiles de usuarios...");
  for (let accountIndex = 0; accountIndex < accounts.length; accountIndex += 1) {
    const account = accounts[accountIndex];
    const user = await createOrUpdateUser(account);
    await auth.setCustomUserClaims(user.uid, { username: account.username, role: account.rol });
    const profile = { username: account.username, uid: user.uid, nombre: account.nombre, rol: account.rol, correo: account.email, updatedAt: FieldValue.serverTimestamp() };
    await db.collection("loginAliases").doc(account.username).set({ username: account.username, email: account.email, rol: account.rol }, { merge: true });
    await db.collection("users").doc(account.username).set(profile, { merge: true });
    const emailUsername = account.email.split("@")[0];
    if (emailUsername !== account.username) await db.collection("users").doc(emailUsername).set(profile, { merge: true });
    if (account.rol === "Apoderado") await db.collection("guardians").doc(account.username).set({ ...profile, children: account.children }, { merge: true });
    if (account.rol === "Apoderado" && emailUsername !== account.username) await db.collection("guardians").doc(emailUsername).set({ ...profile, children: account.children }, { merge: true });
    if (account.rol === "Estudiante") await db.collection("students").doc(account.username).set({ ...profile, curso: account.curso, nivel: account.nivel }, { merge: true });
    if (account.rol === "Estudiante" && emailUsername !== account.username) await db.collection("students").doc(emailUsername).set({ ...profile, curso: account.curso, nivel: account.nivel }, { merge: true });
    credentials.push(`${account.username},${account.email},${account.password},${account.rol}`);
    if ((accountIndex + 1) % 25 === 0 || accountIndex === accounts.length - 1) {
      console.log(`  Cuentas: ${accountIndex + 1}/${accounts.length} (${account.rol})`);
    }
  }
  console.log("[2/2] Procesando cursos y listas de estudiantes...");
  for (let courseIndex = 0; courseIndex < courses.length; courseIndex += 1) {
    const course = courses[courseIndex];
    const teachersInCourse = [...new Set(course.asignaturas.map((item) => item.teacherUsername))];
    const courseRefs = teachersInCourse.map((teacherUsername) => db.collection("teachers").doc(teacherUsername).collection("courses").doc(course.id));
    for (const courseRef of courseRefs) {
      await courseRef.set({ id: course.id, nombre: course.nombre, curso: course.curso, sala: course.sala, horario: course.horario, periodo: "Año escolar 2026", updatedAt: FieldValue.serverTimestamp() }, { merge: true });
    }
    for (const teacherUsername of teachersInCourse) {
      const teacherAssignments = course.asignaturas.filter((item) => item.teacherUsername === teacherUsername);
      for (let assignmentIndex = 0; assignmentIndex < teacherAssignments.length; assignmentIndex += 1) {
        const assignment = teacherAssignments[assignmentIndex];
        await db.collection("teachers").doc(teacherUsername).collection("schedule").doc(`${course.id}-${assignmentIndex}`).set({ courseId: course.id, curso: course.curso, ...assignment, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
      }
      for (const event of calendarEventsForCourse(course, courseIndex)) {
        const eventId = `${course.id}-${event.key}-${event.subject ?? "general"}`;
        await db.collection("teachers").doc(teacherUsername).collection("calendar").doc(eventId).set({ id: eventId, courseId: course.id, curso: course.curso, ...event, teacherUsername, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
      }
    }
    let batch = db.batch(); let writes = 0;
    for (const student of course.students) {
      for (const courseRef of courseRefs) {
        batch.set(courseRef.collection("students").doc(student.username), { username: student.username, nombre: student.nombre, promedio: null, asistencia: 0, amonestaciones: 0, evaluaciones: {}, warnings: [], updatedAt: FieldValue.serverTimestamp() }, { merge: true });
        writes += 1;
        if (writes === 400) { await batch.commit(); batch = db.batch(); writes = 0; }
      }
    }
    if (writes) await batch.commit();
    console.log(`  Curso: ${courseIndex + 1}/${courses.length} · ${course.curso} · ${course.students.length} estudiantes`);
  }
  const output = path.resolve("academy7-account-credentials.csv");
  fs.writeFileSync(output, `username,email,password,rol\n${credentials.join("\n")}\n`);
  console.log(`Cuentas procesadas: ${accounts.length}`);
  console.log(`Cursos procesados: ${courses.length}`);
  console.log(`Credenciales guardadas localmente en: ${output}`);
  console.log("No subas ese CSV ni la clave de servicio a GitHub.");
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
