using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models.Entities;

public partial class Team
{
      [Key]
      [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
      public int TeamId { get; set; }

      public string? TeamName { get; set; } = null!;

      public int? CaptainId { get; set; }
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
      public bool IsDelete { get; set; } = false;

      // Manual override fields for standings (Admin can set these manually)
      public int? ManualPoints { get; set; }
      public int? ManualWins { get; set; }
      public int? ManualLosses { get; set; }
}

