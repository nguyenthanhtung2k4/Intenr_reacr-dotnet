using System;
using System.ComponentModel.DataAnnotations;

namespace Backend.Models.Dtos;

public class loginDto
{
      [Required(ErrorMessage = "Email không được để trống.")]
      public string Email { get; set; } = string.Empty;
      [Required(ErrorMessage = "Password không được để trống.")]
      public string Password { get; set; } = string.Empty;

}

