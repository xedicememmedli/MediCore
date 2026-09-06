using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MediCore.DAL.Migrations
{
    /// <inheritdoc />
    public partial class AddScheduledTime_To_Consultation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "ScheduledTime",
                table: "Consultations",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ScheduledTime",
                table: "Consultations");
        }
    }
}
