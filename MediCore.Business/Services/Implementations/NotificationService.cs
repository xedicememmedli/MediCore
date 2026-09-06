using AutoMapper;
using MediCore.Business.DTOs.Notification;
using MediCore.Business.Helpers.Exceptions.Common;
using MediCore.Business.Services.Interfaces;
using MediCore.Core.Entities;
using MediCore.DAL.Repositories.Interfaces;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCore.Business.Services.Implementations
{
    public class NotificationService : INotificationService
    {
         readonly INotificationRepository _rep;
         readonly IMapper _mapper;
         readonly INotificationSender _notificationSender; 

        public NotificationService(
            INotificationRepository rep,
            IMapper mapper,
            INotificationSender notificationSender)
        {
            _rep = rep;
            _mapper = mapper;
            _notificationSender = notificationSender;
        }

        public async Task<GetNotificationDto> CreateAsync(CreateNotificationDto notificationDto)
        {
            var notification = _mapper.Map<Notification>(notificationDto);

            notification.CreatedAt = DateTime.UtcNow;
            notification.IsRead = false;
            notification.IsDeleted = false;

            var newNotification = await _rep.CreateAsync(notification);
            await _rep.SaveChangesAsync();

            var resultDto = _mapper.Map<GetNotificationDto>(newNotification);

            await _notificationSender.SendToUserAsync(notification.AppUserId, resultDto);

            return resultDto;
        }

        public async Task UpdateAsync(UpdateNotificationDto notificationDto)
        {
            if (notificationDto.Id <= 0) throw new Exception("Id mənfi ola bilməz!");

            var notification = await _rep.FindAll(x => x.Id == notificationDto.Id && x.IsDeleted == false).FirstOrDefaultAsync();
            if (notification == null) throw new Exception("Yenilənməli olan bildiriş tapılmadı!");

            _mapper.Map(notificationDto, notification);

            _rep.Update(notification);
            await _rep.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            if (id <= 0) throw new Exception("Id mənfi ola bilməz!");

            var notification = await _rep.FindAll(x => x.Id == id).FirstOrDefaultAsync();
            if (notification == null) throw new Exception("Bildiriş tapılmadı!");

            _rep.Delete(notification);
            await _rep.SaveChangesAsync();
        }

        public async Task SoftDeleteAsync(int id)
        {
            if (id <= 0) throw new Exception("Id mənfi ola bilməz!");

            var notification = await _rep.FindAll(x => x.Id == id && x.IsDeleted == false).FirstOrDefaultAsync();
            if (notification == null) throw new Exception("Silinməli olan bildiriş tapılmadı!");

            _rep.SoftDelete(notification);
            await _rep.SaveChangesAsync();
        }

        public async Task RestoreAsync(int id)
        {
            var deletedEntity = await _rep.FindAll(x => x.Id == id && x.IsDeleted == true).FirstOrDefaultAsync();
            if (deletedEntity == null) throw new Exception("Arxivdə belə bir məlumat tapılmadı!");

            _rep.Restore(deletedEntity);
            await _rep.SaveChangesAsync();
        }

        public async Task<List<GetAllNotificationDto>> GetAllAsync()
        {
            var notifications = await _rep.FindAll(x => x.IsDeleted == false).ToListAsync();
            return _mapper.Map<List<GetAllNotificationDto>>(notifications);
        }

        public async Task<GetNotificationDto> GetByIdAsync(int id)
        {
            if (id <= 0) throw new Exception("Id mənfi ola bilməz!");

            var notification = await _rep.FindAll(x => x.Id == id && x.IsDeleted == false).FirstOrDefaultAsync();
            if (notification == null) throw new Exception("Bildiriş tapılmadı!");

            return _mapper.Map<GetNotificationDto>(notification);
        }

        public async Task<List<GetAllNotificationDto>> GetUserNotificationsAsync(string userId)
        {
            var notifications = await _rep.FindAll(x => x.AppUserId == userId && x.IsDeleted == false)
                                          .OrderByDescending(x => x.CreatedAt)
                                          .ToListAsync();

            return _mapper.Map<List<GetAllNotificationDto>>(notifications);
        }

        public async Task MarkAsReadAsync(int id)
        {
            if (id <= 0) throw new Exception("Id mənfi ola bilməz!");

            var notification = await _rep.FindAll(x => x.Id == id && x.IsDeleted == false).FirstOrDefaultAsync();
            if (notification == null) throw new Exception("Bildiriş tapılmadı!");

            if (!notification.IsRead)
            {
                notification.IsRead = true;
                _rep.Update(notification);
                await _rep.SaveChangesAsync();
            }
        }
    }
}
