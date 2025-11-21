// Simple test script for Stealth Vocab Extension
console.log('🎯 SCRIPT LOADED - JavaScript is working!');
console.log('📁 Current file path:', window.location.pathname);

// Test Chrome extension APIs
try {
    if (typeof chrome !== 'undefined' && chrome.storage) {
        console.log('✅ Chrome Extension APIs available');
    } else {
        console.log('⚠️ Chrome Extension APIs not available');
    }
} catch (error) {
    console.error('❌ Error testing APIs:', error);
}

// Load vocabulary from data file
let vocabularyData = [];

// Fallback test vocabulary
const fallbackVocabulary = [
    {
        id: 'test_1',
        english: 'test',
        chinese: '测试；考验',
        phonetics: '/test/',
        wordType: 'verb/noun',
        category: 'academic',
        coreExample: 'Before launching the new product, we need to test it thoroughly.',
        additionalExamples: [
            'The doctor ordered a series of medical tests.',
            'This is just a test of the new system.',
            'The experiment will test the effectiveness of the drug.'
        ],
        synonyms: ['examination', 'trial', 'assessment'],
        antonyms: ['ignore', 'neglect']
    }
];

// Simple state management
let currentWordIndex = 0;
let isFlipped = false;

// Load vocabulary data from JSON file
async function loadVocabularyData() {
    try {
        const response = await fetch('./data/vocabulary-complete.json');
        if (response.ok) {
            vocabularyData = await response.json();
            console.log(`✅ Loaded ${vocabularyData.length} vocabulary words`);
            return true;
        } else {
            throw new Error('Failed to fetch vocabulary data');
        }
    } catch (error) {
        console.error('❌ Error loading vocabulary data:', error);
        vocabularyData = fallbackVocabulary;
        console.log('🔄 Using fallback vocabulary data');
        return false;
    }
}

// Get current vocabulary data
function getCurrentVocabulary() {
    return vocabularyData.length > 0 ? vocabularyData : fallbackVocabulary;
}

function getCurrentWord() {
    const vocab = getCurrentVocabulary();
    return vocab[currentWordIndex % vocab.length];
}

function moveToNextWord() {
    currentWordIndex++;
}

function displayEnglishSide(hideDetailedInfo = true) {
    const word = getCurrentWord();
    const englishWord = document.getElementById('english-word');
    const phonetics = document.getElementById('phonetics');
    const wordType = document.getElementById('word-type');
    const wordCategory = document.getElementById('word-category');
    const cardFront = document.getElementById('card-front');
    const cardBack = document.getElementById('card-back');

    // Handle both old and new data formats
    const wordTypeText = word.wordType || word.word_type || '';
    const wordCategoryText = word.category || '';

    // Update English content
    if (englishWord) {
        englishWord.textContent = word.english;
        englishWord.onclick = toggleDetailedInfo;
    }
    if (phonetics) phonetics.textContent = word.phonetics || '';
    if (wordType) wordType.textContent = wordTypeText.replace(/_/g, '/');
    if (wordCategory) wordCategory.textContent = wordCategoryText;

    // Hide detailed info by default when showing new word (but not when flipping)
    const detailedInfo = document.getElementById('detailed-info');
    if (detailedInfo && hideDetailedInfo) {
        detailedInfo.style.display = 'none';
    }

    // Show English side, hide Chinese side
    if (cardFront) cardFront.style.display = 'none';
    if (cardBack) cardBack.style.display = 'block';

    console.log('✅ Displayed English:', word.english);
}

function toggleDetailedInfo() {
    const detailedInfo = document.getElementById('detailed-info');
    if (!detailedInfo) return;

    const isVisible = detailedInfo.style.display !== 'none';

    if (isVisible) {
        detailedInfo.style.display = 'none';
        console.log('🔽 Detailed info hidden');
    } else {
        detailedInfo.style.display = 'block';
        console.log('🔼 Detailed info shown, loading content...');
        loadDetailedInfo();
    }
}

