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
// SCROLLSPY SYSTEM - VERSION CORRIGÉE
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
        updateProgressBar();
    }, 10); // Throttling à 10ms pour optimiser les performances
}

// ================================
// BARRE DE PROGRESSION DE LECTURE
// ================================
function updateProgressBar() {
    const progressBar = document.getElementById('progressBar');
    if (progressBar) {
        const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = (window.scrollY / totalHeight) * 100;
        progressBar.style.width = progress + '%';
    }
}

// ================================
// ANIMATIONS DU SCROLL
// ================================
function initScrollAnimations() {
    const sections = document.querySelectorAll('.resume-section-content');
    
    function checkVisibility() {
        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            const isVisible = rect.top < window.innerHeight - 100 && rect.bottom > 100;
            
            if (isVisible) {
                section.classList.add('animate-in');
            } else {
                section.classList.remove('animate-in');
            }
        });
    }

    window.addEventListener('scroll', checkVisibility);
    checkVisibility(); // Vérification immédiate
}

// ================================
// COPIE EMAIL AU CLIC
// ================================
function initEmailCopy() {
    const emailLinks = document.querySelectorAll('a[href^="mailto:"]');
    const toast = document.getElementById('toast');
    
    emailLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Extraire l'email du href
            const email = this.href.replace('mailto:', '');
            
            // Copier dans le presse-papier
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(email).then(() => {
                    // Afficher le toast
                    if (toast) {
                        toast.classList.add('show');
                        setTimeout(() => {
                            toast.classList.remove('show');
                        }, 3000);
                    }
                }).catch(() => {
                    // Fallback si clipboard API ne fonctionne pas
                    prompt('Copiez cet email:', email);
                });
            } else {
                // Fallback pour navigateurs non compatibles
                prompt('Copiez cet email:', email);
            }
        });
    });
}

// ================================
// QR CODE MODAL - VERSION CORRIGÉE
// ================================
function initFloatingQR() {
    const btn = document.getElementById('qrFloatingBtn');
    const modal = document.getElementById('qrModal');
    const closeBtn = document.getElementById('qrClose');
    const canvas = document.getElementById('qr-canvas-floating');
    
    if (!btn || !modal || !canvas) {
        console.warn('Éléments QR manquants');
        return;
    }

    // Vérifier si QRCode est disponible
    if (typeof QRCode === 'undefined') {
        console.error('QRCode.js non chargé');
        return;
    }

    // vCard correctement formatée
    const vCard = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        'FN:Marc Lupi',
        'TITLE:Technicien Supérieur des Systèmes et Réseaux',
        'TEL:+33782108037',
        'EMAIL:marc.lupi@protonmail.com',
        'ADR:;;Auch;;32000;;France',
        'URL:https://piluprior.github.io/tssr/',
        'NOTE:Contact professionnel - TSSR',
        'END:VCARD'
    ].join('\n');

    try {
        // Générer le QR Code avec gestion d'erreur
        QRCode.toCanvas(canvas, vCard, {
            width: 200,
            height: 200,
            margin: 2,
            color: {
                dark: '#800000',
                light: '#FFFFFF'
            },
            errorCorrectionLevel: 'M'
        }, function(error) {
            if (error) {
                console.error('Erreur génération QR:', error);
                // Masquer le canvas et afficher un message d'erreur
                canvas.style.display = 'none';
                const errorMsg = document.createElement('p');
                errorMsg.textContent = 'Erreur lors de la génération du QR code';
                errorMsg.style.color = '#800000';
                errorMsg.style.fontSize = '0.9rem';
                canvas.parentNode.insertBefore(errorMsg, canvas.nextSibling);
            } else {
                console.log('QR Code généré avec succès');
            }
        });
    } catch (e) {
        console.error('Erreur QRCode.js:', e);
        canvas.style.display = 'none';
        const errorMsg = document.createElement('p');
        errorMsg.textContent = 'QR Code non disponible';
        errorMsg.style.color = '#800000';
        canvas.parentNode.insertBefore(errorMsg, canvas.nextSibling);
    }

    // Événements du modal
    btn.addEventListener('click', () => {
        modal.classList.add('show');
        console.log('Modal QR ouvert');
    });
    
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.classList.remove('show');
        });
    }
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('show');
        }
    });

    // Fermeture avec Échap
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('show')) {
            modal.classList.remove('show');
        }
    });
}

