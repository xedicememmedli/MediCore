using AutoMapper;
using MediCore.Business.DTOs.Payment;
using MediCore.Business.Services.Interfaces;
using MediCore.DAL.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using Stripe.Checkout;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCore.Business.Services.Implementations
{
    public class PaymentService : IPaymentService
    {
        readonly IPaymentRepository _rep;
        readonly IMapper _mapper;

        public PaymentService(IPaymentRepository rep, IMapper mapper)
        {
            _rep = rep;
            _mapper = mapper;
        }

        public async Task<string> CreateStripeSessionAsync(decimal amount, string productName, string clientReferenceId, string successUrl, string cancelUrl, Dictionary<string, string>? metadata = null)
        {
            var options = new SessionCreateOptions
            {
                PaymentMethodTypes = new List<string> { "card" },
                LineItems = new List<SessionLineItemOptions>
                {
                    new SessionLineItemOptions
                    {
                        PriceData = new SessionLineItemPriceDataOptions
                        {
                            UnitAmount = (long)(amount * 100),
                            Currency = "azn",
                            ProductData = new SessionLineItemPriceDataProductDataOptions
                            {
                                Name = productName,
                                Description = "Ödəniş təyinatı"
                            },
                        },
                        Quantity = 1,
                    },
                },
                Mode = "payment",
                ClientReferenceId = clientReferenceId, 
                SuccessUrl = successUrl,
                CancelUrl = cancelUrl,
                Metadata = metadata ?? new Dictionary<string, string>()
            };

            var service = new SessionService();
            Session session = await service.CreateAsync(options);
            return session.Url;
        }

        public async Task<GetPaymentDto> GetPaymentByIdAsync(int id)
        {
            var payment = await _rep.FindAll(p => p.Id == id && p.IsDeleted == false).FirstOrDefaultAsync();
            if (payment == null) throw new Exception("Ödəniş tapılmadı!");
            return _mapper.Map<GetPaymentDto>(payment);
        }
    }
}