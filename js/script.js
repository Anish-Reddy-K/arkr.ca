// ============================================================================
// UTILITIES
// ============================================================================

const qs = selector => document.querySelector(selector);
const qsa = selector => document.querySelectorAll(selector);

/**
 * Throttles a function to run at most once per specified delay
 */
const throttle = (func, delay) => {
    let lastCall = 0;
    return (...args) => {
        const now = Date.now();
        if (now - lastCall >= delay) {
            lastCall = now;
            func(...args);
        }
    };
};

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

const CONFIG = {
    SPOTIFY: {
        POLL_INTERVAL: 10000, // 10 seconds
        MARQUEE: {
            SPEED: 40, // px per second
            BUFFER: 30, // pixels
            PAUSE_START: 2000, // ms
            PAUSE_END: 2000, // ms
        },
    },
    GREETING: {
        INITIAL_DELAY: 1500, // ms
        ROTATION_INTERVAL: 3600, // ms
        FADE_DURATION: 800, // ms
    },
    SCROLL: {
        OFFSET: 100, // pixels
        THROTTLE_DELAY: 16, // ~60fps
    },
};

const GREETINGS = [
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

// SVG Icons
const SVG_ICONS = {
    GITHUB: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>`,
    EXTERNAL_LINK: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/></svg>`,
};

// ============================================================================
// CONTENT LOADER MODULE
// ============================================================================

const ContentLoader = {
    /**
     * Loads and renders all portfolio content from JSON files
     */
    async loadAll() {
        try {
            await Promise.all([
                this.loadExperience(),
                this.loadProjects(),
                this.loadActivities(),
                this.loadInterests(),
            ]);
        } catch (error) {
            console.error('Error loading content:', error);
        }
    },

    /**
     * Loads and renders experience data
     */
    async loadExperience() {
        const response = await fetch('data/experience.json');
        const data = await response.json();
        const container = qs('#experience-container');
        
        if (container && data) {
            container.innerHTML = data.map(item => `
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
    },

    /**
     * Loads and renders projects data
     */
    async loadProjects() {
        const response = await fetch('data/projects.json');
        const data = await response.json();
        const container = qs('#projects-container');
        
        if (container && data) {
            container.innerHTML = data.map(project => {
                const githubLinkHtml = project.showGithub 
                    ? `<a href="${project.githubLink}" target="_blank" aria-label="View Code">${SVG_ICONS.GITHUB}</a>` 
                    : '';
                const externalLinkHtml = project.showLink 
                    ? `<a href="${project.externalLink}" target="_blank" aria-label="View Project">${SVG_ICONS.EXTERNAL_LINK}</a>` 
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
    },

    /**
     * Loads and renders activities and awards data
     */
    async loadActivities() {
        const response = await fetch('data/activities.json');
        const data = await response.json();
        
        // Load Activities
        const activitiesContainer = qs('#activities-container');
        if (activitiesContainer && data.activities) {
            activitiesContainer.innerHTML = data.activities.map(item => `
                <div class="activity-item">
                    <div class="activity-header">
                        <h3>${item.title}</h3>
                        <span class="date">${item.date}</span>
                    </div>
                    <p>${item.description}</p>
                </div>
            `).join('');
        }

        // Load Awards
        const awardsContainer = qs('#awards-container');
        if (awardsContainer && data.awards) {
            awardsContainer.innerHTML = data.awards.map(cat => `
                <div class="award-category">
                    <h4>${cat.category}</h4>
                    <div class="award-chips">
                        ${cat.items.map(chip => `<span class="chip ${chip.color}">${chip.text}</span>`).join('')}
                    </div>
                </div>
            `).join('');
        }
    },

    /**
     * Loads and renders interests in footer marquee
     */
    async loadInterests() {
        const response = await fetch('data/interests.json');
        const data = await response.json();
        const container = qs('#footer-marquee-content');
        
        if (container && data) {
            // Duplicate list for seamless loop (x4)
            const repeatedInterests = [...data, ...data, ...data, ...data];
            
            container.innerHTML = repeatedInterests.map(interest => `
                <span class="footer-marquee-item">${interest}</span>
                <span class="footer-marquee-separator">✦</span>
            `).join('');
        }
    },
};

// ============================================================================
// SCROLL HANDLER MODULE
// ============================================================================

const ScrollHandler = {
    // Cached DOM elements
    header: null,
    sections: null,
    navLinks: null,

    /**
     * Caches DOM elements for performance
     */
    cacheElements() {
        this.header = qs('header');
        this.sections = qsa('section');
        this.navLinks = qsa('.nav-links a');
    },

    /**
     * Handles scroll events for header transparency and navigation highlighting
     */
    handle() {
        this.updateHeaderTransparency();
        this.updateNavigationHighlight();
    },

    /**
     * Updates header transparency based on scroll position
     */
    updateHeaderTransparency() {
        if (this.header) {
            const isScrolled = window.scrollY > 0;
            if (isScrolled) {
                this.header.classList.add('header-scrolled');
            } else {
                this.header.classList.remove('header-scrolled');
            }
        }
    },

    /**
     * Updates active navigation link based on current section
     */
    updateNavigationHighlight() {
        if (!this.sections || this.sections.length === 0) return;

        this.sections.forEach(section => {
            const sectionTop = section.offsetTop - CONFIG.SCROLL.OFFSET;
            const sectionHeight = section.clientHeight;
            const scrollPosition = window.scrollY;

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                const targetId = `#${section.id}`;
                this.navLinks.forEach(link => {
                    link.classList.toggle('active', link.getAttribute('href') === targetId);
                });
            }
        });
    },

    /**
     * Initializes scroll event listener with throttling
     */
    init() {
        this.cacheElements();
        
        // Set initial state
        this.updateHeaderTransparency();
        
        // Throttled scroll handler
        const throttledHandle = throttle(() => this.handle(), CONFIG.SCROLL.THROTTLE_DELAY);
        window.addEventListener('scroll', throttledHandle);
        
        // Also check on scroll end to ensure state is correct
        let scrollEndTimer;
        window.addEventListener('scroll', () => {
            clearTimeout(scrollEndTimer);
            scrollEndTimer = setTimeout(() => {
                this.updateHeaderTransparency();
            }, 150);
        });
    },
};

