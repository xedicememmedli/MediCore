using FluentValidation;
using FluentValidation.AspNetCore;
using MediCore.Business.Services.Implementations;
using MediCore.Business.Services.Interfaces;
using MediCore.Business.Settings;
using MediCore.DAL.Repositories.Implementations;
using MediCore.DAL.Repositories.Interfaces;
using Microsoft.Extensions.DependencyInjection;
using System.Reflection;

namespace MediCore.Business
{
    public static class BusinessServiceRegistrations
    {
        public static void AddBusinessService(this IServiceCollection services)
        {
            services.AddAutoMapper(Assembly.GetExecutingAssembly());

            services.AddScoped<ICategoryService, CategoryService>();
            services.AddScoped<IUserService, UserService>();
            services.AddScoped<IMedicineService, MedicineService>();
            services.AddScoped<ISettingService, SettingService>();
            services.AddScoped<IOrderService, OrderService>();
            services.AddScoped<IBasketService, BasketService>();
            services.AddScoped<IBasketItemService, BasketItemService>();
            services.AddScoped<IChatMessageService, ChatMessageService>();
            services.AddScoped<IConsultationService, ConsultationService>();
            services.AddScoped<ICourierService, CourierService>();
            services.AddScoped<IDoctorService, DoctorService>();
            services.AddScoped<IPrescriptionService, PrescriptionService>();
            services.AddScoped<IPrescriptionItemService, PrescriptionItemService>();
            services.AddScoped<ISpecialtyService, SpecialtyService>();
            services.AddScoped<ILabResultDetailService, LabResultDetailService>();
            services.AddScoped<ILabResultService, LabResultService>();
            services.AddScoped<IUsedPrescriptionService, UsedPrescriptionService>();
            services.AddScoped<INotificationService, NotificationService>();
            services.AddScoped<IPaymentService, PaymentService>();

            // BUG DÜZƏLDİLDİ: IPhotoService qeydiyyata alınmamışdı!
            // CategoryService, DoctorService, CourierService, MedicineService, UserService bundan asılıdır.
            services.AddScoped<IPhotoService, PhotoService>();

            services.AddScoped<IPdfService, PdfService>();
            services.AddScoped<IEmailService, EmailService>();

            services.AddFluentValidationAutoValidation();
            services.AddValidatorsFromAssembly(Assembly.GetExecutingAssembly());

            services.AddHttpClient<IAiService, AiService>();
        }
    }
}
