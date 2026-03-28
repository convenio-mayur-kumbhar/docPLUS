/// <reference path="../js/Common.js" />


var xhr_getData_For_Edit;
var xhr_getData_For_Delete;
var xhr_GetData;
var flagBuildingContact = false;
var flagAccUtilityAcct = false;
var isRedirect = false;
var flagAddUtilityAcc = false;
var flagAddUtilityMtr = false;

$(document).ready(function () {
    isRedirect = false;
    //Building.BindGrid();
    //$('#tblBuilding').on('draw.dt', function () {
    //    Building.ScreenAccessPermission();
    //    $(".AddCommodityColumn").hide().html("");
    //});

    Reload_ddl_Global(null, "#ddlCustomerSearch", "/AjaxCommon/GetCustomerDDL", null, "Select", function () {
        $("#ddlCustomerSearch").select2();
        if ($("#ddlCustomerSearch option").length > 1) {
            //$("#ddlCustomerSearch").val($("#ddlCustomerSearch option:eq(1)").val()).select2();
            $("#ddlCustomerSearch").val(_CustomerID).select2();
            Building.QueryStringBindBuilding();
            if (!isRedirect) {
                Building.SetForSearch();
            }
        }
    });
    Reload_ddl_Global(null, "#ddlStateSearch", "/AjaxCommon/GetStateDDL", null, "All", function () { $("#ddlStateSearch").select2(); });

    Reload_ddl_Global(null, "#ddlState", "/AjaxCommon/GetStateDDL", null, "Select", function () { $("#ddlState").select2(); });
    Reload_ddl_Global(null, "#ddlCustomer", "/AjaxCommon/GetCustomerDDL", null, "Select", function () {
        $("#ddlCustomer").select2();
        if ($("#ddlCustomer option").length > 1) {
            //$("#ddlCustomer").val($("#ddlCustomer option:eq(1)").val()).select2();
            $("#ddlCustomer").val(_CustomerID).select2();
        }
    });
    Reload_ddl_Global(null, "#ddlOwner", "/AjaxCommon/GetOwnerDDL", null, "Select", function () { $("#ddlOwner").select2(); });


    $('#tblBuilding').on('draw.dt', function () {
        Building.ScreenAccessPermission();
    });
    
    /*
    var queryStringData = getQueryStringParams();
    if (queryStringData != null) {
        var customerCode = queryStringData["customerCode"];
        //var customerName = queryStringData["customerName"];
        if (typeof (customerCode) != "undefined")// && typeof (customerName) != "undefined") {
        {  var customerandbuilding = 'Customer Code : ' + customerCode;//+ ' / Customer Code : ' + customerCode;
            $('#lblCustomerBuildingCode').html(customerandbuilding);
            $("#ddlCustomerSearch").val(customerCode).trigger("change");
        }
    }
    */

    $('#ddlState').change(function () {
        Building.onchangeState();
    });
});

