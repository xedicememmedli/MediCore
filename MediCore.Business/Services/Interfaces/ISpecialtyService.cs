using MediCore.Business.DTOs.Specialty;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCore.Business.Services.Interfaces
{
    public interface ISpecialtyService
    {
        Task CreateAsync(CreateSpecialtyDto dto);
        Task<List<GetAllSpecialtyDto>> GetAllAsync();
        Task<GetSpecialtyDto> GetByIdAsync(int id);
        Task UpdateAsync(UpdateSpecialtyDto dto);
        Task SoftDeleteAsync(int id);
        Task RestoreAsync(int id);
    }
}
