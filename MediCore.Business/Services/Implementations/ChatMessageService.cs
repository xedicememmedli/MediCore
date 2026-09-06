using AutoMapper;
using MediCore.Business.DTOs.ChatMessage;
using MediCore.Business.Helpers.Exceptions.ChatMessage;
using MediCore.Business.Helpers.Exceptions.Common;
using MediCore.Business.Services.Interfaces;
using MediCore.Core.Entities;
using MediCore.DAL.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace MediCore.Business.Services.Implementations
{
    public class ChatMessageService : IChatMessageService
    {
         readonly IChatMessageRepository _repository;
         readonly IMapper _mapper;

        public ChatMessageService(IChatMessageRepository repository, IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        public async Task CreateAsync(CreateChatMessageDto dto)
        {
            var chatMessage = _mapper.Map<ChatMessage>(dto);
            await _repository.CreateAsync(chatMessage);
            await _repository.SaveChangesAsync();
        }

        public async Task<List<GetAllChatMessageDto>> GetAllAsync()
        {
            var chatMessages = await _repository.FindAll(x => x.IsDeleted == false).ToListAsync();
            return _mapper.Map<List<GetAllChatMessageDto>>(chatMessages);
        }

        public async Task<List<GetAllChatMessageDto>> GetAllByConsultationIdAsync(int consultationId)
        {
            if (consultationId <= 0) throw new NegativeIdException("Id mənfi ola bilməz!");

            var chatMessages = await _repository.FindAll(x => x.ConsultationId == consultationId && x.IsDeleted == false).ToListAsync();
            return _mapper.Map<List<GetAllChatMessageDto>>(chatMessages);
        }

        public async Task<GetChatMessageDto> GetByIdAsync(int id)
        {
            if (id <= 0) throw new NegativeIdException("Id mənfi ola bilməz!");

            var chatMessage = await _repository.FindAll(x => x.Id == id && x.IsDeleted == false).FirstOrDefaultAsync();

            if (chatMessage == null) throw new ChatMessageNotFoundException("Mesaj tapılmadı!");

            return _mapper.Map<GetChatMessageDto>(chatMessage);
        }

        public async Task UpdateAsync(UpdateChatMessageDto dto)
        {
            if (dto.Id <= 0) throw new NegativeIdException("Id mənfi ola bilməz!");

            var chatMessage = await _repository.FindAll(x => x.Id == dto.Id && x.IsDeleted == false).FirstOrDefaultAsync();

            if (chatMessage == null) throw new ChatMessageNotFoundException("Yenilənmeli olan mesaj tapılmadı!");

            _mapper.Map(dto, chatMessage);
            _repository.Update(chatMessage);
            await _repository.SaveChangesAsync();
        }

        public async Task SoftDeleteAsync(int id)
        {
            if (id <= 0) throw new NegativeIdException("Id menfi ola bilmez!");

            var chatMessage = await _repository.FindAll(x => x.Id == id && x.IsDeleted == false).FirstOrDefaultAsync();

            if (chatMessage == null) throw new ChatMessageNotFoundException("Silinmeli olan mesaj tapilmadi!");

            _repository.SoftDelete(chatMessage);
            await _repository.SaveChangesAsync();
        }

        public async Task<List<GetAllChatMessageDto>> GetChatHistoryAsync(string senderId, string receiverId)
        {
            var messages = await _repository.FindAll(x =>
                ((x.SenderId == senderId && x.ReceiverId == receiverId) ||
                 (x.SenderId == receiverId && x.SenderId == senderId)) &&
                x.IsDeleted == false)
                .OrderBy(x => x.CreatedAt)
                .ToListAsync();

            return _mapper.Map<List<GetAllChatMessageDto>>(messages);
        }
    }
}
