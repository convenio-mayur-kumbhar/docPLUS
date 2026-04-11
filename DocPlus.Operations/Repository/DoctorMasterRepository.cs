using Dapper;
using DocPlus.Entities.ViewModels;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using System.Data;

namespace DocPlus.Operations.Repository
{
    public class DoctorMasterRepository : BaseRepository, IDoctorMasterRepository
    {
        public DoctorMasterRepository(IConfiguration configuration) : base(configuration)
        { }
        public async Task<JsonResponse> GetDoctorList(Doctor_VM model)
        {
            try
            {
                using (var connection = new SqlConnection(ConnectionString))
                {
                    await connection.OpenAsync();
                    var param = new DynamicParameters();
                    var list = (await connection.QueryAsync<Doctor_VM>("DoctorList", param, commandType: CommandType.StoredProcedure)).ToList();
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
                logger.Error("DoctorMasterRepository_GetDoctorList Error: ", ex);
                return new JsonResponse
                {
                    Status = "Error",
                    Message = "Error occurred",
                    Data = null!
                };
            }
        }
        public async Task<JsonResponse> AddUpdateDoctorMaster(Doctor_VM model)
        {
            try
            {
                using (var connection = new SqlConnection(ConnectionString))
                {
                    await connection.OpenAsync();

                    var param = new DynamicParameters();
                    param.Add("@p_DOC_ID", model.DOC_ID);
                    param.Add("@p_DOC_SCODE", model.DOC_SCODE);
                    param.Add("@p_DOC_NAME", model.DOC_NAME);
                    param.Add("@p_DOC_ADDR", model.DOC_ADDR);
                    param.Add("@p_DOC_TELENO", model.DOC_TELENO);
                    param.Add("@p_DOC_MOBNO", model.DOC_MOBNO);
                    param.Add("@p_DOC_EMAIL", model.DOC_EMAIL);
                    param.Add("@p_DOC_REMARKS", model.DOC_REMARKS);
                    param.Add("@p_LAST_UPDATED_BY", model.LAST_UPDATED_BY);

                    var result = await connection.QueryFirstOrDefaultAsync<JsonResponse>("SaveDoctor", param, commandType: CommandType.StoredProcedure);

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
                logger.Error("AddUpdateDoctorMaster Error: ", ex);

                return new JsonResponse
                {
                    Status = "Error",
                    Message = "Error occurred",
                    Data = null!
                };
            }
        }
        public async Task<JsonResponse> DeleteDoctorMaster(int DoctorID)
        {
            try
            {
                using (var connection = new SqlConnection(ConnectionString))
                {
                    await connection.OpenAsync();

                    var param = new DynamicParameters();
                    param.Add("@p_DOC_ID", DoctorID);
                    var result = await connection.QueryFirstOrDefaultAsync<JsonResponse>("DeleteDoctor", param, commandType: CommandType.StoredProcedure);

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
                logger.Error("DeleteDoctorMaster Error: ", ex);

                return new JsonResponse
                {
                    Status = "Error",
                    Message = "Error occurred",
                    Data = null!
                };
            }
        }
        public async Task<JsonResponse> GetDoctorMasterDetailsById(int DOC_ID)
        {
            try
            {
                using (var connection = new SqlConnection(ConnectionString))
                {
                    await connection.OpenAsync();
                    var param = new DynamicParameters();
                    param.Add("@p_DOC_ID", DOC_ID);
                    var data = await connection.QueryFirstOrDefaultAsync<Doctor_VM>("GetDoctorById", param, commandType: CommandType.StoredProcedure);
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
                logger.Error("GetDoctorMasterDetailsById Error: ", ex);

                return new JsonResponse
                {
                    Status = "Error",
                    Message = "Error occurred",
                    Data = null!
                };
            }
        }
    }
    public interface IDoctorMasterRepository
    {
        public Task<JsonResponse> GetDoctorList(Doctor_VM model);
        public Task<JsonResponse> AddUpdateDoctorMaster(Doctor_VM model);
        public Task<JsonResponse> DeleteDoctorMaster(int DoctorID);
        public Task<JsonResponse> GetDoctorMasterDetailsById(int DoctorID);

    }
}
