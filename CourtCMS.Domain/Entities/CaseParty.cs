using CourtCMS.Domain.Common;

namespace CourtCMS.Domain.Entities
{
    public class CaseParty : BaseEntity
    {
        // Foreign Key to CourtCase
        public int CourtCaseId { get; set; }
        public CourtCase CourtCase { get; set; } = null!;

        // Foreign Key to Party
        public int PartyId { get; set; }
        public Party Party { get; set; } = null!;

        public string Role { get; set; } = string.Empty; // e.g., "Plaintiff", "Defendant", "Witness"
    }
}