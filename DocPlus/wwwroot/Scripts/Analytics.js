/// <reference path="../js/Common.js" />
var _globalChartData = [];
var barIndexValue = 0;
var GlobalJsonDataBuilding = [];
var GlobalJsonDataEmission = [];
var GlobalJsonDataCombineEmission = [];
var GlobalJsonDataUtilityAccount = [];
var IsViewChart = '';
var LableStringName = '';
var flagAccessEmission = false;
var flagAccessCostUsage = false;
var flagAccessCostSqFt = false;
var monthName = '';
var CustomerName = '';
var ClickFlag = '';
var CanvasCount = 0;
var CanvasCountX = 0;
var TabFlag = '';
var color = ['#003f5c', '#ff7c43', '#ffa600', '#f95d6a', '#665191','#2f4b7c']


var ddlTypeWiseView = [
    { "value": "1", "text": "Monthly" },
    { "value": "2", "text": "Building" },
    { "value": "3", "text": "Utility account" }
];

$(document).ready(function () {
    //$(".AccessEmission").hide();
    //$(".AccessCostUsage").hide();
    //$(".AccessCostSqFt").hide();

    Reload_ddl_Global_staticData(null, "#ddlTypeWiseViewSearch", "/AjaxCommon/GetStatusDDL", null, "Select", ddlTypeWiseView, function () { $("#ddlTypeWiseViewSearch").select2(); });
    $("#ddlTypeWiseViewSearch").val(1).trigger("change");

    $(".date-picker").datepicker({
        autoclose: true, todayHighlight: true, format: 'M-yyyy', viewMode: "months", minViewMode: "months"
    });

    $("#txtvalidFrom").val(CommonTodayDate.addDays(-365));
    $("#txtvalidFrom").datepicker("update", CommonTodayDate.addDays(-365));

    $("#txtvalidUntil").val(CommonTodayDate.mmddyyyy());
    $('#txtvalidUntil').datepicker("update", CommonTodayDate.mmddyyyy());

    $("#ddlCustomerSearch").select2();
    $("#ddlUtilitySearch").select2();
    $("#ddlBuildingSearch").select2();
    $("#ddlAccountSearch").select2();
    $("#ddlCommoditySearch").select2();
    $("#ddlMeterSearch").select2();

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
                    //Reload_ddl_Global(null, "#ddlAccountSearch", "/AjaxCommon/GetUtilityAccountDDLForChart", { BuildingIDs: "null", CommodityIDs: $("#ddlCommoditySearch").val().join(',') }, "Select", function (data) {
                    //    $("#ddlAccountSearch").select2();
                    //    //Analytics.BindMeterDDLForSearch();
                    //});
                    Analytics.BindBuildingDDLForSearch();
                    Analytics.BindData();
                });
            });

        }
    });

    google.load("visualization", "1", {
        packages: ["corechart"]
    });

    google.charts.load('current', { 'packages': ['line', 'corechart'] });

});

