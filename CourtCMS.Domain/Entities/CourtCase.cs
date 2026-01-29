using CourtCMS.Domain.Common;
using System.Collections.Generic;

namespace CourtCMS.Domain.Entities
{
    public class CourtCase : BaseEntity
    {
        public string CaseNumber { get; set; } = string.Empty; // e.g., "2024-CIV-001"
        public string Title { get; set; } = string.Empty; // e.g., "Smith vs. Johnson"
        public string Status { get; set; } = "Open"; // e.g., "Open", "Closed", "Dismissed"
        public DateTime FilingDate { get; set; }

        // Foreign Key linking the case to a Judge
        public int? AssignedJudgeId { get; set; }

        public Judge? AssignedJudge { get; set; }

        public ICollection<Hearing> Hearings { get; set; } = new List<Hearing>();

        public ICollection<CaseParty> CaseParties { get; set; } = new List<CaseParty>();
    }
}
