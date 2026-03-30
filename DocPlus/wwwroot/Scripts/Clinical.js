var xhr_GetData;
var form = $('#__AjaxAntiForgeryForm');
var token = $('input[name="__RequestVerificationToken"]', form).val();

$(document).ready(function () {
    clinical.BindGrid();
    $('#tblPatientList').on('draw.dt', function () {
        clinical.ScreenAccessPermission();
    });
});
// test changes

var clinical = {
    ScreenAccessPermission: function () {

    },
    Assessment: function (patinetID) {

        LoadAddUpdateView('#divStartAssetment', '/Clinical/_partialStartAssessment', null, function () {

            $('#divStartAssetment').show();
            $('#divGrid').hide();
            ResetFormErrors("#frm_StartAssessment");

            clinical.showLeftMenu('demographics', '#general')
        });
    },
    SetForClose: function () {
        $('#divStartAssetment').hide();
        $('#divGrid').show();
    },
    BindGrid: function () {

        var FormData = {

            FirstName: $('#txtFirstName').val(),
            LastName: $('#txtLastName').val(),
            MobileNo: $('#txtMobile').val(),
            Gender: $('#ddlGender').val(),
            AFlag: $('#ddlStatus').val(),
            LastUpdatedOn: $('#txtDate').val()
        };


        LoadGridPost(xhr_GetData, "tblPatientList", "/Clinical/GetData", { Model: FormData, __RequestVerificationToken: token }, function () {
            $("#divIDViewPatientLists").show();
            $("#divExport").show();
            clinical.ScreenAccessPermission();
            $('.chkbox').trigger('change');
        });
    },
    SetForSearch: function () {
        clinical.BindGrid();
    },
    ResetFilterData: function () {
        $('#txtFirstName').val(''),
            $('#txtLastName').val(''),
            $('#txtMobile').val(''),
            $('#ddlGender').val(''),
            $('#ddlDoctor').val(''),
            $('#ddlStatus').val(''),
            $('#txtDate').val('')
    },
    showLeftMenu: function (group, targetId = null) {

        $(".menu-group").hide();
        $("#leftMenu a").removeClass("active");

        var menus = $("." + group);

        if (menus.length > 0) {

            $("#leftMenu").show();
            menus.show();

            let target;

            if (targetId) {
                target = targetId;
                $("#leftMenu a[href='" + targetId + "']").addClass("active");
            } else {
                var firstTab = menus.first().find("a");
                target = firstTab.attr("href");
                firstTab.addClass("active");
            }

            $(".tab-pane").removeClass("active show");
            $(target).addClass("active show");

        } else {
            $("#leftMenu").hide();
        }
    },
    switchMenu: function (target) {

        if (["#general", "#nextOfKin", "#otherProfessionals"].includes(target)) {
            clinical.showLeftMenu("demographics", target);
        }

        else if ([
            "#presenting", "#history", "#past", "#medical",
            "#family", "#personal", "#drug", "#forensic",
            "#premorbid", "#mental"
        ].includes(target)) {
            clinical.showLeftMenu("assessment", target);
        }

        else if (target === "#progressmenu") {
            clinical.showLeftMenu("progressmenu", target);
        }

        else if ([
            "#physicalMonitoring", "#scans", "#eeg", "#otherInvestigations"
        ].includes(target)) {
            clinical.showLeftMenu("investigations", target);
        }

        else if ([
            "#icd10", "#dsm5", "#differential", "#medicalDiagnosis"
        ].includes(target)) {
            clinical.showLeftMenu("diagnosis", target);
        }

        else if ([
            "#riskSummary", "#riskPlan", "#riskIndicators"
        ].includes(target)) {
            clinical.showLeftMenu("risk", target);
        }

        else if (target === "#prescriptions") {
            clinical.showLeftMenu("prescriptions", target);
        }

        else if (target === "#oldprescriptions") {
            clinical.showLeftMenu("oldprescriptions", target);
        }

        else if (target === "#inpatients") {
            clinical.showLeftMenu("inpatients", target);
        }

        else if (target === "#attachments") {
            clinical.showLeftMenu("attachments", target);
        }

        else if (target === "#medicalcert") {
            clinical.showLeftMenu("medicalcert", target);
        }

        else if (target === "#oldmedicert") {
            clinical.showLeftMenu("oldmedicert", target);
        }

        else if (target === "#psyreport") {
            clinical.showLeftMenu("psyreport", target);
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

        // ✅ Check DataTable initialized
        if (!$.fn.DataTable.isDataTable('#' + tableId)) {
            console.error("DataTable not initialized");
            return;
        }

        var dt = $('#' + tableId).DataTable();
        var cols = clinical.getVisibleColumns();

        // ✅ Fallback: if no checkbox selected → export all columns
        if (cols.length === 0) {
            dt.columns().every(function (i) {
                cols.push(i);
            });
        }

        console.log("Total Rows:", dt.rows().count());
        console.log("Selected Columns:", cols);

        var excel = '<table border="1"><thead><tr>';

        // ✅ Header (Exclude Assessment)
        dt.columns().every(function (i) {

            var headerText = $(this.header()).text().trim();

            if (cols.indexOf(i) !== -1 && headerText !== "Assessment") {
                excel += '<th>' + headerText + '</th>';
            }
        });

        excel += '</tr></thead><tbody>';

        // ✅ Rows
        dt.rows().every(function () {

            var row = this.data();
            excel += '<tr>';

            // ✅ If row is ARRAY
            if (Array.isArray(row)) {

                for (var i = 0; i < row.length; i++) {

                    var headerText = $(dt.column(i).header()).text().trim();

                    if (cols.indexOf(i) !== -1 && headerText !== "Assessment") {

                        var cellData = $('<div>').html(row[i]).text();
                        excel += '<td>' + cellData + '</td>';
                    }
                }
            }
            // ✅ If row is OBJECT
            else if (typeof row === "object") {

                var index = 0;

                for (var key in row) {

                    var headerText = $(dt.column(index).header()).text().trim();

                    if (cols.indexOf(index) !== -1 && headerText !== "Assessment") {

                        var cellData = row[key];

                        if (typeof cellData === "string") {
                            cellData = $('<div>').html(cellData).text();
                        }

                        excel += '<td>' + cellData + '</td>';
                    }

                    index++;
                }
            }

            excel += '</tr>';
        });

        excel += '</tbody></table>';

        // ✅ Download
        clinical.downloadXls(excel, "PatientClinicalList.xls");
    },
    downloadXls: function (tableHtml, fileName) {

        var template =
            '<html xmlns:o="urn:schemas-microsoft-com:office:office" ' +
            'xmlns:x="urn:schemas-microsoft-com:office:excel">' +
            '<head>' +
            '<meta charset="UTF-8">' +
            '<!--[if gte mso 9]>' +
            '<xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet>' +
            '<x:Name>Report</x:Name>' +
            '<x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>' +
            '</x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml>' +
            '<![endif]-->' +
            '</head><body>' +
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
}
