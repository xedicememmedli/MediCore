using AutoMapper;
using MediCore.Business.DTOs.PrescriptionItem;
using MediCore.Business.Helpers.Exceptions.Common;
using MediCore.Business.Helpers.Exceptions.MedicineExceptions;
using MediCore.Business.Helpers.Exceptions.Prescription;
using MediCore.Business.Services.Interfaces;
using MediCore.Core.Entities;
using MediCore.DAL.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace MediCore.Business.Services.Implementations
{
    public class PrescriptionItemService : IPrescriptionItemService
    {
        readonly IPrescriptionItemRepository _rep;
        readonly IPrescriptionRepository _prescriptionRep;
        readonly IMedicineRepository _medicineRep;
        readonly IMapper _mapper;

        public PrescriptionItemService(
            IPrescriptionItemRepository rep,
            IPrescriptionRepository prescriptionRep,
            IMedicineRepository medicineRep,
            IMapper mapper)
        {
            _rep = rep;
            _prescriptionRep = prescriptionRep;
            _medicineRep = medicineRep;
            _mapper = mapper;
        }

        public async Task<GetPrescriptionItemDto> CreateAsync(CreatePrescriptionItemDto dto)
        {
            var prescription = await _prescriptionRep.FindAll(x => x.Id == dto.PrescriptionId && !x.IsDeleted).FirstOrDefaultAsync();
            if (prescription == null) throw new PrescriptionNotFoundException("Axtarılan resept tapılmadı!");

            var medicine = await _medicineRep.FindAll(x => x.Id == dto.MedicineId && !x.IsDeleted).FirstOrDefaultAsync();
            if (medicine == null) throw new MedicineNotFoundException("Axtarılan dərman tapılmadı!");

            var newItem = _mapper.Map<PrescriptionItem>(dto);

            var createdItem = await _rep.CreateAsync(newItem);
            await _rep.SaveChangesAsync();

            return _mapper.Map<GetPrescriptionItemDto>(createdItem);
        }

        public async Task<List<GetPrescriptionItemDto>> GetAllAsync()
        {
            var items = await _rep.FindAll(x => !x.IsDeleted)
                                  .Include(x => x.Medicine)
                                  .Include(x => x.Prescription)
                                  .ToListAsync();

            return _mapper.Map<List<GetPrescriptionItemDto>>(items);
        }

        public async Task<GetPrescriptionItemDto> GetByIdAsync(int id)
        {
            if (id <= 0) throw new NegativeIdException("Id mənfi ola bilməz!");

            var item = await _rep.FindAll(x => x.Id == id && !x.IsDeleted)
                                 .Include(x => x.Medicine)
                                 .Include(x => x.Prescription)
                                 .FirstOrDefaultAsync();

            if (item == null) throw new PrescriptionItemNotFoundException("Bu id-ye uyğun resept detalı tapılmadı!");

            return _mapper.Map<GetPrescriptionItemDto>(item);
        }

        public async Task UpdateAsync(UpdatePrescriptionItemDto dto)
        {
            if (dto.Id <= 0) throw new NegativeIdException("Id mənfi ola bilməz!");

            var item = await _rep.FindAll(x => x.Id == dto.Id && !x.IsDeleted).FirstOrDefaultAsync();
            if (item == null) throw new PrescriptionItemNotFoundException("Yenilənmeli olan resept detalı tapılmadı!");

            if (item.MedicineId != dto.MedicineId)
            {
                var medicine = await _medicineRep.FindAll(x => x.Id == dto.MedicineId && !x.IsDeleted).FirstOrDefaultAsync();
                if (medicine == null) throw new MedicineNotFoundException("Yeni seçilmiş dərman tapılmadı!");
            }

            _mapper.Map(dto, item);
            _rep.Update(item);
            await _rep.SaveChangesAsync();
        }

        public async Task SoftDeleteAsync(int id)
        {
            if (id <= 0) throw new NegativeIdException("Id menfi ola bilmez!");

            var item = await _rep.FindAll(x => x.Id == id && !x.IsDeleted).FirstOrDefaultAsync();
            if (item == null) throw new PrescriptionItemNotFoundException("Silinmeli olan resept detali tapilmadi!");

            _rep.SoftDelete(item);
            await _rep.SaveChangesAsync();
        }

        public async Task RestoreAsync(int id)
        {
            // BUG DÜZƏLDİLDİ: əvvəl _prescriptionRep istifadə olunurdu — bu PrescriptionItem-i deyil, Prescription-ı restore edirdi!
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
