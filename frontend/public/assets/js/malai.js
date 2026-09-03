// Application state
const app = {
    songsData: null,
    currentLanguage: 'en',
    elements: {
        languageSelector: null,
        songsContainer: null,
        songContainers: null
    }
};

// Load songs data from JSON
async function loadSongsData() {
    try {
        const response = await fetch('songs.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        app.songsData = data.songs;
        return true;
    } catch (error) {
        console.error('Error loading songs data:', error);
        showNotification('Failed to load songs. Please refresh the page.');
        return false;
    }
}

// Initialize DOM elements
function initializeElements() {
    app.elements = {
        languageSelector: document.getElementById('language'),
        songsContainer: document.getElementById('songs-wrapper'),
        songContainers: null // Will be set after rendering
    };
}

// Create song HTML
function createSongHTML(song, index) {
    return `
        <div class="song-container">
            <div class="song-text">
                <h2 class="song-title">${song[app.currentLanguage].title}</h2>
                <p class="song-content">${song[app.currentLanguage].content}</p>
            </div>
            <div class="song-video">
                <iframe width="100%" height="315" src="https://www.youtube.com/embed/${song.videoId}"
                    title="YouTube video player" frameborder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowfullscreen>
                </iframe>
            </div>
        </div>
    `;
}

// Render all songs
function renderSongs() {
    if (!app.songsData) return;

    const songsHTML = app.songsData.map((song, index) =>
        createSongHTML(song, index)
    ).join('');

    app.elements.songsContainer.innerHTML = `
        <div class="language_Selector">
            <label for="language">Select Language: </label>
            <select id="language">
                <option value="en">English</option>
                <option value="ta">தமிழ்</option>
            </select>
        </div>
        ${songsHTML}
    `;

    // Re-initialize elements after rendering
    app.elements.languageSelector = document.getElementById('language');
    app.elements.songContainers = document.querySelectorAll('.song-container');

    // Add event listeners
    setupLanguageChangeListener();

    // Set up animation observer
    setupAnimationObserver();
}

// Setup language change listener
function setupLanguageChangeListener() {
    app.elements.languageSelector.addEventListener('change', () => {
        updateLanguage(app.elements.languageSelector.value);
    });
}

// Language switching functionality
function updateLanguage(lang) {
    if (!app.songsData) {
        console.error('Songs data not loaded');
        return;
    }

    console.log('Language changed to:', lang);
    app.currentLanguage = lang;

    // Fade out effect
    app.elements.songContainers.forEach(container => {
        container.style.opacity = '0.7';
    });

    setTimeout(() => {
        // Update titles and content
        app.songsData.forEach((song, index) => {
            const titleElement = document.querySelectorAll('.song-title')[index];
            const contentElement = document.querySelectorAll('.song-content')[index];

            if (titleElement && song[lang]) {
                titleElement.innerHTML = song[lang].title;
            }
            if (contentElement && song[lang]) {
                contentElement.innerHTML = song[lang].content;
            }
        });

        // Fade in effect
        app.elements.songContainers.forEach(container => {
            container.style.opacity = '1';
        });

        showNotification(
            `Language changed to ${lang === 'en' ? 'English' : 'தமிழ்'}`
        );
    }, 300);
}

// Set up animation observer
function setupAnimationObserver() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);

    app.elements.songContainers.forEach(container => {
        observer.observe(container);
    });
}

// Notification function
function showNotification(message, duration = 3000) {
    // Create notification element
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 10rem;
        right: 20px;
        background-color: var(--primary-color);
        color: var(--light-text);
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        z-index: 1000;
        font-weight: 600;
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;

    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, duration);
}

// Add CSS for animations
function addStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .loading-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 400px;
            gap: 1rem;
        }

        .loading-spinner {
            width: 50px;
            height: 50px;
            border: 4px solid var(--secondary-color);
            border-top: 4px solid var(--primary-color);
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        .keyboard-navigation *:focus {
            outline: 2px solid var(--accent-color) !important;
            outline-offset: 2px !important;
        }

        .animate-in {
        
            animation: slideInFromBottom 0.6s ease-out;
        }

        @keyframes slideInFromBottom {
            from {
                opacity: 0;
                transform: translateY(50px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    `;
    document.head.appendChild(style);
}

// Initialize app functionality
function initializeApp() {
    // Set up smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Handle keyboard navigation
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Tab') {
            document.body.classList.add('keyboard-navigation');
        }
    });

    document.addEventListener('mousedown', function () {
        document.body.classList.remove('keyboard-navigation');
    });

    // Handle responsive video sizing
    let resizeTimer;
    window.addEventListener('resize', function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () {
            const iframes = document.querySelectorAll('iframe');
            const isMobile = window.innerWidth <= 768;
            iframes.forEach(iframe => {
                iframe.style.height = isMobile ? '250px' : '315px';
            });
        }, 250);
    });
}

// Main initialization function
async function initialize() {
    addStyles();
    initializeElements();

    const dataLoaded = await loadSongsData();
    if (dataLoaded) {
        renderSongs();
        initializeApp();
        showNotification('Songs loaded successfully!', 2000);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initialize);