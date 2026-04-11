using Dapper;
using DocPlus.Entities.ClinicalModels;
using DocPlus.Entities.ViewModels;
using Microsoft.AspNetCore.Mvc;
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
                            new
                            {
                                PAT_ID = result.PAT_ID,   // ✅ important
                                REG_NO = result.REG_NO
                            }
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
                    using (var multi = await connection.QueryMultipleAsync("PatientDataGetByID", par, commandType: CommandType.StoredProcedure))
                    {
                        // ✅ 1st result → Patient
                        var patient = multi.ReadFirstOrDefault<Patient_VM>();
                        if (patient != null)
                        {
                            patient.NOKList = (await multi.ReadAsync<PatientNOKDetails>()).ToList();
                            patient.OPList = (await multi.ReadAsync<PatientOPDetails>()).ToList();
                            return new JsonResponse("1", "Success", patient);
                        }
                        return new JsonResponse("0", "Patient not found", null!);
                    }
                }
            }
            catch (Exception ex)
            {
                logger.Error("PatientRepository_GetPatientById Error: ", ex);
                return new JsonResponse("0", "Error occurred", null!);
            }
        }
        public async Task<JsonResponse> DeletePatient(int patientId)
        {
            try
            {
                using (var connection = new SqlConnection(ConnectionString))
                {
                    await connection.OpenAsync();

                    var param = new DynamicParameters();
                    param.Add("@p_PAT_ID", patientId);

                    var result = await connection.QueryFirstOrDefaultAsync(
                        "DeletePatient",
                        param,
                        commandType: CommandType.StoredProcedure
                    );

                    if (result != null)
                    {
                        return new JsonResponse
                        {
                            Status = result.Status,
                            Message = result.Message,
                            Data = null!
                        };
                    }

                    return new JsonResponse
                    {
                        Status = "0",
                        Message = "Delete failed",
                        Data = null!
                    };
                }
            }
            catch (Exception ex)
            {
                logger.Error("DeletePatient Error: ", ex);

                return new JsonResponse
                {
                    Status = "0",
                    Message = ex.Message,
                    Data = null!
                };
            }
        }
        public async Task<JsonResponse> SavePatientNOK(PatientNOKDetails model)
        {
            try
            {
                using (var connection = new SqlConnection(ConnectionString))
                {
                    var par = new DynamicParameters();
                    par.Add("@p_PAT_ID", model.PAT_ID);
                    par.Add("@p_NOK_NAME", model.NOK_NAME);
                    par.Add("@p_NOK_RELATION", model.NOK_RELATION);
                    par.Add("@p_NOK_ADDR", model.NOK_ADDR);
                    par.Add("@p_NOK_TELENO", model.NOK_TELENO);
                    par.Add("@p_NOK_MOBNO", model.NOK_MOBNO);
                    par.Add("@p_NOK_EMAIL", model.NOK_EMAIL);
                    par.Add("@p_NOK_REMARKS", model.NOK_REMARKS);
                    par.Add("@p_LAST_UPDATED_BY", model.LAST_UPDATED_BY);
                    var result = await connection.QueryFirstOrDefaultAsync<dynamic>("PatientNOK_AddUpdate", par, commandType: CommandType.StoredProcedure);
                    if (result != null)
                    {
                        return new JsonResponse(
                            result.STATUS?.ToString() ?? "0",
                            result.MESSAGE?.ToString() ?? "Error",
                            null
                        );
                    }
                    return new JsonResponse("0", "No response from DB", null!);
                }
            }
            catch (Exception ex)
            {
                logger.Error("SavePatientNOK Error: ", ex);
                return new JsonResponse("0", "Error occurred", null!);
            }
        }
        public async Task<JsonResponse> SavePatientOP(PatientOPDetails model)
        {
            try
            {
                using (var connection = new SqlConnection(ConnectionString))
                {
                    var par = new DynamicParameters();
                    par.Add("@p_PAT_ID", model.PAT_ID);
                    par.Add("@p_OP_NAME", model.OP_NAME);
                    par.Add("@p_PROFESSION_NAME", model.PROFESSION_NAME);
                    par.Add("@p_OP_ADDR", model.OP_ADDR);
                    par.Add("@p_OP_TELENO", model.OP_TELENO);
                    par.Add("@p_OP_MOBNO", model.OP_MOBNO);
                    par.Add("@p_OP_EMAIL", model.OP_EMAIL);
                    par.Add("@p_OP_REMARKS", model.OP_REMARKS);
                    par.Add("@p_LAST_UPDATED_BY", model.LAST_UPDATED_BY);
                    var result = await connection.QueryFirstOrDefaultAsync<dynamic>("PatientOP_AddUpdate", par, commandType: CommandType.StoredProcedure);
                    if (result != null)
                    {
                        return new JsonResponse(
                            result.STATUS?.ToString() ?? "0",
                            result.MESSAGE?.ToString() ?? "Error",
                            null
                        );
                    }
                    return new JsonResponse("0", "No response from DB", null!);
                }
            }
            catch (Exception ex)
            {
                logger.Error("SavePatientOP Error: ", ex);
                return new JsonResponse("0", "Error occurred", null!);
            }
        }
        public async Task<JsonResponse> DeletePatientNOK(int nokId, int userId)
        {
            try
            {
                using (var connection = new SqlConnection(ConnectionString))
                {
                    var par = new DynamicParameters();
                    par.Add("@p_NOK_ID", nokId);
                    par.Add("@p_LAST_UPDATED_BY", userId);
                    var result = await connection.QueryFirstOrDefaultAsync<dynamic>("PatientNOK_Delete", par, commandType: CommandType.StoredProcedure);
                    if (result != null)
                    {
                        return new JsonResponse(
                            result.STATUS?.ToString() ?? "0",
                            result.MESSAGE?.ToString() ?? "Error",
                            null
                        );
                    }
                    return new JsonResponse("0", "No response from DB", null!);
                }
            }
            catch (Exception ex)
            {
                logger.Error("DeletePatientNOK Error: ", ex);
                return new JsonResponse("0", "Error occurred", null!);
            }
        }
        public async Task<JsonResponse> DeletePatientOP(int opId, int userId)
        {
            try
            {
                using (var connection = new SqlConnection(ConnectionString))
                {
                    var par = new DynamicParameters();
                    par.Add("@p_OP_ID", opId);
                    par.Add("@p_LAST_UPDATED_BY", userId);
                    var result = await connection.QueryFirstOrDefaultAsync<dynamic>("PatientOP_Delete", par, commandType: CommandType.StoredProcedure);
                    if (result != null)
                    {
                        return new JsonResponse(
                            result.STATUS?.ToString() ?? "0",
                            result.MESSAGE?.ToString() ?? "Error",
                            null
                        );
                    }
                    return new JsonResponse("0", "No response from DB", null!);
                }
            }
            catch (Exception ex)
            {
                logger.Error("DeletePatientOP Error: ", ex);
                return new JsonResponse("0", "Error occurred", null!);
            }
        }
    }
    public interface IPatientRepository
    {
        public Task<JsonResponse> AddPatient(Patient_VM model);
        public Task<JsonResponse> UpdatePatient(Patient_VM model);
        public Task<List<Patient_VM>> GetAllPatients();
        public Task<JsonResponse> GetPatientById(int patientId);
        public Task<JsonResponse> DeletePatient(int patientId);
        public Task<JsonResponse> SavePatientNOK(PatientNOKDetails model);
        public Task<JsonResponse> SavePatientOP(PatientOPDetails model);
        public Task<JsonResponse> DeletePatientNOK(int nokId, int userId);
        public Task<JsonResponse> DeletePatientOP(int opId, int userId);
    }
}
