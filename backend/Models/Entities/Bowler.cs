using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System;

namespace Backend.Models.Entities
{
    public class Bowler
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int BowlerId { get; set; }

        [Required]
        public string BowlerFirstName { get; set; } = string.Empty;

        [Required]
        public string BowlerLastName { get; set; } = string.Empty;

        public string? BowlerMiddleInit { get; set; }

        public string? BowlerAddress { get; set; }

        public string? BowlerCity { get; set; }

        public string? BowlerState { get; set; }

        public string? BowlerZip { get; set; }

        public string? BowlerPhoneNumber { get; set; }
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

        // ?? Ðây là khóa ngo?i — KHÔNG c?n ForeignKey attribute
        public int? TeamId { get; set; }

        // ?? Navigation property
        public Team? Team { get; set; }

        public virtual ICollection<BowlerScore> BowlerScores { get; set; } = new List<BowlerScore>();
    }
}

