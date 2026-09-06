using AutoMapper;
using MediCore.Business.DTOs.Specialty;
using MediCore.Business.Helpers.Exceptions.Common;
using MediCore.Business.Helpers.Exceptions.Specialty;
using MediCore.Business.Services.Interfaces;
using MediCore.Core.Entities;
using MediCore.DAL.Repositories.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace MediCore.Business.Services.Implementations
{
    public class SpecialtyService : ISpecialtyService
    {
         readonly ISpecialtyRepository _repository;
         readonly IMapper _mapper;

        public SpecialtyService(ISpecialtyRepository repository, IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        public async Task CreateAsync(CreateSpecialtyDto dto)
        {
            var existSpecialty = await _repository.FindAll(x => x.Name.ToLower() == dto.Name.ToLower() && x.IsDeleted == false).FirstOrDefaultAsync();
            if (existSpecialty != null) throw new SpecialtyNameExistException("Bu adda ixtisas artıq mövcuddur!");

            var specialty = _mapper.Map<Specialty>(dto);
            await _repository.CreateAsync(specialty);
            await _repository.SaveChangesAsync();
        }

        public async Task<List<GetAllSpecialtyDto>> GetAllAsync()
        {
            var specialties = await _repository.FindAll(x => x.IsDeleted == false).ToListAsync();
            return _mapper.Map<List<GetAllSpecialtyDto>>(specialties);
        }

        public async Task<GetSpecialtyDto> GetByIdAsync(int id)
        {
            if (id <= 0) throw new NegativeIdException("Id mənfi ola bilməz!");

            var specialty = await _repository.FindAll(x => x.Id == id && x.IsDeleted == false).FirstOrDefaultAsync();
            if (specialty == null) throw new SpecialtyNotFoundException("Ixtisas tapılmadı!");

            return _mapper.Map<GetSpecialtyDto>(specialty);
        }

        public async Task UpdateAsync(UpdateSpecialtyDto dto)
        {
            var specialty = await _repository.FindAll(x => x.Id == dto.Id && x.IsDeleted == false).FirstOrDefaultAsync();
            if (specialty == null) throw new SpecialtyNotFoundException("Yenilənməli olan ixtisas tapılmadı!");

            var existName = await _repository.FindAll(x => x.Name.ToLower() == dto.Name.ToLower() && x.Id != dto.Id && x.IsDeleted == false).FirstOrDefaultAsync();
            if (existName != null) throw new SpecialtyNameExistException("Bu adda ixtisas artıq mövcuddur!");

            _mapper.Map(dto, specialty);
            _repository.Update(specialty);
            await _repository.SaveChangesAsync();
        }

        public async Task SoftDeleteAsync(int id)
        {
            if (id <= 0) throw new NegativeIdException("Id mənfi ola bilməz!");

            var specialty = await _repository.FindAll(x => x.Id == id && x.IsDeleted == false).FirstOrDefaultAsync();
            if (specialty == null) throw new SpecialtyNotFoundException("Silinməli olan ixtisas tapılmadı!");

            _repository.SoftDelete(specialty);
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
