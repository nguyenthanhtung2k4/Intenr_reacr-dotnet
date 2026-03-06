using Backend.Data.Repositories;
using Backend.Models.Entities;
using Backend.Services.Interfaces;

namespace Backend.Services.Implementations;

public class TournamentsService(IBowlingLeagueRepository repository) : ITournamentsService
{
      private readonly IBowlingLeagueRepository _repository = repository;

      public IEnumerable<Tournament> GetTournaments()
      {
            return _repository.Tournaments
                  .Where(t => t.IsDelete != true)
                  .ToList();
      }

      public Tournament CreateTournament(Tournament tournament, string? currentUserEmail)
      {
            tournament.CreatedBy = currentUserEmail;
            tournament.CreatedAt = DateTime.Now;
            tournament.IsDelete = false;

            _repository.CreateTournament(tournament);
            return tournament;
      }

      public Tournament? GetTournamentById(int tournamentId)
      {
            var tournament = _repository.Tournaments.FirstOrDefault(t => t.TourneyId == tournamentId);
            if (tournament == null || tournament.IsDelete == true)
            {
                  return null;
            }

            return tournament;
      }

      public TournamentUpdateResult UpdateTournament(int tournamentId, Tournament tournament, string? currentUserEmail)
      {
            if (tournamentId != tournament.TourneyId)
            {
                  return new TournamentUpdateResult(false, 400, "Mã giải đấu không khớp (ID mismatch)", null);
            }

            var existingTournament = _repository.Tournaments.FirstOrDefault(t => t.TourneyId == tournamentId);

            if (existingTournament == null)
            {
                  return new TournamentUpdateResult(false, 404, "Không tìm thấy giải đấu để cập nhật.", null);
            }

            if (tournament.IsDelete == true)
            {
                  existingTournament.IsDelete = true;
                  existingTournament.DeletedAt = DateTime.Now;
                  existingTournament.DeletedBy = currentUserEmail;

                  _repository.Update(existingTournament);
                  return new TournamentUpdateResult(true, 200, "Updated", existingTournament);
            }

            existingTournament.TourneyDate = tournament.TourneyDate;
            existingTournament.TourneyLocation = tournament.TourneyLocation;
            existingTournament.UpdatedBy = currentUserEmail;
            existingTournament.UpdatedAt = DateTime.Now;

            _repository.Update(existingTournament);

            return new TournamentUpdateResult(true, 200, "Updated", existingTournament);
      }

      public IEnumerable<TourneyMatch> GetTourneyMatches()
      {
            return _repository.TourneyMatches.ToList();
      }
}
