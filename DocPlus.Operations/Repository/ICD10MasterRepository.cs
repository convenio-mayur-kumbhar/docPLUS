using Dapper;
using DocPlus.Entities.ViewModels;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using System.Data;

namespace DocPlus.Operations.Repository
{
    public class ICD10MasterRepository : BaseRepository, IICD10MasterRepository
    {
        public ICD10MasterRepository(IConfiguration configuration) : base(configuration)
        { }
        public async Task<JsonResponse> GetICD10MasterList(ICD10_VM model)
        {
            try
            {
                using (var connection = new SqlConnection(ConnectionString))
                {
                    await connection.OpenAsync();
                    var param = new DynamicParameters();
                    var list = (await connection.QueryAsync<ICD10_VM>("ICD10List", param, commandType: CommandType.StoredProcedure)).ToList();
                    return new JsonResponse
                    {
                        Status = "Success",
                        Message = "Success",
                        Data = list
                    };
                }
            }
            catch (Exception ex)
            {
                logger.Error("ICD10MasterRepository_GetICD10MasterList Error: ", ex);
                return new JsonResponse
                {
                    Status = "Error",
                    Message = "Error occurred",
                    Data = null!
                };
            }
        }
        public async Task<JsonResponse> AddUpdateICD10Master(ICD10_VM model)
        {
            try
            {
                using (var connection = new SqlConnection(ConnectionString))
                {
                    await connection.OpenAsync();

                    var param = new DynamicParameters();
                    param.Add("@p_ICD10_ID", model.ICD10_ID);
                    param.Add("@p_ICD10_CODE", model.ICD10_CODE);
                    param.Add("@p_ICD10_REMARKS", model.ICD10_REMARKS);
                    param.Add("@p_LAST_UPDATED_BY", model.LAST_UPDATED_BY);

                    var result = await connection.QueryFirstOrDefaultAsync<JsonResponse>("SaveICD10", param, commandType: CommandType.StoredProcedure);

                    return new JsonResponse
                    {
                        Status = result.Status,
                        Message = result.Message,
                        Data = null!
                    };
                }
            }
            catch (Exception ex)
            {
                logger.Error("AddUpdateICD10Master Error: ", ex);

                return new JsonResponse
                {
                    Status = "Error",
                    Message = "Error occurred",
                    Data = null!
                };
            }
        }
        public async Task<JsonResponse> DeleteICD10Master(int ICD10ID)
        {
            try
            {
                using (var connection = new SqlConnection(ConnectionString))
                {
                    await connection.OpenAsync();

                    var param = new DynamicParameters();
                    param.Add("@p_ICD10_ID", ICD10ID);
                    var result = await connection.QueryFirstOrDefaultAsync<JsonResponse>("DeleteICD10Master", param, commandType: CommandType.StoredProcedure);

                    return new JsonResponse
                    {
                        Status = result.Status,
                        Message = result.Message,
                        Data = null!
                    };

                }
            }
            catch (Exception ex)
            {
                logger.Error("DeleteICD10Master Error: ", ex);

                return new JsonResponse
                {
                    Status = "Error",
                    Message = "Error occurred",
                    Data = null!
                };
            }
        }
        public async Task<JsonResponse> GetICD10MasterDetailsById(int ICD10ID)
        {
            try
            {
                using (var connection = new SqlConnection(ConnectionString))
                {
                    await connection.OpenAsync();
                    var param = new DynamicParameters();
                    param.Add("@p_ICD10_ID", ICD10ID);
                    var data = await connection.QueryFirstOrDefaultAsync<ICD10_VM>("GetICD10MasterDetailsById", param, commandType: CommandType.StoredProcedure);
                    return new JsonResponse
                    {
                        Status = "Success",
                        Message = "Success",
                        Data = data
                    };
                }
            }
            catch (Exception ex)
            {
                logger.Error("GetICD10MasterDetailsById Error: ", ex);

                return new JsonResponse
                {
                    Status = "Error",
                    Message = "Error occurred",
                    Data = null!
                };
            }
        }
    }
    public interface IICD10MasterRepository
    {
        public Task<JsonResponse> GetICD10MasterList(ICD10_VM model);
        public Task<JsonResponse> AddUpdateICD10Master(ICD10_VM model);
        public Task<JsonResponse> DeleteICD10Master(int ICD10ID);
        public Task<JsonResponse> GetICD10MasterDetailsById(int ICD10ID);

    }
}
