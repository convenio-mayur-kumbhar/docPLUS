/// <reference path="../js/Common.js" />

$(document).ready(function () {
    $("#divExport").hide();
    $("#ddlCustomerSearch").select2();

    $(".date-picker").datepicker({
        autoclose: true, todayHighlight: true, format: 'M-yyyy', viewMode: "months", minViewMode: "months"
    });

    $("#txtvalidFrom").val(CommonTodayDate.addDays(-365));
    $("#txtvalidFrom").datepicker("update", CommonTodayDate.addDays(-365));

    $("#txtvalidUntil").val(CommonTodayDate.mmddyyyy());
    $('#txtvalidUntil').datepicker("update", CommonTodayDate.mmddyyyy());

    $("#ddlUtilitySearch").select2();
    $("#ddlCommoditySearch").select2();
    $("#ddlBuildingSearch").select2();
    //$("#ddlAccountSearch").select2();    
    //$("#ddlMeterSearch").select2();

    Reload_ddl_Global(null, "#ddlCustomerSearch", "/AjaxCommon/GetCustomerDDL", null, "Select", function () {
        $("#ddlCustomerSearch").select2();
        if ($("#ddlCustomerSearch option").length > 1) {
            //$("#ddlCustomerSearch").val($("#ddlCustomerSearch option:eq(1)").val()).select2();
            $("#ddlCustomerSearch").val(_CustomerID).select2();
            Reload_ddl_Global(null, "#ddlUtilitySearch", "/AjaxCommon/GetUtilityDDLForChart", { CustomerID: $("#ddlCustomerSearch").val() }, "Select", function (data) {
                var Data = data.data;
                var UtilityId = [];
                $.each(Data, function (index, item) {
                    UtilityId.push(item.utilityID);
                });
                $("#ddlUtilitySearch").val(UtilityId);
                $("#ddlUtilitySearch").select2();
                Reload_ddl_Global(null, "#ddlCommoditySearch", "/AjaxCommon/GetCommodityDDLForChart", { CustomerID: $("#ddlCustomerSearch").val(), UtilityIDs: $("#ddlUtilitySearch").val().join(',') || null }, "Select", function (data) {
                    var Data = data.data;
                    var CommodityIDs = [];
                    $.each(Data, function (index, item) {
                        CommodityIDs.push(item.commodityID);
                    });
                    $("#ddlCommoditySearch").val(CommodityIDs);
                    $("#ddlCommoditySearch").select2();
                    UsageAndEmissionReport.BindBuildingDDLForSearch();
                    UsageAndEmissionReport.BindData();
                });
            });
        }
    });
});

