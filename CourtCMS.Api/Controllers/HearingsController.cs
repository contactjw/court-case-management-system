using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CourtCMS.Infrastructure.Data;
using CourtCMS.Domain.Entities;
using CourtCMS.Application.DTOs;

namespace CourtCMS.Api.Controllers
{
    [ApiController]
    [Route("api/cases/{caseId}/hearings")]
    public class HearingsController : ControllerBase
    {
        private readonly CourtDbContext _context;

        public HearingsController(CourtDbContext context)
        {
            _context = context;
        }

        // POST: api/cases/3/hearings
        // Adds a new hearing to a specific case
        [HttpPost]
        public async Task<ActionResult<HearingDto>> CreateHearing(
            int caseId,                     // Get from URL
            CreateHearingDto createDto)     // Get from request body
        {
            // Step 1. Verify the case exists
            var courtCase = await _context.CourtCases.FindAsync(caseId);
            if (courtCase == null)
            {
                return NotFound($"Case with ID {caseId} not found.");
            }

            // Step 2. Convert the DTO into a domain entity
            var newHearing = new Hearing
            {
                Description = createDto.Description,
                HearingDate = createDto.HearingDate,
                Location = createDto.Location,
                CourtCaseId = caseId,
                CreatedDate = DateTime.UtcNow
            };

            // Step 3. Save to the database
            _context.Hearings.Add(newHearing);
            await _context.SaveChangesAsync();

            // Step 4. Return the created hearing as a DTO
            var resultDto = new HearingDto
            {
                Id = newHearing.Id,
                Description = newHearing.Description,
                HearingDate = newHearing.HearingDate,
                Location = newHearing.Location
            };

            // 201 Created with the location header pointing to the new resource
            return CreatedAtAction(nameof(CreateHearing),
                new { caseId = caseId, id = newHearing.Id },
                resultDto
            );
        }

        // PUT: api/cases/3/hearings/7
        // Updates an existing hearing on a specific case
        [HttpPut("{hearingId}")]
        public async Task<IActionResult> UpdateHearing(
            int caseId,
            int hearingId,
            UpdateHearingDto updateDto)
        {
            // Step 1. Find the hearing in the database
            var hearing = await _context.Hearings.FindAsync(hearingId);

            // Step 2. Does it exist?
            if (hearing == null)
            {
                return NotFound($"Hearing with ID {hearingId} not found.");
            }

            // Step 3. SECURITY CHECK - does this hearing actually belong to this case?
            if (hearing.CourtCaseId != caseId)
            {
                return BadRequest("This hearing does not belong to the specified case.");
            }

            // Step 4. Apply the udpates
            hearing.Description = updateDto.Description;
            hearing.HearingDate = updateDto.HearingDate;
            hearing.Location = updateDto.Location;
            hearing.LastModifiedDate = DateTime.UtcNow;

            // Step 5. Save to the database
            await _context.SaveChangesAsync();

            // 204 No Content = "Update successful, nothing new to return"
            return NoContent();
        }

        // DELETE: api/cases/3/hearings/7
        // Soft-deletes a hearing from a specific case
        [HttpDelete("{hearingId}")]
        public async Task<IActionResult> DeleteHearing(int caseId, int hearingId)
        {
            // Step 1. Find the hearing in the database
            var hearing = await _context.Hearings.FindAsync(hearingId);

            // Step 2. Does it exist?
            if (hearing == null)
            {
                return NotFound($"Hearing with ID {hearingId} not found.");
            }

            // Step 3. SECURITY CHECK - does this hearing actually belong to this case?
            if (hearing.CourtCaseId != caseId)
            {
                return BadRequest("This hearing does not belong to the specified case.");
            }

            // Step 4. Soft delete - Mark as deleted, don't remove the row from Database
            hearing.IsDeleted = true;
            hearing.LastModifiedDate = DateTime.UtcNow;

            // Step 5. Save to the database
            await _context.SaveChangesAsync();

            // 204 No Content = "Delete successful, nothing to return"
            return NoContent();
        }
    }
}
