import React, { useEffect, useState } from 'react';
import { fetchLeagueStandings } from '../../../core/api';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { StandingData } from '../../../types/Standing';

const StandingsTable = () => {
  const [standings, setStandings] = useState<StandingData[]>([]);
  const [loading, setLoading] = useState(true);
  const { role } = useAuth();
  const toast = useToast();

  const loadStandings = async () => {
    setLoading(true);
    try {
      const data = await fetchLeagueStandings();
      setStandings(data);
    } catch (err) {
      console.error(err);
      toast.showToast('Không thể tải bảng xếp hạng', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStandings();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 bg-slate-50 flex justify-center">
        <div className="w-10 h-10 border-4 border-blue-600 rounded-full animate-spin border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="mt-28 min-h-screen pt-24 pb-12 bg-slate-50">
      <div className="container-custom">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tight mb-2">
            League Standings
          </h1>
          <p className="text-slate-500">Current team rankings for the 2026 Season</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center w-20">
                    Rank
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-left">
                    Team
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">
                    Played
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">
                    Won
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">
                    Lost
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">
                    Total Pins
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">
                    Avg
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">
                    Points
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {standings.map((standing, index) => (
                  <tr key={standing.teamId} className="hover:bg-blue-50/50 transition-colors group">
                    <td className="px-6 py-4 text-center">
                      <div
                        className={`
                            w-8 h-8 rounded-full flex items-center justify-center mx-auto text-sm font-bold
                            ${
                              index === 0
                                ? 'bg-yellow-100 text-yellow-700'
                                : index === 1
                                  ? 'bg-slate-200 text-slate-700'
                                  : index === 2
                                    ? 'bg-orange-100 text-orange-700'
                                    : 'text-slate-500'
                            }
                        `}
                      >
                        {index + 1}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-xl">
                          🎳
                        </div>
                        <span className="font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                          {standing.teamName}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center text-slate-600 font-medium">
                      {standing.played}
                    </td>
                    <td className="px-6 py-4 text-center text-green-600 font-medium">
                      {standing.won}
                    </td>
                    <td className="px-6 py-4 text-center text-red-600 font-medium">
                      {standing.lost}
                    </td>
                    <td className="px-6 py-4 text-center text-slate-600 font-medium">
                      {standing.totalPins?.toLocaleString() || '-'}
                    </td>
                    <td className="px-6 py-4 text-center text-slate-600 font-medium">
                      {standing.average || '-'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="font-black text-slate-900 text-lg">{standing.points}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {standings.length === 0 && (
            <div className="p-12 text-center text-slate-500">No teams registered yet.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StandingsTable;
