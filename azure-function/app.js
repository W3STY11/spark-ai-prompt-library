"use strict";
// Azure Functions v4 Node.js Programming Model Entry Point
// This file imports and registers all HTTP-triggered functions
Object.defineProperty(exports, "__esModule", { value: true });
// Import function handlers
require("../health/index.js");
require("../messages/index.js");
require("../prompts/index.js");
require("../searchPrompts/index.js");
// Functions are automatically registered via app.http() calls in each module
// No export needed - Azure Functions runtime will discover them
