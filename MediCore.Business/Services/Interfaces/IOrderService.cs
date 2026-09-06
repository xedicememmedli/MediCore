using MediCore.Business.DTOs.Order;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCore.Business.Services.Interfaces
{
    public interface IOrderService
    {
        Task<(string Message, string? PaymentUrl)> CreateAsync(CreateOrderDto dto);
        Task<List<GetOrderDto>> GetAllAsync();
        Task<GetOrderDto> GetByIdAsync(int id);
        Task UpdateStatusAsync(UpdateOrderStatusDto dto);
        Task SoftDeleteAsync(int id);
        Task RestoreAsync(int id);
        Task AssignCourierAsync(int orderId);
        Task<bool> ConfirmPaymentAsync(int orderId);
        Task ConfirmPaymentFromWebhookAsync(int orderId);
        Task<List<GetOrderDto>> GetPendingOrdersAsync();
    }
}