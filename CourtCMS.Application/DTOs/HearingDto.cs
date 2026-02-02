using System;

namespace CourtCMS.Application.DTOs
{
    public class HearingDto
    {
        public int Id { get; set; }
        public string Description { get; set; } = string.Empty;
        public DateTime HearingDate { get; set; }
        public string Location { get; set; } = string.Empty;
    }
}