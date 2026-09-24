# Carga de cuentas Academy7 en Firebase

El archivo `js/school-seed.js` genera localmente la estructura completa del colegio para la interfaz: **44 cursos**, cursos de 1° Básico A–D a 8° Básico A–D y de 1° Medio A–C a 4° Medio A–C, entre 30 y 36 estudiantes por curso, docentes y apoderados con uno, dos o tres hijos.

La creación de cuentas reales de **Firebase Authentication** no se realiza desde el navegador. Para no exponer permisos administrativos, se ejecuta una sola vez el script `tools/seed-firebase-school.cjs` con Firebase Admin SDK.

## Procedimiento

En la consola de Firebase, entra a **Configuración del proyecto → Cuentas de servicio**, genera una clave privada y guárdala fuera de la carpeta pública del sitio con un nombre como `serviceAccountKey.json`. No la subas a GitHub.

Desde la raíz del proyecto ejecuta:

```bash
npm init -y
npm install firebase-admin
node tools/seed-firebase-school.cjs ./serviceAccountKey.json
```

El script crea o actualiza:

- Cuentas de Firebase Authentication con correo `usuario@academy7.cl`.
- Perfiles en `users`, `students` y `guardians`.
- Los 44 cursos bajo `teachers/{docente}/courses/{curso}`.
- Los estudiantes de cada curso bajo `teachers/{docente}/courses/{curso}/students/{usuario}`.
- Un archivo local `academy7-account-credentials.csv` con las credenciales iniciales.

El archivo CSV es sensible y no debe publicarse. Las cuentas generadas utilizan inicialmente la contraseña `Academy2026!`; las tres cuentas históricas de demostración conservan `colegio2024`.

Después de la carga, publica las reglas incluidas en `firestore.rules` desde la consola de Firebase o mediante Firebase CLI. En un entorno productivo se recomienda forzar el cambio de contraseña en el primer ingreso y limitar las lecturas a los estudiantes y apoderados relacionados con cada curso.
