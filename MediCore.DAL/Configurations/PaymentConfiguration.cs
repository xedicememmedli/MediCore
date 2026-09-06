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
    public class PaymentConfiguration : IEntityTypeConfiguration<Payment>
    {
        public void Configure(EntityTypeBuilder<Payment> builder)
        {
            builder.Property(p => p.Amount)
                   .HasColumnType("decimal(18,2)"); // Maksimum 18 rəqəm, 2-si vergüldən sonra

            builder.HasOne(p => p.AppUser)
                   .WithMany() // Əgər AppUser içində public ICollection<Payment> Payments yazmısansa bura .WithMany(u => u.Payments) yaz
                   .HasForeignKey(p => p.AppUserId)
                   .OnDelete(DeleteBehavior.Cascade); // User silinəndə ödənişləri də silinsin
        }
    }
}
