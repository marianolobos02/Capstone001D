import { getStudent, getStudentAssignments, calculateAttendance, calculateAverage } from '../data/schoolSeed'
import { Stat } from './PortalLayout'

function Assignments({ username }: { username: string }) {
  const assignments = getStudentAssignments(username)
  return <section className="panel"><span className="eyebrow">Plan de estudios</span><h1>Mis asignaturas</h1><p>Asignaturas y docentes de tu curso.</p>{assignments.length ? <div className="table-wrap"><table><thead><tr><th>Asignatura</th><th>Docente</th><th>Día</th><th>Hora</th><th>Sala</th></tr></thead><tbody>{assignments.map((item) => <tr key={item.asignatura}><td><strong>{item.asignatura}</strong></td><td>{item.docente}</td><td>{item.dia}</td><td>{item.hora}</td><td>{item.sala}</td></tr>)}</tbody></table></div> : <p>No hay asignaturas asignadas a este curso.</p>}</section>
}

function Schedule({ username, course }: { username: string; course: string }) {
  const assignments = getStudentAssignments(username)
  const days = [...new Set(assignments.map((item) => item.dia))]
  return <section className="panel"><span className="eyebrow">Agenda escolar · {course}</span><h1>Mi horario</h1>{days.length ? <div className="schedule-grid">{days.map((day) => <article className="schedule-card" key={day}><h3>{day}</h3>{assignments.filter((item) => item.dia === day).map((item) => <div className="schedule-session" key={item.asignatura}><strong>{item.hora} · {item.asignatura}</strong><span>{item.docente}</span><small>{item.sala}</small></div>)}</article>)}</div> : <p>No hay bloques horarios asignados.</p>}</section>
}

export function StudentView({ section, username }: { section: string; username: string }) {
  const student = getStudent(username)
  if (!student) return <section className="panel"><h1>Estudiante no encontrado</h1></section>
  if (section === 'Inicio') return <><div className="hero student"><div><span className="eyebrow">Panel del estudiante</span><h1>Organiza tu año escolar</h1><p>{student.nombre} · {student.curso}</p></div></div><div className="stats"><Stat label="Promedio general" value={calculateAverage(student) ?? '—'} /><Stat label="Asistencia" value={`${calculateAttendance(student)}%`} /><Stat label="Amonestaciones" value={student.warnings.length} /></div><section className="panel"><h3>Mi curso</h3><p>{student.curso} · {getStudentAssignments(username).length} asignaturas registradas</p></section></>
  if (section === 'Mis asignaturas' || section === 'Mis cursos') return <Assignments username={username} />
  if (section === 'Horario') return <Schedule username={username} course={student.curso} />
  if (section === 'Calificaciones') return <section className="panel"><span className="eyebrow">Rendimiento académico</span><h1>Mis calificaciones</h1><div className="grade-summary"><strong>Promedio: {calculateAverage(student) ?? '—'}</strong><span>Consulta tus evaluaciones registradas.</span></div></section>
  if (section === 'Asistencia') return <section className="panel"><span className="eyebrow">Registro escolar</span><h1>Mi asistencia</h1><div className="big-number">{calculateAttendance(student)}%</div><p>Clases presentes y justificadas sobre el total registrado.</p></section>
  if (section === 'Amonestaciones') return <section className="panel"><span className="eyebrow">Convivencia escolar</span><h1>Mis amonestaciones</h1>{student.warnings.length ? student.warnings.map((warning) => <div className="warning-card" key={warning.id}><strong>{warning.tipo}</strong><span>{warning.fecha}</span><p>{warning.detalle}</p></div>) : <p>No hay amonestaciones registradas.</p>}</section>
  return <section className="panel"><span className="eyebrow">Agenda escolar</span><h1>{section}</h1><p>No hay actividades adicionales registradas.</p></section>
}
