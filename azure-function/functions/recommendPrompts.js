"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.recommendPrompts = recommendPrompts;
const functions_1 = require("@azure/functions");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
function loadPrompts() {
    try {
        const dataPath = path.join(process.cwd(), 'public', 'prompts_index.json');
        const rawData = fs.readFileSync(dataPath, 'utf-8');
        const data = JSON.parse(rawData);
        return data.prompts || [];
    }
    catch (error) {
        console.error('Error loading prompts:', error);
        return [];
    }
}
// Simple keyword-based relevance scoring
function calculateRelevance(prompt, useCase, context, industry) {
    let score = 0;
    const combinedText = `${useCase} ${context} ${industry}`.toLowerCase();
    const promptText = `${prompt.title} ${prompt.description} ${prompt.tags} ${prompt.content}`.toLowerCase();
    // Extract keywords from use case
    const keywords = combinedText.split(/\s+/).filter(word => word.length > 3);
    keywords.forEach(keyword => {
        if (promptText.includes(keyword)) {
            score += 1;
        }
        if (prompt.title.toLowerCase().includes(keyword)) {
            score += 3; // Title matches are more important
        }
        if (prompt.tags.toLowerCase().includes(keyword)) {
            score += 2; // Tag matches are valuable
        }
    });
    // Boost common use cases
    const useCaseLower = useCase.toLowerCase();
    if (useCaseLower.includes('email') && prompt.department === 'Sales')
        score += 5;
    if (useCaseLower.includes('social media') && prompt.department === 'Marketing')
        score += 5;
    if (useCaseLower.includes('content') && prompt.department === 'Writing')
        score += 5;
    if (useCaseLower.includes('seo') && prompt.department === 'SEO')
        score += 5;
    if (useCaseLower.includes('blog') && (prompt.department === 'Writing' || prompt.department === 'Marketing'))
        score += 4;
    return score;
}
function generateReason(prompt, useCase) {
    const reasons = [
        `This ${prompt.department.toLowerCase()} prompt is specifically designed for ${prompt.subcategory.toLowerCase()} tasks`,
        `Rated ${prompt.complexity} level, making it ${prompt.complexity === 'Beginner' ? 'easy to use' : prompt.complexity === 'Advanced' ? 'highly customizable' : 'flexible and powerful'}`,
        `Proven effective with ${prompt.word_count} words of carefully crafted content`,
        `Perfect for ${prompt.subcategory.toLowerCase()} in the ${prompt.department.toLowerCase()} domain`
    ];
    // Pick most relevant reason
    if (useCase.toLowerCase().includes('beginner') || useCase.toLowerCase().includes('easy')) {
        return reasons[1];
    }
    return reasons[0];
}
async function recommendPrompts(request, context) {
    context.log('Generating prompt recommendations');
    try {
        const body = await request.json();
        const useCase = body?.useCase || '';
        const contextStr = body?.context || '';
        const industry = body?.industry || '';
        if (!useCase) {
            return {
                status: 400,
                jsonBody: {
                    error: 'Bad Request',
                    message: 'useCase is required'
                }
            };
        }
        const allPrompts = loadPrompts();
        // Calculate relevance scores
        const scoredPrompts = allPrompts.map(prompt => ({
            prompt,
            score: calculateRelevance(prompt, useCase, contextStr, industry)
        }));
        // Sort by relevance and take top 5
        const topPrompts = scoredPrompts
            .filter(item => item.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, 5);
        const recommendations = topPrompts.map(item => ({
            id: item.prompt.id,
            title: item.prompt.title,
            description: item.prompt.description,
            department: item.prompt.department,
            icon: item.prompt.icon,
            complexity: item.prompt.complexity,
            reason: generateReason(item.prompt, useCase),
            relevanceScore: Math.min(item.score / 10, 1) // Normalize to 0-1
        }));
        const message = recommendations.length > 0
            ? `Found ${recommendations.length} highly relevant prompts for your use case: "${useCase}"`
            : `No prompts found matching "${useCase}". Try a more general search or browse by department.`;
        return {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            jsonBody: {
                message,
                recommendations,
                useCase,
                context: contextStr,
                industry
            }
        };
    }
    catch (error) {
        context.error('Error in recommendPrompts:', error);
        return {
            status: 500,
            jsonBody: {
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'Unknown error'
            }
        };
    }
}
functions_1.app.http('recommendPrompts', {
    methods: ['POST'],
    authLevel: 'anonymous',
    route: 'prompts/recommend',
    handler: recommendPrompts
});
