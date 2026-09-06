using MediCore.Core.Entities.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCore.Core.Entities
{
    public class Basket : BaseEntity 
    {
        public string AppUserId { get; set; }
        public AppUser AppUser { get; set; } 

        public ICollection<BasketItem> BasketItems { get; set; }
    }
}
