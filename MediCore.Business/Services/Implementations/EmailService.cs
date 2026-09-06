using MediCore.Business.Services.Interfaces;
using MediCore.Business.Settings;
using Microsoft.Extensions.Options;
using System;
using System.IO;
using System.Net;
using System.Net.Mail;
using System.Threading.Tasks;

namespace MediCore.Business.Services.Implementations
{
    public class EmailService : IEmailService
    {
        private readonly MailSettings _mailSettings;

        public EmailService(IOptions<MailSettings> mailSettings)
        {
            _mailSettings = mailSettings.Value;
        }

        private string GetHtmlTemplate(string title, string content)
        {
            return $@"
            <div style='font-family: Arial, sans-serif; background-color: #f4f7f6; padding: 20px; color: #333;'>
                <div style='max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 8px rgba(0,0,0,0.1);'>
                    <div style='background-color: #003366; color: #ffffff; padding: 20px; text-align: center;'>
                        <h1 style='margin: 0; font-size: 24px; letter-spacing: 1px;'>MediCore Hospital</h1>
                    </div>
                    <div style='padding: 30px; line-height: 1.6; font-size: 16px;'>
                        <h2 style='color: #003366; font-size: 20px; margin-top: 0;'>{title}</h2>
                        {content}
                    </div>
                    <div style='background-color: #eeeeee; padding: 15px; text-align: center; color: #777777; font-size: 12px;'>
                        © {DateTime.Now.Year} MediCore Hospital. Bütün hüquqlar qorunur.<br>
                        Bu avtomatik mesajdır, xahiş edirik cavablandırmayın.
                    </div>
                </div>
            </div>";
        }

        private SmtpClient CreateSmtpClient()
        {
            return new SmtpClient(_mailSettings.Host, _mailSettings.Port)
            {
                Credentials = new NetworkCredential(_mailSettings.Email, _mailSettings.Password),
                EnableSsl = true
            };
        }

        public async Task SendPrescriptionPdfAsync(string toEmail, string patientName, byte[] pdfBytes)
        {
            MailMessage mail = new MailMessage(_mailSettings.Email, toEmail)
            {
                Subject = "MediCore - Rəsmi Tibbi Reseptiniz 💊",
                IsBodyHtml = true
            };

            string content = $@"
                <p>Salam Hörmətli <strong>{patientName}</strong>,</p>
                <p>Həkim qəbulunuzdan sonra təyin edilən dərmanların rəsmi reseptini PDF formatında bu məktuba əlavə etmişik.</p>
                <p style='padding: 15px; background-color: #e6f0fa; border-left: 4px solid #003366; margin: 20px 0;'>
                    Dərmanlarınızı vaxtında və həkimin təyinatına uyğun qəbul etməyinizi xahiş edirik.
                </p>
                <p>Tezliklə sağalmağınızı diləyirik!</p>";

            mail.Body = GetHtmlTemplate("Tibbi Resept", content);

            using var stream = new MemoryStream(pdfBytes);
            mail.Attachments.Add(new Attachment(stream, "Resept.pdf", "application/pdf"));

            using SmtpClient smtp = CreateSmtpClient();
            await smtp.SendMailAsync(mail);
        }

