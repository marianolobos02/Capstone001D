import type { Course, Student, SubjectAssignment, User } from '../types'

const firstNames = ['Agustina', 'Alejandro', 'Antonia', 'Benjamín', 'Camila', 'Catalina', 'Constanza', 'Daniela', 'Diego', 'Emilia', 'Felipe', 'Fernanda', 'Florencia', 'Gabriel', 'Ignacia', 'Javiera', 'Joaquín', 'Josefa', 'Juan', 'Laura', 'Leonardo', 'Lucas', 'Lucía', 'Matías', 'Martina', 'Nicolás', 'Pablo', 'Renata', 'Rodrigo', 'Samuel', 'Santiago', 'Sofía', 'Tomás', 'Valentina', 'Vicente']
const surnames = ['Araya', 'Bustos', 'Cáceres', 'Carrasco', 'Castillo', 'Contreras', 'Cornejo', 'Díaz', 'Espinoza', 'Fernández', 'Fuentes', 'Garrido', 'Gómez', 'González', 'Herrera', 'Jara', 'Lagos', 'Martínez', 'Méndez', 'Muñoz', 'Navarro', 'Paredes', 'Pérez', 'Poblete', 'Ramírez', 'Reyes', 'Rojas', 'Salazar', 'Soto', 'Tapia', 'Torres', 'Vargas', 'Vega', 'Vera']
const femaleNames = new Set(['Agustina', 'Antonia', 'Camila', 'Catalina', 'Constanza', 'Daniela', 'Emilia', 'Fernanda', 'Florencia', 'Ignacia', 'Javiera', 'Josefa', 'Laura', 'Lucía', 'Martina', 'Renata', 'Sofía', 'Valentina'])
const femaleMiddleNames = ['Antonia', 'Belén', 'Carolina', 'Elena', 'Isidora', 'Josefina', 'María', 'Paz', 'Sofía', 'Valentina', 'Javiera', 'Catalina', 'Emilia', 'Fernanda']
const maleMiddleNames = ['Andrés', 'Benjamín', 'Camilo', 'Cristóbal', 'Daniel', 'Felipe', 'Ignacio', 'Javier', 'José', 'Manuel', 'Sebastián', 'Vicente', 'Alejandro', 'Tomás', 'Matías']
const teacherNames = [
  'Andrea Fernanda Silva Araya', 'Ricardo Andrés Peña Muñoz', 'Camila Belén Torres Rojas', 'Marco Antonio Iturra Soto',
  'Laura Sofía Bennett Jara', 'Diego Alejandro Fuentes Vera', 'Paula Carolina Díaz Lagos', 'Tomás Ignacio Vera Paredes',
  'Elisa María Muñoz Reyes', 'Nicolás Javier Reyes Silva', 'Sofía Valentina León Morales', 'Carolina Paz Vidal Aravena',
  'Felipe Andrés Contreras Soto', 'Javiera Belén González Rojas', 'Matías Ignacio Herrera Díaz', 'Daniela Fernanda Paredes Lara',
  'Gabriel Antonio Espinoza Campos', 'Constanza María Sepúlveda Vera', 'Sebastián José Castillo Pérez', 'Antonia Paz Fuentes Araya',
  'Rodrigo Andrés Martínez Silva', 'Fernanda Carolina Riquelme Soto', 'Joaquín Manuel Salazar Reyes', 'Valentina Sofía Navarro Díaz',
  'Esteban Felipe Carrasco Muñoz', 'Isidora Belén Vargas Rojas', 'Cristóbal Andrés Poblete Jara', 'Renata María Ortega Vera',
  'Manuel Alejandro Tapia Lagos', 'Josefina Paz Cornejo Silva', 'Samuel Ignacio Gallardo Paredes', 'Catalina Fernanda Leiva Morales',
  'Ignacio José Bustos Araya', 'Florencia Belén Maldonado Soto', 'Benjamín Andrés Ramírez Reyes', 'María José Figueroa Díaz',
  'Vicente Tomás Garrido Lara', 'Agustina Sofía Donoso Muñoz', 'Alejandro Javier Cisternas Rojas', 'Emilia Paz Valdés Vera',
  'Juan Pablo Vega Aravena', 'Martina Carolina Sanhueza Silva', 'Lucas Andrés Toledo Campos', 'Daniela Paz Núñez Reyes',
  'Maximiliano José Vargas Soto', 'Gabriela Fernanda Herrera Lagos', 'Pablo Ignacio Pavez Morales', 'Trinidad María Escobar Riquelme',
]
const weekdays = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']
const timeSlots = ['08:00–09:30', '09:45–11:15', '11:30–13:00', '14:00–15:30']

