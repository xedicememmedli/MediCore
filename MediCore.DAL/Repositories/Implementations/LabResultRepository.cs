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
    public class LabResultRepository : Repository<LabResult>, ILabResultRepository
    {
        public LabResultRepository(AppDbContext context) : base(context)
        {
        }
    }
}
