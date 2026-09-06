using MediCore.Business.DTOs.UsedPrescription;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCore.Business.Services.Interfaces
{
    public interface IUsedPrescriptionService
    {
        Task<UsedPrescriptionGetDto> CreateAsync(UsedPrescriptionCreateDto dto);
        Task<List<UsedPrescriptionGetDto>> GetAllAsync();
        Task<UsedPrescriptionGetDto> GetByIdAsync(int id);
        Task UpdateAsync(UsedPrescriptionUpdateDto dto);
        Task SoftDeleteAsync(int id);
        Task RestoreAsync(int id);
    }
}
