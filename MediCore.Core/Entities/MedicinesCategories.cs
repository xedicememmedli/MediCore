using MediCore.Core.Entities.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace MediCore.Core.Entities
{
    public class MedicinesCategories : BaseEntity
    {
        public int MedicineId { get; set; }
        [JsonIgnore]
        public Medicine Medicine { get; set; }
        public int CategoryId { get; set; }
        public Category Category { get; set; }
       
    }
}
