using MediCore.Core.Entities.Common;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCore.Core.Entities
{
    public class PrescriptionItem : BaseEntity
    {
        public int PrescriptionId { get; set; }

        public Prescription Prescription { get; set; }

        // Bu ID sayesinde biz aptek sistemine baglaniriq
        public int MedicineId { get; set; }

        public Medicine Medicine { get; set; }

        public string Dosage { get; set; } // Mes: "Gundə 2 defe, yemekden sonra"
        public string Duration { get; set; }

        // Hekim qeyd edir ki, xeste bu dermandance qutu almalidir
        // Biz avtomatik sifaris yaradanda xestenin səbətinə bu sayda elave edeceyik!
        public int Quantity { get; set; }
    }
}
