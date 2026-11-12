import { getApps, initializeApp } from 'firebase/app'
import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { addDoc, collection, doc, getDoc, getDocs, getFirestore, onSnapshot, query, serverTimestamp, setDoc, where } from 'firebase/firestore'
import type { CalendarEvaluation, Course, ScheduleSession, Student, User } from '../types'

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
  const normalizedUsername = username.trim().toLowerCase()
  let emailUsername = normalizedUsername
  if (!emailUsername.includes('@')) {
    const aliasSnapshot = await getDoc(doc(firestore, 'loginAliases', normalizedUsername))
    if (aliasSnapshot.exists()) emailUsername = String(aliasSnapshot.data().email ?? emailUsername)
  }
  const email = emailUsername.includes('@') ? emailUsername : `${emailUsername}@academy7.cl`
  const credential = await signInWithEmailAndPassword(firebaseAuth, email, password)
  return credential.user
}

export async function signOutUser() { await signOut(firebaseAuth) }

export async function loadAuthenticatedProfile(username: string): Promise<User> {
  const profileId = username.trim().toLowerCase().split('@')[0]
  const profileSnapshot = await getDoc(doc(firestore, 'users', profileId))
  if (!profileSnapshot.exists()) throw new Error('Perfil no encontrado')
  const profile = profileSnapshot.data() as User
  if (profile.rol === 'Apoderado') {
    const guardianSnapshot = await getDoc(doc(firestore, 'guardians', profileId))
    return { ...profile, ...(guardianSnapshot.exists() ? guardianSnapshot.data() : {}) } as User
  }
  if (profile.rol === 'Estudiante') {
    const studentSnapshot = await getDoc(doc(firestore, 'students', profileId))
    return { ...profile, ...(studentSnapshot.exists() ? studentSnapshot.data() : {}) } as User
  }
  return profile
}

export async function loadGuardianChildren(username: string): Promise<Student[]> {
  const profileId = username.trim().toLowerCase().split('@')[0]
  const guardianSnapshot = await getDoc(doc(firestore, 'guardians', profileId))
  if (!guardianSnapshot.exists()) return []
  const childIds = (guardianSnapshot.data().children ?? []) as string[]
  const snapshots = await Promise.all(childIds.map((childId) => getDoc(doc(firestore, 'students', childId))))
  return snapshots.filter((snapshot) => snapshot.exists()).map((snapshot) => ({
    username: snapshot.id,
    nombre: String(snapshot.data().nombre ?? snapshot.id),
    curso: String(snapshot.data().curso ?? ''),
    nivel: String(snapshot.data().nivel ?? ''),
    promedio: typeof snapshot.data().promedio === 'number' ? snapshot.data().promedio : null,
    asistencia: Number(snapshot.data().asistencia ?? 0),
    evaluaciones: (snapshot.data().evaluaciones ?? {}) as Record<string, number | ''>,
    warnings: (snapshot.data().warnings ?? []) as Student['warnings'],
    attendance: (snapshot.data().attendance ?? {}) as Student['attendance'],
    attendanceJustifications: (snapshot.data().attendanceJustifications ?? {}) as Student['attendanceJustifications'],
  }))
}

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

export function listenTeacherSchedule(teacherUsername: string, onSchedule: (sessions: ScheduleSession[]) => void) {
  return onSnapshot(collection(firestore, 'teachers', teacherUsername, 'schedule'), (snapshot) => {
    onSchedule(snapshot.docs.map((item) => item.data() as ScheduleSession).sort((a, b) => `${a.dia}|${a.hora}`.localeCompare(`${b.dia}|${b.hora}`)))
  })
}

export function listenTeacherCalendar(teacherUsername: string, onCalendar: (events: CalendarEvaluation[]) => void) {
  return onSnapshot(collection(firestore, 'teachers', teacherUsername, 'calendar'), (snapshot) => {
    onCalendar(snapshot.docs.map((item) => item.data() as CalendarEvaluation).sort((a, b) => a.date.localeCompare(b.date)))
  })
}

export type TeacherMessage = { id: string; senderUsername: string; recipientUsername?: string; audience: 'student' | 'guardian' | 'both'; text: string; createdAt?: unknown }

export function listenTeacherMessages(teacherUsername: string, onMessages: (messages: TeacherMessage[]) => void, viewer?: { username: string; role: 'Estudiante' | 'Apoderado' | 'Docente' }) {
  const messages = collection(firestore, 'teachers', teacherUsername, 'messages')
  const source = viewer?.role === 'Estudiante'
    ? query(messages, where('recipientUsername', 'in', [viewer.username, 'all-students', 'all-both']), where('audience', 'in', ['student', 'both']))
    : viewer?.role === 'Apoderado'
      ? query(messages, where('recipientUsername', 'in', [viewer.username, 'all-guardians', 'all-both']), where('audience', 'in', ['guardian', 'both']))
      : messages
  return onSnapshot(source, (snapshot) => {
    onMessages(snapshot.docs.map((item) => ({ id: item.id, ...item.data() } as TeacherMessage)))
  })
}

export async function sendTeacherMessage(teacherUsername: string, message: Omit<TeacherMessage, 'id' | 'createdAt' | 'senderUsername'>) {
  await addDoc(collection(firestore, 'teachers', teacherUsername, 'messages'), { ...message, senderUsername: teacherUsername, createdAt: serverTimestamp() })
}
