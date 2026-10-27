import type { Course, Student, User } from '../types'

const firstNames = ['Agustina', 'Alejandro', 'Antonia', 'Benjamín', 'Camila', 'Catalina', 'Constanza', 'Daniela', 'Diego', 'Emilia', 'Felipe', 'Fernanda', 'Florencia', 'Gabriel', 'Ignacia', 'Javiera', 'Joaquín', 'Josefa', 'Juan', 'Laura', 'Leonardo', 'Lucas', 'Lucía', 'Matías', 'Martina', 'Nicolás', 'Pablo', 'Renata', 'Rodrigo', 'Samuel', 'Santiago', 'Sofía', 'Tomás', 'Valentina', 'Vicente']
const middleNames = ['Andrés', 'Antonia', 'Belén', 'Camilo', 'Carolina', 'Cristóbal', 'Daniel', 'Elena', 'Felipe', 'Ignacio', 'Isidora', 'Javier', 'José', 'Josefina', 'Manuel', 'María', 'Paz', 'Sebastián', 'Vicente']
const surnames = ['Araya', 'Bustos', 'Cáceres', 'Carrasco', 'Castillo', 'Contreras', 'Cornejo', 'Díaz', 'Espinoza', 'Fernández', 'Fuentes', 'Garrido', 'Gómez', 'González', 'Herrera', 'Jara', 'Lagos', 'Martínez', 'Méndez', 'Muñoz', 'Navarro', 'Paredes', 'Pérez', 'Poblete', 'Ramírez', 'Reyes', 'Rojas', 'Salazar', 'Soto', 'Tapia', 'Torres', 'Vargas', 'Vega', 'Vera']
const femaleNames = new Set(['Agustina', 'Antonia', 'Camila', 'Catalina', 'Constanza', 'Daniela', 'Emilia', 'Fernanda', 'Florencia', 'Ignacia', 'Javiera', 'Josefa', 'Laura', 'Lucía', 'Martina', 'Renata', 'Sofía', 'Valentina'])
const subjects = ['Matemática', 'Lenguaje y Comunicación', 'Historia', 'Ciencias Naturales', 'Inglés', 'Educación Física', 'Artes Visuales']

function alignChildSurname(childName: string, guardianName: string) {
  const child = childName.split(/\s+/); const guardian = guardianName.split(/\s+/)
  if (child.length < 4 || guardian.length < 3) return childName
  const mother = femaleNames.has(guardian[0]); const first = mother ? child[2] : guardian[2]; const second = mother ? guardian[2] : child[3]
  return `${child[0]} ${child[1]} ${first} ${second}`
}
function makeStudent(index: number, course: string, level: string): Student {
  const first = firstNames[index % firstNames.length]; const middle = middleNames[(index * 3) % middleNames.length]
  const name = `${first} ${middle} ${surnames[(index * 5) % surnames.length]} ${surnames[(index * 7 + 3) % surnames.length]}`
  return { username: `est${String(index + 1).padStart(4, '0')}`, nombre: name, curso: course, nivel: level, promedio: null, asistencia: 0, evaluaciones: { prueba1: '', prueba2: '', prueba3: '' }, warnings: [], attendance: {} }
}

const allStudents: Student[] = []
export const courses: Course[] = []
let studentIndex = 0
for (let level = 1; level <= 8; level += 1) for (const letter of ['A', 'B', 'C', 'D']) {
  const courseName = `${level}° Básico ${letter}`; const roster = Array.from({ length: 30 + courses.length % 7 }, () => makeStudent(studentIndex++, courseName, `${level}° Básico`))
  allStudents.push(...roster); courses.push({ id: `curso-${level}basico-${letter}`, nombre: subjects[courses.length % subjects.length], curso: courseName, horario: 'Lun / Mié / Vie · 08:00', teacherUsername: courses.length === 0 ? 'asilva' : `docente${String((courses.length % 47) + 2).padStart(2, '0')}`, students: roster })
}
for (let level = 1; level <= 4; level += 1) for (const letter of ['A', 'B', 'C']) {
  const courseName = `${level}° Medio ${letter}`; const roster = Array.from({ length: 30 + courses.length % 7 }, () => makeStudent(studentIndex++, courseName, `${level}° Medio`))
  allStudents.push(...roster); courses.push({ id: `curso-${level}medio-${letter}`, nombre: subjects[courses.length % subjects.length], curso: courseName, horario: 'Mar / Jue · 10:00', teacherUsername: `docente${String((courses.length % 47) + 2).padStart(2, '0')}`, students: roster })
}

const guardianName = 'Carolina Fernanda Fuentes Araya'
const firstChild = allStudents[0]
if (firstChild) firstChild.nombre = alignChildSurname(firstChild.nombre, guardianName)

export const users: User[] = [
  { username: 'asilva', nombre: 'Andrea Fernanda Silva Araya', rol: 'Docente' },
  { username: 'apoderado0001', nombre: guardianName, rol: 'Apoderado', children: firstChild ? [firstChild.username] : [] },
  { username: firstChild?.username ?? 'est0001', nombre: firstChild?.nombre ?? '', rol: 'Estudiante', curso: firstChild?.curso, nivel: firstChild?.nivel },
]

export function getUser(username: string) { return users.find((user) => user.username === username) ?? users[0] }
export function getStudent(username: string) { return allStudents.find((student) => student.username === username) }
export function calculateAverage(student: Student) { const values = Object.values(student.evaluaciones).filter((value): value is number => typeof value === 'number'); return values.length ? Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(1)) : null }
export function calculateAttendance(student: Student) { const values = Object.values(student.attendance); return values.length ? Math.round(values.filter((value) => value === 'Presente' || value === 'Justificado').length / values.length * 100) : 0 }
