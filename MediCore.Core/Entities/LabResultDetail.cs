using MediCore.Core.Entities.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCore.Core.Entities
{
    public class LabResultDetail : BaseEntity
    {
        public int LabResultId { get; set; }
        public LabResult LabResult { get; set; }

        public string ParameterName { get; set; } // Məs: "Qlükoza (Şəkər)"
        public string Value { get; set; } // Məs: "125" (Xəstənin nəticəsi)
        public string Unit { get; set; } // Məs: "mg/dL" (Ölçü vahidi)
        public string ReferenceRange { get; set; } // Məs: "70 - 110" (Normal sayılan aralıq)

        // Təhlükəli dərəcədə yüksək/aşağıdırsa true olacaq
        public bool IsCritical { get; set; }
    }
}
