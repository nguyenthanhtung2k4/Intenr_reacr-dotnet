using Backend.Models.Dtos;
using Backend.Models.Entities;

namespace Backend.Services.Interfaces;

public record AuthenticationResult(
      bool IsSuccess,
      string Message,
      int UserId,
      string Role,
      string Token);

public record AccountCommandResult(
      bool IsSuccess,
      int StatusCode,
      string Message,
      Accounts? Account);

public interface IBowlingLeagueService
{
      IEnumerable<Bowler> GetBowlers();
      Bowler? GetBowlerById(int id);
      Bowler CreateBowler(BowlerPostDto newBowler, string? currentUserEmail);
      Bowler? PatchBowler(int id, BowlerPatchDto patchDto, string? currentUserEmail);
      AuthenticationResult Authenticate(loginDto loginDto);
      IEnumerable<Accounts> GetAccounts();
      Accounts? GetAccountById(int id);
      AccountCommandResult CreateAccount(AccountsDto accountsDto, string? currentUserEmail);
      AccountCommandResult UpdateAccount(int id, AccountsDto accountsDto, string? currentUserEmail);
      IEnumerable<BowlerStatsDto> GetBowlerStats();
}
