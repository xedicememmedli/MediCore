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
    public class PrescriptionConfiguration : IEntityTypeConfiguration<Prescription>
    {
        public void Configure(EntityTypeBuilder<Prescription> builder)
        {
            // PrescriptionItem silinəndə onun aid olduğu Prescription silinməsin
            builder.HasMany(p => p.PrescriptionItems)
              .WithOne(pi => pi.Prescription)
              .HasForeignKey(pi => pi.PrescriptionId)
              .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
