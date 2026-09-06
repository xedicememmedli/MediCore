using AutoMapper;
using MediCore.Business.DTOs.Notification;
using MediCore.Business.DTOs.Order;
using MediCore.Business.Services.Interfaces;
using MediCore.Core.Entities;
using MediCore.Core.Enums;
using MediCore.DAL.Repositories.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace MediCore.Business.Services.Implementations
{
    public class OrderService : IOrderService
    {
        private readonly IOrderRepository _orderRepository;
        private readonly IBasketRepository _basketRepository;
        private readonly ICourierRepository _courierRepository;
        private readonly IMapper _mapper;
        private readonly IHttpContextAccessor _accessor;
        private readonly IPaymentService _paymentService;
        private readonly IPhotoService _photoService;
        private readonly IEmailService _emailService;
        private readonly INotificationService _notificationService;
        private readonly IAiService _aiService;

        public OrderService(IOrderRepository orderRepository,
                            IBasketRepository basketRepository,
                            ICourierRepository courierRepository,
                            IMapper mapper,
                            IHttpContextAccessor accessor,
                            IPaymentService paymentService,
                            IPhotoService photoService,
                            IEmailService emailService,
                            INotificationService notificationService,
                            IAiService aiService)
        {
            _orderRepository = orderRepository;
            _basketRepository = basketRepository;
            _courierRepository = courierRepository;
            _mapper = mapper;
            _accessor = accessor;
            _paymentService = paymentService;
            _photoService = photoService;
            _emailService = emailService;
            _notificationService = notificationService;
            _aiService = aiService;
        }

        // KÖMƏKÇİ METOD: Stripe Sessiyası yaratmaq üçün (Təkrarçılığı önləyir)
        private async Task<string> CreateStripeSessionInternal(Order order, bool isPrescription)
        {
            return await _paymentService.CreateStripeSessionAsync(
                amount: order.TotalPrice,
                productName: isPrescription ? "Təsdiqlənmiş Reseptli Sifariş" : "MediCore Aptek Sifarişi",
                clientReferenceId: order.Id.ToString(),
                successUrl: $"https://localhost:7105/api/Order/Success?orderId={order.Id}",
                cancelUrl: "https://localhost:7105/api/Order/Cancel"
            );
        }

        public async Task<(string Message, string? PaymentUrl)> CreateAsync(CreateOrderDto dto)
        {
            var userId = _accessor.HttpContext?.User.FindFirstValue(ClaimTypes.NameIdentifier);
            var userEmail = _accessor.HttpContext?.User.FindFirstValue(ClaimTypes.Email);

            if (userId == null) throw new UnauthorizedAccessException("İstifadəçi sistemə daxil olmayıb!");

            var basket = await _basketRepository.FindAll(x => x.AppUserId == userId && !x.IsDeleted)
                                                .Include(x => x.BasketItems).ThenInclude(bi => bi.Medicine)
                                                .FirstOrDefaultAsync();

            if (basket == null || !basket.BasketItems.Any()) throw new Exception("Səbət boşdur!");

            bool isPrescriptionRequired = basket.BasketItems.Any(bi => bi.Medicine.IsPrescriptionRequired);

            if (isPrescriptionRequired && dto.PrescriptionPhoto == null)
                throw new Exception("Səbətinizdə resept tələb edən dərmanlar var. Zəhmət olmasa reseptin şəklini yükləyin!");

            var order = new Order
            {
                AppUserId = userId,
                ShippingAddress = dto.ShippingAddress ?? "Ünvan qeyd olunmayıb",
                PhoneNumber = dto.PhoneNumber ?? "Nömrə qeyd olunmayıb",
                DeliveryType = dto.DeliveryType,
                OrderItems = basket.BasketItems.Select(bi => new OrderItem
                {
                    MedicineId = bi.MedicineId,
                    Count = bi.Count,
                    UnitPrice = bi.UnitPrice
                }).ToList(),
                TotalPrice = basket.BasketItems.Sum(bi => bi.Count * bi.UnitPrice)
            };

            if (isPrescriptionRequired)
            {
                var aiResult = await _aiService.AnalyzePrescriptionAsync(dto.PrescriptionPhoto);
                var photoResult = await _photoService.AddPrescriptionAsync(dto.PrescriptionPhoto);

                if (photoResult == null || photoResult.Error != null) throw new Exception("Şəkil yüklənmədi.");

                order.PrescriptionImageUrl = photoResult.SecureUrl?.ToString();
                order.PrescriptionImagePublicId = photoResult.PublicId;
                order.Status = aiResult.IsValidPrescription ? OrderStatus.PendingPayment : OrderStatus.PendingPrescription;
            }
            else
            {
                order.Status = OrderStatus.PendingPayment;
            }

            await _orderRepository.CreateAsync(order);
            await _orderRepository.SaveChangesAsync();

            basket.BasketItems.Clear();
            await _basketRepository.SaveChangesAsync();

            if (order.Status == OrderStatus.PendingPayment)
            {
                string sessionUrl = await CreateStripeSessionInternal(order, isPrescriptionRequired);
                order.PaymentUrl = sessionUrl;
                await _orderRepository.SaveChangesAsync();

                await _notificationService.CreateAsync(new CreateNotificationDto { AppUserId = userId, Title = "Sifariş Yaradıldı ✅", Message = "Ödəniş linki e-poçtunuza göndərildi.", OrderId = order.Id });

                if (!string.IsNullOrEmpty(userEmail))
                    await _emailService.SendEmailAsync(userEmail, "MediCore - Sifariş ✅", $"Sifarişiniz üçün ödəniş linki: <a href='{sessionUrl}'>Ödəniş Et</a>");

                return ("Sifariş uğurla yaradıldı! Zəhmət olmasa ödənişi tamamlayın.", sessionUrl);
            }

            await _notificationService.CreateAsync(new CreateNotificationDto { AppUserId = userId, Title = "Resept Yoxlanılır ⏳", Message = "Əczaçılarımız resepti yoxladıqdan sonra ödəniş linki gələcək.", OrderId = order.Id });
            return ("Reseptiniz yoxlanılır. Təsdiqləndikdən sonra sizə bildiriş göndəriləcək.", null);
        }

        public async Task UpdateStatusAsync(UpdateOrderStatusDto dto)
        {
            var order = await _orderRepository.FindAll(x => x.Id == dto.Id && !x.IsDeleted)
                                              .Include(x => x.AppUser).FirstOrDefaultAsync();

            if (order == null) throw new Exception("Sifariş tapılmadı!");

            var oldStatus = order.Status;
            order.Status = dto.Status;

            if (dto.Status == OrderStatus.PendingPayment && oldStatus == OrderStatus.PendingPrescription)
            {
                string sessionUrl = await CreateStripeSessionInternal(order, true);
                order.PaymentUrl = sessionUrl;

                if (order.AppUser != null)
                {
                    await _notificationService.CreateAsync(new CreateNotificationDto { AppUserId = order.AppUserId, Title = "Resept Təsdiqləndi ✅", Message = "Ödəniş edərək sifarişi tamamlaya bilərsiniz.", OrderId = order.Id });
                    await _emailService.SendEmailAsync(order.AppUser.Email, "MediCore - Resept Təsdiqləndi", $"Ödəniş üçün link: {sessionUrl}");
                }
            }

            await _orderRepository.SaveChangesAsync();
        }

        public async Task<List<GetOrderDto>> GetAllAsync()
        {
            var user = _accessor.HttpContext?.User;
            var userId = user?.FindFirstValue(ClaimTypes.NameIdentifier);

            IQueryable<Order> query = _orderRepository.FindAll(x => !x.IsDeleted);

            // Admin və ya Moderator deyilsə, yalnız öz sifarişləri
            if (!user.IsInRole("Admin") && !user.IsInRole("Moderator"))
            {
                query = query.Where(x => x.AppUserId == userId);
            }

            var orders = await query.Include(o => o.OrderItems).ThenInclude(oi => oi.Medicine)
                                    .OrderByDescending(x => x.Id).ToListAsync();

            return _mapper.Map<List<GetOrderDto>>(orders);
        }

        public async Task<GetOrderDto> GetByIdAsync(int id)
        {
            var userId = _accessor.HttpContext?.User.FindFirstValue(ClaimTypes.NameIdentifier);
            var order = await _orderRepository.FindAll(x => x.Id == id && !x.IsDeleted)
                                              .Include(o => o.OrderItems).ThenInclude(oi => oi.Medicine)
                                              .FirstOrDefaultAsync();

            if (order == null) throw new Exception("Sifariş tapılmadı!");
            return _mapper.Map<GetOrderDto>(order);
        }

        public async Task AssignCourierAsync(int orderId)
        {
            var appUserId = _accessor.HttpContext?.User.FindFirstValue(ClaimTypes.NameIdentifier);
            var courier = await _courierRepository.FindAll(c => c.AppUserId == appUserId).FirstOrDefaultAsync();
            if (courier == null) throw new Exception("Kuryer profili tapılmadı!");

            var order = await _orderRepository.FindAll(x => x.Id == orderId && !x.IsDeleted).FirstOrDefaultAsync();
            if (order == null) throw new Exception("Sifariş tapılmadı!");
            if (order.Status != OrderStatus.Pending) throw new Exception("Bu sifariş artıq kuryer tərəfindən götürülüb!");

            order.CourierId = courier.Id;
            order.Status = OrderStatus.Shipping;
            await _orderRepository.SaveChangesAsync();
        }

        public async Task<List<GetOrderDto>> GetPendingOrdersAsync()
        {
            var orders = await _orderRepository.FindAll(x => x.CourierId == null && x.Status == OrderStatus.Pending && !x.IsDeleted)
                                               .Include(x => x.OrderItems).ThenInclude(x => x.Medicine).ToListAsync();
            return _mapper.Map<List<GetOrderDto>>(orders);
        }

        public async Task<bool> ConfirmPaymentAsync(int orderId)
        {
            var order = await _orderRepository.FindAll(x => x.Id == orderId && !x.IsDeleted).FirstOrDefaultAsync();
            if (order == null || order.Status != OrderStatus.PendingPayment) return false;

            order.Status = OrderStatus.Pending;
            await _orderRepository.SaveChangesAsync();
            return true;
        }

        public async Task ConfirmPaymentFromWebhookAsync(int orderId)
        {
            var order = await _orderRepository.FindAll(x => x.Id == orderId && !x.IsDeleted)
                                              .Include(x => x.AppUser).FirstOrDefaultAsync();

            if (order != null && order.Status == OrderStatus.PendingPayment)
            {
                order.Status = OrderStatus.Pending;
                await _orderRepository.SaveChangesAsync();

                await _notificationService.CreateAsync(new CreateNotificationDto { AppUserId = order.AppUserId, Title = "Ödəniş Təsdiqləndi 🎉", Message = $"#{order.Id} nömrəli sifarişiniz hazırlanır.", OrderId = order.Id });
            }
        }

        public async Task SoftDeleteAsync(int id)
        {
            var order = await _orderRepository.FindAll(x => x.Id == id && !x.IsDeleted).FirstOrDefaultAsync();
            if (order == null) throw new Exception("Sifariş tapılmadı!");
            _orderRepository.SoftDelete(order);
            await _orderRepository.SaveChangesAsync();
        }

        public async Task RestoreAsync(int id)
        {
            var deletedEntity = await _orderRepository.FindAll(x => x.Id == id && x.IsDeleted).FirstOrDefaultAsync();
            if (deletedEntity == null) throw new Exception("Arxivdə tapılmadı!");
            _orderRepository.Restore(deletedEntity);
            await _orderRepository.SaveChangesAsync();
        }

        
    }
}