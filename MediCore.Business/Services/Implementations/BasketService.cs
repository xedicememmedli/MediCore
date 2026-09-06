using AutoMapper;
using MediCore.Business.DTOs.Basket;
using MediCore.Business.Helpers.Exceptions.BasketExceptions;
using MediCore.Business.Helpers.Exceptions.Common;
using MediCore.Business.Helpers.Exceptions.Prescription;
using MediCore.Business.Services.Interfaces;
using MediCore.Core.Entities;
using MediCore.DAL.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using Stripe.Checkout;

namespace MediCore.Business.Services.Implementations
{
    public class BasketService : IBasketService
    {
        readonly IBasketRepository _rep;
        readonly IPrescriptionRepository _prescriptionRep;
        readonly IMapper _mapper;

        public BasketService(IBasketRepository rep, IPrescriptionRepository prescriptionRep, IMapper mapper)
        {
            _rep = rep;
            _prescriptionRep = prescriptionRep;
            _mapper = mapper;
        }

        public async Task<List<string>> AddFromPrescriptionAsync(int prescriptionId, string appUserId)
        {
            var prescription = await _prescriptionRep.FindAll(p => p.Id == prescriptionId && p.IsDeleted == false)
                                                     .Include(p => p.PrescriptionItems)
                                                     .ThenInclude(pi => pi.Medicine)
                                                     .FirstOrDefaultAsync();

            if (prescription == null)
                throw new PrescriptionNotFoundException("Resept tapılmadı!");

            var basket = await _rep.FindAll(b => b.AppUserId == appUserId && b.IsDeleted == false)
                                   .Include(b => b.BasketItems)
                                   .FirstOrDefaultAsync();

            if (basket == null)
            {
                basket = new Basket
                {
                    AppUserId = appUserId,
                    BasketItems = new List<BasketItem>()
                };
                await _rep.CreateAsync(basket);
            }

            List<string> warnings = new List<string>();

            foreach (var item in prescription.PrescriptionItems)
            {
                var medicine = item.Medicine;

                if (medicine.StockCount >= item.Quantity)
                {
                    var existingItem = basket.BasketItems.FirstOrDefault(bi => bi.MedicineId == medicine.Id);

                    if (existingItem != null)
                    {
                        existingItem.Count += item.Quantity;
                    }
                    else
                    {
                        basket.BasketItems.Add(new BasketItem
                        {
                            MedicineId = medicine.Id,
                            Count = item.Quantity,
                            UnitPrice = medicine.Price
                        });
                    }
                }
                else
                {
                    warnings.Add($"'{medicine.Name}' adlı dərmandan anbarda kifayət qədər yoxdur (Stokda qalan: {medicine.StockCount}).");
                }
            }

            await _rep.SaveChangesAsync();
            return warnings;
        }

        public async Task<List<GetAllBasketDto>> GetAllAsync()
        {
            var baskets = await _rep.FindAll(x => x.IsDeleted == false)
                                    .Include(b => b.BasketItems)
                                    .ThenInclude(bi => bi.Medicine)
                                    .ToListAsync();

            return _mapper.Map<List<GetAllBasketDto>>(baskets);
        }

        public async Task<GetBasketDto> GetByIdAsync(int id)
        {
            if (id <= 0) throw new NegativeIdException();

            var basket = await _rep.FindAll(x => x.Id == id && x.IsDeleted == false)
                                    .Include(b => b.BasketItems)
                                    .ThenInclude(bi => bi.Medicine)
                                    .FirstOrDefaultAsync();

            if (basket == null) throw new BasketNotFoundException();

            return _mapper.Map<GetBasketDto>(basket);
        }

    }
}