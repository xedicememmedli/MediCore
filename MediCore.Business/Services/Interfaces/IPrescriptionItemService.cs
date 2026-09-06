using MediCore.Business.DTOs.PrescriptionItem;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCore.Business.Services.Interfaces
{
    public interface IPrescriptionItemService
    {
        Task<GetPrescriptionItemDto> CreateAsync(CreatePrescriptionItemDto dto);
        Task<List<GetPrescriptionItemDto>> GetAllAsync();
        Task<GetPrescriptionItemDto> GetByIdAsync(int id);
        Task UpdateAsync(UpdatePrescriptionItemDto dto);
        Task SoftDeleteAsync(int id);
        Task RestoreAsync(int id);
    }
}
