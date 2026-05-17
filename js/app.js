/**
 * Shriyukth's Little World - Interactive Application Engine
 * Core Logic: Age Ticker, Parents Customize Modal, Wish Board (localStorage), 
 * time capsule envelopes, polaroid lightboxes, and a Web Audio API Music Box synthesizer.
 */

// --- 1. DEFAULT CONFIGURATION SYSTEM ---
const DEFAULT_CONFIG = {
    name: "Shriyukth",
    birthDate: "2024-12-20",
    birthTime: "08:30",
    birthWeight: "3.4",
    currentWeight: "7.8",
    currentHeight: "68.0",
    favToy: "Mr. Squeaky the Plush Giraffe",
    favSnack: "Mashed bananas & sweet applesauce",
    superpower: "Sleeping in funny pretzel shapes!"
};

// Global baby state, synced to localStorage
let babyConfig = {};

function initConfig() {
    const savedConfig = localStorage.getItem("shriyukth_baby_config");
    if (savedConfig) {
        babyConfig = JSON.parse(savedConfig);
        // If the cached birthdate was the previous default placeholder, force update it to the actual birthday!
        if (babyConfig.birthDate === "2025-09-18") {
            babyConfig.birthDate = "2024-12-20";
            localStorage.setItem("shriyukth_baby_config", JSON.stringify(babyConfig));
        }
    } else {
        babyConfig = { ...DEFAULT_CONFIG };
        localStorage.setItem("shriyukth_baby_config", JSON.stringify(babyConfig));
    }
    applyConfigToUI();
}

