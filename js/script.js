// Script for arkr.ca

// ============================ 
// Utility Functions
// ============================ 
const qs = selector => document.querySelector(selector);
const qsa = selector => document.querySelectorAll(selector);

// ============================ 
// Content Loading (JSON to HTML)
// ============================ 
const loadContent = async () => {
    try {
        // 1. Load Experience
        const expResponse = await fetch('data/experience.json');
        const experienceData = await expResponse.json();
        const expContainer = qs('#experience-container');
        if (expContainer && experienceData) {
            expContainer.innerHTML = experienceData.map(item => `
                <div class="experience-card">
                    <div class="card-header">
                        <div class="header-line-1">
                            <h3 class="company-name">${item.company}</h3>
                            <span class="date">${item.date}</span>
                        </div>
                        <div class="header-line-2">
                            <span class="role">${item.role}</span>
                            <span class="location">${item.location}</span>
                        </div>
                    </div>
                    <ul>
                        ${item.bullets.map(bullet => `<li>${bullet}</li>`).join('')}
                    </ul>
                </div>
            `).join('');
        }

        // 2. Load Projects
        const projResponse = await fetch('data/projects.json');
        const projectsData = await projResponse.json();
        const projContainer = qs('#projects-container');
        if (projContainer && projectsData) {
            projContainer.innerHTML = projectsData.map(project => {
                // SVG Icons
                const githubIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>`;
                const linkIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>`;

                const githubLinkHtml = project.showGithub 
                    ? `<a href="${project.githubLink}" target="_blank" aria-label="View Code">${githubIcon}</a>` 
                    : '';
                const externalLinkHtml = project.showLink 
                    ? `<a href="${project.externalLink}" target="_blank" aria-label="View Project">${linkIcon}</a>` 
                    : '';

                return `
                <div class="project-card">
                    <div class="card-header">
                        <div class="header-line-1">
                            <h3>${project.title}</h3>
                            <div class="status-badge ${project.status}">
                                <span class="status-dot"></span>
                                ${project.statusText}
                            </div>
                        </div>
                        <div class="header-line-2">
                            <span class="tech-stack">${project.techStack}</span>
                            <div class="project-header-links">
                                ${githubLinkHtml}
                                ${externalLinkHtml}
                            </div>
                        </div>
                    </div>
                    <ul>
                        ${project.bullets.map(bullet => `<li>${bullet}</li>`).join('')}
                    </ul>
                </div>
                `;
            }).join('');
        }

        // 3. Load Activities & Awards
        const actResponse = await fetch('data/activities.json');
        const actData = await actResponse.json();
        
        // Activities List
        const actContainer = qs('#activities-container');
        if (actContainer && actData.activities) {
            actContainer.innerHTML = actData.activities.map(item => `
                <div class="activity-item">
                    <div class="activity-header">
                        <h3>${item.title}</h3>
                        <span class="date">${item.date}</span>
                    </div>
                    <p>${item.description}</p>
                </div>
            `).join('');
        }

        // Awards List
        const awardsContainer = qs('#awards-container');
        if (awardsContainer && actData.awards) {
            awardsContainer.innerHTML = actData.awards.map(cat => `
                <div class="award-category">
                    <h4>${cat.category}</h4>
                    <div class="award-chips">
                        ${cat.items.map(chip => `<span class="chip ${chip.color}">${chip.text}</span>`).join('')}
                    </div>
                </div>
            `).join('');
        }

    } catch (error) {
        console.error('Error loading content:', error);
    }
};

// ============================ 
// Visit Counter
// ============================ 
const fetchVisitCount = async () => {
    try {
        const response = await fetch('api/visits.php');
        const data = await response.json();
        const visitCountEl = qs('#visit-count');
        if (visitCountEl) {
            visitCountEl.textContent = `"${data.visits}"`; // Add quotes to match JSON style
        }
    } catch (error) {
        console.error('Error fetching visit count:', error);
        const visitCountEl = qs('#visit-count');
        if (visitCountEl) visitCountEl.textContent = '"Error"';
    }
};

// ============================ 
// Initialization
// ============================ 
window.addEventListener('load', () => {
    // Load Content
    loadContent();

    // Reset scroll position on page refresh
    if (window.location.hash) {
        window.scrollTo(0, 0);
        history.replaceState(null, null, ' ');
    }
    
    // Fetch Visit Count
    fetchVisitCount();
});

// ============================ 
// Scroll Handling
// ============================ 
const handleScroll = () => {
    // Header transparency
    const header = qs('header');
    if (header) {
        header.classList.toggle('header-scrolled', window.scrollY > 1);
    }

    // Navigation highlight
    const sections = qsa('section');
    const navLinks = qsa('.nav-links a');

    if (sections.length > 0) {
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.clientHeight;
            const scrollPosition = window.scrollY;

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                const targetId = `#${section.id}`;
                navLinks.forEach(link => {
                    link.classList.toggle('active', link.getAttribute('href') === targetId);
                });
            }
        });
    }
};

window.addEventListener('scroll', handleScroll);

