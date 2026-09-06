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
    public class BasketItemConfiguration : IEntityTypeConfiguration<BasketItem>
    {
        public void Configure(EntityTypeBuilder<BasketItem> builder)
        {
            
            builder.Property(x => x.UnitPrice)
                   .HasColumnType("decimal(18,2)");

            // Derman silinende sebet elementi avtomatik silinmesin (dövreye girmesin)
            builder.HasOne(x => x.Medicine)
                   .WithMany()
                   .HasForeignKey(x => x.MedicineId)
                   .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