function applyConfigToUI() {
    // Set text displays
    document.getElementById("baby-name-display").textContent = babyConfig.name;
    document.getElementById("birth-weight-display").textContent = babyConfig.birthWeight + " kg";
    
    // Format birth date in human-friendly format (e.g. September 18, 2025)
    const bDate = new Date(babyConfig.birthDate);
    const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById("birth-date-display").textContent = bDate.toLocaleDateString('en-US', dateOptions);
    
    // Format birth time (e.g. 08:30 AM)
    const timeParts = babyConfig.birthTime.split(":");
    let hours = parseInt(timeParts[0]);
    const minutes = timeParts[1];
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes} ${ampm}`;
    document.getElementById("birth-time-display").textContent = formattedTime;

    // Set Dashboard stats
    document.getElementById("display-weight").innerHTML = `${babyConfig.currentWeight} <span class="stats-unit">kg</span>`;
    document.getElementById("display-height").innerHTML = `${babyConfig.currentHeight} <span class="stats-unit">cm</span>`;
    
    // Calculate weight & height gain
    const birthWt = parseFloat(babyConfig.birthWeight);
    const currWt = parseFloat(babyConfig.currentWeight);
    const weightGain = (currWt - birthWt).toFixed(1);
    document.getElementById("diff-weight").textContent = `+${weightGain} kg since birth`;
    
    // Estimate height gain based on average newborn height of 50cm if not customizable yet
    const currHt = parseFloat(babyConfig.currentHeight);
    const heightGain = (currHt - 50).toFixed(1);
    document.getElementById("diff-height").textContent = `+${heightGain} cm since birth`;

    // Fun facts
    document.getElementById("fav-toy-display").textContent = babyConfig.favToy;
    document.getElementById("fav-food-display").textContent = babyConfig.favSnack;
    document.getElementById("superpower-display").textContent = babyConfig.superpower;

    // Calculate Zodiac sign dynamically
    const zodiac = calculateZodiacSign(bDate.getMonth() + 1, bDate.getDate());
    document.getElementById("zodiac-display").textContent = zodiac;

    // Update settings form input default values
    document.getElementById("cfg-name").value = babyConfig.name;
    document.getElementById("cfg-birth-weight").value = babyConfig.birthWeight;
    document.getElementById("cfg-birth-date").value = babyConfig.birthDate;
    document.getElementById("cfg-birth-time").value = babyConfig.birthTime;
    document.getElementById("cfg-weight").value = babyConfig.currentWeight;
    document.getElementById("cfg-height").value = babyConfig.currentHeight;
    document.getElementById("cfg-toy").value = babyConfig.favToy;
    document.getElementById("cfg-food").value = babyConfig.favSnack;
    document.getElementById("cfg-superpower").value = babyConfig.superpower;
}

// Zodiac Sign Calculator
function calculateZodiacSign(month, day) {
    const signs = [
        { name: "Capricorn (The Grounded)", maxDay: 19 },
        { name: "Aquarius (The Thinker)", maxDay: 18 },
        { name: "Pisces (The Dreamer)", maxDay: 20 },
        { name: "Aries (The Pioneer)", maxDay: 19 },
        { name: "Taurus (The Builder)", maxDay: 20 },
        { name: "Gemini (The Storyteller)", maxDay: 20 },
        { name: "Cancer (The Nurturer)", maxDay: 22 },
        { name: "Leo (The Leader)", maxDay: 22 },
        { name: "Virgo (The Helper)", maxDay: 22 },
        { name: "Libra (The Harmonizer)", maxDay: 22 },
        { name: "Scorpio (The Explorer)", maxDay: 21 },
        { name: "Sagittarius (The Seeker)", maxDay: 21 }
    ];
    
    // Month is 1-indexed. Index 0 of signs corresponds to Capricorn (ends in Jan), so let's adjust:
    let index = month - 1;
    if (day > signs[index].maxDay) {
        index = (index + 1) % 12;
    }
    return signs[index].name;
}


// --- 2. ACCURATE AGE TICKER ENGINE ---
let ageIntervalId = null;

function startAgeTicker() {
    if (ageIntervalId) clearInterval(ageIntervalId);

    const updateTicker = () => {
        // Construct the birth Date object
        const birthDateString = `${babyConfig.birthDate}T${babyConfig.birthTime}:00`;
        const birth = new Date(birthDateString);
        const now = new Date();

        if (now < birth) {
            // Handle future dates gracefully (countdown mode!)
            const diffMs = birth - now;
            document.getElementById("age-years").textContent = "00";
            document.getElementById("age-months").textContent = "00";
            document.getElementById("age-days").textContent = Math.floor(diffMs / (1000 * 60 * 60 * 24)).toString().padStart(2, '0');
            document.getElementById("age-hours").textContent = Math.floor((diffMs / (1000 * 60 * 60)) % 24).toString().padStart(2, '0');
            document.getElementById("age-minutes").textContent = Math.floor((diffMs / (1000 * 60)) % 60).toString().padStart(2, '0');
            document.getElementById("age-seconds").textContent = Math.floor((diffMs / 1000) % 60).toString().padStart(2, '0');
            return;
        }

        // Calculate accurate calendar differences
        let years = now.getFullYear() - birth.getFullYear();
        let months = now.getMonth() - birth.getMonth();
        let days = now.getDate() - birth.getDate();
        let hours = now.getHours() - birth.getHours();
        let minutes = now.getMinutes() - birth.getMinutes();
        let seconds = now.getSeconds() - birth.getSeconds();

        // Adjust negative values back up
        if (seconds < 0) {
            seconds += 60;
            minutes--;
        }
        if (minutes < 0) {
            minutes += 60;
            hours--;
        }
        if (hours < 0) {
            hours += 24;
            days--;
        }
        if (days < 0) {
            // Find length of last month
            const lastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
            days += lastMonth.getDate();
            months--;
        }
        if (months < 0) {
            months += 12;
            years--;
        }

        // Populate elements
        document.getElementById("age-years").textContent = years.toString().padStart(2, '0');
        document.getElementById("age-months").textContent = months.toString().padStart(2, '0');
        document.getElementById("age-days").textContent = days.toString().padStart(2, '0');
        document.getElementById("age-hours").textContent = hours.toString().padStart(2, '0');
        document.getElementById("age-minutes").textContent = minutes.toString().padStart(2, '0');
        document.getElementById("age-seconds").textContent = seconds.toString().padStart(2, '0');
    };

    updateTicker();
    ageIntervalId = setInterval(updateTicker, 1000);
}


// --- 3. PARENTS CUSTOMIZER MODAL ---
const settingsBtn = document.getElementById("settings-btn");
const settingsModal = document.getElementById("settings-modal");
const settingsCloseBtn = document.getElementById("modal-close-btn");
const settingsForm = document.getElementById("settings-form");

settingsBtn.addEventListener("click", () => {
    settingsModal.classList.add("active");
});

settingsCloseBtn.addEventListener("click", () => {
    settingsModal.classList.remove("active");
});

// Close modal when clicking on background overlay
window.addEventListener("click", (e) => {
    if (e.target === settingsModal) {
        settingsModal.classList.remove("active");
    }
});

settingsForm.addEventListener("submit", (e) => {
    e.preventDefault();
    
    // Retrieve values from inputs
    babyConfig.name = document.getElementById("cfg-name").value;
    babyConfig.birthWeight = document.getElementById("cfg-birth-weight").value;
    babyConfig.birthDate = document.getElementById("cfg-birth-date").value;
    babyConfig.birthTime = document.getElementById("cfg-birth-time").value;
    babyConfig.currentWeight = parseFloat(document.getElementById("cfg-weight").value).toFixed(1);
    babyConfig.currentHeight = parseFloat(document.getElementById("cfg-height").value).toFixed(1);
    babyConfig.favToy = document.getElementById("cfg-toy").value;
    babyConfig.favSnack = document.getElementById("cfg-food").value;
    babyConfig.superpower = document.getElementById("cfg-superpower").value;

    // Save to localStorage
    localStorage.setItem("shriyukth_baby_config", JSON.stringify(babyConfig));

    // Reapply and close
    applyConfigToUI();
    startAgeTicker();
    settingsModal.classList.remove("active");

    // Add a tiny toast confirmation
    showToast(`Updated ${babyConfig.name}'s profile beautifully! 🍼`);
});

