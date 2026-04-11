using Dapper;
using DocPlus.Entities.ViewModels;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using System.Data;

namespace DocPlus.Operations.Repository
{
    public class CategoryMasterRepository : BaseRepository, ICategoryMasterRepository
    {
        public CategoryMasterRepository(IConfiguration configuration) : base(configuration)
        { }
        public async Task<JsonResponse> GetCategoryMasterList(Category_VM model)
        {
            try
            {
                using (var connection = new SqlConnection(ConnectionString))
                {
                    await connection.OpenAsync();
                    var param = new DynamicParameters();
                    var list = (await connection.QueryAsync<Category_VM>("CategoryList", param, commandType: CommandType.StoredProcedure)).ToList();
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
                logger.Error("CategoryMasterRepository_GetCategoryMasterList Error: ", ex);
                return new JsonResponse
                {
                    Status = "Error",
                    Message = "Error occurred",
                    Data = null!
                };
            }
        }
        public async Task<JsonResponse> AddUpdateCategoryMaster(Category_VM model)
        {
            try
            {
                using (var connection = new SqlConnection(ConnectionString))
                {
                    await connection.OpenAsync();

                    var param = new DynamicParameters();
                    param.Add("@p_Category_ID", model.CATEGORY_ID);
                    param.Add("@p_Category_NAME", model.CATEGORY_NAME);
                    param.Add("@p_LAST_UPDATED_BY", model.LAST_UPDATED_BY);

                    var result = await connection.QueryFirstOrDefaultAsync<JsonResponse>("SaveCategory", param, commandType: CommandType.StoredProcedure);

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
                logger.Error("AddUpdateCategoryMaster Error: ", ex);

                return new JsonResponse
                {
                    Status = "Error",
                    Message = "Error occurred",
                    Data = null!
                };
            }
        }
        public async Task<JsonResponse> DeleteCategoryMaster(int CategoryID)
        {
            try
            {
                using (var connection = new SqlConnection(ConnectionString))
                {
                    await connection.OpenAsync();

                    var param = new DynamicParameters();
                    param.Add("@p_Category_ID", CategoryID);
                    var result = await connection.QueryFirstOrDefaultAsync<JsonResponse>("DeleteCategoryMaster", param, commandType: CommandType.StoredProcedure);

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
                logger.Error("DeleteCategoryMaster Error: ", ex);

                return new JsonResponse
                {
                    Status = "Error",
                    Message = "Error occurred",
                    Data = null!
                };
            }
        }
        public async Task<JsonResponse> GetCategoryMasterDetailsById(int CategoryID)
        {
            try
            {
                using (var connection = new SqlConnection(ConnectionString))
                {
                    await connection.OpenAsync();
                    var param = new DynamicParameters();
                    param.Add("@p_Category_ID", CategoryID);
                    var data = await connection.QueryFirstOrDefaultAsync<Category_VM>("GetCategoryMasterDetailsById", param, commandType: CommandType.StoredProcedure);
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
                logger.Error("GetCategoryMasterDetailsById Error: ", ex);

                return new JsonResponse
                {
                    Status = "Error",
                    Message = "Error occurred",
                    Data = null!
                };
            }
        }
    }
    public interface ICategoryMasterRepository
    {
        public Task<JsonResponse> GetCategoryMasterList(Category_VM model);
        public Task<JsonResponse> AddUpdateCategoryMaster(Category_VM model);
        public Task<JsonResponse> DeleteCategoryMaster(int CategoryID);
        public Task<JsonResponse> GetCategoryMasterDetailsById(int CategoryID);

    }
}
