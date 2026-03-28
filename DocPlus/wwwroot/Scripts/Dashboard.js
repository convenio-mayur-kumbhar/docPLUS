/// <reference path="../js/Common.js" />

var _globalChartData = [];
var barIndexValue = 0;
$(document).ready(function () {

    //Reload_ddl_Global(null, "#ddlCustomerSearch", "/AjaxCommon/GetCustomerDDL", null, "Select", function () {
    //    $("#ddlCustomerSearch").select2();
    //    if ($("#ddlCustomerSearch option").length > 1) {
    //        //$("#ddlCustomerSearch").val($("#ddlCustomerSearch option:eq(1)").val()).select2();
    //        $("#ddlCustomerSearch").val(_CustomerID).select2();
    //        Dashboard.BindCommodityDDL();
    //    }
    //});
});

var Dashboard = {

    bindUserCustomerBuildingAccountMeterData: function () {

        GetAjaxData("/Dashboard/GetUserAllBuildingAccountMeterData", { EndUserID: UserID, CustomerID: $("#ddlCustomerSearch").val() || 0, CommodityID: $("#ddlCommodity").val() || 0 }, function (data) {
            var JsonData = data.data;
            try {
                if (IsNotNull(JsonData)) {
                    $('#lblBuilding').text(JsonData.totalBuilding);
                    $('#lblAccount').text(JsonData.totalUtilityAccounts);
                    $('#lblMeter').text(JsonData.totalUtilityMeter);
                }
            } catch (e) {
                printError("Dashboard.js", 'bindUserCustomerBuildingAccountMeterData', e);
            }

        }, function () { });
    },

    BindCommodityDDL: function () {
        if (IsNotNull($("#ddlCustomerSearch").val())) {
            Reload_ddl_Global(null, "#ddlCommodity", "/AjaxCommon/GetCommodityDDLForDashboard", { CustomerID: $("#ddlCustomerSearch").val() }, "All", function () {
                $("#ddlCommodity").select2();
                Dashboard.bindUserCustomerBuildingAccountMeterData();
                Dashboard.BindChartData();
            });
        }
    },

    bindBuildingData: function () {
        Reset_Form_Errors();
        var FormData = Dashboard.GetData();
        //if (Dashboard.ValidateData(FormData)) {

            GetAjaxData("/Dashboard/GetUserCustomerMeterUsageAndCostData", FormData, function (data) {
                var JsonData = data.data;
                try {
                    if (IsNotNull(JsonData)) {
                        //$("#barChart,#barChartBtn").show();
                        barIndexValue = 0;
                        $("#barChartBtn").show();

                        $("#btnNext").attr("disabled", false);

                        _globalChartData = JsonData;
                        Dashboard.fillChart(JsonData, 0);
                    }
                    else {
                        Dashboard.fillChart(JsonData, 0);
                        //$("#barChart,#barChartBtn").hide();
                    }
                } catch (e) {
                    printError("Dashboard.js", 'bindBuildingData', e);
                }

            }, function () { });
        //}

    },

    GetData: function () {
        return {
            EndUserID: UserID,
            CustomerID: $("#ddlCustomerSearch").val(),
            CommodityID: $("#ddlCommodity").val(),
            FromDate: CommonTodayDate.mmddyyyy(),
            EndDate: CommonTodayDate.mmddyyyy()
        };
    },

    btnNext: function () {
        barIndexValue = barIndexValue + 1;
        let checklength = barIndexValue * 10;
        let No = Number(_globalChartData.length) / 10;
        var Data = (No.toString()).split('.');

        if (checklength <= _globalChartData.length + 10) {
            if (Number(Data[0]) === barIndexValue)
                $("#btnNext").attr("disabled", true);

            Dashboard.fillChart(_globalChartData, barIndexValue);
        }
        else {
            barIndexValue = barIndexValue - 1;
        }

    },

    btnPervious: function () {
        barIndexValue = barIndexValue - 1;
        if (barIndexValue >= 0) {
            //$("#btnPervious").attr("disabled", true);
            $("#btnNext").attr("disabled", false);
            Dashboard.fillChart(_globalChartData, barIndexValue);
        }
        else {
            barIndexValue = 0;
        }
    },

    fillChart: function (globalChartData, indexvalue) {

        //let filterData = [];
        let startIndexvalue = 0;
        let lastIndexValue = 0;
        let BuildingNameArray = [];
        let costArray = [];
        let usageArray = [];

        if (indexvalue === 0) {
            startIndexvalue = 0;
            lastIndexValue = 15;
        }
        else {
            startIndexvalue = indexvalue * 10;
            lastIndexValue = Number(startIndexvalue) + 15;
        }
        //debugger;
        var UOMCode = null;
        var Currency = null;
        if (IsNotNull(globalChartData)) {
            $.each(globalChartData, function (index, item) {

                if (startIndexvalue <= index && lastIndexValue > index) {

                    $.each(item, function (itemKey, itemValue) {
                        if (itemKey == "buildingName") {
                            BuildingNameArray.push(itemValue);
                        }
                        else if (itemKey == "cost") {
                            costArray.push(itemValue);
                        }
                        else if (itemKey == "usage") {
                            usageArray.push(itemValue);
                        }
                        else if (itemKey == "uomCode") {
                            UOMCode = itemValue;
                        }
                        else if (itemKey == "currency") {
                            Currency = itemValue;
                        }
                    });
                }
            });
        }


        $("#barChart").html('');

        //<canvas id="Barchart_canvas" style="display: block; width: 100%; height: 455px;"></canvas>
        $("#barChart").append(`<div class="col-lg-12">
                                                  <lable style="font-weight: bold;"> Building : Cost V/S Usage</lable>
                                                  <canvas id="Barchart_canvas" style="height:400px" class="table"></canvas> </div>`);

        var canvas = document.getElementById('Barchart_canvas');
        //canvas.height = 300;

        new Chart(canvas, {
            type: 'line',
            data: {
                labels: BuildingNameArray,
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
                responsive: false,
                maintainAspectRatio: false,
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
                    }],
                    xAxes: [{
                        scaleLabel: {
                            display: false,
                            labelString: "Building Code(Meter count)",
                            //fontStyle: 'italic'
                        },
                    }]
                }
            }
        });

        //$("#Barchart_canvas").css('height', '455px');
    },

    //------------ 16 March 2020 Dashboard New changes

    BindChartData: function () {
        Reset_Form_Errors();
        var FormData = Dashboard.GetData();
            Dashboard.bindUserCustomerBuildingAccountMeterData();
            GetAjaxData("/Dashboard/GetUserCustomerMeterDueAndActualCountDashboard", FormData, function (data) {
                var JsonData = data.data;
                try {
                    if (IsNotNull(JsonData)) {
                        $("#barChartBtn").show();
                        _globalChartData = JsonData;
                        Dashboard.fillChartMeterDueAndActualCount(_globalChartData, 0);
                    }
                    else {
                        Dashboard.fillChartMeterDueAndActualCount(_globalChartData, 0);
                    }
                } catch (e) {
                    printError("Dashboard.js", 'BindChartData', e);
                }

            }, function () { });

            GetAjaxData("/Dashboard/GetDueMeterReadChart", FormData, function (data) {
                var JsonData = data.data;
                Dashboard.dueFillChart(JsonData, 0);
                //}
            }, function () { });

        //}
    },

    fillChartMeterDueAndActualCount: function (globalChartData, indexvalue) {
        let BuildingNameArray = [];
        let costArray = [];
        let actualMeterCountArray = [];

        if (IsNotNull(globalChartData)) {
            $.each(globalChartData, function (index, item) {
                $.each(item, function (itemKey, itemValue) {

                    if (itemKey == "date") {
                        BuildingNameArray.push(itemValue);
                    }
                    else if (itemKey == "dueMeterCount") {
                        costArray.push(itemValue);
                    }
                    else if (itemKey == "readMeterCount") {
                        actualMeterCountArray.push(itemValue);
                    }
                });
            });
        }

        $("#barChart").html('');
        $("#barChart").append(`<canvas id="Barchart_canvas" style="height:400px" class="table"></canvas>`);
        var canvas = document.getElementById('Barchart_canvas');
        //canvas.height = 300;
        new Chart(canvas, {
            type: 'line',
            data: {
                labels: BuildingNameArray,
                datasets: [{
                    yAxisID: 'Read',
                    label: "Due",
                    backgroundColor: "rgba(0, 168, 83,0.2)",
                    borderColor: "rgba(0, 168, 83,1)",
                    borderWidth: 2,
                    hoverBackgroundColor: "rgba(0, 168, 83,0.4)",
                    hoverBorderColor: "rgba(0, 168, 83,1)",
                    data: costArray,
                    lineTension: 0
                },
                {
                    yAxisID: 'Read',
                    label: "Actual",
                    backgroundColor: "rgba(29, 55, 128,0.2)",
                    borderColor: "rgba(29, 55, 128,1)",
                    borderWidth: 2,
                    hoverBackgroundColor: "rgba(29, 55, 128,0.4)",
                    hoverBorderColor: "rgba(29, 55, 128,1)",
                    data: actualMeterCountArray,
                    lineTension: 0
                }]
            },
            options: {
                title: {
                    display: true,
                },
                scales: {
                    yAxes: [{
                        id: 'Read',
                        type: 'linear',
                        position: 'left',
                        scaleLabel: {
                            display: true,
                            labelString: "Meter Read",
                            fontSize: 16
                            //fontStyle: 'italic'
                        },
                        ticks: {
                            precision: 0,
                            callback: function (costValue) { return (costValue) },
                            beginAtZero: true,
                            fontSize: 16
                        }
                    }],
                    xAxes: [{
                        scaleLabel: {
                            display: true,
                            labelString: "Read Date",
                            fontSize: 16
                            //fontStyle: 'italic'
                        },
                    }]
                }
            }
        });

        
        $("#Barchart_canvas").css('height', '400px');
    },

    dueFillChart: function (globalChartData, indexvalue) {
        //debugger;
        let BuildingNameArray = [];
        let costArray = [];

        if (IsNotNull(globalChartData)) {
            $.each(globalChartData, function (index, item) {
                $.each(item, function (itemKey, itemValue) {

                    if (itemKey == "date") {
                        BuildingNameArray.push(itemValue);
                    }
                    else if (itemKey == "dueMeterCount") {
                        costArray.push(itemValue);
                    }
                });
            });
        }

        $("#DueChart").html('');
        $("#DueChart").append(`<canvas id="DueChart_canvas" style="height:400px" class="table"></canvas>`);
        var canvas = document.getElementById('DueChart_canvas');
        //canvas.height = 300;
        Dashboard.config = {
            type: 'line',
            data: {
                labels: BuildingNameArray,
                datasets: [{
                    yAxisID: 'Read',
                    label: "Due",
                    backgroundColor: "rgba(0, 168, 83,0.2)",
                    borderColor: "rgba(0, 168, 83,1)",
                    borderWidth: 2,
                    hoverBackgroundColor: "rgba(0, 168, 83,0.4)",
                    hoverBorderColor: "rgba(0, 168, 83,1)",
                    data: costArray,
                    lineTension: 0
                }]
            },
            options: {
                title: {
                    display: true,
                },
                scales: {
                    yAxes: [{
                        id: 'Read',
                        type: 'linear',
                        position: 'left',
                        scaleLabel: {
                            display: true,
                            labelString: "Meter Read",
                            fontSize: 16
                            //fontStyle: 'italic'
                        },
                        ticks: {
                            precision: 0,
                            callback: function (costValue) { return (costValue) },
                            beginAtZero: true,
                            fontSize: 16
                        }
                    }],
                    xAxes: [{
                        scaleLabel: {
                            display: true,
                            labelString: "Read Date",
                            fontSize: 16
                            //fontStyle: 'italic'
                        },
                    }]
                }
            }
        };

        var canvas = document.getElementById("DueChart_canvas");
        var ctx = canvas.getContext("2d");
        Dashboard.myDueChart = new Chart(ctx, Dashboard.config);
        

        $("#DueChart_canvas").css('height', '400px');
        $("#DueChart_canvas").removeAttr("style");
    },

    DueMeterReadData: function (Date) {
        LoadGrid(null, "tblMeterDueForRead", "/Dashboard/GetDataTable", { ReadDate: Date }, function (data) {
            if (IsNotNull(data)) {
                $("#lblReadMeterDueTitle").text("Meter due (" + Date + ")");
                $("#DueMeterReadView").modal();
            }
        });
    },

    DashboardCommodity: function () {
        var DashboardCommodity = $("#ddlCommodity").val();
        if (IsNotNull(DashboardCommodity)) {
            $("#ddlCommoditySearch").val($("#ddlCommodity").val()).select2();
        }
        else
            if (!IsNotNull($("#ddlCommoditySearch").val())) {
                $("#ddlCommoditySearch").val($("#ddlCommoditySearch option:eq(0)").val()).select2();
            }

        Dashboard.BindChartData();
    },

    ScreenAccessPermission: function () {
        var returnModal = {};
        var getAccess = GetScreenAccessPermissions(CurrentScreenID);
        var flagEmissionChart = false;

        return returnModal;
    },
};

