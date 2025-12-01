// ============================
// Utility Functions
// ============================
const qs = selector => document.querySelector(selector);
const qsa = selector => document.querySelectorAll(selector);

// ============================
// Initialization
// ============================
window.addEventListener('load', () => {
    // Reset scroll position on page refresh if hash exists
    if (window.location.hash) {
        const target = qs(window.location.hash);
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    }
});

// ============================
// Scroll Handling
// ============================
let hasScrolled = false; // Track if the user has scrolled at all

const handleScroll = () => {
    const header = qs('header');
    
    // Header transparency/blur toggle
    if (window.scrollY > 50) {
        if (!hasScrolled) { // Only set hasScrolled to true once
            hasScrolled = true;
        }
        header.classList.add('header-scrolled');
    } else {
        header.classList.remove('header-scrolled');
    }
    
    // Active Link Highlight
    const sections = qsa('section');
    const navLinks = qsa('.nav-links a');

    let currentSection = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 200;
        const sectionHeight = section.clientHeight;
        if (window.scrollY >= sectionTop) {
            currentSection = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentSection}`) {
            link.classList.add('active');
        }
    });
};

window.addEventListener('scroll', handleScroll);

// ============================
// Stamp Logo Scroll to Top
// ============================
const stampLogo = qs('.stamp-logo');
if (stampLogo) {
    stampLogo.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

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

let currentIndex = 0;
const helloText = qs('#hello-text');

const changeGreeting = () => {
    if (!helloText) return;
    
    // Fade out
    helloText.classList.add('fade');
    helloText.style.opacity = 0;
    
    setTimeout(() => {
        // Change text
        currentIndex = (currentIndex + 1) % greetings.length;
        helloText.textContent = greetings[currentIndex].text;
        helloText.setAttribute('title', greetings[currentIndex].language); // Accessibility hint
        
        // Fade in
        helloText.style.opacity = 1;
        helloText.classList.remove('fade');
    }, 500); // Wait for fade out transition
};

// Start loop
if (helloText) {
    setInterval(changeGreeting, 2500);
}

// ============================
// Smooth Scroll for Anchor Links
// ============================
qsa('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href');
        const targetSection = qs(targetId);
        
        if (targetSection) {
            window.scrollTo({
                top: targetSection.offsetTop - 100,
                behavior: 'smooth'
            });
            
            // Update URL without jump
            history.pushState(null, null, targetId);
        }
    });
});
