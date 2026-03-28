/// <reference path="../js/common.js" />
var selectedMeterList = [];
var isRedirect = false;
var isBillEditData = false;

var selectedUtilityMeterID = null;
var selectedUtilityAccountID = null;
var selectedBuildingID = null;
var selectedCommdityID = null;

var ddlStatus = [
    { "value": "1", "text": "Active" },
    { "value": "2", "text": "Cancelled" }
    //{ "value": "3", "text": "Unapproved" }
];

var ddlColumnSelection = [
    { "value": "1", "text": "Bill Date" },
    { "value": "2", "text": "Entry Date" }
];

$(document).ready(function () {
    isRedirect = false;
    $("#tblMeterApproval , #divExport").hide();
    $("#divIDViewBills").hide();
    $('.date-picker').datepicker({ autoclose: true, todayHighlight: true, format: 'mm/dd/yyyy', useCurrent: false, minDate: 0 });
    $("#txtFromDateSearch").val(CommonTodayDate.addDays(-30));
    $("#txtToDateSearch").val(CommonTodayDate.mmddyyyy());
    $("#txtFromDateSearch").datepicker("update", CommonTodayDate.addDays(-60));
    $("#txtToDateSearch").datepicker("update", CommonTodayDate.mmddyyyy());

    $("#ddlAccountSearch").html("<option value=''>Select</option>");
    $("#ddlAccountSearch").val('').select2();

    $("#ddlBuildingSearch").html("<option value=''>Select</option>");
    $("#ddlBuildingSearch").val('').select2();

    //Reload_ddl_Global(null, "#ddlMeterSearch", "/AjaxCommon/GetUtilityMeterNumberDDL", null, "Select", function () { $("#ddlMeterSearch").select2(); });
    Reload_ddl_Global(null, "#ddlCustomerSearch", "/AjaxCommon/GetCustomerDDL", null, "Select", function () {
        $("#ddlCustomerSearch").select2();
        if ($("#ddlCustomerSearch option").length > 0) {
            $("#ddlCustomerSearch").val(_CustomerID).select2();
            //$("#ddlCustomerSearch").val($("#ddlCustomerSearch option:eq(1)").val()).select2();            
            ViewBills.BindBuildingDDLForSearch();            
            ViewBills.QueryStringBindViewBill();
            if (!isRedirect) {
                ViewBills.SetForSearch();
            }
            ViewBills.BindCommodityDDL();
        }
    });
    //Reload_ddl_Global(null, "#ddlCommoditySearch", "/AjaxCommon/GetCommodityDDL", null, "Select", function () { $("#ddlCommoditySearch").select2(); });
    Reload_ddl_Global_staticData(null, "#ddlStatus", "/AjaxCommon/GetStatusDDL", null, "Select", ddlStatus, function () { $("#ddlStatus").select2(); });
    $("#ddlStatus").val(1).trigger("change");
    Reload_ddl_Global_staticData(null, "#ddlColumnSelection", "/AjaxCommon/GetStatusDDL", null, "Select", ddlColumnSelection, function () { $("#ddlColumnSelection").select2(); });
    $("#ddlColumnSelection").val(1).trigger("change");

    //ViewBills.BindGrid($("#txtFromDateSearch").val(), $("#txtToDateSearch").val(), $("#ddlStatus").val());
    $('#tblMeterApproval').on('draw.dt', function () {

        if ($("#ddlStatus").val() == 1) {
            //$(".chkApproveColumn").hide();
            //$(".ApprovedStatus").show();
            $(".CancelRebillRemarkColumn").hide();
            $(".CancelRebillColumn").show();
        }
        else {
            //$(".chkApproveColumn").show();
            //$(".ApprovedStatus").hide();
            $(".CancelRebillRemarkColumn").show();
            $(".CancelRebillColumn").hide();
        }
        ViewBills.ScreenAccessPermission();
    });
    //SelectAll("tblGridHeaderSelect", "tblGridRowSelect");
    //$("#btnApproved").attr("disabled", true);

    $('#tblDistributionItems').on('draw.dt', function () {
        if ($("#ddlStatus").val() == 1) {
            $(".UpdateColumnDistribution").show();
        }
        else {
            $(".UpdateColumnDistribution").hide();
            $("#divIDForAddButton").hide();
        }
    });

    $('#tblSupplyItems').on('draw.dt', function () {
        if ($("#ddlStatus").val() == 1) {
            $(".UpdateColumnSupply").show();
        }
        else {
            $(".UpdateColumnSupply").hide();
            $("#divIDForSAddButton").hide();
        }
    });
    /*
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
    */

});

var flagCancelRebill = false;
var flagBillDetails = false;
var chckbind = 0;
var chckbindExcel = 0;
var IsSupplyItemExists = false;
var IsSupplyDetailExists = false;