// ============================ 
// Multilingual Greeting
// ============================ 
const greetings = [
    { text: "Hello,", language: "English" },
    { text: "Bonjour,", language: "French" },
    { text: "こんにちは,", language: "Japanese" },
    { text: "नमस्ते,", language: "Hindi" },
    { text: "Hola,", language: "Spanish" },
    { text: "నమస్తే,", language: "Telugu" },
    { text: "你好,", language: "Mandarin" },
    { text: "مرحبا,", language: "Arabic" },
    { text: "Hallo,", language: "German" },
    { text: "Привет,", language: "Russian" },
    { text: "안녕하세요,", language: "Korean" }
];

const changeGreeting = () => {
    const helloText = qs('#hello-text');
    if (helloText) {
        helloText.classList.add('fade'); // Start fade out

        setTimeout(() => {
            currentIndex = (currentIndex + 1) % greetings.length;
            helloText.textContent = greetings[currentIndex].text;
            helloText.classList.remove('fade'); // Start fade in
        }, 800); // Wait for fade-out to complete (match CSS transition duration)
    }
};

let currentIndex = 0;
if (qs('#hello-text')) {
    // Initial faster transition for English
    setTimeout(() => {
        changeGreeting(); // Trigger first change
        setInterval(changeGreeting, 3600); // Continue loop
    }, 1500); // Shorter duration for the first "Hello"
}


// Smooth Scroll
// Apply smooth scroll to nav links AND the scroll indicator
qsa('.nav-links a, .scroll-indicator').forEach(link => {
    link.addEventListener('click', (e) => {        e.preventDefault();
        const targetId = link.getAttribute('href');
        // Only attempt scroll if it's an internal link
        if (targetId.startsWith('#')) {
            const target = qs(targetId);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        } else {
            // External or page links behave normally
            window.location.href = targetId;
        }
    });
});

// ============================
// Back to Top Smooth Scroll
// ============================
const badgeLink = qs('#badge-link');
if (badgeLink) {
    badgeLink.addEventListener('click', (e) => {
        // Check if the clicked element is inside the .code-snippet
        if (e.target.closest('.code-snippet')) {
            // Prevent default to stop jump to top, but allow propagation/selection
            e.preventDefault(); 
            e.stopPropagation();
            return;
        }

        // If not inside .code-snippet, prevent default and scroll to top
        e.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// ============================
// Spotify Live Widget
// ============================
const spotifyWidget = qs('#spotify-widget');
const spotifyAlbumArt = qs('#spotify-album-art');
const spotifyTrackInfo = qs('#spotify-track-info'); // SVG Text Path
const spotifyStatusText = qs('#spotify-status-text'); // Status Text Path
const spotifyStatusBackText = qs('#spotify-status-back-text'); // Status Text on back of card

const truncateText = (text, maxLength) => {
    if (text.length > maxLength) {
        return text.substring(0, maxLength) + '...';
    }
    return text;
};

const updateSpotifyWidget = (song) => {
    if (!spotifyWidget) return;

    if (song.isPlaying) {
        spotifyWidget.classList.remove('hidden');
        if (spotifyAlbumArt) spotifyAlbumArt.src = song.albumArt;
        
        // Update Status Text on front
        if (spotifyStatusText && song.status) {
            spotifyStatusText.textContent = song.status;
        }

        // Update Status Text on back
        if (spotifyStatusBackText) {
            const truncatedTitle = truncateText(song.title, 25); // Apply truncation
            if (song.status === 'LISTENING TO') {
                spotifyStatusBackText.textContent = `"Anish is currently listening to ${truncatedTitle} on Spotify."`;
            } else {
                spotifyStatusBackText.textContent = `"Anish last listened to ${truncatedTitle} on Spotify."`;
            }
        }
        
        if (spotifyTrackInfo) {
            let displayTitle = song.title;
            let displayArtist = song.artist;

            // Define individual max lengths. Total combined string, including "...", should fit in ~25 characters.
            const maxTitleLength = 12; 
            const maxArtistLength = 10;
            const finalCombinedLength = 25; // Adjusted to be more conservative for visual fit

            if (displayTitle.length > maxTitleLength) {
                displayTitle = truncateText(displayTitle, maxTitleLength);
            }
            if (displayArtist.length > maxArtistLength) {
                displayArtist = truncateText(displayArtist, maxArtistLength);
            }
            
            const rawText = `${displayTitle} • ${displayArtist}`;
            const text = truncateText(rawText, finalCombinedLength); // Final truncation for SVG path fit
            spotifyTrackInfo.textContent = text;
        }
    } else {
        // Update Status Text on back to "Last Played" before hiding the widget
        if (spotifyStatusBackText) {
            spotifyStatusBackText.textContent = "Last Played";
        }
        spotifyWidget.classList.add('hidden');
    }
};

const fetchNowPlaying = async () => {
    try {
        // Call the PHP proxy
        const response = await fetch('api/spotify.php');
        const data = await response.json();
        updateSpotifyWidget(data);
    } catch (error) {
        console.error('Error fetching Spotify data:', error);
        // Optionally hide widget on error
        if (spotifyWidget) spotifyWidget.classList.add('hidden');
    }
};

// Start polling
fetchNowPlaying(); // Initial check
setInterval(fetchNowPlaying, 10000); // Poll every 10 seconds
