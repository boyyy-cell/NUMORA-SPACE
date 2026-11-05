import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import BrandLogo from '../common/BrandLogo';
import BackendStatusBadge from '../common/BackendStatusBadge';
import { useBackendStatus } from '../../hooks/useBackendStatus';
import {
  LayoutDashboard,
  BookOpen,
  Bot,
  Sliders,
  Award,
  Gamepad2,
  Microscope,
  GraduationCap,
  Home,
  LogOut,
  Users,
  Activity,
  FileText,
  Download
} from 'lucide-react';

export default function Sidebar({ role = 'student', activeTab = 'overview', setActiveTab, isOpen, setIsOpen }) {
  const location = useLocation();
  const { status, checkNow, baseUrl, error } = useBackendStatus();

  // Simplified navigation tabs for Student Space
  const studentLinks = [
    { id: 'overview', label: 'Beranda', icon: LayoutDashboard },
    { id: 'modules', label: 'Materi', icon: BookOpen },
    { id: 'lab', label: 'Algebra Lab', icon: Sliders },
    { id: 'run', label: 'NUMORA RUN', icon: Gamepad2, badge: 'GAME' },
    { id: 'nora', label: 'NORA', icon: Bot },
    { id: 'challenge', label: 'Evaluasi', icon: Award },
  ];

  // Simplified 5 primary navigation tabs for Researcher Space
  const researcherLinks = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'subjects', label: 'Partisipan', icon: Users },
    { id: 'monitoring', label: 'Monitoring', icon: Activity },
    { id: 'instruments', label: 'Instrumen', icon: FileText },
    { id: 'analytics', label: 'Analisis & Ekspor', icon: Download },
  ];

  const links = role === 'researcher' ? researcherLinks : studentLinks;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-charcoal/40 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-pure-white border-r border-border-clean flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-5 space-y-5">
          {/* Logo */}
          <div className="flex items-center justify-between pb-2">
            <BrandLogo size="default" />
          </div>

          {/* Current Role Indicator */}
          <div className="p-2.5 rounded-xl bg-ivory border border-border-clean flex items-center justify-between">
            <div className="flex items-center gap-2">
              {role === 'researcher' ? (
                <Microscope className="w-4 h-4 text-forest" />
              ) : (
                <GraduationCap className="w-4 h-4 text-forest" />
              )}
              <div className="leading-tight">
                <span className="text-[11px] font-bold text-charcoal uppercase tracking-wider block">
                  {role === 'researcher' ? 'Ruang Peneliti' : 'Ruang Siswa'}
                </span>
                <span className="text-[10px] text-secondary-text">
                  Sage & Ivory v1.6
                </span>
              </div>
            </div>

            <Link
              to={role === 'researcher' ? '/student-dashboard' : '/researcher-dashboard'}
              className="text-[11px] text-forest font-semibold hover:underline"
              title="Ganti ke peran lain"
            >
              Ganti
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1 pt-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-secondary-text px-2 mb-2">
              Menu Utama
            </div>
            {links.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab?.(item.id);
                    setIsOpen?.(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-all ${
                    isActive
                      ? 'bg-forest text-pure-white font-semibold shadow-subtle'
                      : 'text-secondary-text hover:text-charcoal hover:bg-ivory font-medium'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-pure-white' : 'text-secondary-text'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded tracking-wider ${
                      isActive ? 'bg-pure-white/20 text-pure-white' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer: Backend status & links */}
        <div className="p-4 border-t border-border-clean space-y-3 bg-ivory/50">
          <BackendStatusBadge status={status} checkNow={checkNow} baseUrl={baseUrl} error={error} />

          <div className="flex items-center justify-between pt-1 text-xs">
            <Link
              to="/"
              className="flex items-center gap-1.5 text-secondary-text hover:text-charcoal transition-colors font-medium"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Beranda</span>
            </Link>

            <Link
              to="/login"
              className="flex items-center gap-1.5 text-rose-700 hover:text-rose-800 transition-colors font-medium"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar</span>
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}
