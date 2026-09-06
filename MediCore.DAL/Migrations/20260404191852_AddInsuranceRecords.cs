using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace MediCore.DAL.Migrations
{
    /// <inheritdoc />
    public partial class AddInsuranceRecords : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "InsuranceRecords",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    InsuranceNumber = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsUsed = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InsuranceRecords", x => x.Id);
                });

            migrationBuilder.InsertData(
                table: "InsuranceRecords",
                columns: new[] { "Id", "InsuranceNumber", "IsUsed" },
                values: new object[,]
                {
                    { 1, "AZ-2024-100001", false },
                    { 2, "AZ-2024-100002", false },
                    { 3, "AZ-2024-100003", false },
                    { 4, "AZ-2024-100004", false },
                    { 5, "AZ-2024-100005", false },
                    { 6, "AZ-2024-100006", false },
                    { 7, "AZ-2024-100007", false },
                    { 8, "AZ-2024-100008", false },
                    { 9, "AZ-2024-100009", false },
                    { 10, "AZ-2024-100010", false }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "InsuranceRecords");
        }
    }
}
