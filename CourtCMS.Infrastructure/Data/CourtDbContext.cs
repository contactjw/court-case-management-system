using Microsoft.EntityFrameworkCore;
using CourtCMS.Domain.Entities;

namespace CourtCMS.Infrastructure.Data
{
    public class CourtDbContext : DbContext
    {
        public CourtDbContext(DbContextOptions<CourtDbContext> options) : base(options)
        {
        }

        public DbSet<CourtCase> CourtCases { get; set; }
        public DbSet<Judge> Judges { get; set; }
        public DbSet<Hearing> Hearings { get; set; }
        public DbSet<Party> Parties { get; set; }
        public DbSet<CaseParty> CaseParties { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<CaseParty>()
                .HasKey(cp => new { cp.CourtCaseId, cp.PartyId });

            // Configure relationships and constraints if needed
            modelBuilder.Entity<CaseParty>()
                .HasOne(cp => cp.CourtCase)
                .WithMany(c => c.CaseParties)
                .HasForeignKey(cp => cp.CourtCaseId);

            modelBuilder.Entity<CaseParty>()
                .HasOne(cp => cp.Party)
                .WithMany(p => p.CaseParties)
                .HasForeignKey(cp => cp.PartyId);

            modelBuilder.Entity<CourtCase>().HasQueryFilter(c => !c.IsDeleted);
            modelBuilder.Entity<Judge>().HasQueryFilter(j => !j.IsDeleted);
        }
    }
}