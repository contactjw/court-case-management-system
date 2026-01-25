using System;

namespace CourtCMS.Application.DTOs
{
    public class CaseDto
    {
        public int Id { get; set; }
        public string CaseNumber { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime FilingDate { get; set; }
        public string AssignedJudgeName { get; set; } = string.Empty;

        public int? AssignedJudgeId { get; set; }
    }
}