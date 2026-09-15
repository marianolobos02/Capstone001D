# Estructura sugerida para Firebase / Firestore

La demo actualmente guarda los cambios en `localStorage` mediante `persistDatabase(db)` para que pueda probarse sin credenciales. Esa función es el punto central que debe reemplazarse por operaciones de Firestore cuando se configure Firebase.

## Cursos y estudiantes

Una estructura recomendada para la cuenta docente es:

```text
teachers/{teacherId}/courses/{courseId}
  nombre: "Matemática"
  curso: "4° Medio A"
  sala: "Sala 12"
  horario: "Lun / Mié / Vie · 08:00"

teachers/{teacherId}/courses/{courseId}/students/{studentId}
  username: "mrojas"
  nombre: "María Fernanda Rojas"
  promedio: 6.5
  asistencia: 96
  asistenciaDetalle:
    total: 110
    attended: 106
  evaluaciones:
    prueba1: 6.4
    prueba2: 6.6
    prueba3: 6.5
    examen: 6.7
  estado: "Regular"
  ultimaEvaluacion: "Examen"
```

## Asistencia por fecha y curso

La toma de asistencia se guarda por fecha dentro del curso. Cada estudiante puede tener uno de estos tres estados: `presente`, `ausente` o `justificado`. Para el porcentaje, tanto `presente` como `justificado` cuentan como clase asistida.

```text
teachers/{teacherId}/courses/{courseId}/attendance/{yyyy-mm-dd}
  fecha: "2026-09-15"
  records:
    studentIdA: "presente"
    studentIdB: "ausente"
    studentIdC: "justificado"
```

El porcentaje individual que se muestra en el curso se calcula como `(presente + justificado) / total de clases registradas * 100`.

Al iniciar una fecha nueva, cada estudiante comienza como `presente` para agilizar el registro; el docente puede cambiar individualmente el estado a `ausente` o `justificado` antes de guardar.

## Amonestaciones

Las amonestaciones pueden mantenerse como una subcolección para permitir edición y eliminación individual:

```text
teachers/{teacherId}/courses/{courseId}/students/{studentId}/warnings/{warningId}
  fecha: "16 sep 2026"
  tipo: "Justificación pendiente"
  detalle: "La justificación quedó pendiente de revisión por Inspectoría."
  createdAt: timestamp
  updatedAt: timestamp
```

## Flujo de sincronización

Al guardar una nota, la interfaz recalcula `promedio` y actualiza el registro del estudiante. Al guardar asistencia, calcula el porcentaje usando `attended / total * 100`. Al agregar, editar o eliminar una amonestación, actualiza la colección de advertencias y el contador `amonestaciones` del estudiante.

Para conectar Firebase, se recomienda conservar los formularios y reemplazar las llamadas a `persistDatabase(db)` por funciones como `saveStudentGrades`, `saveStudentAttendance`, `createWarning`, `updateWarning` y `deleteWarning`. La interfaz ya mantiene separados el docente, el curso y el alumno, por lo que esa migración puede hacerse sin cambiar la navegación.
