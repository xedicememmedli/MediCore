using MediCore.Business.DTOs;
using MediCore.Business.Services.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace MediCore.Business.Services.Implementations
{
    public class AiService : IAiService
    {
        private readonly IConfiguration _configuration;
        private readonly HttpClient _httpClient;

        public AiService(IConfiguration configuration, HttpClient httpClient)
        {
            _configuration = configuration;
            _httpClient = httpClient;
        }

        // ==========================================
        // 1-Cİ METOD: RESEPT ANALİZİ 
        // ==========================================
        public async Task<AiPrescriptionResultDto> AnalyzePrescriptionAsync(IFormFile photo)
        {
            var apiKey = _configuration["GeminiAI:ApiKey"];
            var url = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={apiKey}";

            using var ms = new MemoryStream();
            await photo.CopyToAsync(ms);
            var base64Image = Convert.ToBase64String(ms.ToArray());
            var mimeType = photo.ContentType;

            var requestBody = new
            {
                contents = new[]
                {
                    new
                    {
                        parts = new object[]
                        {
                            new { text = "Sən professional tibbi köməkçisən. Sənə göndərilən bu faylı (şəkil və ya PDF) analiz et. Əgər bu sənəd tibbi resept deyilsə (məsələn, pişik, mənzərə, selfie, boş mətn və s.) IsValidPrescription dəyərini false et və ErrorMessage hissəsinə 'Bu etibarlı bir tibbi resept deyil' yaz. Əgər reseptdirsə, xəstənin adını, dərmanın adını, həkimin icazə verdiyi qutu sayını (yalnız rəqəmlə), tarixi və reseptin unikal nömrəsini (barkod və ya sənəd nömrəsi) tap. Əgər reseptin xüsusi nömrəsi yoxdursa, xəstə adı, tarix və həkim adını birləşdirib unikal bir ID (DocumentNumber) yarat. Əgər sənəd tibbi reseptdirsə, amma yazılar çox bulanıq olduğu üçün oxuya bilmirsənsə, IsValidPrescription dəyərini true, amma ErrorMessage hissəsinə 'Oxunmur' yaz. Nəticəni başqa heç bir söz yazmadan yalnız bu JSON formatında qaytar: {\"IsValidPrescription\": true, \"DocumentNumber\": \"RES-12345\", \"MedicineName\": \"Dərman Adı\", \"AllowedQuantity\": 2, \"PatientName\": \"Xəstə Adı\", \"Date\": \"Tarix\", \"ErrorMessage\": null}" },
                            new { inline_data = new { mime_type = mimeType, data = base64Image } }
                        }
                    }
                }
            };

            var response = await _httpClient.PostAsJsonAsync(url, requestBody);
            var responseString = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
                throw new Exception("Süni intellektlə əlaqə qurularkən xəta baş verdi. Zəhmət olmasa biraz sonra yenidən yoxlayın.");

            using var doc = JsonDocument.Parse(responseString);
            var textResult = doc.RootElement
                .GetProperty("candidates")[0]
                .GetProperty("content")
                .GetProperty("parts")[0]
                .GetProperty("text").GetString();

            if (!string.IsNullOrEmpty(textResult))
            {
                textResult = textResult.Replace("```json", "").Replace("```", "").Trim();
            }

            var finalResult = JsonSerializer.Deserialize<AiPrescriptionResultDto>(textResult, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

            return finalResult ?? new AiPrescriptionResultDto { IsValidPrescription = false, ErrorMessage = "Analiz zamanı gözlənilməz xəta baş verdi." };
        }

        // ==========================================
        // 2-Cİ METOD: VİRTUAL ƏCZAÇI VƏ CHAT 
        // ==========================================
        public async Task<ChatResponseDto> AskVirtualPharmacistAsync(ChatRequestDto dto)
        {
            string lang = dto.Language?.ToLower() ?? "az";

            string emptyMessageError = lang switch
            {
                "en" => "Please write your question. 💊",
                "ru" => "Пожалуйста, напишите ваш вопрос. 💊",
                "tr" => "Lütfen sorunuzu yazın. 💊",
                _ => "Zəhmət olmasa mənə sualınızı yazın. 💊"
            };

            if (string.IsNullOrWhiteSpace(dto.Message))
            {
                return new ChatResponseDto { Response = emptyMessageError };
            }

            string systemPrompt = @"Sən 'MediCore' aptekinin rəsmi Virtual Əczaçısısan. Adın 'MediBot'-dur. 
Xarakterin: Çox nəzakətli, empati quran, səbirli və peşəkar.
Dil: İSTİFADƏÇİ SƏNƏ HANSI DİLDƏ YAZIRSA, SƏN DƏ TAM OLARAQ HƏMİN DİLDƏ CAVAB VER.

Qaydalar:
1. Dərmanların təyinatı, tərkibi və əlavə təsirləri barədə məlumat ver.
2. Yüngül simptomlar üçün aptek məhsulları məsləhət gör. Dərman məsləhət görərkən HƏMİŞƏ soruş: 'Bəs sizin hər hansı bir dərmana qarşı allergiyanız varmı?'
3. Çarpaz Satış: Müştəriyə əlavə uyğun məhsullar da təklif et.
4. QEYRİ-TİBBİ SUALLAR: Siyasət, idman, tarix kimi suallara cavab vermə.
5. Sən həkim deyilsən! Dəqiq diaqnoz qoya bilməzsən.
6. TƏCİLİ HALLAR: Təhlükə barədə yazarsa, təcili yardıma zəng etməyi tapşır.
7. FORMAT: Cavablarını maksimum 3-4 cümlədə, qısa və konkret yaz. Uzun izahat vermə. Yalnız ən vacib məlumatı ver.
8. SONLUQ: Sonda istifadəçiyə xatırlat ki, məhsulu saytdan axtarıb səbətə atsın.";

            var apiKey = _configuration["GeminiAI:ApiKey"];
            var apiUrl = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={apiKey}";

            var systemInstruction = new { parts = new[] { new { text = systemPrompt } } };

            var contentsList = new List<object>();

            if (dto.History != null && dto.History.Any())
            {
                foreach (var item in dto.History)
                {
                    contentsList.Add(new
                    {
                        role = (item.Role?.ToLower() == "model" || item.Role?.ToLower() == "ai") ? "model" : "user",
                        parts = new[] { new { text = item.Text } }
                    });
                }
            }

            contentsList.Add(new
            {
                role = "user",
                parts = new[] { new { text = dto.Message } }
            });

            var payload = new
            {
                system_instruction = systemInstruction,
                contents = contentsList
            };

            var jsonPayload = JsonSerializer.Serialize(payload);
            var content = new StringContent(jsonPayload, Encoding.UTF8, "application/json");

            var response = await _httpClient.PostAsync(apiUrl, content);

            if (!response.IsSuccessStatusCode)
            {
                return new ChatResponseDto { Response = "Üzr istəyirəm, hazırda sistemdə qısa fasilə var. Zəhmət olmasa bir az sonra yenidən cəhd edin. 🛠️" };
            }

            var responseString = await response.Content.ReadAsStringAsync();
            using JsonDocument doc = JsonDocument.Parse(responseString);

            try
            {
                var aiText = doc.RootElement
                                .GetProperty("candidates")[0]
                                .GetProperty("content")
                                .GetProperty("parts")[0]
                                .GetProperty("text")
                                .GetString();

                return new ChatResponseDto { Response = aiText };
            }
            catch
            {
                return new ChatResponseDto { Response = "Sualınızı tam anlaya bilmədim, lütfən yenidən yazın. 🩺" };
            }
        }

        // ==========================================
        // 3-CÜ METOD: LABORATORİYA NƏTİCƏLƏRİNİN İZAHI
        // ==========================================
        public async Task<ChatResponseDto> ExplainLabResultAsync(string labResultData, string language = "az")
        {
            if (string.IsNullOrWhiteSpace(labResultData))
            {
                return new ChatResponseDto { Response = "Analiz nəticələri tapılmadı." };
            }

            string systemPrompt = @"Sən çox savadlı və şəfqətli tibbi assistentsən. 
Pasiyent sənə öz laboratoriya analizinin nəticələrini göndərir. 
Sənin vəzifən bu rəqəmləri və tibbi terminləri pasiyentin anlayacağı çox sadə, gündəlik dildə izah etməkdir.

Qaydalar:
1. Əgər hər hansı bir dəyər normadan (Referans aralığından) yuxarı və ya aşağıdırsa, bunun ümumiyyətlə nədən qaynaqlana biləcəyini qısaca izah et.
2. QƏTİ QADAĞANDIR: Sən xəstəyə qəti diaqnoz qoya bilməzsən.
3. DƏRMAN YAZMAQ QADAĞANDIR: Pasiyentə heç bir dərman və ya müalicə təyin etmə.
4. FORMAT: Cavabını qısa, bəndlərlə (bullet points) və ürəkrahatladıcı bir tonda ver.
5. SONLUQ: Mətnin sonuna MÜTLƏQ bu cümləni əlavə et: 'Diqqət: Bu sadəcə ilkin məlumatdır. Dəqiq diaqnoz və müalicə üçün zəhmət olmasa həkiminizlə (Klinika bölməsindən) əlaqə saxlayın.'";

            var apiKey = _configuration["GeminiAI:ApiKey"];
            var apiUrl = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={apiKey}";

            var systemInstruction = new { parts = new[] { new { text = systemPrompt } } };

            var payload = new
            {
                system_instruction = systemInstruction,
                contents = new[]
                {
                    new
                    {
                        role = "user",
                        parts = new[] { new { text = $"Zəhmət olmasa bu laboratoriya nəticələrini {language} dilində sadə dildə mənə izah et:\n\n{labResultData}" } }
                    }
                }
            };

            var jsonPayload = JsonSerializer.Serialize(payload);
            var content = new StringContent(jsonPayload, Encoding.UTF8, "application/json");

            var response = await _httpClient.PostAsync(apiUrl, content);

            if (!response.IsSuccessStatusCode)
            {
                return new ChatResponseDto { Response = "Sistemdə xəta baş verdi. Zəhmət olmasa nəticələrinizi birbaşa həkiminizə göstərin." };
            }

            var responseString = await response.Content.ReadAsStringAsync();
            using JsonDocument doc = JsonDocument.Parse(responseString);

            try
            {
                var aiText = doc.RootElement
                                .GetProperty("candidates")[0]
                                .GetProperty("content")
                                .GetProperty("parts")[0]
                                .GetProperty("text")
                                .GetString();

                return new ChatResponseDto { Response = aiText };
            }
            catch
            {
                return new ChatResponseDto { Response = "Nəticələrinizi oxuyarkən çətinlik çəkdim. Lütfən həkiminizlə məsləhətləşin." };
            }
        }
    }
}