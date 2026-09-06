using MediCore.Business.DTOs.LabResultDetailDto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCore.Business.Services.Interfaces
{
    public interface ILabResultDetailService
    {
        Task UpdateAsync(UpdateLabResultDetailDto dto);
        Task SoftDeleteAsync(int id);
        Task RestoreAsync(int id);
    }
}
