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
    public class PrescriptionItemRepository : Repository<PrescriptionItem>, IPrescriptionItemRepository
    {
        public PrescriptionItemRepository(AppDbContext context) : base(context)
        {
        }
    }
}
