using MediCore.Core.Entities.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCore.Core.Entities
{
    public class Courier : BaseEntity
    {
        public string? ImageUrl { get; set; }
        public string? ImagePublicId { get; set; }
        // Kuryerin User hesabi ile elaqesi
        public string AppUserId { get; set; } = null!;
        public AppUser AppUser { get; set; } = null!;

        public string VehicleType { get; set; } = null!; // Motosiklet, Masin, Velosiped
        public string VehiclePlateNumber { get; set; } = null!; // Masinin/Motonun nomresi 
        public bool IsAvailable { get; set; } = true; // Kuryer hazirda bosdur (true), yoxsa sifaris aparir (false)?

        // (Bir kuryerin apardigi sifarisler)
        public ICollection<Order> Orders { get; set; } = new List<Order>();
    }
}
