/**
 * WebLLM Engine Module
 * 
 * Handles in-browser LLM inference using WebLLM.
 * Runs entirely client-side using WebGPU for acceleration.
 * 
 * @see https://webllm.mlc.ai/
 */

import { CreateMLCEngine } from "https://esm.run/@mlc-ai/web-llm";

// ============================================================================
// Configuration
// ============================================================================

const DEFAULT_CONFIG = {
    modelId: "Llama-3.2-1B-Instruct-q4f16_1-MLC",
    useIndexedDBCache: true,
    temperature: 0.2, // Lower temperature for more deterministic, less hallucinatory responses
};

// ============================================================================
// WebLLM Engine
// ============================================================================

/**
 * WebLLM Engine - Manages in-browser LLM inference
 */
const WebLLMEngine = {
    // -------------------------------------------------------------------------
    // State
    // -------------------------------------------------------------------------
    
    /** @type {import("@mlc-ai/web-llm").MLCEngine|null} */
    engine: null,
    
    /** @type {boolean} */
    isInitialized: false,
    
    /** @type {boolean} */
    isLoading: false,
    
    /** @type {Array<{role: string, content: string}>} */
    conversationHistory: [],
    
    /** @type {string} */
    systemPrompt: "",
    
    /** @type {Object} */
    config: { ...DEFAULT_CONFIG },

    // -------------------------------------------------------------------------
    // WebGPU Compatibility
    // -------------------------------------------------------------------------

    /**
     * Checks if the browser supports WebGPU
     * @returns {Promise<{supported: boolean, reason: string}>}
     */
    async checkCompatibility() {
        // Check if WebGPU API exists
        if (!navigator.gpu) {
            return {
                supported: false,
                reason: "WebGPU is not supported in this browser. Please use Chrome 113+, Edge 113+, or Firefox 126+."
            };
        }

        try {
            // Try to get a GPU adapter
            const adapter = await navigator.gpu.requestAdapter();
            if (!adapter) {
                return {
                    supported: false,
                    reason: "No GPU adapter found. Your device may not support WebGPU."
                };
            }

            // Check for required features
            const device = await adapter.requestDevice();
            if (!device) {
                return {
                    supported: false,
                    reason: "Could not initialize GPU device."
                };
            }

            return {
                supported: true,
                reason: "WebGPU is supported"
            };
        } catch (error) {
            return {
                supported: false,
                reason: `WebGPU initialization failed: ${error.message}`
            };
        }
    },

    // -------------------------------------------------------------------------
    // Initialization
    // -------------------------------------------------------------------------

    /**
     * Initializes the WebLLM engine
     * @param {Object} options Configuration options
     * @param {string} [options.modelId] Model identifier
     * @param {string} [options.systemPrompt] System prompt for the AI
     * @param {number} [options.temperature] Temperature for response generation (0.0-2.0)
     * @param {Function} [options.onProgress] Progress callback ({percent: number, text: string})
     * @param {Function} [options.onReady] Called when engine is ready
     * @param {Function} [options.onError] Error callback
     * @returns {Promise<boolean>} Success status
     */
    async init(options = {}) {
        if (this.isInitialized) {
            console.log("[WebLLM] Already initialized");
            return true;
        }

        if (this.isLoading) {
            console.log("[WebLLM] Already loading");
            return false;
        }

        const {
            modelId = DEFAULT_CONFIG.modelId,
            systemPrompt = "",
            temperature = DEFAULT_CONFIG.temperature,
            onProgress = () => {},
            onReady = () => {},
            onError = () => {},
        } = options;

        this.isLoading = true;
        this.config.modelId = modelId;
        this.config.temperature = temperature;
        this.systemPrompt = systemPrompt;

        try {
            // Check WebGPU support first
            const compatibility = await this.checkCompatibility();
            if (!compatibility.supported) {
                throw new Error(compatibility.reason);
            }

            onProgress({ percent: 0, text: "Initializing WebLLM..." });

            // Create the engine with progress tracking
            this.engine = await CreateMLCEngine(modelId, {
                initProgressCallback: (report) => {
                    // Parse progress from report
                    const percent = this.parseProgress(report.text);
                    onProgress({
                        percent,
                        text: report.text
                    });
                },
                useIndexedDBCache: this.config.useIndexedDBCache,
            });

            // Initialize conversation with system prompt
            this.resetConversation();

            this.isInitialized = true;
            this.isLoading = false;

            onProgress({ percent: 100, text: "AI Ready" });
            onReady();

            console.log("[WebLLM] Engine initialized successfully");
            return true;

        } catch (error) {
            this.isLoading = false;
            console.error("[WebLLM] Initialization failed:", error);
            onError(error);
            return false;
        }
    },

    /**
     * Parses progress percentage from WebLLM status text
     * @param {string} text Status text from WebLLM
     * @returns {number} Progress percentage (0-100)
     */
    parseProgress(text) {
        // Try to extract percentage from text like "Loading model... 45%"
        const match = text.match(/(\d+(?:\.\d+)?)\s*%/);
        if (match) {
            return Math.min(parseFloat(match[1]), 99);
        }
        
        // Check for specific stages
        if (text.includes("Fetching")) return 10;
        if (text.includes("Loading")) return 30;
        if (text.includes("Compiling")) return 60;
        if (text.includes("Initializing")) return 80;
        
        return 0;
    },

    // -------------------------------------------------------------------------
    // Conversation Management
    // -------------------------------------------------------------------------

    /**
     * Resets the conversation history
     */
    resetConversation() {
        this.conversationHistory = [];
        
        if (this.systemPrompt) {
            this.conversationHistory.push({
                role: "system",
                content: this.systemPrompt
            });
        }
    },

    /**
     * Adds a message to the conversation history
     * @param {"user"|"assistant"|"system"} role Message role
     * @param {string} content Message content
     */
    addMessage(role, content) {
        this.conversationHistory.push({ role, content });
    },

    // -------------------------------------------------------------------------
    // Chat Interface
    // -------------------------------------------------------------------------

    /**
     * Sends a message and gets a streaming response
     * @param {string} userMessage User's message
     * @returns {AsyncGenerator<string>} Yields response chunks
     */
    async *chat(userMessage) {
        if (!this.isInitialized || !this.engine) {
            throw new Error("WebLLM engine is not initialized");
        }

        // Add user message to history
        this.addMessage("user", userMessage);

        try {
            // Create streaming chat completion
            const chunks = await this.engine.chat.completions.create({
                messages: this.conversationHistory,
                stream: true,
                temperature: this.config.temperature,
            });

            let fullResponse = "";

            // Stream the response
            for await (const chunk of chunks) {
                const content = chunk.choices[0]?.delta?.content || "";
                if (content) {
                    fullResponse += content;
                    yield content;
                }
            }

            // Add assistant response to history
            this.addMessage("assistant", fullResponse);

        } catch (error) {
            console.error("[WebLLM] Chat error:", error);
            throw error;
        }
    },

    /**
     * Sends a message and gets the complete response (non-streaming)
     * @param {string} userMessage User's message
     * @returns {Promise<string>} Complete response
     */
    async chatComplete(userMessage) {
        let response = "";
        for await (const chunk of this.chat(userMessage)) {
            response += chunk;
        }
        return response;
    },

    // -------------------------------------------------------------------------
    // Status
    // -------------------------------------------------------------------------

    /**
     * Returns whether the engine is ready for chat
     * @returns {boolean}
     */
    isReady() {
        return this.isInitialized && this.engine !== null;
    },

    /**
     * Returns the current loading state
     * @returns {boolean}
     */
    isCurrentlyLoading() {
        return this.isLoading;
    },

    // -------------------------------------------------------------------------
    // Cleanup
    // -------------------------------------------------------------------------

    /**
     * Resets the engine state (keeps model cached)
     */
    reset() {
        this.resetConversation();
    },

    /**
     * Unloads the engine completely
     */
    async unload() {
        if (this.engine) {
            try {
                await this.engine.unload();
            } catch (e) {
                console.warn("[WebLLM] Error unloading engine:", e);
            }
        }
        this.engine = null;
        this.isInitialized = false;
        this.isLoading = false;
        this.conversationHistory = [];
    },
};

export default WebLLMEngine;
