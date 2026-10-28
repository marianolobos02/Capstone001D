import type { Course, Student, User } from '../types'

const firstNames = ['Agustina', 'Alejandro', 'Antonia', 'Benjamín', 'Camila', 'Catalina', 'Constanza', 'Daniela', 'Diego', 'Emilia', 'Felipe', 'Fernanda', 'Florencia', 'Gabriel', 'Ignacia', 'Javiera', 'Joaquín', 'Josefa', 'Juan', 'Laura', 'Leonardo', 'Lucas', 'Lucía', 'Matías', 'Martina', 'Nicolás', 'Pablo', 'Renata', 'Rodrigo', 'Samuel', 'Santiago', 'Sofía', 'Tomás', 'Valentina', 'Vicente']
const middleNames = ['Andrés', 'Antonia', 'Belén', 'Camilo', 'Carolina', 'Cristóbal', 'Daniel', 'Elena', 'Felipe', 'Ignacio', 'Isidora', 'Javier', 'José', 'Josefina', 'Manuel', 'María', 'Paz', 'Sebastián', 'Vicente']
const surnames = ['Araya', 'Bustos', 'Cáceres', 'Carrasco', 'Castillo', 'Contreras', 'Cornejo', 'Díaz', 'Espinoza', 'Fernández', 'Fuentes', 'Garrido', 'Gómez', 'González', 'Herrera', 'Jara', 'Lagos', 'Martínez', 'Méndez', 'Muñoz', 'Navarro', 'Paredes', 'Pérez', 'Poblete', 'Ramírez', 'Reyes', 'Rojas', 'Salazar', 'Soto', 'Tapia', 'Torres', 'Vargas', 'Vega', 'Vera']
const femaleNames = new Set(['Agustina', 'Antonia', 'Camila', 'Catalina', 'Constanza', 'Daniela', 'Emilia', 'Fernanda', 'Florencia', 'Ignacia', 'Javiera', 'Josefa', 'Laura', 'Lucía', 'Martina', 'Renata', 'Sofía', 'Valentina'])
const maleNames = new Set(['Alejandro', 'Benjamín', 'Diego', 'Felipe', 'Gabriel', 'Joaquín', 'José', 'Juan', 'Leonardo', 'Lucas', 'Matías', 'Nicolás', 'Pablo', 'Rodrigo', 'Samuel', 'Santiago', 'Tomás', 'Vicente', 'Andrés', 'Camilo', 'Cristóbal', 'Daniel', 'Ignacio', 'Javier', 'Manuel', 'Sebastián'])
const femaleMiddleNames = ['Antonia', 'Belén', 'Carolina', 'Elena', 'Isidora', 'Josefina', 'María', 'Paz', 'Sofía', 'Valentina', 'Javiera', 'Catalina', 'Emilia', 'Fernanda']
const maleMiddleNames = ['Andrés', 'Benjamín', 'Camilo', 'Cristóbal', 'Daniel', 'Felipe', 'Ignacio', 'Javier', 'José', 'Manuel', 'Sebastián', 'Vicente', 'Alejandro', 'Tomás', 'Matías']
const subjects = ['Matemática', 'Lenguaje y Comunicación', 'Historia', 'Ciencias Naturales', 'Inglés', 'Educación Física', 'Artes Visuales']
export function evaluationKeysForCourse(courseLabel: string) { const semester = ['semestre1Prueba1', 'semestre1Prueba2', 'semestre1Prueba3', 'semestre1Global', 'semestre2Prueba1', 'semestre2Prueba2', 'semestre2Prueba3', 'semestre2Global']; return courseLabel.includes('Medio') ? [...semester, 'examen'] : semester }

function alignChildSurname(childName: string, guardianName: string, guardianGender?: 'female' | 'male') {
  const child = childName.trim().split(/\s+/); const guardian = guardianName.trim().split(/\s+/)
  if (child.length < 4 || guardian.length < 3) return childName
  const gender = guardianGender ?? (femaleNames.has(guardian[0]) ? 'female' : maleNames.has(guardian[0]) ? 'male' : undefined)
  if (!gender) return childName
  return gender === 'female' ? `${child[0]} ${child[1]} ${child[3]} ${guardian[2]}` : `${child[0]} ${child[1]} ${guardian[2]} ${child[3]}`
}
function alignSecondName(name: string) {
  const parts = name.trim().split(/\s+/); const female = femaleNames.has(parts[0]); const male = maleNames.has(parts[0])
  if (parts.length < 2 || (!female && !male)) return name
  const pool = female ? femaleMiddleNames : maleMiddleNames
  if ((female && !femaleNames.has(parts[1])) || (male && !maleNames.has(parts[1]))) parts[1] = pool[0]
  return parts.join(' ')
}
function makeStudent(index: number, course: string, level: string): Student {
  const first = firstNames[index % firstNames.length]; const female = femaleNames.has(first); const pool = female ? femaleMiddleNames : maleMiddleNames; const middle = pool[(index * 3) % pool.length]
  const name = `${first} ${middle} ${surnames[(index * 5) % surnames.length]} ${surnames[(index * 7 + 3) % surnames.length]}`
  return { username: `est${String(index + 1).padStart(4, '0')}`, nombre: name, curso: course, nivel: level, promedio: null, asistencia: 0, evaluaciones: Object.fromEntries(evaluationKeysForCourse(course).map((key) => [key, ''])), warnings: [], attendance: {}, attendanceJustifications: {} }
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
if (firstChild) firstChild.nombre = alignChildSurname(alignSecondName(firstChild.nombre), guardianName, 'female')

export const users: User[] = [
  { username: 'asilva', nombre: 'Andrea Fernanda Silva Araya', rol: 'Docente' },
  { username: 'apoderado0001', nombre: guardianName, rol: 'Apoderado', children: firstChild ? [firstChild.username] : [] },
  { username: firstChild?.username ?? 'est0001', nombre: firstChild?.nombre ?? '', rol: 'Estudiante', curso: firstChild?.curso, nivel: firstChild?.nivel },
]

export function getUser(username: string) { return users.find((user) => user.username === username) ?? users[0] }
export function getStudent(username: string) { return allStudents.find((student) => student.username === username) }
export function calculateAverage(student: Student) { const values = Object.values(student.evaluaciones).filter((value): value is number => typeof value === 'number'); return values.length ? Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(1)) : null }
export function calculateAttendance(student: Student) { const values = Object.values(student.attendance); return values.length ? Math.round(values.filter((value) => value === 'Presente' || value === 'Justificado').length / values.length * 100) : 0 }
