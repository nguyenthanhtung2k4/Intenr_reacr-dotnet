using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System;

namespace Backend.Models.Entities
{
      public class Accounts
      {
            [Key]
            [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
            public int Id { get; set; }
            public string Email { get; set; } = string.Empty;
            public string Password { get; set; } = string.Empty;
            public string Role { get; set; } = string.Empty;
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
            public bool IsDelete { get; set; } = false;
      }
}

