using MediCore.Business.DTOs.LabResult;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCore.Business.Services.Interfaces
{
    public interface ILabResultService
    {
        Task CreateAsync(CreateLabResultDto dto);
        Task<List<GetAllLabResultDto>> GetAllAsync();
        Task<GetLabResultDto> GetByIdAsync(int id);
        Task UpdateAsync(UpdateLabResultDto dto);
        Task SoftDeleteAsync(int id);
        Task RestoreAsync(int id);
    }
}
