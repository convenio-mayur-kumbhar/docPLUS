var ddlColumnSelection = [
    { "value": "1", "text": "Bill Date" },
    { "value": "2", "text": "Entry Date" }
];

var selectedUtilityMeterID = null;
var selectedUtilityAccountID = null;
var selectedBuildingID = null;
var selectedCommdityID = null;


$(document).ready(function () {

    $(".date-picker").datepicker({
        autoclose: true, todayHighlight: true, format: 'M-yyyy', viewMode: "months", minViewMode: "months",
    });

    $("#txtvalidFrom").val(new Date().addMonths(-12));
    $("#txtvalidFrom").datepicker("update", new Date().addMonths(-12));
    $('#txtvalidFrom').datepicker("setEndDate", new Date().addMonths(-1));
    
    $("#txtvalidUntil").val(CommonTodayDate.mmddyyyy());
    $('#txtvalidUntil').datepicker("update", CommonTodayDate.mmddyyyy());
    $('#txtvalidUntil').datepicker("setEndDate", CommonTodayDate.mmddyyyy());

    $("#ddlAccountSearch").html("<option value=''>Select</option>");
    $("#ddlAccountSearch").val('').select2();

    $("#ddlBuildingSearch").html("<option value=''>Select</option>");
    $("#ddlBuildingSearch").val('').select2();

    Reload_ddl_Global(null, "#ddlMeterSearch", "/AjaxCommon/GetUtilityMeterNumberDDL", null, "Select", function () { $("#ddlMeterSearch").select2(); });
    Reload_ddl_Global(null, "#ddlCustomerSearch", "/AjaxCommon/GetCustomerDDL", null, "Select", function () {
        $("#ddlCustomerSearch").select2();
        if ($("#ddlCustomerSearch option").length > 1) {
            //$("#ddlCustomerSearch").val($("#ddlCustomerSearch option:eq(1)").val()).select2();
            $("#ddlCustomerSearch").val(_CustomerID).select2();
            ExportData.BindCommodityDDL();
            ExportData.BindBuildingDDLForSearch();
        }
    });
    Reload_ddl_Global(null, "#ddlCommoditySearch", "/AjaxCommon/GetCommodityDDL", null, "Select", function () { $("#ddlCommoditySearch").select2(); });

    Reload_ddl_Global_staticData(null, "#ddlColumnSelection", "/AjaxCommon/GetStatusDDL", null, "Select", ddlColumnSelection, function () { $("#ddlColumnSelection").select2(); });
    $("#ddlColumnSelection").val(1).trigger("change");

    var queryStringData = getQueryStringParams();
    if (queryStringData != null) {
        var customerCode = queryStringData["customerCode"];
        var buildingCode = queryStringData["buildingCode"];
        var utilityAccountUID = queryStringData["utilityAccountUID"];
        var meterUID = queryStringData["meterUID"];

        var buildingCode = queryStringData["buildingCode"];

        if (typeof (customerCode) != "undefined" && typeof (buildingCode) != "undefined") {
            var customerandbuilding = 'Customer Code : ' + customerCode + ' / Building Code : ' + buildingCode + ' / Utility Account : ' + utilityAccountUID + ' / Meter : ' + meterUID;
            $('#lblCustomerBuildingCode').html(customerandbuilding);

            $("#ddlCustomerSearch").val(customerCode).trigger("change");
            $("#ddlBuildingSearch").val(buildingCode).trigger("change");
        }
    }

});

