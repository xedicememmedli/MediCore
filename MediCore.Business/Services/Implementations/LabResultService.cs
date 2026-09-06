using AutoMapper;
using Hangfire;
using MediCore.Business.DTOs.LabResult;
using MediCore.Business.Helpers.Exceptions.Common;
using MediCore.Business.Helpers.Exceptions.LabResult;
using MediCore.Business.Services.Interfaces;
using MediCore.Core.Entities;
using MediCore.DAL.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCore.Business.Services.Implementations
{
    public class LabResultService : ILabResultService
    {
        readonly ILabResultRepository _repository; 
        readonly IMapper _mapper;

        public LabResultService(ILabResultRepository repository, IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        public async Task CreateAsync(CreateLabResultDto dto)
        {
            var labResult = _mapper.Map<LabResult>(dto);

            labResult.Status = 0;
            labResult.TestDate = DateTime.UtcNow; 

            await _repository.CreateAsync(labResult);
            await _repository.SaveChangesAsync();
        }

        public async Task<List<GetAllLabResultDto>> GetAllAsync()
        {
            var labResults = await _repository.FindAll(x => x.IsDeleted == false)
                .Include(x => x.Patient) 
                .Include(x => x.Doctor)  
                .Include(x => x.Details) 
                .ToListAsync();

            return _mapper.Map<List<GetAllLabResultDto>>(labResults);
        }

        public async Task<GetLabResultDto> GetByIdAsync(int id)
        {
            if (id <= 0) throw new NegativeIdException("Id mənfi ola bilməz!");

            var labResult = await _repository.FindAll(x => x.Id == id && x.IsDeleted == false)
                .Include(x => x.Patient)
                .Include(x => x.Doctor)
                .Include(x => x.Details)
                .FirstOrDefaultAsync();

            if (labResult == null) throw new LabResultNotFoundException("Laboratoriya nəticəsi tapılmadı!");

            return _mapper.Map<GetLabResultDto>(labResult);
        }

        public async Task UpdateAsync(UpdateLabResultDto dto)
        {
            if (dto.Id <= 0) throw new NegativeIdException("Id mənfi ola bilməz!");

            var labResult = await _repository.FindAll(x => x.Id == dto.Id && x.IsDeleted == false)
                .Include(x => x.Patient) 
                .Include(x => x.Details)
                .FirstOrDefaultAsync();

            if (labResult == null) throw new LabResultNotFoundException("Yenilənməli olan analiz tapılmadı!");

            _mapper.Map(dto, labResult);
            _repository.Update(labResult);
            await _repository.SaveChangesAsync();

            if (labResult.Status == 2 && labResult.Patient != null)
            {
                string pasiyentMaili = labResult.Patient.Email ?? "";
                string pasiyentAdi = labResult.Patient.Name ?? "Pasiyent";

                BackgroundJob.Enqueue<IEmailService>(emailService =>
                    emailService.SendLabResultReadyEmailAsync(pasiyentMaili, pasiyentAdi)
                );
            }
        }

        public async Task SoftDeleteAsync(int id)
        {
            if (id <= 0)
                throw new NegativeIdException("Id mənfi ola bilməz!");

            var labResult = await _repository.FindAll(x => x.Id == id && x.IsDeleted == false).FirstOrDefaultAsync();

            if (labResult == null) throw new LabResultNotFoundException("Silinməli olan analiz tapılmadı!");

            _repository.SoftDelete(labResult);
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