var UsageAndEmissionReport = {

    BindData: function () {
        Reset_Form_Errors();
        var FormData = UsageAndEmissionReport.GetData();
        if (UsageAndEmissionReport.ValidateData(FormData)) {
            $('.loadercontainer').show();
            GetAjaxData("/UsageAndEmissionReport/GetReport", { Model: FormData }, function (data) {
                $('.loadercontainer').show();
                if (IsNotNull(data.data)) {
                    $('.loadercontainer').hide();
                    var JsonData = data.data;

                    var CustomerName = $("#ddlCustomerSearch :Selected").text();
                    var Date = $("#txtvalidUntil").val();
                    var bill = '';
                    if ($("#rdbAllData").prop('checked'))
                        bill = 'Calenderized';
                    else
                        bill = 'BillingPeriod';

                    var FileName = CustomerName + '_' + Date + '_' + bill;
                    $("#divUsageAndEmissionReport").html("");
                    $("#divExport").show();
                    var table = $('<table class="table table-striped table-hover table-checkable" id="tblUsageAndEmissionReport"><template>' + FileName +' Usage And Emission Report</template>');
                    var tblHeader = "<thead><tr>";
                    for (var k in JsonData[0]) {
                            if (k != 'uomCode')
                            {
                                if (k == "buildingName" || k == "address")
                                {
                                    k == "buildingName" ? (k = "Building Name") : (k == "usage" ? k = "" : k == "buildingName" ? k = "Building Name" : k);
                                    tblHeader += "<th style='background-color: #3587A0 !important;color:#ffffff;min-width: 75px;display:none;'>" + k.substr(0, 1).toUpperCase() + k.substr(1); + "</th>";
                                }
                                else
                                {
                                    k == "variableName" ? (k = "Variable Name") : (k == "usage" ? k = "" : k == "buildingCode" ? k = "Building Code" : k);
                                    tblHeader += "<th style='background-color: #3587A0 !important;color:#ffffff;min-width: 75px;'>" + k.substr(0, 1).toUpperCase() + k.substr(1); + "</th>";
                                }
                            }
                        }
                    tblHeader += "<th style='background-color: #3587A0 !important;color:#ffffff;'>Total</th>";
                    tblHeader += "</tr></thead><tbody>";
                    $(tblHeader).appendTo(table);
                    var jansum = 0; var febsum = 0; var marsum = 0; var aprsum = 0; var maysum = 0;
                    var junsum = 0; var julsum = 0; var augsum = 0; var sepsum = 0; var octsum = 0;
                    var novsum = 0; var decsum = 0; var allmontotal = 0; var monthcost = "";

                    var jansumb = 0; var febsumb = 0; var marsumb = 0; var aprsumb = 0; var maysumb = 0;
                    var junsumb = 0; var julsumb = 0; var augsumb = 0; var sepsumb = 0; var octsumb = 0;
                    var novsumb = 0; var decsumb = 0; var allmontotalb = 0;
                    var builingid = 0; var flag = 0; var flag1 = 0; var strtd = ""; var cnt = 1;
                    var VariableName = '';

                    $.each(JsonData, function (index, value) {
                        var total = 0; var datakey = ""; var totalcost = ""; var totalrate = ""; var monthcnt = 0;
                        var TableRow = "<tr class='child-row" + value['variableName'] + "' >";
                        var UomCode = value.uomCode;
                        $.each(value, function (key, val) {
                            if (key == 'buildingCode') {

                                if (builingid == 0) {
                                    builingid = val;
                                }
                                if (builingid == val) {
                                    flag = 1;
                                }
                                else {
                                    strtd = "<tr style='background-color:#909090;color:#FFFFFF;cursor: pointer;' class='parent' id='row" + builingid + "' onclick =UsageAndDReport.HideShow('" + builingid + "');><td></td><td colspan=3></td>";
                                    for (var k in JsonData[0]) {
                                        if (k.includes("jan")) {
                                            strtd += "<td style='text-align:right;'> </td>";
                                        }
                                        else if (k.includes("feb")) {
                                            strtd += "<td style='text-align:right;'></td>";
                                        }
                                        else if (k.includes("mar")) {
                                            strtd += "<td style='text-align:right;'></td>";
                                        }
                                        else if (k.includes("apr")) {
                                            strtd += "<td style='text-align:right;'></td>";
                                        }
                                        else if (k.includes("may")) {
                                            strtd += "<td style='text-align:right;'></td>";
                                        }
                                        else if (k.includes("jun")) {
                                            strtd += "<td style='text-align:right;'></td>";
                                        }
                                        else if (k.includes("jul")) {
                                            strtd += "<td style='text-align:right;'></td>";
                                        }
                                        else if (k.includes("aug")) {
                                            strtd += "<td style='text-align:right;'></td>";
                                        }
                                        else if (k.includes("sep")) {
                                            strtd += "<td style='text-align:right;'></td>";
                                        }
                                        else if (k.includes("oct")) {
                                            strtd += "<td style='text-align:right;'></td>";
                                        }
                                        else if (k.includes("nov")) {
                                            strtd += "<td style='text-align:right;'></td>";
                                        }
                                        else if (k.includes("dec")) {
                                            strtd += "<td style='text-align:right;'></td>";
                                        }
                                    }
                                    allmontotalb = (jansumb + febsumb + marsumb + aprsumb + maysumb + junsumb + julsumb + augsumb + sepsumb + octsumb + novsumb + decsumb);
                                    strtd += "<td style='text-align:right;'></td></tr>";
                                    builingid = val;
                                    flag = 0;
                                    flag1 = 1;
                                }
                                
                                datakey = val;
                                TableRow += "<td class='text-left' data-id=key" + val + ">" + val + "</td>";
                            }
                            else if (key == 'buildingName') {
                                //datakey += val;
                                TableRow += "<td class='one-line' style='display:none;white-space:nowrap;'>" + val + "</td>";
                            }
                            else if (key == 'address') {
                                //datakey += val;
                                TableRow += "<td class='one-line' style='display:none;white-space:nowrap;'>" + val + "</td>";
                            }
                            else if (key == 'variableName') {
                                datakey += val;
                                TableRow += "<td class='text-left' data-id=key" + datakey + ">" + val + "</td>";
                            }
                            else if (key == 'commodity') {
                                datakey += val;
                                TableRow += "<td class='text-left' data-id=key" + datakey + ">" + val + "</td>";
                            }
                            else if (key == 'usage') {
                                if (val == 'AUsage') {
                                    totalcost = 'cost';
                                    TableRow += "<td class='text-left'>Usage(" + UomCode +")</td>";
                                }
                                else if (val == 'BEmission') {
                                    TableRow += "<td class='text-left'>Emission</td>";
                                }
                            }
                            else if (key != 'uomCode'){
                                monthcnt++;
                                if (val != null && !isNaN(val) && val.length !== 0) {
                                    total += parseFloat(val);
                                }
                                if (totalcost == 'cost') {
                                    if (flag1 == 1) {
                                        jansumb = 0; febsumb = 0; marsumb = 0; aprsumb = 0; maysumb = 0; junsumb = 0;
                                        julsumb = 0; augsumb = 0; sepsumb = 0; octsumb = 0; novsumb = 0; decsumb = 0;
                                        flag1 = 0; flag = 1;
                                    }

                                    if (key.includes('jan') && val != null && !isNaN(val) && val.length !== 0) {
                                        if (flag == 1) {
                                            jansumb += val;
                                        }
                                        jansum += val;
                                        monthcost = "class=" + key + "cost";
                                        TableRow += "<td " + monthcost + " style='text-align:right;'>" + val.toLocaleString() + "</td>";
                                    }
                                    else if (key.includes('feb') && val != null && !isNaN(val) && val.length !== 0) {
                                        if (flag == 1) {
                                            febsumb += val;
                                        }
                                        febsum += val;
                                        monthcost = "class=" + key + "cost";
                                        TableRow += "<td " + monthcost + " style='text-align:right;'>" + val.toLocaleString() + "</td>";
                                    }
                                    else if (key.includes('mar') && val != null && !isNaN(val) && val.length !== 0) {
                                        if (flag == 1) {
                                            marsumb += val;
                                        }
                                        marsum += val;
                                        monthcost = "class=" + key + "cost";
                                        TableRow += "<td " + monthcost + " style='text-align:right;'>" + val.toLocaleString() + "</td>";
                                    }
                                    else if (key.includes('apr') && val != null && !isNaN(val) && val.length !== 0) {
                                        if (flag == 1) {
                                            aprsumb += val;
                                        }
                                        aprsum += val;
                                        monthcost = "class=" + key + "cost";
                                        TableRow += "<td " + monthcost + " style='text-align:right;'>" + val.toLocaleString() + "</td>";
                                    }
                                    else if (key.includes('may') && val != null && !isNaN(val) && val.length !== 0) {
                                        if (flag == 1) {
                                            maysumb += val;
                                        }
                                        maysum += val;
                                        monthcost = "class=" + key + "cost";
                                        TableRow += "<td " + monthcost + " style='text-align:right;'>" + val.toLocaleString() + "</td>";
                                    }
                                    else if (key.includes('jun') && val != null && !isNaN(val) && val.length !== 0) {
                                        if (flag == 1) {
                                            junsumb += val;
                                        }
                                        junsum += val;
                                        monthcost = "class=" + key + "cost";
                                        TableRow += "<td " + monthcost + " style='text-align:right;'>" + val.toLocaleString() + "</td>";
                                    }
                                    else if (key.includes('jul') && val != null && !isNaN(val) && val.length !== 0) {
                                        if (flag == 1) {
                                            julsumb += val;
                                        }
                                        julsum += val;
                                        monthcost = "class=" + key + "cost";
                                        TableRow += "<td " + monthcost + " style='text-align:right;'>" + val.toLocaleString() + "</td>";
                                    }
                                    else if (key.includes('aug') && val != null && !isNaN(val) && val.length !== 0) {
                                        if (flag == 1) {
                                            augsumb += val;
                                        }
                                        augsum += val;
                                        monthcost = "class=" + key + "cost";
                                        TableRow += "<td " + monthcost + " style='text-align:right;'>" + val.toLocaleString() + "</td>";
                                    }
                                    else if (key.includes('sep') && val != null && !isNaN(val) && val.length !== 0) {
                                        if (flag == 1) {
                                            sepsumb += val;
                                        }
                                        sepsum += val;
                                        monthcost = "class=" + key + "cost";
                                        TableRow += "<td " + monthcost + " style='text-align:right;'>" + val.toLocaleString() + "</td>";
                                    }
                                    else if (key.includes('oct') && val != null && !isNaN(val) && val.length !== 0) {
                                        if (flag == 1) {
                                            octsumb += val;
                                        }
                                        octsum += val;
                                        monthcost = "class=" + key + "cost";
                                        TableRow += "<td " + monthcost + " style='text-align:right;'>" + val.toLocaleString() + "</td>";
                                    }
                                    else if (key.includes('nov') && val != null && !isNaN(val) && val.length !== 0) {
                                        if (flag == 1) {
                                            novsumb += val;
                                        }
                                        novsum += val;
                                        monthcost = "class=" + key + "cost";
                                        TableRow += "<td " + monthcost + " style='text-align:right;'>" + val.toLocaleString() + "</td>";
                                    }
                                    else if (key.includes('dec') && val != null && !isNaN(val) && val.length !== 0) {
                                        if (flag == 1) {
                                            decsumb += val;
                                        }
                                        decsum += val;
                                        monthcost = "class=" + key + "cost";
                                        TableRow += "<td " + monthcost + " style='text-align:right;'>" + val.toLocaleString() + "</td>";
                                    }
                                }
                                else {
                                    TableRow += "<td style='text-align:right;'>" + val.toLocaleString() + "</td>";
                                }
                            }

                        });
                        if (totalcost == 'cost') {
                            TableRow += "<td style='text-align:right;'>" + total.toLocaleString() + "</td>";
                        }
                        
                        else {
                            TableRow += "<td style='text-align:right;'>" + total.toLocaleString() + "</td>";
                        }

                        TableRow += "</tr>";
                        if (strtd != "") {
                            TableRow = (strtd + TableRow);
                            strtd = "";
                        }
                       
                        $(table).append(TableRow);
                        cnt++;
                    });
                
                    $(table).appendTo("#divUsageAndEmissionReport");
                    UsageAndEmissionReport.mergerKey();
                }
                else {
                    $("#divUsageAndEmissionReport").html("");
                    $("#divExport").hide();
                    $('.loadercontainer').hide();
                    showSweetAlert("No data found!", null, 'info', null);
                }
            }, function () {
                $('.loadercontainer').hide();
            });
        }
    },
    HideShow: function (buildingid) {
        $('.child-row' + buildingid).toggle();
    },
    mergerKey: function () {

        // prevents the same attribute is used more than once Ip
        var idA = [];

        // finds all cells id column Key
        $('td[data-id^="key"]').each(function () {

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
                    $td.attr('valign', 'top');
                }
            }
        })
    },
    BindBuildingDDLForSearch: function () {
        //$("#ddlAccountSearch").val("").select2();
        //$("#ddlMeterSearch").val("").select2();
        if (IsNotNull($("#ddlCustomerSearch").val())) {
            Reload_ddl_Global(null, "#ddlBuildingSearch", "/AjaxCommon/GetBuildingDDLForChart", { CustomerID: $("#ddlCustomerSearch").val(), UtilityIDs: $("#ddlUtilitySearch").val().join(','), CommodityIDs: $("#ddlCommoditySearch").val().join(',') }, "Select", function (data) {
                $("#ddlBuildingSearch").select2();
            });
        }
    },
    BindUtilityDDLForSearch: function () {
        $("#ddlCommoditySearch").val("").select2();
        $("#ddlBuildingSearch").val("").select2();
        // $("#ddlAccountSearch").val("").select2();
        // $("#ddlMeterSearch").val("").select2();

        if (IsNotNull($("#ddlCustomerSearch").val())) {
            Reload_ddl_Global(null, "#ddlUtilitySearch", "/AjaxCommon/GetUtilityDDLForChart", { CustomerID: $("#ddlCustomerSearch").val() }, "Select", function (data) {
                var Data = data.data;
                var UtilityId = [];
                $.each(Data, function (index, item) {
                    UtilityId.push(item.utilityID);
                });
                $("#ddlUtilitySearch").val(UtilityId);
                $("#ddlUtilitySearch").select2();
                UsageAndEmissionReport.BindCommodityDDLForSearch();
            });
        }
        else {
            $("#ddlUtilitySearch").find("option").remove();
            $("#ddlCommoditySearch").find("option").remove();
            $("#ddlBuildingSearch").find("option").remove();
            //$("#ddlAccountSearch").find("option").remove();
            //$("#ddlMeterSearch").find("option").remove();

            $("#ddlUtilitySearch").select2();
            $("#ddlCommoditySearch").select2();
            $("#ddlBuildingSearch").select2();
            //$("#ddlAccountSearch").select2();
            //$("#ddlMeterSearch").select2();
        }
    },
    BindCommodityDDLForSearch: function () {
        $("#ddlBuildingSearch").val("").select2();
        // $("#ddlAccountSearch").val("").select2();
        // $("#ddlMeterSearch").val("").select2();

        if (IsNotNull($("#ddlCustomerSearch").val())) {
            Reload_ddl_Global(null, "#ddlCommoditySearch", "/AjaxCommon/GetCommodityDDLForChart", { CustomerID: $("#ddlCustomerSearch").val(), UtilityIDs: $("#ddlUtilitySearch").val().join(',') || null }, "Select", function (data) {
                var Data = data.data;
                var CommodityIDs = [];
                $.each(Data, function (index, item) {
                    CommodityIDs.push(item.commodityID);
                });
                $("#ddlCommoditySearch").val(CommodityIDs);
                $("#ddlCommoditySearch").select2();
                UsageAndEmissionReport.BindBuildingDDLForSearch();
            });
        }
    },
    BindBuildingDDLForSearch: function () {
        //$("#ddlAccountSearch").val("").select2();
        //$("#ddlMeterSearch").val("").select2();
        if (IsNotNull($("#ddlCustomerSearch").val())) {
            Reload_ddl_Global(null, "#ddlBuildingSearch", "/AjaxCommon/GetBuildingDDLForChart", { CustomerID: $("#ddlCustomerSearch").val(), UtilityIDs: $("#ddlUtilitySearch").val().join(','), CommodityIDs: $("#ddlCommoditySearch").val().join(',') }, "Select", function (data) {
                $("#ddlBuildingSearch").select2();
            });
        }
    },
    BindUtilityAccountDDLForSearch: function () {
        //$('#ddlMeterSearch').html("").empty();
        //$('#ddlAccountSearch').html("").empty();
        //$("#ddlMeterSearch").val("").select2();
        if (IsNotNull($("#ddlBuildingSearch").val())) {
            Reload_ddl_Global(null, "#ddlAccountSearch", "/AjaxCommon/GetUtilityAccountDDLForChart", { BuildingIDs: $("#ddlBuildingSearch").val().join(','), CommodityIDs: $("#ddlCommoditySearch").val().join(',') }, "Select", function (data) {
                $("#ddlAccountSearch").select2();
                //UsageAndEmissionReport.BindMeterDDLForSearch();
            });
        }
    },
    BindMeterDDLForSearch: function () {
        Reload_ddl_Global(null, "#ddlMeterSearch", "/AjaxCommon/GetUtilityMeterNumberDDLForChart", { UtilityAccountIDs: $("#ddlAccountSearch").val().join(',') || null, CommodityIDs: $("#ddlCommoditySearch").val().join(',') || null, BuildingIDs: $("#ddlBuildingSearch").val().join(',') || null }, "Select", function () { $("#ddlMeterSearch").select2(); });
    },
    ResetData: function () {
        $(".has-error p").html("");
        $(".has-error").removeClass("has-error");
        UsageAndEmissionReport.ClearData();

        $("#ddlCustomerSearch").select2();
        $("#ddlUtilitySearch").select2();
        $("#ddlBuildingSearch").select2();
        $("#ddlAccountSearch").select2();
        $("#ddlCommoditySearch").select2();
        $("#ddlMeterSearch").select2();
        $('#ddlMeterSearch').html("").empty();
        $('#ddlAccountSearch').html("").empty();


        Reload_ddl_Global(null, "#ddlCustomerSearch", "/AjaxCommon/GetCustomerDDL", null, "Select", function () {
            $("#ddlCustomerSearch").select2();
            if ($("#ddlCustomerSearch option").length > 1) {
                //$("#ddlCustomerSearch").val($("#ddlCustomerSearch option:eq(1)").val()).select2();
                $("#ddlCustomerSearch").val(_CustomerID).select2();
                Reload_ddl_Global(null, "#ddlUtilitySearch", "/AjaxCommon/GetUtilityDDLForChart", { CustomerID: $("#ddlCustomerSearch").val() }, "Select", function (data) {
                    var Data = data.data;
                    var UtilityId = [];
                    $.each(Data, function (index, item) {
                        UtilityId.push(item.utilityID);
                    });
                    $("#ddlUtilitySearch").val(UtilityId);
                    $("#ddlUtilitySearch").select2();
                    Reload_ddl_Global(null, "#ddlCommoditySearch", "/AjaxCommon/GetCommodityDDLForChart", { CustomerID: $("#ddlCustomerSearch").val(), UtilityIDs: $("#ddlUtilitySearch").val().join(',') || null }, "Select", function (data) {
                        var Data = data.data;
                        var CommodityIDs = [];
                        $.each(Data, function (index, item) {
                            CommodityIDs.push(item.commodityID);
                        });
                        $("#ddlCommoditySearch").val(CommodityIDs);
                        $("#ddlCommoditySearch").select2();
                        UsageAndEmissionReport.BindBuildingDDLForSearch();
                        UsageAndEmissionReport.BindData();
                    });
                });

            }
        });

        $(".date-picker").datepicker({
            autoclose: true, todayHighlight: true, format: 'M-yyyy', viewMode: "months", minViewMode: "months"
        });

        $("#txtvalidFrom").val(CommonTodayDate.addDays(-365));
        $("#txtvalidFrom").datepicker("update", CommonTodayDate.addDays(-365));

        $("#txtvalidUntil").val(CommonTodayDate.mmddyyyy());
        $('#txtvalidUntil').datepicker("update", CommonTodayDate.mmddyyyy());

        $("#rdbAllData").prop("checked", true);
    },
    ClearData: function () {
        $(".has-error p").html("").hide();
        $(".has-error").removeClass("has-error");
    },
    GetData: function () {
        return {
            CustomerID: $("#ddlCustomerSearch").val(),
            UtilityIDs: $("#ddlUtilitySearch").val().join(','),
            BuildingIDs: $("#ddlBuildingSearch").val().join(','),
            //UtilityAccountIDs: $("#ddlAccountSearch").val().join(','),
            CommodityIDs: $("#ddlCommoditySearch").val().join(','),
            //UtilityMeterIDs: $("#ddlMeterSearch").val().join(','),
            EffectiveTillMonth: $("#txtvalidUntil").val(),
            EndUserID: UserID,
            IsCalenderWise: $("#rdbAllData").prop('checked')
        };
    },
    ValidateData: function (FormData) {
        var valid = true;
        valid = Validate_DDLControl_NullBlank("#ddlCustomerSearch", FormData.CustomerID, 'Required', valid);
        valid = Validate_DDLControl_NullBlank("#ddlUtilitySearch", FormData.UtilityIDs, 'Required', valid);
        valid = Validate_DDLControl_NullBlank("#ddlCommoditySearch", FormData.CommodityIDs, 'Required', valid);
        valid = Validate_Control_NullBlank("#txtvalidUntil", FormData.EffectiveTillMonth, 'Required', valid);
        return valid;
    },
    ExportToExcelUasgeAndEmissionReportGrid: function (tableName, type) {
        $("" + tableName + "_length select option:last").attr("selected", "selected").change();
        UsageAndEmissionReport.ExportToExcelUasgeAndEmissionReport(tableName, type);
    },
    ExportToExcelUasgeAndEmissionReport: function (tableName, type) {
        var fulltableName = 'Table';
        $(tableName).find('template').each(function (index, data) {
            fulltableName = $(this).html().trim();
        });
        UsageAndEmissionReport.tableToExcelUasgeAndEmissionReport(tableName.slice(1), fulltableName, fulltableName + '.xls');
    },
    tableToExcelUasgeAndEmissionReport: function (table, sheetName, fileName) {
        var ua = window.navigator.userAgent;
        var msie = ua.indexOf("MSIE ");
        if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./))      // If Internet Explorer
        {
            return fnExcelReport(table, fileName);
        }

        var uri = 'data:application/vnd.ms-excel;base64,',
            templateData = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--><meta http-equiv="content-type" content="text/plain; charset=UTF-8"/></head><body><table>{table}</table></body></html>',
            base64Conversion = function (s) { return window.btoa(unescape(encodeURIComponent(s))) },
            formatExcelData = function (s, c) { return s.replace(/{(\w+)}/g, function (m, p) { return c[p]; }) }

        $("tbody > tr[data-level='0']").show();

        if (!table.nodeType)
            table = document.getElementById(table)

        var exportInnerHtml = table.innerHTML.replace(/style="display:none;"|style="display: none;"|style="display:"/g, "");
        var ctx = { worksheet: sheetName || 'Worksheet', table: exportInnerHtml }

        var element = document.createElement('a');
        element.setAttribute('href', 'data:application/vnd.ms-excel;base64,' + base64Conversion(formatExcelData(templateData, ctx)));
        element.setAttribute('download', fileName);
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);

        $("tbody > tr[data-level='0']").hide();
    },
}