
var queryStringData = null;
var isRedirect = false;
var selectedUtilityAccountID = null;
var selectedUtilityID = null;
var selectedBuildingID = null;

$(document).ready(function () {
    //UtilityAccount.BindGrid();
    isRedirect = false;
    $("#ddlAccountSearch").html("<option value=''>All</option>");
    $("#ddlAccountSearch").val('').select2();

    $("#ddlBuildingSearch").html("<option value=''>All</option>");
    $("#ddlBuildingSearch").val('').select2();



    Reload_ddl_Global(null, "#ddlCustomerSearch", "/AjaxCommon/GetCustomerDDL", null, "Select", function () {
        $("#ddlCustomerSearch").select2();
        if ($("#ddlCustomerSearch option").length > 1) {            
            $("#ddlCustomerSearch").val(_CustomerID).select2();
            UtilityAccount.BindBuildingDDLForSearch();
            UtilityAccount.BindUtilityBuildingAccountWise();
            UtilityAccount.QueryStringBindUtilityAccount();
            if (!isRedirect) {
                UtilityAccount.SetForSearch();
            }
        }
    });

    var ddlActiveOrDeactiveStatus = [
        { "value": "01", "text": "Active" },
        { "value": "02", "text": "Deactive" },

    ];
    Reload_ddl_Global_staticData(null, "#ddlActiveOrDeactiveStatusSearch", "/AjaxCommon/GetStateDDL", null, "All", ddlActiveOrDeactiveStatus, function () { $("#ddlActiveOrDeactiveStatusSearch").select2(); });

    $('#tblUtilityAccount').on('draw.dt', function () {
        UtilityAccount.ScreenAccessPermission();
    });
});

var flagViewHistory = false;
var flagAdditionalAccessDeactive = false;
var flagAccUtilityMeter = false;