function showToast(message) {
    const toast = document.createElement("div");
    toast.className = "toast-message";
    toast.textContent = message;
    
    // Add toast to DOM
    document.body.appendChild(toast);
    
    // Style toast programmatically to keep styles clean
    Object.assign(toast.style, {
        position: 'fixed',
        bottom: '100px',
        left: '50%',
        transform: 'translateX(-50%) translateY(20px)',
        background: 'rgba(0, 0, 0, 0.75)',
        color: '#fff',
        padding: '12px 24px',
        borderRadius: '100px',
        fontFamily: 'Quicksand, sans-serif',
        fontSize: '0.9rem',
        fontWeight: '700',
        zIndex: '3000',
        boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
        opacity: '0',
        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        pointerEvents: 'none'
    });

    // Animate in
    setTimeout(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(-50%) translateY(0)';
    }, 100);

    // Animate out & remove
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(-50%) translateY(20px)';
        setTimeout(() => toast.remove(), 400);
    }, 3000);
}


// --- 4. PHOTO LIGHTBOX & FILTERING ---
const polaroidGrid = document.getElementById("polaroid-grid");
const filterButtons = document.querySelectorAll(".filter-btn");
const lightboxModal = document.getElementById("lightbox-modal");
const lightboxImg = document.getElementById("lightbox-img");
const lightboxCaption = document.getElementById("lightbox-caption");
const lightboxCloseBtn = document.getElementById("lightbox-close-btn");

// Filtering memories
filterButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        // Toggle active button class
        filterButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        const filter = btn.getAttribute("data-filter");
        const polaroids = document.querySelectorAll(".polaroid-item");

        polaroids.forEach(p => {
            const category = p.getAttribute("data-category");
            if (filter === "all" || category === filter) {
                p.classList.add("show");
            } else {
                p.classList.remove("show");
            }
        });
    });
});

// Polaroid image Zoom Lightbox
document.querySelectorAll(".polaroid-card").forEach(card => {
    card.addEventListener("click", () => {
        const img = card.querySelector("img");
        const caption = card.querySelector(".polaroid-caption");
        
        lightboxImg.src = img.src;
        lightboxCaption.textContent = caption.textContent;
        lightboxModal.classList.add("active");
    });
});

lightboxCloseBtn.addEventListener("click", () => {
    lightboxModal.classList.remove("active");
});

lightboxModal.addEventListener("click", (e) => {
    if (e.target === lightboxModal) {
        lightboxModal.classList.remove("active");
    }
});