// ============================================================================
// NAVIGATION MODULE
// ============================================================================

const Navigation = {
    /**
     * Initializes smooth scroll behavior for navigation links
     */
    init() {
        qsa('.nav-links a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                
                // Only attempt scroll if it's an internal link
                if (targetId.startsWith('#')) {
                    const target = qs(targetId);
                    if (target) {
                        target.scrollIntoView({ behavior: 'smooth' });
                    }
                } else {
                    // External or page links behave normally
                    window.location.href = targetId;
                }
            });
        });
    },
};

// ============================================================================
// GREETING MODULE
// ============================================================================

const Greeting = {
    currentIndex: 0,
    rotationInterval: null,

    /**
     * Changes the greeting text with fade animation
     */
    change() {
        const helloText = qs('#hello-text');
        if (!helloText) return;

        helloText.classList.add('fade');

        setTimeout(() => {
            this.currentIndex = (this.currentIndex + 1) % GREETINGS.length;
            helloText.textContent = GREETINGS[this.currentIndex].text;
            helloText.classList.remove('fade');
        }, CONFIG.GREETING.FADE_DURATION);
    },

    /**
     * Initializes the greeting rotation
     */
    init() {
        const helloText = qs('#hello-text');
        if (!helloText) return;

        // Initial faster transition for English
        setTimeout(() => {
            this.change();
            this.rotationInterval = setInterval(() => this.change(), CONFIG.GREETING.ROTATION_INTERVAL);
        }, CONFIG.GREETING.INITIAL_DELAY);
    },
};

// ============================================================================
// SPOTIFY WIDGET MODULE
// ============================================================================

