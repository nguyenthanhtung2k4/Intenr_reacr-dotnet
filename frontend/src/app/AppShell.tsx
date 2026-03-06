import React from 'react';
import Header from '../shared/layout/Header';
import Footer from '../shared/layout/Footer';
import AppRouter from './router';

export default function AppShell() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <Header title="LeaguePals" description="Professional Bowling Management" />
      <AppRouter />
      <Footer />
    </div>
  );
}
