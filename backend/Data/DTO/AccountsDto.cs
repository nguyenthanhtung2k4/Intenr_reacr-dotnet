using System;
using System.ComponentModel.DataAnnotations;
namespace Backend.Data.DTO;

public class AccountsDto
{
      [Required(ErrorMessage ="Điền email đầy đủ")]
      public string Email { get; set; } = string.Empty;
      [Required(ErrorMessage ="Điền password đầy đủ")]
      public string Password { get; set; } = string.Empty;
      public string Role { get; set; } = "admin";
      public bool IsDelete { get; set; } = false;
}