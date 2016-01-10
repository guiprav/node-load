'use strict';

let path = require('path');
let relPath = path.relative;
let baseName = path.basename;
let extName = path.extname;

let recurseInto = require('recurse-into');

let readTextFileSync = require('read-text-file-sync');

exports = module.exports = function(file) {
    return (exports.byExt[extName(file).slice(1)] || exports.default)(file);
};

exports.default = function(file) {
    return readTextFileSync(file);
};

exports.byExt = {};

exports.byExt.js = function(file) {
    return require(file);
};

exports.byExt.json = function(file) {
    return JSON.parse(readTextFileSync(file));
};

exports.array = function(files) {
    return files.map(function(file) {
        return exports(file);
    });
};

exports.tree = function(files, options) {
    let rootObj = options.rootObj || {};

    files.forEach(function(file) {
        let fileRel = relPath(options.baseDir, file);

        if(fileRel.startsWith('../')) {
            throw new Error("File not in base directory");
        }

        let nodes = fileRel.split('/');

        let head = nodes[nodes.length - 1];

        let tail = nodes.slice(0, -1);

        let parent = recurseInto(rootObj, tail, { create: true });

        let noExtHead = baseName(head, extName(head));

        parent[noExtHead] = exports(file);
    });

    return rootObj;
};
