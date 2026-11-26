/**
 * Multi-level navigation dropdown support (bootstrap5nt:navbar with maxlevel >= 3).
 *
 * Port of the 2.x jQuery script, without jQuery.
 *
 * Bootstrap closes a dropdown on any click inside it, which would collapse the menu while the user
 * opens a submenu: as in 2.x, clicks inside a dropdown menu stop at the document (the navbar also sets
 * data-bs-auto-close="outside" on its top-level dropdowns).
 *
 * On wide screens (>= 992 px, Bootstrap's lg breakpoint) submenus open on hover (multilevel-nav.css).
 * Hover does not exist on touch devices, so on narrow screens a click on a .dropend link toggles its
 * .submenu instead, and the submenus are hidden again when their root dropdown closes.
 */
(function () {
    'use strict';

    function init() {
        document.addEventListener('click', function (event) {
            var target = event.target;
            if (!(target instanceof Element) || !target.closest('.dropdown-menu')) {
                return;
            }
            event.stopPropagation();

            var link = target.closest('.dropend > a');
            if (!link || window.innerWidth >= 992) {
                return;
            }
            var submenu = link.nextElementSibling;
            if (submenu && submenu.classList.contains('submenu')) {
                event.preventDefault(); // toggle the submenu instead of following the link
                submenu.style.display = submenu.style.display === 'block' ? 'none' : 'block';
            }
        });

        document.addEventListener('hide.bs.dropdown', function (event) {
            var dropdown = event.target instanceof Element ? event.target.closest('.dropdown') : null;
            if (dropdown) {
                dropdown.querySelectorAll('.submenu').forEach(function (submenu) {
                    submenu.style.display = '';
                });
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
