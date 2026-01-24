using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CourtCMS.Infrastructure.Data;
using CourtCMS.Domain.Entities;
using CourtCMS.Application.DTOs;

namespace CourtCMS.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")] // This creates the URL: http://localhost:xxxx/api/cases
    public class CasesController : ControllerBase
    {
        private readonly CourtDbContext _context;

        // Dependency Injection: The "Waiter" asks the "Kitchen" for the database connection
        public CasesController(CourtDbContext context)
        {
            _context = context;
        }

        // GET: api/cases
        [HttpGet]
        public async Task<ActionResult<IEnumerable<CaseDto>>> GetCases()
        {
            // 1. Get entities from DB including the related Judge
            var cases = await _context.CourtCases
                .Include(c => c.AssignedJudge) // This is an EAGER LOAD (SQL JOIN)
                .ToListAsync();

            // 2. Map Entity -> DTO manually (Professional projects use AutoMapper, but manual is clearer for learning)
            var caseDtos = cases.Select(c => new CaseDto
            {
                Id = c.Id,
                CaseNumber = c.CaseNumber,
                Title = c.Title,
                Status = c.Status,
                FilingDate = c.FilingDate,
                // Handle null judge safely
                AssignedJudgeName = c.AssignedJudge != null 
                    ? $"{c.AssignedJudge.FirstName} {c.AssignedJudge.LastName}" 
                    : "Unassigned"
            }).ToList();

            return Ok(caseDtos);
        }

        // GET: api/cases/5
        [HttpGet("{id}")]
        public async Task<ActionResult<CaseDto>> GetCase(int id)
        {
            var courtCase = await _context.CourtCases
                .Include(c => c.AssignedJudge)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (courtCase == null)
            {
                return NotFound(); // Returns 404
            }

            var dto = new CaseDto
            {
                Id = courtCase.Id,
                CaseNumber = courtCase.CaseNumber,
                Title = courtCase.Title,
                Status = courtCase.Status,
                FilingDate = courtCase.FilingDate,
                AssignedJudgeName = courtCase.AssignedJudge != null 
                    ? $"{courtCase.AssignedJudge.FirstName} {courtCase.AssignedJudge.LastName}" 
                    : "Unassigned"
            };

            return Ok(dto);
        }
    }
}