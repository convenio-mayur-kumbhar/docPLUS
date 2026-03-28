var PatientRegistration = {

    table: null,
    id: 0,

    Init: function () {

        PatientRegistration.BindGrid();

    },

    BindGrid: function () {

        if ($.fn.DataTable.isDataTable('#tblPatient')) {
            $('#tblPatient').DataTable().destroy();
        }

        PatientRegistration.table = $('#tblPatient').DataTable({

            "ajax": {
                "url": "/Admin/GetPatients",
                "type": "GET",
                "datatype": "json"
            },

            "columns": [

                { "data": "firstName" },
                { "data": "lastName" },
                { "data": "mobile" },
                { "data": "email" },
                { "data": "gender" },
                { "data": "status" },

                {
                    "data": "id",
                    "render": function (data) {

                        return `<button class="btn btn-sm btn-primary"
                                onclick="PatientRegistration.Edit(${data})">
                                Edit
                                </button>`;

                    }
                },

                {
                    "data": "id",
                    "render": function (data) {

                        return `<button class="btn btn-sm btn-danger"
                                onclick="PatientRegistration.Delete(${data})">
                                Delete
                                </button>`;

                    }
                }

            ]

        });

    },

    Search: function () {

        var firstName = $("#txtFirstNameSearch").val();
        var mobile = $("#txtMobileSearch").val();
        var email = $("#txtEmailSearch").val();
        var status = $("#ddlStatusSearch").val();

        PatientRegistration.table.ajax.url(
            `/Admin/SearchPatients?firstName=${firstName}&mobile=${mobile}&email=${email}&status=${status}`
        ).load();

    },

    Reset: function () {

        $("#txtFirstNameSearch").val('');
        $("#txtMobileSearch").val('');
        $("#txtEmailSearch").val('');
        $("#ddlStatusSearch").val('');

        PatientRegistration.BindGrid();

    },

    OpenAddModal: function () {

        PatientRegistration.id = 0;

        PatientRegistration.ResetForm();

        $("#AddPatientModal").modal("show");

        $(".modal-title").text("Add Patient");

    },

    Save: function () {

        var model = {

            Id: PatientRegistration.id,
            FirstName: $("#txtFirstName").val(),
            LastName: $("#txtLastName").val(),
            Mobile: $("#txtMobile").val(),
            Email: $("#txtEmail").val(),
            Gender: $("#ddlGender").val(),
            Status: $("#ddlStatus").val()

        };

        $.ajax({

            url: "/Admin/SavePatient",
            type: "POST",
            data: model,

            success: function (response) {

                $("#AddPatientModal").modal("hide");

                PatientRegistration.BindGrid();

            }

        });

    },

    Edit: function (id) {

        $.ajax({

            url: "/Admin/GetPatientById?id=" + id,
            type: "GET",

            success: function (data) {

                PatientRegistration.id = data.id;

                $("#txtFirstName").val(data.firstName);
                $("#txtLastName").val(data.lastName);
                $("#txtMobile").val(data.mobile);
                $("#txtEmail").val(data.email);
                $("#ddlGender").val(data.gender);
                $("#ddlStatus").val(data.status);

                $(".modal-title").text("Edit Patient");

                $("#AddPatientModal").modal("show");

            }

        });

    },

    Delete: function (id) {

        if (!confirm("Are you sure you want to delete this patient?"))
            return;

        $.ajax({

            url: "/Admin/DeletePatient?id=" + id,
            type: "POST",

            success: function () {

                PatientRegistration.BindGrid();

            }

        });

    },

    ResetForm: function () {

        $("#frmPatient")[0].reset();

    }

};


$(document).ready(function () {

    PatientRegistration.Init();

});