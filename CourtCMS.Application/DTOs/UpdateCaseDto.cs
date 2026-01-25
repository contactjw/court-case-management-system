using System.ComponentModel.DataAnnotations;

namespace CourtCMS.Application.DTOs
{
    public class UpdateCaseDto
    {
        public string CaseNumber { get; set; } = string.Empty;

        [Required]
        public string Title { get; set; } = string.Empty;

        [Required]
        public string Status { get; set; } = string.Empty;

        public int? AssignedJudgeId { get; set; }
    }
}