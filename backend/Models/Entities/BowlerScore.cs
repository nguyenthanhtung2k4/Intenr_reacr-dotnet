using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models.Entities;

public partial class BowlerScore
{
    public int MatchId { get; set; }

    public short GameNumber { get; set; }

    public int BowlerId { get; set; }

    public short? RawScore { get; set; }

    public short? HandiCapScore { get; set; }

    public bool WonGame { get; set; }

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

    public virtual Bowler Bowler { get; set; } = null!;
}

