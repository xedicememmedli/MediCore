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
    public class LabResultDetailConfiguration : IEntityTypeConfiguration<LabResultDetail>
    {
        public void Configure(EntityTypeBuilder<LabResultDetail> builder)
        {
            builder.HasOne(x => x.LabResult)
                   .WithMany(x => x.Details)
                   .HasForeignKey(x => x.LabResultId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.Property(x => x.ParameterName)
                .IsRequired().HasMaxLength(100);
            builder.Property(x => x.Value)
                .IsRequired().HasMaxLength(100);

            // Unit və ReferenceRange DB-də NOT NULL (nullable: false) yaradılıb —
            // IsRequired() olmasa EF model ilə DB arasında uyuşmazlıq yaranır
            builder.Property(x => x.Unit)
                .IsRequired()
                .HasMaxLength(50);
            builder.Property(x => x.ReferenceRange)
                .IsRequired()
                .HasMaxLength(100);
        }
    }
}
