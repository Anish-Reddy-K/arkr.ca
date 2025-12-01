// Script for arkr.ca

// ============================ 
// Utility Functions
// ============================ 
const qs = selector => document.querySelector(selector);
const qsa = selector => document.querySelectorAll(selector);

// ============================ 
// Initialization
// ============================ 
window.addEventListener('load', () => {
    // Reset scroll position on page refresh
    if (window.location.hash) {
        window.scrollTo(0, 0);
        history.replaceState(null, null, ' ');
    }
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
    setInterval(changeGreeting, 3600); // Total cycle: 0.8s fade-out, 0.8s fade-in, ~2s pause
}


// ============================ 
// Smooth Scroll
// ============================ 
qsa('.nav-links a').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
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
        e.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}