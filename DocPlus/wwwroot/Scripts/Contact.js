/// <reference path="../js/Common.js" />
$(document).ready(function () {
    
    Contact.BindDDl();
    Reload_ddl_Global(null, "#ddlContactMethod", "/AjaxCommon/GetContactMethodDDL", null, "Select", function () { $("#ddlContactMethod").select2(); });

    Reload_ddl_Global(null, "#ddlCustomerSearch", "/AjaxCommon/GetCustomerDDL", null, "Select", function () {
        $("#ddlCustomerSearch").val(_CustomerID).select2();
        $("#ddlCustomerSearch").select2();
        if ($("#ddlCustomerSearch option").length > 1) {
            //$("#ddlCustomerSearch").val($("#ddlCustomerSearch option:eq(1)").val()).select2();            
            Contact.BindGrid();
        }
    });
    //Contact.BindGrid();

    $('#tblContact').on('draw.dt', function () {
        Contact.ScreenAccessPermission();
    });

});



var Contact = {

    xhr_getData_For_Delete: null,

    BindBuildingDDLForAdd: function () {
        if (IsNotNull($("#ddlCustomer").val())) {
            Reload_ddl_Global(null, "#ddlBuildingMap", "/AjaxCommon/GetBuildingDDL", { CustomerID: $("#ddlCustomer").val() }, "Select", function (data) {
                $("#ddlBuildingMap").select2();
            });
        } 
    },

    SetForSearch: function () {
        var sp = $("span[role=combobox]")
        $('#ddlCustomerSearch').parent().find(sp).css("border-color", "#E2E5EC");
        var FormData = Contact.GetDataForSearch();
        if (Contact.ValidateDataSearch(FormData)) {
            Contact.BindGrid();
        }
    },

    ResetDropDowns: function () {
        //Reload_ddl_Global(null, "#ddlCustomerSearch", "/AjaxCommon/GetCustomerDDL", null, "Select",
        //    function () {
        //        $("#ddlCustomerSearch").select2();
        //    });
        $("#divIDViewContact").hide();
        Contact.BindGrid();
    },

    ValidateDataSearch: function (FormData) {
        var valid = true;
        valid = Validate_DDLControl_NullBlank("#ddlCustomerSearch", FormData.CustomerID, 'Required', valid);
        return valid;
    },

    GetDataForSearch: function () {
        var Data = {
            CustomerID: $("#ddlCustomerSearch").val()
        };
        return Data;
    },

    BindGrid: function () {
        LoadGrid(null, "tblContact", "/Contact/GetData", { CustomerID: $("#ddlCustomerSearch").val() || 0 }, function () {
            Contact.ScreenAccessPermission();
            $("#divIDViewContact").show();
        });
    },

    GetData: function () {
        var Data = {
            ContactId: $("#hf_contactId").val(),
            CustomerID: $("#ddlCustomer").val(),
            FirstName: $("#txtFirstName").val().trim(),
            LastName: $("#txtLastName").val().trim(),
            IsActiveStatus: $("#chkbIsActive").prop('checked'),
            //BuildingCode: $("#ddlBuildingMap").val(),
            //ContactCategoryID: $("#ddlContactCategoryMap").val(),
            //ContactTypeID: $("#ddlContactTypeMap").val(),
        };

        var ContactLineList = [];

        $("#tblContactLine tbody tr").each(function () {
            ContactLineList.push({
                ContactLineID: IsNotNull($(this).attr('data-id')) ? Number($(this).attr('data-id')) : null,
                Contact: $(this).find(".Contact").text().trim(),
                Extention: $(this).find(".Extention").text().trim(),
                ContactMethodID: $(this).find("input.contactMethodID").val(),
                ContactId: $("#hf_contactId").val(),
                NotificationStatus: $(this).find("input.NotificationStatus").val(),
                IsActiveStatus: $(this).find("input.chkbContactLineStatus").prop('checked'),
            });
        });

        if (ContactLineList.length > 0)
            Data["ContactLine_TableTypeList"] = ContactLineList;

        var BuildingContactList = [];

        $("#tblBuildingContact tbody tr").each(function () {
            BuildingContactList.push({
                BuildingContactID: IsNotNull($(this).attr('data-id')) ? Number($(this).attr('data-id')) : null,
                BuildingCode: $(this).find(".BuildingCode").text().trim(),
                ContactCategoryID: $(this).find("input.ContactCategoryID").val(),
                ContactTypeID: $(this).find("input.ContactTypeID").val(),
                BuildingID: $(this).find("input.ContactBuildingID").val(),
                ContactId: $("#hf_contactId").val(),
            });
        });

        if (BuildingContactList.length > 0)
            Data["BuildingContact_TableTypeList"] = BuildingContactList;

        return Data;
    },

    ValidateData: function (FormData) {
        var valid = true;
        valid = Validate_DDLControl_NullBlank("#ddlCustomer", FormData.CustomerID, 'Required', valid);
        valid = Validate_Control_NullBlank("#txtFirstName", FormData.FirstName, "Required", valid);
        valid = Validate_Control_NullBlank("#txtLastName", FormData.LastName, "Required", valid);

        //if (IsNotNull($("#ddlBuildingMap").val()) || IsNotNull($("#ddlContactCategoryMap").val()) || IsNotNull($("#ddlContactTypeMap").val())) {
        //    valid = Validate_DDLControl_NullBlank("#ddlBuildingMap", FormData.BuildingCode, 'Required', valid);
        //    valid = Validate_DDLControl_NullBlank("#ddlContactCategoryMap", FormData.ContactCategoryID, 'Required', valid);
        //    valid = Validate_DDLControl_NullBlank("#ddlContactTypeMap", FormData.ContactTypeID, 'Required', valid);
        //    $("#accordion").show();
        //    valid = false;
        //}

        //if (IsNotNull($("#ddlBuildingMap").val()) && IsNotNull($("#ddlContactCategoryMap").val()) && IsNotNull($("#ddlContactTypeMap").val())) {
        //    valid = true;
        //}

        if ($("#tblContactLine tbody tr").length == 0) {
            valid = false;
            showSweetAlert("Warning", "Building Contact required", 'warning', null);
        }
        return valid;
    },

    AddUpdate: function () {
        Reset_Form_Errors();
        var FormData = this.GetData();
        if (this.ValidateData(FormData)) {
            AddUpdateData("/Contact/AddUpdate", { Model: FormData }, function (responce_data) {

                var result = responce_data.data;
                if (result["status"] === true) {
                    if (responce_data.status.toLowerCase() === 'success') {
                        showSweetAlert(responce_data.status, responce_data.message, 'success', null);
                        Contact.BindGrid();
                        Contact.SetForClose();
                    }
                }
                else {
                    showSweetAlert("Failed", result["message"], 'error', null);
                }

            }, function () {
            });
        }
    },

    BindDDl: function () {
        Reload_ddl_Global(null, "#ddlBuildingMap", "/AjaxCommon/GetAllBuildingDDL", { CustomerID:0}, "Select", function () { $("#ddlBuildingMap").select2(); });
        Reload_ddl_Global(null, "#ddlContactCategoryMap", "/AjaxCommon/GetContactCategoryDDL", null, "Select", function () { $("#ddlContactCategoryMap").select2(); });
        Reload_ddl_Global(null, "#ddlContactTypeMap", "/AjaxCommon/GetContactTypeDDL", null, "Select", function () { $("#ddlContactTypeMap").select2(); });
    },

    SetForAdd: function () {
        $("#hf_IsAddOrUpdate").val('ADD');
        Reset_Form_Errors();
        Contact.ClearData();
        Clear_Form_Fields("#frm_AddContact");

        $("#lblContactTitle").text("Add Contact");
        $("#AddContactModal").modal();

        Reload_ddl_Global(null, "#ddlCustomer", "/AjaxCommon/GetCustomerDDL", null, "Select", function () {
            $("#ddlCustomer").select2();
            if ($("#ddlCustomer option").length > 1) {
                //$("#ddlCustomer").val($("#ddlCustomer option:eq(1)").val()).select2();
                $("#ddlCustomer").val(_CustomerID).select2();
                Contact.BindBuildingDDLForAdd();
            }
        });

        $("#divIsActive").hide();
        if ($("#tblContactLine tbody tr").length > 0) {
            $('tr[data-contact]').remove();
            $("#tblContactLine").hide();
        }
        else {
            $("#tblContactLine").hide();
        }

        $('#collapseOne').collapse('hide');

        $("#accordion").show();

        if ($("#tblBuildingContact tbody tr").length > 0) {
            $('tr[data-BuildingCode]').remove();
            $("#tblBuildingContact").hide();
        }
        else {
            $("#tblBuildingContact").hide();
        }

    },

    SetForUpdate: function (contactId, ContactDescription, customerID) {
        $("#hf_IsAddOrUpdate").val('UPDATE');
        $("#lblContactTitle").text("Edit Contact(" + ContactDescription + ")");
        Reload_ddl_Global(null, "#ddlCustomer", "/AjaxCommon/GetCustomerDDL", null, "Select", function () {
            $("#ddlCustomer").select2();
            $("#divIsActive").show();
            Contact.GetDataByID(contactId, customerID);
            $("#AddContactModal").modal();
        });
    },

    SetForClose: function () {
        $("#AddContactModal").modal('hide');
        $("#divIsActive").hide();
        $("#ddlCustomer").attr('disabled', true);
        Contact.ClearData();
        Clear_Form_Fields("#frm_AddContact");
    },

    ClearData: function () {
        ResetFormErrors("#frm_AddContact");
        Clear_Form_Fields("#frm_AddContact");
        $(".has-error p").html("").hide();
        $(".has-error").removeClass("has-error");
        $("#hf_contactId").val('');
        $("#chkbIsActive").prop('checked', 1);

        if ($("#tblContactLine tbody tr").length > 0) {
            $('tr[data-contact]').remove();
            $("#tblContactLine").hide();
        }
        else {
            $("#tblContactLine").hide();
        }
        //$("#ddlCustomer").val("").select2();
        Contact.ClearContactLineData();
    },

    ResetData: function () {
        var ID = $("#hf_contactId").val();

        $(".has-error p").html("");
        $(".has-error").removeClass("has-error");

        if (ID == "" || ID == null || ID == 0 || ID == undefined)
            Contact.ClearData();
        else
            Contact.GetDataByID(ID, $("#ddlCustomer").val());
    },

    GetDataByID: function (ContactID, customerID) {
        
        GetAjaxData("/Contact/GetData", { contactId: ContactID, CustomerID: customerID }, function (data) {
           
            var JsonData = data.data;
            Reset_Form_Errors();
            Clear_Form_Fields("#frm_AddContact");
            Contact.ClearData();
            try {
                if (IsNotNull(JsonData)) {
                    $("#hf_contactId").val(JsonData.contactId);
                    $("#ddlCustomer").val(JsonData.customerID).select2();
                    $("#ddlCustomer").attr('disabled', true);
                    $("#txtFirstName").val(JsonData.firstName);
                    $("#txtLastName").val(JsonData.lastName);
                    $("#chkbIsActive").prop('checked', JsonData.isActiveStatus);
                    Contact.BindBuildingDDLForAdd();
                    Contact.BindContactLineGrid(JsonData.contactId);
                    Contact.BindBuildingContactGrid(JsonData.contactId);

                }
            } catch (e) {
                printError("Contact.js", 'GetDataByID', e);
            }

        }, function () { });
    },

    Delete: function (_id, ItemInfo) {
        DeleteData(Contact.xhr_getData_For_Delete, "/Contact/Delete", { contactId: _id, CurrentScreenID: CurrentScreenID }, ItemInfo, function () {
            Contact.BindGrid(); Contact.ClearData(); Contact.SetForClose();
        });
    },

    AddIntoContactLineGrid: function () {
        var Data = Contact.GetContactLineData();

        if (Contact.ShowAlreadyExistsContactLineMessage(Data.contact)) {
            if (Contact.ValidateContactLineDataInsertion(Data)) {
                $("#tblContactLine").show();
                $("#Grid_Data_Template_tblContactLine").tmpl(Data).appendTo("#tblContactLine tbody");
                Contact.ClearContactLineData();
            }
        }
    },

    GetContactLineData: function () {
        return Data = {
            contactMethodID: $("#hf_ContactMethodID").val(),
            contact: $("#txtContact").val().trim(),
            extention: $("#txtExtention").val().trim(),
            contactMethodName: $("#select2-ddlContactMethod-container").text(),
            contactMethodID: $("#ddlContactMethod").val(),
            notificationStatus: $("#chkbNotificationStatus").prop('checked'),
        };
    },

    ShowAlreadyExistsContactLineMessage: function (Contact) {
        var valid = true;
        $("#tblContactLine tbody tr td.Contact").each(function () {
            if ($(this).attr('data-contact') == Contact) {
                valid = false;
            }
        });

        if (!valid)
            showSweetAlert("Warning!", "Contact line already exists", "warning");

        return valid;
    },

    ValidateContactLineDataInsertion: function (Data) {
        var valid = true;
        valid = Validate_Control_NullBlank("#txtContact", Data.contact, 'Required', valid);
        //valid = Validate_Control_NullBlank("#txtExtention", Data.extention, 'Required', valid);
        valid = Validate_DDLControl_NullBlank("#ddlContactMethod", Data.contactMethodID, 'Required', valid);
        return valid;
    },

    ClearContactLineData: function () {
        $("#ddlContactMethod").val("").select2();
        $("#ddlBuildingMap").val("").select2();
        $("#ddlContactCategoryMap").val("").select2();
        $("#ddlContactTypeMap").val("").select2();

        $("#txtContact").val("");
        $("#txtExtention").val("");
        $("#chkbNotificationStatus").prop('checked', 1);
        Reset_Form_Errors();

    },


    BindContactLineGrid: function (contactId) {
        LoadGridWithoutPagination(null, "tblContactLine", "/Contact/GetContactLineData", { contactId: contactId }, function (data) {
            var Model = data;
            $.each(Model, function (index, item) {
                $("#chkbContactLineStatus" + item.contactLineID).prop("checked", item.isActiveStatus);
            });

            if (IsNotNull(Model) && Model.length > 0) {
                $("#tblContactLine").show();
            }
        });
    },


    //==========================================

    AddIntoBuildingContactGrid: function () {
        var Data = Contact.GetBuildingContactData();

        if (Contact.ShowAlreadyExistsBuildingContacMessage(Data.buildingCode)) {
            if (Contact.ValidateBuildingContactInsertion(Data)) {
                $("#tblBuildingContact").show();
                $("#Grid_Data_Template_tblBuildingContact").tmpl(Data).appendTo("#tblBuildingContact tbody");
                Contact.ClearBuildingContactData();
            }
        }
    },

    GetBuildingContactData: function () {
        return Data = {

            buildingCode: $("#ddlBuildingMap option:selected").text(),
            buildingID: $("#ddlBuildingMap").val().trim(),
            contactCategoryName: $("#select2-ddlContactCategoryMap-container").text().trim(),
            contactCategoryID: $("#ddlContactCategoryMap").val().trim(),
            contactTypeName: $("#select2-ddlContactTypeMap-container").text().trim(),
            contactTypeID: $("#ddlContactTypeMap").val().trim(),

        };
    },

    ShowAlreadyExistsBuildingContacMessage: function (BuildingCode) {
        var valid = true;
        $("#tblBuildingContact tbody tr td.BuildingCode").each(function () {
            if ($(this).attr('data-BuildingCode') == BuildingCode) {
                valid = false;
            }
        });

        if (!valid)
            showSweetAlert("Warning!", "Building code already exists", "warning");

        return valid;
    },

    ValidateBuildingContactInsertion: function (Data) {
        var valid = true;
        valid = Validate_DDLControl_NullBlank("#ddlBuildingMap", Data.buildingCode, 'Required', valid);
        valid = Validate_DDLControl_NullBlank("#ddlContactCategoryMap", Data.contactCategoryID, 'Required', valid);
        //valid = Validate_DDLControl_NullBlank("#ddlContactTypeMap", Data.contactTypeID, 'Required', valid);
        return valid;
    },

    ClearBuildingContactData: function () {
        $("#ddlBuildingMap").val("").select2();
        $("#ddlContactCategoryMap").val("").select2();
        $("#ddlContactTypeMap").val("").select2();
        Reset_Form_Errors();

    },

    BindBuildingContactGrid: function (contactId) {
        LoadGridWithoutPagination(null, "tblBuildingContact", "/Contact/GetBuildingContactByContactID", { contactId: contactId }, function (data) {
            var Model = data;
            if (IsNotNull(Model) && Model.length > 0) {
                $("#tblBuildingContact").show();
                $("#accordion").show();
                $('#collapseOne').collapse('show');
            }
            else {
                $("#accordion").show();
               // $('#collapseOne').collapse('show');
            }
        });
    },

    RemoveBuildingContact: function (row) {
        nameString = row.replace(/ /g, "");
        $('tr[data-BuildingCode=' + 'tr' + nameString + ']').remove();
        if ($("#tblBuildingContact tbody tr").length == 0)
            $("#tblBuildingContact").hide();
    },

    ShowBuildingContactDeleteConfirmationPopup: function (buildingCode) {        $.confirm({            theme: 'modern',            title: 'Are you sure you want to delete?',            content: '<b>' + buildingCode + '</b>',            animation: 'zoom',            closeAnimation: 'scale',            backgroundDismiss: false,            //autoClose: 'cancel|5000',            animationSpeed: '400',            icon: 'far fa-question-circle text-danger',            //closeIcon: true,            buttons: {                confirm: {                    text: 'Yes',                    btnClass: 'btn btn-sm btn-primary',                    action: function () {                        if (IsNotNull(buildingCode))                            // function call                            Contact.RemoveBuildingContact(buildingCode);                    },                },                cancel: {                    text: 'No',                    btnClass: 'btn btn-sm btn-default',                    action: function () {                        // function call                    }                }            },            onOpen: function () { }        });    },

    ShowResetPopupForContact: function () {
        var message = null;
        var flagYes = false;
        var flagNo = false;
        if (!$('#chkbIsActive').prop('checked')) {
            message = "Are you sure you would like to make this notification status inactive?";
            flagYes = false;
            flagNo = true;
        }
        else {
                        
            message = "Are you sure you would like to make this notification status active?";
            flagYes = true;
            flagNo = false;
        }
        $.confirm({
            theme: 'modern',
            title: 'Are you sure you would like to make this contact inactive?',
            content: '', //'kWh value of the meter will be set to 0.<br /><b> Kindly confirm!</b>',
            animation: 'zoom',
            closeAnimation: 'scale',
            backgroundDismiss: false,
            //autoClose: 'cancel|5000',
            animationSpeed: '400',
            icon: 'flaticon-warning text-warning',
            closeIcon: false,
            buttons: {
                cancel: {
                    text: 'No',
                    btnClass: 'btn btn-sm btn-default',
                    action: function () {
                        $('#chkbIsActive').prop('checked', flagNo);
                    }
                },
                confirm: {
                    text: 'Yes',
                    btnClass: 'btn btn-sm btn-warning',
                    action: function () {
                        $('#chkbIsActive').prop('checked', flagYes);
                    },
                }
            }
        });
    },


    ShowResetPopupForNotificationStatus: function () {
        var message = null;
        var flagYes = false;
        var flagNo = false;
        if (!$('#chkbNotificationStatus').prop('checked')) {
            message = "Are you sure you would like to deactivate notifications?";
            flagYes = false;
            flagNo = true;
        }
        else {
            message = "Are you sure you would like to activate notifications?";
            flagYes = true;
            flagNo = false;
        }

        $.confirm({
            theme: 'modern',
            title: message,
            content: '', //'kWh value of the meter will be set to 0.<br /><b> Kindly confirm!</b>',
            animation: 'zoom',
            closeAnimation: 'scale',
            backgroundDismiss: false,
            //autoClose: 'cancel|5000',
            animationSpeed: '400',
            icon: 'flaticon-warning text-warning',
            closeIcon: false,
            buttons: {
                cancel: {
                    text: 'No',
                    btnClass: 'btn btn-sm btn-default',
                    action: function () {
                        $('#chkbNotificationStatus').prop('checked', flagNo);
                    }
                },
                confirm: {
                    text: 'Yes',
                    btnClass: 'btn btn-sm btn-warning',
                    action: function () {
                        $('#chkbNotificationStatus').prop('checked', flagYes);
                    },
                }
            }
        });
    },



    ShowResetPopupForContactLineStatus: function (contactLineID) {
        var message = null;
        var flagYes = false;
        var flagNo = false;
        if (!$('#chkbContactLineStatus' + contactLineID).prop('checked')) {
            message = "Are you sure you would like to deactivate contact line status?";
            flagYes = false;
            flagNo = true;
        }
        else {
            message = "Are you sure you would like to activate contact line status?";
            flagYes = true;
            flagNo = false;
        }

        $.confirm({
            theme: 'modern',
            title: message,
            content: '', //'kWh value of the meter will be set to 0.<br /><b> Kindly confirm!</b>',
            animation: 'zoom',
            closeAnimation: 'scale',
            backgroundDismiss: false,
            //autoClose: 'cancel|5000',
            animationSpeed: '400',
            icon: 'flaticon-warning text-warning',
            closeIcon: false,
            buttons: {
                cancel: {
                    text: 'No',
                    btnClass: 'btn btn-sm btn-default',
                    action: function () {
                        $('#chkbContactLineStatus' + contactLineID).prop('checked', flagNo);
                    }
                },
                confirm: {
                    text: 'Yes',
                    btnClass: 'btn btn-sm btn-warning',
                    action: function () {
                        $('#chkbContactLineStatus' + contactLineID).prop('checked', flagYes);
                    },
                }
            }
        });
    },

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
        return returnModal;
    }

}