const SpotifyWidget = {
    // DOM Elements
    widget: null,
    albumArt: null,
    statusBack: null,
    songTitle: null,
    artistName: null,

    // Animation tracking
    activeAnimations: new Map(),

    // Polling interval
    pollInterval: null,

    /**
     * Initializes DOM element references
     */
    initElements() {
        this.widget = qs('#spotify-widget');
        this.albumArt = qs('#spotify-album-art');
        this.statusBack = qs('#spotify-status-back');
        this.songTitle = qs('#spotify-song-title');
        this.artistName = qs('#spotify-artist-name');
    },

    /**
     * Stops animation on an element
     */
    stopAnimation(element) {
        if (this.activeAnimations.has(element)) {
            const data = this.activeAnimations.get(element);
            clearTimeout(data.timeoutId);
            element.style.transition = 'none';
            element.style.transform = 'translateX(0)';
            this.activeAnimations.delete(element);
        }
    },

    /**
     * Runs the marquee animation loop for overflowing text
     */
    runAnimationLoop(element, containerWidth, textWidth) {
        const { SPEED, BUFFER, PAUSE_START, PAUSE_END } = CONFIG.SPOTIFY.MARQUEE;
        const distOut = textWidth + BUFFER;
        const distIn = containerWidth + BUFFER;
        
        const durationOut = (distOut / SPEED) * 1000;
        const durationIn = (distIn / SPEED) * 1000;

        const step1 = () => {
            // Reset to start
            element.style.transition = 'none';
            element.style.transform = 'translateX(0)';
            
            // Wait, then scroll out
            const id1 = setTimeout(() => {
                element.style.transition = `transform ${durationOut}ms linear`;
                element.style.transform = `translateX(-${distOut}px)`;
                
                // Wait for scroll out, then teleport to right
                const id2 = setTimeout(() => {
                    element.style.transition = 'none';
                    element.style.transform = `translateX(${distIn}px)`;
                    
                    // Wait for teleport, then scroll in (single RAF is sufficient)
                    requestAnimationFrame(() => {
                        element.style.transition = `transform ${durationIn}ms linear`;
                        element.style.transform = 'translateX(0)';
                        
                        // Wait for scroll in, then loop
                        const id3 = setTimeout(() => {
                            step1();
                        }, durationIn + PAUSE_END);
                        
                        this.activeAnimations.set(element, { timeoutId: id3 });
                    });
                }, durationOut);
                this.activeAnimations.set(element, { timeoutId: id2 });
            }, PAUSE_START);
            this.activeAnimations.set(element, { timeoutId: id1 });
        };
        
        step1();
    },

    /**
     * Checks if text overflows and animates if needed
     */
    checkAndAnimateMarquee(element) {
        if (!element || !element.parentElement) return;

        this.stopAnimation(element);
        element.parentElement.classList.remove('active');
        element.classList.remove('scrolling');

        const containerWidth = element.parentElement.clientWidth;
        const textWidth = element.scrollWidth;

        if (textWidth > containerWidth) {
            element.parentElement.classList.add('active');
            this.runAnimationLoop(element, containerWidth, textWidth);
        }
    },

    /**
     * Updates a text element with animation if needed
     */
    updateTextElement(element, newText) {
        if (!element) return;

        if (element.textContent !== newText) {
            element.textContent = newText;
            this.checkAndAnimateMarquee(element);
        } else if (!this.activeAnimations.has(element) && 
                   element.scrollWidth > element.parentElement.clientWidth) {
            this.checkAndAnimateMarquee(element);
        }
    },

    /**
     * Updates the widget with new song data
     */
    update(song) {
        if (!this.widget) return;

        if (song.isPlaying) {
            this.widget.classList.remove('hidden');
            
            // Update album art
            if (this.albumArt && this.albumArt.src !== song.albumArt) {
                this.albumArt.src = song.albumArt;
            }
            
            // Update status text
            if (this.statusBack && song.status) {
                const statusText = song.status === 'LISTENING TO' 
                    ? "Anish is<br>currently playing" 
                    : "Anish<br>last listened to";
                if (this.statusBack.innerHTML !== statusText) {
                    this.statusBack.innerHTML = statusText;
                }
            }

            // Update song title and artist name using helper method
            this.updateTextElement(this.songTitle, song.title);
            this.updateTextElement(this.artistName, song.artist);
        } else {
            this.widget.classList.add('hidden');
            if (this.songTitle) this.stopAnimation(this.songTitle);
            if (this.artistName) this.stopAnimation(this.artistName);
        }
    },

    /**
     * Fetches current Spotify playing status
     */
    async fetchNowPlaying() {
        try {
            const response = await fetch('api/spotify.php');
            const data = await response.json();
            this.update(data);
        } catch (error) {
            console.error('Error fetching Spotify data:', error);
            if (this.widget) {
                this.widget.classList.add('hidden');
            }
        }
    },

    /**
     * Initializes the Spotify widget and starts polling
     */
    init() {
        this.initElements();
        this.fetchNowPlaying(); // Initial check
        this.pollInterval = setInterval(() => this.fetchNowPlaying(), CONFIG.SPOTIFY.POLL_INTERVAL);
    },
};

