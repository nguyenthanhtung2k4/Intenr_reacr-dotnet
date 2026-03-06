import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-slate-200 mt-20 pt-16 pb-8">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 flex items-center justify-center bg-blue-600 rounded text-white font-bold text-lg">
                L
              </div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                LEAGUE<span className="text-blue-600">PALS</span>
              </h3>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed">
              Professional bowling league management system for modern tournaments and seamless
              player experiences.
            </p>
          </div>

          {/* Spacer */}
          <div className="hidden md:block"></div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-6">
              Platform
            </h4>
            <div className="flex flex-col gap-3">
              <Link
                to="/league/matches"
                className="text-sm text-slate-500 hover:text-blue-600 transition-colors"
              >
                Fixtures
              </Link>
              <Link
                to="/league/tournaments"
                className="text-sm text-slate-500 hover:text-blue-600 transition-colors"
              >
                Tournaments
              </Link>
              <Link
                to="/league/standings"
                className="text-sm text-slate-500 hover:text-blue-600 transition-colors"
              >
                Standings
              </Link>
              <Link
                to="/bowlers"
                className="text-sm text-slate-500 hover:text-blue-600 transition-colors"
              >
                Stats
              </Link>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-6">
              Support
            </h4>
            <div className="flex flex-col gap-3">
              <a
                href="mailto:tungnt@gmail.com"
                className="text-sm text-slate-500 hover:text-blue-600 transition-colors"
              >
                tungnt@gmail.com
              </a>
              <span className="text-sm text-slate-500">(555) 123-4567</span>
              <div className="flex gap-4 mt-2">
                {/* Social Placeholders */}
                <span className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-colors cursor-pointer">
                  fb
                </span>
                <span className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-colors cursor-pointer">
                  tw
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-400">
            © {currentYear} LeaguePals Inc. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link to="#" className="text-sm text-slate-400 hover:text-slate-600">
              Privacy Policy
            </Link>
            <Link to="#" className="text-sm text-slate-400 hover:text-slate-600">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
