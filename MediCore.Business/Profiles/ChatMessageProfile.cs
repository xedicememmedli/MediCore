using AutoMapper;
using MediCore.Business.DTOs.ChatMessage;
using MediCore.Core.Entities;


namespace MediCore.Business.Profiles
{
    public class ChatMessageProfile : Profile
    {
        public ChatMessageProfile()
        {
            CreateMap<CreateChatMessageDto, ChatMessage>();
            CreateMap<UpdateChatMessageDto, ChatMessage>();
            CreateMap<ChatMessage, GetChatMessageDto>();
            CreateMap<ChatMessage, GetAllChatMessageDto>();
        }
    }
}
