/// <reference path="../js/common.js" />
var selectedMeterList = [];
var expanded = false;

var ddlStatus = [
    { "value": "1", "text": "Approved" },
    { "value": "2", "text": "Cancelled" }
];

var ddlColumnSelection = [
    { "value": "1", "text": "Bill Date" },
    { "value": "2", "text": "Entry Date" }
];

var selectedUtilityMeterID = null;
var selectedUtilityAccountID = null;
var selectedBuildingID = null;
var selectedCommodityID = null;

$(document).ready(function () {
    $("#divColANDGrid, #divExport").hide();
    $("#tblMeterApproval").hide();
    $('.date-picker').datepicker({ autoclose: true, todayHighlight: true, format: 'M-yyyy', viewMode: "months", minViewMode: "months" });
    $("#txtFromDateSearch").val(CommonTodayDate.addDays(-30));
    $("#txtToDateSearch").val(CommonTodayDate.mmddyyyy());
    $("#txtFromDateSearch").datepicker("update", CommonTodayDate.addDays(-30));
    $("#txtToDateSearch").datepicker("update", CommonTodayDate.mmddyyyy());
    $("#txtFromDateSearch").datepicker("setEndDate", CommonTodayDate.addDays(-30));

    $("#ddlAccountSearch").html("<option value=''>All</option>");
    $("#ddlAccountSearch").val('').select2();

    //$("#ddlBuildingSearch").html("<option value=''></option>");
    //$("#ddlBuildingSearch").val('').select2();

    $("#ddlStateSearch").html("<option value=''>All</option>");
    $("#ddlStateSearch").val('').select2();

    $("#ddlUtilitySearch").html("<option value=''>All</option>");
    $("#ddlUtilitySearch").val('').select2();

    Reload_ddl_Global(null, "#ddlMeterSearch", "/AjaxCommon/GetUtilityMeterNumberDDL", null, "All", function () { $("#ddlMeterSearch").select2(); });
    Reload_ddl_Global(null, "#ddlCustomerSearch", "/AjaxCommon/GetCustomerDDL", null, "Select", function () {
        $("#ddlCustomerSearch").select2();
        if ($("#ddlCustomerSearch option").length > 1) {
            //$("#ddlCustomerSearch").val($("#ddlCustomerSearch option:eq(1)").val()).select2();
            $("#ddlCustomerSearch").val(_CustomerID).select2();
            GenericReport.BindCommodityDDL();
            GenericReport.BindBuildingDDLForSearch();
        }
    });
    Reload_ddl_Global(null, "#ddlCommoditySearch", "/AjaxCommon/GetCommodityDDL", null, "Select", function () { $("#ddlCommoditySearch").select2(); });
    //Reload_ddl_Global_staticData(null, "#ddlStatus", "/AjaxCommon/GetStatusDDL", null, "Select", ddlStatus, function () { $("#ddlStatus").select2(); });
    //Reload_ddl_Global(null, "#ddlColoumn", "/GenericReport/GetColoumnDDL", null, "Select", function () { $("#ddlColoumn").select2(); });
    //$("#ddlStatus").val(1).trigger("change");
    Reload_ddl_Global_staticData(null, "#ddlColumnSelection", "/AjaxCommon/GetStatusDDL", null, "Select", ddlColumnSelection, function () { $("#ddlColumnSelection").select2(); });
    $("#ddlColumnSelection").val(1).trigger("change");
    GenericReport.showCheckboxes();
    //GenericReport.getColumnNames();
    debugger
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
    //$("#tabGraph").hide();
    //$("#tab1").click(function () {
    //    $(window).bind("scroll", function () { });
    //    GenericReport.BindGrid();
    //});

    //$("#tab2").click(function () {
    //    GenericReport.BindGraph(true);
    //});
});

