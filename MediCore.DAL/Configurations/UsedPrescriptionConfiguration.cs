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
    public class UsedPrescriptionConfiguration : IEntityTypeConfiguration<UsedPrescription>
    {
        public void Configure(EntityTypeBuilder<UsedPrescription> builder)
        {
            builder.HasKey(x => x.Id);

            builder.Property(x => x.PrescriptionId)
                   .IsRequired();

            builder.HasOne(x => x.Prescription)
                  .WithMany()
                  .HasForeignKey(x => x.PrescriptionId)
                  .OnDelete(DeleteBehavior.NoAction);

            builder.HasQueryFilter(x => !x.IsDeleted);

            builder.ToTable("UsedPrescriptions");

            builder.HasOne(x => x.AppUser)
                   .WithMany()
                   .HasForeignKey(x => x.AppUserId)
                   .OnDelete(DeleteBehavior.NoAction);

            builder.HasOne(x => x.Medicine)
                   .WithMany()
                   .HasForeignKey(x => x.MedicineId)
                   .OnDelete(DeleteBehavior.NoAction);
        }
    }
}