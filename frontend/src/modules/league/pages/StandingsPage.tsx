import React, { useCallback, useEffect, useState } from 'react';
import { fetchLeagueStandings } from '../../../core/api';
import { useToast } from '../../../context/ToastContext';
import { StandingData } from '../../../types/Standing';

const StandingsTable = () => {
  const [standings, setStandings] = useState<StandingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  }>({ key: 'points', direction: 'desc' });
  const toast = useToast();

  const loadStandings = useCallback(async () => {
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
  }, [toast]);

  useEffect(() => {
    loadStandings();
  }, [loadStandings]);

  const sortedStandings = [...standings].sort((a, b) => {
    let valA: string | number = '';
    let valB: string | number = '';

    switch (sortConfig.key) {
      case 'team':
        valA = a.teamName?.toLowerCase() || '';
        valB = b.teamName?.toLowerCase() || '';
        break;
      case 'played':
        valA = a.played || 0;
        valB = b.played || 0;
        break;
      case 'won':
        valA = a.won || 0;
        valB = b.won || 0;
        break;
      case 'lost':
        valA = a.lost || 0;
        valB = b.lost || 0;
        break;
      case 'totalPins':
        valA = a.totalPins || 0;
        valB = b.totalPins || 0;
        break;
      case 'average':
        valA = Number(a.average || 0);
        valB = Number(b.average || 0);
        break;
      case 'points':
      default:
        valA = a.points || 0;
        valB = b.points || 0;
        break;
    }

    if (valA < valB) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (valA > valB) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const renderSortIndicator = (key: string) => {
    if (sortConfig.key !== key) {
      return (
        <svg
          className="w-4 h-4 text-slate-300 ml-1 inline-block"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      );
    }

    return sortConfig.direction === 'asc' ? (
      <span className="ml-1 inline-block">^</span>
    ) : (
      <span className="ml-1 inline-block">v</span>
    );
  };

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
                  <th
                    onClick={() => handleSort('team')}
                    className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-left cursor-pointer hover:bg-slate-100 transition-colors"
                  >
                    Team {renderSortIndicator('team')}
                  </th>
                  <th
                    onClick={() => handleSort('played')}
                    className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center cursor-pointer hover:bg-slate-100 transition-colors"
                  >
                    Played {renderSortIndicator('played')}
                  </th>
                  <th
                    onClick={() => handleSort('won')}
                    className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center cursor-pointer hover:bg-slate-100 transition-colors"
                  >
                    Won {renderSortIndicator('won')}
                  </th>
                  <th
                    onClick={() => handleSort('lost')}
                    className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center cursor-pointer hover:bg-slate-100 transition-colors"
                  >
                    Lost {renderSortIndicator('lost')}
                  </th>
                  <th
                    onClick={() => handleSort('totalPins')}
                    className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center cursor-pointer hover:bg-slate-100 transition-colors"
                  >
                    Total Pins {renderSortIndicator('totalPins')}
                  </th>
                  <th
                    onClick={() => handleSort('average')}
                    className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center cursor-pointer hover:bg-slate-100 transition-colors"
                  >
                    Avg {renderSortIndicator('average')}
                  </th>
                  <th
                    onClick={() => handleSort('points')}
                    className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center cursor-pointer hover:bg-slate-100 transition-colors"
                  >
                    Points {renderSortIndicator('points')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedStandings.map((standing, index) => (
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
