
public partial class BowlerPostDto
{
    public int BowlerId { get; set; }

    public string? BowlerLastName { get; set; }

    public string? BowlerFirstName { get; set; }

      public string? BowlerMiddleInit { get; set; } = null;

    public string? BowlerAddress { get; set; }

    public string? BowlerCity { get; set; }

      public string? BowlerState { get; set; } = null;

    public string? BowlerZip { get; set; }

    public string? BowlerPhoneNumber { get; set; }

    public int? TeamID { get; set; }
}
