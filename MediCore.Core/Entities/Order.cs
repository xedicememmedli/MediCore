using MediCore.Core.Entities.Common;
using MediCore.Core.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCore.Core.Entities
{
    public class Order : BaseEntity 
    {
        public string AppUserId { get; set; } // Kim sifaris edib?
        public AppUser AppUser { get; set; }

        public decimal TotalPrice { get; set; } 
        public string ShippingAddress { get; set; } // Catdirilma unvani
        public string PhoneNumber { get; set; } // Elaqe nomresi

        // Sifarisin statusunu izlemek ucun (Meselen: Gozlemede, Karqoda, Tehvil verildi)
        public OrderStatus Status { get; set; }
        public DeliveryType DeliveryType { get; set; }

        public string? City { get; set; }

        public string? PostalCode { get; set; }

        public List<OrderItem> OrderItems { get; set; } = new(); // Sifarisin icindeki dermanlar

        // Bu bize sifarisi hansi kuryerin apardigini bilmeye komek edecek
        public int? CourierId { get; set; }
        public Courier? Courier { get; set; }
        public string? PrescriptionImageUrl { get; set; } // Reseptin şəklinin linki
        public string? PrescriptionImagePublicId { get; set; } // Cloudinary üçün PublicId
        public string? PaymentUrl { get; set; } // Ödəniş linkini bazada saxlamaq üçün
    }
}
