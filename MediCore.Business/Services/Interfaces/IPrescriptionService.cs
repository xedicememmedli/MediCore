using MediCore.Business.DTOs.Prescription;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCore.Business.Services.Interfaces
{
    public interface IPrescriptionService
    {
        Task CreateAsync(CreatePrescriptionDto dto);
        Task<List<GetAllPrescriptionDto>> GetAllAsync(); // Xesteye aid reseptler
        Task<GetPrescriptionDto> GetByIdAsync(int id);
        Task UpdateAsync(UpdatePrescriptionDto dto);
        Task SoftDeleteAsync(int id);
        Task RestoreAsync(int id);
    }
}
