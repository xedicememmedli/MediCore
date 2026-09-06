using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCore.Business.DTOs.User
{
    public class UserProfileDto
    {
        public string Id { get; set; } = null!;
        public string Name { get; set; } = null!;
        public string UserName { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string? ProfileImageUrl { get; set; }
        public IList<string> Roles { get; set; } = new List<string>();
        public decimal WalletBalance { get; set; }
        public bool HasInsurance { get; set; }
    }
}

