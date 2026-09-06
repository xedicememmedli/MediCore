using AutoMapper;
using MediCore.Business.DTOs.Category;
using MediCore.Business.Helpers.Exceptions.CategoryExceptions;
using MediCore.Business.Helpers.Exceptions.Common;
using MediCore.Business.Services.Interfaces;
using MediCore.Core.Entities;
using MediCore.DAL.Repositories.Implementations;
using MediCore.DAL.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace MediCore.Business.Services.Implementations
{
    public class CategoryService : ICategoryService
    {
        readonly ICategoryRepository _rep;
        readonly IMapper _mapper;
        readonly IPhotoService _photoService; 

        public CategoryService(ICategoryRepository rep, IMapper mapper, IPhotoService photoService)
        {
            _rep = rep;
            _mapper = mapper;
            _photoService = photoService;
        }

        public async Task<GetCategoryDto> CreateAsync(CreateCategoryDto categoryDto)
        {
            if (await _rep.IsExsist(c => c.Name.ToLower() == categoryDto.Name.ToLower() && c.IsDeleted == false))
            {
                throw new CategoryNameExsistException();
            }

            var category = _mapper.Map<Category>(categoryDto);

            if (categoryDto.Photo != null)
            {
                var uploadResult = await _photoService.AddPhotoAsync(categoryDto.Photo);
                if (uploadResult.Error != null)
                {
                    throw new Exception($"Şəkil yüklənərkən xəta: {uploadResult.Error.Message}");
                }

                category.ImageUrl = uploadResult.SecureUrl.ToString();
                category.ImagePublicId = uploadResult.PublicId;
            }

            var newCategory = await _rep.CreateAsync(category);
            await _rep.SaveChangesAsync();

            return _mapper.Map<GetCategoryDto>(newCategory);
        }

        public async Task UpdateAsync(UpdateCategoryDto categoryDto)
        {
            var category = await _rep.FindAll(x => x.Id == categoryDto.Id && x.IsDeleted == false).FirstOrDefaultAsync();

            if (category == null) throw new CategoryNullException();

            if (await _rep.IsExsist(c => c.Name.ToLower() == categoryDto.Name.ToLower() && c.Id != categoryDto.Id && c.IsDeleted == false))
            {
                throw new CategoryNameExsistException();
            }

            _mapper.Map(categoryDto, category);

            if (categoryDto.Photo != null)
            {
                if (!string.IsNullOrEmpty(category.ImagePublicId))
                {
                    await _photoService.DeletePhotoAsync(category.ImagePublicId);
                }

                var uploadResult = await _photoService.AddPhotoAsync(categoryDto.Photo);
                if (uploadResult.Error != null)
                {
                    throw new Exception($"Şəkil yenilənərkən xəta: {uploadResult.Error.Message}");
                }

                category.ImageUrl = uploadResult.SecureUrl.ToString();
                category.ImagePublicId = uploadResult.PublicId;
            }

            _rep.Update(category);
            await _rep.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            if (id <= 0) throw new NegativeIdException();

            var category = await _rep.FindAll(x => x.Id == id).FirstOrDefaultAsync();
            if (category == null) throw new CategoryNullException();

            // Hard delete zamanı şəkli də buluddan təmizləyirik
            if (!string.IsNullOrEmpty(category.ImagePublicId))
            {
                await _photoService.DeletePhotoAsync(category.ImagePublicId);
            }

            _rep.Delete(category);
            await _rep.SaveChangesAsync();
        }

        public async Task<List<GetCategoryDto>> GetAllAsync()
        {
            var datas = await _rep.FindAll(x => x.IsDeleted == false).ToListAsync();
            return _mapper.Map<List<GetCategoryDto>>(datas);
        }

        public async Task<GetCategoryDto> GetByIdAsync(int id)
        {
            if (id <= 0) throw new NegativeIdException();

            var category = await _rep.FindAll(x => x.Id == id && x.IsDeleted == false).FirstOrDefaultAsync();
            if (category == null) throw new CategoryNullException();

            return _mapper.Map<GetCategoryDto>(category);
        }

        public async Task SoftDeleteAsync(int id)
        {
            var category = await _rep.FindAll(x => x.Id == id && x.IsDeleted == false).FirstOrDefaultAsync();
            if (category == null) throw new CategoryNullException();

            _rep.SoftDelete(category);
            await _rep.SaveChangesAsync();
        }

        public async Task RestoreAsync(int id)
        {
            var deletedEntity = await _rep
                                    .FindAll(x => x.Id == id && x.IsDeleted == true)
                                    .FirstOrDefaultAsync();

            if (deletedEntity == null) throw new Exception("Arxivdə belə bir məlumat tapılmadı!");

            _rep.Restore(deletedEntity);
            await _rep.SaveChangesAsync();
        }
    }
}