       public async Task SendWelcomeEmailAsync(string toEmail, string fullName, string role)
        {
            MailMessage mail = new MailMessage(_mailSettings.Email, toEmail)
            {
                Subject = "MediCore Platforması - Qeydiyyatınız Təsdiqləndi",
                IsBodyHtml = true
            };

            var (title, content) = role switch
            {
                "Doctor" => (
                    "Həkim Profiliniz Yaradıldı", 
                    $@"
            <p>Salam Hörmətli <strong>Dr. {fullName}</strong>,</p>
            <p>MediCore rəqəmsal idarəetmə sistemində həkim profiliniz uğurla yaradıldı.</p>
            <p>Platformamız vasitəsilə qəbullarınızı izləyə, xəstə tarixçələrinə baxa və onlayn reseptlər yaza bilərsiniz. İş prosesinizdə uğurlar arzulayırıq!</p>"
                ),

                "Courier" => (
                    "Kuryer Profiliniz Aktivləşdirildi", 
                    $@"
            <p>Salam Hörmətli <strong>{fullName}</strong>,</p>
            <p>MediCore çatdırılma sistemində kuryer profiliniz aktivləşdirildi.</p>
            <p>Artıq mobil tətbiq üzərindən xəstələrin dərman sifarişlərini qəbul edə və çatdırılma prosesini xəritə üzərindən idarə edə bilərsiniz. Təhlükəsiz yollar!</p>"
                ),

                _ => ( 
                    "Qeydiyyatınız Tamamlandı", 
                    $@"
            <p>Salam Hörmətli <strong>{fullName}</strong>,</p>
            <p>MediCore platformasında hesabınız uğurla yaradılmışdır.</p>
            <p>Rəqəmsal xidmətimiz vasitəsilə asanlıqla həkim qəbuluna yazıla, analiz cavablarınızı izləyə və evinizə dərman sifariş edə bilərsiniz. Sağlamlığınızı bizə etibar etdiyiniz üçün təşəkkür edirik!</p>"
                )
            };

            mail.Body = GetHtmlTemplate(title, content);


            using SmtpClient smtp = CreateSmtpClient();
            await smtp.SendMailAsync(mail);
        }

        public async Task SendAppointmentToPatientAsync(string toEmail, string patientName, string doctorName, DateTime date, string paymentUrl)
        {
            MailMessage mail = new MailMessage(_mailSettings.Email, toEmail)
            {
                Subject = "MediCore Hospital - Qəbul Üçün Ödəniş Gözlənilir 💳",
                IsBodyHtml = true
            };

            string content = $@"
                <p>Salam Hörmətli <strong>{patientName}</strong>,</p>
                <p>Sizin aşağıdakı detallara əsasən həkim qəbulunuz qeydə alınmışdır:</p>
                <table style='width: 100%; border-collapse: collapse; margin: 20px 0;'>
                    <tr><td style='padding: 8px; border-bottom: 1px solid #ddd;'><strong>Həkim:</strong></td><td style='padding: 8px; border-bottom: 1px solid #ddd;'>Dr. {doctorName}</td></tr>
                    <tr><td style='padding: 8px; border-bottom: 1px solid #ddd;'><strong>Tarix:</strong></td><td style='padding: 8px; border-bottom: 1px solid #ddd;'>{date.ToString("dd.MM.yyyy")}</td></tr>
                    <tr><td style='padding: 8px; border-bottom: 1px solid #ddd;'><strong>Saat:</strong></td><td style='padding: 8px; border-bottom: 1px solid #ddd;'>{date.ToString("HH:mm")}</td></tr>
                </table>
                <p>Qəbulu tam təsdiqləmək üçün zəhmət olmasa aşağıdakı düyməyə klikləyərək ödənişi həyata keçirin:</p>
                <div style='text-align: center; margin: 30px 0;'>
                    <a href='{paymentUrl}' style='background-color: #003366; color: #ffffff; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px; display: inline-block;'>Ödəniş Et (30 AZN)</a>
                </div>
                <p style='font-size: 14px; color: #777;'>Ödənişdən sonra zəhmət olmasa təyin olunmuş vaxtdan 15 dəqiqə əvvəl xəstəxanaya yaxınlaşın.</p>";

            mail.Body = GetHtmlTemplate("Ödəniş Tələbi", content);

            using SmtpClient smtp = CreateSmtpClient();
            await smtp.SendMailAsync(mail);
        }