var Building = {

    QueryStringBindBuilding: function () {
        var queryStringData = getQueryStringParams();
        if (queryStringData != null) {
            var CustomerID = queryStringData["CustomerID"];
            if (IsNotNull(CustomerID)) {
                isRedirect = true;
                $("#ddlCustomerSearch").val(CustomerID).trigger("change");
                Building.SetForSearch();
            }
        }
    },

    ResetDropDowns: function () {
        Reload_ddl_Global(null, "#ddlCustomerSearch", "/AjaxCommon/GetCustomerDDL", null, "Select",
            function () {
                Reload_ddl_Global(null, "#ddlStateSearch", "/AjaxCommon/GetStateDDL", null, "All", function () { $("#ddlStateSearch").select2(); });
                $("#ddlCustomerSearch").select2();
            });

        //$("#ddlStateSearch").html("<option value=''>Select</option>");
        $("#ddlStateSearch").val('').select2();

        $("#txtCitySearch").val('');
        $("#txtZipcodeSearch").val('');

        $("#divIDViewBuilding").hide();

        $("#columnSelector input[type='checkbox']").prop("checked", true);
    },

    SetForSearch: function () {
        //$("#ddlStateSearch").val('').trigger("change");
        //$("#txtCitySearch").val('');
        //$("#txtZipcodeSearch").val('');

        var sp = $("span[role=combobox]")
        $('#ddlCustomerSearch').parent().find(sp).css("border-color", "#E2E5EC");
        var FormData = Building.GetDataForSearch();
        if (Building.ValidateDataSearch(FormData)) {
            $('.loadercontainer').show();
            //call bind function
            LoadGrid(null, "tblBuilding", "/Building/GetData",
                {
                    CustomerID: $("#ddlCustomerSearch").val(),
                    StateID: $("#ddlStateSearch").val(),
                    City: $("#txtCitySearch").val(),
                    ZipCode: $("#txtZipcodeSearch").val()
                }, function (data) {
                    //Building.searchIntoDataTable();
                    $("#divIDViewBuilding").show();
                    $('.loadercontainer').hide();
                    Building.ScreenAccessPermission();
                    //$("#divIDViewBills").show();
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
            StateID: $("#ddlStateSearch").val(),
            City: $("#txtCitySearch").val(),
            ZipCode: $("#txtZipcodeSearch").val()
        };
        return Data;
    },

    BindGrid: function ()   {
        LoadGrid(null, "tblBuilding", "/Building/GetData",
            {
                CustomerID: $("#ddlCustomerSearch").val(),
                StateID: $("#ddlStateSearch").val(),
                City: $("#txtCitySearch").val(),
                ZipCode: $("#txtZipcodeSearch").val()
            }, function () {
                $("#divIDViewBuilding").show();
                //Building.searchIntoDataTable();
                Building.ScreenAccessPermission();
                $('.chkbox').trigger('change');
            });
    },

    searchIntoDataTable: function () {
        oTable = $("#tblBuilding").DataTable();
        $('#ddlStateSearch').change(function () {
            oTable.columns(5).search($(this).children("option:selected").text() == 'All' ? '' : $(this).children("option:selected").text()).draw();
        });

        $('#txtCitySearch').keyup(function () {
            oTable.columns(4).search($(this).val()).draw();
        });

        $('#txtZipcodeSearch').keyup(function () {
            oTable.columns(6).search($(this).val()).draw();
        });
    },
    /*
    ShowNewCustomerForMap: function () {
        $('#divIDDDLCustomerForEdit').show();
        Reload_ddl_Global(null, "#ddlCustomerForEdit", "/AjaxCommon/GetCustomerDDL", null, "Select", function (data) {
            var CustomerName = $("#ddlCustomer option:selected").text();
            $("#ddlCustomerForEdit option").filter(function () {
                return $(this).text() == CustomerName;
            }).remove().select2();
        });
    },
    */

    SetForAdd: function () {
        Reset_Form_Errors();
        Clear_Form_Fields("#frm_AddBuilding");
        $("#txtBuildingCode").attr('disabled', false);
        $('#ddlCustomer').attr("disabled", true);
        Reload_ddl_Global(null, "#ddlCustomer", "/AjaxCommon/GetCustomerDDL", null, "Select", function () {
            $("#ddlCustomer").select2();
            if ($("#ddlCustomer option").length > 1) {
                //$("#ddlCustomer").val($("#ddlCustomer option:eq(1)").val()).select2();
                $("#ddlCustomer").val(_CustomerID).select2();
            }
        });
        $("#BuildingModalTitle").text("Add Building");
        $("#AddBuildingModal").modal();
    },

    GetDataByID: function (buildingID) {
        GetAjaxData("/Building/GetData", { CustomerID: $("#ddlCustomerSearch").val(), BuildingID: buildingID }, function (data) {
            var JsonData = data.data;
            Reset_Form_Errors();
            Clear_Form_Fields("#frm_AddBuilding");
            Building.ClearData();
            try {
                if (IsNotNull(JsonData)) {
                    $("#hf_buildingID").val(JsonData.buildingID);

                    $("#txtBuildingCode").val(JsonData.buildingCode).attr('disabled');
                    $("#txtBuildingCode").attr('disabled', 'disabled');

                    $("#txtBuildingName").val(JsonData.buildingName);
                    $("#txtFacilityUse").val(JsonData.facilityUse);
                    $("#txtTotalSQFT").val(JsonData.totalSqFt);
                    $("#txtAddressLine1").val(JsonData.addressLine1);
                    $("#txtAddressLine2").val(JsonData.addressLine2);
                    $("#ddlState").val(JsonData.stateID).trigger("change");
                    $("#txtCity").val(JsonData.city);
                    //$("#txtZipCode").val(JsonData.zipCode);
                    //$('#txtZipCode').attr('data-id', JsonData.zipCode);
                    setTimeout(function () {
                        $("#ddlZipCode").val(JsonData.zipID).select2();
                    }, 1000);
                    $("#ddlCustomer").val(JsonData.customerID).trigger("change");
                    $("#ddlCustomer").attr('disabled', 'disabled');

                    $("#ddlOwner").val(JsonData.ownerID).select2();
                    $("#txtOwnerEffectiveFrom").val(JsonData.ownerEffectiveFromCustom);
                    if (IsNotNull(JsonData.ownerEffectiveFromCustom))
                        $("#txtOwnerEffectiveFrom").datepicker('setStartDate', new Date(JsonData.ownerEffectiveFromCustom).addDays(-365));

                    $("#tblOwnerHistory tbody").html('');

                    $("#divOwner").hide(200);
                    if (IsNotNull(JsonData.buildingOwnerData)) {
                        if (JsonData.buildingOwnerData.length > 0) {
                            $("#Grid_Data_Template_tblOwnerHistory").tmpl(JsonData.buildingOwnerData).appendTo("#tblOwnerHistory tbody");
                        }
                    }
                }
            } catch (e) {
                printError("Building.js", 'GetDataByID', e);
            }

        }, function () { });
    },

    SetForUpdate: function (buildingID, buildingDescription) {
        $("#BuildingModalTitle").text("Edit Building(" + buildingDescription + ")");
        Building.GetDataByID(buildingID);
        //$('#divIDAddButtonForEdit').show();
        //$('#divIDDDLCustomerForEdit').hide();
        $("#AddBuildingModal").modal();
    },

    SetForClose: function () {
        $("#AddBuildingModal").modal('hide');
        Building.ClearData();
        Clear_Form_Fields("#frm_AddBuilding");
        $("#hf_buildingID").val('');
    },

    AddUpdate: function () {
        Reset_Form_Errors();
        var FormData = Building.GetData();
        if (Building.ValidateData(FormData)) {
            AddUpdateData("/Building/AddUpdateBuildingData", { Model: FormData }, function (data) {
                try {

                    var result = data.data;
                    if (result["status"] === true) {
                        if (data.status.toLowerCase() === 'success') {
                            showSweetAlert(data.status, data.message, 'success', null);
                            Building.BindGrid();
                            Building.ClearData();
                            Building.SetForClose();
                        }
                    }
                    else {
                        showSweetAlert("Failed", result["message"], 'error', null);
                    }

                } catch (e) {
                    printError('Building.js', 'AddUpdate', e);
                }

            }, function (responce_data) {
                showSweetAlert(responce_data.status, responce_data.message, 'error', null);
            });
        }
    },

    Delete: function (_id, ItemInfo) {
        DeleteData(xhr_getData_For_Delete, "/Building/Delete", { BuildingID: _id, CurrentScreenID: CurrentScreenID }, ItemInfo, function () { Building.BindGrid(); Building.ClearData(); Building.SetForClose(); });
    },

    ResetData: function () {
        var ID = $("#hf_buildingID").val();
        $(".has-error p").html("");
        $(".has-error").removeClass("has-error");

        if (ID == "" || ID == null || ID == 0 || ID == undefined)
            Building.ClearData();
        else
            Building.GetDataByID(ID);
    },

    ValidateData: function (FormData) {
        var valid = true;
        /*validation for not null/Required*/

        valid = Validate_Control_NullBlank("#txtBuildingCode", FormData.BuildingCode, 'Required', valid);
        valid = Validate_Control_NullBlank("#txtBuildingName", FormData.BuildingName, 'Required', valid);
        valid = Validate_Control_NullBlank("#txtTotalSQFT", FormData.TotalSqFt, 'Required', valid);
        valid = Validate_Control_NullBlank("#txtAddressLine1", FormData.AddressLine1, 'Required', valid);
        valid = Validate_DDLControl_NullBlank("#ddlState", FormData.StateID, 'Required', valid);
        valid = Validate_DDLControl_NullBlank("#ddlCustomer", FormData.CustomerID, 'Required', valid);
        valid = Validate_DDLControl_NullBlank("#ddlOwner", FormData.OwnerID, 'Required', valid);
        valid = Validate_Control_NullBlank("#txtCity", FormData.City, 'Required', valid);
        valid = Validate_DDLControl_NullBlank("#ddlZipCode", FormData.ZipID, 'Required', valid);
        FocusOnError("#frm_AddBuilding", valid);
        return valid;
    },

    GetData: function () {
        return {
            BuildingID: $("#hf_buildingID").val(),
            BuildingCode: IsNotNull($("#txtBuildingCode").val()) ? $("#txtBuildingCode").val().trim() : null,
            BuildingName: IsNotNull($("#txtBuildingName").val()) ? $("#txtBuildingName").val().trim() : null,
            TotalSqFt: IsNotNull($("#txtTotalSQFT").val()) ? $("#txtTotalSQFT").val().trim() : null,
            FacilityUse: IsNotNull($("#txtFacilityUse").val()) ? $("#txtFacilityUse").val().trim() : null,
            AddressLine1: IsNotNull($("#txtAddressLine1").val()) ? $("#txtAddressLine1").val().trim() : null,
            AddressLine2: IsNotNull($("#txtAddressLine2").val()) ? $("#txtAddressLine2").val().trim() : null,
            StateID: $("#ddlState").val(),
            City: IsNotNull($("#txtCity").val()) ? $("#txtCity").val().trim() : null,
            //ZipCode: IsNotNull($("#txtZipCode").val()) ? $("#txtZipCode").val().trim() : null,
            ZipID: IsNotNull($("#ddlZipCode").val()) ? $("#ddlZipCode").val().trim() : null,
            CustomerID: $("#ddlCustomer").val(),
            OwnerID: $("#ddlOwner").val(),
            OwnerEffectiveFrom: IsNotNull($("#txtOwnerEffectiveFrom").val()) ? new Date($("#txtOwnerEffectiveFrom").val()).ddMMMyyyy() : null,

            //NewCustomerID: $("#ddlCustomerForEdit").val(),

        };
    },

    ClearData: function () {
        ResetFormErrors("#frm_AddBuilding");
        Clear_Form_Fields("#frm_AddBuilding");
        $(".has-error p").html("").hide();
        $(".has-error").removeClass("has-error");
        $("#ddlState").val('').trigger("change");
        //$("#ddlCustomer").val('').trigger("change");
        $("#ddlZipCode").attr("data-id", "");
        $("#ddlOwner").val('').trigger("change");

        //$("#ddlCustomerForEdit").val('').trigger("change");
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
                if ((getAccess[i].ActionCode == "BuildingContact")) {
                    flagBuildingContact = true;
                }
                if ((getAccess[i].ActionCode == "AccUtilityAcct")) {
                    flagAccUtilityAcct = true;
                }

                if ((getAccess[i].ActionCode == "AddUtilityAcc")) {
                    flagAddUtilityAcc = true;
                }

                if ((getAccess[i].ActionCode == "AddUtilityMtr")) {
                    flagAddUtilityMtr = true;
                }
            }
        }

        if (!flagBuildingContact) {
            $("#tblBuilding .MapBuildingContact").hide().html("");
        }

        if (!flagAccUtilityAcct) {
            $("#tblBuilding .AdditionalAccessUtilityAccount").hide().html("");
        }

        if (!flagAddUtilityAcc) {
            $("#tblBuilding .AddUtilityAccount").hide().html("");
        }

        if (!flagAddUtilityMtr) {
            $("#tblBuilding .AddUtilityMeter").hide().html("");
        }
        
        return returnModal;
    },
    /*  screen access code end  */

    GoToUtilityAccount: function (customerID, buildingID) {
        if (IsNotNull(customerID) && IsNotNull(buildingID)) {
            var encryptedScreenID = $("#hf_UtilityAccount").val();
            window.location.href = "/UtilityAccount/Index/" + encryptedScreenID + "?CustomerID=" + customerID + "&BuildingID=" + buildingID;
        }
    },

    ShowResetPopup: function (customerCode) {
        //if ($('#chk' + customerCode).prop('checked')) {

        let confirmationMessage = "";
        if (($('#chk' + customerCode).prop('checked')))
            confirmationMessage = 'activate';
        else
            confirmationMessage = 'deactivate';


        $.confirm({
            theme: 'modern',
            title: 'Are you sure you want to ' + confirmationMessage + ' this building ?',
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
                        $('#chkResetMeter').prop('checked', false);
                        $('#hf_chkResetMeter').val(false);
                    }
                },
                confirm: {
                    text: 'Yes',
                    btnClass: 'btn btn-sm btn-warning',
                    action: function () {
                        $('#hf_chkResetMeter').val(true);
                        $("#ddlReadType").val(2);
                    },
                }
            },
            onOpen: function () {
                $("#ddlReadType").val(1);
                $('#hf_chkResetMeter').val('');
            },
            onClose: function () {
                if (!eval($('#hf_chkResetMeter').val())) {
                    $('#chkResetMeter').prop('checked', false);
                    $("#ddlReadType").val(1);
                }
            },
        });
        //}
        //else {
        //    $("#ddlReadType").val(1);
        //}
    },

    BindOwnerDate: function () {
        $("#txtOwnerEffectiveFrom").val(CommonTodayDate.mmddyyyy());
        $("#txtOwnerEffectiveFrom").datepicker("update", CommonTodayDate);
    },

    ToggleOwnerHistory: function () {
        if ($('#tblOwnerHistory tbody tr').length > 0) {
            $("#divOwner").toggle(200);
        }
        else showSweetAlert('Warning!', 'No History Found', 'info', null);

    },

    ChangeOnZipCode: function () {
        BindAutoCompleteCurrentData("#txtZipCode", "/Building/GetZipcodeSearch", 1, "zipCode", "zipID",
            function (DataJson) { return { ZipCode: $("#txtZipCode").val(), StateID: $("#ddlState").val() } },
            function (e, i) {
                $(e.target).attr("data-id", i.item.val);
            },
            function (event, ui) { });
    },

    onchangeState: function () {

        //$("#txtZipCode").attr("data-id", "");
        //$("#txtZipCode").val("");

        if (IsNotNull($("#ddlState").val())) {
            Reload_ddl_Global(null, "#ddlZipCode", "/AjaxCommon/GetZipCodeDDL", { StateID: $("#ddlState").val() }, "Select", function (data) {
                $("#ddlZipCode").select2();
            });

        }
        else {
            $('#ddlZipCode').empty().append('<option value="">Select</option>').select2();
        }
    },

    getVisibleColumns: function () {
        var visibleCols = [];

        $('.chkbox').each(function () {
            if ($(this).prop('checked')) {
                visibleCols.push(parseInt($(this).data('col')));
            }
        });

        return visibleCols;
    },
    ExportToExcelGrid1: function (tableName, type) {
        var tableId = tableName.replace('#', '');
        var dt = $('#' + tableId).DataTable();
        var cols = Building.getVisibleColumns();

        var excel = '<table><thead><tr>';

        dt.columns().every(function (i) {

            if (cols.indexOf(i) !== -1) {
                excel += '<th>' + $(this.header()).text() + '</th>';
            }
        });
        excel += '</tr></thead><tbody>';

        dt.rows({ search: 'applied' }).every(function () {

            var row = this.data();
            excel += '<tr>';

            for (var i = 0; i < row.length; i++) {

                if (cols.indexOf(i) !== -1) {
                    excel += '<td>' + row[i] + '</td>';
                }
            }
            excel += '</tr>';
        });

        excel += '</tbody></table>';

        Building.downloadXls(excel, "BuildingReport.xls");
    },
    downloadXls: function (tableHtml, fileName) {
        var template =
            '<html xmlns:o="urn:schemas-microsoft-com:office:office" ' +
            'xmlns:x="urn:schemas-microsoft-com:office:excel">' +
            '<head><!--[if gte mso 9]>' +
            '<xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet>' +
            '<x:Name>Report</x:Name>' +
            '<x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>' +
            '</x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml>' +
            '<![endif]--></head><body>' +
            tableHtml +
            '</body></html>';

        var uri = 'data:application/vnd.ms-excel;base64,';
        var base64 = window.btoa(unescape(encodeURIComponent(template)));

        var link = document.createElement('a');
        link.href = uri + base64;
        link.download = fileName;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    },

}

