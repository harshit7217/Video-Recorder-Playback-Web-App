import { NavLink, useLocation } from "react-router";

const getNavLinkClass = ({ isActive }) =>
  `rounded-md px-3 py-1.5 text-xs font-medium transition-colors md:text-sm ${
    isActive
      ? "bg-blue-500 text-white"
      : "text-slate-300 hover:bg-slate-700 hover:text-white"
  }`;

export default function TopNavigation() {
  const location = useLocation();
  const currentPath = location.pathname;

  if (currentPath === "/") {
    return null;
  }

  const isCandidateView =
    currentPath.startsWith("/api/candidate") ||
    currentPath === "/candidate-info";
  const isInterviewerView = currentPath.startsWith("/api/interviewer");

  if (!isCandidateView && !isInterviewerView) {
    return null;
  }

  const candidateLinks = [
    { to: "/api/candidate/circle", label: "Circle" },
    { to: "/api/candidate/polygon", label: "Polygon" },
  ];

  const interviewerLinks = [
    { to: "/api/interviewer/live-proctoring", label: "Live Proctoring" },
    { to: "/api/interviewer/file-list", label: "File List Panel" },
    { to: "/api/interviewer/circle", label: "Circle" },
    { to: "/api/interviewer/polygon", label: "Polygon" },
    { to: "/api/interviewer/signal-fraud", label: "Signal Fraud" },
  ];

  const links = isCandidateView ? candidateLinks : interviewerLinks;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-700/70 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 shadow-lg shadow-slate-900/10">
      <div className=" mx-auto flex min-h-14 max-w-7xl items-center px-3 sm:px-5 md:min-h-16 md:px-8">
        {/* Navigation */}
        <nav
          className="flex w-full items-center gap-2 overflow-x-auto scroll-smooth py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:gap-3"
          aria-label="Main navigation"
        >
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({
                isActive,
              }) => `relative flex shrink-0 items-center justify-center rounded-xl px-4 py-2.5 text-xs font-semibold whitespace-nowrap transition-all duration-300 sm:px-5 sm:text-sm ${
                isActive
                  ? "bg-white text-indigo-700 shadow-md shadow-black/10"
                  : "text-slate-300 hover:bg-white/10 hover:text-white"
              }
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-800`}
            >
              {({ isActive }) => (
                <>
                  <span>{link.label}</span>

                  {/* Active Indicator */}
                  {isActive && (
                    <span className="absolute -bottom-1 left-1/2 h-0.5 w-5 -translate-x-1/2 rounded-full bg-indigo-500" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Bottom Accent */}
      <div className="h-[2px] w-full bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-400 opacity-80" />
    </header>
  );
}
