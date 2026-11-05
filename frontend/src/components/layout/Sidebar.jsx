import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import BrandLogo from '../common/BrandLogo';
import BackendStatusBadge from '../common/BackendStatusBadge';
import { useBackendStatus } from '../../hooks/useBackendStatus';
import {
  LayoutDashboard,
  BookOpen,
  Bot,
  BarChart3,
  Microscope,
  GraduationCap,
  Home,
  LogOut,
  Sparkles,
  ChevronRight,
  UserCheck
} from 'lucide-react';

export default function Sidebar({ role = 'student', activeTab = 'overview', setActiveTab, isOpen, setIsOpen }) {
  const location = useLocation();
  const { status, checkNow, baseUrl, error } = useBackendStatus();

  const studentLinks = [
    { id: 'overview', label: 'Learning Overview', icon: LayoutDashboard },
    { id: 'modules', label: 'Modul Aljabar', icon: BookOpen },
    { id: 'nora', label: 'NORA AI Tutor', icon: Bot, badge: 'DEMO' },
    { id: 'progress', label: 'Kemajuan Belajar', icon: BarChart3 },
  ];

  const researcherLinks = [
    { id: 'overview', label: 'Ringkasan Riset', icon: LayoutDashboard },
    { id: 'subjects', label: 'Subjek & Sesi Demo', icon: UserCheck },
    { id: 'cognitive', label: 'Beban Kognitif', icon: Microscope, badge: 'DEMO' },
    { id: 'analytics', label: 'Analisis Pembelajaran', icon: BarChart3 },
  ];

  const links = role === 'researcher' ? researcherLinks : studentLinks;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-numora-bg/80 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-numora-surface border-r border-white/10 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-5 space-y-6">
          {/* Logo */}
          <div className="flex items-center justify-between">
            <BrandLogo size="default" />
          </div>

          {/* Current Role Indicator */}
          <div className="p-2.5 rounded-xl bg-numora-bg/80 border border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {role === 'researcher' ? (
                <Microscope className="w-4 h-4 text-numora-violet" />
              ) : (
                <GraduationCap className="w-4 h-4 text-numora-cyan" />
              )}
              <div className="leading-tight">
                <span className="text-[11px] font-bold text-numora-white uppercase tracking-wider block">
                  {role === 'researcher' ? 'Portal Peneliti' : 'Portal Siswa'}
                </span>
                <span className="text-[9px] text-numora-muted font-mono">
                  Phase 01 Demo
                </span>
              </div>
            </div>

            <Link
              to={role === 'researcher' ? '/student-dashboard' : '/researcher-dashboard'}
              className="text-[10px] text-numora-cyan hover:underline"
              title="Ganti ke peran lain"
            >
              Tukar Peran
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-numora-muted px-2 mb-2">
              Menu Navigasi
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
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-numora-cyan/15 to-numora-violet/15 text-numora-white border border-numora-cyan/30 shadow-sm'
                      : 'text-numora-muted hover:text-numora-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-numora-cyan' : ''}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-numora-cyan/10 text-numora-cyan border border-numora-cyan/20">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer: Backend status & links */}
        <div className="p-4 border-t border-white/10 space-y-3 bg-numora-bg/30">
          <BackendStatusBadge status={status} checkNow={checkNow} baseUrl={baseUrl} error={error} />

          <div className="flex items-center justify-between pt-1">
            <Link
              to="/"
              className="flex items-center gap-1.5 text-xs text-numora-muted hover:text-numora-white transition-colors"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Beranda</span>
            </Link>

            <Link
              to="/login"
              className="flex items-center gap-1.5 text-xs text-numora-error/80 hover:text-numora-error transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar Demo</span>
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}

