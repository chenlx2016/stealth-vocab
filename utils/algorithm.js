// Review Algorithm for Stealth Vocab Extension
// Implements priority-based vocabulary review system

class ReviewAlgorithm {
    constructor(storageManager) {
        this.storage = storageManager;
        this.vocabulary = [];
    }

    /**
     * Initialize vocabulary data
     * @param {Array} vocabularyData - Array of vocabulary items
     * @returns {Promise<void>}
     */
    async initialize(vocabularyData) {
        this.vocabulary = vocabularyData || [];
        if (this.vocabulary.length === 0) {
            console.warn('No vocabulary data available');
        }
    }

    /**
     * Get the next word for review
     * @returns {Promise<Object|null>} Next vocabulary item or null
     */
    async getNextWord() {
        if (this.vocabulary.length === 0) {
            return null;
        }

        try {
            const state = await this.storage.getStudyState();
            const priorityWord = this.getForgottenWord(state.wordStatuses);

            if (priorityWord) {
                return priorityWord;
            }

            // Fallback to fixed order rotation
            return this.getNextInOrder(state.currentIndex);
        } catch (error) {
            console.error('Error getting next word:', error);
            return null;
        }
    }

    /**
     * Get a forgotten word for priority review
     * @param {Object} wordStatuses - Word status mapping
     * @returns {Object|null} Forgotten vocabulary item or null
     */
    getForgottenWord(wordStatuses) {
        const forgottenWords = this.vocabulary.filter(word =>
            wordStatuses[word.id] === 'forgotten'
        );

        if (forgottenWords.length > 0) {
            // Return the first forgotten word (could be enhanced with random selection)
            return forgottenWords[0];
        }

        return null;
    }

    /**
     * Get next word in fixed order
     * @param {number} currentIndex - Current index in vocabulary
     * @returns {Object} Next vocabulary item
     */
    getNextInOrder(currentIndex) {
        const nextIndex = (currentIndex + 1) % this.vocabulary.length;
        return this.vocabulary[nextIndex];
    }

    /**
     * Update word status based on user feedback
     * @param {string} wordId - ID of the word
     * @param {string} status - New status ('mastered', 'vague', 'forgotten')
     * @returns {Promise<void>}
     */
    async updateWordStatus(wordId, status) {
        try {
            const state = await this.storage.getStudyState();
            const updatedWordStatuses = {
                ...state.wordStatuses,
                [wordId]: status
            };

            // Calculate next index
            let nextIndex;
            if (status === 'forgotten') {
                // If forgotten, stay on current word to review again
                nextIndex = this.vocabulary.findIndex(word => word.id === wordId);
            } else {
                // Move to next word
                nextIndex = (state.currentIndex + 1) % this.vocabulary.length;
            }

            // Update state with new word status and increment daily count
            await this.storage.updateStudyState({
                wordStatuses: updatedWordStatuses,
                currentIndex: nextIndex,
                currentWordId: this.vocabulary[nextIndex]?.id || null,
                isFlipped: false,
                todayReviewCount: state.todayReviewCount + 1
            });

        } catch (error) {
            console.error('Error updating word status:', error);
            throw error;
        }
    }

    /**
     * Get review statistics
     * @returns {Promise<Object>} Review statistics
     */
    async getReviewStats() {
        try {
            const state = await this.storage.getStudyState();
            const wordStatuses = state.wordStatuses;

            const stats = {
                todayReviewed: state.todayReviewCount,
                totalWords: this.vocabulary.length,
                mastered: 0,
                vague: 0,
                forgotten: 0,
                notReviewed: 0
            };

            // Count word statuses
            this.vocabulary.forEach(word => {
                const status = wordStatuses[word.id];
                if (status === 'mastered') stats.mastered++;
                else if (status === 'vague') stats.vague++;
                else if (status === 'forgotten') stats.forgotten++;
                else stats.notReviewed++;
            });

            return stats;
        } catch (error) {
            console.error('Error getting review stats:', error);
            return null;
        }
    }

    /**
     * Reset all word statuses (for testing/debugging)
     * @returns {Promise<void>}
     */
    async resetProgress() {
        try {
            await this.storage.updateStudyState({
                wordStatuses: {},
                currentIndex: 0,
                currentWordId: this.vocabulary.length > 0 ? this.vocabulary[0].id : null,
                isFlipped: false,
                todayReviewCount: 0
            });
        } catch (error) {
            console.error('Error resetting progress:', error);
            throw error;
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ReviewAlgorithm;
}