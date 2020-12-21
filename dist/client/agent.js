'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.cache = void 0;
const bunion_1 = require("bunion");
if (require.main === module) {
    bunion_1.default.error('8224ed20-4d86-471f-9dae-e51d37b82cc8:', 'cannot run the agent.js file directly - use main.js.');
    process.exit(1);
}
exports.cache = {
    conn: null,
    resolutions: new Map()
};
