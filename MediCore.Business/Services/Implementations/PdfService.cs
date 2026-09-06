using MediCore.Business.Services.Interfaces;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using System.IO;

namespace MediCore.Business.Services.Implementations
{
    public class PdfService : IPdfService
    {
        readonly IPrescriptionService _prescriptionService;
        readonly IEmailService _emailService;

        public PdfService(IPrescriptionService prescriptionService, IEmailService emailService)
        {
            _prescriptionService = prescriptionService;
            _emailService = emailService;
        }

        public async Task<byte[]> GeneratePrescriptionPdfAsync(int prescriptionId)
        {
            var resept = await _prescriptionService.GetByIdAsync(prescriptionId);
            if (resept == null) throw new Exception("Resept tapılmadı!");

            string patientName = $"Pasiyent: {resept.PatientName}";
            string doctorName = $"Həkim: {resept.DoctorName}";
            string date = "Tarix: " + resept.CreatedAt.ToString("dd.MM.yyyy");

            var document = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4);
                    page.Margin(2, Unit.Centimetre);
                    page.PageColor(Colors.White);
                    page.DefaultTextStyle(x => x.FontSize(12).FontFamily(Fonts.Arial));

                    // Header
                    page.Header().Row(row =>
                    {
                        row.RelativeItem().Column(column =>
                        {
                            column.Item().Text("MediCore").FontSize(24).SemiBold().FontColor(Colors.Blue.Darken4);
                            column.Item().Text("Rəsmi Tibbi Resept").FontSize(14).FontColor(Colors.Grey.Medium);
                        });

                        // Loqo hissəsi
                        string imagePath1 = Path.Combine(System.AppDomain.CurrentDomain.BaseDirectory, "logo.png");
                        string imagePath2 = Path.Combine(System.AppDomain.CurrentDomain.BaseDirectory, "logo.png.png");

                        if (File.Exists(imagePath1))
                        {
                            row.ConstantItem(100).Image(imagePath1);
                        }
                        else if (File.Exists(imagePath2))
                        {
                            row.ConstantItem(100).Image(imagePath2);
                        }
                        else
                        {
                            row.ConstantItem(100).Height(50).Placeholder();
                        }
                    });

