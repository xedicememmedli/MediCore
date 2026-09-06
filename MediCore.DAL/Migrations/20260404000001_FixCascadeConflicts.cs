using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MediCore.DAL.Migrations
{
    /// <summary>
    /// Configuration fayllarındakı düzəlişlərə uyğun olaraq DB-dəki FK cascade
    /// davranışlarının sinxronlaşdırılması.
    ///
    /// Düzəldilən FK-lar:
    ///  1. FK_Medicines_AspNetUsers_AppUserId         : Cascade → Restrict
    ///  2. FK_OrderItems_Medicines_MedicineId         : Cascade → NoAction
    ///  3. FK_Consultations_Doctors_DoctorId          : Cascade → NoAction
    /// </summary>
    public partial class FixCascadeConflicts : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // 1) Medicines → AppUser: Cascade → Restrict
            migrationBuilder.DropForeignKey(
                name: "FK_Medicines_AspNetUsers_AppUserId",
                table: "Medicines");

            migrationBuilder.AddForeignKey(
                name: "FK_Medicines_AspNetUsers_AppUserId",
                table: "Medicines",
                column: "AppUserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            // 2) OrderItems → Medicines: Cascade → NoAction
            migrationBuilder.DropForeignKey(
                name: "FK_OrderItems_Medicines_MedicineId",
                table: "OrderItems");

            migrationBuilder.AddForeignKey(
                name: "FK_OrderItems_Medicines_MedicineId",
                table: "OrderItems",
                column: "MedicineId",
                principalTable: "Medicines",
                principalColumn: "Id",
                onDelete: ReferentialAction.NoAction);

            // 3) Consultations → Doctors: Cascade → NoAction
            //    (Cascade buraxılsa: Doctor silinir → Consultation silinir → ChatMessage silinir
            //     Bu tarixçənin itirilməsinə və gözlənilməz cascade zəncirinə səbəb olar)
            migrationBuilder.DropForeignKey(
                name: "FK_Consultations_Doctors_DoctorId",
                table: "Consultations");

            migrationBuilder.AddForeignKey(
                name: "FK_Consultations_Doctors_DoctorId",
                table: "Consultations",
                column: "DoctorId",
                principalTable: "Doctors",
                principalColumn: "Id",
                onDelete: ReferentialAction.NoAction);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Medicines_AspNetUsers_AppUserId",
                table: "Medicines");

            migrationBuilder.AddForeignKey(
                name: "FK_Medicines_AspNetUsers_AppUserId",
                table: "Medicines",
                column: "AppUserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.DropForeignKey(
                name: "FK_OrderItems_Medicines_MedicineId",
                table: "OrderItems");

            migrationBuilder.AddForeignKey(
                name: "FK_OrderItems_Medicines_MedicineId",
                table: "OrderItems",
                column: "MedicineId",
                principalTable: "Medicines",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.DropForeignKey(
                name: "FK_Consultations_Doctors_DoctorId",
                table: "Consultations");

            migrationBuilder.AddForeignKey(
                name: "FK_Consultations_Doctors_DoctorId",
                table: "Consultations",
                column: "DoctorId",
                principalTable: "Doctors",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
