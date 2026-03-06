import React, { useEffect, useState } from 'react';
import { fetchMatchScores } from '../../../core/api';
import { GameScoreDetail, MatchData, MatchScoreDetail } from '../../../types/Match';

interface MatchResultModalProps {
  match: MatchData;
  onClose: () => void;
}

const MatchResultModal: React.FC<MatchResultModalProps> = ({ match, onClose }) => {
  const [details, setDetails] = useState<MatchScoreDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<number>(1); // 1, 2, 3

  useEffect(() => {
    fetchMatchScores(match.matchId)
      .then((data) => {
        setDetails(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch detailed scores', err);
        setLoading(false);
      });
  }, [match.matchId]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-xl animate-pulse">Loading detailed scores...</div>
      </div>
    );
  }

  // Helper to find specific game data
  const currentGame = details?.games.find((g) => g.gameNumber === activeTab);

  // Helper to filter bowlers by team for the current game
  const getTeamBowlers = (teamId: number | undefined, game: GameScoreDetail | undefined) => {
    if (!game || !teamId) return [];
    return game.bowlerScores.filter((b) => b.teamId === teamId);
  };

  const oddTeamBowlers = getTeamBowlers(match.oddLaneTeamId, currentGame);
  const evenTeamBowlers = getTeamBowlers(match.evenLaneTeamId, currentGame);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-4xl m-4 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-50 border-b border-slate-100 p-6 flex justify-between items-start">
          <div>
            <h3 className="text-2xl font-black text-slate-800">Match Details</h3>
            <p className="text-slate-500 text-sm mt-1">
              {match.tourneyLocation} • {new Date(match.tourneyDate).toLocaleDateString()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Match Summary Banner */}
        <div className="bg-blue-600 p-6 text-white text-center shadow-inner">
          <div className="flex items-center justify-center gap-12">
            <div className="text-right">
              <div className="text-2xl font-black">{match.oddLaneTeam}</div>
              <div className="text-sm opacity-80 font-bold uppercase">Total Wins</div>
            </div>
            <div className="flex items-center gap-6">
              <span className="text-5xl font-black">{match.oddLaneWins}</span>
              <span className="text-xl font-bold opacity-60">VS</span>
              <span className="text-5xl font-black">{match.evenLaneWins}</span>
            </div>
            <div className="text-left">
              <div className="text-2xl font-black">{match.evenLaneTeam}</div>
              <div className="text-sm opacity-80 font-bold uppercase">Total Wins</div>
            </div>
          </div>
          {match.winningTeamName && (
            <div className="mt-4 inline-block bg-white/20 px-4 py-1 rounded-full text-sm font-bold backdrop-blur-sm">
              🏆 Winner: {match.winningTeamName}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200">
          {[1, 2, 3].map((gameNum) => (
            <button
              key={gameNum}
              onClick={() => setActiveTab(gameNum)}
              className={`flex-1 py-4 font-bold text-sm uppercase tracking-wide transition-colors border-b-2 ${
                activeTab === gameNum
                  ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                  : 'border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50'
              }`}
            >
              Game {gameNum}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="p-6 flex-1 overflow-y-auto bg-slate-50/50">
          {!currentGame ? (
            <div className="text-center py-10 text-slate-400 font-medium">
              No data available for Game {activeTab}
            </div>
          ) : (
            <div>
              {/* Game Result Summary */}
              <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-slate-200 mb-6">
                <div className="text-center">
                  <div className="text-xs text-slate-400 font-bold uppercase mb-1">
                    {match.oddLaneTeam}
                  </div>
                  <div className="text-2xl font-black text-slate-800">
                    {currentGame.oddTeamTotalScore}
                  </div>
                </div>
                <div className="text-center px-4">
                  <div className="text-xs font-bold bg-slate-100 text-slate-500 px-3 py-1 rounded-full">
                    GAME {activeTab} RESULT
                  </div>
                  <div className="text-xs text-green-600 font-bold mt-2">
                    Winner:{' '}
                    {currentGame.winningTeamId === match.oddLaneTeamId
                      ? match.oddLaneTeam
                      : currentGame.winningTeamId === match.evenLaneTeamId
                        ? match.evenLaneTeam
                        : 'Draw'}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-slate-400 font-bold uppercase mb-1">
                    {match.evenLaneTeam}
                  </div>
                  <div className="text-2xl font-black text-slate-800">
                    {currentGame.evenTeamTotalScore}
                  </div>
                </div>
              </div>

              {/* Detailed Scores Table */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Team 1 Scores */}
                <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
                  <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 font-bold text-slate-700 flex justify-between">
                    <span>{match.oddLaneTeam}</span>
                    <span className="text-xs bg-slate-200 text-slate-600 px-2 py-1 rounded">
                      Odd Lane
                    </span>
                  </div>
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-slate-400 font-medium text-xs uppercase">
                      <tr>
                        <th className="px-4 py-2 text-left font-bold">Bowler</th>
                        <th className="px-4 py-2 text-center font-bold">Raw</th>
                        <th className="px-4 py-2 text-center font-bold">HDP</th>
                        <th className="px-4 py-2 text-center font-bold">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {oddTeamBowlers.map((score, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3 font-bold text-slate-700">{score.bowlerName}</td>
                          <td className="px-4 py-3 text-center text-slate-500">{score.rawScore}</td>
                          <td className="px-4 py-3 text-center text-slate-400 italic">
                            {score.handicapScore || 0}
                          </td>
                          <td className="px-4 py-3 text-center font-black text-blue-600">
                            {score.rawScore + (score.handicapScore || 0)}
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-slate-50 border-t-2 border-slate-100">
                        <td className="px-4 py-3 font-bold text-slate-800 text-right uppercase">
                          Team Total
                        </td>
                        <td
                          colSpan={3}
                          className="px-4 py-3 text-center font-black text-xl text-slate-900"
                        >
                          {currentGame.oddTeamTotalScore}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Team 2 Scores */}
                <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
                  <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 font-bold text-slate-700 flex justify-between">
                    <span>{match.evenLaneTeam}</span>
                    <span className="text-xs bg-slate-200 text-slate-600 px-2 py-1 rounded">
                      Even Lane
                    </span>
                  </div>
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-slate-400 font-medium text-xs uppercase">
                      <tr>
                        <th className="px-4 py-2 text-left font-bold">Bowler</th>
                        <th className="px-4 py-2 text-center font-bold">Raw</th>
                        <th className="px-4 py-2 text-center font-bold">HDP</th>
                        <th className="px-4 py-2 text-center font-bold">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {evenTeamBowlers.map((score, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3 font-bold text-slate-700">{score.bowlerName}</td>
                          <td className="px-4 py-3 text-center text-slate-500">{score.rawScore}</td>
                          <td className="px-4 py-3 text-center text-slate-400 italic">
                            {score.handicapScore || 0}
                          </td>
                          <td className="px-4 py-3 text-center font-black text-blue-600">
                            {score.rawScore + (score.handicapScore || 0)}
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-slate-50 border-t-2 border-slate-100">
                        <td className="px-4 py-3 font-bold text-slate-800 text-right uppercase">
                          Team Total
                        </td>
                        <td
                          colSpan={3}
                          className="px-4 py-3 text-center font-black text-xl text-slate-900"
                        >
                          {currentGame.evenTeamTotalScore}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-white p-4 border-t border-slate-200 text-right">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-slate-100 text-slate-600 font-bold rounded-lg hover:bg-slate-200 transition-colors"
          >
            Close View
          </button>
        </div>
      </div>
    </div>
  );
};

export default MatchResultModal;
