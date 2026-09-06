using MediCore.Core.Entities.Common;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace MediCore.DAL.Repositories.Interfaces
{
    public interface IRepository<TEntity> where TEntity : BaseEntity, new()
    {
        public DbSet<TEntity> Table {  get; }
        public Task<TEntity> GetbyId(int id, params string[] includes);
        public IQueryable<TEntity> GetAll(params string[] includes);
        public IQueryable<TEntity> FindAll(Expression<Func<TEntity,bool>>expression);
        public Task<TEntity> CreateAsync(TEntity entity);
        public void Update(TEntity entity);
        public void Delete(TEntity entity);
        public void SoftDelete(TEntity entity);
        public void Restore(TEntity entity);
        public Task<int> SaveChangesAsync();
        public Task<bool> IsExsist(Expression<Func<TEntity, bool>> predicate);
    }
}
