namespace Backend.Models.Dtos;

public class BowlerPostDto
{
      public string BowlerFirstName { get; set; } = string.Empty;
      public string BowlerLastName { get; set; } = string.Empty;
      public string? BowlerMiddleInit { get; set; }
      public string? BowlerAddress { get; set; }
      public string? BowlerCity { get; set; }
      public string? BowlerState { get; set; }
      public string? BowlerZip { get; set; }
      public string? BowlerPhoneNumber { get; set; }
      public int? TeamId { get; set; }
}
