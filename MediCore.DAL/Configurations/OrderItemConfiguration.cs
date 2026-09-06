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
    public class OrderItemConfiguration : IEntityTypeConfiguration<OrderItem>
    {
        public void Configure(EntityTypeBuilder<OrderItem> builder)
        {
            builder.Property(x => x.UnitPrice)
           .HasColumnType("decimal(18,2)");

            builder.HasOne(x => x.Order)
                   .WithMany(x => x.OrderItems)
                   .HasForeignKey(x => x.OrderId)
                   .OnDelete(DeleteBehavior.NoAction);

            // Medicine silinəndə OrderItem qalsın — tarixçə itməsin
            builder.HasOne(x => x.Medicine)
                   .WithMany()
                   .HasForeignKey(x => x.MedicineId)
                   .OnDelete(DeleteBehavior.NoAction);
        }
    }
}

