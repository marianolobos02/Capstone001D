import { useEffect, useMemo, useState } from 'react'
import { calculateAttendance, calculateAverage, calendarEventsForCourse, courses, evaluationKeysForCourse, getStudentByIdentity, subjectsForCourseLabel } from '../data/schoolSeed'
import { listenTeacherMessages, sendMessageToTeacher } from '../lib/firebase'
import type { TeacherMessage } from '../lib/firebase'
import type { Course, Student } from '../types'
import { Stat } from './PortalLayout'

const evaluationLabels: Record<string, string> = { semestre1Prueba1: '1° semestre · Prueba 1', semestre1Prueba2: '1° semestre · Prueba 2', semestre1Prueba3: '1° semestre · Prueba 3', semestre1Global: '1° semestre · Global', semestre2Prueba1: '2° semestre · Prueba 1', semestre2Prueba2: '2° semestre · Prueba 2', semestre2Prueba3: '2° semestre · Prueba 3', semestre2Global: '2° semestre · Global', examen: 'Examen' }

function localStudent(username: string, name: string | undefined, course: string | undefined): Student {
  const found = getStudentByIdentity(username, name)
  return found ?? { username, nombre: name ?? username, curso: course ?? 'Curso pendiente', nivel: '', promedio: null, asistencia: 0, evaluaciones: {}, warnings: [], attendance: {}, attendanceJustifications: {} }
}

