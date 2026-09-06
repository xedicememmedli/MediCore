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
    public class CourierConfiguration : IEntityTypeConfiguration<Courier>
    {
        public void Configure(EntityTypeBuilder<Courier> builder)
        {
  
            builder.HasOne(c => c.AppUser)
                   .WithOne(u => u.Courier)
                   .HasForeignKey<Courier>(c => c.AppUserId)
                   .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