function subjectsForLevel(level: number, medium = false) {
  if (medium) return ['Matemática', 'Lenguaje', 'Historia', 'Filosofía', 'Inglés', 'Ciencias', 'Educación Física', 'Geometría', 'Música']
  if (level <= 4) return ['Matemática', 'Lenguaje y Comunicación', 'Ciencias Naturales', 'Historia', 'Inglés', 'Educación Física', 'Artes Visuales']
  return ['Matemática', 'Lenguaje y Comunicación', 'Historia', 'Ciencias Naturales', 'Inglés', 'Educación Física', 'Artes Visuales', 'Tecnología']
}
function teacherCycle(level: number, medium: boolean) { return medium ? 30 : level <= 4 ? 0 : 14 }
function makeAssignments(level: number, letter: string, medium = false): SubjectAssignment[] {
  const cycle = teacherCycle(level, medium)
  const classOffset = letter.charCodeAt(0) - 65
  return subjectsForLevel(level, medium).map((asignatura, index) => {
    const teacherIndex = cycle + index * 2 + (classOffset % 2)
    const teacherUsername = teacherIndex === 0 ? 'asilva' : `docente${String(teacherIndex + 1).padStart(2, '0')}`
    const dia = weekdays[index % weekdays.length]
    const hora = timeSlots[Math.floor(index / weekdays.length)]
    const sala = asignatura === 'Educación Física' ? 'Gimnasio' : `Sala ${1 + ((index + classOffset) % 5)}`
    return { asignatura, teacherUsername, docente: teacherNames[teacherIndex] ?? `Docente ${teacherUsername}`, dia, hora, sala }
  })
}
function makeStudent(index: number, course: string, level: string): Student {
  const first = firstNames[index % firstNames.length]
  const female = femaleNames.has(first)
  const pool = female ? femaleMiddleNames : maleMiddleNames
  const middle = pool[(index * 3) % pool.length]
  const name = `${first} ${middle} ${surnames[(index * 5) % surnames.length]} ${surnames[(index * 7 + 3) % surnames.length]}`
  return { username: `est${String(index + 1).padStart(4, '0')}`, nombre: name, curso: course, nivel: level, promedio: null, asistencia: 0, evaluaciones: { prueba1: '', prueba2: '', prueba3: '' }, warnings: [], attendance: {} }
}

const allStudents: Student[] = []
export const courses: Course[] = []
let studentIndex = 0
for (let level = 1; level <= 8; level += 1) for (const letter of ['A', 'B', 'C', 'D']) {
  const courseName = `${level}° Básico ${letter}`
  const assignments = makeAssignments(level, letter)
  const roster = Array.from({ length: 30 + courses.length % 7 }, () => makeStudent(studentIndex++, courseName, `${level}° Básico`))
  allStudents.push(...roster)
  courses.push({ id: `curso-${level}basico-${letter}`, nombre: assignments[0].asignatura, curso: courseName, horario: 'Horario semanal', teacherUsername: assignments[0].teacherUsername, students: roster, asignaturas: assignments })
}
for (let level = 1; level <= 4; level += 1) for (const letter of ['A', 'B', 'C']) {
  const courseName = `${level}° Medio ${letter}`
  const assignments = makeAssignments(level, letter, true)
  const roster = Array.from({ length: 30 + courses.length % 7 }, () => makeStudent(studentIndex++, courseName, `${level}° Medio`))
  allStudents.push(...roster)
  courses.push({ id: `curso-${level}medio-${letter}`, nombre: assignments[0].asignatura, curso: courseName, horario: 'Horario semanal', teacherUsername: assignments[0].teacherUsername, students: roster, asignaturas: assignments })
}

const guardianName = 'Carolina Fernanda Fuentes Araya'
const firstChild = allStudents[0]
if (firstChild) firstChild.nombre = `${firstChild.nombre.split(/\s+/).slice(0, 2).join(' ')} ${firstChild.nombre.split(/\s+/)[3]} Fuentes`

export const users: User[] = [
  { username: 'asilva', nombre: teacherNames[0], rol: 'Docente' },
  { username: 'apoderado0001', nombre: guardianName, rol: 'Apoderado', children: firstChild ? [firstChild.username] : [] },
  { username: firstChild?.username ?? 'est0001', nombre: firstChild?.nombre ?? '', rol: 'Estudiante', curso: firstChild?.curso, nivel: firstChild?.nivel },
]

export function getUser(username: string) { return users.find((user) => user.username === username) ?? users[0] }
export function getStudent(username: string) { return allStudents.find((student) => student.username === username) }
export function getCourseForStudent(username: string) {
  const student = getStudent(username)
  return student ? courses.find((course) => course.curso === student.curso) : undefined
}
export function getStudentAssignments(username: string) { return getCourseForStudent(username)?.asignaturas ?? [] }
export function calculateAverage(student: Student) { const values = Object.values(student.evaluaciones).filter((value): value is number => typeof value === 'number'); return values.length ? Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(1)) : null }
export function calculateAttendance(student: Student) { const values = Object.values(student.attendance); return values.length ? Math.round(values.filter((value) => value === 'Presente' || value === 'Justificado').length / values.length * 100) : 0 }
