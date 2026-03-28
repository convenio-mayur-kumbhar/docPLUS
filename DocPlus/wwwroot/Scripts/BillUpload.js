/// <reference path="../js/common.js" />

$(document).ready(function () {

    Reload_ddl_Global(null, "#ddlCustomerSearch", "/AjaxCommon/GetCustomerDDL", null, "Select", function () {
        $("#ddlCustomerSearch").select2();
        if ($("#ddlCustomerSearch option").length > 1) {
            //$("#ddlCustomerSearch").val($("#ddlCustomerSearch option:eq(1)").val()).select2();
            $("#ddlCustomerSearch").val(_CustomerID).select2();
            BillUpload.BindCommodityDDL();
        }
    });
    //Reload_ddl_Global(null, "#ddlCommoditySearch", "/AjaxCommon/GetCommodityDDL", null, "Select", function () { $("#ddlCommoditySearch").select2(); });

    $("#divIDShowSubmitButton").hide();

    //$("#btnApproved").attr("disabled", true);
});

var BillUpload = {

    GetDataForImportExport: function () {
        debugger;
        var IsActive_Data = false;
        if ($("#rdbAllData").prop('checked')) {
            IsActive_Data = false;
        }
        else if ($("#rdbActiveData").prop('checked')) {
            IsActive_Data = true;
        }

        var Data = {
            CustomerID: $("#ddlCustomerSearch").val(),
            CommodityID: $("#ddlCommoditySearch").val(),
            IsActiveData: IsActive_Data
        };
        return Data;
    },

    BindCommodityDDL: function () {
        if (IsNotNull($("#ddlCustomerSearch").val())) {
            Reload_ddl_Global(null, "#ddlCommoditySearch", "/AjaxCommon/GetCommodityDDLForDashboard", { CustomerID: $("#ddlCustomerSearch").val() }, "All", function () {
                $("#ddlCommoditySearch").select2();
            });
        }
    },

    ValidateDataForImportExport: function (FormData) {
        var valid = true;
        valid = Validate_DDLControl_NullBlank("#ddlCustomerSearch", FormData.CustomerID, 'Required', valid);
        valid = Validate_DDLControl_NullBlank("#ddlCommoditySearch", FormData.CommodityID, 'Required', valid);
        return valid;
    },

    ClearData: function () {
        ResetFormErrors("#frm_BillUpload");
        //Clear_Form_Fields("#frm_BillUpload");
        $(".has-error p").html("").hide();
        $(".has-error").removeClass("has-error");
    },

    AddUpdate: function () {
        Reset_Form_Errors();
        var FormData = BillUpload.GetDataForImportExport();
        if (BillUpload.ValidateDataForImportExport(FormData)) {
            AddUpdateData("/BillUpload/AddMeterBillValidData", { Model: FormData }, function (data) {
                try {
                    var result = data.data;
                    debugger;
                    if (result["status"] === true) {
                        if (data.status.toLowerCase() === 'success') {
                            showSweetAlert(data.status, data.message, 'success', null);
                            $("#divIDShowSubmitButton").hide();
                            BillUpload.ClearData();
                        }
                    }
                    else {
                        showSweetAlert("Failed", result["message"], 'error', null);
                    }
                } catch (e) {
                    printError('BillUpload.js', 'AddUpdate', e);
                }

            }, function (responce_data) {
                debugger;
                showSweetAlert(responce_data.status, responce_data.data.message, 'error', null);
            });
        }
    },

    ShowConfirmationPopup: function () {        $.confirm({            theme: 'modern',            title: 'Please ensure you have cross checked all data before saving.',            content: null,//'<b>' + 'Once submitted, you will not be able to edit the same. To make any changes, you may use the Cancel and Re-Bill functionality!' + '</b>',            animation: 'zoom',            closeAnimation: 'scale',            backgroundDismiss: false,            //autoClose: 'cancel|5000',            animationSpeed: '400',            icon: 'far fa-question-circle text-danger',            //closeIcon: true,            buttons: {                confirm: {                    text: 'Yes',                    btnClass: 'btn btn-sm btn-primary',                    action: function () {                        // function call                        BillUpload.AddUpdate();                    },                },                cancel: {                    text: 'No',                    btnClass: 'btn btn-sm btn-default',                    action: function () {                        // function call                    }                }            },            onOpen: function () { }        });    },

    ExportBlankMeterBillMasterData: function () {
        $("#divIDShowSubmitButton").hide();
        $("#tblMeterBillExcelUploadData").html("");
        var FormData = BillUpload.GetDataForImportExport();
        if (BillUpload.ValidateDataForImportExport(FormData)) {
            $('.loadercontainer').show();
            GetAjaxData("/BillUpload/ExportBlankMeterBillMasterData", { Model: FormData }, function (data) {
                try {
                    if (IsNotNull(data)) {
                        debugger;
                        if (data.status.toLowerCase() === 'success') {
                            setTimeout(function () {
                                //window.open("/MeterBillReport" + ".xlsm", "_Target");
                                window.open(window.location.origin + "/" + data.message, null);
                                //window.open(data.message, "_Target");
                                //window.open("../" + data.message, "_Target");
                            }, 500);
                            BillUpload.ClearData();
                            $('.loadercontainer').hide();
                        }
                        else {
                            $('.loadercontainer').hide();
                            showSweetAlert("No data found!", null, 'info', null);
                        }
                    }
                    else {
                        $('.loadercontainer').hide();
                        showSweetAlert("No data found!", null, 'info', null);
                    }
                } catch (e) {
                    $('.loadercontainer').hide();
                    showSweetAlert("No data found!", null, 'info', null);
                    printError("BillUpload.js", 'ExportBlankMeterBillMasterData', e);
                }

            }, function () {
                    $('.loadercontainer').hide();
                    showSweetAlert("No data found!", null, 'info', null);
            });
        }
    },

    ImportMeterBillFile: function (evt) {
        $("#divIDShowSubmitButton").hide();
        $("#tblMeterBillExcelUploadData").html("");

        var _Data = BillUpload.GetDataForImportExport();
        if (BillUpload.ValidateDataForImportExport(_Data)) {
            $('.loadercontainer').show();
            var selectedFile = ($("#UploadedFile"))[0].files[0];
            if (selectedFile) {
                /* Checking whether FormData is available in browser*/
                if (window.FormData !== undefined) {
                    var fileUpload = $("#UploadedFile").get(0);
                    var files = fileUpload.files;

                    /* Create FormData object*/
                    var fileData = new FormData();

                    /* Looping over all files and add it to FormData object*/
                    if (files.length > 0) {
                        fileData.append(files[0].name, files[0]);
                    }
                    /* Adding one more key to FormData object*/
                    fileData.append('Model', JSON.stringify(_Data));
                }

                //var formData = new FormData();
                //formData.append("CommodityID", _Data.CommodityID); selectedFile
                //formData.append("Model", JSON.stringify(_Data));
                $.ajax({                    type: "POST", url: "/BillUpload/UploadMeterBillData", data: fileData,                    contentType: false,                    processData: false,                    success: function (data) {                        debugger;                        var result = data;                        $("#UploadedFile").val('');
                        if (data.status.toLowerCase() === 'success') {
                            $("#divIDValidationLegend").show();
                            BillUpload.GetMeterBillExcelUploadedData();
                            showSweetAlert(data.status, data.message, 'success', null);
                            BillUpload.ClearData();
                            $('.loadercontainer').hide();
                        }
                        else {
                            $('.loadercontainer').hide();
                            showSweetAlert("Failed", result["message"], 'error', null);
                        }                    }                });
            }
            else {
                $('.loadercontainer').hide();
                showSweetAlert("Failed", 'No file selected', 'error', null);
            }
        }
    },

    GetMeterBillExcelUploadedData: function () {
        $("#btnSubmitBills").show();
        var FormData = BillUpload.GetDataForImportExport();
        GetAjaxData("/BillUpload/GetMeterBillExcelUploadedData", { CommodityID: FormData.CommodityID, CustomerID: FormData.CustomerID }, function (data) {
            debugger;
            var JsonData = data.data;
            try {
                var KeyArray = [];
                if (IsNotNull(JsonData)) {
                    KeyArray = Object.keys(JsonData[0]);
                    $("#divIDShowSubmitButton").show();
                }
                else {
                    $("#divIDShowSubmitButton").hide();
                }

                $("#tblMeterBillExcelUploadData").html("");

                $('#tblMeterBillExcelUploadData').html(`
                         <template>
                            MeterBillsErrorDetails
                         </template>
                    `);

                var html = "";
                html = "<thead><tr style='text-align:center;'><th style='vertical-align:middle;'>#</th>";
                if (KeyArray.length > 0) {
                    for (i = 0; i < KeyArray.length; i++) {
                        html += "<th style='text-transform: capitalize; vertical-align:middle;'>" + KeyArray[i] + "</th>";
                    }
                    html += "</tr></thead>";
                    $("#tblMeterBillExcelUploadData").append(html);
                }
                $("#tblMeterBillExcelUploadData").append("<tbody id='tbodyMeterBillExcelUploadData'></tbody>");
                var failureRecordCount = 0;
                var ToatlCount = JsonData.length;
                $.each(JsonData, function (index, item) {

                    if (item.remark != null && item.remark != "") {
                        failureRecordCount++;
                        html = "<tr style='text-align:center; background: #e08d8d;'><td style='vertical-align:middle;'>" + Number(1 + index) + "</td>";
                    }
                    else {
                        html = "<tr style='text-align:center;'><td style='vertical-align:middle;'>" + Number(1 + index) + "</td>";
                    }


                    $.each(item, function (itemKey, itemValue) {
                        if (!IsNotNull(itemValue))
                            itemValue = "";

                        if (itemKey.toLowerCase() == "remark" && IsNotNull(itemValue)) {
                            html += "<td title='" + itemValue + "' style='vertical-align:middle;display:inline-block; width:200px; white-space: nowrap; overflow:hidden !important; text-overflow: ellipsis;'>" + itemValue + "</td>";
                        }
                        else {
                            html += "<td style='vertical-align:middle;'>" + itemValue + "</td>";
                        }
                    });
                    html += "</tr>";
                    $("#tbodyMeterBillExcelUploadData").append(html);
                    html = "";
                });
                if (ToatlCount == failureRecordCount) {
                    $("#btnSubmitBills").hide();
                }

                $("#lblTotalCount").text(ToatlCount);
                $("#lblfailureRecordCount").text(failureRecordCount).css("background", "#e08d8d");;
                //console.log(failureRecordCount);
                var tableID = 'tblMeterBillExcelUploadData';

            } catch (e) {
                printError("BillUpload.js", 'GetMeterBillExcelUploadedData', e);
            }

        }, function () { });
    },
}
