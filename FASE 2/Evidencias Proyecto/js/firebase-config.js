/* Academy7 Firebase / Firestore adapter.
   The login remains the current demo login; attendance writes use the
   configured Firestore project and fall back to localStorage when Firestore
   is unavailable or its security rules reject the request. */

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

try {
  if (window.firebase) {
    if (!window.firebase.apps.length) window.firebase.initializeApp(firebaseConfig);
    academy7Firestore = window.firebase.firestore();
  } else {
    academy7FirebaseError = new Error("Firebase SDK no cargado");
  }
} catch (error) {
  academy7FirebaseError = error;
  console.warn("Academy7: Firebase no pudo inicializarse; se usará almacenamiento local.", error);
}

function attendanceCollection(teacherId, courseId) {
  return academy7Firestore
    .collection("teachers").doc(String(teacherId))
    .collection("courses").doc(String(courseId))
    .collection("attendance");
}

async function loadCourseAttendanceFromFirebase(teacherId, courseId) {
  if (!academy7Firestore) return [];
  const snapshot = await attendanceCollection(teacherId, courseId).get();
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

window.Academy7Firebase = {
  isAvailable: () => Boolean(academy7Firestore),
  loadCourseAttendance: loadCourseAttendanceFromFirebase,
  saveCourseAttendance: saveCourseAttendanceToFirebase
};
