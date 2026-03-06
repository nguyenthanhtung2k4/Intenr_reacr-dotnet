using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using Backend.Models.Entities;

namespace Backend.Data.Contexts;

public partial class BowlingLeagueContext : DbContext
{
      public BowlingLeagueContext()
      {
      }

      public BowlingLeagueContext(DbContextOptions<BowlingLeagueContext> options)
          : base(options)
      {
      }
      public virtual DbSet<Bowler> Bowlers { get; set; } = null!;
      public virtual DbSet<Accounts> Accounts { get; set; } = null!;

      public virtual DbSet<BowlerScore> Scores { get; set; } = null!;

      public virtual DbSet<MatchGame> MatchGames { get; set; } = null!;

      public virtual DbSet<Team> Teams { get; set; } = null!;

      public virtual DbSet<Tournament> Tournaments { get; set; } = null!;

      public virtual DbSet<TourneyMatch> TourneyMatches { get; set; } = null!;

      public virtual DbSet<ZtblBowlerRating> ZtblBowlerRatings { get; set; } = null!;

      public virtual DbSet<ZtblSkipLabel> ZtblSkipLabels { get; set; } = null!;

      public virtual DbSet<ZtblWeek> ZtblWeeks { get; set; } = null!;

      protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
          => optionsBuilder.UseSqlite("Name=BowlingLeagueConnection");

