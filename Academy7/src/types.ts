export type Role = 'Docente' | 'Apoderado' | 'Estudiante'
export type AttendanceStatus = 'Presente' | 'Ausente' | 'Justificado'

export type Warning = { id: string; fecha: string; tipo: string; detalle: string }
export type Student = {
  username: string
  nombre: string
  curso: string
  nivel: string
  promedio: number | null
  asistencia: number
  evaluaciones: Record<string, number | ''>
  warnings: Warning[]
  attendance: Record<string, AttendanceStatus>
}
export type SubjectAssignment = {
  asignatura: string
  teacherUsername: string
  docente: string
  dia: string
  hora: string
  sala: string
}
export type Course = {
  id: string
  nombre: string
  curso: string
  horario: string
  teacherUsername: string
  students: Student[]
  asignaturas: SubjectAssignment[]
}
export type User = { username: string; nombre: string; rol: Role; curso?: string; nivel?: string; children?: string[] }
