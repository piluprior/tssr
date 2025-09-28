// ================================
// SYSTÈME DE TRACKING CV
// GA4 + Supabase + EmailJS
// ================================

// Initialisation Supabase
let supabaseClient = null;

function initCVTracking() {
    // Vérifier si config existe
    if (!window.CV_TRACKING_CONFIG || !window.CV_TRACKING_CONFIG.enable_tracking) {
        console.log('Tracking CV désactivé');
        return;
    }
    
    // Initialiser client Supabase
    if (typeof supabase !== 'undefined' && window.CV_TRACKING_CONFIG.supabase_url) {
        supabaseClient = supabase.createClient(
            window.CV_TRACKING_CONFIG.supabase_url,
            window.CV_TRACKING_CONFIG.supabase_anon_key
        );
    }
    
    // Debug mode
    if (window.CV_TRACKING_CONFIG.debug_mode) {
        console.log('Tracking CV initialisé', {
            supabase: !!supabaseClient,
            ga4: typeof gtag !== 'undefined',
            emailjs: typeof emailjs !== 'undefined'
        });
    }
}

/**
 * Fonction principale de tracking et téléchargement
 * @param {string} source - Origine du clic (header, mobile, footer, etc.)
 * @returns {boolean} false pour empêcher comportement par défaut
 */
async function trackAndDownloadCV(source) {
    const config = window.CV_TRACKING_CONFIG;
    
    // Collecter les données
    const trackingData = collectTrackingData(source);
    
    // 1. Envoyer à GA4 - MODIFIÉ POUR UTILISER UN ÉVÉNEMENT STANDARD
    if (typeof gtag !== 'undefined') {
        // Événement standard GA4 pour téléchargement de fichier
        gtag('event', 'file_download', {
            'file_name': 'cv_marc_lupi.pdf',
            'file_extension': 'pdf',
            'link_text': trackingData.source,
            'link_url': config.cv_url,
            'value': 1
        });
        
        // Événement custom en complément
        gtag('event', 'cv_download', {
            'event_category': 'CV',
            'event_label': trackingData.source,
            'source': trackingData.source,
            'device': trackingData.device_type,
            'browser': trackingData.browser,
            'campaign': trackingData.campaign || 'none',
            'value': 1
        });
        
        if (config.debug_mode) {
            console.log('GA4 Events envoyés: file_download + cv_download');
        }
    }
    
    // 2. Envoyer à Supabase
    let supabaseSuccess = false;
    if (supabaseClient) {
        try {
            const { data, error } = await supabaseClient
                .from('cv_downloads')
                .insert([trackingData]);
            
            if (error) throw error;
            
            supabaseSuccess = true;
            if (config.debug_mode) {
                console.log('Supabase insert réussi');
            }
            
        } catch (error) {
            console.error('Erreur Supabase:', error);
            // Ne pas bloquer le téléchargement si erreur
        }
    }
    
    // 3. EMAILJS - DÉPLACÉ ICI ET CORRIGÉ
    if (config.enable_email_notifications && supabaseSuccess && typeof emailjs !== 'undefined') {
        try {
            const templateParams = {
                source: trackingData.source,
                device: trackingData.device_type,
                browser: trackingData.browser,
                os: trackingData.os,
                date: new Date().toLocaleDateString('fr-FR'),
                time: new Date().toLocaleTimeString('fr-FR'),
                referrer: trackingData.referrer || 'Direct',
                campaign: trackingData.campaign || 'Aucune',
                viewport_width: trackingData.viewport_width,
                viewport_height: trackingData.viewport_height
            };
            
            await emailjs.send(
                config.emailjs_service || 'service_43bxg0a',
                config.emailjs_template || 'template_hadkhv3',
                templateParams
            );
            
            if (config.debug_mode) {
                console.log('Email notification envoyé');
            }
        } catch (error) {
            console.error('Erreur EmailJS:', error);
        }
    }
    
    // 4. Log local pour debug
    if (config.debug_mode) {
        logToLocalStorage(trackingData);
    }
    
    // 5. Ouvrir le CV après petit délai
    setTimeout(() => {
        window.open(config.cv_url, '_blank');
    }, 300);
    
    return false;
}

