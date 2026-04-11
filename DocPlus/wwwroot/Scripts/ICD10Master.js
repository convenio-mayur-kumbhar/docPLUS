var xhr_ICD10;
var form = $('#__AjaxAntiForgeryForm');
var token = $('input[name="__RequestVerificationToken"]', form).val();

$(document).ready(function () {
    ICD10.BindGrid();
});

var ICD10 = {

    data: [],
    isEditMode: false,

    // ================= GRID =================
    BindGrid: function () {

        var FormData = {};

        LoadGridPost(xhr_ICD10, "tblICD10",
            "/ICD10Master/GetICD10MasterList",
            { Model: FormData, __RequestVerificationToken: token },
            function (res) {

                if (res && (res.data || res.Data)) {
                    ICD10.data = res.data || res.Data;
                }

                $("#divIDViewICD10").show();
                $("#tblICD10").show();
                $("#divExport").show();
            });
    },

    // ================= ADD =================
    SetForAdd: function () {

        this.isEditMode = false;

        Reset_Form_Errors();
        Clear_Form_Fields("#frmICD10");

        $("#hdnICD10ID").val('0');

        $("#lblICD10Title").text("Add ICD10");
        $("#AddICD10Modal").modal("show");

        $("#btnAddICD10").hide();
    },

    // ================= SAVE =================
    AddUpdate: function () {

        Reset_Form_Errors();

        var FormData = ICD10.GetData();

        if (!ICD10.ValidateData(FormData))
            return;

        AddUpdateData("/ICD10Master/AddUpdateICD10Master",
            { Model: FormData, __RequestVerificationToken: token },

            function (data) {

                try {

                    var res = data.data || data;

                    if (res.Status == 1 || res.status == 1) {

                        showSweetAlert("Success",
                            res.Message || "Saved successfully",
                            "success");

                        ICD10.BindGrid();
                        ICD10.ResetData();
                        ICD10.SetForClose();
                    }
                    else if (res.Status == 2 || res.status == 2) {

                        showSweetAlert("Error",
                            res.Message || "ICD10 already exists",
                            "error");
                    }
                    else {

                        showSweetAlert("Error",
                            res.Message || "Something went wrong",
                            "error");
                    }

                } catch (e) {

                    printError('icd10 .js', 'AddUpdate', e);
                }

            },
            function (response_data) {

                showSweetAlert(response_data.status || "Error",
                    response_data.message || "Request failed",
                    "error");
            });
    },

    // ================= CLOSE =================
    SetForClose: function () {

        $("#AddICD10Modal").modal("hide");

        ICD10.ResetData();

        $("#btnAddICD10").show();
    },

    // ================= RESET =================
    ResetData: function () {

        Reset_Form_Errors();
        Clear_Form_Fields("#frmICD10");

        $("#hdnICD10ID").val('0');
        $("#txtICD10Code").val('');
        $("#txtICD10Remarks").val('');
    },

    // ================= GET DATA =================
    GetData: function () {

        if ($("#hdnICD10ID").val() == '' || $("#hdnICD10ID").val() == '0') {
            $("#hdnICD10ID").val('0');
        }

        return {
            ICD10_ID: $("#hdnICD10ID").val(),
            ICD10_CODE: $("#txtICD10Code").val(),
            ICD10_REMARKS: $("#txtICD10Remarks").val(),
            LAST_UPDATED_BY: UserID
        };
    },

    // ================= VALIDATION =================
    ValidateData: function (data) {

        if (!data.ICD10_CODE || data.ICD10_CODE.trim() === '') {

            showSweetAlert("Error", "Enter ICD10 Code", "error");
            return false;
        }

        if (!data.ICD10_REMARKS || data.ICD10_REMARKS.trim() === '') {

            showSweetAlert("Error", "Enter Remarks", "error");
            return false;
        }

        return true;
    },

    // ================= EDIT =================
    Edit: function (id) {

        this.isEditMode = true;

        GetAjaxData("/ICD10Master/GetICD10MasterDetailsById",
            { id: id, __RequestVerificationToken: token },

            function (data) {

                if (data && data.status === "Success") {

                    var row = data.data;

                    $("#hdnICD10ID").val(row.icD10_ID);
                    $("#txtICD10Code").val(row.icD10_CODE);
                    $("#txtICD10Remarks").val(row.icD10_REMARKS);

                    $("#lblICD10Title").text("Edit ICD10");
                    $("#AddICD10Modal").modal("show");

                    $("#btnAddICD10").hide();
                }
            });
    },

    // ================= DELETE =================
    Delete: function (id, icD10_CODE, icD10_REMARKS ) {

        DeleteData(null, "/ICD10Master/DeleteICD10Master",

            { id: id, __RequestVerificationToken: token }, icD10_CODE, function () {

                setTimeout(function () {

                    ICD10.BindGrid();

                }, 500);

            });

    },

    // ================= EXPORT =================
    Export: function () {

        var tableId = "tblICD10";

        if (!$.fn.DataTable.isDataTable('#' + tableId)) {
            console.error("DataTable not initialized");
            return;
        }

        var dt = $('#' + tableId).DataTable();

        var excel = '<table border="1"><thead><tr>';

        dt.columns().every(function () {

            var headerText = $(this.header()).text().trim();

            if (headerText !== "Action") {
                excel += '<th>' + headerText + '</th>';
            }
        });

        excel += '</tr></thead><tbody>';

        dt.rows().every(function () {

            var row = this.data();
            excel += '<tr>';

            if (Array.isArray(row)) {

                for (var i = 0; i < row.length; i++) {

                    var headerText = $(dt.column(i).header()).text().trim();

                    if (headerText !== "Action") {

                        var cellData = $('<div>').html(row[i]).text();
                        excel += '<td>' + cellData + '</td>';
                    }
                }
            }

            excel += '</tr>';
        });

        excel += '</tbody></table>';

        ICD10Master.downloadExcel(excel, "ICD10List.xls");
    },

    downloadExcel: function (tableHtml, fileName) {

        var template =
            '<html xmlns:o="urn:schemas-microsoft-com:office:office" ' +
            'xmlns:x="urn:schemas-microsoft-com:office:excel">' +
            '<head><meta charset="UTF-8"></head><body>' +
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
    }
};