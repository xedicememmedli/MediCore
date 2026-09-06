using MediCore.Core.Entities.Common;

namespace MediCore.Core.Entities;

public class Setting : BaseEntity
{
    public string Key { get; set; }
    public string Value { get; set; }
}
