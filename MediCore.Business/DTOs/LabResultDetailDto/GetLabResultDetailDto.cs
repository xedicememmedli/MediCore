using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCore.Business.DTOs.LabResultDetailDto
{
    public record GetLabResultDetailDto
    {
        public int Id { get; set; }
        public string ParameterName { get; set; }
        public string Value { get; set; }
        public string Unit { get; set; }
        public string ReferenceRange { get; set; }
        public bool IsCritical { get; set; }
    }
}
