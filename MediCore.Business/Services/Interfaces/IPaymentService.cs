using MediCore.Business.DTOs.Payment;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCore.Business.Services.Interfaces
{
    public interface IPaymentService
    {
        Task<string> CreateStripeSessionAsync(decimal amount, string productName, string clientReferenceId, string successUrl, string cancelUrl, Dictionary<string, string>? metadata = null);
        Task<GetPaymentDto> GetPaymentByIdAsync(int id);
    }
}
    