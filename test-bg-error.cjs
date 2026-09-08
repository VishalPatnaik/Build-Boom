const fs = require('fs');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const dom = new JSDOM('<!DOCTYPE html><canvas id="c"></canvas>');
// We can't easily run canvas in node without canvas package.
