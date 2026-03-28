
var _UtilityMeter = {

    SetForClose: function () {
        $('#divAddUtilityMeterForm').hide();
        $('#divGrid').show();

        _UtilityMeter.LineEditFlag = false;
        _UtilityMeter.ClearData();
        Clear_Form_Fields("#frm_AddUtilityMeter");
        $("#hf_UtilityMeterId").val('');
        $("#hf_UtilityMeterNumberId").val('');
        $("#hf_FromDate").val('');
        $("#hf_UtilityMeterNumberId").val('');
        $("#txtvalidFromMN").datepicker('setStartDate', '');
        $('#txtvalidFromMN').val('');
        $('#txtvalidUntilMN').val('');

        $("#ddlCustomerAdd").attr('disabled', false);
        $("#ddlBuildingAdd").attr('disabled', false);

        $("#ddlUtilityAccountAdd").attr('disabled', false);
        $("#ddlCommodityAdd").attr('disabled', false);
        $("#txtCID").attr('disabled', false);
        $("#txtMeterNumber").attr('disabled', false);
        $("#txtServiceIdentifier").attr('disabled', false);
        $("#txtServiceClass").attr('disabled', false);
        $("#txtvalidFrom").attr('disabled', false);
    },

    SetForAdd: function (customerID, buildingID) {
        LoadAddUpdateView('#divAddUtilityMeterForm', '/Building/_PartialUtilityMeterAddUpdate', null, function () {
            $('#divAddUtilityMeterForm').show();
            $('#divGrid').hide();

            _UtilityMeter.LineEditFlag = true;
            ResetFormErrors("#frm_AddUtilityMeter");
            _UtilityMeter.ClearData();
            $("#lblUtilityMeterTitle").text("Add Utility Meter");
            $('.date-picker').datepicker({ autoclose: true, todayHighlight: true, format: 'mm/dd/yyyy', useCurrent: true, minDate: 0 });
            $("#txtvalidFrom").val(CommonTodayDate.mmddyyyy());
            $('#txtvalidFrom').datepicker("update", CommonTodayDate.mmddyyyy());
            $("#txtvalidFromMN").val(CommonTodayDate.mmddyyyy());
            $('#txtvalidFromMN').datepicker("update", CommonTodayDate.mmddyyyy());
            Reload_ddl_Global(null, "#ddlCustomerAdd", "/AjaxCommon/GetCustomerDDL", null, "Select", function () {
                $("#ddlCustomerAdd").select2();                
                if ($("#ddlCustomerAdd option").length > 1) {
                    $("#ddlCustomerAdd").val(customerID).select2();
                    _UtilityMeter.BindCommodityDDL();
                    _UtilityMeter.BindBuildingDDLAdd(buildingID);
                    $("#ddlCustomerAdd").attr('disabled', true);
                    $("#ddlBuildingAdd").attr('disabled', true);
                }
            });
            Reload_ddl_Global(null, "#ddlManufacturerAdd", "/AjaxCommon/GetManufacturerDDL", null, "Select", function () { $("#ddlManufacturerAdd").select2(); });
            Reload_ddl_Global(null, "#ddlTariffTypeAdd", "/AjaxCommon/GetTariffTypeDDL", null, "Select", function () { $("#ddlTariffTypeAdd").select2(); });
            $("#ddlCommodityAdd").html("<option value=''>Select</option>");
            $("#ddlCommodityAdd").val('').select2();

            $("#ddlBuildingAdd").html("<option value=''>Select</option>");
            $("#ddlBuildingAdd").val('').select2();

            $("#ddlUtilityAccountAdd").html("<option value=''>Select</option>");
            $("#ddlUtilityAccountAdd").val('').select2();

            $(".btnMultiplier").hide();
            $("#btnMultiplier").hide();
            $("#divMultiplier").hide();
            $("#divMeterNumber").show();
            $("#divForDateRange").hide();


        });
    },

    BindBuildingDDLAdd: function (buildingID) {
        $("#ddlUtilityAccountAdd").html("<option value=''>Select</option>");
        $("#ddlUtilityAccountAdd").val('').select2();
        if (IsNotNull($("#ddlCustomerAdd").val())) {
            Reload_ddl_Global(null, "#ddlBuildingAdd", "/AjaxCommon/GetBuildingDDL", { CustomerID: $("#ddlCustomerAdd").val() }, "Select", function (data) {
                $("#ddlBuildingAdd").val(buildingID).select2();
                Reload_ddl_Global(null, "#ddlUtilityAccountAdd", "/AjaxCommon/GetAllUtilityAccountDDL", { CustomerID: $("#ddlCustomerAdd").val(), BuildingID: $("#ddlBuildingAdd").val() }, "Select", function (data) {
                    $("#ddlUtilityAccountAdd").select2();
                    if (!IsNotNull(data)) {
                        $("#ddlUtilityAccountAdd").html("<option value=''>Select</option>");
                        $("#ddlUtilityAccountAdd").val('').select2();
                    }
                });
            });
        } else {
            $("#ddlBuildingAdd").html("<option value=''>Select</option>");
            $("#ddlBuildingAdd").val('').select2();
        }
    },

    BindUtilityAccountDDLAdd: function () {
        if (IsNotNull($("#ddlCustomerAdd").val())) {
            Reload_ddl_Global(null, "#ddlUtilityAccountAdd", "/AjaxCommon/GetAllUtilityAccountDDL", { CustomerID: $("#ddlCustomerAdd").val(), BuildingID: $("#ddlBuildingAdd").val() }, "Select", function () {
                $("#ddlUtilityAccountAdd").select2();
            });
        } else {
            $("#ddlUtilityAccountAdd").html("<option value=''>Select</option>");
            $("#ddlUtilityAccountAdd").val('').select2();
        }
    },

    BindCommodityDDLAdd: function () {
        if (IsNotNull($("#ddlUtilityAccountAdd").val())) {
            Reload_ddl_Global(null, "#ddlCommodityAdd", "/AjaxCommon/GetCommodityByUtilityAccountIDDDL", { UtilityAccountID: $("#ddlUtilityAccountAdd").val() }, "Select", function () { $("#ddlCommodityAdd").select2(); });
        }
        else {
            $("#ddlCommodityAdd").html("<option value=''>Select</option>");
            $("#ddlCommodityAdd").val('').select2();
        }

    },

    

    AddUpdate: function () {
        ResetFormErrors("#frm_AddUtilityMeter");
        var FormData = _UtilityMeter.GetData();
        if (_UtilityMeter.ValidateData(FormData)) {
            AddUpdateData("/UtilityMeter/AddUpdate", { Model: FormData }, function (data) {
                try {
                    var result = data.data;
                    if (result["status"] === true) {
                        if (data.status.toLowerCase() === 'success') {
                            showSweetAlert(data.status, data.message, 'success', null);
                            _UtilityMeter.SetForClose();
                        }
                    }
                    else {
                        showSweetAlert("Failed", result["message"], 'error', null);
                    }

                } catch (e) {
                    printError('_UtilityMeter.js', 'AddUpdate', e);
                }

            }, function (responce_data) {
                showSweetAlert(responce_data.status, responce_data.message, 'error', null);
            });
        }
    },

    ResetData: function () {

        var ID = $("#hf_UtilityMeterId").val();

        $(".has-error p").html("");
        $(".has-error").removeClass("has-error");

        if (ID == "" || ID == null || ID == 0 || ID == undefined)
            _UtilityMeter.ClearData();
        else
            _UtilityMeter.GetDataByID(ID);
    },

    /*Validate form data*/
    ValidateData: function (FormData) {
        var valid = true;
        /*validation for not null/Required*/

        valid = Validate_DDLControl_NullBlank("#ddlUtilityAccountAdd", FormData.UtilityAccountID, 'Required', valid);
        valid = Validate_DDLControl_NullBlank("#ddlCommodityAdd", FormData.CommodityID, 'Required', valid);
        valid = Validate_Control_NullBlank("#txtCID", FormData.CID, 'Required', valid);
        valid = Validate_Control_NullBlank("#txtMeterNumber", FormData.UtilityMeterNumber, 'Required', valid);
        valid = Validate_Control_NullBlank("#txtServiceIdentifier", FormData.ServiceIdentifier, 'Required', valid);
        //valid = Validate_Control_NullBlank("#txtServiceClass", FormData.ServiceClass, 'Required', valid);

        if (_UtilityMeter.LineEditFlag) {
            //valid = Validate_Control_NullBlank("#txtMeterUID", FormData.UtilityMeterUID, 'Required', valid);
            //valid = Validate_DDLControl_NullBlank("#ddlTariffTypeAdd", FormData.TariffTypeID, 'Required', valid);
            //valid = Validate_DDLControl_NullBlank("#ddlManufacturerAdd", FormData.ManufacturerID, 'Required', valid);
            //valid = Validate_Control_NullBlank("#txtRemark", FormData.Remarks, 'Required', valid);
            valid = Validate_Control_NullBlank("#txtvalidFromMN", FormData.EffectiveFromDateMN, 'Required', valid);
            //valid = Validate_Control_NullBlank("#txtvalidUntilMN", FormData.EffectiveTillDateMN, 'Required', valid);
        }


        if (IsNotNull($("#hf_UtilityMeterNumberId").val())) {
            valid = Validate_Control_NullBlank("#txtvalidFrom", FormData.EffectiveFromDate, 'Required', valid);
            valid = Validate_Control_NullBlank("#txtvalidUntil", FormData.EffectiveTillDate, 'Required', valid);
        }

        FocusOnError("#frm_AddUtilityMeter", valid);
        return valid;
    },

    GetData: function () {
        return {

            UtilityMeterID: $("#hf_UtilityMeterId").val(),
            utilityMeterNumberID: $("#hf_UtilityMeterNumberId").val(),
            UtilityAccountID: $("#ddlUtilityAccountAdd").val(),
            CommodityID: $("#ddlCommodityAdd").val(),
            CID: $("#txtCID").val(),
            UtilityMeterNumber: $("#txtMeterNumber").val(),
            ServiceIdentifier: $("#txtServiceIdentifier").val(),
            ServiceClass: $("#txtServiceClass").val(),
            EffectiveFromDate: $("#txtvalidFrom").val(),
            EffectiveTillDate: $("#txtvalidUntil").val(),
            UtilityMeterUID: $("#txtMeterUID").val(),
            TariffTypeID: $("#ddlTariffTypeAdd").val(),
            ManufacturerID: $("#ddlManufacturerAdd").val(),
            Remarks: $("#txtRemark").val(),
            EffectiveFromDateMN: $("#txtvalidFromMN").val(),
            EffectiveTillDateMN: $("#txtvalidUntilMN").val()
        };
    },

    ClearData: function () {
        ResetFormErrors("#frm_AddUtilityMeter");
        Clear_Form_Fields("#frm_AddUtilityMeter");
        $(".has-error p").html("").hide();
        $(".has-error").removeClass("has-error");
        $("#ddlUtilityAccountAdd").select2();
        $("#ddlCommodityAdd").select2();
        $("#ddlTariffTypeAdd").select2();
    },

    CheckDateRange: function (control) {
        $(control).closest('div.input-daterange').find('input[name="start"]').removeClass('is-invalid');
        $(control).closest('div.input-daterange').find('input[name="end"]').removeClass('is-invalid');

        var fromDate = $(control).closest('div.input-daterange').find('input[name="start"]').val();
        var toDate = $(control).closest('div.input-daterange').find('input[name="end"]').val();

        if (IsNotNull(fromDate) && IsNotNull(toDate)) {
            if (new Date(fromDate).yyyyMMdd() >= new Date(toDate).yyyyMMdd()) {
                showSweetAlert('Warning!', 'Valid from date cannot be less than Valid until date', 'warning', null);
                $(control).closest('div.input-daterange').find('input[name="end"]').addClass('is-invalid');
            }
        }
    },

    CheckDateRangeMN: function (control) {
        $(control).closest('div.input-daterange').find('input[name="startMN"]').removeClass('is-invalid');
        $(control).closest('div.input-daterange').find('input[name="endMN"]').removeClass('is-invalid');

        var fromDateMN = $(control).closest('div.input-daterange').find('input[name="startMN"]').val();
        var toDateMN = $(control).closest('div.input-daterange').find('input[name="endMN"]').val();

        if (IsNotNull(fromDateMN) && IsNotNull(toDateMN)) {
            if (new Date(fromDateMN).yyyyMMdd() >= new Date(toDateMN).yyyyMMdd()) {
                showSweetAlert('Warning!', 'Valid from date cannot be less than Valid until date', 'warning', null);
                $(control).closest('div.input-daterange').find('input[name="endMN"]').addClass('is-invalid');
            }
        }
    },
    BindCommodityDDL: function () {
        if (IsNotNull($("#ddlCustomerAdd").val())) {
            Reload_ddl_Global(null, "#ddlCommodityAdd", "/AjaxCommon/GetCommodityDDLForDashboard", { CustomerID: $("#ddlCustomerAdd").val() }, "All", function () {
                $("#ddlCommodityAdd").select2();
            });
        }
    },
}