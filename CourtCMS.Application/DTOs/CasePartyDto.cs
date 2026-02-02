namespace CourtCMS.Application.DTOs
{
    public class CasePartyDto
    {
        public int PartyId { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
    }
}
