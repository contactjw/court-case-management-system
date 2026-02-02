using System;
using System.Collections.Generic;

namespace CourtCMS.Application.DTOs
{
    public class CaseDetailDto
    {
        public int Id { get; set; }
        public string CaseNumber { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime FilingDate { get; set; }

        public DateTime CreatedDate {get; set; }
        public DateTime? LastModifiedDate { get; set; }

        public string AssignedJudgeName { get; set; } = "Unassigned";

        // Lists of the other DTOs
        public List<CasePartyDto> Parties { get; set; } = new();
        public List<HearingDto> Hearings { get; set; } = new();
        
    }
}