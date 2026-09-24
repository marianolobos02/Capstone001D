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
const firstNames = ["Agustina", "Alejandro", "Antonia", "Benjamín", "Camila", "Catalina", "Constanza", "Daniela", "Diego", "Emilia", "Felipe", "Fernanda", "Florencia", "Gabriel", "Ignacia", "Javiera", "Joaquín", "José", "Josefa", "Juan", "Laura", "Leonardo", "Lucas", "Lucía", "Martina", "Matías", "Maximiliano", "Nicolás", "Pablo", "Renata", "Rodrigo", "Samuel", "Santiago", "Sofía", "Tomás", "Valentina", "Vicente"];
const lastNames = ["Araya", "Bravo", "Cáceres", "Contreras", "Díaz", "Espinoza", "Fuentes", "Garrido", "Gómez", "González", "Herrera", "Leiva", "Maldonado", "Martínez", "Muñoz", "Navarro", "Ortega", "Paredes", "Pérez", "Ramírez", "Reyes", "Rojas", "Sanhueza", "Sepúlveda", "Soto", "Torres", "Valdés", "Vargas", "Vera", "Zúñiga"];
const teacherNames = ["Andrea Silva", "Ricardo Peña", "Camila Torres", "Marco Iturra", "Laura Bennett", "Diego Fuentes", "Paula Díaz", "Tomás Vera", "Elisa Muñoz", "Nicolás Reyes", "Sofía León", "Carolina Vidal"];
const subjects = ["Matemática", "Lengua y Literatura", "Ciencias Naturales", "Historia, Geografía y Cs. Sociales", "Inglés", "Educación Física"];
const levels = [];
for (let i = 1; i <= 8; i++) levels.push({ label: `${i}° Básico`, slug: `${i}basico`, letters: ["A", "B", "C", "D"] });
for (let i = 1; i <= 4; i++) levels.push({ label: `${i}° Medio`, slug: `${i}medio`, letters: ["A", "B", "C"] });
const legacy = new Map([
  ["mrojas", ["María Fernanda Rojas", "4° Medio A"]], ["jgomez", ["Joaquín Gómez", "3° Medio B"]], ["lgonzalez", ["Lucía González", "8° Básico A"]],
  ["pmartinez", ["Pablo Martínez", "4° Medio A"]], ["asoto", ["Antonia Soto", "4° Medio A"]], ["dcastro", ["Diego Castro", "4° Medio A"]]
]);
function slug(value) { return String(value).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "").slice(0, 24); }
function initials(name) { return name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase(); }
function nameAt(index) { return `${firstNames[index % firstNames.length]} ${lastNames[Math.floor(index / firstNames.length) % lastNames.length]}`; }
function email(username) { return `${username}@academy7.cl`; }
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
  const studentUsernames = [];
  const teacherUsernames = teacherNames.map((name, index) => index === 0 ? "asilva" : `docente${String(index + 1).padStart(2, "0")}`);
  teacherNames.forEach((nombre, index) => accounts.push({ username: teacherUsernames[index], password: index === 0 ? "colegio2024" : GENERATED_PASSWORD, nombre, rol: "Docente", email: email(teacherUsernames[index]) }));
  let studentIndex = 0;
  let courseIndex = 0;
  for (const level of levels) for (const letter of level.letters) {
    const courseId = `curso-${level.slug}-${letter}`;
    const teacherUsername = teacherUsernames[courseIndex % teacherUsernames.length];
    const courseStudents = [];
    const special = [...legacy.entries()].filter(([, [, course]]) => course === `${level.label} ${letter}`);
    for (const [username, [nombre]] of special) {
      courseStudents.push({ username, nombre, password: "colegio2024", email: email(username), rol: "Estudiante", curso: `${level.label} ${letter}`, nivel: level.label });
      studentUsernames.push(username);
    }
    const targetSize = 30 + (courseIndex % 7);
    while (courseStudents.length < targetSize) {
      const username = `est${String(studentIndex + 1).padStart(4, "0")}`;
      const nombre = nameAt(studentIndex);
      courseStudents.push({ username, nombre, password: GENERATED_PASSWORD, email: email(username), rol: "Estudiante", curso: `${level.label} ${letter}`, nivel: level.label });
      studentUsernames.push(username);
      studentIndex += 1;
    }
    courses.push({ id: courseId, teacherUsername, nombre: subjects[courseIndex % subjects.length], curso: `${level.label} ${letter}`, sala: `Sala ${(courseIndex % 20) + 1}`, horario: "Lun / Mié / Vie · 08:00", periodo: "Año escolar 2026", students: courseStudents });
    courseIndex += 1;
  }
  const uniqueStudents = [...new Map(courses.flatMap((course) => course.students).map((student) => [student.username, student])).values()];
  let guardianIndex = 1;
  for (let i = 0; i < uniqueStudents.length; i += 1) {
    const count = guardianIndex % 3 === 0 ? 3 : guardianIndex % 2 === 0 ? 2 : 1;
    const children = uniqueStudents.slice(i, i + count);
    if (!children.length) break;
    const username = `apoderado${String(guardianIndex).padStart(4, "0")}`;
    const nombre = `${firstNames[(guardianIndex + 7) % firstNames.length]} ${lastNames[(guardianIndex + 11) % lastNames.length]}`;
    guardians.push({ username, password: GENERATED_PASSWORD, nombre, email: email(username), rol: "Apoderado", children: children.map((child) => child.username) });
    i += children.length - 1;
    guardianIndex += 1;
  }
  guardians.push({ username: "cfuentes", password: "colegio2024", nombre: "Carolina Fuentes", email: email("cfuentes"), rol: "Apoderado", children: ["mrojas", "lgonzalez", "jgomez"] });
  accounts.push(...uniqueStudents, ...guardians);

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
