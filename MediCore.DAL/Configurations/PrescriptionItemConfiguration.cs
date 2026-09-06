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
    public class PrescriptionItemConfiguration : IEntityTypeConfiguration<PrescriptionItem>
    {
        public void Configure(EntityTypeBuilder<PrescriptionItem> builder)
        {
            builder.HasOne(pi => pi.Medicine)
                   .WithMany(m => m.PrescriptionItems)
                   .HasForeignKey(pi => pi.MedicineId)
                   .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