// --- 5. INTERACTIVE WISHING WELL (GUESTBOOK) ---
const wishForm = document.getElementById("wishing-well-form");
const wishesBoard = document.getElementById("wishes-board");
const emptyState = document.getElementById("wishes-empty");
const clearWishesBtn = document.getElementById("clear-wishes-btn");

// Form variables
let selectedColor = "pink";
let selectedStamp = "🧸";

// Pick Card color theme
document.querySelectorAll(".color-dot").forEach(dot => {
    dot.addEventListener("click", () => {
        document.querySelectorAll(".color-dot").forEach(d => d.classList.remove("active"));
        dot.classList.add("active");
        selectedColor = dot.getAttribute("data-color");
    });
});

// Pick Stamp Icon
document.querySelectorAll(".stamp-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".stamp-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        selectedStamp = btn.getAttribute("data-stamp");
    });
});

// Save and Render wishes from local storage
let wishes = [];

function loadWishes() {
    const savedWishes = localStorage.getItem("shriyukth_wishes");
    let needsReset = false;
    if (savedWishes) {
        wishes = JSON.parse(savedWishes);
        // Reset cache if it contains the previous placeholder data
        if (wishes.length > 0 && wishes.some(w => w.author === "Grandma Helen" || w.author === "Uncle Neil")) {
            needsReset = true;
        }
    }
    
    if (!savedWishes || needsReset) {
        wishes = [
            { id: 1, author: "Mommy Girija & Daddy Sunil", text: "Our little miracle Shriyukth, you brought pure heaven into our lives! Keep smiling and shining, our sweet angel boy.", color: "pink", stamp: "🤍", rotation: -4 },
            { id: 2, author: "Grandma Mamatha, Santha & Grandpa Ramana", text: "Blessings and infinite love to our precious grandson. May you grow wise, healthy, and always touch the stars!", color: "yellow", stamp: "⭐", rotation: 4 },
            { id: 3, author: "Aunty Manasa, Uncle Darshan & Sudarshan", text: "To our favorite little explorer! We can't wait to watch you take your big steps and go on adventures together.", color: "blue", stamp: "🎈", rotation: -2 }
        ];
        localStorage.setItem("shriyukth_wishes", JSON.stringify(wishes));
    }
    renderWishes();
}

function renderWishes() {
    // Clear everything except empty state
    wishesBoard.querySelectorAll(".wish-card-note").forEach(card => card.remove());

    if (wishes.length === 0) {
        emptyState.style.display = "flex";
        return;
    }

    emptyState.style.display = "none";

    wishes.forEach(wish => {
        const note = createWishNoteElement(wish);
        wishesBoard.appendChild(note);
    });
}

function createWishNoteElement(wish) {
    const card = document.createElement("div");
    card.className = `wish-card-note card-color-${wish.color}`;
    card.style.setProperty("--rotation", `${wish.rotation}deg`);
    
    card.innerHTML = `
        <span class="wish-note-stamp">${wish.stamp}</span>
        <p class="wish-note-text">"${wish.text}"</p>
        <div class="wish-note-author">&mdash; ${wish.author}</div>
    `;

    // Make sticky notes grab/draggable to play around with!
    makeStickyNoteDraggable(card);

    return card;
}

function makeStickyNoteDraggable(elem) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    
    elem.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
        e = e || window.event;
        // Don't drag if clicking buttons inside (if any)
        if (e.target.tagName === 'BUTTON') return;
        
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
        
        elem.style.zIndex = "1000";
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        
        // Compute new positions
        const newTop = elem.offsetTop - pos2;
        const newLeft = elem.offsetLeft - pos1;
        
        elem.style.top = newTop + "px";
        elem.style.left = newLeft + "px";
        elem.style.position = "relative";
    }

    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
        elem.style.zIndex = "";
    }
}

