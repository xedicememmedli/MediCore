using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MediCore.DAL.Migrations
{
    /// <inheritdoc />
    public partial class AddInsurance_To_AppUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "HasInsurance",
                table: "AspNetUsers",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "InsuranceCompany",
                table: "AspNetUsers",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "HasInsurance",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "InsuranceCompany",
                table: "AspNetUsers");
        }
    }
}
