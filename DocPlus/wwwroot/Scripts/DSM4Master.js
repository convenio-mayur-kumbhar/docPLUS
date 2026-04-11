var xhr_DSM4;
var form = $('#__AjaxAntiForgeryForm');
var token = $('input[name="__RequestVerificationToken"]', form).val();

$(document).ready(function () {
    DSM4.BindGrid();
});

var DSM4 = {

    data: [],
    isEditMode: false,

    // ================= GRID =================
    BindGrid: function () {

        var FormData = {};

        LoadGridPost(xhr_DSM4, "tblDSM4",
            "/DSM4Master/GetDSM4MasterList",
            { Model: FormData, __RequestVerificationToken: token },
            function (res) {

                if (res && (res.data || res.Data)) {
                    DSM4.data = res.data || res.Data;
                }

                $("#divIDViewDSM4").show();
                $("#tblDSM4").show();
                $("#divExport").show();
            });
    },

    // ================= ADD =================
    SetForAdd: function () {

        this.isEditMode = false;

        Reset_Form_Errors();
        Clear_Form_Fields("#frmDSM4");

        $("#hdnDSM4ID").val('0');

        $("#lblDSM4Title").text("Add DSM4");
        $("#AddDSM4Modal").modal("show");

        $("#btnAddDSM4").hide();
    },

    // ================= SAVE =================
    AddUpdate: function () {

        Reset_Form_Errors();

        var FormData = DSM4.GetData();

        if (!DSM4.ValidateData(FormData))
            return;

        AddUpdateData("/DSM4Master/AddUpdateDSM4Master",
            { Model: FormData, __RequestVerificationToken: token },

            function (data) {

                try {

                    var res = data.data || data;

                    if (res.Status == 1 || res.status == 1) {

                        showSweetAlert("Success",
                            res.Message || "Saved successfully",
                            "success");

                        DSM4.BindGrid();
                        DSM4.ResetData();
                        DSM4.SetForClose();
                    }
                    else if (res.Status == 2 || res.status == 2) {

                        showSweetAlert("Error",
                            res.Message || "DSM4 already exists",
                            "error");
                    }
                    else {

                        showSweetAlert("Error",
                            res.Message || "Something went wrong",
                            "error");
                    }

                } catch (e) {

                    printError('dsm4.js', 'AddUpdate', e);
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

        $("#AddDSM4Modal").modal("hide");

        DSM4.ResetData();

        $("#btnAddDSM4").show();
    },

    // ================= RESET =================
    ResetData: function () {

        Reset_Form_Errors();
        Clear_Form_Fields("#frmDSM4");

        $("#hdnDSM4ID").val('0');
        $("#txtDSM4Code").val('');
        $("#txtDSM4Remarks").val('');
    },

    // ================= GET DATA =================
    GetData: function () {

        if ($("#hdnDSM4ID").val() == '' || $("#hdnDSM4ID").val() == '0') {
            $("#hdnDSM4ID").val('0');
        }

        return {
            DSM4_ID: $("#hdnDSM4ID").val(),
            DSM4_CODE: $("#txtDSM4Code").val(),
            DSM4_REMARKS: $("#txtDSM4Remarks").val(),
            LAST_UPDATED_BY: UserID
        };
    },

    // ================= VALIDATION =================
    ValidateData: function (data) {

        if (!data.DSM4_CODE || data.DSM4_CODE.trim() === '') {

            showSweetAlert("Error", "Enter DSM4 Code", "error");
            return false;
        }

        if (!data.DSM4_REMARKS || data.DSM4_REMARKS.trim() === '') {

            showSweetAlert("Error", "Enter DSM4 Remarks", "error");
            return false;
        }

        return true;
    },

    // ================= EDIT =================
    Edit: function (id) {

        this.isEditMode = true;

        GetAjaxData("/DSM4Master/GetDSM4MasterDetailsById",
            { id: id, __RequestVerificationToken: token },

            function (data) {

                if (data && data.status === "Success") {

                    var row = data.data;

                    $("#hdnDSM4ID").val(row.dsM4_ID);
                    $("#txtDSM4Code").val(row.dsM4_CODE);
                    $("#txtDSM4Remarks").val(row.dsM4_REMARKS);

                    $("#lblDSM4Title").text("Edit DSM4");
                    $("#AddDSM4Modal").modal("show");

                    $("#btnAddDSM4").hide();
                }
            });
    },

    // ================= DELETE =================
    Delete: function (id, dsM4_CODE, dsM4_REMARKS) {

        DeleteData(null, "/DSM4Master/DeleteDSM4Master",

            { id: id, __RequestVerificationToken: token }, dsM4_CODE, function () {

                setTimeout(function () {

                    DSM4.BindGrid();

                }, 500);

            });

    },

    // ================= EXPORT =================
    Export: function () {

        var tableId = "tblDSM4";

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

        DSM4Master.downloadExcel(excel, "DSM4List.xls");
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