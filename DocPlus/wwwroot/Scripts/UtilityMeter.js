var isRedirect = false;
var selectedUtilityAccountID = null;
var selectedUtilityID = null;
var selectedBuildingID = null;

$(document).ready(function () {
    //UtilityMeter.BindGrid();
    isRedirect = false;
    $("#tblUtilityMeter").hide();
    AllowOnlyNumberValue("#txtMeterUID");
    $("#ddlAccountSearch").html("<option value=''>All</option>");
    $("#ddlAccountSearch").val('').select2();

    $("#ddlBuildingSearch").html("<option value=''>All</option>");
    $("#ddlBuildingSearch").val('').select2();

    $("#ddlBuildingAdd").html("<option value=''>Select</option>");
    $("#ddlBuildingAdd").val('').select2();

    $("#ddlUtilityAccountAdd").html("<option value=''>Select</option>");
    $("#ddlUtilityAccountAdd").val('').select2();

    $("#ddlUtilitySearch").html("<option value=''>Select</option>");
    $("#ddlUtilitySearch").val('').select2();

    Reload_ddl_Global(null, "#ddlCustomerSearch", "/AjaxCommon/GetCustomerDDL", null, "Select", function () {
        $("#ddlCustomerSearch").select2();
        if ($("#ddlCustomerSearch option").length > 1) {            
            $("#ddlCustomerSearch").val(_CustomerID).select2();
            UtilityMeter.BindBuildingDDLForSearch();
            UtilityMeter.BindUtilityBuildingAccountWise();
            UtilityMeter.QueryStringBindUtilityMeter();
            if (!isRedirect) {
                UtilityMeter.SetForSearch();
            }
        }
    });
    //Reload_ddl_Global(null, "#ddlUtilitySearch", "/AjaxCommon/GetUtilityDDL", null, "All", function () {
    //    $("#ddlUtilitySearch").select2();
    //});

    $('#tblUtilityMeter').on('draw.dt', function () {
        UtilityMeter.ScreenAccessPermission();
    });

    /*
    var queryStringData = getQueryStringParams();
    if (queryStringData != null) {
        var customerCode = queryStringData["customerCode"];
        var buildingCode = queryStringData["buildingCode"];
        var utilityAccountUID = queryStringData["utilityAccountUID"];
        if (typeof (customerCode) != "undefined" && typeof (buildingCode) != "undefined") {
            var customerandbuilding = 'Customer Code : ' + customerCode + ' / Building Code : ' + buildingCode + ' / Utility Account UID : ' + utilityAccountUID;
            $('#lblCustomerBuildingCode').html(customerandbuilding);

            $("#ddlCustomerSearch").val(customerCode).trigger("change");
            $("#ddlBuildingSearch").val(buildingCode).trigger("change");
            $("#ddlUtilityAccountSearch").val(utilityAccountUID).trigger("change");
        }
    }*/

});



