using AutoMapper;
using MediCore.Business.DTOs.Order;
using MediCore.Core.Entities;

namespace MediCore.Business.Profiles
{
    public class OrderProfile : Profile
    {
        public OrderProfile()
        {
            CreateMap<CreateOrderDto, Order>();
            CreateMap<Order, GetOrderDto>()
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()));
            CreateMap<UpdateOrderStatusDto, Order>();
        }
    }
}
