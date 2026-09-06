using AutoMapper;
using Hangfire;
using MediCore.Business.DTOs.Prescription;
using MediCore.Business.Helpers.Exceptions.Common;
using MediCore.Business.Helpers.Exceptions.Prescription;
using MediCore.Business.Services.Interfaces;
using MediCore.Core.Entities;
using MediCore.DAL.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;


namespace MediCore.Business.Services.Implementations
{
    public class PrescriptionService : IPrescriptionService
    {
        readonly IPrescriptionRepository _repository;
        readonly IMapper _mapper;
        readonly IConsultationRepository _consultationRepository;

        public PrescriptionService(
            IPrescriptionRepository repository,
            IMapper mapper,
            IConsultationRepository consultationRepository)
        {
            _repository = repository;
            _mapper = mapper;
            _consultationRepository = consultationRepository;
        }

        public async Task CreateAsync(CreatePrescriptionDto dto)
        {
            var prescription = _mapper.Map<Prescription>(dto);
            await _repository.CreateAsync(prescription);
            await _repository.SaveChangesAsync();

            var consultation = await _consultationRepository.FindAll(c => c.Id == dto.ConsultationId)
                .Include(c => c.Patient)
                .Include(c => c.Doctor)
                .FirstOrDefaultAsync();

            if (consultation == null)
            {
                throw new Exception("Xəta: Bu ID-yə uyğun Konsultasiya tapılmadı!");
            }

            if (consultation.Patient == null)
            {
                throw new Exception("Xəta: Bu konsultasiyaya bağlı Xəstə (Patient) məlumatı bazada yoxdur!");
            }

            string xesteMaili = consultation.Patient.Email ?? "";
            string xesteAdi = consultation.Patient.Name ?? "Pasiyent";

            BackgroundJob.Enqueue<IPdfService>(pdfService =>
                pdfService.SendPdfToEmailBackgroundAsync(prescription.Id, xesteMaili, xesteAdi)
            );
        }

        public async Task<List<GetAllPrescriptionDto>> GetAllAsync()
        {
            var prescriptions = await _repository.FindAll(x => x.IsDeleted == false)
                .Include(x => x.Consultation)
                    .ThenInclude(c => c.Patient)
                .Include(x => x.Consultation)
                    .ThenInclude(c => c.Doctor)
                        .ThenInclude(d => d.AppUser) 
                .Include(x => x.PrescriptionItems)
                    .ThenInclude(pi => pi.Medicine)
                .ToListAsync();

            return _mapper.Map<List<GetAllPrescriptionDto>>(prescriptions);
        }

        public async Task<GetPrescriptionDto> GetByIdAsync(int id)
        {
            if (id <= 0) throw new NegativeIdException("Id mənfi ola bilməz!");

            var prescription = await _repository.FindAll(x => x.Id == id && x.IsDeleted == false)
                .Include(x => x.Consultation)
                    .ThenInclude(c => c.Patient)
                .Include(x => x.Consultation)
                    .ThenInclude(c => c.Doctor)
                        .ThenInclude(d => d.AppUser) 
                .Include(x => x.PrescriptionItems)
                    .ThenInclude(pi => pi.Medicine)
                .FirstOrDefaultAsync();

            if (prescription == null) throw new PrescriptionNotFoundException("Resept tapılmadı!");

            return _mapper.Map<GetPrescriptionDto>(prescription);
        }

        public async Task UpdateAsync(UpdatePrescriptionDto dto)
        {
            if (dto.Id <= 0) throw new NegativeIdException("Id mənfi ola bilməz!");

            var prescription = await _repository.FindAll(x => x.Id == dto.Id && x.IsDeleted == false)
                .Include(x => x.PrescriptionItems)
                .FirstOrDefaultAsync();

            if (prescription == null) throw new PrescriptionNotFoundException("Yenilənməli olan resept tapılmadı!");

            _mapper.Map(dto, prescription);
            _repository.Update(prescription);
            await _repository.SaveChangesAsync();
        }

        public async Task SoftDeleteAsync(int id)
        {
            if (id <= 0)
                throw new NegativeIdException("Id mənfi ola bilməz!");

            var prescription = await _repository.FindAll(x => x.Id == id && x.IsDeleted == false).FirstOrDefaultAsync();

            if (prescription == null) throw new PrescriptionNotFoundException("Silinməli olan resept tapılmadı!");

            _repository.SoftDelete(prescription);
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