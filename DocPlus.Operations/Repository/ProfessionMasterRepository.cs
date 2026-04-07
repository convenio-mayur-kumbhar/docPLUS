using Dapper;
using DocPlus.Entities.ViewModels;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using System.Data;

namespace DocPlus.Operations.Repository
{
    public class ProfessionMasterRepository : BaseRepository, IProfessionMasterRepository
    {
        public ProfessionMasterRepository(IConfiguration configuration) : base(configuration)
        { }
        public async Task<JsonResponse> GetProfessionMasterList(Profession_VM model)
        {
            try
            {
                using (var connection = new SqlConnection(ConnectionString))
                {
                    await connection.OpenAsync();
                    var param = new DynamicParameters();
                    var list = (await connection.QueryAsync<Profession_VM>("ProfessionList", param, commandType: CommandType.StoredProcedure)).ToList();
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
                logger.Error("ProfessionMasterRepository_GetProfessionMasterList Error: ", ex);
                return new JsonResponse
                {
                    Status = "Error",
                    Message = "Error occurred",
                    Data = null!
                };
            }
        }
        public async Task<JsonResponse> AddUpdateProfessionMaster(Profession_VM model)
        {
            try
            {
                using (var connection = new SqlConnection(ConnectionString))
                {
                    await connection.OpenAsync();

                    var param = new DynamicParameters();
                    param.Add("@p_PROFESSION_ID", model.PROFESSION_ID);
                    param.Add("@p_PROFESSION_NAME", model.PROFESSION_NAME);
                    param.Add("@p_LAST_UPDATED_BY", model.LAST_UPDATED_BY);

                    var result = await connection.QueryFirstOrDefaultAsync<JsonResponse>("SaveProfession", param, commandType: CommandType.StoredProcedure);

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
                logger.Error("AddUpdateProfessionMaster Error: ", ex);

                return new JsonResponse
                {
                    Status = "Error",
                    Message = "Error occurred",
                    Data = null!
                };
            }
        }
        public async Task<JsonResponse> DeleteProfessionMaster(int ProfessionID)
        {
            try
            {
                using (var connection = new SqlConnection(ConnectionString))
                {
                    await connection.OpenAsync();

                    var param = new DynamicParameters();
                    param.Add("@p_PROFESSION_ID", ProfessionID);
                    var result = await connection.QueryFirstOrDefaultAsync<JsonResponse>("DeleteProfessionMaster", param, commandType: CommandType.StoredProcedure);

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
                logger.Error("DeleteProfessionMaster Error: ", ex);

                return new JsonResponse
                {
                    Status = "Error",
                    Message = "Error occurred",
                    Data = null!
                };
            }
        }
        public async Task<JsonResponse> GetProfessionMasterDetailsById(int ProfessionID)
        {
            try
            {
                using (var connection = new SqlConnection(ConnectionString))
                {
                    await connection.OpenAsync();
                    var param = new DynamicParameters();
                    param.Add("@p_PROFESSION_ID", ProfessionID);
                    var data = await connection.QueryFirstOrDefaultAsync<Profession_VM>("GetProfessionMasterDetailsById", param, commandType: CommandType.StoredProcedure);
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
                logger.Error("GetProfessionMasterDetailsById Error: ", ex);

                return new JsonResponse
                {
                    Status = "Error",
                    Message = "Error occurred",
                    Data = null!
                };
            }
        }
    }
    public interface IProfessionMasterRepository
    {
        public Task<JsonResponse> GetProfessionMasterList(Profession_VM model);
        public Task<JsonResponse> AddUpdateProfessionMaster(Profession_VM model);
        public Task<JsonResponse> DeleteProfessionMaster(int ProfessionID);
        public Task<JsonResponse> GetProfessionMasterDetailsById(int ProfessionID);

    }
}
