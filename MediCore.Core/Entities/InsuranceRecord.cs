namespace MediCore.Core.Entities
{
    public class InsuranceRecord
    {
        public int Id { get; set; }
        public string InsuranceNumber { get; set; } = null!;
        public bool IsUsed { get; set; } = false;
    }
}
