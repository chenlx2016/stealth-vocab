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

// Simple test vocabulary
const testVocabulary = [
    {
        id: 'test_1',
        english: 'test',
        chinese: '测试；考验',
        phonetics: '/test/',
        wordType: 'verb/noun',
        category: 'academic',
        coreExample: 'Before launching the new product, we need to _____ it thoroughly.',
        additionalExamples: [
            'The doctor ordered a series of medical _____s.',
            'This is just a _____ of the new system.',
            'The experiment will _____ the effectiveness of the drug.'
        ],
        synonyms: ['examination', 'trial', 'assessment'],
        antonyms: ['ignore', 'neglect']
    },
    {
        id: 'significant_2',
        english: 'significant',
        chinese: '重要的；显著的；意义重大的',
        phonetics: '/sɪɡˈnɪfɪkənt/',
        wordType: 'adjective',
        category: 'academic',
        coreExample: 'The research shows a _____ improvement in patient recovery.',
        additionalExamples: [
            'There has been a _____ increase in sales.',
            'This is a _____ moment in our company\'s history.',
            'The discovery has _____ implications for cancer treatment.'
        ],
        synonyms: ['important', 'notable', 'meaningful'],
        antonyms: ['insignificant', 'trivial', 'minor']
    },
    {
        id: 'efficient_3',
        english: 'efficient',
        chinese: '效率高的；有能力的',
        phonetics: '/ɪˈfɪʃənt/',
        wordType: 'adjective',
        category: 'business',
        coreExample: 'We need to find a more _____ way to organize our workflow.',
        additionalExamples: [
            'The new system is much more _____ than the old one.',
            'She is very _____ at managing her time.',
            '_____ energy use can save money and help the environment.'
        ],
        synonyms: ['productive', 'effective', 'organized'],
        antonyms: ['inefficient', 'wasteful', 'slow']
    }
];

// Simple state management
let currentWordIndex = 0;
let isFlipped = false;

// Simple functions
function getCurrentWord() {
    return testVocabulary[currentWordIndex % testVocabulary.length];
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

    // Update English content
    if (englishWord) {
        englishWord.textContent = word.english;
        englishWord.onclick = toggleDetailedInfo;
    }
    if (phonetics) phonetics.textContent = word.phonetics;
    if (wordType) wordType.textContent = word.wordType;
    if (wordCategory) wordCategory.textContent = word.category;

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

    // Update core example - simplified without buttons
    const coreExample = document.getElementById('core-example');
    if (coreExample) {
        coreExample.innerHTML = `
            <div class="sentence-example">${word.coreExample}</div>
        `;
    }

    // Update additional examples - simplified
    const exampleSentences = document.getElementById('example-sentences');
    if (exampleSentences) {
        exampleSentences.innerHTML = word.additionalExamples
            .map(example => `<div class="example-item">${example}</div>`)
            .join('');
    }

    // Update synonyms and antonyms - simplified
    const synonyms = document.getElementById('synonyms');
    const antonyms = document.getElementById('antonyms');

    if (synonyms) {
        synonyms.innerHTML = word.synonyms
            .map(synonym => `<span class="synonym-item">${synonym}</span>`)
            .join('');
    }

    if (antonyms) {
        antonyms.innerHTML = word.antonyms
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
        chineseDefinition.textContent = word.chinese;
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
    if (totalWords) totalWords.textContent = testVocabulary.length;
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
    setTimeout(() => {
        initializeStats();
        displayEnglishSide(true); // 初始单词时隐藏详细信息
        console.log('✅ Simple initialization complete - showing English by default');
    }, 100);
});

// Test simple functionality
console.log('🎯 End of simple script reached - JavaScript file loaded completely');