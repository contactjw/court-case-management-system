using CourtCMS.Domain.Common;
using System.Collections.Generic;

namespace CourtCMS.Domain.Entities
{
    public class Party : BaseEntity
    {
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public ICollection<CaseParty> CaseParties { get; set; } = new List<CaseParty>();
    }
}