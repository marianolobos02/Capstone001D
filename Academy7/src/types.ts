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
  attendanceJustifications: Record<string, string>
}
export type Course = { id: string; nombre: string; curso: string; horario: string; teacherUsername: string; students: Student[] }
export type User = { username: string; nombre: string; rol: Role; curso?: string; nivel?: string; children?: string[] }
