import { useEffect, useMemo, useState } from 'react'
import { calendarEventsForCourse, calculateAttendance, calculateAverage, courses, getStudent, subjectsForCourseLabel, users } from '../data/schoolSeed'
import { listenTeacherMessages, loadGuardianChildren, sendMessageToTeacher } from '../lib/firebase'
import type { TeacherMessage } from '../lib/firebase'
import type { Student, SubjectAssignment } from '../types'
import { Stat } from './PortalLayout'

type GuardianProps = { section: string; username: string }

type ChildCardProps = {
  student: Student
  onOpen: (username: string) => void
  compact?: boolean
}

function ChildCard({ student, onOpen, compact = false }: ChildCardProps) {
  return (
    <button type="button" className={`guardian-child-card${compact ? ' compact' : ''}`} onClick={() => onOpen(student.username)}>
      <span className="guardian-child-avatar" aria-hidden="true">{student.nombre.split(' ').slice(0, 2).map((part) => part[0]).join('')}</span>
      <span className="guardian-child-copy">
        <strong>{student.nombre}</strong>
        <span>{student.curso}</span>
        {!compact && <small>Ver información vital del estudiante</small>}
      </span>
      <span className="guardian-child-arrow" aria-hidden="true">→</span>
    </button>
  )
}

function getCourse(student: Student) {
  return courses.find((item) => item.curso === student.curso || item.students.some((courseStudent) => courseStudent.username === student.username))
}

function getAssignments(student: Student): SubjectAssignment[] {
  const course = getCourse(student)
  const assignments = course?.asignaturas ?? []
  const known = new Set(assignments.map((item) => item.asignatura))
  const fallbackTeacher = assignments.find((item) => item.docente)?.docente ?? 'Docente asignado'
  return [...assignments, ...subjectsForCourseLabel(student.curso).filter((subject) => !known.has(subject)).map((subject) => ({ asignatura: subject, teacherUsername: course?.teacherUsername ?? '', docente: fallbackTeacher, dia: 'Por asignar', hora: 'Por asignar', sala: 'Por asignar', bloques: 2 }))]
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('es-CL', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(`${value}T12:00:00`))
}

function ChildDetail({ student, onBack }: { student: Student; onBack: () => void }) {
  const assignments = getAssignments(student)
  const grades = Object.values(student.evaluaciones).filter((value): value is number => typeof value === 'number')
  const average = calculateAverage(student)

  return (
    <section className="guardian-detail-page">
      <button type="button" className="back-link" onClick={onBack}>← Volver a mis hijos</button>
      <div className="guardian-detail-heading">
        <div>
          <span className="eyebrow">Ficha del estudiante</span>
          <h1>{student.nombre}</h1>
          <p>{student.curso} · {student.nivel}</p>
        </div>
        <span className="guardian-detail-avatar" aria-hidden="true">{student.nombre.split(' ').slice(0, 2).map((part) => part[0]).join('')}</span>
      </div>
      <div className="stats guardian-detail-stats">
        <Stat label="Promedio general" value={average ?? '—'} />
        <Stat label="Asistencia" value={`${calculateAttendance(student)}%`} />
        <Stat label="Amonestaciones" value={student.warnings.length} />
      </div>
      <section className="panel">
        <div className="section-title-row"><div><span className="eyebrow">Resumen académico</span><h3>Información vital</h3></div></div>
        <div className="vital-grid">
          <div><span>Nombre completo</span><strong>{student.nombre}</strong></div>
          <div><span>Curso</span><strong>{student.curso}</strong></div>
          <div><span>Calificaciones registradas</span><strong>{grades.length}</strong></div>
          <div><span>Estado formativo</span><strong>{student.warnings.length ? `${student.warnings.length} amonestación(es)` : 'Sin amonestaciones'}</strong></div>
        </div>
      </section>
      <section className="panel">
        <div className="section-title-row"><div><span className="eyebrow">Asignaturas</span><h3>Horario del estudiante</h3></div></div>
        {assignments.length ? <div className="table-wrap"><table><thead><tr><th>Asignatura</th><th>Docente</th><th>Día</th><th>Hora</th><th>Sala</th></tr></thead><tbody>{assignments.map((item, index) => <tr key={`${item.asignatura}-${item.dia}-${index}`}><td><strong>{item.asignatura}</strong></td><td>{item.docente}</td><td>{item.dia}</td><td>{item.hora}</td><td>{item.sala}</td></tr>)}</tbody></table></div> : <p className="muted">No hay horario disponible.</p>}
      </section>
      <section className="panel">
        <div className="section-title-row"><div><span className="eyebrow">Rendimiento académico</span><h3>Calificaciones</h3></div></div>
        {grades.length ? <div className="table-wrap"><table><thead><tr><th>Evaluación</th><th>Calificación</th></tr></thead><tbody>{Object.entries(student.evaluaciones).filter(([, value]) => typeof value === 'number').map(([key, value]) => <tr key={key}><td>{key}</td><td><strong>{Number(value).toFixed(1)}</strong></td></tr>)}</tbody></table></div> : <p className="muted">No hay calificaciones registradas.</p>}
      </section>
      <section className="panel">
        <div className="section-title-row"><div><span className="eyebrow">Asistencia</span><h3>Porcentaje de asistencia</h3></div><strong className="big-number">{calculateAttendance(student)}%</strong></div>
        <p className="muted">El porcentaje se calcula con las asistencias registradas para este estudiante.</p>
      </section>
      <section className="panel">
        <div className="section-title-row"><div><span className="eyebrow">Agenda académica</span><h3>Calendario de evaluaciones</h3></div></div>
        {(() => { const events = calendarEventsForCourse(student.curso, 0, assignments.map((item) => item.asignatura)).slice(0, 8); return events.length ? <div className="calendar-list">{events.map((event, index) => <article className="calendar-event" key={`${event.key}-${event.date}-${index}`}><strong>{event.subject ?? event.key}</strong><span>{formatDate(event.date)}</span></article>)}</div> : <p className="muted">No hay evaluaciones próximas.</p> })()}
      </section>
      <section className="panel">
        <div className="section-title-row"><div><span className="eyebrow">Convivencia escolar</span><h3>Amonestaciones</h3></div></div>
        {student.warnings.length ? student.warnings.map((warning) => <article className="warning-card" key={warning.id}><strong>{warning.tipo}</strong><span>{warning.fecha}</span><p>{warning.detalle}</p></article>) : <p className="muted">Este estudiante no tiene amonestaciones registradas.</p>}
      </section>
    </section>
  )
}

