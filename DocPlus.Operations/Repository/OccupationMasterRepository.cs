using Dapper;
using DocPlus.Entities.ViewModels;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using System.Data;

namespace DocPlus.Operations.Repository
{
    public class OccupationMasterRepository : BaseRepository, IOccupationMasterRepository
    {
        public OccupationMasterRepository(IConfiguration configuration) : base(configuration)
        { }
        public async Task<JsonResponse> GetOccupationMasterList(Occupation_VM model)
        {
            try
            {
                using (var connection = new SqlConnection(ConnectionString))
                {
                    await connection.OpenAsync();
                    var param = new DynamicParameters();
                    var list = (await connection.QueryAsync<Occupation_VM>("OccupationList", param, commandType: CommandType.StoredProcedure)).ToList();
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
                logger.Error("OccupationMasterRepository_GetOccupationMasterList Error: ", ex);
                return new JsonResponse
                {
                    Status = "Error",
                    Message = "Error occurred",
                    Data = null!
                };
            }
        }
        public async Task<JsonResponse> AddUpdateOccupationMaster(Occupation_VM model)
        {
            try
            {
                using (var connection = new SqlConnection(ConnectionString))
                {
                    await connection.OpenAsync();

                    var param = new DynamicParameters();
                    param.Add("@p_OCCUPATION_ID", model.OCCUPATION_ID);
                    param.Add("@p_OCCUPATION_NAME", model.OCCUPATION_NAME);
                    param.Add("@p_LAST_UPDATED_BY", model.LAST_UPDATED_BY);

                    var result = await connection.QueryFirstOrDefaultAsync<JsonResponse>("SaveOccupation", param, commandType: CommandType.StoredProcedure);

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
                logger.Error("AddUpdateOccupationMaster Error: ", ex);

                return new JsonResponse
                {
                    Status = "Error",
                    Message = "Error occurred",
                    Data = null!
                };
            }
        }
        public async Task<JsonResponse> DeleteOccupationMaster(int OccupationID)
        {
            try
            {
                using (var connection = new SqlConnection(ConnectionString))
                {
                    await connection.OpenAsync();

                    var param = new DynamicParameters();
                    param.Add("@p_OCCUPATION_ID", OccupationID);
                    var result = await connection.QueryFirstOrDefaultAsync<JsonResponse>("DeleteOccupationMaster", param, commandType: CommandType.StoredProcedure);

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
                logger.Error("DeleteOccupationMaster Error: ", ex);

                return new JsonResponse
                {
                    Status = "Error",
                    Message = "Error occurred",
                    Data = null!
                };
            }
        }
        public async Task<JsonResponse> GetOccupationMasterDetailsById(int OccupationID)
        {
            try
            {
                using (var connection = new SqlConnection(ConnectionString))
                {
                    await connection.OpenAsync();
                    var param = new DynamicParameters();
                    param.Add("@p_OCCUPATION_ID", OccupationID);
                    var data = await connection.QueryFirstOrDefaultAsync<Occupation_VM>("GetOccupationMasterDetailsById", param, commandType: CommandType.StoredProcedure);
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
                logger.Error("GetOccupationMasterDetailsById Error: ", ex);

                return new JsonResponse
                {
                    Status = "Error",
                    Message = "Error occurred",
                    Data = null!
                };
            }
        }
    }
    public interface IOccupationMasterRepository
    {
        public Task<JsonResponse> GetOccupationMasterList(Occupation_VM model);
        public Task<JsonResponse> AddUpdateOccupationMaster(Occupation_VM model);
        public Task<JsonResponse> DeleteOccupationMaster(int OccupationID);
        public Task<JsonResponse> GetOccupationMasterDetailsById(int OccupationID);

    }
}
