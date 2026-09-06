using AutoMapper;
using Hangfire;
using MediCore.Business.DTOs.Consultation;
using MediCore.Business.Helpers.Exceptions.Common;
using MediCore.Business.Helpers.Exceptions.Consultation;
using MediCore.Business.Helpers.Exceptions.Doctor;
using MediCore.Business.Services.Interfaces;
using MediCore.Core.Entities;
using MediCore.DAL.Repositories.Implementations;
using MediCore.DAL.Repositories.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Stripe.Checkout;
using System.Security.Claims;

namespace MediCore.Business.Services.Implementations
{
    public class ConsultationService : IConsultationService
    {
        readonly IConsultationRepository _consultationRepository;
        readonly IDoctorRepository _doctorRepository;
        readonly IMapper _mapper;
        readonly IHttpContextAccessor _accessor;
        readonly UserManager<AppUser> _userManager;
        readonly IPaymentService _paymentService;

        public ConsultationService(IConsultationRepository consultationRepository,
                                   IDoctorRepository doctorRepository,
                                   IMapper mapper,
                                   IHttpContextAccessor accessor,
                                   UserManager<AppUser> userManager,
                                   IPaymentService paymentService)
        {
            _consultationRepository = consultationRepository;
            _doctorRepository = doctorRepository;
            _mapper = mapper;
            _accessor = accessor;
            _userManager = userManager;
            _paymentService = paymentService;
        }

        public async Task<string> CreateAsync(CreateConsultationDto dto)
        {
            var userId = _accessor.HttpContext?.User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) throw new UnauthorizedAccessException("İstifadəçi sistemə daxil olmayıb!");

            var patient = await _userManager.FindByIdAsync(userId);
            if (patient == null) throw new Exception("Xəstə tapılmadı!");

            var doctor = await _doctorRepository
                .FindAll(x => x.Id == dto.DoctorId && x.IsDeleted == false)
                .Include(x => x.AppUser)
                .FirstOrDefaultAsync();

            if (doctor == null) throw new DoctorNotFoundException("Seçilmiş həkim tapılmadı!");

            var consultation = _mapper.Map<Consultation>(dto);
            consultation.PatientId = userId;

            if (patient.HasInsurance)
                consultation.IsActive = true;
            else
                consultation.IsActive = false;

            await _consultationRepository.CreateAsync(consultation);
            await _consultationRepository.SaveChangesAsync();

            if (patient.HasInsurance)
            {
                BackgroundJob.Enqueue<IEmailService>(emailService =>
                    emailService.SendAppointmentToPatientAsync(patient.Email, patient.Name, doctor.AppUser.Name, dto.ScheduledTime, "Sığorta tərəfindən qarşılandı (Pulsuz)")
                );
                BackgroundJob.Enqueue<IEmailService>(emailService =>
                    emailService.SendAppointmentToDoctorAsync(doctor.AppUser.Email, doctor.AppUser.Name, patient.Name, dto.ScheduledTime)
                );
                return $"https://localhost:7105/api/Consultation/Success?consultationId={consultation.Id}";
            }

            decimal consultationPrice = doctor.ConsultationFee;
            string sessionUrl = await _paymentService.CreateStripeSessionAsync(
                amount: consultationPrice,
                productName: $"Dr. {doctor.AppUser.Name} ilə Konsultasiya",
                clientReferenceId: consultation.Id.ToString(),
                successUrl: $"https://localhost:7105/api/Consultation/Success?consultationId={consultation.Id}",
                cancelUrl: "https://localhost:7105/api/Consultation/Cancel"
            );

            BackgroundJob.Enqueue<IEmailService>(emailService =>
                emailService.SendAppointmentToPatientAsync(patient.Email, patient.Name, doctor.AppUser.Name, dto.ScheduledTime, sessionUrl)
            );
            BackgroundJob.Enqueue<IEmailService>(emailService =>
                emailService.SendAppointmentToDoctorAsync(doctor.AppUser.Email, doctor.AppUser.Name, patient.Name, dto.ScheduledTime)
            );

            return sessionUrl;
        }

