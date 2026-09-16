/* Academy7 Firebase / Firestore adapter.
   Firebase Authentication controls access; localStorage only keeps the
   portal's role/session data available for the demo interface. */

const firebaseConfig = {
  apiKey: "AIzaSyCPMkIFZ0mloz5lHUdUx5w4UaOYD6wta0w",
  authDomain: "academy7-7c07b.firebaseapp.com",
  projectId: "academy7-7c07b",
  storageBucket: "academy7-7c07b.firebasestorage.app",
  messagingSenderId: "915807375283",
  appId: "1:915807375283:web:522defd09d3e542cc945c6",
  measurementId: "G-3YST95R05L"
};

let academy7Firestore = null;
let academy7Auth = null;
let academy7FirebaseError = null;

try {
  if (window.firebase) {
    if (!window.firebase.apps.length) window.firebase.initializeApp(firebaseConfig);
    academy7Firestore = window.firebase.firestore();
    academy7Auth = window.firebase.auth();
  } else {
    academy7FirebaseError = new Error("Firebase SDK no cargado");
  }
} catch (error) {
  academy7FirebaseError = error;
  console.warn("Academy7: Firebase no pudo inicializarse; se usará almacenamiento local.", error);
}

function courseCollection(teacherId) {
  return academy7Firestore.collection("teachers").doc(String(teacherId)).collection("courses");
}

function attendanceCollection(teacherId, courseId) {
  return courseCollection(teacherId).doc(String(courseId)).collection("attendance");
}

function studentDocument(teacherId, courseId, studentId) {
  return courseCollection(teacherId).doc(String(courseId)).collection("students").doc(String(studentId));
}

function teacherMessagesCollection(teacherId) {
  return academy7Firestore.collection("teachers").doc(String(teacherId)).collection("messages");
}

function academyEmailForUsername(username) {
  return `${String(username || "").trim().toLowerCase()}@academy7.cl`;
}

async function signInWithFirebase(username, password) {
  if (!academy7Auth) throw academy7FirebaseError || new Error("Firebase Authentication no está disponible");
  const credential = await academy7Auth.signInWithEmailAndPassword(academyEmailForUsername(username), String(password));
  return credential.user;
}

async function signOutFromFirebase() {
  if (academy7Auth) await academy7Auth.signOut();
}

async function loadCourseAttendanceFromFirebase(teacherId, courseId) {
  if (!academy7Firestore) return [];
  const snapshot = await attendanceCollection(teacherId, courseId).get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

async function loadCourseStudentsFromFirebase(teacherId, courseId) {
  if (!academy7Firestore) return [];
  const snapshot = await courseCollection(teacherId).doc(String(courseId)).collection("students").get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

async function saveCourseAttendanceToFirebase(teacherId, courseId, fecha, records) {
  if (!academy7Firestore) throw academy7FirebaseError || new Error("Firestore no disponible");
  await attendanceCollection(teacherId, courseId).doc(String(fecha)).set({
    fecha: String(fecha),
    records,
    updatedAt: window.firebase.firestore.FieldValue.serverTimestamp()
  }, { merge: true });
  return { fecha, records };
}

async function saveStudentRecordToFirebase(teacherId, courseId, student) {
  if (!academy7Firestore) throw academy7FirebaseError || new Error("Firestore no disponible");
  const record = {
    username: String(student.username),
    nombre: String(student.nombre || ""),
    promedio: student.promedio === null || student.promedio === undefined || student.promedio === "" ? null : Number(student.promedio),
    asistencia: Number(student.asistencia || 0),
    amonestaciones: Number(student.amonestaciones || 0),
    ultimaEvaluacion: String(student.ultimaEvaluacion || ""),
    estado: String(student.estado || ""),
    evaluaciones: student.evaluaciones || {},
    warnings: Array.isArray(student.warnings) ? student.warnings : [],
    updatedAt: window.firebase.firestore.FieldValue.serverTimestamp()
  };
  await studentDocument(teacherId, courseId, student.username).set(record, { merge: true });
  return record;
}

async function loadTeacherMessagesFromFirebase(teacherId) {
  if (!academy7Firestore) return [];
  const snapshot = await teacherMessagesCollection(teacherId).get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

async function saveTeacherMessageToFirebase(teacherId, message) {
  if (!academy7Firestore) throw academy7FirebaseError || new Error("Firestore no disponible");
  const id = String(message.id || `msg-${Date.now()}`);
  await teacherMessagesCollection(teacherId).doc(id).set({
    ...message,
    id,
    updatedAt: window.firebase.firestore.FieldValue.serverTimestamp()
  }, { merge: true });
  return { ...message, id };
}

window.Academy7Firebase = {
  isAvailable: () => Boolean(academy7Firestore),
  authAvailable: () => Boolean(academy7Auth),
  signIn: signInWithFirebase,
  signOut: signOutFromFirebase,
  loadCourseAttendance: loadCourseAttendanceFromFirebase,
  loadCourseStudents: loadCourseStudentsFromFirebase,
  saveCourseAttendance: saveCourseAttendanceToFirebase,
  saveStudentRecord: saveStudentRecordToFirebase,
  loadTeacherMessages: loadTeacherMessagesFromFirebase,
  saveTeacherMessage: saveTeacherMessageToFirebase
};
