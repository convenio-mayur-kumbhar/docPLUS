var BindDataTableRowCount = 0;

var dataColors = {
    0: "#91A8D0", 1: "#7F4145", 2: "#BD3D3A", 3: "#D5AE41", 4: "#E47A2E", 5: "#009B77", 6: "#D1B894", 7: "#EC9787", 8: "#672E3B", 9: "#92B6D5",
    10: "#006E51", 11: "#98DDDE", 12: "#6B5B95", 13: "#B18F6A", 14: "#F7CAC9", 15: "#92A8D1", 16: "#D65076", 17: "#006E6D", 18: "#C3447A", 19: "#98B4D4"
};

/* Use For Json in check record exist or not */
var jsonHasKeyVal = function (json, keyname, value) {
    var valid = Object.keys(json).some(function (key) {
        typeof json[key] === 'object' ? jsonHasKeyVal(json[key], keyname, value) : key === keyname && json[key] === value;
    });
    return valid;
};

/* use for language wise Date piker*/
var InspectionColors = { Controlled: '#008000', NotControlled: '#FF0000', Future: '#FFA500', RiskMatrix: '#e43f3f', Controls: '#2a8a65' };
var color = { Controlled: '#008000', NotControlled: '#FF0000', Future: '#FFA500', RiskMatrix: '#e43f3f', Controls: '#2a8a65' };

var FullMonth = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

var Month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
var CommonDayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
var CommonDayShortName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];


/*Is Deviation Responce Required use for hide show designation and department */
var GlobaleIsGroupRequired = 'IsGroupRequired';
var GlobaleIsDevRespRequired = 'IsDevRespRequired';

var CommonTodayDate = new Date();
var CommonTodayDate1 = new Date();
/*  Current Month 1st day and last day */
var CommonFirstDay = new Date(CommonTodayDate.getFullYear(), CommonTodayDate.getMonth(), 1);
var CommonLastDay = new Date(CommonTodayDate.getFullYear(), CommonTodayDate.getMonth() + 1, 0);

/*  Current Year 1st day and last day */
var CurrentYearFirstDay = new Date(CommonTodayDate.getFullYear(), 0, 1);
var CurrentYearLastDay = new Date(CommonTodayDate.getFullYear(), 11, 31);

/* Added By Sagar */
/* Current Week 1st day */

var Weekstart = new Date(CommonTodayDate1.setDate(CommonTodayDate.getDate() - CommonTodayDate.getDay() + 1));

$.fn.hasAttr = function (name) {
    return this.attr(name) !== undefined;
};
/*jQuery.ajaxSettings.traditional = true;*/

/*Ajax Helpers start*/
function CommaFormatted(amount) {

    if (amount > 0) {
        var delimiter = ",";
        var Amount = amount + '.00';
        var a = Amount.split('.', 2)
        var d = a[1];
        var i = parseInt(a[0]);
        if (isNaN(i)) { return ''; }
        var minus = '';
        if (i < 0) { minus = '-'; }
        i = Math.abs(i);
        var n = new String(i);
        var a = [];
        while (n.length > 3) {
            var nn = n.substr(n.length - 3);
            a.unshift(nn);
            n = n.substr(0, n.length - 3);
        }
        if (n.length > 0) { a.unshift(n); }
        n = a.join(delimiter);
        if (d.length < 1) { amount = n; }
        else { amount = n + '.' + d; }
        amount = minus + amount;
    }

    return amount;
}

function SetddlItem(controlID, length, value) {

    if (length === 1 && value == null) {

        if ($(controlID + " option:first").val() == '' || $(controlID + " option:first").val() == "" ||
            $(controlID + " option:first").val() == null) {

            $(controlID + " option:first").remove();
        }
        /*set default element*/
        $(controlID).val($(controlID + " option:first").val());

    } else if (value != null)
        $(controlID).val(value);
}

function Clear_ddl_Global(ddlID, DefaultLabel) {
    if (DefaultLabel == null || DefaultLabel == "")
        DefaultLabel = Select;
    $(ddlID).empty().html("<option value>" + DefaultLabel + "</option>");
}

function FrequencyWiseColor(Frequency) {

    var ColorCode = "";

    if (Frequency == 'MT')
        ColorCode = '#ff4d4d';  //light red
    else if (Frequency == 'QR')
        ColorCode = '#FFA500';  //Orange
    else if (Frequency == 'SA')
        ColorCode = '#0000FF';  //Blue
    else if (Frequency == 'YR' || Frequency == '2Y' || Frequency == '3Y' || Frequency == '4Y' || Frequency == '5Y')
        ColorCode = '#008000';  //Green
    else
        ColorCode = '#808080';  //Gray

    return ColorCode;
}

function Clear_ddl_Globalmultiselect(ddlID, DefaultLabel) {
    $(ddlID).empty().html("<option value>" + DefaultLabel + "</option>");
}

function Clear_ddl_Global2(ddlID, DefaultLabel) {
    if (DefaultLabel == null || DefaultLabel == "")
        DefaultLabel = "Select";
    $(ddlID).empty().html("<option value='' style='text-align: left;'>" + DefaultLabel + "</option>");
    /*$(ddlID).html("<option value=''>" + DefaultLabel + "</option>");*/
}

function Reload_ddl_GlobalWithPost(xhr, ddlID, AjaxURL, AjaxData, DefaultLabel, callback) {

    if (xhr && xhr.readystate != 4)
        xhr.abort();

    $(ddlID).html("").empty();

    if ($(ddlID).has('option').length === 0) {

        xhr = $.ajax({
            type: "POST", cache: false, url: AjaxURL, data: AjaxData,
            /*url: AjaxURL, traditional: true, cache: false, data: AjaxData,*/
            success: function (data) {
                if (data != null && data.status == "Success") {

                    var items = eval(data.data);

                    if (DefaultLabel != null && DefaultLabel != '')
                        $(ddlID).html("<option value=''>" + DefaultLabel + "</option>");

                    for (var i = 0; i < items.length; i++)
                        if ($(ddlID + " option[value='" + items[i].value + "']").length === 0)
                            $(ddlID).append("<option  value='" + items[i].value + "' " + (items[i].Selected == true ? "selected='selected'" : "") + ">" + items[i].text + "</option>");

                    /*$(ddlID).change(); Fire the change event to initiate chained items.*/
                    if (callback && typeof (callback) === "function")
                        callback(data);
                } else
                    showSweetAlert("Error!", data.message, "error", null);
            }
        });
    }
}

