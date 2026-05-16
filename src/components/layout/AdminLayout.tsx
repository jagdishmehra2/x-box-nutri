import { NavLink, Outlet } from 'react-router-dom'
import { cn } from '../../utils/cn'

const adminLinks = [{ to: '/admin', label: 'Dashboard' }]

export const AdminLayout = () => {
  return (
    <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl grid-cols-1 gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[220px_1fr] lg:px-8">
      <aside className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
        <p className="text-sm font-semibold text-zinc-300">Admin</p>
        <nav className="mt-3 space-y-1">
          {adminLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end
              className={({ isActive }) =>
                cn(
                  'block rounded-lg px-3 py-2 text-sm',
                  isActive
                    ? 'bg-zinc-800 text-lime-400'
                    : 'text-zinc-400 hover:bg-zinc-800',
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
        <Outlet />
      </section>
    </div>
  )
}
