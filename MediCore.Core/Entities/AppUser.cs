using Microsoft.AspNetCore.Identity;
using System.Text.Json.Serialization;

namespace MediCore.Core.Entities
{
    public class AppUser : IdentityUser
    {
        public string Name { get; set; } = null!;  
        public bool HasInsurance { get; set; } = false;
        public bool IsDeleted { get; set; } = false;
        public string? ProfileImageUrl { get; set; }
        public string? ProfileImagePublicId { get; set; }
        public string? InsuranceCompany { get; set; }
        public decimal WalletBalance { get; set; } = 0;

        public ICollection<Medicine> Medicines { get; set; } = new List<Medicine>();
        public ICollection<Order> Orders { get; set; } = new List<Order>();

        public Doctor? Doctor { get; set; }
        public Courier? Courier { get; set; }
        public ICollection<Consultation> PatientConsultations { get; set; } = new List<Consultation>();
        public ICollection<ChatMessage> SentMessages { get; set; } = new List<ChatMessage>();
        public ICollection<ChatMessage> ReceivedMessages { get; set; } = new List<ChatMessage>();
    }
}