var UtilityMeter = {
    LineEditFlag: false,
    flagViewBills: false,

    QueryStringBindUtilityMeter: function () {
        var queryStringData = getQueryStringParams();
        if (queryStringData != null) {
            var CustomerID = queryStringData["CustomerID"];
            var BuildingID = queryStringData["BuildingID"];
            var UtilityID = queryStringData["UtilityID"];
            var UtilityAccountID = queryStringData["UtilityAccountID"];
            if (IsNotNull(CustomerID) && IsNotNull(BuildingID)) {
                isRedirect = true;
                $("#ddlCustomerSearch").val(CustomerID).trigger("change");
                setTimeout(function () {
                    Reload_ddl_Global(null, "#ddlUtilitySearch", "/AjaxCommon/GetUtilityDDL", null, "All", function () {
                        $("#ddlUtilitySearch").val(UtilityID).select2();
                        setTimeout(function () {
                            Reload_ddl_Global(null, "#ddlBuildingSearch", "/AjaxCommon/GetBuildingDDL", { CustomerID: CustomerID }, "All", function (data) {
                                $("#ddlBuildingSearch").val(BuildingID).select2();
                                setTimeout(function () {
                                    Reload_ddl_Global(null, "#ddlAccountSearch", "/AjaxCommon/GetAllUtilityAccountDDL", { CustomerID: CustomerID, BuildingID: BuildingID, UtilityID: UtilityID }, "All", function (data) {
                                        $("#ddlAccountSearch").val(UtilityAccountID).select2();
                                        setTimeout(function () {
                                            UtilityMeter.SetForSearch();
                                        }, 100);
                                    });
                                }, 400);
                            });
                        }, 300);
                    });
                }, 200);
            }
        }
    },

    BindGrid: function () {
        var UtilityAccNo = null;
        if ($("#ddlAccountSearch option:selected").index() == 0) {
            UtilityAccNo = null;
        }
        else {
            UtilityAccNo = $("#ddlAccountSearch option:selected").text();
        }

        $("#tblUtilityMeter").show();
        LoadGrid(null, "tblUtilityMeter", "/UtilityMeter/GetData",
            {
                CustomerID: $("#ddlCustomerSearch").val(),
                BuildingID: $("#ddlBuildingSearch").val(),
                UtilityID: $("#ddlUtilitySearch").val(),
                UtilityAccountNumber: UtilityAccNo
            },
            function () {
                $("#divIDViewUtilityMeter").show();
                UtilityMeter.ScreenAccessPermission();
            });
    },

    BindBuildingDDLAdd: function () {
        $("#ddlUtilityAccountAdd").html("<option value=''>Select</option>");
        $("#ddlUtilityAccountAdd").val('').select2();
        if (IsNotNull($("#ddlCustomerAdd").val())) {
            Reload_ddl_Global(null, "#ddlBuildingAdd", "/AjaxCommon/GetBuildingDDL", { CustomerID: $("#ddlCustomerAdd").val() }, "Select", function (data) {
                $("#ddlBuildingAdd").select2();
                Reload_ddl_Global(null, "#ddlUtilityAccountAdd", "/AjaxCommon/GetAllUtilityAccountDDL", { CustomerID: $("#ddlCustomerAdd").val() }, "Select", function (data) {
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

    BindCommodityDDL: function () {
        if (IsNotNull($("#ddlCustomerAdd").val())) {
            Reload_ddl_Global(null, "#ddlCommodityAdd", "/AjaxCommon/GetCommodityDDLForDashboard", { CustomerID: $("#ddlCustomerAdd").val() }, "All", function () {
                $("#ddlCommodityAdd").select2();
            });
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

    //BindBuildingDDLForSearch: function () {
    //    if (IsNotNull($("#ddlCustomerSearch").val())) {
    //        Reload_ddl_Global(null, "#ddlBuildingSearch", "/AjaxCommon/GetBuildingDDL", { CustomerID: $("#ddlCustomerSearch").val() }, "All", function (data) {
    //            $("#ddlBuildingSearch").select2();
    //        });
    //        Reload_ddl_Global(null, "#ddlAccountSearch", "/AjaxCommon/GetAllUtilityAccountDDL", { CustomerID: $("#ddlCustomerSearch").val() || 0, BuildingID: $("#ddlBuildingSearch").val() || 0, UtilityID: $("#ddlUtilitySearch").val() || 0 }, "All", function (data) {
    //            $("#ddlAccountSearch").select2();
    //        });
    //    } else {
    //        $("#ddlBuildingSearch").html("<option value=''>All</option>");
    //        $("#ddlBuildingSearch").val('').select2();
    //        $("#ddlAccountSearch").html("<option value=''>All</option>");
    //        $("#ddlAccountSearch").val('').select2();
    //        $("#ddlUtilitySearch").html("<option value=''>All</option>");
    //        $("#ddlUtilitySearch").val('').select2();
    //    }
    //},

    BindBuildingDDLForSearch: function () {
        if (IsNotNull($("#ddlCustomerSearch").val())) {
            Reload_ddl_Global(null, "#ddlBuildingSearch", "/AjaxCommon/GetBuildingDDL", { CustomerID: $("#ddlCustomerSearch").val() }, "All", function (data) {
                $("#ddlBuildingSearch").val(selectedBuildingID).select2();
                if ($("#ddlBuildingSearch").val() == null) {
                    $("#ddlBuildingSearch").val("").select2();
                    $("#ddlUtilitySearch").html("<option value=''>All</option>");
                    $("#ddlUtilitySearch").val("").select2();
                }
            });
            Reload_ddl_Global(null, "#ddlAccountSearch", "/AjaxCommon/GetAllUtilityAccountDDL", { CustomerID: $("#ddlCustomerSearch").val() || 0, BuildingID: $("#ddlBuildingSearch").val() || 0, UtilityID: $("#ddlUtilitySearch").val() || 0 }, "All", function (data) {
                $("#ddlAccountSearch").val(selectedUtilityAccountID).select2();
                if ($("#ddlAccountSearch").val() == null) {
                    $("#ddlAccountSearch").val("").select2();
                }
            });
        } else {
            $("#ddlBuildingSearch").html("<option value=''>All</option>");
            $("#ddlBuildingSearch").val('').select2();
            $("#ddlAccountSearch").html("<option value=''>All</option>");
            $("#ddlAccountSearch").val('').select2();
        }
    },

    //BindUtilityAccountDDLForSearch: function () {
    //    Reload_ddl_Global(null, "#ddlAccountSearch", "/AjaxCommon/GetAllUtilityAccountDDL", { CustomerID: $("#ddlCustomerSearch").val() || 0, BuildingID: $("#ddlBuildingSearch").val() || 0, UtilityID: $("#ddlUtilitySearch").val() || 0 }, "All", function (data) {
    //        $("#ddlAccountSearch").select2();
    //    });
    //},

    BindUtilityAccountDDLForSearch: function () {
        selectedUtilityID = $("#ddlUtilitySearch").val();
        selectedBuildingID = $("#ddlBuildingSearch").val();

        if (!IsNotNull($("#ddlBuildingSearch").val())) {

            Reload_ddl_Global(null, "#ddlBuildingSearch", "/AjaxCommon/GetBuildingDDL", { CustomerID: $("#ddlCustomerSearch").val() }, "All", function (data) {
                $("#ddlBuildingSearch").val(selectedBuildingID).select2();
                if ($("#ddlBuildingSearch").val() == null) {
                    $("#ddlBuildingSearch").val("").select2();
                }
            });
            Reload_ddl_Global(null, "#ddlAccountSearch", "/AjaxCommon/GetAllUtilityAccountDDL", { CustomerID: $("#ddlCustomerSearch").val() || 0, BuildingID: $("#ddlBuildingSearch").val() || 0, UtilityID: null }, "All", function (data) {
                //$("#ddlAccountSearch").val(selectedUtilityAccountID).select2();
                if ($("#ddlAccountSearch").val() == null) {
                    $("#ddlAccountSearch").val("").select2();
                }
            });
            UtilityMeter.BindUtilityBuildingAccountWise();
        }

        else {
            UtilityMeter.BindUtilityBuildingAccountWise();
            Reload_ddl_Global(null, "#ddlAccountSearch", "/AjaxCommon/GetAllUtilityAccountDDL", { CustomerID: $("#ddlCustomerSearch").val() || 0, BuildingID: $("#ddlBuildingSearch").val() || 0, UtilityID: null }, "All", function (data) {
                //$("#ddlAccountSearch").val(selectedUtilityAccountID).select2();
                if ($("#ddlAccountSearch").val() == null) {
                    $("#ddlAccountSearch").val("").select2();
                }
            });
        }
    },

    OnSelectionDDLAccountSearch: function () {
        selectedUtilityAccountID = $("#ddlAccountSearch").val();
        selectedBuildingID = $("#ddlBuildingSearch").val();

        GetAjaxData("/AjaxCommon/GetBuildingUtilityByUtilityAccountID", { CustomerID: $("#ddlCustomerSearch").val() || 0, UtilityAccountID: selectedUtilityAccountID || 0 }, function (data) {
            var JsonData = data.data;
            try {
                if (IsNotNull(JsonData)) {
                    selectedUtilityID = JsonData.utilityID;
                    selectedBuildingID = JsonData.buildingID;

                    Reload_ddl_Global(null, "#ddlUtilitySearch", "/AjaxCommon/GetUtilityDDLForChart", { CustomerID: $("#ddlCustomerSearch").val() || 0, UtilityID: null, UtilityAccountID: null || 0 }, "All", function () {
                        $("#ddlUtilitySearch").val(selectedUtilityID).select2();
                    });
                    Reload_ddl_Global(null, "#ddlBuildingSearch", "/AjaxCommon/GetBuildingDDL", { CustomerID: $("#ddlCustomerSearch").val(), UtilityAccountID: null || 0, UtilityMeterID: null }, "All", function () {
                        $("#ddlBuildingSearch").val(selectedBuildingID).select2();
                    });
                }
                else {
                    Reload_ddl_Global(null, "#ddlAccountSearch", "/AjaxCommon/GetAllUtilityAccountDDL", { CustomerID: $("#ddlCustomerSearch").val() || 0, BuildingID: $("#ddlBuildingSearch").val() || 0, UtilityMeterID: null }, "All", function () {
                        $("#ddlAccountSearch").val(selectedUtilityAccountID).select2();
                    });

                    Reload_ddl_Global(null, "#ddlBuildingSearch", "/AjaxCommon/GetBuildingDDL", { CustomerID: $("#ddlCustomerSearch").val(), UtilityAccountID: $("#ddlAccountSearch").val() || 0, UtilityMeterID: $("#ddlMeterSearch").val() || 0 }, "All", function () {
                        $("#ddlBuildingSearch").val(selectedBuildingID).select2();
                    });
                    Reload_ddl_Global(null, "#ddlUtilitySearch", "/AjaxCommon/GetUtilityBuildingAccountWise", { CustomerID: $("#ddlCustomerSearch").val(), BuildingID: selectedBuildingID }, "All", function () {
                        $("#ddlUtilitySearch").val("").select2();
                        if (selectedUtilityAccountID != 0) {
                            $("#ddlUtilitySearch").val(selectedUtilityID).select2();
                        }
                        else {
                            $("#ddlUtilitySearch").val("").select2();
                        }
                    })
                }
            } catch (e) {
                printError("UtilityAccount.js", 'OnSelectDDLMeterSearch', e);
            }

        }, function () { });
    },

    BindUtilityAccountDDLByUtilityIDForSearch: function () {
        selectedUtilityID = $("#ddlUtilitySearch").val();

        Reload_ddl_Global(null, "#ddlBuildingSearch", "/AjaxCommon/GetBuildingDDLByUtilityID", { CustomerID: $("#ddlCustomerSearch").val(), UtilityID: selectedUtilityID || null }, "All", function () {
            $("#ddlBuildingSearch").val("").select2();
            if (selectedBuildingID != 0 && selectedBuildingID != null) {
                $("#ddlBuildingSearch").val(selectedBuildingID).select2();
            }
            else {
                if ($("#ddlBuildingSearch option").length > 0) {
                    $("#ddlBuildingSearch").val($("#ddlBuildingSearch option:eq(1)").val()).select2();
                }

            }
            UtilityMeter.BindUtilityAccountBuildingWise();
        });
    },

    BindUtilityAccountBuildingWise: function () {
        Reload_ddl_Global(null, "#ddlAccountSearch", "/AjaxCommon/GetAllUtilityAccountDDL", { CustomerID: $("#ddlCustomerSearch").val() || 0, BuildingID: $("#ddlBuildingSearch").val(), UtilityID: $("#ddlUtilitySearch").val() || null, utilityAccountID: $("#ddlAccountSearch").val() || null }, "All", function (data) {
            $("#ddlAccountSearch").val("").select2();
            if ($("#ddlAccountSearch option").length > 0) {
                $("#ddlAccountSearch").val($("#ddlAccountSearch option:eq(1)").val()).select2();
            }
        });
    },

    ResetDropDowns: function () {
        selectedUtilityAccountID = null;
        selectedUtilityID = null;
        selectedBuildingID = null;

        //Reload_ddl_Global(null, "#ddlCustomerSearch", "/AjaxCommon/GetCustomerDDL", null, "Select", function () { $("#ddlCustomerSearch").select2(); });
        //Reload_ddl_Global(null, "#ddlUtilitySearch", "/AjaxCommon/GetUtilityDDL", null, "Select", function () { $("#ddlUtilitySearch").select2(); });

        Reload_ddl_Global(null, "#ddlUtilitySearch", "/AjaxCommon/GetUtilityBuildingAccountWise", { CustomerID: $("#ddlCustomerSearch").val() }, "All", function () {
            $("#ddlBuildingSearch").select2();
        });
        Reload_ddl_Global(null, "#ddlBuildingSearch", "/AjaxCommon/GetBuildingDDL", { CustomerID: $("#ddlCustomerSearch").val() }, "All", function () {
            $("#ddlBuildingSearch").select2();
        });
        Reload_ddl_Global(null, "#ddlAccountSearch", "/AjaxCommon/GetAllUtilityAccountDDL", { CustomerID: $("#ddlCustomerSearch").val() || 0, BuildingID: $("#ddlBuildingSearch").val() || 0 }, "All", function () {
            $("#ddlAccountSearch").select2();
        });

        $("#ddlBuildingSearch").html("<option value=''>Select</option>");
        $("#ddlBuildingSearch").val('').select2();

        $("#ddlAccountSearch").html("<option value=''>Select</option>");
        $("#ddlAccountSearch").val('').select2();

        $("#ddlUtilitySearch").html("<option value=''>Select</option>");
        $("#ddlUtilitySearch").val('').select2();
        $("#divIDViewUtilityMeter").hide();
        UtilityMeter.SetForSearch();
    },

    ValidateDataSearch: function (FormData) {
        var valid = true;
        valid = Validate_DDLControl_NullBlank("#ddlCustomerSearch", FormData.CustomerID, 'Required', valid);
        return valid;
    },

    GetDataForSearch: function () {
        var Data = {
            CustomerID: $("#ddlCustomerSearch").val(),
        };
        return Data;
    },

    SetForSearch: function () {
        var FormData = UtilityMeter.GetDataForSearch();
        if (UtilityMeter.ValidateDataSearch(FormData)) {
            var sp = $("span[role=combobox]")
            $('#ddlCustomerSearch').parent().find(sp).css("border-color", "#E2E5EC");

            var UtilityAccNo = null;
            if ($("#ddlAccountSearch option:selected").index() == 0) {
                UtilityAccNo = null;
            }
            else {
                UtilityAccNo = $("#ddlAccountSearch option:selected").text();
            }
            //call bind function
            LoadGrid(null, "tblUtilityMeter", "/UtilityMeter/GetData",
                {
                    CustomerID: $("#ddlCustomerSearch").val(),
                    BuildingID: $("#ddlBuildingSearch").val(),
                    UtilityID: $("#ddlUtilitySearch").val(),
                    UtilityAccountNumber: UtilityAccNo
                }, function (data) {
                    if (IsNotNull(data)) {
                        $("#tblUtilityMeter").show();
                        $("#divIDViewUtilityMeter").show();
                        UtilityMeter.ScreenAccessPermission();
                    }
                    else {
                        $('#tblUtilityMeter_wrapper').hide();
                        $("#divIDViewUtilityMeter").hide();
                        showSweetAlert("No data found!", null, 'info', null);
                    }
                });
        }
    },

    SetForAdd: function () {
        UtilityMeter.LineEditFlag = true;
        Reset_Form_Errors();
        UtilityMeter.ClearData();
        $("#lblUtilityMeterTitle").text("Add Utility Meter");
        $("#AddUtilityMeterModal").modal();
        $('.date-picker').datepicker({ autoclose: true, todayHighlight: true, format: 'mm/dd/yyyy', useCurrent: true, minDate: 0 });
        $("#txtvalidFrom").val(CommonTodayDate.mmddyyyy());
        $('#txtvalidFrom').datepicker("update", CommonTodayDate.mmddyyyy());
        $("#txtvalidFromMN").val(CommonTodayDate.mmddyyyy());
        $('#txtvalidFromMN').datepicker("update", CommonTodayDate.mmddyyyy());
        Reload_ddl_Global(null, "#ddlCustomerAdd", "/AjaxCommon/GetCustomerDDL", null, "Select", function () {
            $("#ddlCustomerAdd").select2();
            if ($("#ddlCustomerAdd option").length > 1) {
                //$("#ddlCustomerAdd").val($("#ddlCustomerAdd option:eq(1)").val()).select2();
                $("#ddlCustomerAdd").val(_CustomerID).select2();
                UtilityMeter.BindCommodityDDL();
                UtilityMeter.BindBuildingDDLAdd();
            }
        });
        //Reload_ddl_Global(null, "#ddlUtilityAccountAdd", "/AjaxCommon/GetAllUtilityAccountDDL", null, "Select", function () { $("#ddlUtilityAccountAdd").select2(); });
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


    },

    BindCommodityDDLAdd: function () {
        if (IsNotNull($("#ddlUtilityAccountAdd").val())) {
            Reload_ddl_Global(null, "#ddlCommodityAdd", "/AjaxCommon/GetCommodityByUtilityAccountIDDDL", { UtilityAccountID: $("#ddlUtilityAccountAdd").val() }, "All", function () { $("#ddlCommodityAdd").select2(); });
        }
        else {
            $("#ddlCommodityAdd").html("<option value=''>Select</option>");
            $("#ddlCommodityAdd").val('').select2();
        }

    },

    GetDataByID: function (UtilityMeterId) {
        $("#ddlCustomerAdd").attr('disabled', true);
        GetAjaxData("/UtilityMeter/GetData", { UtilityMeterID: UtilityMeterId }, function (data) {
            var JsonData = data.data;
            Reset_Form_Errors();
            Clear_Form_Fields("#frm_AddUtilityMeter");
            UtilityMeter.ClearData();
            try {
                if (IsNotNull(JsonData)) {
                    $("#hf_UtilityMeterId").val(JsonData.utilityMeterID);

                    Reload_ddl_Global(null, "#ddlCustomerAdd", "/AjaxCommon/GetCustomerDDL", null, "Select", function () {
                        $("#ddlCustomerAdd").val(JsonData.customerID);
                        $("#ddlCustomerAdd").select2();

                        Reload_ddl_Global(null, "#ddlBuildingAdd", "/AjaxCommon/GetBuildingDDL", { CustomerID: JsonData.customerID }, "Select", function (data) {
                            $("#ddlBuildingAdd").val(JsonData.buildingID);
                            $("#ddlBuildingAdd").select2();

                            /* For Binding Utility Account DDL */
                            Reload_ddl_Global(null, "#ddlUtilityAccountAdd", "/AjaxCommon/GetAllUtilityAccountDDL", { CustomerID: JsonData.customerID, BuildingID: JsonData.buildingID }, "Select", function () {
                                $("#ddlUtilityAccountAdd").val(JsonData.utilityAccountID);
                                $("#ddlUtilityAccountAdd").select2();

                                /* For Binding Commodity DDL */
                                Reload_ddl_Global(null, "#ddlCommodityAdd", "/AjaxCommon/GetCommodityByUtilityAccountIDDDL", { UtilityAccountID: JsonData.utilityAccountID }, "Select", function () {
                                    $("#ddlCommodityAdd").val(JsonData.commodityID);
                                    $("#ddlCommodityAdd").select2();

                                });
                            });

                        });
                    });



                    $("#txtCID").val(JsonData.cid);
                    $("#txtMeterNumber").val(JsonData.utilityMeterNumber);
                    $("#txtServiceIdentifier").val(JsonData.serviceIdentifier);
                    $("#txtServiceClass").val(JsonData.serviceClass);

                    $('.date-picker').datepicker({ autoclose: true, todayHighlight: true, format: 'mm/dd/yyyy', useCurrent: true, minDate: 0 });
                    $("#txtvalidFrom").val(JsonData.effectiveFromDateCustom);
                    $('#txtvalidFrom').datepicker("update", JsonData.effectiveFromDateCustom);
                    $("#txtvalidUntil").val(CommonTodayDate.mmddyyyy());
                    $('#txtvalidUntil').datepicker("update", JsonData.effectiveTillDateCustom);



                    $("#hf_FromDate").val(JsonData.effectiveFromDateCustomMN);
                    $("#lblUtilityMeterNumber").text(JsonData.utilityMeterNumber);
                    $("#lblUtilityMeterUID").text(JsonData.utilityMeterUID);
                    $("#lblTariffTypeName").text(JsonData.tariffTypeName);
                    $("#lblManufacturerName").text(JsonData.manufacturerName);
                    $("#lblRemarks").text(JsonData.remarks);
                    $("#lblDate").text(JsonData.effectiveFromDateCustomMN + " to " + JsonData.effectiveTillDateCustomMN);
                    $("#txtvalidFromMN").val(JsonData.effectiveFromDateCustomMN);
                    $("#txtvalidUntilMN").val(JsonData.effectiveTillDateCustomMN);

                    if (JsonData.isUpdateUtilityMeter) {
                        $("#hf_IsUpdateUtilityMeter").val(true);
                        $("#ddlCustomerAdd").attr('disabled', false);
                        $("#ddlBuildingAdd").attr('disabled', false);
                        $("#ddlUtilityAccountAdd").attr('disabled', false);
                        $("#ddlCommodityAdd").attr('disabled', false);
                        $("#txtCID").attr('disabled', false);
                        $("#txtMeterNumber").attr('disabled', false);
                        $("#txtServiceIdentifier").attr('disabled', false);
                        $("#txtServiceClass").attr('disabled', false);
                        $("#txtvalidFrom").attr('disabled', false);
                    }
                    else {
                        $("#hf_IsUpdateUtilityMeter").val(false);
                        $("#ddlCustomerAdd").attr('disabled', true);
                        $("#ddlBuildingAdd").attr('disabled', true);
                        $("#ddlUtilityAccountAdd").attr('disabled', true);
                        $("#ddlCommodityAdd").attr('disabled', true);
                        $("#txtCID").attr('disabled', true);
                        //$("#txtMeterNumber").attr('disabled', true);
                        $("#txtServiceIdentifier").attr('disabled', true);
                        $("#txtServiceClass").attr('disabled', true);
                        $("#txtvalidFrom").attr('disabled', true);
                    }
                    UtilityMeter.ViewHistoryOfUtilityUtilityMeterNumber(JsonData.utilityMeterID);
                }
            } catch (e) {
                printError("UtilityMeter.js", 'GetDataByID', e);
            }

        }, function () { });
    },

    ViewHistoryOfUtilityUtilityMeterNumber: function (utilityMeterID) {
        LoadGridWithoutPagination(null, "tblUtilityMeterNumber", "/UtilityMeter/GetUtilityMeterNumberViewHistory", { UtilityMeterID: utilityMeterID }, function (data) {
            var JsonData = data;
            if (IsNotNull(JsonData)) {
                let index = JsonData.length;
                if (index > 0) {
                    $("#hf_UtilityMeterNumberId").val(JsonData[index - 1].utilityMeterNumberID);
                    $("#txtMeterUID").val(JsonData[index - 1].utilityMeterUID);
                    $("#ddlTariffTypeAdd").val(JsonData[index - 1].tariffTypeID);
                    $("#ddlTariffTypeAdd").select2();
                    $("#ddlManufacturerAdd").val(JsonData[index - 1].manufacturerID);
                    $("#ddlManufacturerAdd").select2();
                    $("#txtRemark").val(JsonData[index - 1].remarks);
                }
            }

        });
    },

    SetForUpdate: function (UtilityMeterId, UtilityMeterDescription) {
        UtilityMeter.LineEditFlag = false;
        $("#lblUtilityMeterTitle").text("Edit Utility Meter Number(" + UtilityMeterDescription + ")");
        UtilityMeter.GetDataByID(UtilityMeterId);
        $("#AddUtilityMeterModal").modal();
        $(".btnMultiplier").show();
        $("#btnMultiplier").show();
        $("#divMultiplier").show();
        $("#divMeterNumber").hide();
        $("#divForDateRange").show();
        Reload_ddl_Global(null, "#ddlManufacturerAdd", "/AjaxCommon/GetManufacturerDDL", null, "Select", function () { $("#ddlManufacturerAdd").select2(); });
        Reload_ddl_Global(null, "#ddlTariffTypeAdd", "/AjaxCommon/GetTariffTypeDDL", null, "Select", function () { $("#ddlTariffTypeAdd").select2(); });
    },

    ClosebtnMeterNumberControl: function () {
        $("#divMeterNumber").hide();
    },

    ShowbtnMeterNumberControl: function () {
        UtilityMeter.LineEditFlag = true;
        $("#divMeterNumber").show();
        $('#txtvalidFromMN').datepicker('setStartDate', new Date($('#hf_FromDate').val()).addDays(1));
        $('#txtvalidFromMN').val('');
        $('#txtvalidUntilMN').val('');
    },

    SetForClose: function () {
        UtilityMeter.LineEditFlag = false;
        $("#AddUtilityMeterModal").modal('hide');
        UtilityMeter.ClearData();
        Clear_Form_Fields("#frm_AddUtilityMeter");
        $("#hf_UtilityMeterId").val('');
        $("#hf_UtilityMeterNumberId").val('');
        $("#hf_FromDate").val('');
        $("#hf_UtilityMeterNumberId").val('');
        $("#txtvalidFromMN").datepicker('setStartDate', '');
        $('#txtvalidFromMN').val('');
        $('#txtvalidUntilMN').val('');
        //$("#ddlCommodityAdd").html("<option value=''>Select</option>");
        //$("#ddlCommodityAdd").val('').select2();

        $("#ddlCustomerAdd").attr('disabled', true);
        $("#ddlBuildingAdd").attr('disabled', false);

        $("#ddlUtilityAccountAdd").attr('disabled', false);
        $("#ddlCommodityAdd").attr('disabled', false);
        $("#txtCID").attr('disabled', false);
        $("#txtMeterNumber").attr('disabled', false);
        $("#txtServiceIdentifier").attr('disabled', false);
        $("#txtServiceClass").attr('disabled', false);
        $("#txtvalidFrom").attr('disabled', false);
    },

    AddUpdate: function () {
        Reset_Form_Errors();
        var FormData = UtilityMeter.GetData();
        if (UtilityMeter.ValidateData(FormData)) {
            AddUpdateData("/UtilityMeter/AddUpdate", { Model: FormData }, function (data) {
                try {
                    var result = data.data;
                    if (result["status"] === true) {
                        if (data.status.toLowerCase() === 'success') {
                            showSweetAlert(data.status, data.message, 'success', null);
                            UtilityMeter.BindGrid();
                            UtilityMeter.SetForClose();
                        }
                    }
                    else {
                        showSweetAlert("Failed", result["message"], 'error', null);
                    }

                } catch (e) {
                    printError('UtilityMeter.js', 'AddUpdate', e);
                }

            }, function (responce_data) {
                showSweetAlert(responce_data.status, responce_data.message, 'error', null);
            });
        }
    },

    Delete: function (_id, ItemInfo) {
        DeleteData(UtilityMeter.xhr_getData_For_Delete, "/UtilityMeter/Delete", { UtilityMeterID: _id, CurrentScreenID: CurrentScreenID }, ItemInfo, function () {
            UtilityMeter.BindGrid();
            UtilityMeter.ClearData();
            UtilityMeter.SetForClose();
        });
    },

    ResetData: function () {

        var ID = $("#hf_UtilityMeterId").val();

        $(".has-error p").html("");
        $(".has-error").removeClass("has-error");

        if (ID == "" || ID == null || ID == 0 || ID == undefined)
            UtilityMeter.ClearData();
        else
            UtilityMeter.GetDataByID(ID);
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

        if (UtilityMeter.LineEditFlag) {
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

        $("#ddlCustomerAdd").val(_CustomerID).select2();
        $("#ddlBuildingAdd").val("").trigger("change");
        $("#ddlUtilityAccountAdd").val("").trigger("change");
        $("#ddlCommodityAdd").val("").trigger("change");
        //$("#ddlManufacturerAdd").val("").trigger("change");
        $("#ddlTariffTypeAdd").val("").trigger("change");

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

        for (var i = 1; i < getAccess.length; i++) {
            if (getAccess.length > 1) {
                if ((getAccess[i].ActionCode == "AccViewBills")) {
                    flagViewBills = true;
                }
            }
        }

        if (!flagViewBills) {
            $("#tblUtilityMeter .AdditionalAccessViewBills").hide().html("");
        }

        return returnModal;
    },
    /*  screen access code end  */

    ShowResetPopup: function (customerCode) {
        //if ($('#chk' + customerCode).prop('checked')) {

        let confirmationMessage = "";
        var currentChkStatus = $('#chk' + customerCode).prop('checked') || false;
        if (currentChkStatus)
            confirmationMessage = 'activate';
        else
            confirmationMessage = 'deactivate';


        $.confirm({
            theme: 'modern',
            title: 'Are you sure you want to ' + confirmationMessage + ' utility account ?',
            content: '<b> Kindly confirm!</b>',
            animation: 'zoom',
            closeAnimation: 'scale',
            backgroundDismiss: true,
            //autoClose: 'cancel|5000',
            animationSpeed: '400',
            icon: 'flaticon-warning text-warning',
            closeIcon: true,
            buttons: {
                cancel: {
                    text: 'No',
                    btnClass: 'btn btn-sm btn-default',
                    action: function () {
                        $('#chk' + customerCode).prop('checked', !currentChkStatus);
                    }
                },
                confirm: {
                    text: 'Yes',
                    btnClass: 'btn btn-sm btn-warning',
                    action: function () {
                        $('#chk' + customerCode).prop('checked', !currentChkStatus);
                    },
                }
            },
            onOpen: function () {
            },
            onClose: function () {
                $('#chk' + customerCode).prop('checked', !currentChkStatus);
            },
        });
        //}
        //else {
        //    $("#ddlReadType").val(1);
        //}
    },
    SetForBillView: function (customerCode, buildingCode, utilityAccountUID, meterUID) {


        window.location.href = "/Bill/Index?customerCode=" + customerCode + "&buildingCode=" + buildingCode + "&utilityAccountUID=" + utilityAccountUID + "&meterUID=" + meterUID;
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

    

    GoToViewBills: function (buildingID, utilityID, utilityAccountID, utilityMeterID) {
        var customerID = $("#ddlCustomerSearch").val();
        if (IsNotNull(customerID) && IsNotNull(buildingID) && IsNotNull(utilityID) && IsNotNull(utilityAccountID)) {
            var encryptedScreenID = $("#hf_ViewBills").val();
            window.location.href = "/ViewBills/Index/" + encryptedScreenID + "?CustomerID=" + customerID + "&BuildingID=" + buildingID + "&UtilityID=" + utilityID + "&UtilityAccountID=" + utilityAccountID + "&UtilityMeterID=" + utilityMeterID;
        }
    },
    BindUtilityBuildingAccountWise: function () {

        Reload_ddl_Global(null, "#ddlUtilitySearch", "/AjaxCommon/GetUtilityBuildingAccountWise", { CustomerID: $("#ddlCustomerSearch").val() || 0, BuildingID: $("#ddlBuildingSearch").val() || 0 }, "All", function (data) {
            $("#ddlUtilitySearch").select2();
        });

    },
}