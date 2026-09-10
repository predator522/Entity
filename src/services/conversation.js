class ConversationService {
    constructor() {
        this.contexts = new Map();
        this.maxHistory = 20;
    }

    getContext(userId) {
        if (!this.contexts.has(userId)) {
            this.contexts.set(userId, []);
        }
        return this.contexts.get(userId);
    }

    addMessage(userId, role, content) {
        const context = this.getContext(userId);
        context.push({ role, content, timestamp: Date.now() });

        // Trim to max history
        if (context.length > this.maxHistory) {
            this.contexts.set(userId, context.slice(-this.maxHistory));
        }
    }

    getFormattedContext(userId) {
        const context = this.getContext(userId);
        if (context.length === 0) return '';

        return context.map(msg => {
            const prefix = msg.role === 'user' ? 'User' : 'Assistant';
            return `${prefix}: ${msg.content}`;
        }).join('\n\n');
    }

    clearContext(userId) {
        this.contexts.delete(userId);
    }

    getContextLength(userId) {
        return this.getContext(userId).length;
    }

    getAllContexts() {
        return this.contexts;
    }
}

module.exports = new ConversationService();
