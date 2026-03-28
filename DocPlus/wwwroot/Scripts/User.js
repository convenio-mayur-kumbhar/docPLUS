$(document).ready(function () {
    User.BindGrid();
    User.BindDDL();
    $('#tblUser').on('draw.dt', function () { User.ScreenAccessPermission(); });
});

var User = {
    
    BindGrid: function () {
        //$('#tblUser').on('draw.dt', function () { User.ScreenAccessPermission(); });
        LoadGrid(null, "tblUser", "/User/GetData", null, function () {
            $(".AdditionalAccessDeactive").hide().html("");
            User.searchIntoDataTable();
            User.ScreenAccessPermission();
            $("#txtActiveFrom").datepicker({ autoclose: true, todayHighlight: true, format: 'mm/dd/yyyy', useCurrent: false });
            Reload_ddl_Global(null, "#ddlUseRoleSearch", "/AjaxCommon/GetUserRoleDDL", null, "All", function () { $("#ddlUseRoleSearch").select2(); });
            //Reload_ddl_Global(null, "#ddlDesignationSearch", "/AjaxCommon/GetDesignationDDL", null, "All", function () {
            //    $("#ddlDesignationSearch").select2();
            //});
        });
    },

    searchIntoDataTable: function () {
        oTable = $("#tblUser").DataTable();
        $('#ddlUseRoleSearch').change(function () {
            oTable.columns(3).search($(this).children("option:selected").text() == 'All' ? '' : $(this).children("option:selected").text()).draw();
        });       

        $('#ddlDesignationSearch').change(function () {
            oTable.columns(4).search($(this).children("option:selected").text() == 'All' ? '' : $(this).children("option:selected").text()).draw();
        });

        $('#ActiveRoleSearch').change(function () {

            if ($("#ActiveRoleSearch").val() == '1') {
                oTable.columns(8).search('ActiveUser').draw();
            }
            else if ($("#ActiveRoleSearch").val() == '2') {
                oTable.columns(8).search('DeactivatedUser').draw();
            }
            else {
                oTable.columns(8).search('').draw();
            }
        });
    },

    SetForBuildingMap: function (enduserID) {
        window.location.href = "/User/UserBuildingMapping/" + enduserID;
    },

    BindDDL: function () {
        Reload_ddl_Global(null, "#ddlRoleAdd", "/AjaxCommon/GetUserRoleDDL", null, "Select", function () { $("#ddlRoleAdd").select2(); });
        //Reload_ddl_Global(null, "#ddlDesignationAdd", "/AjaxCommon/GetDesignationDDL", null, "Select", function () { $("#ddlDesignationAdd").select2(); });
        $('#ActiveRoleSearch').select2({width: '100%'});
    },

    SetForAdd: function () {
        Reset_Form_Errors();
        User.ClearData();
        $("#lblUserTitle").text("Add User");
        $('#AddUserModal').modal();
        $("#hf_Operation").val('add');

        $("#txtPassword").parent().find('asterisk').show();
        $("#txtReEnterPassword").parent().find('asterisk').show();
    },

    GetDataByID: function (UserId) {

        GetAjaxData("/User/GetData", { EndUserId: UserId }, function (data) {
            var JsonData = data.data;
            Reset_Form_Errors();
            Clear_Form_Fields("#frm_AddUser");
            User.ClearData();

            try {
                if (IsNotNull(JsonData)) {

                    $("#hf_Userid").val(UserId);
                    $("#hf_Operation").val('edit');
                    $("#txtFirstName").val(JsonData.firstName);
                    $("#txtMiddleName").val(JsonData.middleName);
                    $("#txtLastName").val(JsonData.lastName);
                    $("#txtActiveFrom").val(JsonData.effectiveFromDateCustom);
                    if (IsNotNull(JsonData.effectiveFromDateCustom))
                    $("#txtActiveFrom").datepicker("setDate", JsonData.effectiveFromDateCustom);


                    if (!IsNotNull(JsonData.effectiveTillDateCustom))
                        $("#divDeactivated").hide();
                    else if (new Date(JsonData.effectiveTillDateCustom) > new Date())
                        $("#divDeactivated").hide();
                    else
                        $("#divDeactivated").show();

                    var $radios = $('input:radio[name=Gender]');
                    $radios.filter('[value=' + JsonData.gender + ']').prop('checked', true);

                    $("#ddlRoleAdd").val(JsonData.userRoleID).trigger("change");
                    $("#ddlDesignationAdd").val(JsonData.designationID).trigger("change");

                    $("#txtUsername").val(JsonData.loginID);
                    $("#txtEmail").val(JsonData.emailID);

                    $("#txtPassword").parent().find('asterisk').hide();
                    $("#txtReEnterPassword").parent().find('asterisk').hide();
                }
            } catch (e) {
                printError("User.js", 'GetDataByID', e);
            }

        }, function () { });
    },

    SetForUpdate: function (UserId, UserDescription) {
        $("#lblUserTitle").text("Edit User(" + UserDescription + ")");
        User.GetDataByID(UserId);
        $("#AddUserModal").modal();
    },

    SetForClose: function () {
        $("#AddUserModal").modal('hide');
        User.ClearData();
        Clear_Form_Fields("#frm_AddUser");
        $("#hf_UserId").val('');
        $("#hf_Operation").val('');
    },

    AddUpdate: function () {
        Reset_Form_Errors();
        var FormData = User.GetData();
        if (User.ValidateData(FormData)) {
            AddUpdateData("/User/AddUpdate", { Model: FormData }, function (data) {
                try {
                    var result = data.data;
                    if (result["status"] === true) {
                        if (data.status.toLowerCase() === 'success') {
                            showSweetAlert(data.status, data.message, 'success', null);
                            User.BindGrid();
                            User.SetForClose();
                        }
                    }
                    else {
                        showSweetAlert("Failed", result["message"], 'error', null);
                    }

                } catch (e) {
                    printError('User.js', 'AddUpdate', e);
                }

            }, function (responce_data) {
                showSweetAlert(responce_data.status, responce_data.message, 'error', null);
            });
        }
    },

    Delete: function (_id, ItemInfo) {
        DeleteData(User.xhr_getData_For_Delete, "/User/Delete", { EndUserID: _id, CurrentScreenID: CurrentScreenID }, ItemInfo, function () { User.BindGrid(); User.ClearData(); User.SetForClose(); });
    },

    ResetData: function () {
        var ID = $("#hf_Userid").val();

        $(".has-error p").html("");
        $(".has-error").removeClass("has-error");

        if (ID == "" || ID == null || ID == 0 || ID == undefined)
            User.ClearData();
        else
            User.GetDataByID(ID);
    },

    /*Validate form data*/
    ValidateData: function (FormData) {

        var valid = true;
        /*validation for not null/Required*/

        valid = Validate_Control_NullBlank("#txtUsername", FormData.LoginID, 'Required', valid);
        valid = Validate_Control_NullBlank("#txtFirstName", FormData.FirstName, 'Required', valid);
        valid = Validate_Control_NullBlank("#txtLastName", FormData.LastName, 'Required', valid);
        valid = Validate_Control_NullBlank("#txtEmail", FormData.EmailID, 'Required', valid);
        valid = Validate_Control_NullBlank("#txtActiveFrom", FormData.EffectiveFromDate, 'Required', valid);
        valid = Validate_Control_Email("#txtEmail", FormData.EmailID, 'Required', valid);
        if ($("#hf_Operation").val() == 'add') {
            valid = Validate_Control_NullBlank("#txtPassword", FormData.UserIdentity, 'Required', valid);
            valid = Validate_Control_NullBlank("#txtReEnterPassword", $("#txtReEnterPassword").val(), 'Required', valid);
        }

        valid = Validate_DDLControl_NullBlank("#ddlRoleAdd", FormData.UserRoleID, 'Required', valid);

        //valid = Validate_Control_ComparePassword("#txtReEnterPassword", "#txtPassword", "Confirm Password miss match", valid);
        var password = document.getElementById("txtPassword").value;
        var confirmPassword = document.getElementById("txtReEnterPassword").value;
        if (password != confirmPassword) {
            valid = Validate_Control_NullBlank("#txtReEnterPassword", null, 'Required', valid);
            showSweetAlert('Warning!', 'Passwords do not match', 'warning', null);
            return false;
        }


        FocusOnError("#frm_AddUser", valid);
        return valid;
    },

    GetData: function () {

        return {
            EndUserID: $("#hf_Userid").val(),
            LoginID: $("#txtUsername").val(),
            FirstName: $("#txtFirstName").val(),
            MiddleName: $("#txtMiddleName").val(),
            LastName: $("#txtLastName").val(),
            Gender: $("input[name='Gender']:checked").val(),
            EmailID: $("#txtEmail").val(),
            UserRoleID: $("#ddlRoleAdd").val(),
            DesignationID: $("#ddlDesignationAdd").val(),
            UserIdentity: $("#txtPassword").val(),
            EffectiveFromDate: $("#txtActiveFrom").val()
        };
    },

    ClearData: function () {

        ResetFormErrors("#frm_AddUser");
        Clear_Form_Fields("#frm_AddUser");
        $(".has-error p").html("").hide();
        $(".has-error").removeClass("has-error");

        $("#ddlRoleAdd").val("").trigger("change");
        $("#ddlDesignationAdd").val("").trigger("change");
        $("#hf_Userid").val("");
    },

    showDeActivateUserPopup: function (_id, ItemInfo, IsDeactivated) {
        var msg = '';
        if (IsDeactivated) {
            msg = 'Are you sure you want to activate ' + ItemInfo + '?';
        }
        else
            msg = 'Are you sure you want to deactivate ' + ItemInfo + '?';


        $.confirm({
            theme: 'modern',
            title: msg,
            content: '<b> Kindly confirm!</b>',
            animation: 'zoom',
            closeAnimation: 'scale',
            backgroundDismiss: true,
            //autoClose: 'cancel|5000',
            animationSpeed: '400',
            icon: 'flaticon-warning text-warning',
            closeIcon: true,
            buttons: {
                confirm: {
                    text: 'Yes',
                    btnClass: 'btn btn-sm btn-warning',
                    action: function () {
                        User.DeActivateUser(_id, ItemInfo);
                    },
                },

                cancel: {
                    text: 'No',
                    btnClass: 'btn btn-sm btn-default',
                    action: function () { }
                }
            }
        });
    },

    DeActivateUser: function (EndUserID) {
        //AddUpdateData("/User/DeActivateUser", { EndUserID: EndUserID }, function (data) {
        AddUpdateData("/User/DeActivateUserStatus", { EndUserID: EndUserID }, function (data) {

            if (data.status.toLowerCase() == 'success') {
                showSweetAlert('Success!', data.message, 'success', null);
                if (Number(UserID) == Number(EndUserID)) {
                    window.location.href = '/Login';
                }
                User.BindGrid();
            }
            else
                showSweetAlert('Error!', data.message, 'error', null);

        }, null);
    },

    /*  screen access code start    */
    ScreenAccessPermission: function () {
        var returnModal = {};
        var getAccess = GetScreenAccessPermissions(CurrentScreenID);
        if (!getAccess[0].HasInsert) {
            $("#divAdd").addClass("hide").html("");
        }
        if (!getAccess[0].HasDelete) {
            $(".DeleteColumn").hide().html("");
        }
        if (!getAccess[0].HasUpdate) {
            $(".UpdateColumn").hide().html("");
        }
        if (getAccess[0].HasExport) {

            $("#divExport").show();
        }

        if (getAccess[0].HasSelect) {
            var flagUserMapping = false;
            var flagDeActivateUser = false;

            for (let i = 1; i < getAccess.length; i++) {
                if (getAccess.length > 1) {
                    if ((getAccess[i].ActionCode == "UserBuildingMap"))
                        flagUserMapping = true;

                    if ((getAccess[i].ActionCode == "DeActivateUser"))
                        flagDeActivateUser = true;
                }
            }

            if (!flagUserMapping)
                $("#tblUser .BuildingMenu").hide().html("");

            if (!flagDeActivateUser)
                $("#tblUser .DeActivateMenu").hide().html("");

            $("#tblUser .AdditionalAccessDeactive").hide().html("");
        }

        return returnModal;
    },
    /*  screen access code end  */
}

