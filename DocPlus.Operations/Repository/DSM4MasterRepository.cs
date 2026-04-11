using Dapper;
using DocPlus.Entities.ViewModels;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using System.Data;

namespace DocPlus.Operations.Repository
{
    public class DSM4MasterRepository : BaseRepository, IDSM4MasterRepository
    {
        public DSM4MasterRepository(IConfiguration configuration) : base(configuration)
        { }
        public async Task<JsonResponse> GetDSM4MasterList(DSM4_VM model)
        {
            try
            {
                using (var connection = new SqlConnection(ConnectionString))
                {
                    await connection.OpenAsync();
                    var param = new DynamicParameters();
                    var list = (await connection.QueryAsync<DSM4_VM>("DSM4List", param, commandType: CommandType.StoredProcedure)).ToList();
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
                logger.Error("DSM4MasterRepository_GetDSM4MasterList Error: ", ex);
                return new JsonResponse
                {
                    Status = "Error",
                    Message = "Error occurred",
                    Data = null!
                };
            }
        }
        public async Task<JsonResponse> AddUpdateDSM4Master(DSM4_VM model)
        {
            try
            {
                using (var connection = new SqlConnection(ConnectionString))
                {
                    await connection.OpenAsync();

                    var param = new DynamicParameters();
                    param.Add("@p_DSM4_ID", model.DSM4_ID);
                    param.Add("@p_DSM4_CODE", model.DSM4_CODE);
                    param.Add("@p_DSM4_REMARKS", model.DSM4_REMARKS);
                    param.Add("@p_LAST_UPDATED_BY", model.LAST_UPDATED_BY);

                    var result = await connection.QueryFirstOrDefaultAsync<JsonResponse>("SaveDSM4", param, commandType: CommandType.StoredProcedure);

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
                logger.Error("AddUpdateDSM4Master Error: ", ex);

                return new JsonResponse
                {
                    Status = "Error",
                    Message = "Error occurred",
                    Data = null!
                };
            }
        }
        public async Task<JsonResponse> DeleteDSM4Master(int DSM4ID)
        {
            try
            {
                using (var connection = new SqlConnection(ConnectionString))
                {
                    await connection.OpenAsync();

                    var param = new DynamicParameters();
                    param.Add("@p_DSM4_ID", DSM4ID);
                    var result = await connection.QueryFirstOrDefaultAsync<JsonResponse>("DeleteDSM4Master", param, commandType: CommandType.StoredProcedure);

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
                logger.Error("DeleteDSM4Master Error: ", ex);

                return new JsonResponse
                {
                    Status = "Error",
                    Message = "Error occurred",
                    Data = null!
                };
            }
        }
        public async Task<JsonResponse> GetDSM4MasterDetailsById(int DSM4ID)
        {
            try
            {
                using (var connection = new SqlConnection(ConnectionString))
                {
                    await connection.OpenAsync();
                    var param = new DynamicParameters();
                    param.Add("@p_DSM4_ID", DSM4ID);
                    var data = await connection.QueryFirstOrDefaultAsync<DSM4_VM>("GetDSM4MasterDetailsById", param, commandType: CommandType.StoredProcedure);
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
                logger.Error("GetDSM4MasterDetailsById Error: ", ex);

                return new JsonResponse
                {
                    Status = "Error",
                    Message = "Error occurred",
                    Data = null!
                };
            }
        }
    }
    public interface IDSM4MasterRepository
    {
        public Task<JsonResponse> GetDSM4MasterList(DSM4_VM model);
        public Task<JsonResponse> AddUpdateDSM4Master(DSM4_VM model);
        public Task<JsonResponse> DeleteDSM4Master(int DSM4ID);
        public Task<JsonResponse> GetDSM4MasterDetailsById(int DSM4ID);

    }
}
