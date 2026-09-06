using MediCore.Core.Entities;
namespace MediCore.DAL.Repositories.Interfaces
{
    public interface ISettingRepository : IRepository<Setting>
    {
        public Task<Setting> GetByKey(string key);
    }
}