        public async Task SendAppointmentToDoctorAsync(string toEmail, string doctorName, string patientName, DateTime date)
        {
            MailMessage mail = new MailMessage(_mailSettings.Email, toEmail)
            {
                Subject = "MediCore Hospital - Yeni Pasiyent Qəbulu 📅",
                IsBodyHtml = true
            };

            string content = $@"
                <p>Salam <strong>Dr. {doctorName}</strong>,</p>
                <p>Sizin qəbulunuza yeni bir xəstə yazıldı. Detallar aşağıdadır:</p>
                <div style='background-color: #f9f9f9; border-left: 4px solid #003366; padding: 15px; margin: 20px 0;'>
                    <p style='margin: 0 0 10px 0;'><strong>Pasientin Adı:</strong> {patientName}</p>
                    <p style='margin: 0;'><strong>Tarix və Saat:</strong> {date.ToString("dd.MM.yyyy HH:mm")}</p>
                </div>
                <p>Sizə uğurlu iş günü diləyirik!</p>";

            mail.Body = GetHtmlTemplate("Yeni Qəbul Təyinatı", content);

            using SmtpClient smtp = CreateSmtpClient();
            await smtp.SendMailAsync(mail);
        }

        public async Task SendLabResultReadyEmailAsync(string toEmail, string patientName)
        {
            MailMessage mail = new MailMessage(_mailSettings.Email, toEmail)
            {
                Subject = "MediCore Hospital - Laboratoriya Nəticələriniz Hazırdır 🔬",
                IsBodyHtml = true
            };

            string content = $@"
                <p>Salam Hörmətli <strong>{patientName}</strong>,</p>
                <p>Sizin laboratoriya analiz nəticələriniz artıq hazırdır və sistemə yüklənmişdir.</p>
                <p>Göstəricilərinizlə tanış olmaq üçün MediCore sisteminə daxil olaraq 'Mənim Analizlərim' bölməsinə keçid edə bilərsiniz.</p>
                <div style='text-align: center; margin: 30px 0;'>
                    <a href='#' style='background-color: #003366; color: #ffffff; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px; display: inline-block;'>Sistemə Daxil Ol</a>
                </div>
                <p>Sağlamlığınızı bizə etibar etdiyiniz üçün təşəkkür edirik!</p>";

            mail.Body = GetHtmlTemplate("Analiz Cavabları", content);

            using SmtpClient smtp = CreateSmtpClient();
            await smtp.SendMailAsync(mail);
        }

        public async Task SendPasswordResetEmailAsync(string toEmail, string userName, string token)
        {
            MailMessage mail = new MailMessage(_mailSettings.Email, toEmail)
            {
                Subject = "MediCore Hospital - Şifrə Sıfırlama Kodu 🔐",
                IsBodyHtml = true
            };

            string content = $@"
        <p>Salam Hörmətli <strong>{userName}</strong>,</p>
        <p>Sizin MediCore sistemindəki hesabınız üçün şifrə sıfırlama müraciəti daxil olmuşdur.</p>
        <p>Yeni şifrə təyin etmək üçün aşağıdakı təsdiq kodundan istifadə edə bilərsiniz:</p>
        
        <div style='text-align: center; margin: 30px 0;'>
            <span style='background-color: #f8f9fa; color: #003366; padding: 15px 30px; border: 2px dashed #003366; border-radius: 8px; font-weight: bold; font-size: 24px; letter-spacing: 5px; display: inline-block;'>
                {token}
            </span>
        </div>
        
        <p style='color: #d9534f; font-size: 14px; font-weight: bold;'>
            * Təhlükəsizliyiniz üçün bu kodu heç kimlə paylaşmayın. Əgər bu şifrə yeniləmə müraciətini siz etməmisinizsə, xaiş edirik bu mesajı nəzərə almayın.
        </p>
        <p>Sağlamlığınızı və təhlükəsizliyinizi bizə etibar etdiyiniz üçün təşəkkür edirik!</p>";

            mail.Body = GetHtmlTemplate("Şifrə Sıfırlama", content);

            using SmtpClient smtp = CreateSmtpClient();
            await smtp.SendMailAsync(mail);
        }

        public async Task SendEmailAsync(string toEmail, string subject, string body)
        {
            MailMessage mail = new MailMessage(_mailSettings.Email, toEmail)
            {
                Subject = subject,
                IsBodyHtml = true
            };
            mail.Body = GetHtmlTemplate(subject, body);

            using SmtpClient smtp = CreateSmtpClient();
            await smtp.SendMailAsync(mail);
        }
    }
}