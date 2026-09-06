using MediCore.Business.DTOs.Basket;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCore.Business.Services.Interfaces
{
    public interface IBasketService
    {
        Task<GetBasketDto> GetByIdAsync(int id);
        Task<List<GetAllBasketDto>> GetAllAsync();
        Task<List<string>> AddFromPrescriptionAsync(int prescriptionId, string appUserId);
    }
}
