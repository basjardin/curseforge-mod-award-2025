// Global variable to store all mods data
let allModsData = null;

// DOM Elements
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const resultsContainer = document.getElementById('results-container');
const modal = document.getElementById('modal');
const modalBody = document.getElementById('modal-body');
const closeModal = document.querySelector('.close-modal');

// Load mods data on page load
async function loadModsData() {
    try {
        const response = await fetch('mods-data.json');
        const data = await response.json();
        allModsData = data;
        console.log(`✓ Loaded ${data.mods.length} mods (generated at ${new Date(data.generatedAt).toLocaleString()})`);

        // Display info about data freshness
        const daysSinceGeneration = Math.floor((Date.now() - new Date(data.generatedAt)) / (1000 * 60 * 60 * 24));
        if (daysSinceGeneration > 7) {
            console.warn(`⚠ Data is ${daysSinceGeneration} days old. Consider regenerating.`);
        }
    } catch (error) {
        console.error('❌ Error loading mods data:', error);
        showEmpty('Failed to load mods data. Please make sure mods-data.json exists.');
    }
}

// Event Listeners
searchBtn.addEventListener('click', performSearch);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') performSearch();
});

closeModal.addEventListener('click', () => {
    modal.classList.add('hidden');
});

window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.classList.add('hidden');
    }
});

// Load data when page loads
loadModsData();

async function performSearch() {
    const query = searchInput.value.trim().toLowerCase();

    if (!allModsData) {
        showEmpty('Mods data not loaded yet. Please wait...');
        return;
    }

    if (!query) {
        showEmpty('Please enter a search term.');
        return;
    }

    showLoading();

    try {
        // Filter mods based on search query (client-side search)
        const filteredMods = allModsData.mods.filter(mod => {
            const nameMatch = mod.name.toLowerCase().includes(query);
            const summaryMatch = mod.summary.toLowerCase().includes(query);
            const authorMatch = mod.authors.some(a => a.name.toLowerCase().includes(query));
            const categoryMatch = mod.categories.some(c => c.name.toLowerCase().includes(query));

            return nameMatch || summaryMatch || authorMatch || categoryMatch;
        });

        if (filteredMods.length > 0) {
            displayResults(filteredMods);
        } else {
            showEmpty('No mods found matching your search.');
        }
    } catch (error) {
        console.error('Error:', error);
        showEmpty('An error occurred while searching mods.');
    }
}

function displayResults(mods) {
    resultsContainer.innerHTML = '';

    mods.forEach(mod => {
        const card = document.createElement('div');
        card.className = 'mod-card';

        const thumbnail = mod.logo ? mod.logo.thumbnailUrl : 'https://via.placeholder.com/300x200?text=No+Image';
        const downloadCount = formatNumber(mod.downloadCount);
        const updated = new Date(mod.dateModified).toLocaleDateString();

        card.innerHTML = `
            <img src="${thumbnail}" alt="${mod.name}" class="mod-thumbnail">
            <div class="mod-info">
                <h3 class="mod-title">${mod.name}</h3>
                <p class="mod-author">by ${mod.authors[0].name}</p>
                <p class="mod-summary">${mod.summary}</p>
                <div class="mod-stats">
                    <span>⬇ ${downloadCount}</span>
                    <span>📅 ${updated}</span>
                </div>
            </div>
        `;

        card.addEventListener('click', () => openModal(mod));
        console.log(mod);
        resultsContainer.appendChild(card);

    });
}

function openModal(mod) {
    const thumbnail = mod.logo ? mod.logo.url : 'https://via.placeholder.com/100?text=No+Image';
    const downloadCount = formatNumber(mod.downloadCount);
    const created = new Date(mod.dateCreated).toLocaleDateString();
    const updated = new Date(mod.dateModified).toLocaleDateString();
    const categories = mod.categories.map(c => c.name).join(', ');

    modalBody.innerHTML = `
        <div class="modal-header">
            <img src="${thumbnail}" alt="${mod.name}" class="modal-thumb">
            <div class="modal-title">
                <h2>${mod.name}</h2>
                <p class="mod-author">by ${mod.authors.map(a => a.name).join(', ')}</p>
            </div>
        </div>
        <div class="modal-details">
            <p><strong>Categories:</strong> ${categories}</p>
            <p><strong>Downloads:</strong> ${downloadCount}</p>
            <p><strong>Created:</strong> ${created} | <strong>Updated:</strong> ${updated}</p>
            <br>
            <p>${mod.summary}</p>
            <a href="${mod.links.websiteUrl}" target="_blank" class="download-btn">View on CurseForge</a>
        </div>
    `;

    modal.classList.remove('hidden');
}

function showLoading() {
    resultsContainer.innerHTML = '<div class="spinner"></div>';
}

function showEmpty(message) {
    resultsContainer.innerHTML = `
        <div class="empty-state">
            <p>${message}</p>
        </div>
    `;
}

function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}
