using System.ComponentModel.DataAnnotations;

namespace CourtCMS.Application.DTOs
{
    public class CreatePartyDto
    {
        [Required]
        public string FirstName { get; set; } = string.Empty;

        [Required]
        public string LastName { get; set; } = string.Empty;

        [Required]
        [EmailAddress] // Built in validation to ensure the string is a valid email format
        public string Email { get; set; } = string.Empty;

        [Required]
        [Phone] // Built in validation to ensure the string is a valid phone number format
        public string Phone { get; set; } = string.Empty;
    }
}
