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
    currentPath.startsWith("/api/candidate") || currentPath === "/candidate-info";
  const isInterviewerView = currentPath.startsWith("/api/interviewer");

  if (!isCandidateView && !isInterviewerView) {
    return null;
  }

  const candidateLinks = [
    { to: "/api/candidate/recording", label: "Recording" },
    { to: "/api/candidate/candidate-info", label: "Candidate Info" },
  ];

  const interviewerLinks = [
    { to: "/api/interviewer/live-proctoring", label: "Live Proctoring" },
    { to: "/api/interviewer/file-list", label: "File List Panel" },
    { to: "/api/interviewer/employment", label: "Employment" },
  ];

  const links = isCandidateView ? candidateLinks : interviewerLinks;

  return (
    <header className="sticky top-0 z-10 w-full bg-slate-800 shadow-md">
      <div className="mx-auto flex h-12 max-w-6xl items-center justify-between px-3 md:h-14 md:px-6">
        <nav className="flex w-full items-center gap-1 overflow-x-auto py-1 md:w-auto md:gap-2 scrollbar-none">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} className={getNavLinkClass}>
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
