using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MediCore.DAL.Migrations
{
    /// <inheritdoc />
    public partial class AddIsPrescriptionRequiredToMedicine : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "PrescriptionImagePublicId",
                table: "Orders",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PrescriptionImageUrl",
                table: "Orders",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsPrescriptionRequired",
                table: "Medicines",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PrescriptionImagePublicId",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "PrescriptionImageUrl",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "IsPrescriptionRequired",
                table: "Medicines");
        }
    }
}
