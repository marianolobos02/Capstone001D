import { useState } from 'react'
import './App.css'
import { getUser } from './data/schoolSeed'
import type { User } from './types'
import { PortalLayout } from './components/PortalLayout'
import { TeacherView } from './components/TeacherView'
import { GuardianView } from './components/GuardianView'
import { StudentView } from './components/StudentView'
import { signIn, signOutUser } from './lib/firebase'

const demoAccounts = [
  { username: 'asilva', label: 'Docente', password: 'colegio2024' },
  { username: 'apoderado0001', label: 'Apoderado', password: 'Academy2026!' },
  { username: 'est0001', label: 'Estudiante', password: 'Academy2026!' },
]

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [section, setSection] = useState('Inicio')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')

  const login = async (accountUsername = username, accountPassword = password) => {
    const account = demoAccounts.find((item) => item.username === accountUsername)
    if (!account) { setLoginError('Usuario no reconocido en esta aplicación.'); return }
    try { await signIn(account.username, accountPassword); setUser(getUser(account.username)); setSection('Inicio'); setLoginError('') }
    catch { setLoginError('No se pudo iniciar sesión. Verifica que la cuenta exista en Firebase y que la contraseña sea correcta.') }
  }

  if (!user) return <main className="academy-shell"><section className="academy-card login-card"><p className="eyebrow">ACADEMY7 · PORTAL ACADÉMICO</p><h1>Ingresa a tu comunidad escolar</h1><p className="intro">Ingresa con el usuario y contraseña de una cuenta creada por el seed escolar.</p><form className="login-form" onSubmit={(event) => { event.preventDefault(); login() }}><label>Usuario<input value={username} onChange={(event) => setUsername(event.target.value)} placeholder="asilva" /></label><label>Contraseña<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Contraseña" /></label>{loginError && <p className="login-error">{loginError}</p>}<button className="primary-action" type="submit">Iniciar sesión</button></form><div className="login-options">{demoAccounts.map((account) => <button className="role-option" key={account.username} onClick={() => { setUsername(account.username); setPassword(account.password); login(account.username, account.password) }}><strong>{account.label}</strong><span>{account.username}@academy7.cl</span></button>)}</div><p className="login-note">Cuentas demo: asilva / colegio2024 · apoderado0001 / Academy2026! · est0001 / Academy2026!</p></section></main>

  const content = user.rol === 'Docente' ? <TeacherView section={section} teacherUsername={user.username} /> : user.rol === 'Apoderado' ? <GuardianView section={section} username={user.username} /> : <StudentView section={section} username={user.username} />
  return <PortalLayout user={user} active={section} onNavigate={setSection} onLogout={() => { void signOutUser(); setUser(null) }}>{content}</PortalLayout>
}

export default App
