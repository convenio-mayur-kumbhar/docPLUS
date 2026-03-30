using Dapper;
using DocPlus.Entities.ClinicalModels;
using DocPlus.Entities.ViewModels;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using System.Data;

namespace DocPlus.Operations.Repository
{
    public class AjaxCommonRepository : BaseRepository, IAjaxCommonRepository
    {
        public AjaxCommonRepository(IConfiguration configuration) : base(configuration)
        { }

        public async Task<JsonResponse> GetCategoryMaster()
        {
            try
            {
                var result = new List<MasterDropdownDto>();

                using (SqlConnection con = new SqlConnection(ConnectionString))
                {
                    using (SqlCommand cmd = new SqlCommand("GetCategoryMaster", con))
                    {
                        cmd.CommandType = CommandType.StoredProcedure; // ✅ FIX

                        await con.OpenAsync();

                        using (SqlDataReader reader = await cmd.ExecuteReaderAsync())
                        {
                            while (await reader.ReadAsync())
                            {
                                result.Add(new MasterDropdownDto
                                {
                                    ID = Convert.ToInt32(reader["ID"]),
                                    DisplayText = reader["DisplayText"].ToString()
                                });
                            }
                        }
                    }
                }

                return new JsonResponse
                {
                    Status = "Success", // ✅ FIX
                    Message = "Success",
                    Data = result
                };
            }
            catch (Exception ex)
            {
                logger.Error("GetCategoryMaster Error: ", ex);

                return new JsonResponse
                {
                    Status = "Error",
                    Message = "Error occurred",
                    Data = null!
                };
            }
        }
        public async Task<JsonResponse> GetMaritalStatusMaster()
        {
            try
            {
                var result = new List<MasterDropdownDto>();

                using (SqlConnection con = new SqlConnection(ConnectionString))
                {
                    using (SqlCommand cmd = new SqlCommand("GetMaritalStatusMaster", con))
                    {
                        cmd.CommandType = CommandType.StoredProcedure; // ✅ FIX

                        await con.OpenAsync();

                        using (SqlDataReader reader = await cmd.ExecuteReaderAsync())
                        {
                            while (await reader.ReadAsync())
                            {
                                result.Add(new MasterDropdownDto
                                {
                                    ID = Convert.ToInt32(reader["ID"]),
                                    DisplayText = reader["DisplayText"].ToString()
                                });
                            }
                        }
                    }
                }
                return new JsonResponse
                {
                    Status = "Success",
                    Message = "Success",
                    Data = result
                };
            }
            catch (Exception ex)
            {
                logger.Error("GetDSM4_ICD10MasterData Error: ", ex);
                return new JsonResponse
                {
                    Status = "Error",
                    Message = "Error occurred",
                    Data = null!
                };
            }
        }
        public async Task<JsonResponse> GetStatusMaster()
        {
            try
            {
                var result = new List<MasterDropdownDto>();

                using (SqlConnection con = new SqlConnection(ConnectionString))
                {
                    using (SqlCommand cmd = new SqlCommand("GetStatusMaster", con))
                    {
                        cmd.CommandType = CommandType.StoredProcedure; // ✅ FIX
                        await con.OpenAsync();
                        using (SqlDataReader reader = await cmd.ExecuteReaderAsync())
                        {
                            while (await reader.ReadAsync())
                            {
                                result.Add(new MasterDropdownDto
                                {
                                    ID = Convert.ToInt32(reader["ID"]),
                                    DisplayText = reader["DisplayText"].ToString()
                                });
                            }
                        }
                    }
                }
                return new JsonResponse
                {
                    Status = "Success",
                    Message = "Success",
                    Data = result
                };
            }
            catch (Exception ex)
            {
                logger.Error("GetDSM4_ICD10MasterData Error: ", ex);
                return new JsonResponse
                {
                    Status = "Error",
                    Message = "Error occurred",
                    Data = null!
                };
            }
        }
        public async Task<JsonResponse> GetOccupationMaster()
        {
            try
            {
                var result = new List<MasterDropdownDto>();

                using (SqlConnection con = new SqlConnection(ConnectionString))
                {
                    using (SqlCommand cmd = new SqlCommand("GetOccupationMaster", con))
                    {
                        cmd.CommandType = CommandType.StoredProcedure; // ✅ FIX
                        await con.OpenAsync();
                        using (SqlDataReader reader = await cmd.ExecuteReaderAsync())
                        {
                            while (await reader.ReadAsync())
                            {
                                result.Add(new MasterDropdownDto
                                {
                                    ID = Convert.ToInt32(reader["ID"]),
                                    DisplayText = reader["DisplayText"].ToString()
                                });
                            }
                        }
                    }
                }
                return new JsonResponse
                {
                    Status = "Success",
                    Message = "Success",
                    Data = result
                };
            }
            catch (Exception ex)
            {
                logger.Error("GetDSM4_ICD10MasterData Error: ", ex);
                return new JsonResponse
                {
                    Status = "Error",
                    Message = "Error occurred",
                    Data = null!
                };
            }
        }
    }
    public interface IAjaxCommonRepository
    {
        public Task<JsonResponse> GetCategoryMaster();
        public Task<JsonResponse> GetMaritalStatusMaster();
        public Task<JsonResponse> GetStatusMaster();
        public Task<JsonResponse> GetOccupationMaster();

    }
}
