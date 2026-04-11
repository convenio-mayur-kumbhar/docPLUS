var xhr_Status;
var form = $('#__AjaxAntiForgeryForm');
var token = $('input[name="__RequestVerificationToken"]', form).val();

$(document).ready(function () {
    StatusMaster.BindGrid();
});

var StatusMaster = {

    data: [],
    isEditMode: false,
    // ================= GRID =================
    BindGrid: function () {

        var statusName = $('#txtStatusSearch').val();

        var FormData = {
            STATUS_NAME: statusName ? statusName : null
        };

        LoadGridPost(xhr_Status, "tblStatus",
            "/StatusMaster/GetStatusList",
            { Model: FormData, __RequestVerificationToken: token },
            function (res) {

                if (res && (res.data || res.Data)) {
                    StatusMaster.data = res.data || res.Data;
                }
                $("#divIDViewStatus").show();
                $("#tblStatus").show();
                $("#divExport").show();
            });
    },

    // ================= ADD =================
    SetForAdd: function () {

        this.isEditMode = false;

        Reset_Form_Errors();
        Clear_Form_Fields("#frmStatus");

        $("#hdnStatusID").val('');

        $("#StatusModal .modal-title").text("Add Status");
        $("#StatusModal").modal("show");

        $("#btnAddStatus").hide();
    },

    // ================= SAVE =================
    AddUpdate: function () {

        Reset_Form_Errors();

        var FormData = StatusMaster.GetData();

        if (!StatusMaster.ValidateData(FormData))
            return;

        AddUpdateData("/StatusMaster/AddUpdateStatus",
            { Model: FormData, __RequestVerificationToken: token },
            function (data) {

                try {

                    console.log("Response:", data);

                    // 🔑 IMPORTANT: unwrap response properly
                    var res = data.data || data;

                    if (res.Status == 1 || res.status == 1) {

                        // ✅ SUCCESS
                        showSweetAlert("Success", res.Message || res.message || "Saved successfully", "success");

                        StatusMaster.BindGrid();
                        StatusMaster.ResetData();
                        StatusMaster.SetForClose();
                    }
                    else if (res.Status == 2 || res.status == 2) {

                        // 🔴 DUPLICATE ERROR
                        showSweetAlert("Error", res.Message || res.message || "Status already exists", "error");
                    }
                    else {

                        // ❌ OTHER ERROR
                        showSweetAlert("Error", res.Message || res.message || "Something went wrong", "error");
                    }

                } catch (e) {

                    printError('status.js', 'AddUpdate', e);
                }
            },
            function (response_data) {

                showSweetAlert(response_data.status || "Error",
                    response_data.message || "Request failed",
                    "error",
                    null);
            });
    },

    // ================= CLOSE =================
    SetForClose: function () {

        $("#StatusModal").modal("hide");

        StatusMaster.ResetData();

        $("#btnAddStatus").show();
    },

    // ================= RESET =================
    ResetData: function () {

        Reset_Form_Errors();
        Clear_Form_Fields("#frmStatus");

        $("#hdnStatusID").val('');
        $("#txtStatus").val('');
    },

    // ================= GET DATA =================
    GetData: function () {

        if ($("#hdnStatusID").val() == '' || $("#hdnStatusID").val() == '0') {
            $("#hdnStatusID").val('0');
        }

        return {
            STATUS_ID: $("#hdnStatusID").val(),
            STATUS_NAME: $("#txtStatus").val(),
            LAST_UPDATED_BY: UserID
        };
    },

    // ================= VALIDATION =================
    ValidateData: function (data) {

        if (!data.STATUS_NAME || data.STATUS_NAME == '') {

            showSweetAlert("Error", "Enter status name", "error");

            return false;
        }

        return true;
    },

    // ================= EDIT =================
    Edit: function (id) {

        this.isEditMode = true;

        GetAjaxData("/StatusMaster/GetStatusDetailsById",
            { StatusID: id, __RequestVerificationToken: token },

            function (data) {

                if (data && data.status === "Success") {

                    var row = data.data;

                    $("#hdnStatusID").val(row.statuS_ID);
                    $("#txtStatus").val(row.statuS_NAME);

                    $("#StatusModal").modal("show");
                    $("#btnAddStatus").hide();
                }
            });
    },
    // ================= DELETE =================
    Delete: function (id, statuS_NAME) {

        DeleteData(null, "/StatusMaster/DeleteStatus",

            { id: id, __RequestVerificationToken: token }, statuS_NAME, function () {

                setTimeout(function () {

                    StatusMaster.BindGrid();

                }, 500);

            });

    },


    // ================= EXPORT =================
    Export: function () {

        var tableId = "tblStatus";

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

        StatusMaster.downloadExcel(excel, "StatusList.xls");
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