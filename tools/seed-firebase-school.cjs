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
const feminineFirstNames = ["Agustina", "Antonia", "Camila", "Catalina", "Constanza", "Daniela", "Emilia", "Fernanda", "Florencia", "Ignacia", "Javiera", "Josefa", "Laura", "Lucía", "Martina", "Renata", "Sofía", "Valentina", "Isidora", "Bárbara", "Carolina", "Elena", "María", "Paula", "Trinidad"];
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
function nameAt(index) { const masculine = index % 2 === 1; const firstPool = masculine ? masculineFirstNames : feminineFirstNames; const middlePool = masculine ? masculineMiddleNames : feminineMiddleNames; const poolIndex = Math.floor(index / 2); const firstIndex = poolIndex % firstPool.length; const middleIndex = Math.floor(poolIndex / firstPool.length) % middlePool.length; const lastIndex = (poolIndex * 17) % lastNames.length; const secondLastIndex = (poolIndex * 29) % secondLastNames.length; return `${firstPool[firstIndex]} ${middlePool[middleIndex]} ${lastNames[lastIndex]} ${secondLastNames[secondLastIndex]}`; }
function teachersForLevel(level) { const cycle = level.label.includes("Básico") && Number(level.label.match(/\d+/)[0]) <= 4 ? 0 : level.label.includes("Básico") ? 14 : 30; const subjects = subjectsForLevel(level); return Object.fromEntries(subjects.map((subject, index) => [subject, [`docente${String(cycle + index * 2 + 1).padStart(2, "0")}`, `docente${String(cycle + index * 2 + 2).padStart(2, "0")}`]])); }
function emailForName(name, usedEmails) { const parts = String(name).trim().split(/\s+/); const clean = (value) => String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, ""); const first = clean(parts[0]); const firstSurname = clean(parts[2] || parts[1]); const secondSurname = clean(parts[3]); const middle = clean(parts[1]); const base = `${first}${firstSurname}`; const candidates = [base, ...Array.from({ length: secondSurname.length }, (_, index) => `${base}${secondSurname.slice(0, index + 1)}`), ...Array.from({ length: middle.length }, (_, index) => `${base}${secondSurname}${middle.slice(0, index + 1)}`)]; const local = candidates.find((candidate) => !usedEmails?.has(`${candidate}@academy7.cl`)) || `${base}${secondSurname}${middle}${first}`; const email = `${local}@academy7.cl`; usedEmails?.add(email); return email; }
function finalizeAccountEmails(accounts) { const clean = (value) => String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, ""); const groups = new Map(); accounts.forEach((account) => { const parts = String(account.nombre || "").trim().split(/\s+/); const base = `${clean(parts[0])}${clean(parts[2] || parts[1])}`; if (!groups.has(base)) groups.set(base, []); groups.get(base).push({ account, secondSurname: clean(parts[3]), middle: clean(parts[1]) }); }); const used = new Set(); groups.forEach((group, base) => group.forEach(({ account, secondSurname, middle }) => { const prefixes = group.length === 1 ? [""] : Array.from({ length: secondSurname.length }, (_, index) => secondSurname.slice(0, index + 1)); const local = prefixes.map((prefix) => `${base}${prefix}`).concat(`${base}${secondSurname}${middle}${clean(account.nombre)}`).find((candidate) => !used.has(candidate)); used.add(local); account.email = `${local}@academy7.cl`; })); }
async function createOrUpdateUser(account) {
  let record;
  try { record = await auth.getUserByEmail(account.email); } catch (error) { if (error.code !== "auth/user-not-found") throw error; }
  if (record) return auth.updateUser(record.uid, { password: account.password, displayName: account.nombre });
  return auth.createUser({ email: account.email, password: account.password, displayName: account.nombre });
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
    const nombre = `${firstNames[(guardianIndex + 7) % firstNames.length]} ${middleNames[(guardianIndex + 3) % middleNames.length]} ${lastNames[(guardianIndex + 11) % lastNames.length]} ${secondLastNames[(guardianIndex + 17) % secondLastNames.length]}`;
    guardians.push({ username, password: GENERATED_PASSWORD, nombre, email: emailForName(nombre, usedEmails), rol: "Apoderado", children: children.map((child) => child.username) });
    i += children.length - 1;
    guardianIndex += 1;
  }
  guardians.push({ username: "cfuentes", password: "colegio2024", nombre: "Carolina Fernanda Fuentes Araya", email: emailForName("Carolina Fernanda Fuentes Araya", usedEmails), rol: "Apoderado", children: ["mrojas", "lgonzalez", "jgomez"] });
  accounts.push(...uniqueStudents, ...guardians);
  finalizeAccountEmails(accounts);

  const credentials = [];
  for (const account of accounts) {
    const user = await createOrUpdateUser(account);
    const profile = { username: account.username, uid: user.uid, nombre: account.nombre, rol: account.rol, correo: account.email, updatedAt: FieldValue.serverTimestamp() };
    await db.collection("users").doc(account.username).set(profile, { merge: true });
    if (account.rol === "Apoderado") await db.collection("guardians").doc(account.username).set({ ...profile, children: account.children }, { merge: true });
    if (account.rol === "Estudiante") await db.collection("students").doc(account.username).set({ ...profile, curso: account.curso, nivel: account.nivel }, { merge: true });
    credentials.push(`${account.username},${account.email},${account.password},${account.rol}`);
  }
  for (const course of courses) {
    const courseRef = db.collection("teachers").doc(course.teacherUsername).collection("courses").doc(course.id);
    await courseRef.set({ id: course.id, nombre: course.nombre, curso: course.curso, sala: course.sala, horario: course.horario, periodo: course.periodo, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
    let batch = db.batch(); let writes = 0;
    for (const student of course.students) {
      batch.set(courseRef.collection("students").doc(student.username), { username: student.username, nombre: student.nombre, promedio: null, asistencia: 0, amonestaciones: 0, evaluaciones: {}, warnings: [], updatedAt: FieldValue.serverTimestamp() }, { merge: true });
      writes += 1;
      if (writes === 400) { await batch.commit(); batch = db.batch(); writes = 0; }
    }
    if (writes) await batch.commit();
  }
  const output = path.resolve("academy7-account-credentials.csv");
  fs.writeFileSync(output, `username,email,password,rol\n${credentials.join("\n")}\n`);
  console.log(`Cuentas procesadas: ${accounts.length}`);
  console.log(`Cursos procesados: ${courses.length}`);
  console.log(`Credenciales guardadas localmente en: ${output}`);
  console.log("No subas ese CSV ni la clave de servicio a GitHub.");
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
