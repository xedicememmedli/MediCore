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
    public class ConsultationConfiguration : IEntityTypeConfiguration<Consultation>
    {
        public void Configure(EntityTypeBuilder<Consultation> builder)
        {
    
            builder.HasOne(c => c.Patient)
                   .WithMany(u => u.PatientConsultations)
                   .HasForeignKey(c => c.PatientId)
                   .OnDelete(DeleteBehavior.Restrict);

            // Doctor FK — SQL Server multiple cascade paths x?tasinin qarsisini alir
            builder.HasOne(c => c.Doctor)
                   .WithMany(u => u.Consultations)
                   .HasForeignKey(c => c.DoctorId)
                   .OnDelete(DeleteBehavior.NoAction);
        }
    }
}
