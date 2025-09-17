// scripts
 
window.addEventListener('DOMContentLoaded', event => {
 
    // on active le Bootstrap scrollspy dans l'élement nav principal
    const sideNav = document.body.querySelector('#sideNav');
    if (sideNav) {
        new bootstrap.ScrollSpy(document.body, {
            target: '#sideNav',
            // fonctionnement anormal de rootMargin
            // rootMargin: '0px 0px -40%',
            rootMargin: '0px',
        });
    };
 
    // collapse responsive navbar quand le toggler est visible
    const navbarToggler = document.body.querySelector('.navbar-toggler');
    const responsiveNavItems = [].slice.call(
        document.querySelectorAll('#navbarResponsive .nav-link')
    );
    responsiveNavItems.map(function (responsiveNavItem) {
        responsiveNavItem.addEventListener('click', () => {
            if (window.getComputedStyle(navbarToggler).display !== 'none') {
                navbarToggler.click();
            }
        });
    });
});
 
// scroll-up
document.addEventListener('DOMContentLoaded', () => {
    const scrollUpButton = document.getElementById('scrollUp');
  
    // affiche le bouton si l'utilisateur a scrollé de 150px ou plus
    window.addEventListener('scroll', () => {
        if (window.scrollY > 150) {
            scrollUpButton.classList.add('show');
        } else {
        scrollUpButton.classList.remove('show');
        }
    });
  
    // action lors du clic sur le bouton
    scrollUpButton.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
        behavior: 'smooth' // scroll fluide
        });
    });
});
 
// initialise tous les tooltips présents sur la page
document.addEventListener('DOMContentLoaded', function () {
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
});
 
// gestion des tooltips sur mobile
document.addEventListener("DOMContentLoaded", () => {
    if (matchMedia("(hover: none)").matches) {
        document.querySelectorAll("[title]").forEach(el => el.removeAttribute("title"));
        document.body.classList.add("no-tooltips");
    }
});
 