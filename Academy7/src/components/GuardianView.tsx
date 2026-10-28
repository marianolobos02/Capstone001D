import { useState } from 'react'
import { getStudent, getStudentAssignments, calculateAttendance, calculateAverage, users } from '../data/schoolSeed'
import { Stat } from './PortalLayout'

export function GuardianView({ section, username }: { section: string; username: string }) {
  const guardian = users.find((user) => user.username === username)
  const childIds = guardian?.children ?? []
  const children = childIds.map(getStudent).filter((student): student is NonNullable<typeof student> => Boolean(student))
  const [selectedUsername, setSelectedUsername] = useState(children[0]?.username ?? '')
  const child = children.find((student) => student.username === selectedUsername) ?? children[0]
  const assignments = child ? getStudentAssignments(child.username) : []
  if (section === 'Inicio') return <><div className="hero guardian"><div><span className="eyebrow">Seguimiento familiar</span><h1>Resumen académico de tu familia</h1><p>Consulta la información actualizada de tus hijos.</p></div></div><div className="stats"><Stat label="Hijos asociados" value={children.length} /><Stat label="Promedio" value={child ? calculateAverage(child) ?? '—' : '—'} /><Stat label="Asistencia" value={child ? `${calculateAttendance(child)}%` : '—'} /></div><section className="panel"><h3>Personas a tu cargo</h3>{children.map((student) => <button className="child-row" key={student.username} onClick={() => setSelectedUsername(student.username)}><strong>{student.nombre}</strong><span>{student.curso} · {calculateAttendance(student)}% asistencia</span></button>)}</section></>
  if (!child) return <section className="panel"><h1>Sin hijos asociados</h1><p>Solicita al colegio asociar un estudiante a tu cuenta.</p></section>
  const childPicker = children.length > 1 ? <div className="child-picker">{children.map((student) => <button className={student.username === child.username ? 'active' : ''} key={student.username} onClick={() => setSelectedUsername(student.username)}>{student.nombre} · {student.curso}</button>)}</div> : null
  if (section === 'Mis asignaturas' || section === 'Mis hijos') return <section className="panel"><span className="eyebrow">Seguimiento familiar · {child.curso}</span>{childPicker}<h1>Asignaturas de {child.nombre}</h1>{assignments.length ? <div className="table-wrap"><table><thead><tr><th>Asignatura</th><th>Docente</th><th>Día</th><th>Hora</th><th>Sala</th></tr></thead><tbody>{assignments.map((item) => <tr key={item.asignatura}><td><strong>{item.asignatura}</strong></td><td>{item.docente}</td><td>{item.dia}</td><td>{item.hora}</td><td>{item.sala}</td></tr>)}</tbody></table></div> : <p>No hay asignaturas asignadas a este curso.</p>}</section>
  if (section === 'Horario') {
    const days = [...new Set(assignments.map((item) => item.dia))]
    return <section className="panel"><span className="eyebrow">Seguimiento familiar · {child.curso}</span>{childPicker}<h1>Horario de {child.nombre}</h1>{days.length ? <div className="schedule-grid">{days.map((day) => <article className="schedule-card" key={day}><h3>{day}</h3>{assignments.filter((item) => item.dia === day).map((item) => <div className="schedule-session" key={item.asignatura}><strong>{item.hora} · {item.asignatura}</strong><span>{item.docente}</span><small>{item.sala}</small></div>)}</article>)}</div> : <p>No hay bloques horarios asignados.</p>}</section>
  }
  if (section === 'Asistencia') return <section className="panel"><span className="eyebrow">Seguimiento familiar</span><h1>Asistencia</h1><div className="big-number">{calculateAttendance(child)}%</div><p>{child.nombre} · {child.curso}</p></section>
  if (section === 'Calificaciones') return <section className="panel"><span className="eyebrow">Seguimiento académico</span><h1>Calificaciones</h1><div className="grade-summary"><strong>Promedio actual: {calculateAverage(child) ?? '—'}</strong><span>Las evaluaciones vacías aún no se consideran.</span></div></section>
  if (section === 'Amonestaciones') return <section className="panel"><span className="eyebrow">Seguimiento formativo</span><h1>Amonestaciones</h1>{child.warnings.length ? child.warnings.map((warning) => <div className="warning-card" key={warning.id}><strong>{warning.tipo}</strong><span>{warning.fecha}</span><p>{warning.detalle}</p></div>) : <p>No hay amonestaciones registradas.</p>}</section>
  return <section className="panel"><span className="eyebrow">Agenda familiar</span><h1>{section}</h1><p>Información de {child.nombre} · {child.curso}.</p></section>
}
