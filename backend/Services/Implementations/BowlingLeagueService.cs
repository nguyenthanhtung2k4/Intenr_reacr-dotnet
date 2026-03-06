using Backend.Data.Repositories;
using Backend.Models.Dtos;
using Backend.Models.Entities;
using Backend.Services.Interfaces;

namespace Backend.Services.Implementations;

public class BowlingLeagueService(IBowlingLeagueRepository repository, ITokenService tokenService) : IBowlingLeagueService
{
      private readonly IBowlingLeagueRepository _repository = repository;
      private readonly ITokenService _tokenService = tokenService;

      public IEnumerable<Bowler> GetBowlers()
      {
            return _repository.Bowlers
                .Where(b => b.IsDelete != true)
                .OrderByDescending(b => b.BowlerId)
                .ToList();
      }

      public Bowler? GetBowlerById(int id)
      {
            return _repository.Bowlers.FirstOrDefault(b => b.BowlerId == id);
      }

      public Bowler CreateBowler(BowlerPostDto newBowler, string? currentUserEmail)
      {
            var bowler = new Bowler
            {
                  BowlerFirstName = newBowler.BowlerFirstName,
                  BowlerLastName = newBowler.BowlerLastName,
                  BowlerMiddleInit = newBowler.BowlerMiddleInit,
                  BowlerAddress = newBowler.BowlerAddress,
                  BowlerCity = newBowler.BowlerCity,
                  BowlerState = newBowler.BowlerState,
                  BowlerZip = newBowler.BowlerZip,
                  BowlerPhoneNumber = newBowler.BowlerPhoneNumber,
                  TeamId = newBowler.TeamId,
                  CreatedAt = DateTime.Now,
                  CreatedBy = currentUserEmail,
                  IsDelete = false
            };

            _repository.CreateBowler(bowler);
            return bowler;
      }

      public Bowler? PatchBowler(int id, BowlerPatchDto patchDto, string? currentUserEmail)
      {
            var bowler = _repository.Bowlers.FirstOrDefault(b => b.BowlerId == id);

            if (bowler == null)
            {
                  return null;
            }

            if (patchDto.BowlerFirstName != null) bowler.BowlerFirstName = patchDto.BowlerFirstName;
            if (patchDto.BowlerLastName != null) bowler.BowlerLastName = patchDto.BowlerLastName;
            if (patchDto.BowlerAddress != null) bowler.BowlerAddress = patchDto.BowlerAddress;
            if (patchDto.BowlerPhoneNumber != null) bowler.BowlerPhoneNumber = patchDto.BowlerPhoneNumber;
            if (patchDto.BowlerCity != null) bowler.BowlerCity = patchDto.BowlerCity;
            if (patchDto.BowlerState != null) bowler.BowlerState = patchDto.BowlerState;
            if (patchDto.BowlerZip != null) bowler.BowlerZip = patchDto.BowlerZip;
            if (patchDto.BowlerMiddleInit != null) bowler.BowlerMiddleInit = patchDto.BowlerMiddleInit;
            if (patchDto.TeamId != null) bowler.TeamId = patchDto.TeamId;

            if (patchDto.IsDeleted)
            {
                  bowler.IsDelete = patchDto.IsDeleted;
                  if (bowler.IsDelete)
                  {
                        bowler.DeletedAt = DateTime.Now;
                        bowler.DeletedBy = currentUserEmail;
                  }
            }

            bowler.UpdatedAt = DateTime.Now;
            bowler.UpdatedBy = currentUserEmail;

            _repository.UpdateBowler(bowler);
            return bowler;
      }

      public AuthenticationResult Authenticate(loginDto loginDto)
      {
            if (string.IsNullOrEmpty(loginDto.Email) || string.IsNullOrEmpty(loginDto.Password))
            {
                  return new AuthenticationResult(false, "Vui lòng nhập đầy đủ Email và Mật khẩu.", 0, string.Empty, string.Empty);
            }

            var acc = _repository.Accounts
                .FirstOrDefault(e => string.Equals(e.Email, loginDto.Email, StringComparison.OrdinalIgnoreCase)
                                     && e.IsDelete != true);

            if (acc == null || acc.Password != loginDto.Password)
            {
                  return new AuthenticationResult(false, "Email hoặc mật khẩu không đúng.", 0, string.Empty, string.Empty);
            }

            var token = _tokenService.GenerateJwtToken(acc.Id, acc.Role, acc.Email);

            return new AuthenticationResult(true, "Đăng nhập thành công!", acc.Id, acc.Role, token);
      }

