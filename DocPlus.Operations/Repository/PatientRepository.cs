using Dapper;
using DocPlus.Entities.ViewModels;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using System.Data;

namespace DocPlus.Operations.Repository
{
    public class PatientRepository : BaseRepository, IPatientRepository
    {
        public PatientRepository(IConfiguration configuration) : base(configuration)
        { }
        // ✅ ADD PATIENT
        public async Task<JsonResponse> AddPatient(Patient_VM model)
        {
            try
            {
                using (var connection = new SqlConnection(ConnectionString))
                {
                    var par = new DynamicParameters();
                    par.Add("@p_PAT_FNAME", model.FirstName);
                    par.Add("@p_PAT_MNAME", model.MiddleName);
                    par.Add("@p_PAT_LNAME", model.LastName);
                    par.Add("@p_PAT_ADDR", model.Address);
                    par.Add("@p_PAT_DOB", model.DOB);
                    par.Add("@p_PAT_GENDER", model.Gender);
                    par.Add("@p_PAT_TELENO", model.TelePhoneNo);
                    par.Add("@p_PAT_MOBNO", model.MobileNo);
                    par.Add("@p_PAT_EMAIL", model.EmailID);
                    par.Add("@p_CATEGORY_ID", model.CategoryID);
                    par.Add("@p_STATUS_ID", model.StatusID);
                    par.Add("@p_OCCUPATION_ID", model.OccupationID);
                    par.Add("@p_MSTAT_ID", model.MarritialStatusID);
                    par.Add("@p_PAT_REMARKS", model.Remarks);
                    par.Add("@p_LAST_UPDATED_BY", model.LastUpdatedBy);
                    var result = await connection.QueryFirstOrDefaultAsync<dynamic>("PatientAdd", par, commandType: CommandType.StoredProcedure);
                    if (result != null)
                    {
                        return new JsonResponse(
                            result.STATUS?.ToString() ?? "0",
                            result.MESSAGE?.ToString() ?? "No message",
                            null
                        );
                    }
                    return new JsonResponse("0", "No response from database", null);
                }
            }
            catch (Exception ex)
            {
                logger.Error("PatientRepository_AddPatient Error: ", ex);
                return new JsonResponse("0", "Error occurred", null);
            }
        }
        // ✅ UPDATE PATIENT
        public async Task<JsonResponse> UpdatePatient(Patient_VM model)
        {
            try
            {
                using (var connection = new SqlConnection(ConnectionString))
                {
                    var par = new DynamicParameters();
                    par.Add("@p_PAT_ID", model.PatientID);
                    par.Add("@p_PAT_FNAME", model.FirstName);
                    par.Add("@p_PAT_MNAME", model.MiddleName);
                    par.Add("@p_PAT_LNAME", model.LastName);
                    par.Add("@p_PAT_ADDR", model.Address);
                    par.Add("@p_PAT_DOB", model.DOB);
                    par.Add("@p_PAT_GENDER", model.Gender);
                    par.Add("@p_PAT_TELENO", model.TelePhoneNo);
                    par.Add("@p_PAT_MOBNO", model.MobileNo);
                    par.Add("@p_PAT_EMAIL", model.EmailID);
                    par.Add("@p_CATEGORY_ID", model.CategoryID);
                    par.Add("@p_STATUS_ID", model.StatusID);
                    par.Add("@p_OCCUPATION_ID", model.OccupationID);
                    par.Add("@p_MSTAT_ID", model.MarritialStatusID);
                    par.Add("@p_PAT_REMARKS", model.Remarks);
                    par.Add("@p_LAST_UPDATED_BY", model.LastUpdatedBy);

                    var result = await connection.QueryFirstOrDefaultAsync<dynamic>(
                        "PatientUpdate",
                        par,
                        commandType: CommandType.StoredProcedure
                    );

                    if (result != null)
                    {
                        return new JsonResponse(
                            result.STATUS?.ToString() ?? "0",
                            result.MESSAGE?.ToString() ?? "No message",
                            null
                        );
                    }

                    return new JsonResponse("0", "No response from database", null);
                }
            }
            catch (Exception ex)
            {
                logger.Error("PatientRepository_UpdatePatient Error: ", ex);
                return new JsonResponse("0", "Error occurred", null);
            }
        }
        // ✅ GET ALL PATIENTS
        public async Task<List<Patient_VM>> GetAllPatients()
        {
            try
            {
                using (var connection = new SqlConnection(ConnectionString))
                {
                    await connection.OpenAsync();

                    var list = (await connection.QueryAsync<Patient_VM>(
                        "PatientList",
                        commandType: CommandType.StoredProcedure
                    )).ToList();

                    return list;
                }
            }
            catch (Exception ex)
            {
                logger.Error("PatientRepository_GetAllPatients Error: ", ex);
                return new List<Patient_VM>();
            }
        }
        public async Task<JsonResponse> GetPatientById(int patientId)
        {
            try
            {
                using (var connection = new SqlConnection(ConnectionString))
                {
                    var par = new DynamicParameters();
                    par.Add("@p_PAT_ID", patientId);
                    var patient = await connection.QueryFirstOrDefaultAsync<Patient_VM>("PatientDataGetByID", par, commandType: CommandType.StoredProcedure);
                    if (patient != null)
                    {
                        return new JsonResponse("1", "Success", patient);
                    }
                    return new JsonResponse("0", "Patient not found", null);
                }
            }
            catch (Exception ex)
            {
                logger.Error("PatientRepository_GetPatientById Error: ", ex);
                return new JsonResponse("0", "Error occurred", null);
            }
        }
    }
    public interface IPatientRepository
    {
        public Task<JsonResponse> AddPatient(Patient_VM model);
        public Task<JsonResponse> UpdatePatient(Patient_VM model);
        Task<List<Patient_VM>> GetAllPatients();
        Task<JsonResponse> GetPatientById(int patientId);
    }
}
