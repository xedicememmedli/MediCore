using AutoMapper;
using MediCore.Business.DTOs.Courier;
using MediCore.Business.DTOs.Order;
using MediCore.Business.Helpers.Exceptions.Common;
using MediCore.Business.Helpers.Exceptions.Courier;
using MediCore.Business.Services.Interfaces;
using MediCore.Core.Entities;
using MediCore.Core.Enums;
using MediCore.DAL.Repositories.Implementations;
using MediCore.DAL.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;


namespace MediCore.Business.Services.Implementations
{
    public class CourierService : ICourierService
    {
        readonly ICourierRepository _courierRepository;
        readonly IMapper _mapper;
        readonly IPhotoService _photoService;
        readonly IOrderRepository _orderRepository;

        public CourierService(
           ICourierRepository courierRepository,
           IOrderRepository orderRepository,
           IMapper mapper,
           IPhotoService photoService)
        {
            _courierRepository = courierRepository;
            _orderRepository = orderRepository;
            _mapper = mapper;
            _photoService = photoService;
        }

        public async Task CreateAsync(CreateCourierDto dto)
        {
            var courier = _mapper.Map<Courier>(dto);

            if (dto.Photo != null)
            {
                var uploadResult = await _photoService.AddPhotoAsync(dto.Photo);
                if (uploadResult.Error != null)
                {
                    throw new Exception($"Kuryer şəkli yüklənərkən xəta: {uploadResult.Error.Message}");
                }

                courier.ImageUrl = uploadResult.SecureUrl.ToString();
                courier.ImagePublicId = uploadResult.PublicId;
            }

            await _courierRepository.CreateAsync(courier);
            await _courierRepository.SaveChangesAsync();
        }

        public async Task UpdateAsync(UpdateCourierDto dto)
        {
            if (dto.Id <= 0) throw new NegativeIdException("Id mənfi ola bilməz!");

            var courier = await _courierRepository.FindAll(x => x.Id == dto.Id && x.IsDeleted == false).FirstOrDefaultAsync();

            if (courier == null) throw new CourierNotFoundException("Yenilənməli olan kuryer tapılmadı!");

            _mapper.Map(dto, courier);

            if (dto.Photo != null)
            {
                if (!string.IsNullOrEmpty(courier.ImagePublicId))
                {
                    await _photoService.DeletePhotoAsync(courier.ImagePublicId);
                }

                var uploadResult = await _photoService.AddPhotoAsync(dto.Photo);
                if (uploadResult.Error != null)
                {
                    throw new Exception($"Kuryer şəkli yenilənərkən xəta: {uploadResult.Error.Message}");
                }

                courier.ImageUrl = uploadResult.SecureUrl.ToString();
                courier.ImagePublicId = uploadResult.PublicId;
            }

            _courierRepository.Update(courier);
            await _courierRepository.SaveChangesAsync();
        }

        public async Task<List<GetCourierDto>> GetAllAsync()
        {
            var couriers = await _courierRepository.FindAll(x => x.IsDeleted == false).ToListAsync();
            return _mapper.Map<List<GetCourierDto>>(couriers);
        }

        public async Task<GetCourierDto> GetByIdAsync(int id)
        {
            if (id <= 0) throw new NegativeIdException("Id mənfi ola bilməz!");

            var courier = await _courierRepository.FindAll(x => x.Id == id && x.IsDeleted == false).FirstOrDefaultAsync();

            if (courier == null) throw new CourierNotFoundException("Kuryer tapılmadı!");

            return _mapper.Map<GetCourierDto>(courier);
        }

        public async Task SoftDeleteAsync(int id)
        {
            if (id <= 0) throw new NegativeIdException("Id mənfi ola bilməz!");

            var courier = await _courierRepository.FindAll(x => x.Id == id && x.IsDeleted == false).FirstOrDefaultAsync();

            if (courier == null) throw new CourierNotFoundException("Silinməli olan kuryer tapılmadı!");

            _courierRepository.SoftDelete(courier);
            await _courierRepository.SaveChangesAsync();
        }

        public async Task RestoreAsync(int id)
        {
            var deletedEntity = await _courierRepository
                                  .FindAll(x => x.Id == id && x.IsDeleted == true)
                                  .FirstOrDefaultAsync();

            if (deletedEntity == null)
            {
                throw new Exception("Arxivdə belə bir məlumat tapılmadı!");
            }

            _courierRepository.Restore(deletedEntity);
            await _courierRepository.SaveChangesAsync();
        }

        public async Task TakeOrderAsync(int courierId, int orderId)
        {
            var courier = await _courierRepository
                .FindAll(x => x.Id == courierId && x.IsDeleted == false)
                .FirstOrDefaultAsync();

            if (courier == null)
                throw new Exception("Kuryer tapılmadı!");

            var order = await _orderRepository
                .FindAll(x => x.Id == orderId && x.IsDeleted == false)
                .FirstOrDefaultAsync();

            if (order == null)
                throw new Exception("Sifariş tapılmadı!");

            if (order.CourierId != null)
                throw new Exception("Bu sifariş artıq başqa kuryer tərəfindən götürülüb!");

            order.CourierId = courierId;
            order.Status = OrderStatus.Shipping;

            await _orderRepository.SaveChangesAsync();
        }

        public async Task<List<GetOrderDto>> GetCourierOrdersAsync(int courierId)
        {
            var orders = await _orderRepository
                .FindAll(x => x.CourierId == courierId && x.IsDeleted == false)
                .Include(x => x.OrderItems)
                .ThenInclude(x => x.Medicine)
                .ToListAsync();

            return _mapper.Map<List<GetOrderDto>>(orders);
        }
    }
}