export function GuardianView({ section, username }: GuardianProps) {
  const guardian = users.find((user) => user.username === username)
  const localChildren = (guardian?.children ?? []).map(getStudent).filter((student): student is NonNullable<typeof student> => Boolean(student))
  const [firebaseChildren, setFirebaseChildren] = useState<Student[]>([])
  const [detailUsername, setDetailUsername] = useState('')
  const [messages, setMessages] = useState<TeacherMessage[]>([])
  const [messageText, setMessageText] = useState('')
  const [sentMessages, setSentMessages] = useState<TeacherMessage[]>([])
  const [selectedTeacher, setSelectedTeacher] = useState('')

  useEffect(() => { void loadGuardianChildren(username).then(setFirebaseChildren).catch(() => setFirebaseChildren([])) }, [username])

  const children = firebaseChildren.length ? firebaseChildren : localChildren
  const detailChild = children.find((student) => student.username === detailUsername)
  const teacherUsernames = useMemo(() => [...new Set(children.map((student) => getCourse(student)?.teacherUsername).filter((value): value is string => Boolean(value)))], [children])
  useEffect(() => {
    if (!teacherUsernames.length) return undefined
    const unsubscribers = teacherUsernames.map((teacherUsername) => listenTeacherMessages(teacherUsername, (incoming) => setMessages((current) => {
      const merged = new Map([...current, ...incoming].map((message) => [message.id, message]))
      return [...merged.values()]
    }), { username, role: 'Apoderado' }))
    return () => unsubscribers.forEach((unsubscribe) => unsubscribe())
  }, [teacherUsernames, username])

  const visibleMessages = [...messages, ...sentMessages].filter((item) => item.audience === 'guardian' || item.audience === 'both')
  const openChild = (childUsername: string) => setDetailUsername(childUsername)
  const closeDetail = () => setDetailUsername('')
  if (detailChild) return <ChildDetail student={detailChild} onBack={closeDetail} />
  if (section === 'Mensajes') { const teacher = selectedTeacher || teacherUsernames[0] || ''; return <section className="panel"><span className="eyebrow">Comunicaciones</span><h1>Mensajes del colegio</h1><p className="muted">Puedes responder únicamente a los docentes de tus hijos.</p><div className="message-compose"><select aria-label="Docente destinatario" value={teacher} onChange={(event) => setSelectedTeacher(event.target.value)}>{teacherUsernames.map((item) => <option key={item} value={item}>Docente: {item}</option>)}</select><textarea className="message-box" value={messageText} onChange={(event) => setMessageText(event.target.value)} placeholder="Escribe un mensaje al docente..." /><button className="primary-action" disabled={!messageText.trim() || !teacher} onClick={() => { const text = messageText.trim(); if (!teacher || !text) return; void sendMessageToTeacher(teacher, username, 'guardian', text).then(() => { setSentMessages((current) => [...current, { id: `local-${Date.now()}`, senderUsername: username, recipientUsername: teacher, audience: 'guardian', text }]); setMessageText('') }) }}>Enviar al docente</button></div>{visibleMessages.length ? visibleMessages.slice().reverse().map((item) => <article className="message-card" key={item.id}><strong>{item.senderUsername === username ? 'Tú' : `Docente ${item.senderUsername}`}</strong><p>{item.text}</p></article>) : <p className="muted">No hay mensajes nuevos.</p>}</section> }
  if (!children.length) return <section className="panel"><span className="eyebrow">Cuenta familiar</span><h1>Sin hijos asociados</h1><p>Solicita al colegio asociar un estudiante a tu cuenta.</p></section>

  if (section === 'Inicio') {
    const familyAverage = children.map(calculateAverage).filter((value): value is number => value !== null)
    const average = familyAverage.length ? Number((familyAverage.reduce((sum, value) => sum + value, 0) / familyAverage.length).toFixed(1)) : '—'
    return <>
      <div className="hero guardian"><div><span className="eyebrow">Seguimiento familiar</span><h1>Resumen académico de tu familia</h1><p>Consulta de forma clara la información importante de cada hijo asociado.</p></div></div>
      <section className="panel guardian-family-summary"><div className="section-title-row"><div><span className="eyebrow">Cuenta familiar</span><h3>Hijos asociados</h3></div><span className="summary-count">{children.length} {children.length === 1 ? 'estudiante' : 'estudiantes'}</span></div><div className="stats"><Stat label="Promedio familiar" value={average} /><Stat label="Asistencia promedio" value={`${Math.round(children.reduce((sum, child) => sum + calculateAttendance(child), 0) / children.length)}%`} /><Stat label="Amonestaciones" value={children.reduce((sum, child) => sum + child.warnings.length, 0)} /></div><div className="guardian-child-list">{children.map((student) => <ChildCard key={student.username} student={student} onOpen={openChild} />)}</div></section>
    </>
  }

  if (section === 'Mis hijos') return <section className="panel"><span className="eyebrow">Cuenta familiar</span><h1>Mis hijos</h1><p className="section-lead">Selecciona un nombre para consultar sus calificaciones, asistencia y situación formativa.</p><div className="guardian-child-list">{children.map((student) => <ChildCard key={student.username} student={student} onOpen={openChild} />)}</div></section>

  if (section === 'Mis asignaturas') return <section className="panel"><span className="eyebrow">Seguimiento académico</span><h1>Asignaturas de mis hijos</h1><p className="section-lead">Cada tabla corresponde a un hijo asociado y muestra su horario de clases.</p>{children.map((student) => <div className="child-section" key={student.username}><button type="button" className="child-section-title" onClick={() => openChild(student.username)}><strong>{student.nombre}</strong><span>{student.curso} · ver ficha →</span></button><AssignmentTable assignments={getAssignments(student)} /></div>)}</section>

  if (section === 'Horario') return <section className="panel"><span className="eyebrow">Agenda familiar</span><h1>Horario de mis hijos</h1>{children.map((student) => <div className="child-section" key={student.username}><h3>{student.nombre}</h3><div className="schedule-grid">{[...new Set(getAssignments(student).map((item) => item.dia))].map((day) => <article className="schedule-card" key={day}><h3>{day}</h3>{getAssignments(student).filter((item) => item.dia === day).map((item, index) => <div className="schedule-session" key={`${item.asignatura}-${index}`}><strong>{item.hora} · {item.asignatura}</strong><span>{item.docente}</span><small>{item.sala}</small></div>)}</article>)}</div></div>)}</section>

  if (section === 'Asistencia') return <section className="panel"><span className="eyebrow">Seguimiento familiar</span><h1>Asistencia</h1><p className="section-lead">Porcentaje individual de asistencia para distinguir a cada hijo asociado.</p><div className="guardian-attendance-grid">{children.map((student) => <article className="attendance-child-card" key={student.username}><div><span className="eyebrow">{student.curso}</span><h3>{student.nombre}</h3></div><div className="big-number">{calculateAttendance(student)}%</div><span className="muted">Asistencia acumulada</span></article>)}</div></section>

  if (section === 'Calificaciones') return <section className="panel"><span className="eyebrow">Seguimiento académico</span><h1>Calificaciones</h1><p className="section-lead">Notas por asignatura y promedio general de cada hijo asociado.</p>{children.map((student) => <div className="child-section" key={student.username}><div className="grade-child-heading"><div><h3>{student.nombre}</h3><span>{student.curso}</span></div><strong>Promedio general: {calculateAverage(student) ?? '—'}</strong></div><GradeTable student={student} assignments={getAssignments(student)} /></div>)}</section>

  if (section === 'Amonestaciones') return <section className="panel"><span className="eyebrow">Seguimiento formativo</span><h1>Amonestaciones</h1><p className="section-lead">Revisa el asunto y la descripción de cada situación registrada, junto al estudiante al que pertenece.</p>{children.flatMap((student) => student.warnings.map((warning) => ({ student, warning }))).map(({ student, warning }) => <article className="warning-card guardian-warning" key={`${student.username}-${warning.id}`}><div className="warning-meta"><strong>{warning.tipo}</strong><span>{warning.fecha}</span></div><p>{warning.detalle}</p><small>Estudiante: <strong>{student.nombre}</strong></small></article>)}{children.every((student) => !student.warnings.length) && <p className="muted">No hay amonestaciones registradas para tus hijos.</p>}</section>

  if (section === 'Calendario') return <GuardianCalendar children={children} />
  return null
}

