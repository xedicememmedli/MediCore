using MediCore.Business.DTOs.BasketItem;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCore.Business.Services.Interfaces
{
    public interface IBasketItemService
    {
        Task<GetBasketItemDto> CreateAsync(CreateBasketItemDto basketItemDto); // Sebete derman atmaq

        Task<GetBasketItemDto> GetByIdAsync(int id); // Sebetdeki tek dermana baxmaq

        Task<List<GetBasketItemDto>> GetAllAsync(); // Butun sebet detallarini getirmek

        Task UpdateAsync(UpdateBasketItemDto basketItemDto); // Sebetdeki dermanin sayini deyismek

        Task SoftDeleteAsync(int id); // Sebetden dermani silmek (IsDeleted = true)

        Task DeleteAsync(int id); // Sebetden dermani tam silmek
    }
}