// ================================
// FIX PARCOURS - APPROCHE RADICALE
// ================================
function initParcoursFixMobile() {
    console.log('Initialisation fix Parcours radical');
}

// ================================
// DÉSACTIVATION SCROLLSPY POUR PARCOURS + SCROLL BASIQUE
// ================================
function handleParcoursScrollIssue() {
    // Sur toutes les résolutions mobiles
    if (window.innerWidth <= 768) {
        // Trouver tous les liens vers Parcours
        const parcoursLinks = document.querySelectorAll('a[href="#parcours"]');
        
        parcoursLinks.forEach(link => {
            // Supprimer TOUTES les classes et attributs qui interfèrent
            link.classList.remove('js-scroll-trigger');
            link.removeAttribute('onclick');
            
            // Event listener ultra-simple
            link.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                console.log('PARCOURS CLICK - Résolution:', window.innerWidth);
                
                // Fermer le menu mobile si nécessaire
                if (this.closest('.mobile-nav')) {
                    closeMobileMenu();
                }
                
                // Scroll BRUTAL et DIRECT sans smooth
                const parcoursSection = document.getElementById('parcours');
                if (parcoursSection) {
                    // Position absolue calculée
                    const rect = parcoursSection.getBoundingClientRect();
                    const currentScroll = window.pageYOffset;
                    const targetPosition = currentScroll + rect.top - 90;
                    
                    console.log('SCROLL BRUTAL vers:', targetPosition, 'Section rect.top:', rect.top);
                    
                    // Scroll INSTANTANÉ sans smooth
                    window.scrollTo(0, targetPosition);
                    
                    // Puis smooth scroll léger pour ajustement
                    setTimeout(() => {
                        window.scrollTo({
                            top: targetPosition - 10,
                            behavior: 'smooth'
                        });
                    }, 50);
                }
            });
        });
        
        console.log('PARCOURS FIX RADICAL appliqué à', parcoursLinks.length, 'liens');
    }
}

// ================================
// DÉSACTIVER INTERSECTION OBSERVER POUR PARCOURS
// ================================
function disableScrollSpyForParcours() {
    // Désactiver l'observation de la section Parcours
    const parcoursSection = document.getElementById('parcours');
    if (parcoursSection && window.innerWidth <= 768) {
        parcoursSection.style.scrollMarginTop = '0px';
        parcoursSection.removeAttribute('data-scrollspy');
        console.log('ScrollSpy désactivé pour Parcours sur mobile');
    }
}

// ================================
// FOOTER DYNAMIQUE
// ================================
function initDynamicFooter() {
    const footer = document.getElementById('footerText');
    if (footer) {
        const currentYear = new Date().getFullYear();
        const lastUpdate = new Date().toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long'
        });
        
        footer.innerHTML = `
            © ${currentYear} Marc Lupi - Technicien Supérieur des Systèmes et Réseaux<br>
            Dernière mise à jour : ${lastUpdate} - Auch, Gers (32)
        `;
    }
}

// ================================
// INITIALIZATION PRINCIPALE
// ================================
/**
 * Initialise tous les event listeners et fonctionnalités
 */
function init() {
    console.log('🚀 Initialisation du site Marc Lupi TSSR');

    // Initialisation du ScrollSpy avec Intersection Observer
    initScrollSpy();

    // Scroll event listener optimisé
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Resize event listener avec recalcul Parcours
    window.addEventListener('resize', function() {
        handleResize();
        // Réappliquer les fixes Parcours sur resize
        if (window.innerWidth <= 400) {
            initParcoursFixMobile();
            handleParcoursScrollIssue();
        }
    });

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

    // Initialisation des animations de scroll
    initScrollAnimations();

    // Initialisation de la copie d'email
    initEmailCopy();

    // Initialisation du QR Code flottant
    initFloatingQR();

    // Fix spécifique pour le lien Parcours sur mobile
    initParcoursFixMobile();

    // Initialisation du footer dynamique
    initDynamicFooter();

    // Initialisation du state actuel
    handleHeaderScroll();
    handleScrollUpButton();
    updateProgressBar();

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

// ================================
// EVENT LISTENERS SETUP
// ================================
/**
 * Configuration des event listeners après le chargement du DOM
 */
document.addEventListener('DOMContentLoaded', function() {
    // Initialisation principale
    init();

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