var ExportData = {

    OnSelectDDLCommoditySearch: function () {
        selectedCommdityID = $("#ddlCommoditySearch").val();
        Reload_ddl_Global(null, "#ddlMeterSearch", "/AjaxCommon/GetUtilityMeterNumberDDL", { UtilityAccountID: null, CustomerID: $("#ddlCustomerSearch").val(), BuildingID: null, CommodityID: selectedCommdityID }, "Select", function () {
            $("#ddlMeterSearch").val(selectedUtilityMeterID);
            if (!IsNotNull($("#ddlMeterSearch").val())) {
                $("#ddlMeterSearch").val("").select2();
            }
        });
    },

    BindCommodityDDL: function () {
        if (IsNotNull($("#ddlCustomerSearch").val())) {
            //Reload_ddl_Global(null, "#ddlCommoditySearch", "/AjaxCommon/GetCommodityDDLForDashboard", { CustomerID: $("#ddlCustomerSearch").val() }, "All", function () {
            //    $("#ddlCommoditySearch").select2();
            //});
            Reload_ddl_Global(null, "#ddlCommoditySearch", "/AjaxCommon/GetCommodityDDLForCustomer", { CustomerID: $("#ddlCustomerSearch").val(), BuildingID: $("#ddlBuildingSearch").val() || 0, UtilityAccountID: $("#ddlAccountSearch").val() || 0, UtilityMeterID: $("#ddlMeterSearch").val() || 0 }, "All", function () {
                $("#ddlCommoditySearch").select2();
            });
        }
    },

    //OnSelectDDLMeterSearch: function () {
    //    selectedUtilityMeterID = $("#ddlMeterSearch").val();
    //    Reload_ddl_Global(null, "#ddlAccountSearch", "/AjaxCommon/GetAllUtilityAccountDDL", { CustomerID: $("#ddlCustomerSearch").val() || 0, BuildingID: 0, UtilityMeterID: $("#ddlMeterSearch").val() || 0 }, "Select", function () {
    //        $("#ddlAccountSearch").val(selectedUtilityAccountID);
    //        if (!IsNotNull($("#ddlAccountSearch").val())) {
    //            $("#ddlAccountSearch").val("").select2();
    //            if ($("#ddlAccountSearch option").length === 2) {
    //                $("#ddlAccountSearch").val($("#ddlAccountSearch option:eq(1)").val()).select2();
    //            }
    //        }
    //    });
    //    Reload_ddl_Global(null, "#ddlBuildingSearch", "/AjaxCommon/GetBuildingDDL", { CustomerID: $("#ddlCustomerSearch").val(), UtilityAccountID: $("#ddlAccountSearch").val() || 0, UtilityMeterID: $("#ddlMeterSearch").val() || 0 }, "Select", function () {
    //        $("#ddlBuildingSearch").val(selectedBuildingID).select2();
    //        if (!IsNotNull($("#ddlBuildingSearch").val())) {
    //            $("#ddlBuildingSearch").val("").select2();
    //            if ($("#ddlBuildingSearch option").length === 2) {
    //                $("#ddlBuildingSearch").val($("#ddlBuildingSearch option:eq(1)").val()).select2();
    //            }
    //        }
    //    });
    //},

    OnSelectDDLMeterSearch: function () {
        selectedUtilityMeterID = $("#ddlMeterSearch").val();
        selectedBuildingID = $("#ddlBuildingSearch").val();


        GetAjaxData("/ViewBills/GetBuildingUtilityAccountByUtilityMeterID", { CustomerID: $("#ddlCustomerSearch").val() || 0, UtilityMeterID: $("#ddlMeterSearch").val() || 0 }, function (data) {
            var JsonData = data.data;
            try {
                if (IsNotNull(JsonData)) {
                    selectedUtilityAccountID = JsonData.utilityAccountID;
                    selectedBuildingID = JsonData.buildingID;

                    Reload_ddl_Global(null, "#ddlAccountSearch", "/AjaxCommon/GetAllUtilityAccountDDL", { CustomerID: $("#ddlCustomerSearch").val() || 0, BuildingID: selectedBuildingID || 0, UtilityMeterID: null }, "Select", function () {
                        $("#ddlAccountSearch").val(selectedUtilityAccountID).select2();
                    });

                    Reload_ddl_Global(null, "#ddlBuildingSearch", "/AjaxCommon/GetBuildingDDL", { CustomerID: $("#ddlCustomerSearch").val(), UtilityAccountID: null || 0, UtilityMeterID: null || 0 }, "Select", function () {
                        $("#ddlBuildingSearch").val(selectedBuildingID).select2();
                    });

                    setTimeout(function () {
                        ExportData.BindCommodityDDL();
                    }, 500);

                }
                else {
                                      

                    Reload_ddl_Global(null, "#ddlAccountSearch", "/AjaxCommon/GetAllUtilityAccountDDL", { CustomerID: $("#ddlCustomerSearch").val() || 0, BuildingID: $("#ddlBuildingSearch").val() || 0, UtilityMeterID: null }, "Select", function () {
                        $("#ddlAccountSearch").val(selectedUtilityAccountID).select2();
                    });

                    Reload_ddl_Global(null, "#ddlBuildingSearch", "/AjaxCommon/GetBuildingDDL", { CustomerID: $("#ddlCustomerSearch").val(), UtilityAccountID: $("#ddlAccountSearch").val() || 0, UtilityMeterID: $("#ddlMeterSearch").val() || 0 }, "Select", function () {
                        $("#ddlBuildingSearch").val(selectedBuildingID).select2();
                    });

                    Reload_ddl_Global(null, "#ddlMeterSearch", "/AjaxCommon/GetUtilityMeterNumberDDL", { UtilityAccountID: selectedUtilityAccountID, CustomerID: $("#ddlCustomerSearch").val(), BuildingID: selectedBuildingID, CommodityID: null }, "Select", function () {
                        $("#ddlMeterSearch").val("").select2();
                    });

                    setTimeout(function () {
                        ExportData.BindCommodityDDL();
                    }, 500);

                }
            } catch (e) {
                printError("ExportOfData.js", 'OnSelectDDLMeterSearch', e);
            }

        }, function () { });       

    },

    BindBuildingDDLForSearch: function () {

        $("#ddlAccountSearch option").remove();
        $("#ddlMeterSearch option").remove();
        Reload_ddl_Global(null, "#ddlAccountSearch", "/AjaxCommon/GetAllUtilityAccountDDL", { CustomerID: $("#ddlCustomerSearch").val() || 0, BuildingID: $("#ddlBuildingSearch").val() || 0, UtilityMeterID: $("#ddlMeterSearch").val() || 0 }, "Select", function () {
            $("#ddlAccountSearch").val(selectedUtilityAccountID);
            if (!IsNotNull($("#ddlAccountSearch").val())) {
                $("#ddlAccountSearch").val("").select2();
            }
        });
        Reload_ddl_Global(null, "#ddlMeterSearch", "/AjaxCommon/GetUtilityMeterNumberDDL", { UtilityAccountID: null, CustomerID: $("#ddlCustomerSearch").val(), BuildingID: null, CommodityID: null }, "Select", function () {
            $("#ddlMeterSearch").val(selectedUtilityMeterID);
            if (!IsNotNull($("#ddlMeterSearch").val())) {
                $("#ddlMeterSearch").val("").select2();
            }
        });
        Reload_ddl_Global(null, "#ddlBuildingSearch", "/AjaxCommon/GetBuildingDDL", { CustomerID: $("#ddlCustomerSearch").val(), UtilityAccountID: $("#ddlAccountSearch").val() || 0, UtilityMeterID: $("#ddlMeterSearch").val() || 0 }, "Select", function () {
            $("#ddlBuildingSearch").val(selectedBuildingID).select2();
            if (!IsNotNull($("#ddlBuildingSearch").val())) {
                $("#ddlBuildingSearch").val("").select2();
            }
        });
    },

    //BindUtilityAccountDDLForSearch: function () {
    //    selectedBuildingID = $("#ddlBuildingSearch").val();
    //    $("#ddlMeterSearch option").remove();
    //    Reload_ddl_Global(null, "#ddlMeterSearch", "/AjaxCommon/GetUtilityMeterNumberDDL", { UtilityAccountID: null, CustomerID: $("#ddlCustomerSearch").val(), BuildingID: $("#ddlBuildingSearch").val(), CommodityID: null }, "Select", function () {
    //        $("#ddlMeterSearch").val(selectedUtilityMeterID);
    //        if (!IsNotNull($("#ddlMeterSearch").val())) {
    //            $("#ddlMeterSearch").val("").select2();
    //        }
    //    });
    //    //Reload_ddl_Global(null, "#ddlAccountSearch", "/AjaxCommon/GetUtilityAccountDDL", { BuildingID: $("#ddlBuildingSearch").val() }, "Select", function () {
    //    //    $("#ddlAccountSearch").val(selectedUtilityAccountID).select2();
    //    //    if ($("#ddlAccountSearch").val() == null) {
    //    //        $("#ddlAccountSearch").val("").select2();
    //    //    }
    //    //});
    //    Reload_ddl_Global(null, "#ddlAccountSearch", "/AjaxCommon/GetAllUtilityAccountDDL", { CustomerID: $("#ddlCustomerSearch").val() || 0, BuildingID: $("#ddlBuildingSearch").val() || 0, UtilityMeterID: selectedUtilityMeterID || 0 }, "Select", function () {
    //        //$("#ddlAccountSearch").select2();

    //        $("#ddlAccountSearch").val(selectedUtilityAccountID).select2();
    //        if (selectedUtilityAccountID != null) {
    //            Reload_ddl_Global(null, "#ddlBuildingSearch", "/AjaxCommon/GetBuildingDDL", { CustomerID: $("#ddlCustomerSearch").val(), UtilityAccountID: $("#ddlAccountSearch").val() || 0, UtilityMeterID: $("#ddlMeterSearch").val() || 0 }, "Select", function () {
    //                //$("#ddlBuildingSearch").select2();
    //                $("#ddlBuildingSearch").val(selectedBuildingID).select2();
    //                if (!IsNotNull($("#ddlBuildingSearch").val())) {
    //                    $("#ddlBuildingSearch").val("").select2();
    //                }
    //            });
    //        }
    //        if (!IsNotNull($("#ddlAccountSearch").val())) {
    //            $("#ddlAccountSearch").val("").select2();
    //        }
    //    });
    //},

    BindUtilityAccountDDLForSearch: function () {
        selectedBuildingID = $("#ddlBuildingSearch").val();

        if ($("#ddlBuildingSearch").val() == "" || $("#ddlBuildingSearch").val() == null) {
            selectedUtilityMeterID = null;
            selectedUtilityAccountID = null;

            Reload_ddl_Global(null, "#ddlBuildingSearch", "/AjaxCommon/GetBuildingDDL", { CustomerID: $("#ddlCustomerSearch").val(), UtilityAccountID: selectedUtilityAccountID || 0, UtilityMeterID: selectedUtilityMeterID || 0 }, "Select", function () {
                //$("#ddlBuildingSearch").select2();
                $("#ddlBuildingSearch").val(selectedBuildingID).select2();
                if (!IsNotNull($("#ddlBuildingSearch").val())) {
                    $("#ddlBuildingSearch").val("").select2();
                    if ($("#ddlBuildingSearch option").length === 2) {
                        $("#ddlBuildingSearch").val($("#ddlBuildingSearch option:eq(1)").val()).select2();
                    }
                }
            });
        }

        $("#ddlMeterSearch option").remove();
        Reload_ddl_Global(null, "#ddlMeterSearch", "/AjaxCommon/GetUtilityMeterNumberDDL", { UtilityAccountID: null, CustomerID: $("#ddlCustomerSearch").val(), BuildingID: $("#ddlBuildingSearch").val(), CommodityID: null }, "Select", function () {
            //$("#ddlMeterSearch").select2();
            $("#ddlMeterSearch").val(selectedUtilityMeterID).select2();
            if (!IsNotNull($("#ddlMeterSearch").val())) {
                $("#ddlMeterSearch").val("").select2();
            }
        });

        Reload_ddl_Global(null, "#ddlAccountSearch", "/AjaxCommon/GetAllUtilityAccountDDL", { CustomerID: $("#ddlCustomerSearch").val() || 0, BuildingID: $("#ddlBuildingSearch").val() || 0, UtilityMeterID: selectedUtilityMeterID || 0 }, "Select", function () {
            //$("#ddlAccountSearch").select2();

            $("#ddlAccountSearch").val(selectedUtilityAccountID).select2();
            if (selectedUtilityAccountID != null) {
                Reload_ddl_Global(null, "#ddlBuildingSearch", "/AjaxCommon/GetBuildingDDL", { CustomerID: $("#ddlCustomerSearch").val(), UtilityAccountID: $("#ddlAccountSearch").val() || 0, UtilityMeterID: $("#ddlMeterSearch").val() || 0 }, "Select", function () {
                    //$("#ddlBuildingSearch").select2();
                    $("#ddlBuildingSearch").val(selectedBuildingID).select2();
                    if (!IsNotNull($("#ddlBuildingSearch").val())) {
                        $("#ddlBuildingSearch").val("").select2();
                        if ($("#ddlBuildingSearch option").length === 2) {
                            $("#ddlBuildingSearch").val($("#ddlBuildingSearch option:eq(1)").val()).select2();
                        }
                    }
                });
            }
            if (!IsNotNull($("#ddlAccountSearch").val())) {
                $("#ddlAccountSearch").val("").select2();
            }
        });

        setTimeout(function () {
            ExportData.BindCommodityDDL();
        }, 500);
    },

    //BindMeterDDLForSearch: function () {
    //    selectedUtilityAccountID = $("#ddlAccountSearch").val();
    //    Reload_ddl_Global(null, "#ddlMeterSearch", "/AjaxCommon/GetUtilityMeterNumberDDL", { UtilityAccountID: $("#ddlAccountSearch").val(), CustomerID: $("#ddlCustomerSearch").val(), BuildingID: $("#ddlBuildingSearch").val(), CommodityID: null }, "Select", function () {
    //        $("#ddlMeterSearch").val(selectedUtilityMeterID);
    //        if (!IsNotNull($("#ddlMeterSearch").val())) {
    //            $("#ddlMeterSearch").val("").select2();
    //        }
    //    });
    //},

    BindMeterDDLForSearch: function () {
        selectedUtilityAccountID = $("#ddlAccountSearch").val();
        GetAjaxData("/ViewBills/GetBuildingByUtilityAccountID", { CustomerID: $("#ddlCustomerSearch").val() || 0, UtilityAccountID: $("#ddlAccountSearch").val() || 0 }, function (data) {
            var JsonData = data.data;
            try {
                if (IsNotNull(JsonData)) {

                    selectedBuildingID = JsonData.buildingID;
                    selectedUtilityAccountID = JsonData.utilityAccountID;

                    Reload_ddl_Global(null, "#ddlBuildingSearch", "/AjaxCommon/GetBuildingDDL", { CustomerID: $("#ddlCustomerSearch").val(), UtilityAccountID: null, UtilityMeterID: null }, "Select", function () {
                        $("#ddlBuildingSearch").val(selectedBuildingID).select2();
                    });

                    Reload_ddl_Global(null, "#ddlMeterSearch", "/AjaxCommon/GetUtilityMeterNumberDDL", { UtilityAccountID: selectedUtilityAccountID, CustomerID: $("#ddlCustomerSearch").val(), BuildingID: selectedBuildingID, CommodityID: null }, "Select", function () {
                        $("#ddlMeterSearch").select2();
                    });

                    setTimeout(function () {
                        ExportData.BindCommodityDDL();
                    }, 500);

                }
                else {

                    Reload_ddl_Global(null, "#ddlBuildingSearch", "/AjaxCommon/GetBuildingDDL", { CustomerID: $("#ddlCustomerSearch").val(), UtilityAccountID: null, UtilityMeterID: null }, "Select", function () {
                        $("#ddlBuildingSearch").val(selectedBuildingID).select2();
                    });

                    Reload_ddl_Global(null, "#ddlAccountSearch", "/AjaxCommon/GetAllUtilityAccountDDL", { CustomerID: $("#ddlCustomerSearch").val() || 0, BuildingID: selectedBuildingID || 0, UtilityMeterID: selectedUtilityMeterID || 0 }, "Select", function () {
                        $("#ddlAccountSearch").val(selectedUtilityAccountID).select2();
                    });

                    Reload_ddl_Global(null, "#ddlMeterSearch", "/AjaxCommon/GetUtilityMeterNumberDDL", { UtilityAccountID: selectedUtilityMeterID, CustomerID: $("#ddlCustomerSearch").val(), BuildingID: selectedBuildingID, CommodityID: null }, "Select", function () {
                        $("#ddlMeterSearch").val(selectedUtilityMeterID).select2();
                    });

                    setTimeout(function () {
                        ExportData.BindCommodityDDL();
                    }, 500);

                }
            } catch (e) {
                printError("ExportOfData.js", 'BindMeterDDLForSearch', e);
            }

        }, function () { });
    },

    ResetDropDowns: function () {
        selectedUtilityMeterID = null;
        selectedUtilityAccountID = null;
        selectedBuildingID = null;
        selectedCommdityID = null;

        $('.date-picker').datepicker({ autoclose: true, todayHighlight: true, format: 'mm/dd/yyyy', useCurrent: false, minDate: 0 });
        $("#txtvalidFrom").val(new Date().addMonths(-12));
        $("#txtvalidUntil").val(CommonTodayDate.mmddyyyy());
        $("#txtvalidFrom").datepicker("update", new Date().addMonths(-12));
        $('#txtvalidUntil').datepicker("update", CommonTodayDate.mmddyyyy());

        Reload_ddl_Global(null, "#ddlMeterSearch", "/AjaxCommon/GetUtilityMeterNumberDDL", null, "Select", function () {
            $("#ddlMeterSearch").val(selectedUtilityMeterID);
            if (!IsNotNull($("#ddlMeterSearch").val())) {
                $("#ddlMeterSearch").val("").select2();
            }
        });
        //Reload_ddl_Global(null, "#ddlCustomerSearch", "/AjaxCommon/GetCustomerDDL", null, "Select", function () { $("#ddlCustomerSearch").select2(); });
        //Reload_ddl_Global(null, "#ddlCommoditySearch", "/AjaxCommon/GetCommodityDDL", null, "Select", function () { $("#ddlCommoditySearch").select2(); });

        Reload_ddl_Global(null, "#ddlBuildingSearch", "/AjaxCommon/GetBuildingDDL", { CustomerID: $("#ddlCustomerSearch").val() }, "Select", function () {
            $("#ddlBuildingSearch").select2();
        });

        Reload_ddl_Global(null, "#ddlAccountSearch", "/AjaxCommon/GetAllUtilityAccountDDL", { CustomerID: $("#ddlCustomerSearch").val() || 0 }, "Select", function () {
            $("#ddlAccountSearch").select2();
        });

        Reload_ddl_Global(null, "#ddlCommoditySearch", "/AjaxCommon/GetCommodityDDLForDashboard", { CustomerID: $("#ddlCustomerSearch").val() }, "All", function () {
            $("#ddlCommoditySearch").select2();
        });

        //$("#ddlAccountSearch").html("<option value=''>Select</option>");
        $("#ddlAccountSearch").val('').select2();

        //$("#ddlBuildingSearch").html("<option value=''>Select</option>");
        $("#ddlBuildingSearch").val('').select2();
        $('#TPS,#NonTPS').prop('checked', false);

        Reload_ddl_Global_staticData(null, "#ddlColumnSelection", "/AjaxCommon/GetStatusDDL", null, "Select", ddlColumnSelection, function () { $("#ddlColumnSelection").select2(); });
        $("#ddlColumnSelection").val(1).trigger("change");
        $('#TPS').prop('checked', true);
    },

    GetMeterBillDownloadData: function () {
        var IsTPS = null;
        Reset_Form_Errors();
        if (!$('#TPS').prop('checked') && !$('#NonTPS').prop('checked'))
            IsTPS = null;
        else
            IsTPS = $('#TPS').prop('checked');

        var fromData = {
            CustomerID: $("#ddlCustomerSearch").val(),
            BuildingID: $("#ddlBuildingSearch").val(),
            UtilityAccountID: $("#ddlAccountSearch").val(),
            MeterID: $("#ddlMeterSearch").val(),
            CommodityID: $("#ddlCommoditySearch").val(),
            IsSupply: IsTPS,
            FromDate: $("#txtvalidFrom").val(),
            ToDate: $("#txtvalidUntil").val(),
            ColumnSelectionID: $("#ddlColumnSelection").val()
        }
        if (ExportData.ValidateDataSearch(fromData)) {
            $('.loadercontainer').show();
            GetAjaxData("/ExportOfData/GetAllMeterBillDownload", fromData, function (data) {
                try {
                    if (IsNotNull(data)) {
                        if (data.status.toLowerCase() === 'success') {
                            setTimeout(function () {
                                //window.open("/MeterBillReport" + ".xlsm", "_Target");
                                window.open(window.location.origin + "/" + data.message, null);
                                //window.open(data.message, "_Target");
                                //window.open("../" + data.message, "_Target");
                            }, 500);
                        }
                    }
                    else {
                        showSweetAlert(data.status, "Data Not Found!", 'error', null);
                    }
                    $('.loadercontainer').hide();
                } catch (e) {
                    printError("ExportOfData.js", 'GetMeterBillDownloadData', e);
                    $('.loadercontainer').hide();
                    showSweetAlert(data.status, data.message, 'error', null);
                }

            }, function (data) {
                    $('.loadercontainer').hide();
                    showSweetAlert(data.status, data.message, 'error', null);
            });
        }
       

    },
    ValidateDataSearch: function (FormData) {
        var valid = true;
        valid = Validate_DDLControl_NullBlank("#ddlCustomerSearch", FormData.CustomerID, 'Required', valid);
        valid = Validate_DDLControl_NullBlank("#ddlCommoditySearch", FormData.CommodityID, 'Required', valid);
        valid = Validate_Control_NullBlank("#txtvalidFrom", FormData.FromDate, 'Required', valid);
        valid = Validate_Control_NullBlank("#txtvalidUntil", FormData.ToDate, 'Required', valid);
        return valid;
    },


    startMonthChange: function () {
        let TillDate = new Date($("#txtvalidFrom").val()).addMonths(1);
        $("#txtvalidUntil").val(TillDate.mmddyyyy());
        $('#txtvalidUntil').datepicker("update", TillDate);
    },

    //EndMonthChange: function () {
    //    let FromDate = new Date($("#txtvalidUntil").val()).addMonths(-12);
    //    $("#txtvalidFrom").val(FromDate.mmddyyyy());
    //    $('#txtvalidFrom').datepicker("update", FromDate);
    //}
};
