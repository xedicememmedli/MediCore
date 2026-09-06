using AutoMapper;
using MediCore.Business.DTOs.Notification;
using MediCore.Core.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCore.Business.Profiles
{
    public class NotificationProfile : Profile
    {
        public NotificationProfile()
        {
            CreateMap<Notification, CreateNotificationDto>().ReverseMap();
            CreateMap<Notification, UpdateNotificationDto>().ReverseMap();
            CreateMap<Notification, GetAllNotificationDto>().ReverseMap();
            CreateMap<Notification, GetNotificationDto>().ReverseMap();
        }
    }
}
