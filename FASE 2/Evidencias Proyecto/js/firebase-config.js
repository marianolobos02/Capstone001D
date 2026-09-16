/*
  Academy7 - Configuración Firebase y Firestore

  Este archivo utiliza Firebase Compat porque el proyecto carga Firebase
  mediante etiquetas <script> en dashboard.html e index.html.
*/

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
let academy7FirebaseError = null;

/*
  Inicializar Firebase.
  El SDK se carga desde dashboard.html mediante:

  firebase-app-compat.js
  firebase-firestore-compat.js
*/
try {
  if (window.firebase) {
    if (!window.firebase.apps.length) {
      window.firebase.initializeApp(firebaseConfig);
    }

    academy7Firestore = window.firebase.firestore();

    console.info("Academy7: Firebase Firestore conectado.");
  } else {
    academy7FirebaseError = new Error(
      "Firebase SDK no cargado. Revisa las etiquetas script del HTML."
    );

    console.warn(academy7FirebaseError.message);
  }
} catch (error) {
  academy7FirebaseError = error;
  academy7Firestore = null;

  console.warn(
    "Academy7: Firebase no pudo inicializarse. Se utilizará almacenamiento local.",
    error
  );
}

/*
  Ruta general de cursos de un docente.

  teachers/{docente}/courses
*/
function courseCollection(teacherId) {
  return academy7Firestore
    .collection("teachers")
    .doc(String(teacherId))
    .collection("courses");
}

/*
  Ruta de asistencia de un curso.

  teachers/{docente}/courses/{curso}/attendance
*/
function attendanceCollection(teacherId, courseId) {
  return courseCollection(teacherId)
    .doc(String(courseId))
    .collection("attendance");
}

/*
  Ruta de un estudiante dentro de un curso.

  teachers/{docente}/courses/{curso}/students/{estudiante}
*/
function studentDocument(teacherId, courseId, studentId) {
  return courseCollection(teacherId)
    .doc(String(courseId))
    .collection("students")
    .doc(String(studentId));
}

/*
  Cargar asistencia de un curso desde Firestore.
*/
async function loadCourseAttendanceFromFirebase(teacherId, courseId) {
  if (!academy7Firestore) {
    return [];
  }

  const snapshot = await attendanceCollection(
    teacherId,
    courseId
  ).get();

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data()
  }));
}

/*
  Cargar estudiantes, notas y amonestaciones de un curso desde Firestore.
*/
async function loadCourseStudentsFromFirebase(teacherId, courseId) {
  if (!academy7Firestore) {
    return [];
  }

  const snapshot = await courseCollection(teacherId)
    .doc(String(courseId))
    .collection("students")
    .get();

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data()
  }));
}

/*
  Guardar asistencia de una fecha.

  teachers/{docente}/courses/{curso}/attendance/{fecha}
*/
async function saveCourseAttendanceToFirebase(
  teacherId,
  courseId,
  fecha,
  records
) {
  if (!academy7Firestore) {
    throw (
      academy7FirebaseError ||
      new Error("Firestore no disponible")
    );
  }

  await attendanceCollection(teacherId, courseId)
    .doc(String(fecha))
    .set(
      {
        fecha: String(fecha),
        records: records,
        updatedAt:
          window.firebase.firestore.FieldValue.serverTimestamp()
      },
      {
        merge: true
      }
    );

  return {
    fecha,
    records
  };
}

/*
  Guardar notas, porcentaje de asistencia y amonestaciones
  de un estudiante.

  teachers/{docente}/courses/{curso}/students/{estudiante}
*/
async function saveStudentRecordToFirebase(
  teacherId,
  courseId,
  student
) {
  if (!academy7Firestore) {
    throw (
      academy7FirebaseError ||
      new Error("Firestore no disponible")
    );
  }

  const studentRecord = {
    username: String(student.username || ""),
    nombre: String(student.nombre || ""),

    /*
      Si todavía no existe un promedio, se guarda null
      en vez de convertirlo automáticamente en una nota.
    */
    promedio:
      student.promedio === null ||
      student.promedio === undefined ||
      student.promedio === ""
        ? null
        : Number(student.promedio),

    asistencia: Number(student.asistencia || 0),

    amonestaciones: Number(
      student.amonestaciones || 0
    ),

    ultimaEvaluacion: String(
      student.ultimaEvaluacion || ""
    ),

    estado: String(student.estado || ""),

    /*
      Notas:
      prueba1
      prueba2
      prueba3
      examen
    */
    evaluaciones: student.evaluaciones || {},

    /*
      Lista de amonestaciones del estudiante.
    */
    warnings: Array.isArray(student.warnings)
      ? student.warnings
      : [],

    updatedAt:
      window.firebase.firestore.FieldValue.serverTimestamp()
  };

  await studentDocument(
    teacherId,
    courseId,
    student.username
  ).set(studentRecord, {
    merge: true
  });

  return studentRecord;
}

/*
  API utilizada por dashboard.js.
*/
window.Academy7Firebase = {
  isAvailable: () => Boolean(academy7Firestore),

  loadCourseAttendance:
    loadCourseAttendanceFromFirebase,

  loadCourseStudents:
    loadCourseStudentsFromFirebase,

  saveCourseAttendance:
    saveCourseAttendanceToFirebase,

  saveStudentRecord:
    saveStudentRecordToFirebase
};
