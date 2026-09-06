using Hangfire;
using MediCore.API.BackgroundJobs;
using MediCore.API.Extensions;
using MediCore.API.Hubs;
using MediCore.API.Middlewares;
using MediCore.Business;
using MediCore.Business.Services.Implementations;
using MediCore.Business.Services.Interfaces;
using MediCore.Business.Settings;
using MediCore.Core.Entities;
using MediCore.DAL;
using MediCore.DAL.Context;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Stripe;
using System.Text;

namespace MediCore.API
{
    public class Program
    {
        public static async Task Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            QuestPDF.Settings.License = QuestPDF.Infrastructure.LicenseType.Community;

            builder.Services.AddControllers();
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSignalR();

            builder.Services.AddHangfire(config =>
                config.UseSqlServerStorage(builder.Configuration.GetConnectionString("Default")));
            builder.Services.AddHangfireServer();

            builder.Services.AddScoped<MedicineExpirationJob>();
            builder.Services.AddScoped<BasketCleanupJob>();
            builder.Services.AddScoped<ConsultationReminderJob>();
            builder.Services.AddScoped<WeeklyReportJob>();

            builder.Services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v1", new OpenApiInfo { Title = "JWTToken_Auth_API", Version = "v1" });

                c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
                {
                    Description = "Sadece JWT tokeni bura yapişdirin (Bearer yazmaga ehtiyac yoxdur).",
                    Name = "Authorization",
                    In = ParameterLocation.Header,
                    Type = SecuritySchemeType.Http,
                    Scheme = "Bearer",
                    BearerFormat = "JWT"
                });

                c.AddSecurityRequirement(new OpenApiSecurityRequirement
                {
                    {
                        new OpenApiSecurityScheme
                        {
                            Reference = new OpenApiReference
                            {
                                Type = ReferenceType.SecurityScheme,
                                Id = "Bearer"
                            }
                        },
                        Array.Empty<string>()
                    }
                });
            });

            builder.Services.AddBusinessService();
            builder.Services.AddScoped<IPhotoService, PhotoService>();
            builder.Services.AddScoped<INotificationSender, NotificationSender>();
            builder.Services.Configure<MailSettings>(builder.Configuration.GetSection("MailSettings"));
            builder.Services.Configure<CloudinarySettings>(builder.Configuration.GetSection("CloudinarySettings"));
            builder.Services.AddDALService();
            builder.Services.AddHttpContextAccessor();

            builder.Services.AddIdentity<AppUser, IdentityRole>(opt =>
            {
                opt.Password.RequireNonAlphanumeric = false;
                opt.Password.RequiredLength = 6;
            }).AddEntityFrameworkStores<AppDbContext>().AddDefaultTokenProviders();

            builder.Services.AddDbContext<AppDbContext>(opt =>
            {
                opt.UseSqlServer(builder.Configuration.GetConnectionString("Default"));
            });

            builder.Services.AddAuthentication(opt =>
            {
                opt.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                opt.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            }).AddJwtBearer(opt =>
            {
                opt.TokenValidationParameters = new TokenValidationParameters()
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = builder.Configuration["Jwt:Issuer"],
                    ValidAudience = builder.Configuration["Jwt:Audience"],
                    IssuerSigningKey = new SymmetricSecurityKey(
                        Encoding.UTF8.GetBytes(builder.Configuration["Jwt:SecurityKey"]))
                };

                // FIX: SignalR WebSocket üçün JWT token dəstəyi əlavə edildi.
                // Browser WebSocket-dən Authorization header göndərə bilmir,
                // ona görə token query string-dən oxunur: ?access_token=...
                opt.Events = new JwtBearerEvents
                {
                    OnMessageReceived = context =>
                    {
                        var accessToken = context.Request.Query["access_token"];
                        var path = context.HttpContext.Request.Path;

                        if (!string.IsNullOrEmpty(accessToken) &&
                            (path.StartsWithSegments("/chathub") ||
                             path.StartsWithSegments("/notificationHub")))
                        {
                            context.Token = accessToken;
                        }

                        return Task.CompletedTask;
                    }
                };
            });

            // FIX: CORS konfiqurasiyası yaxşılaşdırıldı
            // Əvvəl yalnız http://localhost:3000 var idi, https yox idi
            // İndi appsettings-dən də oxuya bilər (production üçün)
            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowReactApp", policy =>
                {
                    var allowedOrigins = builder.Configuration
                        .GetSection("AllowedOrigins")
                        .Get<string[]>();

                    if (allowedOrigins != null && allowedOrigins.Length > 0)
                    {
                        policy.WithOrigins(allowedOrigins)
                              .AllowAnyHeader()
                              .AllowAnyMethod()
                              .AllowCredentials();
                    }
                    else
                    {
                        // Development fallback
                        policy.WithOrigins(
                                "http://localhost:3000",
                                "https://localhost:3000")
                              .AllowAnyHeader()
                              .AllowAnyMethod()
                              .AllowCredentials();
                    }
                });
            });

            StripeConfiguration.ApiKey = builder.Configuration["Stripe:ApiKey"];

            var app = builder.Build();

            app.UseSwagger();
            app.UseSwaggerUI();

            app.UseMiddleware<GlobalExceptionMiddleware>();
            app.UseHttpsRedirection();

            app.UseCors("AllowReactApp");
            app.UseAuthentication();
            app.UseAuthorization();
            app.UseHangfireDashboard("/hangfire");
            app.MapControllers();
            app.MapHub<ChatHub>("/chathub");
            app.MapHub<NotificationHub>("/notificationHub");

            // HANGFIRE JOBS
            RecurringJob.AddOrUpdate<MedicineExpirationJob>(
                "check-expired-medicines",
                job => job.CheckExpiredMedicinesAsync(),
                Cron.Daily);

            RecurringJob.AddOrUpdate<BasketCleanupJob>(
                "clean-expired-baskets",
                job => job.CleanExpiredBasketsAsync(),
                Cron.Daily);

            RecurringJob.AddOrUpdate<ConsultationReminderJob>(
                "send-appointment-reminders",
                job => job.SendTodayRemindersAsync(),
                "0 8 * * *");

            RecurringJob.AddOrUpdate<WeeklyReportJob>(
                "send-weekly-financial-report",
                job => job.GenerateAndSendWeeklyReportAsync(),
                "55 23 * * 0");

            // FIX: Dublikat rol seeding silindi.
            // Əvvəl iki ayrı using bloku var idi - eyni iş iki dəfə edilirdi.
            // Həm də birinci blokda "Courier" rolu yox idi - uyğunsuzluq var idi.
            // İndi yalnız RoleSeeder istifadə edilir - o, bütün rolları + Admin-i yaradır.
            using (var scope = app.Services.CreateScope())
            {
                var services = scope.ServiceProvider;
                await RoleSeeder.SeedRolesAndAdminAsync(services);
            }

            app.Run();
        }
    }
}
