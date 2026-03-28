$(document).ready(function () {
    // ==============================
    // EDIT PATIENT CLICK
    // ==============================

    $(document).on("click", ".btnEditPatient", function () {

        var row = $(this).closest("tr");

        var regno = row.find("td:eq(0)").text().trim();
        var fname = row.find("td:eq(1)").text().trim();
        var lname = row.find("td:eq(2)").text().trim();
        var dob = row.find("td:eq(3)").text().trim();
        var gender = row.find("td:eq(4)").text().trim();
        var mobile = row.find("td:eq(5)").text().trim();
        var doctor = row.find("td:eq(6)").text().trim();

        // Hide Add button
        $("#btnAddPatient").hide();

        // Show Close button
        $("#btnClosePatient").show();

        // Hide search section
        $(".well.well-sm").hide();

        // Hide grid
        $("#gridSection").hide();

        // Breadcrumb update
        $("#breadcrumbList").append('<li class="active">Edit Patient Details</li>');

        // Load Partial
        $("#partialDiv").load("/Admin/PartialAddPatient", function () {

            $("#partialDiv").show();

            // Fill values
            $("#regno").val(regno);
            $("#fname").val(fname);
            $("#lname").val(lname);
            $("#mobile").val(mobile);
            $("#dob").val(dob);

            // Dropdown values
            $("#gender").val(gender).change();
            $("#doctor").val(doctor).change();

            $('html, body').animate({
                scrollTop: $("#partialDiv").offset().top
            }, 300);

        });

    });
    // =====================================
    // NEXT OF KIN
    // =====================================

    $("#btnAddKin").click(function () {

        var name = $("#kinName").val().trim();
        var relation = $("#kinRelation").val().trim();
        var tele = $("#kinTele").val().trim();
        var mobile = $("#kinMobile").val().trim();
        var email = $("#kinEmail").val().trim();
        var address = $("#kinAddress").val().trim();
        var remarks = $("#kinRemarks").val().trim();

        if (name === "" || relation === "" || mobile === "") {
            alert("Please fill required fields");
            return;
        }

        var row = `
            <tr>
                <td>${name}</td>
                <td>${relation}</td>
                <td>${address}</td>
                <td>${tele}</td>
                <td>${mobile}</td>
                <td>${email}</td>
                <td>${remarks}</td>
                <td>
                    <button class="btn btn-xs btn-primary btnEdit">
                        <i class="fa fa-edit"></i>
                    </button>
                </td>
            </tr>`;

        $("#kinTableBody").append(row);

        $("#nextOfKin input, #nextOfKin textarea").val("");
    });


    // =====================================
    // OTHER PROFESSIONALS
    // =====================================

    $("#btnAddProf").click(function () {

        var name = $("#profName").val().trim();
        var profession = $("#profType").val();
        var tele = $("#profTele").val().trim();
        var mobile = $("#profMobile").val().trim();
        var email = $("#profEmail").val().trim();
        var address = $("#profAddress").val().trim();
        var remarks = $("#profRemarks").val().trim();

        if (name === "" || profession === "Select" || mobile === "" || email === "") {
            alert("Please fill required fields");
            return;
        }

        var row = `
            <tr>
                <td>${name}</td>
                <td>${profession}</td>
                <td>${address}</td>
                <td>${tele}</td>
                <td>${mobile}</td>
                <td>${email}</td>
                <td>${remarks}</td>
                <td>
                    <button class="btn btn-xs btn-primary btnEdit">
                        <i class="fa fa-edit"></i>
                    </button>
                </td>
            </tr>`;

        $("#profTableBody").append(row);

        $("#otherProfessionals input, #otherProfessionals textarea").val("");
        $("#profType").val("Select");
    });


    // =====================================
    // DATE PICKER
    // =====================================

    if ($(".date-picker").length > 0) {

        $('.date-picker').datepicker({
            autoclose: true,
            todayHighlight: true,
            format: DateTimeDataFormat.ddMyyyy
        });

        $(".date-picker").datepicker("setDate", new Date());
    }

});

