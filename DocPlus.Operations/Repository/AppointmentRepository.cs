using Azure;
using Dapper;
using DocPlus.Entities.ClinicalModels;
using DocPlus.Entities.ViewModels;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using System.Data;

namespace DocPlus.Operations.Repository
{
    public class AppointmentRepository : BaseRepository, IAppointmentRepository
    {
        public AppointmentRepository(IConfiguration configuration) : base(configuration)
        { }
        public async Task<JsonResponse> GetAppointmentList(Appointment_VM model)
        {
            try
            {
                using (var connection = new SqlConnection(ConnectionString))
                {
                    await connection.OpenAsync();
                    var param = new DynamicParameters();
                    param.Add("@p_PatientName", model.PAT_FULLNAME);
                    param.Add("@p_AppointmentDate", model.APPT_DATE);
                    var list = (await connection.QueryAsync<Appointment_VM>("AppointmentList", param, commandType: CommandType.StoredProcedure)).ToList();
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
                logger.Error("PatientRepository_GetAllPatients Error: ", ex);
                return new JsonResponse
                {
                    Status = "Error",
                    Message = "Error occurred",
                    Data = null!
                };
            }
        }
        public async Task<JsonResponse> AddUpdateAppointment(Appointment_VM model)
        {
            try
            {
                using (var connection = new SqlConnection(ConnectionString))
                {
                    await connection.OpenAsync();

                    var param = new DynamicParameters();
                    param.Add("@p_APPT_ID", model.APPT_ID);
                    param.Add("@p_PAT_ID", model.PAT_ID);
                    param.Add("@p_APPT_DATE", model.APPT_DATE);
                    param.Add("@p_APPT_TIME", model.APPT_TIME);
                    param.Add("@p_APPT_COMMENTS", model.APPT_COMMENTS);
                    param.Add("@p_LAST_UPDATED_BY", model.LAST_UPDATED_BY);

                    var result = await connection.QueryFirstOrDefaultAsync<JsonResponse>("SaveAppointment", param, commandType: CommandType.StoredProcedure);

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
                logger.Error("AddAppointment Error: ", ex);

                return new JsonResponse
                {
                    Status = "Error",
                    Message = "Error occurred",
                    Data = null!
                };
            }
        }        
        public async Task<JsonResponse> DeleteAppointment(int patId)
        {
            try
            {
                using (var connection = new SqlConnection(ConnectionString))
                {
                    await connection.OpenAsync();

                    var param = new DynamicParameters();
                    param.Add("@p_APPT_ID", patId);

                    await connection.ExecuteAsync("DeleteAppointment", param, commandType: CommandType.StoredProcedure);

                    return new JsonResponse
                    {
                        Status = "Success",
                        Message = "Deleted Successfully",
                        Data = null!
                    };
                }
            }
            catch (Exception ex)
            {
                logger.Error("DeleteAppointment Error: ", ex);

                return new JsonResponse
                {
                    Status = "Error",
                    Message = "Error occurred",
                    Data = null!
                };
            }
        }
        public async Task<JsonResponse> GetPatientDropdown()
        {
            try
            {
                using (var connection = new SqlConnection(ConnectionString))
                {
                    await connection.OpenAsync();

                    var list = (await connection.QueryAsync<Patient_DropDown>(
                        "GetPatientDropdown",
                        commandType: CommandType.StoredProcedure)).ToList();

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
                logger.Error("GetPatientDropdown Error: ", ex);

                return new JsonResponse
                {
                    Status = "Error",
                    Message = "Error occurred",
                    Data = null!
                };
            }
        }
        public async Task<JsonResponse> GetAppointmentDetailsById(int AppointmentID)
        {
            try
            {
                using (var connection = new SqlConnection(ConnectionString))
                {
                    await connection.OpenAsync();

                    var param = new DynamicParameters();
                    param.Add("@p_APPT_ID", AppointmentID);

                    var data = await connection.QueryFirstOrDefaultAsync<Appointment_VM>(
                        "GetAppointmentDetailsById",
                        param,
                        commandType: CommandType.StoredProcedure);

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
                logger.Error("GetPatientById Error: ", ex);

                return new JsonResponse
                {
                    Status = "Error",
                    Message = "Error occurred",
                    Data = null!
                };
            }
        }
    }
    public interface IAppointmentRepository
    {
        public Task<JsonResponse> GetAppointmentList(Appointment_VM model);
        public Task<JsonResponse> AddUpdateAppointment(Appointment_VM model);
        public Task<JsonResponse> DeleteAppointment(int patId);
        public Task<JsonResponse> GetPatientDropdown();
        public Task<JsonResponse> GetAppointmentDetailsById(int AppointmentID);

    }
}
