using MediCore.Business.DTOs.Courier;
using MediCore.Business.DTOs.Order;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCore.Business.Services.Interfaces
{
    public interface ICourierService
    {
        Task CreateAsync(CreateCourierDto dto);
        Task<List<GetCourierDto>> GetAllAsync();
        Task<GetCourierDto> GetByIdAsync(int id);
        Task UpdateAsync(UpdateCourierDto dto);
        Task SoftDeleteAsync(int id);
        Task RestoreAsync(int id);
        Task TakeOrderAsync(int courierId, int orderId);
        Task<List<GetOrderDto>> GetCourierOrdersAsync(int courierId);
    }
}
