using CourtCMS.Domain.Entities;

namespace CourtCMS.Infrastructure.Data
{
    public static class DbInitializer
    {
        public static void Initialize(CourtDbContext context)
        {
            context.Database.EnsureCreated();

            // Check if there are any Judges already in the database
            if (context.Judges.Any())
            {
                return;
            }

            var judges = new Judge[]
            {
                new Judge { FirstName = "Judy", LastName = "Scheindlin", CourtRoom = "Room 101", IsActive = true },
                new Judge { FirstName = "Joseph", LastName = "Wapner", CourtRoom = "Room 102", IsActive = false },
                new Judge { FirstName = "Marilyn", LastName = "Milian", CourtRoom = "Room 205", IsActive = true }
            };

            context.Judges.AddRange(judges);
            context.SaveChanges();

            // Create Cases
            var cases = new CourtCase[]
            {
                new CourtCase
                {
                    CaseNumber = "2024-CIV-001",
                    Title = "City of Orange vs. Construction Co.",
                    Status = "Open",
                    FilingDate = DateTime.UtcNow.AddDays(-10),
                    AssignedJudge = judges[0] // Assign to Judge Judy
                },
                new CourtCase
                {
                    CaseNumber = "2024-FAM-045",
                    Title = "Doe vs. Doe",
                    Status = "Closed",
                    FilingDate = DateTime.UtcNow.AddMonths(-5),
                    AssignedJudge = judges[2] // Assign to Judge Marilyn
                }
            };

            context.CourtCases.AddRange(cases);
            context.SaveChanges();
        }
    }
}