                    // Content
                    page.Content().PaddingVertical(1, Unit.Centimetre).Column(column =>
                    {
                        column.Item().Row(row =>
                        {
                            row.RelativeItem().Text(patientName).SemiBold();
                            row.RelativeItem().Text(doctorName).SemiBold();
                            row.RelativeItem().Text(date).AlignRight();
                        });

                        column.Item().PaddingVertical(10).LineHorizontal(1).LineColor(Colors.Grey.Lighten2);
                        column.Item().PaddingBottom(10).Text("Təyin Edilən Dərmanlar:").FontSize(16).SemiBold();

                        column.Item().Table(table =>
                        {
                            table.ColumnsDefinition(columns =>
                            {
                                columns.ConstantColumn(30);
                                columns.RelativeColumn();
                                columns.RelativeColumn();
                            });

                            table.Header(header =>
                            {
                                header.Cell().Text("#").SemiBold();
                                header.Cell().Text("Dərmanın Adı").SemiBold();
                                header.Cell().Text("İstifadə Qaydası").SemiBold();
                            });

                            int index = 1;
                            foreach (var item in resept.Items)
                            {
                                table.Cell().PaddingVertical(5).BorderBottom(1).BorderColor(Colors.Grey.Lighten3).Text(index.ToString());
                                table.Cell().PaddingVertical(5).BorderBottom(1).BorderColor(Colors.Grey.Lighten3).Text(item.MedicineName ?? "-");
                                table.Cell().PaddingVertical(5).BorderBottom(1).BorderColor(Colors.Grey.Lighten3).Text(item.Dosage ?? "-");
                                index++;
                            }
                        });

                        // Möhür və İmza
                        column.Item().PaddingTop(50).Row(row =>
                        {
                            // Yumru Rəsmi Xəstəxana Möhürü - SVG ilə
                            row.ConstantItem(100).Height(100).Svg(size =>
                            {
                                var sealId = "#" + Guid.NewGuid().ToString().Substring(0, 6).ToUpper();
                                float cx = size.Width / 2;
                                float cy = size.Height / 2;
                                float r1 = (size.Width / 2) - 2;
                                float r2 = r1 - 5;
                                float r3 = r2 - 3;

                                // SVG dəyərləri əvvəlcədən hesabla
                                double topX1 = cx - r2 * 0.85;
                                double topX2 = cx + r2 * 0.85;
                                double arcR = r2 * 0.85;
                                double lineX1 = cx - r3 * 0.6;
                                double lineX2 = cx + r3 * 0.6;
                                double textY1 = cy - 5;
                                double textY2 = cy + 11;
                                double lineY1 = cy - 17;
                                double lineY2 = cy + 20;

                                return $"""
        <svg xmlns='http://www.w3.org/2000/svg' 
             width='{size.Width}' height='{size.Height}'>
          <defs>
            <path id='topArc'
              d='M {topX1},{cy} A {arcR},{arcR} 0 0,1 {topX2},{cy}'/>
            <path id='bottomArc'
              d='M {topX1},{cy} A {arcR},{arcR} 0 0,0 {topX2},{cy}'/>
          </defs>

          <circle cx='{cx}' cy='{cy}' r='{r1}'
                  fill='none' stroke='#0d1a6e' stroke-width='3'/>
          <circle cx='{cx}' cy='{cy}' r='{r2}'
                  fill='none' stroke='#0d1a6e' stroke-width='1.2'/>
          <circle cx='{cx}' cy='{cy}' r='{r3}'
                  fill='none' stroke='#0d1a6e' stroke-width='0.8'/>

          <text font-family='Arial' font-size='8' 
                font-weight='bold' fill='#0d1a6e'>
            <textPath href='#topArc' 
                      startOffset='50%' text-anchor='middle'>
              MEDICORE HOSPITAL
            </textPath>
          </text>

          <text font-family='Arial' font-size='7' fill='#1a3bb5'>
            <textPath href='#bottomArc' 
                      startOffset='50%' text-anchor='middle'>
              {sealId}
            </textPath>
          </text>

          <text x='{cx}' y='{textY1}'
                font-family='Arial' font-size='13' font-weight='900'
                fill='#0d1a6e' text-anchor='middle'>TESDİQ</text>
          <text x='{cx}' y='{textY2}'
                font-family='Arial' font-size='13' font-weight='900'
                fill='#0d1a6e' text-anchor='middle'>OLUNDU</text>

          <line x1='{lineX1}' y1='{lineY1}'
                x2='{lineX2}' y2='{lineY1}'
                stroke='#0d1a6e' stroke-width='0.8'/>
          <line x1='{lineX1}' y1='{lineY2}'
                x2='{lineX2}' y2='{lineY2}'
                stroke='#0d1a6e' stroke-width='0.8'/>
        </svg>
        """;
                            });
                            // Boşluq
                            row.RelativeItem();

                            // Sağ tərəf: Həkimin İmzası
                            row.ConstantItem(150).Column(c =>
                            {
                                c.Item().Text("Həkimin İmzası:").FontSize(10).Italic().FontColor(Colors.Grey.Medium);
                                c.Item().PaddingTop(15).LineHorizontal(1).LineColor(Colors.Black);
                                c.Item().PaddingTop(5).Text($"Dr. {resept.DoctorName}").SemiBold().FontSize(11);
                            });
                        });
                    });

                    page.Footer().AlignCenter().Text(x =>
                    {
                        x.Span("Səhifə ");
                        x.CurrentPageNumber();
                    });
                });
            });

            return document.GeneratePdf();
        }

        public async Task SendPdfToEmailBackgroundAsync(int prescriptionId, string patientEmail, string patientName)
        {
            var pdfBytes = await GeneratePrescriptionPdfAsync(prescriptionId);
            await _emailService.SendPrescriptionPdfAsync(patientEmail, patientName, pdfBytes);
        }
    }
}