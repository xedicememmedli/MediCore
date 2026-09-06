using MediCore.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace MediCore.DAL.Configurations
{
    public class InsuranceRecordConfiguration : IEntityTypeConfiguration<InsuranceRecord>
    {
        public void Configure(EntityTypeBuilder<InsuranceRecord> builder)
        {
            builder.HasData(
                new InsuranceRecord { Id = 1, InsuranceNumber = "AZ-2024-100001", IsUsed = false },
                new InsuranceRecord { Id = 2, InsuranceNumber = "AZ-2024-100002", IsUsed = false },
                new InsuranceRecord { Id = 3, InsuranceNumber = "AZ-2024-100003", IsUsed = false },
                new InsuranceRecord { Id = 4, InsuranceNumber = "AZ-2024-100004", IsUsed = false },
                new InsuranceRecord { Id = 5, InsuranceNumber = "AZ-2024-100005", IsUsed = false },
                new 




InsuranceRecord { Id = 6, InsuranceNumber = "AZ-2024-100006", IsUsed = false },
                new InsuranceRecord { Id = 7, InsuranceNumber = "AZ-2024-100007", IsUsed = false },
                new InsuranceRecord { Id = 8, InsuranceNumber = "AZ-2024-100008", IsUsed = false },
                new InsuranceRecord { Id = 9, InsuranceNumber = "AZ-2024-100009", IsUsed = false },
                new InsuranceRecord { Id = 10, InsuranceNumber = "AZ-2024-100010", IsUsed = false }
            );
        }
    






}
}
