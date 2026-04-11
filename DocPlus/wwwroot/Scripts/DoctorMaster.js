var form = $('#__AjaxAntiForgeryForm');
var token = $('input[name="__RequestVerificationToken"]', form).val();

$(document).ready(function () {
    doctorMaster.Init();
    doctorMaster.BindGrid();
});

var doctorMaster = {
    data: [],
    table: null,
    BindGrid: function () {
        if ($.fn.DataTable.isDataTable('#tblDoctorMaster')) {
            $('#tblDoctorMaster').DataTable().destroy();
        }
        LoadGridPost(null, "tblDoctorMaster", "/DoctorMaster/GetDoctorList", { __RequestVerificationToken: token }, function () { });
    },
    Init: function () {
        if (!$.fn.DataTable.isDataTable('#tblDoctorMaster')) {
            this.table = $("#tblDoctorMaster").DataTable({
                pageLength: 10,
                ordering: true
            });
        }
    },
    SetForAdd: function () {
        $("#DoctorModalTitle").text("Add Doctor");   
        $("#frmDoctor")[0].reset();                 
        $("#DoctorModal").modal('show');
    },     

    SetForUpdate: function (DOC_ID) {

        $("#DoctorModalTitle").text("Edit Doctor");
        $("#frmDoctor")[0].reset();
        Reset_Form_Errors();
        $("#DoctorModal").modal('show');
        doctorMaster.GetDataByID(DOC_ID);
    },

    ResetForm: function () {
        $('#txtName').val('');
        $('#txtMobileNo').val('');
    },
    ValidateData: function (FormData) {
        var valid = true;
        valid = Validate_Control_NullBlank("#txtName", FormData.DOC_NAME, 'Required', valid);
        return valid;
    },
    GetData: function () {
        return {
            DOC_ID: $("#DOC_ID").val() ? parseInt($("#DOC_ID").val()) : 0,
            DOC_SCODE: IsNotNull($("#txtShortcode").val()) ? $("#txtShortcode").val().trim() : null,
            DOC_NAME: IsNotNull($("#txtName").val()) ? $("#txtName").val().trim() : null,
            DOC_MOBNO: IsNotNull($("#txtMobileNo").val()) ? $("#txtMobileNo").val().trim() : null,
            DOC_TELENO: IsNotNull($("#txtTeleNo").val()) ? $("#txtTeleNo").val().trim() : null,
            DOC_EMAIL: IsNotNull($("#txtEmail").val()) ? $("#txtEmail").val().trim() : null,
            DOC_ADDR: IsNotNull($("#txtAddress").val()) ? $("#txtAddress").val().trim() : null,
            DOC_REMARKS: IsNotNull($("#txtRemark").val()) ? $("#txtRemark").val().trim() : null,
        };
    },
    GetDataByID: function (DOC_ID) {
        GetAjaxData("/doctorMaster/GetDoctorMasterDetailsById", { DOC_ID: DOC_ID, __RequestVerificationToken: token }, function (data) {
            var JsonData = data.data;
            Reset_Form_Errors();
            Clear_Form_Fields("#frmDoctor");
            doctorMaster.clearData();
            try {
                if (IsNotNull(JsonData)) {
                    $("#DOC_ID").val(JsonData.doC_ID);
                    $("#txtShortcode").val(JsonData.doC_SCODE);
                    $("#txtName").val(JsonData.doC_NAME);
                    $("#txtMobileNo").val(JsonData.doC_MOBNO);
                    $("#txtTeleNo").val(JsonData.doC_TELENO);
                    $("#txtEmail").val(JsonData.doC_EMAIL);
                    $("#txtAddress").val(JsonData.doC_ADDR);
                    $("#txtRemark").val(JsonData.doC_REMARKS);                    
                }

            } catch (e) {
                printError("DoctorMaster.js", 'GetDataByID', e);
            }

        }, function () { });
    },

    SaveDoctor: function () {
        var FormData = doctorMaster.GetData();
        if (doctorMaster.ValidateData(FormData)) {
            AddUpdateData("/DoctorMaster/AddUpdateDoctorMaster", { Model: FormData, __RequestVerificationToken: token }, function (data) {
                try {
                    if (data.status === true || data.status === 'Success') {
                        showSweetAlert("Success", data.message, 'success', null);
                        $("#DoctorModal").modal('hide');
                        doctorMaster.BindGrid();
                    }
                    else {
                        showSweetAlert("Failed", data.message, 'error', null);
                    }
                } catch (e) {
                    printError('DoctorMaster.js', 'AddUpdate', e);
                }
            }, function (response_data) {
                showSweetAlert(response_data.status, response_data.message, 'error', null);
            });
        }
    },

    SetForClose: function () {

        $("#DoctorModal").modal("hide");
        $("#frmDoctor")[0].reset();
        $("#DOC_ID").val("");
        doctorMaster.BindGrid();
    },

    clearData: function () {
        Reset_Form_Errors();
        Clear_Form_Fields("#frmDoctor");
    },

    Delete: function (id, DOC_NAME) {
        var Name = DOC_NAME;
        DeleteData(null, "/DoctorMaster/DeleteDoctorMaster",{ DoctorID: id, __RequestVerificationToken: token }, Name, function () {
            //setTimeout(function () {
            //    doctorMaster.BindGrid();
            //}, 500);
            doctorMaster.BindGrid();
        });
       
    },
    
};



