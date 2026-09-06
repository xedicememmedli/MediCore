using MediCore.Business.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stripe;

namespace MediCore.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PaymentController : ControllerBase
    {
        readonly IPaymentService _paymentService;
        readonly IConfiguration _configuration;
        readonly IOrderService _orderService;
        readonly IConsultationService _consultationService;

        public PaymentController(
            IPaymentService paymentService,
            IConfiguration configuration,
            IOrderService orderService,
            IConsultationService consultationService)
        {
            _paymentService = paymentService;
            _configuration = configuration;
            _orderService = orderService;
            _consultationService = consultationService;
        }

        /// <summary>
        /// Stripe-dan gələn ödəniş hadisələrini (Webhook) dinləyir.
        /// </summary>
        [HttpPost("webhook")]
        [AllowAnonymous]
        public async Task<IActionResult> StripeWebhook()
        {
            var json = await new StreamReader(HttpContext.Request.Body).ReadToEndAsync();
            var stripeSignature = Request.Headers["Stripe-Signature"];

            try
            {
                var stripeEvent = EventUtility.ConstructEvent(
                    json,
                    stripeSignature,
                    _configuration["Stripe:WebhookSecret"]
                );

                if (stripeEvent.Type == "checkout.session.completed")
                {
                    var session = stripeEvent.Data.Object as Stripe.Checkout.Session;

                    if (session != null)
                    {
                        // Sifariş (Order) üçün
                        if (!string.IsNullOrEmpty(session.ClientReferenceId) &&
                            int.TryParse(session.ClientReferenceId, out int orderId))
                        {
                            await _orderService.ConfirmPaymentFromWebhookAsync(orderId);
                        }
                        // Konsultasiya (Consultation) üçün
                        else if (session.Metadata != null &&
                                 session.Metadata.TryGetValue("ConsultationId", out string? consultationIdStr) &&
                                 int.TryParse(consultationIdStr, out int consultationId))
                        {
                            // DÜZƏLIŞ: ContainsKey + int.Parse əvəzinə TryGetValue + int.TryParse istifadə edildi.
                            // Beləliklə həm KeyNotFound, həm də FormatException riskləri aradan qaldırıldı.
                            await _consultationService.ConfirmPaymentAsync(consultationId);
                        }
                    }
                }

                return Ok();
            }
            catch (StripeException e)
            {
                return BadRequest(new { Error = e.Message });
            }
        }

        [HttpGet("status/{sessionId}")]
        [Authorize]
        public async Task<IActionResult> GetPaymentStatus(string sessionId)
        {
            var sessionService = new Stripe.Checkout.SessionService();
            var session = await sessionService.GetAsync(sessionId);

            double amount = session.AmountTotal.HasValue ? session.AmountTotal.Value / 100.0 : 0;

            return Ok(new { Status = session.PaymentStatus, Amount = amount });
        }
    }
}
