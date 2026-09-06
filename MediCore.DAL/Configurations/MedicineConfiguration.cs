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
    public class MedicineConfiguration : IEntityTypeConfiguration<Medicine>
    {
        public void Configure(EntityTypeBuilder<Medicine> builder)
        {
            builder.Property(x => x.Name).IsRequired();
            builder.Property(x => x.Description).IsRequired();

            builder.Property(m => m.Price)
                .IsRequired()
                .HasColumnType("decimal(18,2)");


            // AppUser silinəndə dərmanlar silinməsin — OrderItem, PrescriptionItem, BasketItem bağlıdır
            builder.HasOne(x => x.User)
                .WithMany(u => u.Medicines)
                .HasForeignKey(x => x.AppUserId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
