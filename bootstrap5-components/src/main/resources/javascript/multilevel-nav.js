/**
 * Multi-level navigation dropdown support.
 *
 * Bootstrap's default dropdown behaviour closes the menu when any click occurs
 * inside it. This script overrides that behaviour to allow submenus to stay
 * open while the user navigates nested items.
 *
 * On narrow viewports (< 992 px, i.e. below Bootstrap's `lg` breakpoint) the
 * standard hover-based dropends do not work on touch devices, so a click
 * handler is added instead: clicking a `.dropend` anchor toggles its adjacent
 * `.submenu` element. The submenu is also automatically hidden whenever the
 * parent dropdown is closed.
 */
$(document).ready(function () {

    // Prevent click events inside any open dropdown from bubbling up to the
    // document, which would otherwise trigger Bootstrap's "close on outside
    // click" logic and collapse the menu unintentionally.
    $(document).on("click", ".dropdown-menu", function (e) {
        e.stopPropagation();
    });

    // On small screens, replace hover-driven submenus with a click-driven
    // toggle so that touch users can open and close nested levels.
    if (992 > $(window).width()) {
        $(".dropend a").click(function (a) {
            a.preventDefault(); // do not follow the link; just toggle the submenu

            var $submenu = $(this).next(".submenu");
            if ($submenu.length) {
                $submenu.toggle();
            }

            // Reset all submenus when the root dropdown is closed so they do
            // not remain open the next time the menu is expanded.
            $(".dropdown").on("hide.bs.dropdown", function () {
                $(this).find(".submenu").hide();
            });
        });
    }
});
