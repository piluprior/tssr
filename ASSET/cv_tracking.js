// ================================
// SYSTÈME DE TRACKING CV COMPLET
// GA4 + Supabase + EmailJS
// Version enrichie avec TOUTES les données
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
    
    // Collecter les données (maintenant COMPLÈTES avec géolocalisation)
    const trackingData = await collectTrackingDataComplete(source);
    
    // 1. Envoyer à GA4
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
    
    // 2. Envoyer à Supabase (avec TOUTES les données)
    let supabaseSuccess = false;
    if (supabaseClient) {
        try {
            const { data, error } = await supabaseClient
                .from('cv_downloads')
                .insert([trackingData]);
            
            if (error) throw error;
            
            supabaseSuccess = true;
            
            if (config.debug_mode) {
                console.log('✅ Supabase insert réussi avec', Object.keys(trackingData).length, 'champs');
                console.log('Données envoyées:', trackingData);
            }
        } catch (error) {
            console.error('❌ Erreur Supabase:', error);
        }
    }
    
    // 3. EMAILJS - Version COMPLÈTE avec TOUTES les données
    if (config.enable_email_notifications && supabaseSuccess && typeof emailjs !== 'undefined') {
        try {
            // Formater la date en français lisible
            const formatDateFrench = (date) => {
                const jours = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi','dimanche'];
                const mois = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 
                             'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
                
                const jour = jours[date.getDay()];
                const numeroJour = date.getDate();
                const numeroJourFormate = numeroJour === 1 ? '1er' : numeroJour;
                const moisNom = mois[date.getMonth()];
                const annee = date.getFullYear();
                const heures = date.getHours();
                const minutes = date.getMinutes().toString().padStart(2, '0');
                const secondes = date.getSeconds().toString().padStart(2, '0');
                
                return `${jour} ${numeroJourFormate} ${moisNom} ${annee} à ${heures} h ${minutes} min ${secondes} sec`;
            };
            
            // Préparer TOUS les paramètres pour le template EmailJS
            const templateParams = {
                // Navigation
                source: trackingData.source,
                page_title: trackingData.page_title,
                page_url: trackingData.page_url,
                referrer: trackingData.referrer || 'Direct',
                campaign: trackingData.campaign || 'Aucune',
                
                // Appareil
                device_type: trackingData.device_type,
                browser: trackingData.browser,
                os: trackingData.os,
                language: trackingData.language,
                user_agent: trackingData.user_agent,
                
                // Date et heure (format français lisible)
                created_at: formatDateFrench(new Date()),
                
                // Écran et viewport
                viewport_width: trackingData.viewport_width,
                viewport_height: trackingData.viewport_height,
                screen_width: trackingData.screen_width,
                screen_height: trackingData.screen_height,
                pixel_ratio: trackingData.pixel_ratio,
                
                // Géolocalisation
                ip_address: trackingData.ip_address || 'Non disponible',
                country: trackingData.country || 'Inconnu',
                city: trackingData.city || 'Inconnue',
                ip_country: trackingData.ip_country || 'Inconnu',
                ip_city: trackingData.ip_city || 'Inconnue'
            };
            
            await emailjs.send(
                config.emailjs_service || 'service_43bxg0a',
                config.emailjs_template || 'template_r9omgz8',
                templateParams
            );
            
            if (config.debug_mode) {
                console.log('✅ Email notification envoyé avec', Object.keys(templateParams).length, 'paramètres');
            }
        } catch (error) {
            console.error('❌ Erreur EmailJS:', error);
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
 * Collecter TOUTES les données de tracking (VERSION COMPLÈTE)
 * Récupère maintenant aussi l'IP et la géolocalisation
 */
async function collectTrackingDataComplete(source) {
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
    
    // Récupérer la géolocalisation via IP (gratuit, pas de clé API nécessaire)
    const getGeoLocation = async () => {
        try {
            const response = await fetch('https://ipapi.co/json/');
            const data = await response.json();
            return {
                ip_address: data.ip,
                country: data.country_name,
                city: data.city,
                ip_country: data.country_name,
                ip_city: data.city
            };
        } catch (error) {
            console.warn('Géolocalisation non disponible:', error);
            return {
                ip_address: null,
                country: null,
                city: null,
                ip_country: null,
                ip_city: null
            };
        }
    };
    
    const { browser, os } = parseUserAgent();
    const urlParams = new URLSearchParams(window.location.search);
    const geoData = await getGeoLocation();
    
    // Date et heure formatées
    const now = new Date();
    const timeFormatted = now.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    
    // Retourner TOUTES les données (23 champs)
    return {
        // Navigation (5)
        source: source || 'unknown',
        referrer: document.referrer || 'direct',
        page_title: document.title,
        page_url: window.location.href,
        campaign: urlParams.get('utm_campaign') || null,
        
        // Appareil (5)
        user_agent: navigator.userAgent,
        device_type: getDeviceType(),
        browser: browser,
        os: os,
        language: navigator.language || navigator.userLanguage,
        
        // Écran et viewport (5)
        viewport_width: window.innerWidth,
        viewport_height: window.innerHeight,
        screen_width: window.screen.width,
        screen_height: window.screen.height,
        pixel_ratio: window.devicePixelRatio || 1,
        
        // Temporel (1)
        time_formatted: timeFormatted,
        
        // Géolocalisation (5)
        ip_address: geoData.ip_address,
        country: geoData.country,
        city: geoData.city,
        ip_country: geoData.ip_country,
        ip_city: geoData.ip_city
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