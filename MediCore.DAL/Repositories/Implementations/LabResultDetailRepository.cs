using MediCore.Core.Entities;
using MediCore.DAL.Context;
using MediCore.DAL.Repositories.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCore.DAL.Repositories.Implementations
{
     public class LabResultDetailRepository : Repository<LabResultDetail>, ILabResultDetailRepository
    {
        public LabResultDetailRepository(AppDbContext context) : base(context)
        {
        }
    }
}
