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
    public class BasketConfiguration : IEntityTypeConfiguration<Basket>
    {
        public void Configure(EntityTypeBuilder<Basket> builder)
        {
            //Eger istifadeci (AppUser) silinerse, ona aid olan sebet de silinsin
            builder.HasOne(x => x.AppUser)
                   .WithMany()
                   .HasForeignKey(x => x.AppUserId)
                   .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
