using CourtCMS.Domain.Common;
using System.Collections.Generic;

namespace CourtCMS.Domain.Entities
{
    public class Judge : BaseEntity
    {
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string CourtRoom { get; set; } = string.Empty;
        public bool IsActive { get; set; } = true;

        public ICollection<CourtCase> Cases { get; set; } = new List<CourtCase>();
    }

}