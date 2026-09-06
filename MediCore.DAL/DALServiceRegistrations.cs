using MediCore.DAL.Repositories.Implementations;
using MediCore.DAL.Repositories.Interfaces;
using Microsoft.Extensions.DependencyInjection;

namespace MediCore.DAL
{
    public static class DALServiceRegistrations
    {
        public static void AddDALService(this IServiceCollection services)
        {
            services.AddScoped<ICategoryRepository, CategoryRepository>();
            services.AddScoped<IMedicineRepository, MedicineRepository>();
            services.AddScoped<ISettingRepository, SettingRepository>();
            services.AddScoped<IOrderRepository, OrderRepository>();
            services.AddScoped<IBasketRepository, BasketRepository>();
            services.AddScoped<IBasketItemRepository, BasketItemRepository>();
            services.AddScoped<ISpecialtyRepository, SpecialtyRepository>();
            services.AddScoped<IDoctorRepository, DoctorRepository>();
            services.AddScoped<ICourierRepository, CourierRepository>();
            services.AddScoped<IConsultationRepository, ConsultationRepository>();
            services.AddScoped<IChatMessageRepository, ChatMessageRepository>();
            services.AddScoped<IPrescriptionRepository, PrescriptionRepository>();
            services.AddScoped<IPrescriptionItemRepository, PrescriptionItemRepository>();
            services.AddScoped<ILabResultRepository, LabResultRepository>();
            services.AddScoped<ILabResultDetailRepository, LabResultDetailRepository>();
            services.AddScoped<IPaymentRepository, PaymentRepository>();
            services.AddScoped<INotificationRepository, NotificationRepository>();
            services.AddScoped<IUsedPrescriptionRepository, UsedPrescriptionRepository>();
            services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
        }
    }
}
