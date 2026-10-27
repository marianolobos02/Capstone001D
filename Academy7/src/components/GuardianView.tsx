import { getStudent, calculateAttendance, calculateAverage, users } from '../data/schoolSeed'
import { Stat } from './PortalLayout'

export function GuardianView({ section, username }: { section: string; username: string }) {
  const guardian = users.find((user) => user.username === username)
  const childIds = guardian?.children ?? []
  const children = childIds.map(getStudent).filter((student): student is NonNullable<typeof student> => Boolean(student))
  const child = children[0]
  if (section === 'Inicio') return <><div className="hero guardian"><div><span className="eyebrow">Seguimiento familiar</span><h1>Resumen académico de tu familia</h1><p>Consulta la información actualizada de tus hijos.</p></div></div><div className="stats"><Stat label="Hijos asociados" value={children.length} /><Stat label="Promedio" value={child ? calculateAverage(child) ?? '—' : '—'} /><Stat label="Asistencia" value={child ? `${calculateAttendance(child)}%` : '—'} /></div><section className="panel"><h3>Personas a tu cargo</h3>{children.map((student) => <div className="child-row" key={student.username}><strong>{student.nombre}</strong><span>{student.curso} · {calculateAttendance(student)}% asistencia</span></div>)}</section></>
  if (!child) return <section className="panel"><h1>Sin hijos asociados</h1><p>Solicita al colegio asociar un estudiante a tu cuenta.</p></section>
  if (section === 'Asistencia') return <section className="panel"><span className="eyebrow">Seguimiento familiar</span><h1>Asistencia</h1><div className="big-number">{calculateAttendance(child)}%</div><p>{child.nombre} · {child.curso}</p></section>
  if (section === 'Calificaciones') return <section className="panel"><span className="eyebrow">Seguimiento académico</span><h1>Calificaciones</h1><div className="grade-summary"><strong>Promedio actual: {calculateAverage(child) ?? '—'}</strong><span>Las evaluaciones vacías aún no se consideran.</span></div></section>
  if (section === 'Amonestaciones') return <section className="panel"><span className="eyebrow">Seguimiento formativo</span><h1>Amonestaciones</h1>{child.warnings.length ? child.warnings.map((warning) => <div className="warning-card" key={warning.id}><strong>{warning.tipo}</strong><span>{warning.fecha}</span><p>{warning.detalle}</p></div>) : <p>No hay amonestaciones registradas.</p>}</section>
  return <section className="panel"><span className="eyebrow">Agenda familiar</span><h1>{section}</h1><p>Información de {child.nombre} · {child.curso}.</p></section>
}
