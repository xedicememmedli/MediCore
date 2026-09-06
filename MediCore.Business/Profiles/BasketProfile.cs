using AutoMapper;
using MediCore.Business.DTOs.Basket;
using MediCore.Core.Entities;

namespace MediCore.Business.Profiles
{
    public class BasketProfile : Profile
    {
        public BasketProfile()
        {
            CreateMap<Basket, GetBasketDto>()
                .ForMember(dest => dest.TotalPrice, opt => opt.MapFrom(src =>
                    src.BasketItems != null ? src.BasketItems.Sum(x => (decimal)(x.Count * x.UnitPrice)) : 0));

            CreateMap<Basket, GetAllBasketDto>()
                .ForMember(dest => dest.TotalPrice, opt => opt.MapFrom(src =>
                    src.BasketItems != null ? src.BasketItems.Sum(x => (decimal)(x.Count * x.UnitPrice)) : 0));
        }
    }
}
