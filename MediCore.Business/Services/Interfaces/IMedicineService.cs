using MediCore.Business.DTOs.Medicine;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCore.Business.Services.Interfaces
{
    public interface IMedicineService
    {
        Task<GetMedicineDto> CreateAsync(CreateMedicineDto medicineDto);
        Task DeleteAsync(int id);
        Task<List<GetMedicineDto>> GetAllAsync();
        Task<GetMedicineDto> GetByIdAsync(int id);
        Task SoftDeleteAsync(int id);
        Task UpdateAsync(UpdateMedicineDto medicineDto);
        Task RestoreAsync(int id);
    }
}