        public async Task<List<GetAllConsultationDto>> GetAllAsync()
        {
            var userId = _accessor.HttpContext?.User.FindFirstValue(ClaimTypes.NameIdentifier);
            var isAdmin = _accessor.HttpContext?.User.IsInRole("Admin") ?? false;

            var consultations = await _consultationRepository
                .FindAll(x => (isAdmin || x.PatientId == userId || x.Doctor.AppUserId == userId) && x.IsDeleted == false)
                .Include(x => x.Doctor)
                .ToListAsync();

            return _mapper.Map<List<GetAllConsultationDto>>(consultations);
        }

        public async Task<GetConsultationDto> GetByIdAsync(int id)
        {
            if (id <= 0) throw new Exception("Id mənfi ola bilməz!");

            var userId = _accessor.HttpContext?.User.FindFirstValue(ClaimTypes.NameIdentifier);

            var consultation = await _consultationRepository
                .FindAll(x => x.Id == id && (x.PatientId == userId || x.Doctor.AppUserId == userId) && x.IsDeleted == false)
                .Include(x => x.Doctor)
                .FirstOrDefaultAsync();

            if (consultation == null) throw new Exception("Konsultasiya tapılmadı!");

            return _mapper.Map<GetConsultationDto>(consultation);
        }

        public async Task UpdateAsync(UpdateConsultationDto dto)
        {
            if (dto.Id <= 0) throw new Exception("Id mənfi ola bilməz!");

            var consultation = await _consultationRepository
                .FindAll(x => x.Id == dto.Id && x.IsDeleted == false)
                .FirstOrDefaultAsync();

            if (consultation == null) throw new Exception("Yenilənməli olan konsultasiya tapılmadı!");

            _mapper.Map(dto, consultation);
            _consultationRepository.Update(consultation);
            await _consultationRepository.SaveChangesAsync();
        }

        public async Task SoftDeleteAsync(int id)
        {
            if (id <= 0) throw new Exception("Id mənfi ola bilməz!");

            var consultation = await _consultationRepository
                .FindAll(x => x.Id == id && x.IsDeleted == false)
                .FirstOrDefaultAsync();

            if (consultation == null) throw new Exception("Silinməli olan konsultasiya tapılmadı!");

            _consultationRepository.SoftDelete(consultation);
            await _consultationRepository.SaveChangesAsync();
        }

        public async Task ConfirmPaymentAsync(int consultationId)
        {
            var consultation = await _consultationRepository
                .FindAll(x => x.Id == consultationId && x.IsDeleted == false)
                .FirstOrDefaultAsync();

            if (consultation != null)
            {
                consultation.IsActive = true;
                _consultationRepository.Update(consultation);
                await _consultationRepository.SaveChangesAsync();
            }
        }

        public async Task<List<string>> GetAvailableTimeSlotsAsync(int doctorId, DateTime date)
        {
            var startTime = new TimeSpan(9, 0, 0);
            var endTime = new TimeSpan(18, 0, 0);
            var slotDuration = TimeSpan.FromMinutes(30);

            var allSlots = new List<TimeSpan>();
            for (var time = startTime; time < endTime; time = time.Add(slotDuration))
            {
                if (time >= new TimeSpan(13, 0, 0) && time < new TimeSpan(14, 0, 0))
                    continue;
                allSlots.Add(time);
            }

            var startOfDay = date.Date;
            var endOfDay = startOfDay.AddDays(1).AddTicks(-1);

            var bookedConsultations = await _consultationRepository
                .FindAll(c => c.DoctorId == doctorId &&
                              c.IsDeleted == false &&
                              c.ScheduledTime >= startOfDay &&
                              c.ScheduledTime <= endOfDay)
                .ToListAsync();

            var bookedTimes = bookedConsultations
                .Select(c => c.ScheduledTime.TimeOfDay)
                .ToList();

            var availableSlots = allSlots
                .Where(slot => !bookedTimes.Contains(slot))
                .Select(slot => slot.ToString(@"hh\:mm"))
                .ToList();

            return availableSlots;
        }

        public async Task RestoreAsync(int id)
        {
            var deletedEntity = await _consultationRepository
                                .FindAll(x => x.Id == id && x.IsDeleted == true)
                                .FirstOrDefaultAsync();

            if (deletedEntity == null)
                throw new Exception("Arxivdə belə bir məlumat tapılmadı!");

            _consultationRepository.Restore(deletedEntity);
            await _consultationRepository.SaveChangesAsync();
        }
    }
}
