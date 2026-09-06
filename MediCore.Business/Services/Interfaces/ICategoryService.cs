using MediCore.Business.DTOs.Category;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCore.Business.Services.Interfaces
{
    public interface ICategoryService
    {
        Task<GetCategoryDto> CreateAsync(CreateCategoryDto categoryDto);
        Task<GetCategoryDto> GetByIdAsync(int id);
        Task<List<GetCategoryDto>> GetAllAsync();
        Task UpdateAsync(UpdateCategoryDto categoryDto);
        Task DeleteAsync(int id);
        Task SoftDeleteAsync(int id);
        Task RestoreAsync(int id);
    }
}
