using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using MediCore.Business.Services.Interfaces;
using MediCore.Business.Settings;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCore.Business.Services.Implementations
{
    public class PhotoService : IPhotoService
    {
        readonly Cloudinary _cloudinary;
        public PhotoService(IOptions<CloudinarySettings> config)
        {
            var acc = new Account(
                config.Value.CloudName,
                config.Value.ApiKey,
                config.Value.ApiSecret
            );

            _cloudinary = new Cloudinary(acc);
        }

        public async Task<ImageUploadResult> AddPhotoAsync(IFormFile file)
        {
            var uploadResult = new ImageUploadResult();

            if (file.Length > 0)
            {
                using var stream = file.OpenReadStream();
                var uploadParams = new ImageUploadParams
                {
                    File = new FileDescription(file.FileName, stream),
                    Transformation = new Transformation().Height(500).Width(500).Crop("fill").Gravity("face")
                };

                uploadResult = await _cloudinary.UploadAsync(uploadParams);
            }

            return uploadResult;
        }

        public async Task<ImageUploadResult> AddPrescriptionAsync(IFormFile file)
        {
            var uploadResult = new ImageUploadResult();

            if (file.Length > 0)
            {
                using var stream = file.OpenReadStream();

                // Əgər PDF-dirsə Raw kimi yükləyirik
                if (file.FileName.EndsWith(".pdf", StringComparison.OrdinalIgnoreCase))
                {
                    var rawParams = new RawUploadParams
                    {
                        File = new FileDescription(file.FileName, stream)
                    };
                    var rawResult = await _cloudinary.UploadAsync(rawParams);

                    uploadResult.SecureUrl = rawResult.SecureUrl;
                    uploadResult.PublicId = rawResult.PublicId;
                    uploadResult.Error = rawResult.Error;
                }
                else
                {
                    var imageParams = new ImageUploadParams
                    {
                        File = new FileDescription(file.FileName, stream)
                    };
                    uploadResult = await _cloudinary.UploadAsync(imageParams);
                }
            }

            return uploadResult;
        }

        public async Task<DeletionResult> DeletePhotoAsync(string publicId)
        {
            var deleteParams = new DeletionParams(publicId);
            return await _cloudinary.DestroyAsync(deleteParams);
        }
    }
}