'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const bodyParser = require("body-parser");
const on_change_1 = require("./on-change");
const on_read_1 = require("./on-read");
const bunion_1 = require("bunion");
if (require.main === module) {
    bunion_1.default.error('18baedca-f9bc-44fb-abf3-849bc7ace2ae:', 'cannot run the file directly - use main.js.');
    process.exit(1);
}
const app = express();
exports.app = app;
app.use(bodyParser.json());
app.post('/read', (req, res) => {
    const b = req.body;
    if (!(b.repo && typeof b.repo === 'string')) {
        return res.status(422).json({ error: 'The "repo" field must be a string.' });
    }
    on_read_1.onRead(b, v => {
        res.json(v);
    });
});
app.post('/change', (req, res) => {
    const b = req.body;
    if (!(b.repo && typeof b.repo === 'string')) {
        return res.status(422).json({ error: 'The "repo" field must be a string.' });
    }
    on_change_1.onChange(b, v => {
        res.json(v);
    });
});
