using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models.Entities;

public partial class ZtblWeek
{
    public DateOnly WeekStart { get; set; }

    public DateOnly? WeekEnd { get; set; }

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
}

