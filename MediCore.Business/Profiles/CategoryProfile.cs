using AutoMapper;
using MediCore.Business.DTOs.Category;
using MediCore.Core.Entities;


namespace MediCore.Business.Profiles
{
    public class CategoryProfile : Profile
    {
        public CategoryProfile() 
        {
            CreateMap<Category, GetCategoryDto>()
                .ForMember(dest => dest.IconPath, opt => opt.MapFrom(src => src.ImageUrl));
            CreateMap<Category, CreateCategoryDto>().ReverseMap();
            CreateMap<Category, UpdateCategoryDto>().ReverseMap();
            CreateMap<UpdateCategoryDto, GetCategoryDto>();
        }
    }
}