function Reload_ddl_Global(xhr, ddlID, AjaxURL, AjaxData, DefaultLabel, callback) {    if (xhr && xhr.readystate != 4)        xhr.abort();    $(ddlID).html("").empty();    if ($(ddlID).has('option').length === 0) {        xhr = $.ajax({            url: AjaxURL, traditional: true, cache: false, data: AjaxData,            success: function (data) {                if (data != null && data.status == "Success") {                    var items = eval(data.data);                    if (DefaultLabel != null && DefaultLabel != '')                        $(ddlID).html("<option value=''>" + DefaultLabel + "</option>");                    for (var i = 0; i < items.length; i++)                        if ($(ddlID + " option[value='" + items[i].value + "']").length === 0)                            $(ddlID).append("<option  value='" + items[i].value + "' " + (items[i].Selected == true ? "selected='selected'" : "") + ">" + items[i].text + "</option>");                    /* Author: Sagar Date: 3-OCT-2019                      Comment: If DDL Has Only One Option It Will Be Selected By Default */                    //if (IsNotNull(items))                    //    if (items.length === 1)                    //        $(ddlID).val(items[0].value);                    /*$(ddlID).change(); Fire the change event to initiate chained items.*/                    if (callback && typeof (callback) === "function")                        callback(data);                } else                    showSweetAlert("Error!", data.message, "error", null);            }        });    }}

function Reload_ddl_GlobalCustom(xhr, ddlID, AjaxURL, AjaxData, DefaultLabel, PreCallback, callback) {

    if (xhr && xhr.readystate != 4)
        xhr.abort();

    $(ddlID).html("").empty();

    if ($(ddlID).has('option').length === 0) {

        xhr = $.ajax({
            url: AjaxURL, traditional: true, cache: false, data: AjaxData,
            success: function (data) {
                if (data != null && data.status == "Success") {

                    if (DefaultLabel != null && DefaultLabel != '')
                        $(ddlID).html("<option value=''>" + DefaultLabel + "</option>");

                    var items = eval(data.data);

                    if (PreCallback && typeof (PreCallback) === "function")
                        items = PreCallback(items);

                    for (var i = 0; i < items.length; i++)
                        if ($(ddlID + " option[value='" + items[i].Value + "']").length === 0)
                            $(ddlID).append("<option  value='" + items[i].Value + "' " + (items[i].Selected == true ? "selected='selected'" : "") + ">" + items[i].Text + "</option>");

                    /*$(ddlID).change(); Fire the change event to initiate chained items.*/

                    if (callback && typeof (callback) === "function")
                        callback();
                } else
                    showSweetAlert("Error!", data.message, "error", null);
            }
        });
    }
}

function Reload_ddl_GlobalCustomWithDataID(xhr, ddlID, AjaxURL, AjaxData, DefaultLabel, PreCallback, callback) {

    if (xhr && xhr.readystate != 4)
        xhr.abort();

    $(ddlID).html("");
    $(ddlID).empty();

    if ($(ddlID).has('option').length === 0) {

        xhr = $.ajax({
            url: AjaxURL,
            traditional: true,
            cache: false,
            data: AjaxData,
            /*dataType: "application/json",*/
            success: function (data) {
                if (data != null && data.status == "Success") {

                    if (DefaultLabel != null && DefaultLabel != '')
                        $(ddlID).html("<option value=''>" + DefaultLabel + "</option>");

                    var items = eval(data.data);
                    if (PreCallback && typeof (PreCallback) === "function")
                        items = PreCallback(items);

                    for (var i = 0; i < items.length; i++)
                        if ($(ddlID + " option[value='" + items[i].Value + "']").length === 0)
                            $(ddlID).append("<option value='" + items[i].Value + "' data-id='" + items[i].CategoryID + "' " + (items[i].Selected == true ? "selected='selected'" : "") + ">" + items[i].Text + "</option>");

                    /*$(ddlID).change(); Fire the change event to initiate chained items.*/

                    if (callback && typeof (callback) === "function")
                        callback();

                } else
                    showSweetAlert("Error!", data.message, "error", null);
            }
        });
    }
}

function Reload_ddl_GlobalStatic(ddlID, TypeOrJsonData, DefaultLabel, callback) {

    $(ddlID).html("").empty();
    var ItemJsonList = "";

    switch (TypeOrJsonData) {
        case "Language": { ItemJsonList = ConfigurationData_LanguageList(); break; }
        case "Module": { ItemJsonList = ConfigurationData_ModuleList(); break; }
        case "ModuleAll": { ItemJsonList = ConfigurationData_ModuleListAll(); break; }
        case "Country": { ItemJsonList = ConfigurationData_CountryList(); break; }
        case "ServiceLine": { ItemJsonList = ConfigurationData_ServiceLineList(); break; }
        case "TimeUnit": { ItemJsonList = ConfigurationData_TimeUnitList(); break; }
        case "RiskLevel": { ItemJsonList = ConfigurationData_RiskLevelList(); break; }
        case "SeverityLevel": { ItemJsonList = ConfigurationData_SeverityLevelList(); break; }
        case "PriorityLevel": { ItemJsonList = ConfigurationData_PriorityLevelList(); break; }
        case "AttributeType": { ItemJsonList = ConfigurationData_AttributeTypeList(); break; }
        case "InspectionType": { ItemJsonList = ConfigurationData_InspectionTypeList(); break; }
        case "FRASInpectionType": { ItemJsonList = ConfigurationData_FRASInspectionTypeList(); break; }
        case "ServiceLevel": { ItemJsonList = ConfigurationData_ServiceLevelList(); break; }
        case "ConfigurationCode": { ItemJsonList = ConfigurationData_ConfigurationCodeList(); break; }
        default: { ItemJsonList = TypeOrJsonData; break; }
    }

    if (ItemJsonList.length > 0) {

        if (DefaultLabel != null && DefaultLabel != '')
            $(ddlID).html("<option value=''>" + DefaultLabel + "</option>");

        $.each(ItemJsonList, function (i, item) {
            if ($(ddlID + " option[value='" + item.Value + "']").length === 0)
                $(ddlID).append("<option value='" + item.Value + "'>" + item.Text + "</option>");
        });

        if (callback && typeof (callback) === "function")
            callback(ItemJsonList);
    } else {
        if (DefaultLabel != "" && DefaultLabel != null) {
            $(ddlID).html("<option value=''>" + DefaultLabel + "</option>");
        }
    }
}

function Reload_ddl_GlobalGroupStatic(ddlID, TypeOrJsonData, DefaultLabel, GroupArray, callback) {

    $(ddlID).html("").empty();
    var ItemJsonList = "";

    /*switch (TypeOrJsonData) {
        case "Language": { ItemJsonList = ConfigurationData_LanguageList(); break; }
        case "Module": { ItemJsonList = ConfigurationData_ModuleList(); break; }
        case "ModuleAll": { ItemJsonList = ConfigurationData_ModuleListAll(); break; }
        case "Country": { ItemJsonList = ConfigurationData_CountryList(); break; }
        case "ServiceLine": { ItemJsonList = ConfigurationData_ServiceLineList(); break; }
        case "TimeUnit": { ItemJsonList = ConfigurationData_TimeUnitList(); break; }
        case "RiskLevel": { ItemJsonList = ConfigurationData_RiskLevelList(); break; }
        case "SeverityLevel": { ItemJsonList = ConfigurationData_SeverityLevelList(); break; }
        case "AttributeType": { ItemJsonList = ConfigurationData_AttributeTypeList(); break; }
        case "InspectionType": { ItemJsonList = ConfigurationData_InspectionTypeList(); break; }
        case "FRASInpectionType": { ItemJsonList = ConfigurationData_FRASInspectionTypeList(); break; }
        case "ServiceLevel": { ItemJsonList = ConfigurationData_ServiceLevelList(); break; }
        case "ConfigurationCode": { ItemJsonList = ConfigurationData_ConfigurationCodeList(); break; }
        default: { ItemJsonList = TypeOrJsonData; break; }
    }*/
    ItemJsonList = TypeOrJsonData;

    if (ItemJsonList.length > 0) {

        if (DefaultLabel != null && DefaultLabel != '')
            $(ddlID).html("<option value=''>" + DefaultLabel + "</option>");

        if (GroupArray.length > 0) {

            $.each(GroupArray, function (j, item2) {
                $(ddlID).append("<optgroup label='" + item2 + "'></optgroup>");

                $.each(ItemJsonList, function (i, item) {

                    if (item.GlobalID == item2) {
                        if ($(ddlID + " option[value='" + item.Value + "']").length === 0)
                            $(ddlID + " optgroup[label='" + item2 + "']").append("<option value='" + item.Value + "'>" + item.Text + "</option>");
                    }
                });

            });
        }

        if (callback && typeof (callback) === "function")
            callback(ItemJsonList);
    } else {
        if (DefaultLabel != "" && DefaultLabel != null) {
            $(ddlID).html("<option value=''>" + DefaultLabel + "</option>");
        }
    }
}

function DualListBoxShiftAtoB(ddlSourseID, ddlDestinationID, IsSourseDelete) {
    var thevalue = $(ddlSourseID).val();

    if (thevalue[0] != null && thevalue[0] != "") {
        if (!(0 != $(ddlDestinationID + " option[value='" + thevalue[0] + "']").length)) {
            $(ddlDestinationID).append("<option value='" + thevalue[0] + "'>" + $(ddlSourseID + " option:selected").text() + "</option>");
            if (IsSourseDelete) $(ddlSourseID + " option[value='" + thevalue[0] + "']").remove();
        }
    }
}

function Reload_lbl_Global(xhr, lblID, AjaxURL, AjaxData, callback) {

    if (xhr && xhr.readystate != 4) {
        xhr.abort();
    }

    $(lblID).html("");
    xhr = $.ajax({
        url: AjaxURL,
        cache: false,
        data: AjaxData,
        /*dataType: "application/json",*/
        success: function (data) {
            if (data != null && data.status == "Success") {

                var Model = eval(data.data);

                $(lblID).html(Model.Text);
                $(lblID).attr("data-val", Model.Value);

                if (callback && typeof (callback) === "function") {
                    callback();
                }

            } else {
                showSweetAlert("Error!", "Error occured while loading the data.", "error", null);
            }
        }
    });
}

function ClearTextBox(MyArray) {
    jQuery.each(MyArray, function (i, val) { try { $(val).val(""); } catch (e) { } });
}
/*Ajax Helpers end*/

/*Grid Pagination helper start*/
/*Bind grid*/
function loadTable(tableID, model) {

    if ($.fn.DataTable.isDataTable("#" + tableID)) {
        $("#" + tableID).DataTable().destroy();
    }

    $("#" + tableID + " tbody").html("");
    if (IsDataExists(model))
        $("#Grid_Data_Template_" + tableID).tmpl(model).appendTo("#" + tableID + " tbody");

    var options = {
        /*"aaSorting": [[0, 'asc']],*/
        "language": {
            "lengthMenu": "" + "Display" + " _MENU_ " + "records" + "",
            "zeroRecords": "No data found!",
            "info": "" + "Showing page" + " _PAGE_ " + "of" + " _PAGES_",
            "infoEmpty": "No records available!",
            "infoFiltered": "(" + "Filtered From" + " _MAX_ " + "Total Records" + ")",
            "sSearch": "Search" + ": ",
            //"oPaginate": { "sNext": "Next", "sPrevious": "Previous" }
        },

        /*"bProcessing": true,
        "sAutoWidth": false,*/
        "bDestroy": true,
        /*"sPaginationType": "bootstrap",
        "iDisplayStart ": 10,
        "iDisplayLength": 10,*/
        //responsive: true,
        "bPaginate": true,  /*hide pagination*/
        "bFilter": true,    /*hide Search bar*/
        "bInfo": true,      /* hide showing entries*/
    };

    var defaultRecordOrderby = $("#" + tableID + ' thead tr:first').attr("defaultRecordOrderby");
    var cols = $("#" + tableID).find("tr:first th").length;

    if (defaultRecordOrderby == undefined || defaultRecordOrderby == null) {
        options["aaSorting"] = [[Number(cols) - 1, 'asc']];
    } else {
        options["aaSorting"] = eval(defaultRecordOrderby);
    }

    var columss = [];
    $("#" + tableID + " thead tr th").each(function () {
        if (!$(this).hasClass("sorting_disabled"))
            columss.push({ bSortable: true });
        else {
            columss.push({ bSortable: false });
        }
        options["aoColumns"] = columss;
    });

    if (IsDataExists(model) && model.length > 100) {
        options["lengthMenu"] = [10, 25, 50, 100, model.length];
    }

    //$("#" + tableID).DataTable(options);
    BindDataTableRowCount = $("#" + tableID).DataTable(options);

    BindDataTableRowCount.on('order.dt search.dt', function () {
        BindDataTableRowCount.column(0, { search: 'applied', order: 'applied' }).nodes().each(function (cell, i) {

            if (cell.id === "SrNotemptd")
                cell.innerHTML = i + 1;
        });
    }).draw();

    /*$("#" + tableID + " thead tr th[sorting=disabled]").removeClass("sorting");*/
    $("#" + tableID + " tbody .dataTables_empty").parent("tr").remove();
}

function loadTableWithSearch(tableID, model) {

    if ($.fn.DataTable.isDataTable("#" + tableID)) {
        $("#" + tableID).DataTable().destroy();
    }

    /* if null then only apply to effect data is to be already added*/
    if (model != null) {
        $("#" + tableID + " tbody").html("");
        if (IsDataExists(model))
            $("#Grid_Data_Template_" + tableID).tmpl(model).appendTo("#" + tableID + " tbody");
    }

    var options = {
        /*"aaSorting": [[0, 'asc']],*/
        "language": {
            "lengthMenu": "" + "Display" + " _MENU_ " + "records" + "",
            "zeroRecords": "No data found!",
            "info": "" + "Showing page" + " _PAGE_ " + "of" + " _PAGES_",
            "infoEmpty": "No records available!",
            "infoFiltered": "(" + "Filtered From" + " _MAX_ " + "Total Records" + ")",
            "sSearch": "Search" + ": ",
            //"oPaginate": { "sNext": "Next", "sPrevious": "Previous" }
        },

        /*"bProcessing": true,
        "sAutoWidth": false,*/
        "bDestroy": true,
        /*"sPaginationType": "bootstrap",
        "iDisplayStart ": 10,
        "iDisplayLength": 10,*/
        //responsive: true,

        "bPaginate": false,  /*hide pagination*/
        "bFilter": true,    /*hide Search bar*/
        "bInfo": false,      /* hide showing entries*/
    };

    var defaultRecordOrderby = $("#" + tableID + ' thead tr:first').attr("defaultRecordOrderby");
    var cols = $("#" + tableID).find("tr:first th").length;

    if (defaultRecordOrderby == undefined || defaultRecordOrderby == null) {
        options["aaSorting"] = [[Number(cols) - 1, 'asc']];
    } else {
        options["aaSorting"] = eval(defaultRecordOrderby);
    }

    var columss = [];
    $("#" + tableID + " thead tr th").each(function () {
        if (!$(this).hasClass("sorting_disabled"))
            columss.push({ bSortable: true });
        else {
            columss.push({ bSortable: false });
        }
        options["aoColumns"] = columss;
    });

    if (model != null)
        if (IsDataExists(model) && model.length > 100) {
            options["lengthMenu"] = [10, 25, 50, 100, model.length];
        }

    $("#" + tableID).DataTable(options);

    /*$("#" + tableID + " thead tr th[sorting=disabled]").removeClass("sorting");*/
    //$("#" + tableID + " tbody .dataTables_empty").parent("tr").remove();
}

function loadTableWithoutSearch(tableID, model) {

    if ($.fn.DataTable.isDataTable("#" + tableID)) {
        $("#" + tableID).DataTable().destroy();
    }

    /* if null then only apply to effect data is to be already added*/
    if (model != null) {
        $("#" + tableID + " tbody").html("");
        if (IsDataExists(model))
            $("#Grid_Data_Template_" + tableID).tmpl(model).appendTo("#" + tableID + " tbody");
    }

    var options = {
        /*"aaSorting": [[0, 'asc']],*/
        "language": {
            "lengthMenu": "" + "Display" + " _MENU_ " + "records" + "",
            "zeroRecords": "No data found!",
            "info": "" + "Showing page" + " _PAGE_ " + "of" + " _PAGES_",
            "infoEmpty": "No records available!",
            "infoFiltered": "(" + "Filtered From" + " _MAX_ " + "Total Records" + ")",
            "sSearch": "Search" + ": ",
            //"oPaginate": { "sNext": "Next", "sPrevious": "Previous" }
        },

        /*"bProcessing": true,
        "sAutoWidth": false,*/
        "bDestroy": true,
        /*"sPaginationType": "bootstrap",
        "iDisplayStart ": 10,
        "iDisplayLength": 10,*/
        //responsive: true,

        "bPaginate": false,  /*hide pagination*/
        "bFilter": false,    /*hide Search bar*/
        "bInfo": false,      /* hide showing entries*/
    };

    var defaultRecordOrderby = $("#" + tableID + ' thead tr:first').attr("defaultRecordOrderby");

    if (defaultRecordOrderby == undefined || defaultRecordOrderby == null) {
        options["aaSorting"] = [[0, 'asc']];
    } else {
        options["aaSorting"] = eval(defaultRecordOrderby);
    }

    var columss = [];
    $("#" + tableID + " thead tr th").each(function () {
        if (!$(this).hasClass("sorting_disabled"))
            columss.push({ bSortable: true });
        else {
            columss.push({ bSortable: false });
        }
        options["aoColumns"] = columss;
    });

    if (model != null)
        if (IsDataExists(model) && model.length > 100) {
            options["lengthMenu"] = [10, 25, 50, 100, model.length];
        }

    $("#" + tableID).DataTable(options);

    /*$("#" + tableID + " thead tr th[sorting=disabled]").removeClass("sorting");*/
    $("#" + tableID + " tbody .dataTables_empty").parent("tr").remove();
}

function loadTableWithoutPaging(tableID, model) {

    if ($.fn.DataTable.isDataTable("#" + tableID)) {
        $("#" + tableID).DataTable().destroy();
    }

    $("#" + tableID + " tbody").html("");
    if (IsDataExists(model))
        $("#Grid_Data_Template_" + tableID).tmpl(model).appendTo("#" + tableID + " tbody");

    var options = {
        /*"aaSorting": [[0, 'asc']],*/
        "language": {
            "lengthMenu": "" + "Display" + " _MENU_ " + "records" + "",
            "zeroRecords": "No data found!",
            "info": "" + "Showing page" + " _PAGE_ " + "of" + " _PAGES_",
            "infoEmpty": "No records available!",
            "infoFiltered": "(" + "Filtered From" + " _MAX_ " + "Total Records" + ")",
            "sSearch": "Search" + ": ",
            //"oPaginate": { "sNext": "Next", "sPrevious": "Previous" }
        },

        //"bProcessing": true,
        //"sAutoWidth": false,
        "bDestroy": true,
        //"sPaginationType": "bootstrap", // full_numbers
        //"iDisplayStart ": 10,
        //responsive: true,
        "iDisplayLength": 10,//model.length,
        "bPaginate": false, //hide pagination
        "bFilter": true, //hide Search bar
        "bInfo": false, // hide showing entries
    };

    var defaultRecordOrderby = $("#" + tableID + ' thead tr:first').attr("defaultRecordOrderby");

    if (defaultRecordOrderby == undefined || defaultRecordOrderby == null) {
        options["aaSorting"] = [[0, 'asc']];
    } else {
        options["aaSorting"] = eval(defaultRecordOrderby);
    }

    var columss = [];
    $("#" + tableID + " thead tr th").each(function () {
        if (!$(this).hasClass("sorting_disabled"))
            columss.push({ bSortable: true });
        else {
            columss.push({ bSortable: false });
        }
        options["aoColumns"] = columss;
    });

    if (IsDataExists(model) && model.length > 100) {
        options["lengthMenu"] = [10, 25, 50, 100, model.length];
    }

    $("#" + tableID).DataTable(options);

    //$("#" + tableID + " thead tr th[sorting=disabled]").removeClass("sorting");
    $("#" + tableID + " tbody .dataTables_empty").parent("tr").remove();
}

function loadTableWithoutPagingWithoutSortable(tableID, model) {

    if ($.fn.DataTable.isDataTable("#" + tableID)) {
        $("#" + tableID).DataTable().destroy();
    }

    $("#" + tableID + " tbody").html("");
    if (IsDataExists(model))
        $("#Grid_Data_Template_" + tableID).tmpl(model).appendTo("#" + tableID + " tbody");

    var options = {
        /*"aaSorting": [[0, 'asc']],*/
        "language": {
            "lengthMenu": "" + "Display" + " _MENU_ " + "records" + "",
            "zeroRecords": "No data found!",
            "info": "" + "Showing page" + " _PAGE_ " + "of" + " _PAGES_",
            "infoEmpty": "No records available!",
            "infoFiltered": "(" + "Filtered From" + " _MAX_ " + "Total Records" + ")",
            "sSearch": "Search" + ": ",
            //"oPaginate": { "sNext": "Next", "sPrevious": "Previous" }
        },

        //"bProcessing": true,
        //"sAutoWidth": false,
        "bDestroy": true,
        //"sPaginationType": "bootstrap", // full_numbers
        //"iDisplayStart ": 10,
        //responsive: true,
        "ordering": false,
        "iDisplayLength": 10,//model.length,
        "bPaginate": false, //hide pagination
        "bFilter": true, //hide Search bar
        "bInfo": false, // hide showing entries
    };

   
    var columss = [];
    $("#" + tableID + " thead tr th").each(function () {
        if (!$(this).hasClass("sorting_disabled"))
            columss.push({ bSortable: true });
        else {
            columss.push({ bSortable: false });
        }
        options["aoColumns"] = columss;
    });

    if (IsDataExists(model) && model.length > 100) {
        options["lengthMenu"] = [10, 25, 50, 100, model.length];
    }

    $("#" + tableID).DataTable(options);

    //$("#" + tableID + " thead tr th[sorting=disabled]").removeClass("sorting");
    $("#" + tableID + " tbody .dataTables_empty").parent("tr").remove();
}

function LoadGrid(xhr, tableID, AjaxURL, AjaxData, callback) {

    if (xhr && xhr.readystate != 4)
        xhr.abort();

    xhr = $.ajax({
        url: AjaxURL, traditional: true, cache: false, data: AjaxData,
        success: function (data) {
            if (data != null && data.status == "Success") {
                var Model = eval(data.data);

                loadTable(tableID, Model);

                if (callback && typeof (callback) === "function")
                    callback(Model);

                return Model;
            } else {
                if (data.toString().indexOf("LoginBody") >= 0) {
                    window.open(ProjectURL.BaseURL, "_self")
                } else
                    showSweetAlert("Error!", data.message, "error", null);
            }
        },
        error: function (ex) {
            alert("Message: " + ex);
        }
    });
}

function LoadGridCustom(xhr, tableID, AjaxURL, AjaxData, Precallback, callback) {

    if (xhr && xhr.readystate != 4)
        xhr.abort();

    xhr = $.ajax({
        url: AjaxURL, traditional: true, cache: false, data: AjaxData,
        success: function (data) {
            if (data != null && data.status == "Success") {

                var Model = eval(data.data);

                if (Precallback && typeof (Precallback) === "function")
                    Precallback(Model);

                loadTable(tableID, Model);

                if (callback && typeof (callback) === "function")
                    callback(Model);

            } else {
                if (data.toString().indexOf("LoginBody") >= 0) {
                    window.open(ProjectURL.BaseURL, "_self")
                } else
                    showSweetAlert("Error!", data.message, "error", null);
            }
        },
        error: function (ex) {
            alert("Message: " + ex);
        }
    });
}

function LoadGridPost(xhr, tableID, AjaxURL, AjaxData, callback) {

    if (xhr && xhr.readystate != 4)
        xhr.abort();

    xhr = $.ajax({
        type: "POST", cache: false, url: AjaxURL, data: AjaxData,
        success: function (data) {
            if (data != null && data.status == "Success") {
                var Model = eval(data.data);

                loadTable(tableID, Model);

                if (callback && typeof (callback) === "function")
                    callback(Model);

                return Model;
            } else {
                if (data.toString().indexOf("LoginBody") >= 0) {
                    window.open(ProjectURL.BaseURL, "_self")
                } else
                    showSweetAlert("Error!", data.message, "error", null);
            }
        },
        error: function (ex) {
            alert("Message: " + ex);
        }
    });
}

function LoadGridWithoutPaginationWithPost(xhr, tableID, AjaxURL, AjaxData, callback) {

    if (xhr && xhr.readystate != 4)
        xhr.abort();

    xhr = $.ajax({
        type: "POST", cache: false, url: AjaxURL, data: AjaxData,
        /*type: "POST", url: AjaxURL, traditional: true, cache: false, data: AjaxData,*/
        success: function (data) {
            if (data != null && data.status == "Success") {
                var Model = eval(data.data);

                $("#" + tableID + " tbody").html("");
                $("#Grid_Data_Template_" + tableID).tmpl(Model).appendTo("#" + tableID + " tbody");

                if (callback && typeof (callback) === "function")
                    callback(Model);

                return Model;
            } else {

                if (data.toString().indexOf("LoginBody") >= 0) {
                    window.open(ProjectURL.BaseURL, "_self")
                } else
                    showSweetAlert("Error!", data.message, "error", null);
            }
        },
        error: function (ex) {
            alert("Message: " + ex);
        }
    });
}

function LoadGridWithoutPagination(xhr, tableID, AjaxURL, AjaxData, callback) {

    if (xhr && xhr.readystate != 4)
        xhr.abort();

    xhr = $.ajax({
        url: AjaxURL, traditional: true, cache: false, data: AjaxData,
        success: function (data) {
            if (data != null && data.status == "Success") {
                var Model = eval(data.data);

                $("#" + tableID + " tbody").html("");
                $("#Grid_Data_Template_" + tableID).tmpl(Model).appendTo("#" + tableID + " tbody");

                //loadTableWithoutPaging(tableID, Model);

                if (callback && typeof (callback) === "function")
                    callback(Model);

                return Model;
            } else {
                if (data.toString().indexOf("LoginBody") >= 0) {
                    window.open(ProjectURL.BaseURL, "_self")
                } else
                    showSweetAlert("Error!", data.message, "error", null);
            }
        },
        error: function (ex) {
            alert("Message: " + ex);
        }
    });
}

function LoadGridWithoutPaginationWithSearch(xhr, tableID, AjaxURL, AjaxData, callback) {

    if (xhr && xhr.readystate != 4)
        xhr.abort();

    xhr = $.ajax({
        url: AjaxURL, traditional: true, cache: false, data: AjaxData,
        success: function (data) {
            if (data != null && data.status == "Success") {
                var Model = eval(data.data);

                loadTableWithSearch(tableID, Model);

                if (callback && typeof (callback) === "function")
                    callback(Model);

                return Model;
            } else {
                if (data.toString().indexOf("LoginBody") >= 0) {
                    window.open(ProjectURL.BaseURL, "_self")
                } else
                    showSweetAlert("Error!", data.message, "error", null);
            }
        },
        error: function (ex) {
            alert("Message: " + ex);
        }
    });
}

function LoadGridCustomWithoutPagination(xhr, tableID, AjaxURL, AjaxData, Precallback, callback) {

    if (xhr && xhr.readystate != 4)
        xhr.abort();

    xhr = $.ajax({
        url: AjaxURL, traditional: true, cache: false, data: AjaxData,
        success: function (data) {
            if (data != null && data.status == "Success") {

                var Model = eval(data.data);

                if (Precallback && typeof (Precallback) === "function")
                    Precallback(Model);

                $("#" + tableID + " tbody").html("");
                $("#Grid_Data_Template_" + tableID).tmpl(Model).appendTo("#" + tableID + " tbody");

                if (callback && typeof (callback) === "function")
                    callback(Model);
            } else {
                if (data.toString().indexOf("LoginBody") >= 0) {
                    window.open(ProjectURL.BaseURL, "_self")
                } else
                    showSweetAlert("Error!", data.message, "error", null);
            }
        },
        error: function (ex) {
            alert("Message: " + ex);
        }
    });
}

function LoadGridWithoutPaginationWithDataModel(tableID, Model, callback) {

    $("#" + tableID + " tbody").html("");
    $("#Grid_Data_Template_" + tableID).tmpl(Model).appendTo("#" + tableID + " tbody");

    if (callback && typeof (callback) === "function")
        callback();
}

function GlobalGetData(AjaxURL, AjaxData, callback) {

    xhr = $.ajax({
        url: AjaxURL, traditional: true, cache: false, data: AjaxData,
        success: function (data) {
            if (data != null && data.status == "Success") {

                if (callback && typeof (callback) === "function")
                    callback(data);
            } else {
                if (data.toString().indexOf("LoginBody") >= 0) {
                    window.open(ProjectURL.BaseURL, "_self")
                } else
                    showSweetAlert("Error!", data.message, "error", null);
            }
        }
    });
}

function BindTable(xhr, tableID, AjaxURL, AjaxData, Precallback, callback) {

    if (xhr && xhr.readystate != 4)
        xhr.abort();

    xhr = $.ajax({
        url: AjaxURL, traditional: true, cache: false, data: AjaxData,
        success: function (data) {
            if (data != null && data.status == "Success") {

                var Model = eval(data.data);

                if (Precallback && typeof (Precallback) === "function")
                    Precallback(Model);

                $("#" + tableID + " tbody").html("");
                $("#Grid_Data_Template_" + tableID).tmpl(Model).appendTo("#" + tableID + " tbody");

                if (callback && typeof (callback) === "function")
                    callback();
            } else {
                if (data.toString().indexOf("LoginBody") >= 0) {
                    window.open(ProjectURL.BaseURL, "_self")
                } else
                    showSweetAlert("Error!", data.message, "error", null);
            }
        },
        error: function (ex) {
            alert("Message: " + ex);
        }
    });
}

function GridSelectAll(tableID) {
    /*And for the first simple table, which doesn't have TableTools or dataTables
    select/deselect all rows according to table header checkbox*/
    var active_class = 'active';
    $('#' + tableID + ' > thead > tr > th input[type=checkbox]').eq(0).on('click', function () {
        var th_checked = this.checked;/*checkbox inside "TH" table header*/
        $(this).closest('table').find('tbody > tr').each(function () {
            var row = this;
            if (th_checked)
                $(row).addClass(active_class).find('input[type=checkbox]').eq(0).prop('checked', true);
            else
                $(row).removeClass(active_class).find('input[type=checkbox]').eq(0).prop('checked', false);
        });
    });

    /*select/deselect a row when the checkbox is checked/unchecked*/
    $('#' + tableID).on('click', 'td input[type=checkbox]', function () {
        var $row = $(this).closest('tr');
        if ($row.is('.detail-row ')) return;

        if (this.checked) {

            var rowsCount = $('#' + tableID).closest('table').find('tbody > tr').length;
            var clickedCount = 0;

            $('#' + tableID).closest('table').find('tbody > tr').each(function () {
                var trrow = this;
                if ($(trrow).find('input[type=checkbox]').eq(0).prop('checked'))
                    clickedCount++;
            });

            if (rowsCount == clickedCount)
                $('#' + tableID + ' thead tr').find('input[type=checkbox]').eq(0).prop('checked', true);
        }
        else {
            $row.removeClass(active_class);
            $('#' + tableID + ' thead tr').find('input[type=checkbox]').eq(0).prop('checked', false);
        }
    });

}

function SelectAll(HeaderControlclass, RowControlClass) {
    /*HeaderControlclass / RowControlClass must have unique on same page*/

    var active_class = 'active';
    $("." + HeaderControlclass).click(function () {

        var HeaderControl = this;

        $("." + RowControlClass).each(function () {
            var row = this;

            if ($(HeaderControl).prop("checked") && !$(row).hasAttr('disabled'))
                $(row).prop('checked', true);
            else {
                if (!$(row).hasAttr('disabled'))
                    $(row).prop('checked', false);
            }
        });
    });

    /*select/deselect a row when the checkbox is checked/unchecked*/
    $("." + RowControlClass).click(function () {

        if ($(this).prop("checked")) {

            var rowsCount = $("." + RowControlClass).length;
            var clickedCount = 0;

            $("." + RowControlClass).each(function () {
                var trrow = this;
                if ($(trrow).prop('checked'))
                    clickedCount++;
            });

            if (rowsCount == clickedCount)
                $("." + HeaderControlclass).prop('checked', true);
        }
        else {
            $("." + HeaderControlclass).prop('checked', false);
        }
    });
}

function Clear_Form_Fields(formId) {
    try {
        $(formId + ' input[type="text"]').each(function () {
            $(this).val("");
        });
    } catch (e) { }

    try {
        $(formId + ' input[type="password"]').each(function () {
            $(this).val("");
        });
    } catch (e) { }

    try {
        $(formId + ' input[type="number"]').each(function () {
            $(this).val("");
        });
    } catch (e) { }

    try {
        $(formId + ' input[type="hidden"]').each(function () {
            $(this).val("");
        });
    } catch (e) { }

    try {
        $(formId + ' textarea').each(function () {
            $(this).val("");
        });
    } catch (e) { }

    try {
        var id = null;
        $(formId + ' select').each(function () {
            id = null;
            id = $(this).attr('id');

            $("#" + id + " option:selected").removeAttr("selected").prop("selected", false);

            //if ($("#" + id + "_chosen") != undefined && $("#" + id + "_chosen") != null)
            //    LoadChosen("#" + id);
        });
    } catch (e) { }

    /*ResetFormErrors(formId);*/
}

/*table sortable*/
function Bind_Grid_Sortable_Fields(callback) {

    $("th.sortable").click(function () {

        var CurrentStatusIsASC = $(this).hasClass("sorting_asc");

        $("th.sortable").removeClass("sorting_asc").removeClass("sorting_desc").addClass("sorting");

        GlobalSortBy = $(this).attr("data-sortby");
        GlobalSortOrder = CurrentStatusIsASC ? "desc" : "asc";

        $(this).addClass(CurrentStatusIsASC ? "sorting_desc" : "sorting_asc").removeClass("sorting");

        if (callback && typeof (callback) === "function") {
            callback();
        }
    });
}

function Bind_Grid_Sortable_FieldsForAll(tableID, SortBy, SortOrder, callback) {

    $("" + tableID + " th.sortable").click(function () {

        var CurrentStatusIsASC = $(this).hasClass("sorting_asc");

        $("" + tableID + " th.sortable").removeClass("sorting_asc").removeClass("sorting_desc").addClass("sorting");

        $("" + SortBy).val($(this).attr("data-sortby"));
        $("" + SortOrder).val(CurrentStatusIsASC ? "desc" : "asc");

        $(this).addClass(CurrentStatusIsASC ? "sorting_desc" : "sorting_asc").removeClass("sorting");

        if (callback && typeof (callback) === "function") {
            callback();
        }
    });
}

function Bind_Grid_Sortable_Fields2(callback) {

    $("th.sortable").click(function () {

        var CurrentStatusIsASC = $(this).hasClass("sorting_asc");

        $("th.sortable").removeClass("sorting_asc").removeClass("sorting_desc").addClass("sorting");

        GlobalSortByLocation = $(this).attr("data-sortby");
        GlobalSortOrderLocation = CurrentStatusIsASC ? "desc" : "asc";

        $(this).addClass(CurrentStatusIsASC ? "sorting_desc" : "sorting_asc").removeClass("sorting");

        if (callback && typeof (callback) === "function") {
            callback();
        }
    });
}

function Bind_Grid_Sortable_Fields2(callback, GlobalSortBy2, GlobalSortOrder2) {

    $("th.sortable").click(function () {

        var CurrentStatusIsASC = $(this).hasClass("sorting_asc");

        $("th.sortable").removeClass("sorting_asc").removeClass("sorting_desc").addClass("sorting");

        $(GlobalSortBy2).val($(this).attr("data-sortby"));
        $(GlobalSortOrder2).val(CurrentStatusIsASC ? "desc" : "asc");

        $(this).addClass(CurrentStatusIsASC ? "sorting_desc" : "sorting_asc").removeClass("sorting");

        if (callback && typeof (callback) === "function") {
            callback();
        }
    });
}

function Bind_Grid_Sortable_Fields3(callback) {

    $("th.sortable").click(function () {

        var CurrentStatusIsASC = $(this).hasClass("sorting_asc");

        $("th.sortable").removeClass("sorting_asc").removeClass("sorting_desc").addClass("sorting");
        GlobalSortByPriorAttempt = $(this).attr("data-sortby");
        GlobalSortOrderPriorAttempt = CurrentStatusIsASC ? "desc" : "asc";

        $(this).addClass(CurrentStatusIsASC ? "sorting_desc" : "sorting_asc").removeClass("sorting");

        if (callback && typeof (callback) === "function") {
            callback();
        }
    });
}
/*Grid Pagination helper end*/

/*Global Validators start*/
function Validate_Alert(ControlId, ErrorMessage, valid) {

    $(ControlId).parent().addClass("is-invalid");
    $(ControlId).parent().find("p").html(ErrorMessage).show();/*for required field not to show*/
    valid = false;
    return valid;
}

function Validate_AlertTo(ControlId, ErrorMessage, valid) {

    $(ControlId).addClass("is-invalid");
    $(ControlId).html(ErrorMessage).show();/*for required field not to show*/
    valid = false;
    return valid;
}

function Validate_Control_NullBlank(ControlId, FieldValue, ErrorMessage, valid) {
    if ($.trim(FieldValue) == null || $.trim(FieldValue) == '' || $.trim(FieldValue) == ',') {
        $(ControlId).addClass("is-invalid");
        /*$(ControlId).parent().find("p").html(ErrorMessage).show();
        $("#lblError" + ControlId.replace("#","")).parent().find("p").html(ErrorMessage).show();*/
        valid = false;
    }

    return valid;
}

function Validate_DDLControl_NullBlank(ControlId, FieldValue, ErrorMessage, valid) {
    if ($.trim(FieldValue) == null || $.trim(FieldValue) == '' || $.trim(FieldValue) == ',') {
        var sp = $("span[role=combobox]")
        //$(ControlId).parent().find(sp).css({ "border-color": "#DC3545 !important", "padding-right": "0 !important", "background-image": "none !important;" });
        $(ControlId).parent().find(sp).css("border-color", "#DC3545");

        //$(ControlId).parent().find(sp).addClass("is-invalid");
        //$(ControlId).closest(".form-control").addClass("is-invalid");
        /*$(ControlId).parent().find("p").html(ErrorMessage).show();
        $("#lblError" + ControlId.replace("#","")).parent().find("p").html(ErrorMessage).show();*/
        valid = false;
    }

    return valid;
}
//function Validate_DDLControl_NullBlank(ControlId, FieldValue, ErrorMessage, valid) {
//    if ($.trim(FieldValue) == null || $.trim(FieldValue) == '' || $.trim(FieldValue) == ',') {
//        $(ControlId).closest(".form-control").addClass("is-invalid");
//        /*$(ControlId).parent().find("p").html(ErrorMessage).show();
//        $("#lblError" + ControlId.replace("#","")).parent().find("p").html(ErrorMessage).show();*/
//        valid = false;
//    }

//    return valid;
//}

function Validate_Control_Location_NullBlank(ControlId, FieldValue, ErrorMessage, valid) {
    if ($.trim(FieldValue) == null || $.trim(FieldValue) == '' || $.trim(FieldValue) == ',') {
        $(ControlId).parent().addClass("is-invalid");
        /*$(ControlId).parent().find("p").html(ErrorMessage).show();
        $("#lblError" + ControlId.replace("#","")).parent().find("p").html(ErrorMessage).show();*/
        valid = false;
    }

    return valid;
}

function Validate_Control_ComparePassword(ControlId, CompareFromControlId, ErrorMessage, valid) {
    if ($.trim($(ControlId).val()) != $(CompareFromControlId).val()) {
        $(ControlId).parent().addClass("is-invalid");
        $(ControlId).parent().find("p").html(ErrorMessage).show();
        valid = false;
    }
    return valid;
}

function Validate_Control_ComparePasswordAll(ControlId, CompareFromControlId, CompareFromControlIdFrom, ErrorMessage, valid) {
    if (($.trim($(ControlId).val()) == $(CompareFromControlId).val()) && ($.trim($(ControlId).val()) == $(CompareFromControlIdFrom).val()) && ($.trim($(CompareFromControlId).val()) == $(CompareFromControlIdFrom).val())) {
        $(ControlId).parent().addClass("is-invalid");
        $(ControlId).parent().find("p").html(ErrorMessage).show();
        valid = false;
    }
    return valid;
}

function Validate_Control_CompareMinMaxInteger(ControlIdMin, ControlIdMax, CompareFromControlId, CompareToControlId, ErrorMessage, valid) {
    if (($.trim(CompareFromControlId) != null || $.trim(CompareFromControlId) != '') && ((CompareToControlId) != null || $.trim(CompareToControlId) != '')) {
        if (eval(CompareFromControlId) > eval(CompareToControlId)) {

            $(ControlIdMin).parent().addClass("is-invalid");
            /*$(ControlIdMin).parent().parent().find("p").html(ErrorMessage).show();*/
            $('#CompairMinMaxhelp-block').html(ErrorMessage).show();
            $('#CompairMinMaxhelp-block').parent().addClass("is-invalid");
            valid = false;
        }
    }

    return valid;
}

function Validate_Control_NumericOnly(ControlId, FieldValue, ErrorMessage, valid) {

    /*Write code with RegX - Change RegX*/

    if (FieldValue.trim() != null && FieldValue.trim() != '') {
        if (/(^\d{5}$)|(^\d{5}-\d{4}$)/.test(FieldValue) != true) {
            $(ControlId).parent().addClass("is-invalid");
            $(ControlId).parent().find("p").html(ErrorMessage).show();
            valid = false;
        }
    }
    return valid;
}

function Validate_Control_NumericOrFloat(ControlId, FieldValue, ErrorMessage, valid) {

    /*Write code with RegX - Change RegX*/
    if (FieldValue.trim() != null && FieldValue.trim() != '') {
        if (/^[+-]?\d+(\.\d+)?$/.test(FieldValue) != true) {
            $(ControlId).parent().addClass("is-invalid");
            $(ControlId).parent().find("p").html(ErrorMessage).show();
            valid = false;
        }
    }

    return valid;
}

function Validate_Control_Email(ControlId, FieldValue, ErrorMessage, valid) {
    /*var email_Regx = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;*/
    var email_Regx = /^([\w-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/;

    if (FieldValue.trim() != null && FieldValue.trim() != '') {
        if (email_Regx.test(FieldValue) != true) {
            $(ControlId).addClass("is-invalid");
            /*$(ControlId).parent().find("p").html(ErrorMessage).show();*/
            //$("#lblError" + ControlId.replace("#", "")).parent().find("p").html(ErrorMessage).show();
            showSweetAlert('Warning!', 'Invalid Email', 'warning', null);
            valid = false;
        }
    }
    return valid;
}

function Validate_Control_WebURL(ControlId, FieldValue, ErrorMessage, valid) {

    //var WebUrl_Regx = /^(https?|http?|s?ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i;
    var WebUrl_Regx = /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/g;

    if (FieldValue.trim() != null && FieldValue.trim() != '') {
        if (WebUrl_Regx.test(FieldValue) != true) {
            $(ControlId).addClass("is-invalid");
            $(ControlId).parent().find(".ErrorText").text(ErrorMessage);
            $(ControlId).parent().find(".ErrorText").show();
            /*$(ControlId).parent().find("p").html(ErrorMessage).show();*/
            //$("#lblError" + ControlId.replace("#", "")).parent().find("p").html(ErrorMessage).show();/*for required field not to show*/
            valid = false;
        }
    }
    return valid;
}

function Validate_Control_DateDDMMYYYY(ControlId, FieldValue, ErrorMessage, valid) {

    var monthlist = Jan + "|" + Feb + "|" + Mar + "|" + Apr + "|" + May +
        "|" + June + "|" + July + "|" + Aug + "|" + Sep + "|" + Oct + "|" + Nov + "|" + Dec;
    var dtRegex = new RegExp("^([0]?[1-9]|[1-2]\\d|3[0-1])-(" + monthlist + ")-[1-2]\\d{3}$", 'i');

    if (FieldValue.trim() != null && FieldValue.trim() != '') {
        if (dtRegex.test(FieldValue) == false) {
            $(ControlId).parent().addClass("is-invalid");
            $(ControlId).parent().find("p").html(ErrorMessage).show();
            $("#lblError" + ControlId.replace("#", "")).parent().find("p").html(ErrorMessage).show();/*for required field not to show*/
            valid = false;
        }
    }
    return valid;
}

function Validate_Control_DateFormat(FieldValue) {

    var monthlist = 'Jan' + "|" + 'Feb' + "|" + 'Mar' + "|" + 'Apr' + "|" + 'May' +
        "|" + 'June' + "|" + 'July' + "|" + 'Aug' + "|" + 'Sep' + "|" + 'Oct' + "|" + 'Nov' + "|" + 'Dec';
    var dtRegex = new RegExp("^([0]?[1-9]|[1-2]\\d|3[0-1])-(" + monthlist + ")-[1-2]\\d{3}$", 'i');

    if (FieldValue.trim() != null && FieldValue.trim() != '') {
        if (dtRegex.test(FieldValue) == false) {
            return false;
        }
    }
    return true;
}

function Validate_Control_DateCompair(ControlId, ToControlId, FromDateValue, ToDateValue, ErrorMessage, valid) {

    if (ToDateValue != "" && ToDateValue != null) {
        if (new Date(FromDateValue) > new Date(ToDateValue)) {
            $(ControlId).parent().addClass("is-invalid");
            $(ControlId).parent().find("p").html(ErrorMessage).show();
            $("#lblError" + ControlId.replace("#", "")).html(ErrorMessage).show();
            valid = false;
        }
    }

    return valid;
}

function Validate_Control_MaxLengthString(ControlId, FieldValue, MaxLength, ErrorMessage, valid) {
    if (FieldValue != null && FieldValue != '' && FieldValue.length > MaxLength) {
        $(ControlId).parent().addClass("is-invalid");
        $(ControlId).parent().find("p").html(ErrorMessage).show();
        valid = false;
    }
    return valid;
}

function Validate_Control_MaxLengthNumeric(ControlId, FieldValue, MaxLength, ErrorMessage, valid) {

    if (FieldValue != null && FieldValue != '' && $.isNumeric(FieldValue) == true && (FieldValue.toString().split('.')[0]).length > MaxLength) {
        $(ControlId).parent().addClass("is-invalid");
        $(ControlId).parent().find("p").html(ErrorMessage).show();
        valid = false;
    }

    return valid;
}

function Validate_Control_MaxLengthNum(ControlId, FieldValue, MaxLength, ErrorMessage, valid) {

    if (FieldValue != null && FieldValue != '' && $.isNumeric(FieldValue) == true && (FieldValue.toString().length > MaxLength)) {
        $(ControlId).parent().addClass("is-invalid");
        $(ControlId).parent().find("p").html(ErrorMessage).show();
        valid = false;
    }

    return valid;
}

function Validate_Control_MinMaxLengthNum(ControlId, FieldValue, MinLength, MaxLength, ErrorMessage, valid) {

    if (FieldValue != null && FieldValue != '' && $.isNumeric(FieldValue) == true && (FieldValue.toString().trim().length > MaxLength) && (FieldValue.toString().trim().length < MinLength)) {
        $(ControlId).parent().addClass("is-invalid");
        $(ControlId).parent().find("p").html(ErrorMessage).show();
        valid = false;
    }

    return valid;
}

function Validate_Control_MinMaxValue(ControlId, FieldValue, MinValue, MaxValue, ErrorMessage, valid) {

    if ($.isNumeric(FieldValue) == false || ((FieldValue > MaxValue) || (FieldValue < MinValue))) {
        $(ControlId).parent().addClass("is-invalid");
        $(ControlId).parent().find("p").html(ErrorMessage).show();
        valid = false;
    }

    return valid;
}

function Validate_Control_MinValue(ControlId, FieldValue, MinValue, ErrorMessage, valid) {
    if ($.isNumeric(FieldValue) && (FieldValue < MinValue)) {
        $(ControlId).addClass("is-invalid");
        valid = false;
    }

    return valid;
}

function Validate_Control_MaxValue(ControlId, FieldValue, MaxValue, ErrorMessage, valid) {
    if ($.isNumeric(FieldValue) && (Number(FieldValue) > Number(MaxValue))) {
        $(ControlId).parent().addClass("is-invalid");
        $(ControlId).parent().find("p").html(ErrorMessage).show();
        $(ControlId).parent().show();
        $("#lblError" + (ControlId).replace("#", "")).parent().find("p").html(ErrorMessage).show();
        valid = false;
    }

    return valid;
}

function Validate_Control_MaxLengthDecimalPoint(ControlId, FieldValue, MaxLengthBeforeDecimal, MaxLengthAfterDecimal, ErrorMessage, valid) {

    if (FieldValue != null && FieldValue != '') {
        if ($.isNumeric(FieldValue) != true) {
            $(ControlId).parent().addClass("is-invalid");
            $(ControlId).parent().find("p").html(ErrorMessage).show();
            valid = false;
        }
        else {
            if (FieldValue.indexOf(".") >= 0) {
                var LL = (FieldValue.toString().split('.')[0]).length;
                var RL = (FieldValue.toString().split('.')[1]).length;
                if (LL == 0 || RL == 0 || LL > MaxLengthBeforeDecimal || RL > MaxLengthAfterDecimal) {
                    $(ControlId).parent().addClass("is-invalid");
                    $(ControlId).parent().find("p").html(ErrorMessage).show();
                    valid = false;
                }
            }
        }
    }

    return valid;
}
/*Global Validators end*/

/*jAlert start*/
function jAlert(msg, title, theme) {
    $.jAlert({
        /*'title': ((title == null || title == '') ? "Message" : title),*/
        'content': msg,
        'theme': ((theme == null || theme == '') ? "default" : title),
        'btns': { 'text': 'Ok', 'theme': 'green' }
    });
}

/*General Helper Functions*/
function CSVToArray(strData, strDelimiter) {

    strDelimiter = (strDelimiter || ",");

    /*Create a regular expression to parse the CSV values.*/
    var objPattern = new RegExp((   /* Delimiters.*/
        "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +
        /* Quoted fields.*/
        "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +
        /*Standard fields.*/
        "([^\"\\" + strDelimiter + "\\r\\n]*))"
    ), "gi"
    );

    var arrData = [[]];
    var arrMatches = null;

    while (arrMatches = objPattern.exec(strData)) {

        /* Get the delimiter that was found.*/
        var strMatchedDelimiter = arrMatches[1];
        if (
            strMatchedDelimiter.length &&
            strMatchedDelimiter !== strDelimiter
        ) {
            arrData.push([]);
        }

        var strMatchedValue;

        if (arrMatches[2]) {
            strMatchedValue = arrMatches[2].replace(
                new RegExp("\"\"", "g"),
                "\""
            );
        } else {
            strMatchedValue = arrMatches[3];
        }

        arrData[arrData.length - 1].push(strMatchedValue);
    }

    return (arrData);
}

function MonthIncrement() {

    if (latest_Month < 12) {
        latest_Month += 1;
    }
    else {
        latest_Year += 1;
        latest_Month = 1;
    }
}

function MonthDecrement() {

    if (latest_Month > 1) {
        latest_Month -= 1;
    }
    else {
        latest_Year -= 1;
        latest_Month = 12;
    }
}

function GetMonthName(MonthValue) {
    var Months = [Jan, Feb, Mar, Apr, May, Jun, Jul, Aug, Sep, Oct, Nov, Dec];
    return Months[MonthValue - 1];
}

function DataArrayToViewModel(DataArray, FCVariableId, AppLevelId, CatId, SingleOrDouble, RECTypeId) {

    var ViewModel = { FCVariableId: FCVariableId, ApplicableLevelId: AppLevelId, CategoryId: CatId, SingleOrDoubleValue: SingleOrDouble, RECTypeId: RECTypeId, MonthRows: null };

    var MonthRows = new Array();

    $.each(DataArray, function (i, iRow) {

        var RowItem = {};
        RowItem.CurveData = new Array();

        $.each(Object.keys(iRow), function (j, jKey) {

            if (jKey.match("^CurveData") && iRow[jKey] != null && iRow[jKey] != undefined) {

                var CurveDataItem = {};

                CurveDataItem.PKValue = parseFloat(iRow[jKey].PKValue);
                CurveDataItem.DataVal1 = parseFloat(iRow[jKey].DataVal1);
                if (SingleOrDouble == FCSingleOrDoubleValue.Double.value) {
                    CurveDataItem.DataVal2 = parseFloat(iRow[jKey].DataVal2);
                }

                RowItem.CurveData.push(CurveDataItem);
            }
            else if (jKey == 'MonthValue') {
                RowItem.MonthValue = iRow[jKey];
            }
            else if (jKey == 'YearValue') {
                RowItem.YearValue = iRow[jKey];
            }
        });

        MonthRows.push(RowItem);
    });

    ViewModel.MonthRows = MonthRows;

    return ViewModel;
}

function ViewModelToDataArray(ViewModel, FKArray) {

    var DataArray = new Array();

    $.each(ViewModel, function (i, iRow) {

        var RowItem = {};
        RowItem.MonthValue = latest_Month = iRow.MonthValue;
        RowItem.YearValue = latest_Year = iRow.YearValue;
        RowItem.MonthYearLabel = GetMonthName(iRow.MonthValue) + ' ' + iRow.YearValue;

        MonthIncrement();

        /*var RowArray = new Array();*/
        $.each(FKArray, function (k, kValue) {

            RowItem["CurveData[" + k + "]"] = {};
            RowItem["CurveData[" + k + "]"].PKValue = kValue;
            RowItem["CurveData[" + k + "]"].DataVal1 = null;
            RowItem["CurveData[" + k + "]"].DataVal2 = null;

            $.each(iRow.CurveData, function (j, jCurve) {
                if (jCurve.PKValue == kValue) {
                    RowItem["CurveData[" + k + "]"].DataVal1 = jCurve.DataVal1;
                    RowItem["CurveData[" + k + "]"].DataVal2 = jCurve.DataVal2;
                }
            });
        });

        DataArray.push(RowItem);
    });

    return DataArray;
}

function ScreenLock() {
    $("#wait").show();
}

function ScreenUnlock() {
    $("#wait").hide();
}

$(document).ajaxStop(function () {
    ScreenLock();
});

$(document).ajaxComplete(function () {
    ScreenUnlock();
});

function SmoothScroll(controlId) {
    $('html, body').stop().animate({ 'scrollTop': $(controlId).offset() == undefined ? 0 : $(controlId).offset().top }, 600, 'swing', function () { });
}

function SmoothScrollModal(controlId) {
    $('.modal .modal-dialog .modal-content .modal-body').stop().animate({ 'scrollTop': $(controlId).offset() == undefined ? 0 : $(controlId).offset().top }, 600, 'swing', function () { });
}

function CallInternalURL(url) {
    $("#frm").attr("src", url);
}

function OpenURLtoNewTab(url) {
    window.open(url, '_blank')
}

Date.prototype.mmddyyyy = function () {
    var yyyy = this.getFullYear().toString();
    var mm = (this.getMonth() + 1).toString();
    var dd = this.getDate().toString();
    return (mm[1] ? mm : "0" + mm[0]) + "/" + (dd[1] ? dd : "0" + dd[0]) + "/" + yyyy;
};

Date.prototype.ddMMMyyyy = function () {
    var yyyy = this.getFullYear().toString();
    var mm = Month[(this.getMonth())].toString();
    var dd = this.getDate().toString();
    return + (dd[1] ? dd : "0" + dd[0]) + "/" + (mm[1] ? mm : "0" + mm[0]) + "/" + yyyy;
};

Date.prototype.yyyyMMdd = function () {
    var d = new Date(this),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();
    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;
    return [year, month, day].join('/');
};

Date.prototype.MMMddyyyy = function () {
    var d = new Date(this),
        month = '' + d.getMonth(),
        day = '' + d.getDate(),
        year = d.getFullYear();
    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;
    return [month, day, year].join('/');
};

function numberWithCommas(x) {
    var a = (x || '').toString().split('.');

    var result = a[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    if (a[1] != null && a[1] != undefined) {
        result += '.' + a[1];
    }

    return result;
}

function tableToExcel(table, sheetName, fileName) {
    debugger
    var ua = window.navigator.userAgent;
    var msie = ua.indexOf("MSIE ");
    if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./))      // If Internet Explorer
    {
        return fnExcelReport(table, fileName);
    }

    var uri = 'data:application/vnd.ms-excel;base64,',
        templateData = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--><meta http-equiv="content-type" content="text/plain; charset=UTF-8"/></head><body><table>{table}</table></body></html>',
        base64Conversion = function (s) { return window.btoa(unescape(encodeURIComponent(s))) },
        formatExcelData = function (s, c) { return s.replace(/{(\w+)}/g, function (m, p) { return c[p]; }) }

    $("tbody > tr[data-level='0']").show();

    if (!table.nodeType) {
        table = document.getElementById(table)
    }

    var ctx = { worksheet: sheetName || 'Worksheet', table: table.innerHTML }

    var element = document.createElement('a');
    element.setAttribute('href', 'data:application/vnd.ms-excel;base64,' + base64Conversion(formatExcelData(templateData, ctx)));
    element.setAttribute('download', fileName);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    $("tbody > tr[data-level='0']").hide();
}

function ExportToExcel(tableName, type) {

    // $(tableName).tableExport({ type: type, escape: 'false' });

    var fulltableName = 'Table';
    $(tableName).find('template').each(function (index, data) {
        fulltableName = $(this).html().trim();
    });

    tableToExcel(tableName.slice(1), fulltableName, fulltableName + '.xls');
}

function ExportToExcel1(tableName, type) {

    // $(tableName).tableExport({ type: type, escape: 'false' });

    var fulltableName = 'Table';
    $(tableName).find('template').each(function (index, data) {
        fulltableName = $(this).html().trim();
    });

    $(tableName).table2excel({
        // exclude CSS class
        exclude: ".UpdateColumn,.ApprovalColumn,.DeleteColumn,.UtilityMeterColumn,.MapBuildingContact,.RenewLease,.ExtendLease,.BuildingMenu,.DeActivateMenu,.DetailsColumn,.StatusColumn,.IsActive",
        name: fulltableName,
        filename: fulltableName, //do not include extension,
        fileext: ".xlsx"
    });
}

function ExportToExcelGrid(tableName, type) {
    $("" + tableName + "_length select option:last").attr("selected", "selected").change();
    ExportToExcel(tableName, type);
    $("" + tableName + "_length select option:first").attr("selected", "selected").change();
}

function ExportToExcelGrid1(tableName, type) {
    $("" + tableName + "_length select option:last").attr("selected", "selected").change();
    ExportToExcel1(tableName, type);
    $("" + tableName + "_length select option:first").attr("selected", "selected").change();
}


function ExportToPDF(tableName, type) {
}

function SetSelectedListBox(ControlID) {

    $("" + ControlID + " option").each(function () {
        $(this).prop('selected', true);
    });
}

function SetValueToListBox(ControlID, jsonListObject, ColumnName) {

    $options = $("" + ControlID + " option");

    $.each(jsonListObject, function (i, item) {
        if (ColumnName == null || ColumnName == undefined) {
            $options.filter('[value="' + item.Value + '"]').prop('selected', true);
        } else
            $options.filter('[value="' + item[ColumnName] + '"]').prop('selected', true);
    });
}

function SetValueToListBoxType(ControlID, strlist, splitChar) {
    try {
        var TypeIDs = strlist.split(splitChar);
        $options = $("" + ControlID + " option");

        for (var i = 0; i < TypeIDs.length; i++) {
            $options.filter('[value="' + TypeIDs[i] + '"]').prop('selected', true);
        }

    } catch (e) {
    }
}

function GetValueToListBoxSelected(ControlID, PropertyName) {
    var returnVal = [];
    $(ControlID + " :selected").each(function (i, selected) {
        var rowstring = {};
        rowstring[PropertyName] = $(selected).val().toString().trim();
        returnVal.push(eval(rowstring));
    });

    return returnVal;
}

function GetValueToListBoxSelectedValueText(ControlID) {
    var returnVal = [];
    $(ControlID + " :selected").each(function (i, selected) {
        var rowstring = {
            Value: $(selected).val().toString().trim(),
            Text: $(selected).text().toString().trim(),
            Selected: false,
        };
        returnVal.push(eval(rowstring));
    });

    return returnVal;
}

function GetValueToListBoxNotSelected(ControlID) {
    var returnVal = '';

    var iddeStatus = $(ControlID).val();
    if ((iddeStatus != null) || (iddeStatus != "")) {
        var unSelected = $(ControlID).find('option').not(':selected');
        for (var i = 0; i < unSelected.length; i++) {
            returnVal += unSelected[i].value + ',';
        }

    } else {
        alert('else part')
    }

    return returnVal;
}

function GetValueToListBoxNotSelected(ControlID, PropertyName) {
    var returnVal = [];
    $(ControlID).find('option').not(':selected').each(function (i, item) {
        var rowstring = {};
        rowstring[PropertyName] = $(item).val().toString().trim();
        returnVal.push(eval(rowstring));
    });

    return returnVal;
}

function GetValueToListBoxNotSelected(ControlID, PropertyName) {
    var returnVal = [];
    $(ControlID).find('option').not(':selected').each(function (i, item) {
        var rowstring = {};
        rowstring[PropertyName] = $(item).val().toString().trim();
        returnVal.push(eval(rowstring));
    });

    return returnVal;
}

function GetValueToListBox(ControlID) {
    var returnVal = "";

    $(ControlID + " option").each(function () {
        returnVal += $(this).val().toString() + ",";
    });

    return returnVal;
}

function GetValueToListBoxSelectedCompanyType(ControlID) {
    return GetValueToListBoxSelectedType();
}

function GetValueToListBoxSelectedType(ControlID) {

    var returnVal = "";

    $(ControlID + " :selected").each(function (i, selected) {
        returnVal += $(selected).val().toString() + "#";
    });

    return returnVal;
}

function checkSubmit(e, submitBtnID) {

    $(document).ready(function () {
        if (e && e.keyCode == 13) {
            $(submitBtnID).click();
        }
    });
}

function Checkddmmyyyy(value) {
    var date = value.split("/");
    var d = parseInt(date[0], 10),
        m = parseInt(date[1], 10),
        y = parseInt(date[2], 10);
    return new Date(y, m - 1, d);
}

function GetTimeInto24Hour(value) {
    /*http://stackoverflow.com/questions/15083548/convert-12-hour-hhmm-am-pm-to-24-hour-hhmm*/
    if (value.length > 0) {
        var time = value.trim();
        var hours = Number(time.match(/^(\d+)/)[1]);
        var minutes = Number(time.match(/:(\d+)/)[1]);
        var AMPM = time.match(/\s(.*)$/)[1];
        if (AMPM == "PM" && hours < 12) hours = hours + 12;
        if (AMPM == "AM" && hours == 12) hours = hours - 12;
        var sHours = hours.toString();
        var sMinutes = minutes.toString();
        if (hours < 10) sHours = "0" + sHours;
        if (minutes < 10) sMinutes = "0" + sMinutes;
        return (sHours + ":" + sMinutes);
    }

    return null;
}

function GetTime24HourInto12(value) {
    /*https://www.webprogs.com/2017/05/convert-24-hour-time-12-hour-time-using-javascript*/

    if (value.length > 0) {
        var time = new Date(2012, 01, 01, value.Hours, value.Minutes, 0, 0);
        var hours = time.getHours() > 12 ? time.getHours() - 12 : time.getHours();
        var am_pm = time.getHours() >= 12 ? "PM" : "AM";
        hours = hours < 10 ? "0" + hours : hours;
        var minutes = time.getMinutes() < 10 ? "0" + time.getMinutes() : time.getMinutes();
        var seconds = time.getSeconds() < 10 ? "0" + time.getSeconds() : time.getSeconds();

        time = hours + ":" + minutes + ":" /*+ seconds*/ + " " + am_pm;
        return (time);
    }

    return null;
}

function GetScreenAccessPermissions(ScreenID) {
    /*no such array*/
    ScreenID = eval(ScreenID);

    var userScreenInfo = ConfigurationData_UserScreenInfoList();
    var userScreenActionInfo = ConfigurationData_UserScreenActionInfoList();

    if (!(userScreenInfo.length > 0))
        return;

    var finalArray = [];
    /*search array for key*/
    for (var i = 0; i < userScreenInfo.length; ++i) {
        /*if the ScreenID is what we are looking for return it*/
        if (userScreenInfo[i].ScreenID === ScreenID) {
            finalArray.push(userScreenInfo[i]);
            if (userScreenActionInfo.length > 0 && userScreenActionInfo != null) {
                for (var j = 0; j < userScreenActionInfo.length; ++j) {
                    if (userScreenActionInfo[j].ScreenID === ScreenID) {
                        /*$.extend(userScreenInfo[i], userScreenActionInfo[j]);*/
                        finalArray.push(userScreenActionInfo[j]);
                        /*return finalArray;*/
                    }
                }
                return finalArray;
            }
            else
                return finalArray;
        }
    }
}

function GetScreenPermissions(ModuleCode, ScreenName) {

    var userScreenInfo = ConfigurationData_UserScreenInfoList();
    var userScreenActionInfo = ConfigurationData_UserScreenActionInfoList();

    if (!(userScreenInfo.length > 0))
        return;

    var finalArray = [];
    var ScreenSet = $.grep(userScreenInfo, function (item, i) { return item.ModuleCode === ModuleCode && item.ObjectName === ScreenName; });

    if (ScreenSet.length > 0) {
        finalArray.push(ScreenSet);

        var ScreenActionSet = [];
        $.each(ScreenSet, function (i, item) {
            if (item.ScreenID > 0) {
                var ScreenAction = $.grep(userScreenActionInfo, function (item2, i) { return item2.ScreenID === item.ScreenID; });
                if (ScreenAction.length > 0) {
                    ScreenActionSet.push(ScreenActionSet);
                }
            }
        });

        if (ScreenActionSet.length > 0)
            finalArray.push(ScreenActionSet);
    }

    return finalArray;
}

function AllowOnlyNumberOrDecimalValue(MyID) {
    $(MyID).on("input", function (evt) {
        var self = $(this);
        self.val(self.val().replace(/[^0-9\.]/g, ''));
        if ((evt.which != 46 || self.val().indexOf('.') != -1) && (evt.which < 48 || evt.which > 57)) {
            evt.preventDefault();
        }
    });
}

function AllowOnlyNumberValue(MyID) {
    $(MyID).on("input", function (evt) {
        var self = $(this);
        self.val(self.val().replace(/\D/g, ''));
        if ((evt.which != 46 || self.val().indexOf('.') != -1) && (evt.which < 48 || evt.which > 57)) {
            evt.preventDefault();
        }
    });
}

function AllowCharacterNumber(MyID) {
    /*this is Currenly use for LoginName purpose*/
    $(MyID).keypress(function (e) {
        var regex = new RegExp("^[a-zA-Z0-9]+$");
        var str = String.fromCharCode(!e.charCode ? e.which : e.charCode);
        if (regex.test(str))
            return true;
        e.preventDefault();
        return false;
    });
}

Date.isLeapYear = function (year) {
    return (((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0));
};

Date.getDaysInMonth = function (year, month) {
    return [31, (Date.isLeapYear(year) ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
};

Date.prototype.isLeapYear = function () {
    return Date.isLeapYear(this.getFullYear());
};

Date.prototype.getDaysInMonth = function () {
    return Date.getDaysInMonth(this.getFullYear(), this.getMonth());
};

Date.prototype.addMonths = function (value) {
    var n = this.getDate();
    this.setDate(1);
    this.setMonth(this.getMonth() + value);
    this.setDate(Math.min(n, this.getDaysInMonth()));
    return this;
};

Date.prototype.addDays = function (days) {
    var dat = new Date(this.valueOf());
    dat.setDate(dat.getDate() + days);
    return dat;
}

function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    month = GetMonthShortName(month);
    /*if (month.length < 2) month = '0' + month;*/
    if (day.length < 2) day = '0' + day;

    return [day, month, year].join('/');
}

function GetMonthShortName(MonthValue) {
    return Month[MonthValue - 1];
}

function FocusOnError(FormID, valid) {
    if (!valid) {
        SmoothScroll(FormID + " .is-invalid:first");
        $(FormID + " .is-invalid .form-control:first").focus();
    }
}

function Reset_Form_Errors() {
    $(".input-group").removeClass("is-invalid");
    $(".form-group").removeClass("is-invalid");
    $(".form-control").removeClass("is-invalid");

    $(".form-group p").html("");
    $(".form-group p").hide();
    $(".ErrorText").hide();
    $("td").removeClass("is-invalid");
    $("span[role=combobox]").removeAttr("style");
}

function ResetFormErrors(formID) {
    $(formID + " .is-invalid p").html("").hide();
    $(formID + " .form-group").removeClass("is-invalid");
    $(formID + " .is-invalid").removeClass("is-invalid");
    $(formID + " .form-group p").html("");
    $(formID + " .form-group p").hide();
    $("span[role=combobox]").removeAttr("style");
}

function ShowTotalCount(Resource, table, Count) {

    var row = ' <label style="margin-left:5%" class="' + table + '"> ' + Resource + ' : ' + Count + '</label> '
    $('#' + table).append(row);
}

function GetAddButton(divID, action, text) {
    return $(divID).html('<a href="javascript:;" class="btn btn-brand btn-elevate btn-icon-sm' + action + '<i class="fas fa-plus-circle"></i> ' + text + '</a>');
}

function GetEditButton(divID, action) {
    return $(divID).html('<i onclick=' + action + ' style="cursor:pointer; margin-top: 7px;color: #379465;" class="fa fa-pencil-square fa-2x"></i>');
}

function GetDeleteButton(divID, action) {
    return $(divID).html('<i onclick=' + action + ' style="cursor:pointer; margin-top: 7px;color: #d21c1c;" class="fa fa-trash fa-2x"></i>');
}

function GetExpandButton(divID, action) {
    return $(divID).html('<i onclick=' + action + ' style="cursor:pointer; margin-top: 7px;color: #e06fa7;" class="fa fa-expand fa-2x"></i>');
}

function GetCollapseButton(divID, action) {
    return $(divID).html('<i onclick=' + action + ' style="cursor:pointer; margin-top: 7px;color: #e06fa7;" class="fa fa-compress fa-2x"></i>');
}

function GetExportButton(divID, buttonID, tableName, type) {
    var method = "onclick='ExportToExcel(" + tableName + "," + type + ");'";
    return $(divID).html("<a id=" + buttonID + " href='#' style='margin-right: 9px !important;color:#FFF;' class='dt-button buttons-excel' tabindex='0' aria-controls='dynamic-table' " + method + "><i style='font-size: 20px !important;' class='fa fa-file-excel-o bigger-110' title='Export to " + type + "'></i> <span class='hidden'>Export to " + type + "</span></a>");
}

function GetButton(divID, action, symbolClass) {
    return $(divID).html('<i onclick=' + action + ' style="cursor:pointer; margin-top: 7px;" class="' + symbolClass + '"></i>');
}

/*Load add/update partial view*/
function LoadAddUpdateView(divID, AjaxURL, panelTitle, callback) {
    $.ajax({
        url: AjaxURL,
        contentType: 'application/html; charset=utf-8',
        type: 'GET',
        dataType: 'html',
        success: function (data) {

            $(divID).html(data).show();//.find(".panel-heading span").html(panelTitle);

            if (panelTitle != null && panelTitle != "")
                $(divID).find(".panel-heading span").html(panelTitle);

            /*SmoothScroll(divID); commented due to it scroll page*/
            if (callback && typeof (callback) === "function")
                callback();
        }
    });
}

function SetSelectedRow(ControlId, id) {
    $(ControlId + " tr").removeClass("selected");
    $(ControlId + " #tr" + id).addClass("selected");
}

function UnSelectRow(tableID) {
    $(tableID + " tr").removeClass("selected");
}

function SetScreenInfo(data) {
    //if (localStorage["UserScreenInfo"] == null)
    localStorage["UserScreenInfo"] = data;
}

function ScreenActionInfo(data) {
    //if (localStorage["UserScreenActionInfo"] == null)
    localStorage["UserScreenActionInfo"] = data;
}

function ConfigurationData_UserScreenInfoList() {
    var GetconfigData = localStorage["UserScreenInfo"];
    return (JSON.parse(GetconfigData));
}
/* Modified By: Sagar 
 * Date: 7 AUG 2019
 * Cause: Due to error of empty string
 * Comment: If error occurred In any configuration method do include modified code
 * */
function ConfigurationData_UserScreenActionInfoList() {
    var GetconfigData = localStorage["UserScreenActionInfo"];
    if (!IsNotNull(GetconfigData))
        GetconfigData = JSON.stringify({});

    return (JSON.parse(GetconfigData));
}

function SetConfigurationData(data) {
    if (localStorage["GetConfigurationData"] == null)
        localStorage["GetConfigurationData"] = data;
}

function ConfigurationDatalocalStorage() {
    var GetconfigData = localStorage["GetConfigurationData"];
    return (JSON.parse(GetconfigData));
}

function ConfigurationData_LanguageList() {
    var json1 = ConfigurationDatalocalStorage();
    return (json1.LanguageList);
}

function ConfigurationData_ModuleList() {
    var json1 = ConfigurationDatalocalStorage();
    var updatedlist = RemoveJsonItem("IsForEndUser", "0", json1.ModuleList);
    return (updatedlist);
}

function ConfigurationData_ModuleListAll() {
    var json1 = ConfigurationDatalocalStorage();
    var updatedlist = json1.ModuleList;/*RemoveJsonItem("IsForEndUser", "0", json1.ModuleList);*/
    return (updatedlist);
}

function ConfigurationData_CountryList() {
    var json1 = ConfigurationDatalocalStorage();
    return (json1.CountryList);
}

function ConfigurationData_ServiceLineList() {
    var json1 = ConfigurationDatalocalStorage();
    return (json1.ServiceLineList);
}

function ConfigurationData_ConfigurationCodeList() {
    var json1 = ConfigurationDatalocalStorage();
    return (json1.ConfigurationCodeList);
}

function ConfigurationData_TimeUnitList() {
    var json1 = ConfigurationDatalocalStorage();
    return (json1.TimeUnitList);
}

function ConfigurationData_PriorityLevelList() {
    var json1 = ConfigurationDatalocalStorage();
    return (json1.PriorityLevelList);
}

function ConfigurationData_FrequencyTimeUnitList() {
    var json1 = ConfigurationData_TimeUnitList();
    var freqData = [];
    $.each(json1, function (i, item) {
        if (item.IsUsedForFrequency) {
            item.Text = item.FrequencyName;
            freqData.push(item);
        }
    });
    /*This is sorting for Training Dashbord purpose*/
    freqData.sort(function (a, b) {
        return a.SequenceNo - b.SequenceNo;
    });

    return (freqData);
}

function ConfigurationData_ResolutionTimeUnitList() {
    var json1 = ConfigurationData_TimeUnitList();
    var resData = [];
    $.each(json1, function (i, item) {
        if (item.IsUsedForResolution)
            resData.push(item);
    });
    return (resData);
}

function ConfigurationData_RiskLevelList() {
    var json1 = ConfigurationDatalocalStorage();
    return (json1.RiskLevelList);
}

function ConfigurationData_SeverityLevelList() {
    var json1 = ConfigurationDatalocalStorage();
    return (json1.SeverityLevelList);
}

function ConfigurationData_InspectionTypeList() {
    var json1 = ConfigurationDatalocalStorage();
    return (json1.InspectionTypeList);
}

function ConfigurationData_FRASInspectionTypeList() {
    var json1 = ConfigurationDatalocalStorage();
    //var json1 = {
    //    FRASInspectionTypeList: [{
    //        Value: "RISK", Text: "Risk Assessment Full",
    //        InspectionType: "RISK", InspectionTypeName: "Risk Assessment Full",
    //    }, {
    //        Value: "RISKBURN", Text: "Risk Assessment - Burn",
    //        InspectionType: "RISKBURN", InspectionTypeName: "Risk Assessment - Burn"
    //    }, {
    //        Value: "RISKESCAPE", Text: "Risk Assessment - Escape",
    //        InspectionType: "RISKESCAPE", InspectionTypeName: "Risk Assessment - Escape"
    //    }, {
    //        Value: "RISKControl", Text: "Risk Assessment - MgtControl",
    //        InspectionType: "RISKControl", InspectionTypeName: "Risk Assessment - MgtControl"
    //    }, {
    //        Value: "RISKMainControl", Text: "Risk Assessment - MainControl",
    //        InspectionType: "RISKMainControl", InspectionTypeName: "Risk Assessment - Main Control"
    //    }, {
    //        Value: "HAZ", Text: "Hazards",
    //        InspectionType: "HAZ", InspectionTypeName: "Hazards"
    //    }, {
    //        Value: "PreFirePlan", Text: "Pre Fire Plan",
    //        InspectionType: "PreFirePlan", InspectionTypeName: "Pre Fire Plan"
    //    }
    //    ]
    //}; /*ConfigurationDatalocalStorage();*/

    return json1.FRASInspectionTypeList;
}

function ConfigurationData_ServiceLevelList() {
    var json1 = ConfigurationDatalocalStorage();
    return (json1.ServiceLevelList);
}

function ConfigurationData_AttributeTypeList() {
    var json1 = ConfigurationDatalocalStorage();
    return (json1.AttributeTypeList);
}

function ConfigurationData_CheckListsAttributeTypeList() {
    var json1 = ConfigurationData_AttributeTypeList();
    var checkListData = [];
    $.each(json1, function (i, item) {
        if (item.IsUsedForCheckLists) {
            item.Text = item.AttributeTypeName;
            checkListData.push(item);
        }
    });
    return (checkListData);
}

function ConfigurationData_RiskAssessmentParameterAttributeTypeList() {
    var json1 = ConfigurationData_AttributeTypeList();
    var RiskAssessmentParameterData = [];
    $.each(json1, function (i, item) {
        if (item.IsUsedForHiraParameter) {
            item.Text = item.AttributeTypeName;
            RiskAssessmentParameterData.push(item);
        }
    });
    return (RiskAssessmentParameterData);
}
//DateTimeDataFormat.DatePickerFormat
var DateTimeDataFormat = {
    DatePickerFormat: "DD/MMM/YYYY",
    DateTimePickerFormat: "dd/M/yyyy HH:mm:tt",

    DateTimeAMPMPickerFormat: "DD/MMM/YYYY HH:mm A",
    DateLabelFormat: "dd/MMM/yyyy",
    /*some date picker required this format*/
    ddMyyyy: 'dd/M/yyyy',
    ddMMyyyy: 'dd/MM/yyyy'
};

Date.prototype.mmddyyyy = function () {
    var yyyy = this.getFullYear().toString();
    var mm = (this.getMonth() + 1).toString();
    var dd = this.getDate().toString();
    return (mm[1] ? mm : "0" + mm[0]) + "/" + (dd[1] ? dd : "0" + dd[0]) + "/" + yyyy;
};

function ConfigurationData_DateFormat() {
    return DateTimeDataFormat.DatePickerFormat;
}

function ConfigurationData_DateTimeAMPMFormat() {
    return DateTimeDataFormat.DateTimeAMPMPickerFormat;
}

function ConfigurationData_IsSingleCustomer() {
    var json1 = ConfigurationDatalocalStorage();
    return (json1.IsSingleCustomerList);
    /*return ({ IsSingleUserCustomer: false, IsSingleInstance: false, CustomerID: 8, CustomerName: "CSIA" });*/
}

function FillStaticCustomer(CustomerID, callback) {
    var obj = ConfigurationData_IsSingleCustomer();
    if (obj[0].IsSingleInstance || obj[0].IsSingleUserCustomer) {
        $(CustomerID).val(obj[0].CustomerName).attr("data-label", obj[0].CustomerName).attr("data-id", obj[0].CustomerID).css({ "cursor": "default", "background-color": "#f5f5f5!important" });
        $(CustomerID).prop('readonly', true).prop('disabled', true);

        if (callback && typeof (callback) === "function")
            callback(obj);
    }
}

function GetLanguageWiseMasterAddEditForm(masterModel) {
    var LanguageJson = ConfigurationData_LanguageList();/*eval(data.data);*/

    if (masterModel != null) {
        for (var i = 0; i < masterModel.length; i++) {
            var item = masterModel[i];
            for (var j = 0; j < LanguageJson.length; j++) {
                var itemSub = LanguageJson[j];
                if (item.LanguageCode == itemSub.LanguageCode) {
                    /*ADD COLUMN LanguageName INTO JSON ROW*/
                    item["LanguageName"] = itemSub.LanguageName;
                    break;
                }
            }
        }

        return LanguageJson = masterModel;
    }

    return LanguageJson;
}

function BindEntityLanguageGrid(tbl, Data, PropertyName) {

    var LanguageJson = ConfigurationData_LanguageList();

    $("#" + tbl + " tbody").html("");
    $("#Grid_Data_Template_" + tbl).tmpl(LanguageJson).appendTo("#" + tbl + " tbody");

    if (Data != null)
        $.each(Data, function (ID, item) {
            $("#" + tbl + " tbody tr").each(function () {
                if ($(this).attr("data-id") === item.LanguageCode) {
                    $("#txt" + PropertyName + "" + $(this).attr("data-id")).val(item[PropertyName]);
                }
            });
        });
}

/*it only work for POST method*/
function DeleteData(xhr, Ajaxurl, AjaxData, ItemInfo, callback) {

    if (true) {
        /*console.log(ItemInfo.toString().indexOf("("));
        if (ItemInfo != "" && ItemInfo != null && ItemInfo.toString().indexOf("(") < 0)
           ItemInfo = ' (' + ItemInfo + ')';*/

        if (AjaxData != null) {
            $.confirm({
                theme: 'modern',
                title: 'Are you sure you want to delete?',
                content: ItemInfo,
                animation: 'zoom',
                closeAnimation: 'scale',
                backgroundDismiss: true,
                //autoClose: 'cancel|5000',
                animationSpeed: '200',
                icon: 'far fa-question-circle',
                closeIcon: true,
                columnClass: 'col-md-4 col-md-offset-4 col-sm-6 col-sm-offset-3 col-xs-10 col-xs-offset-1',
                buttons: {
                    confirm: {
                        text: 'Yes',
                        btnClass: 'btn btn-primary',
                        action: function () {
                            if (xhr && xhr.readystate != 4)
                                xhr.abort();

                            xhr = $.ajax({
                                /*url: Ajaxurl, cache: false, data: AjaxData,*/
                                type: "POST", cache: false, url: Ajaxurl, data: AjaxData,
                                success: function (data) {
                                    debugger;

                                    var result = data.data;

                                    if (result["status"] === true) {

                                        if (data != null && data.status.toLowerCase() == "success") {
                                            showSweetAlert("Success!", data.message, "success", null);

                                            if (callback && typeof (callback) === "function")
                                                callback();

                                        } else if (data != null && data.status.toLowerCase() == "error") {

                                            if ((data.message.indexOf("_FK_") !== -1))
                                                showSweetAlert("Warning!", "Used In Another Entity", "warning", null);
                                            else
                                                showSweetAlert("Error!", data.message, "error", null);
                                        }
                                        else showSweetAlert("Error!", data.message, "error", null);

                                    }
                                    else {
                                        showSweetAlert("Failed", result.message, "error", null);
                                    }




                                }
                            });
                        },
                    },
                    cancel: {
                        text: 'No',
                        btnClass: 'btn btn-default',
                        action: function () {

                        }
                    }
                }
            });
        }
    }
}

var LoadChosen = function (chosenID, IsMultipleSelect) {
    if (!ace.vars['touch']) {
        $(chosenID).chosen({ allow_single_deselect: IsMultipleSelect, default_multiple_text: Select, default_single_text: Select, default_no_result_text: "No Data found" });

        /*resize the chosen on window resize*/
        $(window).off('resize.chosen').on('resize.chosen', function () {
            $(chosenID).each(function () {
                var $this = $(this);
                $this.next().css({ 'width': $this.parent().width() });
            });
        }).trigger('resize.chosen');

        /*resize chosen on sidebar collapse/expand*/
        $(document).on('settings.ace.chosen', function (e, event_name, event_val) {
            if (event_name != 'sidebar_collapsed') return;
            $(chosenID).each(function () {
                var $this = $(this);
                $this.next().css({ 'width': $this.parent().width() });
            });
        });

        $(chosenID).trigger('chosen:updated');

        var style = $(chosenID).attr("chosenstyle");
        if (style != null && style != undefined && IsMultipleSelect == true)
            $(chosenID + "_chosen ul.chosen-choices").attr("style", style).show();/*.css({ "overflow": "auto", "max-height": "200px" });*/
    }
}

function RemoveJsonItem(property, value, JsonItemArray) {
    for (var i in JsonItemArray)
        if (JsonItemArray[i][property] == value)
            JsonItemArray.splice(i, 1);

    return JsonItemArray;
}

function findElement(arr, propName, propValue) {
    for (var i = 0; i < arr.length; i++)
        if (arr[i][propName] == propValue)
            return arr[i];

    /* will return undefined if not found; you could return a default instead*/
}

function IsNotNull(val) { if (val == 0 || val == null || val == "" || val == undefined) return false; else return true; }

function IsDataExists(val) {
    if (IsNotNull(val) && val.length > 0) {
        return true;
    }
    else false;
}

function AddUpdateData(Ajaxurl, AjaxData, SuccessCallback, ErrorCallback) {
    debugger;
    $.ajax({
        type: "POST", cache: false, url: Ajaxurl, data: AjaxData,
        success: function (data) {
            if (data != null) {
                if (data.status == 'Success') {
                    if (SuccessCallback && typeof (SuccessCallback) === "function")
                        SuccessCallback(data);
                } else if (data.status == 'Error') {

                    if (data.toString().indexOf("LoginBody") >= 0) {
                        window.open(ProjectURL.BaseURL, "_self")
                    }

                    if (ErrorCallback && typeof (ErrorCallback) === "function")
                        ErrorCallback(data);
                }

            } /*else showSweetAlert("Error!", data.message, "error", null);*/
        }
    });
}

function GetAjaxData(Ajaxurl, AjaxData, SuccessCallback, ErrorCallback) {

    /*Below three lines added for Inpsection form grid data load by lazy load*/
    var async = true, timeout = null;
    if (AjaxData.async == undefined) async = AjaxData.async;
    if (AjaxData.timeout == undefined) timeout = AjaxData.timeout;

    $.ajax({
        type: "POST", cache: false, url: Ajaxurl, data: AjaxData, async: async, timeout: timeout,
        success: function (data) {
            if (data != null) {
                if (data.status == 'Success') {
                    if (SuccessCallback && typeof (SuccessCallback) === "function")
                        SuccessCallback(data);
                } else if (data.status == 'Error') {

                    if (data.toString().indexOf("LoginBody") >= 0) {
                        window.open(ProjectURL.BaseURL, "_self")
                    }

                    if (ErrorCallback && typeof (ErrorCallback) === "function")
                        ErrorCallback(data);
                } else if (data.toString().indexOf("LoginBody") >= 0) {
                    window.open(ProjectURL.BaseURL, "_self")
                }

            } else showSweetAlert("Error!", data.message, "error", null);
        }
    });
}

function Merge2JsonObject(MergeToModel, MasterSourceJson, AddNewMergeColumnName, MergeColumnNameValue, MergeColumnValue) {

    var returnModel = [];

    if (MergeToModel != null) {
        if (MergeColumnValue == null) MergeColumnValue = MergeColumnNameValue;

        for (var i = 0; i < MergeToModel.length; i++) {/*Destination model*/

            var to = MergeToModel[i];

            for (var j = 0; j < MasterSourceJson.length; j++) {
                var from = MasterSourceJson[j];
                if (to[MergeColumnValue] != null)
                    if (to[MergeColumnValue].toString() === from[MergeColumnNameValue].toString()) {
                        to[AddNewMergeColumnName] = from[MergeColumnNameValue];
                        returnModel.push(to);
                        break;
                    }
            }
        }
    }

    return returnModel;
}

function ChosenItemDisable(formcontrol, data, CheckPropertyName, PropertyName, DisabledToolTip) {
    $.each(data, function (i, item) {
        if (item[CheckPropertyName] === true) {
            $(formcontrol + " option[value='" + item[PropertyName].toString() + "']").prop("disabled", true);
            $(formcontrol).trigger('chosen:updated');
            if (DisabledToolTip != null)
                $(formcontrol + "_chosen .search-choice-disabled").attr("title", DisabledToolTip);
        }
    });
}
/* This Wont Allow New Input */
function BindAutoComplete(ControlID, AjaxUrl, MinLengthSearch, TextColumnName, ValueColumnName, preCallback, SelectCallback, onChangeCallback) {

    $(ControlID).autocomplete({
        source: function (request, response) {
            var AjaxData = {};
            if (preCallback && typeof (preCallback) === "function")
                AjaxData = preCallback(AjaxData);

            if (AjaxData === undefined)
                return;

            $.ajax({
                url: AjaxUrl, data: AjaxData,/*type: "POST",*/traditional: true, cache: false,
                success: function (data) {
                    response($.map(eval(data.data), function (item) {
                        if (TextColumnName == null || ValueColumnName == null)
                            return { label: item.Text, val: item.Value };
                        else
                            return { label: item[TextColumnName], val: item[ValueColumnName] };
                    }));
                },
                error: function (response) { }, failure: function (response) { }
            });
        },
        select: function (e, i) {

            $(e.target).attr("data-id", i.item.val).attr("data-label", i.item.label);

            if (SelectCallback && typeof (SelectCallback) === "function")
                SelectCallback(e, i);
        },
        change: function (event, ui) {

            if (ui.item == null || ui.item == undefined) {
                if ($(event.target).val().trim().length > 0) {/*Bind Previous Item*/
                    if ($(event.target).hasAttr('data-label') != false && $(event.target).hasAttr('data-id') != false) {
                        $(event.target).val($(event.target).attr("data-label")).attr($(event.target).attr("data-id"));
                    } else
                        $(event.target).val("");
                } else $(event.target).attr("data-label", "").attr("data-id", "");
            } else {
                $(event.target).attr("data-id", ui.item.val).attr("data-label", ui.item.label);
            }

            if (onChangeCallback && typeof (onChangeCallback) === "function")
                onChangeCallback(event, ui);
        },
        minLength: MinLengthSearch
    });
}
/* This Will Allow New Input */
function BindAutoCompleteCurrentData(ControlID, AjaxUrl, MinLengthSearch, TextColumnName, ValueColumnName, preCallback, SelectCallback, onChangeCallback) {

    $(ControlID).autocomplete({
        source: function (request, response) {
            var AjaxData = {};
            if (preCallback && typeof (preCallback) === "function")
                AjaxData = preCallback(AjaxData);

            if (AjaxData === undefined)
                return;

            $.ajax({
                url: AjaxUrl, data: AjaxData,/*type: "POST",*/traditional: true, cache: false,
                success: function (data) {

                    response($.map(eval(data.data), function (item) {
                        if (TextColumnName == null || ValueColumnName == null)
                            return { label: item.Text, val: item.Value };
                        else
                            return { label: item[TextColumnName], val: item[ValueColumnName] };
                    }));
                },
                error: function (response) { }, failure: function (response) { }
            });
        },
        select: function (e, i) {

            $(e.target).attr("data-id", i.item.val).attr("data-label", i.item.label);

            if (SelectCallback && typeof (SelectCallback) === "function")
                SelectCallback(e, i);
        },
        minLength: MinLengthSearch
    });
}

function ShowUploadImagePreview(input, ImageControlID) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();
        reader.onload = function (e) {
            /*$(ImageControlID).css('visibility', 'visible');*/
            $(ImageControlID).attr('src', e.target.result);
            $(ImageControlID).show();
        }
        reader.readAsDataURL(input.files[0]);
        $(ImageControlID).show();
    } else {

    }
}

function GetNoOfVisits(fromDate, months, frequency) {
    var FromDate = new Date(fromDate); var ToDate = new Date(fromDate); ToDate.setMonth(ToDate.getMonth() + months);
    /*var days = dayDiff(FromDate, ToDate) - 1;*/
    var days = dayDiff(FromDate, ToDate);
    switch (frequency) {
        case "DY":
            days = days; break;
        case "WK":
            days = Math.round(days / 7); break;
        case "MT":
            days = months; break;
        case "QR":
            days = Math.round(months / 3); break;
        case "SA":
            if (months > 3)
                days = Math.round(months / 6);
            else
                days = 0;
            break;
        case "YR":
            if (months > 6)
                days = Math.round(months / 12);
            else
                days = 0;
            break;
        case "2Y":
            if (months > 12)
                days = Math.round(months / (2 * 12));
            else
                days = 0;
            break;
        case "5Y":
            if (months > 24)
                days = Math.round(months / (5 * 12));
            else
                days = 0;
            break;
        default:
            break;
    }

    return days;
}

function dayDiff(FromDate, ToDate) {
    return ((ToDate - FromDate) / (1000 * 60 * 60 * 24));
}

function ConvertTimeAMPMTo24Hour(inputval) {

    if (inputval.length > 0) {
        var tokens = /([10]?\d):([0-5]\d) ([ap]m)/i.exec(inputval);
        if (tokens == null) { return null; }
        if (tokens[3].toLowerCase() === 'pm' && tokens[1] !== '12') {
            tokens[1] = '' + (12 + (+tokens[1]));
        } else if (tokens[3].toLowerCase() === 'am' && tokens[1] === '12') {
            tokens[1] = '00';
        }

        var convertedval = tokens[1] + ':' + tokens[2];
        return (convertedval);
    } else {
        return null;
    }
}

function ArraytoObject(arr) {
    var rv = {};
    for (var i = 0; i < arr.length; ++i)
        rv[i] = arr[i];
    return rv;
}

function GetXrefModelByLanguageCode(MergeToModel, XrefModelName, AddNewColumnName, ColumnName, CurrentLangugeCode) {
    var returnModel = [];

    if (MergeToModel != null) {
        for (var i = 0; i < MergeToModel.length; i++) {

            var to = MergeToModel[i];
            var sourceJson = MergeToModel[i][XrefModelName];

            for (var j = 0; j < sourceJson.length; j++) {
                var from = sourceJson[j];
                if (from[ColumnName] === CurrentLangugeCode) {
                    to[AddNewColumnName] = from[AddNewColumnName];
                    returnModel.push(to);
                    break;
                }
            }
        }
    }

    return returnModel;
}

function ImageViewer(ID) {
    /*<link href='~/Assets/css/colorbox.min.css' rel='stylesheet' /> <script src='~/Assets/js/jquery.colorbox.min.js'></script>*/
    $(document).ready(function () {

        var $overflow = '';
        var colorbox_params = {
            rel: 'colorbox', reposition: true, scalePhotos: true, scrolling: false,
            previous: '<i class="ace-icon fa fa-arrow-left"></i>',
            next: '<i class="ace-icon fa fa-arrow-right"></i>',
            close: '&times;', current: '{current} of {total}', maxWidth: '100%', maxHeight: '100%',
            onOpen: function () { $overflow = document.body.style.overflow; document.body.style.overflow = 'hidden'; },
            onClosed: function () { document.body.style.overflow = $overflow; },
            onComplete: function () { $.colorbox.resize(); }
        };

        $(ID + ' [data-rel="colorbox"]').colorbox(colorbox_params);
        /*$("#cboxLoadingGraphic").html("<i class='ace-icon fa fa-spinner orange fa-spin'></i>");let's add a custom loading icon*/

        $(document).one('ajaxloadstart.page', function (e) { $('#colorbox, #cboxOverlay').remove(); });
    });
}

/*---------------------------------------------------------------------------*/
var url = window.location;
var ProjectURL = { BaseURL: url.origin, CurrentURL: url.href };

function RedirectToAudit(ObjectName, ObjectID) {
    window.location = ProjectURL.BaseURL + "/AuditLog/Redirect?ObjectName=" + ObjectName + "&ObjectID=" + ObjectID + "&GlobalID=" + globalScreenID.AuditLogScreenID;
}

/*---------------------------------------------------------------------------*/
function getScreenOnSearch(objectName) {
    var data = [];

    $(".MyScreen").each(function (i, ele) { data.push({ "ObjectName": $(this).attr('data-label'), "ScreenID": $(this).attr('data-id') }); });

    var searchData = data.filter(function (el) { return el.ObjectName.toLowerCase().indexOf(objectName.toLowerCase()) > -1; });
    return searchData;
}

function GetValueToListBoxSelectedCommaSplit(ControlID) {
    var returnVal = "";

    $(ControlID + " :selected").each(function (i, selected) {
        returnVal += $(selected).val().toString() + ",";
    });

    return returnVal;
}

/* Get random Color */
function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function MenuScreenSearch() {

    $("#txt-nav-search-input").autocomplete({
        source: function (request, response) {
            var data = getScreenOnSearch($("#txt-nav-search-input").val().trim());
            response($.map(eval(data),
                function (item) {
                    return { label: item.ObjectName, val: item.ScreenID }
                }));
        },
        select: function (e, i) {
            $(e.target).attr("data-id", i.item.val).attr("data-label", i.item.label);
            window.location = $("#Search_" + i.item.val).attr('href');
        },

        change: function (event, ui) {
            if (ui.item == null || ui.item == undefined) {
                if ($(event.target).val().trim().length > 0) {/*Bind Previous Item*/
                    if ($(event.target).hasAttr('data-label') != false && $(event.target).hasAttr('data-id') != false) {
                        $(event.target).val($(event.target).attr("data-label")).attr($(event.target).attr("data-id"));
                    } else
                        $(event.target).val("");
                } else $(event.target).attr("data-label", "").attr("data-id", "");
            } else {
                $(event.target).attr("data-id", ui.item.val).attr("data-label", ui.item.label);
            }
        }
    });
}

function getQueryStringParams() {
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for (var i = 0; i < hashes.length; i++) {
        hash = hashes[i].split('=');
        vars[hash[0]] = hash[1];
    }
    return vars;
}

(function ($) {
    $.fn.hasScrollBar = function () {
        return this.get(0).scrollHeight > this.height();
    }
})(jQuery);

function GetMonthNumberFromMonthName(month) {
    switch (month) {
        case "January":
        case "Jan": {
            return 1;
            break;
        }

        case "February":
        case "Feb": {
            return 2;
            break;
        }

        case "March":
        case "Mar": {
            return 3;
            break;
        }

        case "April":
        case "Apr": {
            return 4;
            break;
        }

        case "May": {
            return 5;
            break;
        }

        case "June":
        case "Jun": {
            return 6;
            break;
        }

        case "July":
        case "Jul": {
            return 7;
            break;
        }

        case "August":
        case "Aug": {
            return 8;
            break;
        }

        case "September":
        case "Sep": {
            return 9;
            break;
        }

        case "October":
        case "Oct": {
            return 10;
            break;
        }

        case "November":
        case "Nov": {
            return 11;
            break;
        }

        case "December":
        case "Dec": {
            return 12;
            break;
        }
        default:

    }
}

function LoadTimeControl(ControlID, IsShowWidget = true) {
    //alert(IsShowWidget);
    //if (IsShowWidget === null || IsShowWidget === "" || IsShowWidget === undefined)
    //    IsShowWidget = true

    $(ControlID).timepicker({ minuteStep: 01, showSeconds: false, showMeridian: false, disableFocus: false, icons: { up: 'fa fa-chevron-up', down: 'fa fa-chevron-down' }, format: 'LT' }).on('focus', function () { if (IsShowWidget) $(ControlID).timepicker('showWidget'); }).next().on(ace.click_event, function () { $(this).prev().focus(); });
}

function printError(FileName, MethodName, ErrorObject) {
    showSweetAlert("Error!", ErrorObject.message, "error", null);

    AddUpdateData("/AjaxCommonData/CreateClientSideErrorLog", { FileName: FileName, MethodName: MethodName, ErrorText: ErrorObject.message },
        function () {
        },
        function (responce_data) {
            showSweetAlert("Error!", responce_data.message, "error", null);
        });
}

function showSweetAlert(title, message, type, ClosingCallBack) {
    swal.fire({
        "title": title,
        "text": message,
        "type": type,
        "confirmButtonClass": "btn btn-default",
        //"timer": type == "success" ? 3000 : 8000,
        //preConfirm: () => { prompt("PreConfirm Event Fired"); },
        onClose: () => {
            if (ClosingCallBack && typeof (ClosingCallBack) === "function")
                ClosingCallBack();
        }
    });
}

function Reload_ddl_Global_staticData(xhr, ddlID, AjaxURL, AjaxData, DefaultLabel, data, callback, ) {

    var items = eval(data);

    if (DefaultLabel != null && DefaultLabel != '')
        $(ddlID).html("<option value=''>" + DefaultLabel + "</option>");

    for (var i = 0; i < items.length; i++)
        if ($(ddlID + " option[value='" + items[i].value + "']").length === 0)
            $(ddlID).append("<option  value='" + items[i].value + "' " + (items[i].Selected == true ? "selected='selected'" : "") + ">" + items[i].text + "</option>");

    /*$(ddlID).change(); Fire the change event to initiate chained items.*/
    if (callback && typeof (callback) === "function")
        callback(data);

}

function addCommas(nStr) {
    nStr += '';
    x = nStr.split('.');
    x1 = x[0];
    x2 = x.length > 1 ? '.' + x[1] : '';
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
        x1 = x1.replace(rgx, '$1' + ',' + '$2');
    }
    return x1 + x2;
}

Number.prototype.toFixedDown = function (digits) {
    var re = new RegExp("(\\d+\\.\\d{" + digits + "})(\\d)"),
        m = this.toString().match(re);
    return m ? parseFloat(m[1]) : this.valueOf();
};

function AllowOnlyNumberOrDecimalValue(MyID) {
    $(MyID).on("input", function (evt) {
        var self = $(this);
        self.val(self.val().replace(/[^0-9\.]/g, ''));
        if ((evt.which != 46 || self.val().indexOf('.') != -1) && (evt.which < 48 || evt.which > 57)) {
            evt.preventDefault();
        }
    });
}

const IsNumeric = (num) => /^-{0,1}\d*\.{0,1}\d+$/.test(num);
