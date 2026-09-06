using MediCore.Business.DTOs.Doctor;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCore.Business.Services.Interfaces
{
    public interface IDoctorService
    {
        Task<GetDoctorDto> CreateAsync(CreateDoctorDto dto);
        Task<List<GetAllDoctorDto>> GetAllAsync();
        Task<GetDoctorDto> GetByIdAsync(int id);
        Task UpdateAsync(UpdateDoctorDto dto);
        Task SoftDeleteAsync(int id);
        Task RestoreAsync(int id);
    }
}
