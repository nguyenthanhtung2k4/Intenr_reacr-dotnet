using System.ComponentModel.DataAnnotations;

namespace Backend.Models.Dtos
{
      public class TeamPostDto
      {
            [MaxLength(50)]
            public string? TeamName { get; set; }

            public int? CaptainId { get; set; }
            public bool IsDelete { get; set; } = false;
      }
}
