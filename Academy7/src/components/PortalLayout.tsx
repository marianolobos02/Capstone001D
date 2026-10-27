import type { ReactNode } from 'react'
import type { Role, User } from '../types'

type Props = { user: User; active: string; onNavigate: (section: string) => void; onLogout: () => void; children: ReactNode }

const menus: Record<Role, string[]> = {
  Docente: ['Inicio', 'Cursos', 'Horario', 'Calendario', 'Mensajes'],
  Apoderado: ['Inicio', 'Mis hijos', 'Asistencia', 'Calificaciones', 'Amonestaciones', 'Calendario'],
  Estudiante: ['Inicio', 'Mis cursos', 'Horario', 'Calendario', 'Calificaciones', 'Asistencia', 'Amonestaciones'],
}

export function PortalLayout({ user, active, onNavigate, onLogout, children }: Props) {
  return <div className="portal-layout">
    <aside className="portal-sidebar">
      <div className="brand"><span className="brand-mark">A7</span><div><strong>Academy7</strong><small>Portal académico</small></div></div>
      <div className="role-chip">{user.rol}</div>
      <nav>{menus[user.rol].map((item) => <button className={active === item ? 'nav-item active' : 'nav-item'} key={item} onClick={() => onNavigate(item)}>{item}</button>)}</nav>
      <button className="logout" onClick={onLogout}>Cerrar sesión</button>
    </aside>
    <main className="portal-main"><header className="portal-header"><div><span className="muted">Sesión activa</span><h2>{active}</h2></div><div className="user-pill"><span>{user.nombre.split(' ').slice(0, 2).map((part) => part[0]).join('')}</span>{user.nombre}</div></header>{children}</main>
  </div>
}

export function Stat({ label, value }: { label: string; value: string | number }) { return <div className="stat"><strong>{value}</strong><span>{label}</span></div> }
