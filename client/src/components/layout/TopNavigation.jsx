import { NavLink } from "react-router";

const getNavLinkClass = ({ isActive }) =>
  `rounded-md px-3 py-1.5 text-xs font-medium transition-colors md:text-sm ${
    isActive
      ? "bg-blue-500 text-white"
      : "text-slate-300 hover:bg-slate-700 hover:text-white"
  }`;

export default function TopNavigation() {
  return (
    <header className="sticky top-0 z-10 w-full bg-slate-800 shadow-md">
      <div className="mx-auto flex h-12 max-w-6xl items-center justify-between px-3 md:h-14 md:px-6">
        <nav className="flex items-center gap-1 md:gap-2">
          <NavLink to="/" end className={getNavLinkClass}>
            Home
          </NavLink>
          <NavLink to="/api/live-proctoring" end className={getNavLinkClass}>
            Live Proctoring
          </NavLink>
          <NavLink to="/api/details" end className={getNavLinkClass}>
            File List Panel
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
