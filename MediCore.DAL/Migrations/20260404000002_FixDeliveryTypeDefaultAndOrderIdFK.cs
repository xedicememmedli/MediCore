using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MediCore.DAL.Migrations
{
    /// <summary>
    /// İki problemi düzəldir:
    ///
    /// 1. PaymentAndOrderUpdates migration-ı DeliveryType sütununu defaultValue:0 ilə
    ///    yaratdı. Lakin DeliveryType enum-unda City=1, Region=2 var — 0 dəyəri mövcud
    ///    deyil. Mövcud bütün sıralar invalid enum dəyəri ilə qalmışdı.
    ///    Həll: DeliveryType=0 olan bütün sıralar City(1) kimi yenilənir.
    ///
    /// 2. AddedNotificationTable migration-ı Notifications cədvəlində OrderId sütunu
    ///    yaratdı amma FK constraint əlavə etmədi. Silinmiş bir Order-ə aid
    ///    Notification-lar "orphan" qalırdı.
    ///    Həll: OrderId üçün FK əlavə edilir (NoAction — Order silinəndə bildiriş qalsın).
    /// </summary>
    public partial class FixDeliveryTypeDefaultAndOrderIdFK : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // 1) DeliveryType=0 olan mövcud sıralar City(1) edilir
            migrationBuilder.Sql(
                "UPDATE Orders SET DeliveryType = 1 WHERE DeliveryType = 0");

            // 2) Notifications.OrderId üçün FK əlavə edilir
            migrationBuilder.AddForeignKey(
                name: "FK_Notifications_Orders_OrderId",
                table: "Notifications",
                column: "OrderId",
                principalTable: "Orders",
                principalColumn: "Id",
                onDelete: ReferentialAction.NoAction); // Order silinəndə bildiriş qalsın
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Notifications_Orders_OrderId",
                table: "Notifications");

            // DeliveryType fix geri qaytarılmır — 0 invalid dəyərə qayıtmaq məntiqsizdir
        }
    }
}
