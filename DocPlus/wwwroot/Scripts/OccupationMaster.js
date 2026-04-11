var xhr_Occupation;
var form = $('#__AjaxAntiForgeryForm');
var token = $('input[name="__RequestVerificationToken"]', form).val();

$(document).ready(function () {
    occupation.BindGrid();
});

var occupation = {

    data: [],
    isEditMode: false,
    // ================= GRID =================
    BindGrid: function () {

        var occupationName = $('#txtOccupationSearch').val();

        var FormData = {
            OCCUPATION_NAME: occupationName ? occupationName : null
        };

        LoadGridPost(xhr_Occupation, "tblOccupation",
            "/OccupationMaster/GetOccupationList",
            { Model: FormData, __RequestVerificationToken: token },
            function (res) {

                if (res && (res.data || res.Data)) {
                    occupation.data = res.data || res.Data;
                }
                $("#divIDViewOccupation").show();
                $("#tblOccupation").show();
                $("#divExport").show();
            });
    },

    // ================= ADD =================
    SetForAdd: function () {

        this.isEditMode = false;

        Reset_Form_Errors();
        Clear_Form_Fields("#frmOccupation");

        $("#hdnOccupationID").val('');

        $("#OccupationModal .modal-title").text("Add Occupation");
        $("#OccupationModal").modal("show");

        $("#btnAddOccupation").hide();
    },

    // ================= SAVE =================
    AddUpdate: function () {

        Reset_Form_Errors();

        var FormData = occupation.GetData();

        if (!occupation.ValidateData(FormData))
            return;

        AddUpdateData("/OccupationMaster/AddUpdateOccupation",
            { Model: FormData, __RequestVerificationToken: token },
            function (data) {

                try {

                    console.log("Response:", data);

                    // 🔑 IMPORTANT: unwrap response properly
                    var res = data.data || data;

                    if (res.Status == 1 || res.status == 1) {

                        // ✅ SUCCESS
                        showSweetAlert("Success", res.Message || res.message || "Saved successfully", "success");

                        occupation.BindGrid();
                        occupation.ResetData();
                        occupation.SetForClose();
                    }
                    else if (res.Status == 2 || res.status == 2) {

                        // 🔴 DUPLICATE ERROR
                        showSweetAlert("Error", res.Message || res.message || "Occupation already exists", "error");
                    }
                    else {

                        // ❌ OTHER ERROR
                        showSweetAlert("Error", res.Message || res.message || "Something went wrong", "error");
                    }

                } catch (e) {

                    printError('occupation.js', 'AddUpdate', e);
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

        $("#OccupationModal").modal("hide");

        occupation.ResetData();

        $("#btnAddOccupation").show();
    },

    // ================= RESET =================
    ResetData: function () {

        Reset_Form_Errors();
        Clear_Form_Fields("#frmOccupation");

        $("#hdnOccupationID").val('');
        $("#txtOccupation").val('');
    },

    // ================= GET DATA =================
    GetData: function () {

        if ($("#hdnOccupationID").val() == '' || $("#hdnOccupationID").val() == '0') {
            $("#hdnOccupationID").val('0');
        }

        return {
            OCCUPATION_ID: $("#hdnOccupationID").val(),
            OCCUPATION_NAME: $("#txtOccupation").val(),
            LAST_UPDATED_BY: UserID
        };
    },

    // ================= VALIDATION =================
    ValidateData: function (data) {

        if (!data.OCCUPATION_NAME || data.OCCUPATION_NAME == '') {

            showSweetAlert("Error", "Enter occupation name", "error");

            return false;
        }

        return true;
    },

    // ================= EDIT =================
    Edit: function (id) {

        this.isEditMode = true;

        GetAjaxData("/OccupationMaster/GetOccupationDetailsById",
            { OccupationID: id, __RequestVerificationToken: token },

            function (data) {

                if (data && data.status === "Success") {

                    var row = data.data;

                    $("#hdnOccupationID").val(row.occupatioN_ID);
                    $("#txtOccupation").val(row.occupatioN_NAME);

                    $("#OccupationModal").modal("show");
                    $("#btnAddOccupation").hide();
                }
            });
    },
    // ================= DELETE =================
    Delete: function (id, occupatioN_NAME) {

        DeleteData(null, "/OccupationMaster/DeleteOccupation",

            { id: id, __RequestVerificationToken: token }, occupatioN_NAME, function () {

                setTimeout(function () {

                    occupation.BindGrid();

                }, 500);

            });
    },
    // ================= EXPORT =================
    Export: function () {

        var tableId = "tblOccupation";

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

        Occupation.downloadExcel(excel, "OccupationList.xls");
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