using MediCore.Core.Entities.Common;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCore.Core.Entities
{
    public class BasketItem : BaseEntity
    {
        public int BasketId { get; set; }
        public Basket Basket { get; set; }

        public int MedicineId { get; set; }
        public Medicine Medicine { get; set; }

        public int Count { get; set; } // Dermandan nece dene elave edib

        public decimal UnitPrice { get; set; } // Elave edendeki qiymeti (sonradan dermanın qiymeti deyissə, sebetdeki deyismesin deye)
    }
}
