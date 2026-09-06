using AutoMapper;
using MediCore.Business.DTOs.LabResultDetailDto;
using MediCore.Business.Helpers.Exceptions.Common;
using MediCore.Business.Helpers.Exceptions.LabResultDetail;
using MediCore.Business.Services.Interfaces;
using MediCore.Core.Entities;
using MediCore.DAL.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCore.Business.Services.Implementations
{
    public class LabResultDetailService : ILabResultDetailService
    {
         readonly IRepository<LabResultDetail> _repository;
         readonly IMapper _mapper;

        public LabResultDetailService(IRepository<LabResultDetail> repository, IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        public async Task UpdateAsync(UpdateLabResultDetailDto dto)
        {
            if (dto.Id <= 0)
                throw new LabResultDetailNotFoundException("ID mənfi və ya sıfır ola bilməz!");

            var detail = await _repository.FindAll(x => x.Id == dto.Id && x.IsDeleted == false).FirstOrDefaultAsync();

            if (detail == null)
                throw new LabResultDetailNotFoundException("Yenilənməli olan detal tapılmadı!"); 

            _mapper.Map(dto, detail);

            _repository.Update(detail);
            await _repository.SaveChangesAsync();
        }

        public async Task SoftDeleteAsync(int id)
        {
            if (id <= 0)
                throw new NegativeIdException("ID mənfi və ya sıfır ola bilməz!");

            var detail = await _repository.FindAll(x => x.Id == id && x.IsDeleted == false).FirstOrDefaultAsync();

            if (detail == null)
                throw new LabResultDetailNotFoundException("Silinməli olan detal tapılmadı!");

            _repository.SoftDelete(detail);

            await _repository.SaveChangesAsync();
        }

        public async Task RestoreAsync(int id)
        {
            var deletedEntity = await _repository
                                .FindAll(x => x.Id == id && x.IsDeleted == true)
                                .FirstOrDefaultAsync();

            if (deletedEntity == null)
            {
                throw new Exception("Arxivdə belə bir məlumat tapılmadı!");
            }

            _repository.Restore(deletedEntity);

            await _repository.SaveChangesAsync();
        }
    }
}
