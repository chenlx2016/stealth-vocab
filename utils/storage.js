// Storage Management for Stealth Vocab Extension
// Handles persistent data storage and retrieval

class StorageManager {
    constructor() {
        this.STORAGE_KEY = 'stealth_vocab_state';
        this.VOCABULARY_KEY = 'stealth_vocab_vocabulary';
    }

    /**
     * Get the current study state
     * @returns {Promise<Object>} Study state object
     */
    async getStudyState() {
        try {
            const result = await chrome.storage.local.get([this.STORAGE_KEY]);
            const defaultState = {
                currentWordId: null,
                isFlipped: false,
                currentIndex: 0,
                todayReviewCount: 0,
                wordStatuses: {},
                lastStudyDate: new Date().toDateString()
            };
            return result[this.STORAGE_KEY] || defaultState;
        } catch (error) {
            console.error('Error getting study state:', error);
            return this.getDefaultState();
        }
    }

    /**
     * Update the study state
     * @param {Object} updates - Partial state updates
     * @returns {Promise<void>}
     */
    async updateStudyState(updates) {
        try {
            const currentState = await this.getStudyState();
            const newState = { ...currentState, ...updates };

            // Optimized storage with immediate feedback
            chrome.storage.local.set({ [this.STORAGE_KEY]: newState });

            return newState;
        } catch (error) {
            console.error('Error updating study state:', error);
            throw error;
        }
    }

    /**
     * Batch update multiple state changes (performance optimized)
     * @param {Array} updates - Array of update objects
     * @returns {Promise<Object>} Final state
     */
    async batchUpdateStudyState(updates) {
        try {
            const currentState = await this.getStudyState();
            let newState = { ...currentState };

            // Apply all updates in sequence
            updates.forEach(update => {
                newState = { ...newState, ...update };
            });

            await chrome.storage.local.set({ [this.STORAGE_KEY]: newState });
            return newState;
        } catch (error) {
            console.error('Error batch updating study state:', error);
            throw error;
        }
    }

    /**
     * Get vocabulary data
     * @returns {Promise<Array>} Array of vocabulary items
     */
    async getVocabularyData() {
        try {
            const result = await chrome.storage.local.get([this.VOCABULARY_KEY]);
            return result[this.VOCABULARY_KEY] || [];
        } catch (error) {
            console.error('Error getting vocabulary data:', error);
            return [];
        }
    }

    /**
     * Set vocabulary data
     * @param {Array} vocabulary - Array of vocabulary items
     * @returns {Promise<void>}
     */
    async setVocabularyData(vocabulary) {
        try {
            await chrome.storage.local.set({ [this.VOCABULARY_KEY]: vocabulary });
        } catch (error) {
            console.error('Error setting vocabulary data:', error);
            throw error;
        }
    }

    /**
     * Get default study state
     * @returns {Object} Default state object
     */
    getDefaultState() {
        return {
            currentWordId: null,
            isFlipped: false,
            currentIndex: 0,
            todayReviewCount: 0,
            wordStatuses: {},
            lastStudyDate: new Date().toDateString()
        };
    }

    /**
     * Reset daily progress if it's a new day
     * @returns {Promise<Object>} Updated state
     */
    async checkDailyReset() {
        const currentState = await this.getStudyState();
        const today = new Date().toDateString();

        if (currentState.lastStudyDate !== today) {
            // It's a new day, reset daily counter
            return await this.updateStudyState({
                todayReviewCount: 0,
                lastStudyDate: today
            });
        }

        return currentState;
    }

    /**
     * Clear all storage data (for testing/debugging)
     * @returns {Promise<void>}
     */
    async clearAllData() {
        try {
            await chrome.storage.local.clear();
        } catch (error) {
            console.error('Error clearing storage:', error);
            throw error;
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StorageManager;
}