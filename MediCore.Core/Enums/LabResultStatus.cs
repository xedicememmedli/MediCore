using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCore.Core.Enums
{
    public enum LabResultStatus
    {
        Pending = 0,    // Gozleyir
        InAnalysis = 1, // Analizdedir
        Completed = 2   // Tamamlandi
    }
}