      protected override void OnModelCreating(ModelBuilder modelBuilder)
      {
            modelBuilder.Entity<Bowler>(entity =>
            {
                  entity.HasIndex(e => e.BowlerLastName, "BowlerLastName");

                  entity.HasIndex(e => e.TeamId, "BowlersTeamID");

                  entity.Property(e => e.BowlerId)
                  // Ðã xóa .HasColumnType("INT") d? tránh l?i SQLite AUTOINCREMENT
                  .HasColumnName("BowlerID")
                  .ValueGeneratedOnAdd();

                  entity.Property(e => e.BowlerAddress).HasColumnType("nvarchar (50)");
                  entity.Property(e => e.BowlerCity).HasColumnType("nvarchar (50)");
                  entity.Property(e => e.BowlerFirstName).HasColumnType("nvarchar (50)");
                  entity.Property(e => e.BowlerLastName).HasColumnType("nvarchar (50)");
                  entity.Property(e => e.BowlerMiddleInit).HasColumnType("nvarchar (1)");
                  entity.Property(e => e.BowlerPhoneNumber).HasColumnType("nvarchar (14)");
                  entity.Property(e => e.BowlerState).HasColumnType("nvarchar (2)");
                  entity.Property(e => e.BowlerZip).HasColumnType("nvarchar (10)");
                  entity.Property(e => e.TeamId)
                  .HasColumnType("INT")
                  .HasColumnName("TeamID");

                  entity.Property(e => e.CreatedAt)
                  .HasDefaultValueSql("CURRENT_TIMESTAMP");

                  entity.Property(e => e.UpdatedAt);

                  entity.Property(e => e.CreatedBy)
                  .HasMaxLength(100);

                  entity.Property(e => e.UpdatedBy)
                  .HasMaxLength(100);

                  entity.Property(e => e.DeletedBy)
                  .HasMaxLength(100);

                  entity.Property(e => e.DeletedAt);

                  entity.Property(e => e.IsDelete);
            });

            modelBuilder.Entity<Accounts>(entity =>
                {
                      entity.ToTable("Accounts");
                      entity.HasKey(e => e.Id);

                      entity.Property(e => e.Id)
                        .HasColumnName("Id")
                        .ValueGeneratedOnAdd();

                      entity.Property(e => e.Email)
                        .IsRequired()
                        .HasMaxLength(100);

                      entity.Property(e => e.Password)
                        .IsRequired()
                        .HasMaxLength(200);

                      entity.Property(e => e.Role)
                        .IsRequired()
                        .HasMaxLength(50);

                      entity.Property(e => e.CreatedAt)
                        .HasDefaultValueSql("CURRENT_TIMESTAMP");

                      entity.Property(e => e.UpdatedAt);

                      entity.Property(e => e.CreatedBy)
                      .HasMaxLength(100);

                      entity.Property(e => e.UpdatedBy)
                      .HasMaxLength(100);

                      entity.Property(e => e.DeletedBy)
                      .HasMaxLength(100);

                      entity.Property(e => e.DeletedAt);

                      entity.Property(e => e.IsDelete);
                });

            modelBuilder.Entity<BowlerScore>(entity =>
            {
                  entity.HasKey(e => new { e.MatchId, e.GameNumber, e.BowlerId });

                  entity.ToTable("Bowler_Scores");

                  entity.HasIndex(e => e.BowlerId, "BowlerID");

                  entity.HasIndex(e => new { e.MatchId, e.GameNumber }, "MatchGamesBowlerScores");

                  entity.Property(e => e.MatchId)
                  .HasColumnType("INT")
                  .HasColumnName("MatchID");
                  entity.Property(e => e.GameNumber).HasColumnType("smallint");
                  entity.Property(e => e.BowlerId)
                  .HasColumnType("INT")
                  .HasColumnName("BowlerID");
                  entity.Property(e => e.HandiCapScore)
                  .HasDefaultValue((short)0)
                  .HasColumnType("smallint");
                  entity.Property(e => e.RawScore)
                  .HasDefaultValue((short)0)
                  .HasColumnType("smallint");
                  entity.Property(e => e.WonGame).HasColumnType("bit");

                  entity.Property(e => e.CreatedAt)
                  .HasDefaultValueSql("CURRENT_TIMESTAMP");

                  entity.Property(e => e.UpdatedAt);

                  entity.Property(e => e.CreatedBy)
                  .HasMaxLength(100);

                  entity.Property(e => e.UpdatedBy)
                  .HasMaxLength(100);

                  entity.Property(e => e.DeletedBy)
                  .HasMaxLength(100);

                  entity.Property(e => e.DeletedAt);

                  entity.Property(e => e.IsDelete);

                  entity.HasOne(d => d.Bowler).WithMany(p => p.BowlerScores)
                  .HasForeignKey(d => d.BowlerId)
                  .OnDelete(DeleteBehavior.ClientSetNull);
            });

            modelBuilder.Entity<MatchGame>(entity =>
            {
                  entity.HasKey(e => new { e.MatchId, e.GameNumber });

                  entity.ToTable("Match_Games");

                  entity.HasIndex(e => e.WinningTeamId, "Team1ID");

                  entity.HasIndex(e => e.MatchId, "TourneyMatchesMatchGames");

                  // MatchId là khóa ph?c h?p, không c?n ValueGeneratedOnAdd ? dây
                  entity.Property(e => e.MatchId)
                  .HasColumnType("INT")
                  .HasColumnName("MatchID");

                  entity.Property(e => e.GameNumber).HasColumnType("smallint");
                  entity.Property(e => e.WinningTeamId)
                  .HasDefaultValue(0)
                  .HasColumnType("INT")
                  .HasColumnName("WinningTeamID");

                  entity.Property(e => e.CreatedAt)
                  .HasDefaultValueSql("CURRENT_TIMESTAMP");

                  entity.Property(e => e.UpdatedAt);

                  entity.Property(e => e.CreatedBy)
                  .HasMaxLength(100);

                  entity.Property(e => e.UpdatedBy)
                  .HasMaxLength(100);

                  entity.Property(e => e.DeletedBy)
                  .HasMaxLength(100);

                  entity.Property(e => e.DeletedAt);

                  entity.Property(e => e.IsDelete);

                  entity.HasOne(d => d.Match).WithMany(p => p.MatchGames)
                  .HasForeignKey(d => d.MatchId)
                  .OnDelete(DeleteBehavior.ClientSetNull);
            });

            modelBuilder.Entity<Team>(entity =>
            {
                  entity.HasKey(e => e.TeamId); // Ð?m b?o khóa chính du?c khai báo

                  entity.HasIndex(e => e.TeamId, "TeamID").IsUnique();

                  entity.Property(e => e.TeamId)
                  // Ðã xóa .HasColumnType("INT")
                  .HasColumnName("TeamID")
                  .ValueGeneratedOnAdd(); // <-- Ð?m b?o t? d?ng tang

                  entity.Property(e => e.CaptainId)
                  .HasColumnType("INT")
                  .HasColumnName("CaptainID");
                  entity.Property(e => e.TeamName).HasColumnType("nvarchar (50)");

                  entity.Property(e => e.CreatedAt)
                  .HasDefaultValueSql("CURRENT_TIMESTAMP");

                  entity.Property(e => e.UpdatedAt);

                  entity.Property(e => e.CreatedBy)
                  .HasMaxLength(100);

                  entity.Property(e => e.UpdatedBy)
                  .HasMaxLength(100);

                  entity.Property(e => e.DeletedBy)
                  .HasMaxLength(100);

                  entity.Property(e => e.DeletedAt);

                  entity.Property(e => e.IsDelete);
            });

            modelBuilder.Entity<Tournament>(entity =>
            {
                  entity.HasKey(e => e.TourneyId);

                  entity.Property(e => e.TourneyId)
                  // Ðã xóa .HasColumnType("INT")
                  .HasColumnName("TourneyID")
                  .ValueGeneratedOnAdd();

                  entity.Property(e => e.TourneyDate).HasColumnType("date");
                  entity.Property(e => e.TourneyLocation).HasColumnType("nvarchar (50)");

                  entity.Property(e => e.CreatedAt)
                  .HasDefaultValueSql("CURRENT_TIMESTAMP");

                  entity.Property(e => e.UpdatedAt);

                  entity.Property(e => e.CreatedBy)
                  .HasMaxLength(100);

                  entity.Property(e => e.UpdatedBy)
                  .HasMaxLength(100);

                  entity.Property(e => e.DeletedBy)
                  .HasMaxLength(100);

                  entity.Property(e => e.DeletedAt);

                  entity.Property(e => e.IsDelete);
            });

            modelBuilder.Entity<TourneyMatch>(entity =>
            {
                  entity.HasKey(e => e.MatchId);

                  entity.ToTable("Tourney_Matches");

                  entity.HasIndex(e => e.OddLaneTeamId, "TourneyMatchesOdd");

                  entity.HasIndex(e => e.TourneyId, "TourneyMatchesTourneyID");

                  entity.HasIndex(e => e.EvenLaneTeamId, "Tourney_MatchesEven");

                  entity.Property(e => e.MatchId)
                  // Ðã xóa .HasColumnType("INT")
                  .HasColumnName("MatchID")
                  .ValueGeneratedOnAdd();

                  entity.Property(e => e.EvenLaneTeamId)
                  .HasDefaultValue(0)
                  .HasColumnType("INT")
                  .HasColumnName("EvenLaneTeamID");
                  entity.Property(e => e.Lanes).HasColumnType("nvarchar (5)");
                  entity.Property(e => e.OddLaneTeamId)
                  .HasDefaultValue(0)
                  .HasColumnType("INT")
                  .HasColumnName("OddLaneTeamID");
                  entity.Property(e => e.TourneyId)
                  .HasDefaultValue(0)
                  .HasColumnType("INT")
                  .HasColumnName("TourneyID");

                  entity.Property(e => e.CreatedAt)
                  .HasDefaultValueSql("CURRENT_TIMESTAMP");

                  entity.Property(e => e.UpdatedAt);

                  entity.Property(e => e.CreatedBy)
                  .HasMaxLength(100);

                  entity.Property(e => e.UpdatedBy)
                  .HasMaxLength(100);

                  entity.Property(e => e.DeletedBy)
                  .HasMaxLength(100);

                  entity.Property(e => e.DeletedAt);

                  entity.Property(e => e.IsDelete);

                  entity.HasOne(d => d.Tourney).WithMany(p => p.TourneyMatches).HasForeignKey(d => d.TourneyId);
            });

            modelBuilder.Entity<ZtblBowlerRating>(entity =>
            {
                  entity.HasKey(e => e.BowlerRating);

                  entity.ToTable("ztblBowlerRatings");

                  entity.Property(e => e.BowlerRating).HasColumnType("nvarchar (15)");
                  entity.Property(e => e.BowlerHighAvg).HasColumnType("smallint");
                  entity.Property(e => e.BowlerLowAvg).HasColumnType("smallint");

                  entity.Property(e => e.CreatedAt)
                  .HasDefaultValueSql("CURRENT_TIMESTAMP");
            });

            modelBuilder.Entity<ZtblSkipLabel>(entity =>
            {
                  entity.HasKey(e => e.LabelCount);

                  entity.ToTable("ztblSkipLabels");

                  entity.Property(e => e.LabelCount)
                  // Ðây không ph?i khóa t? d?ng tang, nên gi? nguyên ValueGeneratedNever
                  .ValueGeneratedNever()
                  .HasColumnType("INT");

                  entity.Property(e => e.CreatedAt)
                  .HasDefaultValueSql("CURRENT_TIMESTAMP");
            });

            modelBuilder.Entity<ZtblWeek>(entity =>
            {
                  entity.HasKey(e => e.WeekStart);

                  entity.ToTable("ztblWeeks");

                  entity.Property(e => e.WeekStart).HasColumnType("date");
                  entity.Property(e => e.WeekEnd).HasColumnType("date");

                  entity.Property(e => e.CreatedAt)
                  .HasDefaultValueSql("CURRENT_TIMESTAMP");
            });

            OnModelCreatingPartial(modelBuilder);
      }

      partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}

