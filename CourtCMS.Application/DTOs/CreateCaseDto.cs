using System;
using System.ComponentModel.DataAnnotations;

namespace CourtCMS.Application.DTOs
{
    public class CreateCaseDto
    {
        [Required]
        public string CaseNumber { get; set; } = string.Empty;

        [Required]
        public string Title { get; set; } = string.Empty;

        [Required]
        public int? AssignedJudgeId { get; set; }
    }
}