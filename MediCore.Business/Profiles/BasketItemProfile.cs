using AutoMapper;
using MediCore.Business.DTOs.BasketItem;
using MediCore.Core.Entities;

namespace MediCore.Business.Profiles
{
    public class BasketItemProfile : Profile
    {
        public BasketItemProfile()
        {
            CreateMap<BasketItem, GetBasketItemDto>()
                .ForMember(dest => dest.MedicineName, opt => opt.MapFrom(src => src.Medicine.Name))
                .ForMember(dest => dest.TotalItemPrice, opt => opt.MapFrom(src => src.Count * src.UnitPrice));

            CreateMap<BasketItem, GetAllBasketItemDto>()
                .ForMember(dest => dest.MedicineName, opt => opt.MapFrom(src => src.Medicine.Name))
                .ForMember(dest => dest.TotalItemPrice, opt => opt.MapFrom(src => src.Count * src.UnitPrice));

            CreateMap<CreateBasketItemDto, BasketItem>();
            CreateMap<UpdateBasketItemDto, BasketItem>();
        }
    }
}