var UtilityAccount = {

    QueryStringBindUtilityAccount: function () {
        queryStringData = getQueryStringParams();
        if (queryStringData != null) {
            var CustomerID = queryStringData["CustomerID"];
            var BuildingID = queryStringData["BuildingID"];

            if (IsNotNull(CustomerID) && IsNotNull(BuildingID)) {
                isRedirect = true;
                Reload_ddl_Global(null, "#ddlCustomerSearch", "/AjaxCommon/GetCustomerDDL", null, "Select", function () {
                    $("#ddlCustomerSearch").val(CustomerID).select2();
                    setTimeout(function () {
                        Reload_ddl_Global(null, "#ddlBuildingSearch", "/AjaxCommon/GetBuildingDDL", { CustomerID: CustomerID }, "All", function (data) {
                            $("#ddlBuildingSearch").val(BuildingID).select2();
                            setTimeout(function () {
                                Reload_ddl_Global(null, "#ddlAccountSearch", "/AjaxCommon/GetAllUtilityAccountDDL", { CustomerID: CustomerID, BuildingID: BuildingID, UtilityID: $("#ddlUtilitySearch").val() || 0 }, "All", function (data) {
                                    $("#ddlAccountSearch").select2();
                                    setTimeout(function () {
                                        UtilityAccount.SetForSearch();
                                    }, 100);
                                });
                            }, 500);
                        });
                    }, 200);
                });
            }
        }
    },

    ResetDropDowns: function () {
        selectedUtilityAccountID = null;
        selectedUtilityID = null;
        selectedBuildingID = null;

        //Reload_ddl_Global(null, "#ddlCustomerSearch", "/AjaxCommon/GetCustomerDDL", null, "All", function () { $("#ddlCustomerSearch").select2(); });
        //Reload_ddl_Global(null, "#ddlUtilitySearch", "/AjaxCommon/GetUtilityDDL", null, "All", function () { $("#ddlUtilitySearch").select2(); });

        Reload_ddl_Global(null, "#ddlUtilitySearch", "/AjaxCommon/GetUtilityBuildingAccountWise", { CustomerID: $("#ddlCustomerSearch").val() }, "All", function () {
            $("#ddlUtilitySearch").select2();
        });

        Reload_ddl_Global(null, "#ddlBuildingSearch", "/AjaxCommon/GetBuildingDDL", { CustomerID: $("#ddlCustomerSearch").val() }, "All", function () {
            $("#ddlBuildingSearch").select2();
        });

        Reload_ddl_Global(null, "#ddlAccountSearch", "/AjaxCommon/GetAllUtilityAccountDDL", { CustomerID: $("#ddlCustomerSearch").val() }, "All", function (data) {            
            $("#ddlAccountSearch").val("").select2();
        });

        UtilityAccount.SetForSearch();

        $("#ddlUtilitySearch").val('').select2();

        //$("#ddlBuildingSearch").html("<option value=''>All</option>");
        $("#ddlBuildingSearch").val('').select2();

        //$("#ddlAccountSearch").html("<option value=''>All</option>");
        $("#ddlAccountSearch").val('').select2();        
        $("#divIDViewUtilityAccount").hide();
    },

    SetForSearch: function () {
        var FormData = UtilityAccount.GetDataForSearch();
        if (UtilityAccount.ValidateDataSearch(FormData)) {
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
            LoadGrid(null, "tblUtilityAccount", "/UtilityAccount/GetData",
                {
                    CustomerID: $("#ddlCustomerSearch").val(),
                    BuildingID: $("#ddlBuildingSearch").val(),
                    UtilityAccountNumber: UtilityAccNo,
                    UtilityID: $("#ddlUtilitySearch").val(),
                }, function (data) {
                    var Model = data;
                    $("#divIDViewUtilityAccount").show();
                    if (IsNotNull(Model)) {
                        UtilityAccount.ScreenAccessPermission();
                        $.each(Model, function (index, item) {
                            $("#chk" + item.utilityAccountID).prop("checked", item.active);
                        });
                    }

                    $('#tblUtilityAccount').on('draw.dt', function () {
                        $.each(Model, function (index, item) {
                            $("#chk" + item.utilityAccountID).prop("checked", item.active);
                        });
                        UtilityAccount.ScreenAccessPermission();
                    });

                });
        }
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

    xhr_getData_For_Delete: null,

    BindGrid: function () {
        var UtilityAccNo = null;
        if ($("#ddlAccountSearch option:selected").index() == 0) {
            UtilityAccNo = null;
        }
        else {
            UtilityAccNo = $("#ddlAccountSearch option:selected").text();
        }

        LoadGrid(null, "tblUtilityAccount", "/UtilityAccount/GetData",
            {
                CustomerID: $("#ddlCustomerSearch").val(),
                BuildingID: $("#ddlBuildingSearch").val(),
                UtilityAccountNumber: UtilityAccNo,
                UtilityID: $("#ddlUtilitySearch").val()
            },
            function (data) {
                $("#divIDViewUtilityAccount").show();
                UtilityAccount.ScreenAccessPermission();
                var Model = data;
                $.each(Model, function (index, item) {
                    $("#chk" + item.utilityAccountID).prop("checked", item.active);
                });

                $('#tblUtilityAccount').on('draw.dt', function () {
                    $.each(Model, function (index, item) {
                        $("#chk" + item.utilityAccountID).prop("checked", item.active);
                    });
                });
            });
    },

    SetForAdd: function () {
        Reset_Form_Errors();
        UtilityAccount.ClearData();
        $("#hf_IsUpdateUtilityAcount").val(false);
        $("#lblUtilityAccountTitle").text("Add Utility Account");
        $("#AddUtilityAccountModal").modal();
        $("#ddlCustomer").prop("disabled", true);
        Reload_ddl_Global(null, "#ddlCustomer", "/AjaxCommon/GetCustomerDDL", null, "Select", function () {
            $("#ddlCustomer").select2();
            if ($("#ddlCustomer option").length > 1) {
                //$("#ddlCustomer").val($("#ddlCustomer option:eq(1)").val()).select2();
                $("#ddlCustomer").val(_CustomerID).select2();
                UtilityAccount.BindBuildingDDLForAdd();
            }
        });
        Reload_ddl_Global(null, "#ddlAddUtility", "/AjaxCommon/GetAllUtilityDDL", null, "Select", function () { $("#ddlAddUtility").select2(); });
        UtilityAccount.BindCommodityGrid(null);
    },

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
    //    debugger;
    //    selectedUtilityID = $("#ddlUtilitySearch").val();
    //    selectedBuildingID = $("#ddlBuildingSearch").val();
    //    if (!IsNotNull($("#ddlBuildingSearch").val())) {
    //        Reload_ddl_Global(null, "#ddlUtilitySearch", "/AjaxCommon/GetUtilityDDL", null, "Select", function () {
    //            $("#ddlUtilitySearch").val(selectedUtilityID).select2();
    //            if ($("#ddlUtilitySearch").val() == null) {
    //                $("#ddlUtilitySearch").val("").select2();
    //            }
    //        });
    //    }

    //    Reload_ddl_Global(null, "#ddlAccountSearch", "/AjaxCommon/GetAllUtilityAccountDDL", { CustomerID: $("#ddlCustomerSearch").val() || 0, BuildingID: $("#ddlBuildingSearch").val() || 0, UtilityID: selectedUtilityID || 0 }, "All", function (data) {
    //        $("#ddlAccountSearch").val(selectedUtilityAccountID).select2();
    //        if ($("#ddlAccountSearch").val() == null) {
    //            $("#ddlAccountSearch").val("").select2();
    //        }
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
            UtilityAccount.BindUtilityBuildingAccountWise();

        }

        //if (IsNotNull(selectedUtilityID)) {
        //    Reload_ddl_Global(null, "#ddlUtilitySearch", "/AjaxCommon/GetUtilityBuildingAccountWise", { CustomerID: $("#ddlCustomerSearch").val() || 0, BuildingID: $("#ddlBuildingSearch").val() || 0 }, "All", function (data) {
        //        $("#ddlUtilitySearch").val(selectedUtilityID).select2();
        //        if ($("#ddlBuildingSearch").val() == null) {
        //            $("#ddlUtilitySearch").val("").select2();
        //        }
        //    });
        //}
        else {
            UtilityAccount.BindUtilityBuildingAccountWise();

            Reload_ddl_Global(null, "#ddlAccountSearch", "/AjaxCommon/GetAllUtilityAccountDDL", { CustomerID: $("#ddlCustomerSearch").val() || 0, BuildingID: $("#ddlBuildingSearch").val() || 0, UtilityID: null }, "All", function (data) {
                //$("#ddlAccountSearch").val(selectedUtilityAccountID).select2();
                if ($("#ddlAccountSearch").val() == null) {
                    $("#ddlAccountSearch").val("").select2();
                }
            });
        }


    },

    BindBuildingAccountDDLForSearch: function () {
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
            UtilityAccount.BindUtilityAccountBuildingWise();
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

    //OnSelectionDDLAccountSearch: function () {

    //    selectedUtilityID = $("#ddlUtilitySearch").val();
    //    selectedUtilityAccountID = $("#ddlAccountSearch").val();
    //    selectedBuildingID = $("#ddlBuildingSearch").val();
    //    if (!IsNotNull(selectedUtilityAccountID) || selectedUtilityAccountID == 0) {
    //        Reload_ddl_Global(null, "#ddlUtilitySearch", "/AjaxCommon/GetUtilityBuildingAccountWise", { CustomerID: $("#ddlCustomerSearch").val() || 0, BuildingID: $("#ddlBuildingSearch").val() || 0 }, "All", function () {
    //                $("#ddlUtilitySearch").select2();

    //        });

    //        Reload_ddl_Global(null, "#ddlAccountSearch", "/AjaxCommon/GetAllUtilityAccountDDL", { CustomerID: $("#ddlCustomerSearch").val() || 0, BuildingID: $("#ddlBuildingSearch").val() || 0, UtilityID: $("#ddlUtilitySearch").val() || 0 }, "All", function (data) {

    //            if ($("#ddlAccountSearch").val() == null) {
    //                $("#ddlAccountSearch").val("").select2();
    //            }
    //        });

    //    }
    //    else {
    //        Reload_ddl_Global(null, "#ddlUtilitySearch", "/AjaxCommon/GetUtilityDDL", { UtilityAccountID: selectedUtilityAccountID }, "All", function () {
    //                $("#ddlUtilitySearch").val(selectedUtilityID).select2();
    //                if (!IsNotNull($("#ddlUtilitySearch").val())) {
    //                    $("#ddlUtilitySearch").val("").select2();
    //                    if ($("#ddlUtilitySearch option").length === 2) {
    //                        $("#ddlUtilitySearch").val($("#ddlUtilitySearch option:eq(1)").val()).select2();

    //                    }
    //                }
    //            });
    //    }

    //    Reload_ddl_Global(null, "#ddlBuildingSearch", "/AjaxCommon/GetBuildingDDL", { CustomerID: $("#ddlCustomerSearch").val(), UtilityAccountID: selectedUtilityAccountID || 0 }, "All", function (data) {
    //            $("#ddlBuildingSearch").val(selectedBuildingID).select2();
    //            if (!IsNotNull($("#ddlBuildingSearch").val())) {
    //                $("#ddlBuildingSearch").val("").select2();
    //                if ($("#ddlBuildingSearch option").length === 2) {
    //                    $("#ddlBuildingSearch").val($("#ddlBuildingSearch option:eq(1)").val()).select2();
    //                }
    //            }
    //        });
    //},


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
                        //$("#ddlUtilitySearch").val(selectedUtilityID).select2(); 
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
            }
            catch (e) {
                printError("UtilityAccount.js", 'OnSelectDDLMeterSearch', e);
            }
        }, function () { });
    },

    BindBuildingDDLForAdd: function () {
        if ($("#ddlCustomer option:selected").index() > 0) {
            Reload_ddl_Global(null, "#ddlBuilding", "/AjaxCommon/GetBuildingDDL", { CustomerID: $("#ddlCustomer").val() }, "Select", function () { $("#ddlBuilding").select2(); });
        }
    },

    GetDataByID: function (utilityAccountID) {
        GetAjaxData("/UtilityAccount/GetData", { UtilityAccountID: utilityAccountID }, function (data) {
            var JsonData = data.data;
            Reset_Form_Errors();
            Clear_Form_Fields("#frm_AddUtilityAccount");
            UtilityAccount.ClearData();            
            try {
                if (IsNotNull(JsonData)) {

                    $("#hf_UtilityAccountID").val(JsonData.utilityAccountID);


                    /* For Binding Customer DDL */
                    Reload_ddl_Global(null, "#ddlCustomer", "/AjaxCommon/GetCustomerDDL", null, "Select", function () {
                        $("#ddlCustomer").val(JsonData.customerID);
                        $("#ddlCustomer").select2();

                        /* For Binding Building DDL */
                        Reload_ddl_Global(null, "#ddlBuilding", "/AjaxCommon/GetBuildingDDL", { CustomerID: JsonData.customerID }, "Select", function () {
                            $("#ddlBuilding").val(JsonData.buildingID);
                            $("#ddlBuilding").select2();

                        });


                        $("#txtUtilityAccountNumber").val(JsonData.utilityAccountNumber);
                        $("#ddlAddUtility").val(JsonData.utilityID);
                        $("#ddlAddUtility").select2();
                        $("#chkbCombinedBilling").prop('checked', JsonData.isCombinedBilling);
                    });

                    if (JsonData.isUpdateUtilityAcount) {
                        $("#hf_IsUpdateUtilityAcount").val(true);
                        $("#ddlCustomer").attr('disabled', false);
                        $("#ddlBuilding").attr('disabled', false);
                        $("#ddlAddUtility").attr('disabled', false);
                        $("#txtUtilityAccountNumber").attr('disabled', false);
                    }
                    else {
                        $("#hf_IsUpdateUtilityAcount").val(false);
                        $("#ddlCustomer").attr('disabled', true);
                        $("#ddlBuilding").attr('disabled', true);
                        $("#ddlAddUtility").attr('disabled', true);
                        $("#txtUtilityAccountNumber").attr('disabled', true);
                    }

                    UtilityAccount.BindCommodityGrid(utilityAccountID);

                }
            } catch (e) {
                printError("UtilityAccount.js", 'GetDataByID', e);
            }

        }, function () { });
    },

    SetForUpdate: function (utilityAccountID, UtilityAccountDescription) {
        $("#lblUtilityAccountTitle").text("Edit Utility Account(" + UtilityAccountDescription + ")");

        Reload_ddl_Global(null, "#ddlCustomer", "/AjaxCommon/GetCustomerDDL", null, "Select", function () { $("#ddlCustomer").select2(); });
        Reload_ddl_Global(null, "#ddlAddUtility", "/AjaxCommon/GetAllUtilityDDL", null, "Select", function () { $("#ddlAddUtility").select2(); });

        UtilityAccount.GetDataByID(utilityAccountID);
        $("#AddUtilityAccountModal").modal();
    },

    SetForClose: function () {
        $("#AddUtilityAccountModal").modal('hide');
        UtilityAccount.ClearData();
        Clear_Form_Fields("#frm_AddUtilityAccount");
        $("#hf_UtilityAccountID").val('');
        $("#hf_IsUpdateUtilityAcount").val('');

    },

    AddUpdate: function () {
        Reset_Form_Errors();
        var FormData = UtilityAccount.GetData();
        if (UtilityAccount.ValidateData(FormData)) {
            AddUpdateData("/UtilityAccount/AddUpdate", { Model: FormData }, function (data) {
                try {
                    var result = data.data;
                    if (result["status"] === true) {
                        if (data.status.toLowerCase() === 'success') {
                            showSweetAlert(data.status, data.message, 'success', null);
                            UtilityAccount.BindGrid();
                            UtilityAccount.ClearData();
                            UtilityAccount.SetForClose();
                        }
                    }
                    else {
                        showSweetAlert("Failed", result["message"], 'error', null);
                    }
                } catch (e) {
                    printError('UtilityAccount.js', 'AddUpdate', e);
                }

            }, function (responce_data) {
                showSweetAlert(responce_data.status, responce_data.message, 'error', null);
            });
        }
    },

    Delete: function (_id, ItemInfo) {
        DeleteData(UtilityAccount.xhr_getData_For_Delete, "/UtilityAccount/Delete", { UtilityAccountID: _id, CurrentScreenID: CurrentScreenID }, ItemInfo, function () {
            UtilityAccount.BindGrid();
            UtilityAccount.ClearData();
            UtilityAccount.SetForClose();
        });
    },

    ResetData: function () {
        var ID = $("#hf_UtilityAccountID").val();

        $(".has-error p").html("");
        $(".has-error").removeClass("has-error");

        if (ID == "" || ID == null || ID == 0 || ID == undefined)
            UtilityAccount.ClearData();
        else
            UtilityAccount.GetDataByID(ID);
    },

    /*Validate form data*/
    ValidateData: function (FormData) {
        var valid = true;
        /*validation for not null/Required*/
        valid = Validate_DDLControl_NullBlank("#ddlCustomer", FormData.CustomerID, 'Required', valid);
        valid = Validate_DDLControl_NullBlank("#ddlBuilding", FormData.BuildingID, 'Required', valid);
        valid = Validate_DDLControl_NullBlank("#ddlAddUtility", FormData.UtilityID, 'Required', valid);
        valid = Validate_Control_NullBlank("#txtUtilityAccountNumber", FormData.UtilityAccountNumber, 'Required', valid);

        FocusOnError("#frm_AddUtilityAccount", valid);
        return valid;
    },

    GetData: function () {
        var UtilityAccountData = {};

        UtilityAccountData["IsUpdateUtilityAcount"] = $("#hf_IsUpdateUtilityAcount").val();
        UtilityAccountData["UtilityAccountID"] = $("#hf_UtilityAccountID").val();
        UtilityAccountData["CustomerID"] = $("#ddlCustomer").val();
        UtilityAccountData["BuildingID"] = $("#ddlBuilding").val();
        UtilityAccountData["UtilityID"] = $("#ddlAddUtility").val();
        UtilityAccountData["UtilityAccountNumber"] = $("#txtUtilityAccountNumber").val();
        UtilityAccountData["IsCombinedBilling"] = $("#chkbCombinedBilling").prop('checked');

        var CommodityList = [];

        $("#tblCommodity tbody tr").each(function () {
            var CommodityID = $(this).attr("data-commodityID");

            if ($(this).find('input:radio:checked').prop('checked') && IsNotNull($(this).find('input[name="startDate"]').val())) {
                CommodityList.push({
                    UtilityAccountCommodityID: $("#hf_UtilityAccountCommodityID" + CommodityID).val(),
                    CommodityID: CommodityID,
                    EffectiveFromDate: new Date($(this).find('input[name="startDate"]').val()).ddMMMyyyy(),
                    UtilityID: $("#rdbLDC" + CommodityID).prop('checked') ? $("#ddlAddUtility").val() : null,
                    SupplierID: $("#rdbSupplier" + CommodityID).prop('checked') ? $("#ddlSupplier" + CommodityID).val() : null
                });
            }
        });

        UtilityAccountData["UtilityAccountCommodity_TableTypeList"] = CommodityList;
        return UtilityAccountData;
    },

    ClearData: function () {
        ResetFormErrors("#frm_AddUtilityAccount");
        Clear_Form_Fields("#frm_AddUtilityAccount");
        $(".has-error p").html("").hide();
        $(".has-error").removeClass("has-error");
        $("#txtUtilityAccountNumber").removeAttr('disabled');
        //$("#ddlCustomer").val("").trigger("change");
        //$("#ddlBuilding").html("<option value=''>Select</option>");
        //$("#ddlBuilding").val('').select2();
        $("#ddlBuilding").val("").trigger("change");
        $("#ddlAddUtility").val("").trigger("change");
        $('input:radio:checked').prop('checked', false);
        $("#chkbCombinedBilling").prop('checked', false);

        //$("#ddlCustomer").removeAttr('disabled');
        $("#ddlBuilding").removeAttr('disabled');
        $("#ddlAddUtility").removeAttr('disabled');

        $("#ddlSupplier1").parent().find('span').hide();
        $("#ddlSupplier4").parent().find('span').hide();
        $("#ddlSupplier6").parent().find('span').hide();
        $("#ddlSupplier7").parent().find('span').hide();
        $("#ddlSupplier5").parent().find('span').hide();
    },

    GoToUtilityAccount: function (customerCode, buildingCode, utilityAccountUID) {
        window.location.href = "/UtilityMeterNumber/Index?customerCode=" + customerCode + "&buildingCode=" + buildingCode + "&utilityAccountUID=" + utilityAccountUID;
    },

    ShowResetPopup: function (utilityAccountID) {
        //if ($('#chk' + customerCode).prop('checked')) {
        let confirmationMessage = "";
        var currentChkStatus = $('#chk' + utilityAccountID).prop('checked') || false;
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
                        $('#chk' + utilityAccountID).prop('checked', !currentChkStatus);
                    }
                },
                confirm: {
                    text: 'Yes',
                    btnClass: 'btn btn-sm btn-warning',
                    action: function () {
                        $('#chk' + utilityAccountID).prop('checked', currentChkStatus);

                        AddUpdateData("/UtilityAccount/ActiveDeactiveUtilityAccount", { UtilityAccountID: utilityAccountID, Active: currentChkStatus }, function (data) {
                            try {
                                var result = data.data;
                                if (result["status"] === true) {
                                    if (data.status.toLowerCase() === 'success') {
                                        showSweetAlert(data.status, data.message, 'success', null);
                                        UtilityAccount.BindGrid();
                                    }
                                }
                                else {
                                    showSweetAlert("Failed", result["message"], 'error', null);
                                }

                            } catch (e) {
                                printError('UtilityAccount.js', 'AddUpdateData', e);
                            }
                        }, null);

                    },
                }
            },
            onOpen: function () {
            },
        });
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


    ShowDivUtilityAccountCommodity: function (commodityID, commodityName, btnchange, utilityAccountCommodityID) {
        $('#UtilityAccountCommodityModal').modal('show');

        $("#hf_UtilityAccountCommodityIDEdit").val(utilityAccountCommodityID);
        $("#hf_CommodityIDEdit").val(commodityID);
        $('.date-picker').datepicker({ autoclose: true, todayHighlight: true, format: 'mm/dd/yyyy', useCurrent: false });
        UtilityAccount.SetUtilityAccountCommodity(commodityID, commodityName, btnchange);
        $("#txtStartDateEdit").prop('disabled', true);
    },

    SetForCloseDivUtilityAccountCommodity: function () {
        ResetFormErrors("#frm_UtilityAccountCommodity");
        Clear_Form_Fields("#frm_UtilityAccountCommodity");
        $(".has-error p").html("").hide();
        $(".has-error").removeClass("has-error");
        $('#UtilityAccountCommodityModal').modal('hide');
        $("#hf_UtilityAccountCommodityIDEdit").val("");
        $("#hf_CommodityIDEdit").val("");
    },

    SetUtilityAccountCommodity: function (commodityID, commodityName, btnchange) {
        $("#lblUtilityAccountCommodityTitle").text("Commodity Name (" + commodityName + ")");
        $("#lblCommodityNameEdit").text(commodityName);

        Reload_ddl_Global(null, "#ddlSupplierEdit", "/AjaxCommon/GetSupplierDDL", null, "Select", function () {
            var supplierIDEdit = $('#ddlSupplier' + commodityID).val();
            $('#ddlSupplierEdit').val(supplierIDEdit).select2();

            if ($("#rdbLDC" + commodityID).prop('checked')) {
                $("#rdbLDCEdit").prop('checked', true);
                $("#ddlSupplierEdit").parent().find('.select2-container').hide();
            }
            else {
                $("#rdbSupplierEdit").prop('checked', true); $('#ddlSupplierEdit').val(supplierIDEdit).select2();
                $("#ddlSupplierEdit").parent().find('.select2-container').show();
            }

            var fromDateEdit = $(btnchange).closest('tr').find('input[name="startDate"]').val();
            $("#txtStartDateEdit").datepicker("setStartDate", fromDateEdit);
            $("#txtStartDateEdit").val(fromDateEdit);
            $("#txtStartDateEdit").datepicker("update", fromDateEdit);

            localStorage['supplierID'] = supplierIDEdit;
            localStorage['rdbLDC'] = $("#rdbLDC" + commodityID).prop('checked');
            localStorage['rdbSupplier'] = $("#rdbSupplier" + commodityID).prop('checked');
            localStorage['fromDate'] = fromDateEdit;



        });

    },

    isChanged: false,

    LDCRadioButtonOnChangeEdit: function (CommodityID) {
        $("#ddlSupplierEdit").val("").select2();
        $("#ddlSupplierEdit").parent().find('.select2-container').hide();
        //UtilityAccount.isChanged = true;
        //UtilityAccount.checkForChanged();

        if (eval(localStorage.getItem('rdbLDC')) == $("#rdbLDCEdit").prop('checked')) {
            $("#txtStartDateEdit").prop('disabled', true);
            $("#txtStartDateEdit").val(localStorage.getItem('fromDate'));
            $("#txtStartDateEdit").datepicker("update", localStorage.getItem('fromDate'));
        }
        else {
            $("#txtStartDateEdit").prop('disabled', false);
        }

    },

    SupplierRadioButtonOnChangeEdit: function () {
        $("#ddlSupplierEdit").val("").select2();
        $("#ddlSupplierEdit").parent().find('.select2-container').show();
        //localStorage['sagar'] = 'sagar';
        if (eval(localStorage.getItem('supplierID')) == $("#ddlSupplierEdit").val() && eval(localStorage.getItem('rdbSupplier')) == $("#rdbSupplierEdit").prop('checked')) {
            $("#txtStartDateEdit").prop('disabled', true);
            $("#txtStartDateEdit").val(localStorage.getItem('fromDate'));
            $("#txtStartDateEdit").datepicker("update", localStorage.getItem('fromDate'));
        }
        else {
            $("#txtStartDateEdit").prop('disabled', false);
        }
    },

    OnChangeSupplierEditDDL: function () {
        if (eval(localStorage.getItem('supplierID')) == $("#ddlSupplierEdit").val() && eval(localStorage.getItem('rdbSupplier')) == $("#rdbSupplierEdit").prop('checked')) {
            $("#txtStartDateEdit").prop('disabled', true);
            $("#txtStartDateEdit").val(localStorage.getItem('fromDate'));
            $("#txtStartDateEdit").datepicker("update", localStorage.getItem('fromDate'));
        }
        else {
            $("#txtStartDateEdit").prop('disabled', false);
        }
    },

    //checkForChanged: function () {
    //    $("#txtStartDateEdit").prop('disabled', !eval(UtilityAccount.isChanged));
    //},

    ValidateDataEdit: function () {
        var valid = true;

        if ($("#rdbLDCEdit").prop('checked')) {
            valid = true;
        }

        if ($("#rdbSupplierEdit").prop('checked')) {
            valid = Validate_DDLControl_NullBlank("#ddlSupplierEdit", $("#ddlSupplierEdit").val(), 'Required', valid);
        }

        valid = Validate_Control_NullBlank("#txtStartDateEdit", $("#txtStartDateEdit").val(), 'Required', valid);
        return valid;
    },

    GetDataForEdit: function () {
        var UtilityAccountDataEdit = {};
        UtilityAccountDataEdit["IsUpdateUtilityAcount"] = $("#hf_IsUpdateUtilityAcount").val();
        UtilityAccountDataEdit["UtilityAccountID"] = $("#hf_UtilityAccountID").val();
        UtilityAccountDataEdit["CustomerID"] = $("#ddlCustomer").val();
        UtilityAccountDataEdit["BuildingID"] = $("#ddlBuilding").val();
        UtilityAccountDataEdit["UtilityID"] = $("#ddlAddUtility").val();
        UtilityAccountDataEdit["UtilityAccountNumber"] = $("#txtUtilityAccountNumber").val();
        UtilityAccountDataEdit["IsCombinedBilling"] = $("#chkbCombinedBilling").prop('checked');
        var CommodityListEdit = [];

        var CommodityIDEdit = $("#hf_CommodityIDEdit").val();

        if (($("#rdbLDCEdit").prop('checked') || $("#rdbSupplierEdit").prop('checked')) && IsNotNull($('#txtStartDateEdit').val())) {
            CommodityListEdit.push({
                UtilityAccountCommodityID: $("#hf_UtilityAccountCommodityIDEdit").val(),
                CommodityID: CommodityIDEdit,
                EffectiveFromDate: $('#txtStartDateEdit').val(),
                UtilityID: $("#rdbLDCEdit").prop('checked') ? $("#ddlAddUtility").val() : null,
                SupplierID: $("#rdbSupplierEdit").prop('checked') ? $("#ddlSupplierEdit").val() : null
            });
        }
        UtilityAccountDataEdit["UtilityAccountCommodity_TableTypeList"] = CommodityListEdit;
        return UtilityAccountDataEdit;
    },

    UpdateUtilityAccountCommodity: function () {
        var FormDataEdit = UtilityAccount.GetDataForEdit();
        if (UtilityAccount.ValidateDataEdit()) {
            AddUpdateData("/UtilityAccount/UpdateUtilityAccountCommodity", { Model: FormDataEdit }, function (data) {
                try {
                    var result = data.data;
                    if (result["status"] === true) {
                        if (data.status.toLowerCase() === 'success') {
                            showSweetAlert(data.status, data.message, 'success', function () {
                                //UtilityAccount.ClearData();
                                //UtilityAccount.SetForClose();
                                UtilityAccount.SetForCloseDivUtilityAccountCommodity();
                                UtilityAccount.SetForUpdate(FormDataEdit.UtilityAccountID, FormDataEdit.UtilityAccountNumber);
                            });
                        }
                    }
                    else {
                        showSweetAlert("Failed", result["message"], 'error', null);
                    }
                } catch (e) {
                    printError('UtilityAccount.js', 'AddUpdate', e);
                }

            }, function (responce_data) {
                showSweetAlert(responce_data.status, responce_data.message, 'error', null);
            });
        }


    },

    ViewHistoryOfUtilityAccountCommodity: function (utilityAccountID, utilityAccountNumber) {
        $("#lblVHUtilityAccountTitle").text("View History of Utility Account Changes(" + utilityAccountNumber + ")");
        LoadGridWithoutPagination(null, "tblCommodityVH", "/UtilityAccount/GetUtilityAccountCommodityViewHistory", { UtilityAccountID: utilityAccountID }, function (data) {

            UtilityAccount.mergerKey();
            /*
            let group = data.reduce((r, a) => {
                console.log("a", a);
                console.log('r', r);
                r[a.commodityName] = [...r[a.commodityName] || [], a];
                return r;
            }, {});
            console.log("group", group);
            var html = '';
            $.each(group, function (index, item) {
                html +='<tbody><tr>'
                $.each(item, function (index1, item1) {
                    html += '<td>' + item1 + '</td>';
                });
                html += '</tr></tbody>';
            });
            */


        });
        $("#VHUtilityAccountModal").modal();
    },

    //merge cells in key column
    mergerKey: function () {

        // prevents the same attribute is used more than once Ip
        var idA = [];

        // finds all cells id column Key
        $('#tblCommodityVH tbody td[data-id^="key"]').each(function () {

            var id = $(this).attr('data-id');

            // prevents the same attribute is used more than once IIp
            if ($.inArray(id, idA) == -1) {
                idA.push(id);

                // finds all cells that have the same data-id attribute
                var $td = $('td[data-id="' + id + '"]');

                //counts the number of cells with the same data-id
                var count = $td.length;
                if (count > 1) {

                    //If there is more than one
                    //then merging                                
                    $td.not(":eq(0)").remove();
                    $td.attr('rowspan', count);
                }
            }
        })
    },

    /*  screen access code start    */
    ScreenAccessPermission: function () {
        var returnModal = {};
        var getAccess = GetScreenAccessPermissions(CurrentScreenID);
        //console.log("getAccess " + JSON.stringify(getAccess[0].HasDelete));
        if (!getAccess[0].HasInsert) {
            $("#divAdd").addClass("hide").html("");
        }

        if (!getAccess[0].HasDelete) {
            //console.log("HasDelete " + getAccess[0].HasDelete);
            $(".DeleteColumn").hide().html("");
        }
        if (!getAccess[0].HasUpdate) {
            //console.log("HasUpdate " + getAccess[0].HasUpdate);
            $(".UpdateColumn").hide().html("");
        }
        if (getAccess[0].HasExport) {
            //console.log("HasExport " + getAccess[0].HasExport);
            $("#divExport").show();
        }

        for (var i = 1; i < getAccess.length; i++) {
            if (getAccess.length > 1) {
                if ((getAccess[i].ActionCode == "ViewHistory")) {
                    flagViewHistory = true;
                }

                if ((getAccess[i].ActionCode == "AccessDeactive")) {
                    flagAdditionalAccessDeactive = true;
                }

                if ((getAccess[i].ActionCode == "AccUtilityMtr")) {
                    flagAccUtilityMeter = true;
                }

                if ((getAccess[i].ActionCode == "AddUtilityMtr")) {
                    flagAddUtilityMtr = true;
                }
            }
        }

        if (!flagViewHistory) {
            $("#tblUtilityAccount .ViewHistoryColumn").hide().html("");
        }

        if (!flagAdditionalAccessDeactive) {
            $("#tblUtilityAccount .AdditionalAccessDeactive").hide().html("");
        }

        if (!flagAccUtilityMeter) {
            $("#tblUtilityAccount .AdditionalAccessUtilityMeter").hide().html("");
        }

        if (!flagAddUtilityMtr) {
            $("#tblUtilityAccount .AddUtilityMeter").hide().html("");
        }


        return returnModal;
    },
    /*  screen access code end  */


    GoToUtilityMeter: function (customerID, buildingID, utilityID, utilityAccountID) {
        if (IsNotNull(customerID) && IsNotNull(buildingID) && IsNotNull(utilityID) && IsNotNull(utilityAccountID)) {
            var encryptedScreenID = $("#hf_UtilityMeter").val();
            window.location.href = "/UtilityMeter/Index/" + encryptedScreenID + "?CustomerID=" + customerID + "&BuildingID=" + buildingID + "&UtilityID=" + utilityID + "&UtilityAccountID=" + utilityAccountID;
        }
    },

    BindUtilityBuildingAccountWise: function () {

        Reload_ddl_Global(null, "#ddlUtilitySearch", "/AjaxCommon/GetUtilityBuildingAccountWise", { CustomerID: $("#ddlCustomerSearch").val() || 0, BuildingID: $("#ddlBuildingSearch").val() || 0 }, "All", function (data) {
            $("#ddlUtilitySearch").select2();
        });

    },
}