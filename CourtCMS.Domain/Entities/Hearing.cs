using CourtCMS.Domain.Common;
using System;

namespace CourtCMS.Domain.Entities
{
    public class Hearing : BaseEntity
    {
        public DateTime HearingDate { get; set; }
        public string Description { get; set; } = string.Empty; // e.g., "Arraignment Hearing"
        public string Outcome { get; set; } = string.Empty; // e.g. "Adjourned", "Completed"

        // Foreign Key to CourtCase
        public int CourtCaseId { get; set; }
        public CourtCase CourtCase { get; set; } = null!;
    }
}