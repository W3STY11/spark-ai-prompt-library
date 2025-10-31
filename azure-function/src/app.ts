// Azure Functions v4 Node.js Programming Model Entry Point
// This file imports and registers all HTTP-triggered functions

// Import function handlers
import '../health/index.js';
import '../messages/index.js';
import '../prompts/index.js';
import '../searchPrompts/index.js';

// Functions are automatically registered via app.http() calls in each module
// No export needed - Azure Functions runtime will discover them
