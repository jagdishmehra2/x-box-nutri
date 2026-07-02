import { Menu, ShoppingCart, X } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { navLinks } from '../../constants/navigation'
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux'
import { setMobileMenuOpen } from '../../features/ui/uiSlice'
import { cn } from '../../utils/cn'
import { UserAvatar } from '../common/UserAvatar'

export const Navbar = () => {
  const dispatch = useAppDispatch()
  const isMobileMenuOpen = useAppSelector((state) => state.ui.isMobileMenuOpen)
  const { user, isAuthenticated } = useAppSelector((state) => state.auth)

  const cartCount = useAppSelector((state) =>
    state.cart.items.reduce((count, item) => count + item.quantity, 0),
  )

  const closeMenu = () => dispatch(setMobileMenuOpen(false))

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <NavLink to="/" className="text-lg font-bold tracking-wide text-white">
          X-BOX NUTRITION
        </NavLink>

        <nav className="hidden items-center gap-7 md:flex" aria-label="Primary navigation">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                cn(
                  'text-sm font-medium transition hover:text-lime-300',
                  isActive ? 'text-lime-400' : 'text-zinc-300',
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
          <NavLink
            to="/cart"
            className="inline-flex items-center gap-2 rounded-lg bg-zinc-800 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-700"
            aria-label={`Open cart with ${cartCount} items`}
          >
            <ShoppingCart className="h-4 w-4" />
            Cart ({cartCount})
          </NavLink>
          {isAuthenticated && user && (
            <NavLink
              to="/profile"
              className={({ isActive }) =>
                cn(
                  'rounded-full transition hover:ring-2 hover:ring-lime-300',
                  isActive && 'ring-2 ring-lime-400',
                )
              }
              aria-label="Open profile"
            >
              <UserAvatar src={user.avatarUrl} name={user.fullName} />
            </NavLink>
          )}
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          {isAuthenticated && user && (
            <NavLink
              to="/profile"
              onClick={closeMenu}
              className={({ isActive }) =>
                cn('rounded-full', isActive && 'ring-2 ring-lime-400')
              }
              aria-label="Open profile"
            >
              <UserAvatar src={user.avatarUrl} name={user.fullName} />
            </NavLink>
          )}

          <button
            className="inline-flex items-center justify-center rounded-lg p-2 text-zinc-200 hover:bg-zinc-800"
            onClick={() => dispatch(setMobileMenuOpen(!isMobileMenuOpen))}
            aria-label="Toggle navigation menu"
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {isMobileMenuOpen ? (
        <nav
          id="mobile-menu"
          className="space-y-1 border-t border-zinc-800 px-4 py-3 md:hidden"
          aria-label="Mobile navigation"
        >
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={closeMenu}
              className={({ isActive }) =>
                cn(
                  'block rounded-md px-3 py-2 text-sm font-medium',
                  isActive
                    ? 'bg-zinc-800 text-lime-400'
                    : 'text-zinc-300 hover:bg-zinc-800',
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
          <NavLink
            to="/cart"
            onClick={closeMenu}
            className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-800 px-3 py-2 text-sm font-medium text-white"
          >
            <ShoppingCart className="h-4 w-4" />
            Cart ({cartCount})
          </NavLink>
        </nav>
      ) : null}
    </header>
  )
}
