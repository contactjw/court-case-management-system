using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CourtCMS.Infrastructure.Data;
using CourtCMS.Domain.Entities;
using CourtCMS.Application.DTOs;

namespace CourtCMS.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PartiesController : ControllerBase
    {
        private readonly CourtDbContext _context;

        public PartiesController(CourtDbContext context)
        {
            _context = context;
        }

        // GET: api/parties
        // Returns all parties for the list page
        [HttpGet]
        public async Task<ActionResult<IEnumerable<PartyListDto>>> GetParties()
        {
            var parties = await _context.Parties
                .OrderBy(p => p.LastName)
                .ThenBy(p => p.FirstName)
                .Select(p => new PartyListDto
                {
                    Id = p.Id,
                    FirstName = p.FirstName,
                    LastName = p.LastName,
                    Email = p.Email,
                    Phone = p.Phone
                })
                .ToListAsync();

            return Ok(parties);
        }

        // GET: api/parties/5
        // Returns a single party by ID
        [HttpGet("{id}")]
        public async Task<ActionResult<PartyListDto>> GetParty(int id)
        {
            var party = await _context.Parties
                .Where(p => p.Id == id)
                .Select(p => new PartyListDto
                {
                    Id = p.Id,
                    FirstName = p.FirstName,
                    LastName = p.LastName,
                    Email = p.Email,
                    Phone = p.Phone
                })
                .FirstOrDefaultAsync();

            if (party == null)
            {
                return NotFound($"Party with ID {id} not found.");
            }

            return Ok(party);
        }

        // POST: api/parties
        // Creates a new party
        [HttpPost]
        public async Task<ActionResult<PartyListDto>> CreateParty(CreatePartyDto createDto)
        {
            var newParty = new Party
            {
                FirstName = createDto.FirstName,
                LastName = createDto.LastName,
                Email = createDto.Email,
                Phone = createDto.Phone,
                CreatedDate = DateTime.UtcNow
            };

            _context.Parties.Add(newParty);
            await _context.SaveChangesAsync();

            var resultDto = new PartyListDto
            {
                Id = newParty.Id,
                FirstName = newParty.FirstName,
                LastName = newParty.LastName,
                Email = newParty.Email,
                Phone = newParty.Phone
            };

            return CreatedAtAction(nameof(GetParty), new { id = newParty.Id }, resultDto);
        }

        // PUT: api/parties/5
        // Updates an existing party
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateParty(int id, UpdatePartyDto updateDto)
        {
            var existingParty = await _context.Parties.FindAsync(id);

            if (existingParty == null)
            {
                return NotFound($"Party with ID {id} not found.");
            }

            existingParty.FirstName = updateDto.FirstName;
            existingParty.LastName = updateDto.LastName;
            existingParty.Email = updateDto.Email;
            existingParty.Phone = updateDto.Phone;

            // Only update the audit date if something actually changed
            var isModified = _context.Entry(existingParty).State == EntityState.Modified;

            if (!isModified)
            {
                return NoContent();
            }

            existingParty.LastModifiedDate = DateTime.UtcNow;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Parties.Any(p => p.Id == id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // DELETE: api/parties/5
        // Soft-deletes a party
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteParty(int id)
        {
            var party = await _context.Parties.FindAsync(id);

            if (party == null)
            {
                return NotFound($"Party with ID {id} not found.");
            }

            party.IsDeleted = true;
            party.LastModifiedDate = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
