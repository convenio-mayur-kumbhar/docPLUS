var xhr_Category;
var form = $('#__AjaxAntiForgeryForm');
var token = $('input[name="__RequestVerificationToken"]', form).val();

$(document).ready(function () {
    category.BindGrid();
});

var category = {

    data: [],
    isEditMode: false,
    // ================= GRID =================
    BindGrid: function () {

        var categoryName = $('#txtCategorySearch').val();

        var FormData = {
            CATEGORY_NAME: categoryName ? categoryName : null
        };

        LoadGridPost(xhr_Category, "tblCategory",
            "/CategoryMaster/GetCategoryList",
            { Model: FormData, __RequestVerificationToken: token },
            function (res) {

                if (res && (res.data || res.Data)) {
                    category.data = res.data || res.Data;
                }
                $("#divIDViewCategory").show();
                $("#tblCategory").show();
                $("#divExport").show();
            });
    },

    // ================= ADD =================
    SetForAdd: function () {

        this.isEditMode = false;

        Reset_Form_Errors();
        Clear_Form_Fields("#frmCategory");

        $("#hdnCategoryID").val('');

        $("#CategoryModal .modal-title").text("Add Category");
        $("#CategoryModal").modal("show");

        $("#btnAddCategory").hide();
    },

    // ================= SAVE =================
    AddUpdate: function () {

        Reset_Form_Errors();

        var FormData = category.GetData();

        if (!category.ValidateData(FormData))
            return;

        AddUpdateData("/CategoryMaster/AddUpdateCategory",
            { Model: FormData, __RequestVerificationToken: token },
            function (data) {

                try {

                    console.log("Response:", data);

                    // 🔑 IMPORTANT: unwrap response properly
                    var res = data.data || data;

                    if (res.Status == 1 || res.status == 1) {

                        // ✅ SUCCESS
                        showSweetAlert("Success", res.Message || res.message || "Saved successfully", "success");

                        category.BindGrid();
                        category.ResetData();
                        category.SetForClose();
                    }
                    else if (res.Status == 2 || res.status == 2) {

                        // 🔴 DUPLICATE ERROR
                        showSweetAlert("Error", res.Message || res.message || "Category already exists", "error");
                    }
                    else {

                        // ❌ OTHER ERROR
                        showSweetAlert("Error", res.Message || res.message || "Something went wrong", "error");
                    }

                } catch (e) {

                    printError('category.js', 'AddUpdate', e);
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

        $("#CategoryModal").modal("hide");

        category.ResetData();

        $("#btnAddCategory").show();
    },

    // ================= RESET =================
    ResetData: function () {

        Reset_Form_Errors();
        Clear_Form_Fields("#frmCategory");

        $("#hdnCategoryID").val('');
        $("#txtCategory").val('');
    },

    // ================= GET DATA =================
    GetData: function () {

        if ($("#hdnCategoryID").val() == '' || $("#hdnCategoryID").val() == '0') {
            $("#hdnCategoryID").val('0');
        }

        return {
            CATEGORY_ID: $("#hdnCategoryID").val(),
            CATEGORY_NAME: $("#txtCategory").val(),
            LAST_UPDATED_BY: UserID
        };
    },

    // ================= VALIDATION =================
    ValidateData: function (data) {

        if (!data.CATEGORY_NAME || data.CATEGORY_NAME == '') {

            showSweetAlert("Error", "Enter category name", "error");

            return false;
        }

        return true;
    },

    // ================= EDIT =================
    Edit: function (id) {

        this.isEditMode = true;

        GetAjaxData("/CategoryMaster/GetCategoryDetailsById",
            { CategoryID: id, __RequestVerificationToken: token },

            function (data) {

                if (data && data.status === "Success") {

                    var row = data.data;

                    $("#hdnCategoryID").val(row.categorY_ID);
                    $("#txtCategory").val(row.categorY_NAME);

                    $("#CategoryModal").modal("show");
                    $("#btnAddCategory").hide();
                }
            });
    },
    // ================= DELETE =================
    Delete: function (id, categorY_NAME) {

        DeleteData(null, "/CategoryMaster/DeleteCategory",

            { id: id, __RequestVerificationToken: token }, categorY_NAME, function () {

                setTimeout(function () {

                    category.BindGrid();

                }, 500);

            });

    },
    // ================= EXPORT =================
    Export: function () {

        var tableId = "tblCategory";

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

        category.downloadExcel(excel, "CategoryList.xls");
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