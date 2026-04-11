var form = $('#__AjaxAntiForgeryForm');
var token = $('input[name="__RequestVerificationToken"]', form).val();
$(document).ready(function () {
    patientRegistration.Init();
    patientRegistration.BindGrid();
});
var patientRegistration = {
    data: [],
    table: null,
    BindGrid: function () {
        if ($.fn.DataTable.isDataTable('#tblPatient')) {
            $('#tblPatient').DataTable().destroy();
        }
        LoadGridPost(null, "tblPatient", "/PatientRegistrations/GetData", { __RequestVerificationToken: token }, function () { });
    },
    Init: function () {
        if (!$.fn.DataTable.isDataTable('#tblPatient')) {
            this.table = $("#tblPatient").DataTable({
                pageLength: 10,
                ordering: true
            });
        }
    },
    Registration: function () {
        LoadAddUpdateView('#divPatientRegistration', '/PatientRegistrations/_partialPatientRegistration', null, function () {
            $("#divGrid").hide();
            $("#btnAddPatient").hide();
            $("#divPatientRegistration").show();
            $("#frmGeneral").val("");
            Reload_ddl_GlobalWithPost(null, "#ddlMaritalStatus", "/AjaxCommon/GetMaritalStatusMaster", {}, "Select", function () { $("#ddlMaritalStatus").select2(); });
            Reload_ddl_GlobalWithPost(null, "#ddlOccupation", "/AjaxCommon/GetOccupationMaster", {}, "Select", function () { $("#ddlOccupation").select2(); });
            Reload_ddl_GlobalWithPost(null, "#ddlCategory", "/AjaxCommon/GetCategoryMaster", {}, "Select", function () { $("#ddlCategory").select2(); });
            Reload_ddl_GlobalWithPost(null, "#ddlStatus", "/AjaxCommon/GetStatusMaster", {}, "Select", function () { $("#ddlStatus").select2(); });
            Reload_ddl_GlobalWithPost(null, "#ddlProfession", "/AjaxCommon/GetProfessionMaster", {}, "Select", function () { $("#ddlProfession").select2(); });
        });
    },
    OpenAdd: function () {
        $("#PatientModalTitle").text("Add Patient");
        $("#frmGeneral").val("");
        Reload_ddl_GlobalWithPost(null, "#ddlMaritalStatus", "/AjaxCommon/GetMaritalStatusMaster", {}, "Select", function () { $("#ddlMaritalStatus").select2(); });
        Reload_ddl_GlobalWithPost(null, "#ddlOccupation", "/AjaxCommon/GetOccupationMaster", {}, "Select", function () { $("#ddlOccupation").select2(); });
        Reload_ddl_GlobalWithPost(null, "#ddlCategory", "/AjaxCommon/GetCategoryMaster", {}, "Select", function () { $("#ddlCategory").select2(); });
        Reload_ddl_GlobalWithPost(null, "#ddlStatus", "/AjaxCommon/GetStatusMaster", {}, "Select", function () { $("#ddlStatus").select2(); });
        Reload_ddl_GlobalWithPost(null, "#ddlProfession", "/AjaxCommon/GetProfessionMaster", {}, "Select", function () { $("#ddlProfession").select2(); });
        $("#PatientModal").modal();
    },
    SetForUpdate: function (PatientID) {
        LoadAddUpdateView('#divPatientRegistration', '/PatientRegistrations/_partialPatientRegistration', null, function () {
            $("#divGrid").hide();
            $("#btnAddPatient").hide();
            $("#divPatientRegistration").show();
            patientRegistration.GetDataByID(PatientID);
            $("#divPatientRegistration").show();
        });
    },
    ResetForm: function () {
        $('#txtFirstName').val('');
        $('#txtLastName').val('');
        $('#txtMiddleName').val('');
        $('#txtMobileNo').val('');
        $('#txtDOB').val('');
        $('#ddlMaritalStatus').val('');
        $('#ddlOccupation').val('');
        $('#txtTeleNo').val('');
        $('#txtMobileNo').val('');
        $('#txtEmail').val('');
        $('#ddlCategory').val('');
        $('#ddlStatus').val('');
        $("input[name='Gender']").prop("checked", false);
        $('#txtAddress').val('');
        $('#txtReferredBy').val('');
        $('#txtRemarks').val('');
    },
    ValidateData: function (FormData) {
        var valid = true;
        valid = Validate_Control_NullBlank("#txtFirstName", FormData.FirstName, 'Required', valid);
        valid = Validate_Control_NullBlank("#txtLastName", FormData.LastName, 'Required', valid);
        valid = Validate_Control_NullBlank("#txtDOB", FormData.DOB, 'Required', valid);
        valid = Validate_Control_NullBlank("#txtMobileNo", FormData.MobileNo, 'Required', valid);
        return valid;
    },
    GetData: function () {
        return {
            PatientID: $("#patientID").val() ? parseInt($("#patientID").val()) : 0,
            FirstName: IsNotNull($("#txtFirstName").val()) ? $("#txtFirstName").val().trim() : null,
            MiddleName: IsNotNull($("#txtMiddleName").val()) ? $("#txtMiddleName").val().trim() : null,
            LastName: IsNotNull($("#txtLastName").val()) ? $("#txtLastName").val().trim() : null,
            DOB: IsNotNull($("#txtDOB").val()) ? $("#txtDOB").val().trim() : null,
            MarritialStatusID: IsNotNull($("#ddlMaritalStatus").val()) ? $("#ddlMaritalStatus").val().trim() : null,
            OccupationID: IsNotNull($("#ddlOccupation").val()) ? $("#ddlOccupation").val().trim() : null,
            TelePhoneNo: IsNotNull($("#txtTeleNo").val()) ? $("#txtTeleNo").val().trim() : null,
            MobileNo: IsNotNull($("#txtMobileNo").val()) ? $("#txtMobileNo").val().trim() : null,
            EmailID: IsNotNull($("#txtEmail").val()) ? $("#txtEmail").val().trim() : null,
            CategoryID: IsNotNull($("#ddlCategory").val()) ? $("#ddlCategory").val().trim() : null,
            StatusID: IsNotNull($("#ddlStatus").val()) ? $("#ddlStatus").val().trim() : null,
            Gender: $("input[name='Gender']:checked").val() || null,
            Address: IsNotNull($("#txtAddress").val()) ? $("#txtAddress").val().trim() : null,
            RefferedBy: IsNotNull($("#txtReferredBy").val()) ? $("#txtReferredBy").val().trim() : null,
        };
    },
    GetDataByID: function (PatientID) {
        GetAjaxData("/patientRegistrations/GetDataByID", { PatientID: PatientID, __RequestVerificationToken: token }, function (data) {
            var JsonData = data.data;
            Reset_Form_Errors();
            Clear_Form_Fields("#frmGeneral");
            patientRegistration.clearData();
            try {
                if (IsNotNull(JsonData)) {
                    $("#patientID").val(JsonData.patientID);
                    $("#txtFirstName").val(JsonData.firstName);
                    $("#txtMiddleName").val(JsonData.middleName);
                    $("#txtLastName").val(JsonData.lastName);
                    $("#txtTeleNo").val(JsonData.telePhoneNo);
                    $("#txtMobileNo").val(JsonData.mobileNo);
                    $("#txtEmail").val(JsonData.emailID);
                    if (JsonData.gender) {
                        let gender = JsonData.gender.toString().trim();
                        $("input[name='Gender'][value='" + gender + "']").prop("checked", true);
                    }
                    $("#txtAddress").val(JsonData.address);
                    $("#txtReferredBy").val(JsonData.refferedBy);
                    $("#txtRemarks").val(JsonData.remarks);
                    if (JsonData.dob) {
                        let dob = new Date(JsonData.dob);
                        let formattedDOB =
                            dob.getFullYear() + "-" +
                            ("0" + (dob.getMonth() + 1)).slice(-2) + "-" +
                            ("0" + dob.getDate()).slice(-2);
                        $("#txtDOB").val(formattedDOB);
                    }
                    Reload_ddl_GlobalWithPost(null, "#ddlMaritalStatus", "/AjaxCommon/GetMaritalStatusMaster", {}, "Select", function () {
                        $("#ddlMaritalStatus").select2();
                        $("#ddlMaritalStatus").val(JsonData.marritialStatusID).trigger('change');
                    });
                    Reload_ddl_GlobalWithPost(null, "#ddlOccupation", "/AjaxCommon/GetOccupationMaster", {}, "Select", function () {
                        $("#ddlOccupation").select2();
                        $("#ddlOccupation").val(JsonData.occupationID).trigger('change');
                    });
                    Reload_ddl_GlobalWithPost(null, "#ddlCategory", "/AjaxCommon/GetCategoryMaster", {}, "Select", function () {
                        $("#ddlCategory").select2();
                        $("#ddlCategory").val(JsonData.categoryID).trigger('change');
                    });
                    Reload_ddl_GlobalWithPost(null, "#ddlStatus", "/AjaxCommon/GetStatusMaster", {}, "Select", function () {
                        $("#ddlStatus").select2();
                        $("#ddlStatus").val(JsonData.statusID).trigger('change');
                    });
                    Reload_ddl_GlobalWithPost(null, "#ddlProfession", "/AjaxCommon/GetProfessionMaster", {}, "Select", function () {
                        $("#ddlProfession").select2();
                        $("#ddlProfession").val(JsonData.professionID).trigger('change');
                    });
                }
                var nokList = JsonData.nokList;
                if ($.fn.DataTable.isDataTable('#tblKin')) { $('#tblKin').DataTable().destroy(); }
                $("#tblKinBody").empty();
                if (nokList && nokList.length > 0) {
                    $("#Grid_Data_Template_tblKin").tmpl(nokList).appendTo("#tblKinBody");
                    $('#tblKin').DataTable({
                        paging: true,
                        searching: true,
                        ordering: true
                    });
                } else {
                    var colCount = $("#tblKin thead th").length;
                    $("#tblKinBody").append("<tr><td colspan='" + colCount + "' class='text-center'>No Records Found</td></tr>");
                }
                var opList = JsonData.opList;
                if ($.fn.DataTable.isDataTable('#tblOtherProf')) { $('#tblOtherProf').DataTable().destroy(); }
                $("#tblOPBody").empty();
                if (opList && opList.length > 0) {
                    $("#Grid_Data_Template_tblOtherProf").tmpl(opList).appendTo("#tblOPBody");
                    $('#tblOtherProf').DataTable({
                        paging: true,
                        searching: true,
                        ordering: true
                    });
                } else {
                    var colCount = $("#tblOtherProf thead th").length;
                    $("#tblOPBody").append("<tr><td colspan='" + colCount + "' class='text-center'>No Records Found</td></tr>");
                }
            } catch (e) {
                printError("patientRegistrations.js", 'GetDataByID', e);
            }

        }, function () { });
    },
    SaveGeneralInfo: function () {
        var FormData = patientRegistration.GetData();
        if (patientRegistration.ValidateData(FormData)) {
            AddUpdateData("/PatientRegistrations/AddUpdate", { Model: FormData, __RequestVerificationToken: token }, function (data) {
                try {
                    if (data.status === true || data.status === 'Success') {
                        showSweetAlert("Success", data.message, 'success', null);

                    }
                    else {
                        showSweetAlert("Failed", data.message, 'error', null);
                    }

                } catch (e) {
                    printError('Patient.js', 'AddUpdate', e);
                }

            }, function (response_data) {
                showSweetAlert(response_data.status, response_data.message, 'error', null);
            });
        }
    },
    SetForClose: function () {
        $("#divGrid").show();
        $("#btnAddPatient").show();
        $("#divPatientRegistration").hide();
    },
    clearData: function () {
        Reset_Form_Errors();
        Clear_Form_Fields("#frmGeneral");
        Clear_Form_Fields("#frmKin");
        Clear_Form_Fields("#frmProfessional");
    },
    Delete: function (PatientID, firstName, lastName) {
        var FullName = firstName + ' ' + lastName;
        DeleteData(null, "/PatientRegistrations/Delete",
            { PatientID: PatientID, __RequestVerificationToken: token }, FullName, function () {
                setTimeout(function () {
                    patientRegistration.BindGrid();
                }, 500);
            });
    },
    AddKin: function () {
        var patientID = $("#patientID").val() ? parseInt($("#patientID").val()) : 0;
        if (patientID === 0) {
            alert("Please save patient first");
            return;
        }
        var model = {
            NOK_ID: $("#hdnNokId").val() ? parseInt($("#hdnNokId").val()) : 0,
            PAT_ID: patientID,
            NOK_NAME: $("#kinName").val(),
            NOK_RELATION: $("#kinRelation").val(),
            NOK_ADDR: $("#kinAddress").val(),
            NOK_TELENO: $("#kinTeleNo").val(),
            NOK_MOBNO: $("#kinMobileNo").val(),
            NOK_EMAIL: $("#kinEmail").val(),
            NOK_REMARKS: $("#kinRemarks").val(),
            LAST_UPDATED_BY: UserID
        };
        AddUpdateData("/PatientRegistrations/AddNOK", { Model: model, __RequestVerificationToken: token }, function (data) {
            try {
                if (data.status === true || data.status === 'Success') {
                    showSweetAlert("Success", data.message, 'success', null);
                }
                else {
                    showSweetAlert("Failed", data.message, 'error', null);
                }

            } catch (e) {
                printError('Patient.js', 'AddUpdate', e);
            }
        }, function (response_data) {
            showSweetAlert(response_data.status, response_data.message, 'error', null);
        });
    },
    AddOtherProf: function () {
        var patientID = $("#patientID").val() ? parseInt($("#patientID").val()) : 0;
        if (patientID === 0) {
            alert("Please save patient first");
            return;
        }
        var model = {
            OP_ID: $("#hdnopId").val() ? parseInt($("#hdnopId").val()) : 0,
            PAT_ID: patientID,

            OP_NAME: $("#otherProfName").val(),
            PROFESSION_ID: $("#ddlProfession").val(),
            OP_TELENO: $("#otherProfTeleNo").val(),
            OP_MOBNO: $("#otherProfMobileNo").val(),
            OP_EMAIL: $("#otherProfEmailID").val(),
            OP_ADDR: $("#otherProfAddress").val(),
            OP_REMARKS: $("#otherProfRemarks").val(),
            LAST_UPDATED_BY: UserID
        };
        AddUpdateData("/PatientRegistrations/AddOP", { Model: model, __RequestVerificationToken: token }, function (data) {
            try {
                if (data.status === true || data.status === 'Success') {
                    showSweetAlert("Success", data.message, 'success', null);
                }
                else {
                    showSweetAlert("Failed", data.message, 'error', null);
                }
            } catch (e) {
                printError('Patient.js', 'AddUpdate', e);
            }

        }, function (response_data) {
            showSweetAlert(response_data.status, response_data.message, 'error', null);
        });
    },
    SetNOKUpdate: function (NOK_ID, noK_NAME, noK_RELATION, noK_ADDR, noK_TELENO, noK_MOBNO, noK_EMAIL, noK_REMARKS) {
        $("#NOK_ID").val(NOK_ID);
        $("#kinName").val(noK_NAME);
        $("#kinRelation").val(noK_RELATION);
        $("#kinAddress").val(noK_ADDR);
        $("#kinTeleNo").val(noK_TELENO);
        $("#kinMobileNo").val(noK_MOBNO);
        $("#kinEmail").val(noK_EMAIL);
        $("#kinRemarks").val(noK_REMARKS);
    },
    DeleteNOK: function (NOK_ID,NOK_Name) {
        DeleteData(null, "/PatientRegistrations/DeleteNOK", { NOK_ID: NOK_ID, __RequestVerificationToken: token }, NOK_Name,function () {
            var patientID = $("#patientID").val();
            patientRegistration.GetDataByID(patientID);
        });
    },
    UpdateOP: function (oP_ID, oP_NAME, professioN_ID, oP_TELENO, oP_MOBNO, oP_EMAIL, oP_ADDR, oP_REMARKS) {
        $("#hdnopId").val(oP_ID);
        $("#otherProfName").val(oP_NAME);
        $("#otherProfTeleNo").val(oP_TELENO);
        $("#otherProfMobileNo").val(oP_MOBNO);
        $("#otherProfEmailID").val(oP_EMAIL);
        $("#otherProfAddress").val(oP_ADDR);
        $("#otherProfRemarks").val(oP_REMARKS);
        Reload_ddl_GlobalWithPost(null, "#ddlProfession", "/AjaxCommon/GetProfessionMaster", {}, $("#ddlProfession").val(professioN_ID), function () {
            $("#ddlProfession").val(professioN_ID);
        });
    },
    DeleteOP: function (OP_ID,OP_Name) {
        DeleteData(null, "/PatientRegistrations/DeleteOP", { OP_ID: OP_ID, __RequestVerificationToken: token }, OP_Name, function () {
            var patientID = $("#patientID").val();
            patientRegistration.GetDataByID(patientID);
        });
    },
};

