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
                new Judge { FirstName = "Judy", LastName = "Scheindlin", CourtRoom = "Room 101", IsActive = true, CreatedDate = DateTime.UtcNow.AddDays(-1) },
                new Judge { FirstName = "Joseph", LastName = "Wapner", CourtRoom = "Room 202", IsActive = true, CreatedDate = DateTime.UtcNow.AddDays(-10) },
                new Judge { FirstName = "Marilyn", LastName = "Milian", CourtRoom = "Room 303", IsActive = true, CreatedDate = DateTime.UtcNow.AddDays(-20)},
                new Judge { FirstName = "Frank", LastName = "Caprio", CourtRoom = "Room 404", IsActive = true, CreatedDate = DateTime.UtcNow.AddDays(-30) },
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
                    CreatedDate = DateTime.UtcNow.AddDays(-10),
                    AssignedJudge = judges[0] // Assign to Judge Judy
                },
                new CourtCase
                {
                    CaseNumber = "2024-FAM-045",
                    Title = "Doe vs. Doe",
                    Status = "Closed",
                    FilingDate = DateTime.UtcNow.AddMonths(-5),
                    CreatedDate = DateTime.UtcNow.AddMonths(-5),
                    AssignedJudge = judges[2] // Assign to Judge Marilyn
                }
            };

            context.CourtCases.AddRange(cases);
            context.SaveChanges();

            var parties = new Party[]
        {
            new Party 
            { 
                FirstName = "John", 
                LastName = "Doe", 
                Email = "john.doe@email.com", 
                Phone = "714-555-0001",
                CreatedDate = DateTime.UtcNow
            },
            new Party 
            { 
                FirstName = "Jane", 
                LastName = "Smith", 
                Email = "jane.smith@email.com", 
                Phone = "714-555-0002",
                CreatedDate = DateTime.UtcNow
            },
            new Party 
            { 
                FirstName = "ABC", 
                LastName = "Construction Inc.", 
                Email = "contact@abcconstruction.com", 
                Phone = "714-555-0100",
                CreatedDate = DateTime.UtcNow
            }
        };

        context.Parties.AddRange(parties);
        context.SaveChanges();

            // Link parties to cases
            var caseParties = new CaseParty[]
            {
                new CaseParty 
                { 
                    CourtCaseId = cases[0].Id, 
                    PartyId = parties[2].Id, 
                    Role = "Defendant",
                    CreatedDate = DateTime.UtcNow
                },
                new CaseParty 
                { 
                    CourtCaseId = cases[0].Id, 
                    PartyId = parties[0].Id, 
                    Role = "Plaintiff",
                    CreatedDate = DateTime.UtcNow
                },
                new CaseParty 
                { 
                    CourtCaseId = cases[1].Id, 
                    PartyId = parties[0].Id, 
                    Role = "Petitioner",
                    CreatedDate = DateTime.UtcNow
                },
                new CaseParty 
                { 
                    CourtCaseId = cases[1].Id, 
                    PartyId = parties[1].Id, 
                    Role = "Respondent",
                    CreatedDate = DateTime.UtcNow
                }
            };

        context.CaseParties.AddRange(caseParties);
        context.SaveChanges();

        // Create sample hearings
        var hearings = new Hearing[]
        {
            new Hearing 
            { 
                CourtCaseId = cases[0].Id,
                Description = "Preliminary Hearing",
                HearingDate = DateTime.UtcNow.AddDays(30),
                Location = "Courtroom 101",
                CreatedDate = DateTime.UtcNow
            },
            new Hearing 
            { 
                CourtCaseId = cases[0].Id,
                Description = "Motion to Dismiss",
                HearingDate = DateTime.UtcNow.AddDays(45),
                Location = "Courtroom 101",
                CreatedDate = DateTime.UtcNow
            },
            new Hearing 
            { 
                CourtCaseId = cases[1].Id,
                Description = "Final Settlement Conference",
                HearingDate = DateTime.UtcNow.AddDays(-60),
                Location = "Courtroom 303",
                CreatedDate = DateTime.UtcNow
            }
        };

        context.Hearings.AddRange(hearings);
        context.SaveChanges();
        }
    }
}