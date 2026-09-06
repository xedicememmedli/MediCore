using MediCore.Core.Entities.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace MediCore.Core.Entities
{
    public class Category : BaseEntity
    {
        public string Name { get; set; }
        public string Description { get; set; } // Kategoriya haqqinda qisa melumat
        public string? ImageUrl { get; set; }
        public string? ImagePublicId { get; set; }
        public ICollection<MedicinesCategories> MedicinesCategories { get; set; }
    }
}
