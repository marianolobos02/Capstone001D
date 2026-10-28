import { getApps, initializeApp } from 'firebase/app'
import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { addDoc, collection, doc, getDocs, getFirestore, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore'
import type { Course, Student } from '../types'

const firebaseConfig = {
  apiKey: 'AIzaSyCPMkIFZ0mloz5lHUdUx5w4UaOYD6wta0w',
  authDomain: 'academy7-7c07b.firebaseapp.com',
  projectId: 'academy7-7c07b',
  storageBucket: 'academy7-7c07b.firebasestorage.app',
  messagingSenderId: '915807375283',
  appId: '1:915807375283:web:522defd09d3e542cc945c6',
  measurementId: 'G-3YST95R05L',
}

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig)
export const firebaseAuth = getAuth(app)
export const firestore = getFirestore(app)

export async function signIn(username: string, password: string) {
  const credential = await signInWithEmailAndPassword(firebaseAuth, `${username}@academy7.cl`, password)
  return credential.user
}

export async function signOutUser() { await signOut(firebaseAuth) }

function studentPath(teacherUsername: string, courseId: string, studentUsername: string) {
  return doc(firestore, 'teachers', teacherUsername, 'courses', courseId, 'students', studentUsername)
}

export async function loadCourseFromFirebase(teacherUsername: string, course: Course): Promise<Course> {
  const snapshot = await getDocs(collection(firestore, 'teachers', teacherUsername, 'courses', course.id, 'students'))
  if (snapshot.empty) return course
  const records = new Map(snapshot.docs.map((item) => [item.id, item.data()]))
  return { ...course, students: course.students.map((student) => {
    const record = records.get(student.username) ?? {}
    return { ...student, ...record, evaluaciones: { ...student.evaluaciones, ...(record.evaluaciones ?? {}) }, attendance: { ...student.attendance, ...(record.attendance ?? {}) }, attendanceJustifications: { ...student.attendanceJustifications, ...(record.attendanceJustifications ?? {}) }, warnings: record.warnings ?? student.warnings } as Student
  }) }
}

export async function saveStudentToFirebase(teacherUsername: string, courseId: string, student: Student) {
  await setDoc(studentPath(teacherUsername, courseId, student.username), {
    username: student.username,
    nombre: student.nombre,
    promedio: student.promedio,
    asistencia: student.asistencia,
    evaluaciones: student.evaluaciones,
    attendance: student.attendance,
    attendanceJustifications: student.attendanceJustifications,
    warnings: student.warnings,
    amonestaciones: student.warnings.length,
    updatedAt: serverTimestamp(),
  }, { merge: true })
}

export type TeacherMessage = { id: string; senderUsername: string; recipientUsername?: string; audience: 'student' | 'guardian' | 'both'; text: string; createdAt?: unknown }

export function listenTeacherMessages(teacherUsername: string, onMessages: (messages: TeacherMessage[]) => void) {
  return onSnapshot(collection(firestore, 'teachers', teacherUsername, 'messages'), (snapshot) => {
    onMessages(snapshot.docs.map((item) => ({ id: item.id, ...item.data() } as TeacherMessage)))
  })
}

export async function sendTeacherMessage(teacherUsername: string, message: Omit<TeacherMessage, 'id' | 'createdAt' | 'senderUsername'>) {
  await addDoc(collection(firestore, 'teachers', teacherUsername, 'messages'), { ...message, senderUsername: teacherUsername, createdAt: serverTimestamp() })
}
