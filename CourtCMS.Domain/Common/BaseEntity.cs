using System;

namespace CourtCMS.Domain.Common
{
    public abstract class BaseEntity
    {
        // Primary Key for every table
        public int Id { get; set; }
        
        // Audit properties legally required for every entity
        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        // We use a string for the ID because ASP.NET Identity
        public string CreatedByUserId { get; set; } = string.Empty;
        
        public DateTime? LastModifiedDate { get; set; }
        public string? LastModifiedByUserId { get; set; }
    }
}