using System;

namespace CourtCMS.Application.DTOs
{
    public class CaseListDto
    {
        // Keep the Id so that frontend can link to case details
        public int Id { get; set; }
        public string CaseNumber { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime FilingDate { get; set; }

        // Flatten JudgeName for easier display
        public string AssignedJudgeName { get; set; } = string.Empty;
        public int? AssignedJudgeId { get; set; }


    }
}