using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCore.Business.DTOs.Courier
{
    public record GetAllCourierDto
    {
        public int Id { get; set; }
        public string AppUserId { get; set; }
        public string VehicleType { get; set; } = string.Empty;
        public string VehiclePlateNumber { get; set; }
    }
}