function AssignmentTable({ assignments }: { assignments: SubjectAssignment[] }) {
  return assignments.length ? <div className="table-wrap"><table><thead><tr><th>Asignatura</th><th>Docente</th><th>Día</th><th>Hora</th><th>Sala</th></tr></thead><tbody>{assignments.map((item, index) => <tr key={`${item.asignatura}-${item.dia}-${index}`}><td><strong>{item.asignatura}</strong></td><td>{item.docente}</td><td>{item.dia}</td><td>{item.hora}</td><td>{item.sala}</td></tr>)}</tbody></table></div> : <p className="muted">No hay asignaturas asignadas.</p>
}

function GradeTable({ student, assignments }: { student: Student; assignments: SubjectAssignment[] }) {
  const values = Object.values(student.evaluaciones).filter((value): value is number => typeof value === 'number')
  return assignments.length ? <div className="table-wrap"><table><thead><tr><th>Asignatura</th><th>Notas registradas</th><th>Promedio general</th></tr></thead><tbody>{assignments.map((item, index) => { const grade = values[index] ?? null; return <tr key={`${item.asignatura}-${index}`}><td><strong>{item.asignatura}</strong></td><td>{grade !== null ? grade.toFixed(1) : <span className="muted">Sin calificación registrada</span>}</td><td>{student.promedio ?? calculateAverage(student) ?? '—'}</td></tr> })}</tbody></table></div> : <p className="muted">No hay asignaturas para mostrar.</p>
}

function GuardianCalendar({ children }: { children: Student[] }) {
  const events = children.flatMap((student, childIndex) => { const course = getCourse(student); if (!course) return []; return calendarEventsForCourse(student.curso, childIndex, course.asignaturas.map((item) => item.asignatura)).slice(0, 8).map((event, index) => ({ ...event, subject: event.subject ?? course.asignaturas[index % course.asignaturas.length]?.asignatura, student, id: `${student.username}-${event.key}-${event.subject ?? index}` })) }).sort((a, b) => a.date.localeCompare(b.date))
  return <section className="panel"><span className="eyebrow">Agenda familiar</span><h1>Calendario</h1><p className="section-lead">Próximas evaluaciones, con fecha, asignatura y estudiante asociado.</p>{events.length ? <div className="calendar-list">{events.map((event) => <article className="calendar-event guardian-calendar-event" key={event.id}><div><strong>{event.subject ?? 'Evaluación general'}</strong><span>{formatDate(event.date)} · {event.student.curso}</span></div><b>{event.student.nombre}</b></article>)}</div> : <p className="muted">No hay evaluaciones próximas.</p>}</section>
}
