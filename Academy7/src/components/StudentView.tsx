import { useEffect, useState } from 'react'
import { getStudent, calculateAttendance, calculateAverage, courses } from '../data/schoolSeed'
import { listenTeacherMessages } from '../lib/firebase'
import type { TeacherMessage } from '../lib/firebase'
import { Stat } from './PortalLayout'

export function StudentView({ section, username }: { section: string; username: string }) {
  const student = getStudent(username)
  const teacherUsername = student ? courses.find((item) => item.students.some((itemStudent) => itemStudent.username === username))?.teacherUsername : undefined
  const [messages, setMessages] = useState<TeacherMessage[]>([])
  useEffect(() => teacherUsername ? listenTeacherMessages(teacherUsername, setMessages) : undefined, [teacherUsername])
  const visibleMessages = messages.filter((item) => item.audience === 'student' || item.audience === 'both').filter((item) => item.recipientUsername === username || item.recipientUsername === 'all-students' || item.recipientUsername === 'all-both')
  if (!student) return <section className="panel"><h1>Estudiante no encontrado</h1></section>
  if (section === 'Mensajes') return <section className="panel"><span className="eyebrow">Comunicaciones</span><h1>Mensajes de tus docentes</h1>{visibleMessages.length ? visibleMessages.slice().reverse().map((item) => <article className="message-card" key={item.id}><strong>Docente {item.senderUsername}</strong><p>{item.text}</p></article>) : <p className="muted">No hay mensajes nuevos.</p>}</section>
  if (section === 'Inicio') return <><div className="hero student"><div><span className="eyebrow">Panel del estudiante</span><h1>Organiza tu año escolar</h1><p>{student.nombre} · {student.curso}</p></div></div><div className="stats"><Stat label="Promedio general" value={calculateAverage(student) ?? '—'} /><Stat label="Asistencia" value={`${calculateAttendance(student)}%`} /><Stat label="Amonestaciones" value={student.warnings.length} /></div><section className="panel"><h3>Mi curso</h3><p>{student.curso} · Matemática · Lun / Mié / Vie · 08:00</p></section></>
  if (section === 'Calificaciones') return <section className="panel"><span className="eyebrow">Rendimiento académico</span><h1>Mis calificaciones</h1><div className="grade-summary"><strong>Promedio: {calculateAverage(student) ?? '—'}</strong><span>Consulta tus evaluaciones registradas.</span></div></section>
  if (section === 'Asistencia') return <section className="panel"><span className="eyebrow">Registro escolar</span><h1>Mi asistencia</h1><div className="big-number">{calculateAttendance(student)}%</div><p>Clases presentes y justificadas sobre el total registrado.</p></section>
  if (section === 'Amonestaciones') return <section className="panel"><span className="eyebrow">Convivencia escolar</span><h1>Mis amonestaciones</h1>{student.warnings.length ? student.warnings.map((warning) => <div className="warning-card" key={warning.id}><strong>{warning.tipo}</strong><span>{warning.fecha}</span><p>{warning.detalle}</p></div>) : <p>No hay amonestaciones registradas.</p>}</section>
  return <section className="panel"><span className="eyebrow">Agenda escolar</span><h1>{section}</h1><p>{section === 'Horario' ? 'Matemática · Lun / Mié / Vie · 08:00 · Sala 12' : 'No hay actividades adicionales registradas.'}</p></section>
}
