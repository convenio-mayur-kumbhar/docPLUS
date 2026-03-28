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
                    par.Add("@PAT_FNAME", model.FirstName);
                    par.Add("@PAT_MNAME", model.MiddleName);
                    par.Add("@PAT_LNAME", model.LastName);
                    par.Add("@PAT_ADDR", model.Address);
                    par.Add("@PAT_DOB", model.DOB);
                    par.Add("@PAT_GENDER", model.Gender);
                    par.Add("@PAT_TELENO", model.TelePhoneNo);
                    par.Add("@PAT_MOBNO", model.MobileNo);
                    par.Add("@PAT_EMAIL", model.EmailID);
                    par.Add("@CATEGORY_ID", model.CategoryID);
                    par.Add("@STATUS_ID", model.StatusID);
                    par.Add("@OCCUPATION_ID", model.OccupationID);
                    par.Add("@MSTAT_ID", model.MarritialStatusID);
                    par.Add("@PAT_REMARKS", model.Remarks);
                    par.Add("@LAST_UPDATED_BY", model.LastUpdatedBy);
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

                    par.Add("@PAT_ID", model.PatientID);
                    par.Add("@PAT_FNAME", model.FirstName);
                    par.Add("@PAT_MNAME", model.MiddleName);
                    par.Add("@PAT_LNAME", model.LastName);
                    par.Add("@PAT_ADDR", model.Address);
                    par.Add("@PAT_DOB", model.DOB);
                    par.Add("@PAT_GENDER", model.Gender);
                    par.Add("@PAT_TELENO", model.TelePhoneNo);
                    par.Add("@PAT_MOBNO", model.MobileNo);
                    par.Add("@PAT_EMAIL", model.EmailID);
                    par.Add("@CATEGORY_ID", model.CategoryID);
                    par.Add("@STATUS_ID", model.StatusID);
                    par.Add("@OCCUPATION_ID", model.OccupationID);
                    par.Add("@MSTAT_ID", model.MarritialStatusID);
                    par.Add("@PAT_REMARKS", model.Remarks);
                    par.Add("@LAST_UPDATED_BY", model.LastUpdatedBy);

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
                    par.Add("@PAT_ID", patientId);
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
