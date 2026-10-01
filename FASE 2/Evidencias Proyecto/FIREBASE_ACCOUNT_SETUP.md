# Sincronización de cuentas Academy7 con Firebase

El navegador genera la estructura local para la interfaz. Las cuentas reales de **Firebase Authentication** y los documentos de Firestore se crean con `tools/seed-firebase-school.cjs`, usando Firebase Admin SDK.

## Antes de ejecutar

1. En Firebase Console abre **Configuración del proyecto → Cuentas de servicio**.
2. Selecciona **Node.js** y genera una clave privada.
3. Guarda el archivo como `serviceAccountKey.json` en la raíz del proyecto o fuera de la carpeta pública.
4. No subas esa clave ni el CSV de credenciales a GitHub.

## Ejecución desde la raíz

```bash
npm install firebase-admin
node tools/seed-firebase-school.cjs ./serviceAccountKey.json
```

El proceso crea o actualiza:

- **48 docentes**, **724 apoderados** y **1.447 estudiantes**.
- **44 cursos**, desde 1° Básico A–D hasta 4° Medio A–C.
- Entre **30 y 36 estudiantes por curso**.
- Asignaturas y dos docentes por asignatura en cada ciclo: 1°–4° Básico, 5°–8° Básico y 1°–4° Medio.
- Perfiles en `users`, `students` y `guardians`.
- Cursos bajo `teachers/{docente}/courses/{curso}` y estudiantes bajo su subcolección `students`.
- `academy7-account-credentials.csv` con las credenciales iniciales.

Las cuentas generadas usan inicialmente `Academy2026!`. Las cuentas históricas de demostración conservan `colegio2024`. Los correos se forman con primer nombre + primer apellido; si hay colisión se agrega progresivamente el prefijo del segundo apellido y, si fuera necesario, partes del segundo nombre.

## Después de ejecutar

Publica `FASE 2/Evidencias Proyecto/firestore.rules` en Firestore Rules. Si se usa Firebase CLI:

```bash
firebase deploy --only firestore:rules
```

Al abrir la aplicación, `schoolSeedVersion` debe quedar en `2026-full-school-v3`. Si el navegador conserva una versión anterior, borra solo el almacenamiento local del sitio y vuelve a cargar; esto no borra los datos de Firebase.

## Seguridad

- `serviceAccountKey.json` y `academy7-account-credentials.csv` son archivos sensibles.
- No los coloques dentro de la carpeta pública ni los compartas.
- En producción, fuerza el cambio de contraseña en el primer ingreso y restringe las lecturas de cursos a las relaciones reales entre docente, estudiante y apoderado.