var BuildingCommodity = {


    SetForAdd: function (customerName, customerCode, buildingName, buildingCode) {
        Clear_Form_Fields("#AddBuildingCommodity");
        $("#BuildingCommodityModalTitle").text("Commodity Mapping (Customer Name : " + customerName + " (" + customerCode + ")" + " , Building Name : " + buildingName + " (" + buildingCode + ")" + ")");
        $("#AddBuildingCommodity").modal();

        var ddlCommodity = [
            { "value": "01", "text": "Gas" },
            { "value": "02", "text": "Electric" },
            { "value": "02", "text": "Water" }
        ];
        Reload_ddl_Global_staticData(null, "#ddlCommodity", "/AjaxCommon/GetStateDDL", null, "All", ddlCommodity, function () { $("#ddlCommodity").select2(); });
    },

    ValidateDataInsertion: function (Data) {
        var valid = true;
        valid = Validate_DDLControl_NullBlank("#ddlCommodity", Data.socketId, 'Required', valid);
        //valid = Validate_DDLControl_NullBlank("#ddlBillingMethod", Data.billingMethodId, 'Required', valid);
        //valid = Validate_DDLControl_NullBlank("#ddlMeterType", Data.meterType, 'Required', valid);
        //valid = Validate_Control_NullBlank("#txtTENID", Data.tenid, 'Required', valid);
        //valid = Validate_Control_NullBlank("#txtSequence", Data.sequence, 'Required', valid);
        return valid;
    },

    showAlreadyExistsMessage: function (socketID) {
        var valid = true;
        $("#tblBuildingCommodity tbody tr td.Socket").each(function () {
            if ($(this).attr('data-socketId') == socketID) {
                valid = false;
            }
        });

        if (!valid)
            showSweetAlert("Warning!", "Socket Already Added", "warning");

        return valid;
    },

    AddIntoGrid: function () {
        var Data = BuildingCommodity.GetBuildingCommodityData();

        if (BuildingCommodity.showAlreadyExistsMessage(Data.socketId)) {
            if (BuildingCommodity.ValidateDataInsertion(Data)) {
                $("#tblBuildingCommodity").show();
                $("#Grid_Data_Template_tblBuildingCommodity").tmpl(Data).appendTo("#tblBuildingCommodity tbody");
                BuildingCommodity.ClearBuildingCommodityData();
            }
        }
    },

    GetBuildingCommodityData: function () {
        return Data = {
            socketId: $("#ddlCommodity").val(),
            socket: $("#select2-ddlCommodity-container").text(),
            //billingMethodId: $("#ddlBillingMethod").val(),
            //billingMethodName: $("#select2-ddlBillingMethod-container").text(),
            //meterType: $("#ddlMeterType").val(),
            //meterTypeName: $("#select2-ddlMeterType-container").text(),
            //tebAgentID: $("#txtTEBAgentNID").val().trim(),
            //tenid: $("#txtTENID").val().trim(),
            //sequence: $("#txtSequence").val().trim(),
            //description1: $("#txtBuildingName").val().trim(),
            //isActive: Number($("#chkIsActive").prop('checked')),
        };
    },

    ClearBuildingCommodityData: function () {
        ResetFormErrors("#frm_BuildingCommodity");
        Clear_Form_Fields("#frm_BuildingCommodity");
        $(".has-error p").html("").hide();
        $(".has-error").removeClass("has-error");

        //$("#chkIsActive").prop('checked', false);
        $("#ddlCommodity").select2();
        //$("#ddlBillingMethod").select2();
        //$("#ddlMeterType").select2();

        //$("#txtSequence").val(Number($("#tblBuildingCommodity tbody tr").length) + 1);
    },

    Remove: function (row) {
        $('tr[data-socketId=' + 'tr' + row + ']').remove();

        if ($("#tblBuildingCommodity tbody tr").length == 0)
            $("#tblBuildingCommodity").hide();

        $("#txtSequence").val(Number($("#tblBuildingCommodity tbody tr").length) + 1);
    }

}

$(document).on('change', '.chkbox', function () {

    var colIndex = parseInt($(this).data('col'));
    var isChecked = $(this).prop('checked');

    $('#tblBuilding thead th:nth-child(' + (colIndex + 1) + ')').toggle(isChecked);

    $('#tblBuilding tbody tr').each(function () {
        $(this).find('td:nth-child(' + (colIndex + 1) + ')').toggle(isChecked);
    });
});

function isNumber(evt) {
    evt = (evt) ? evt : window.event;
    var charCode = (evt.which) ? evt.which : evt.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
        return false;
    }
    return true;
}