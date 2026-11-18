import type { Course, Student, SubjectAssignment, User } from '../types'

const firstNames = ['Agustina', 'Alejandro', 'Antonia', 'Benjamín', 'Camila', 'Catalina', 'Constanza', 'Daniela', 'Diego', 'Emilia', 'Felipe', 'Fernanda', 'Florencia', 'Gabriel', 'Ignacia', 'Javiera', 'Joaquín', 'Josefa', 'Juan', 'Laura', 'Leonardo', 'Lucas', 'Lucía', 'Matías', 'Martina', 'Nicolás', 'Pablo', 'Renata', 'Rodrigo', 'Samuel', 'Santiago', 'Sofía', 'Tomás', 'Valentina', 'Vicente']
const surnames = ['Araya', 'Bustos', 'Cáceres', 'Carrasco', 'Castillo', 'Contreras', 'Cornejo', 'Díaz', 'Espinoza', 'Fernández', 'Figueroa', 'Fuentes', 'Garrido', 'Gómez', 'González', 'Herrera', 'Jara', 'Lagos', 'Martínez', 'Méndez', 'Muñoz', 'Navarro', 'Paredes', 'Pérez', 'Poblete', 'Ramírez', 'Reyes', 'Rojas', 'Salazar', 'Soto', 'Tapia', 'Torres', 'Vargas', 'Vega', 'Vera']
const femaleNames = new Set(['Agustina', 'Antonia', 'Camila', 'Catalina', 'Constanza', 'Daniela', 'Emilia', 'Fernanda', 'Florencia', 'Ignacia', 'Javiera', 'Josefa', 'Laura', 'Lucía', 'Martina', 'Renata', 'Sofía', 'Valentina'])
export function evaluationKeysForCourse(courseLabel: string) { const semester = ['semestre1Prueba1', 'semestre1Prueba2', 'semestre1Prueba3', 'semestre1Global', 'semestre2Prueba1', 'semestre2Prueba2', 'semestre2Prueba3', 'semestre2Global']; return courseLabel.includes('Medio') ? [...semester, 'examen'] : semester }
function dateWithOffset(base: string, offset: number) { const date = new Date(`${base}T12:00:00`); date.setDate(date.getDate() + offset); return date.toISOString().slice(0, 10) }
function dateOnWeekday(base: string, weekday?: string) { if (!weekday) return base; const names = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']; const target = names.indexOf(weekday); if (target < 0) return base; const date = new Date(`${base}T12:00:00`); date.setDate(date.getDate() + ((target - date.getDay() + 7) % 7)); return date.toISOString().slice(0, 10) }
export function calendarEventsForCourse(courseLabel: string, courseIndex = 0, subjects: string[] = [], preferredWeekday?: string): Array<{ key: string; date: string; subject?: string }> {
  const isMedium = courseLabel.includes('Medio'); const level = Number(courseLabel.match(/(\d+)°/)?.[1] ?? 1); const spread = courseIndex % 4
  const bases = isMedium && level === 4 ? ['2026-04-06', '2026-05-04', '2026-06-01', '2026-07-06', '2026-08-24', '2026-09-21', '2026-10-19', '2026-11-02'] : ['2026-04-06', '2026-05-04', '2026-06-01', '2026-07-06', '2026-09-07', '2026-10-05', '2026-11-02', '2026-12-01']
  const keys = evaluationKeysForCourse(courseLabel).filter((key) => key !== 'examen')
  const events: Array<{ key: string; date: string; subject?: string }> = keys.map((key, index) => ({ key, date: dateOnWeekday(dateWithOffset(bases[index], spread), preferredWeekday) }))
  if (isMedium) {
    const examSubjects = subjects.length ? [...new Set(subjects)] : ['Matemática', 'Lenguaje', 'Historia', 'Filosofía', 'Inglés', 'Ciencias', 'Educación Física', 'Geometría', 'Música']
    const examStart = level === 4 ? '2026-11-23' : '2026-12-14'
    examSubjects.forEach((subject, index) => events.push({ key: 'examen', subject, date: dateOnWeekday(dateWithOffset(examStart, index), preferredWeekday) }))
  }
  return events
}

function alignChildSurname(childName: string, guardianName: string) {
  const child = childName.split(/\s+/); const guardian = guardianName.split(/\s+/)
  if (child.length < 4 || guardian.length < 3) return childName
  const mother = femaleNames.has(guardian[0]); const first = mother ? child[2] : guardian[2]; const second = mother ? guardian[2] : child[3]
  return `${child[0]} ${child[1]} ${first} ${second}`
}
const femaleMiddleNames = ['Antonia', 'Belén', 'Carolina', 'Elena', 'Isidora', 'Josefina', 'María', 'Paz', 'Sofía', 'Valentina', 'Javiera', 'Catalina', 'Emilia', 'Fernanda']
const maleMiddleNames = ['Andrés', 'Benjamín', 'Camilo', 'Cristóbal', 'Daniel', 'Felipe', 'Ignacio', 'Javier', 'José', 'Manuel', 'Sebastián', 'Vicente', 'Alejandro', 'Tomás', 'Matías']
const teacherNames = ['Andrea Fernanda Silva Araya', 'Ricardo Andrés Peña Muñoz', 'Camila Belén Torres Rojas', 'Marco Antonio Iturra Soto', 'Laura Sofía Bennett Jara', 'Diego Alejandro Fuentes Vera', 'Paula Carolina Díaz Lagos', 'Tomás Ignacio Vera Paredes', 'Elisa María Muñoz Reyes', 'Nicolás Javier Reyes Silva', 'Sofía Valentina León Morales', 'Carolina Paz Vidal Aravena', 'Felipe Andrés Contreras Soto', 'Javiera Belén González Rojas', 'Matías Ignacio Herrera Díaz', 'Daniela Fernanda Paredes Lara', 'Gabriel Antonio Espinoza Campos', 'Constanza María Sepúlveda Vera', 'Sebastián José Castillo Pérez', 'Antonia Paz Fuentes Araya', 'Rodrigo Andrés Martínez Silva', 'Fernanda Carolina Riquelme Soto', 'Joaquín Manuel Salazar Reyes', 'Valentina Sofía Navarro Díaz', 'Esteban Felipe Carrasco Muñoz', 'Isidora Belén Vargas Rojas', 'Cristóbal Andrés Poblete Jara', 'Renata María Ortega Vera', 'Manuel Alejandro Tapia Lagos', 'Josefina Paz Cornejo Silva', 'Samuel Ignacio Gallardo Paredes', 'Catalina Fernanda Leiva Morales', 'Ignacio José Bustos Araya', 'Florencia Belén Maldonado Soto', 'Benjamín Andrés Ramírez Reyes', 'María José Figueroa Díaz', 'Vicente Tomás Garrido Lara', 'Agustina Sofía Donoso Muñoz', 'Alejandro Javier Cisternas Rojas', 'Emilia Paz Valdés Vera', 'Juan Pablo Vega Aravena', 'Martina Carolina Sanhueza Silva', 'Lucas Andrés Toledo Campos', 'Daniela Paz Núñez Reyes', 'Maximiliano José Vargas Soto', 'Gabriela Fernanda Herrera Lagos', 'Pablo Ignacio Pavez Morales', 'Trinidad María Escobar Riquelme']
const weekdays = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']
function subjectsForLevel(level: number, medium = false) {
  if (medium) return ['Matemática', 'Lenguaje', 'Historia', 'Filosofía', 'Inglés', 'Ciencias', 'Educación Física', 'Geometría', 'Música']
  if (level <= 4) return ['Matemática', 'Lenguaje y Comunicación', 'Ciencias Naturales', 'Historia', 'Inglés', 'Educación Física', 'Artes Visuales']
  return ['Matemática', 'Lenguaje y Comunicación', 'Historia', 'Ciencias Naturales', 'Inglés', 'Educación Física', 'Artes Visuales', 'Tecnología']
}
export function subjectsForCourseLabel(courseLabel: string) { const match = courseLabel.match(/(\d+)° (Básico|Medio)/); return subjectsForLevel(Number(match?.[1] ?? 1), match?.[2] === 'Medio') }
function teacherCycle(level: number, medium: boolean) { return medium ? 30 : level <= 4 ? 0 : 14 }
type Journey = 'morning' | 'afternoon'
const journeySegments = [[0, 1, 2], [3, 4, 5], [6, 7, 8]]

function courseJourney(level: number, medium: boolean): Journey {
  return (!medium && level >= 5) || (medium && level >= 3) ? 'morning' : 'afternoon'
}

function subjectGroups(subject: string): number[] {
  if (subject === 'Matemática' || subject === 'Lenguaje' || subject === 'Lenguaje y Comunicación') return [3, 3, 2, 2]
  if (subject === 'Ciencias Naturales' || subject === 'Historia' || subject === 'Ciencias') return [2, 2, 2]
  if (subject === 'Educación Física') return [3]
  if (subject === 'Inglés') return [2, 2]
  return [2]
}

function subjectPriority(subject: string) {
  if (subject === 'Matemática' || subject === 'Lenguaje' || subject === 'Lenguaje y Comunicación') return 0
  if (subject === 'Ciencias Naturales' || subject === 'Ciencias' || subject === 'Historia') return 1
  if (subject === 'Educación Física') return 2
  if (subject === 'Inglés') return 3
  return 4
}

function makeAssignments(level: number, letter: string, medium = false, courseIndex = 0): SubjectAssignment[] {
  const cycle = teacherCycle(level, medium)
  const classOffset = letter.charCodeAt(0) - 65
  const journey = courseJourney(level, medium)
  const timeSlots = journey === 'morning'
    ? ['08:00–08:40', '08:40–09:20', '09:20–10:00', '10:10–10:50', '10:50–11:30', '11:30–12:10', '12:20–13:00', '13:00–13:40', '13:40–14:20']
    : ['12:20–13:00', '13:00–13:40', '13:40–14:20', '14:30–15:10', '15:10–15:50', '15:50–16:30', '16:40–17:20', '17:20–18:00', '18:00–18:40']
  const courseBusy = new Set<string>()
  const subjects = subjectsForLevel(level, medium).sort((a, b) => subjectPriority(a) - subjectPriority(b))
  return subjects.flatMap((asignatura, index) => {
    const teacherIndex = cycle + index * 2 + (classOffset % 2)
    const teacherUsername = teacherIndex === 0 ? 'asilva' : `docente${String(teacherIndex + 1).padStart(2, '0')}`
    const sala = asignatura === 'Educación Física' ? 'Gimnasio' : `Sala ${1 + ((index + classOffset) % 5)}`
    const sessions: SubjectAssignment[] = []
    const usedDays = new Set<number>()
    const subjectDayBlocks = new Map<number, number>()
    subjectGroups(asignatura).forEach((blockCount, groupIndex) => {
      const dayCandidates = weekdays.map((_, dayIndex) => (courseIndex + index * 2 + groupIndex + dayIndex) % weekdays.length)
        .filter((dayIndex) => !usedDays.has(dayIndex))
        .concat(weekdays.map((_, dayIndex) => dayIndex).filter((dayIndex) => usedDays.has(dayIndex)))
      let placement: { dayIndex: number; start: number } | undefined
      for (const dayIndex of dayCandidates) {
        for (const segment of journeySegments) {
          for (const startOffset of [0, 1]) {
            const start = segment[0] + startOffset
            if (start + blockCount > segment[2] + 1) continue
            const keys = Array.from({ length: blockCount }, (_, block) => `${weekdays[dayIndex]}|${timeSlots[start + block]}`)
            const dayBlocks = subjectDayBlocks.get(dayIndex) ?? 0
            if (dayBlocks + blockCount <= 3 && keys.every((key) => !courseBusy.has(key))) {
              placement = { dayIndex, start }
              keys.forEach((key) => courseBusy.add(key))
              break
            }
          }
          if (placement) break
        }
        if (placement) break
      }
      if (placement) {
        usedDays.add(placement.dayIndex)
        subjectDayBlocks.set(placement.dayIndex, (subjectDayBlocks.get(placement.dayIndex) ?? 0) + blockCount)
        sessions.push({ asignatura, teacherUsername, docente: teacherNames[teacherIndex] ?? `Docente ${teacherUsername}`, dia: weekdays[placement.dayIndex], jornada: journey, hora: `${timeSlots[placement.start]} · ${timeSlots[placement.start + blockCount - 1]}`, sala, bloques: blockCount })
      } else {
        for (let block = 0; block < blockCount; block += 1) {
          let fallback: { dayIndex: number; start: number } | undefined
          for (let dayOffset = 0; dayOffset < weekdays.length && !fallback; dayOffset += 1) {
            const dayIndex = (courseIndex + index + groupIndex + dayOffset) % weekdays.length
            if ((subjectDayBlocks.get(dayIndex) ?? 0) > 0) continue
            for (let start = 0; start < timeSlots.length; start += 1) {
              const key = `${weekdays[dayIndex]}|${timeSlots[start]}`
              if (!courseBusy.has(key)) { fallback = { dayIndex, start }; break }
            }
          }
          if (!fallback) break
          const key = `${weekdays[fallback.dayIndex]}|${timeSlots[fallback.start]}`
          courseBusy.add(key)
          subjectDayBlocks.set(fallback.dayIndex, (subjectDayBlocks.get(fallback.dayIndex) ?? 0) + 1)
          sessions.push({ asignatura, teacherUsername, docente: teacherNames[teacherIndex] ?? `Docente ${teacherUsername}`, dia: weekdays[fallback.dayIndex], jornada: journey, hora: `${timeSlots[fallback.start]} · ${timeSlots[fallback.start]}`, sala, bloques: 1 })
        }
      }
    })
    return sessions
  })
}
function makeStudent(index: number, course: string, level: string): Student {
  const first = firstNames[index % firstNames.length]
  const female = femaleNames.has(first)
  const pool = female ? femaleMiddleNames : maleMiddleNames
  const middle = pool[(index * 3) % pool.length]
  const name = `${first} ${middle} ${surnames[(index * 5) % surnames.length]} ${surnames[(index * 7 + 3) % surnames.length]}`
  return { username: `est${String(index + 1).padStart(4, '0')}`, nombre: name, curso: course, nivel: level, promedio: null, asistencia: 0, evaluaciones: { prueba1: '', prueba2: '', prueba3: '' }, warnings: [], attendance: {}, attendanceJustifications: {} }
}

const allStudents: Student[] = []
export const courses: Course[] = []
let studentIndex = 0
for (let level = 1; level <= 8; level += 1) for (const letter of ['A', 'B', 'C', 'D']) {
  const courseName = `${level}° Básico ${letter}`
  const assignments = makeAssignments(level, letter, false, courses.length)
  const roster = Array.from({ length: 30 + courses.length % 7 }, () => makeStudent(studentIndex++, courseName, `${level}° Básico`))
  allStudents.push(...roster)
  courses.push({ id: `curso-${level}basico-${letter}`, nombre: assignments[0].asignatura, curso: courseName, horario: 'Horario semanal', teacherUsername: assignments[0].teacherUsername, students: roster, asignaturas: assignments })
}
for (let level = 1; level <= 4; level += 1) for (const letter of ['A', 'B', 'C']) {
  const courseName = `${level}° Medio ${letter}`
  const assignments = makeAssignments(level, letter, true, courses.length)
  const roster = Array.from({ length: 30 + courses.length % 7 }, () => makeStudent(studentIndex++, courseName, `${level}° Medio`))
  allStudents.push(...roster)
  courses.push({ id: `curso-${level}medio-${letter}`, nombre: assignments[0].asignatura, curso: courseName, horario: 'Horario semanal', teacherUsername: assignments[0].teacherUsername, students: roster, asignaturas: assignments })
}

const guardianName = 'Diego Andrés Figueroa Orellana'
const firstChild = allStudents[0]
const studentPortalDemo = allStudents.find((student) => ['7° Básico', '8° Básico', '1° Medio', '2° Medio', '3° Medio', '4° Medio'].includes(student.nivel))
if (firstChild) firstChild.nombre = alignChildSurname(firstChild.nombre, guardianName)
if (firstChild) firstChild.nombre = `${firstChild.nombre.split(/\s+/).slice(0, 2).join(' ')} Figueroa ${firstChild.nombre.split(/\s+/)[3]}`

export const users: User[] = [
  { username: 'asilva', nombre: teacherNames[0], rol: 'Docente' },
  { username: 'apoderado0001', nombre: guardianName, rol: 'Apoderado', children: firstChild ? [firstChild.username] : [] },
  { username: studentPortalDemo?.username ?? 'est0001', nombre: studentPortalDemo?.nombre ?? '', rol: 'Estudiante', curso: studentPortalDemo?.curso, nivel: studentPortalDemo?.nivel },
]

export function getUser(username: string) { return users.find((user) => user.username === username) ?? users[0] }
export function usernameFromName(name: string) { const parts = name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z\s]/g, '').trim().split(/\s+/); return `${parts[0] ?? ''}${parts[2] ?? parts[1] ?? ''}` }
export function getStudent(username: string) { return allStudents.find((student) => student.username === username) }
export function getStudentByIdentity(username: string, name?: string) { return getStudent(username) ?? allStudents.find((student) => usernameFromName(student.nombre) === username) ?? allStudents.find((student) => student.nombre === name) }
export function getCourseForStudent(username: string) {
  const student = getStudent(username)
  return student ? courses.find((course) => course.curso === student.curso) : undefined
}
export function getStudentAssignments(username: string) { return getCourseForStudent(username)?.asignaturas ?? [] }
export function calculateAverage(student: Student) { const values = Object.values(student.evaluaciones).filter((value): value is number => typeof value === 'number'); return values.length ? Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(1)) : null }
export function calculateAttendance(student: Student) { const values = Object.values(student.attendance); return values.length ? Math.round(values.filter((value) => value === 'Presente' || value === 'Justificado').length / values.length * 100) : 0 }
