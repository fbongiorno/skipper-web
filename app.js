// Mock Data for the Bareboat & Crewed results
const bareboatResults = [
    {
        id: 1,
        title: "Lagoon 42 Catamaran",
        location: "British Virgin Islands (BVI)",
        price: "$4,500",
        type: "Bareboat",
        image: "https://images.unsplash.com/photo-1544324317-1f190eec80f5?q=80&w=600&auto=format&fit=crop",
        features: ["4 Cabins", "4 Heads", "Solar Panels"]
    },
    {
        id: 2,
        title: "Oceanis 46.1",
        location: "Abaco, Bahamas",
        price: "$3,200",
        type: "Bareboat",
        image: "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=600&auto=format&fit=crop",
        features: ["3 Cabins", "2 Heads", "Classic Rig"]
    },
    {
        id: 3,
        title: "Fountaine Pajot Astrea 42",
        location: "St. Vincent & The Grenadines",
        price: "$4,800",
        type: "Bareboat",
        image: "https://images.unsplash.com/photo-1563223552-30d01ad4efa6?q=80&w=600&auto=format&fit=crop",
        features: ["4 Cabins", "Watermaker", "AC"]
    }
];

const crewedResults = [
    {
        id: 4,
        title: "Sunreef 80 Luxury",
        location: "St. Barths",
        price: "$45,000",
        type: "Crewed",
        image: "https://images.unsplash.com/photo-1569263979104-865ab7cd1a97?q=80&w=600&auto=format&fit=crop",
        features: ["Captain & Chef", "Jacuzzi", "Toys"]
    },
    {
        id: 5,
        title: "Azimut 60 Flybridge",
        location: "Miami to Exumas",
        price: "$28,000",
        type: "Crewed",
        image: "https://images.unsplash.com/photo-1605281317010-fe5ffe798166?q=80&w=600&auto=format&fit=crop",
        features: ["Captain & Stew", "Seabobs", "Fast"]
    },
    {
        id: 6,
        title: "Bali 5.4 Exclusive",
        location: "Antigua",
        price: "$32,000",
        type: "Crewed",
        image: "https://images.unsplash.com/photo-1520114099494-0cfc7fc44c45?q=80&w=600&auto=format&fit=crop",
        features: ["Captain & Chef", "Open Concept", "Dive Gear"]
    }
];

// App Logic
function explore(type) {
    const heroUnified = document.querySelector('.hero-unified');
    const vibeSection = document.querySelector('.vibe-section');
    const searchSection = document.querySelector('.search-results');
    const cardsGrid = document.querySelector('.cards-grid');
    const resultsTitle = document.getElementById('results-title');

    // Hide Hero and Vibe Ribbon
    heroUnified.classList.add('hidden');
    vibeSection.classList.add('hidden');
    
    // Show Results
    searchSection.classList.remove('hidden');
    window.scrollTo(0, 0);

    // Populate Cards
    cardsGrid.innerHTML = ''; // Clear previous
    
    let targetData = [];
    if (type === 'bareboat') targetData = bareboatResults;
    else if (type === 'crewed') targetData = crewedResults;
    else targetData = [...bareboatResults, ...crewedResults];
    
    resultsTitle.innerText = type === 'all' ? "The Skipper Global Fleet" : (type === 'bareboat' ? "Top Bareboat Charters" : "Luxury Crewed Experiences");

    targetData.forEach(boat => {
        const bdgColor = boat.type === 'Bareboat' ? 'color: var(--c-electric-turquoise-dark)' : 'color: var(--c-sunset-orange-dark)';
        const btnClass = boat.type === 'Bareboat' ? 'btn-teal' : 'btn-orange';
        
        const card = document.createElement('div');
        card.className = 'boat-card';
        card.innerHTML = `
            <div class="card-img-container">
                <div class="card-badge" style="${bdgColor}">
                    <i data-feather="star"></i>
                    ${boat.type}
                </div>
                <img src="${boat.image}" alt="${boat.title}">
            </div>
            <div class="card-details">
                <div class="boat-title">${boat.title}</div>
                <div class="boat-location">
                    <i data-feather="map-pin"></i> ${boat.location}
                </div>
                <div class="boat-features">
                    ${boat.features.map(f => `<span><i data-feather="check"></i> ${f}</span>`).join('')}
                </div>
                <div class="card-footer">
                    <div class="price">${boat.price} <span>/ week</span></div>
                    <button class="btn btn-primary ${btnClass}">
                        Book Now
                    </button>
                </div>
            </div>
        `;
        cardsGrid.appendChild(card);
    });

    // Re-initialize icons for new DOM elements
    feather.replace();
}

function resetView() {
    document.querySelector('.hero-unified').classList.remove('hidden');
    document.querySelector('.vibe-section').classList.remove('hidden');
    document.querySelector('.search-results').classList.add('hidden');
    document.querySelector('.skipper-log').classList.add('hidden');
    window.scrollTo(0, 0);
}

function showLog() {
    document.querySelector('.hero-unified').classList.add('hidden');
    document.querySelector('.vibe-section').classList.add('hidden');
    document.querySelector('.search-results').classList.add('hidden');
    document.querySelector('.skipper-log').classList.remove('hidden');
    window.scrollTo(0, 0);
}

// Interactivity for Nav Links
document.querySelectorAll('.nav-links a, .mobile-nav a').forEach(link => {
    link.addEventListener('click', (e) => {
        if (e.target.innerText.includes("Log") || e.target.closest('a')?.innerText.includes("Log")) {
            e.preventDefault();
            showLog();
        } else if (e.target.innerText.includes("Search") || e.target.closest('a')?.innerText.includes("Search")) {
            e.preventDefault();
            resetView();
        }
    });
});

// Interactivity for Vibe Buttons
document.querySelectorAll('.vibe-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.vibe-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        // Future feature: Filter results based on vibe
    });
});