function loadDetailedInfo() {
    const word = getCurrentWord();
    if (!word) return;

    // Handle both old and new data formats
    const coreExample = word.coreExample || (word.example_sentences && word.example_sentences[0]) || 'No example available';
    const additionalExamples = word.additionalExamples || (word.example_sentences && word.example_sentences.slice(1)) || [];
    const synonyms = word.synonyms || [];
    const antonyms = word.antonyms || [];

    // Update core example - simplified without buttons
    const coreExampleEl = document.getElementById('core-example');
    if (coreExampleEl) {
        coreExampleEl.innerHTML = `
            <div class="sentence-example">${coreExample}</div>
        `;
    }

    // Update additional examples - simplified
    const exampleSentences = document.getElementById('example-sentences');
    if (exampleSentences) {
        exampleSentences.innerHTML = additionalExamples
            .map(example => `<div class="example-item">${example}</div>`)
            .join('');
    }

    // Update synonyms and antonyms - simplified
    const synonymsEl = document.getElementById('synonyms');
    const antonymsEl = document.getElementById('antonyms');

    if (synonymsEl) {
        synonymsEl.innerHTML = synonyms
            .map(synonym => `<span class="synonym-item">${synonym}</span>`)
            .join('');
    }

    if (antonymsEl) {
        antonymsEl.innerHTML = antonyms
            .map(antonym => `<span class="antonym-item">${antonym}</span>`)
            .join('');
    }

    console.log('✅ Detailed info loaded for:', word.english);
}

function displayChineseSide() {
    const word = getCurrentWord();
    const chineseDefinition = document.getElementById('chinese-definition');
    const cardFront = document.getElementById('card-front');
    const cardBack = document.getElementById('card-back');

    if (chineseDefinition) {
        chineseDefinition.textContent = word.chinese || '中文释义加载中...';
        console.log('✅ Displayed Chinese:', word.chinese);
    }

    // Show Chinese side, hide English side
    if (cardFront) cardFront.style.display = 'block';
    if (cardBack) cardBack.style.display = 'none';
}

function flipCard() {
    console.log('🔧 flipCard called, current isFlipped:', isFlipped);
    isFlipped = !isFlipped;
    if (isFlipped) {
        displayChineseSide();  // 翻转后显示中文
        console.log('🔃 Flipped to Chinese side');
    } else {
        displayEnglishSide(false); // 翻转时保留详细信息
        console.log('🔃 Flipped to English side');
    }
    console.log('🔃 Card flipped:', isFlipped);
}

let todayReviewCount = 0;
let cumulativeMasteredCount = 0;

// Initialize cumulative stats from localStorage
function initializeStats() {
    const savedStats = localStorage.getItem('vocabStats');
    if (savedStats) {
        const stats = JSON.parse(savedStats);
        todayReviewCount = stats.todayReviewCount || 0;
        cumulativeMasteredCount = stats.cumulativeMasteredCount || 0;
    }

    // Update UI with loaded stats
    updateStatsDisplay();
}

function updateStatsDisplay() {
    // Update progress
    const progressText = document.getElementById('progress-text');
    if (progressText) {
        progressText.textContent = `今日已复习 ${todayReviewCount} 个词`;
    }

    // Update cumulative stats
    const totalWords = document.getElementById('total-words');
    const cumulativeReviews = document.getElementById('cumulative-reviews');
    const cumulativeMastered = document.getElementById('cumulative-mastered');
    const vocab = getCurrentVocabulary();
    if (totalWords) totalWords.textContent = vocab.length;
    if (cumulativeReviews) cumulativeReviews.textContent = todayReviewCount;
    if (cumulativeMastered) cumulativeMastered.textContent = cumulativeMasteredCount;
}

function saveStats() {
    const stats = {
        todayReviewCount,
        cumulativeMasteredCount,
        lastUpdateDate: new Date().toDateString()
    };
    localStorage.setItem('vocabStats', JSON.stringify(stats));
}

