import React from 'react';
import { Bowler, BowlerStatsData } from '../../../types/Bowler';

interface BowlerProfileModalProps {
  bowler: Bowler | null;
  stats?: BowlerStatsData;
  isOpen: boolean;
  onClose: () => void;
}

const BowlerProfileModal: React.FC<BowlerProfileModalProps> = ({
  bowler,
  stats,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !bowler) return null;

  const fullName = `${bowler.bowlerFirstName} ${bowler.bowlerLastName}`;
  const totalGames = stats?.totalGames || 0;
  const gamesWon = stats?.gamesWon || 0;
  const winRate = totalGames > 0 ? ((gamesWon / totalGames) * 100).toFixed(1) : '0.0';

  return (
    <div
      className="fixed inset-0 z-[999] bg-black/50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between p-6 border-b border-slate-200 bg-slate-50">
          <div>
            <h3 className="text-2xl font-black text-slate-900">{fullName}</h3>
            <p className="text-sm text-slate-500 mt-1">Player Profile & Performance</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 text-2xl leading-none"
            aria-label="Close profile"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Personal Info
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-lg px-4 py-3">
                <p className="text-xs text-slate-400 uppercase font-bold">Team</p>
                <p className="font-semibold text-slate-800">
                  {bowler.team?.teamName || 'Unassigned'}
                </p>
              </div>
              <div className="bg-slate-50 rounded-lg px-4 py-3">
                <p className="text-xs text-slate-400 uppercase font-bold">Phone</p>
                <p className="font-semibold text-slate-800">{bowler.bowlerPhoneNumber || '-'}</p>
              </div>
              <div className="bg-slate-50 rounded-lg px-4 py-3 md:col-span-2">
                <p className="text-xs text-slate-400 uppercase font-bold">Address</p>
                <p className="font-semibold text-slate-800">
                  {bowler.bowlerAddress}, {bowler.bowlerCity}, {bowler.bowlerState}{' '}
                  {bowler.bowlerZip}
                </p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Score & Ratio
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                <p className="text-[11px] font-bold uppercase text-blue-600">Total Pins</p>
                <p className="text-2xl font-black text-slate-900">{stats?.totalPins || 0}</p>
              </div>
              <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-100">
                <p className="text-[11px] font-bold uppercase text-emerald-700">Average</p>
                <p className="text-2xl font-black text-slate-900">
                  {stats?.averageScore?.toFixed(1) || '0.0'}
                </p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                <p className="text-[11px] font-bold uppercase text-purple-700">High Score</p>
                <p className="text-2xl font-black text-slate-900">{stats?.highScore || 0}</p>
              </div>
              <div className="bg-amber-50 rounded-lg p-4 border border-amber-100">
                <p className="text-[11px] font-bold uppercase text-amber-700">Win Rate</p>
                <p className="text-2xl font-black text-slate-900">{winRate}%</p>
              </div>
            </div>
            <p className="mt-3 text-sm text-slate-500">
              Wins/Games: <span className="font-semibold text-slate-700">{gamesWon}</span> /{' '}
              <span className="font-semibold text-slate-700">{totalGames}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BowlerProfileModal;
