using MediCore.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
namespace MediCore.DAL.Configurations
{
    internal class SettingConfiguration : IEntityTypeConfiguration<Setting>
    {
        public void Configure(EntityTypeBuilder<Setting> builder)
        {
            builder
                .Property(s => s.Key)
                .IsRequired()
                .HasMaxLength(256);

            builder
                .HasIndex(s => s.Key)
                .IsUnique();

            builder
                .Property(s => s.Value)
                .IsRequired()
                .HasMaxLength(1024);
        }
    }
}
