using System.ComponentModel.DataAnnotations;

namespace CourtCMS.Application.DTOs
{
    public class AddCasePartyDto
    {
        [Required]
        public int PartyId { get; set; }

        [Required]
        public string Role { get; set; } = string.Empty;
    }
}