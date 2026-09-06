using MediCore.Core.Entities.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCore.Core.Entities
{
    public class Prescription : BaseEntity
    {
        public int ConsultationId { get; set; }
        public Consultation Consultation { get; set; }
        public string Instructions { get; set; }

        public ICollection<PrescriptionItem> PrescriptionItems { get; set; } = new List<PrescriptionItem>();
    }
}
