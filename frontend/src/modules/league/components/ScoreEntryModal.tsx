import React, { useEffect, useState } from 'react';
import { submitMatchScores, fetchAllBowlers, fetchMatchScores } from '../../../core/api';
import { Bowler } from '../../../types/Bowler';
import { useToast } from '../../../context/ToastContext';
import { MatchData } from '../../../types/Match';

interface ScoreEntryModalProps {
  match: MatchData;
  onClose: () => void;
  onSuccess: () => void;
}

const ScoreEntryModal: React.FC<ScoreEntryModalProps> = ({ match, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [bowlers, setBowlers] = useState<Bowler[]>([]);
  const [gameNumber, setGameNumber] = useState(1);
  const toast = useToast();

  // Scores state: Map gameNumber -> bowlerId -> { raw, handicap }
  const [scores, setScores] = useState<
    Record<number, Record<number, { raw: string; handicap: string }>>
  >({
    1: {},
    2: {},
    3: {},
  });

  useEffect(() => {
    loadData();
  }, [match.matchId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const allBowlers = await fetchAllBowlers();
      const matchBowlers = allBowlers.filter(
        (b) => b.teamId === match.oddLaneTeamId || b.teamId === match.evenLaneTeamId,
      );
      setBowlers(matchBowlers);

      const details = await fetchMatchScores(match.matchId);
      const newScores: Record<number, Record<number, { raw: string; handicap: string }>> = {
        1: {},
        2: {},
        3: {},
      };

      // Pre-fill with existing scores for all games
      [1, 2, 3].forEach((gn) => {
        const gameData = details.games.find((g) => g.gameNumber === gn);
        matchBowlers.forEach((b) => {
          const bs = gameData?.bowlerScores.find((s) => s.bowlerId === b.BowlerId);
          newScores[gn][b.BowlerId] = {
            raw: bs?.rawScore.toString() || '',
            handicap: bs?.handicapScore?.toString() || '',
          };
        });
      });

      setScores(newScores);
    } catch (error) {
      console.error(error);
      toast.showToast('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleScoreChange = (bowlerId: number, field: 'raw' | 'handicap', value: string) => {
    setScores((prev) => ({
      ...prev,
      [gameNumber]: {
        ...prev[gameNumber],
        [bowlerId]: {
          ...prev[gameNumber][bowlerId],
          [field]: value,
        },
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const currentGameScores = scores[gameNumber];
      const scoresPayload = Object.entries(currentGameScores)
        .filter(([_, val]) => val.raw !== '')
        .map(([bowlerId, val]) => ({
          bowlerId: Number(bowlerId),
          rawScore: Number(val.raw),
          handicapScore: val.handicap ? Number(val.handicap) : undefined,
        }));

      if (scoresPayload.length === 0) {
        toast.showToast('Please enter at least one score', 'warning');
        setSubmitting(false);
        return;
      }

      await submitMatchScores({
        matchId: match.matchId,
        gameNumber: gameNumber,
        scores: scoresPayload,
      });

      toast.showToast(`Game ${gameNumber} scores saved!`, 'success');
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      toast.showToast('Failed to save scores', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const oddTeamBowlers = bowlers.filter((b) => b.teamId === match.oddLaneTeamId);
  const evenTeamBowlers = bowlers.filter((b) => b.teamId === match.evenLaneTeamId);

  const calculateTotal = (teamBowlers: Bowler[]) => {
    const currentGameScores = scores[gameNumber];
    return teamBowlers.reduce((sum, b) => {
      const s = currentGameScores[b.BowlerId];
      if (!s) return sum;
      const raw = s.raw ? Number(s.raw) : 0;
      const handicap = s.handicap ? Number(s.handicap) : 0;
      return sum + raw + handicap;
    }, 0);
  };

  const oddTotal = calculateTotal(oddTeamBowlers);
  const evenTotal = calculateTotal(evenTeamBowlers);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto py-10">
      <div className="bg-white rounded-xl max-w-4xl w-full mx-4 shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50 rounded-t-xl">
          <div>
            <h3 className="text-xl font-black text-slate-900">Enter Match Scores</h3>
            <p className="text-sm text-slate-500">
              {match.oddLaneTeam} vs {match.evenLaneTeam}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl">
            ×
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <div className="flex justify-center mb-8">
            <div className="inline-flex bg-slate-100 rounded-lg p-1">
              {[1, 2, 3].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setGameNumber(num)}
                  className={`px-6 py-2 rounded-md text-sm font-bold transition-all ${
                    gameNumber === num
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Game {num}
                </button>
              ))}
            </div>
          </div>

          <form id="score-form" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Odd Team */}
              <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                <div className="flex justify-between items-end mb-4 pb-2 border-b border-slate-200">
                  <h4 className="font-bold text-slate-800">{match.oddLaneTeam}</h4>
                  <div className="text-right">
                    <span className="text-xs text-slate-500 uppercase font-bold block">
                      Total (Handicap)
                    </span>
                    <span className="text-2xl font-black text-blue-600">{oddTotal}</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-12 gap-2 text-xs font-bold text-slate-400 uppercase mb-1">
                    <div className="col-span-6">Bowler</div>
                    <div className="col-span-3 text-center">Raw</div>
                    <div className="col-span-3 text-center">HCP Score</div>
                  </div>
                  {oddTeamBowlers.map((bowler) => (
                    <div key={bowler.BowlerId} className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-6 font-medium text-slate-700 text-sm truncate">
                        {bowler.bowlerFirstName} {bowler.bowlerLastName}
                      </div>
                      <div className="col-span-3">
                        <input
                          type="number"
                          className="input-field text-center p-1 text-sm"
                          placeholder="0"
                          value={scores[gameNumber][bowler.BowlerId]?.raw || ''}
                          onChange={(e) =>
                            handleScoreChange(bowler.BowlerId, 'raw', e.target.value)
                          }
                        />
                      </div>
                      <div className="col-span-3">
                        <input
                          type="number"
                          className="input-field text-center p-1 text-sm bg-blue-50 border-blue-200 text-blue-700 font-bold"
                          placeholder="HCP"
                          value={scores[gameNumber][bowler.BowlerId]?.handicap || ''}
                          onChange={(e) =>
                            handleScoreChange(bowler.BowlerId, 'handicap', e.target.value)
                          }
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Even Team */}
              <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                <div className="flex justify-between items-end mb-4 pb-2 border-b border-slate-200">
                  <h4 className="font-bold text-slate-800">{match.evenLaneTeam}</h4>
                  <div className="text-right">
                    <span className="text-xs text-slate-500 uppercase font-bold block">
                      Total (Handicap)
                    </span>
                    <span className="text-2xl font-black text-blue-600">{evenTotal}</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-12 gap-2 text-xs font-bold text-slate-400 uppercase mb-1">
                    <div className="col-span-6">Bowler</div>
                    <div className="col-span-3 text-center">Raw</div>
                    <div className="col-span-3 text-center">HCP Score</div>
                  </div>
                  {evenTeamBowlers.map((bowler) => (
                    <div key={bowler.BowlerId} className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-6 font-medium text-slate-700 text-sm truncate">
                        {bowler.bowlerFirstName} {bowler.bowlerLastName}
                      </div>
                      <div className="col-span-3">
                        <input
                          type="number"
                          className="input-field text-center p-1 text-sm"
                          placeholder="0"
                          value={scores[gameNumber][bowler.BowlerId]?.raw || ''}
                          onChange={(e) =>
                            handleScoreChange(bowler.BowlerId, 'raw', e.target.value)
                          }
                        />
                      </div>
                      <div className="col-span-3">
                        <input
                          type="number"
                          className="input-field text-center p-1 text-sm bg-blue-50 border-blue-200 text-blue-700 font-bold"
                          placeholder="HCP"
                          value={scores[gameNumber][bowler.BowlerId]?.handicap || ''}
                          onChange={(e) =>
                            handleScoreChange(bowler.BowlerId, 'handicap', e.target.value)
                          }
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-slate-200 bg-slate-50 rounded-b-xl flex justify-end gap-3">
          <button type="button" onClick={onClose} className="btn btn-white" disabled={submitting}>
            Cancel
          </button>
          <button
            type="submit"
            form="score-form"
            className="btn btn-primary min-w-[120px]"
            disabled={submitting}
          >
            {submitting ? 'Saving...' : 'Save Scores'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScoreEntryModal;
