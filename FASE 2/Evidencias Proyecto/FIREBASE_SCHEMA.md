# Estructura sugerida para Firebase / Firestore

La interfaz mantiene una copia local mediante `persistDatabase(db)` para permitir pruebas offline. El acceso al portal usa Firebase Authentication con el formato `usuario@academy7.cl`; por ejemplo, `asilva` inicia sesión con `asilva@academy7.cl`. Cuando Firebase está disponible, la asistencia, las notas y las amonestaciones del perfil Docente también se leen y escriben en Firestore.

## Firebase Authentication

En Firebase Console se debe activar el proveedor **Correo electrónico/contraseña** y crear un usuario para cada cuenta del portal. Las cuentas demo esperadas son `asilva@academy7.cl`, `cfuentes@academy7.cl` y `mrojas@academy7.cl`. El formulario continúa mostrando el nombre corto (`asilva`, `cfuentes`, `mrojas`) y el adaptador convierte ese nombre al correo de Firebase antes de autenticar.

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
    prueba1: 6.4 # cada evaluación se guarda de manera independiente
    prueba2: null # puede permanecer vacía hasta que se realice la prueba
    prueba3: null
    examen: null
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

El porcentaje individual que se muestra en el curso se calcula como `(presente + justificado) / total de clases registradas * 100`. **Este porcentaje depende exclusivamente de los documentos de asistencia y nunca de las calificaciones.** Las fechas de asistencia se registran de lunes a viernes; al cambiar de fecha, la interfaz carga la sesión correspondiente o inicia una sesión nueva con todos los estudiantes como `presente`.

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

Al guardar una nota, la interfaz recalcula `promedio` usando únicamente las evaluaciones que ya tienen valor; por ello se pueden registrar las pruebas en distintos momentos del semestre. Al guardar asistencia, calcula el porcentaje usando `attended / total * 100`, sin modificar ni depender de `evaluaciones`. Al agregar, editar o eliminar una amonestación, actualiza la colección de advertencias y el contador `amonestaciones` del estudiante.

La integración activa utiliza `saveCourseAttendance` y `saveStudentRecord` desde `js/firebase-config.js`. Si Firestore rechaza una operación por reglas o autenticación, la interfaz conserva el cambio local y muestra un aviso. Las amonestaciones se guardan dentro del registro del estudiante; al editar o eliminar una, se vuelve a guardar el registro completo, por lo que el cambio permanece al cerrar y abrir la aplicación. Las reglas permiten que `teachers/{teacherId}` sea leído o escrito solamente por el usuario autenticado cuyo correo sea `${teacherId}@academy7.cl`.

## Mensajes docente-estudiante

Los mensajes se guardan en la subcolección:

```text
teachers/{teacherId}/messages/{messageId}
```

Cada documento contiene `destinatario`, `nombre`, `relacionado`, `asunto`, `fecha`, `leido`, `cuerpo` y `updatedAt`. La vista de Mensajes carga las conversaciones desde Firestore al iniciar y los mensajes enviados se guardan inmediatamente en Firestore y en el respaldo local.
