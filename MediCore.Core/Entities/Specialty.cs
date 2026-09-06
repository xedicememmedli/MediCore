using MediCore.Core.Entities.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Numerics;
using System.Text;
using System.Threading.Tasks;

namespace MediCore.Core.Entities
{
    public class Specialty : BaseEntity
    {
        public string Name { get; set; } = null!; // Kardioloq, Nevroloq, Terapevt ve s.
        public string? Description { get; set; } // Ixtisas haqqinda qisa melumat

        // Relational Properties (Bir ixtisasin birden cox hekimi ola biler)
        public ICollection<Doctor> Doctors { get; set; } = new List<Doctor>();
    }
}
