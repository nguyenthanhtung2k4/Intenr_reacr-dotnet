using Backend.Models.Dtos;
using Backend.Models.Entities;

namespace Backend.Services.Interfaces;

public record MatchScoreSubmitResult(
      string Message,
      int MatchId,
      short GameNumber,
      int OddTeamTotal,
      int EvenTeamTotal,
      int? WinningTeamId);

public interface IMatchesService
{
      TourneyMatch CreateMatch(MatchCreateDto matchDto, string? currentUserEmail);
      TourneyMatch? UpdateMatch(int id, MatchCreateDto matchDto, string? currentUserEmail);
      IEnumerable<MatchListDto> GetMatches();
      MatchScoreDetailDto? GetMatchScores(int matchId);
      MatchScoreSubmitResult? SubmitMatchScores(MatchScoreInputDto dto, string? currentUserEmail);
}
