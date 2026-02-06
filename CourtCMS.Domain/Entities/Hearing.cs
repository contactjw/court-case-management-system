using CourtCMS.Domain.Common;
using System;

namespace CourtCMS.Domain.Entities
{
    public class Hearing : BaseEntity
    {
        public string Description { get; set; } = string.Empty; // e.g., "Arraignment Hearing"
        public DateTime HearingDate { get; set; }
        public string Location { get; set; } = string.Empty; // e.g. "Room 304"
        
        // Foreign Key to CourtCase
        public int CourtCaseId { get; set; }
        public CourtCase CourtCase { get; set; } = null!;
    }
}