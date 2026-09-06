using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCore.Business.DTOs.User
{
    public class ResetPasswordDto
    {
        public string Email { get; set; } = null!;
        public string Token { get; set; } = null!; // Gmaile gelen kod
        public string NewPassword { get; set; } = null!;
    }
}