// ============================================================================
// AI INPUT MODULE
// ============================================================================

const AIInput = {
    // State
    prompts: [],
    currentPromptIndex: 0,
    config: null,

    // DOM Elements (initialized in init)
    userInput: null,
    sendButton: null,
    textInputContainer: null,
    chatMessages: null,
    inputAreaWrapper: null,

    /**
     * Loads AI configuration from JSON
     */
    async loadConfig() {
        if (this.config) return; // Load only once
        
        try {
            const response = await fetch('data/ai_config.json');
            this.config = await response.json();
        } catch (error) {
            console.error('Error loading AI config:', error);
            this.config = {
                responseMessage: "I'm sorry, I encountered an error. Please try again.",
                streaming_speed_ms_per_char: 50
            };
        }
    },

    /**
     * Streams a message character by character with animation
     */
    async streamMessage(message, targetElement, speed) {
        let i = 0;
        targetElement.textContent = '';
        
        const interval = setInterval(() => {
            if (i < message.length) {
                targetElement.textContent += message.charAt(i);
                // Auto-scroll to bottom
                if (this.chatMessages) {
                    this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
                }
                i++;
            } else {
                clearInterval(interval);
            }
        }, speed);
    },

    /**
     * Loads prompts and starts placeholder rotation
     */
    async loadAndRotatePrompts() {
        console.log("Loading prompts and setting placeholder...");
        
        try {
            const response = await fetch('data/prompts.json');
            this.prompts = await response.json();
            console.log("prompts array:", this.prompts);

            if (this.prompts.length > 0 && this.userInput) {
                this.currentPromptIndex = Math.floor(Math.random() * this.prompts.length);
                this.userInput.placeholder = this.prompts[this.currentPromptIndex];
                console.log("Placeholder set to:", this.userInput.placeholder);

                setInterval(() => this.rotatePlaceholderText(), 3000);
            }
        } catch (error) {
            console.error('Error loading prompts:', error);
        }
    },

    /**
     * Rotates the placeholder text with fade animation
     */
    rotatePlaceholderText() {
        if (!this.userInput || this.prompts.length === 0) return;

        this.userInput.classList.add('placeholder-fade-out');

        setTimeout(() => {
            this.currentPromptIndex = (this.currentPromptIndex + 1) % this.prompts.length;
            this.userInput.placeholder = this.prompts[this.currentPromptIndex];
            this.userInput.classList.remove('placeholder-fade-out');
        }, 500);
    },

    /**
     * Updates the send button state based on input
     */
    updateSendButtonState() {
        if (this.sendButton && this.userInput) {
            this.sendButton.disabled = this.userInput.value.trim() === '';
        }
    },

    /**
     * Handles sending user input and displaying AI response
     */
    async handleUserInput() {
        const inputValue = this.userInput.value.trim();

        if (this.sendButton.disabled || inputValue === '') {
            return;
        }

        console.log('Sending message:', inputValue);

        // Create and append user message
        const userMessageDiv = document.createElement('div');
        userMessageDiv.classList.add('user-message');
        userMessageDiv.textContent = inputValue;
        this.chatMessages.appendChild(userMessageDiv);

        // Expand container if needed
        if (!this.textInputContainer.classList.contains('expanded')) {
            this.textInputContainer.classList.add('expanded');
            setTimeout(() => {
                this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
            }, 300);
        } else {
            this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        }

        try {
            // Send to server
            const response = await fetch('api/save_input.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userInput: inputValue }),
            });

            const result = await response.json();

            if (result.success) {
                console.log('Server response:', result.message);
                this.userInput.value = '';
                this.updateSendButtonState();

                // Create AI message placeholder
                const aiMessageDiv = document.createElement('div');
                aiMessageDiv.classList.add('ai-message');
                this.chatMessages.appendChild(aiMessageDiv);
                this.chatMessages.scrollTop = this.chatMessages.scrollHeight;

                // Stream AI response after thinking delay
                setTimeout(async () => {
                    if (!this.config) await this.loadConfig();
                    if (this.config) {
                        await this.streamMessage(
                            this.config.responseMessage, 
                            aiMessageDiv, 
                            this.config.streaming_speed_ms_per_char
                        );
                    } else {
                        aiMessageDiv.textContent = "Error: Could not load AI configuration.";
                        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
                    }
                }, 1000);
            } else {
                console.error('Error saving input:', result.message);
            }
        } catch (error) {
            console.error('Network error:', error);
        }
    },

    /**
     * Clears server-side input history
     */
    async clearServerHistory() {
        try {
            const response = await fetch('api/clear_inputs.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });
            const data = await response.json();
            
            if (data.success) {
                console.log('Server history cleared:', data.message);
            } else {
                console.error('Failed to clear server history:', data.message);
            }
        } catch (error) {
            console.error('Network error clearing server history:', error);
        }
    },

    /**
     * Handles clicking outside the input container
     */
    handleOutsideClick(e) {
        if (this.textInputContainer.classList.contains('expanded') && 
            !this.textInputContainer.contains(e.target)) {
            // Close expanded container
            this.textInputContainer.classList.remove('width-expanded');
            this.textInputContainer.classList.remove('expanded');
            this.userInput.value = '';
            this.updateSendButtonState();
            this.clearServerHistory();
        } else if (!this.textInputContainer.contains(e.target) && 
                   this.textInputContainer.classList.contains('width-expanded')) {
            // Close width-expanded container
            this.textInputContainer.classList.remove('width-expanded');
            this.userInput.value = '';
            this.updateSendButtonState();
        }
    },

    /**
     * Initializes all event listeners
     */
    initEventListeners() {
        // Send button state on input change
        this.userInput.addEventListener('input', () => this.updateSendButtonState());

        // Focus/blur for width expansion
        this.userInput.addEventListener('focus', () => {
            this.textInputContainer.classList.add('width-expanded');
        });

        this.userInput.addEventListener('blur', () => {
            if (!this.textInputContainer.classList.contains('expanded')) {
                this.textInputContainer.classList.remove('width-expanded');
                this.userInput.value = '';
                this.updateSendButtonState();
            }
        });

        // Send button click
        this.sendButton.addEventListener('click', () => this.handleUserInput());
        
        // Prevent input blur on send button mousedown
        this.sendButton.addEventListener('mousedown', (e) => {
            e.preventDefault();
        });

        // Enter key to send
        this.userInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.handleUserInput();
            }
        });

        // Click outside to close
        document.addEventListener('click', (e) => this.handleOutsideClick(e));

        // Clear messages on container collapse
        this.textInputContainer.addEventListener('transitionend', (e) => {
            if (e.propertyName === 'max-height' && 
                !this.textInputContainer.classList.contains('expanded')) {
                this.chatMessages.innerHTML = '';
            }
        });
    },

    /**
     * Initializes the AI input module
     */
    init() {
        // Get DOM elements
        this.userInput = qs('#user-input');
        this.sendButton = qs('#send-button');
        this.textInputContainer = qs('#text-input-container');
        this.chatMessages = qs('#chat-messages');
        this.inputAreaWrapper = qs('#input-area-wrapper');

        // Validate all elements exist
        if (!this.sendButton || !this.userInput || !this.textInputContainer || 
            !this.chatMessages || !this.inputAreaWrapper) {
            console.warn('AI Input: Some required DOM elements are missing');
            return;
        }

        // Initialize
        this.updateSendButtonState();
        this.initEventListeners();
        this.loadAndRotatePrompts();
    },
};

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Main initialization function
 */
window.addEventListener('load', async () => {
    // Load all content
    await ContentLoader.loadAll();

    // Reset scroll position on page refresh
    if (window.location.hash) {
        window.scrollTo(0, 0);
        history.replaceState(null, null, ' ');
    }
    
    // Initialize all modules
    ScrollHandler.init();
    Navigation.init();
    Greeting.init();
    SpotifyWidget.init();
    AIInput.init();
});
