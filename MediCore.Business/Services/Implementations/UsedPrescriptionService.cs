using AutoMapper;
using MediCore.Business.DTOs.UsedPrescription;
using MediCore.Business.Helpers.Exceptions.Common;
using MediCore.Business.Helpers.Exceptions.MedicineExceptions;
using MediCore.Business.Helpers.Exceptions.UsedPrescription;
using MediCore.Business.Helpers.Exceptions.UserExceptions;
using MediCore.Business.Services.Interfaces;
using MediCore.Core.Entities;
using MediCore.DAL.Repositories.Implementations;
using MediCore.DAL.Repositories.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCore.Business.Services.Implementations
{
    public class UsedPrescriptionService : IUsedPrescriptionService
    {
        readonly IUsedPrescriptionRepository _rep;
        readonly IPrescriptionRepository _prescriptionRep; 
        readonly UserManager<AppUser> _userManager;
        readonly IMedicineRepository _medicineRep;
        readonly IMapper _mapper;

        public UsedPrescriptionService(
            IUsedPrescriptionRepository rep,
            IPrescriptionRepository prescriptionRep, 
            UserManager<AppUser> userManager,
            IMedicineRepository medicineRep,
            IMapper mapper)
        {
            _rep = rep;
            _prescriptionRep = prescriptionRep; 
            _userManager = userManager;
            _medicineRep = medicineRep;
            _mapper = mapper;
        }

        public async Task<UsedPrescriptionGetDto> CreateAsync(UsedPrescriptionCreateDto dto)
        {
            // 1. Əgər bu klinikanın DİGİTAL reseptidirsə (PrescriptionId göndərilibsə)
            if (dto.PrescriptionId.HasValue && dto.PrescriptionId > 0)
            {
                var prescription = await _prescriptionRep
                    .FindAll(x => x.Id == dto.PrescriptionId && !x.IsDeleted)
                    .FirstOrDefaultAsync();

                if (prescription == null)
                    throw new Exception("Belə bir resept sistemdə mövcud deyil!");
            }

            // 2. ƏN VACİB HİSSƏ: Təkrar istifadənin (Fraud) qarşısını alırıq
            bool isAlreadyUsed = false;

            if (!string.IsNullOrEmpty(dto.DocumentNumber))
            {
                // Əgər kənardan yüklənən şəkildirsə (AI DocumentNumber tapıbsa), onu bazada axtarır
                isAlreadyUsed = await _rep.FindAll(x => x.DocumentNumber == dto.DocumentNumber && !x.IsDeleted).AnyAsync();
            }
            else if (dto.PrescriptionId.HasValue)
            {
                // Əgər daxili digital reseptdirsə, İD-yə görə yoxlayır
                isAlreadyUsed = await _rep.FindAll(x => x.PrescriptionId == dto.PrescriptionId && !x.IsDeleted).AnyAsync();
            }

            if (isAlreadyUsed)
                throw new Exception("Bu resept artıq istifadə olunub və yenidən istifadə edilə bilməz!");

            // 3. Əgər hər şey qaydasındadırsa, bazaya əlavə et
            var newUsedPrescription = _mapper.Map<UsedPrescription>(dto);

            await _rep.CreateAsync(newUsedPrescription);
            await _rep.SaveChangesAsync();

            return _mapper.Map<UsedPrescriptionGetDto>(newUsedPrescription);
        }
        public async Task<List<UsedPrescriptionGetDto>> GetAllAsync()
        {
            var items = await _rep.FindAll(x => !x.IsDeleted)
                                  .Include(x => x.Medicine)
                                  .ToListAsync();

            return _mapper.Map<List<UsedPrescriptionGetDto>>(items);
        }

        public async Task<UsedPrescriptionGetDto> GetByIdAsync(int id)
        {
            if (id <= 0) throw new NegativeIdException("Id mənfi ola bilməz!");

            var item = await _rep.FindAll(x => x.Id == id && !x.IsDeleted)
                                 .Include(x => x.Medicine)
                                 .FirstOrDefaultAsync();

            if (item == null) throw new UsedPrescriptionNotFoundException("Bu id-ye uyğun istifadə edilmiş resept tapılmadı!");

            return _mapper.Map<UsedPrescriptionGetDto>(item);
        }

        public async Task UpdateAsync(UsedPrescriptionUpdateDto dto)
        {
            if (dto.Id <= 0) throw new NegativeIdException("Id mənfi ola bilməz!");

            var item = await _rep.FindAll(x => x.Id == dto.Id && !x.IsDeleted).FirstOrDefaultAsync();
            if (item == null) throw new UsedPrescriptionNotFoundException("Yenilənməli olan istifadə edilmiş resept tapılmadı!");

            if (item.MedicineId != dto.MedicineId)
            {
                var medicine = await _medicineRep.FindAll(x => x.Id == dto.MedicineId && !x.IsDeleted).FirstOrDefaultAsync();
                if (medicine == null) throw new MedicineNotFoundException("Yeni seçilmiş dərman tapılmadı!");
            }

            if (item.AppUserId != dto.AppUserId)
            {
                var user = await _userManager.FindByIdAsync(dto.AppUserId);
                if (user == null) throw new UserNotFoundException("Yeni seçilmiş istifadəçi tapılmadı!");
            }

            _mapper.Map(dto, item);
            _rep.Update(item);
            await _rep.SaveChangesAsync();
        }

        public async Task SoftDeleteAsync(int id)
        {
            if (id <= 0) throw new NegativeIdException("Id mənfi ola bilməz!");

            var item = await _rep.FindAll(x => x.Id == id && !x.IsDeleted).FirstOrDefaultAsync();
            if (item == null) throw new UsedPrescriptionNotFoundException("Silinməli olan istifadə edilmiş resept tapılmadı!");

            _rep.SoftDelete(item);
            await _rep.SaveChangesAsync();
        }

        public async Task RestoreAsync(int id)
        {
            var deletedEntity = await _rep
                                .FindAll(x => x.Id == id && x.IsDeleted == true)
                                .FirstOrDefaultAsync();

            if (deletedEntity == null)
            {
                throw new Exception("Arxivdə belə bir məlumat tapılmadı!");
            }

            _rep.Restore(deletedEntity);
            await _rep.SaveChangesAsync();
        }
    }
}

