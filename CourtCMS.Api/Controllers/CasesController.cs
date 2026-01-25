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

        // POST: api/cases
        [HttpPost]
        public async Task<ActionResult<CaseDto>> CreateCase(CreateCaseDto createDto)
        {
            // 1. Convert DTO to Domain Entity
            var newCase = new CourtCase
            {
                CaseNumber = createDto.CaseNumber,
                Title = createDto.Title,
                Status = "Open", // Default business rule
                FilingDate = DateTime.UtcNow,
                AssignedJudgeId = createDto.AssignedJudgeId
            };

            // 2. Add to Database (The Kitchen)
            _context.CourtCases.Add(newCase);
            await _context.SaveChangesAsync();

            // 3. Return the Result
            // We need to reload the Judge object to return the full name to the user immediately
            // (EF Core doesn't load relationships automatically after adding)
            await _context.Entry(newCase).Reference(c => c.AssignedJudge).LoadAsync();

            var resultDto = new CaseDto
            {
                Id = newCase.Id,
                CaseNumber = newCase.CaseNumber,
                Title = newCase.Title,
                Status = newCase.Status,
                FilingDate = newCase.FilingDate,
                AssignedJudgeName = newCase.AssignedJudge != null 
                    ? $"{newCase.AssignedJudge.FirstName} {newCase.AssignedJudge.LastName}" 
                    : "Unassigned"
            };

            // Return 201 Created
            return CreatedAtAction(nameof(GetCase), new { id = newCase.Id }, resultDto);
        }

        // PUT: api/cases/5
        // This endpoint updates an existing case
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCase(int id, UpdateCaseDto updateDto)
        {
            // 1. Find the case in the database
            var existingCase = await _context.CourtCases.FindAsync(id);

            // 2. Safety Check: Does it exist?
            if (existingCase == null)
            {
                return NotFound();
            }

            // 3. Update the fields
            existingCase.Title = updateDto.Title;
            existingCase.Status = updateDto.Status;
            existingCase.AssignedJudgeId = updateDto.AssignedJudgeId;

            // 4. Save changes to SQL
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                // This handles rare errors if two people update at the exact same time
                if (!_context.CourtCases.Any(c => c.Id == id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            // 5. Return "No Content" (Standard for updates)
            // It means "Done, nothing new to show you."
            return NoContent();
        }

    }
}