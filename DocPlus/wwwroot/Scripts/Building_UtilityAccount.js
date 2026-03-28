

var _UtilityAccount = {
    SetForClose: function () {
        $('#divAddUtilityAccountForm').hide();
        $('#divGrid').show();

        _UtilityAccount.ClearData();
        Clear_Form_Fields("#frm_AddUtilityAccount");
        $("#hf_UtilityAccountID").val('');
        $("#hf_IsUpdateUtilityAcount").val('');

    },

    SetForAdd: function (customerID, buildingID) {
        LoadAddUpdateView('#divAddUtilityAccountForm', '/Building/_PartialUtilityAccountAddUpdate', null, function () {
            $('#divAddUtilityAccountForm').show();
            $('#divGrid').hide();

            ResetFormErrors("#frm_AddUtilityAccount");
            _UtilityAccount.ClearData();
            $("#hf_IsUpdateUtilityAcount").val(false);
            $("#lblUtilityAccountTitle").text("Add Utility Account");
            Reload_ddl_Global(null, "#ddlCustomerUA", "/AjaxCommon/GetCustomerDDL", null, "Select", function () {
                $("#ddlCustomerUA").select2();
                if ($("#ddlCustomerUA option").length > 1) {
                    $("#ddlCustomerUA").val(customerID).select2();
                    _UtilityAccount.BindBuildingDDLForAdd(buildingID);
                    $("#ddlCustomerUA").attr('disabled', true);
                    $("#ddlBuildingUA").attr('disabled', true);
                }
            });
            ///Reload_ddl_Global(null, "#ddlUtilityUA", "/AjaxCommon/GetUtilityDDL", null, "Select", function () { $("#ddlUtilityUA").select2(); });
            Reload_ddl_Global(null, "#ddlUtilityUA", "/AjaxCommon/GetAllUtilityDDL", null, "Select", function () { $("#ddlUtilityUA").select2(); });
            _UtilityAccount.BindCommodityGrid(null);

        });
    },

    BindBuildingDDLForAdd: function (buildingID) {
        if ($("#ddlCustomerUA option:selected").index() > 0) {
            Reload_ddl_Global(null, "#ddlBuildingUA", "/AjaxCommon/GetBuildingDDL", { CustomerID: $("#ddlCustomerUA").val() }, "Select", function () {
                $("#ddlBuildingUA").val(buildingID).select2();
            });
        }
    },

    BindCommodityGrid: function (UtilityAccountID) {
        GetAjaxData("/UtilityAccount/GetUtilityAccountCommodity", { UtilityAccountID: UtilityAccountID }, function (data) {
            loadTableWithoutSearch("tblCommodity", data.data);
            var JsonData = $.grep(data.data, function (i) { return i.commodityID > 0 });
            $('.date-picker').datepicker({ autoclose: true, todayHighlight: true, format: 'mm/dd/yyyy', useCurrent: false });
            $.each(JsonData, function (index, item) {
                $('#trCommodity' + item.commodityID).find('input[name="startDate"]').datepicker({ autoclose: true, todayHighlight: true, format: 'mm/dd/yyyy', useCurrent: false });
                $('#trCommodity' + item.commodityID).find('input[name="startDate"]').val(item.effectiveFromDateCustom);
                $('#trCommodity' + item.commodityID).find('input[name="startDate"]').datepicker("update", item.effectiveFromDateCustom);

                $(this).find("input.UtilityAccountCommodityID" + item.commodityID).val(item.utilityAccountCommodityID);

                if (IsNotNull(item.utilityAccountCommodityID)) {
                    $(".btnChange" + item.commodityID).show();
                }
                else {
                    $(".btnChange" + item.commodityID).hide();
                }


                Reload_ddl_Global(null, "#ddlSupplier" + item.commodityID, "/AjaxCommon/GetSupplierDDL", null, "Select", function () {
                    $("#ddlSupplier" + item.commodityID).select2();

                    if (IsNotNull(item.supplierID)) {
                        $("#rdbSupplier" + item.commodityID).prop('checked', true);
                        $("#ddlSupplier" + item.commodityID).val(item.supplierID).select2();
                        $("#ddlSupplier" + item.commodityID).parent().find('span').show();
                        $("#ddlSupplier" + item.commodityID).attr('disabled', true);
                        $("#rdbSupplier" + item.commodityID).prop('disabled', true);
                        $("#rdbLDC" + item.commodityID).prop('disabled', true);
                        $('#trCommodity' + item.commodityID).find('input[name="startDate"]').attr('disabled', true);
                    }
                    else if (IsNotNull(item.utilityID)) {
                        $("#rdbLDC" + item.commodityID).prop('checked', true);
                        $("#ddlSupplier" + item.commodityID).parent().find('span').hide();
                        $("#rdbSupplier" + item.commodityID).prop('disabled', true);
                        $("#rdbLDC" + item.commodityID).prop('disabled', true);
                        $('#trCommodity' + item.commodityID).find('input[name="startDate"]').attr('disabled', true);
                    }
                    else {
                        $("#ddlSupplier" + item.commodityID).parent().find('span').hide();
                        $('#trCommodity' + item.commodityID).find('input[name="startDate"]').attr('disabled', false);
                        $("#rdbSupplier" + item.commodityID).prop('disabled', false);
                        $("#rdbLDC" + item.commodityID).prop('disabled', false);
                    }

                });

            });
        }, function (data) { });
    },

    LDCRadioButtonOnChange: function (CommodityID) {
        $("#ddlSupplier" + CommodityID).attr('disabled', true);
        $("#ddlSupplier" + CommodityID).val("").select2();
        $("#ddlSupplier" + CommodityID).parent().find('span').hide();
    },

    SupplierRadioButtonOnChange: function (CommodityID) {
        $("#ddlSupplier" + CommodityID).attr('disabled', false);
        $("#ddlSupplier" + CommodityID).val("").select2();
        $("#ddlSupplier" + CommodityID).parent().find('span').show();
    },

    AddUpdate: function () {
        ResetFormErrors("#frm_AddUtilityAccount");
        var FormData = _UtilityAccount.GetData();
        if (_UtilityAccount.ValidateData(FormData)) {
            AddUpdateData("/UtilityAccount/AddUpdate", { Model: FormData }, function (data) {
                try {
                    var result = data.data;
                    if (result["status"] === true) {
                        if (data.status.toLowerCase() === 'success') {
                            showSweetAlert(data.status, data.message, 'success', null);
                            _UtilityAccount.ClearData();
                            _UtilityAccount.SetForClose();
                        }
                    }
                    else {
                        showSweetAlert("Failed", result["message"], 'error', null);
                    }
                } catch (e) {
                    printError('_UtilityAccount.js', 'AddUpdate', e);
                }

            }, function (responce_data) {
                showSweetAlert(responce_data.status, responce_data.message, 'error', null);
            });
        }
    },

    ResetData: function () {
        var ID = $("#hf_UtilityAccountID").val();

        $(".has-error p").html("");
        $(".has-error").removeClass("has-error");

        if (ID == "" || ID == null || ID == 0 || ID == undefined)
            _UtilityAccount.ClearData();
        else
            _UtilityAccount.GetDataByID(ID);
    },

    /*Validate form data*/
    ValidateData: function (FormData) {
        var valid = true;
        /*validation for not null/Required*/
        valid = Validate_DDLControl_NullBlank("#ddlCustomerUA", FormData.CustomerID, 'Required', valid);
        valid = Validate_DDLControl_NullBlank("#ddlBuildingUA", FormData.BuildingID, 'Required', valid);
        valid = Validate_DDLControl_NullBlank("#ddlUtilityUA", FormData.UtilityID, 'Required', valid);
        valid = Validate_Control_NullBlank("#txtUtilityAccountNumberUA", FormData.UtilityAccountNumber, 'Required', valid);

        FocusOnError("#frm_AddUtilityAccount", valid);
        return valid;
    },

    GetData: function () {
        var UtilityAccountData = {};

        UtilityAccountData["IsUpdateUtilityAcount"] = $("#hf_IsUpdateUtilityAcount").val();
        UtilityAccountData["UtilityAccountID"] = $("#hf_UtilityAccountID").val();
        UtilityAccountData["CustomerID"] = $("#ddlCustomerUA").val();
        UtilityAccountData["BuildingID"] = $("#ddlBuildingUA").val();
        UtilityAccountData["UtilityID"] = $("#ddlUtilityUA").val();
        UtilityAccountData["UtilityAccountNumber"] = $("#txtUtilityAccountNumberUA").val();
        var CommodityList = [];

        $("#tblCommodity tbody tr").each(function () {
            var CommodityID = $(this).attr("data-commodityID");

            if ($(this).find('input:radio:checked').prop('checked') && IsNotNull($(this).find('input[name="startDate"]').val())) {
                CommodityList.push({
                    UtilityAccountCommodityID: $("#hf_UtilityAccountCommodityID" + CommodityID).val(),
                    CommodityID: CommodityID,
                    EffectiveFromDate: new Date($(this).find('input[name="startDate"]').val()).ddMMMyyyy(),
                    UtilityID: $("#rdbLDC" + CommodityID).prop('checked') ? $("#ddlUtilityUA").val() : null,
                    SupplierID: $("#rdbSupplier" + CommodityID).prop('checked') ? $("#ddlSupplier" + CommodityID).val() : null
                });
            }
        });

        UtilityAccountData["UtilityAccountCommodity_TableTypeList"] = CommodityList;
        return UtilityAccountData;
    },

    ClearData: function () {
        ResetFormErrors("#frm_AddUtilityAccount");
        //Clear_Form_Fields("#frm_AddUtilityAccount");
        $(".has-error p").html("").hide();
        $(".has-error").removeClass("has-error");
        //$("#txtUtilityAccountNumberUA").removeAttr('disabled');
        //$("#ddlCustomerUA").val("").trigger("change");
        //$("#ddlBuildingUA").html("<option value=''>Select</option>");
        //$("#ddlBuildingUA").val('').select2();
        $("#ddlUtilityUA").val("").trigger("change");
        $('input:radio:checked').prop('checked', false);
        $("#txtUtilityAccountNumberUA").val("").trigger("change");
        $("#ddlSupplier1").parent().find('span').hide();
        $("#ddlSupplier4").parent().find('span').hide();
        $("#ddlSupplier6").parent().find('span').hide();
        $("#ddlSupplier7").parent().find('span').hide();
        $("#ddlSupplier5").parent().find('span').hide();
        $('input[name="startDate"]').val('').trigger("change");

        //$("#ddlCustomerUA").removeAttr('disabled');
        //$("#ddlBuildingUA").removeAttr('disabled');
        //$("#ddlUtilityUA").removeAttr('disabled');
    },
    


}