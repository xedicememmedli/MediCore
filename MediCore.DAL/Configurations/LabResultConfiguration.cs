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
    public class LabResultConfiguration : IEntityTypeConfiguration<LabResult>
    {
        public void Configure(EntityTypeBuilder<LabResult> builder)
        {
            builder.HasOne(x => x.Patient)
                   .WithMany()
                   .HasForeignKey(x => x.PatientId)
                   .OnDelete(DeleteBehavior.Cascade); 

            builder.HasOne(x => x.Doctor)
                   .WithMany()
                   .HasForeignKey(x => x.DoctorId)
                   .OnDelete(DeleteBehavior.NoAction); 

            builder.Property(x => x.TestCategory)
                .IsRequired()
                .HasMaxLength(100);
            builder.Property(x => x.VerificationCode)
                .IsRequired()
                .HasMaxLength(50);
        }
    }
}