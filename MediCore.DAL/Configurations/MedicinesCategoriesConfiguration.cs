using MediCore.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCore.DAL.Configurations
{
    public class MedicinesCategoriesConfiguration : IEntityTypeConfiguration<MedicinesCategories>
    {
        public void Configure(EntityTypeBuilder<MedicinesCategories> builder)
        {
            builder.HasOne(x => x.Category)
                .WithMany(x => x.MedicinesCategories)
                .HasForeignKey(x => x.CategoryId);


            builder.HasOne(x => x.Medicine)
                .WithMany(b => b.MedicinesCategories)
                .HasForeignKey(x => x.MedicineId);

            builder.Ignore(x => x.IsDeleted);
        }
    }
}
