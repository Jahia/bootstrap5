$(document).ready(function () {
    $(document).on("click", ".dropdown-menu", function (e) {
        e.stopPropagation()
    });
    992 > $(window).width() && $(".dropend a").click(function (a) {
        a.preventDefault();
        $(this).next(".submenu").length && $(this).next(".submenu").toggle();
        $(".dropdown").on("hide.bs.dropdown", function () {
            $(this).find(".submenu").hide()
        })
    })
});
