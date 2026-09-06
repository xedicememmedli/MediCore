using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MediCore.DAL.Migrations
{
    /// <inheritdoc />
    public partial class ChangedNumberToIdInUsedPrescription : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PrescriptionNumber",
                table: "UsedPrescriptions");

            migrationBuilder.AddColumn<int>(
                name: "PrescriptionId",
                table: "UsedPrescriptions",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_UsedPrescriptions_PrescriptionId",
                table: "UsedPrescriptions",
                column: "PrescriptionId");

            migrationBuilder.AddForeignKey(
                name: "FK_UsedPrescriptions_Prescriptions_PrescriptionId",
                table: "UsedPrescriptions",
                column: "PrescriptionId",
                principalTable: "Prescriptions",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_UsedPrescriptions_Prescriptions_PrescriptionId",
                table: "UsedPrescriptions");

            migrationBuilder.DropIndex(
                name: "IX_UsedPrescriptions_PrescriptionId",
                table: "UsedPrescriptions");

            migrationBuilder.DropColumn(
                name: "PrescriptionId",
                table: "UsedPrescriptions");

            migrationBuilder.AddColumn<string>(
                name: "PrescriptionNumber",
                table: "UsedPrescriptions",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");
        }
    }
}
