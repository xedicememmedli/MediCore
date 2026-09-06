using MediCore.Core.Entities.Common;
using MediCore.DAL.Context;
using MediCore.DAL.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace MediCore.DAL.Repositories.Implementations
{
    public class Repository<TEntity> : IRepository<TEntity> where TEntity : BaseEntity, new()
    {
        readonly AppDbContext _context;
        public Repository(AppDbContext context)
        {
            _context = context;
        }
        public DbSet<TEntity> Table => _context.Set<TEntity>();

        public async Task<TEntity> CreateAsync(TEntity entity)
        {
            await Table.AddAsync(entity);
            return entity;
        }

        public void Delete(TEntity entity)
        {
            Table.Remove(entity);
        }

        public IQueryable<TEntity> FindAll(Expression<Func<TEntity, bool>> expression)
        {
            return Table.Where(expression);

        }

        public IQueryable<TEntity> GetAll(params string[] includes)
        {
            var query = Table.Where(x => !x.IsDeleted);
            if (includes != null)
            {
                foreach (var include in includes)
                {
                    query = query.Include(include);
                }
            }
            return query;
        }

        public async Task<TEntity> GetbyId(int id, params string[] includes)
        {
            TEntity entity;

            if (includes.Count() > 0)
            {
                entity = await GetAll(includes).AsNoTracking().FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted);

            }
            else
            {

                entity = 
                    
                    
                    
                    
                    
                    
                    
                    
                    
                    
                    
                    
                    
                    
                    
                    await Table.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted);
            }
                

            return entity;
        }

        public async Task<int> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync();
        }

        public void Update(TEntity entity)
        {
            Table.Update(entity);
        }
        public async Task<bool> IsExsist(Expression<Func<TEntity, bool>> predicate)
        {
            return await Table.AnyAsync(predicate);
        }

        public void SoftDelete(TEntity entity)
        {
            entity.IsDeleted = true;
            Table.Update(entity);
        }

        public void Restore(TEntity entity)
        {
            entity.IsDeleted = false;
            Table.Update(entity);
        }
    }
}
