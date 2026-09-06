using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCore.Core.Enums
{
    public enum OrderStatus
    {
        Pending = 1,     // Sifariş verildi
        Preparing = 2,   // Aptek hazırlayır
        Shipping = 3,    // Kuryer aparır
        Delivered = 4,   // Çatdırıldı
        Canceled = 5,    // Ləğv edildi
        PendingPrescription = 6, // Resept yoxlanılır (Admin təsdiqi gözləyir)
        PendingPayment = 7       // Ödəniş gözlənilir
    }
}