var GenericReport = {

    //get Database column 
    getColumnNames: function () {
        selectedCommodityID = $("#ddlCommoditySearch").val();
        Reload_ddl_Global(null, "#ddlMeterSearch", "/AjaxCommon/GetUtilityMeterNumberDDLForChart", { UtilityAccountIDs: null, CustomerID: $("#ddlCustomerSearch").val(), BuildingIDs: $("#ddlBuildingSearch").val().join(','), CommodityIDs: selectedCommodityID }, "All", function () {
            $("#ddlMeterSearch").val(selectedUtilityMeterID);
            if ($("#ddlMeterSearch").val() == null) {
                $("#ddlMeterSearch").val("").select2();
            }
        });

        $("#divColANDGrid").show();
        $("#divMeterBillExcelUploadDataGR").hide();
        GetAjaxData("/GenericReport/GetColoumnNames", { CommodityID: $("#ddlCommoditySearch").val() }, function (data) {
            try {
                if (IsNotNull(data)) {
                    let Data = data.data;
                    if (Data !== null) {
                        $("#menuItems").html('');
                        var names = [];
                        let contents = [];
                        contents.push('<label class="dropdown-item" style="padding-left: 5px;  width: max-content;"  value="Select All"><input onclick="GenericReport.SelectAllChk(this);" id="chkAll" type="checkbox"  name="ColName" value="Select All"  checked> Select All</input> </label>')
                        $.each(Data, function (Findex, Fitem) {
                            let colid = Fitem.columnName.replace(/[^a-z0-9\s]/gi, '').replace(/[_\s]/g, '');
                            contents.push('<label class="dropdown-item" style="padding-left: 5px;  width: max-content;" id="chk' + colid.trim() + '" value="' + Fitem.columnName + '"><input type="checkbox" onclick="GenericReport.SelectChk(this)" class="drop" name="ColName" value="' + Fitem.columnName + '"  checked>' + " " + Fitem.columnName + '</input> </label>')
                            names.push(Fitem.columnName);
                        });
                        //Find the input search box
                        let search = document.getElementById("searchCoin");

                        //Find every item inside the dropdown
                        let items = document.getElementsByClassName("drop");
                        function buildDropDown(values) {
                            $('#menuItems').append(contents.join(""));
                            //Hide the row that shows no items were found
                            $('#empty').hide();
                        }

                        //Capture the event when user types into the search box
                        window.addEventListener('input', function () {
                            filter(search.value.trim().toLowerCase());
                        })

                        //For every word entered by the user, check if the symbol starts with that word
                        //If it does show the symbol, else hide it
                        function filter(word) {
                            let length = items.length
                            let collection = [];
                            let hidden = 0;
                            for (let i = 0; i < length; i++) {
                                if (items[i].value.toLowerCase().includes(word)) {
                                    //$(items[i]).show();
                                    $("#menuItems #chk" + items[i].value.replace(/[^a-z0-9\s]/gi, '').replace(/[_\s]/g, '')).show();
                                }
                                else {
                                    //$(items[i]).hide();
                                    $("#menuItems #chk" + items[i].value.replace(/[^a-z0-9\s]/gi, '').replace(/[_\s]/g, '')).hide();
                                    hidden++;
                                }
                            }

                            //If all items are hidden, show the empty view
                            if (hidden === length) {
                                $('#empty').show();
                            }
                            else {
                                $('#empty').hide();
                            }
                        }

                        //If the user clicks on any item, set the title of the button as the text of the item
                        //$('#menuItems').on('click', '.drop', function () {
                        //    //$('#searchCoin').val($(this)[0].value);
                        //    $("#dropdown_coins").dropdown('toggle');
                        //});

                        buildDropDown(names);

                    }
                }
            } catch (e) {
                printError("ViewBills.js", 'GetMeterBillDownloadData', e);
            }

        }, function () { });
    },

    BindCommodityDDL: function () {
        if (IsNotNull($("#ddlCustomerSearch").val())) {
            Reload_ddl_Global(null, "#ddlCommoditySearch", "/AjaxCommon/GetCommodityDDLForDashboard", { CustomerID: $("#ddlCustomerSearch").val() }, "All", function () {
                $("#ddlCommoditySearch").select2();
            });
        }
    },

    selectedColName: function () {
        var columnName = [];
        var Data;
        $("input[name='ColName']:checked").each(function () {
            if ($(this).attr("value") != "Select All")
                columnName.push($(this).attr("value"));
        });
        Data = columnName.toString();

        return Data;
    },

    GetDataForSearch: function () {
        return {
            ColumnName: GenericReport.selectedColName(),
            FromDate: $("#txtFromDateSearch").val(),
            ToDate: $("#txtToDateSearch").val(),
            CustomerID: $("#ddlCustomerSearch").val(),
            BuildingIDs: $("#ddlBuildingSearch").val().join(),
            UtilityAccountID: $("#ddlAccountSearch").val(),
            MeterID: $("#ddlMeterSearch").val(),
            CommodityID: $("#ddlCommoditySearch").val(),
            //StatusID: $("#ddlStatus").val()
            StateID: $("#ddlStateSearch").val(),
            UtilityID: $("#ddlUtilitySearch").val(),
            ColumnSelectionID: $("#ddlColumnSelection").val()
        }
    },

    SetForSearch: function () {
        //$("#btnApproved").attr("disabled", true);
        var sp = $("span[role=combobox]")
        $('#ddlColumnSelection').parent().find(sp).css("border-color", "#E2E5EC");
        $('#ddlCustomerSearch').parent().find(sp).css("border-color", "#E2E5EC");
        Reset_Form_Errors();
        var FormData = GenericReport.GetDataForSearch();
        if (GenericReport.ValidateDataSearch(FormData)) {
            $('.loadercontainer').show();
            //call bind function
            GetAjaxData("/GenericReport/GetAllMeterBillDownload", FormData, function (data) {
                var JsonData = data.data;
                try {
                    var KeyArray = [];
                    var IsCancelFlagIndex = null;
                    if (IsNotNull(JsonData)) {
                        KeyArray = Object.keys(JsonData[0]);
                        //$("#divIDShowSubmitButton").show();
                        $("#tblMeterBillExcelUploadDataGR").html('');
                        $("#divMeterBillExcelUploadDataGR, #divExport").show();

                        KeyArray = KeyArray.map(function (item) {
                            return item == 'buildingCode' ? 'B_Code' : item == 'buildingName' ? 'B_Name' : item == 'address' ? 'Address' : item == 'cid' ? 'CID' : item == 'serviceIdentifier' ? 'ServiceIdentifier' :
                                item == 'supplierName' ? 'S_Code'
                                : item == 'utilityAccountNo' ? 'U_AccountNo' : item == 'supplierAccountNo' ? 'S_AccountNo' : item == 'billDate' ? 'B_Date'
                                    : item == 'supplyMeterReadStartDate' ? 'S_MeterRead Start Date' : item == 'supplyMeterReadEndDate' ? 'S_MeterRead End Date'
                                        : item == 'billTotalCost' ? 'B_TotalCost' : item == 'utilityMeterNumber' ? 'U_MeterNumber' : item == 'supplyBillNo' ? 'S_BillNo'
                                            : item == 'fromDate' ? 'Dist. Start Date' : item == 'toDate' ? 'Dist. End Date' : item == 'utilityName' ? 'U_Code' : item
                        });
                        let tblname = 'Custom Report';

                        $("#tblMeterBillExcelUploadDataGR").html("");
                        $('#tblMeterBillExcelUploadDataGR').append('<template>'+ tblname +' </template>');

                        var html = "";
                        html = "<thead><tr style='text-align:center;'><th style='vertical-align:middle;'>#</th>";
                        if (IsNotNull(KeyArray)) {
                            for (i = 0; i < KeyArray.length; i++) {
                                if (KeyArray[i] != 'isCancelFlag') {
                                    if (KeyArray[i] === 'B_Name' || KeyArray[i] === 'Address') {
                                        html += "<th style='text-transform: capitalize; vertical-align:middle;display:none'>" + KeyArray[i] + "</th>";
                                    }
                                    else {
                                        html += "<th style='text-transform: capitalize; vertical-align:middle;'>" + KeyArray[i] + "</th>";
                                    }
                                }
                                else {
                                    IsCancelFlagIndex = i;
                                }
                            }
                            html += "</tr></thead>";
                            $("#tblMeterBillExcelUploadDataGR").append(html);
                        }
                        $("#tblMeterBillExcelUploadDataGR").append("<tbody id='tbodyMeterBillExcelUploadData'></tbody>");


                        $.each(JsonData, function (index, item) {

                            if (item.isCancelFlag != 0) {

                                html = "<tr style='text-align:center; background: #e08d8d;'><td style='vertical-align:middle;'>" + Number(1 + index) + "</td>";
                            }
                            else {
                                html = "<tr style='text-align:center;'><td style='vertical-align:middle;'>" + Number(1 + index) + "</td>";
                            }


                            $.each(item, function (itemKey, itemValue) {
                                if (itemKey != 'isCancelFlag') {
                                    if (!IsNotNull(itemValue))
                                        itemValue = "";

                                    if (itemKey === 'buildingName' || itemKey === 'address') {
                                        html += "<td style='vertical-align:middle;display:none;'>" + itemValue + "</td>";
                                    }
                                    else if (itemKey === "billTotalCost" || itemKey === "dBillCost" || itemKey === "dBillVolume" || itemKey === "sBillVolume" || itemKey === "sBillCost") {
                                        var itemValue1 = Number(itemValue);
                                        html += "<td style='vertical-align:middle;'>" + (IsNotNull(itemValue1) ? addCommas(itemValue1.toLocaleString()) : " ") + "</td>";
                                    }
                                    else {
                                        html += "<td style='vertical-align:middle;'>" + itemValue + "</td>";
                                    }
                                    //if (itemKey.toLowerCase() == "remark" && IsNotNull(itemValue)) {
                                    //    html += "<td title='" + itemValue + "' style='vertical-align:middle;display:inline-block; width:200px; white-space: nowrap; overflow:hidden !important; text-overflow: ellipsis;'>" + itemValue + "</td>";
                                    //}
                                    //else {
                                    // html += "<td style='vertical-align:middle;'>" + itemValue + "</td>";
                                    //}
                                }
                            });
                            html += "</tr>";
                            $("#tbodyMeterBillExcelUploadData").append(html);
                            html = "";
                        });
                        $('.loadercontainer').hide();

                        //console.log(failureRecordCount);
                        var tableID = 'tblMeterBillExcelUploadDataGR';

                        ///////////////////////////  GRAPH BIND  /////////////////////////////

                        //new Chart(document.getElementById("line-chart"), {
                        //    type: 'line',
                        //    data: {
                        //        labels: ["D_Entry Initials", "D_kW Demand On", "D_kW Demand Off", "D_KVAR", "D_Entry Date", "D_kWh On", "D_kWh Total"],
                        //        datasets: [{
                        //            data: [282, 350, 411, 502, 635, 809, 947],
                        //            label: "TotalCost",
                        //            borderColor: "#6a5acd",
                        //            fill: false
                        //        },
                        //        {
                        //            data: [22, 30, 451, 802, 655, 859, 957],
                        //            label: "B_Cost",
                        //            borderColor: "#6a5acd",
                        //            fill: false
                        //        }
                        //        ]
                        //    },
                        //    options: {
                        //        title: {
                        //            display: true,
                        //            text: 'Item vs Total_Cost(in $)'
                        //        }
                        //    }
                        //});
                    }
                    else {
                        //$("#divIDShowSubmitButton").hide();
                        $("#divMeterBillExcelUploadDataGR").hide();
                        showSweetAlert("No data found!", null, 'info', null);
                        $('.loadercontainer').hide();
                    }

                } catch (e) {
                    $('.loadercontainer').hide();
                    printError("BillUpload.js", 'GetMeterBillExcelUploadedData', e);
                }
            }, function () {
                    $('.loadercontainer').hide();
            });
        }
    },

    ValidateDataSearch: function (FormData) {
        var valid = true;
        valid = Validate_DDLControl_NullBlank("#ddlCustomerSearch", FormData.CustomerID, 'Required', valid);
        valid = Validate_DDLControl_NullBlank("#ddlCommoditySearch", FormData.CommodityID, 'Required', valid);
        valid = Validate_Control_NullBlank("#txtFromDateSearch", FormData.FromDate, 'Required', valid);
        valid = Validate_Control_NullBlank("#txtToDateSearch", FormData.ToDate, 'Required', valid);
        valid = Validate_DDLControl_NullBlank("#ddlColumnSelection", FormData.ColumnSelectionID, 'Required', valid);
        return valid;
    },

    showCheckboxes: function () {
        var checkboxes = document.getElementById("checkboxes");
        if (!expanded) {
            checkboxes.style.display = "block";
            expanded = true;
        } else {
            checkboxes.style.display = "none";
            expanded = false;
        }
    },

    showCheckboxes: function () {
        $("#checkboxes").show();
    },

    BindBuildingDDLForSearch: function () {
        $("#ddlAccountSearch option").remove();
        $("#ddlMeterSearch option").remove();
        Reload_ddl_Global(null, "#ddlUtilitySearch", "/AjaxCommon/GetUtilityDDL", { CustomerID: $("#ddlCustomerSearch").val() }, "All", function () { $("#ddlUtilitySearch").select2(); });
        Reload_ddl_Global(null, "#ddlStateSearch", "/AjaxCommon/GetCustomerWiseStateDDL", { CustomerID: $("#ddlCustomerSearch").val() }, "All", function () { $("#ddlStateSearch").select2(); });
        Reload_ddl_Global(null, "#ddlAccountSearch", "/AjaxCommon/GetAllUtilityAccountDDL", { CustomerID: $("#ddlCustomerSearch").val() || 0, BuildingID: $("#ddlBuildingSearch").val() || 0, UtilityMeterID: $("#ddlMeterSearch").val() || 0 }, "All", function () {
            $("#ddlAccountSearch").val(selectedUtilityAccountID);
            if (!IsNotNull($("#ddlAccountSearch").val())) {
                $("#ddlAccountSearch").val("").select2();
            }
        });
        Reload_ddl_Global(null, "#ddlMeterSearch", "/AjaxCommon/GetUtilityMeterNumberDDL", { UtilityAccountID: null, CustomerID: $("#ddlCustomerSearch").val(), BuildingID: null, CommodityID: null }, "All", function () {
            $("#ddlMeterSearch").val(selectedUtilityMeterID);
            if (!IsNotNull($("#ddlMeterSearch").val())) {
                $("#ddlMeterSearch").val("").select2();
            }
        });
        Reload_ddl_Global(null, "#ddlBuildingSearch", "/AjaxCommon/GetBuildingDDL", { CustomerID: $("#ddlCustomerSearch").val(), UtilityAccountID: $("#ddlAccountSearch").val() || 0, UtilityMeterID: $("#ddlMeterSearch").val() || 0 }, "", function () {
            $("#ddlBuildingSearch").val(selectedBuildingID).select2();
            if (!IsNotNull($("#ddlBuildingSearch").val())) {
                $("#ddlBuildingSearch").val("").select2();
            }
        });
    },

    BindUtilityAccountDDLForSearch: function () {
        selectedBuildingID = $("#ddlBuildingSearch").val();
        debugger
        $("#ddlMeterSearch option").remove();
        Reload_ddl_Global(null, "#ddlMeterSearch", "/AjaxCommon/GetUtilityMeterNumberDDLForChart", { UtilityAccountIDs: null, CustomerID: $("#ddlCustomerSearch").val(), BuildingIDs: $("#ddlBuildingSearch").val().join(','), CommodityIDs: $("#ddlCommoditySearch").val() }, "Select", function () {
            $("#ddlMeterSearch").val(selectedUtilityMeterID);
            if (!IsNotNull($("#ddlMeterSearch").val())) {
                $("#ddlMeterSearch").val("").select2();
            }
        });
        //Reload_ddl_Global(null, "#ddlAccountSearch", "/AjaxCommon/GetAllUtilityAccountDDL", { CustomerID: $("#ddlCustomerSearch").val() || 0, BuildingID: $("#ddlBuildingSearch").val() || 0, UtilityMeterID: $("#ddlMeterSearch").val() || 0 }, "Select", function () {
        //    $("#ddlAccountSearch").val(selectedUtilityAccountID);
        //    if ($("#ddlAccountSearch").val() == null) {
        //        $("#ddlAccountSearch").val("").select2();
        //    }
        //});
        Reload_ddl_Global(null, "#ddlAccountSearch", "/AjaxCommon/GetUtilityAccountDDLForChart", { CustomerID: $("#ddlCustomerSearch").val() || 0, BuildingIDs: $("#ddlBuildingSearch").val().join(',') || 0, UtilityMeterIDs: selectedUtilityMeterID || 0 }, "Select", function () {
            //$("#ddlAccountSearch").select2();

            $("#ddlAccountSearch").val(selectedUtilityAccountID).select2();
            if (selectedUtilityAccountID != null) {
                Reload_ddl_Global(null, "#ddlBuildingSearch", "/AjaxCommon/GetBuildingDDL", { CustomerID: $("#ddlCustomerSearch").val(), UtilityAccountID: $("#ddlAccountSearch").val() || 0, UtilityMeterID: $("#ddlMeterSearch").val() || 0 }, "Select", function () {
                    //$("#ddlBuildingSearch").select2();
                    $("#ddlBuildingSearch").val(selectedBuildingID).select2();
                    if (!IsNotNull($("#ddlBuildingSearch").val())) {
                        $("#ddlBuildingSearch").val("").select2();
                    }
                });
            }
            if (!IsNotNull($("#ddlAccountSearch").val())) {
                $("#ddlAccountSearch").val("").select2();
            }
        });
    },

    BindMeterDDLForSearch: function () {
        selectedUtilityAccountID = $("#ddlAccountSearch").val();
        Reload_ddl_Global(null, "#ddlMeterSearch", "/AjaxCommon/GetUtilityMeterNumberDDL", { UtilityAccountID: $("#ddlAccountSearch").val(), CustomerID: $("#ddlCustomerSearch").val(), BuildingID: $("#ddlBuildingSearch").val(), CommodityID: null }, "Select", function () {
            $("#ddlMeterSearch").val(selectedUtilityMeterID);
            if (!IsNotNull($("#ddlMeterSearch").val())) {
                $("#ddlMeterSearch").val("").select2();
            }
        });
    },

    OnSelectDDLMeterSearch: function () {
        selectedUtilityMeterID = $("#ddlMeterSearch").val();
        Reload_ddl_Global(null, "#ddlAccountSearch", "/AjaxCommon/GetAllUtilityAccountDDL", { CustomerID: $("#ddlCustomerSearch").val() || 0, BuildingID: 0, UtilityMeterID: $("#ddlMeterSearch").val() || 0 }, "Select", function () {
            $("#ddlAccountSearch").val(selectedUtilityAccountID);
            if (!IsNotNull($("#ddlAccountSearch").val())) {
                $("#ddlAccountSearch").val("").select2();
                if ($("#ddlAccountSearch option").length === 2) {
                    $("#ddlAccountSearch").val($("#ddlAccountSearch option:eq(1)").val()).select2();
                }
            }
        });
        Reload_ddl_Global(null, "#ddlBuildingSearch", "/AjaxCommon/GetBuildingDDL", { CustomerID: $("#ddlCustomerSearch").val(), UtilityAccountID: $("#ddlAccountSearch").val() || 0, UtilityMeterID: $("#ddlMeterSearch").val() || 0 }, "Select", function () {
            $("#ddlBuildingSearch").val(selectedBuildingID).select2();
            if (!IsNotNull($("#ddlBuildingSearch").val())) {
                $("#ddlBuildingSearch").val("").select2();
                if ($("#ddlBuildingSearch option").length === 2) {
                    $("#ddlBuildingSearch").val($("#ddlBuildingSearch option:eq(1)").val()).select2();
                }
            }
        });
    },

    ResetData: function () {
        selectedUtilityMeterID = null;
        selectedUtilityAccountID = null;
        selectedBuildingID = null;
        selectedCommdityID = null;

        $("#divColANDGrid, #divExport").hide();
        $('.date-picker').datepicker({ autoclose: true, todayHighlight: true, format: 'M-yyyy', viewMode: "months", minViewMode: "months" });
        $("#txtFromDateSearch").val(CommonTodayDate.addDays(-30));
        $("#txtToDateSearch").val(CommonTodayDate.mmddyyyy());
        $("#txtFromDateSearch").datepicker("update", CommonTodayDate.addDays(-30));
        $("#txtToDateSearch").datepicker("update", CommonTodayDate.mmddyyyy());
        $("#txtFromDateSearch").datepicker("setEndDate", CommonTodayDate.addDays(-30));

        Reload_ddl_Global(null, "#ddlBuildingSearch", "/AjaxCommon/GetBuildingDDL", { CustomerID: $("#ddlCustomerSearch").val(), UtilityAccountID: $("#ddlAccountSearch").val() || 0, UtilityMeterID: $("#ddlMeterSearch").val() || 0 }, "", function () {
                $("#ddlBuildingSearch").select2();
        });
        Reload_ddl_Global(null, "#ddlMeterSearch", "/AjaxCommon/GetUtilityMeterNumberDDL", null, "Select", function () { $("#ddlMeterSearch").select2(); });
        Reload_ddl_Global(null, "#ddlCustomerSearch", "/AjaxCommon/GetCustomerDDL", null, "Select", function () { $("#ddlCustomerSearch").select2(); });
        Reload_ddl_Global(null, "#ddlCommoditySearch", "/AjaxCommon/GetCommodityDDL", null, "Select", function () { $("#ddlCommoditySearch").select2(); });
        //Reload_ddl_Global_staticData(null, "#ddlStatus", "/AjaxCommon/GetStatusDDL", null, "Select", ddlStatus, function () { $("#ddlStatus").select2(); });
        Reload_ddl_Global(null, "#ddlStateSearch", "/AjaxCommon/GetCustomerWiseStateDDL", null, "Select", function () { $("#ddlStateSearch").select2(); });
        Reload_ddl_Global(null, "#ddlUtilitySearch", "/AjaxCommon/GetUtilityDDL", null, "Select", function () { $("#ddlUtilitySearch").select2(); });
        Reload_ddl_Global(null, "#ddlAccountSearch", "/AjaxCommon/GetAllUtilityAccountDDL", null, "Select", function () { $("#ddlAccountSearch").select2(); });
        //$("#ddlStatus").val(1).trigger("change");

        Reload_ddl_Global_staticData(null, "#ddlColumnSelection", "/AjaxCommon/GetStatusDDL", null, "Select", ddlColumnSelection, function () { $("#ddlColumnSelection").select2(); });
        $("#ddlColumnSelection").val(1).trigger("change");

        //GenericReport.BindGrid($("#txtFromDateSearch").val(), $("#txtToDateSearch").val(), $("#ddlStatus").val());

        //$("#ddlAccountSearch").html("<option value=''>Select</option>");
        //$("#ddlAccountSearch").val('').select2();

        //$("#ddlBuildingSearch").html("<option value=''>Select</option>");
        //$("#ddlBuildingSearch").val('').select2();

        $('input[type=checkbox]').prop('checked', false);
    },

    //BindGraph: function () {
    //    $("#liGrid").removeClass("ui-tabs-active");
    //    $("#liGraph").addClass("ui-tabs-active");
    //    $("#tabGrid").hide();
    //    $("#tabGraph").show();
    //},

    //BindGrid: function () {
    //    $("#liGraph").removeClass("ui-tabs-active");
    //    $("#liGrid").addClass("ui-tabs-active");
    //    $("#tabGraph").hide();
    //    $("#tabGrid").show();
    //},

    BindBuildingDDLForState: function () {
        Reload_ddl_Global(null, "#ddlBuildingSearch", "/AjaxCommon/GetBuildingDDL", { CustomerID: $("#ddlCustomerSearch").val(), StateID: $("#ddlStateSearch").val(), UtilityAccountID: $("#ddlAccountSearch").val() || 0, UtilityMeterID: $("#ddlMeterSearch").val() || 0 }, "Select", function () {
            $("#ddlBuildingSearch").val(selectedBuildingID).select2();
            if (!IsNotNull($("#ddlBuildingSearch").val())) {
                $("#ddlBuildingSearch").val("").select2();
            }
        });

    },

    SelectAllChk: function (source) {

        var checkboxes = document.querySelectorAll('input[type="checkbox"]');
        for (var i = 0; i < checkboxes.length; i++) {
            if (checkboxes[i] != source)
                checkboxes[i].checked = source.checked;
        }
    },

    SelectChk: function () {
        $('.drop').change(function () {
            //uncheck "select all", if one of the listed checkbox item is unchecked
            if (false == $(this).prop("checked")) { //if this item is unchecked
                $("#chkAll").prop('checked', false); //change "select all" checked status to false
            }
            //check "select all" if all checkbox items are checked
            if ($('.drop:checked').length == $('.drop').length) {
                $("#chkAll").prop('checked', true);
            }
        });
    },



};