// Add a wish form submission
wishForm.addEventListener("submit", (e) => {
    e.preventDefault();
    
    const authorInput = document.getElementById("wish-author");
    const textInput = document.getElementById("wish-text");
    
    const randomRotation = Math.floor(Math.random() * 12) - 6; // Random rotation between -6 and +6 degrees

    const newWish = {
        id: Date.now(),
        author: authorInput.value.trim(),
        text: textInput.value.trim(),
        color: selectedColor,
        stamp: selectedStamp,
        rotation: randomRotation
    };

    wishes.push(newWish);
    localStorage.setItem("shriyukth_wishes", JSON.stringify(wishes));

    renderWishes();

    // Reset inputs
    authorInput.value = "";
    textInput.value = "";

    showToast("Blessed wish successfully cast! 🧚💫");
});

// Clear Wishes button
clearWishesBtn.addEventListener("click", () => {
    if (confirm("Are you sure you want to clear the guestbook board? (This wipes offline local storage data)")) {
        wishes = [];
        localStorage.setItem("shriyukth_wishes", JSON.stringify(wishes));
        renderWishes();
        showToast("Board cleared! Cast a new note!");
    }
});


// --- 6. 18TH BIRTHDAY TIME CAPSULE SEAL ---
const capsuleForm = document.getElementById("time-capsule-form");
const capsuleSuccess = document.getElementById("capsule-success");
const capsuleResetBtn = document.getElementById("capsule-reset-btn");
const envelopeDiv = document.querySelector(".envelope-animation");

capsuleForm.addEventListener("submit", (e) => {
    e.preventDefault();
    
    // Animate envelope sealing
    envelopeDiv.classList.add("sealed");
    
    // Show capsule overlay after envelope folding finishes
    setTimeout(() => {
        capsuleSuccess.classList.add("active");
    }, 1500);
});

capsuleResetBtn.addEventListener("click", () => {
    capsuleSuccess.classList.remove("active");
    envelopeDiv.classList.remove("sealed");
    capsuleForm.reset();
});


// --- 7. SOOTHING MUSIC BOX LULLABY SYNTHESIZER (WEB AUDIO API) ---
class MusicBoxSynth {
    constructor() {
        this.ctx = null;
        this.isPlaying = false;
        this.sequenceId = null;
        
        // Twinkle Twinkle Little Star Music score
        // [Pitch (Scientific Note Name), beats duration]
        this.notes = [
            ["C5", 1], ["C5", 1], ["G5", 1], ["G5", 1], ["A5", 1], ["A5", 1], ["G5", 2],
            ["F5", 1], ["F5", 1], ["E5", 1], ["E5", 1], ["D5", 1], ["D5", 1], ["C5", 2],
            ["G5", 1], ["G5", 1], ["F5", 1], ["F5", 1], ["E5", 1], ["E5", 1], ["D5", 2],
            ["G5", 1], ["G5", 1], ["F5", 1], ["F5", 1], ["E5", 1], ["E5", 1], ["D5", 2],
            ["C5", 1], ["C5", 1], ["G5", 1], ["G5", 1], ["A5", 1], ["A5", 1], ["G5", 2],
            ["F5", 1], ["F5", 1], ["E5", 1], ["E5", 1], ["D5", 1], ["D5", 1], ["C5", 2],
            [null, 2] // Rest note
        ];
        
        // Scientific frequencies map
        this.frequencies = {
            "C4": 261.63, "D4": 293.66, "E4": 329.63, "F4": 349.23, "G4": 392.00, "A4": 440.00, "B4": 493.88,
            "C5": 523.25, "D5": 587.33, "E5": 659.25, "F5": 698.46, "G5": 783.99, "A5": 880.00, "B5": 987.77,
            "C6": 1046.50
        };
        
        // Accompaniment bass chords in background
        this.bassNotes = [
            "C4", "C4", "F4", "C4", "F4", "C4", "G4", "C4",
            "F4", "C4", "G4", "C4", "F4", "C4", "G4", "C4",
            "C4", "C4", "F4", "C4", "F4", "C4", "G4", "C4"
        ];
    }
    
    start() {
        // Initialize AudioContext on user interaction
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        
        if (this.isPlaying) return;
        this.isPlaying = true;
        this.ctx.resume();
        this.playMelody();
    }
    
    stop() {
        this.isPlaying = false;
        if (this.sequenceId) {
            clearTimeout(this.sequenceId);
            this.sequenceId = null;
        }
    }
    
