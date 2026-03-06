import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  fetchAllBowlers,
  fetchGlobalMatches,
  fetchTeams,
  fetchBowlerStats,
  Team,
} from '../../../core/api';
import { Bowler, BowlerStatsData } from '../../../types/Bowler';
import { MatchData } from '../../../types/Match';

const TourMatch = () => {
  const [topBowlers, setTopBowlers] = useState<Bowler[]>([]);
  const [recentMatches, setRecentMatches] = useState<MatchData[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Map<number, BowlerStatsData>>(new Map());

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [allBowlers, allMatches, allTeams, allStats] = await Promise.all([
          fetchAllBowlers(),
          fetchGlobalMatches(),
          fetchTeams(),
          fetchBowlerStats(),
        ]);

        const statsMap = new Map<number, BowlerStatsData>();
        allStats.forEach((s) => statsMap.set(s.bowlerId, s));
        setStats(statsMap);

        // Sort bowlers by Average Score descending
        const sortedBowlers = [...allBowlers].sort((a, b) => {
          const statA = statsMap.get(a.BowlerId)?.averageScore || 0;
          const statB = statsMap.get(b.BowlerId)?.averageScore || 0;
          return statB - statA;
        });
        const date_match = [...allMatches].sort(
          (a, b) => new Date(b.tourneyDate).getTime() - new Date(a.tourneyDate).getTime(),
        );
        setTopBowlers(sortedBowlers.slice(0, 8));
        setRecentMatches(date_match.slice(0, 8));
        setTeams(allTeams.slice(0, 10));
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  console.log('RECENT: ', recentMatches);
  console.log('TEAMS: ', teams);
  console.log('STATS: ', stats);
  console.log('TOP: ', topBowlers);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-500 mt-4 font-medium">Loading LeaguePals...</p>
        </div>
      </div>
    );
  }

  // Calculate top stats for display
  const topBowler = topBowlers[0];
  const topStats = topBowler ? stats.get(topBowler.BowlerId) : null;
  const winRate = topStats?.totalGames
    ? Math.round((topStats.gamesWon / topStats.totalGames) * 100)
    : 0;
  const avgScore = topStats?.averageScore ? Math.round(topStats.averageScore) : 0;

  return (
    <div className="pb-20 pt-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white">
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-30"></div>
        <div className="container-custom relative z-10 py-20 lg:py-32 bg-blue-50">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center ">
            {/* Left Content */}
            <div className="animate-fade-in-up">
              <span className="inline-block px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold uppercase tracking-wider mb-6 border border-blue-100">
                Season 2026 Live
              </span>

              <h1 className="text-5xl lg:text-7xl font-sans font-black text-slate-900 tracking-tight leading-[1.1] mb-6">
                Manage Your <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-400">
                  Bowling League
                </span>
              </h1>

              <p className="text-lg text-slate-600 mb-8 max-w-lg leading-relaxed">
                The most advanced platform for tournament scheduling, live scoring, and player
                statistics. Join the revolution today.
              </p>

              <div className="flex items-center gap-4">
                <Link
                  to="/league/matches"
                  className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold shadow-lg shadow-red-200 transition-all hover:-translate-y-1"
                >
                  View Matches
                </Link>
                <Link
                  to="/league/standings"
                  className="px-8 py-4 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg font-bold transition-all hover:border-slate-300 hover:shadow-sm"
                >
                  Leaderboards
                </Link>
              </div>
            </div>

            {/* Right Stats Card Preview */}
            <div className="relative hidden lg:block">
              <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-blue-50 to-white rounded-2xl transform rotate-3 scale-95 opacity-50"></div>
              <div className="relative bg-white p-8 rounded-2xl shadow-xl border border-slate-100 transform transition-transform hover:-translate-y-2">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">
                      Current Top Scorer
                    </h3>
                    <div className="text-2xl font-black text-slate-900">
                      {topBowler?.bowlerFirstName || 'John'} {topBowler?.bowlerLastName || 'Doe'}
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 font-bold">
                    #1
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-500 mb-2">
                      <span>WIN RATE</span>
                      <span className="text-slate-900">{winRate}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full"
                        style={{ width: `${winRate}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-500 mb-2">
                      <span>AVERAGE SCORE</span>
                      <span className="text-slate-900">{avgScore}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-400 rounded-full"
                        style={{ width: `${Math.min((avgScore / 300) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats Strip */}
      <section className="border-y border-slate-100 bg-white py-12">
        <div className="container-custom">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl font-black text-slate-900">{topBowlers.length}+</div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                Active Players
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black text-slate-900">{recentMatches.length}+</div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                Matches Played
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black text-slate-900">{teams.length}+</div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                Teams
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black text-slate-900">2026</div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                Season
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Top Athletes Grid */}
      <section className="py-20 bg-slate-50">
        <div className="container-custom">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
                Top Athletes
              </h2>
              <p className="text-slate-500">The best performers of the current season.</p>
            </div>
            <Link
              to="/bowlers"
              className="hidden md:inline-flex items-center font-bold text-blue-600 hover:text-blue-700 transition-colors"
            >
              View All Rankings →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {topBowlers.map((bowler, index) => {
              const stat = stats.get(bowler.BowlerId);
              return (
                <div
                  key={bowler.BowlerId}
                  className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold
                    ${index < 3 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors'}
                  `}
                    >
                      {bowler.bowlerFirstName.charAt(0)}
                      {bowler.bowlerLastName.charAt(0)}
                    </div>
                    <span className="text-4xl font-black text-slate-100 group-hover:text-slate-200 transition-colors">
                      #{index + 1}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">
                    {bowler.bowlerFirstName} {bowler.bowlerLastName}
                  </h3>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">
                      {bowler.team?.teamName || 'Free Agent'}
                    </p>
                    {stat?.averageScore && (
                      <span className="text-sm font-black text-blue-600 bg-blue-50 px-2 py-1 rounded">
                        {Math.round(stat.averageScore)} AVG
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 text-center md:hidden">
            <Link to="/bowlers" className="btn btn-white w-full">
              View All Rankings
            </Link>
          </div>
        </div>
      </section>

      {/* Recent Matches */}
      <section className="py-20 bg-white">
        <div className="container-custom">
          <div className="mb-12">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
              Recent Fixtures
            </h2>
            <p className="text-slate-500">Latest match results and upcoming games.</p>
          </div>

          <div className="grid gap-4">
            {recentMatches.map((match) => (
              <div
                key={match.matchId}
                className="bg-white border border-slate-200 rounded-xl p-6 hover:border-blue-300 transition-colors shadow-sm"
              >
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  {/* Date & Location */}
                  <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="bg-slate-50 px-4 py-2 rounded-lg text-center min-w-[80px]">
                      <div className="text-red-500 font-black text-sm uppercase">
                        {new Date(match.tourneyDate).toLocaleDateString('en-US', {
                          month: 'short',
                        })}
                      </div>
                      <div className="text-slate-900 font-black text-xl leading-none">
                        {new Date(match.tourneyDate).getDate()}
                      </div>
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Tournament
                      </div>
                      <div className="text-slate-900 font-bold">{match.tourneyLocation}</div>
                    </div>
                  </div>

                  {/* Matchup */}
                  <div className="flex-1 flex items-center justify-center gap-4 md:gap-8 w-full border-t md:border-t-0 md:border-l md:border-r border-slate-100 py-4 md:py-0 px-4">
                    <div className="flex-1 text-right font-bold text-slate-900 text-lg">
                      {match.oddLaneTeam}
                    </div>
                    <div className="bg-slate-100 text-slate-500 text-xs font-bold px-2 py-1 rounded">
                      VS
                    </div>
                    <div className="flex-1 text-left font-bold text-slate-900 text-lg">
                      {match.evenLaneTeam}
                    </div>
                  </div>

                  {/* Lanes */}
                  <div className="text-center w-full md:w-auto">
                    <span className="inline-block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                      Lanes
                    </span>
                    <div className="text-xl font-black text-blue-600">{match.lanes}</div>
                  </div>
                </div>
              </div>
            ))}

            {recentMatches.length === 0 && (
              <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                <p className="text-slate-500">No recent matches found.</p>
              </div>
            )}
          </div>

          <div className="mt-8 text-center">
            <Link to="/league/matches" className="btn btn-primary shadow-blue-200 shadow-lg px-8">
              View All Fixtures
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TourMatch;