function submitFeedback(status) {
    todayReviewCount++;

    // Update cumulative mastered count
    if (status === 'mastered') {
        cumulativeMasteredCount++;
    }

    console.log(`📝 Feedback submitted: ${status}, Today's count: ${todayReviewCount}, Total mastered: ${cumulativeMasteredCount}`);

    // Save and update display
    saveStats();
    updateStatsDisplay();

    // Move to next word
    moveToNextWord();
    isFlipped = false;
    displayEnglishSide(true); // 新单词时隐藏详细信息
}

function toggleMoreInfo() {
    toggleDetailedInfo();

    // Update button text
    const detailedInfo = document.getElementById('detailed-info');
    const moreInfoBtn = document.getElementById('more-info-btn');

    if (detailedInfo && moreInfoBtn) {
        const isVisible = detailedInfo.style.display !== 'none';
        const btnText = moreInfoBtn.querySelector('.btn-text');
        if (btnText) {
            btnText.textContent = isVisible ? '收起详情' : '详细用法';
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 DOM Content Loaded - Starting simple initialization...');

    // Simple test first
    const chineseElement = document.getElementById('chinese-definition');
    if (chineseElement) {
        chineseElement.textContent = 'JavaScript已加载，正在初始化词汇功能...';
        console.log('✅ Chinese definition element updated successfully');
    } else {
        console.log('❌ Chinese definition element not found');
        return;
    }

    // Set up event listeners - both sides should be clickable
    const cardFront = document.getElementById('card-front');
    const cardBack = document.getElementById('card-back');

    if (cardFront) {
        cardFront.addEventListener('click', (e) => {
            console.log('🔧 Card front clicked directly');
            flipCard();
        });
        console.log('✅ Card front click listener added');
    }

    if (cardBack) {
        cardBack.addEventListener('click', (e) => {
            console.log('🔧 Card back clicked directly');
            flipCard();
        });
        console.log('✅ Card back click listener added');
    }

    // Feedback buttons
    const masteredBtn = document.getElementById('btn-mastered');
    const vagueBtn = document.getElementById('btn-vague');
    const forgottenBtn = document.getElementById('btn-forgotten');

    if (masteredBtn) masteredBtn.addEventListener('click', () => submitFeedback('mastered'));
    if (vagueBtn) vagueBtn.addEventListener('click', () => submitFeedback('vague'));
    if (forgottenBtn) forgottenBtn.addEventListener('click', () => submitFeedback('forgotten'));

    // Action buttons
    const moreInfoBtn = document.getElementById('more-info-btn');
    const nextWordBtn = document.getElementById('next-word-btn');

    if (moreInfoBtn) moreInfoBtn.addEventListener('click', toggleMoreInfo);
    if (nextWordBtn) nextWordBtn.addEventListener('click', () => submitFeedback('next'));

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            e.preventDefault();
            flipCard();
        }
    });

    // Global event delegation for dynamically created buttons and card interactions
    document.addEventListener('click', (e) => {
        // Handle English word click
        if (e.target.classList.contains('clickable-word') || e.target.id === 'english-word') {
            e.preventDefault();
            e.stopPropagation(); // 阻止事件冒泡到卡片
            toggleDetailedInfo();
            console.log('🔧 English word clicked, toggling detailed info');
        }

        // Handle action buttons to prevent card flip
        if (e.target.closest('#more-info-btn') || e.target.closest('#next-word-btn')) {
            e.stopPropagation(); // 阻止事件冒泡到卡片
            console.log('🔧 Action button clicked, preventing card flip');
        }
    });

    // Initialize stats and display first word
    setTimeout(async () => {
        initializeStats();

        // Load vocabulary data
        console.log('🔄 Loading vocabulary data...');
        await loadVocabularyData();

        // Display first word after data is loaded
        displayEnglishSide(true); // 初始单词时隐藏详细信息
        updateStatsDisplay(); // Update stats with correct word count
        console.log('✅ Initialization complete - showing English by default');
    }, 100);
});

// Test simple functionality
console.log('🎯 End of simple script reached - JavaScript file loaded completely');