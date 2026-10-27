# Academy7 Backend

Este directorio contiene la parte administrativa y de persistencia del proyecto. Usa Firebase Authentication, Cloud Firestore y Firebase Admin SDK; no contiene claves privadas.

## Instalación

Desde esta carpeta:

```bash
npm install
```

Guarda `serviceAccountKey.json` fuera del frontend y ejecútalo desde esta carpeta:

```bash
npm run seed -- ../serviceAccountKey.json
```

También puedes usar una ruta absoluta al archivo de credenciales.

El seed actualiza o crea cuentas, perfiles, cursos y listas de estudiantes. Además, mantiene la relación familiar de apellidos: si el apoderado es masculino, su primer apellido pasa a ser el primer apellido del hijo; si es femenino, su primer apellido pasa a ser el segundo apellido del hijo.

## Estructura

- `tools/seed-firebase-school.cjs`: sincronización masiva con Firebase.
- `firestore.rules`: reglas de seguridad.
- `docs/`: esquema y guía de configuración.

Nunca subas `serviceAccountKey.json` ni `academy7-account-credentials.csv` al repositorio.
