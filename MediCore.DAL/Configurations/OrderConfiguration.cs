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
    public class OrderConfiguration : IEntityTypeConfiguration<Order>
    {
        public void Configure(EntityTypeBuilder<Order> builder)
        {
            builder.Property(x => x.TotalPrice)
                   .HasColumnType("decimal(18,2)");

            
            builder.Property(x => x.ShippingAddress)
                   .IsRequired()
                   .HasMaxLength(500);

           
            builder.Property(x => x.PhoneNumber)
                   .IsRequired()
                   .HasMaxLength(25);

         
            builder.HasOne(x => x.AppUser)
                   .WithMany(x => x.Orders)
                   .HasForeignKey(x => x.AppUserId)
                   .OnDelete(DeleteBehavior.NoAction);
        }
    }
}
