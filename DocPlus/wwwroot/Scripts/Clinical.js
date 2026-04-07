var xhr_GetData;
var form = $('#__AjaxAntiForgeryForm');
var token = $('input[name="__RequestVerificationToken"]', form).val();
$(document).ready(function () {
    clinical.BindGrid();
    $('#tblPatientList').on('draw.dt', function () {
        clinical.ScreenAccessPermission();
    });
});
var clinical = {
    ScreenAccessPermission: function () {

    },
    Assessment: function (patientID, appointmentID) {

        LoadAddUpdateView('#divStartAssetment', '/Clinical/_partialStartAssessment', null, function () {
            $("#hf_PatientID").val(patientID);
            $("#hf_AppointmentID").val(appointmentID);
            $('#divStartAssetment').show();
            $('#divGrid').hide();
            ResetFormErrors("#frm_StartAssessment");
            $("#divExport").hide();

            clinical.showLeftMenu('demographics', '#general');
            Reload_ddl_GlobalWithPost(null, "#ddlAddCategory", "/AjaxCommon/GetCategoryMaster", {}, "Select", function () { $("#ddlAddCategory").select2(); });
            Reload_ddl_GlobalWithPost(null, "#ddlAddMaritalStatus", "/AjaxCommon/GetMaritalStatusMaster", {}, "Select", function () { $("#ddlAddMaritalStatus").select2(); });
            Reload_ddl_GlobalWithPost(null, "#ddlAddOccupation", "/AjaxCommon/GetOccupationMaster", {}, "Select", function () { $("#ddlAddOccupation").select2(); });

            Reload_ddl_GlobalWithPost(null, "#ddlAddStatus", "/AjaxCommon/GetStatusMaster", {}, "Select", function () { $("#ddlAddStatus").select2(); });
            $('.date-picker').datepicker({
                autoclose: true,
                todayHighlight: true,
                format: DateTimeDataFormat.ddMMyyyy
            });
            clinical.GetDemographicsData(patientID);
        });
    },  
    GetDemographicsData: function (PatientID) {
        GetAjaxData("/Clinical/GetClinicalDetailsByPatientId",
            { PatientID: PatientID, __RequestVerificationToken: token },
            function (data) {
                if (data && data.status === "Success") {
                    var res = data.data;
                    // ========================
                    // 👤 PATIENT DETAILS
                    // ========================
                    var patient = res.patient;
                    $("#lblViewName").text(patient.firstName + " " + patient.middleName + " " + patient.lastName);
                    $("#lblViewRegNo").text(patient.regNo);
                    var genderText = "";
                    switch (patient.gender) {
                        case "M": genderText = "Male";
                            break;
                        case "F": genderText = "Female";
                            break;
                        case "O": genderText = "Other";
                            break;
                    }
                    $("#lblViewGender").text(genderText);
                    $("#iconViewGender").removeClass().addClass("fa " + (patient.gender === "M" ? "fa-mars" : "fa-venus"));
                    if (patient.dob) {
                        var dob = new Date(patient.dob);
                        var age = new Date().getFullYear() - dob.getFullYear();
                        $("#lblViewAge").text(age);
                    }

                    $("#lblViewContact").text(patient.mobileNo);
                    $("#lblViewEmail").text(patient.emailID);
                    $("#txtViewDate").val(new Date().toISOString().split('T')[0]);
                    if (patient) {
                        $("#txtAddFirstName").val(patient.firstName);
                        $("#txtAddMiddleName").val(patient.middleName);
                        $("#txtAddLastName").val(patient.lastName);
                        $("#txtAddAddress").val(patient.address);
                        $("#txtAddMobile").val(patient.mobileNo);
                        $("#txtAddPhone").val(patient.telePhoneNo);
                        $("#txtAddEmail").val(patient.emailID);
                        $("#txtAddDOB").val(formatDateLocal(patient.dobCustom));
                        $("#ddlAddCategory").val(patient.categoryID).trigger("change");
                        $("#ddlAddStatus").val(patient.statusID).trigger("change");
                        $("#ddlAddOccupation").val(patient.occupationID).trigger("change");
                        $("#ddlAddMaritalStatus").val(patient.marritialStatusID).trigger("change");
                        $("input[name='AddGender'][value='" + patient.gender + "']").prop("checked", true);
                    }
                    // ========================
                    // 👨‍👩‍👧 NOK DETAILS
                    // ========================
                    var nokList = res.nokDetails;
                    if ($.fn.DataTable.isDataTable('#tblNOK')) { $('#tblNOK').DataTable().destroy(); }
                    $("#tblNOK tbody").empty();
                    if (nokList && nokList.length > 0) {
                        $("#Grid_Data_Template_tblNOK").tmpl(nokList).appendTo("#tblNOK tbody");
                        $('#tblNOK').DataTable({
                            paging: true,
                            searching: true,
                            ordering: true
                        });
                    } else {
                        var colCount = $("#tblNOK thead th").length;
                        $("#tblNOK tbody").append("<tr><td colspan='" + colCount + "' class='text-center'>No Records Found</td></tr>");
                    }
                    // ========================
                    // 🏥 OP DETAILS
                    // ========================
                    var opList = res.opDetails;
                    if ($.fn.DataTable.isDataTable('#tblOP')) { $('#tblOP').DataTable().destroy(); }
                    $("#tblOP tbody").empty();
                    if (opList && opList.length > 0) {
                        $("#Grid_Data_Template_tblOP").tmpl(opList).appendTo("#tblOP tbody");
                        $('#tblOP').DataTable({
                            paging: true,
                            searching: true,
                            ordering: true
                        });
                    } else {
                        var colCount = $("#tblOP thead th").length;
                        $("#tblOP tbody").append("<tr><td colspan='" + colCount + "' class='text-center'>No Records Found</td></tr>");
                    }
                    //// ========================
                    //// 🧠 INITIAL ASSESSMENT
                    //// ========================
                    //var initial = res.initialDetails;
                    //if (initial != null) {
                    //    $("#txtPC").summernote('code', initial.asS_PC || "");
                    //    $("#txtPC").summernote('disable');
                    //    $("#txtHPC").summernote('code', initial.asS_HPC || "");
                    //    $("#txtHPC").summernote('disable');
                    //    $("#txtPPH").summernote('code', initial.asS_PPH || "");
                    //    $("#txtPPH").summernote('disable');
                    //    $("#txtMH").summernote('code', initial.asS_MH || "");
                    //    $("#txtMH").summernote('disable');
                    //    $("#txtFH").summernote('code', initial.asS_FH || "");
                    //    $("#txtFH").summernote('disable');
                    //    $("#txtPH").summernote('code', initial.asS_PH || "");
                    //    $("#txtPH").summernote('disable');
                    //    $("#txtDAH").summernote('code', initial.asS_DAH || "");
                    //    $("#txtDAH").summernote('disable');
                    //    $("#txtFRH").summernote('code', initial.asS_FRH || "");
                    //    $("#txtFRH").summernote('disable');
                    //    $("#txtPMP").summernote('code', initial.asS_PMP || "");
                    //    $("#txtPMP").summernote('disable');
                    //    $("#txtMSE").summernote('code', initial.asS_MSE || "");
                    //    $("#txtMSE").summernote('disable');
                    //}
                    //clinical.loadAssessment("PN", res);
                    //clinical.loadAssessment("SCAN", res);
                    //clinical.loadAssessment("EEG", res);
                    //clinical.loadAssessment("OI", res);
                    //clinical.loadAssessment("DD", res);
                    //clinical.loadAssessment("MD", res);
                    //clinical.loadAssessment("RS", res);
                    //clinical.loadAssessment("RMP", res);
                    //// ========================
                    //// 🧠 PHYSICAL MONITORING ASSESSMENT
                    //// ========================
                    //clinical.RenderPhysicalMonitoring();
                    //let phmList = res.phmDetails;
                    //if (phmList && phmList.length > 0) {
                    //    phmList.forEach(item => {
                    //        let dateObj = new Date(item.asS_DATE);
                    //        let formattedDate = dateObj.getFullYear() + "/" + ("0" + (dateObj.getMonth() + 1)).slice(-2) + "/" + ("0" + dateObj.getDate()).slice(-2);
                    //        let hours = dateObj.getHours();
                    //        let minutes = ("0" + dateObj.getMinutes()).slice(-2);
                    //        let ampm = hours >= 12 ? "PM" : "AM";
                    //        hours = hours % 12;
                    //        hours = hours ? hours : 12;
                    //        let time = ("0" + hours).slice(-2) + ":" + minutes + " " + ampm;
                    //        let headerText = formattedDate + " - " + time;
                    //        clinical.AddColumnToTable(headerText);
                    //        let colIndex = $("#physicalTable thead th").length - 1;
                    //        $("#physicalTable tbody tr").each(function () {
                    //            let parameter = $(this).find("td:first").text().trim();
                    //            let input = $(this).find("td").eq(colIndex).find("input");
                    //            switch (parameter) {
                    //                case "BP (mm Hg)": input.val(item.bp); break;
                    //                case "Weight (Kg)": input.val(item.wt); break;
                    //                case "Body Mass Index (BMI)": input.val(item.bmi); break;
                    //                case "Diabetes": input.val(item.diabetes); break;
                    //                case "Cardiovascular Disease": input.val(item.cardiovas); break;
                    //                case "Waist circumference (inches)": input.val(item.waist); break;
                    //                case "Sodium, mmol/l (135-145)": input.val(item.sodium); break;
                    //                case "Potassium, mmol/l (3.4-5.0)": input.val(item.potassium); break;
                    //                case "Urea, mmol/l": input.val(item.urea); break;
                    //                case "Creatinine, umol/l": input.val(item.creatinine); break;
                    //                case "Blood glucose, mmol/l": input.val(item.glucose); break;
                    //                case "HbA1c (if diabetic)": input.val(item.hba1c); break;
                    //                case "Bilirubin, umol/l (0-19)": input.val(item.bilirubin); break;
                    //                case "Alk Phos, U/l (35-120)": input.val(item.alkphos); break;
                    //                case "ALT, U/l (0-40)": input.val(item.alt); break;
                    //                case "Albumin, g/l (34-50)": input.val(item.albumin); break;
                    //                case "Total protein, g/l (58-78)": input.val(item.protein); break;
                    //                case "Gamma-GT, U/l (0-50)": input.val(item.gamma); break;
                    //                case "TSH, mIU / l": input.val(item.tsh); break;
                    //                case "Free thyroxine": input.val(item.thyroxine); break;
                    //                case "Hb, g / dl": input.val(item.hb); break;
                    //                case "WBC": input.val(item.wbc); break;
                    //                case "Plt": input.val(item.plt); break;
                    //                case "Total cholesterol, mmol / l": input.val(item.tot_cholesterol); break;
                    //                case "HDL cholesterol, mmol / l": input.val(item.hdl_cholesterol); break;
                    //                case "Total / HDL - cholesterol ratio": input.val(item.tot_hdl_ratio); break;
                    //                case "Triglycerides, mmol / l": input.val(item.trigly); break;
                    //                case "10 - year CV risk score": input.val(item.cv_risk); break;
                    //                case "Urinalysis(glucose / protein)": input.val(item.urinalysis); break;
                    //                case "LUNSERS score": input.val(item.lunsers); break;
                    //                case "QTc interval, ms": input.val(item.qtc); break;
                    //                case "Prolactin(if symptoms)": input.val(item.prolactin); break;
                    //            }
                    //        });
                    //    });
                    //}
                } else {
                    alert("Failed to load data");
                }
            });
    },
    //loadAssessment: function (section, res) {
    //    let assessment = res.assessmentDetails.filter(x =>
    //        (x.ASS_FIELD || x.asS_FIELD) === section
    //    );
    //    let lastDate = "";
    //    let container = $("#div" + section + "timeline");
    //    if (assessment && assessment.length > 0) {
    //        container.empty().show();
    //        assessment.forEach(function (item) {
    //            let text = item.ASS_VALUE || item.asS_VALUE;
    //            let dateVal = item.ASS_DATE || item.asS_DATE;
    //            if (!text || !dateVal) return;
    //            let d = new Date(dateVal);
    //            let time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    //            let displayDate = clinical.formatDateLabel(d);
    //            if (lastDate !== displayDate) {
    //                container.append(`<div class="timelineRow dateRow">
    //                                    <div></div>
    //                                    <div class="timelineMiddle">
    //                                        <span class="timelineDateHeader">${displayDate}</span>
    //                                    </div>
    //                                    <div></div>
    //                                </div>`);
    //                lastDate = displayDate;
    //            }
    //            container.append(`<div class="timelineRow">
    //                                <div class="timelineTime">${time}</div>
    //                                <div class="timelineMiddle">
    //                                    <div class="timelineDot"></div>
    //                                </div>
    //                                <div class="timelineContent">
    //                                    <div class="timelineCard">${text}</div>
    //                                </div>
    //                            </div>`);
    //        });

    //    } else {
    //        container.empty().hide();
    //    }
    //},
    formatDateLabel: function (date) {
        let today = new Date();
        let yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);
        let diffTime = today - date;
        let diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        if (date.toDateString() === today.toDateString())
            return "Today";
        if (date.toDateString() === yesterday.toDateString())
            return "Yesterday";
        if (diffDays < 7) {
            return date.toLocaleDateString(undefined, { weekday: 'long' });
        }
        let dayName = date.toLocaleDateString(undefined, { weekday: 'long' });
        let day = date.getDate();
        let month = date.toLocaleDateString(undefined, { month: 'long' });
        let year = date.getFullYear();

        return `${dayName}, ${clinical.getOrdinal(day)} ${month} ${year}`;
    },
    getOrdinal: function (n) {
        let s = ["th", "st", "nd", "rd"],
            v = n % 100;
        return n + (s[(v - 20) % 10] || s[v] || s[0]);
    },
    SetForClose: function () {
        $('#divStartAssetment').hide();
        $('#divGrid').show();
        $("#divExport").show();
    },
    BindGrid: function () {

        var FormData = {
            RegNo: $('#txtRegno').val(),
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
        $('#txtRegno').val(''),
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

        var menus = group ? $(".menu-group." + group) : $();

        // 🔥 CHANGE HERE
        if (menus.length > 1) {

            // ✅ SHOW left menu
            $("#leftMenu").show();

            $("#rightContent")
                .removeClass("col-md-12")
                .addClass("col-md-10");

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

            // ❌ 0 OR 1 submenu → hide left menu
            $("#leftMenu").hide();

            $("#rightContent")
                .removeClass("col-md-10")
                .addClass("col-md-12");

            // 👉 if only one menu exists, auto open it
            if (menus.length === 1) {
                let target = menus.first().find("a").attr("href");
                $(".tab-pane").removeClass("active show");
                $(target).addClass("active show");
            }
            else if (targetId) {
                $(".tab-pane").removeClass("active show");
                $(targetId).addClass("active show");
            }
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
        if (!$.fn.DataTable.isDataTable('#' + tableId)) {
            console.error("DataTable not initialized");
            return;
        }
        var dt = $('#' + tableId).DataTable();
        var cols = clinical.getVisibleColumns();
        if (cols.length === 0) {
            dt.columns().every(function (i) {
                cols.push(i);
            });
        }
        var excel = '<table border="1"><thead><tr>';
        dt.columns().every(function (i) {

            var headerText = $(this.header()).text().trim();

            if (cols.indexOf(i) !== -1 && headerText !== "Assessment") {
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
                    if (cols.indexOf(i) !== -1 && headerText !== "Assessment") {
                        var cellData = $('<div>').html(row[i]).text();
                        excel += '<td>' + cellData + '</td>';
                    }
                }
            }
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
    },
    //InitialAssestmentData
    openInitialsTab: function (type, group, targetId) {

        // 1. Show left menu (your existing logic)
        clinical.showLeftMenu(group, targetId);

        // 2. Activate tab manually (important)
        $('.nav-tabs a[href="' + targetId + '"]').tab('show');

        // 3. Call API (lazy load)
        clinical.GetInitialData(type);
    },
    GetInitialData: function (Section) {
        var patientID = $("#hf_PatientID").val();
        GetAjaxData("/Clinical/GetClinicalInitailsDetailsByPatientID",
            { PatientID: patientID, Ass_value: Section, __RequestVerificationToken: token },
            function (data) {
                if (data && data.status === "Success") {
                    var res = data.data;
                    var initial = res.initialDetails;
                    if (initial && initial.length > 0) {
                        var value = initial.asS_Value || "";
                        $("#txt" + Section).summernote('code', value);
                        $("#txt" + Section).summernote('disable');
                    }
                }
                else {
                    alert("Failed to load data");
                }
            });
    },
    AddSection: function (section) {
        let $txt = $("#txt" + section);
        $("#div" + section + "Action").show();
        $("#btnAdd" + section).hide();
        $txt.prop("readonly", false).focus();
        // ✅ Initialize Summernote ONLY if not already initialized
        if (!$txt.next().hasClass('note-editor')) {
            $txt.summernote({
                height: 200,
                dialogsInBody: true,
                toolbar: [
                    ['style', ['bold', 'italic', 'underline']],
                    ['font', ['fontsize', 'fontname']],
                    ['color', ['color']],
                    ['para', ['ul', 'ol', 'paragraph']]
                    // ❌ removed link, image, video, code, help
                ]
            });
        }
        // ✅ Enable editing
        $txt.summernote('enable');
    },
    CloseSection: function (section) {
        let $txt = $("#txt" + section);
        $("#div" + section + "Action").hide();
        $("#btnAdd" + section).show();
        $txt.prop("readonly", true).css("background-color", "#ddd");
        $txt.summernote('disable');
    },
    GetInitialSectionData: function (section) {
        let data = {
            PAT_ID: $("#hf_PatientID").val(),
            LAST_UPDATED_BY: UserID
        };
        data["ASS_" + section] = $("#txt" + section).summernote('code');
        return data;
    },
    ValidateInitialSectionData: function (section, data) {
        if (!data.PAT_ID || data.PAT_ID == 0) {
            showSweetAlert("Error", "Invalid Patient", "error");
            return false;
        }
        if (!data["ASS_" + section]) {
            showSweetAlert("Error", section + " is required", "error");
            return false;
        }
        return true;
    },
    SaveSection: function (section) {
        Reset_Form_Errors();
        var FormData = clinical.GetInitialSectionData(section);
        if (clinical.ValidateInitialSectionData(section, FormData)) {
            AddUpdateData("/Clinical/SaveInitialDetails", { Model: FormData, __RequestVerificationToken: token },
                function (data) {
                    if (data.status === true || data.status === 'Success') {
                        showSweetAlert("Success", data.message, 'success', null);
                        clinical.CloseSection(section);
                    }
                    else {
                        showSweetAlert("Failed", data.message, 'error', null);
                    }
                },
                function (response_data) {
                    showSweetAlert("Error", response_data.message || "Something went wrong", 'error', null);
                }
            );
        }
    },
    //Pending
    SaveQuickInfo: function () {

    },
    CloseQuickInfo: function () {

    },
    // AssessmentData
    openAssessmentTab: function (type, group, targetId) {

        // 1. Show left menu (your existing logic)
        clinical.showLeftMenu(group, targetId);

        // 2. Activate tab manually (important)
        $('.nav-tabs a[href="' + targetId + '"]').tab('show');

        // 3. Call API (lazy load)
        var FilterType = $("#ddlAssetmentFiler").val();
        clinical.GetAssetment(type, FilterType);
    },
    GetAssetment: function (Section, FilterType) {
        var patientID = $("#hf_PatientID").val();
        GetAjaxData("/Clinical/GetClinicalAssetmentsDetailsByPatientID",
            { PatientID: patientID, Ass_value: Section, filterType: FilterType, __RequestVerificationToken: token },
            function (data) {
                if (data && data.status === "Success") {
                    var res = data.data;
                    var assessment = res.assessmentDetails;
                    let lastDate = "";
                    let container = $("#div" + Section + "timeline");
                    if (assessment && assessment.length > 0) {
                        container.empty().show();
                        assessment.forEach(function (item) {
                            let text = item.ASS_VALUE || item.asS_VALUE;
                            let dateVal = item.ASS_DATE || item.asS_DATE;
                            if (!text || !dateVal) return;
                            let d = new Date(dateVal);
                            let time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                            let displayDate = clinical.formatDateLabel(d);
                            if (lastDate !== displayDate) {
                                container.append(`<div class="timelineRow dateRow">
                                        <div></div>
                                        <div class="timelineMiddle">
                                            <span class="timelineDateHeader">${displayDate}</span>
                                        </div>
                                        <div></div>
                                    </div>`);
                                lastDate = displayDate;
                            }
                            container.append(`<div class="timelineRow">
                                    <div class="timelineTime">${time}</div>
                                    <div class="timelineMiddle">
                                        <div class="timelineDot"></div>
                                    </div>
                                    <div class="timelineContent">
                                        <div class="timelineCard">${text}</div>
                                    </div>
                                </div>`);
                        });

                    } else {
                        container.empty().hide();
                    }
                }
                else {
                    alert("Failed to load data");
                }
            });
    },
    AddAssetmentSection: function (section) {
        let $txt = $("#txt" + section);
        $("#div" + section + "Panel").show();
        $("#div" + section + "Action").show();
        $("#div" + section + "timeline").hide();
        $("#btnAdd" + section).hide();
        $txt.prop("readonly", false).val("").focus();

        // ✅ Initialize Summernote ONLY if not already initialized
        if (!$txt.next().hasClass('note-editor')) {
            $txt.summernote({
                height: 200,
                dialogsInBody: true,
                toolbar: [
                    ['style', ['bold', 'italic', 'underline']],
                    ['font', ['fontsize', 'fontname']],
                    ['color', ['color']],
                    ['para', ['ul', 'ol', 'paragraph']]
                    // ❌ removed link, image, video, code, help
                ]
            });
        }
    },
    CloseAssetmentSection: function (section) {
        let $txt = $("#txt" + section);
        $("#div" + section + "Panel").hide();
        $("#div" + section + "timeline").show();
        $("#div" + section + "Action").hide();
        $("#btnAdd" + section).show();
        $txt.val("");
        // ✅ Destroy Summernote
        if ($txt.next().hasClass('note-editor')) {
            $txt.summernote('destroy');
        }

    },
    GetAssetmentSectionData: function (section) {
        let dateVal = $("#txtViewDate").val();
        let now = new Date();
        let hours = String(now.getHours()).padStart(2, '0');
        let minutes = String(now.getMinutes()).padStart(2, '0');
        let seconds = String(now.getSeconds()).padStart(2, '0');
        let finalDateTime = `${dateVal} ${hours}:${minutes}:${seconds}`;
        return {
            PAT_ID: $("#hf_PatientID").val(),
            APPT_ID: $("#hf_AppointmentID").val() || null,
            ASS_DATE: finalDateTime,
            ASS_FIELD: section,
            ASS_VALUE: $("#txt" + section).val(),
            LAST_UPDATED_BY: UserID
        };
    },
    ValidateSectionData: function (section, data) {
        if (!data.PAT_ID || data.PAT_ID == 0) {
            showSweetAlert("Error", "Invalid Patient", "error");
            return false;
        }
        if (!data.ASS_VALUE || data.ASS_VALUE.trim() === "") {
            showSweetAlert("Error", section + " is required", "error");
            return false;
        }
        return true;
    },
    SaveAssetmentSection: function (section) {
        Reset_Form_Errors();
        var FormData = clinical.GetAssetmentSectionData(section);
        if (clinical.ValidateSectionData(section, FormData)) {
            AddUpdateData("/Clinical/SaveAssessmentDetails", { Model: FormData, __RequestVerificationToken: token },
                function (data) {
                    if (data.status === true || data.status === 'Success') {
                        showSweetAlert("Success", data.Message || data.message, 'success', null);
                        clinical.GetAssetment(section);
                        clinical.CloseAssetmentSection(section);
                    } else {
                        showSweetAlert("Failed", data.Message || data.message, 'error', null);
                    }
                },
                function (response_data) { showSweetAlert("Error", response_data.message || "Something went wrong", 'error', null); }
            );
        }
    },
    //AssessmentPHMData
    RenderPhysicalMonitoring: function () {

        let parameters = [
            { text: "Diabetes", key: "diabetes" },
            { text: "Cardiovascular Disease", key: "cardiovas" },
            { text: "Weight (Kg)", key: "wt" },
            { text: "Body Mass Index (BMI)", key: "bmi" },
            { text: "Waist circumference (inches)", key: "waist" },
            { text: "BP (mm Hg)", key: "bp" },
            { text: "Sodium, mmol/l (135-145)", key: "sodium" },
            { text: "Potassium, mmol/l (3.4-5.0)", key: "potassium" },
            { text: "Urea, mmol/l", key: "urea" },
            { text: "Creatinine, umol/l", key: "creatinine" },
            { text: "Blood glucose, mmol/l", key: "glucose" },
            { text: "HbA1c (if diabetic)", key: "hba1c" },
            { text: "Bilirubin, umol/l (0-19)", key: "bilirubin" },
            { text: "Alk Phos, U/l (35-120)", key: "alkphos" },
            { text: "ALT, U/l (0-40)", key: "alt" },
            { text: "Albumin, g/l (34-50)", key: "albumin" },
            { text: "Total protein, g/l (58-78)", key: "protein" },
            { text: "Gamma-GT, U/l (0-50)", key: "gamma" },
            { text: "TSH, mIU / l", key: "tsh" },
            { text: "Free thyroxine", key: "thyroxine" },
            { text: "Hb, g / dl", key: "hb" },
            { text: "WBC", key: "wbc" },
            { text: "Plt", key: "plt" },
            { text: "Total cholesterol, mmol / l", key: "tot_cholesterol" },
            { text: "HDL cholesterol, mmol / l", key: "hdl_cholesterol" },
            { text: "Total / HDL - cholesterol ratio", key: "tot_hdl_ratio" },
            { text: "Triglycerides, mmol / l", key: "trigly" },
            { text: "10 - year CV risk score", key: "cv_risk" },
            { text: "Urinalysis(glucose / protein)", key: "urinalysis" },
            { text: "LUNSERS score", key: "lunsers" },
            { text: "QTc interval, ms", key: "qtc" },
            { text: "Prolactin(if symptoms)", key: "prolactin" }
        ];

        let rows = "";

        parameters.forEach(p => {
            rows += `
            <tr>
                <td class="sticky-col" data-key="${p.key}">${p.text}</td>
            </tr>
        `;
        });

        $("#physicalTableBody").html(rows);
    },
    AddColumnToTable: function (headerText) {
        let table = $("#physicalTable");
        let scrollContainer = $(".table-scroll-x");
        table.find("thead tr").append(
            `<th class="text-center">${headerText}</th>`
        );
        table.find("tbody tr").each(function () {
            $(this).append(`<td class="text-center">
            <input type="text" class="form-control valueCellInput" />
        </td>`);
        });
        clinical.applyStickyColumn();
        setTimeout(function () {
            scrollContainer.animate({
                scrollLeft: scrollContainer[0].scrollWidth
            }, 400);
        }, 100);
        $("#btnClearPhysicalMonitoring").show();
        $("#btnSavePHM").show();
    },
    AddPhysicalMonitoring: function () {

        let table = $("#physicalTable");

        let selectedDate = new Date($("#txtViewDate").val());

        let formattedDate =
            selectedDate.getFullYear() + "/" +
            ("0" + (selectedDate.getMonth() + 1)).slice(-2) + "/" +
            ("0" + selectedDate.getDate()).slice(-2);

        let now = new Date();
        let hours = now.getHours();
        let minutes = ("0" + now.getMinutes()).slice(-2);
        let ampm = hours >= 12 ? "PM" : "AM";

        hours = hours % 12;
        hours = hours ? hours : 12;

        let currentTime = ("0" + hours).slice(-2) + ":" + minutes + " " + ampm;

        let headerText = formattedDate + " - " + currentTime;

        let exists = false;

        table.find("thead th").each(function () {
            if ($(this).text().trim() === headerText) {
                exists = true;
                return false;
            }
        });

        if (exists) {
            showSweetAlert("Warning", headerText + " already added", "warning");
            return;
        }

        columnCount++;
        clinical.AddColumnToTable(headerText);
    },
    applyStickyColumn: function () {
        $("#physicalTable thead th:first-child").addClass("sticky-col");
        $("#physicalTable tbody tr").each(function () {
            $(this).find("td:first-child").addClass("sticky-col");
        });
    },
    ClearPhysicalMonitoring: function () {
        if (!confirm("Are you sure you want to remove last entry?"))
            return;
        let table = $("#physicalTable");
        let totalCols = table.find("thead tr th").length;
        if (totalCols <= 1) {
            alert("No columns to remove");
            return;
        }
        table.find("thead tr th:last").remove();
        table.find("tbody tr").each(function () {
            $(this).find("td:last").remove();
        });
        columnCount--;
        let remainingCols = table.find("thead tr th").length;
        if (remainingCols <= 1) {
            $("#btnClearPhysicalMonitoring").hide();
            $("#btnSavePHM").hide();
        }
    },
    GetPHMData: function () {
        let table = $("#physicalTable");
        let dataList = [];
        let headers = [];
        table.find("thead th:not(:first)").each(function () {
            headers.push($(this).text().trim());
        });
        headers.forEach((headerText, colIndex) => {

            let model = {
                PAT_ID: parseInt($("#hf_PatientID").val()),
                APPT_ID: $("#hf_AppointmentID").val() || null,
                LAST_UPDATED_BY: UserID
            };

            let hasValue = false;

            let parts = headerText.split(" - ");
            let date = parts[0].replaceAll("/", "-");
            let time = parts[1];

            model.ASS_DATE = date + " " + clinical.convertTo24Hour(time);

            $("#physicalTable tbody tr").each(function () {

                let parameter = $(this).find("td:first").text().trim();
                let value = $(this).find("td").eq(colIndex + 1).find("input").val();

                if (!value) return;

                hasValue = true; // ✅ mark row has data

                switch (parameter) {
                    case "BP (mm Hg)": model.BP = value; break;
                    case "Weight (Kg)": model.WT = value; break;
                    case "Body Mass Index (BMI)": model.BMI = value; break;
                    case "Diabetes": model.DIABETES = value; break;
                    case "Cardiovascular Disease": model.CARDIOVAS = value; break;
                    case "Waist circumference (inches)": model.WAIST = value; break;
                    case "Sodium, mmol/l (135-145)": model.SODIUM = value; break;
                    case "Potassium, mmol/l (3.4-5.0)": model.POTASSIUM = value; break;
                    case "Urea, mmol/l": model.UREA = value; break;
                    case "Creatinine, umol/l": model.CREATININE = value; break;
                    case "Blood glucose, mmol/l": model.GLUCOSE = value; break;
                    case "HbA1c (if diabetic)": model.HBA1C = value; break;
                    case "Bilirubin, umol/l (0-19)": model.BILIRUBIN = value; break;
                    case "Alk Phos, U/l (35-120)": model.ALKPHOS = value; break;
                    case "ALT, U/l (0-40)": model.ALT = value; break;
                    case "Albumin, g/l (34-50)": model.ALBUMIN = value; break;
                    case "Total protein, g/l (58-78)": model.PROTEIN = value; break;
                    case "Gamma-GT, U/l (0-50)": model.GAMMA = value; break;
                    case "TSH, mIU / l": model.TSH = value; break;
                    case "Free thyroxine": model.THYROXINE = value; break;
                    case "Hb, g / dl": model.HB = value; break;
                    case "WBC": model.WBC = value; break;
                    case "Plt": model.PLT = value; break;
                    case "Total cholesterol, mmol / l": model.TOT_CHOLESTEROL = value; break;
                    case "HDL cholesterol, mmol / l": model.HDL_CHOLESTEROL = value; break;
                    case "Total / HDL - cholesterol ratio": model.TOT_HDL_RATIO = value; break;
                    case "Triglycerides, mmol / l": model.TRIGLY = value; break;
                    case "10 - year CV risk score": model.CV_RISK = value; break;
                    case "Urinalysis(glucose / protein)": model.URINALYSIS = value; break;
                    case "LUNSERS score": model.LUNSERS = value; break;
                    case "QTc interval, ms": model.QTC = value; break;
                    case "Prolactin(if symptoms)": model.PROLACTIN = value; break;
                }
            });

            if (hasValue) {
                dataList.push(model); // ✅ only valid rows
            }
        });
        return dataList;
    },
    convertTo24Hour: function (time12h) {
        let [time, modifier] = time12h.split(' ');
        let [hours, minutes] = time.split(':');
        if (modifier === 'PM' && hours !== '12') {
            hours = parseInt(hours) + 12;
        }
        if (modifier === 'AM' && hours === '12') {
            hours = '00';
        }
        return `${hours}:${minutes}:00`;
    },
    SaveAssetmentPHMData: function () {
        let dataList = clinical.GetPHMData();
        if (!dataList || dataList.length === 0) {
            showSweetAlert("Error", "No data to save", "error");
            return;
        }
        console.log(dataList)
        let formData = {};

        dataList.forEach((item, i) => {
            for (let key in item) {
                formData[`Model[${i}].${key}`] = item[key];
            }
        });
        console.log(formData)
        $.ajax({
            url: "/Clinical/SaveAssessmentPHM",
            type: "POST",

            data: formData,   // ✅ correct format
            traditional: true,   // 🔥 MUST
            headers: {
                'RequestVerificationToken': token   // ✅ token in header
            },


            success: function (res) {
                if (res.status === true) {
                    showSweetAlert("Success", res.message, 'success');
                    clinical.GetPHM();
                } else {
                    showSweetAlert("Failed", res.Message, 'error');
                }
            },
            error: function (err) {
                showSweetAlert("Error", "Something went wrong", 'error');
            }
        });
    },
    openPHMTab: function (group, targetId) {

        // 1. Show left menu
        clinical.showLeftMenu(group, targetId);

        // 2. Activate tab
        $('.nav-tabs a[href="' + targetId + '"]').tab('show');
        var FilterType = $("#ddlAssetmentFiler").val();
        // 3. Call PHM API
        clinical.GetPHM(FilterType);
    },
    GetPHM: function (FilterType) {
        // Step 1: Reset table
        $("#physicalTable thead tr").html('<th class="sticky-col">Parameter</th>');
        clinical.RenderPhysicalMonitoring();
        var patientID = $("#hf_PatientID").val();
        GetAjaxData("/Clinical/GetClinicalPHMDetailsByPatientID",
            { PatientID: patientID, filterType: FilterType, __RequestVerificationToken: token },
            function (data) {

                if (data && data.status === "Success") {

                    var phmList = data.data.phmDetails;

                    if (phmList && phmList.length > 0) {

                        phmList.forEach(item => {

                            // 👉 Create header
                            let dateObj = new Date(item.asS_DATE);

                            let formattedDate =
                                dateObj.getFullYear() + "/" +
                                ("0" + (dateObj.getMonth() + 1)).slice(-2) + "/" +
                                ("0" + dateObj.getDate()).slice(-2);

                            let hours = dateObj.getHours();
                            let minutes = ("0" + dateObj.getMinutes()).slice(-2);
                            let ampm = hours >= 12 ? "PM" : "AM";

                            hours = hours % 12 || 12;

                            let time = ("0" + hours).slice(-2) + ":" + minutes + " " + ampm;

                            let headerText = formattedDate + " - " + time;

                            // 👉 Add column
                            clinical.AddColumnToTable(headerText);

                            let colIndex = $("#physicalTable thead th").length - 1;

                            // 👉 Bind data
                            $("#physicalTable tbody tr").each(function () {

                                let key = $(this).find("td:first").data("key");
                                let input = $(this).find("td").eq(colIndex).find("input");

                                input.val(item[key] || "");
                            });
                        });
                    }
                }
                else {
                    alert("Failed to load data");
                }
            });
    },
}
