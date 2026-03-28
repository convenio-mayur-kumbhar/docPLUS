$(document).ready(function () {

    // destroy if already initialized
    $('.date-picker').datepicker('destroy');

    // initialize properly
    $('.date-picker').datepicker({
        format: 'mm/dd/yyyy',
        autoclose: true,
        todayHighlight: true,
        container: 'body',
        orientation: "auto"
    });

});
