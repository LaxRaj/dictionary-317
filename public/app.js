// Get DOM elements
const wordForm = document.getElementById('wordForm');
const wordInput = document.getElementById('wordInput');
const searchBtn = document.getElementById('searchBtn');
const resultsDiv = document.getElementById('results');
const errorMessage = document.getElementById('errorMessage');

// API base URL
const API_BASE_URL = 'https://api.dictionaryapi.dev/api/v2/entries/en';

// Function to hide error message
function hideError() {
    errorMessage.classList.remove('show');
    errorMessage.textContent = '';
}

// Function to show error message
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.add('show');
    resultsDiv.innerHTML = '';
}

// Function to clear results
function clearResults() {
    resultsDiv.innerHTML = '';
    hideError();
}

// Function to display word data
function displayWordData(data) {
    hideError();
    resultsDiv.innerHTML = '';

    // Handle array of entries (API can return multiple entries)
    const entry = Array.isArray(data) ? data[0] : data;

    // Create word card
    const wordCard = document.createElement('div');
    wordCard.className = 'word-card';

    // Word header with title and phonetic
    const wordHeader = document.createElement('div');
    wordHeader.className = 'word-header';

    const wordTitle = document.createElement('h2');
    wordTitle.className = 'word-title';
    wordTitle.textContent = entry.word;

    wordHeader.appendChild(wordTitle);

    // Add phonetic if available
    if (entry.phonetic || (entry.phonetics && entry.phonetics.length > 0)) {
        const phonetic = document.createElement('div');
        phonetic.className = 'phonetic';
        phonetic.textContent = entry.phonetic || entry.phonetics.find(p => p.text)?.text || '';
        wordHeader.appendChild(phonetic);
    }

    wordCard.appendChild(wordHeader);

    // Process meanings
    if (entry.meanings && entry.meanings.length > 0) {
        entry.meanings.forEach(meaning => {
            const meaningSection = document.createElement('div');
            meaningSection.className = 'meaning-section';

            // Part of speech
            if (meaning.partOfSpeech) {
                const partOfSpeech = document.createElement('h3');
                partOfSpeech.className = 'part-of-speech';
                partOfSpeech.textContent = meaning.partOfSpeech;
                meaningSection.appendChild(partOfSpeech);
            }

            // Definitions
            if (meaning.definitions && meaning.definitions.length > 0) {
                const definitionsList = document.createElement('ul');
                definitionsList.className = 'definitions-list';

                meaning.definitions.forEach(definition => {
                    const definitionItem = document.createElement('li');
                    definitionItem.className = 'definition-item';

                    const definitionText = document.createElement('div');
                    definitionText.className = 'definition-text';
                    definitionText.textContent = definition.definition;
                    definitionItem.appendChild(definitionText);

                    // Add example if available
                    if (definition.example) {
                        const example = document.createElement('div');
                        example.className = 'example';
                        example.textContent = `Example: ${definition.example}`;
                        definitionItem.appendChild(example);
                    }

                    definitionsList.appendChild(definitionItem);
                });

                meaningSection.appendChild(definitionsList);
            }

            wordCard.appendChild(meaningSection);
        });
    }

    resultsDiv.appendChild(wordCard);
}

// Function to fetch word data from API
async function fetchWordData(word) {
    try {
        const response = await fetch(`${API_BASE_URL}/${encodeURIComponent(word)}`);

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error(`Word "${word}" not found. Please check your spelling and try again.`);
            } else {
                throw new Error('Failed to fetch word data. Please try again later.');
            }
        }

        const data = await response.json();
        return data;
    } catch (error) {
        if (error.message.includes('not found') || error.message.includes('Failed to fetch')) {
            throw error;
        }
        throw new Error('Network error. Please check your internet connection and try again.');
    }
}

// Function to handle form submission
async function handleSubmit(event) {
    event.preventDefault();

    const word = wordInput.value.trim().toLowerCase();

    if (!word) {
        showError('Please enter a word to search.');
        return;
    }

    // Disable button and show loading state
    searchBtn.disabled = true;
    searchBtn.textContent = 'Searching...';
    clearResults();

    try {
        const data = await fetchWordData(word);
        displayWordData(data);
    } catch (error) {
        showError(error.message);
    } finally {
        // Re-enable button
        searchBtn.disabled = false;
        searchBtn.textContent = 'Search';
    }
}

// Event listeners
wordForm.addEventListener('submit', handleSubmit);

// Allow Enter key to submit (already handled by form, but ensure it works)
wordInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault();
        wordForm.dispatchEvent(new Event('submit'));
    }
});


