using MediCore.Business.DTOs.ChatMessage;

namespace MediCore.Business.Services.Interfaces
{
    public interface IChatMessageService
    {
        Task CreateAsync(CreateChatMessageDto dto);
        Task<GetChatMessageDto> GetByIdAsync(int id);                               // Əlavə edildi
        Task<List<GetAllChatMessageDto>> GetAllAsync();                             // Əlavə edildi
        Task<List<GetAllChatMessageDto>> GetAllByConsultationIdAsync(int consultationId);
        Task UpdateAsync(UpdateChatMessageDto dto);
        Task SoftDeleteAsync(int id);
        Task<List<GetAllChatMessageDto>> GetChatHistoryAsync(string senderId, string receiverId);
    }
}
