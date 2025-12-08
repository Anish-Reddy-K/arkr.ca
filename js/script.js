// ============================================================================
// IMPORTS
// ============================================================================

import WebLLMEngine from './webllm-engine.js';

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
// AI CHAT MODULE
// ============================================================================

/**
 * AI Chat Module - Handles the in-browser AI assistant powered by WebLLM
 * Features:
 * - Local LLM inference using WebLLM (runs entirely in browser)
 * - Streaming responses for better UX
 * - Typewriter placeholder effect
 * - Choreographed animations for state transitions
 */
const AIChat = {
    // -------------------------------------------------------------------------
    // State
    // -------------------------------------------------------------------------
    
    /** @type {string[]} Placeholder prompts for typewriter effect */
    prompts: [],

    /** @type {'collapsed'|'focused'|'chat'|'closing'} UI state */
    uiState: 'collapsed',

    /** @type {'checking'|'loading'|'ready'|'error'|'unsupported'} Engine status */
    engineStatus: 'checking',

    /** @type {Object|null} AI configuration */
    config: null,

    /** @type {Object|null} AI context (portfolio data) */
    context: null,

    /** @type {Object|null} Queued message while loading */
    queuedMessage: null,

    /** @type {number|null} Typewriter timeout ID */
    typewriterTimeout: null,

    /** @type {boolean} Whether typewriter is currently running */
    typewriterRunning: false,

    // -------------------------------------------------------------------------
    // DOM Element References
    // -------------------------------------------------------------------------
    
    elements: {
        container: null,
        infoLine: null,
        statusDot: null,
        statusText: null,
        chatMessages: null,
        inputWrapper: null,
        userInput: null,
        sendButton: null,
        infoLink: null,
    },

    // -------------------------------------------------------------------------
    // Configuration Loading
    // -------------------------------------------------------------------------

    /**
     * Loads AI configuration and context
     * @returns {Promise<void>}
     */
    async loadConfig() {
        try {
            const [configRes, contextRes] = await Promise.all([
                fetch('data/ai_config.json'),
                fetch('data/ai_context.json'),
            ]);
            
            this.config = await configRes.json();
            this.context = await contextRes.json();
        } catch (error) {
            console.error('[AIChat] Failed to load config:', error);
        }
    },

    /**
     * Builds the system prompt with context
     * @returns {string}
     */
    buildSystemPrompt() {
        if (!this.config || !this.context) {
            return "You are a helpful AI assistant for Anish Reddy's portfolio website.";
        }

        // Build context summary
        const ctx = this.context;
        const contextStr = [
            `Name: ${ctx.name}`,
            `Title: ${ctx.title}`,
            `Location: ${ctx.location}`,
            `Summary: ${ctx.summary}`,
            '',
            'Experience:',
            ...ctx.experience.map(e => `- ${e.role} at ${e.company} (${e.period}): ${e.highlights.join('; ')}`),
            '',
            'Projects:',
            ...ctx.projects.map(p => `- ${p.name}: ${p.description}. Tech: ${p.tech}. ${p.highlights.join('; ')}`),
            '',
            `Skills: ${Object.values(ctx.skills).flat().join(', ')}`,
            '',
            `Awards: ${ctx.awards.join(', ')}`,
            '',
            `Activities: ${ctx.activities.map(a => `${a.title} (${a.role})`).join(', ')}`,
            '',
            `Contact: ${ctx.email} | GitHub: ${ctx.github} | LinkedIn: ${ctx.linkedin}`,
        ].join('\n');

        return this.config.systemPromptTemplate.replace('{context}', contextStr);
    },

    // -------------------------------------------------------------------------
    // Status Management
    // -------------------------------------------------------------------------

    /**
     * Updates the engine status and UI indicator
     * @param {'checking'|'loading'|'ready'|'error'|'unsupported'} status
     */
    setEngineStatus(status) {
        this.engineStatus = status;
        const { statusDot, statusText, container } = this.elements;

        if (statusDot) {
            // Remove all status classes
            statusDot.classList.remove('ready', 'loading', 'error');
            
            // Add appropriate class
            if (status === 'ready') {
                statusDot.classList.add('ready');
            } else if (status === 'loading') {
                statusDot.classList.add('loading');
            } else if (status === 'error' || status === 'unsupported') {
                statusDot.classList.add('error');
            }
        }

        // Update status text and container class
        if (statusText) {
            if (status === 'loading') {
                statusText.textContent = 'Loading model in browser...';
            } else if (status === 'ready') {
                statusText.textContent = 'In-browser, local LLM';
            } else {
                statusText.textContent = 'In-browser, local LLM';
            }
        }

        // Add/remove downloading class for loading bar visibility
        if (container) {
            if (status === 'loading') {
                container.classList.add('downloading');
            } else {
                container.classList.remove('downloading');
            }
        }
    },

    /**
     * Updates the loading progress bar via CSS variable
     * @param {number} percent Progress percentage (0-100)
     */
    setProgress(percent) {
        const { container } = this.elements;
        if (container) {
            container.style.setProperty('--loading-progress', `${percent}%`);
        }
    },

    // -------------------------------------------------------------------------
    // WebLLM Initialization
    // -------------------------------------------------------------------------

    /**
     * Initializes the WebLLM engine
     * @returns {Promise<void>}
     */
    async initWebLLM() {
        this.setEngineStatus('checking');

        // Check WebGPU support
        const compatibility = await WebLLMEngine.checkCompatibility();
        
        if (!compatibility.supported) {
            this.setEngineStatus('unsupported');
            console.warn('[AIChat] WebGPU not supported:', compatibility.reason);
            return;
        }

        this.setEngineStatus('loading');
        this.setProgress(0);

        const systemPrompt = this.buildSystemPrompt();

        const success = await WebLLMEngine.init({
            modelId: this.config?.modelId || 'Llama-3.2-1B-Instruct-q4f16_1-MLC',
            systemPrompt,
            temperature: this.config?.temperature ?? 0.2,
            onProgress: ({ percent }) => {
                this.setProgress(percent);
            },
            onReady: () => {
                this.setEngineStatus('ready');
                this.setProgress(100);
                
                // Process queued message if any
                if (this.queuedMessage) {
                    const msg = this.queuedMessage;
                    this.queuedMessage = null;
                    this.processMessage(msg.question, msg.element);
                }
            },
            onError: (error) => {
                this.setEngineStatus('error');
                console.error('[AIChat] WebLLM error:', error);
            },
        });

        if (!success) {
            this.setEngineStatus('error');
        }
    },

    // -------------------------------------------------------------------------
    // Typewriter Effect for Placeholder
    // -------------------------------------------------------------------------

    /**
     * Initializes prompts from config
     */
    initPrompts() {
        if (this.config?.placeholderPrompts) {
            this.prompts = this.config.placeholderPrompts;
        }
        
        if (this.prompts.length > 0) {
            this.startTypewriter();
        }
    },

    /**
     * Starts the typewriter effect for placeholder text
     */
    startTypewriter() {
        const input = this.elements.userInput;
        if (!input || this.prompts.length === 0) return;

        // Stop any existing typewriter to prevent overlapping loops
        this.stopTypewriter();

        // Prevent starting if already running (safety check)
        if (this.typewriterRunning) {
            return;
        }

        this.typewriterRunning = true;
        let promptIndex = Math.floor(Math.random() * this.prompts.length);
        let charIndex = 0;
        let isDeleting = false;
        
        const TYPE_SPEED = 70;      // ms per character when typing
        const DELETE_SPEED = 35;    // ms per character when deleting
        const PAUSE_END = 2500;     // pause at end of word
        const PAUSE_START = 400;    // pause before starting new word

        const type = () => {
            // Only stop typewriter in chat mode (after first message)
            if (this.uiState === 'chat') {
                this.typewriterRunning = false;
                return;
            }

            const currentPrompt = this.prompts[promptIndex];
            
            if (isDeleting) {
                // Deleting characters
                charIndex--;
                input.placeholder = currentPrompt.substring(0, charIndex);
                
                if (charIndex === 0) {
                    isDeleting = false;
                    promptIndex = (promptIndex + 1) % this.prompts.length;
                    this.typewriterTimeout = setTimeout(type, PAUSE_START);
                    return;
                }
                
                this.typewriterTimeout = setTimeout(type, DELETE_SPEED);
            } else {
                // Typing characters
                charIndex++;
                input.placeholder = currentPrompt.substring(0, charIndex);
                
                if (charIndex === currentPrompt.length) {
                    isDeleting = true;
                    this.typewriterTimeout = setTimeout(type, PAUSE_END);
                    return;
                }
                
                this.typewriterTimeout = setTimeout(type, TYPE_SPEED);
            }
        };

        // Start the effect
        type();
    },

    /**
     * Stops the typewriter effect
     */
    stopTypewriter() {
        if (this.typewriterTimeout) {
            clearTimeout(this.typewriterTimeout);
            this.typewriterTimeout = null;
        }
        this.typewriterRunning = false;
    },

    // -------------------------------------------------------------------------
    // UI State Management
    // -------------------------------------------------------------------------

    /**
     * Updates send button enabled/disabled state based on input
     */
    updateSendButtonState() {
        const { sendButton, userInput } = this.elements;
        if (sendButton && userInput) {
            sendButton.disabled = userInput.value.trim() === '';
        }
    },

    /**
     * Sets the UI state with proper class management
     * @param {'collapsed'|'focused'|'chat'|'closing'} newState
     */
    setUIState(newState) {
        const { container, chatMessages, userInput } = this.elements;
        if (!container) return;

        const prevState = this.uiState;
        
        // Don't transition if already in that state (except closing)
        if (prevState === newState && newState !== 'closing') return;

        // Remove all state classes
        container.classList.remove('focused', 'chat-open', 'closing');

        switch (newState) {
            case 'focused':
                container.classList.add('focused');
                this.uiState = 'focused';
                break;
                
            case 'chat':
                container.classList.add('chat-open');
                this.uiState = 'chat';
                // Stop typewriter and set static placeholder
                this.stopTypewriter();
                if (userInput) {
                    userInput.placeholder = 'Type a message...';
                }
                setTimeout(() => this.scrollToBottom(), 50);
                break;
                
            case 'closing':
                container.classList.add('closing');
                this.uiState = 'closing';
                
                // After animation completes, reset to collapsed
                setTimeout(() => {
                    container.classList.remove('closing');
                    chatMessages.innerHTML = '';
                    userInput.value = '';
                    this.updateSendButtonState();
                    this.uiState = 'collapsed';
                    
                    // Reset conversation
                    WebLLMEngine.reset();
                    
                    // Restart typewriter when returning to collapsed
                    if (this.prompts.length > 0) {
                        this.startTypewriter();
                    }
                }, 400);
                break;
                
            case 'collapsed':
            default:
                this.uiState = 'collapsed';
                userInput.value = '';
                this.updateSendButtonState();
                // Restart typewriter when collapsing
                if (this.prompts.length > 0) {
                    this.startTypewriter();
                }
                break;
        }
    },

    /**
     * Scrolls chat messages to bottom
     */
    scrollToBottom() {
        const { chatMessages } = this.elements;
        if (chatMessages) {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    },

    // -------------------------------------------------------------------------
    // Message Display
    // -------------------------------------------------------------------------

    /**
     * Appends a message to the chat display
     * @param {'user'|'ai'|'system'} role - Message sender role
     * @param {string} content - Message content
     * @returns {HTMLElement} The created message element
     */
    appendMessage(role, content) {
        const { chatMessages } = this.elements;
        
        const messageDiv = document.createElement('div');
        messageDiv.classList.add(`${role}-message`);
        messageDiv.textContent = content;
        
        chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
        
        return messageDiv;
    },

    // -------------------------------------------------------------------------
    // Server Communication (Analytics Logging)
    // -------------------------------------------------------------------------

    /**
     * Logs chat interaction (question + response) to server for analytics
     * @param {string} question - User's question
     * @param {string} response - AI's response
     * @param {string} [status='success'] - Status of the interaction
     * @returns {Promise<boolean>} Success status
     */
    async logChat(question, response, status = 'success') {
        try {
            const res = await fetch('api/log_chat.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question, response, status }),
            });
            const result = await res.json();
            return result.success;
        } catch (error) {
            // Silent fail - logging shouldn't break the chat experience
            console.warn('[AIChat] Failed to log chat:', error);
            return false;
        }
    },

    // -------------------------------------------------------------------------
    // Chat Handling
    // -------------------------------------------------------------------------

    /**
     * Handles user message submission
     * @returns {Promise<void>}
     */
    async handleSubmit() {
        const { userInput } = this.elements;
        const question = userInput.value.trim();
        
        if (!question) return;

        // Clear input and transition to chat state
        userInput.value = '';
        this.updateSendButtonState();
        this.setUIState('chat');

        // Display user message
        this.appendMessage('user', question);

        // Create AI message placeholder
        const aiMessage = this.appendMessage('ai', '');

        // Handle based on current engine status
        if (this.engineStatus === 'unsupported') {
            const errorMsg = "Sorry, your browser doesn't support WebGPU. Please try Chrome 113+, Edge 113+, or Firefox 126+.";
            aiMessage.textContent = errorMsg;
            this.logChat(question, errorMsg, 'unsupported');
            return;
        }

        if (this.engineStatus === 'error') {
            const errorMsg = "Sorry, there was an error loading the AI. Please refresh and try again.";
            aiMessage.textContent = errorMsg;
            this.logChat(question, errorMsg, 'error');
            return;
        }

        if (this.engineStatus === 'loading' || this.engineStatus === 'checking') {
            aiMessage.textContent = "Downloading model... I'll answer once ready.";
            this.queuedMessage = { question, element: aiMessage };
            return;
        }

        await this.processMessage(question, aiMessage);
    },

    /**
     * Processes a message with WebLLM
     * @param {string} question - User's question
     * @param {HTMLElement} messageElement - Element to stream response into
     * @returns {Promise<void>}
     */
    async processMessage(question, messageElement) {
        messageElement.textContent = '';
        let fullResponse = '';

        try {
            // Stream response from WebLLM
            for await (const chunk of WebLLMEngine.chat(question)) {
                fullResponse += chunk;
                messageElement.textContent = fullResponse;
                this.scrollToBottom();
            }
            
            // Log the complete interaction (non-blocking)
            this.logChat(question, fullResponse, 'success');
        } catch (error) {
            console.error('[AIChat] Error getting response:', error);
            const errorMsg = "Sorry, I encountered an error. Please try again.";
            messageElement.textContent = errorMsg;
            this.logChat(question, errorMsg, 'error');
        }
    },

    // -------------------------------------------------------------------------
    // Event Handlers
    // -------------------------------------------------------------------------

    /**
     * Handles clicks outside the chat container
     * @param {MouseEvent} event
     */
    handleOutsideClick(event) {
        const { container } = this.elements;
        if (!container) return;
        
        if (!container.contains(event.target)) {
            if (this.uiState === 'chat') {
                // Close with animation
                this.setUIState('closing');
            } else if (this.uiState === 'focused') {
                // Just collapse width
                this.setUIState('collapsed');
            }
        }
    },

    /**
     * Sets up all event listeners
     */
    initEventListeners() {
        const { container, userInput, sendButton } = this.elements;

        // Input focus/blur for width expansion
        userInput.addEventListener('focus', () => {
            if (this.uiState === 'collapsed') {
                this.setUIState('focused');
            }
        });

        userInput.addEventListener('blur', () => {
            // Only collapse if not in chat mode and input is empty
            if (this.uiState === 'focused' && userInput.value.trim() === '') {
                // Small delay to allow click events to fire first
                setTimeout(() => {
                    if (this.uiState === 'focused') {
                        this.setUIState('collapsed');
                    }
                }, 150);
            }
        });

        // Input change
        userInput.addEventListener('input', () => this.updateSendButtonState());

        // Submit events
        sendButton.addEventListener('click', () => this.handleSubmit());
        
        sendButton.addEventListener('mousedown', (e) => {
            e.preventDefault(); // Prevent input blur
        });

        userInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.handleSubmit();
            }
        });

        // Outside click to close
        document.addEventListener('click', (e) => this.handleOutsideClick(e));
    },

    // -------------------------------------------------------------------------
    // Initialization
    // -------------------------------------------------------------------------

    /**
     * Caches DOM element references
     * @returns {boolean} True if all required elements found
     */
    cacheElements() {
        this.elements = {
            container: qs('#ai-chat-container'),
            infoLine: qs('#ai-info-line'),
            statusDot: qs('#ai-status-dot'),
            statusText: qs('#ai-status-text'),
            chatMessages: qs('#ai-chat-messages'),
            inputWrapper: qs('#ai-input-wrapper'),
            userInput: qs('#ai-user-input'),
            sendButton: qs('#ai-send-button'),
            infoLink: qs('.ai-info-link'),
        };

        // Check required elements
        const required = ['container', 'chatMessages', 'userInput', 'sendButton'];
        const missing = required.filter(key => !this.elements[key]);
        
        if (missing.length > 0) {
            console.warn('[AIChat] Missing required elements:', missing);
            return false;
        }
        
        return true;
    },

    /**
     * Initializes the AI Chat module
     * @returns {Promise<void>}
     */
    async init() {
        if (!this.cacheElements()) return;

        this.updateSendButtonState();
        this.initEventListeners();
        
        // Load config first (contains prompts)
        await this.loadConfig();
        
        // Update info link with blog URL
        if (this.elements.infoLink && this.config?.blogUrl) {
            this.elements.infoLink.href = this.config.blogUrl;
        }
        
        // Start typewriter effect for placeholder
        this.initPrompts();

        // Initialize WebLLM (starts on page load)
        this.initWebLLM();

        console.log('[AIChat] Module initialized');
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
    AIChat.init();
});
