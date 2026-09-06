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
    public class DoctorConfiguration : IEntityTypeConfiguration<Doctor>
    {
        public void Configure(EntityTypeBuilder<Doctor> builder)
        {
            // Decimal tipli property ucun xususi olcu (precision) yazilmalidir
            builder.Property(d => d.ConsultationFee)
                   .HasColumnType("decimal(18,2)"); // Maksimum 18 reqem, 2-si vergulden sonra (mes: 99.50)

            // 1-to-1 relationship with AppUser
            builder.HasOne(d => d.AppUser)
                   .WithOne(u => u.Doctor)
                   .HasForeignKey<Doctor>(d => d.AppUserId)
                   .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
