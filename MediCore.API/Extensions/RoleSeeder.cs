using MediCore.Core.Entities;
using Microsoft.AspNetCore.Identity;

namespace MediCore.API.Extensions
{
    public static class RoleSeeder
    {
        public static async Task SeedRolesAndAdminAsync(IServiceProvider serviceProvider)
        {
            var roleManager = serviceProvider.GetRequiredService<RoleManager<IdentityRole>>();
            var userManager = serviceProvider.GetRequiredService<UserManager<AppUser>>();
            var config = serviceProvider.GetRequiredService<IConfiguration>();

            // Bütün rollar burada - "Courier" daxil
            string[] roleNames = { "Admin", "Doctor", "Patient", "Courier" };

            foreach (var roleName in roleNames)
            {
                if (!await roleManager.RoleExistsAsync(roleName))
                {
                    await roleManager.CreateAsync(new IdentityRole(roleName));
                }
            }

            string adminEmail = config["AdminSettings:Email"];
            string adminPassword = config["AdminSettings:Password"];
            string adminUserName = config["AdminSettings:Username"];

            var existingAdmin = await userManager.FindByEmailAsync(adminEmail);

            if (existingAdmin == null)
            {
                var newAdmin = new AppUser
                {
                    UserName = adminUserName,
                    Email = adminEmail,
                    EmailConfirmed = true
                };

                var result = await userManager.CreateAsync(newAdmin, adminPassword);

                if (result.Succeeded)
                {
                    await userManager.AddToRoleAsync(newAdmin, "Admin");
                }
                else
                {
                    foreach (var error in result.Errors)
                    {
                        Console.WriteLine($"Admin yaradılmadı: {error.Description}");
                    }
                }
            }
        }
    }
}
