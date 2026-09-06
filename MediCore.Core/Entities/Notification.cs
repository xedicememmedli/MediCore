using MediCore.Core.Entities.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCore.Core.Entities
{
    public class Notification : BaseEntity
    {
        public string AppUserId { get; set; }
        public AppUser AppUser { get; set; }

        // Bildirisin basligi ve esas metni
        public string Title { get; set; }
        public string Message { get; set; }

        // Bildiris oxunubmu?
        public bool IsRead { get; set; } = false;

        // Eger bildiris spesifik bir sifarise aiddirse (Meselen, kuryere sifaris dusende birbasa o sifarisin ID-sini yadda saxlamaq ucun)
        public int? OrderId { get; set; }
    }
}
