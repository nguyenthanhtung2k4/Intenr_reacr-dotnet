using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models.Entities;

public partial class TourneyMatch
{
    public int MatchId { get; set; }

    public int? TourneyId { get; set; }

    public string? Lanes { get; set; }

    public int? OddLaneTeamId { get; set; }

    public int? EvenLaneTeamId { get; set; }

    [Column("created_at")]
    public DateTime? CreatedAt { get; set; } = DateTime.Now;
    [Column("updated_at")]
    public DateTime? UpdatedAt { get; set; }
    [Column("created_by")]  
    public string? CreatedBy { get; set; }
    [Column("updated_by")]
    public string? UpdatedBy { get; set; }
    [Column("deleted_at")]
    public DateTime? DeletedAt { get; set; }     
    [Column("deleted_by")]
    public string? DeletedBy { get; set; }
    [Column("is_delete")]
    public bool IsDelete { get; set; }

    public virtual Team? EvenLaneTeam { get; set; }

    public virtual ICollection<MatchGame> MatchGames { get; set; } = new List<MatchGame>();

    public virtual Team? OddLaneTeam { get; set; }

    public virtual Tournament? Tourney { get; set; }
}

