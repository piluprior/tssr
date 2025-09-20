/* ================================
   MARC LUPI - SITE WEB SCRIPTS
   Gestion de la navigation, scroll spy et menu mobile
   ================================ */

// ================================
// MOBILE MENU FUNCTIONS
// ================================

/**
 * Toggle l'état du menu mobile (ouvrir/fermer)
 */
function toggleMobileMenu() {
    const menu = document.getElementById('mobileMenu');
    const overlay = document.getElementById('mobileOverlay');
    
    if (menu.classList.contains('open')) {
        closeMobileMenu();
    } else {
        openMobileMenu();
    }
}

/**
 * Ouvre le menu mobile
 */
function openMobileMenu() {
    const menu = document.getElementById('mobileMenu');
    const overlay = document.getElementById('mobileOverlay');
    
    menu.classList.add('open');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

/**
 * Ferme le menu mobile
 */
function closeMobileMenu() {
    const menu = document.getElementById('mobileMenu');
    const overlay = document.getElementById('mobileOverlay');
    
    menu.classList.remove('open');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
}

// ================================
// SCROLLSPY SYSTEM - NOUVELLE VERSION
// ================================

let currentActiveSection = '';

/**
 * Initialise le système ScrollSpy avec Intersection Observer
 * Plus fiable que les calculs manuels de position
 */
function initScrollSpy() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Configuration de l'Intersection Observer
    const observerOptions = {
        root: null,
        rootMargin: '-20% 0px -70% 0px', // Zone de détection optimisée
        threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const sectionId = entry.target.getAttribute('id');
            
            if (entry.isIntersecting) {
                currentActiveSection = sectionId;
                
                // Met à jour les liens actifs
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === '#' + sectionId) {
                        link.classList.add('active');
                        console.log('Section active:', sectionId);
                    }
                });
            }
        });
    }, observerOptions);

    // Observer toutes les sections
    sections.forEach(section => {
        observer.observe(section);
    });
}

// ================================
// HEADER SCROLL EFFECT
// ================================

/**
 * Ajoute un effet d'ombre au header lors du scroll
 */
function handleHeaderScroll() {
    const header = document.querySelector('.main-header');
    
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
}

// ================================
// SCROLL UP BUTTON
// ================================

/**
 * Affiche/cache le bouton de remontée selon la position du scroll
 */
function handleScrollUpButton() {
    const scrollUpBtn = document.getElementById('scrollUp');
    
    if (window.scrollY > 300) {
        scrollUpBtn.style.display = 'block';
    } else {
        scrollUpBtn.style.display = 'none';
    }
}

/**
 * Remonte en haut de la page avec animation smooth
 */
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// ================================
// SMOOTH SCROLL NAVIGATION
// ================================

/**
 * Active la navigation smooth scroll pour tous les liens avec ancres
 */
function initSmoothScroll() {
    document.querySelectorAll('.js-scroll-trigger').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offsetTop = target.offsetTop - 100; // Ajustement pour le header fixe
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ================================
// KEYBOARD NAVIGATION
// ================================

/**
 * Gestion des raccourcis clavier
 */
function initKeyboardNavigation() {
    document.addEventListener('keydown', function(e) {
        switch(e.key) {
            case 'Escape':
                closeMobileMenu();
                break;
            case 'Home':
                if (e.ctrlKey) {
                    e.preventDefault();
                    scrollToTop();
                }
                break;
        }
    });
}

// ================================
// TOUCH NAVIGATION (MOBILE)
// ================================

/**
 * Empêche le scroll du body quand le menu mobile est ouvert
 */
function initTouchNavigation() {
    document.addEventListener('touchmove', function(e) {
        const menu = document.getElementById('mobileMenu');
        if (menu && menu.classList.contains('open')) {
            e.preventDefault();
        }
    }, { passive: false });
}

// ================================
// RESIZE HANDLER
// ================================

/**
 * Gère les changements de taille d'écran
 */
function handleResize() {
    // Ferme le menu mobile si on passe en desktop
    if (window.innerWidth > 991.98) {
        closeMobileMenu();
    }
}

// ================================
// MAIN SCROLL EVENT LISTENER
// ================================

/**
 * Gestionnaire principal du scroll - optimisé avec throttling
 */
let scrollTimeout;
function handleScroll() {
    if (scrollTimeout) {
        clearTimeout(scrollTimeout);
    }
    
    scrollTimeout = setTimeout(() => {
        handleHeaderScroll();
        handleScrollUpButton();
    }, 10); // Throttling à 10ms pour optimiser les performances
}

// ================================
// INITIALIZATION
// ================================

/**
 * Initialise tous les event listeners et fonctionnalités
 */
function init() {
    console.log('🚀 Initialisation du site Marc Lupi TSSR');
    
    // Initialisation du ScrollSpy avec Intersection Observer
    initScrollSpy();
    
    // Scroll event listener optimisé (sans ScrollSpy manuel)
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Resize event listener
    window.addEventListener('resize', handleResize);
    
    // Smooth scroll navigation
    initSmoothScroll();
    
    // Keyboard navigation
    initKeyboardNavigation();
    
    // Touch navigation pour mobile
    initTouchNavigation();
    
    // Scroll up button click event
    const scrollUpBtn = document.getElementById('scrollUp');
    if (scrollUpBtn) {
        scrollUpBtn.addEventListener('click', scrollToTop);
    }
    
    // Initialisation du state actuel
    handleHeaderScroll();
    handleScrollUpButton();
    
    console.log('✅ Site initialisé avec succès');
}

// ================================
// UTILITY FUNCTIONS
// ================================

/**
 * Débugger - affiche les informations de scroll (développement uniquement)
 */
function debugScrollInfo() {
    const info = {
        scrollY: window.scrollY,
        windowHeight: window.innerHeight,
        documentHeight: document.documentElement.scrollHeight,
        currentSection: currentActiveSection
    };
    console.table(info);
}

/**
 * Vérifie si un élément est visible dans le viewport
 */
function isElementVisible(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

/**
 * Animation d'apparition pour les éléments au scroll (optionnel)
 */
function initScrollAnimations() {
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observer tous les éléments avec la classe 'fade-in'
    document.querySelectorAll('.fade-in').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'all 0.6s ease';
        observer.observe(el);
    });
}

// ================================
// EVENT LISTENERS SETUP
// ================================

/**
 * Configuration des event listeners après le chargement du DOM
 */
document.addEventListener('DOMContentLoaded', function() {
    // Initialisation principale
    init();
    
    // Initialisation optionnelle des animations (décommentez si nécessaire)
    // initScrollAnimations();
    
    // Event listener pour les tooltips Bootstrap (si utilisé)
    if (typeof bootstrap !== 'undefined') {
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        const tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
    }
});

// ================================
// ERROR HANDLING
// ================================

/**
 * Gestionnaire d'erreurs global
 */
window.addEventListener('error', function(e) {
    console.error('❌ Erreur JavaScript:', e.error);
});

/**
 * Gestionnaire pour les promesses rejetées
 */
window.addEventListener('unhandledrejection', function(e) {
    console.error('❌ Promesse rejetée:', e.reason);
});

// ================================
// EXPORT DES FONCTIONS (si module)
// ================================

// Si vous utilisez ce script comme module ES6, décommentez les lignes suivantes :
// export { toggleMobileMenu, closeMobileMenu, initScrollSpy, scrollToTop };
