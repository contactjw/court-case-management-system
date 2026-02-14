using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CourtCMS.Infrastructure.Data;
using CourtCMS.Domain.Entities;

namespace CourtCMS.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class JudgesController : ControllerBase
    {
        private readonly CourtDbContext _context;

        public JudgesController(CourtDbContext context)
        {
            _context = context;
        }

        // GET: api/judges
        // This is a "Lookup" endpoint used to populate dropdowns.
        // It's lightweight and only returns ID and Name.
        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetJudges()
        {
            var judges = await _context.Judges
            .Where(j => j.IsActive)
            .OrderBy(j => j.LastName)
            .ThenBy(j => j.FirstName)
            .Select(j => new
            {
                Id = j.Id,
                FullName = j.FirstName + " " + j.LastName
            })
            .ToListAsync();

        
            return Ok(judges);
        }
    }
}