var ViewBills = {

    QueryStringBindViewBill: function () {
        var queryStringData = getQueryStringParams();
        if (queryStringData != null) {
            var CustomerID = queryStringData["CustomerID"];
            var BuildingID = queryStringData["BuildingID"];
            var UtilityID = queryStringData["UtilityID"];
            var UtilityAccountID = queryStringData["UtilityAccountID"];
            var UtilityMeterID = queryStringData["UtilityMeterID"];
            if (IsNotNull(CustomerID) && IsNotNull(BuildingID)) {
                isRedirect = true;
                $("#ddlCustomerSearch").val(CustomerID).trigger("change");
                setTimeout(function () {
                    Reload_ddl_Global(null, "#ddlBuildingSearch", "/AjaxCommon/GetBuildingDDL", { CustomerID: $("#ddlCustomerSearch").val() }, "Select", function () {
                        $("#ddlBuildingSearch").select2();
                        $("#ddlBuildingSearch").val(BuildingID).trigger("change");
                        setTimeout(function () {
                            Reload_ddl_Global(null, "#ddlAccountSearch", "/AjaxCommon/GetAllUtilityAccountDDL", { CustomerID: $("#ddlCustomerSearch").val() || 0, BuildingID: $("#ddlBuildingSearch").val() || 0, UtilityMeterID: $("#ddlMeterSearch").val() || 0 }, "Select", function () {
                                $("#ddlAccountSearch").select2();
                                $("#ddlAccountSearch").val(UtilityAccountID).trigger("change");
                                setTimeout(function () {
                                    Reload_ddl_Global(null, "#ddlMeterSearch", "/AjaxCommon/GetUtilityMeterNumberDDL", { UtilityAccountID: null, CustomerID: $("#ddlCustomerSearch").val(), BuildingID: null, CommodityID: null }, "Select", function () {
                                        $("#ddlMeterSearch").select2();
                                        $("#ddlMeterSearch").val(UtilityMeterID).trigger("change");
                                        setTimeout(function () {
                                            ViewBills.SetForSearch();
                                        }, 100);
                                    });
                                }, 600);
                            });
                        }, 400);
                    });
                }, 200);
            }
        }
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

    OnSelectDDLCommoditySearch: function () {
        selectedCommdityID = $("#ddlCommoditySearch").val();
        Reload_ddl_Global(null, "#ddlMeterSearch", "/AjaxCommon/GetUtilityMeterNumberDDL", { UtilityAccountID: null, CustomerID: $("#ddlCustomerSearch").val(), BuildingID: null, CommodityID: selectedCommdityID }, "Select", function () {
            $("#ddlMeterSearch").val(selectedUtilityMeterID);
            if ($("#ddlMeterSearch").val() == null) {
                $("#ddlMeterSearch").val("").select2();
            }
        });
    },

    OnSelectDDLMeterSearch: function () {
        selectedUtilityMeterID = $("#ddlMeterSearch").val();
        selectedBuildingID = $("#ddlBuildingSearch").val();

        if ($("#ddlMeterSearch").val() == "" || $("#ddlMeterSearch").val() == null) {
            //selectedUtilityAccountID = null;
            Reload_ddl_Global(null, "#ddlMeterSearch", "/AjaxCommon/GetUtilityMeterNumberDDL", { UtilityAccountID: null, CustomerID: $("#ddlCustomerSearch").val(), BuildingID: $("#ddlBuildingSearch").val(), CommodityID: null }, "Select", function () {
                //$("#ddlMeterSearch").select2();
                $("#ddlMeterSearch").val(selectedUtilityMeterID).select2();
                if (!IsNotNull($("#ddlMeterSearch").val())) {
                    $("#ddlMeterSearch").val("").select2();
                }
            });
        }

        setTimeout(function () {
            Reload_ddl_Global(null, "#ddlAccountSearch", "/AjaxCommon/GetAllUtilityAccountDDL", { CustomerID: $("#ddlCustomerSearch").val() || 0, BuildingID: $("#ddlBuildingSearch").val() || 0, UtilityMeterID: $("#ddlMeterSearch").val() || 0 }, "Select", function () {
                //$("#ddlAccountSearch").select2();
                $("#ddlAccountSearch").val(selectedUtilityAccountID).select2();
                if (!IsNotNull($("#ddlAccountSearch").val())) {
                    $("#ddlAccountSearch").val("").select2();
                    if ($("#ddlAccountSearch option").length === 2) {
                        //$("#ddlAccountSearch").val($("#ddlAccountSearch").selectedIndex = 0).select2();
                        //$("#ddlAccountSearch").val($("#ddlAccountSearch option:last").val()).select2();
                        $("#ddlAccountSearch").val($("#ddlAccountSearch option:eq(1)").val()).select2();
                    }
                }
            });
        }, 100);
        setTimeout(function () {
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
        }, 200);

        setTimeout(function () {
        if ($("#ddlAccountSearch").val() != "" && $("#ddlAccountSearch").val() != null) {
            Reload_ddl_Global(null, "#ddlMeterSearch", "/AjaxCommon/GetUtilityMeterNumberDDL", { UtilityAccountID: $("#ddlAccountSearch").val(), CustomerID: $("#ddlCustomerSearch").val(), BuildingID: $("#ddlBuildingSearch").val(), CommodityID: null }, "Select", function () {
                //$("#ddlMeterSearch").select2();
                $("#ddlMeterSearch").val(selectedUtilityMeterID).select2();
                if (!IsNotNull($("#ddlMeterSearch").val())) {
                    $("#ddlMeterSearch").val("").select2();
                }
            });
            }
        }, 300);
    },

    OnSelectDDLMeterSearchNew: function () {
        selectedUtilityMeterID = $("#ddlMeterSearch").val();
        selectedBuildingID = $("#ddlBuildingSearch").val();

        
        GetAjaxData("/ViewBills/GetBuildingUtilityAccountByUtilityMeterID", { CustomerID: $("#ddlCustomerSearch").val() || 0, UtilityMeterID: $("#ddlMeterSearch").val() || 0  }, function (data) {
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
                        ViewBills.BindCommodityDDL();
                    }, 500);

                }
                else {

                    //Reload_ddl_Global(null, "#ddlMeterSearch", "/AjaxCommon/GetUtilityMeterNumberDDL", { UtilityAccountID: null, CustomerID: $("#ddlCustomerSearch").val(), BuildingID: $("#ddlBuildingSearch").val(), CommodityID: null }, "Select", function () {
                    //    $("#ddlMeterSearch").val(selectedUtilityMeterID).select2();
                    //});

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
                        ViewBills.BindCommodityDDL();
                    }, 500);

                }
            } catch (e) {
                printError("ViewBill.js", 'OnSelectDDLMeterSearchNew', e);
            }

        }, function () { });
       
        //if ($("#ddlMeterSearch").val() == "" || $("#ddlMeterSearch").val() == null) {            
        //    Reload_ddl_Global(null, "#ddlMeterSearch", "/AjaxCommon/GetUtilityMeterNumberDDL", { UtilityAccountID: null, CustomerID: $("#ddlCustomerSearch").val(), BuildingID: $("#ddlBuildingSearch").val(), CommodityID: null }, "Select", function () {
        //        $("#ddlMeterSearch").val(selectedUtilityMeterID).select2();                
        //    });
        //}

        //setTimeout(function () {
        //    Reload_ddl_Global(null, "#ddlAccountSearch", "/AjaxCommon/GetAllUtilityAccountDDL", { CustomerID: $("#ddlCustomerSearch").val() || 0, BuildingID: selectedBuildingID || 0, UtilityMeterID: null }, "Select", function () {
        //        $("#ddlAccountSearch").val(selectedUtilityAccountID).select2();
        //    });
        //}, 100);

        //setTimeout(function () {
        //    Reload_ddl_Global(null, "#ddlBuildingSearch", "/AjaxCommon/GetBuildingDDL", { CustomerID: $("#ddlCustomerSearch").val(), UtilityAccountID: selectedUtilityAccountID || 0, UtilityMeterID: $("#ddlMeterSearch").val() || 0 }, "Select", function () {
        //        $("#ddlBuildingSearch").val(selectedBuildingID).select2();                
        //    });
        //}, 200);

        //setTimeout(function () {
        //    if ($("#ddlAccountSearch").val() != "" && $("#ddlAccountSearch").val() != null) {
        //        Reload_ddl_Global(null, "#ddlMeterSearch", "/AjaxCommon/GetUtilityMeterNumberDDL", { UtilityAccountID: $("#ddlAccountSearch").val(), CustomerID: $("#ddlCustomerSearch").val(), BuildingID: $("#ddlBuildingSearch").val(), CommodityID: null }, "Select", function () {
        //            //$("#ddlMeterSearch").select2();
        //            $("#ddlMeterSearch").val(selectedUtilityMeterID).select2();
        //            if (!IsNotNull($("#ddlMeterSearch").val())) {
        //                $("#ddlMeterSearch").val("").select2();
        //            }
        //        });
        //    }
        //}, 300);
        
    },

    ResetDropDowns: function () {
        selectedUtilityMeterID = null;
        selectedUtilityAccountID = null;
        selectedBuildingID = null;
        selectedCommdityID = null;

        $('.date-picker').datepicker({ autoclose: true, todayHighlight: true, format: 'mm/dd/yyyy', useCurrent: false, minDate: 0 });
        $("#txtFromDateSearch").val(CommonTodayDate.addDays(-30));
        $("#txtToDateSearch").val(CommonTodayDate.mmddyyyy());
        $("#txtFromDateSearch").datepicker("update", CommonTodayDate.addDays(-30));
        $("#txtToDateSearch").datepicker("update", CommonTodayDate.mmddyyyy());

        $("#ddlCustomerSearch").val(_CustomerID);       

        //Reload_ddl_Global(null, "#ddlMeterSearch", "/AjaxCommon/GetUtilityMeterNumberDDL", null, "Select", function () { $("#ddlMeterSearch").select2(); });
        //Reload_ddl_Global(null, "#ddlCustomerSearch", "/AjaxCommon/GetCustomerDDL", null, "Select", function () { $("#ddlCustomerSearch").select2(); });
        //Reload_ddl_Global(null, "#ddlCommoditySearch", "/AjaxCommon/GetCommodityDDL", null, "Select", function () { $("#ddlCommoditySearch").select2(); });
        Reload_ddl_Global_staticData(null, "#ddlStatus", "/AjaxCommon/GetStatusDDL", null, "Select", ddlStatus, function () { $("#ddlStatus").select2(); });
        $("#ddlStatus").val(1).trigger("change");
        Reload_ddl_Global_staticData(null, "#ddlColumnSelection", "/AjaxCommon/GetStatusDDL", null, "Select", ddlColumnSelection, function () { $("#ddlColumnSelection").select2(); });
        $("#ddlColumnSelection").val(1).trigger("change");


        //ViewBills.BindGrid($("#txtFromDateSearch").val(), $("#txtToDateSearch").val(), $("#ddlStatus").val());

        //$("#ddlAccountSearch").html("<option value=''>Select</option>");
        $("#ddlAccountSearch").val('').select2();
        //$("#ddlBuildingSearch").html("<option value=''>Select</option>");
        $("#ddlBuildingSearch").val('').select2();
        $("#ddlMeterSearch").val('').select2(); 
        $("#ddlCommoditySearch").val('').select2(); 

        ViewBills.BindBuildingDDLForSearch();
        ViewBills.BindCommodityDDL();

        $("#divIDViewBills").hide();
    },

    BindBuildingDDLForSearch: function () {

        $("#ddlAccountSearch option").remove();
        $("#ddlMeterSearch option").remove();
        Reload_ddl_Global(null, "#ddlAccountSearch", "/AjaxCommon/GetAllUtilityAccountDDL", { CustomerID: $("#ddlCustomerSearch").val() || 0, BuildingID: $("#ddlBuildingSearch").val() || 0, UtilityMeterID: $("#ddlMeterSearch").val() || 0 }, "Select", function () {
            //$("#ddlAccountSearch").select2();
            $("#ddlAccountSearch").val(selectedUtilityAccountID).select2();
            if (!IsNotNull($("#ddlAccountSearch").val())) {
                $("#ddlAccountSearch").val("").select2();
            }
        });
        Reload_ddl_Global(null, "#ddlMeterSearch", "/AjaxCommon/GetUtilityMeterNumberDDL", { UtilityAccountID: null, CustomerID: $("#ddlCustomerSearch").val(), BuildingID: null, CommodityID: null }, "Select", function () {
            //$("#ddlMeterSearch").select2();
            $("#ddlMeterSearch").val(selectedUtilityMeterID).select2();
            if (!IsNotNull($("#ddlMeterSearch").val())) {
                $("#ddlMeterSearch").val("").select2();
            }
        });

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

    },

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
            ViewBills.BindCommodityDDL();
        }, 500);        
    },

    BindMeterDDLForSearch: function () {
        selectedUtilityAccountID = $("#ddlAccountSearch").val();

        //if ($("#ddlAccountSearch").val() == "" || $("#ddlAccountSearch").val() == null) {            
        //    selectedUtilityMeterID = null;
        //    Reload_ddl_Global(null, "#ddlBuildingSearch", "/AjaxCommon/GetBuildingDDL", { CustomerID: $("#ddlCustomerSearch").val(), UtilityAccountID: $("#ddlAccountSearch").val() || 0, UtilityMeterID: selectedUtilityMeterID || 0 }, "Select", function () {
        //        //$("#ddlBuildingSearch").select2();
        //        $("#ddlBuildingSearch").val(selectedBuildingID).select2();
        //        if (!IsNotNull($("#ddlBuildingSearch").val())) {
        //            $("#ddlBuildingSearch").val("").select2();
        //            if ($("#ddlBuildingSearch option").length === 2) {
        //                $("#ddlBuildingSearch").val($("#ddlBuildingSearch option:eq(1)").val()).select2();
        //            }
        //        }
        //    });

        //    Reload_ddl_Global(null, "#ddlAccountSearch", "/AjaxCommon/GetAllUtilityAccountDDL", { CustomerID: $("#ddlCustomerSearch").val() || 0, BuildingID: selectedBuildingID || 0, UtilityMeterID: selectedUtilityMeterID || 0 }, "Select", function () {
        //        $("#ddlAccountSearch").val(selectedUtilityAccountID).select2();                
        //        if (!IsNotNull($("#ddlAccountSearch").val())) {
        //            $("#ddlAccountSearch").val("").select2();
        //        }
        //    });
        //}


        //Reload_ddl_Global(null, "#ddlMeterSearch", "/AjaxCommon/GetUtilityMeterNumberDDL", { UtilityAccountID: $("#ddlAccountSearch").val(), CustomerID: $("#ddlCustomerSearch").val(), BuildingID: selectedBuildingID, CommodityID: null }, "Select", function () {
        //    //$("#ddlMeterSearch").select2();
        //    //debugger;
        //    $("#ddlMeterSearch").val(selectedUtilityMeterID).select2();
        //    if (!IsNotNull($("#ddlMeterSearch").val())) {
        //        $("#ddlMeterSearch").val("").select2();
        //    }
        //    //else
        //    //{
        //    //    Reload_ddl_Global(null, "#ddlBuildingSearch", "/AjaxCommon/GetBuildingDDL", { CustomerID: $("#ddlCustomerSearch").val(), UtilityAccountID: $("#ddlAccountSearch").val() || 0, UtilityMeterID: $("#ddlMeterSearch").val() || 0 }, "Select", function () {
        //    //        //$("#ddlBuildingSearch").select2();
        //    //        $("#ddlBuildingSearch").val(selectedBuildingID).select2();
        //    //        if (!IsNotNull($("#ddlBuildingSearch").val())) {
        //    //            $("#ddlBuildingSearch").val("").select2();
        //    //            if ($("#ddlBuildingSearch option").length === 2) {
        //    //                $("#ddlBuildingSearch").val($("#ddlBuildingSearch option:eq(1)").val()).select2();
        //    //            }
        //    //        }
        //    //    });
        //    //}
        //});

        GetAjaxData("/ViewBills/GetBuildingByUtilityAccountID", { CustomerID: $("#ddlCustomerSearch").val() || 0, UtilityAccountID: $("#ddlAccountSearch").val() || 0 }, function (data) {
            var JsonData = data.data;
            try {
                if (IsNotNull(JsonData)) {
                    
                    selectedBuildingID = JsonData.buildingID;
                    selectedUtilityAccountID = JsonData.utilityAccountID;

                    Reload_ddl_Global(null, "#ddlBuildingSearch", "/AjaxCommon/GetBuildingDDL", { CustomerID: $("#ddlCustomerSearch").val(), UtilityAccountID: null, UtilityMeterID: null }, "Select", function () {
                        $("#ddlBuildingSearch").val(selectedBuildingID).select2();                        
                    });

                    Reload_ddl_Global(null, "#ddlMeterSearch", "/AjaxCommon/GetUtilityMeterNumberDDL", { UtilityAccountID: null , CustomerID: $("#ddlCustomerSearch").val(), BuildingID: selectedBuildingID, CommodityID: null }, "Select", function () {
                        $("#ddlMeterSearch").select2();
                    });

                    setTimeout(function () {
                        ViewBills.BindCommodityDDL();
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
                        ViewBills.BindCommodityDDL();
                    }, 500);

                }
            } catch (e) {
                printError("ViewBill.js", 'BindMeterDDLForSearch', e);
            }

        }, function () { });
    },

    CheckDateRange: function (control) {
        $(control).closest('div.input-daterange').find('input[name="startSearch"]').removeClass('is-invalid');
        $(control).closest('div.input-daterange').find('input[name="endSearch"]').removeClass('is-invalid');

        var fromDate = $(control).closest('div.input-daterange').find('input[name="startSearch"]').val();
        var toDate = $(control).closest('div.input-daterange').find('input[name="endSearch"]').val();

        if (IsNotNull(fromDate) && IsNotNull(toDate)) {
            if (new Date(fromDate).yyyyMMdd() > new Date(toDate).yyyyMMdd()) {
                showSweetAlert('Warning!', 'From date cannot be less than To date', 'warning', null);
                $(control).closest('div.input-daterange').find('input[name="end"]').addClass('is-invalid');
            }
        }
    },

    ShowApprovedStatus: function (ApprovedRemark, ApprovedDateCustome, ApprovedByUserName) {
        $("#ApproveShowRemarkModal").modal();
        $('#lblRemark').text(ApprovedRemark);
        $('#lblApprovedDate').text(ApprovedDateCustome);
        $('#lblApprovedBy').text(ApprovedByUserName);
    },

    SetForApprovedPopUpClose: function () {
        $("#ApproveShowRemarkModal").modal('hide');
        $('#lblRemark').text("");
        $('#lblApprovedDate').text("");
        $('#lblApprovedBy').text("");
        Clear_Form_Fields("#frm_ApproveRemark");
    },


    BindGrid: function (fromDate, toDate, statusID, columnSelectionID) {
        $('.loadercontainer').show();
        LoadGrid(null, "tblMeterApproval", "/ViewBills/GetData", { FromDate: fromDate, ToDate: toDate, StatusID: statusID, ColumnSelectionID: columnSelectionID }, function (data) {
            $("#divIDViewBills").show();
            $("#tblMeterApproval").show();
            if ($("#ddlStatus").val() == 1) {
                //$(".chkApproveColumn").hide();
                //$(".ApprovedStatus").show();
                $(".CancelRebillRemarkColumn").hide();
                $(".CancelRebillColumn").show();
            }
            else {
                //$(".chkApproveColumn").show();
                //$(".ApprovedStatus").hide();
                $(".CancelRebillRemarkColumn").show();
                $(".CancelRebillColumn").hide();
            }
            $('.loadercontainer').hide();


            /*
            SelectAll("tblGridHeaderSelect", "tblGridRowSelect");
            $('#tblMeterApproval').on('page.dt', function () {
                if ($('.tblGridRowSelect').prop('checked').length > 0) {
                    $('#chkGridMultipleSelect').prop('checked', false);
                    SelectAll("tblGridHeaderSelect", "tblGridRowSelect");
                }
                if (selectedMeterList.length !== 0) {
                    $("#btnApproved").attr("disabled", false);
                }
            });*/
        },
            function (data) {
                $('.loadercontainer').hide();
            });

    },

    SetForSearch: function () {

        //$("#btnApproved").attr("disabled", true);
        var sp = $("span[role=combobox]")
        $('#ddlStatus').parent().find(sp).css("border-color", "#E2E5EC");
        $('#ddlColumnSelection').parent().find(sp).css("border-color", "#E2E5EC");
        $('#ddlCustomerSearch').parent().find(sp).css("border-color", "#E2E5EC");

        var FormData = ViewBills.GetDataForSearch();
        if (ViewBills.ValidateDataSearch(FormData)) {
            $('.loadercontainer').show();
            //call bind function
            var formData = {
                FromDate: $("#txtFromDateSearch").val(),
                ToDate: $("#txtToDateSearch").val(),
                CustomerID: $("#ddlCustomerSearch").val(),
                BuildingID: $("#ddlBuildingSearch").val(),
                UtilityAccountID: $("#ddlAccountSearch").val(),
                MeterID: $("#ddlMeterSearch").val(),
                CommodityID: $("#ddlCommoditySearch").val(),
                StatusID: $("#ddlStatus").val(),
                ColumnSelectionID: $("#ddlColumnSelection").val()
            }
            LoadGrid(null, "tblMeterApproval", "/ViewBills/GetData", formData, function (data) {
                if (IsNotNull(data)) {
                    $('.loadercontainer').hide();
                    $("#divIDViewBills").show();

                    $("#tblMeterApproval").show();
                    if ($("#ddlStatus").val() == 1) {
                        //$(".chkApproveColumn").hide();
                        //$(".ApprovedStatus").show();
                        $(".CancelRebillRemarkColumn").hide();
                        $(".CancelRebillColumn").show();
                    }
                    else {
                        //$(".chkApproveColumn").show();
                        //$(".ApprovedStatus").hide();
                        $(".CancelRebillRemarkColumn").show();
                        $(".CancelRebillColumn").hide();
                    }
                    ViewBills.ScreenAccessPermission();
                }
                else {
                    $("#tblMeterApproval").hide();
                    $('.loadercontainer').hide();
                    showSweetAlert("No data found!", null, 'info', null);
                }

            });

            LoadGridWithoutPagination(null, "tblMeterApprovalExcel", "/ViewBills/GetData", formData, function (data) {
                if (IsNotNull(data)) {
                    $("#divExport").show();
                }
            });
        }
    },

    ValidateDataSearch: function (FormData) {
        var valid = true;
        valid = Validate_DDLControl_NullBlank("#ddlCustomerSearch", FormData.CustomerID, 'Required', valid);
        valid = Validate_DDLControl_NullBlank("#ddlStatus", FormData.StatusID, 'Required', valid);
        valid = Validate_DDLControl_NullBlank("#ddlColumnSelection", FormData.ColumnSelectionID, 'Required', valid);
        valid = Validate_Control_NullBlank("#txtFromDateSearch", FormData.FromDate, 'Required', valid);
        valid = Validate_Control_NullBlank("#txtToDateSearch", FormData.ToDate, 'Required', valid);
        //FocusOnError("#frm_AddMeterBill", valid);
        return valid;
    },

    GetDataForSearch: function () {
        var Data = {
            CustomerID: $("#ddlCustomerSearch").val(),
            FromDate: $("#txtFromDateSearch").val(),
            ToDate: $("#txtToDateSearch").val(),
            StatusID: $("#ddlStatus").val(),
            ColumnSelectionID: $("#ddlColumnSelection").val()
        };
        return Data;
    },

    /*
    ToggleApprovalButton: function () {
        var V = 0;
        $.each($(".tblGridRowSelect:checked"), function () {
            V++;
        });
    
        if (V > 0)
            $("#btnApproved").attr("disabled", false);
        else
            $("#btnApproved").attr("disabled", true);
    },
    
    MarkAllRowSelected: function () {
        debugger;
        ViewBills.ToggleApprovalButton();
        if ($('#chkGridMultipleSelect').prop('checked')) {
            $('#tblMeterApproval tbody tr').css('backgroundColor', '#EBF5FB');
            selectedMeterList = [];
    
            $("#tblMeterApproval tbody tr").each(function () {
                if ($(this).find('.tblGridRowSelect').prop('checked')) {
    
                    selectedMeterList.push({
                        "meterReadID": $(this).find('.MeterReadID').val(),
                        //"value": $(this).find('.MeterReadID').val()
                        "value": $(this).find('.utilityMeterNumber').text().trim() + "(Cost:" + $(this).find('.billTotalCost').text().trim() + ")"
                    });
                }
            });
        }
        else {
            $('#tblMeterApproval tr').css('backgroundColor', 'white');
            selectedMeterList = [];
        }
    },
    
    MarkRowSelected: function (control, meterReadID, utilityMeterNumber, billTotalCost) {
        debugger;
        var selectedMeterObject = {
            "meterReadID": meterReadID,
            "value": utilityMeterNumber + "(Cost:" + billTotalCost + ")"
        };
        var isAddOrRemove = 0;
        if (selectedMeterList.length === 0) {
            isAddOrRemove = 0;
        }
        else {
            if ($('#chkGridMultipleSelect').prop('checked') === false) {
                isAddOrRemove = 0;
            }
            else {
                isAddOrRemove = 1;
            }
        }
        ViewBills.ToggleApprovalButton();
        if ($(control).prop('checked')) {
            $(control).closest('tr').css('backgroundColor', '#EBF5FB');
            if (isAddOrRemove === 0) {
                selectedMeterList.push(selectedMeterObject);
            }
        }
        else {
            $(control).closest('tr').css('backgroundColor', 'white');
            selectedMeterList = selectedMeterList.filter((item) => item.meterReadID !== meterReadID);
        }
    },
    
    
    SetForApprove: function () {
    
        Reset_Form_Errors();
        ViewBills.ClearData();
        $("#ApproveModal").modal();
    
        $("#lblselectedMeterIds").text('');
        var selectedMeterIddiv = $("#lblselectedMeterIds");
    
        var strarray = [];
        var strarrayCommaSeprated;
        $.each(selectedMeterList, function (key, values) {
            strarray.push(values.value);
        });
    
        strarrayCommaSeprated = strarray.join(', ')
        selectedMeterIddiv.append(strarrayCommaSeprated);
    
    },
    
    GetData: function () {
        var MeterApproveModel = {};
        MeterApproveModel["Remark"] = $("#txtApproveRemark").val();
        var MeterBillApproveList = [];
    
        $("#tblMeterApproval tbody tr").each(function () {
            if ($(this).find('.tblGridRowSelect').prop('checked')) {
                MeterBillApproveList.push({
                    MeterReadID: $(this).find('.tblGridRowSelect').attr("data-id")
                });
            }
        });
    
        MeterApproveModel["MeterApprove_TableTypeList"] = MeterBillApproveList;
        return MeterApproveModel;
    },
    
    ValidateData: function (FormData) {
        var valid = true;
        return valid;
    },
    
    AddUpdate: function () {
        debugger;
        Reset_Form_Errors();
        var FormData = ViewBills.GetData();
        if (ViewBills.ValidateData(FormData)) {
            AddUpdateData("/ViewBills/MeterBillApprovalProcess", { Model: FormData }, function (data) {
                try {
                    var result = data.data;
                    if (result["status"] === true) {
                        if (data.status.toLowerCase() === 'success') {
                            showSweetAlert(data.status, data.message, 'success', null);
                            ViewBills.BindGrid($("#txtFromDateSearch").val(), $("#txtToDateSearch").val(), $("#ddlStatus").val());
                            ViewBills.ClearData();
                            ViewBills.SetForClose();
                            //$("#btnApproved").attr("disabled", true);
                        }
                    }
                    else {
                        showSweetAlert("Failed", result["message"], 'error', null);
                    }
                } catch (e) {
                    printError('ViewBills.js', 'AddUpdate', e);
                }
    
            }, function (responce_data) {
                showSweetAlert(responce_data.status, responce_data.message, 'error', null);
            });
        }
    },
    
    SetForClose: function () {
        $("#ApproveModal").modal('hide');
        ViewBills.ClearData();
        Clear_Form_Fields("#frm_AddApproveRemark");
        $("#hf_utilityAccountNo").val('');
        selectedMeterList = [];
    
        $("#hf_Cancel_MeterReadID").val('');
        $("#CancelModal").modal('hide');
        Clear_Form_Fields("#frm_AddCancelRemark");
    
    },
    ResetData: function () {
        var ID = $("#hf_utilityAccountNo").val();
        $(".has-error p").html("");
        $(".has-error").removeClass("has-error");
    },
    */


    GetMeterBillDownloadData: function () {

        GetAjaxData("/ViewBills/GetAllMeterBillDownload", { MeterReadID: null }, function (data) {
            try {
                if (IsNotNull(data)) {
                    //debugger;
                    if (data.status.toLowerCase() === 'success') {
                        setTimeout(function () {
                            //window.open("/MeterBillReport" + ".xlsm", "_Target");
                            window.open(window.location.origin + "/" + data.message, null);
                            //window.open(data.message, "_Target");
                            //window.open("../" + data.message, "_Target");
                        }, 500);
                    }
                }
            } catch (e) {
                printError("ViewBills.js", 'GetMeterBillDownloadData', e);
            }

        }, function () { });
    },

    ClearData: function () {
        ResetFormErrors("#frm_AddApproveRemark");
        Clear_Form_Fields("#frm_AddApproveRemark");
        $(".has-error p").html("").hide();
        $(".has-error").removeClass("has-error");
    },

    CloseAddBillForm: function () {
        $('#divAddForm').hide();
        $('#divGrid').show();
    },

    SetForAdd: function () {
        LoadAddUpdateView('#divAddForm', '/ViewBills/_PartialAddUpdate', null, function () {
            $('#divGrid').hide();
            $('#ddlCustomerAdd').prop("disabled", false);
            $('#ddlBuildingAdd').prop("disabled", false);
            $('#ddlUtilityAccountAdd').prop("disabled", false);
            $('#ddlMeterAdd').prop("disabled", false);
            $("#lblAddBillTitle").text("Add Bill");
            //$("#txtBillDate,#txtReadDate").datepicker({ autoclose: true, todayHighlight: true, format: 'mm/dd/yyyy', useCurrent: false });
            $('.date-picker').datepicker({ autoclose: true, todayHighlight: true, format: 'mm/dd/yyyy', useCurrent: false, minDate: 0 });

            Reload_ddl_Global(null, "#ddlCustomerAdd", "/AjaxCommon/GetCustomerDDL", null, "Select", function () { $("#ddlCustomerAdd").select2(); });
            //Reload_ddl_Global(null, "#ddlMeterAdd", "/AjaxCommon/GetUtilityMeterNumberDDL", null, "Select", function () { $("#ddlMeterAdd").select2(); });
            Reload_ddl_Global(null, "#ddlUOMAdd", "/AjaxCommon/GetUOMDDL", null, "Select", function () { $("#ddlUOMAdd").select2(); });
            Reload_ddl_Global(null, "#ddlUOMDistribution", "/AjaxCommon/GetUOMDDL", null, "Select", function () { $("#ddlUOMDistribution").select2(); });
            Reload_ddl_Global(null, "#ddlUOMSupply", "/AjaxCommon/GetUOMDDL", null, "Select", function () { $("#ddlUOMSupply").select2(); });

            AllowOnlyNumberValue("#txtReadBillDays");
            AllowOnlyNumberOrDecimalValue("#txtTotalCostSupply");
            AllowOnlyNumberOrDecimalValue("#txtTotalCostDist");
            AllowOnlyNumberOrDecimalValue("#txtTotalCost");
            AllowOnlyNumberOrDecimalValue("#txtBillVolume");
            AllowOnlyNumberValue("#txtUID");

            $('.date-picker').datepicker({ autoclose: true, todayHighlight: true, format: 'mm/dd/yyyy', useCurrent: false, minDate: 0 });
            $("#txtFromDate").val(CommonTodayDate.mmddyyyy());
            $("#txtBillDate").val(CommonTodayDate.mmddyyyy());
            $("#txtReadDate").val(CommonTodayDate.mmddyyyy());

            $("#txtFromDate").datepicker("update", CommonTodayDate.mmddyyyy());
            $("#txtBillDate").datepicker("update", CommonTodayDate.mmddyyyy());
            $("#txtReadDate").datepicker("update", CommonTodayDate.mmddyyyy());

            $("#txtTotalCostDist").val(0);
            $("#txtTotalCostSupply").val(0);
            $("#txtTotalCost").val(0);
            $("#txtBillVolume").val(0);
            PartialBill.ItemDistributionAutoCompleteTextbox();
            PartialBill.ItemSupplyAutoCompleteTextbox();

            AllowOnlyNumberOrDecimalValue("#txtRateDistribution");
            AllowOnlyNumberOrDecimalValue("#txtVolumeDistribution");
            AllowOnlyNumberOrDecimalValue("#txtCostDistribution");

            AllowOnlyNumberOrDecimalValue("#txtRateSupply");
            AllowOnlyNumberOrDecimalValue("#txtVolumeSupply");
            AllowOnlyNumberOrDecimalValue("#txtCostSupply");


        });
    },
    SetForUpdate: function (MeterReadID, MeterNumber) {
        LoadAddUpdateView('#divAddForm', '/ViewBills/_PartialAddUpdate', null, function () {
            $('#divGrid').hide();
            $('#ddlCustomerAdd').prop("disabled", true);
            $('#ddlBuildingAdd').prop("disabled", true);
            $('#ddlUtilityAccountAdd').prop("disabled", true);
            $('#ddlMeterAdd').prop("disabled", true);
            AllowOnlyNumberOrDecimalValue("#txtRateDistribution");
            AllowOnlyNumberOrDecimalValue("#txtVolumeDistribution");
            AllowOnlyNumberOrDecimalValue("#txtCostDistribution");

            AllowOnlyNumberOrDecimalValue("#txtRateSupply");
            AllowOnlyNumberOrDecimalValue("#txtVolumeSupply");
            AllowOnlyNumberOrDecimalValue("#txtCostSupply");

            PartialBill.ItemDistributionAutoCompleteTextbox();
            PartialBill.ItemSupplyAutoCompleteTextbox();

            $("#lblAddBillTitle").text("Edit Bill(" + MeterNumber + ")");
            $('.date-picker').datepicker({ autoclose: true, todayHighlight: true, format: 'mm/dd/yyyy', useCurrent: false, minDate: 0 });
            Reload_ddl_Global(null, "#ddlUOMAdd", "/AjaxCommon/GetUOMDDL", null, "Select", function () { $("#ddlUOMAdd").select2(); });
            Reload_ddl_Global(null, "#ddlUOMDistribution", "/AjaxCommon/GetUOMDDL", null, "Select", function () { $("#ddlUOMDistribution").select2(); });
            Reload_ddl_Global(null, "#ddlUOMSupply", "/AjaxCommon/GetUOMDDL", null, "Select", function () { $("#ddlUOMSupply").select2(); });

            PartialBill.GetDataByID(MeterReadID);

            //loadTableWithSearch("tblDistributionItems", responseFromServices);
            //loadTableWithSearch("tblSupplyItems", responseFromServices);

        });
    },

    ShowDetailedBill: function (MeterReadID, RecordGroupNo) {
        $("#DetailModal").modal();
        $("#hf_VD_RecordGroupNo").val("");
        $("#hf_VD_SupplierID").val("");
        $("#hf_VD_FromDateCustomMMddyyyy").val("");
        $("#hf_VD_ToDateCustomMMddyyyy").val("");
        $("#hf_VD_SupplyMeterReadStartDateCustome").val("");
        $("#hf_VD_SupplyMeterReadEndDateCustome").val("");
        $("#txtvalidFrom").val("");
        $("#txtvalidUntil").val("");
        ViewBills.GetDataByID(MeterReadID, RecordGroupNo);
        $("#divDistributionItem").hide();
        $("#divIDForAddButton").show();
        $("#divSupplyItem").hide();
        $("#divIDForSAddButton").show();
    },

    GetDataByID: function (meterReadID, RecordGroupNo) {
        IsSupplyItemExists = false;
        IsSupplyDetailExists = false;
        $("#hf_ViewDetail_MeterReadID").val("");
        $("#hf_ViewDetail_CommodityID").val("");
        GetAjaxData("/ViewBills/GetData", { MeterReadID: meterReadID }, function (data) {
            var JsonData = data.data;
            Reset_Form_Errors();
            //Clear_Form_Fields("#frm_AddMeterBill");
            //PartialBill.ClearData();

            try {
                if (IsNotNull(JsonData)) {
                    $("#lblCustomer").text(JsonData.customerCode);
                    $("#lblBuildingCode").text(JsonData.buildingCode);
                    $("#lblClient").text(JsonData.client);
                    //$("#lblUtility").text(JsonData.utilityCode);
                    $("#hrefUtilityURL").text(JsonData.utilityCode);
                    $("#hrefUtilityURL").attr("href", JsonData.utilityURL);
                    $("#hrefUtilityURL").attr("title", JsonData.utilityURL);

                    $("#lblUtilityAccountNo").text(JsonData.utilityAccountNo);
                    $("#lblUtilityCustomerNumber").text(JsonData.serviceIdentifier);
                    $("#lblUtilityMeterNumber").text(JsonData.utilityMeterNumber + ' (' + JsonData.commodityName + ')');
                    $("#lblCID").text(JsonData.cid);
                    //$("#lblSupplier").text(JsonData.supplierName);
                    $("#hrefSupplierURL").text(JsonData.supplierName);
                    $("#hrefSupplierURL").attr("href", JsonData.supplierURL);
                    $("#hrefSupplierURL").attr("title", JsonData.supplierURL);

                    $("#lblSupplierAcctNo").text(JsonData.supplierAccountNo);
                    $("#lblReadDate").text(JsonData.readDateCustome);
                    $("#lblBillDate").text(JsonData.billDateCustome);
                    if (IsNotNull(JsonData.fromDateCustome)) {
                        $("#lblStartAndEndDate").text(JsonData.fromDateCustome + '-' + JsonData.toDateCustome); // 
                    }
                    else {
                        $("#lblStartAndEndDate").text("");
                    }
                    if (IsNotNull(JsonData.supplyMeterReadStartDateCustome)) {
                        $("#lblSupplyStartAndEndDate").text(JsonData.supplyMeterReadStartDateCustome + '-' + JsonData.supplyMeterReadEndDateCustome); // 

                        $("#hf_VD_SupplyMeterReadStartDateCustome").val(JsonData.supplyMeterReadStartDateCustomMMddyyyy);
                        $("#hf_VD_SupplyMeterReadEndDateCustome").val(JsonData.supplyMeterReadEndDateCustomMMddyyyy);
                    }
                    else {
                        $("#lblSupplyStartAndEndDate").text("");
                    }
                    // && IsNotNull(JsonData.supplierName)
                    if (IsNotNull(JsonData.supplierAccountNo) && IsNotNull(JsonData.supplyMeterReadStartDateCustome)) {
                        IsSupplyDetailExists = true;
                        $("#txtvalidFrom").val(JsonData.fromDateCustome);
                        $("#txtvalidFrom").datepicker('update', JsonData.fromDateCustome);

                        $("#txtvalidUntil").val(JsonData.toDateCustome);
                        $("#txtvalidUntil").datepicker('update', JsonData.toDateCustome);
                    }
                    $("#hf_VD_SupplierID").val(JsonData.supplierID);
                    $("#hf_VD_RecordGroupNo").val(RecordGroupNo);
                    $("#hf_VD_FromDateCustomMMddyyyy").val(JsonData.fromDateCustomMMddyyyy);
                    $("#hf_VD_ToDateCustomMMddyyyy").val(JsonData.toDateCustomMMddyyyy);

                    $("#hf_ViewDetail_MeterReadID").val(meterReadID);
                    $("#hf_ViewDetail_CommodityID").val(JsonData.commodityID);

                    ViewBills.BindDistributionItemGrid(JsonData.meterReadID, JsonData.fromDateCustome, JsonData.toDateCustome);
                    ViewBills.BindSupplyItemGrid(JsonData.meterReadID, JsonData.supplyMeterReadStartDateCustome, JsonData.supplyMeterReadEndDateCustome);
                }
            } catch (e) {
                printError("ViewBills.js", 'GetDataByID', e);
            }

        }, function () { });
    },

    BindDistributionItemGrid: function (meterReadID, d_fromDate, d_EndDate) {
        //LoadGridWithoutPaginationWithSearch
        LoadGridWithoutPaginationWithSearch(null, "tblDistributionItems", "/ViewBills/GetBillItemData", { MeterReadID: meterReadID, IsSupply: false }, function (data) {
            //data.push(
            //    { itemName: "D_Start Date", valueField: d_fromDate },
            //    { itemName: "D_End Date", valueField: d_EndDate }
            //);

            // Commented on 5 Feb 2020
            //data.unshift({ itemName: "D_End Date", valueField: d_EndDate });
            //data.unshift({ itemName: "D_Start Date", valueField: d_fromDate });

            if ($("#ddlStatus").val() == 1) {
                $(".UpdateColumnDistribution").show();
            }
            else {
                $(".UpdateColumnDistribution").hide();
                $("#divIDForAddButton").hide();
            }

            $("#tblDistributionItems").show();
        });
    },

    BindSupplyItemGrid: function (meterReadID, s_fromDate, s_EndDate) {
        LoadGridWithoutPaginationWithSearch(null, "tblSupplyItems", "/ViewBills/GetBillItemData", { MeterReadID: meterReadID, IsSupply: true }, function (data) {
            // Commented on 5 Feb 2020
            //if (IsNotNull(s_fromDate)) {
            //    data.unshift({ itemName: "S_End Date", valueField: s_EndDate });
            //    data.unshift({ itemName: "S_Start Date", valueField: s_fromDate });
            //}
            if (data.length > 0) {
                IsSupplyItemExists = true;
            }

            if ($("#ddlStatus").val() == 1) {
                $(".UpdateColumnSupply").show();
            }
            else {
                $(".UpdateColumnSupply").hide();
                $("#divIDForSAddButton").hide();
            }
            $("#tblSupplyItems").show();
        });
    },

    CancelAndRebill: function (meterReadID, fromDateCustome, toDateCustome) {
        $('#hf_Cancel_MeterReadID').val(meterReadID);
        var MassageText = null;
        LoadGridCustomWithoutPagination(null, "tblBillForCancellation", "/ViewBills/GetDataForCancelBill", { MeterReadID: meterReadID }, function (data) {
            if (IsNotNull(data)) {
                $("#tblBillForCancellation").show();
                MassageText = "There are one or more bills after the current one From date : " + fromDateCustome + "-" + toDateCustome + ". They will be cancelled if you cancel this bill: Are you sure ?";
            }
            else {
                $("#tblBillForCancellation").hide();
                MassageText = "Are you sure ?";
            }
            $('#lblMessageTextForCancelBill').text(MassageText);
        });

        $("#CancelModal").modal();
    },

    ShowCancelConfirmationPopup: function (meterReadID, fromDateCustome, toDateCustome) {        $.confirm({            theme: 'modern',            title: 'Are you sure you wish to Cancel this bill?',            content: null,//'<b>' + 'Once submitted, you will not be able to edit the same. To make any changes, you may use the Cancel and Re-Bill functionality!' + '</b>',            animation: 'zoom',            closeAnimation: 'scale',            backgroundDismiss: false,            //autoClose: 'cancel|5000',            animationSpeed: '400',            icon: 'far fa-question-circle text-danger',            //closeIcon: true,            buttons: {                confirm: {                    text: 'Yes',                    btnClass: 'btn btn-sm btn-primary',                    action: function () {                        // function call                        ViewBills.CancelAndRebill(meterReadID, fromDateCustome, toDateCustome);                    },                },                cancel: {                    text: 'No',                    btnClass: 'btn btn-sm btn-default',                    action: function () {                        // function call                    }                }            },            onOpen: function () { }        });    },

    SetForClose: function () {
        $("#hf_Cancel_MeterReadID").val('');
        $("#CancelModal").modal('hide');
        Clear_Form_Fields("#frm_AddCancelRemark");
    },

    ResetData: function () {
        $(".has-error p").html("");
        $(".has-error").removeClass("has-error");
        $("txtCancelRemark").val("");
        $("lblMessageTextForCancelBill").text("");
    },

    GetData: function () {
        return {
            MeterReadID: $('#hf_Cancel_MeterReadID').val(),
            CancelledRemark: $("#txtCancelRemark").val()
        };
    },

    ValidateData: function (FormData) {
        var valid = true;
        valid = Validate_Control_NullBlank("#txtCancelRemark", FormData.CancelledRemark, 'Required', valid);
        return valid;
    },

    CancelAddUpdate: function () {
        //debugger;
        Reset_Form_Errors();
        var FormData = ViewBills.GetData();
        if (ViewBills.ValidateData(FormData)) {
            AddUpdateData("/ViewBills/MeterBillCancel", { Model: FormData }, function (data) {
                try {
                    var result = data.data;
                    if (result["status"] === true) {
                        if (data.status.toLowerCase() === 'success') {
                            showSweetAlert(data.status, data.message, 'success', null);
                            ViewBills.BindGrid($("#txtFromDateSearch").val(), $("#txtToDateSearch").val(), $("#ddlStatus").val(), $("#ddlColumnSelection").val());
                            ViewBills.ClearData();
                            ViewBills.SetForClose();
                        }
                    }
                    else {
                        showSweetAlert("Failed", result["message"], 'error', null);
                    }
                } catch (e) {
                    printError('ViewBills.js', 'AddUpdate', e);
                }

            }, function (responce_data) {
                showSweetAlert(responce_data.status, responce_data.message, 'error', null);
            });
        }
    },

    // ------------------- Distribution Item add / Edit
    clearUpdateDistributionItemControlData: function () {
        $("#ddlDItems").val("").select2();
        $("#txtDAtributeType").val("");
        $("#txtDText").val("");
        $("#txtDDate").val("");
        $("#txtDValue").val("");
    },

    SetForUpdateDistributionItem: function (MeterReadID, MeterReadDetailID, AtributeType, Valuetext, ValueNumeric, ValueDateCustom, ItemID, CommodityID) {
        let textbox = document.getElementById("divDistributionItem");
        //textbox.scrollIntoView();//.focus();
        //textbox.focus();
        SmoothScroll('#ddlDItems');
        $("#divIDForAddButton").hide();
        ViewBills.clearUpdateDistributionItemControlData();
        AllowOnlyNumberOrDecimalValue("#txtDValue");
        Reload_ddl_Global(null, "#ddlDItems", "/ViewBills/GetItemForBillAddEdit", {
            MeterReadID: MeterReadID, IsSupply: false, CommodityID: CommodityID, ForAdd: false
        }, "Select", function () {
            //debugger;
            $("#divDistributionItem").show();
            $("#ddlDItems").val(ItemID).select2();
            $("#txtDAtributeType").val(AtributeType);
            if (AtributeType == 'Text') {
                $("#txtDText").val(Valuetext);
                $("#divIDDate").hide();
                $("#divIDDText").show();
                $("#divIDValue").hide();
            }
            else if (AtributeType == 'Date') {
                $("#txtDDate").val(ValueDateCustom);
                $("#txtDDate").datepicker("setDate", ValueDateCustom);
                $("#txtDDate").datepicker("update", ValueDateCustom);
                $("#divIDDate").show();
                $("#divIDDText").hide();
                $("#divIDValue").hide();
            }
            else if (AtributeType == 'Numeric') {
                $("#txtDValue").val(ValueNumeric);
                $("#divIDDate").hide();
                $("#divIDDText").hide();
                $("#divIDValue").show();
            }
            $("#divDistributionItemSavebtn").show();
            $("#hf_DMeterReadID").val(MeterReadID);
            $("#hf_DMeterReadDetailID").val(MeterReadDetailID);

            $('#DetailModal').scrollTop($('#divDistributionItem').offset().top);
            //focus("#divDistributionItem");
            //$("#ddlDItems").focus();
        });

    },

    closeDistributionItemDiv: function () {
        Reset_Form_Errors();
        ViewBills.clearUpdateDistributionItemControlData();
        $("#divDistributionItem").hide();
        $("#divIDForAddButton").show();
        $("#divIDDate").hide();
        $("#divIDDText").hide();
        $("#divIDValue").hide();
    },

    ValidateDataDistributionItem: function (FormData) {
        var valid = true;
        /*validation for not null/Required*/
        valid = Validate_Control_NullBlank("#txtDAtributeType", FormData.AtributeType, 'Required', valid);
        if ($("#txtDAtributeType").val() == 'Text') {
            valid = Validate_Control_NullBlank("#txtDText", FormData.Valuetext, 'Required', valid);
        } else if ($("#txtDAtributeType").val() == 'Date') {
            valid = Validate_Control_NullBlank("#txtDDate", FormData.ValueDate, 'Required', valid);
        } else if ($("#txtDAtributeType").val() == 'Numeric') {
            valid = Validate_Control_NullBlank("#txtDValue", FormData.ValueNumeric, 'Required', valid);
        }
        return valid;
    },

    GetDataDistributionItem: function () {
        return {
            AtributeType: $("#txtDAtributeType").val(),
            MeterReadID: $("#hf_DMeterReadID").val(),
            MeterReadDetailID: $("#hf_DMeterReadDetailID").val(),
            Valuetext: $("#txtDText").val(),
            ValueDate: $("#txtDDate").val(),
            ValueNumeric: $("#txtDValue").val(),
            ItemID: $("#ddlDItems").val(),
            ItemName: $("#ddlDItems option:selected").text()
        };
    },

    AddUpdateDistributionItem: function () {
        //debugger;
        Reset_Form_Errors();
        var FormData = ViewBills.GetDataDistributionItem();
        if (ViewBills.ValidateDataDistributionItem(FormData)) {
            AddUpdateData("/ViewBills/AddUpdateDistributionItem", { Model: FormData }, function (data) {
                try {
                    var result = data.data;
                    if (result["status"] === true) {
                        if (data.status.toLowerCase() === 'success') {
                            showSweetAlert(data.status, data.message, 'success', null);
                            ViewBills.BindDistributionItemGrid(FormData.MeterReadID, null, null);
                            ViewBills.closeDistributionItemDiv();
                            ViewBills.SetForSearch();
                        }
                    }
                    else {
                        showSweetAlert("Failed", result["message"], 'error', null);
                    }

                } catch (e) {
                    printError('ViewBills.js', 'AddUpdate', e);
                }

            }, function (responce_data) {
                showSweetAlert(responce_data.status, responce_data.message, 'error', null);
            });
        }
    },

    SetForAddDistributionItem: function () {
        $("#divDistributionItemSavebtn").hide();
        ViewBills.clearUpdateDistributionItemControlData();
        $("#ddlDItems").attr("disabled", false);
        AllowOnlyNumberOrDecimalValue("#txtDValue");

        var meterReadID = $("#hf_ViewDetail_MeterReadID").val();
        var commodityID = $("#hf_ViewDetail_CommodityID").val();
        $("#hf_DMeterReadID").val(meterReadID);
        Reload_ddl_Global(null, "#ddlDItems", "/ViewBills/GetItemForBillAddEdit", {
            MeterReadID: meterReadID, IsSupply: false, CommodityID: commodityID, ForAdd: true
        }, "Select", function () {
            //debugger;
            $("#divDistributionItem").show();
            $("#divIDForAddButton").hide();
            $("#ddlDItems").select2();
            $("#hf_DMeterReadID").val(meterReadID);
            $("#hf_DMeterReadDetailID").val("");
        });
    },

    OnChangeGetItemDetails: function () {
        $("#divDistributionItemSavebtn").show();
        var ItemId = $("#ddlDItems").val();
        GetAjaxData("/ViewBills/GetItemData", { ItemId: ItemId }, function (data) {
            var JsonData = data.data;
            Reset_Form_Errors();
            //Clear_Form_Fields("#frm_AddItem");
            try {
                if (IsNotNull(JsonData)) {
                    var AtributeType = JsonData.atributeType;
                    $("#txtDAtributeType").val(AtributeType);
                    if (AtributeType == 'Text') {
                        $("#txtDText").val("");
                        $("#divIDDate").hide();
                        $("#divIDDText").show();
                        $("#divIDValue").hide();
                    }
                    else if (AtributeType == 'Date') {
                        $("#txtDDate").val("");
                        //$("#txtDDate").datepicker("setDate", ValueDateCustom);
                        //$("#txtDDate").datepicker("update", ValueDateCustom);
                        $("#divIDDate").show();
                        $("#divIDDText").hide();
                        $("#divIDValue").hide();
                    }
                    else if (AtributeType == 'Numeric') {
                        $("#txtDValue").val("");
                        $("#divIDDate").hide();
                        $("#divIDDText").hide();
                        $("#divIDValue").show();
                    }
                }
            } catch (e) {
                printError("Item.js", 'GetDataByID', e);
            }

        }, function () { });
    },

    // ------------------- Supply Item add / Edit

    clearSupplyItemControlData: function () {
        $("#ddlSItems").val("").select2();
        $("#txtSAtributeType").val("");
        $("#txtSText").val("");
        $("#txtSDate").val("");
        $("#txtSValue").val("");
    },

    SetForUpdateSupplyItem: function (MeterReadID, MeterReadDetailID, AtributeType, Valuetext, ValueNumeric, ValueDateCustom, ItemID, CommodityID) {
        let textbox = document.getElementById("divSupplyItem");
        textbox.scrollIntoView();//.focus();
        textbox.focus();
        $("#divIDForSAddButton").hide();
        ViewBills.clearSupplyItemControlData();
        AllowOnlyNumberOrDecimalValue("#txtSValue");
        Reload_ddl_Global(null, "#ddlSItems", "/ViewBills/GetItemForBillAddEdit", {
            MeterReadID: MeterReadID, IsSupply: true, CommodityID: CommodityID, ForAdd: false
        }, "Select", function () {
            //debugger;
            $("#divSupplyItem").show();
            $("#ddlSItems").val(ItemID).select2();
            $("#txtSAtributeType").val(AtributeType);
            if (AtributeType == 'Text') {
                $("#txtSText").val(Valuetext);
                $("#divIDSDate").hide();
                $("#divIDSText").show();
                $("#divIDSValue").hide();
            }
            else if (AtributeType == 'Date') {
                $("#txtSDate").val(ValueDateCustom);
                $("#txtSDate").datepicker("setDate", ValueDateCustom);
                $("#txtSDate").datepicker("update", ValueDateCustom);
                $("#divIDSDate").show();
                $("#divIDSText").hide();
                $("#divIDSValue").hide();
            }
            else if (AtributeType == 'Numeric') {
                $("#txtSValue").val(ValueNumeric);
                $("#divIDSDate").hide();
                $("#divIDSText").hide();
                $("#divIDSValue").show();
            }
            $("#divSupplyItemSavebtn").show();
            $("#hf_SMeterReadID").val(MeterReadID);
            $("#hf_SMeterReadDetailID").val(MeterReadDetailID);

            $('#DetailModal').scrollTop($('#divSupplyItem').offset().top);
        });
        //focus("#divSupplyItem");

    },

    closeSupplyItemDiv: function () {
        Reset_Form_Errors();
        ViewBills.clearSupplyItemControlData();
        $("#divSupplyItem").hide();
        $("#divIDForSAddButton").show();
        $("#divIDSDate").hide();
        $("#divIDSText").hide();
        $("#divIDSValue").hide();
    },

    ValidateDataSupplyItem: function (FormData) {
        var valid = true;
        /*validation for not null/Required*/
        valid = Validate_Control_NullBlank("#txtSAtributeType", FormData.AtributeType, 'Required', valid);
        if ($("#txtSAtributeType").val() == 'Text') {
            valid = Validate_Control_NullBlank("#txtSText", FormData.Valuetext, 'Required', valid);
        } else if ($("#txtSAtributeType").val() == 'Date') {
            valid = Validate_Control_NullBlank("#txtSDate", FormData.ValueDate, 'Required', valid);
        } else if ($("#txtSAtributeType").val() == 'Numeric') {
            valid = Validate_Control_NullBlank("#txtSValue", FormData.ValueNumeric, 'Required', valid);
        }
        return valid;
    },

    GetDataSupplyItem: function () {
        return {
            AtributeType: $("#txtSAtributeType").val(),
            MeterReadID: $("#hf_SMeterReadID").val(),
            MeterReadDetailID: $("#hf_SMeterReadDetailID").val(),
            Valuetext: $("#txtSText").val(),
            ValueDate: $("#txtSDate").val(),
            ValueNumeric: $("#txtSValue").val(),
            ItemID: $("#ddlSItems").val(),
            ItemName: $("#ddlSItems option:selected").text()
        };
    },

    AddUpdateSupplyItem: function () {
        //debugger;
        Reset_Form_Errors();
        var FormData = ViewBills.GetDataSupplyItem();
        if (ViewBills.ValidateDataSupplyItem(FormData)) {
            AddUpdateData("/ViewBills/AddUpdateDistributionItem", { Model: FormData }, function (data) {
                try {
                    var result = data.data;
                    if (result["status"] === true) {
                        if (data.status.toLowerCase() === 'success') {
                            showSweetAlert(data.status, data.message, 'success', null);
                            ViewBills.BindSupplyItemGrid(FormData.MeterReadID, null, null);
                            ViewBills.closeSupplyItemDiv();
                            ViewBills.SetForSearch();
                        }
                    }
                    else {
                        showSweetAlert("Failed", result["message"], 'error', null);
                    }

                } catch (e) {
                    printError('ViewBills.js', 'AddUpdate', e);
                }

            }, function (responce_data) {
                showSweetAlert(responce_data.status, responce_data.message, 'error', null);
            });
        }
    },

    CheckIsSupplierItemPresent: function () {

    },

    SetForAddSupplyItem: function () {

        // 1) Check: Supplier Item present or not
        // 2) Check: Supplier and Supplier account present or not

        if (IsSupplyDetailExists == true && IsSupplyItemExists == false) {
            $("#divSupplyItemSavebtn").hide();
            ViewBills.clearSupplyItemControlData();
            $("#ddlSItems").attr("disabled", false);
            AllowOnlyNumberOrDecimalValue("#txtSValue");

            var meterReadID = $("#hf_ViewDetail_MeterReadID").val();
            var commodityID = $("#hf_ViewDetail_CommodityID").val();
            $("#hf_SMeterReadID").val(meterReadID);
            Reload_ddl_Global(null, "#ddlSItems", "/ViewBills/GetItemForBillAddEdit", {
                MeterReadID: meterReadID, IsSupply: true, CommodityID: commodityID, ForAdd: true
            }, "Select", function () {
                //debugger;
                $("#divSupplyItem").show();
                $("#divIDForSAddButton").hide();
                $("#ddlSItems").select2();
                $("#hf_SMeterReadID").val(meterReadID);
                $("#hf_SMeterReadDetailID").val("");
            });
        }
        else if (IsSupplyDetailExists == true && IsSupplyItemExists == true) {
            $("#divSupplyItemSavebtn").hide();
            ViewBills.clearSupplyItemControlData();
            $("#ddlSItems").attr("disabled", false);
            AllowOnlyNumberOrDecimalValue("#txtSValue");

            var meterReadID = $("#hf_ViewDetail_MeterReadID").val();
            var commodityID = $("#hf_ViewDetail_CommodityID").val();
            $("#hf_SMeterReadID").val(meterReadID);
            Reload_ddl_Global(null, "#ddlSItems", "/ViewBills/GetItemForBillAddEdit", {
                MeterReadID: meterReadID, IsSupply: true, CommodityID: commodityID, ForAdd: true
            }, "Select", function () {
                //debugger;
                $("#divSupplyItem").show();
                $("#divIDForSAddButton").hide();
                $("#ddlSItems").select2();
                $("#hf_SMeterReadID").val(meterReadID);
                $("#hf_SMeterReadDetailID").val("");
            });
        }
        else {
            Reload_ddl_Global(null, "#ddlSupplierAdd", "/AjaxCommon/GetSupplierDDL", null, "Select", function () {
                $("#ddlSupplierAdd").select2();
            });
            ViewBills.ClearDataAddSupplier();
            $("#btnResetVD").show();
            isBillEditData = false;
            $("#lblSupplierDetailTitle").text("Supplier Detail");
            $("#divIDDistFromToDate").hide();
            $("#AddSupplierDetailModal").modal();

            //alert("Show Add supply details popup");
        }
    },

    CheckDateRangeAddSupplier: function (control) {
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

    /*Validate form data*/
    ValidateDataAddSupplier: function (FormData) {
        var valid = true;
        if (!isBillEditData) {
            valid = Validate_Control_NullBlank("#txtvalidFrom", FormData.SupplyMeterReadStartDate, 'Required', valid);
            valid = Validate_Control_NullBlank("#txtvalidUntil", FormData.SupplyMeterReadEndDate, 'Required', valid);
            valid = Validate_Control_NullBlank("#txtSupplierAccNoAdd", FormData.SupplierAccountNo, 'Required', valid);
            valid = Validate_DDLControl_NullBlank("#ddlSupplierAdd", FormData.SupplierID, 'Required', valid);
        } else {
            valid = Validate_Control_NullBlank("#txtvalidFromDist", FormData.FromDate, 'Required', valid);
            valid = Validate_Control_NullBlank("#txtvalidUntilDist", FormData.ToDate, 'Required', valid);
        }
        FocusOnError("#frm_AddSupplierDetail", valid);
        return valid;
    },

    GetDataAddSupplier: function () {
        return {
            MeterReadID: $("#hf_ViewDetail_MeterReadID").val(),
            SupplyMeterReadStartDate: $("#txtvalidFrom").val(),
            SupplyMeterReadEndDate: $("#txtvalidUntil").val(),
            SupplierAccountNo: $("#txtSupplierAccNoAdd").val(),
            SupplierID: $("#ddlSupplierAdd").val(),

            FromDate: $("#txtvalidFromDist").val(),
            ToDate: $("#txtvalidUntilDist").val(),
            IsBillEditData: isBillEditData,
        };
    },

    ValidateAndConfirmAddUpdateData: function () {
        Reset_Form_Errors();
        var FormData = ViewBills.GetDataAddSupplier();
        debugger;
        if (isBillEditData) {
            if ((IsNotNull(FormData.SupplierID) == false && IsNotNull(FormData.SupplierAccountNo) == false && IsNotNull(FormData.SupplyMeterReadStartDate) == false && IsNotNull(FormData.SupplyMeterReadEndDate) == false) && IsSupplyItemExists == false) {
                ViewBills.ShowConfirmationPopupForNullSupplyValues();
            }
            else if ((IsNotNull(FormData.SupplierID) == false && IsNotNull(FormData.SupplierAccountNo) == false && IsNotNull(FormData.SupplyMeterReadStartDate) == false && IsNotNull(FormData.SupplyMeterReadEndDate) == false) && IsSupplyItemExists == true) {
                ViewBills.ShowEmptyDataPopupForSupplyValues("Please fill supplier details");
            }
            else if (IsNotNull(FormData.SupplierID) == false || IsNotNull(FormData.SupplierAccountNo) == false || IsNotNull(FormData.SupplyMeterReadStartDate) == false || IsNotNull(FormData.SupplyMeterReadEndDate) == false) {
                ViewBills.ShowEmptyDataPopupForSupplyValues("Supplier details are empty");
            } else {
                ViewBills.AddUpdateSupplier();
            }
        }
        else {
            ViewBills.AddUpdateSupplier();
        }
    },

    AddUpdateSupplier: function () {
        Reset_Form_Errors();
        var FormData = ViewBills.GetDataAddSupplier();

        if (ViewBills.ValidateDataAddSupplier(FormData)) {
            AddUpdateData("/ViewBills/AddUpdateSupplier", { Model: FormData }, function (data) {
                try {
                    var result = data.data;
                    if (result["status"] === true) {
                        if (data.status.toLowerCase() === 'success') {
                            showSweetAlert(data.status, data.message, 'success', null);
                            ViewBills.GetDataByID($("#hf_ViewDetail_MeterReadID").val());
                            ViewBills.SetForCloseAddSupplier();
                        }
                    }
                    else {
                        showSweetAlert("Failed", result["message"], 'error', null);
                    }

                } catch (e) {
                    printError('State.js', 'AddUpdate', e);
                }

            }, function (responce_data) {
                showSweetAlert(responce_data.status, responce_data.message, 'error', null);
            });
        }
    },

    ResetDataAddSupplier: function () {
        $(".has-error p").html("");
        $(".has-error").removeClass("has-error");
        ViewBills.ClearDataAddSupplier();
    },

    ClearDataAddSupplier: function () {
        ResetFormErrors("#frm_AddSupplierDetail");
        Clear_Form_Fields("#frm_AddSupplierDetail");
        $(".has-error p").html("").hide();
        $(".has-error").removeClass("has-error");
        $("#ddlSupplierAdd").val("").trigger("change");
    },

    SetForCloseAddSupplier: function () {
        $("#AddSupplierDetailModal").modal('hide');
        ViewBills.ClearDataAddSupplier();
        Clear_Form_Fields("#frm_AddSupplierDetail");
    },

    OnChangeGetSItemDetails: function () {
        $("#divSupplyItemSavebtn").show();
        var ItemId = $("#ddlSItems").val();
        GetAjaxData("/ViewBills/GetItemData", { ItemId: ItemId }, function (data) {
            var JsonData = data.data;
            Reset_Form_Errors();
            //Clear_Form_Fields("#frm_AddItem");
            try {
                if (IsNotNull(JsonData)) {
                    var AtributeType = JsonData.atributeType;
                    $("#txtSAtributeType").val(AtributeType);
                    if (AtributeType == 'Text') {
                        $("#txtSText").val("");
                        $("#divIDSDate").hide();
                        $("#divIDSText").show();
                        $("#divIDSValue").hide();
                    }
                    else if (AtributeType == 'Date') {
                        $("#txtSDate").val("");
                        //$("#txtSDate").datepicker("setDate", ValueDateCustom);
                        //$("#txtSDate").datepicker("update", ValueDateCustom);
                        $("#divIDSDate").show();
                        $("#divIDSText").hide();
                        $("#divIDSValue").hide();
                    }
                    else if (AtributeType == 'Numeric') {
                        $("#txtSValue").val("");
                        $("#divIDSDate").hide();
                        $("#divIDSText").hide();
                        $("#divIDSValue").show();
                    }
                }
            } catch (e) {
                printError("Item.js", 'GetDataByID', e);
            }

        }, function () { });
    },

    // screen access code start    /
    ScreenAccessPermission: function () {
        var returnModal = {};
        var getAccess = GetScreenAccessPermissions(CurrentScreenID);

        if (IsNotNull(getAccess)) {
            for (var i = 1; i < getAccess.length; i++) {
                if (getAccess.length > 1) {
                    if ((getAccess[i].ActionCode == "BillDetails"))
                        flagBillDetails = true;

                    if ((getAccess[i].ActionCode == "CancelRebill"))
                        flagCancelRebill = true;
                }
            }


            if (!flagBillDetails) {
                $("#tblMeterApproval .BillDetails").hide().html("");
            }
            if (!flagCancelRebill) {
                $("#tblMeterApproval .CancelRebillColumn").hide().html("");
            }

        }

        return returnModal;
    },
    //  screen access code end  /

    SetForUpdateSupplierDetails: function () {
        ViewBills.ClearDataAddSupplier();
        isBillEditData = true;
        $("#btnResetVD").hide();
        $("#divIDDistFromToDate").show();

        $("#lblSupplierDetailTitle").text("Edit Bill Details");
        Reload_ddl_Global(null, "#ddlSupplierAdd", "/AjaxCommon/GetSupplierDDL", null, "Select", function () {
            $("#ddlSupplierAdd").val($("#hf_VD_SupplierID").val());
            if ($("#ddlSupplierAdd").val() == null) {
                $("#ddlSupplierAdd").val("").select2();
            }
        });
        $('.date-picker').datepicker({ autoclose: true, todayHighlight: true, format: 'mm/dd/yyyy', useCurrent: false, minDate: 0 });
        $("#txtSupplierAccNoAdd").val($("#lblSupplierAcctNo").text());
        $("#txtvalidFrom").val($("#hf_VD_SupplyMeterReadStartDateCustome").val());
        $('#txtvalidFrom').datepicker("update", $("#hf_VD_SupplyMeterReadStartDateCustome").val());
        $("#txtvalidUntil").val($("#hf_VD_SupplyMeterReadEndDateCustome").val());
        $('#txtvalidUntil').datepicker("update", $("#hf_VD_SupplyMeterReadEndDateCustome").val());


        $("#txtvalidFromDist").val($("#hf_VD_FromDateCustomMMddyyyy").val());
        $('#txtvalidFromDist').datepicker("update", $("#hf_VD_FromDateCustomMMddyyyy").val());
        $("#txtvalidUntilDist").val($("#hf_VD_ToDateCustomMMddyyyy").val());
        $('#txtvalidUntilDist').datepicker("update", $("#hf_VD_ToDateCustomMMddyyyy").val());

        $("#txtvalidFromDist").attr('disabled', true);


        // If Latest bill then edit To date of dist.
        if ($("#hf_VD_RecordGroupNo").val() == 1) {
            $("#txtvalidUntilDist").attr('disabled', false);
        } else {
            $("#txtvalidUntilDist").attr('disabled', true);
        }

        $("#AddSupplierDetailModal").modal();
    },

    CheckDateRangeAddDist: function (control) {

        $(control).closest('div.input-daterange').find('input[name="startDist"]').removeClass('is-invalid');
        $(control).closest('div.input-daterange').find('input[name="endDist"]').removeClass('is-invalid');

        var fromDate = $(control).closest('div.input-daterange').find('input[name="startDist"]').val();
        var toDate = $(control).closest('div.input-daterange').find('input[name="endDist"]').val();

        if (IsNotNull(fromDate) && IsNotNull(toDate)) {
            if (new Date(fromDate).yyyyMMdd() >= new Date(toDate).yyyyMMdd()) {
                showSweetAlert('Warning!', 'Valid from date cannot be less than Valid until date', 'warning', null);
                $(control).closest('div.input-daterange').find('input[name="endDist"]').addClass('is-invalid');
            }
        }
    },

    ShowConfirmationPopupForNullSupplyValues: function () {        $.confirm({            theme: 'modern',            title: 'Supplier details are empty! Do you want to save data?',            content: null,            animation: 'zoom',            closeAnimation: 'scale',            backgroundDismiss: false,            //autoClose: 'cancel|5000',            animationSpeed: '400',            icon: 'far fa-question-circle text-danger',            //closeIcon: true,            buttons: {                confirm: {                    text: 'Yes',                    btnClass: 'btn btn-sm btn-primary',                    action: function () {                        // function call                        ViewBills.AddUpdateSupplier();                    },                },                cancel: {                    text: 'No',                    btnClass: 'btn btn-sm btn-default',                    action: function () {                        // function call                    }                }            },            onOpen: function () { }        });    },

    ShowEmptyDataPopupForSupplyValues: function (message) {        $.confirm({            theme: 'modern',            title: message,            content: null,            animation: 'zoom',            closeAnimation: 'scale',            backgroundDismiss: false,            //autoClose: 'cancel|5000',            animationSpeed: '400',            icon: 'far fa-question-circle text-danger',            //closeIcon: true,            buttons: {                confirm: {                    text: 'Ok',                    btnClass: 'btn btn-sm btn-primary',                    action: function () {                        // function call                    },                },            },            onOpen: function () { }        });    },

    // 08 July 2020 FTP bill Download code
    ShowBillDownloadPopUp: function (ftpPath, cid) {
        //alert("meterReadID : " + meterReadID);
        $("#lblDownloadBillPaths").text(cid);
        $("#lblDownloadBillMessage").text('');
        ViewBills.GetBillListFromFTP(ftpPath);
        $("#DownloadBillsModal").modal();
    },

    GetBillListFromFTP: function (ftpPath) {
        //$("#ulFileShow").html('');
        $("#tblFTPBillList").html("");
        //$('.loadercontainer').show();
        GetAjaxData("/ViewBills/GetBillListFromFTP", { FTPPath: ftpPath }, function (data) {
            try {
                //debugger;
                //$('.loadercontainer').hide();
                if (IsNotNull(data)) {
                    if (data.status.toLowerCase() === 'success') {
                        var result = data.data;
                        $.each(result, function (i, item) {
                            //let ulData = '<li title="Download" style="cursor:pointer; margin: 3px; color: blue;" FTPPathWithFileName="' + item.ftpPathWithFileName + '" FileName="' + item.fileName + '"  onclick="ViewBills.DownloadBillFromFTP(this)" data-fileName = "' + item.fileName + '">' + item.fileName + '</li>';
                            //$("#ulFileShow").append(ulData);

                            let tblData = '<tr>' +
                                '<td class="pr-0">' +
                                '<div class="symbol symbol-50 symbol-light mt-1"><span class="symbol-label"></span></div>' +
                                '</td>' +
                                '<td class="pl-0">' +
                                '<a href="javascript:;" class="text-dark-75 font-weight-bolder text-hover-primary mb-1 font-size-lg" FTPPathWithFileName="' + item.ftpPathWithFileName + '" FileName="' + item.fileName + '"  onclick="ViewBills.DownloadBillFromFTP(this)">' + item.fileName + '</a>' +
                                '</td>' +
                                '<td>' +
                                '<div style="cursor:pointer;" title="Download" FTPPathWithFileName="' + item.ftpPathWithFileName + '" FileName="' + item.fileName + '"  onclick="ViewBills.DownloadBillFromFTP(this)"><i class="fa fa-download" aria-hidden="true"></i></div>' +
                                '</td>' +
                                '</tr >';
                            $("#tblFTPBillList").append(tblData);


                        });
                    }
                    else {
                        $("#lblDownloadBillMessage").text('File not found, Please check with administrator.');
                    }
                }
                else {
                    $("#lblDownloadBillMessage").text('File not found, Please check with administrator.');
                }
            } catch (e) {
                //debugger;
                printError("ViewBills.js", 'GetBillListFromFTP', e);
            }

        }, function (data) {
            $("#lblDownloadBillMessage").text('File not found, Please check with administrator.');
        });
    },

    DownloadBillFromFTP: function (evnt) {
        //$('.loadercontainer').show();
        var FTPPathWithFileName = $(evnt).attr("FTPPathWithFileName");
        var FileName = $(evnt).attr("FileName");
        GetAjaxData("/ViewBills/DownloadBillFromFTP", { FTPPathWithFileName: FTPPathWithFileName, FileName: FileName }, function (data) {
            try {
                //$('.loadercontainer').hide();
                if (IsNotNull(data)) {
                    //debugger;
                    if (data.status.toLowerCase() === 'success') {
                        //$("#DownloadBillsModal").modal('hide');
                        setTimeout(function () {
                            window.open(window.location.origin + "/" + data.message, null);
                        }, 500);
                        toastr.success("Bill file has been downloaded successfully.");
                    }
                }
            } catch (e) {
                printError("ViewBills.js", 'DownloadBillFromFTP', e);
            }

        }, function () { });
    },
}



