using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CourtCMS.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddSoftDelete : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "Parties",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "Judges",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "Hearings",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "CourtCases",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "CaseParties",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "Parties");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "Judges");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "Hearings");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "CourtCases");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "CaseParties");
        }
    }
}
