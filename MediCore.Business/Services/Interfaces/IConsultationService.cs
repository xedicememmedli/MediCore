using MediCore.Business.DTOs.Consultation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCore.Business.Services.Interfaces
{
    public interface IConsultationService
    {
        Task<string>CreateAsync(CreateConsultationDto dto);
        Task<List<GetAllConsultationDto>> GetAllAsync();
        Task<GetConsultationDto> GetByIdAsync(int id);
        Task UpdateAsync(UpdateConsultationDto dto);
        Task SoftDeleteAsync(int id);
        Task ConfirmPaymentAsync(int consultationId);
        Task<List<string>> GetAvailableTimeSlotsAsync(int doctorId, DateTime date);
        Task RestoreAsync(int id);
    }
}
