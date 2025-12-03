// Script for arkr.ca

// ============================ 
// Utility Functions
// ============================ 
const qs = selector => document.querySelector(selector);
const qsa = selector => document.querySelectorAll(selector);

// Prompts for AI input
let prompts = [];
let currentPromptIndex = 0;
// const userInput = qs('#user-input'); // Moved this inside the function

const loadAndRotatePrompts = async () => {
    console.log("Loading prompts and setting placeholder..."); // Debug log
    const userInput = qs('#user-input'); // Define userInput here
    try {
        const response = await fetch('data/prompts.json');
        prompts = await response.json();
        console.log("prompts array:", prompts); // Debug log

        console.log("userInput element:", userInput); // Debug log
        if (prompts.length > 0 && userInput) {
            // Pick a random starting prompt
            currentPromptIndex = Math.floor(Math.random() * prompts.length);
            console.log("Setting placeholder to:", prompts[currentPromptIndex]); // Debug log
            userInput.placeholder = prompts[currentPromptIndex];
            console.log("Placeholder set to:", userInput.placeholder); // Debug log

            // Start rotating prompts every 5 seconds (adjust as needed)
            setInterval(rotatePlaceholderText, 5000);
        }
    } catch (error) {
        console.error('Error loading prompts:', error);
    }
};

const rotatePlaceholderText = () => {
    const userInput = qs('#user-input'); // Also query here
    if (userInput && prompts.length > 0) {
        // Add a class to fade out the placeholder (CSS will handle the transition)
        userInput.classList.add('placeholder-fade-out');

        setTimeout(() => {
            currentPromptIndex = (currentPromptIndex + 1) % prompts.length;
            userInput.placeholder = prompts[currentPromptIndex];
            // Remove the class to fade in the new placeholder
            userInput.classList.remove('placeholder-fade-out');
        }, 500); // Half a second for fade-out, then change text and fade-in
    }
};


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
                const linkIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/></svg>`;


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

        // 4. Load Sidebar Interests (Optional/Hidden for now if redundant)
        // keeping code if user wants sidebar back, but primarily loading footer marquee now.
        const interestResponse = await fetch('data/interests.json');
        const interestsData = await interestResponse.json();
        
        // Load Footer Marquee
        const marqueeContainer = qs('#footer-marquee-content');
        if (marqueeContainer && interestsData) {
            // Duplicate list for seamless loop (x4)
            const repeatedInterests = [...interestsData, ...interestsData, ...interestsData, ...interestsData];
            
            marqueeContainer.innerHTML = repeatedInterests.map(interest => `
                <span class="footer-marquee-item">${interest}</span>
                <span class="footer-marquee-separator">✦</span>
            `).join('');
        }

        // Load Sidebar (If element exists)
        const sidebarContainer = qs('#sidebar-interests');
        if (sidebarContainer && interestsData) {
             const sidebarItems = interestsData.slice(0, 6).map(item => `<li>${item}</li>`).join('');
             sidebarContainer.innerHTML = `
                <h4>Interests</h4>
                <ul>
                    ${sidebarItems}
                </ul>
            `;
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
    loadAndRotatePrompts(); // Call new function
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
qsa('.nav-links a').forEach(link => {
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

// ============================ 
// AI Input Logic (from webllm_widget.js)
// ============================
document.addEventListener('DOMContentLoaded', () => {
    const userInput = qs('#user-input');
    const sendButton = qs('#send-button');
    const textInputContainer = qs('#text-input-container');
    const chatMessages = qs('#chat-messages'); // Get reference to the chat messages container
    const inputAreaWrapper = qs('#input-area-wrapper'); // Added this line

    // Function to update the state of the send button
    const updateSendButtonState = () => {
        if (userInput.value.trim() === '') {
            sendButton.disabled = true;
        } else {
            sendButton.disabled = false;
        }
    };

    // Function to handle sending user input
    const handleUserInput = async () => { // Make this function async
        const inputValue = userInput.value.trim();

        if (sendButton.disabled) { // Do not proceed if button is disabled
            return;
        }

        if (inputValue === '') {
            // This case should ideally not be reached if button is disabled
            // but as a fallback, prevent sending empty messages.
            return; 
        } else {
            // Input is not empty, proceed with sending
            console.log('Sending message:', inputValue);

            // Create and append user message to the chat display
            const userMessageDiv = document.createElement('div');
            userMessageDiv.classList.add('user-message');
            userMessageDiv.textContent = inputValue;
            chatMessages.appendChild(userMessageDiv);

            // Expand the container if it's not already expanded
            if (!textInputContainer.classList.contains('expanded')) {
                textInputContainer.classList.add('expanded');
                // Adjust scroll height after expansion
                setTimeout(() => {
                    chatMessages.scrollTop = chatMessages.scrollHeight;
                }, 300); // Allow time for transition
            } else {
                chatMessages.scrollTop = chatMessages.scrollHeight; // Scroll to bottom
            }

            try {
                const response = await fetch('api/save_input.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ userInput: inputValue }),
                });

                const result = await response.json();

                if (result.success) {
                    console.log('Server response:', result.message);
                    // Clear input after successful send
                    userInput.value = '';
                    updateSendButtonState(); // Update button state after clearing input
                } else {
                    console.error('Error saving input:', result.message);
                    // Optionally, show an error to the user
                }
            } catch (error) {
                console.error('Network error:', error);
                // Optionally, show a network error to the user
            }
        }
    };

    if (sendButton && userInput && textInputContainer && chatMessages && inputAreaWrapper) {
        // Initial state of the send button
        updateSendButtonState();

        // Update send button state on input change
        userInput.addEventListener('input', updateSendButtonState);

        // Handle focus and blur for width expansion
        userInput.addEventListener('focus', () => {
            textInputContainer.classList.add('width-expanded');
        });

        userInput.addEventListener('blur', () => {
            // Only clear the input and update button state on blur
            // The closing logic will be handled by a global click listener
            userInput.value = ''; // Clear message immediately
            updateSendButtonState(); // Update button state immediately
        });

        // Handle send button click
        sendButton.addEventListener('click', handleUserInput);

        // Handle Enter key press in the input field
        userInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) { // Send on Enter, allow Shift+Enter for new line
                e.preventDefault(); // Prevent default new line behavior
                handleUserInput();
            }
        });

        // Close text input container when clicking outside of it
        document.addEventListener('click', (e) => {
            // If the text input container is expanded and the click is outside it
            if (textInputContainer.classList.contains('expanded') && !textInputContainer.contains(e.target)) {
                // Perform the closing animation immediately
                textInputContainer.classList.remove('width-expanded');
                textInputContainer.classList.remove('expanded');
                
                // Clear input and update button state
                userInput.value = '';
                updateSendButtonState();
            }
        });

        // Listen for the transition end on the text input container
        textInputContainer.addEventListener('transitionend', (e) => {
            // Only clear messages if the max-height transition has ended and the container is fully collapsed
            if (e.propertyName === 'max-height' && !textInputContainer.classList.contains('expanded')) {
                chatMessages.innerHTML = ''; // Clear chat messages
            }
        });

    }
});
