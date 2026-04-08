
$(document).ready(function () {
    patientRegistration.Init();
    //Reload_ddl_GlobalWithPost(null, "#ddlStatus", "/AjaxCommon/GetStatusMaster", {}, "Select", function () { $("#ddlStatus").select2(); });
    patientRegistration.BindGrid();
});

var patientRegistration = {
    data: [],
    table: null,

    BindGrid: function () {
        LoadGrid(null, "tblPatient", "/PatientRegistrations/GetData", null, function () {
        });
    },

    Init: function () {
        this.table = $("#tblPatient").DataTable({
            pageLength: 10,
            ordering: true
        });
    },

    OpenAdd: function () {
        //$("#PatientModal").modal("show");
        $("#PatientModalTitle").text("Add Patient");
        $("#frmGeneral").val("");
        Reload_ddl_GlobalWithPost(null, "#ddlMaritalStatus", "/AjaxCommon/GetMaritalStatusMaster", {}, "Select", function () { $("#ddlMaritalStatus").select2(); });
        Reload_ddl_GlobalWithPost(null, "#ddlOccupation", "/AjaxCommon/GetOccupationMaster", {}, "Select", function () { $("#ddlOccupation").select2(); });
        Reload_ddl_GlobalWithPost(null, "#ddlCategory", "/AjaxCommon/GetCategoryMaster", {}, "Select", function () { $("#ddlCategory").select2(); });
        Reload_ddl_GlobalWithPost(null, "#ddlStatus", "/AjaxCommon/GetStatusMaster", {}, "Select", function () { $("#ddlStatus").select2(); });
        Reload_ddl_GlobalWithPost(null, "#ddlProfession", "/AjaxCommon/GetProfessionMaster", {}, "Select", function () { $("#ddlProfession").select2(); });
        $("#PatientModal").modal();

    },

    Save: function () {
        var p = {
            first: $("#txtFirstName").val(),
            last: $("#txtLastName").val(),
            mobile: $("#txtMobile").val(),
            email: $("#txtEmail").val(),
            gender: $("#ddlGender").val(),
            status: $("#ddlStatus").val()
        };

        if (!p.first) {
            alert("Enter First Name");
            return;
        }

        this.data.push(p);
        this.Load();
        this.ResetForm();
        $("#PatientModal").modal("hide");
    },

    Load: function () {
        this.table.clear();
        this.data.forEach(function (x, i) {
            patientRegistration.table.row.add([
                x.first,
                x.last,
                x.mobile,
                x.email,
                x.gender,
                x.status,
                "<i class='fa fa-edit' onclick='patientRegistration.Edit(" + i + ")'></i>",
                "<i class='fa fa-trash text-danger' onclick='patientRegistration.Delete(" + i + ")'></i>"
            ]);
        });
        this.table.draw();
    },

    SetForUpdate: function (PatientID) {
        // alert("Edit the form details");
        $("#PatientModelTitle").text("Edit");
        patientRegistration.GetDataByID(PatientID);
        $("#PatientModal").modal("show");

    },    

    Search: function () {
        this.table.column(0).search($("#txtFirstNameSearch").val());
        this.table.column(2).search($("#txtMobileSearch").val());
        this.table.column(3).search($("#txtEmailSearch").val());
        this.table.column(5).search($("#ddlStatusSearch").val());
        this.table.draw();
    },

    Reset: function () {
        $("#frmGeneral").val("");
        $("#txtFirstNameSearch").val("");
        $("#txtMobileSearch").val("");
        $("#txtEmailSearch").val("");
        $("#ddlStatusSearch").val("");
        this.table.search("").columns().search("").draw();
    },

    ResetForm: function () {
        $("#frmGeneral")[0].reset();
        // $("#frmPatient")[0].reset();
        Clear_Form_Fields("#frmGeneral");
    },

    ValidateData: function (FormData) {
        var valid = true;
        valid = Validate_Control_NullBlank("#txtFirstName", FormData.FirstName, 'Required', valid);
        valid = Validate_Control_NullBlank("#txtLastName", FormData.LastName, 'Required', valid);
        valid = Validate_Control_NullBlank("#txtDOB", FormData.DOB, 'Required', valid);
        valid = Validate_Control_NullBlank("#txtMobileNo", FormData.MobileNo, 'Required', valid);
        //valid = Validate_Radio("Gender", "Please select Gender", valid);

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
            Remarks: IsNotNull($("#txtRemarks").val()) ? $("#txtRemarks").val().trim() : null,
            professionID: IsNotNull($("#ddlProfession").val()) ? $("#ddlProfession").val().trim() : null,
        };
    },

    GetDataByID: function (PatientID) {
        GetAjaxData("/patientRegistrations/GetDataByID", { PatientID: PatientID }, function (data) {
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
                    // $("#txtDOB").val(JsonData.dob);
                    if (JsonData.dob) {
                        let dob = new Date(JsonData.dob);
                        let formattedDOB =
                            dob.getFullYear() + "-" +
                            ("0" + (dob.getMonth() + 1)).slice(-2) + "-" +
                            ("0" + dob.getDate()).slice(-2);
                        $("#txtDOB").val(formattedDOB);
                    }


                    $("#txtTeleNo").val(JsonData.telePhoneNo);
                    $("#txtMobileNo").val(JsonData.mobileNo);
                    $("#txtEmail").val(JsonData.emailID);


                    // $("#radioGender").val(JsonData.gender);
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
                console.log("opList data:", opList);

                if ($.fn.DataTable.isDataTable('#tblOtherProf')) { $('#tblOtherProf').DataTable().destroy(); }
                $("#tblOtherProf tbody").empty();
                if (opList && opList.length > 0) {
                    $("#Grid_Data_Template_tblOtherProf").tmpl(opList).appendTo("#tblOtherProf tbody");
                    $('#tblOtherProf').DataTable({
                        paging: true,
                        searching: true,
                        ordering: true
                    });
                } else {
                    var colCount = $("#tblOtherProf thead th").length;
                    $("#tblOtherProf tbody").append("<tr><td colspan='" + colCount + "' class='text-center'>No Records Found</td></tr>");
                }
            } catch (e) {
                printError("patientRegistrations.js", 'GetDataByID', e);
            }

        }, function () { });
    },

    SaveGeneralInfo: function () {
       
        var FormData = patientRegistration.GetData();
        console.log("form values : " + JSON.stringify(FormData));
        if (patientRegistration.ValidateData(FormData)) {
           
            AddUpdateData("/PatientRegistrations/AddUpdate", FormData, function (data) {
                try {
                    var result = data.data;

                    if (data.status.toLowerCase() === 'success') {
                        showSweetAlert(data.status, data.message, 'success', null);

                        patientRegistration.BindGrid();
                        patientRegistration.ClearData();
                       // $("#PatientModal").modal("hide");
                        patientRegistration.SetForClose();
                    }
                    else {
                        showSweetAlert("Failed", result["message"], 'error', null);
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
        // alert("form submit successfully");
        $("#PatientModal").modal('hide');
        patientRegistration.clearData();
        Clear_Form_Fields("#frmGeneral");
        $("#patientID").val('');
    },

    clearData: function () {

        Reset_Form_Errors();
        Clear_Form_Fields("#frmGeneral");
    },

    Delete: function (PatientID) {
        DeleteData(null, "/PatientRegistrations/Delete", { PatientID: PatientID }, function () {
            patientRegistration.BindGrid();
          
        });
    },

    AddKin: function () {

        var patientID = $("#patientID").val() ? parseInt($("#patientID").val()) : 0;


        if (patientID === 0) {
            alert("Please save patient first");
            return;
        }
        var model = {
            //NOK_ID: 0,
            NOK_ID: $("#hdnNokId").val() ? parseInt($("#hdnNokId").val()) : 0,
            PAT_ID: patientID,

            NOK_NAME: $("#kinName").val(),
            NOK_RELATION: $("#kinRelation").val(),
            NOK_ADDR: $("#kinAddress").val(),
            NOK_TELENO: $("#kinTeleNo").val(),
            NOK_MOBNO: $("#kinMobileNo").val(),
            NOK_EMAIL: $("#kinEmail").val(),
            NOK_REMARKS: $("#kinRemarks").val(),
            LAST_UPDATED_BY: 1 
        };
        $.ajax({
            url: "/PatientRegistrations/AddNOK",
            type: "Post",
            data: model,
            success: function () {
                //  if (res && res.data && res.data.status === false) {
                if (model.NOK_ID >= 0 && model.PAT_ID > 0) {
                    alert("Record added successfully");                  
                    patientRegistration.GetDataByID(patientID);
                }
                else {
                    alert("Save failed");
                    //alert("Record added successfully");
                }
            }          
        });        
    },

    AddOtherProf: function () {

        var patientID = $("#patientID").val() ? parseInt($("#patientID").val()) : 0;


        if (patientID === 0) {
            alert("Please save patient first");
            return;
        }
        var model = {
            OP_ID: $("#OP_ID").val() ? parseInt($("#OP_ID").val()) : 0,
            PAT_ID: patientID,

            OP_NAME: $("#otherProfName").val(),
            PROFESSION_ID: $("#ddlProfession").val(),            
            OP_TELENO: $("#otherProfTeleNo").val(),
            OP_MOBNO: $("#otherProfMobileNo").val(),
            OP_EMAIL: $("#otherProfEmailID").val(),
            OP_ADDR: $("#otherProfAddress").val(),
            OP_REMARKS: $("#otherProfRemarks").val(),
            LAST_UPDATED_BY: 1,
        };
        $.ajax({
            url: "/PatientRegistrations/AddOP",
            type: "Post",
            data: model,
            success: function () {
                //  if (res && res.data && res.data.status === false) {
                if (model.OP_ID >= 0 && model.PAT_ID > 0) {
                    alert("Record added successfully");
                    patientRegistration.GetDataByID(patientID);
                }
                else {
                    alert("Save failed");
                    //alert("Record added successfully");
                }
            }
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

       // alert("please fill the form");
    },

    DeleteNOK: function (NOK_ID) {
        DeleteData(null, "/PatientRegistrations/DeleteNOK", { NOK_ID: NOK_ID, UserID:1 }, function () {
            patientRegistration.BindGrid();

        });
    },

    UpdateOP: function (oP_ID, oP_NAME, professioN_NAME, oP_TELENO, oP_MOBNO, oP_EMAIL, oP_ADDR, oP_REMARKS) {

        $("#OP_ID").val(oP_ID);
        $("#otherProfName").val(oP_NAME);
        $("#ddlProfession").val(professioN_NAME);
        $("#otherProfTeleNo").val(oP_TELENO);
        $("#otherProfMobileNo").val(oP_MOBNO);
        $("#otherProfEmailID").val(oP_EMAIL);
        $("#otherProfAddress").val(oP_ADDR);
        $("#otherProfRemarks").val(oP_REMARKS);

    },

};

