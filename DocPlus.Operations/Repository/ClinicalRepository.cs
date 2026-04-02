using Dapper;
using DocPlus.Entities.ClinicalModels;
using DocPlus.Entities.ViewModels;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using System.Data;

namespace DocPlus.Operations.Repository
{
    public class ClinicalRepository : BaseRepository, IClinicalRepository
    {
        public ClinicalRepository(IConfiguration configuration) : base(configuration)
        { }
        public async Task<JsonResponse> GetPatientsList(Patient_VM model)
        {
            try
            {
                using (var connection = new SqlConnection(ConnectionString))
                {
                    await connection.OpenAsync();
                    var parameters = new DynamicParameters();

                    parameters.Add("@p_FirstName", string.IsNullOrEmpty(model.FirstName) ? null : model.FirstName);
                    parameters.Add("@p_LastName", string.IsNullOrEmpty(model.LastName) ? null : model.LastName);
                    parameters.Add("@p_MobileNo", string.IsNullOrEmpty(model.MobileNo) ? null : model.MobileNo);
                    parameters.Add("@p_Gender", string.IsNullOrEmpty(model.Gender) ? null : model.Gender);
                    parameters.Add("@p_Doctor", string.IsNullOrEmpty(model.Doctor) ? null : model.Doctor);
                    parameters.Add("@p_StatusID", model.AFlag);
                    parameters.Add("@p_Date", model.LastUpdatedOn == DateTime.MinValue ? null : model.LastUpdatedOn);


                    var list = (await connection.QueryAsync<Patient_VM>(
                        "Clinical_PatientsList",
                        parameters,
                        commandType: CommandType.StoredProcedure
                    )).ToList();

                    return new JsonResponse
                    {
                        Status = "1",
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
                    Status = "0",
                    Message = "Error occurred",
                    Data = null!
                };
            }
        }
        public async Task<JsonResponse> GetClinicalDetailsByPatientID(int patientId)
        {
            try
            {
                using (var connection = new SqlConnection(ConnectionString))
                {
                    var par = new DynamicParameters();
                    par.Add("@PAT_ID", patientId);
                    using (var multi = await connection.QueryMultipleAsync("ClinicalDetailsByPatientID", par, commandType: CommandType.StoredProcedure))
                    {
                        var result = new ClinicalDetails_CM();
                        // 1️⃣ Patient
                        result.Patient = await multi.ReadFirstOrDefaultAsync<Patient_VM>();
                        if (result.Patient == null)
                            return new JsonResponse { Status = "0", Message = "Patient not found", Data = null! };
                        // 2️⃣ NOK
                        result.NOKDetails = (await multi.ReadAsync<NOK_CM>()).ToList();
                        // 3️⃣ OP
                        result.OPDetails = (await multi.ReadAsync<OP_CM>()).ToList();
                        // 4️⃣ Initial Assessment
                        result.InitialDetails = await multi.ReadFirstOrDefaultAsync<InitialAssessment_CM>();
                        result.AssessmentDetails = (await multi.ReadAsync<PatientAssessmentDetails>()).ToList();
                        result.PHMDetails = (await multi.ReadAsync<PatientAssessmentPHM_CM>()).ToList();
                        return new JsonResponse { Status = "1", Message = "Success", Data = result };
                    }
                }
            }
            catch (Exception ex)
            {
                logger.Error("GetClinicalDetailsByPatientID Error: ", ex);
                return new JsonResponse { Status = "0", Message = "Error occurred", Data = null! };
            }
        }
        public async Task<JsonResponse> GetDSM4_ICD10MasterData(string type)
        {
            try
            {
                var result = new List<MasterDropdownDto>();

                using (SqlConnection con = new SqlConnection(ConnectionString))
                {
                    using (SqlCommand cmd = new SqlCommand("GetDSM4_ICD10MasterData", con))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;
                        cmd.Parameters.AddWithValue("@Type", type);

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
                    Status = "1",
                    Message = "Success",
                    Data = result
                };
            }
            catch (Exception ex)
            {
                logger.Error("GetDSM4_ICD10MasterData Error: ", ex);
                return new JsonResponse
                {
                    Status = "0",
                    Message = "Error occurred",
                    Data = null!
                };
            }
        }
        public async Task<JsonResponse> SaveInitialDetails(PatientInitialDetails_CM model)
        {
            try
            {
                using (SqlConnection con = new SqlConnection(ConnectionString))
                {
                    using (SqlCommand cmd = new SqlCommand("AddPatientInitialDetails", con))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;

                        cmd.Parameters.AddWithValue("@PAT_ID", model.PAT_ID);
                        cmd.Parameters.AddWithValue("@ASS_PC", (object?)model.ASS_PC ?? DBNull.Value);
                        cmd.Parameters.AddWithValue("@ASS_HPC", (object?)model.ASS_HPC ?? DBNull.Value);
                        cmd.Parameters.AddWithValue("@ASS_PPH", (object?)model.ASS_PPH ?? DBNull.Value);
                        cmd.Parameters.AddWithValue("@ASS_MH", (object?)model.ASS_MH ?? DBNull.Value);
                        cmd.Parameters.AddWithValue("@ASS_FH", (object?)model.ASS_FH ?? DBNull.Value);
                        cmd.Parameters.AddWithValue("@ASS_PH", (object?)model.ASS_PH ?? DBNull.Value);
                        cmd.Parameters.AddWithValue("@ASS_DAH", (object?)model.ASS_DAH ?? DBNull.Value);
                        cmd.Parameters.AddWithValue("@ASS_FRH", (object?)model.ASS_FRH ?? DBNull.Value);
                        cmd.Parameters.AddWithValue("@ASS_PMP", (object?)model.ASS_PMP ?? DBNull.Value);
                        cmd.Parameters.AddWithValue("@ASS_MSE", (object?)model.ASS_MSE ?? DBNull.Value);
                        cmd.Parameters.AddWithValue("@LAST_UPDATED_BY", model.LAST_UPDATED_BY);

                        await con.OpenAsync();
                        await cmd.ExecuteNonQueryAsync();
                    }
                }
                return new JsonResponse
                {
                    Status = "1",
                    Message = "Saved successfully",
                    Data = null!
                };
            }
            catch (Exception ex)
            {
                logger.Error("SaveInitialDetails Error: ", ex);
                return new JsonResponse
                {
                    Status = "0",
                    Message = "Error occurred while saving",
                    Data = null!
                };
            }
        }
        public async Task<JsonResponse> SaveAssessmentDetail(PatientAssessmentDetails model)
        {
            try
            {
                using (SqlConnection con = new SqlConnection(ConnectionString))
                {
                    using (SqlCommand cmd = new SqlCommand("AddPatientAssessmentDetail", con))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;

                        cmd.Parameters.AddWithValue("@PAT_ID", model.PAT_ID);
                        cmd.Parameters.AddWithValue("@APPT_ID", (object?)model.APPT_ID ?? DBNull.Value);
                        cmd.Parameters.AddWithValue("@ASS_DATE", (object?)model.ASS_DATE ?? DBNull.Value);
                        cmd.Parameters.AddWithValue("@ASS_FIELD", model.ASS_FIELD);
                        cmd.Parameters.AddWithValue("@ASS_VALUE", model.ASS_VALUE);
                        cmd.Parameters.AddWithValue("@LAST_UPDATED_BY", model.LAST_UPDATED_BY);
                        await con.OpenAsync();
                        await cmd.ExecuteNonQueryAsync();
                    }
                }

                return new JsonResponse
                {
                    Status = "1",
                    Message = "Saved successfully",
                    Data = null!
                };
            }
            catch (Exception ex)
            {
                logger.Error("SaveAssessmentDetail Error: ", ex);

                return new JsonResponse
                {
                    Status = "0",
                    Message = "Error occurred while saving",
                    Data = null!
                };
            }
        }
        public async Task<JsonResponse> SaveICD10Details(PatientICD10_CM model)
        {
            try
            {
                using (SqlConnection con = new SqlConnection(ConnectionString))
                {
                    using (SqlCommand cmd = new SqlCommand("AddPatientICD10_Details", con))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;

                        cmd.Parameters.AddWithValue("@PAT_ID", model.PAT_ID);
                        cmd.Parameters.AddWithValue("@ASS_DATE", (object?)model.ASS_DATE ?? DBNull.Value);
                        cmd.Parameters.AddWithValue("@LAST_UPDATED_BY", model.LAST_UPDATED_BY);
                        // 🔥 Create DataTable
                        DataTable dt = new DataTable();
                        dt.Columns.Add("ICD10_ID", typeof(int));
                        if (model.ICD10_List != null)
                        {
                            foreach (var item in model.ICD10_List)
                            {
                                dt.Rows.Add(item.ICD10_ID);
                            }
                        }
                        // 🔥 Pass as TVP
                        var param = cmd.Parameters.AddWithValue("@ICD10_LIST", dt);
                        param.SqlDbType = SqlDbType.Structured;
                        param.TypeName = "ICD10TableType";
                        await con.OpenAsync();
                        await cmd.ExecuteNonQueryAsync();
                    }
                }

                return new JsonResponse
                {
                    Status = "1",
                    Message = "ICD10 saved successfully",
                    Data = null!
                };
            }
            catch (Exception ex)
            {
                logger.Error("SaveICD10Details Error: ", ex);

                return new JsonResponse
                {
                    Status = "0",
                    Message = "Error saving ICD10",
                    Data = null!
                };
            }
        }
        public async Task<JsonResponse> SaveDSM4Details(PatientDSM4_CM model)
        {
            try
            {
                using (SqlConnection con = new SqlConnection(ConnectionString))
                {
                    using (SqlCommand cmd = new SqlCommand("AddPatientDSM4Details", con))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;

                        cmd.Parameters.AddWithValue("@PAT_ID", model.PAT_ID);
                        cmd.Parameters.AddWithValue("@ASS_DATE", (object?)model.ASS_DATE ?? DBNull.Value);
                        cmd.Parameters.AddWithValue("@LAST_UPDATED_BY", model.LAST_UPDATED_BY);
                        // 🔥 Create DataTable
                        DataTable dt = new DataTable();
                        dt.Columns.Add("DSM4_ID", typeof(int));
                        dt.Columns.Add("DSM4_REMARKS", typeof(string));
                        if (model.DSM4_List != null)
                        {
                            foreach (var item in model.DSM4_List)
                            {
                                dt.Rows.Add(item.DSM4_ID, item.DSM4_REMARKS ?? "");
                            }
                        }
                        // 🔥 Pass as TVP
                        var param = cmd.Parameters.AddWithValue("@DSM4_LIST", dt);
                        param.SqlDbType = SqlDbType.Structured;
                        param.TypeName = "DSM4TableType";
                        await con.OpenAsync();
                        await cmd.ExecuteNonQueryAsync();
                    }
                }

                return new JsonResponse
                {
                    Status = "1",
                    Message = "DSM4 saved successfully",
                    Data = null!
                };
            }
            catch (Exception ex)
            {
                logger.Error("SaveDSM4Details Error: ", ex);

                return new JsonResponse
                {
                    Status = "0",
                    Message = "Error saving DSM4",
                    Data = null!
                };
            }
        }
        public async Task<JsonResponse> GetRiskIndicators(int patId)
        {
            try
            {
                using SqlConnection con = new SqlConnection(ConnectionString);
                using SqlCommand cmd = new SqlCommand("GetRiskIndicators", con);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@PAT_ID", patId);
                SqlDataAdapter da = new SqlDataAdapter(cmd);
                DataTable dt = new DataTable();
                await Task.Run(() => da.Fill(dt));
                return new JsonResponse
                {
                    Status = "1",
                    Message = "Success",
                    Data = dt
                };
            }
            catch (Exception ex)
            {
                logger.Error("GetRiskIndicators Error", ex);

                return new JsonResponse
                {
                    Status = "0",
                    Message = "Error fetching risk indicators",
                    Data = null!
                };
            }
        }
        public async Task<JsonResponse> SaveRiskDetails(PatientRiskSave_CM model)
        {
            try
            {
                using SqlConnection con = new SqlConnection(ConnectionString);
                using SqlCommand cmd = new SqlCommand("AddPatientRiskIndicatorsDetails", con);

                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@PAT_ID", model.PAT_ID);
                cmd.Parameters.AddWithValue("@ASS_DATE", (object?)model.ASS_DATE ?? DBNull.Value);
                cmd.Parameters.AddWithValue("@LAST_UPDATED_BY", model.LAST_UPDATED_BY);
                // 🔥 DataTable
                DataTable dt = new DataTable();
                dt.Columns.Add("RISK_ID", typeof(int));
                dt.Columns.Add("RISK_FLAG", typeof(string));

                foreach (var item in model.Risk_List)
                {
                    dt.Rows.Add(item.RISK_ID, item.RISK_FLAG);
                }

                var param = cmd.Parameters.AddWithValue("@RISK_LIST", dt);
                param.SqlDbType = SqlDbType.Structured;
                param.TypeName = "RiskIndicators_TableType";

                await con.OpenAsync();
                await cmd.ExecuteNonQueryAsync();

                return new JsonResponse
                {
                    Status = "1",
                    Message = "Risk saved successfully"
                };
            }
            catch (Exception ex)
            {
                logger.Error("SaveRiskDetails Error", ex);

                return new JsonResponse
                {
                    Status = "0",
                    Message = "Error saving risk"
                };
            }
        }
        public async Task<JsonResponse> GetRiskMaster()
        {
            try
            {
                var result = new List<RiskGroup_CM>();
                using SqlConnection con = new SqlConnection(ConnectionString);
                using SqlCommand cmd = new SqlCommand("GetRiskIndicatorsData", con);
                cmd.CommandType = CommandType.StoredProcedure;
                await con.OpenAsync();
                using SqlDataReader reader = await cmd.ExecuteReaderAsync();
                var dict = new Dictionary<string, List<RiskDetail_CM>>();
                while (await reader.ReadAsync())
                {
                    string? type = reader["RISK_TYPE"].ToString();
                    var item = new RiskDetail_CM
                    {
                        RISK_ID = Convert.ToInt32(reader["RISK_ID"]),
                        RISK_DETAILS = reader["RISK_DETAILS"].ToString(),
                        RISK_FLAG = ""
                    };
                    if (!dict.ContainsKey(type))
                        dict[type] = new List<RiskDetail_CM>();
                    dict[type].Add(item);
                }
                foreach (var kv in dict)
                {
                    result.Add(new RiskGroup_CM
                    {
                        RISK_TYPE = kv.Key,
                        Details = kv.Value
                    });
                }
                return new JsonResponse
                {
                    Status = "1",
                    Message = "Success",
                    Data = result
                };
            }
            catch (Exception ex)
            {
                logger.Error("GetRiskMaster Error", ex);

                return new JsonResponse
                {
                    Status = "0",
                    Message = "Error fetching risk master",
                    Data = null!
                };
            }
        }
        public async Task<JsonResponse> SavePrescription(PatientPrescription_CM model)
        {
            try
            {
                using SqlConnection con = new SqlConnection(ConnectionString);
                using SqlCommand cmd = new SqlCommand("AddPatientPrescriptionDetails", con);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@PAT_ID", model.PAT_ID);
                cmd.Parameters.AddWithValue("@ASS_DATE", (object?)model.ASS_DATE ?? DBNull.Value);
                cmd.Parameters.AddWithValue("@LAST_UPDATED_BY", model.LAST_UPDATED_BY);
                // 🔥 Create DataTable
                DataTable dt = new DataTable();
                dt.Columns.Add("TR_FORMULATION", typeof(string));
                dt.Columns.Add("TR_MEDICINE", typeof(string));
                dt.Columns.Add("TR_DOSAGE", typeof(string));
                dt.Columns.Add("TR_ROUTE", typeof(string));
                dt.Columns.Add("TR_FREQ", typeof(string));
                dt.Columns.Add("TR_OTHERS", typeof(string));
                foreach (var item in model.Prescription_List)
                {
                    dt.Rows.Add(
                        item.TR_FORMULATION ?? "",
                        item.TR_MEDICINE ?? "",
                        item.TR_DOSAGE ?? "",
                        item.TR_ROUTE ?? "",
                        item.TR_FREQ ?? "",
                        item.TR_OTHERS ?? ""
                    );
                }
                var param = cmd.Parameters.AddWithValue("@PRESCRIPTION_LIST", dt);
                param.SqlDbType = SqlDbType.Structured;
                param.TypeName = "PrescriptionTableType";
                await con.OpenAsync();
                await cmd.ExecuteNonQueryAsync();
                return new JsonResponse
                {
                    Status = "1",
                    Message = "Prescription saved successfully"
                };
            }
            catch (Exception ex)
            {
                logger.Error("SavePrescription Error", ex);

                return new JsonResponse
                {
                    Status = "0",
                    Message = "Error saving prescription"
                };
            }
        }
        public async Task<JsonResponse> GetPrescriptionDates(int patId)
        {
            try
            {
                using SqlConnection con = new SqlConnection(ConnectionString);
                using SqlCommand cmd = new SqlCommand("GetPrescriptionDates", con);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@PAT_ID", patId);
                SqlDataAdapter da = new SqlDataAdapter(cmd);
                DataTable dt = new DataTable();
                await Task.Run(() => da.Fill(dt));
                return new JsonResponse
                {
                    Status = "1",
                    Message = "Success",
                    Data = dt
                };
            }
            catch (Exception ex)
            {
                logger.Error("GetPrescriptionDates Error", ex);
                return new JsonResponse
                {
                    Status = "0",
                    Message = "Error fetching prescription dates",
                    Data = null!
                };
            }
        }
        public async Task<JsonResponse> GetPrescriptionByDate(int patId, DateTime assDate)
        {
            try
            {
                using SqlConnection con = new SqlConnection(ConnectionString);
                using SqlCommand cmd = new SqlCommand("GetPrescriptionByDate", con);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@PAT_ID", patId);
                cmd.Parameters.AddWithValue("@ASS_DATE", assDate);
                SqlDataAdapter da = new SqlDataAdapter(cmd);
                DataTable dt = new DataTable();
                await Task.Run(() => da.Fill(dt));
                return new JsonResponse
                {
                    Status = "1",
                    Message = "Success",
                    Data = dt
                };
            }
            catch (Exception ex)
            {
                logger.Error("GetPrescriptionByDate Error", ex);

                return new JsonResponse
                {
                    Status = "0",
                    Message = "Error fetching prescription",
                    Data = null!
                };
            }
        }
        public async Task<JsonResponse> SaveInpatient(PatientInpatient_CM model)
        {
            try
            {
                using SqlConnection con = new SqlConnection(ConnectionString);
                using SqlCommand cmd = new SqlCommand("AddPatientInpatientDetails", con);

                cmd.CommandType = CommandType.StoredProcedure;

                cmd.Parameters.AddWithValue("@PAT_ID", model.PAT_ID);
                cmd.Parameters.AddWithValue("@INPT_ADM_DATE", (object?)model.INPT_ADM_DATE ?? DBNull.Value);
                cmd.Parameters.AddWithValue("@INPT_DISCH_DATE", (object?)model.INPT_DISCH_DATE ?? DBNull.Value);
                cmd.Parameters.AddWithValue("@INPT_DIAGNOSIS", (object?)model.INPT_DIAGNOSIS ?? DBNull.Value);
                cmd.Parameters.AddWithValue("@INPT_NOTES", (object?)model.INPT_NOTES ?? DBNull.Value);
                cmd.Parameters.AddWithValue("@LAST_UPDATED_BY", model.LAST_UPDATED_BY);

                await con.OpenAsync();
                await cmd.ExecuteNonQueryAsync();

                return new JsonResponse
                {
                    Status = "1",
                    Message = "Inpatient saved successfully"
                };
            }
            catch (Exception ex)
            {
                logger.Error("SaveInpatient Error", ex);

                return new JsonResponse
                {
                    Status = "0",
                    Message = "Error saving inpatient"
                };
            }
        }
        public async Task<JsonResponse> GetInpatient(int patId)
        {
            try
            {
                using SqlConnection con = new SqlConnection(ConnectionString);
                using SqlCommand cmd = new SqlCommand("GetPatientInpatientDetails", con);

                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@PAT_ID", patId);

                SqlDataAdapter da = new SqlDataAdapter(cmd);
                DataTable dt = new DataTable();

                await Task.Run(() => da.Fill(dt));

                return new JsonResponse
                {
                    Status = "1",
                    Message = "Success",
                    Data = dt
                };
            }
            catch (Exception ex)
            {
                logger.Error("GetInpatient Error", ex);

                return new JsonResponse
                {
                    Status = "0",
                    Message = "Error fetching inpatient data"
                };
            }
        }
        public async Task<JsonResponse> SaveAttachments(PatientAttachment_CM model)
        {
            try
            {
                using SqlConnection con = new SqlConnection(ConnectionString);
                using SqlCommand cmd = new SqlCommand("AddPatientAttachmentDetails", con);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@PAT_ID", model.PAT_ID);
                cmd.Parameters.AddWithValue("@LAST_UPDATED_BY", model.LAST_UPDATED_BY);
                // 🔥 Create DataTable
                DataTable dt = new DataTable();
                dt.Columns.Add("AttachmentSequence", typeof(int));
                dt.Columns.Add("FileName", typeof(string));
                dt.Columns.Add("FileType", typeof(string));
                dt.Columns.Add("FileSize", typeof(long));
                dt.Columns.Add("Remarks", typeof(string));
                foreach (var item in model.AttachmentList)
                {
                    dt.Rows.Add(
                        item.AttachmentSequence,
                        item.FileName,
                        item.FileType,
                        item.FileSize,
                        item.Remarks
                    );
                }
                var param = cmd.Parameters.AddWithValue("@AttachmentList", dt);
                param.SqlDbType = SqlDbType.Structured;
                param.TypeName = "PatientAttachment_TableType";
                await con.OpenAsync();
                SqlDataAdapter da = new SqlDataAdapter(cmd);
                DataTable result = new DataTable();
                da.Fill(result);
                // 🔥 SAVE FILES USING RETURNED PATH
                string basePath = Path.Combine(Directory.GetCurrentDirectory(), "Documents");
                for (int i = 0; i < result.Rows.Count; i++)
                {
                    var row = result.Rows[i];
                    var fileItem = model.AttachmentList[i];
                    long fileId = Convert.ToInt64(row["FileID"]);
                    string relativePath = row["FileRelativePath"].ToString();
                    string fileType = row["FileType"].ToString();
                    string folderPath = Path.Combine(basePath, relativePath.TrimStart('\\'));
                    if (!Directory.Exists(folderPath))
                        Directory.CreateDirectory(folderPath);
                    string fullPath = Path.Combine(folderPath, fileId + "." + fileType);
                    File.Copy(fileItem.LocalFilePath, fullPath, true);
                }
                return new JsonResponse
                {
                    Status = "1",
                    Message = "Attachments saved successfully"
                };
            }
            catch (Exception ex)
            {
                logger.Error("SaveAttachments Error", ex);

                return new JsonResponse
                {
                    Status = "0",
                    Message = "Error saving attachments"
                };
            }
        }
        public async Task<JsonResponse> DeleteAttachment(int attachId)
        {
            try
            {
                using SqlConnection con = new SqlConnection(ConnectionString);
                using SqlCommand cmd = new SqlCommand("DeletePatientAttachment", con);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@ASS_ATTACH_ID", attachId);
                await con.OpenAsync();
                using SqlDataReader reader = await cmd.ExecuteReaderAsync();
                if (!reader.Read())
                {
                    return new JsonResponse
                    {
                        Status = "0",
                        Message = "File not found"
                    };
                }
                long fileId = Convert.ToInt64(reader["FileID"]);
                string fileType = reader["FileType"].ToString();
                string folderPath = reader["FolderPath"].ToString();
                // 🔥 Build physical path
                string basePath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Documents");
                string fullPath = Path.Combine(basePath, folderPath.TrimStart('\\'), fileId + "." + fileType);
                // 🔥 Delete physical file
                if (File.Exists(fullPath))
                {
                    File.Delete(fullPath);
                }
                return new JsonResponse
                {
                    Status = "1",
                    Message = "Attachment deleted successfully"
                };
            }
            catch (Exception ex)
            {
                logger.Error("DeleteAttachment Error", ex);

                return new JsonResponse
                {
                    Status = "0",
                    Message = "Error deleting attachment"
                };
            }
        }
        public async Task<JsonResponse> GetAttachments(int patId)
        {
            try
            {
                var list = new List<PatientAttachment_CM>();

                using SqlConnection con = new SqlConnection(ConnectionString);
                using SqlCommand cmd = new SqlCommand("GetPatientAttachments", con);

                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@PAT_ID", patId);

                await con.OpenAsync();

                using SqlDataReader reader = await cmd.ExecuteReaderAsync();

                while (await reader.ReadAsync())
                {
                    list.Add(new PatientAttachment_CM
                    {
                        ASS_ATTACH_ID = Convert.ToInt32(reader["ASS_ATTACH_ID"]),
                        PAT_ID = Convert.ToInt32(reader["PAT_ID"]),
                        FileID = Convert.ToInt64(reader["FileID"]),
                        DOC_NAME = reader["DOC_NAME"]?.ToString(),
                        DOC_DESC = reader["DOC_DESC"]?.ToString(),
                        FileName = reader["FileName"]?.ToString(),
                        FileType = reader["FileType"]?.ToString(),
                        FileSize = Convert.ToInt64(reader["FileSize"])
                    });
                }

                return new JsonResponse
                {
                    Status = "1",
                    Message = "Success",
                    Data = list
                };
            }
            catch (Exception ex)
            {
                logger.Error("GetAttachments Error", ex);

                return new JsonResponse
                {
                    Status = "0",
                    Message = "Error fetching attachments",
                    Data = null!
                };
            }
        }
        public async Task<JsonResponse> SaveMedicalCertificate(PatientMedicalCertificate_CM model)
        {
            try
            {
                using SqlConnection con = new SqlConnection(ConnectionString);
                using SqlCommand cmd = new SqlCommand("AddPatientMedicalCertificate", con);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@PAT_ID", model.PAT_ID);
                cmd.Parameters.AddWithValue("@MC_DATE", (object?)model.MC_DATE ?? DBNull.Value);
                cmd.Parameters.AddWithValue("@MC_ASS_FROM_DT", (object?)model.MC_ASS_FROM_DT ?? DBNull.Value);
                cmd.Parameters.AddWithValue("@MC_ASS_DT", (object?)model.MC_ASS_DT ?? DBNull.Value);
                cmd.Parameters.AddWithValue("@MC_SUFF_FROM", (object?)model.MC_SUFF_FROM ?? DBNull.Value);
                cmd.Parameters.AddWithValue("@MC_CONSEQUENCES", (object?)model.MC_CONSEQUENCES ?? DBNull.Value);
                cmd.Parameters.AddWithValue("@MC_RECO", (object?)model.MC_RECO ?? DBNull.Value);
                cmd.Parameters.AddWithValue("@LAST_UPDATED_BY", model.LAST_UPDATED_BY);
                await con.OpenAsync();
                await cmd.ExecuteNonQueryAsync();
                return new JsonResponse
                {
                    Status = "1",
                    Message = "Medical Certificate saved successfully"
                };
            }
            catch (Exception ex)
            {
                logger.Error("SaveMedicalCertificate Error", ex);

                return new JsonResponse
                {
                    Status = "0",
                    Message = "Error saving medical certificate"
                };
            }
        }
        public async Task<JsonResponse> GetMedicalCertificateDates(int patId)
        {
            try
            {
                using SqlConnection con = new SqlConnection(ConnectionString);
                using SqlCommand cmd = new SqlCommand("GetMedical_CertificateDates", con);

                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@PAT_ID", patId);

                SqlDataAdapter da = new SqlDataAdapter(cmd);
                DataTable dt = new DataTable();

                await Task.Run(() => da.Fill(dt));

                return new JsonResponse
                {
                    Status = "1",
                    Message = "Success",
                    Data = dt
                };
            }
            catch (Exception ex)
            {
                logger.Error("GetMedicalCertificateDates Error", ex);

                return new JsonResponse
                {
                    Status = "0",
                    Message = "Error fetching dates"
                };
            }
        }
        public async Task<JsonResponse> GetMedicalCertificateByDate(int patId, DateTime mcDate)
        {
            try
            {
                using SqlConnection con = new SqlConnection(ConnectionString);
                using SqlCommand cmd = new SqlCommand("GetMedical_CertificateByDate", con);

                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@PAT_ID", patId);
                cmd.Parameters.AddWithValue("@MC_DATE", mcDate);

                SqlDataAdapter da = new SqlDataAdapter(cmd);
                DataTable dt = new DataTable();

                await Task.Run(() => da.Fill(dt));

                return new JsonResponse
                {
                    Status = "1",
                    Message = "Success",
                    Data = dt
                };
            }
            catch (Exception ex)
            {
                logger.Error("GetMedicalCertificateByDate Error", ex);

                return new JsonResponse
                {
                    Status = "0",
                    Message = "Error fetching data"
                };
            }
        }
        public async Task<JsonResponse> SaveAssessmentPHMBulk(List<PatientAssessmentPHM_CM> list)
        {
            try
            {
                using (SqlConnection con = new SqlConnection(ConnectionString))
                using (SqlCommand cmd = new SqlCommand("AddPatientAssessmentPHMDetail", con))
                {
                    cmd.CommandType = CommandType.StoredProcedure;

                    DataTable dt = ConvertToDatatable(list);

                    SqlParameter param = cmd.Parameters.AddWithValue("@PHMData", dt);
                    param.SqlDbType = SqlDbType.Structured;
                    param.TypeName = "PatientAssessmentPHM_TableType";

                    await con.OpenAsync();
                    await cmd.ExecuteNonQueryAsync();
                }

                return new JsonResponse { Status = "1", Message = "Bulk Saved Successfully" };
            }
            catch (Exception ex)
            {
                logger.Error("Bulk Save Error:", ex);
                return new JsonResponse { Status = "0", Message = "Error occurred" };
            }
        }


    }
    public interface IClinicalRepository
    {
        public Task<JsonResponse> GetPatientsList(Patient_VM model);
        public Task<JsonResponse> GetClinicalDetailsByPatientID(int patientId);
        public Task<JsonResponse> GetDSM4_ICD10MasterData(string type);
        public Task<JsonResponse> SaveInitialDetails(PatientInitialDetails_CM model);
        public Task<JsonResponse> SaveAssessmentDetail(PatientAssessmentDetails model);
        public Task<JsonResponse> SaveICD10Details(PatientICD10_CM model);
        public Task<JsonResponse> SaveDSM4Details(PatientDSM4_CM model);
        public Task<JsonResponse> GetRiskIndicators(int patId);
        public Task<JsonResponse> SaveRiskDetails(PatientRiskSave_CM model);
        public Task<JsonResponse> GetRiskMaster();
        public Task<JsonResponse> SavePrescription(PatientPrescription_CM model);
        public Task<JsonResponse> GetPrescriptionDates(int patId);
        public Task<JsonResponse> GetPrescriptionByDate(int patId, DateTime assDate);
        public Task<JsonResponse> SaveInpatient(PatientInpatient_CM model);
        public Task<JsonResponse> GetInpatient(int patId);
        public Task<JsonResponse> SaveAttachments(PatientAttachment_CM model);
        public Task<JsonResponse> DeleteAttachment(int attachId);
        public Task<JsonResponse> GetAttachments(int patId);
        public Task<JsonResponse> SaveMedicalCertificate(PatientMedicalCertificate_CM model);
        public Task<JsonResponse> GetMedicalCertificateDates(int patId);
        public Task<JsonResponse> GetMedicalCertificateByDate(int patId, DateTime mcDate);
        public Task<JsonResponse> SaveAssessmentPHMBulk(List<PatientAssessmentPHM_CM> list);
    }


}
