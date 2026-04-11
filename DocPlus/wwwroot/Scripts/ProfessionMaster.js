var xhr_Profession;
var form = $('#__AjaxAntiForgeryForm');
var token = $('input[name="__RequestVerificationToken"]', form).val();

$(document).ready(function () {
    profession.BindGrid();
});

var profession = {

    data: [],
    isEditMode: false,
    // ================= GRID =================
    BindGrid: function () {

        var professionName = $('#txtProfessionSearch').val();

        var FormData = {
            PROFESSION_NAME: professionName ? professionName : null
        };

        LoadGridPost(xhr_Profession, "tblProfession",
            "/ProfessionMaster/GetProfessionList",
            { Model: FormData, __RequestVerificationToken: token },
            function (res) {

                if (res && (res.data || res.Data)) {
                    profession.data = res.data || res.Data;
                }
                $("#divIDViewProfession").show();
                $("#tblProfession").show();
                $("#divExport").show();
            });
    },

    // ================= ADD =================
    SetForAdd: function () {

        this.isEditMode = false;

        Reset_Form_Errors();
        Clear_Form_Fields("#frmProfession");

        $("#hdnProfessionID").val('');

        $("#ProfessionModal .modal-title").text("Add Profession");
        $("#ProfessionModal").modal("show");

        $("#btnAddProfession").hide();
    },

    // ================= SAVE =================
    AddUpdate: function () {

        Reset_Form_Errors();

        var FormData = profession.GetData();

        if (!profession.ValidateData(FormData))
            return;

        AddUpdateData("/ProfessionMaster/AddUpdateProfession",
            { Model: FormData, __RequestVerificationToken: token },
            function (data) {

                try {

                    console.log("Response:", data);

                    // 🔑 IMPORTANT: unwrap response properly
                    var res = data.data || data;

                    if (res.Status == 1 || res.status == 1) {

                        // ✅ SUCCESS
                        showSweetAlert("Success", res.Message || res.message || "Saved successfully", "success");

                        profession.BindGrid();
                        profession.ResetData();
                        profession.SetForClose();
                    }
                    else if (res.Status == 2 || res.status == 2) {

                        // 🔴 DUPLICATE ERROR
                        showSweetAlert("Error", res.Message || res.message || "Profession already exists", "error");
                    }
                    else {

                        // ❌ OTHER ERROR
                        showSweetAlert("Error", res.Message || res.message || "Something went wrong", "error");
                    }

                } catch (e) {

                    printError('profession.js', 'AddUpdate', e);
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

        $("#ProfessionModal").modal("hide");

        profession.ResetData();

        $("#btnAddProfession").show();
    },

    // ================= RESET =================
    ResetData: function () {

        Reset_Form_Errors();
        Clear_Form_Fields("#frmProfession");

        $("#hdnProfessionID").val('');
        $("#txtProfession").val('');
    },

    // ================= GET DATA =================
    GetData: function () {

        if ($("#hdnProfessionID").val() == '' || $("#hdnProfessionID").val() == '0') {
            $("#hdnProfessionID").val('0');
        }

        return {
            PROFESSION_ID: $("#hdnProfessionID").val(),
            PROFESSION_NAME: $("#txtProfession").val(),
            LAST_UPDATED_BY: UserID
        };
    },

    // ================= VALIDATION =================
    ValidateData: function (data) {

        if (!data.PROFESSION_NAME || data.PROFESSION_NAME == '') {

            showSweetAlert("Error", "Enter profession name", "error");

            return false;
        }

        return true;
    },

    // ================= EDIT =================
    Edit: function (id) {

        this.isEditMode = true;

        GetAjaxData("/ProfessionMaster/GetProfessionDetailsById",
            { ProfessionID: id, __RequestVerificationToken: token },

            function (data) {

                if (data && data.status === "Success") {

                    var row = data.data;

                    $("#hdnProfessionID").val(row.professioN_ID);
                    $("#txtProfession").val(row.professioN_NAME);

                    $("#ProfessionModal").modal("show");
                    $("#btnAddProfession").hide();
                }
            });
    },
    // ================= DELETE =================
    Delete: function (id, professioN_NAME) {

       

        DeleteData(null, "/ProfessionMaster/DeleteProfession",

            { id: id, __RequestVerificationToken: token },professioN_NAME,function () {

                setTimeout(function () {

                    profession.BindGrid();

                }, 500);

            });

    },

    // ================= EXPORT =================
    Export: function () {

        var tableId = "tblProfession";

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

        profession.downloadExcel(excel, "ProfessionList.xls");
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