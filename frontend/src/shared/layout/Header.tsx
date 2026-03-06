import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  title?: string;
  description?: string;
}

function Header(props: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated, logout } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { path: '/league/live', label: 'Live' },
    { path: '/league/matches', label: 'Fixtures' },
    { path: '/league/tournaments', label: 'Tournaments' },
    { path: '/league/standings', label: 'Standings' },
    { path: '/bowlers', label: 'Stats' },
    { path: '/teams', label: 'Teams' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur-md shadow-md py-3' : 'bg-white py-5 shadow-sm'
      }`}
    >
      <div className="container-custom">
        <div className="flex items-center justify-between">
          {/* Logo Section */}
          <Link to="/league/live" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg text-white font-black text-xl shadow-lg group-hover:scale-105 transition-transform">
              <span className="relative z-10">L</span>
              <div className="absolute inset-0 bg-blue-600 rounded-lg blur opacity-40 group-hover:opacity-60 transition-opacity"></div>
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-bold tracking-tight text-slate-900 leading-none">
                LEAGUE<span className="text-blue-600">PALS</span>
              </h1>
              <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                Bowling Management
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive =
                location.pathname === link.path || location.pathname.startsWith(`${link.path}/`);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-4 py-2 text-sm font-bold uppercase tracking-wider rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Auth Section */}
          <div className="hidden md:flex items-center gap-4 pl-4 border-l border-slate-200">
            {isAuthenticated ? (
              <button
                onClick={logout}
                className="text-sm font-bold text-slate-600 hover:text-red-600 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors uppercase tracking-wider"
              >
                Logout
              </button>
            ) : (
              <Link
                to="/auth/login"
                className="btn btn-accent shadow-red-200 shadow-lg hover:shadow-red-300 hover:-translate-y-0.5 transform transition-all"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M4 6h16M4 12h16m-7 6h7"
              />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
