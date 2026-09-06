using AutoMapper;
using MediCore.Business.DTOs.BasketItem;
using MediCore.Business.Helpers.Exceptions.BasketExceptions;
using MediCore.Business.Helpers.Exceptions.Common;
using MediCore.Business.Helpers.Exceptions.MedicineExceptions;
using MediCore.Business.Helpers.Exceptions.UserExceptions;
using MediCore.Business.Services.Interfaces;
using MediCore.Core.Entities;
using MediCore.DAL.Repositories.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace MediCore.Business.Services.Implementations
{
    public class BasketItemService : IBasketItemService
    {
         readonly IBasketItemRepository _rep;
         readonly IBasketRepository _basketRep;
         readonly IMedicineRepository _medicineRep;
         readonly IMapper _mapper;
         readonly IHttpContextAccessor _httpContext;

        public BasketItemService(
            IBasketItemRepository rep,
            IBasketRepository basketRep,
            IMapper mapper,
            IHttpContextAccessor httpContext,
            IMedicineRepository medicineRep)
        {
            _rep = rep;
            _basketRep = basketRep;
            _mapper = mapper;
            _httpContext = httpContext;
            _medicineRep = medicineRep;
        }

        public async Task<GetBasketItemDto> CreateAsync(CreateBasketItemDto basketItemDto)
        {
            var userId = _httpContext.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) throw new UserNotFoundException();

            var medicine = await _medicineRep.FindAll(x => x.Id == basketItemDto.MedicineId && x.IsDeleted == false).FirstOrDefaultAsync();
            if (medicine == null) throw new MedicineNotFoundException();

            if (medicine.StockCount < basketItemDto.Count)
                throw new OutOfStockException();

            var basket = await _basketRep.FindAll(b => b.AppUserId == userId && b.IsDeleted == false).Include("BasketItems").FirstOrDefaultAsync();

            if (basket == null)
            {
                basket = new Basket { AppUserId = userId };
                await _basketRep.CreateAsync(basket);
                await _basketRep.SaveChangesAsync();
            }

            var existingItem = basket.BasketItems?.FirstOrDefault(x => x.MedicineId == basketItemDto.MedicineId && x.IsDeleted == false);

            BasketItem basketItemToReturn;

            if (existingItem != null)
            {
                if (existingItem.Count + basketItemDto.Count > medicine.StockCount)
                    throw new OutOfStockException("Səbətdəki sayla birlikdə stok məhdudiyyətini keçirsiniz!");

                existingItem.Count += basketItemDto.Count;
                _rep.Update(existingItem);
                basketItemToReturn = existingItem;
            }
            else
            {
                var newBasketItem = _mapper.Map<BasketItem>(basketItemDto);
                newBasketItem.BasketId = basket.Id;
                newBasketItem.UnitPrice = medicine.Price;

                basketItemToReturn = await _rep.CreateAsync(newBasketItem);
            }

            await _rep.SaveChangesAsync();
            return _mapper.Map<GetBasketItemDto>(basketItemToReturn);
        }

        public async Task<List<GetBasketItemDto>> GetAllAsync()
        {
            var items = await _rep.FindAll(x => x.IsDeleted == false).Include("Medicine").ToListAsync();
            return _mapper.Map<List<GetBasketItemDto>>(items);
        }

        public async Task<GetBasketItemDto> GetByIdAsync(int id)
        {
            if (id <= 0) throw new NegativeIdException();

            var item = await _rep.FindAll(x => x.Id == id && x.IsDeleted == false).Include("Medicine").FirstOrDefaultAsync();
            if (item == null) throw new BasketItemNotFoundException();

            return _mapper.Map<GetBasketItemDto>(item);
        }

        public async Task UpdateAsync(UpdateBasketItemDto basketItemDto)
        {
            var userId = _httpContext.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) throw new UserNotFoundException();

            var oldItem = await _rep.FindAll(x => x.Id == basketItemDto.Id && x.IsDeleted == false).FirstOrDefaultAsync();

            if (oldItem == null)
            {
                throw new BasketItemNotFoundException();
            }

            var medicine = await _medicineRep.FindAll(x => x.Id == oldItem.MedicineId && x.IsDeleted == false).FirstOrDefaultAsync();
            if (medicine == null) throw new MedicineNotFoundException();

            if (medicine.StockCount < basketItemDto.Count)
            {
                throw new OutOfStockException();
            }

            oldItem.Count = basketItemDto.Count;

            _rep.Update(oldItem);
            await _rep.SaveChangesAsync();
        }

        
        public async Task SoftDeleteAsync(int id)
        {
            var item = await _rep.FindAll(x => x.Id == id && x.IsDeleted == false).FirstOrDefaultAsync();

            if (item == null) throw new BasketItemNotFoundException();

            _rep.SoftDelete(item);
            await _rep.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var item = await _rep.FindAll(x => x.Id == id).FirstOrDefaultAsync();

            if (item == null) throw new BasketItemNotFoundException();

            _rep.Delete(item);
            await _rep.SaveChangesAsync();
        }
    }
}
