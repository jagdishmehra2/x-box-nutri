import { Menu, ShoppingCart, X } from "lucide-react";
import { NavLink } from "react-router-dom";
import { navLinks } from "../../constants/navigation";
import { useAppDispatch, useAppSelector } from "../../hooks/useRedux";
import { setMobileMenuOpen } from "../../features/ui/uiSlice";
import { cn } from "../../utils/cn";
import { UserAvatar } from "../common/UserAvatar";

const announcements = [
  "✅ 100% AUTHENTIC PRODUCTS",
  "💥 GRAND LAUNCH SALE",
  "🚚 FAST DELIVERY ACROSS INDIA",
  "💪 PREMIUM PROTEIN • CREATINE • WELLNESS",
  "🛡️ QUALITY ASSURED",
  "⚡ LIMITED TIME OFFER",
];

export const Navbar = () => {
  const dispatch = useAppDispatch();
  const isMobileMenuOpen = useAppSelector((state) => state.ui.isMobileMenuOpen);
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  const cartCount = useAppSelector((state) =>
    state.cart.items.reduce((count, item) => count + item.quantity, 0),
  );

  const closeMenu = () => dispatch(setMobileMenuOpen(false));

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40 bg-zinc-950/90 backdrop-blur-md">
        <div className="border-b border-zinc-800">
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <NavLink
              to="/"
              className="flex items-center text-lg font-bold tracking-wide text-white"
            >
              <img
                src="/nutristack.png"
                alt="NutriStack"
                className="h-8 w-8 object-contain"
              />
              <span>NutriStack</span>
            </NavLink>

            <nav
              className="hidden items-center gap-7 md:flex"
              aria-label="Primary navigation"
            >
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    cn(
                      "text-sm font-medium transition hover:text-lime-300",
                      isActive ? "text-lime-400" : "text-zinc-300",
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
                      "rounded-full transition hover:ring-2 hover:ring-lime-300",
                      isActive && "ring-2 ring-lime-400",
                    )
                  }
                  aria-label="Open profile"
                >
                  <UserAvatar src={user.avatarUrl} name={user.fullName} />
                </NavLink>
              )}
            </nav>

            <div className="flex items-center gap-2 md:hidden">
              <NavLink
                to="/cart"
                onClick={closeMenu}
                className={({ isActive }) =>
                  cn(
                    "relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800 text-white transition hover:bg-zinc-700",
                    isActive && "ring-2 ring-lime-400",
                  )
                }
                aria-label={`Open cart with ${cartCount} items`}
              >
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-lime-400 px-1 text-[11px] font-bold leading-none text-zinc-950">
                    {cartCount}
                  </span>
                )}
              </NavLink>

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
        </div>

        <div
          className="announcement-marquee border-b border-lime-300/50 bg-gradient-to-r from-lime-400 via-amber-300 to-lime-400 py-2 text-zinc-950 shadow-[0_4px_18px_rgba(163,230,53,0.18)]"
          role="region"
          aria-label="Store announcements"
        >
          <div className="announcement-track">
            {[false, true].map((isDuplicate) => (
              <div
                key={String(isDuplicate)}
                className="announcement-group"
                aria-hidden={isDuplicate || undefined}
              >
                {announcements.map((announcement) => (
                  <span
                    key={announcement}
                    className="flex shrink-0 items-center gap-5 px-5 text-xs font-extrabold tracking-[0.12em] sm:px-7 sm:text-sm"
                  >
                    {announcement}
                    <span className="text-zinc-950/40" aria-hidden="true">
                      ◆
                    </span>
                  </span>
                ))}
              </div>
            ))}
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
                    "block rounded-md px-3 py-2 text-sm font-medium",
                    isActive
                      ? "bg-zinc-800 text-lime-400"
                      : "text-zinc-300 hover:bg-zinc-800",
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
            {isAuthenticated && user && (
              <NavLink
                to="/profile"
                onClick={closeMenu}
                className={({ isActive }) =>
                  cn(
                    "mt-2 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium",
                    isActive
                      ? "bg-zinc-800 text-lime-400"
                      : "text-zinc-300 hover:bg-zinc-800",
                  )
                }
              >
                <UserAvatar
                  src={user.avatarUrl}
                  name={user.fullName}
                  className="h-8 w-8"
                />
                Profile
              </NavLink>
            )}
          </nav>
        ) : null}
      </header>
      <div className="h-[98px] sm:h-[102px]" aria-hidden="true" />
    </>
  );
};
