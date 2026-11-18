import type { SubjectAssignment } from '../types'

type ScheduleItem = SubjectAssignment & { curso?: string; courseId?: string }

type ScheduleTableProps = {
  assignments: ScheduleItem[]
  emptyMessage?: string
  showTeacher?: boolean
}

type ScheduleRow = {
  label: string
  slot?: string
  legacySlot?: string
  kind?: 'break' | 'heading'
  period: 'morning' | 'afternoon'
}

const scheduleRows: ScheduleRow[] = [
  { label: 'Jornada mañana', kind: 'heading', period: 'morning' },
  { label: '8:00 - 8:40', slot: '08:00–08:40', period: 'morning' },
  { label: '8:40 - 9:20', slot: '08:40–09:20', period: 'morning' },
  { label: '9:20 - 10:00', slot: '09:20–10:00', legacySlot: '09:30–10:10', period: 'morning' },
  { label: 'Recreo', kind: 'break', period: 'morning' },
  { label: '10:10 - 10:50', slot: '10:10–10:50', period: 'morning' },
  { label: '10:50 - 11:30', slot: '10:50–11:30', period: 'morning' },
  { label: '11:30 - 12:10', slot: '11:30–12:10', legacySlot: '11:40–12:20', period: 'morning' },
  { label: 'Recreo', kind: 'break', period: 'morning' },
  { label: '12:20 - 13:00', slot: '12:20–13:00', period: 'morning' },
  { label: '13:00 - 13:40', slot: '13:00–13:40', period: 'morning' },
  { label: '13:40 - 14:20', slot: '13:40–14:20', period: 'morning' },
  { label: 'Jornada tarde', kind: 'heading', period: 'afternoon' },
  { label: '12:20 - 13:00', slot: '12:20–13:00', period: 'afternoon' },
  { label: '13:00 - 13:40', slot: '13:00–13:40', period: 'afternoon' },
  { label: '13:40 - 14:20', slot: '13:40–14:20', period: 'afternoon' },
  { label: 'Recreo', kind: 'break', period: 'afternoon' },
  { label: '14:30 - 15:10', slot: '14:30–15:10', period: 'afternoon' },
  { label: '15:10 - 15:50', slot: '15:10–15:50', period: 'afternoon' },
  { label: '15:50 - 16:30', slot: '15:50–16:30', period: 'afternoon' },
  { label: 'Recreo', kind: 'break', period: 'afternoon' },
  { label: '16:40 - 17:20', slot: '16:40–17:20', period: 'afternoon' },
  { label: '17:20 - 18:00', slot: '17:20–18:00', period: 'afternoon' },
  { label: '18:00 - 18:40', slot: '18:00–18:40', period: 'afternoon' },
]

const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']
const slotsByPeriod: Record<ScheduleRow['period'], string[]> = {
  morning: ['08:00–08:40', '08:40–09:20', '09:20–10:00', '10:10–10:50', '10:50–11:30', '11:30–12:10', '12:20–13:00', '13:00–13:40', '13:40–14:20'],
  afternoon: ['12:20–13:00', '13:00–13:40', '13:40–14:20', '14:30–15:10', '15:10–15:50', '15:50–16:30', '16:40–17:20', '17:20–18:00', '18:00–18:40'],
}

function assignmentStart(assignment: ScheduleItem) {
  return assignment.hora.split(' · ')[0]
}

function periodForAssignment(assignment: ScheduleItem): ScheduleRow['period'] {
  if (assignment.jornada) return assignment.jornada
  const start = assignmentStart(assignment)
  return start >= '13:00' ? 'afternoon' : 'morning'
}

function slotIndex(value: string | undefined, period: ScheduleRow['period']) {
  if (!value) return -1
  const slots = slotsByPeriod[period]
  const directIndex = slots.indexOf(value)
  if (directIndex >= 0) return directIndex
  if (value === '09:30–10:10' && period === 'morning') return 2
  if (value === '11:40–12:20' && period === 'morning') return 5
  return -1
}

function assignmentForCell(assignments: ScheduleItem[], day: string, row: ScheduleRow) {
  if (!row.slot) return []
  const rowIndex = slotIndex(row.slot, row.period)
  return assignments.filter((assignment) => {
    if (assignment.dia !== day || periodForAssignment(assignment) !== row.period) return false
    const startIndex = slotIndex(assignmentStart(assignment), row.period)
    const blockCount = assignment.bloques ?? 1
    return startIndex >= 0 && rowIndex >= startIndex && rowIndex < startIndex + blockCount
  })
}

export function ScheduleTable({ assignments, emptyMessage = 'Sin clases asignadas', showTeacher = false }: ScheduleTableProps) {
  if (!assignments.length) return <p className="muted">{emptyMessage}</p>
  const activePeriods = new Set(assignments.map(periodForAssignment))
  const visibleRows = scheduleRows.filter((row) => activePeriods.has(row.period))

  return (
    <div className="schedule-table-wrap">
      <table className="schedule-table">
        <thead>
          <tr>
            <th scope="col">Bloque</th>
            {days.map((day) => <th scope="col" key={day}>{day}</th>)}
          </tr>
        </thead>
        <tbody>
          {visibleRows.map((row, index) => row.kind === 'heading' ? (
            <tr className="schedule-heading-row" key={`${row.label}-${index}`}>
              <th colSpan={days.length + 1}>{row.label}</th>
            </tr>
          ) : row.kind === 'break' ? (
            <tr className="schedule-break-row" key={`${row.label}-${index}`}>
              <th scope="row">{row.label}</th>
              <td colSpan={days.length}>Pausa</td>
            </tr>
          ) : (
            <tr key={`${row.label}-${index}`}>
              <th scope="row">{row.label}</th>
              {days.map((day) => {
                const items = assignmentForCell(assignments, day, row)
                return <td key={day}>{items.length ? items.map((item, itemIndex) => <div className="schedule-table-item" key={`${item.asignatura}-${itemIndex}`}><strong>{item.asignatura}</strong>{showTeacher && <span>{item.docente}</span>}{item.curso && <small>{item.curso}</small>}<small>{item.sala}</small></div>) : <span className="schedule-empty">—</span>}</td>
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
