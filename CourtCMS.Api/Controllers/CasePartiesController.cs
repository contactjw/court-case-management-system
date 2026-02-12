using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CourtCMS.Infrastructure.Data;
using CourtCMS.Domain.Entities;
using CourtCMS.Application.DTOs;
using Microsoft.AspNetCore.Http.HttpResults;

namespace CourtCMS.Api.Controllers
{
    [ApiController]
    [Route("api/cases/{caseId}/parties")]
    public class CasePartiesController : ControllerBase
    {
        private readonly CourtDbContext _context;

        public CasePartiesController(CourtDbContext context)
        {
            _context = context;
        }

        // POST: api/cases/3/parties
        // Links an existing party to a case with a specific role
        [HttpPost]
        public async Task<ActionResult<CasePartyDto>> AddPartyToCase(
            int caseId,
            AddCasePartyDto addDto)
        {
            // Step 1. Verify the case exists
            var courtCase = await _context.CourtCases.FindAsync(caseId);
            if (courtCase == null)
            {
                return NotFound($"Case with ID {caseId} not found.");
            }

            // Step 2. Verify the party exists
            var party = await _context.Parties.FindAsync(addDto.PartyId);
            if (party == null)
            {
                return NotFound($"Party with ID {addDto.PartyId} not found.");
            }

            // Step 3 Check if this party is already linked to this case.
            var existingLink = await _context.CaseParties
                .FirstOrDefaultAsync(cp => cp.CourtCaseId == caseId
                    && cp.PartyId == addDto.PartyId);
                    
            if (existingLink != null)
            {
                return BadRequest(
                    $"{party.FirstName} {party.LastName} is already assigned to this case.");
            }

            // Step 4. Create the link
            var caseParty = new CaseParty
            {
                CourtCaseId = caseId,
                PartyId = addDto.PartyId,
                Role = addDto.Role,
                CreatedDate = DateTime.UtcNow
            };

            _context.CaseParties.Add(caseParty);
            await _context.SaveChangesAsync();

            // Step 5. Return the DTO so the frontend can update immediately
            var resultDto = new CasePartyDto
            {
                PartyId = party.Id,
                FullName = $"{party.FirstName} {party.LastName}",
                Role = addDto.Role
            };

            return Created($"api/cases/{caseId}/parties", resultDto);
        }

        // DELETE: api/cases/3/parties/7
        // Removes a party from a case (does NOT delete the party itself)
        [HttpDelete("{partyId}")]
        public async Task<IActionResult> RemovePartyFromCase(int caseId, int PartyId)
        {
            // Step 1. Find the link between this case and party
            var caseParty = await _context.CaseParties
                .FirstOrDefaultAsync(cp => cp.CourtCaseId == caseId
                    && cp.PartyId == PartyId);


            // Step 2. Does the link exist?
            if (caseParty == null)
            {
                return NotFound("This party is not assigned to this case.");
            }

            // Step 3. Hard delete the link because CaseParty is just a JOIN Table, both entities
            // that make up the CaseParty Table still exist after a Hard Delete.
            _context.CaseParties.Remove(caseParty);
            await _context.SaveChangesAsync();
            
            return NoContent();
        }
    }
}