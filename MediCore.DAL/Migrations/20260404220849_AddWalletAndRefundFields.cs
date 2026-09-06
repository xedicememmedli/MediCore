using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MediCore.DAL.Migrations
{
    /// <inheritdoc />
    public partial class AddWalletAndRefundFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "CancelledAt",
                table: "Consultations",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsPendingRefund",
                table: "Consultations",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<decimal>(
                name: "PaidAmount",
                table: "Consultations",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "WalletBalance",
                table: "AspNetUsers",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CancelledAt",
                table: "Consultations");

            migrationBuilder.DropColumn(
                name: "IsPendingRefund",
                table: "Consultations");

            migrationBuilder.DropColumn(
                name: "PaidAmount",
                table: "Consultations");

            migrationBuilder.DropColumn(
                name: "WalletBalance",
                table: "AspNetUsers");
        }
    }
}
