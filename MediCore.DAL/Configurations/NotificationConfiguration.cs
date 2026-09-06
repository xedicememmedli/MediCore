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
    public class NotificationConfiguration : IEntityTypeConfiguration<Notification>
    {
        public void Configure(EntityTypeBuilder<Notification> builder)
        {
            builder.Property(n => n.Title)
                   .IsRequired()
                   .HasMaxLength(255);

            builder.Property(n => n.Message)
                   .IsRequired()
                   .HasMaxLength(1000);

            builder.Property(n => n.IsRead)
                   .IsRequired()
                   .HasDefaultValue(false);

            builder.HasOne(n => n.AppUser)
                   .WithMany() 
                   .HasForeignKey(n => n.AppUserId)
                   .OnDelete(DeleteBehavior.Cascade); // İstifadeci silinse, bildirisleri de silinsin
        }
    }
}