function Home({ student, course }: { student: Student; course?: Course }) {
  const assignments = course?.asignaturas ?? []
  const events = calendarEventsForCourse(student.curso, course ? courses.findIndex((item) => item.id === course.id) : 0, assignments.map((item) => item.asignatura), assignments.find((item) => (item.bloques ?? 1) >= 2)?.dia)
  return <>
    <div className="hero student"><div><span className="eyebrow">Panel del estudiante</span><h1>Hola, {student.nombre.split(' ')[0]}</h1><p>{student.nombre} · {student.curso}</p></div></div>
    <div className="stats"><Stat label="Promedio general" value={calculateAverage(student) ?? '—'} /><Stat label="Asistencia" value={`${calculateAttendance(student)}%`} /><Stat label="Amonestaciones" value={student.warnings.length} /></div>
    <section className="panel"><span className="eyebrow">Horario escolar</span><h2>Mis clases</h2>{assignments.length ? <div className="schedule-grid">{['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'].map((day) => <article className="schedule-card" key={day}><h3>{day}</h3>{assignments.filter((item) => item.dia === day).map((item) => <div className="schedule-session" key={`${item.asignatura}-${item.hora}`}><strong>{item.hora} · {item.asignatura}</strong><span>{item.docente}</span><small>{item.sala}</small></div>)}{!assignments.some((item) => item.dia === day) && <small>Sin clases asignadas</small>}</article>)}</div> : <p className="muted">El horario aparecerá cuando el seed termine y se carguen las asignaturas.</p>}</section>
    <section className="panel"><span className="eyebrow">Agenda académica</span><h2>Evaluaciones</h2>{events.map((event, index) => <div className="calendar-event" key={`${event.key}-${event.subject ?? index}`}><strong>{evaluationLabels[event.key] ?? event.key}{event.subject ? ` · ${event.subject}` : ''}</strong><span>{new Date(`${event.date}T12:00:00`).toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span></div>)}</section>
  </>
}

function CoursesView({ student, course }: { student: Student; course?: Course }) {
  const assignmentsBySubject = new Map((course?.asignaturas ?? []).map((item) => [item.asignatura, item]))
  const defaultTeacher = course?.asignaturas.find((item) => item.docente)?.docente ?? 'Docente asignado'
  const uniqueAssignments = subjectsForCourseLabel(student.curso).map((subject) => assignmentsBySubject.get(subject) ?? { asignatura: subject, teacherUsername: course?.teacherUsername ?? '', docente: defaultTeacher, dia: '', hora: '', sala: '' })
  const [selectedSubject, setSelectedSubject] = useState(uniqueAssignments[0]?.asignatura ?? '')
  const assignment = uniqueAssignments.find((item) => item.asignatura === selectedSubject)
  const evaluations = evaluationKeysForCourse(student.curso)
  return <section className="panel"><span className="eyebrow">Rendimiento académico · {student.curso}</span><h1>Cursos</h1><p className="muted">Cada materia aparece una sola vez. Selecciona una para revisar todas sus calificaciones y asistencia.</p><div className="course-tabs module-tabs">{uniqueAssignments.map((item) => <button type="button" key={item.asignatura} className={selectedSubject === item.asignatura ? 'tab active' : 'tab'} onClick={() => setSelectedSubject(item.asignatura)}>{item.asignatura}</button>)}</div>{assignment ? <><h2>{assignment.asignatura}</h2><p className="course-caption">Docente: {assignment.docente}</p><div className="stats"><Stat label="Asistencia" value={`${calculateAttendance(student)}%`} /><Stat label="Promedio" value={calculateAverage(student) ?? '—'} /></div><div className="table-wrap"><table><thead><tr><th>Evaluación</th><th>Calificación</th></tr></thead><tbody>{evaluations.map((key) => <tr key={key}><td>{evaluationLabels[key] ?? key}</td><td>{student.evaluaciones[key] ?? 'Pendiente'}</td></tr>)}<tr><td><strong>Promedio</strong></td><td><strong>{calculateAverage(student) ?? '—'}</strong></td></tr></tbody></table></div></> : <p>No hay materias registradas para este curso.</p>}</section>
}

export function StudentView({ section, username, name, course: profileCourse }: { section: string; username: string; name?: string; course?: string }) {
  const student = useMemo(() => localStudent(username, name, profileCourse), [username, name, profileCourse])
  const course = courses.find((item) => item.curso === profileCourse || item.curso === student.curso)
  const teacherUsername = course?.teacherUsername
  const [messages, setMessages] = useState<TeacherMessage[]>([])
  const [messageText, setMessageText] = useState('')
  const [sentMessages, setSentMessages] = useState<TeacherMessage[]>([])
  useEffect(() => teacherUsername ? listenTeacherMessages(teacherUsername, setMessages, { username, role: 'Estudiante' }) : undefined, [teacherUsername, username])
  void messages
  if (section === 'Inicio') return <Home student={student} course={course} />
  if (section === 'Cursos' || section === 'Mis asignaturas') return <CoursesView student={student} course={course} />
  if (section === 'Amonestaciones') return <section className="panel"><span className="eyebrow">Convivencia escolar</span><h1>Mis amonestaciones</h1><p className="muted">Total registrado: {student.warnings.length}</p>{student.warnings.length ? student.warnings.map((warning) => <div className="warning-card" key={warning.id}><strong>{warning.tipo}</strong><span>{warning.fecha}</span><p>{warning.detalle}</p></div>) : <p>No hay amonestaciones registradas.</p>}</section>
  if (section === 'Mensajes') { const visibleMessages = [...messages, ...sentMessages]; return <section className="panel"><span className="eyebrow">Comunicaciones</span><h1>Mensajes con el docente</h1><p className="muted">Puedes recibir mensajes y escribir únicamente a tu docente.</p><div className="message-compose"><textarea className="message-box" value={messageText} onChange={(event) => setMessageText(event.target.value)} placeholder="Escribe un mensaje al docente..." /><button className="primary-action" disabled={!messageText.trim() || !teacherUsername} onClick={() => { const text = messageText.trim(); if (!teacherUsername || !text) return; void sendMessageToTeacher(teacherUsername, username, 'student', text).then(() => { setSentMessages((current) => [...current, { id: `local-${Date.now()}`, senderUsername: username, recipientUsername: teacherUsername, audience: 'student', text }]); setMessageText('') }) }}>Enviar al docente</button></div>{visibleMessages.length ? visibleMessages.slice().reverse().map((item) => <article className="message-card" key={item.id}><strong>{item.senderUsername === username ? 'Tú' : `Docente ${item.senderUsername}`}</strong><p>{item.text}</p></article>) : <p className="muted">No hay mensajes todavía.</p>}</section> }
  return <Home student={student} course={course} />
}
