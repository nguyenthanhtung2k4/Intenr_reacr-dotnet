using Backend.Models.Entities;

namespace Backend.Services.Interfaces;

public record TournamentUpdateResult(
      bool IsSuccess,
      int StatusCode,
      string Message,
      Tournament? Tournament);

public interface ITournamentsService
{
      IEnumerable<Tournament> GetTournaments();
      Tournament CreateTournament(Tournament tournament, string? currentUserEmail);
      Tournament? GetTournamentById(int tournamentId);
      TournamentUpdateResult UpdateTournament(int tournamentId, Tournament tournament, string? currentUserEmail);
      IEnumerable<TourneyMatch> GetTourneyMatches();
}
