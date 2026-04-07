var xhr_Appointment;
var form = $('#__AjaxAntiForgeryForm');
var token = $('input[name="__RequestVerificationToken"]', form).val();
$(document).ready(function () {
    var today = appointments.getToday();
    $('#txtDate').attr('min', today).val(today);
    $('#textSearchDate').val(today);
    $('#txtDate').on('change', function () {
        appointments.appointmentTimeValidation();
    });
    $('#txtTime').on('change', function () {
        appointments.appointmentTimeValidation();
    });
    appointments.BindGrid();
});
var appointments = { 
    isEditMode: false,
    getToday: function () {
        return new Date().toISOString().split('T')[0];
    },
    appointmentTimeValidation: function () {

        var selectedDate = $('#txtDate').val();
        var selectedTime = $('#txtTime').val();

        if (!selectedDate) return;

        var today = this.getToday();

        // ✅ ONLY validate strictly in ADD mode
        if (selectedDate === today && !this.isEditMode) {

            var now = this.getCurrentTime();

            $('#txtTime').attr('min', now.formatted);

            if (selectedTime) {
                var parts = selectedTime.split(":");

                var selHours = parseInt(parts[0]);
                var selMinutes = parseInt(parts[1]);

                if (selHours < now.hours || (selHours === now.hours && selMinutes < now.minutes)) {

                    if (!$('#txtTime').data('invalid')) {
                        showSweetAlert("Warning", "Please select current or future time", "warning");
                    }

                    $('#txtTime').data('invalid', true);
                    $('#txtTime').val(now.formatted);
                }
                else {
                    $('#txtTime').removeData('invalid');
                }
            }
        }
        else {
            // ✅ EDIT MODE or FUTURE DATE → no restriction
            $('#txtTime').removeAttr('min');
            $('#txtTime').removeData('invalid');
        }
    },
    getCurrentTime: function () {
        var now = new Date();
        return {
            hours: now.getHours(),
            minutes: now.getMinutes(),
            formatted:
                now.getHours().toString().padStart(2, '0') + ":" +
                now.getMinutes().toString().padStart(2, '0')
        };
    },
    BindGrid: function () {
        var selectedDate = $('#textSearchDate').val();
        var patientName = $('#txtPatientName').val();
        var formattedDate = null;
        if (selectedDate) {
            formattedDate = selectedDate + " 00:00:00";
        }
        var FormData = {
            PAT_FULLNAME: patientName ? patientName : null,
            APPT_DATE: formattedDate
        };
        LoadGridPost(xhr_Appointment, "tblAppointment", "/Appointments/GetAppointmentList", { Model: FormData, __RequestVerificationToken: token },
            function (res) {
                if (res && (res.data || res.Data)) {
                    appointments.data = res.data || res.Data;
                }
                $("#divIDViewAppointments").show();
                $("#divExport").show();
            }
        );
    },
    SetForAdd: function () {
        this.isEditMode = false; // ✅ ADD MODE
        this.LoadPatients();
        Reset_Form_Errors();
        Clear_Form_Fields("#frmAppointment");
        $("#APPT_ID").val('');
        $("#ddlPatientDropdown").val(null).trigger("change");
        var today = appointments.getToday();
        $("#txtDate").val(today);
        var currentTime = appointments.getCurrentTime().formatted;
        $("#txtTime").val(currentTime);
        appointments.appointmentTimeValidation();
        Reload_ddl_Global(null, "#ddlPatientDropdown", "/Appointments/GetPatientDropdown", null, "Select", function () {
            $("#ddlPatientDropdown").select2();
        });
        $("#AppointmentModal .modal-title").text("Add Appointment");
        $("#AppointmentModal").modal("show");
        $("#btnAddAppointment").hide();
    },
    AddUpdate: function () {
        Reset_Form_Errors();
        appointments.appointmentTimeValidation();
        var FormData = appointments.GetData();
        if (!appointments.ValidateData(FormData)) return;
        AddUpdateData("/Appointments/AddAppointment",
            { Model: FormData, __RequestVerificationToken: token },
            function (data) {
                try {
                    if (data.status === true || data.status === 'Success') {
                        showSweetAlert('Success', data.message, 'success', null);
                        appointments.BindGrid();
                        appointments.ResetData();
                        appointments.SetForClose();
                    }
                    else {
                        showSweetAlert("Failed", data.message || "Something went wrong", 'error', null);
                    }
                } catch (e) {
                    printError('appointments.js', 'AddUpdate', e);
                }
            },
            function (response_data) {
                showSweetAlert(response_data.status || "Error", response_data.message || "Request failed", 'error', null);
            }
        );
    },
    SetForClose: function () {
        $("#AppointmentModal").modal('hide');
        appointments.ResetData();
        $("#btnAddAppointment").show();
    },
    ResetData: function () {
        Reset_Form_Errors();
        Clear_Form_Fields("#frmAppointment");
        $("#APPT_ID").val('');
        $("#ddlPatientDropdown").val(null).trigger("change");
        $("#txtCell").val('');
        $("#txtTele").val('');
        var today = appointments.getToday();
        $("#txtDate").val(today);
        var currentTime = appointments.getCurrentTime().formatted;
        $("#txtTime").val(currentTime);
        appointments.appointmentTimeValidation();
        $("#txtComments").val('');
    },
    GetData: function () {
        if ($("#hdnAppointmentID").val() == '0' || $("#hdnAppointmentID").val() == '') {
            $("#hdnAppointmentID").val('0');
        }
        return {
            APPT_ID: $("#hdnAppointmentID").val(),
            PAT_ID: $("#ddlPatientDropdown").val(),
            APPT_DATE: $("#txtDate").val(),
            APPT_TIME: $("#txtTime").val(),
            APPT_COMMENTS: $("#txtComments").val(),
            LAST_UPDATED_BY: UserID,
        };
    },    
    ValidateData: function (data) {
        if (!data.PAT_ID || data.PAT_ID == '') {
            showSweetAlert("Error", "Please select patient name", "error");
            return false;
        }
        if (!data.APPT_DATE || data.APPT_DATE == '') {
            showSweetAlert("Error", "Please select date", "error");
            return false;
        }
        if (!data.APPT_TIME || data.APPT_TIME == '') {
            showSweetAlert("Error", "Please select time", "error");
            return false;
        }   
        if (!data.APPT_COMMENTS || data.APPT_COMMENTS == '') {
            showSweetAlert("Error", "Enter the comments", "error");
            return false;
        } 
        return true;
    },
    Edit: function (id) {
        this.isEditMode = true; // ✅ EDIT MODE
        GetAjaxData("/Appointments/GetAppointmentDetailsById",
            { AppointmentID: id, __RequestVerificationToken: token },
            function (data) {
                if (data && data.status === "Success") {
                    var row = data.data;
                    $("#hdnAppointmentID").val(row.appT_ID);
                    Reload_ddl_Global(null, "#ddlPatientDropdown", "/Appointments/GetPatientDropdown", null, "Select", function () {
                        $("#ddlPatientDropdown").select2();
                        $("#ddlPatientDropdown").val(row.paT_ID).trigger("change");
                    });
                    let selectedDate = new Date(row.appT_DATE);
                    let formattedDate =
                        selectedDate.getFullYear() + "-" +
                        ("0" + (selectedDate.getMonth() + 1)).slice(-2) + "-" +
                        ("0" + selectedDate.getDate()).slice(-2);
                    $("#txtDate").val(formattedDate);
                    $("#txtTime").val(row.appT_TIMECustom);
                    appointments.appointmentTimeValidation();
                    $("#txtCell").val(row.paT_MOBNO);
                    $("#txtTele").val(row.paT_TELENO);
                    $("#txtComments").val(row.appT_COMMENTS);
                    $("#AppointmentModal").modal("show");
                    $("#btnAddAppointment").hide();
                }
            }
        );
    },
    Delete: function (id) {
        if (!id) {
            showSweetAlert('Error', 'Invalid ID', 'error', null);
            return;
        }
        $.confirm({
            theme: 'modern',
            title: 'Are you sure you want to delete this appointment?',
            content: '<b>Kindly confirm!</b>',
            animation: 'zoom',
            closeAnimation: 'scale',
            backgroundDismiss: true,
            animationSpeed: '400',
            icon: 'flaticon-warning text-warning',
            closeIcon: true,
            buttons: {
                cancel: {
                    text: 'No',
                    btnClass: 'btn btn-sm btn-default',
                    action: function () {
                    }
                },
                confirm: {
                    text: 'Yes',
                    btnClass: 'btn btn-sm btn-danger',
                    action: function () {
                        AddUpdateData(
                            "/Appointments/DeleteAppointment",
                            { id: parseInt(id), __RequestVerificationToken: token },
                            function (data) {
                                if (data && data.status && data.status.toLowerCase() === "success") {
                                    showSweetAlert('Deleted', data.message || "Deleted successfully", 'success', null);
                                    appointments.BindGrid();
                                } else {
                                    showSweetAlert('Error', data.message || 'Delete failed', 'error', null);
                                }
                            },
                            function (res) {
                                showSweetAlert('Error', res.message || 'Delete failed', 'error', null);
                            }
                        );
                    }
                }
            }
        });
    },
    LoadPatients: function () {
        $('.date-picker').datepicker({
            autoclose: true,
            todayHighlight: true,
            format: DateTimeDataFormat.ddMMyyyy
        });
        Reload_ddl_Global(null, "#ddlPatientDropdown", "/Appointments/GetPatientDropdown", {}, "Select", function () { $("#ddlPatientDropdown").select2(); });
        $("#ddlPatientDropdown").off("change").on("change", function () {
            var id = $(this).val();
            if (!id || id === "0") {
                $("#txtCell").val("");
                $("#txtTele").val("");
                return;
            }
            id = parseInt(id);
            GetAjaxData("/Appointments/GetAppointmentDetailsById",
                { AppointmentID: id, __RequestVerificationToken: token },
                function (data) {
                    if (data && data.status === "Success") {
                        var res = data.data;
                        $("#txtCell").val(res.paT_MOBNO);
                        $("#txtTele").val(res.paT_TELENO);
                    }
                }
            );
        });
    },
    SetForSearch: function () {
        appointments.BindGrid();
    },
    ResetSearch: function () {
        $('#txtPatientName').val('');
        var today = appointments.getToday();
        $('#textSearchDate').val(today);
        appointments.BindGrid(true);
    },
    Export: function () {
        var tableId = "tblAppointment";
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
        appointments.downloadExcel(excel, "AppointmentList.xls");
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
    },
};
