using AutoMapper;
using MediCore.Business.DTOs.LabResultDetailDto;
using MediCore.Core.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCore.Business.Profiles
{
    public class LabResultDetailProfile : Profile
    {
        public LabResultDetailProfile()
        {
            CreateMap<CreateLabResultDetailDto, LabResultDetail>();
            CreateMap<UpdateLabResultDetailDto, LabResultDetail>();
            CreateMap<LabResultDetail, GetLabResultDetailDto>();
        }
    }
}
