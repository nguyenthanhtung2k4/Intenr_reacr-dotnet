
namespace Backend.Models.Dtos
{
      public class BowlerPatchDto
      {
            public bool IsDeleted { get; set; } = false;
            public string? BowlerLastName { get; set; }
            public string? BowlerFirstName { get; set; }
            public string? BowlerAddress { get; set; }
            public string? BowlerPhoneNumber { get; set; }
            public string? BowlerMiddleInit { get; set; }
            public string? BowlerCity { get; set; }
            public string? BowlerState { get; set; }
            public string? BowlerZip { get; set; }
            public int? TeamId { get; set; }
      }
}
