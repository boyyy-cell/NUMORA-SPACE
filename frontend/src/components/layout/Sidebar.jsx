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
  Sliders,
  Award,
  UserCheck,
  Brain,
  FileCheck2
} from 'lucide-react';

export default function Sidebar({ role = 'student', activeTab = 'overview', setActiveTab, isOpen, setIsOpen }) {
  const location = useLocation();
  const { status, checkNow, baseUrl, error } = useBackendStatus();

  const studentLinks = [
    { id: 'overview', label: 'Ringkasan Belajar', icon: LayoutDashboard },
    { id: 'modules', label: 'Modul Aljabar', icon: BookOpen },
    { id: 'lab', label: 'Algebra Lab & 3D', icon: Sliders, badge: 'LAB' },
    { id: 'nora', label: 'NORA Socratic AI', icon: Bot, badge: 'SOCRATIC' },
    { id: 'challenge', label: 'Tantangan PISA', icon: Award, badge: 'LITERASI' },
    { id: 'progress', label: 'Kemajuan Belajar', icon: BarChart3 },
  ];

  const researcherLinks = [
    { id: 'overview', label: 'Ringkasan Riset', icon: LayoutDashboard },
    { id: 'subjects', label: 'Subjek S-001 & S-002', icon: UserCheck, badge: '2 SUBJEK' },
    { id: 'cognitive', label: 'Beban Kognitif (Leppink)', icon: Brain, badge: 'LEPPINK' },
    { id: 'assessment', label: 'Pusat Asesmen', icon: FileCheck2 },
  ];

  const links = role === 'researcher' ? researcherLinks : studentLinks;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-plum/80 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-aubergine border-r border-lavender/10 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-5 space-y-6">
          {/* Logo */}
          <div className="flex items-center justify-between">
            <BrandLogo size="default" />
          </div>

          {/* Current Role Indicator */}
          <div className="p-2.5 rounded-xl bg-plum/70 border border-lavender/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {role === 'researcher' ? (
                <Microscope className="w-4 h-4 text-orchid" />
              ) : (
                <GraduationCap className="w-4 h-4 text-apricot" />
              )}
              <div className="leading-tight">
                <span className="text-[11px] font-bold text-ivory uppercase tracking-wider block">
                  {role === 'researcher' ? 'Portal Peneliti' : 'Portal Siswa'}
                </span>
                <span className="text-[9px] text-lavender font-mono">
                  Midnight Orchid v1.6
                </span>
              </div>
            </div>

            <Link
              to={role === 'researcher' ? '/student-dashboard' : '/researcher-dashboard'}
              className="text-[10px] text-apricot hover:underline"
              title="Ganti ke peran lain"
            >
              Tukar Peran
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-lavender/70 px-2 mb-2">
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
                      ? 'bg-gradient-to-r from-orchid/20 to-apricot/15 text-ivory border border-orchid/35 shadow-sm font-semibold'
                      : 'text-lavender hover:text-ivory hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-orchid' : ''}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[8px] font-mono font-bold px-1.5 py-0.5 rounded bg-orchid/15 text-orchid border border-orchid/25">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer: Backend status & links */}
        <div className="p-4 border-t border-lavender/10 space-y-3 bg-plum/40">
          <BackendStatusBadge status={status} checkNow={checkNow} baseUrl={baseUrl} error={error} />

          <div className="flex items-center justify-between pt-1">
            <Link
              to="/"
              className="flex items-center gap-1.5 text-xs text-lavender hover:text-ivory transition-colors"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Beranda</span>
            </Link>

            <Link
              to="/login"
              className="flex items-center gap-1.5 text-xs text-rose-300 hover:text-rose-200 transition-colors"
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
