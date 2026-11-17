import { NavLink, useLocation } from 'react-router-dom';
import { BarChart3, ClipboardList, Leaf, Menu, PanelLeftClose, Sparkles, X } from 'lucide-react';

const nav = [
  { to: '/dashboard', label: 'Dashboard', icon: BarChart3 },
  { to: '/records', label: 'Meal records', icon: ClipboardList },
  { to: '/predictions', label: 'Predictions', icon: Sparkles },
  { to: '/analytics', label: 'Waste analytics', icon: Leaf }
];

export default function AppShell({ children, mobileOpen, onClose, onOpen }) {
  const location = useLocation();
  const activeLabel = nav.find((item) => location.pathname.startsWith(item.to))?.label || 'Dashboard';
  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileOpen ? 'is-open' : ''}`}>
        <div className="brand-lockup">
          <div className="brand-mark"><Leaf size={19} strokeWidth={2.4} /></div>
          <div><span className="brand-name">WasteWise</span><span className="brand-caption">Food demand intelligence</span></div>
          <button className="icon-button sidebar-close" aria-label="Close navigation" onClick={onClose}><X size={18} /></button>
        </div>
        <nav className="primary-nav" aria-label="Primary navigation">
          <span className="nav-label">Workspace</span>
          {nav.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} onClick={onClose} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}><Icon size={18} /><span>{label}</span></NavLink>)}
        </nav>
        <div className="sidebar-bottom">
          <div className="health-chip"><span className="health-dot" /><div><strong>Planning system online</strong><span>Local workspace</span></div></div>
          <div className="sidebar-note">Use the evidence from every service to make the next prep call more precise.</div>
        </div>
      </aside>
      {mobileOpen && <button className="mobile-scrim" aria-label="Close navigation" onClick={onClose} />}
      <main className="main-content">
        <header className="topbar">
          <button className="icon-button menu-toggle" aria-label="Open navigation" onClick={onOpen}><Menu size={20} /></button>
          <div className="breadcrumb"><span>Workspace</span><span className="breadcrumb-separator">/</span><strong>{activeLabel}</strong></div>
          <div className="topbar-actions"><span className="sync-status"><span className="health-dot" /> API ready</span><button className="profile-chip" aria-label="Current user">CM</button></div>
        </header>
        <div className="page-wrap">{children}</div>
      </main>
    </div>
  );
}