var Analytics = {
    //-==============================Tab Wise Start=================================
    BindData: function () {
        if (TabFlag == '' || TabFlag == 'IsUsageData') {
            flag = Analytics.ScreenAccessPermission();
            if (flag.AccessCostUsage)
                $('#TabViews').click();
            else if (flag.AccessEmission)
                $('#TabViews1').click();
            else if (flag.AccessCostSqFt)
                $('#TabViews2').click();
        }
        else if (TabFlag == 'IsEmission') {
            $('#TabViews1').click();
        }
        else if (TabFlag == 'IsCostPSFT') {
            $('#TabViews2').click();
        }
        // Analytics.BindActionData('IsUsageData', 'UsageData', 'Usage Data');
        //Analytics.GetMonthalyAnalyticsUsageData();
    },

    BindActionData: function (ActionString, ChartTitle, Chart) {
        Reset_Form_Errors();
        var FormData = Analytics.GetData();
        CustomerName = '';
        CustomerName = IsNotNull($("#ddlCustomerSearch :selected").text()) ? $("#ddlCustomerSearch :selected").text() : '';
        monthName = '';
        monthName = '' + (IsNotNull(FormData.EffectiveFromDate) ? FormData.EffectiveFromDate : '') + '_to_' + (IsNotNull(FormData.EffectiveTillDate) ? FormData.EffectiveTillDate : '');
        $("#EmissionChartDiv,#CostUsageChart,#CostPSFTChart").html('');
        if (ActionString == 'IsUsageData') {
            TabFlag = 'IsUsageData';
            $("#DivEmissionChart,#DivCostPSFTChart").hide();
            $("#CostUsageChartDiv").html('');
            $("#divCostUsage").show();
            if (Analytics.ValidateData(FormData)) {
                if (FormData.TypeWiseViewID == 1) {
                    Analytics.GetMonthalyAnalyticsUsageData();
                }
                else if (FormData.TypeWiseViewID == 2) {
                    // Analytics.bindBuildingData();
                    Analytics.bindBuildingCostUsageData();
                }
                else if (FormData.TypeWiseViewID == 3) {
                    Analytics.bindCostUsageAccountNumberData();
                    //Analytics.bindAccountNumberData();
                }
            }
        }
        else if (ActionString == 'IsEmission') {
            TabFlag = 'IsEmission';
            //$("#EmissionChartDiv").html('');
            if (Analytics.ValidateData(FormData)) {
                $("#DivCostUsageChart,#DivCostPSFTChart").hide();
                $("#DivEmissionChart").show();
                if (FormData.TypeWiseViewID == 1) {
                    Analytics.MonthlyEmissionChartData();
                }
                else if (FormData.TypeWiseViewID == 2) {
                    Analytics.bindBuildingEmissionData();
                }
                else if (FormData.TypeWiseViewID == 3) {
                    Analytics.bindEmissionAccountNumberData();
                }
            }
        }
        else if (ActionString == 'IsCostPSFT') {
            TabFlag = 'IsCostPSFT';
            $("#DivCostUsageChart,#DivEmissionChart").hide();
            //$("#EmissionChartDiv").html('');
            if (Analytics.ValidateData(FormData)) {
                $("#DivCostPSFTChart").show();
                if (FormData.TypeWiseViewID == 1) {
                    Analytics.MonthlyCostPSFTChartData();
                }
                else if (FormData.TypeWiseViewID == 2) {
                    Analytics.bindBuildingCostPSFTData();
                    //Analytics.bindBuildingCostPSFTData();
                }
                else if (FormData.TypeWiseViewID == 3) {
                    //Analytics.bindAccountNumberCostPSFTData();
                    Analytics.bindCostPSFTAccountNumberData();
                }
            }
        }
    },
    //=============================== Tab Cost/Usage =================================

    GetMonthalyAnalyticsUsageData() {
        $("#CostUsageChartDiv").html('');
        var FormData = Analytics.GetData();
        var monthNameArray = [];

        if (Analytics.ValidateData(FormData)) {
            $('.loadercontainer').show();
            GetAjaxData("/UsageData/GetUsageDataForChart", { Model: FormData }, function (data) {
                var JsonData = data.data;
                var JsonDataCommodity;
                var Count = 0;
                try {
                    if (IsNotNull(JsonData)) {
                        Analytics.ClearData();
                        let CommodityList = [];

                        $(JsonData).each(function (i, item) {
                            CommodityList.push(item.commodityName);
                        });

                        JsonDataCommodity = [...new Set(CommodityList)];

                        $.each(JsonDataCommodity, function (ComIndex, ComValue) {
                            var UOMCode = null;
                            var Currency = null;

                            let costArray = [];
                            let usageArray = [];
                            var TableDataChart = [];

                            var filteredJsonData = $.grep(JsonData, function (j) { return j.commodityName == ComValue });
                            monthNameArray = [];
                            $.each(filteredJsonData, function (index, item) {
                                if (item.totalCost != 0 || item.totalVolume != 0) {
                                    $.each(item, function (itemKey, itemValue) {

                                        if (itemKey == "totalCost") {
                                            costArray.push(itemValue);
                                        }
                                        else if (itemKey == "totalVolume") {
                                            usageArray.push(itemValue);
                                        }
                                        else if (itemKey == "uomCode") {
                                            UOMCode = itemValue;
                                        }
                                        else if (itemKey == "currency") {
                                            Currency = itemValue;
                                        }
                                    });
                                    //monthNameArray.push(itemValue);
                                    monthNameArray.push(Month[item.monthNumber - 1] + ' ' + item.monthYear);
                                }
                            });
                            // usage Table data
                            TableDataChart.push({
                                label: 'Usage',
                                data: usageArray,
                            });

                            // Cost Table data
                            TableDataChart.push({
                                label: 'Cost',
                                data: costArray,
                            });

                            if (IsNotNull(monthNameArray)) {
                                Count++;
                                $("#CostUsageChart").append(`<div><lable style="font-weight: bold;">` + ComValue + ` : Cost V/S Usage</lable>
                                <a href="javascript:;" id="download`+ ComValue + `" style="float: right;background-color: #f7f8fa;display:none;" class="btn btn-sm btn-clean btn-icon btn-icon-md" title="Excel Export" onclick="ExportToExcelGrid('#tblCostUsage` + ComValue + `','excel')"><i class="fa fa-file-excel" style="color:#555"></i> </a>
                                    <label class="switch" style="margin-left: .5rem;margin-right: 5px;">
                                    <input id="chk`+ ComValue + `" type="checkbox" onchange="Analytics.ToggleChartToTable('` + ComValue + `','');" />
                                        <div class="slider round" style="background-color:#555;">
                                            <span class="on">
                                                <i class="fa fa-chart-line fa-2x" aria-hidden="true"></i>
                                            </span>
                                            <span class="off">
                                                <i class="fa fa-table fa-2x" aria-hidden="true"></i>
                                            </span>
                                        </div>
                                    </label>
                                    </div>
                                    <div id="EmissionGraph`+ ComValue + `">
                                     <canvas id="chartCanvas`+ ComValue + `" style="height:400px" class="table"></canvas></div>
                                    </div>
                                     <div id="container`+ ComValue + `" style="display:none;" class="table-responsive"></div>
                                    </br>
                                    `);


                                if ((JsonDataCommodity.length - 1) > ComIndex) {
                                    $("#chartCanvas" + ComValue).after(`<hr/>`);
                                }
                                var canvas = document.getElementById('chartCanvas' + ComValue);

                                var CanvasData = new Chart(canvas, {
                                    type: 'bar',
                                    data: {
                                        labels: monthNameArray,
                                        datasets: [{
                                            yAxisID: 'Cost',
                                            label: "Cost",
                                            backgroundColor: "rgba(0, 63, 92,1)",
                                            borderColor: "#003f5c",
                                            borderWidth: 2,
                                            hoverBackgroundColor: "rgba(0, 63, 92,1)",
                                            hoverBorderColor: "rgba(0, 168, 83,1)",
                                            data: costArray,

                                        }, {
                                            yAxisID: 'Usage',
                                            label: "Usage",
                                            backgroundColor: "rgba(255, 166, 0,1)",
                                                borderColor: "#ffa600",
                                            borderWidth: 2,
                                            hoverBackgroundColor: "rgba(255, 166, 0,1)",
                                                hoverBorderColor: "#ffa600",
                                            data: usageArray,
                                        }]
                                    },
                                    options: {
                                        //responsive: true,
                                        //maintainAspectRatio: false,
                                        animation: false,
                                        title: {
                                            display: true,
                                        },
                                        tooltips: {
                                            enabled: true,
                                            mode: 'single',
                                            callbacks: {
                                                label: function (tooltipItem, data) {
                                                    //var label = data.labels[tooltipItem.index];
                                                    var datasetLabel = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
                                                    return addCommas(datasetLabel);
                                                }
                                            }
                                        },
                                        scales: {
                                            yAxes: [{
                                                id: 'Cost',
                                                type: 'linear',
                                                position: 'left',
                                                scaleLabel: {
                                                    display: true,
                                                    labelString: "Cost (" + Currency + ")",
                                                    //fontStyle: 'italic'
                                                },
                                                ticks: { callback: function (costValue) { return addCommas(costValue) } }
                                            }, {
                                                id: 'Usage',
                                                type: 'linear',
                                                position: 'right',
                                                scaleLabel: {
                                                    display: true,
                                                    labelString: "Usage (" + UOMCode + ")",
                                                    //fontStyle: 'italic'
                                                },
                                                ticks: { callback: function (usageValue) { return addCommas(usageValue) } }
                                            }]
                                        },
                                        legend: {
                                            onClick: function (event, legendItem) {
                                                //get the index of the clicked legend
                                                var index = legendItem.datasetIndex;
                                                //toggle chosen dataset's visibility
                                                CanvasData.data.datasets[index].hidden =
                                                    !CanvasData.data.datasets[index].hidden;
                                                //toggle the related labels' visibility
                                                CanvasData.options.scales.yAxes[index].display =
                                                    !CanvasData.options.scales.yAxes[index].display;
                                                CanvasData.update();
                                            }
                                        }
                                    }
                                });

                                Analytics.tableBindData(monthNameArray, TableDataChart, 'CostUsage', 'CostVSUsage', ComValue, UOMCode);
                            }
                        });
                        if (Count == 0)
                            showSweetAlert("Warning!", "No data found!", "warning", null);

                    }
                    else {
                        $('.loadercontainer').hide();
                        showSweetAlert("Warning!", "No data found!", "warning", null);
                    }
                } catch (e) {
                    $('.loadercontainer').hide();
                    printError("Analytics.js", 'GetDataByID', e);
                }
                $('.loadercontainer').hide();
            }, function () {
                $('.loadercontainer').hide();
            });
        }
    },

    bindBuildingCostUsageData: function () {
        var Y1ScalesData = [];
        var Y2ScalesData = [];
        var TableDataChart = [];
        var Count = 0;
        $("#CostPSFTChart").html('');
        IsViewChart = 'buildingName';
        LableStringName = 'Building Code'
        var indexvalue = 0;
        barIndexValue = 0;
        Reset_Form_Errors();
        var FormData = Analytics.GetData();
        if (Analytics.ValidateData(FormData)) {
            $('.loadercontainer').show();
            GetAjaxData("/UsageData/GetUsageAndCostBuildingWiseDashboard", FormData, function (data) {
                var JsonData = data.data;
                var JsonDataCommodity;
                if (IsNotNull(JsonData)) {
                    GlobalJsonDataBuilding = [];
                    GlobalJsonDataBuilding = JsonData;
                    $("#DivCostPSFTChart").show();

                    let CommodityList = [];

                    $(JsonData).each(function (i, item) {
                        CommodityList.push(item.commodityName);
                    });

                    JsonDataCommodity = [...new Set(CommodityList)];

                    $.each(JsonDataCommodity, function (ComIndexBW, ComValueBW) {
                        let startIndexvalue = 0;
                        let lastIndexValue = 0;
                        if (indexvalue === 0) {
                            startIndexvalue = 0;
                            lastIndexValue = 10;
                        }
                        else {
                            startIndexvalue = indexvalue * 10;
                            lastIndexValue = Number(startIndexvalue) + 10;
                        }

                        Y1ScalesData = [];
                        Y2ScalesData = [];
                        TableDataChart = [];

                        DataChart = [];
                        var BuildingCostPSFTData = $.grep(JsonData, function (j) { return j.commodityName == ComValueBW });

                        var BuildingCodeArray = [];
                        var labels = [];
                        var Displaylabels = [];
                        var Currency = '';
                        var UOMCode = '';
                        //$.each(EmissionDate, function (index, item) {
                        //    labels.push(Month[item.month - 1] + ' ' + item.year);
                        //});
                        $(BuildingCostPSFTData).each(function (i, item) {
                            BuildingCodeArray.push(item.buildingName);
                        });

                        labels = [...new Set(BuildingCodeArray)];

                        var ChartData1 = [];
                        var ChartData2 = [];
                        var TUsageData = [];
                        var TCostData = [];
                        var TDisplaylabels = [];

                        ChartData1 = [];
                        ChartData2 = [];
                        ChartData2 = [];
                        TUsageData = [];
                        var flag = true;
                        $.each(labels, function (index3, item1) {

                            //Table Data 
                            $.each(BuildingCostPSFTData, function (index1, item2) {
                                if (item1 == item2.buildingName) {
                                    TUsageData.push(item2.usage);
                                    TCostData.push(item2.cost);
                                }
                            });
                            TDisplaylabels.push(item1);
                            // Table End

                            if (startIndexvalue <= index3 && lastIndexValue > index3) {
                                flag = true;
                                $.each(BuildingCostPSFTData, function (index1, item2) {
                                    if (startIndexvalue <= index1 && lastIndexValue > index1) {
                                        ChartData1.push(item2.usage);
                                        ChartData2.push(item2.cost);
                                        Currency = item2.currency;
                                        UOMCode = item2.uomCode;
                                        flag = false;
                                    }
                                });
                                Displaylabels.push(item1);
                            }
                        });

                        // usage Table data
                        TableDataChart.push({
                            label: 'Usage',
                            data: TUsageData,
                        });

                        // Cost Table data
                        TableDataChart.push({
                            label: 'Cost',
                            data: TCostData,
                        });

                        DataChart.push({
                            yAxisID: 'A',
                            label: 'Cost',
                            borderWidth: 2,
                            data: ChartData2,
                            backgroundColor: "#003f5c",
                            borderColor: "#003f5c",
                            borderWidth: 2,
                            hoverBackgroundColor: "#003f5c",
                            hoverBorderColor: "#003f5c",
                            //borderColor: dynamicColors(),
                            ticks: {
                                precision: 0,
                                //callback: function (costValue) { return (costValue) },
                                beginAtZero: true,
                                fontSize: 16
                            }
                        });
                        Y1ScalesData.push('Cost (' + Currency + ')');

                        DataChart.push({
                            yAxisID: 'B',
                            label: 'Usage',
                            //borderWidth: 2,
                            data: ChartData1,
                            backgroundColor: "#ffa600",
                            borderColor: "#ffa600",
                            borderWidth: 2,
                            hoverBackgroundColor: "#ffa600",
                            hoverBorderColor: "#ffa600",
                            ticks: {
                                precision: 0,
                                //callback: function (costValue) { return (costValue) },
                                beginAtZero: true,
                                fontSize: 16
                            }
                        });
                        Y2ScalesData.push('Usage (' + UOMCode + ')');

                        $("#CostUsageChart").append(`<div><lable style="font-weight: bold;">` + ComValueBW + ` : Cost V/S Usage</lable>
                           <a href="javascript:;" id="download`+ ComValueBW + `" style="float: right;background-color: #f7f8fa;display:none;" class="btn btn-sm btn-clean btn-icon btn-icon-md" title="Excel Export" onclick="ExportToExcelGrid('#tblCostUsage` + ComValueBW + `','excel')"><i class="fa fa-file-excel" style="color:#555"></i> </a>
                                    <label class="switch" style="margin-left: .5rem;margin-right: 5px;">
                                    <input id="chk`+ ComValueBW + `" type="checkbox" onchange="Analytics.ToggleChartToTable('` + ComValueBW + `','');" />
                                        <div class="slider round" style="background-color:#555;">
                                            <span class="on">
                                                <i class="fa fa-chart-line fa-2x" aria-hidden="true"></i>
                                            </span>
                                            <span class="off">
                                                <i class="fa fa-table fa-2x" aria-hidden="true"></i>
                                            </span>
                                        </div>
                                    </label>
                                    </div>
                         <div id="EmissionGraph`+ ComValueBW + `">
                            <canvas id="chart_canvas`+ ComValueBW + `" style="height:400px" class="table"></canvas>
                            <div class="row" id="BuildingDivID`+ ComValueBW + `">
                                <div class="col-xs-12 col-md-3 col-lg-3"></div>
                                <div class="col-xs-12 col-md-4 col-lg-4">
                                    <div style="margin-left: 0%;margin-top: 0%;">
                                    <input id="btnPervious` + ComValueBW + `" class="btn btn-info btn-elevate btn-pill btn-sm" type="button" onclick="Analytics.btnPerviousCostPSFT('` + ComValueBW + `','` + startIndexvalue + `','` + lastIndexValue + `')" value="Previous">
                                    <input id="btnNext` + ComValueBW + `" class="btn btn-info btn-elevate btn-pill btn-sm" type="button" onclick="Analytics.btnNextCostPSFT('` + ComValueBW + `','` + lastIndexValue + `','` + (Number(lastIndexValue) + 10) + `')" value="Next">
                                    <input type="hidden" id="hf_barIndexValue` + ComValueBW + `" value="0">
                                    </div>
                                </div></div ></div >
                         <div id="container`+ ComValueBW + `" style="display:none" class="table-responsive"></div>
                         </br >
                         `);


                        if ((JsonDataCommodity.length - 1) > ComIndexBW) {
                            $("#EmissionChartDiv" + ComValueBW).after(`<hr/>`);
                        }

                        if (startIndexvalue == 0) {
                            $("#btnPervious" + ComValueBW).attr("disabled", true);
                        }
                        else {
                            $("#btnPervious" + ComValueBW).attr("disabled", false);
                        }

                        if (BuildingCostPSFTData.length <= 10) {
                            $("#btnNext" + ComValueBW).attr("disabled", true);
                        }
                        else {
                            $("#btnNext" + ComValueBW).attr("disabled", false);
                        }

                        if ((JsonDataCommodity.length - 1) > ComIndexBW) {
                            ///$("#Barchart_canvas" + ComValueBW).after(`<hr/>`);
                            $("#BuildingDivID" + ComValueBW).after(`<hr/>`);
                        }

                        var canvas = document.getElementById('chart_canvas' + ComValueBW);
                        var CanvasData = new Chart(canvas, {
                            type: 'bar',
                            data: {
                                labels: Displaylabels,
                                datasets: DataChart
                            },
                            options: {
                                responsive: true,
                                //maintainAspectRatio: false,
                                title: {
                                    display: true,
                                },
                                tooltips: {
                                    enabled: true,
                                    mode: 'single',
                                    callbacks: {
                                        label: function (tooltipItem, data) {
                                            //var label = data.labels[tooltipItem.index];
                                            var datasetLabel = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
                                            return addCommas(datasetLabel);
                                        }
                                    }
                                },
                                scales: {
                                    yAxes: [{
                                        id: 'A',
                                        type: 'linear',
                                        position: 'left',
                                        scaleLabel: {
                                            display: true,
                                            labelString: Y1ScalesData,
                                            fontSize: 12
                                            //fontStyle: 'italic'
                                        },
                                        ticks: { callback: function (costValue) { return addCommas(costValue) } }
                                    },
                                    {
                                        id: 'B',
                                        type: 'linear',
                                        position: 'right',
                                        scaleLabel: {
                                            display: true,
                                            labelString: Y2ScalesData,
                                            fontSize: 12
                                            //fontStyle: 'italic'
                                        },
                                        ticks: { callback: function (costValue) { return addCommas(costValue) } }
                                    }],
                                    xAxes: [{
                                        scaleLabel: {
                                            display: true,
                                            labelString: LableStringName,
                                            fontSize: 16
                                            //fontStyle: 'italic'
                                        },
                                    }]
                                },
                                legend: {
                                    onClick: function (event, legendItem) {
                                        //get the index of the clicked legend
                                        var index = legendItem.datasetIndex;
                                        //toggle chosen dataset's visibility
                                        CanvasData.data.datasets[index].hidden =
                                            !CanvasData.data.datasets[index].hidden;
                                        //toggle the related labels' visibility
                                        CanvasData.options.scales.yAxes[index].display =
                                            !CanvasData.options.scales.yAxes[index].display;
                                        CanvasData.update();
                                    }
                                }

                            }
                        });

                        Analytics.tableBindData(TDisplaylabels, TableDataChart, 'CostUsage', 'CostVSUsage', ComValueBW, UOMCode);

                    });
                }
                else {
                    $('.loadercontainer').hide();
                    showSweetAlert("Warning!", "No data found!", "warning", null);
                }
                $('.loadercontainer').hide();
            }, function () {
                $('.loadercontainer').hide();
            });
        }
    },

    bindCostUsageAccountNumberData: function () {
        var Y1ScalesData = [];
        var Y2ScalesData = [];
        var TableDataChart = [];
        $("#CostPSFTChart").html('');
        IsViewChart = 'utilityAccountNumber';
        LableStringName = 'Utility Account Number'
        var indexvalue = 0;
        barIndexValue = 0;
        Reset_Form_Errors();
        var FormData = Analytics.GetData();
        if (Analytics.ValidateData(FormData)) {
            $('.loadercontainer').show();
            GetAjaxData("/UsageData/GetUsageAndCostAccountNumberWiseDashboard", FormData, function (data) {
                var JsonData = data.data;
                var JsonDataCommodity;
                if (IsNotNull(JsonData)) {
                    GlobalJsonDataBuilding = [];
                    GlobalJsonDataBuilding = JsonData;
                    $("#DivCostPSFTChart").show();

                    let CommodityList = [];

                    $(JsonData).each(function (i, item) {
                        CommodityList.push(item.commodityName);
                    });

                    JsonDataCommodity = [...new Set(CommodityList)];

                    $.each(JsonDataCommodity, function (ComIndexBW, ComValueBW) {
                        let startIndexvalue = 0;
                        let lastIndexValue = 0;
                        if (indexvalue === 0) {
                            startIndexvalue = 0;
                            lastIndexValue = 10;
                        }
                        else {
                            startIndexvalue = indexvalue * 10;
                            lastIndexValue = Number(startIndexvalue) + 10;
                        }

                        Y1ScalesData = [];
                        Y2ScalesData = [];
                        TableDataChart = [];
                        DataChart = [];
                        var AccountNumberCostPSFTData = $.grep(JsonData, function (j) { return j.commodityName == ComValueBW });

                        var AcountNumberArray = [];
                        var labels = [];
                        var Displaylabels = [];
                        var TDisplaylabels = [];
                        var Currency = '';
                        var UOMCode = '';
                        //$.each(EmissionDate, function (index, item) {
                        //    labels.push(Month[item.month - 1] + ' ' + item.year);
                        //});
                        $(AccountNumberCostPSFTData).each(function (i, item) {
                            AcountNumberArray.push(item.utilityAccountNumber);
                        });

                        labels = [...new Set(AcountNumberArray)];

                        var ChartData1 = [];
                        var ChartData2 = [];
                        var TUsageData = [];
                        var TCostData = [];

                        ChartData1 = [];
                        ChartData2 = [];
                        TUsageData = [];
                        TCostData = [];
                        var flag = true;
                        $.each(labels, function (index3, item1) {

                            // Table Data Start
                            $.each(AccountNumberCostPSFTData, function (index1, item2) {
                                if (item1 == item2.utilityAccountNumber) {
                                    TUsageData.push(item2.usage);
                                    TCostData.push(item2.cost);
                                }
                            });
                            TDisplaylabels.push(item1);
                            // table data end
                            // graph data

                            if (startIndexvalue <= index3 && lastIndexValue > index3) {
                                flag = true;
                                $.each(AccountNumberCostPSFTData, function (index1, item2) {
                                    if (startIndexvalue <= index1 && lastIndexValue > index1) {
                                        ChartData1.push(item2.usage);
                                        ChartData2.push(item2.cost);
                                        Currency = item2.currency;
                                        UOMCode = item2.uomCode;

                                        flag = false;
                                    }
                                });
                                Displaylabels.push(item1);
                            }
                        });

                        // usage Table data
                        TableDataChart.push({
                            label: 'Usage',
                            data: TUsageData,
                        });

                        // Cost Table data
                        TableDataChart.push({
                            label: 'Cost',
                            data: TCostData,
                        });

                        DataChart.push({
                            yAxisID: 'A',
                            label: 'Cost',
                            borderWidth: 2,
                            data: ChartData2,
                            backgroundColor: "#003f5c",
                            borderColor: "#003f5c",
                            //borderWidth: 2,
                            hoverBackgroundColor: "#003f5c",
                            hoverBorderColor: "#003f5c",
                            //borderColor: dynamicColors(),
                            ticks: {
                                precision: 0,
                                //callback: function (costValue) { return (costValue) },
                                beginAtZero: true,
                                fontSize: 16
                            }
                        });
                        Y1ScalesData.push('Cost (' + Currency + ')');

                        DataChart.push({
                            yAxisID: 'B',
                            label: 'Usage',
                            //borderWidth: 2,
                            data: ChartData1,
                            backgroundColor: "#ffa600",
                            borderColor: "#ffa600",
                            borderWidth: 2,
                            hoverBackgroundColor: "#ffa600",
                            hoverBorderColor: "#ffa600",
                            ticks: {
                                precision: 0,
                                //callback: function (costValue) { return (costValue) },
                                beginAtZero: true,
                                fontSize: 16
                            }
                        });
                        Y2ScalesData.push('Usage (' + UOMCode + ')');

                        $("#CostUsageChart").append(`<div><lable style="font-weight: bold;">` + ComValueBW + ` : Cost V/S Usage</lable>
                            <a href="javascript:;" id="download`+ ComValueBW + `" style="float: right;background-color: #f7f8fa;display:none;" class="btn btn-sm btn-clean btn-icon btn-icon-md" title="Excel Export" onclick="ExportToExcelGrid('#tblAccountNumber` + ComValueBW + `','excel')"><i class="fa fa-file-excel" style="color:#555"></i> </a>
                                    <label class="switch" style="margin-left: .5rem;margin-right: 5px;">
                                    <input id="chk`+ ComValueBW + `" type="checkbox" onchange="Analytics.ToggleChartToTable('` + ComValueBW + `','');" />
                                        <div class="slider round" style="background-color:#555;">
                                            <span class="on">
                                                <i class="fa fa-chart-line fa-2x" aria-hidden="true"></i>
                                            </span>
                                            <span class="off">
                                                <i class="fa fa-table fa-2x" aria-hidden="true"></i>
                                            </span>
                                        </div>
                                    </label>
                                    </div>
                                    <div id="EmissionGraph`+ ComValueBW + `">
                                    <canvas id="chart_canvas`+ ComValueBW + `" style="height:400px" class="table"></canvas>
                                     <div class="row" id="BuildingDivID`+ ComValueBW + `">
                                     <div class="col-xs-12 col-md-3 col-lg-3"></div>
                                     <div class="col-xs-12 col-md-4 col-lg-4">
                                         <div style="margin-left: 0%;margin-top: 0%;">
                                             <input id="btnPervious` + ComValueBW + `" class="btn btn-info btn-elevate btn-pill btn-sm" type="button" onclick="Analytics.btnPerviousCostPSFT('` + ComValueBW + `','` + startIndexvalue + `','` + lastIndexValue + `')" value="Previous">
                                             <input id="btnNext` + ComValueBW + `" class="btn btn-info btn-elevate btn-pill btn-sm" type="button" onclick="Analytics.btnNextCostPSFT('` + ComValueBW + `','` + lastIndexValue + `','` + (Number(lastIndexValue) + 10) + `')" value="Next">
                                            <input type="hidden" id="hf_barIndexValue` + ComValueBW + `" value="0">
                                          </div>
                                     </div></div></div>
                                    <div id="container`+ ComValueBW + `" style="display:none" class="table-responsive"></div>
                         </br >
                        `);

                        if ((JsonDataCommodity.length - 1) > ComIndexBW) {
                            $("#EmissionChartDiv" + ComValueBW).after(`<hr/>`);
                        }

                        if (startIndexvalue == 0) {
                            $("#btnPervious" + ComValueBW).attr("disabled", true);
                        }
                        else {
                            $("#btnPervious" + ComValueBW).attr("disabled", false);
                        }

                        if (AccountNumberCostPSFTData.length <= 10) {
                            $("#btnNext" + ComValueBW).attr("disabled", true);
                        }
                        else {
                            $("#btnNext" + ComValueBW).attr("disabled", false);
                        }

                        if ((JsonDataCommodity.length - 1) > ComIndexBW) {
                            ///$("#Barchart_canvas" + ComValueBW).after(`<hr/>`);
                            $("#BuildingDivID" + ComValueBW).after(`<hr/>`);
                        }

                        var canvas = document.getElementById('chart_canvas' + ComValueBW);
                        var CanvasData = new Chart(canvas, {
                            type: 'bar',
                            data: {
                                labels: Displaylabels,
                                datasets: DataChart
                            },
                            options: {
                                responsive: true,
                                //maintainAspectRatio: false,
                                title: {
                                    display: true,
                                },
                                tooltips: {
                                    enabled: true,
                                    mode: 'single',
                                    callbacks: {
                                        label: function (tooltipItem, data) {
                                            //var label = data.labels[tooltipItem.index];
                                            var datasetLabel = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
                                            return addCommas(datasetLabel);
                                        }
                                    }
                                },
                                scales: {
                                    yAxes: [{
                                        id: 'A',
                                        type: 'linear',
                                        position: 'left',
                                        scaleLabel: {
                                            display: true,
                                            labelString: Y1ScalesData,
                                            fontSize: 12
                                            //fontStyle: 'italic'
                                        },
                                        ticks: { callback: function (costValue) { return addCommas(costValue) } }

                                    },
                                    {
                                        id: 'B',
                                        type: 'linear',
                                        position: 'right',
                                        scaleLabel: {
                                            display: true,
                                            labelString: Y2ScalesData,
                                            fontSize: 12
                                            //fontStyle: 'italic'
                                        },
                                        ticks: { callback: function (costValue) { return addCommas(costValue) } }

                                    }],
                                    xAxes: [{
                                        scaleLabel: {
                                            display: true,
                                            labelString: LableStringName,
                                            fontSize: 16
                                            //fontStyle: 'italic'
                                        },
                                    }]
                                },
                                legend: {
                                    onClick: function (event, legendItem) {
                                        //get the index of the clicked legend
                                        var index = legendItem.datasetIndex;
                                        //toggle chosen dataset's visibility
                                        CanvasData.data.datasets[index].hidden =
                                            !CanvasData.data.datasets[index].hidden;
                                        //toggle the related labels' visibility
                                        CanvasData.options.scales.yAxes[index].display =
                                            !CanvasData.options.scales.yAxes[index].display;
                                        CanvasData.update();
                                    }
                                }

                            }
                        });

                        Analytics.tableBindData(TDisplaylabels, TableDataChart, 'AccountNumber', 'CostVSUsage', ComValueBW, UOMCode);
                    });
                }
                else {
                    $('.loadercontainer').hide();
                    showSweetAlert("Warning!", "No data found!", "warning", null);
                }
                $('.loadercontainer').hide();
            }, function () {
                $('.loadercontainer').hide();
            });
        }
    },


    //=============================== Tab Cost/Usage End =================================
    //=============================== Tab Emission =================================

    MonthlyEmissionChartData: function () {
        //$("#divChartHolder").html('');
        $("#divCostUsage").hide();
        $("#DivEmissionChart").show();
        $("#EmissionChartDiv").html('');
        var DataChart = [];
        var TableDataChart = [];
        var Y1ScalesData = [];
        var Y2ScalesData = [];


        Reset_Form_Errors();
        var FormData = Analytics.GetData();
        //if (Analytics.ValidateData(FormData)) {
        $('.loadercontainer').show();
        GetAjaxData("/UsageData/GetEmissionChart", FormData, function (data) {
            var JsonData = data.data;
            var JsonDataCommodity;
            var UomCode = '';
            if (IsNotNull(JsonData) && IsNotNull(JsonData.emissionValue) && IsNotNull(JsonData.emissionVariable)) {
                $("#DivEmissionChart").show();

                let CommodityList = [];


                $(JsonData.emissionVariable).each(function (i, item) {
                    CommodityList.push(item.commodityName);
                });

                JsonDataCommodity = [...new Set(CommodityList)];
                // Combine graph Call
                Analytics.MonthlyEmissionCombineGraph(JsonData, JsonDataCommodity);
                $.each(JsonDataCommodity, function (ComIndex, ComValue) {
                    Y1ScalesData = [];
                    Y2ScalesData = [];
                    DataChart = [];
                    TableDataChart = [];
                    var filteredVariableData = $.grep(JsonData.emissionVariable, function (j) { return j.commodityName == ComValue });
                    var EmissionData = $.grep(JsonData.emissionValue, function (j) { return j.commodityName == ComValue });
                    var EmissionDate = JsonData.emissionDate;

                    var UomCode = '';

                    var labels = [];
                    var Displaylables = [];
                    var DisplaylablesTab = [];
                    $.each(EmissionDate, function (index, item) {
                        labels.push(Month[item.month - 1] + ' ' + item.year);
                        UomCode = item.uomCode;
                    });

                    var TableEmissionData = [];
                    var ChartData1 = [];
                    var ChartData2 = [];
                    //var backgroundColor = [];
                    $.each(filteredVariableData, function (index, item) {
                        //backgroundColor.push(getRandomColor());
                        if (IsNotNull(EmissionData)) {
                            var data1 = $.grep(EmissionData, function (i) {
                                return item.variableID === i.variableID
                            });

                            TableEmissionData = [];
                            TableUsageData = [];
                            ChartData1 = [];       
                            ChartData2 = [];
                            var flag = true;
                            $.each(labels, function (index, item1) {
                                flag = true;
                                flag1 = true;
                                $.each(data1, function (index1, item2) {
                                    UomCode = item2.uomCode;
                                    var label1 = Month[item2.month - 1] + ' ' + item2.year.toString();
                                    if (item1 == label1) {
                                        if (item2.emission != 0) {
                                            if (item.displayAxis == 1) {
                                                ChartData1.push(Math.round(item2.emission));
                                                flag = false;
                                            }
                                            else {
                                                ChartData2.push(Math.round(item2.emission));
                                                flag = false;
                                            }
                                            Displaylables.push(item1);
                                        }
                                        TableEmissionData.push(Math.round(item2.emission));
                                        TableUsageData.push(item2.usage);

                                        flag1 = false;
                                    }
                                    if (!flag1)
                                        DisplaylablesTab.push(item1);
                                });
                                if (flag) {
                                    if (item.displayAxis == 1) {
                                        ChartData1.push(0);
                                        //TableEmissionData.push(0);
                                        //TableUsageData.push(0);
                                    }
                                    else {
                                        ChartData2.push(0);
                                        //TableEmissionData.push(0);
                                        //TableUsageData.push(0);
                                    }
                                }

                            });
                        }
                        else {
                            $.each(labels, function (index1, item1) {
                                ChartData1.push(0);
                                ChartData2.push(0);
                                TableEmissionData.push(0);
                            });
                        }
                        var dynamicColors = function () {
                            var r = Math.floor(Math.random() * 190);
                            var g = Math.floor(Math.random() * 190);
                            var b = Math.floor(Math.random() * 190);
                            return "rgb(" + r + "," + g + "," + b + ")";
                        }
                        var VariableName = item.variableDescription.split(" ")[1];
                        //var CommodityName = $("#ddlCommoditySearch option:selected").text();
                        //var Commodityunit = "";
                        //if (CommodityName.toLowerCase() == "electric" ) {
                        //    Commodityunit = "KWH";
                        //}
                        TableDataChart.push({
                            label: VariableName,
                            data: TableEmissionData,
                            UsageData: TableUsageData
                        });
                        debugger
                        if (item.displayAxis == 1) {
                            DataChart.push({
                                yAxisID: 'A',
                                label: VariableName,
                                hidden: item.defaultVariable ? false : true,
                                display: false,
                                borderWidth: 2,
                                data: ChartData1,
                                backgroundColor: color[index],
                                fill: false,
                                lineTension: 0.1,
                                borderColor: color[index],
                                ticks: {
                                    precision: 0,
                                    //callback: function (costValue) { return (costValue) },
                                    beginAtZero: true,
                                    fontSize: 16
                                } 
                            });
                            Y1ScalesData.push(VariableName);
                        }
                        else {
                            DataChart.push({
                                yAxisID: 'B',
                                label: VariableName,
                                borderWidth: 2,
                                data: ChartData2,
                                backgroundColor: color[index],
                                fill: false,
                                hidden: item.defaultVariable ? false : true,
                                display: false,
                                lineTension: 0.1,
                                borderColor: color[index],
                                ticks: {
                                    precision: 0,
                                    //callback: function (costValue) { return (costValue) },
                                    beginAtZero: true,
                                    fontSize: 16
                                }
                            });
                            Y2ScalesData.push(VariableName);
                        }

                    });
                    Displaylables = [...new Set(Displaylables)];
                    DisplaylablesTab = [...new Set(DisplaylablesTab)];
                    if (IsNotNull(Displaylables)) {
                        //$("#EmissionChartDiv").html('');
                        $("#EmissionChartDiv").append(`<div><lable style="font-weight: bold;">` + ComValue + ` : Emission(M.Tons)</lable>
                    <a href="javascript:;" id="download`+ ComValue + `" style="float: right;background-color: #f7f8fa;display:none;" class="btn btn-sm btn-clean btn-icon btn-icon-md" title="Excel Export" onclick="ExportToExcelGrid('#tblEmission` + ComValue + `','excel')"><i class="fa fa-file-excel" style="color:#555"></i> </a>
                        <label class="switch" style="margin-left: .5rem;margin-right: 5px;">
                            <input id="chk`+ ComValue + `" type="checkbox" onchange="Analytics.ToggleChartToTable('` + ComValue + `');" />
                            <div class="slider round" style="background-color:#555;">
                                <span class="on">
                                    <i class="fa fa-chart-line fa-2x" aria-hidden="true"></i>
                                </span>
                                <span class="off">
                                    <i class="fa fa-table fa-2x" aria-hidden="true"></i>
                                </span>
                            </div>
                        </label>
                    </div>
                    <div id="EmissionGraph`+ ComValue + `">
                    <canvas id="chartCanvas`+ ComValue + `" style="height:400px" class="table"></canvas>
                    </div>
                     <div id="container`+ ComValue + `" style="display:none;" class="table-responsive"></div>
                    </br>
                    `);

                        if ((JsonDataCommodity.length - 1) > ComIndex) {
                            $("#chartCanvas" + ComValue).after(`<hr/>`);
                        }
                        var canvas = document.getElementById('chartCanvas' + ComValue);

                        var CanvasData = new Chart(canvas, {
                            type: 'bar',
                            data: {
                                labels: Displaylables,
                                datasets: DataChart
                            },
                            options: {
                                responsive: true,
                                title: {
                                    display: true,
                                },
                                tooltips: {
                                    enabled: true,
                                    mode: 'single',
                                    callbacks: {
                                        label: function (tooltipItem, data) {
                                            //var label = data.labels[tooltipItem.index];
                                            var datasetLabel = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
                                            return addCommas(IsNotNull(datasetLabel) ? datasetLabel : 0);
                                        }
                                    }
                                },
                                scales: {
                                    yAxes: [{
                                        id: 'A',
                                        type: 'linear',
                                        //hidden: false,
                                        position: 'left',
                                        scaleLabel: {
                                            //display: true,
                                            labelString: "Emission (" + Y1ScalesData + ")",
                                            fontSize: 12
                                            //fontStyle: 'italic'
                                        },
                                        ticks: { callback: function (usageValue) { return addCommas(IsNotNull(usageValue) ? usageValue : 0.00) } }
                                    },
                                    {
                                        id: 'B',
                                        type: 'linear',
                                        //hidden: false,
                                        position: 'right',
                                        scaleLabel: {
                                            //display: true,
                                            labelString: Y2ScalesData.length != 0 ? "Emission (" + Y2ScalesData + ")" : "",
                                            fontSize: 12
                                            //fontStyle: 'italic'
                                        },
                                        ticks: { callback: function (usageValue) { return addCommas(IsNotNull(usageValue) ? usageValue : 0.00) } }
                                    }],
                                    xAxes: [{
                                        scaleLabel: {
                                            display: true,
                                            labelString: "Month",
                                            fontSize: 16
                                            //fontStyle: 'italic'
                                        },
                                    }]
                                },
                                legend: {
                                    onClick: function (event, legendItem) {
                                        debugger
                                        //get the index of the clicked legend
                                        var index = legendItem.datasetIndex;
                                        var axis = '';
                                        var Y1Count = [], Y2Count = [];
                                        $.each(CanvasData.data.datasets, function (index1, item1) {
                                            if (item1.yAxisID == 'A') {
                                                if (index == index1)
                                                    axis = item1.yAxisID;

                                                Y1Count.push(item1);
                                            }
                                            else {
                                                Y2Count.push(item1);
                                            }

                                        });

                                        if (axis == 'A') {
                                            if (Y1Count.length == 1) {
                                                CanvasData.data.datasets[index].hidden =
                                                    !CanvasData.data.datasets[index].hidden;
                                                //toggle the related labels' visibility
                                                CanvasData.options.scales.yAxes[index].display =
                                                    !CanvasData.options.scales.yAxes[index].display;
                                            }
                                            else {
                                                var Casshow = CanvasData.data.datasets[index].hidden;
                                                if (CanvasData.data.datasets[index].hidden == false || CanvasData.data.datasets[index].hidden == undefined) {
                                                    CanvasCountX = Number(CanvasCountX) + 1;
                                                }
                                                else if (CanvasData.data.datasets[index].hidden == true) {
                                                    CanvasCountX = Number(CanvasCountX) - 1;
                                                }
                                                else { }

                                                CanvasData.data.datasets[index].hidden =
                                                    !CanvasData.data.datasets[index].hidden;

                                                if ((CanvasCountX > 0 && CanvasCountX % 2 === 0) || (CanvasCountX > 0 && Casshow === true)) {
                                                    CanvasData.options.scales.yAxes[0].display =
                                                        !CanvasData.options.scales.yAxes[0].display;
                                                }
                                            }
                                            CanvasData.update();
                                        }

                                        else {
                                            if (Y2Count.length == 1) {
                                                CanvasData.data.datasets[index].hidden =
                                                    !CanvasData.data.datasets[index].hidden;
                                                //toggle the related labels' visibility
                                                CanvasData.options.scales.yAxes[index].display =
                                                    !CanvasData.options.scales.yAxes[index].display;
                                            }
                                            else {
                                                var Casshow = CanvasData.data.datasets[index].hidden;
                                                if (CanvasData.data.datasets[index].hidden == false || CanvasData.data.datasets[index].hidden == undefined) {
                                                    CanvasCount = Number(CanvasCount) + 1;
                                                }
                                                else if (CanvasData.data.datasets[index].hidden == true) {
                                                    CanvasCount = Number(CanvasCount) - 1;
                                                }
                                                else { }

                                                CanvasData.data.datasets[index].hidden =
                                                    !CanvasData.data.datasets[index].hidden;

                                                if ((CanvasCount > 0 && CanvasCount % 2 === 0) || (CanvasCount > 0 && Casshow === true)) {
                                                    CanvasData.options.scales.yAxes[1].display =
                                                        !CanvasData.options.scales.yAxes[1].display;
                                                }
                                            }

                                            CanvasData.update();
                                        }
                                    }
                                }
                            }
                        });

                        if (Y2ScalesData.length == 0)
                            CanvasData.options.scales.yAxes[1].display = false;

                        if (Y1ScalesData.length == 0)
                            CanvasData.options.scales.yAxes[0].display = false;


                        const tableContainer = document.getElementById('container' + ComValue);
                        const xAxis = DisplaylablesTab;
                        const yAxis = TableDataChart;
                        const tableHeader = `<thead><tr>${
                            xAxis.reduce((memo, entry) => { memo += `<th style='min-width: 70px;'>${entry}</th>`; return memo; }, '<th>Emission</th><th/>')
                            }</tr></thead>`;

                        const rows1 = yAxis[0].UsageData.reduce((memo, entry) => {
                            var entry1 = entry == null ? 0 : entry;
                            memo += `<td>${addCommas(Math.round(entry1))}</td>`
                            return memo;
                        }, '');

                        var Row = `<tr><td /><td>Usage(` + UomCode + `)</td></td>${rows1}</tr >`;

                        const tableBody = yAxis.reduce((memo, entry) => {

                            const rows = entry.data.reduce((memo, entry) => {
                                var entry1 = entry == null ? 0 : entry;
                                memo += `<td>${addCommas(Math.round(entry1))}</td>`
                                return memo;
                            }, '');

                            memo += `<tbody>
                                    <tr><td>${entry.label}</td><td>Emission</td>${rows}</tr>
                                </tbody>`;

                            return memo;
                        }, '');

                        const table = `<table id="tblEmission` + ComValue + `" class="table table-striped table-bordered table-hover dataTable no-footer">
                            <template>` + CustomerName + `_` + ComValue + `_Emission_` + monthName + `</template>
                            ${tableHeader}${tableBody}</table>`;

                        tableContainer.innerHTML = table;
                        $(`#tblEmission` + ComValue + ' > tbody > tr').eq(0).before(Row);
                    }
                });
                $('.loadercontainer').hide();
            }
            else {
                $('.loadercontainer').hide();
                showSweetAlert("Warning!", "No data found!", "warning", null);
            }
            $('.loadercontainer').hide();

        }, function () {
            $('.loadercontainer').hide();
        });

        // }
    },

    bindBuildingEmissionData: function () {
        var Y1ScalesData = [];
        var Y2ScalesData = [];
        var TableDataChart_B = [];
        var UomCode = '';


        $("#EmissionChartDiv").html('');
        IsViewChart = 'buildingCode';
        LableStringName = 'Building Code'
        var indexvalue = 0;
        barIndexValue = 0;
        Reset_Form_Errors();
        var FormData = Analytics.GetData();
        if (Analytics.ValidateData(FormData)) {
            $('.loadercontainer').show();
            GetAjaxData("/UsageData/GetEmissionBuildingWiseDashboard", FormData, function (data) {
                var JsonData = data.data;
                var JsonDataCommodity;
                if (IsNotNull(JsonData) && IsNotNull(JsonData.emissionValue) && IsNotNull(JsonData.emissionVariable)) {
                    GlobalJsonDataEmission = [];
                    GlobalJsonDataEmission = JsonData;
                    $("#DivEmissionChart").show();

                    let CommodityList = [];

                    $(JsonData.emissionVariable).each(function (i, item) {
                        CommodityList.push(item.commodityName);
                    });
                    JsonDataCommodity = [...new Set(CommodityList)];

                    Analytics.BuildingEmissionCombineGraph(JsonData, JsonDataCommodity);

                    $.each(JsonDataCommodity, function (ComIndexBW, ComValueBW) {
                        let startIndexvalue = 0;
                        let lastIndexValue = 0;
                        if (indexvalue === 0) {
                            startIndexvalue = 0;
                            lastIndexValue = 10;
                        }
                        else {
                            startIndexvalue = indexvalue * 10;
                            lastIndexValue = Number(startIndexvalue) + 10;
                        }

                        Y1ScalesData = [];
                        Y2ScalesData = [];
                        TableDataChart_B = [];
                        DataChart = [];
                        var filteredVariableData = $.grep(JsonData.emissionVariable, function (j) { return j.commodityName == ComValueBW });
                        var EmissionData = $.grep(JsonData.emissionValue, function (j) { return j.commodityName == ComValueBW });
                        //var EmissionDate = JsonData.emissionDate;

                        var BuildingCodeArray = [];
                        var labels = [];
                        var Displaylabels = [];
                        var T_Displaylabels = [];
                        //$.each(EmissionDate, function (index, item) {
                        //    labels.push(Month[item.month - 1] + ' ' + item.year);
                        //});
                        $(EmissionData).each(function (i, item) {
                            BuildingCodeArray.push(item.buildingCode);
                            UomCode = item.uomCode;
                        });

                        labels = [...new Set(BuildingCodeArray)];

                        var ChartData1 = [];
                        var ChartData2 = [];
                        var DataChart_B = [];
                        var UsageDataChart_B = [];

                        //var backgroundColor = [];
                        $.each(filteredVariableData, function (index, item) {
                            //backgroundColor.push(getRandomColor());
                            //if (startIndexvalue <= index && lastIndexValue > index) {
                            if (IsNotNull(EmissionData)) {
                                var data1 = $.grep(EmissionData, function (i) {
                                    return item.variableID === i.variableID
                                });
                                DataChart_B.push

                                ChartData1 = [];
                                ChartData2 = [];
                                DataChart_B = [];
                                UsageDataChart_B = [];
                                var flag = true;
                                $.each(labels, function (index3, item1) {

                                    //Table data Start
                                    flag = true;
                                    $.each(data1, function (index10, item20) {
                                        if (item1 == item20.buildingCode) {
                                            flag = false;
                                            DataChart_B.push(Math.round(item20.emission));
                                            UsageDataChart_B.push(Math.round(item20.usage));
                                        }
                                    });
                                    if (flag)
                                        if (item.displayAxis == 1) {
                                            DataChart_B.push(0);
                                            UsageDataChart_B.push(0);
                                        }
                                        else {
                                            DataChart_B.push(0);
                                            UsageDataChart_B.push(0);
                                        }
                                    if (index == 0)
                                        T_Displaylabels.push(item1);


                                    // table data end
                                    if (startIndexvalue <= index3 && lastIndexValue > index3) {
                                        flag = true;
                                        $.each(data1, function (index1, item2) {
                                            if (item1 == item2.buildingCode) {
                                                if (item.displayAxis == 1) {
                                                    ChartData1.push(Math.round(item2.emission));
                                                    flag = false;
                                                }
                                                else {
                                                    ChartData2.push(Math.round(item2.emission));
                                                    flag = false;
                                                }
                                            }
                                        });
                                        if (flag)
                                            if (item.displayAxis == 1) {
                                                ChartData1.push(0);
                                            }
                                            else {
                                                ChartData2.push(0);
                                            }
                                        if (index == 0)
                                            Displaylabels.push(item1);

                                    }
                                });
                            }
                            else {
                                $.each(labels, function (index1, item1) {
                                    ChartData1.push(0);
                                    ChartData2.push(0);
                                    DataChart_B.push(0);
                                });
                            }

                            var dynamicColors = function () {
                                var r = Math.floor(Math.random() * 190);
                                var g = Math.floor(Math.random() * 190);
                                var b = Math.floor(Math.random() * 190);
                                return "rgb(" + r + "," + g + "," + b + ")";
                            }
                            var VariableName = item.variableDescription.split(" ")[1];
                            //var CommodityName = $("#ddlCommoditySearch option:selected").text();
                            //var Commodityunit = "";
                            //if (CommodityName.toLowerCase() == "electric" ) {
                            //    Commodityunit = "KWH";
                            //}
                            TableDataChart_B.push({
                                label: VariableName,
                                data: DataChart_B,
                                UsageData: UsageDataChart_B,
                            });

                            if (item.displayAxis == 1) {
                                DataChart.push({
                                    yAxisID: 'A',
                                    label: VariableName,
                                    borderWidth: 2,
                                    data: ChartData1,
                                    hidden: item.defaultVariable ? false : true,
                                    backgroundColor: color[index],
                                    fill: false,
                                    lineTension: 0.1,
                                    borderColor: color[index],
                                    ticks: {
                                        precision: 0,
                                        //callback: function (costValue) { return (costValue) },
                                        beginAtZero: true,
                                        fontSize: 16
                                    }
                                });
                                Y1ScalesData.push(VariableName);
                            }
                            else {
                                DataChart.push({
                                    yAxisID: 'B',
                                    label: VariableName,
                                    borderWidth: 2,
                                    data: ChartData2,
                                    hidden: item.defaultVariable ? false : true,
                                    backgroundColor: color[index],
                                    fill: false,
                                    lineTension: 0.1,
                                    borderColor: color[index],
                                    ticks: {
                                        precision: 0,
                                        //callback: function (costValue) { return (costValue) },
                                        beginAtZero: true,
                                        fontSize: 16
                                    }
                                });
                                Y2ScalesData.push(VariableName);
                            }
                            //}

                        });



                        //$("#EmissionChartDiv").html('');
                        //$("#EmissionChartDiv").append(`<lable style="font-weight: bold;">` + ComValueBW + ` : Emission Vs Month</lable>
                        //                                       <canvas id="chartCanvas`+ ComValueBW + `" style="height:400px" class="table"></canvas>`);
                        if (IsNotNull(Displaylabels)) {
                            $("#EmissionChartDiv").append(`<div><lable style="font-weight: bold;">` + ComValueBW + ` : Emission(M.Tons)</lable>
                        <a href="javascript:;" id="download`+ ComValueBW + `" style="float: right;background-color: #f7f8fa;display:none;" class="btn btn-sm btn-clean btn-icon btn-icon-md" title="Excel Export" onclick="ExportToExcelGrid('#tblEmission` + ComValueBW + `','excel')"><i class="fa fa-file-excel" style="color:#555"></i> </a>
                        <label class="switch" style="margin-left: .5rem;margin-right: 5px;">
                            <input id="chk`+ ComValueBW + `" type="checkbox" onchange="Analytics.ToggleChartToTable('` + ComValueBW + `','B');" />
                            <div class="slider round" style="background-color:#555;">
                                <span class="on">
                                    <i class="fa fa-chart-line fa-2x" aria-hidden="true"></i>
                                </span>
                                <span class="off">
                                    <i class="fa fa-table fa-2x" aria-hidden="true"></i>
                                </span>
                            </div>
                        </label>
                    </div>
                     <div id="EmissionGraph`+ ComValueBW + `">
                         <canvas id="Emissionchart_canvas`+ ComValueBW + `" style="height:400px" class="table"></canvas>
                          <div class="row" id="BuildingDivID`+ ComValueBW + `">
                          <div class="col-xs-12 col-md-3 col-lg-3"></div>
                          <div class="col-xs-12 col-md-4 col-lg-4">
                              <div style="margin-left: 0%;margin-top: 0%;">
                                  <input id="btnPervious` + ComValueBW + `" class="btn btn-info btn-elevate btn-pill btn-sm" type="button" onclick="Analytics.btnPerviousBuildingEmission('` + ComValueBW + `','` + startIndexvalue + `','` + lastIndexValue + `')" value="Previous">
                                  <input id="btnNext` + ComValueBW + `" class="btn btn-info btn-elevate btn-pill btn-sm" type="button" onclick="Analytics.btnNextBuildingEmission('` + ComValueBW + `','` + lastIndexValue + `','` + (Number(lastIndexValue) + 10) + `')" value="Next">
                                  <input type="hidden" id="hf_barIndexValue` + ComValueBW + `" value="0">
                               </div>
                          </div>
                          </div>
                    </div>
                          <div id="container`+ ComValueBW + `" style="display:none;" class="table-responsive"></div>
                    </br>
                    `);

                            if ((JsonDataCommodity.length - 1) > ComIndexBW) {
                                $("#EmissionChartDiv" + ComValueBW).after(`<hr/>`);
                            }

                            if (startIndexvalue == 0) {
                                $("#btnPervious" + ComValueBW).attr("disabled", true);
                            }
                            else {
                                $("#btnPervious" + ComValueBW).attr("disabled", false);
                            }

                            if (EmissionData.length <= 10) {
                                $("#btnNext" + ComValueBW).attr("disabled", true);
                            }
                            else {
                                $("#btnNext" + ComValueBW).attr("disabled", false);
                            }

                            if ((JsonDataCommodity.length - 1) > ComIndexBW) {
                                ///$("#Barchart_canvas" + ComValueBW).after(`<hr/>`);
                                $("#BuildingDivID" + ComValueBW).after(`<hr/>`);
                            }
                            var canvas = '';
                            canvas = document.getElementById('Emissionchart_canvas' + ComValueBW);
                            var CanvasData = new Chart(canvas, {
                                type: 'bar',
                                data: {
                                    labels: Displaylabels,
                                    datasets: DataChart
                                },
                                options: {
                                    responsive: true,
                                    //maintainAspectRatio: false,
                                    title: {
                                        display: true,
                                    },
                                    tooltips: {
                                        enabled: true,
                                        mode: 'single',
                                        callbacks: {
                                            label: function (tooltipItem, data) {
                                                //var label = data.labels[tooltipItem.index];
                                                var datasetLabel = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
                                                return addCommas(IsNotNull(datasetLabel) ? datasetLabel : 0);
                                            }
                                        }
                                    },
                                    scales: {
                                        yAxes: [{
                                            id: 'A',
                                            type: 'linear',
                                            position: 'left',
                                            scaleLabel: {
                                                display: true,
                                                labelString: "Emission (" + Y1ScalesData + ")",
                                                fontSize: 12
                                                //fontStyle: 'italic'
                                            },
                                            ticks: { callback: function (costValue) { return addCommas(IsNotNull(costValue) ? costValue : 0.00) } }
                                        },
                                        {
                                            id: 'B',
                                            type: 'linear',
                                            position: 'right',
                                            scaleLabel: {
                                                display: true,
                                                labelString: Y2ScalesData.length != 0 ? "Emission (" + Y2ScalesData + ")" : "",
                                                fontSize: 12
                                                //fontStyle: 'italic'
                                            },
                                            ticks: { callback: function (costValue) { return addCommas(IsNotNull(costValue) ? costValue : 0.00) } }
                                        }],
                                        xAxes: [{
                                            scaleLabel: {
                                                display: true,
                                                labelString: LableStringName,
                                                fontSize: 16
                                                //fontStyle: 'italic'
                                            },
                                        }]
                                    },
                                    legend: {
                                        onClick: function (event, legendItem) {
                                            //get the index of the clicked legend
                                            var index = legendItem.datasetIndex;
                                            var axis = '';
                                            var Y1Count = [], Y2Count = [];
                                            $.each(CanvasData.data.datasets, function (index1, item1) {
                                                if (item1.yAxisID == 'A') {
                                                    if (index == index1)
                                                        axis = item1.yAxisID;

                                                    Y1Count.push(item1);
                                                }
                                                else {
                                                    Y2Count.push(item1);
                                                }

                                            });

                                            if (axis == 'A') {
                                                if (Y1Count.length == 1) {
                                                    CanvasData.data.datasets[index].hidden =
                                                        !CanvasData.data.datasets[index].hidden;
                                                    //toggle the related labels' visibility
                                                    CanvasData.options.scales.yAxes[index].display =
                                                        !CanvasData.options.scales.yAxes[index].display;
                                                }
                                                else {
                                                    var Casshow = CanvasData.data.datasets[index].hidden;
                                                    if (CanvasData.data.datasets[index].hidden == false || CanvasData.data.datasets[index].hidden == undefined) {
                                                        CanvasCountX = Number(CanvasCountX) + 1;
                                                    }
                                                    else if (CanvasData.data.datasets[index].hidden == true) {
                                                        CanvasCountX = Number(CanvasCountX) - 1;
                                                    }
                                                    else { }

                                                    CanvasData.data.datasets[index].hidden =
                                                        !CanvasData.data.datasets[index].hidden;

                                                    if ((CanvasCountX > 0 && CanvasCountX % 2 === 0) || (CanvasCountX > 0 && Casshow === true)) {
                                                        CanvasData.options.scales.yAxes[0].display =
                                                            !CanvasData.options.scales.yAxes[0].display;
                                                    }
                                                }
                                                CanvasData.update();
                                            }

                                            else {
                                                if (Y2Count.length == 1) {
                                                    CanvasData.data.datasets[index].hidden =
                                                        !CanvasData.data.datasets[index].hidden;
                                                    //toggle the related labels' visibility
                                                    CanvasData.options.scales.yAxes[index].display =
                                                        !CanvasData.options.scales.yAxes[index].display;
                                                }
                                                else {
                                                    var Casshow = CanvasData.data.datasets[index].hidden;
                                                    if (CanvasData.data.datasets[index].hidden == false || CanvasData.data.datasets[index].hidden == undefined) {
                                                        CanvasCount = Number(CanvasCount) + 1;
                                                    }
                                                    else if (CanvasData.data.datasets[index].hidden == true) {
                                                        CanvasCount = Number(CanvasCount) - 1;
                                                    }
                                                    else { }

                                                    CanvasData.data.datasets[index].hidden =
                                                        !CanvasData.data.datasets[index].hidden;

                                                    if ((CanvasCount > 0 && CanvasCount % 2 === 0) || (CanvasCount > 0 && Casshow === true)) {
                                                        CanvasData.options.scales.yAxes[1].display =
                                                            !CanvasData.options.scales.yAxes[1].display;
                                                    }
                                                }

                                                CanvasData.update();
                                            }
                                        }
                                    }

                                }
                            });
                            if (Y2ScalesData.length == 0)
                                CanvasData.options.scales.yAxes[1].display = false;

                            if (Y1ScalesData.length == 0)
                                CanvasData.options.scales.yAxes[0].display = false;

                            const tableContainer = document.getElementById('container' + ComValueBW);
                            const xAxis = T_Displaylabels;
                            const yAxis = TableDataChart_B;
                            debugger
                            const tableHeader = `<thead><tr>${
                                xAxis.reduce((memo, entry) => { memo += `<th>${entry}</th>`; return memo; }, '<th>Emission</th><th/>')
                                }</tr></thead>`;

                            const rows1 = yAxis[0].UsageData.reduce((memo, entry) => {
                                var entry1 = entry == null ? 'NA' : addCommas(Math.round(entry));
                                memo += `<td>${entry1}</td>`
                                return memo;
                            }, '');

                            var Row = `<tr><td /><td>Usage (` + UomCode + `)</td></td>${rows1}</tr >`;

                            const tableBody = yAxis.reduce((memo, entry) => {
                                const rows = entry.data.reduce((memo, entry) => {
                                    var entry1 = entry == null ? 'NA' : addCommas(Math.round(entry));
                                    memo += `<td>${entry1}</td>`
                                    return memo;
                                }, '');
                                memo += `<tbody><tr><td>${entry.label}</td><td>Emission</td>${rows}</tr></tbody>`;

                                return memo;
                            }, '');

                            const table = `<table id="tblEmission` + ComValueBW + `" class="table table-striped table-bordered table-hover dataTable no-footer">
                            <template>` + CustomerName + `_` + ComValueBW + `_Emission_` + monthName + ` </template>
                            ${tableHeader}${tableBody}</table>`;

                            tableContainer.innerHTML = table;
                            $(`#tblEmission` + ComValueBW + ' > tbody > tr').eq(0).before(Row);
                        }
                    });
                }
                else {
                    $('.loadercontainer').hide();
                    showSweetAlert("Warning!", "No data found!", "warning", null);
                }
                $('.loadercontainer').hide();
            }, function () {
                $('.loadercontainer').hide();
            });
        }
    },

    bindEmissionAccountNumberData: function () {
        var Y1ScalesData = [];
        var Y2ScalesData = [];
        var UomCode = '';
        var TableDataChart_UA = [];
        $("#EmissionChartDiv").html('');
        IsViewChart = 'utilityAccountNumber';
        LableStringName = 'Utility Account Number'
        var indexvalue = 0;
        Reset_Form_Errors();
        var FormData = Analytics.GetData();
        if (Analytics.ValidateData(FormData)) {
            $('.loadercontainer').show();
            GetAjaxData("/UsageData/GetEmissionAccountNumberWiseDashboard", FormData, function (data) {
                var JsonData = data.data;
                var JsonDataCommodity;
                if (IsNotNull(JsonData) && IsNotNull(JsonData.emissionValue) && IsNotNull(JsonData.emissionVariable)) {
                    GlobalJsonDataEmission = [];
                    GlobalJsonDataEmission = JsonData;
                    $("#DivEmissionChart").show();

                    let CommodityList = [];

                    $(JsonData.emissionVariable).each(function (i, item) {
                        CommodityList.push(item.commodityName);
                    });
                    JsonDataCommodity = [...new Set(CommodityList)];

                    Analytics.AccountEmissionCombineGraph(JsonData, JsonDataCommodity);

                    $.each(JsonDataCommodity, function (ComIndexBW, ComValueBW) {
                        let startIndexvalue = 0;
                        let lastIndexValue = 0;
                        if (indexvalue === 0) {
                            startIndexvalue = 0;
                            lastIndexValue = 10;
                        }
                        else {
                            startIndexvalue = indexvalue * 10;
                            lastIndexValue = Number(startIndexvalue) + 10;
                        }

                        Y1ScalesData = [];
                        Y2ScalesData = [];
                        TableDataChart_UA = [];
                        DataChart = [];
                        var filteredVariableData = $.grep(JsonData.emissionVariable, function (j) { return j.commodityName == ComValueBW });
                        var EmissionData = $.grep(JsonData.emissionValue, function (j) { return j.commodityName == ComValueBW });
                        //var EmissionDate = JsonData.emissionDate;

                        var BuildingCodeArray = [];
                        var labels = [];
                        var Displaylabels = [];
                        var Displaylabels_T = [];
                        //$.each(EmissionDate, function (index, item) {
                        //    labels.push(Month[item.month - 1] + ' ' + item.year);
                        //});
                        $(EmissionData).each(function (i, item) {
                            BuildingCodeArray.push(item.utilityAccountNumber);
                            UomCode = item.uomCode;
                        });

                        labels = [...new Set(BuildingCodeArray)];

                        var ChartData1 = [];
                        var ChartData2 = [];
                        var DataChart_UA = [];
                        var UsageDataChart_UA = [];
                        //var backgroundColor = [];
                        $.each(filteredVariableData, function (index, item) {
                            //backgroundColor.push(getRandomColor());
                            //if (startIndexvalue <= index && lastIndexValue > index) {
                            if (IsNotNull(EmissionData)) {
                                var data1 = $.grep(EmissionData, function (i) {
                                    return item.variableID === i.variableID
                                });


                                ChartData1 = [];
                                ChartData2 = [];
                                DataChart_UA = [];
                                UsageDataChart_UA = [];
                                var flag = true;
                                $.each(labels, function (index3, item1) {

                                    //Table data Start
                                    flag = true;
                                    $.each(data1, function (index1, item20) {
                                        if (item1 == item20.utilityAccountNumber) {
                                            DataChart_UA.push(Math.round(item20.emission));
                                            UsageDataChart_UA.push(Math.round(item20.usage));
                                            flag = false;
                                        }
                                    });
                                    if (flag)
                                        if (item.displayAxis == 1) {
                                            DataChart_UA.push(0);
                                            UsageDataChart_UA.push(0);
                                        }
                                        else {
                                            DataChart_UA.push(0);
                                            UsageDataChart_UA.push(0);
                                        }
                                    if (index == 0)
                                        Displaylabels_T.push(item1);


                                    // Table data End 

                                    if (startIndexvalue <= index3 && lastIndexValue > index3) {
                                        flag = true;
                                        $.each(data1, function (index1, item2) {
                                            if (item1 == item2.utilityAccountNumber) {
                                                if (item.displayAxis == 1) {
                                                    ChartData1.push(Math.round(item2.emission));
                                                    flag = false;
                                                }
                                                else {
                                                    ChartData2.push(Math.round(item2.emission));
                                                    flag = false;
                                                }
                                            }
                                        });
                                        if (flag)
                                            if (item.displayAxis == 1)
                                                ChartData1.push(0);
                                            else
                                                ChartData2.push(0);
                                        if (index == 0)
                                            Displaylabels.push(item1);

                                    }
                                });
                            }
                            else {
                                $.each(labels, function (index1, item1) {
                                    ChartData1.push(0);
                                    ChartData2.push(0);
                                });
                            }

                            var dynamicColors = function () {
                                var r = Math.floor(Math.random() * 190);
                                var g = Math.floor(Math.random() * 190);
                                var b = Math.floor(Math.random() * 190);
                                return "rgb(" + r + "," + g + "," + b + ")";
                            }
                            var VariableName = item.variableDescription.split(" ")[1];
                            //var CommodityName = $("#ddlCommoditySearch option:selected").text();
                            //var Commodityunit = "";
                            //if (CommodityName.toLowerCase() == "electric" ) {
                            //    Commodityunit = "KWH";
                            //}
                            TableDataChart_UA.push({
                                label: VariableName,
                                data: DataChart_UA,
                                UsageData: UsageDataChart_UA,
                            });

                            if (item.displayAxis == 1) {
                                DataChart.push({
                                    yAxisID: 'A',
                                    label: VariableName,
                                    borderWidth: 2,
                                    data: ChartData1,
                                    hidden: item.defaultVariable ? false : true,
                                    backgroundColor: color[index],
                                    fill: false,
                                    lineTension: 0.1,
                                    borderColor: color[index],
                                    ticks: {
                                        precision: 0,
                                        //callback: function (costValue) { return (costValue) },
                                        beginAtZero: true,
                                        fontSize: 16
                                    }
                                });
                                Y1ScalesData.push(VariableName);
                            }
                            else {
                                DataChart.push({
                                    yAxisID: 'B',
                                    label: VariableName,
                                    borderWidth: 2,
                                    data: ChartData2,
                                    hidden: item.defaultVariable ? false : true,
                                    backgroundColor: color[index],
                                    fill: false,
                                    lineTension: 0.1,
                                    borderColor: color[index],
                                    ticks: {
                                        precision: 0,
                                        //callback: function (costValue) { return (costValue) },
                                        beginAtZero: true,
                                        fontSize: 16
                                    }
                                });
                                Y2ScalesData.push(VariableName);
                            }
                            //}

                        });



                        //$("#EmissionChartDiv").html('');
                        //$("#EmissionChartDiv").append(`<lable style="font-weight: bold;">` + ComValue + ` : Emission Vs Month</lable>
                        //                                       <canvas id="chartCanvas`+ ComValue + `" style="height:400px" class="table"></canvas>`);
                        if (IsNotNull(Displaylabels)) {
                            $("#EmissionChartDiv").append(`<div><lable style="font-weight: bold;">` + ComValueBW + ` : Emission(M.Tons)</lable>
                        <a href="javascript:;" id="download`+ ComValueBW + `" style="float: right;background-color: #f7f8fa;display:none;" class="btn btn-sm btn-clean btn-icon btn-icon-md" title="Excel Export" onclick="ExportToExcelGrid('#tblEmission` + ComValueBW + `','excel')"><i class="fa fa-file-excel" style="color:#555"></i> </a>
                        <label class="switch" style="margin-left: .5rem;margin-right: 5px;">
                            <input id="chk`+ ComValueBW + `" type="checkbox" onchange="Analytics.ToggleChartToTable('` + ComValueBW + `','B');" />
                            <div class="slider round" style="background-color:#555;">
                                <span class="on">
                                    <i class="fa fa-chart-line fa-2x" aria-hidden="true"></i>
                                </span>
                                <span class="off">
                                    <i class="fa fa-table fa-2x" aria-hidden="true"></i>
                                </span>
                            </div>
                        </label>
                        </div>
                        <div id="EmissionGraph`+ ComValueBW + `">
                        <canvas id="Emissionchart_canvas`+ ComValueBW + `" style="height:400px" class="table"></canvas>
                         <div class="row" id="BuildingDivID`+ ComValueBW + `">
                         <div class="col-xs-12 col-md-3 col-lg-3"></div>
                         <div class="col-xs-12 col-md-4 col-lg-4">
                             <div style="margin-left: 0%;margin-top: 0%;">
                                 <input id="btnPervious` + ComValueBW + `" class="btn btn-info btn-elevate btn-pill btn-sm" type="button" onclick="Analytics.btnPerviousBuildingEmission('` + ComValueBW + `','` + startIndexvalue + `','` + lastIndexValue + `')" value="Previous">
                                 <input id="btnNext` + ComValueBW + `" class="btn btn-info btn-elevate btn-pill btn-sm" type="button" onclick="Analytics.btnNextBuildingEmission('` + ComValueBW + `','` + lastIndexValue + `','` + (Number(lastIndexValue) + 10) + `')" value="Next">
                                 <input type="hidden" id="hf_barIndexValue` + ComValueBW + `" value="0">
                              </div>
                         </div></div></div>
                        <div id="container`+ ComValueBW + `" style="display:none;" class="table-responsive"></div>
                             </br>
                            `);

                            if ((JsonDataCommodity.length - 1) > ComIndexBW) {
                                $("#EmissionChartDiv" + ComValueBW).after(`<hr/>`);
                            }

                            if (startIndexvalue == 0) {
                                $("#btnPervious" + ComValueBW).attr("disabled", true);
                            }
                            else {
                                $("#btnPervious" + ComValueBW).attr("disabled", false);
                            }

                            if (EmissionData.length <= 10) {
                                $("#btnNext" + ComValueBW).attr("disabled", true);
                            }
                            else {
                                $("#btnNext" + ComValueBW).attr("disabled", false);
                            }

                            if ((JsonDataCommodity.length - 1) > ComIndexBW) {
                                ///$("#Barchart_canvas" + ComValueBW).after(`<hr/>`);
                                $("#BuildingDivID" + ComValueBW).after(`<hr/>`);
                            }

                            var canvas = document.getElementById('Emissionchart_canvas' + ComValueBW);
                            var CanvasData = new Chart(canvas, {
                                type: 'bar',
                                data: {
                                    labels: Displaylabels,
                                    datasets: DataChart
                                },
                                options: {
                                    responsive: true,
                                    //maintainAspectRatio: false,
                                    title: {
                                        display: true,
                                    },
                                    tooltips: {
                                        enabled: true,
                                        mode: 'single',
                                        callbacks: {
                                            label: function (tooltipItem, data) {
                                                //var label = data.labels[tooltipItem.index];
                                                var datasetLabel = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
                                                return addCommas(IsNotNull(datasetLabel) ? datasetLabel : 0);
                                            }
                                        }
                                    },
                                    scales: {
                                        yAxes: [{
                                            id: 'A',
                                            type: 'linear',
                                            position: 'left',
                                            scaleLabel: {
                                                display: true,
                                                labelString: "Emission (" + Y1ScalesData + ")",
                                                fontSize: 12
                                                //fontStyle: 'italic'
                                            },
                                            ticks: { callback: function (costValue) { return addCommas(costValue == null ? 0.00 : costValue) } }
                                        },
                                        {
                                            id: 'B',
                                            type: 'linear',
                                            position: 'right',
                                            scaleLabel: {
                                                display: true,
                                                labelString: Y2ScalesData.length != 0 ? "Emission (" + Y2ScalesData + ")" : "",
                                                fontSize: 12
                                                //fontStyle: 'italic'
                                            },
                                            ticks: { callback: function (costValue) { return addCommas(costValue == null ? 0.00 : costValue) } }
                                        }],
                                        xAxes: [{
                                            scaleLabel: {
                                                display: true,
                                                labelString: LableStringName,
                                                fontSize: 16
                                                //fontStyle: 'italic'
                                            },
                                        }]
                                    },
                                    legend: {
                                        onClick: function (event, legendItem) {
                                            //get the index of the clicked legend
                                            var index = legendItem.datasetIndex;
                                            var axis = '';
                                            var Y1Count = [], Y2Count = [];
                                            $.each(CanvasData.data.datasets, function (index1, item1) {
                                                if (item1.yAxisID == 'A') {
                                                    if (index == index1)
                                                        axis = item1.yAxisID;

                                                    Y1Count.push(item1);
                                                }
                                                else {
                                                    Y2Count.push(item1);
                                                }

                                            });

                                            if (axis == 'A') {
                                                if (Y1Count.length == 1) {
                                                    CanvasData.data.datasets[index].hidden =
                                                        !CanvasData.data.datasets[index].hidden;
                                                    //toggle the related labels' visibility
                                                    CanvasData.options.scales.yAxes[index].display =
                                                        !CanvasData.options.scales.yAxes[index].display;
                                                }
                                                else {
                                                    var Casshow = CanvasData.data.datasets[index].hidden;
                                                    if (CanvasData.data.datasets[index].hidden == false || CanvasData.data.datasets[index].hidden == undefined) {
                                                        CanvasCountX = Number(CanvasCountX) + 1;
                                                    }
                                                    else if (CanvasData.data.datasets[index].hidden == true) {
                                                        CanvasCountX = Number(CanvasCountX) - 1;
                                                    }
                                                    else { }

                                                    CanvasData.data.datasets[index].hidden =
                                                        !CanvasData.data.datasets[index].hidden;

                                                    if ((CanvasCountX > 0 && CanvasCountX % 2 === 0) || (CanvasCountX > 0 && Casshow === true)) {
                                                        CanvasData.options.scales.yAxes[0].display =
                                                            !CanvasData.options.scales.yAxes[0].display;
                                                    }
                                                }
                                                CanvasData.update();
                                            }

                                            else {
                                                if (Y2Count.length == 1) {
                                                    CanvasData.data.datasets[index].hidden =
                                                        !CanvasData.data.datasets[index].hidden;
                                                    //toggle the related labels' visibility
                                                    CanvasData.options.scales.yAxes[index].display =
                                                        !CanvasData.options.scales.yAxes[index].display;
                                                }
                                                else {
                                                    var Casshow = CanvasData.data.datasets[index].hidden;
                                                    if (CanvasData.data.datasets[index].hidden == false || CanvasData.data.datasets[index].hidden == undefined) {
                                                        CanvasCount = Number(CanvasCount) + 1;
                                                    }
                                                    else if (CanvasData.data.datasets[index].hidden == true) {
                                                        CanvasCount = Number(CanvasCount) - 1;
                                                    }
                                                    else { }

                                                    CanvasData.data.datasets[index].hidden =
                                                        !CanvasData.data.datasets[index].hidden;

                                                    if ((CanvasCount > 0 && CanvasCount % 2 === 0) || (CanvasCount > 0 && Casshow === true)) {
                                                        CanvasData.options.scales.yAxes[1].display =
                                                            !CanvasData.options.scales.yAxes[1].display;
                                                    }
                                                }

                                                CanvasData.update();
                                            }
                                        }
                                    }

                                }
                            });

                            if (Y2ScalesData.length == 0)
                                CanvasData.options.scales.yAxes[1].display = false;

                            if (Y1ScalesData.length == 0)
                                CanvasData.options.scales.yAxes[0].display = false;

                            const tableContainer = document.getElementById('container' + ComValueBW);
                            const xAxis = Displaylabels_T;
                            const yAxis = TableDataChart_UA;
                            debugger
                            const tableHeader = `<thead><tr>${
                                xAxis.reduce((memo, entry) => { memo += `<th>${entry}</th>`; return memo; }, '<th>Emission</th><th/>')
                                }</tr></thead>`;

                            const rows1 = yAxis[0].UsageData.reduce((memo, entry) => {
                                var entry1 = entry == null ? 'NA' : addCommas(Math.round(entry));
                                memo += `<td>${entry1}</td>`
                                return memo;
                            }, '');

                            var Row = `<tr><td /><td>Usage (` + UomCode + `)</td></td>${rows1}</tr >`;


                            const tableBody = yAxis.reduce((memo, entry) => {
                                const rows = entry.data.reduce((memo, entry) => {
                                    var entry1 = entry == null ? 'NA' : addCommas(Math.round(entry));
                                    memo += `<td>${entry1}</td>`
                                    return memo;
                                }, '');
                                memo += `<tbody><tr><td>${entry.label}</td><td>Emission</td>${rows}</tr></tbody>`;

                                return memo;
                            }, '');

                            const table = `<table id="tblEmission` + ComValueBW + `" class="table table-striped table-bordered table-hover dataTable no-footer">
                            <template>` + CustomerName + `_` + ComValueBW + `_Emission_` + monthName + ` </template>
                            ${tableHeader}${tableBody}</table>`;

                            tableContainer.innerHTML = table;

                            $(`#tblEmission` + ComValueBW + ' > tbody > tr').eq(0).before(Row);
                        }
                    });
                }
                else {
                    $('.loadercontainer').hide();
                    showSweetAlert("Warning!", "No data found!", "warning", null);
                }
                $('.loadercontainer').hide();
            }, function () {
                $('.loadercontainer').hide();
            });
        }
    },

    btnNextBuildingEmission: function (commodity, startIndexvalue, lastIndexValue) {
        debugger
        //alert("Next click :" + commodity + " startIndexvalue :" + startIndexvalue + " lastIndexValue : " + lastIndexValue);
        $('#Emissionchart_canvas' + commodity).html('');
        let CommodityList = [];
        var Y1ScalesData = [];
        var Y2ScalesData = [];
        var DataChart = [];

        var filteredVariableData = $.grep(GlobalJsonDataEmission.emissionVariable, function (j) { return j.commodityName == commodity });
        var EmissionData = $.grep(GlobalJsonDataEmission.emissionValue, function (j) { return j.commodityName == commodity });

        var hf_barIndexValue = Number($('#hf_barIndexValue' + commodity +'').val());
        hf_barIndexValue = hf_barIndexValue + 1;
        let checklength = hf_barIndexValue * 10;
        let No = Number(EmissionData.length) / 10;
        var Data = (No.toString()).split('.');

        if (startIndexvalue == 0) {
            $("#btnPervious" + commodity).attr("disabled", true);
        }
        else {
            $("#btnPervious" + commodity).attr("disabled", false);
        }


        var BuildingCodeArray = [];
        var labels = [];
        var Displaylabels = [];
        var ChartData1 = [];
        var ChartData2 = [];
        var barindexflag = true;

        $(EmissionData).each(function (i, item) {
            BuildingCodeArray.push(item[IsViewChart]);
        });

        labels = [...new Set(BuildingCodeArray)];
        if (labels.length > lastIndexValue)
            $("#btnNext" + commodity).attr("disabled", true);

        if (checklength <= labels.length) {
            if (Number(Data[0]) === hf_barIndexValue) {
                $("#btnNext" + commodity).attr("disabled", true);
            }
            else
                $("#btnNext" + commodity).attr("disabled", false);


            $.each(filteredVariableData, function (index, item) {
                //backgroundColor.push(getRandomColor());
                //if (startIndexvalue <= index && lastIndexValue > index) {
                if (IsNotNull(EmissionData)) {
                    var data1 = $.grep(EmissionData, function (i) {
                        return item.variableID === i.variableID
                    });
                    ChartData1 = [];
                    ChartData2 = [];
                    var flag = true;

                    $.each(labels, function (index3, item1) {
                        if (startIndexvalue <= index3 && lastIndexValue > index3) {
                            $.each(data1, function (index1, item2) {
                                if (item1 == item2[IsViewChart]) {
                                    if (item.displayAxis == 1) {
                                        ChartData1.push(Math.round(item2.emission));
                                        flag = false;
                                    }
                                    else {
                                        ChartData2.push(Math.round(item2.emission));
                                        flag = false;
                                    }
                                }
                            });
                            if (flag)
                                if (item.displayAxis == 1)
                                    ChartData1.push(0);
                                else
                                    ChartData2.push(0);
                            if (index == 0)
                                Displaylabels.push(item1);

                        }
                    });
                }
                else {
                    $.each(labels, function (index1, item1) {
                        ChartData1.push(0);
                        ChartData2.push(0);
                    });
                }


                var VariableName = item.variableDescription.split(" ")[1];

                if (item.displayAxis == 1) {
                    DataChart.push({
                        yAxisID: 'A',
                        label: VariableName,
                        borderWidth: 2,
                        data: ChartData1,
                        hidden: item.defaultVariable ? false : true,
                        backgroundColor: color[index],
                        fill: false,
                        lineTension: 0.1,
                        borderColor: color[index],
                        ticks: {
                            precision: 0,
                            //callback: function (costValue) { return (costValue) },
                            beginAtZero: true,
                            fontSize: 16
                        }
                    });
                    Y1ScalesData.push(VariableName);
                }
                else {
                    DataChart.push({
                        yAxisID: 'B',
                        label: VariableName,
                        borderWidth: 2,
                        data: ChartData2,
                        hidden: item.defaultVariable ? false : true,
                        backgroundColor: color[index],
                        fill: false,
                        lineTension: 0.1,
                        borderColor: color[index],
                        ticks: {
                            precision: 0,
                            //callback: function (costValue) { return (costValue) },
                            beginAtZero: true,
                            fontSize: 16
                        }
                    });
                    Y2ScalesData.push(VariableName);
                }

            });
            if (CanvasData) {
                CanvasData.destroy();
            }

            $('#Emissionchart_canvas' + commodity).remove();
            $("#EmissionGraph" + commodity).prepend('<canvas id="Emissionchart_canvas' + commodity + '" style="height:400px" class="table"></canvas>');
            var canvas = document.getElementById('Emissionchart_canvas' + commodity);
            var CanvasData = new Chart(canvas, {
                type: 'bar',
                data: {
                    labels: Displaylabels,
                    datasets: DataChart
                },
                options: {
                    responsive: true,
                    //maintainAspectRatio: false,
                    title: {
                        display: true,
                    },
                    tooltips: {
                        enabled: true,
                        mode: 'single',
                        callbacks: {
                            label: function (tooltipItem, data) {
                                //var label = data.labels[tooltipItem.index];
                                var datasetLabel = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
                                return addCommas(IsNotNull(datasetLabel) ? datasetLabel : 0);
                            }
                        }
                    },
                    scales: {
                        yAxes: [{
                            id: 'A',
                            type: 'linear',
                            position: 'left',
                            scaleLabel: {
                                display: true,
                                labelString: "Emission (" + Y1ScalesData + ")",
                                fontSize: 12
                                //fontStyle: 'italic'
                            }
                        },
                        {
                            id: 'B',
                            type: 'linear',
                            position: 'right',
                            scaleLabel: {
                                display: true,
                                labelString: Y2ScalesData.length != 0 ? "Emission (" + Y2ScalesData + ")" : "",
                                fontSize: 12
                                //fontStyle: 'italic'
                            },
                        }],
                        xAxes: [{
                            scaleLabel: {
                                display: true,
                                labelString: LableStringName,
                                fontSize: 16
                                //fontStyle: 'italic'
                            },
                        }]
                    },
                    legend: {
                        onClick: function (event, legendItem) {
                            //get the index of the clicked legend
                            var index = legendItem.datasetIndex;
                            //toggle chosen dataset's visibility
                            CanvasData.data.datasets[index].hidden =
                                !CanvasData.data.datasets[index].hidden;
                            //toggle the related labels' visibility
                            CanvasData.options.scales.yAxes[index].display =
                                !CanvasData.options.scales.yAxes[index].display;
                            CanvasData.update();
                        }
                    }

                }
            });

            $("#btnNext" + commodity).attr("onclick", "Analytics.btnNextBuildingEmission('" + commodity + "','" + lastIndexValue + "','" + (Number(lastIndexValue) + 10) + "')");
            $("#btnPervious" + commodity).attr("onclick", "Analytics.btnPerviousBuildingEmission('" + commodity + "','" + (Number(lastIndexValue) - 20) + "','" + (Number(lastIndexValue) - 10) + "')");
            //$("#btnPervious" + commodity).attr("onclick", "Analytics.btnPerviousBuilding('" + commodity + "','" + (Number(lastIndexValue - 10)) + "','" + (lastIndexValue) + "')");
        }
        else {
            hf_barIndexValue = hf_barIndexValue - 1;
        }
        $('#hf_barIndexValue' + commodity + '').val(hf_barIndexValue)
    },

    btnPerviousBuildingEmission: function (commodity, startIndexvalue, lastIndexValue) {

        //alert("Next click :" + commodity + " startIndexvalue :" + startIndexvalue + " lastIndexValue : " + lastIndexValue);
        if (startIndexvalue == -10)
            startIndexvalue = 0;
        if (lastIndexValue == 0)
            lastIndexValue = 10

        $('#Emissionchart_canvas' + commodity).html('');
        let CommodityList = [];
        var Y1ScalesData = [];
        var Y2ScalesData = [];
        var DataChart = [];

        var filteredVariableData = $.grep(GlobalJsonDataEmission.emissionVariable, function (j) { return j.commodityName == commodity });
        var EmissionData = $.grep(GlobalJsonDataEmission.emissionValue, function (j) { return j.commodityName == commodity });

        var hf_barIndexValue = Number($('#hf_barIndexValue' + commodity + '').val());
        hf_barIndexValue = hf_barIndexValue - 1;
        //let checklength = hf_barIndexValue * 10;
        //let No = Number(EmissionData.length) / 10;
        //var Data = (No.toString()).split('.');

        if (startIndexvalue == 0) {
            $("#btnPervious" + commodity).attr("disabled", true);
        }
        else {
            $("#btnPervious" + commodity).attr("disabled", false);
        }

        var BuildingCodeArray = [];
        var labels = [];
        var Displaylabels = [];
        var ChartData1 = [];
        var ChartData2 = [];

        $(EmissionData).each(function (i, item) {
            BuildingCodeArray.push(item[IsViewChart]);
        });

        labels = [...new Set(BuildingCodeArray)];

        if (hf_barIndexValue >= 0) {
            $("#btnNext" + commodity).attr("disabled", false);

            $.each(filteredVariableData, function (index, item) {
                //backgroundColor.push(getRandomColor());
                //if (startIndexvalue <= index && lastIndexValue > index) {
                if (IsNotNull(EmissionData)) {
                    var data1 = $.grep(EmissionData, function (i) {
                        return item.variableID === i.variableID
                    });
                    ChartData1 = [];
                    ChartData2 = [];
                    var flag = true;

                    $.each(labels, function (index3, item1) {
                        if (startIndexvalue <= index3 && lastIndexValue > index3) {
                            $.each(data1, function (index1, item2) {
                                if (item1 == item2[IsViewChart]) {
                                    if (item.displayAxis == 1) {
                                        ChartData1.push(item2.emission);
                                        flag = false;
                                    }
                                    else {
                                        ChartData2.push(item2.emission);
                                        flag = false;
                                    }
                                }
                            });
                            if (flag)
                                if (item.displayAxis == 1)
                                    ChartData1.push(0);
                                else
                                    ChartData2.push(0);
                            if (index == 0)
                                Displaylabels.push(item1);

                        }
                    });
                }
                else {
                    $.each(labels, function (index1, item1) {
                        ChartData1.push(0);
                        ChartData2.push(0);
                    });
                }


                var VariableName = item.variableDescription.split(" ")[1];

                if (item.displayAxis == 1) {
                    DataChart.push({
                        yAxisID: 'A',
                        label: VariableName,
                        borderWidth: 2,
                        data: ChartData1,
                        hidden: item.defaultVariable ? false : true,
                        backgroundColor: color[index],
                        fill: false,
                        lineTension: 0.1,
                        borderColor: color[index],
                        ticks: {
                            precision: 0,
                            //callback: function (costValue) { return (costValue) },
                            beginAtZero: true,
                            fontSize: 16
                        }
                    });
                    Y1ScalesData.push(VariableName);
                }
                else {
                    DataChart.push({
                        yAxisID: 'B',
                        label: VariableName,
                        borderWidth: 2,
                        data: ChartData2,
                        hidden: item.defaultVariable ? false : true,
                        backgroundColor: color[index],
                        fill: false,
                        lineTension: 0.1,
                        borderColor: color[index],
                        ticks: {
                            precision: 0,
                            //callback: function (costValue) { return (costValue) },
                            beginAtZero: true,
                            fontSize: 16
                        }
                    });
                    Y2ScalesData.push(VariableName);
                }

            });

            $('#Emissionchart_canvas' + commodity).remove();
            $("#EmissionGraph" + commodity).prepend('<canvas id="Emissionchart_canvas' + commodity + '" style="height:400px" class="table"></canvas>');
            var canvas = document.getElementById('Emissionchart_canvas' + commodity);
            var CanvasData = new Chart(canvas, {
                type: 'bar',
                data: {
                    labels: Displaylabels,
                    datasets: DataChart
                },
                options: {
                    responsive: true,
                    //maintainAspectRatio: false,
                    title: {
                        display: true,
                    },
                    tooltips: {
                        enabled: false,
                        mode: 'single',
                        callbacks: {
                            label: function (tooltipItem, data) {
                                //var label = data.labels[tooltipItem.index];
                                var datasetLabel = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
                                return addCommas(datasetLabel);
                            }
                        }
                    },
                    scales: {
                        yAxes: [{
                            id: 'A',
                            type: 'linear',
                            position: 'left',
                            scaleLabel: {
                                display: true,
                                labelString: "Emission (" + Y1ScalesData + ")",
                                fontSize: 12
                                //fontStyle: 'italic'
                            }
                        },
                        {
                            id: 'B',
                            type: 'linear',
                            position: 'right',
                            scaleLabel: {
                                display: true,
                                labelString: Y2ScalesData.length != 0 ? "Emission (" + Y2ScalesData + ")" : "",
                                fontSize: 12
                                //fontStyle: 'italic'
                            },
                        }],
                        xAxes: [{
                            scaleLabel: {
                                display: true,
                                labelString: LableStringName,
                                fontSize: 16
                                //fontStyle: 'italic'
                            },
                        }]
                    },
                    legend: {
                        onClick: function (event, legendItem) {
                            //get the index of the clicked legend
                            var index = legendItem.datasetIndex;
                            //toggle chosen dataset's visibility
                            CanvasData.data.datasets[index].hidden =
                                !CanvasData.data.datasets[index].hidden;
                            //toggle the related labels' visibility
                            CanvasData.options.scales.yAxes[index].display =
                                !CanvasData.options.scales.yAxes[index].display;
                            CanvasData.update();
                        }
                    }

                }
            });

            $("#btnNext" + commodity).attr("onclick", "Analytics.btnNextBuildingEmission('" + commodity + "','" + lastIndexValue + "','" + (Number(lastIndexValue) + 10) + "')");
            $("#btnPervious" + commodity).attr("onclick", "Analytics.btnPerviousBuildingEmission('" + commodity + "','" + (Number(lastIndexValue) - 20) + "','" + (Number(lastIndexValue) - 10) + "')");
            //$("#btnPervious" + commodity).attr("onclick", "Analytics.btnPerviousBuilding('" + commodity + "','" + (Number(lastIndexValue - 10)) + "','" + (lastIndexValue) + "')");
        }
        else {
            hf_barIndexValue = hf_barIndexValue - 1;
        }
        $('#hf_barIndexValue' + commodity + '').val(hf_barIndexValue);
    },

    //=============================== Tab Emission End =================================

    //=============================== Tab Cost SQFT =================================
    MonthlyCostPSFTChartData() {
        $("#CostUsageChartDiv").html('');
        var FormData = Analytics.GetData();
        var monthNameArray = [];

        if (Analytics.ValidateData(FormData)) {
            $('.loadercontainer').show();
            GetAjaxData("/UsageData/GetMonthlyCostPSFTChart", { Model: FormData }, function (data) {
                var JsonData = data.data;
                var JsonDataCommodity;
                var Count = 0;
                try {
                    if (IsNotNull(JsonData)) {
                        Analytics.ClearData();
                        let CommodityList = [];
                        let TableDataChart = [];

                        $(JsonData).each(function (i, item) {
                            CommodityList.push(item.commodityName);
                        });

                        JsonDataCommodity = [...new Set(CommodityList)];

                        $.each(JsonDataCommodity, function (ComIndex, ComValue) {
                            var UOMCode = null;
                            var Currency = null;

                            let costArray = [];
                            let usageArray = [];
                            let TUsageData = [];
                            let TCostData = [];
                            let TableDataChart = [];
                            monthNameArray = [];

                            var filteredJsonData = $.grep(JsonData, function (j) { return j.commodityName == ComValue });

                            $.each(filteredJsonData, function (index, item) {
                                if (item.totalCost != 0 || item.totalVolume != 0) {

                                    $.each(item, function (itemKey, itemValue) {
                                        if (itemKey == "totalCost") {
                                            costArray.push(itemValue);
                                            TCostData.push(itemValue);
                                        }
                                        else if (itemKey == "totalVolume") {
                                            usageArray.push(itemValue);
                                            TUsageData.push(itemValue);
                                        }
                                        else if (itemKey == "uomCode") {
                                            UOMCode = itemValue;
                                        }
                                        else if (itemKey == "currency") {
                                            Currency = itemValue;
                                        }
                                    });
                                    monthNameArray.push(Month[item.monthNumber - 1] + ' ' + item.monthYear);
                                }
                            });
                            // Usage Table data
                            TableDataChart.push({
                                label: 'Usage',
                                data: TUsageData,
                            });

                            // Cost Table data
                            TableDataChart.push({
                                label: 'Cost',
                                data: TCostData,
                            });

                            if (IsNotNull(monthNameArray)) {
                                Count++;
                                $("#CostPSFTChart").append(`<div><lable style="font-weight: bold;">` + ComValue + ` : Cost/Sqft</lable>
                                 <a href="javascript:;" id="download`+ ComValue + `" style="float: right;background-color: #f7f8fa;display:none;" class="btn btn-sm btn-clean btn-icon btn-icon-md" title="Excel Export" onclick="ExportToExcelGrid('#tblCostSqFt` + ComValue + `','excel')"><i class="fa fa-file-excel" style="color:#555"></i> </a>
                                    <label class="switch" style="margin-left: .5rem;margin-right: 5px;">
                                        <input id="chk`+ ComValue + `" type="checkbox" onchange="Analytics.ToggleChartToTable('` + ComValue + `');" />
                                        <div class="slider round" style="background-color:#555;">
                                            <span class="on">
                                                <i class="fa fa-chart-line fa-2x" aria-hidden="true"></i>
                                            </span>
                                            <span class="off">
                                                <i class="fa fa-table fa-2x" aria-hidden="true"></i>
                                            </span>
                                        </div>
                                    </label>
                                </div>
                                <div id="EmissionGraph`+ ComValue + `">
                                 <canvas id="chartCanvas`+ ComValue + `" style="height:400px" class="table"></canvas>
                                 </div>
                                 <div id="container`+ ComValue + `" style="display:none;" class="table-responsive"></div>
                                </br>
                                `);

                                if ((JsonDataCommodity.length - 1) > ComIndex) {
                                    $("#chartCanvas" + ComValue).after(`<hr/>`);
                                }
                                var canvas = document.getElementById('chartCanvas' + ComValue);

                                var CanvasData = new Chart(canvas, {
                                    type: 'bar',
                                    data: {
                                        labels: monthNameArray,
                                        datasets: [{
                                            yAxisID: 'Cost',
                                            label: "Cost",
                                            backgroundColor: "rgba(0, 63, 92,1)",
                                            borderColor: "#003f5c",
                                            borderWidth: 2,
                                            hoverBackgroundColor: "rgba(0, 63, 92,1)",
                                            hoverBorderColor: "#003f5c",
                                            data: costArray,

                                        }, {
                                            yAxisID: 'Usage',
                                            label: "Usage",
                                            backgroundColor: "rgba(255, 166, 0,1)",
                                                borderColor: "#ffa600",
                                            borderWidth: 2,
                                            hoverBackgroundColor: "rgba(255, 166, 0,1)",
                                                hoverBorderColor: "#ffa600",
                                            data: usageArray,
                                        }]
                                    },
                                    options: {
                                        //responsive: true,
                                        //maintainAspectRatio: false,
                                        title: {
                                            display: true,
                                        },
                                        tooltips: {
                                            enabled: true,
                                            mode: 'single',
                                            callbacks: {
                                                label: function (tooltipItem, data) {
                                                    //var label = data.labels[tooltipItem.index];
                                                    var datasetLabel = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
                                                    return addCommas(IsNotNull(datasetLabel) ? datasetLabel : 0);
                                                }
                                            }
                                        },
                                        scales: {
                                            yAxes: [{
                                                id: 'Cost',
                                                type: 'linear',
                                                position: 'left',
                                                scaleLabel: {
                                                    display: true,
                                                    labelString: "Cost (" + Currency + ")",
                                                    //fontStyle: 'italic'
                                                },
                                                //ticks: { callback: function (costValue) { return addCommas(costValue == 0 ? 0.00 : costValue.toFixed(2)) } }
                                            }, {
                                                id: 'Usage',
                                                type: 'linear',
                                                position: 'right',
                                                scaleLabel: {
                                                    display: true,
                                                    labelString: "Usage (" + UOMCode + ")",
                                                    //fontStyle: 'italic'
                                                },
                                                //ticks: { callback: function (usageValue) { return addCommas(usageValue == 0 ? 0.00 : usageValue.toFixed(2)) } }
                                            }],
                                            xAxes: [{
                                                scaleLabel: {
                                                    display: true,
                                                    labelString: "Month",
                                                    fontSize: 16
                                                    //fontStyle: 'italic'
                                                },
                                            }]
                                        },
                                        legend: {
                                            onClick: function (event, legendItem) {
                                                //get the index of the clicked legend
                                                var index = legendItem.datasetIndex;
                                                //toggle chosen dataset's visibility
                                                CanvasData.data.datasets[index].hidden =
                                                    !CanvasData.data.datasets[index].hidden;
                                                //toggle the related labels' visibility
                                                CanvasData.options.scales.yAxes[index].display =
                                                    !CanvasData.options.scales.yAxes[index].display;
                                                CanvasData.update();
                                            }
                                        }
                                    }
                                });
                                Analytics.tableBindData(monthNameArray, TableDataChart, 'CostSqFt', ' Cost/Sqft', ComValue, UOMCode);

                            }

                        });
                        if (Count == 0)
                            showSweetAlert("Warning!", "No data found!", "warning", null);
                    }
                    else {
                        $('.loadercontainer').hide();
                        showSweetAlert("Warning!", "No data found!", "warning", null);
                    }
                } catch (e) {
                    $('.loadercontainer').hide();
                    printError("Analytics.js", 'GetDataByID', e);
                }
                $('.loadercontainer').hide();
            }, function () {
                $('.loadercontainer').hide();
            });
        }
    },

    bindBuildingCostPSFTData: function () {
        var Y1ScalesData = [];
        var Y2ScalesData = [];
        $("#CostPSFTChart").html('');
        IsViewChart = 'buildingName';
        LableStringName = 'Building Code'
        var indexvalue = 0;
        Reset_Form_Errors();
        var FormData = Analytics.GetData();
        if (Analytics.ValidateData(FormData)) {
            $('.loadercontainer').show();
            GetAjaxData("/UsageData/GetBuldingCostPSFTChart", FormData, function (data) {
                var JsonData = data.data;
                var JsonDataCommodity;
                if (IsNotNull(JsonData)) {
                    GlobalJsonDataBuilding = [];
                    GlobalJsonDataBuilding = JsonData;
                    $("#DivCostPSFTChart").show();

                    let CommodityList = [];
                    var TableDataChart = [];

                    $(JsonData).each(function (i, item) {
                        CommodityList.push(item.commodityName);
                    });

                    JsonDataCommodity = [...new Set(CommodityList)];

                    $.each(JsonDataCommodity, function (ComIndexBW, ComValueBW) {
                        let startIndexvalue = 0;
                        let lastIndexValue = 0;
                        if (indexvalue === 0) {
                            startIndexvalue = 0;
                            lastIndexValue = 10;
                        }
                        else {
                            startIndexvalue = indexvalue * 10;
                            lastIndexValue = Number(startIndexvalue) + 10;
                        }

                        Y1ScalesData = [];
                        Y2ScalesData = [];
                        TableDataChart = [];
                        DataChart = [];
                        var BuildingCostPSFTData = $.grep(JsonData, function (j) { return j.commodityName == ComValueBW });

                        var BuildingCodeArray = [];
                        var labels = [];
                        var Displaylabels = [];
                        var TDisplaylabels = [];
                        var Currency = '';
                        var UOMCode = '';
                        //$.each(EmissionDate, function (index, item) {
                        //    labels.push(Month[item.month - 1] + ' ' + item.year);
                        //});
                        $(BuildingCostPSFTData).each(function (i, item) {
                            BuildingCodeArray.push(item.buildingName);
                        });

                        labels = [...new Set(BuildingCodeArray)];

                        var ChartData1 = [];
                        var ChartData2 = [];
                        var TUsageData = [];
                        var TCostData = [];

                        ChartData1 = [];
                        ChartData2 = [];
                        TUsageData = [];
                        TCostData = [];
                        var flag = true;
                        $.each(labels, function (index3, item1) {
                            // table data 
                            $.each(BuildingCostPSFTData, function (index1, item2) {
                                if (item1 == item2.buildingName) {
                                    TUsageData.push(item2.usage);
                                    TCostData.push(item2.cost);
                                }
                            });
                            TDisplaylabels.push(item1);

                            if (startIndexvalue <= index3 && lastIndexValue > index3) {
                                flag = true;
                                $.each(BuildingCostPSFTData, function (index1, item2) {
                                    if (item2.usage != 0 || item2.cost != 0) {
                                        ChartData1.push(item2.usage);
                                        ChartData2.push(item2.cost);
                                        Currency = item2.currency;
                                        UOMCode = item2.uomCode;
                                        flag = false;
                                    }
                                });
                                if (!flag)
                                    Displaylabels.push(item1);
                            }
                        });
                        if (IsNotNull(Displaylabels)) {
                            // Usage Table data
                            TableDataChart.push({
                                label: 'Usage',
                                data: TUsageData,
                            });

                            // Cost Table data
                            TableDataChart.push({
                                label: 'Cost',
                                data: TCostData,
                            });

                            DataChart.push({
                                yAxisID: 'A',
                                label: 'Cost',
                                borderWidth: 2,
                                data: ChartData2,
                                backgroundColor: "#003f5c",
                                borderColor: "#003f5c",
                                borderWidth: 2,
                                hoverBackgroundColor: "#003f5c",
                                hoverBorderColor: "#003f5c",
                                //borderColor: dynamicColors(),
                                ticks: {
                                    precision: 0,
                                    //callback: function (costValue) { return (costValue) },
                                    beginAtZero: true,
                                    fontSize: 16
                                }
                            });
                            Y1ScalesData.push('Cost (' + Currency + ')');

                            DataChart.push({
                                yAxisID: 'B',
                                label: 'Usage',
                                //borderWidth: 2,
                                data: ChartData1,
                                backgroundColor: "#ffa600",
                                borderColor: "#ffa600",
                                borderWidth: 2,
                                hoverBackgroundColor: "#ffa600",
                                hoverBorderColor: "#ffa600",
                                ticks: {
                                    precision: 0,
                                    //callback: function (costValue) { return (costValue) },
                                    beginAtZero: true,
                                    fontSize: 16
                                }
                            });
                            Y2ScalesData.push('Usage (' + UOMCode + ')');

                            $("#CostPSFTChart").append(`<lable style="font-weight: bold;">` + ComValueBW + ` : Cost/Sqft</lable>
                           <a href="javascript:;" id="download`+ ComValueBW + `" style="float: right;background-color: #f7f8fa;display:none;" class="btn btn-sm btn-clean btn-icon btn-icon-md" title="Excel Export" onclick="ExportToExcelGrid('#tblCostSqFt` + ComValueBW + `','excel')"><i class="fa fa-file-excel" style="color:#555"></i> </a>
                                    <label class="switch" style="margin-left: .5rem;margin-right: 5px;">
                                        <input id="chk`+ ComValueBW + `" type="checkbox" onchange="Analytics.ToggleChartToTable('` + ComValueBW + `');" />
                                        <div class="slider round" style="background-color:#555;">
                                            <span class="on">
                                                <i class="fa fa-chart-line fa-2x" aria-hidden="true"></i>
                                            </span>
                                            <span class="off">
                                                <i class="fa fa-table fa-2x" aria-hidden="true"></i>
                                            </span>
                                        </div>
                                    </label>
                                </div>
                                <div id="EmissionGraph`+ ComValueBW + `">
                                    <canvas id="chart_canvas`+ ComValueBW + `" style="height:400px" class="table"></canvas>
                                     <div class="row" id="BuildingDivID`+ ComValueBW + `">
                                     <div class="col-xs-12 col-md-3 col-lg-3"></div>
                                     <div class="col-xs-12 col-md-4 col-lg-4">
                                         <div style="margin-left: 0%;margin-top: 0%;">
                                             <input id="btnPervious` + ComValueBW + `" class="btn btn-info btn-elevate btn-pill btn-sm" type="button" onclick="Analytics.btnPerviousCostPSFT('` + ComValueBW + `','` + startIndexvalue + `','` + lastIndexValue + `')" value="Previous">
                                             <input id="btnNext` + ComValueBW + `" class="btn btn-info btn-elevate btn-pill btn-sm" type="button" onclick="Analytics.btnNextCostPSFT('` + ComValueBW + `','` + lastIndexValue + `','` + (Number(lastIndexValue) + 10) + `')" value="Next">
                                             <input type="hidden" id="hf_barIndexValue` + ComValueBW + `" value="0">
                                          </div>
                                     </div></div></div>
                                <div id="container`+ ComValueBW + `" style="display:none;" class="table-responsive"></div>
                                </br>
                        `);

                            if ((JsonDataCommodity.length - 1) > ComIndexBW) {
                                $("#EmissionChartDiv" + ComValueBW).after(`<hr/>`);
                            }

                            if (startIndexvalue == 0) {
                                $("#btnPervious" + ComValueBW).attr("disabled", true);
                            }
                            else {
                                $("#btnPervious" + ComValueBW).attr("disabled", false);
                            }

                            if (BuildingCostPSFTData.length <= 10) {
                                $("#btnNext" + ComValueBW).attr("disabled", true);
                            }
                            else {
                                $("#btnNext" + ComValueBW).attr("disabled", false);
                            }

                            if ((JsonDataCommodity.length - 1) > ComIndexBW) {
                                ///$("#Barchart_canvas" + ComValueBW).after(`<hr/>`);
                                $("#BuildingDivID" + ComValueBW).after(`<hr/>`);
                            }

                            var canvas = document.getElementById('chart_canvas' + ComValueBW);
                            var CanvasData = new Chart(canvas, {
                                type: 'bar',
                                data: {
                                    labels: Displaylabels,
                                    datasets: DataChart
                                },
                                options: {
                                    responsive: true,
                                    //maintainAspectRatio: false,
                                    title: {
                                        display: true,
                                    },
                                    tooltips: {
                                        enabled: true,
                                        mode: 'single',
                                        callbacks: {
                                            label: function (tooltipItem, data) {
                                                //var label = data.labels[tooltipItem.index];
                                                var datasetLabel = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
                                                return addCommas(IsNotNull(datasetLabel) ? datasetLabel : 0);
                                            }
                                        }
                                    },
                                    scales: {
                                        yAxes: [{
                                            id: 'A',
                                            type: 'linear',
                                            position: 'left',
                                            scaleLabel: {
                                                display: true,
                                                labelString: Y1ScalesData,
                                                fontSize: 12
                                                //fontStyle: 'italic'
                                            },
                                        },
                                        {
                                            id: 'B',
                                            type: 'linear',
                                            position: 'right',
                                            scaleLabel: {
                                                display: true,
                                                labelString: Y2ScalesData,
                                                fontSize: 12
                                                //fontStyle: 'italic'
                                            },
                                        }],
                                        xAxes: [{
                                            scaleLabel: {
                                                display: true,
                                                labelString: LableStringName,
                                                fontSize: 16
                                                //fontStyle: 'italic'
                                            },
                                        }]
                                    },
                                    legend: {
                                        onClick: function (event, legendItem) {
                                            //get the index of the clicked legend
                                            var index = legendItem.datasetIndex;
                                            //toggle chosen dataset's visibility
                                            CanvasData.data.datasets[index].hidden =
                                                !CanvasData.data.datasets[index].hidden;
                                            //toggle the related labels' visibility
                                            CanvasData.options.scales.yAxes[index].display =
                                                !CanvasData.options.scales.yAxes[index].display;
                                            CanvasData.update();
                                        }
                                    }

                                }
                            });

                            Analytics.tableBindData(TDisplaylabels, TableDataChart, 'CostSqFt', 'Cost/Sqft', ComValueBW, UOMCode);
                        }
                    });
                }
                else {
                    $('.loadercontainer').hide();
                    showSweetAlert("Warning!", "No data found!", "warning", null);
                }
                $('.loadercontainer').hide();
            }, function () {
                $('.loadercontainer').hide();
            });
        }
    },

    bindCostPSFTAccountNumberData: function () {
        var Y1ScalesData = [];
        var Y2ScalesData = [];
        var TableDataChart = [];
        $("#CostPSFTChart").html('');
        IsViewChart = 'utilityAccountNumber';
        LableStringName = 'Utility Account Number'
        var indexvalue = 0;
        Reset_Form_Errors();
        var FormData = Analytics.GetData();
        if (Analytics.ValidateData(FormData)) {
            $('.loadercontainer').show();
            GetAjaxData("/UsageData/GetAccountNumberCostPSFTChart", FormData, function (data) {
                var JsonData = data.data;
                var JsonDataCommodity;
                if (IsNotNull(JsonData)) {
                    GlobalJsonDataBuilding = [];
                    GlobalJsonDataBuilding = JsonData;
                    $("#DivCostPSFTChart").show();

                    let CommodityList = [];

                    $(JsonData).each(function (i, item) {
                        CommodityList.push(item.commodityName);
                    });

                    JsonDataCommodity = [...new Set(CommodityList)];

                    $.each(JsonDataCommodity, function (ComIndexBW, ComValueBW) {
                        let startIndexvalue = 0;
                        let lastIndexValue = 0;
                        if (indexvalue === 0) {
                            startIndexvalue = 0;
                            lastIndexValue = 10;
                        }
                        else {
                            startIndexvalue = indexvalue * 10;
                            lastIndexValue = Number(startIndexvalue) + 10;
                        }

                        Y1ScalesData = [];
                        Y2ScalesData = [];
                        TableDataChart = [];
                        DataChart = [];
                        var AccountNumberCostPSFTData = $.grep(JsonData, function (j) { return j.commodityName == ComValueBW });

                        var AcountNumberArray = [];
                        var labels = [];
                        var Displaylabels = [];
                        var TDisplaylabels = [];
                        var Currency = '';
                        var UOMCode = '';

                        //$.each(EmissionDate, function (index, item) {
                        //    labels.push(Month[item.month - 1] + ' ' + item.year);
                        //});
                        $(AccountNumberCostPSFTData).each(function (i, item) {
                            AcountNumberArray.push(item.utilityAccountNumber);
                        });

                        labels = [...new Set(AcountNumberArray)];

                        var ChartData1 = [];
                        var ChartData2 = [];
                        var TUsageData = [];
                        var TCostData = [];

                        ChartData1 = [];
                        ChartData2 = [];
                        TUsageData = [];
                        TCostData = [];
                        var flag = true;
                        $.each(labels, function (index3, item1) {
                            //table data
                            $.each(AccountNumberCostPSFTData, function (index1, item2) {
                                if (item1 == item2.utilityAccountNumber) {
                                    TUsageData.push(item2.usage == null ? 0 : item2.usage);
                                    TCostData.push(item2.cost == null ? 0 : item2.cost);
                                }
                            });
                            TDisplaylabels.push(item1);

                            if (startIndexvalue <= index3 && lastIndexValue > index3) {
                                flag = true;
                                $.each(AccountNumberCostPSFTData, function (index1, item2) {
                                    if (item2.usage != 0 || item2.cost != 0) {
                                        ChartData1.push(item2.usage);
                                        ChartData2.push(item2.cost);
                                        Currency = item2.currency;
                                        UOMCode = item2.uomCode;
                                        flag = false;
                                    }
                                });
                                if (!flag)
                                    Displaylabels.push(item1);
                            }
                        });
                        if (IsNotNull(Displaylabels)) {
                            // Usage Table data
                            TableDataChart.push({
                                label: 'Usage',
                                data: TUsageData,
                            });

                            // Cost Table data
                            TableDataChart.push({
                                label: 'Cost',
                                data: TCostData,
                            });

                            DataChart.push({
                                yAxisID: 'A',
                                label: 'Cost',
                                borderWidth: 2,
                                data: ChartData2,
                                backgroundColor: "#003f5c",
                                borderColor: "#003f5c",
                                //borderWidth: 2,
                                hoverBackgroundColor: "#003f5c",
                                hoverBorderColor: "#003f5c",
                                //borderColor: dynamicColors(),
                                ticks: {
                                    precision: 0,
                                    //callback: function (costValue) { return (costValue) },
                                    beginAtZero: true,
                                    fontSize: 16
                                }
                            });
                            Y1ScalesData.push('Cost (' + Currency + ')');

                            DataChart.push({
                                yAxisID: 'B',
                                label: 'Usage',
                                //borderWidth: 2,
                                data: ChartData1,
                                backgroundColor: "#ffa600",
                                borderColor: "#ffa600",
                                borderWidth: 2,
                                hoverBackgroundColor: "#ffa600",
                                hoverBorderColor: "#ffa600",
                                ticks: {
                                    precision: 0,
                                    //callback: function (costValue) { return (costValue) },
                                    beginAtZero: true,
                                    fontSize: 16
                                }
                            });
                            Y2ScalesData.push('Usage (' + UOMCode + ')');

                            $("#CostPSFTChart").append(`<div><lable style="font-weight: bold;">` + ComValueBW + ` : Cost/Sqft</lable>
                            <a href="javascript:;" id="download`+ ComValueBW + `" style="float: right;background-color: #f7f8fa;display:none;" class="btn btn-sm btn-clean btn-icon btn-icon-md" title="Excel Export" onclick="ExportToExcelGrid('#tblCostSqFt` + ComValueBW + `','excel')"><i class="fa fa-file-excel" style="color:#555"></i> </a>
                                    <label class="switch" style="margin-left: .5rem;margin-right: 5px;">
                                        <input id="chk`+ ComValueBW + `" type="checkbox" onchange="Analytics.ToggleChartToTable('` + ComValueBW + `');" />
                                        <div class="slider round" style="background-color:#555;">
                                            <span class="on">
                                                <i class="fa fa-chart-line fa-2x" aria-hidden="true"></i>
                                            </span>
                                            <span class="off">
                                                <i class="fa fa-table fa-2x" aria-hidden="true"></i>
                                            </span>
                                        </div>
                                    </label>
                                </div>
                                <div id="EmissionGraph`+ ComValueBW + `">
                                    <canvas id="chart_canvas`+ ComValueBW + `" style="height:400px" class="table"></canvas>
                                    <div class="row" id="BuildingDivID`+ ComValueBW + `">
                                    <div class="col-xs-12 col-md-3 col-lg-3"></div>
                                    <div class="col-xs-12 col-md-4 col-lg-4">
                                        <div style="margin-left: 0%;margin-top: 0%;">
                                            <input id="btnPervious` + ComValueBW + `" class="btn btn-info btn-elevate btn-pill btn-sm" type="button" onclick="Analytics.btnPerviousCostPSFT('` + ComValueBW + `','` + startIndexvalue + `','` + lastIndexValue + `')" value="Previous">
                                            <input id="btnNext` + ComValueBW + `" class="btn btn-info btn-elevate btn-pill btn-sm" type="button" onclick="Analytics.btnNextCostPSFT('` + ComValueBW + `','` + lastIndexValue + `','` + (Number(lastIndexValue) + 10) + `')" value="Next">
                                             <input type="hidden" id="hf_barIndexValue` + ComValueBW + `" value="0">
                                         </div>
                                    </div></div></div>
                                <div id="container`+ ComValueBW + `" style="display:none;" class="table-responsive"></div>
                                </br>
                        `);

                            if ((JsonDataCommodity.length - 1) > ComIndexBW) {
                                $("#EmissionChartDiv" + ComValueBW).after(`<hr/>`);
                            }

                            if (startIndexvalue == 0) {
                                $("#btnPervious" + ComValueBW).attr("disabled", true);
                            }
                            else {
                                $("#btnPervious" + ComValueBW).attr("disabled", false);
                            }

                            if (AccountNumberCostPSFTData.length <= 10) {
                                $("#btnNext" + ComValueBW).attr("disabled", true);
                            }
                            else {
                                $("#btnNext" + ComValueBW).attr("disabled", false);
                            }

                            if ((JsonDataCommodity.length - 1) > ComIndexBW) {
                                ///$("#Barchart_canvas" + ComValueBW).after(`<hr/>`);
                                $("#BuildingDivID" + ComValueBW).after(`<hr/>`);
                            }

                            var canvas = document.getElementById('chart_canvas' + ComValueBW);
                            var CanvasData = new Chart(canvas, {
                                type: 'bar',
                                data: {
                                    labels: Displaylabels,
                                    datasets: DataChart
                                },
                                options: {
                                    responsive: true,
                                    //maintainAspectRatio: false,
                                    title: {
                                        display: true,
                                    },
                                    tooltips: {
                                        enabled: true,
                                        mode: 'single',
                                        callbacks: {
                                            label: function (tooltipItem, data) {
                                                //var label = data.labels[tooltipItem.index];
                                                var datasetLabel = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
                                                return addCommas(IsNotNull(datasetLabel) ? datasetLabel : 0);
                                            }
                                        }
                                    },
                                    scales: {
                                        yAxes: [{
                                            id: 'A',
                                            type: 'linear',
                                            position: 'left',
                                            scaleLabel: {
                                                display: true,
                                                labelString: Y1ScalesData,
                                                fontSize: 12
                                                //fontStyle: 'italic'
                                            }
                                        },
                                        {
                                            id: 'B',
                                            type: 'linear',
                                            position: 'right',
                                            scaleLabel: {
                                                display: true,
                                                labelString: Y2ScalesData,
                                                fontSize: 12
                                                //fontStyle: 'italic'
                                            },
                                        }],
                                        xAxes: [{
                                            scaleLabel: {
                                                display: true,
                                                labelString: LableStringName,
                                                fontSize: 16
                                                //fontStyle: 'italic'
                                            },
                                        }]
                                    },
                                    legend: {
                                        onClick: function (event, legendItem) {
                                            //get the index of the clicked legend
                                            var index = legendItem.datasetIndex;
                                            //toggle chosen dataset's visibility
                                            CanvasData.data.datasets[index].hidden =
                                                !CanvasData.data.datasets[index].hidden;
                                            //toggle the related labels' visibility
                                            CanvasData.options.scales.yAxes[index].display =
                                                !CanvasData.options.scales.yAxes[index].display;
                                            CanvasData.update();
                                        }
                                    }

                                }
                            });

                            Analytics.tableBindData(TDisplaylabels, TableDataChart, 'CostSqFt', 'Cost/Sqft', ComValueBW, UOMCode);
                        }
                    });
                    $('.loadercontainer').hide();
                }
                else {
                    $('.loadercontainer').hide();
                    showSweetAlert("Warning!", "No data found!", "warning", null);
                }
                $('.loadercontainer').hide();
            }, function () {
                $('.loadercontainer').hide();
            });
        }
    },

    btnNextCostPSFT: function (commodity, startIndexvalue, lastIndexValue) {
        //$('#Emissionchart_canvas' + commodity).html('');
        var hf_barIndexValue = Number($('#hf_barIndexValue' + commodity + '').val());
        hf_barIndexValue = hf_barIndexValue + 1;
        let checklength = hf_barIndexValue * 10;
        let No = Number(GlobalJsonDataBuilding.length) / 10;
        var Data = (No.toString()).split('.');

        if (startIndexvalue == 0) {
            $("#btnPervious" + commodity).attr("disabled", true);
        }
        else {
            $("#btnPervious" + commodity).attr("disabled", false);
        }

        Y1ScalesData = [];
        Y2ScalesData = [];
        DataChart = [];
        var BuildingCostPSFTData = $.grep(GlobalJsonDataBuilding, function (j) { return j.commodityName == commodity });

        var BuildingCodeArray = [];
        var labels = [];
        var Displaylabels = [];
        var Currency = '';
        //$.each(EmissionDate, function (index, item) {
        //    labels.push(Month[item.month - 1] + ' ' + item.year);
        //});
        $(BuildingCostPSFTData).each(function (i, item) {
            BuildingCodeArray.push(item[IsViewChart]);
        });

        labels = [...new Set(BuildingCodeArray)];
        var NextLength = checklength + 10;
        if (NextLength >= labels.length)
            $("#btnNext" + commodity).attr("disabled", true);


        if (checklength <= labels.length) {
            if (Number(Data[0]) === hf_barIndexValue) {
                $("#btnNext" + commodity).attr("disabled", true);
            }
            else
                $("#btnNext" + commodity).attr("disabled", false);

            var ChartData1 = [];
            var ChartData2 = [];

            ChartData1 = [];
            ChartData2 = [];
            var flag = true;
            $.each(labels, function (index3, item1) {
                if (startIndexvalue <= index3 && lastIndexValue > index3) {
                    flag = true;
                    $.each(BuildingCostPSFTData, function (index1, item2) {
                        if (startIndexvalue <= index1 && lastIndexValue > index1) {
                            ChartData1.push(item2.usage);
                            ChartData2.push(item2.cost);
                            Currency = item2.currency;
                            flag = false;
                        }
                    });
                    Displaylabels.push(item1);
                }
            });

            DataChart.push({
                yAxisID: 'A',
                label: 'Cost',
                borderWidth: 2,
                data: ChartData1,
                backgroundColor: "#003f5c",
                borderColor: "#003f5c",
                borderWidth: 2,
                hoverBackgroundColor: "#003f5c",
                hoverBorderColor: "#003f5c",
                //borderColor: dynamicColors(),
                ticks: {
                    precision: 0,
                    //callback: function (costValue) { return (costValue) },
                    beginAtZero: true,
                    fontSize: 16
                }
            });
            Y1ScalesData.push('Cost ' + Currency);

            DataChart.push({
                yAxisID: 'B',
                label: 'Usage',
                //borderWidth: 2,
                data: ChartData2,
                backgroundColor: "#ffa600",
                borderColor: "#ffa600",
                borderWidth: 2,
                hoverBackgroundColor: "#ffa600",
                hoverBorderColor: "#ffa600",
                ticks: {
                    precision: 0,
                    //callback: function (costValue) { return (costValue) },
                    beginAtZero: true,
                    fontSize: 16
                }
            });
            Y2ScalesData.push('Usage ' + Currency);

            $('#chart_canvas' + commodity).remove();
            $("#EmissionGraph" + commodity).prepend('<canvas id="chart_canvas' + commodity + '" style="height:400px" class="table"></canvas>');

            var canvas = document.getElementById('chart_canvas' + commodity);
            var CanvasData = new Chart(canvas, {
                type: 'bar',
                data: {
                    labels: Displaylabels,
                    datasets: DataChart
                },
                options: {
                    responsive: true,
                    //maintainAspectRatio: false,
                    title: {
                        display: true,
                    },
                    tooltips: {
                        enabled: true,
                        mode: 'single',
                        callbacks: {
                            label: function (tooltipItem, data) {
                                //var label = data.labels[tooltipItem.index];
                                var datasetLabel = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
                                return addCommas(datasetLabel);
                            }
                        }
                    },
                    scales: {
                        yAxes: [{
                            id: 'A',
                            type: 'linear',
                            position: 'left',
                            scaleLabel: {
                                display: true,
                                labelString: Y1ScalesData,
                                fontSize: 12
                                //fontStyle: 'italic'
                            }
                        },
                        {
                            id: 'B',
                            type: 'linear',
                            position: 'right',
                            scaleLabel: {
                                display: true,
                                labelString: Y2ScalesData,
                                fontSize: 12
                                //fontStyle: 'italic'
                            },
                        }],
                        xAxes: [{
                            scaleLabel: {
                                display: true,
                                labelString: LableStringName,
                                fontSize: 16
                                //fontStyle: 'italic'
                            },
                        }]
                    },
                    legend: {
                        onClick: function (event, legendItem) {
                            //get the index of the clicked legend
                            var index = legendItem.datasetIndex;
                            //toggle chosen dataset's visibility
                            CanvasData.data.datasets[index].hidden =
                                !CanvasData.data.datasets[index].hidden;
                            //toggle the related labels' visibility
                            CanvasData.options.scales.yAxes[index].display =
                                !CanvasData.options.scales.yAxes[index].display;
                            CanvasData.update();
                        }
                    }

                }
            });

            $("#btnNext" + commodity).attr("onclick", "Analytics.btnNextCostPSFT('" + commodity + "','" + lastIndexValue + "','" + (Number(lastIndexValue) + 10) + "')");
            $("#btnPervious" + commodity).attr("onclick", "Analytics.btnPerviousCostPSFT('" + commodity + "','" + (Number(lastIndexValue) - 20) + "','" + (Number(lastIndexValue) - 10) + "')");
            //$("#btnPervious" + commodity).attr("onclick", "Analytics.btnPerviousBuilding('" + commodity + "','" + (Number(lastIndexValue - 10)) + "','" + (lastIndexValue) + "')");
        }
        else {
            hf_barIndexValue = hf_barIndexValue - 1;
        }
        $('#hf_barIndexValue' + commodity + '').val(hf_barIndexValue);
    },

    btnPerviousCostPSFT: function (commodity, startIndexvalue, lastIndexValue) {
        $('#Emissionchart_canvas' + commodity).html('');
        if (startIndexvalue == -10)
            startIndexvalue = 0;
        if (lastIndexValue == 0)
            lastIndexValue = 10

        var hf_barIndexValue = Number($('#hf_barIndexValue' + commodity + '').val());
        hf_barIndexValue = hf_barIndexValue - 1;

        if (startIndexvalue == 0) {
            $("#btnPervious" + commodity).attr("disabled", true);
        }
        else {
            $("#btnPervious" + commodity).attr("disabled", false);
        }

        Y1ScalesData = [];
        Y2ScalesData = [];
        DataChart = [];
        var BuildingCostPSFTData = $.grep(GlobalJsonDataBuilding, function (j) { return j.commodityName == commodity });

        var BuildingCodeArray = [];
        var labels = [];
        var Displaylabels = [];
        var Currency = '';
        //$.each(EmissionDate, function (index, item) {
        //    labels.push(Month[item.month - 1] + ' ' + item.year);
        //});
        $(BuildingCostPSFTData).each(function (i, item) {
            BuildingCodeArray.push(item[IsViewChart]);
        });

        labels = [...new Set(BuildingCodeArray)];

        if (hf_barIndexValue >= 0) {
            $("#btnNext" + commodity).attr("disabled", false);

            var ChartData1 = [];
            var ChartData2 = [];

            ChartData1 = [];
            ChartData2 = [];
            var flag = true;
            $.each(labels, function (index3, item1) {
                if (startIndexvalue <= index3 && lastIndexValue > index3) {
                    flag = true;
                    $.each(BuildingCostPSFTData, function (index1, item2) {
                        if (startIndexvalue <= index1 && lastIndexValue > index1) {
                            ChartData1.push(item2.usage);
                            ChartData2.push(item2.cost);
                            Currency = item2.currency;
                            flag = false;
                        }
                    });
                    Displaylabels.push(item1);
                }
            });

            DataChart.push({
                yAxisID: 'A',
                label: 'Cost',
                borderWidth: 2,
                data: ChartData1,
                backgroundColor: "#003f5c",
                borderColor: "#003f5c",
                borderWidth: 2,
                hoverBackgroundColor: "#003f5c)",
                hoverBorderColor: "#003f5c",
                //borderColor: dynamicColors(),
                ticks: {
                    precision: 0,
                    //callback: function (costValue) { return (costValue) },
                    beginAtZero: true,
                    fontSize: 16
                }
            });
            Y1ScalesData.push('Cost ' + Currency);

            DataChart.push({
                yAxisID: 'B',
                label: 'Usage',
                //borderWidth: 2,
                data: ChartData2,
                backgroundColor: "#ffa600",
                borderColor: "#ffa600",
                borderWidth: 2,
                hoverBackgroundColor: "#ffa600",
                hoverBorderColor: "#ffa600",
                ticks: {
                    precision: 0,
                    //callback: function (costValue) { return (costValue) },
                    beginAtZero: true,
                    fontSize: 16
                }
            });
            Y2ScalesData.push('Usage ' + Currency);

            $('#chart_canvas' + commodity).remove();
            $("#EmissionGraph" + commodity).prepend('<canvas id="chart_canvas' + commodity + '" style="height:400px" class="table"></canvas>');
            var canvas = document.getElementById('chart_canvas' + commodity);
            var CanvasData = new Chart(canvas, {
                type: 'bar',
                data: {
                    labels: Displaylabels,
                    datasets: DataChart
                },
                options: {
                    responsive: true,
                    //maintainAspectRatio: false,
                    title: {
                        display: true,
                    },
                    tooltips: {
                        enabled: true,
                        mode: 'single',
                        callbacks: {
                            label: function (tooltipItem, data) {
                                //var label = data.labels[tooltipItem.index];
                                var datasetLabel = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
                                return addCommas(datasetLabel);
                            }
                        }
                    },
                    scales: {
                        yAxes: [{
                            id: 'A',
                            type: 'linear',
                            position: 'left',
                            scaleLabel: {
                                display: true,
                                labelString: Y1ScalesData,
                                fontSize: 12
                                //fontStyle: 'italic'
                            }
                        },
                        {
                            id: 'B',
                            type: 'linear',
                            position: 'right',
                            scaleLabel: {
                                display: true,
                                labelString: Y2ScalesData,
                                fontSize: 12
                                //fontStyle: 'italic'
                            },
                        }],
                        xAxes: [{
                            scaleLabel: {
                                display: true,
                                labelString: LableStringName,
                                fontSize: 16
                                //fontStyle: 'italic'
                            },
                        }]
                    },
                    legend: {
                        onClick: function (event, legendItem) {
                            //get the index of the clicked legend
                            var index = legendItem.datasetIndex;
                            //toggle chosen dataset's visibility
                            CanvasData.data.datasets[index].hidden =
                                !CanvasData.data.datasets[index].hidden;
                            //toggle the related labels' visibility
                            CanvasData.options.scales.yAxes[index].display =
                                !CanvasData.options.scales.yAxes[index].display;
                            CanvasData.update();
                        }
                    }

                }
            });

            $("#btnNext" + commodity).attr("onclick", "Analytics.btnNextCostPSFT('" + commodity + "','" + lastIndexValue + "','" + (Number(lastIndexValue) + 10) + "')");
            $("#btnPervious" + commodity).attr("onclick", "Analytics.btnPerviousCostPSFT('" + commodity + "','" + (Number(lastIndexValue) - 20) + "','" + (Number(lastIndexValue) - 10) + "')");
            //$("#btnPervious" + commodity).attr("onclick", "Analytics.btnPerviousBuilding('" + commodity + "','" + (Number(lastIndexValue - 10)) + "','" + (lastIndexValue) + "')");
        }
        else {
            hf_barIndexValue = hf_barIndexValue - 1;
        }
        $('#hf_barIndexValue' + commodity + '').val(hf_barIndexValue);
    },

    //=============================== Tab Cost SQFT End =================================

    BindUtilityDDLForSearch: function () {
        $("#ddlCommoditySearch").val("").select2();
        $("#ddlBuildingSearch").val("").select2();
        $("#ddlAccountSearch").val("").select2();
        $("#ddlMeterSearch").val("").select2();

        if (IsNotNull($("#ddlCustomerSearch").val())) {
            Reload_ddl_Global(null, "#ddlUtilitySearch", "/AjaxCommon/GetUtilityDDLForChart", { CustomerID: $("#ddlCustomerSearch").val() }, "Select", function (data) {
                var Data = data.data;
                var UtilityId = [];
                $.each(Data, function (index, item) {
                    UtilityId.push(item.utilityID);
                });
                $("#ddlUtilitySearch").val(UtilityId);
                $("#ddlUtilitySearch").select2();
                Analytics.BindCommodityDDLForSearch();
            });
        }
        else {
            $("#ddlUtilitySearch").find("option").remove();
            $("#ddlCommoditySearch").find("option").remove();
            $("#ddlBuildingSearch").find("option").remove();
            $("#ddlAccountSearch").find("option").remove();
            $("#ddlMeterSearch").find("option").remove();

            $("#ddlUtilitySearch").select2();
            $("#ddlCommoditySearch").select2();
            $("#ddlBuildingSearch").select2();
            $("#ddlAccountSearch").select2();
            $("#ddlMeterSearch").select2();
        }
    },

    BindCommodityDDLForSearch: function () {
        $("#ddlBuildingSearch").val("").select2();
        $("#ddlAccountSearch").val("").select2();
        $("#ddlMeterSearch").val("").select2();

        if (IsNotNull($("#ddlCustomerSearch").val())) {
            Reload_ddl_Global(null, "#ddlCommoditySearch", "/AjaxCommon/GetCommodityDDLForChart", { CustomerID: $("#ddlCustomerSearch").val(), UtilityIDs: $("#ddlUtilitySearch").val().join(',') || null }, "Select", function (data) {
                var Data = data.data;
                var CommodityIDs = [];
                $.each(Data, function (index, item) {
                    CommodityIDs.push(item.commodityID);
                });
                $("#ddlCommoditySearch").val(CommodityIDs);
                $("#ddlCommoditySearch").select2();
                Analytics.BindBuildingDDLForSearch();
            });
        }
    },

    BindBuildingDDLForSearch: function () {
        $("#ddlAccountSearch").val("").select2();
        $("#ddlMeterSearch").val("").select2();
        if (IsNotNull($("#ddlCustomerSearch").val())) {
            Reload_ddl_Global(null, "#ddlBuildingSearch", "/AjaxCommon/GetBuildingDDLForChart", { CustomerID: $("#ddlCustomerSearch").val(), UtilityIDs: $("#ddlUtilitySearch").val().join(','), CommodityIDs: $("#ddlCommoditySearch").val().join(',') }, "Select", function (data) {
                $("#ddlBuildingSearch").select2();
                Analytics.BindUtilityAccountDDLForSearch();
            });
        }
    },

    BindUtilityAccountDDLForSearch: function () {
        $('#ddlMeterSearch').html("").empty();
        $('#ddlAccountSearch').html("").empty();
        $("#ddlMeterSearch").val("").select2();
        if (IsNotNull($("#ddlBuildingSearch").val())) {
            Reload_ddl_Global(null, "#ddlAccountSearch", "/AjaxCommon/GetUtilityAccountDDLForChart", { BuildingIDs: $("#ddlBuildingSearch").val().join(','), CommodityIDs: $("#ddlCommoditySearch").val().join(',') }, "Select", function (data) {
                $("#ddlAccountSearch").select2();
                //Analytics.BindMeterDDLForSearch();
            });
        }
    },


    BindMeterDDLForSearch: function () {
        Reload_ddl_Global(null, "#ddlMeterSearch", "/AjaxCommon/GetUtilityMeterNumberDDLForChart", { UtilityAccountIDs: $("#ddlAccountSearch").val().join(',') || null, CustomerID: $("#ddlCustomerSearch").val() || null, CommodityIDs: $("#ddlCommoditySearch").val().join(',') || null, BuildingIDs: $("#ddlBuildingSearch").val().join(',') || null }, "Select", function () { $("#ddlMeterSearch").select2(); });
    },

    ResetData: function () {
        $(".has-error p").html("");
        $(".has-error").removeClass("has-error");
        Analytics.ClearData();

        $("#ddlCustomerSearch").select2();
        $("#ddlUtilitySearch").select2();
        $("#ddlBuildingSearch").select2();
        $("#ddlAccountSearch").select2();
        $("#ddlCommoditySearch").select2();
        $("#ddlMeterSearch").select2();
        $('#ddlMeterSearch').html("").empty();
        $('#ddlAccountSearch').html("").empty();

        Reload_ddl_Global_staticData(null, "#ddlTypeWiseViewSearch", "/AjaxCommon/GetStatusDDL", null, "Select", ddlTypeWiseView, function () { $("#ddlTypeWiseViewSearch").select2(); });
        $("#ddlTypeWiseViewSearch").val(1).trigger("change");


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
                        Analytics.BindBuildingDDLForSearch();
                        Analytics.BindData();
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

        ResetFormErrors("#frm_UsageDataChart");
        Clear_Form_Fields("#frm_UsageDataChart");
        $(".has-error p").html("").hide();
        $(".has-error").removeClass("has-error");
    },

    GetData: function () {
        return {
            CustomerID: $("#ddlCustomerSearch").val(),
            UtilityIDs: $("#ddlUtilitySearch").val().join(','),
            BuildingIDs: $("#ddlBuildingSearch").val().join(','),
            UtilityAccountIDs: $("#ddlAccountSearch").val().join(','),
            CommodityIDs: $("#ddlCommoditySearch").val().join(','),
            UtilityMeterIDs: $("#ddlMeterSearch").val().join(','),
            EffectiveFromMonth: $("#txtvalidFrom").val(),
            EffectiveTillMonth: $("#txtvalidUntil").val(),
            EndUserID: UserID,
            EffectiveFromDate: $("#txtvalidFrom").val(),
            EffectiveTillDate: $("#txtvalidUntil").val(),
            TypeWiseViewID: $("#ddlTypeWiseViewSearch").val(),
            IsCalenderWise: $("#rdbAllData").prop('checked')
        };
    },

    ValidateData: function (FormData) {
        var valid = true;
        valid = Validate_DDLControl_NullBlank("#ddlTypeWiseViewSearch", FormData.TypeWiseViewID, 'Required', valid);
        valid = Validate_DDLControl_NullBlank("#ddlCustomerSearch", FormData.CustomerID, 'Required', valid);
        valid = Validate_DDLControl_NullBlank("#ddlUtilitySearch", FormData.UtilityIDs, 'Required', valid);
        valid = Validate_DDLControl_NullBlank("#ddlCommoditySearch", FormData.CommodityIDs, 'Required', valid);
        valid = Validate_Control_NullBlank("#txtvalidFrom", FormData.EffectiveFromMonth, 'Required', valid);
        valid = Validate_Control_NullBlank("#txtvalidUntil", FormData.EffectiveTillMonth, 'Required', valid);
        //FocusOnError("#frm_AddMeterBill", valid);
        return valid;
    },

    GetUsageDataForChart: function () {
        var FormData = Analytics.GetData();
        if (Analytics.ValidateData(FormData)) {
            GetAjaxData("/UsageData/GetUsageDataForChart", { Model: FormData }, function (data) {
                var JsonData = data.data;
                var JsonDataCommodity;
                try {
                    if (IsNotNull(JsonData)) {
                        Analytics.ClearData();
                        let CommodityList = [];

                        $(JsonData).each(function (i, item) {
                            CommodityList.push(item.commodityName);
                        });

                        JsonDataCommodity = [...new Set(CommodityList)];

                        $.each(JsonDataCommodity, function (ComIndex, ComValue) {

                            let innerArray = [];
                            var outerArray = [];
                            innerArray.push('');
                            innerArray.push(ComValue);
                            innerArray.push('Cost');
                            outerArray.push(innerArray);

                            var filteredJsonData = $.grep(JsonData, function (j) { return j.commodityName == ComValue });

                            $.each(filteredJsonData, function (index, item) {
                                innerArray = [];
                                $.each(item, function (itemKey, itemValue) {
                                    if (itemKey == "monthName") {
                                        innerArray.push(itemValue);
                                    }
                                    else if (itemKey == "totalVolume") {
                                        innerArray.push(itemValue);
                                    }
                                    else if (itemKey == "totalCost") {
                                        innerArray.push(itemValue);
                                    }
                                });
                                outerArray.push(innerArray);
                            });

                            console.log(outerArray);
                            var commodityUsageAndCost = google.visualization.arrayToDataTable(outerArray);

                            var optionsforConnodityUsageAndCost = {
                                title: ComValue + ' : Month wise usage and cost',
                                hAxis: {
                                    title: ComValue + ' : Month wise usage and cost',
                                    titleTextStyle: {
                                        color: '#333'
                                    },
                                    gridlines: {
                                        color: '#f3f3f3',
                                        count: 4
                                    },
                                    format: '####'
                                },
                                vAxis: {
                                    minValue: 0,
                                    gridlines: {
                                        color: '#f3f3f3',
                                        count: 5
                                    }
                                }
                            };

                            $("#CostUsageChartDiv").append(`
                        <div class="col-lg-12">
                            <div id="Chart`+ ComValue + `"></div>
                        </div>`)

                            let generateChart = new google.visualization.AreaChart(document.getElementById('Chart' + ComValue));
                            generateChart.draw(commodityUsageAndCost, optionsforConnodityUsageAndCost);

                        });
                    }
                } catch (e) {
                    printError("Analytics.js", 'GetDataByID', e);
                }

            }, function () { });
        }

    },

    GetUsageDataForChart2YAxis: function () {

        var FormData = Analytics.GetData();
        if (Analytics.ValidateData(FormData)) {
            GetAjaxData("/UsageData/GetUsageDataForChart", { Model: FormData }, function (data) {
                var JsonData = data.data;
                var JsonDataCommodity;
                $("#divCostUsage").html('');
                try {
                    if (IsNotNull(JsonData)) {
                        Analytics.ClearData();
                        let CommodityList = [];

                        $(JsonData).each(function (i, item) {
                            CommodityList.push(item.commodityName);
                        });

                        JsonDataCommodity = [...new Set(CommodityList)];

                        $.each(JsonDataCommodity, function (ComIndex, ComValue) {
                            Analytics.BindChart(JsonData, ComIndex, ComValue);
                        });
                    }
                } catch (e) {
                    printError("Analytics.js", 'GetDataByID', e);
                }

            }, function () { });
        }

    },

    BindChart: function (JsonData, ComIndex, ComValue) {

        var innerArray = [];
        var outerArray = [];

        //[new Date(2014, 0), -.5, 5.7],

        var filteredJsonData = $.grep(JsonData, function (j) { return j.commodityName == ComValue });

        $.each(filteredJsonData, function (index, item) {
            innerArray = [];
            $.each(item, function (itemKey, itemValue) {
                if (itemKey == "monthYearPart") {
                    innerArray.push(eval(itemValue));
                }
                else if (itemKey == "totalCost") {
                    innerArray.push(itemValue);
                }
                else if (itemKey == "totalVolume") {
                    innerArray.push(itemValue);
                }
            });
            outerArray.push(innerArray);
        });

        console.log(outerArray);

        let data = new google.visualization.DataTable();
        data.addColumn('date', 'Month');
        data.addColumn('number', "Cost");
        data.addColumn('number', "Usage");

        data.addRows(outerArray);

        google.charts.load('current', { 'packages': ['line', 'corechart'] });

        //google.charts.setOnLoadCallback(drawSarahChart);                            
        //google.charts.setOnLoadCallback(drawAnthonyChart);

        let materialOptions = {
            chart: {
                title: ComValue + ' : Cost V/S Usage' //'Average Temperatures and Daylight in Iceland Throughout the Year'
            },
            //responsive: true,
            //maintainAspectRatio: false,
            width: 600,
            height: 350,
            series: {
                // Gives each series an axis name that matches the Y-axis below.
                0: { axis: 'Cost' },
                1: { axis: 'Usage' }
            },
            axes: {
                // Adds labels to each axis; they don't have to match the axis names.
                y: {
                    Cost: { label: 'Cost' },
                    Usage: { label: 'Usage' }
                }
            }
        };


        $("#CostUsageChartDiv").append(`<div class="col-lg-12">
                                                               <div id="chartDiv`+ ComValue + `"></div>
                                                         </div>`);

        var materialChart = new google.charts.Line(document.getElementById('chartDiv' + ComValue));
        materialChart.draw(data, materialOptions);


    },

    // Chart JS imlementation Dyanamic 16 Jan 2020

    GetUsageDataForChartJSDyanamic: function () {
        $("#divCostUsage").html('');
        $("#barChart").html('');
        $("#divIDChartAccountWise").html('');
        Reset_Form_Errors();
        var FormData = Analytics.GetData();
        if (Analytics.ValidateData(FormData)) {
            if (FormData.TypeWiseViewID == 1) {
                Analytics.GetMonthalyUsageDataForChartJSDyanamic();
            }
            else if (FormData.TypeWiseViewID == 2) {
                Analytics.bindBuildingData();
            }
            else if (FormData.TypeWiseViewID == 3) {
                Analytics.bindAccountNumberData();
            }
        }
    },

    GetMonthalyUsageDataForChartJSDyanamic: function () {
        $("#divCostUsage").html('');
        var FormData = Analytics.GetData();
        if (Analytics.ValidateData(FormData)) {
            GetAjaxData("/UsageData/GetUsageDataForChart", { Model: FormData }, function (data) {
                var JsonData = data.data;
                var JsonDataCommodity;
                try {
                    if (IsNotNull(JsonData)) {
                        Analytics.ClearData();
                        let CommodityList = [];

                        $(JsonData).each(function (i, item) {
                            CommodityList.push(item.commodityName);
                        });

                        JsonDataCommodity = [...new Set(CommodityList)];

                        $.each(JsonDataCommodity, function (ComIndex, ComValue) {
                            var UOMCode = null;
                            var Currency = null;

                            let monthNameArray = [];
                            let costArray = [];
                            let usageArray = [];

                            var filteredJsonData = $.grep(JsonData, function (j) { return j.commodityName == ComValue });

                            $.each(filteredJsonData, function (index, item) {
                                $.each(item, function (itemKey, itemValue) {
                                    if (itemKey == "monthYearSubstring") {
                                        monthNameArray.push(itemValue);
                                    }
                                    else if (itemKey == "totalCost") {
                                        costArray.push(itemValue);
                                    }
                                    else if (itemKey == "totalVolume") {
                                        usageArray.push(itemValue);
                                    }
                                    else if (itemKey == "uomCode") {
                                        UOMCode = itemValue;
                                    }
                                    else if (itemKey == "currency") {
                                        Currency = itemValue;
                                    }
                                });
                            });

                            $("#divChartHolder").append(`<lable style="font-weight: bold;">` + ComValue + ` : Cost V/S Usage</lable>
                                                               <canvas id="chartCanvas`+ ComValue + `" style="height:400px" class="table"></canvas>`);

                            if ((JsonDataCommodity.length - 1) > ComIndex) {
                                $("#chartCanvas" + ComValue).after(`<hr/>`);
                            }
                            var canvas = document.getElementById('chartCanvas' + ComValue);

                            var CanvasData = new Chart(canvas, {
                                type: 'bar',
                                data: {
                                    labels: monthNameArray,
                                    datasets: [{
                                        yAxisID: 'Cost',
                                        label: "Cost",
                                        backgroundColor: "rgba(0, 168, 83,0.2)",
                                        borderColor: "rgba(0, 168, 83,1)",
                                        borderWidth: 2,
                                        hoverBackgroundColor: "rgba(0, 168, 83,0.4)",
                                        hoverBorderColor: "rgba(0, 168, 83,1)",
                                        data: costArray,

                                    }, {
                                        yAxisID: 'Usage',
                                        label: "Usage",
                                        backgroundColor: "rgba(29, 55, 128,0.2)",
                                        borderColor: "rgba(29, 55, 128,1)",
                                        borderWidth: 2,
                                        hoverBackgroundColor: "rgba(29, 55, 128,0.4)",
                                        hoverBorderColor: "rgba(29, 55, 128,1)",
                                        data: usageArray,
                                    }]
                                },
                                options: {
                                    //responsive: true,
                                    //maintainAspectRatio: false,
                                    title: {
                                        display: true,
                                    },
                                    tooltips: {
                                        enabled: true,
                                        mode: 'single',
                                        callbacks: {
                                            label: function (tooltipItem, data) {
                                                //var label = data.labels[tooltipItem.index];
                                                var datasetLabel = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
                                                return addCommas(datasetLabel);
                                            }
                                        }
                                    },
                                    scales: {
                                        yAxes: [{
                                            id: 'Cost',
                                            type: 'linear',
                                            position: 'left',
                                            scaleLabel: {
                                                display: true,
                                                labelString: "Cost (" + Currency + ")",
                                                //fontStyle: 'italic'
                                            },
                                            ticks: { callback: function (costValue) { return addCommas(costValue) } }
                                        }, {
                                            id: 'Usage',
                                            type: 'linear',
                                            position: 'right',
                                            scaleLabel: {
                                                display: true,
                                                labelString: "Usage (" + UOMCode + ")",
                                                //fontStyle: 'italic'
                                            },
                                            ticks: { callback: function (usageValue) { return addCommas(usageValue) } }
                                        }]
                                    },
                                    legend: {
                                        onClick: function (event, legendItem) {
                                            //get the index of the clicked legend
                                            var index = legendItem.datasetIndex;
                                            //toggle chosen dataset's visibility
                                            CanvasData.data.datasets[index].hidden =
                                                !CanvasData.data.datasets[index].hidden;
                                            //toggle the related labels' visibility
                                            CanvasData.options.scales.yAxes[index].display =
                                                !CanvasData.options.scales.yAxes[index].display;
                                            CanvasData.update();
                                        }
                                    }
                                }
                            });

                        });
                    }
                } catch (e) {
                    printError("Analytics.js", 'GetDataByID', e);
                }

            }, function () { });
        }
    },

    ScreenAccessPermission: function () {
        var returnModal = {};
        var getAccess = GetScreenAccessPermissions(CurrentScreenID);


        for (var i = 1; i < getAccess.length; i++) {
            if (getAccess.length > 1) {
                if ((getAccess[i].ActionCode == "AccessEmission")) {
                    flagAccessEmission = true;
                    returnModal['AccessEmission'] = true;
                }
                if ((getAccess[i].ActionCode == "AccessCostUsage")) {
                    flagAccessCostUsage = true;
                    returnModal['AccessCostUsage'] = true;
                }

                if ((getAccess[i].ActionCode == "AccessCostSqFt")) {
                    flagAccessCostSqFt = true;
                    returnModal['AccessCostSqFt'] = true;
                }

            }
        }

        if (!flagAccessEmission) {
            $(".AccessEmission").hide();
        }
        else
            $(".AccessEmission").show();

        if (!flagAccessCostUsage) {
            $(".AccessCostUsage").hide();
        }
        else
            $(".AccessCostUsage").show();


        if (!flagAccessCostSqFt) {
            $(".AccessCostSqFt").hide();
        }
        else
            $(".AccessCostSqFt").show();


        return returnModal;
    },

    ToggleChartToTable: function (Commodity) {
        debugger;
        if ($("#chk" + Commodity).prop("checked") == true) {
            $("#EmissionGraph" + Commodity).hide();
            $("#container" + Commodity).show();
            $("#download" + Commodity).show();
        }
        else {
            $("#download" + Commodity).hide();
            $("#container" + Commodity).hide();
            $("#EmissionGraph" + Commodity).show();
        }

    },

    tableBindData: function (Displaylabels, TableData, TableID, Type, Commodity, UOMCode) {
        const tableContainer = document.getElementById('container' + Commodity);
        const xAxis = Displaylabels;
        const yAxis = TableData;
        const tableHeader = `<thead><tr>${
            xAxis.reduce((memo, entry) => { memo += `<th style='min-width: 70px;'>${entry}</th>`; return memo; }, '<th></th>')
            }</tr></thead>`;

        const tableBody = yAxis.reduce((memo, entry) => {
            const rows = entry.data.reduce((memo, entry) => {
                var entry1 = entry == null ? 0 : entry;
                memo += `<td>${addCommas(Math.round(entry1))}</td>`
                return memo;
            }, '');
            var Lable = entry.label == 'Usage' ? entry.label + ' (' + UOMCode + ')' : entry.label;
            memo += `<tbody><tr><td>${Lable}</td>${rows}</tr></tbody>`;

            return memo;
        }, '');
        //<label style="font-weight: bold;">` + Commodity + ``+ Type +` Table</label>
        const table = `<table id="tbl` + TableID + `` + Commodity + `" class="table table-striped table-bordered table-hover dataTable no-footer">
                                <template>` + CustomerName + `_` + Commodity + `_` + Type + `_` + monthName + `</template>${tableHeader}${tableBody}</table>`;

        tableContainer.innerHTML = table;
    },

    // ........................ Combine Emission Graph .......................................

    MonthlyEmissionCombineGraph: function (JsonData, commodityList) {
        Y1ScalesData = [];
        Y2ScalesData = [];
        DataChart = [];
        TableDataChart = [];

        var filteredVariableData = JsonData.uniqeVariable
        var EmissionData = JsonData.emissionCombineValue;
        var EmissionDate = JsonData.emissionDate;
        var UsageData = JsonData.commUsageValue;

        var labels = [];
        var Displaylables = [];
        var DisplaylablesTab = [];
        $.each(EmissionDate, function (index, item) {
            labels.push(Month[item.month - 1] + ' ' + item.year);
        });



        var TableEmissionData = [];
        var ChartData1 = [];
        var ChartData2 = [];
        //var backgroundColor = [];
        $.each(filteredVariableData, function (index, item) {
            //backgroundColor.push(getRandomColor());
            if (IsNotNull(EmissionData)) {
                var data1 = $.grep(EmissionData, function (i) {
                    return item.variableID === i.variableID
                });


                TableEmissionData = [];
                TableUsageData = [];
                ChartData1 = [];
                ChartData2 = [];
                var flag = true;
                $.each(labels, function (index, item1) {
                    flag = true;
                    flag1 = true;
                    $.each(data1, function (index1, item2) {
                        var label1 = Month[item2.month - 1] + ' ' + item2.year.toString();
                        if (item1 == label1) {
                            if (item2.emission != 0) {
                                if (item.displayAxis == 1) {
                                    ChartData1.push(Math.round(item2.emission));
                                    flag = false;
                                }
                                else {
                                    ChartData2.push(Math.round(item2.emission));
                                    flag = false;
                                }
                                TableEmissionData.push(Math.round(item2.emission));
                                Displaylables.push(item1);
                            }
                            TableUsageData.push(item2.usage);
                            flag1 = false;
                        }
                        if (!flag1)
                            DisplaylablesTab.push(item1);
                    });
                    if (flag) {
                        if (item.displayAxis == 1) {
                            ChartData1.push(0);
                            TableEmissionData.push(0);
                            //TableUsageData.push(0);
                        }
                        else {
                            ChartData2.push(0);
                            TableEmissionData.push(0);
                            //TableUsageData.push(0);
                        }
                    }

                });
            }
            else {
                $.each(labels, function (index1, item1) {
                    ChartData1.push(0);
                    ChartData2.push(0);
                    TableEmissionData.push(0);
                });
            }
            var dynamicColors = function () {
                var r = Math.floor(Math.random() * 190);
                var g = Math.floor(Math.random() * 190);
                var b = Math.floor(Math.random() * 190);
                return "rgb(" + r + "," + g + "," + b + ")";
            }
            var VariableName = item.variableDescription.split(" ")[1];
            //var CommodityName = $("#ddlCommoditySearch option:selected").text();
            //var Commodityunit = "";
            //if (CommodityName.toLowerCase() == "electric" ) {
            //    Commodityunit = "KWH";
            //}
            TableDataChart.push({
                label: VariableName,
                data: TableEmissionData,
                UsageData: TableUsageData
            });

            if (item.displayAxis == 1) {
                DataChart.push({
                    yAxisID: 'A',
                    label: VariableName,
                    borderWidth: 2,
                    data: ChartData1,
                    hidden: item.defaultVariable ? false : true,
                    backgroundColor: color[index],
                    fill: false,
                    lineTension: 0.1,
                    borderColor: color[index],
                    ticks: {
                        precision: 0,
                        //callback: function (costValue) { return (costValue) },
                        beginAtZero: true,
                        fontSize: 16
                    }
                });
                Y1ScalesData.push(VariableName);
            }
            else {
                DataChart.push({
                    yAxisID: 'B',
                    label: VariableName,
                    borderWidth: 2,
                    data: ChartData2,
                    hidden: item.defaultVariable ? false : true,
                    backgroundColor: color[index],
                    fill: false,
                    lineTension: 0.1,
                    borderColor: color[index],
                    ticks: {
                        precision: 0,
                        //callback: function (costValue) { return (costValue) },
                        beginAtZero: true,
                        fontSize: 16
                    }
                });
                Y2ScalesData.push(VariableName);
            }

        });
        Displaylables = [...new Set(Displaylables)];
        DisplaylablesTab = [...new Set(DisplaylablesTab)];

        //$("#EmissionChartDiv").html('');
        $("#EmissionChartDiv").append(`<div><lable style="font-weight: bold;">` + 'Total' + ` Emission(M.Tons)</lable>
                    <a href="javascript:;" id="download`+ 'Electric1' + `" style="float: right;background-color: #f7f8fa;display:none;" class="btn btn-sm btn-clean btn-icon btn-icon-md" title="Excel Export" onclick="ExportToExcelGrid('#tblEmission` + 'Electric1' + `','excel')"><i class="fa fa-file-excel" style="color:#555"></i> </a>
                        <label class="switch" style="margin-left: .5rem;margin-right: 5px;">
                            <input id="chk`+ 'Electric1' + `" type="checkbox" onchange="Analytics.ToggleChartToTable('` + 'Electric1' + `');" />
                            <div class="slider round" style="background-color:#555;">
                                <span class="on">
                                    <i class="fa fa-chart-line fa-2x" aria-hidden="true"></i>
                                </span>
                                <span class="off">
                                    <i class="fa fa-table fa-2x" aria-hidden="true"></i>
                                </span>
                            </div>
                        </label>
                    </div>
                    <div id="EmissionGraph`+ 'Electric1' + `">
                    <canvas id="chartCanvas`+ 'Electric1' + `" style="height:400px" class="table"></canvas>
                    </div>
                     <div id="container`+ 'Electric1' + `" style="display:none;" class="table-responsive"></div>
                    </br>
                    `);

        //if ((JsonDataCommodity.length - 1) > ComIndex) {
        //    $("#chartCanvas" + 'Electric1').after(`<hr/>`);
        //}
        var canvas = document.getElementById('chartCanvas' + 'Electric1');

        var CanvasData = new Chart(canvas, {
            type: 'bar',
            data: {
                labels: Displaylables,
                datasets: DataChart
            },
            options: {
                responsive: true,
                title: {
                    display: true,
                },
                tooltips: {
                    enabled: true,
                    mode: 'single',
                    callbacks: {
                        label: function (tooltipItem, data) {
                            //var label = data.labels[tooltipItem.index];
                            var datasetLabel = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
                            return addCommas(IsNotNull(datasetLabel) ? datasetLabel : 0);
                        }
                    }
                },
                scales: {
                    yAxes: [{
                        id: 'A',
                        type: 'linear',
                        hidden: false,
                        position: 'left',
                        scaleLabel: {
                            display: true,
                            labelString: "Emission (" + Y1ScalesData + ")",
                            fontSize: 12
                            //fontStyle: 'italic'
                        },
                        ticks: { callback: function (usageValue) { return addCommas(IsNotNull(usageValue) ? usageValue : 0.00) } }
                    },
                    {
                        id: 'B',
                        type: 'linear',
                        hidden: false,
                        position: 'right',
                        scaleLabel: {
                            display: true,
                            labelString: Y2ScalesData.length != 0 ? "Emission (" + Y2ScalesData + ")" : "",
                            fontSize: 12
                            //fontStyle: 'italic'
                        },
                        ticks: { callback: function (usageValue) { return addCommas(IsNotNull(usageValue) ? usageValue : 0.00) } }
                    }],
                    xAxes: [{
                        scaleLabel: {
                            display: true,
                            labelString: "Month",
                            fontSize: 16
                            //fontStyle: 'italic'
                        },
                    }]
                },
                legend: {
                    onClick: function (event, legendItem) {
                        debugger
                        //get the index of the clicked legend
                        var index = legendItem.datasetIndex;
                        var axis = '';
                        var Y1Count = [], Y2Count = [];
                        $.each(CanvasData.data.datasets, function (index1, item1) {
                            if (item1.yAxisID == 'A') {
                                if (index == index1)
                                    axis = item1.yAxisID;

                                Y1Count.push(item1);
                            }
                            else {
                                Y2Count.push(item1);
                            }

                        });

                        if (axis == 'A') {
                            if (Y1Count.length == 1) {
                                CanvasData.data.datasets[index].hidden =
                                    !CanvasData.data.datasets[index].hidden;
                                //toggle the related labels' visibility
                                CanvasData.options.scales.yAxes[index].display =
                                    !CanvasData.options.scales.yAxes[index].display;
                            }
                            else {
                                var Casshow = CanvasData.data.datasets[index].hidden;
                                if (CanvasData.data.datasets[index].hidden == false || CanvasData.data.datasets[index].hidden == undefined) {
                                    CanvasCountX = Number(CanvasCountX) + 1;
                                }
                                else if (CanvasData.data.datasets[index].hidden == true) {
                                    CanvasCountX = Number(CanvasCountX) - 1;
                                }
                                else { }

                                CanvasData.data.datasets[index].hidden =
                                    !CanvasData.data.datasets[index].hidden;

                                if ((CanvasCountX > 0 && CanvasCountX % 2 === 0) || (CanvasCountX > 0 && Casshow === true)) {
                                    CanvasData.options.scales.yAxes[0].display =
                                        !CanvasData.options.scales.yAxes[0].display;
                                }
                            }
                            CanvasData.update();
                        }

                        else {
                            if (Y2Count.length == 1) {
                                CanvasData.data.datasets[index].hidden =
                                    !CanvasData.data.datasets[index].hidden;
                                //toggle the related labels' visibility
                                CanvasData.options.scales.yAxes[index].display =
                                    !CanvasData.options.scales.yAxes[index].display;
                            }
                            else {
                                var Casshow = CanvasData.data.datasets[index].hidden;
                                if (CanvasData.data.datasets[index].hidden == false || CanvasData.data.datasets[index].hidden == undefined) {
                                    CanvasCount = Number(CanvasCount) + 1;
                                }
                                else if (CanvasData.data.datasets[index].hidden == true) {
                                    CanvasCount = Number(CanvasCount) - 1;
                                }
                                else { }

                                CanvasData.data.datasets[index].hidden =
                                    !CanvasData.data.datasets[index].hidden;

                                if ((CanvasCount > 0 && CanvasCount % 2 === 0) || (CanvasCount > 0 && Casshow === true)) {
                                    CanvasData.options.scales.yAxes[1].display =
                                        !CanvasData.options.scales.yAxes[1].display;
                                }
                            }

                            CanvasData.update();
                        }
                    }
                }
            }
        });
        if (Y2ScalesData.length == 0)
            CanvasData.options.scales.yAxes[1].display = false;

        if (Y1ScalesData.length == 0)
            CanvasData.options.scales.yAxes[0].display = false;


        const tableContainer = document.getElementById('container' + 'Electric1');
        const xAxis = labels;
        const yAxis = TableDataChart;
        const tableHeader = `<thead><tr>${
            xAxis.reduce((memo, entry) => { memo += `<th style='min-width: 70px;'>${entry}</th>`; return memo; }, '<th>Emission</th><th/>')
            }</tr></thead>`;
        debugger
        var Row = '';
        $.each(commodityList, function (index, item) {
            var rows1 = ''; var usageCommData = []; var UomCode = '';

            $.each(UsageData, function (index1, item1) {
                if (item == item1.commodityName) {
                    usageCommData.push(item1.usage);
                    UomCode = item1.uomCode;
                }
            });
            rows1 = usageCommData.reduce((memo, entry) => {
                var entry1 = entry == null ? 'NA' : addCommas(Math.round(entry));
                memo += `<td>${entry1}</td>`
                return memo;
            }, '');
            Row += `<tr><td>` + item + `</td><td>Usage(` + UomCode + `)</td></td>${rows1}</tr >`;
        });
        const tableBody = yAxis.reduce((memo, entry) => {

            const rows = entry.data.reduce((memo, entry) => {
                var entry1 = entry == null ? 'NA' : addCommas(Math.round(entry));
                memo += `<td>${entry1}</td>`
                return memo;
            }, '');

            memo += `<tbody><tr><td>${entry.label}</td><td>Emission</td>${rows}</tr></tbody>`;

            return memo;
        }, '');

        const table = `<table id="tblEmission` + 'Electric1' + `" class="table table-striped table-bordered table-hover dataTable no-footer">
                            <template>` + CustomerName + `_` + 'Electric1' + `_Emission_` + monthName + `</template>
                            ${tableHeader}${tableBody}</table>`;

        tableContainer.innerHTML = table;
        $(`#tblEmission` + 'Electric1' + ' > tbody > tr').eq(0).before(Row);
    },

    BuildingEmissionCombineGraph: function (JsonData, commodityList) {

        GlobalJsonDataCombineEmission = [];
        GlobalJsonDataCombineEmission = JsonData;
        UsageData = JsonData.commUsageValue;
        var indexvalue = 0;
        let startIndexvalue = 0;
        let lastIndexValue = 0;
        if (indexvalue === 0) {
            startIndexvalue = 0;
            lastIndexValue = 10;
        }
        else {
            startIndexvalue = indexvalue * 10;
            lastIndexValue = Number(startIndexvalue) + 10;
        }

        Y1ScalesData = [];
        Y2ScalesData = [];
        TableDataChart_B = [];
        DataChart = [];
        var filteredVariableData = JsonData.uniqeVariable;
        var EmissionData = JsonData.emissionCombineValue;
        //var EmissionDate = JsonData.emissionDate;

        var BuildingCodeArray = [];
        var labels = [];
        var Displaylabels = [];
        var T_Displaylabels = [];
        //$.each(EmissionDate, function (index, item) {
        //    labels.push(Month[item.month - 1] + ' ' + item.year);
        //});
        $(EmissionData).each(function (i, item) {
            BuildingCodeArray.push(item.buildingCode);
        });

        labels = [...new Set(BuildingCodeArray)];

        var ChartData1 = [];
        var ChartData2 = [];
        var DataChart_B = [];

        //var backgroundColor = [];
        $.each(filteredVariableData, function (index, item) {
            //backgroundColor.push(getRandomColor());
            //if (startIndexvalue <= index && lastIndexValue > index) {
            if (IsNotNull(EmissionData)) {
                var data1 = $.grep(EmissionData, function (i) {
                    return item.variableID === i.variableID
                });
                DataChart_B.push

                ChartData1 = [];
                ChartData2 = [];
                DataChart_B = [];
                UsageDataChart_B = [];
                var flag = true;
                $.each(labels, function (index3, item1) {

                    //Table data Start
                    flag = true;
                    $.each(data1, function (index10, item20) {
                        if (item1 == item20.buildingCode) {
                            flag = false;
                            DataChart_B.push(Math.round(item20.emission));
                            UsageDataChart_B.push(Math.round(item20.usage));
                        }
                    });
                    if (flag)
                        if (item.displayAxis == 1) {
                            DataChart_B.push(null);
                            UsageDataChart_B.push(0);
                        }
                        else {
                            DataChart_B.push(null);
                            UsageDataChart_B.push(0);
                        }
                    if (index == 0)
                        T_Displaylabels.push(item1);


                    // table data end
                    if (startIndexvalue <= index3 && lastIndexValue > index3) {
                        flag = true;
                        $.each(data1, function (index1, item2) {
                            if (item1 == item2.buildingCode) {
                                if (item.displayAxis == 1) {
                                    ChartData1.push(Math.round(item2.emission));
                                    flag = false;
                                }
                                else {
                                    ChartData2.push(Math.round(item2.emission));
                                    flag = false;
                                }
                            }
                        });
                        if (flag)
                            if (item.displayAxis == 1) {
                                ChartData1.push(0);
                            }
                            else {
                                ChartData2.push(0);
                            }
                        if (index == 0)
                            Displaylabels.push(item1);

                    }
                });
            }
            else {
                $.each(labels, function (index1, item1) {
                    ChartData1.push(0);
                    ChartData2.push(0);
                    DataChart_B.push(null);
                });
            }

            var dynamicColors = function () {
                var r = Math.floor(Math.random() * 190);
                var g = Math.floor(Math.random() * 190);
                var b = Math.floor(Math.random() * 190);
                return "rgb(" + r + "," + g + "," + b + ")";
            }
            var VariableName = item.variableDescription.split(" ")[1];
            //var CommodityName = $("#ddlCommoditySearch option:selected").text();
            //var Commodityunit = "";
            //if (CommodityName.toLowerCase() == "electric" ) {
            //    Commodityunit = "KWH";
            //}
            TableDataChart_B.push({
                label: VariableName,
                data: DataChart_B,
                UsageData: UsageDataChart_B,
            });

            if (item.displayAxis == 1) {
                DataChart.push({
                    yAxisID: 'A',
                    label: VariableName,
                    borderWidth: 2,
                    data: ChartData1,
                    hidden: item.defaultVariable ? false : true,
                    backgroundColor: color[index],
                    fill: false,
                    lineTension: 0.1,
                    borderColor: color[index],
                    ticks: {
                        precision: 0,
                        //callback: function (costValue) { return (costValue) },
                        beginAtZero: true,
                        fontSize: 16
                    }
                });
                Y1ScalesData.push(VariableName);
            }
            else {
                DataChart.push({
                    yAxisID: 'B',
                    label: VariableName,
                    borderWidth: 2,
                    data: ChartData2,
                    hidden: item.defaultVariable ? false : true,
                    backgroundColor: color[index],
                    fill: false,
                    lineTension: 0.1,
                    borderColor: color[index],
                    ticks: {
                        precision: 0,
                        //callback: function (costValue) { return (costValue) },
                        beginAtZero: true,
                        fontSize: 16
                    }
                });
                Y2ScalesData.push(VariableName);
            }
            //}

        });



        //$("#EmissionChartDiv").html('');
        //$("#EmissionChartDiv").append(`<lable style="font-weight: bold;">` + ComValueBW + ` : Emission Vs Month</lable>
        //                                       <canvas id="chartCanvas`+ ComValueBW + `" style="height:400px" class="table"></canvas>`);

        $("#EmissionChartDiv").append(`<div><lable style="font-weight: bold;">Total : Emission(M.Tons)</lable>
                        <a href="javascript:;" id="downloadBuilding" style="float: right;background-color: #f7f8fa;display:none;" class="btn btn-sm btn-clean btn-icon btn-icon-md" title="Excel Export" onclick="ExportToExcelGrid('#tblEmissionBuilding','excel')"><i class="fa fa-file-excel" style="color:#555"></i> </a>
                        <label class="switch" style="margin-left: .5rem;margin-right: 5px;">
                            <input id="chkBuilding" type="checkbox" onchange="Analytics.ToggleChartToTable('Building','B');" />
                            <div class="slider round" style="background-color:#555;">
                                <span class="on">
                                    <i class="fa fa-chart-line fa-2x" aria-hidden="true"></i>
                                </span>
                                <span class="off">
                                    <i class="fa fa-table fa-2x" aria-hidden="true"></i>
                                </span>
                            </div>
                        </label>
                    </div>
                     <div id="EmissionGraphBuilding">
                         <canvas id="Emissionchart_canvasBuilding" style="height:400px" class="table"></canvas>
                          <div class="row" id="BuildingDivIDBuilding">
                          <div class="col-xs-12 col-md-3 col-lg-3"></div>
                          <div class="col-xs-12 col-md-4 col-lg-4">
                              <div style="margin-left: 0%;margin-top: 0%;">
                                  <input id="btnPerviousBuilding" class="btn btn-info btn-elevate btn-pill btn-sm" type="button" onclick="Analytics.CombinebtnPervious('Building','` + startIndexvalue + `','` + lastIndexValue + `')" value="Previous">
                                  <input id="btnNextBuilding" class="btn btn-info btn-elevate btn-pill btn-sm" type="button" onclick="Analytics.CombinebtnNext('Building','` + lastIndexValue + `','` + (Number(lastIndexValue) + 10) + `')" value="Next">
                                 <input type="hidden" id="hf_barIndexValueBuilding" value="0">
                               </div>
                          </div>
                          </div>
                    </div>
                          <div id="containerBuilding" style="display:none;" class="table-responsive"></div>
                    </br>
                    `);

        //if ((JsonDataCommodity.length - 1) > ComIndexBW) {
        //    $("#EmissionChartDiv" + ComValueBW).after(`<hr/>`);
        //}

        if (startIndexvalue == 0) {
            $("#btnPerviousBuilding").attr("disabled", true);
        }
        else {
            $("#btnPerviousBuilding").attr("disabled", false);
        }

        if (EmissionData.length <= 10) {
            $("#btnNextBuilding").attr("disabled", true);
        }
        else {
            $("#btnNextBuilding").attr("disabled", false);
        }

        var canvas = document.getElementById('Emissionchart_canvasBuilding');
        var CanvasData = new Chart(canvas, {
            type: 'bar',
            data: {
                labels: Displaylabels,
                datasets: DataChart
            },
            options: {
                responsive: true,
                //maintainAspectRatio: false,
                title: {
                    display: true,
                },
                tooltips: {
                    enabled: true,
                    mode: 'single',
                    callbacks: {
                        label: function (tooltipItem, data) {
                            //var label = data.labels[tooltipItem.index];
                            var datasetLabel = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
                            return addCommas(IsNotNull(datasetLabel) ? datasetLabel : 0);
                        }
                    }
                },
                scales: {
                    yAxes: [{
                        id: 'A',
                        type: 'linear',
                        position: 'left',
                        scaleLabel: {
                            display: true,
                            labelString: "Emission (" + Y1ScalesData + ")",
                            fontSize: 12
                            //fontStyle: 'italic'
                        },
                        ticks: { callback: function (costValue) { return addCommas(IsNotNull(costValue) ? costValue : 0.00) } }
                    },
                    {
                        id: 'B',
                        type: 'linear',
                        position: 'right',
                        scaleLabel: {
                            display: true,
                            labelString: Y2ScalesData.length != 0 ? "Emission (" + Y2ScalesData + ")" : "",
                            fontSize: 12
                            //fontStyle: 'italic'
                        },
                        ticks: { callback: function (costValue) { return addCommas(IsNotNull(costValue) ? costValue : 0.00) } }
                    }],
                    xAxes: [{
                        scaleLabel: {
                            display: true,
                            labelString: LableStringName,
                            fontSize: 16
                            //fontStyle: 'italic'
                        },
                    }]
                },
                legend: {
                    onClick: function (event, legendItem) {
                        //get the index of the clicked legend
                        var index = legendItem.datasetIndex;
                        var axis = '';
                        var Y1Count = [], Y2Count = [];
                        $.each(CanvasData.data.datasets, function (index1, item1) {
                            if (item1.yAxisID == 'A') {
                                if (index == index1)
                                    axis = item1.yAxisID;

                                Y1Count.push(item1);
                            }
                            else {
                                Y2Count.push(item1);
                            }

                        });

                        if (axis == 'A') {
                            if (Y1Count.length == 1) {
                                CanvasData.data.datasets[index].hidden =
                                    !CanvasData.data.datasets[index].hidden;
                                //toggle the related labels' visibility
                                CanvasData.options.scales.yAxes[index].display =
                                    !CanvasData.options.scales.yAxes[index].display;
                            }
                            else {
                                var Casshow = CanvasData.data.datasets[index].hidden;
                                if (CanvasData.data.datasets[index].hidden == false || CanvasData.data.datasets[index].hidden == undefined) {
                                    CanvasCountX = Number(CanvasCountX) + 1;
                                }
                                else if (CanvasData.data.datasets[index].hidden == true) {
                                    CanvasCountX = Number(CanvasCountX) - 1;
                                }
                                else { }

                                CanvasData.data.datasets[index].hidden =
                                    !CanvasData.data.datasets[index].hidden;

                                if ((CanvasCountX > 0 && CanvasCountX % 2 === 0) || (CanvasCountX > 0 && Casshow === true)) {
                                    CanvasData.options.scales.yAxes[0].display =
                                        !CanvasData.options.scales.yAxes[0].display;
                                }
                            }
                            CanvasData.update();
                        }

                        else {
                            if (Y2Count.length == 1) {
                                CanvasData.data.datasets[index].hidden =
                                    !CanvasData.data.datasets[index].hidden;
                                //toggle the related labels' visibility
                                CanvasData.options.scales.yAxes[index].display =
                                    !CanvasData.options.scales.yAxes[index].display;
                            }
                            else {
                                var Casshow = CanvasData.data.datasets[index].hidden;
                                if (CanvasData.data.datasets[index].hidden == false || CanvasData.data.datasets[index].hidden == undefined) {
                                    CanvasCount = Number(CanvasCount) + 1;
                                }
                                else if (CanvasData.data.datasets[index].hidden == true) {
                                    CanvasCount = Number(CanvasCount) - 1;
                                }
                                else { }

                                CanvasData.data.datasets[index].hidden =
                                    !CanvasData.data.datasets[index].hidden;

                                if ((CanvasCount > 0 && CanvasCount % 2 === 0) || (CanvasCount > 0 && Casshow === true)) {
                                    CanvasData.options.scales.yAxes[1].display =
                                        !CanvasData.options.scales.yAxes[1].display;
                                }
                            }

                            CanvasData.update();
                        }
                    }
                }

            }
        });
        if (Y2ScalesData.length == 0)
            CanvasData.options.scales.yAxes[1].display = false;

        if (Y1ScalesData.length == 0)
            CanvasData.options.scales.yAxes[0].display = false;

        const tableContainer = document.getElementById('containerBuilding');
        const xAxis = T_Displaylabels;
        const yAxis = TableDataChart_B;
        debugger
        const tableHeader = `<thead><tr>${
            xAxis.reduce((memo, entry) => { memo += `<th>${entry}</th>`; return memo; }, '<th>Emission</th><th/>')
            }</tr></thead>`;

        //const rows1 = yAxis[0].UsageData.reduce((memo, entry) => {
        //    var entry1 = entry == null ? 0 : entry;
        //    memo += `<td>${addCommas(Math.round(entry1))}</td>`
        //    return memo;
        //}, '');

        //var Row = `<tr><td /><td>Usage</td></td>${rows1}</tr >`;
        var Row = '';
        $.each(commodityList, function (index, item) {
            var rows1 = ''; var usageCommData = []; var UomCode = '';

            $.each(UsageData, function (index1, item1) {
                if (item == item1.commodityName) {
                    usageCommData.push(item1.usage);
                    UomCode = item1.uomCode;
                }
            });
            rows1 = usageCommData.reduce((memo, entry) => {
                var entry1 = entry == null ? 'NA' : addCommas(Math.round(entry));
                memo += `<td>${entry1}</td>`
                return memo;
            }, '');
            Row += `<tr><td>` + item + `</td><td>Usage(` + UomCode + `)</td></td>${rows1}</tr >`;
        });

        const tableBody = yAxis.reduce((memo, entry) => {
            const rows = entry.data.reduce((memo, entry) => {
                var entry1 = entry == null ? 'NA' : addCommas(Math.round(entry));
                memo += `<td>${entry1}</td>`
                return memo;
            }, '');
            memo += `<tbody><tr><td>${entry.label}</td><td>Emission</td>${rows}</tr></tbody>`;

            return memo;
        }, '');

        const table = `<table id="tblEmissionBuilding" class="table table-striped table-bordered table-hover dataTable no-footer">
                            <template>` + CustomerName + `_Building_Emission_` + monthName + ` </template>
                            ${tableHeader}${tableBody}</table>`;

        tableContainer.innerHTML = table;
        $('#tblEmissionBuilding > tbody > tr').eq(0).before(Row);

    },

    AccountEmissionCombineGraph: function (JsonData, commodityList) {

        var indexvalue = 0;
        let startIndexvalue = 0;
        let lastIndexValue = 0;
        if (IsNotNull(JsonData) && IsNotNull(JsonData.emissionValue) && IsNotNull(JsonData.emissionVariable)) {
            GlobalJsonDataCombineEmission = [];
            GlobalJsonDataCombineEmission = JsonData;
            var UsageData = JsonData.commUsageValue;
            //$("#DivEmissionChart").show();

            let CommodityList = [];

            $(JsonData.emissionVariable).each(function (i, item) {
                CommodityList.push(item.commodityName);
            });
            JsonDataCommodity = [...new Set(CommodityList)];

            //$.each(JsonDataCommodity, function (ComIndexBW, ComValueBW) {
            let startIndexvalue = 0;
            let lastIndexValue = 0;
            if (indexvalue === 0) {
                startIndexvalue = 0;
                lastIndexValue = 10;
            }
            else {
                startIndexvalue = indexvalue * 10;
                lastIndexValue = Number(startIndexvalue) + 10;
            }

            Y1ScalesData = [];
            Y2ScalesData = [];
            TableDataChart_UA = [];
            DataChart = [];
            var filteredVariableData = JsonData.uniqeVariable;
            var EmissionData = JsonData.emissionCombineValue;
            //var EmissionDate = JsonData.emissionDate;

            var BuildingCodeArray = [];
            var labels = [];
            var Displaylabels = [];
            var Displaylabels_T = [];
            //$.each(EmissionDate, function (index, item) {
            //    labels.push(Month[item.month - 1] + ' ' + item.year);
            //});
            $(EmissionData).each(function (i, item) {
                BuildingCodeArray.push(item.utilityAccountNumber);
            });

            labels = [...new Set(BuildingCodeArray)];

            var ChartData1 = [];
            var ChartData2 = [];
            var DataChart_UA = [];
            var UsageDataChart_UA = [];
            //var backgroundColor = [];
            $.each(filteredVariableData, function (index, item) {
                //backgroundColor.push(getRandomColor());
                //if (startIndexvalue <= index && lastIndexValue > index) {
                if (IsNotNull(EmissionData)) {
                    var data1 = $.grep(EmissionData, function (i) {
                        return item.variableID === i.variableID
                    });


                    ChartData1 = [];
                    ChartData2 = [];
                    DataChart_UA = [];
                    UsageDataChart_UA = [];
                    var flag = true;
                    $.each(labels, function (index3, item1) {

                        //Table data Start
                        flag = true;
                        $.each(data1, function (index1, item20) {
                            if (item1 == item20.utilityAccountNumber) {
                                DataChart_UA.push(Math.round(item20.emission));
                                UsageDataChart_UA.push(Math.round(item20.usage));
                                flag = false;
                            }
                        });
                        if (flag)
                            if (item.displayAxis == 1) {
                                DataChart_UA.push(null);
                                UsageDataChart_UA.push(0);
                            }
                            else {
                                DataChart_UA.push(null);
                                UsageDataChart_UA.push(0);
                            }
                        if (index == 0)
                            Displaylabels_T.push(item1);


                        // Table data End 

                        if (startIndexvalue <= index3 && lastIndexValue > index3) {
                            flag = true;
                            $.each(data1, function (index1, item2) {
                                if (item1 == item2.utilityAccountNumber) {
                                    if (item.displayAxis == 1) {
                                        ChartData1.push(Math.round(item2.emission));
                                        flag = false;
                                    }
                                    else {
                                        ChartData2.push(Math.round(item2.emission));
                                        flag = false;
                                    }
                                }
                            });
                            if (flag)
                                if (item.displayAxis == 1)
                                    ChartData1.push(0);
                                else
                                    ChartData2.push(0);
                            if (index == 0)
                                Displaylabels.push(item1);

                        }
                    });
                }
                else {
                    $.each(labels, function (index1, item1) {
                        ChartData1.push(0);
                        ChartData2.push(0);
                    });
                }

                var dynamicColors = function () {
                    var r = Math.floor(Math.random() * 190);
                    var g = Math.floor(Math.random() * 190);
                    var b = Math.floor(Math.random() * 190);
                    return "rgb(" + r + "," + g + "," + b + ")";
                }
                var VariableName = item.variableDescription.split(" ")[1];
                //var CommodityName = $("#ddlCommoditySearch option:selected").text();
                //var Commodityunit = "";
                //if (CommodityName.toLowerCase() == "electric" ) {
                //    Commodityunit = "KWH";
                //}
                TableDataChart_UA.push({
                    label: VariableName,
                    data: DataChart_UA,
                    UsageData: UsageDataChart_UA,
                });

                if (item.displayAxis == 1) {
                    DataChart.push({
                        yAxisID: 'A',
                        label: VariableName,
                        borderWidth: 2,
                        data: ChartData1,
                        hidden: item.defaultVariable ? false : true,
                        backgroundColor: color[index],
                        fill: false,
                        lineTension: 0.1,
                        borderColor: color[index],
                        ticks: {
                            precision: 0,
                            //callback: function (costValue) { return (costValue) },
                            beginAtZero: true,
                            fontSize: 16
                        }
                    });
                    Y1ScalesData.push(VariableName);
                }
                else {
                    DataChart.push({
                        yAxisID: 'B',
                        label: VariableName,
                        borderWidth: 2,
                        data: ChartData2,
                        hidden: item.defaultVariable ? false : true,
                        backgroundColor: color[index],
                        fill: false,
                        lineTension: 0.1,
                        borderColor: color[index],
                        ticks: {
                            precision: 0,
                            //callback: function (costValue) { return (costValue) },
                            beginAtZero: true,
                            fontSize: 16
                        }
                    });
                    Y2ScalesData.push(VariableName);
                }
                //}

            });



            //$("#EmissionChartDiv").html('');
            //$("#EmissionChartDiv").append(`<lable style="font-weight: bold;">` + ComValue + ` : Emission Vs Month</lable>
            //                                       <canvas id="chartCanvas`+ ComValue + `" style="height:400px" class="table"></canvas>`);
            if (IsNotNull(Displaylabels)) {
                $("#EmissionChartDiv").append(`<div><lable style="font-weight: bold;">Total : Emission(M.Tons)</lable>
                        <a href="javascript:;" id="downloadCombineAN" style="float: right;background-color: #f7f8fa;display:none;" class="btn btn-sm btn-clean btn-icon btn-icon-md" title="Excel Export" onclick="ExportToExcelGrid('#tblEmissionCombineAN','excel')"><i class="fa fa-file-excel" style="color:#555"></i> </a>
                        <label class="switch" style="margin-left: .5rem;margin-right: 5px;">
                            <input id="chkCombineAN" type="checkbox" onchange="Analytics.ToggleChartToTable('CombineAN','B');" />
                            <div class="slider round" style="background-color:#555;">
                                <span class="on">
                                    <i class="fa fa-chart-line fa-2x" aria-hidden="true"></i>
                                </span>
                                <span class="off">
                                    <i class="fa fa-table fa-2x" aria-hidden="true"></i>
                                </span>
                            </div>
                        </label>
                        </div>
                        <div id="EmissionGraphCombineAN">
                        <canvas id="Emissionchart_canvasCombineAN" style="height:400px" class="table"></canvas>
                         <div class="row" id="BuildingDivIDCombineAN">
                         <div class="col-xs-12 col-md-3 col-lg-3"></div>
                         <div class="col-xs-12 col-md-4 col-lg-4">
                             <div style="margin-left: 0%;margin-top: 0%;">
                                 <input id="btnPerviousCombineAN" class="btn btn-info btn-elevate btn-pill btn-sm" type="button" onclick="Analytics.CombinebtnPervious('CombineAN','` + startIndexvalue + `','` + lastIndexValue + `')" value="Previous">
                                 <input id="btnNextCombineAN" class="btn btn-info btn-elevate btn-pill btn-sm" type="button" onclick="Analytics.CombinebtnNext('CombineAN','` + lastIndexValue + `','` + (Number(lastIndexValue) + 10) + `')" value="Next">
                                 <input type="hidden" id="hf_barIndexValueCombineAN" value="0">
                              </div>
                         </div></div></div>
                        <div id="containerCombineAN" style="display:none;" class="table-responsive"></div>
                             </br>
                            `);

                if (startIndexvalue == 0) {
                    $("#btnPerviousCombineAN").attr("disabled", true);
                }
                else {
                    $("#btnPerviousCombineAN").attr("disabled", false);
                }

                if (EmissionData.length <= 10) {
                    $("#btnNextCombineAN").attr("disabled", true);
                }
                else {
                    $("#btnNextCombineAN").attr("disabled", false);
                }

                //if ((JsonDataCommodity.length - 1) > ComIndexBW) {
                //    ///$("#Barchart_canvas" + ComValueBW).after(`<hr/>`);
                //    $("#BuildingDivIDCombineAN").after(`<hr/>`);
                //}

                var canvas = document.getElementById('Emissionchart_canvasCombineAN');
                var CanvasData = new Chart(canvas, {
                    type: 'bar',
                    data: {
                        labels: Displaylabels,
                        datasets: DataChart
                    },
                    options: {
                        responsive: true,
                        //maintainAspectRatio: false,
                        title: {
                            display: true,
                        },
                        tooltips: {
                            enabled: true,
                            mode: 'single',
                            callbacks: {
                                label: function (tooltipItem, data) {
                                    //var label = data.labels[tooltipItem.index];
                                    var datasetLabel = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
                                    return addCommas(IsNotNull(datasetLabel) ? datasetLabel : 0);
                                }
                            }
                        },
                        scales: {
                            yAxes: [{
                                id: 'A',
                                type: 'linear',
                                position: 'left',
                                scaleLabel: {
                                    display: true,
                                    labelString: "Emission (" + Y1ScalesData + ")",
                                    fontSize: 12
                                    //fontStyle: 'italic'
                                },
                                ticks: { callback: function (costValue) { return addCommas(costValue == null ? 0.00 : costValue) } }
                            },
                            {
                                id: 'B',
                                type: 'linear',
                                position: 'right',
                                scaleLabel: {
                                    display: true,
                                    labelString: Y2ScalesData.length != 0 ? "Emission (" + Y2ScalesData + ")" : "",
                                    fontSize: 12
                                    //fontStyle: 'italic'
                                },
                                ticks: { callback: function (costValue) { return addCommas(costValue == null ? 0.00 : costValue) } }
                            }],
                            xAxes: [{
                                scaleLabel: {
                                    display: true,
                                    labelString: LableStringName,
                                    fontSize: 16
                                    //fontStyle: 'italic'
                                },
                            }]
                        },
                        legend: {
                            onClick: function (event, legendItem) {
                                //get the index of the clicked legend
                                var index = legendItem.datasetIndex;
                                var axis = '';
                                var Y1Count = [], Y2Count = [];
                                $.each(CanvasData.data.datasets, function (index1, item1) {
                                    if (item1.yAxisID == 'A') {
                                        if (index == index1)
                                            axis = item1.yAxisID;

                                        Y1Count.push(item1);
                                    }
                                    else {
                                        Y2Count.push(item1);
                                    }

                                });

                                if (axis == 'A') {
                                    if (Y1Count.length == 1) {
                                        CanvasData.data.datasets[index].hidden =
                                            !CanvasData.data.datasets[index].hidden;
                                        //toggle the related labels' visibility
                                        CanvasData.options.scales.yAxes[index].display =
                                            !CanvasData.options.scales.yAxes[index].display;
                                    }
                                    else {
                                        var Casshow = CanvasData.data.datasets[index].hidden;
                                        if (CanvasData.data.datasets[index].hidden == false || CanvasData.data.datasets[index].hidden == undefined) {
                                            CanvasCountX = Number(CanvasCountX) + 1;
                                        }
                                        else if (CanvasData.data.datasets[index].hidden == true) {
                                            CanvasCountX = Number(CanvasCountX) - 1;
                                        }
                                        else { }

                                        CanvasData.data.datasets[index].hidden =
                                            !CanvasData.data.datasets[index].hidden;

                                        if ((CanvasCountX > 0 && CanvasCountX % 2 === 0) || (CanvasCountX > 0 && Casshow === true)) {
                                            CanvasData.options.scales.yAxes[0].display =
                                                !CanvasData.options.scales.yAxes[0].display;
                                        }
                                    }
                                    CanvasData.update();
                                }

                                else {
                                    if (Y2Count.length == 1) {
                                        CanvasData.data.datasets[index].hidden =
                                            !CanvasData.data.datasets[index].hidden;
                                        //toggle the related labels' visibility
                                        CanvasData.options.scales.yAxes[index].display =
                                            !CanvasData.options.scales.yAxes[index].display;
                                    }
                                    else {
                                        var Casshow = CanvasData.data.datasets[index].hidden;
                                        if (CanvasData.data.datasets[index].hidden == false || CanvasData.data.datasets[index].hidden == undefined) {
                                            CanvasCount = Number(CanvasCount) + 1;
                                        }
                                        else if (CanvasData.data.datasets[index].hidden == true) {
                                            CanvasCount = Number(CanvasCount) - 1;
                                        }
                                        else { }

                                        CanvasData.data.datasets[index].hidden =
                                            !CanvasData.data.datasets[index].hidden;

                                        if ((CanvasCount > 0 && CanvasCount % 2 === 0) || (CanvasCount > 0 && Casshow === true)) {
                                            CanvasData.options.scales.yAxes[1].display =
                                                !CanvasData.options.scales.yAxes[1].display;
                                        }
                                    }

                                    CanvasData.update();
                                }
                            }
                        }

                    }
                });
                debugger
                if (Y2ScalesData.length == 0)
                    CanvasData.options.scales.yAxes[1].display = false;

                if (Y1ScalesData.length == 0)
                    CanvasData.options.scales.yAxes[0].display = false;

                const tableContainer = document.getElementById('containerCombineAN');
                const xAxis = Displaylabels_T;
                const yAxis = TableDataChart_UA;

                const tableHeader = `<thead><tr>${
                    xAxis.reduce((memo, entry) => { memo += `<th>${entry}</th>`; return memo; }, '<th>Emission</th><th/>')
                    }</tr></thead>`;

                //const rows1 = yAxis[0].UsageData.reduce((memo, entry) => {
                //    var entry1 = entry == null ? 0 : entry;
                //    memo += `<td>${addCommas(Math.round(entry1))}</td>`
                //    return memo;
                //}, '');

                //var Row = `<tr><td /><td>Usage</td></td>${rows1}</tr >`;
                var Row = '';
                $.each(commodityList, function (index, item) {
                    var rows1 = ''; var usageCommData = []; var UomCode = '';

                    $.each(UsageData, function (index1, item1) {
                        if (item == item1.commodityName) {
                            usageCommData.push(item1.usage);
                            UomCode = item1.uomCode;
                        }
                    });
                    rows1 = usageCommData.reduce((memo, entry) => {
                        var entry1 = entry == null ? 'NA' : addCommas(Math.round(entry));
                        memo += `<td>${entry1}</td>`
                        return memo;
                    }, '');
                    Row += `<tr><td>` + item + `</td><td>Usage(` + UomCode + `)</td></td>${rows1}</tr >`;
                });


                const tableBody = yAxis.reduce((memo, entry) => {
                    const rows = entry.data.reduce((memo, entry) => {
                        var entry1 = entry == null ? 'NA' : addCommas(Math.round(entry));
                        memo += `<td>${entry1}</td>`
                        return memo;
                    }, '');
                    memo += `<tbody><tr><td>${entry.label}</td><td>Emission</td>${rows}</tr></tbody>`;

                    return memo;
                }, '');

                const table = `<table id="tblEmissionCombineAN" class="table table-striped table-bordered table-hover dataTable no-footer">
                            <template>` + CustomerName + `_CombineAN_Emission_` + monthName + ` </template>
                            ${tableHeader}${tableBody}</table>`;

                tableContainer.innerHTML = table;

                $('#tblEmissionCombineAN > tbody > tr').eq(0).before(Row);
            }
            //});
        }

    },

    CombinebtnPervious: function (commodity, startIndexvalue, lastIndexValue) {
        debugger
        //alert("Next click :" + commodity + " startIndexvalue :" + startIndexvalue + " lastIndexValue : " + lastIndexValue);
        if (startIndexvalue == -10)
            startIndexvalue = 0;
        if (lastIndexValue == 0)
            lastIndexValue = 10

        $('#Emissionchart_canvas' + commodity).html('');
        let CommodityList = [];
        var Y1ScalesData = [];
        var Y2ScalesData = [];
        var DataChart = [];

        var filteredVariableData = GlobalJsonDataCombineEmission.uniqeVariable;
        var EmissionData = GlobalJsonDataCombineEmission.emissionCombineValue;
        var hf_barIndexValue = Number($('#hf_barIndexValue' + commodity + '').val());
        hf_barIndexValue = hf_barIndexValue - 1;
        //let checklength = hf_barIndexValue * 10;
        //let No = Number(EmissionData.length) / 10;
        //var Data = (No.toString()).split('.');

        if (startIndexvalue == 0) {
            $("#btnPervious" + commodity).attr("disabled", true);
        }
        else {
            $("#btnPervious" + commodity).attr("disabled", false);
        }

        var BuildingCodeArray = [];
        var labels = [];
        var Displaylabels = [];
        var ChartData1 = [];
        var ChartData2 = [];

        $(EmissionData).each(function (i, item) {
            BuildingCodeArray.push(item[IsViewChart]);
        });

        labels = [...new Set(BuildingCodeArray)];

        if (hf_barIndexValue >= 0) {
            $("#btnNext" + commodity).attr("disabled", false);

            $.each(filteredVariableData, function (index, item) {
                //backgroundColor.push(getRandomColor());
                //if (startIndexvalue <= index && lastIndexValue > index) {
                if (IsNotNull(EmissionData)) {
                    var data1 = $.grep(EmissionData, function (i) {
                        return item.variableID === i.variableID
                    });
                    ChartData1 = [];
                    ChartData2 = [];
                    var flag = true;

                    $.each(labels, function (index3, item1) {
                        flag = true;
                        if (startIndexvalue <= index3 && lastIndexValue > index3) {
                            $.each(data1, function (index1, item2) {
                                if (item1 == item2[IsViewChart]) {
                                    if (item.displayAxis == 1) {
                                        ChartData1.push(item2.emission);
                                        flag = false;
                                    }
                                    else {
                                        ChartData2.push(item2.emission);
                                        flag = false;
                                    }
                                }
                            });
                            if (flag)
                                if (item.displayAxis == 1)
                                    ChartData1.push(0);
                                else
                                    ChartData2.push(0);
                            if (index == 0)
                                Displaylabels.push(item1);

                        }
                    });
                }
                else {
                    $.each(labels, function (index1, item1) {
                        ChartData1.push(0);
                        ChartData2.push(0);
                    });
                }


                var VariableName = item.variableDescription.split(" ")[1];

                if (item.displayAxis == 1) {
                    DataChart.push({
                        yAxisID: 'A',
                        label: VariableName,
                        borderWidth: 2,
                        data: ChartData1,
                        hidden: item.defaultVariable ? false : true,
                        //backgroundColor: color[index],
                        fill: false,
                        lineTension: 0.1,
                        borderColor: color[index],
                        ticks: {
                            precision: 0,
                            //callback: function (costValue) { return (costValue) },
                            beginAtZero: true,
                            fontSize: 16
                        }
                    });
                    Y1ScalesData.push(VariableName);
                }
                else {
                    DataChart.push({
                        yAxisID: 'B',
                        label: VariableName,
                        borderWidth: 2,
                        data: ChartData2,
                        hidden: item.defaultVariable ? false : true,
                        backgroundColor: color[index],
                        fill: false,
                        lineTension: 0.1,
                        borderColor: color[index],
                        ticks: {
                            precision: 0,
                            //callback: function (costValue) { return (costValue) },
                            beginAtZero: true,
                            fontSize: 16
                        }
                    });
                    Y2ScalesData.push(VariableName);
                }

            });

            $('#Emissionchart_canvas' + commodity).remove();
            $("#EmissionGraph" + commodity).prepend('<canvas id="Emissionchart_canvas' + commodity + '" style="height:400px" class="table"></canvas>');
            var canvas = document.getElementById('Emissionchart_canvas' + commodity);
            var CanvasData = new Chart(canvas, {
                type: 'bar',
                data: {
                    labels: Displaylabels,
                    datasets: DataChart
                },
                options: {
                    responsive: true,
                    //maintainAspectRatio: false,
                    title: {
                        display: true,
                    },
                    tooltips: {
                        enabled: true,
                        mode: 'single',
                        callbacks: {
                            label: function (tooltipItem, data) {
                                //var label = data.labels[tooltipItem.index];
                                var datasetLabel = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
                                return addCommas(datasetLabel);
                            }
                        }
                    },
                    scales: {
                        yAxes: [{
                            id: 'A',
                            type: 'linear',
                            position: 'left',
                            scaleLabel: {
                                display: true,
                                labelString: "Emission (" + Y1ScalesData + ")",
                                fontSize: 12
                                //fontStyle: 'italic'
                            }
                        },
                        {
                            id: 'B',
                            type: 'linear',
                            position: 'right',
                            scaleLabel: {
                                display: true,
                                labelString: Y2ScalesData.length != 0 ? "Emission (" + Y2ScalesData + ")" : "",
                                fontSize: 12
                                //fontStyle: 'italic'
                            },
                        }],
                        xAxes: [{
                            scaleLabel: {
                                display: true,
                                labelString: LableStringName,
                                fontSize: 16
                                //fontStyle: 'italic'
                            },
                        }]
                    },
                    legend: {
                        onClick: function (event, legendItem) {
                            //get the index of the clicked legend
                            var index = legendItem.datasetIndex;
                            //toggle chosen dataset's visibility
                            CanvasData.data.datasets[index].hidden =
                                !CanvasData.data.datasets[index].hidden;
                            //toggle the related labels' visibility
                            CanvasData.options.scales.yAxes[index].display =
                                !CanvasData.options.scales.yAxes[index].display;
                            CanvasData.update();
                        }
                    }

                }
            });

            $("#btnNext" + commodity).attr("onclick", "Analytics.CombinebtnNext('" + commodity + "','" + lastIndexValue + "','" + (Number(lastIndexValue) + 10) + "')");
            $("#btnPervious" + commodity).attr("onclick", "Analytics.CombinebtnPervious('" + commodity + "','" + (Number(lastIndexValue) - 20) + "','" + (Number(lastIndexValue) - 10) + "')");
            //$("#btnPervious" + commodity).attr("onclick", "Analytics.btnPerviousBuilding('" + commodity + "','" + (Number(lastIndexValue - 10)) + "','" + (lastIndexValue) + "')");
        }
        else {
            hf_barIndexValue = hf_barIndexValue - 1;
        }
        $('#hf_barIndexValue' + commodity + '').val(hf_barIndexValue);
    },

    CombinebtnNext: function (commodity, startIndexvalue, lastIndexValue) {
        debugger
        //alert("Next click :" + commodity + " startIndexvalue :" + startIndexvalue + " lastIndexValue : " + lastIndexValue);
        $('#Emissionchart_canvas' + commodity).html('');
        let CommodityList = [];
        var Y1ScalesData = [];
        var Y2ScalesData = [];
        var DataChart = [];

        var filteredVariableData = GlobalJsonDataCombineEmission.uniqeVariable;
        var EmissionData = GlobalJsonDataCombineEmission.emissionCombineValue;

        var hf_barIndexValue = Number($('#hf_barIndexValue' + commodity + '').val());
        hf_barIndexValue = hf_barIndexValue + 1;
        let checklength = hf_barIndexValue * 10;
        let No = Number(EmissionData.length) / 10;
        var Data = (No.toString()).split('.');

        if (startIndexvalue == 0) {
            $("#btnPervious" + commodity).attr("disabled", true);
        }
        else {
            $("#btnPervious" + commodity).attr("disabled", false);
        }

        var BuildingCodeArray = [];
        var labels = [];
        var Displaylabels = [];
        var ChartData1 = [];
        var ChartData2 = [];

        $(EmissionData).each(function (i, item) {
            BuildingCodeArray.push(item[IsViewChart]);
        });

        labels = [...new Set(BuildingCodeArray)];
        if (checklength <= (labels.length - 1))
            $("#btnNext" + commodity).attr("disabled", true);

        if (checklength <= labels.length) {
            if (Number(Data[0]) === hf_barIndexValue) {
                $("#btnNext" + commodity).attr("disabled", true);
            }
            else
                $("#btnNext" + commodity).attr("disabled", false);


            $.each(filteredVariableData, function (index, item) {
                //backgroundColor.push(getRandomColor());
                //if (startIndexvalue <= index && lastIndexValue > index) {
                if (IsNotNull(EmissionData)) {
                    var data1 = $.grep(EmissionData, function (i) {
                        return item.variableID === i.variableID
                    });
                    ChartData1 = [];
                    ChartData2 = [];
                    var flag = true;

                    $.each(labels, function (index3, item1) {
                        flag = true;
                        if (startIndexvalue <= index3 && lastIndexValue > index3) {
                            $.each(data1, function (index1, item2) {
                                if (item1 == item2[IsViewChart]) {
                                    if (item.displayAxis == 1) {
                                        ChartData1.push(Math.round(item2.emission));
                                        flag = false;
                                    }
                                    else {
                                        ChartData2.push(Math.round(item2.emission));
                                        flag = false;
                                    }
                                }
                            });
                            if (flag)
                                if (item.displayAxis == 1)
                                    ChartData1.push(0);
                                else
                                    ChartData2.push(0);
                            if (index == 0)
                                Displaylabels.push(item1);

                        }
                    });
                }
                else {
                    $.each(labels, function (index1, item1) {
                        ChartData1.push(0);
                        ChartData2.push(0);
                    });
                }


                var VariableName = item.variableDescription.split(" ")[1];

                if (item.displayAxis == 1) {
                    DataChart.push({
                        yAxisID: 'A',
                        label: VariableName,
                        borderWidth: 2,
                        data: ChartData1,
                        hidden: item.defaultVariable ? false : true,
                        backgroundColor: color[index],
                        fill: false,
                        lineTension: 0.1,
                        borderColor: color[index],
                        ticks: {
                            precision: 0,
                            //callback: function (costValue) { return (costValue) },
                            beginAtZero: true,
                            fontSize: 16
                        }
                    });
                    Y1ScalesData.push(VariableName);
                }
                else {
                    DataChart.push({
                        yAxisID: 'B',
                        label: VariableName,
                        borderWidth: 2,
                        data: ChartData2,
                        hidden: item.defaultVariable ? false : true,
                        //backgroundColor: color[index],
                        fill: false,
                        lineTension: 0.1,
                        borderColor: color[index],
                        ticks: {
                            precision: 0,
                            //callback: function (costValue) { return (costValue) },
                            beginAtZero: true,
                            fontSize: 16
                        }
                    });
                    Y2ScalesData.push(VariableName);
                }

            });

            $('#Emissionchart_canvas' + commodity).remove();
            $("#EmissionGraph" + commodity).prepend('<canvas id="Emissionchart_canvas' + commodity + '" style="height:400px" class="table"></canvas>');
            var canvas = document.getElementById('Emissionchart_canvas' + commodity);
            var CanvasData = new Chart(canvas, {
                type: 'bar',
                data: {
                    labels: Displaylabels,
                    datasets: DataChart
                },
                options: {
                    responsive: true,
                    //maintainAspectRatio: false,
                    title: {
                        display: true,
                    },
                    tooltips: {
                        enabled: true,
                        mode: 'single',
                        callbacks: {
                            label: function (tooltipItem, data) {
                                //var label = data.labels[tooltipItem.index];
                                var datasetLabel = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
                                return addCommas(IsNotNull(datasetLabel) ? datasetLabel : 0);
                            }
                        }
                    },
                    scales: {
                        yAxes: [{
                            id: 'A',
                            type: 'linear',
                            position: 'left',
                            scaleLabel: {
                                display: true,
                                labelString: "Emission (" + Y1ScalesData + ")",
                                fontSize: 12
                                //fontStyle: 'italic'
                            }
                        },
                        {
                            id: 'B',
                            type: 'linear',
                            position: 'right',
                            scaleLabel: {
                                display: true,
                                labelString: Y2ScalesData.length != 0 ? "Emission (" + Y2ScalesData + ")" : "",
                                fontSize: 12
                                //fontStyle: 'italic'
                            },
                        }],
                        xAxes: [{
                            scaleLabel: {
                                display: true,
                                labelString: LableStringName,
                                fontSize: 16
                                //fontStyle: 'italic'
                            },
                        }]
                    },
                    legend: {
                        onClick: function (event, legendItem) {
                            //get the index of the clicked legend
                            var index = legendItem.datasetIndex;
                            //toggle chosen dataset's visibility
                            CanvasData.data.datasets[index].hidden =
                                !CanvasData.data.datasets[index].hidden;
                            //toggle the related labels' visibility
                            CanvasData.options.scales.yAxes[index].display =
                                !CanvasData.options.scales.yAxes[index].display;
                            CanvasData.update();
                        }
                    }

                }
            });

            $("#btnNext" + commodity).attr("onclick", "Analytics.CombinebtnNext('" + commodity + "','" + lastIndexValue + "','" + (Number(lastIndexValue) + 10) + "')");
            $("#btnPervious" + commodity).attr("onclick", "Analytics.CombinebtnPervious('" + commodity + "','" + (Number(lastIndexValue) - 20) + "','" + (Number(lastIndexValue) - 10) + "')");
            //$("#btnPervious" + commodity).attr("onclick", "Analytics.btnPerviousBuilding('" + commodity + "','" + (Number(lastIndexValue - 10)) + "','" + (lastIndexValue) + "')");
        }
        else {
            hf_barIndexValue = hf_barIndexValue - 1;
        }
        $('#hf_barIndexValue' + commodity + '').val(hf_barIndexValue);
    },
}

function dynamicColors() {
    var r = Math.floor(Math.random() * 190);
    var g = Math.floor(Math.random() * 190);
    var b = Math.floor(Math.random() * 190);
    return "rgb(" + r + "," + g + "," + b + ")";
}

