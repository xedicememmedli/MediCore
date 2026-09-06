using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MediCore.DAL.Migrations
{
    /// <inheritdoc />
    public partial class AddedUsedPrescriptionsTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "UsedPrescriptions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PrescriptionNumber = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    AppUserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    MedicineId = table.Column<int>(type: "int", nullable: false),
                    TotalAllowedQuantity = table.Column<int>(type: "int", nullable: false),
                    UsedQuantity = table.Column<int>(type: "int", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UsedPrescriptions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UsedPrescriptions_AspNetUsers_AppUserId",
                        column: x => x.AppUserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_UsedPrescriptions_Medicines_MedicineId",
                        column: x => x.MedicineId,
                        principalTable: "Medicines",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_UsedPrescriptions_AppUserId",
                table: "UsedPrescriptions",
                column: "AppUserId");

            migrationBuilder.CreateIndex(
                name: "IX_UsedPrescriptions_MedicineId",
                table: "UsedPrescriptions",
                column: "MedicineId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "UsedPrescriptions");
        }
    }
}
