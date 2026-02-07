using System;
using System.ComponentModel.DataAnnotations;

namespace CourtCMS.Application.DTOs
{
    public class UpdateHearingDto
    {
        [Required]
        public string Description { get; set; } = string.Empty;

        [Required]
        public DateTime HearingDate { get; set; }

        [Required]
        public string Location { get; set; } = string.Empty;
    }
}