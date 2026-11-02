import { useState } from 'react'
import './App.css'
import type { User } from './types'
import { PortalLayout } from './components/PortalLayout'
import { TeacherView } from './components/TeacherView'
import { GuardianView } from './components/GuardianView'
import { StudentView } from './components/StudentView'
import { loadAuthenticatedProfile, signIn, signOutUser } from './lib/firebase'

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [section, setSection] = useState('Inicio')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')

  const login = async (accountUsername = username.trim(), accountPassword = password) => {
    if (!accountUsername || !accountPassword) { setLoginError('Ingresa usuario y contraseña.'); return }
    try { await signIn(accountUsername, accountPassword); const profile = await loadAuthenticatedProfile(accountUsername); setUser(profile); setSection('Inicio'); setLoginError('') }
    catch { setLoginError('No se pudo iniciar sesión o el perfil no está autorizado. Verifica tus credenciales.') }
  }

  if (!user) return <main className="academy-shell"><section className="academy-card login-card"><p className="eyebrow">ACADEMY7 · PORTAL ACADÉMICO</p><h1>Ingresa a tu comunidad escolar</h1><p className="intro">La cuenta y el perfil se validan directamente en Firebase.</p><form className="login-form" onSubmit={(event) => { event.preventDefault(); void login() }}><label>Usuario<input value={username} onChange={(event) => setUsername(event.target.value)} placeholder="usuario" autoComplete="username" /></label><label>Contraseña<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Contraseña" autoComplete="current-password" /></label>{loginError && <p className="login-error">{loginError}</p>}<button className="primary-action" type="submit">Iniciar sesión</button></form></section></main>

  const content = user.rol === 'Docente' ? <TeacherView section={section} teacherUsername={user.username} /> : user.rol === 'Apoderado' ? <GuardianView section={section} username={user.username} /> : <StudentView section={section} username={user.username} />
  return <PortalLayout user={user} active={section} onNavigate={setSection} onLogout={() => { void signOutUser(); setUser(null) }}>{content}</PortalLayout>
}

export default App
