using AutoMapper;
using MediCore.Business.DTOs.Category;
using MediCore.Business.DTOs.Medicine;
using MediCore.Business.Helpers.Exceptions.Common;
using MediCore.Business.Helpers.Exceptions.MedicineExceptions;
using MediCore.Business.Services.Interfaces;
using MediCore.Core.Entities;
using MediCore.DAL.Repositories.Implementations;
using MediCore.DAL.Repositories.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;


namespace MediCore.Business.Services.Implementations
{
    public class MedicineService : IMedicineService
    {
        readonly IMedicineRepository _rep;
        readonly IMapper _mapper;
        readonly IHttpContextAccessor _httpContext;
        readonly IPhotoService _photoService;

        public MedicineService(IMedicineRepository rep, IMapper mapper, IHttpContextAccessor httpContext, IPhotoService photoService)
        {
            _rep = rep;
            _mapper = mapper;
            _httpContext = httpContext;
            _photoService = photoService;
        }

        public async Task<GetMedicineDto> CreateAsync(CreateMedicineDto medicineDto)
        {
            if (await _rep.IsExsist(m => m.Name.ToLower() == medicineDto.Name.ToLower() && m.IsDeleted == false))
            {
                throw new MedicineNameExistException("Bu adda dərman artıq mövcuddur!");
            }

            var medicine = _mapper.Map<Medicine>(medicineDto);

            var userId = _httpContext.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) throw new UnauthorizedAccessException("İstifadəçi sistemə daxil olmayıb!");

            medicine.AppUserId = userId;

            // 1. ŞƏKİL YÜKLƏMƏ MƏNTİQİ (CREATE)
            if (medicineDto.Photo != null)
            {
                var uploadResult = await _photoService.AddPhotoAsync(medicineDto.Photo);
                if (uploadResult.Error != null)
                {
                    throw new Exception($"Şəkil yüklənərkən xəta baş verdi: {uploadResult.Error.Message}");
                }

                medicine.ImageUrl = uploadResult.SecureUrl.ToString();
                medicine.ImagePublicId = uploadResult.PublicId; // Buluddan silmək üçün bu mütləqdir
            }

            if (medicineDto.CategoryIds != null && medicineDto.CategoryIds.Any())
            {
                medicine.MedicinesCategories = medicineDto.CategoryIds.Select(catId => new MedicinesCategories
                {
                    CategoryId = catId
                }).ToList();
            }

            await _rep.CreateAsync(medicine);
            await _rep.SaveChangesAsync();

            var createdMedicine = await _rep.FindAll(x => x.Id == medicine.Id)
     .Include(m => m.MedicinesCategories)
     .ThenInclude(mc => mc.Category)
     .FirstOrDefaultAsync();

            // Bura diqqət: GetMedicineDto-nun içindəki Categories-in dolduğundan əmin oluruq
            var dto = _mapper.Map<GetMedicineDto>(createdMedicine);

            if (createdMedicine.MedicinesCategories != null)
            {
                dto.Categories = createdMedicine.MedicinesCategories
                    .Select(mc => _mapper.Map<GetCategoryDto>(mc.Category))
                    .ToList();
            }

            return dto;
        }

        public async Task UpdateAsync(UpdateMedicineDto medicineDto)
        {
            if (medicineDto.Id <= 0) throw new NegativeIdException("Id mənfi ola bilməz!");

            var medicine = await _rep.FindAll(x => x.Id == medicineDto.Id && x.IsDeleted == false).FirstOrDefaultAsync();
            if (medicine == null) throw new NotFoundException<Medicine>("Yenilənməli olan dərman tapılmadı!");

            if (await _rep.IsExsist(m => m.Name.ToLower() == medicineDto.Name.ToLower() && m.Id != medicineDto.Id && m.IsDeleted == false))
            {
                throw new MedicineNameExistException("Bu adda dərman artıq mövcuddur!");
            }

            _mapper.Map(medicineDto, medicine);

            if (medicineDto.Photo != null)
            {
                if (!string.IsNullOrEmpty(medicine.ImagePublicId))
                {
                    await _photoService.DeletePhotoAsync(medicine.ImagePublicId);
                }

                var uploadResult = await _photoService.AddPhotoAsync(medicineDto.Photo);
                if (uploadResult.Error != null)
                {
                    throw new Exception($"Şəkil yenilənərkən xəta baş verdi: {uploadResult.Error.Message}");
                }

                medicine.ImageUrl = uploadResult.SecureUrl.ToString();
                medicine.ImagePublicId = uploadResult.PublicId;
            }

            _rep.Update(medicine);
            await _rep.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            if (id <= 0) throw new NegativeIdException("Id mənfi ola bilməz!");

            var medicine = await _rep.FindAll(x => x.Id == id).FirstOrDefaultAsync();
            if (medicine == null) throw new NotFoundException<Medicine>("Dərman tapılmadı!");

            // Əgər bazadan tam silinirsə, şəkli də buluddan silmək yaxşı olar
            if (!string.IsNullOrEmpty(medicine.ImagePublicId))
            {
                await _photoService.DeletePhotoAsync(medicine.ImagePublicId);
            }

            _rep.Delete(medicine);
            await _rep.SaveChangesAsync();
        }

        public async Task<List<GetMedicineDto>> GetAllAsync()
        {
            var medicines = await _rep.FindAll(x => x.IsDeleted == false)
                                      .Include(m => m.MedicinesCategories)
                                      .ThenInclude(mc => mc.Category)
                                      .ToListAsync();

            return _mapper.Map<List<GetMedicineDto>>(medicines);
        }

        public async Task<GetMedicineDto> GetByIdAsync(int id)
        {
            if (id <= 0) throw new NegativeIdException("Id mənfi ola bilməz!");

            var medicine = await _rep.FindAll(x => x.Id == id && x.IsDeleted == false)
                                      .Include(m => m.MedicinesCategories)
                                      .ThenInclude(mc => mc.Category)
                                      .FirstOrDefaultAsync();

            if (medicine == null) throw new NotFoundException<Medicine>("Dərman tapılmadı!");

            GetMedicineDto dto = _mapper.Map<GetMedicineDto>(medicine);
            dto.Categories = _mapper.Map<List<GetCategoryDto>>(medicine.MedicinesCategories.Select(mc => mc.Category));

            return dto;
        }

        public async Task SoftDeleteAsync(int id)
        {
            if (id <= 0) throw new NegativeIdException("Id mənfi ola bilməz!");

            var medicine = await _rep.FindAll(x => x.Id == id && x.IsDeleted == false).FirstOrDefaultAsync();
            if (medicine == null) throw new NotFoundException<Medicine>("Silinməli olan dərman tapılmadı!");

            _rep.SoftDelete(medicine);
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