    playMelody() {
        let noteIndex = 0;
        const tempo = 550; // Milliseconds per beat (slow & relaxing)

        const playNext = () => {
            if (!this.isPlaying) return;

            const [pitch, beats] = this.notes[noteIndex];
            const time = this.ctx.currentTime;

            if (pitch) {
                const freq = this.frequencies[pitch];
                this.triggerPluck(freq, time, 1.8); // Long release chime
                
                // Arpeggiated soft accompaniment bass note on beat transitions
                if (noteIndex % 2 === 0) {
                    const bassIndex = Math.floor(noteIndex / 2) % this.bassNotes.length;
                    const bassFreq = this.frequencies[this.bassNotes[bassIndex]];
                    this.triggerPluck(bassFreq, time, 2.5, 0.08); // Lower volume soft sine bass
                }
            }

            noteIndex = (noteIndex + 1) % this.notes.length;
            this.sequenceId = setTimeout(playNext, beats * tempo);
        };

        playNext();
    }
    
    // Pluck physics modeling: rapid attack, slow chime-like exponential decay
    triggerPluck(frequency, startTime, duration, volumeFactor = 0.2) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        // Sine wave for clean music box chime feel, mixed with a tiny bit of Triangle for richness
        osc.type = "sine";
        
        // Simple Reverb Emulator Node (Dreamy Delay)
        const delay = this.ctx.createDelay();
        const delayGain = this.ctx.createGain();
        
        delay.delayTime.value = 0.28; // Echo latency
        delayGain.gain.value = 0.35;  // Echo feedback multiplier
        
        osc.frequency.value = frequency;
        
        // Dreamy volume Envelope
        gain.gain.setValueAtTime(0.0001, startTime);
        gain.gain.linearRampToValueAtTime(volumeFactor, startTime + 0.02); // Sharp attack click
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration); // Long slow fade
        
        // Connections
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        // Route through delay for warm reverb chime
        gain.connect(delay);
        delay.connect(delayGain);
        delayGain.connect(this.ctx.destination);
        // Connect delay back to itself for recursive echo fading
        delayGain.connect(delay);
        
        // Start and stop oscillator
        osc.start(startTime);
        osc.stop(startTime + duration + 1.0);
        
        // Cleanup node parameters to avoid memory leak
        setTimeout(() => {
            osc.disconnect();
            gain.disconnect();
            delay.disconnect();
            delayGain.disconnect();
        }, (duration + 2.0) * 1000);
    }
}

// Instantiate Synthesizer
const synth = new MusicBoxSynth();
const musicWidget = document.getElementById("music-widget");
const musicToggleBtn = document.getElementById("music-toggle-btn");
const musicIcon = document.getElementById("music-icon");
const musicBubble = document.getElementById("music-bubble");

musicToggleBtn.addEventListener("click", () => {
    if (!synth.isPlaying) {
        synth.start();
        musicWidget.classList.add("playing");
        musicIcon.textContent = "⏸️";
        musicBubble.querySelector(".bubble-text").textContent = "Pause Lullaby Music Box 💤";
        showToast("Playing beautiful calming lullaby... 🧸🎹");
    } else {
        synth.stop();
        musicWidget.classList.remove("playing");
        musicIcon.textContent = "🎵";
        musicBubble.querySelector(".bubble-text").textContent = "Play Lullaby Music Box 🧸";
        showToast("Lullaby paused.");
    }
});


// --- 8. SCROLL REVEAL ANIMATIONS (INTERSECTION OBSERVER) ---
function initScrollReveal() {
    const revealElems = document.querySelectorAll(".scroll-reveal");
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("active");
                // Unobserve once revealed to keep layout performant
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.12, // Element is 12% visible before revealing
        rootMargin: "0px 0px -40px 0px"
    });

    revealElems.forEach(el => observer.observe(el));
}


// --- 9. INITIALIZATION BOOTSTRAP ---
window.addEventListener("DOMContentLoaded", () => {
    // 1. Load parents configurations or default
    initConfig();
    
    // 2. Start exact age counter
    startAgeTicker();
    
    // 3. Load guestbook memories wishing well
    loadWishes();
    
    // 4. Fire scroll reveal listener
    initScrollReveal();
});