      public IEnumerable<Accounts> GetAccounts()
      {
            return _repository.Accounts
                .Where(e => e.IsDelete != true)
                .OrderByDescending(e => e.Id)
                .ToList();
      }

      public Accounts? GetAccountById(int id)
      {
            return _repository.Accounts
                .FirstOrDefault(e => e.Id == id && e.IsDelete != true);
      }

      public AccountCommandResult CreateAccount(AccountsDto accountsDto, string? currentUserEmail)
      {
            if (_repository.Accounts.Any(a => a.IsDelete != true && a.Email == accountsDto.Email))
            {
                  return new AccountCommandResult(false, 409, "Email đã tồn tại!", null);
            }

            var account = new Accounts
            {
                  Email = accountsDto.Email,
                  Password = accountsDto.Password,
                  Role = accountsDto.Role,
                  IsDelete = false,
                  CreatedAt = DateTime.Now,
                  CreatedBy = currentUserEmail
            };

            _repository.CreateAcounts(account);
            return new AccountCommandResult(true, 201, "Tạo tài khoản thành công", account);
      }

      public AccountCommandResult UpdateAccount(int id, AccountsDto accountsDto, string? currentUserEmail)
      {
            var account = _repository.Accounts.FirstOrDefault(e => e.Id == id);
            if (account == null)
            {
                  return new AccountCommandResult(false, 404, "Không tìm thấy tài khoản.", null);
            }

            if (!string.IsNullOrEmpty(accountsDto.Email) && accountsDto.Email != account.Email)
            {
                  if (_repository.Accounts.Any(a => a.IsDelete != true && a.Email == accountsDto.Email))
                  {
                        return new AccountCommandResult(false, 400, "Email đã tồn tại!", null);
                  }
                  account.Email = accountsDto.Email;
            }

            if (!string.IsNullOrEmpty(accountsDto.Password)) account.Password = accountsDto.Password;
            if (!string.IsNullOrEmpty(accountsDto.Role)) account.Role = accountsDto.Role;

            if (accountsDto.IsDelete == true)
            {
                  account.IsDelete = true;
                  account.DeletedAt = DateTime.Now;
                  account.DeletedBy = currentUserEmail;
            }
            else
            {
                  account.UpdatedAt = DateTime.Now;
                  account.UpdatedBy = currentUserEmail;
            }

            _repository.UpdateAccounts(account);

            return new AccountCommandResult(true, 200, "Cập nhật tài khoản thành công", account);
      }

      public IEnumerable<BowlerStatsDto> GetBowlerStats()
      {
            var bowlers = _repository.Bowlers.Where(b => b.IsDelete != true).ToList();
            var scores = _repository.Scores.ToList();
            var teams = _repository.Teams.ToList();

            var stats = bowlers.Select(b =>
            {
                  var bScores = scores.Where(s => s.BowlerId == b.BowlerId).ToList();
                  var team = teams.FirstOrDefault(t => t.TeamId == b.TeamId);

                  var totalGames = bScores.Count;
                  var totalPins = bScores.Sum(s => s.RawScore ?? 0);
                  var highScore = bScores.Count > 0 ? bScores.Max(s => s.RawScore ?? 0) : 0;
                  var avg = totalGames > 0 ? (double)totalPins / totalGames : 0;
                  var won = bScores.Count(s => s.WonGame);

                  return new BowlerStatsDto
                  {
                        BowlerId = b.BowlerId,
                        BowlerName = $"{b.BowlerFirstName} {b.BowlerLastName}",
                        TeamId = b.TeamId,
                        TeamName = team?.TeamName,
                        TotalGames = totalGames,
                        AverageScore = Math.Round(avg, 1),
                        HighScore = highScore,
                        TotalPins = totalPins,
                        GamesWon = won
                  };
            })
            .OrderByDescending(s => s.AverageScore)
            .ToList();

            return stats;
      }
}
