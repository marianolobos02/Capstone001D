import { useState } from 'react'
import './App.css'
import type { User } from './types'
import { PortalLayout } from './components/PortalLayout'
import { TeacherView } from './components/TeacherView'
import { GuardianView } from './components/GuardianView'
import { StudentView } from './components/StudentView'
import { loadAuthenticatedProfile, signIn, signOutUser } from './lib/firebase'

function EyeIcon({ visible }: { visible: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2.5 12S6 5.75 12 5.75 21.5 12 21.5 12 18 18.25 12 18.25 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="3.15" />
      {!visible && <line x1="4.2" y1="19.8" x2="19.8" y2="4.2" />}
    </svg>
  )
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="8.2" r="3.7" />
      <path d="M4.6 20c.7-3.6 3.7-5.8 7.4-5.8s6.7 2.2 7.4 5.8" />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="4.5" y="10.2" width="15" height="10.3" rx="2.6" />
      <path d="M8 10.2V7.6a4 4 0 0 1 8 0v2.6" />
      <circle cx="12" cy="15.4" r="1.15" />
    </svg>
  )
}

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [section, setSection] = useState('Inicio')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loginError, setLoginError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [capsLock, setCapsLock] = useState(false)

  const login = async (accountUsername = username.trim(), accountPassword = password) => {
    if (isSubmitting) return
    if (!accountUsername || !accountPassword) {
      setLoginError('Ingresa usuario y contraseña.')
      return
    }
    setIsSubmitting(true)
    try {
      await signIn(accountUsername, accountPassword)
      const profile = await loadAuthenticatedProfile(accountUsername)
      setUser(profile)
      setSection('Inicio')
      setLoginError('')
    } catch {
      setLoginError('No se pudo iniciar sesión o el perfil no está autorizado. Verifica tus credenciales.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!user) return (
    <main className="login-screen">
      <section className="login-brand" aria-label="Academy7">
        <div className="brand-glow brand-glow-gold" aria-hidden="true" />
        <div className="brand-glow brand-glow-soft" aria-hidden="true" />

        <header className="login-brand-top">
          <div className="login-crest" aria-hidden="true">A7</div>
          <div className="login-brand-name">
            <strong>Academy7</strong>
            <span>Portal académico</span>
          </div>
        </header>

        <div className="login-brand-body">
          <p className="login-brand-eyebrow">Comunidad escolar conectada</p>
          <h2 className="login-brand-title">Un solo lugar para seguir tu año escolar.</h2>
          <p className="login-brand-text">
            Cursos, horarios, calificaciones, asistencia y comunicaciones, reunidos en un portal pensado para cada rol del colegio.
          </p>

          <ul className="login-roles">
            <li><span className="role-dot role-dot-teacher" />Docentes</li>
            <li><span className="role-dot role-dot-guardian" />Apoderados</li>
            <li><span className="role-dot role-dot-student" />Estudiantes</li>
          </ul>
        </div>

        <footer className="login-brand-foot">
          <span>Plataforma académica · Año escolar 2026</span>
          <span className="login-brand-line" aria-hidden="true" />
        </footer>
      </section>

      <section className="login-card">
        <div className="login-card-inner">
          <p className="login-eyebrow">Academy7 · Portal académico</p>
          <h1 className="login-title">Ingresa a tu comunidad escolar</h1>
          <p className="login-intro">
            <span className="login-intro-mark" aria-hidden="true" />
            Tu seguridad, tu educación.
          </p>

          <form className="login-form" onSubmit={(event) => { event.preventDefault(); void login() }} noValidate>
            <div className="login-field">
              <span className="login-field-icon" aria-hidden="true"><UserIcon /></span>
              <input
                id="login-username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder=" "
                autoComplete="username"
                autoCapitalize="none"
                spellCheck={false}
                disabled={isSubmitting}
              />
              <label htmlFor="login-username">Usuario o correo</label>
            </div>

            <div className="login-field login-field-password">
              <span className="login-field-icon" aria-hidden="true"><LockIcon /></span>
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                onKeyUp={(event) => setCapsLock(event.getModifierState?.('CapsLock') ?? false)}
                onBlur={() => setCapsLock(false)}
                placeholder=" "
                autoComplete="current-password"
                disabled={isSubmitting}
              />
              <label htmlFor="login-password">Contraseña</label>
              <button
                type="button"
                className={`password-toggle${showPassword ? ' is-visible' : ''}`}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                aria-pressed={showPassword}
                title={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                onClick={() => setShowPassword((visible) => !visible)}
                disabled={isSubmitting}
              >
                <EyeIcon visible={showPassword} />
              </button>
            </div>

            <p className={`login-caps${capsLock ? ' is-on' : ''}`} aria-live="polite">Bloq Mayús está activado</p>

            {loginError && <p key={loginError} className="login-error" role="alert">{loginError}</p>}

            <button className="login-submit" type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <span className="login-spinner" aria-hidden="true" />
                  Validando acceso…
                </>
              ) : (
                <>
                  Iniciar sesión
                  <span className="login-submit-arrow" aria-hidden="true">→</span>
                </>
              )}
            </button>
          </form>

          <p className="login-note">Acceso exclusivo para Docentes, Apoderados y Estudiantes.</p>
        </div>
      </section>
    </main>
  )

  const content = user.rol === 'Docente' ? <TeacherView section={section} teacherUsername={user.username} teacherName={user.nombre} /> : user.rol === 'Apoderado' ? <GuardianView section={section} username={user.username} /> : <StudentView section={section} username={user.username} name={user.nombre} course={user.curso} />
  return <PortalLayout user={user} active={section} onNavigate={setSection} onLogout={() => { void signOutUser(); setUser(null) }}>{content}</PortalLayout>
}

export default App
