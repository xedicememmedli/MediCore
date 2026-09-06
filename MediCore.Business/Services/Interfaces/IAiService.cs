using MediCore.Business.DTOs;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCore.Business.Services.Interfaces
{
    public interface IAiService
    {
        // Şəkli (IFormFile) qəbul edib, yoxlayıb bizə DTO qaytaracaq
        Task<AiPrescriptionResultDto> AnalyzePrescriptionAsync(IFormFile photo);
        Task<ChatResponseDto> AskVirtualPharmacistAsync(ChatRequestDto dto);
    }
}