/**
 * Collecter toutes les données de tracking
 */
function collectTrackingData(source) {
    // Détection device
    const getDeviceType = () => {
        const width = window.innerWidth;
        if (width <= 576) return 'mobile_small';
        if (width <= 768) return 'mobile';
        if (width <= 1024) return 'tablet';
        if (width <= 1440) return 'desktop';
        return 'desktop_large';
    };
    
    // Parser User Agent
    const parseUserAgent = () => {
        const ua = navigator.userAgent;
        let browser = 'unknown';
        let os = 'unknown';
        
        // Détection browser
        if (ua.includes('Chrome') && !ua.includes('Edge')) browser = 'Chrome';
        else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
        else if (ua.includes('Firefox')) browser = 'Firefox';
        else if (ua.includes('Edge')) browser = 'Edge';
        else if (ua.includes('Opera')) browser = 'Opera';
        
        // Détection OS
        if (ua.includes('Windows NT 10')) os = 'Windows 10';
        else if (ua.includes('Windows NT 11')) os = 'Windows 11';
        else if (ua.includes('Windows')) os = 'Windows';
        else if (ua.includes('Mac OS X')) os = 'MacOS';
        else if (ua.includes('Linux')) os = 'Linux';
        else if (ua.includes('Android')) os = 'Android';
        else if (/iPhone|iPad|iPod/.test(ua)) os = 'iOS';
        
        return { browser, os };
    };
    
    const { browser, os } = parseUserAgent();
    
    // Récupérer UTM params
    const urlParams = new URLSearchParams(window.location.search);
    
    return {
        source: source || 'unknown',
        referrer: document.referrer || 'direct',
        user_agent: navigator.userAgent,
        campaign: urlParams.get('utm_campaign') || null,
        viewport_width: window.innerWidth,
        viewport_height: window.innerHeight,
        device_type: getDeviceType(),
        browser: browser,
        os: os
    };
}

/**
 * Logger en localStorage pour debug
 */
function logToLocalStorage(data) {
    try {
        let logs = JSON.parse(localStorage.getItem('cv_tracking_logs') || '[]');
        logs.push({
            ...data,
            timestamp: new Date().toISOString()
        });
        
        // Garder seulement les 50 derniers
        if (logs.length > 50) {
            logs = logs.slice(-50);
        }
        
        localStorage.setItem('cv_tracking_logs', JSON.stringify(logs));
        console.log('Log local sauvegardé');
    } catch (e) {
        console.error('Erreur localStorage:', e);
    }
}

// Initialisation au chargement
document.addEventListener('DOMContentLoaded', function() {
    initCVTracking();
    
    // Attacher l'événement à tous les liens CV
    const cvLinks = document.querySelectorAll('[data-cv-source]');
    cvLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const source = this.getAttribute('data-cv-source');
            trackAndDownloadCV(source);
        });
    });
});

// Sources possibles pour référence
const CV_SOURCES = {
    // Navigation
    'header_desktop': 'Header Desktop',
    'header_mobile': 'Header Mobile', 
    'menu_mobile': 'Menu Mobile',
    'menu_hamburger': 'Menu Hamburger',
    
    // Sections
    'section_apropos': 'Section À propos',
    'section_parcours': 'Section Parcours',
    'section_profil': 'Section Profil',
    
    // CTA
    'cta_contact': 'Bouton Contact',
    'footer_link': 'Footer',
    
    // Social
    'social_linkedin': 'Via LinkedIn',
    'social_github': 'Via GitHub',
    
    // Autres
    'qr_code': 'QR Code',
    'direct_link': 'Lien direct',
    'email_signature': 'Signature email'
};