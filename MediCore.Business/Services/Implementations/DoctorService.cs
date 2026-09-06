using AutoMapper;
using MediCore.Business.DTOs.Doctor;
using MediCore.Business.Helpers.Exceptions.Common;
using MediCore.Business.Helpers.Exceptions.Doctor;
using MediCore.Business.Helpers.Exceptions.Specialty;
using MediCore.Business.Services.Interfaces;
using MediCore.Core.Entities;
using MediCore.DAL.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;


namespace MediCore.Business.Services.Implementations
{
    public class DoctorService : IDoctorService
    {
        readonly IDoctorRepository _repository;
        readonly ISpecialtyRepository _specialtyRepository;
        readonly IMapper _mapper;
        readonly IPhotoService _photoService;

        public DoctorService(
            IDoctorRepository repository,
            ISpecialtyRepository specialtyRepository,
            IMapper mapper,
            IPhotoService photoService) 
        {
            _repository = repository;
            _specialtyRepository = specialtyRepository;
            _mapper = mapper;
            _photoService = photoService;
        }

        public async Task<GetDoctorDto> CreateAsync(CreateDoctorDto dto)
        {
            var specialty = await _specialtyRepository.FindAll(x => x.Id == dto.SpecialtyId && x.IsDeleted == false).FirstOrDefaultAsync();
            if (specialty == null) throw new SpecialtyNotFoundException("Axtarılan ixtisas tapılmadı!");

            var doctor = _mapper.Map<Doctor>(dto);

            if (dto.Photo != null)
            {
                var uploadResult = await _photoService.AddPhotoAsync(dto.Photo);
                if (uploadResult.Error != null)
                {
                    throw new Exception($"Həkim şəkli yüklənərkən xəta: {uploadResult.Error.Message}");
                }

                doctor.ImageUrl = uploadResult.SecureUrl.ToString();
                doctor.ImagePublicId = uploadResult.PublicId;
            }

            await _repository.CreateAsync(doctor);
            await _repository.SaveChangesAsync();

            var createdDoctor = await _repository.FindAll(x => x.Id == doctor.Id)
                                                 .Include(x => x.Specialty)
                                                 .Include(x => x.AppUser)
                                                 .FirstOrDefaultAsync();

            return _mapper.Map<GetDoctorDto>(createdDoctor);
        }

        public async Task<List<GetAllDoctorDto>> GetAllAsync()
        {
            var doctors = await _repository.FindAll(x => x.IsDeleted == false)
                .Include(x => x.Specialty)
                .Include(x => x.AppUser)
                .ToListAsync();

            return _mapper.Map<List<GetAllDoctorDto>>(doctors);
        }

        public async Task<GetDoctorDto> GetByIdAsync(int id)
        {
            if (id <= 0) throw new NegativeIdException("Id mənfi ola bilməz!");

            var doctor = await _repository.FindAll(x => x.Id == id && x.IsDeleted == false)
                .Include(x => x.Specialty)
                .Include(x => x.AppUser)
                .FirstOrDefaultAsync();

            if (doctor == null) throw new DoctorNotFoundException("Həkim tapılmadı!");

            return _mapper.Map<GetDoctorDto>(doctor);
        }

        public async Task UpdateAsync(UpdateDoctorDto dto)
        {
            var doctor = await _repository.FindAll(x => x.Id == dto.Id && x.IsDeleted == false).FirstOrDefaultAsync();
            if (doctor == null) throw new DoctorNotFoundException("Yenilənməli olan həkim tapılmadı!");

            var specialty = await _specialtyRepository.FindAll(x => x.Id == dto.SpecialtyId && x.IsDeleted == false).FirstOrDefaultAsync();
            if (specialty == null) throw new SpecialtyNotFoundException("Axtarılan ixtisas tapılmadı!");

            _mapper.Map(dto, doctor);

            if (dto.Photo != null)
            {
                if (!string.IsNullOrEmpty(doctor.ImagePublicId))
                {
                    await _photoService.DeletePhotoAsync(doctor.ImagePublicId);
                }

                var uploadResult = await _photoService.AddPhotoAsync(dto.Photo);
                if (uploadResult.Error != null)
                {
                    throw new Exception($"Həkim şəkli yenilənərkən xəta: {uploadResult.Error.Message}");
                }

                doctor.ImageUrl = uploadResult.SecureUrl.ToString();
                doctor.ImagePublicId = uploadResult.PublicId;
            }

            _repository.Update(doctor);
            await _repository.SaveChangesAsync();
        }

        public async Task SoftDeleteAsync(int id)
        {
            if (id <= 0) throw new NegativeIdException("Id mənfi ola bilməz!");

            var doctor = await _repository.FindAll(x => x.Id == id && x.IsDeleted == false).FirstOrDefaultAsync();
            if (doctor == null) throw new DoctorNotFoundException("Silinməli olan həkim tapılmadı!");

            _repository.SoftDelete(doctor);
            await _repository.SaveChangesAsync();
        }

        public async Task RestoreAsync(int id)
        {
            var deletedEntity = await _repository
                                 .FindAll(x => x.Id == id && x.IsDeleted == true)
                                 .FirstOrDefaultAsync();

            if (deletedEntity == null)
            {
                throw new Exception("Arxivdə belə bir məlumat tapılmadı!");
            }

            _repository.Restore(deletedEntity);

            await _repository.SaveChangesAsync();
        }
    }
}
