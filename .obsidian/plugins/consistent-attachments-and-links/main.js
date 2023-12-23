'use strict';

var obsidian = require('obsidian');

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

const DEFAULT_SETTINGS = {
    moveAttachmentsWithNote: true,
    deleteAttachmentsWithNote: true,
    updateLinks: true,
    deleteEmptyFolders: true,
    deleteExistFilesWhenMoveNote: true,
    changeNoteBacklinksAlt: false,
    ignoreFolders: [".git/", ".obsidian/"],
    ignoreFiles: ["consistency\\-report\\.md"],
    ignoreFilesRegex: [/consistency\-report\.md/],
    attachmentsSubfolder: "",
    consistencyReportFile: "consistency-report.md",
    useBuiltInObsidianLinkCaching: false,
};
class SettingTab extends obsidian.PluginSettingTab {
    constructor(app, plugin) {
        super(app, plugin);
        this.plugin = plugin;
    }
    display() {
        let { containerEl } = this;
        containerEl.empty();
        containerEl.createEl('h2', { text: 'Consistent attachments and links - Settings' });
        new obsidian.Setting(containerEl)
            .setName('Move Attachments with Note')
            .setDesc('Automatically move attachments when a note is relocated. This includes attachments located in the same folder or any of its subfolders.')
            .addToggle(cb => cb.onChange(value => {
            this.plugin.settings.moveAttachmentsWithNote = value;
            this.plugin.saveSettings();
        }).setValue(this.plugin.settings.moveAttachmentsWithNote));
        new obsidian.Setting(containerEl)
            .setName('Delete Unused Attachments with Note')
            .setDesc('Automatically remove attachments that are no longer referenced in other notes when the note is deleted.')
            .addToggle(cb => cb.onChange(value => {
            this.plugin.settings.deleteAttachmentsWithNote = value;
            this.plugin.saveSettings();
        }).setValue(this.plugin.settings.deleteAttachmentsWithNote));
        new obsidian.Setting(containerEl)
            .setName('Update Links')
            .setDesc('Automatically update links to attachments and other notes when moving notes or attachments.')
            .addToggle(cb => cb.onChange(value => {
            this.plugin.settings.updateLinks = value;
            this.plugin.saveSettings();
        }).setValue(this.plugin.settings.updateLinks));
        new obsidian.Setting(containerEl)
            .setName('Delete Empty Folders')
            .setDesc('Automatically remove empty folders after moving notes with attachments.')
            .addToggle(cb => cb.onChange(value => {
            this.plugin.settings.deleteEmptyFolders = value;
            this.plugin.saveSettings();
        }).setValue(this.plugin.settings.deleteEmptyFolders));
        new obsidian.Setting(containerEl)
            .setName('Delete Duplicate Attachments on Note Move')
            .setDesc('Automatically delete attachments when moving a note if a file with the same name exists in the destination folder. If disabled, the file will be renamed and moved.')
            .addToggle(cb => cb.onChange(value => {
            this.plugin.settings.deleteExistFilesWhenMoveNote = value;
            this.plugin.saveSettings();
        }).setValue(this.plugin.settings.deleteExistFilesWhenMoveNote));
        new obsidian.Setting(containerEl)
            .setName('Update Backlink Text on Note Rename')
            .setDesc('When a note is renamed, its linked references are automatically updated. If this option is enabled, the text of backlinks to this note will also be modified.')
            .addToggle(cb => cb.onChange(value => {
            this.plugin.settings.changeNoteBacklinksAlt = value;
            this.plugin.saveSettings();
        }).setValue(this.plugin.settings.changeNoteBacklinksAlt));
        new obsidian.Setting(containerEl)
            .setName("Ignore Folders")
            .setDesc("Specify a list of folders to ignore. Enter each folder on a new line.")
            .addTextArea(cb => cb
            .setPlaceholder("Example: .git, .obsidian")
            .setValue(this.plugin.settings.ignoreFolders.join("\n"))
            .onChange((value) => {
            let paths = value.trim().split("\n").map(value => this.getNormalizedPath(value) + "/");
            this.plugin.settings.ignoreFolders = paths;
            this.plugin.saveSettings();
        }));
        new obsidian.Setting(containerEl)
            .setName("Ignore Files")
            .setDesc("Specify a list of files to ignore. Enter each file on a new line.")
            .addTextArea(cb => cb
            .setPlaceholder("Example: consistant-report.md")
            .setValue(this.plugin.settings.ignoreFiles.join("\n"))
            .onChange((value) => {
            let paths = value.trim().split("\n");
            this.plugin.settings.ignoreFiles = paths;
            this.plugin.settings.ignoreFilesRegex = paths.map(file => RegExp(file));
            this.plugin.saveSettings();
        }));
        new obsidian.Setting(containerEl)
            .setName("Attachment Subfolder")
            .setDesc("Specify the subfolder within the note folder to collect attachments into when using the \"Collect All Attachments\" hotkey. Leave empty to collect attachments directly into the note folder. You can use ${filename} as a placeholder for the current note name.")
            .addText(cb => cb
            .setPlaceholder("Example: _attachments")
            .setValue(this.plugin.settings.attachmentsSubfolder)
            .onChange((value) => {
            this.plugin.settings.attachmentsSubfolder = value;
            this.plugin.saveSettings();
        }));
        new obsidian.Setting(containerEl)
            .setName("Consistency Report Filename")
            .setDesc("Specify the name of the file for the consistency report.")
            .addText(cb => cb
            .setPlaceholder("Example: consistency-report.md")
            .setValue(this.plugin.settings.consistencyReportFile)
            .onChange((value) => {
            this.plugin.settings.consistencyReportFile = value;
            this.plugin.saveSettings();
        }));
        new obsidian.Setting(containerEl)
            .setName("EXPERIMENTAL: Use Built-in Obsidian Link Caching for Moved Notes")
            .setDesc("Enable this option to use the experimental built-in Obsidian link caching for processing moved notes. Turn it off if the plugin misbehaves.")
            .addToggle(cb => cb.onChange(value => {
            this.plugin.settings.useBuiltInObsidianLinkCaching = value;
            this.plugin.saveSettings();
        }).setValue(this.plugin.settings.useBuiltInObsidianLinkCaching));
    }
    getNormalizedPath(path) {
        return path.length == 0 ? path : obsidian.normalizePath(path);
    }
}

class Utils {
    static delay(ms) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise(resolve => setTimeout(resolve, ms));
        });
    }
    static normalizePathForFile(path) {
        path = path.replace(/\\/gi, "/"); //replace \ to /
        path = path.replace(/%20/gi, " "); //replace %20 to space
        return path;
    }
    static normalizePathForLink(path) {
        path = path.replace(/\\/gi, "/"); //replace \ to /
        path = path.replace(/ /gi, "%20"); //replace space to %20
        return path;
    }
    static normalizeLinkSection(section) {
        section = decodeURI(section);
        return section;
    }
    static getCacheSafe(fileOrPath) {
        return __awaiter(this, void 0, void 0, function* () {
            const file = Utils.getFile(fileOrPath);
            while (true) {
                const cache = app.metadataCache.getFileCache(file);
                if (cache) {
                    return cache;
                }
                yield Utils.delay(100);
            }
        });
    }
    static getFile(fileOrPath) {
        if (fileOrPath instanceof obsidian.TFile) {
            return fileOrPath;
        }
        const abstractFile = app.vault.getAbstractFileByPath(fileOrPath);
        if (!abstractFile) {
            throw `File ${fileOrPath} does not exist`;
        }
        if (!(abstractFile instanceof obsidian.TFile)) {
            throw `${fileOrPath} is not a file`;
        }
        return abstractFile;
    }
}

class path {
    static join(...parts) {
        if (arguments.length === 0)
            return '.';
        var joined;
        for (var i = 0; i < arguments.length; ++i) {
            var arg = arguments[i];
            if (arg.length > 0) {
                if (joined === undefined)
                    joined = arg;
                else
                    joined += '/' + arg;
            }
        }
        if (joined === undefined)
            return '.';
        return this.posixNormalize(joined);
    }
    static dirname(path) {
        if (path.length === 0)
            return '.';
        var code = path.charCodeAt(0);
        var hasRoot = code === 47 /*/*/;
        var end = -1;
        var matchedSlash = true;
        for (var i = path.length - 1; i >= 1; --i) {
            code = path.charCodeAt(i);
            if (code === 47 /*/*/) {
                if (!matchedSlash) {
                    end = i;
                    break;
                }
            }
            else {
                // We saw the first non-path separator
                matchedSlash = false;
            }
        }
        if (end === -1)
            return hasRoot ? '/' : '.';
        if (hasRoot && end === 1)
            return '//';
        return path.slice(0, end);
    }
    static basename(path, ext) {
        if (ext !== undefined && typeof ext !== 'string')
            throw new TypeError('"ext" argument must be a string');
        var start = 0;
        var end = -1;
        var matchedSlash = true;
        var i;
        if (ext !== undefined && ext.length > 0 && ext.length <= path.length) {
            if (ext.length === path.length && ext === path)
                return '';
            var extIdx = ext.length - 1;
            var firstNonSlashEnd = -1;
            for (i = path.length - 1; i >= 0; --i) {
                var code = path.charCodeAt(i);
                if (code === 47 /*/*/) {
                    // If we reached a path separator that was not part of a set of path
                    // separators at the end of the string, stop now
                    if (!matchedSlash) {
                        start = i + 1;
                        break;
                    }
                }
                else {
                    if (firstNonSlashEnd === -1) {
                        // We saw the first non-path separator, remember this index in case
                        // we need it if the extension ends up not matching
                        matchedSlash = false;
                        firstNonSlashEnd = i + 1;
                    }
                    if (extIdx >= 0) {
                        // Try to match the explicit extension
                        if (code === ext.charCodeAt(extIdx)) {
                            if (--extIdx === -1) {
                                // We matched the extension, so mark this as the end of our path
                                // component
                                end = i;
                            }
                        }
                        else {
                            // Extension does not match, so our result is the entire path
                            // component
                            extIdx = -1;
                            end = firstNonSlashEnd;
                        }
                    }
                }
            }
            if (start === end)
                end = firstNonSlashEnd;
            else if (end === -1)
                end = path.length;
            return path.slice(start, end);
        }
        else {
            for (i = path.length - 1; i >= 0; --i) {
                if (path.charCodeAt(i) === 47 /*/*/) {
                    // If we reached a path separator that was not part of a set of path
                    // separators at the end of the string, stop now
                    if (!matchedSlash) {
                        start = i + 1;
                        break;
                    }
                }
                else if (end === -1) {
                    // We saw the first non-path separator, mark this as the end of our
                    // path component
                    matchedSlash = false;
                    end = i + 1;
                }
            }
            if (end === -1)
                return '';
            return path.slice(start, end);
        }
    }
    static extname(path) {
        var startDot = -1;
        var startPart = 0;
        var end = -1;
        var matchedSlash = true;
        // Track the state of characters (if any) we see before our first dot and
        // after any path separator we find
        var preDotState = 0;
        for (var i = path.length - 1; i >= 0; --i) {
            var code = path.charCodeAt(i);
            if (code === 47 /*/*/) {
                // If we reached a path separator that was not part of a set of path
                // separators at the end of the string, stop now
                if (!matchedSlash) {
                    startPart = i + 1;
                    break;
                }
                continue;
            }
            if (end === -1) {
                // We saw the first non-path separator, mark this as the end of our
                // extension
                matchedSlash = false;
                end = i + 1;
            }
            if (code === 46 /*.*/) {
                // If this is our first dot, mark it as the start of our extension
                if (startDot === -1)
                    startDot = i;
                else if (preDotState !== 1)
                    preDotState = 1;
            }
            else if (startDot !== -1) {
                // We saw a non-dot and non-path separator before our dot, so we should
                // have a good chance at having a non-empty extension
                preDotState = -1;
            }
        }
        if (startDot === -1 || end === -1 ||
            // We saw a non-dot character immediately before the dot
            preDotState === 0 ||
            // The (right-most) trimmed path component is exactly '..'
            preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
            return '';
        }
        return path.slice(startDot, end);
    }
    static parse(path) {
        var ret = { root: '', dir: '', base: '', ext: '', name: '' };
        if (path.length === 0)
            return ret;
        var code = path.charCodeAt(0);
        var isAbsolute = code === 47 /*/*/;
        var start;
        if (isAbsolute) {
            ret.root = '/';
            start = 1;
        }
        else {
            start = 0;
        }
        var startDot = -1;
        var startPart = 0;
        var end = -1;
        var matchedSlash = true;
        var i = path.length - 1;
        // Track the state of characters (if any) we see before our first dot and
        // after any path separator we find
        var preDotState = 0;
        // Get non-dir info
        for (; i >= start; --i) {
            code = path.charCodeAt(i);
            if (code === 47 /*/*/) {
                // If we reached a path separator that was not part of a set of path
                // separators at the end of the string, stop now
                if (!matchedSlash) {
                    startPart = i + 1;
                    break;
                }
                continue;
            }
            if (end === -1) {
                // We saw the first non-path separator, mark this as the end of our
                // extension
                matchedSlash = false;
                end = i + 1;
            }
            if (code === 46 /*.*/) {
                // If this is our first dot, mark it as the start of our extension
                if (startDot === -1)
                    startDot = i;
                else if (preDotState !== 1)
                    preDotState = 1;
            }
            else if (startDot !== -1) {
                // We saw a non-dot and non-path separator before our dot, so we should
                // have a good chance at having a non-empty extension
                preDotState = -1;
            }
        }
        if (startDot === -1 || end === -1 ||
            // We saw a non-dot character immediately before the dot
            preDotState === 0 ||
            // The (right-most) trimmed path component is exactly '..'
            preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
            if (end !== -1) {
                if (startPart === 0 && isAbsolute)
                    ret.base = ret.name = path.slice(1, end);
                else
                    ret.base = ret.name = path.slice(startPart, end);
            }
        }
        else {
            if (startPart === 0 && isAbsolute) {
                ret.name = path.slice(1, startDot);
                ret.base = path.slice(1, end);
            }
            else {
                ret.name = path.slice(startPart, startDot);
                ret.base = path.slice(startPart, end);
            }
            ret.ext = path.slice(startDot, end);
        }
        if (startPart > 0)
            ret.dir = path.slice(0, startPart - 1);
        else if (isAbsolute)
            ret.dir = '/';
        return ret;
    }
    static posixNormalize(path) {
        if (path.length === 0)
            return '.';
        var isAbsolute = path.charCodeAt(0) === 47 /*/*/;
        var trailingSeparator = path.charCodeAt(path.length - 1) === 47 /*/*/;
        // Normalize the path
        path = this.normalizeStringPosix(path, !isAbsolute);
        if (path.length === 0 && !isAbsolute)
            path = '.';
        if (path.length > 0 && trailingSeparator)
            path += '/';
        if (isAbsolute)
            return '/' + path;
        return path;
    }
    static normalizeStringPosix(path, allowAboveRoot) {
        var res = '';
        var lastSegmentLength = 0;
        var lastSlash = -1;
        var dots = 0;
        var code;
        for (var i = 0; i <= path.length; ++i) {
            if (i < path.length)
                code = path.charCodeAt(i);
            else if (code === 47 /*/*/)
                break;
            else
                code = 47 /*/*/;
            if (code === 47 /*/*/) {
                if (lastSlash === i - 1 || dots === 1) ;
                else if (lastSlash !== i - 1 && dots === 2) {
                    if (res.length < 2 || lastSegmentLength !== 2 || res.charCodeAt(res.length - 1) !== 46 /*.*/ || res.charCodeAt(res.length - 2) !== 46 /*.*/) {
                        if (res.length > 2) {
                            var lastSlashIndex = res.lastIndexOf('/');
                            if (lastSlashIndex !== res.length - 1) {
                                if (lastSlashIndex === -1) {
                                    res = '';
                                    lastSegmentLength = 0;
                                }
                                else {
                                    res = res.slice(0, lastSlashIndex);
                                    lastSegmentLength = res.length - 1 - res.lastIndexOf('/');
                                }
                                lastSlash = i;
                                dots = 0;
                                continue;
                            }
                        }
                        else if (res.length === 2 || res.length === 1) {
                            res = '';
                            lastSegmentLength = 0;
                            lastSlash = i;
                            dots = 0;
                            continue;
                        }
                    }
                    if (allowAboveRoot) {
                        if (res.length > 0)
                            res += '/..';
                        else
                            res = '..';
                        lastSegmentLength = 2;
                    }
                }
                else {
                    if (res.length > 0)
                        res += '/' + path.slice(lastSlash + 1, i);
                    else
                        res = path.slice(lastSlash + 1, i);
                    lastSegmentLength = i - lastSlash - 1;
                }
                lastSlash = i;
                dots = 0;
            }
            else if (code === 46 /*.*/ && dots !== -1) {
                ++dots;
            }
            else {
                dots = -1;
            }
        }
        return res;
    }
    static posixResolve(...args) {
        var resolvedPath = '';
        var resolvedAbsolute = false;
        var cwd;
        for (var i = args.length - 1; i >= -1 && !resolvedAbsolute; i--) {
            var path;
            if (i >= 0)
                path = args[i];
            else {
                if (cwd === undefined)
                    cwd = process.cwd();
                path = cwd;
            }
            // Skip empty entries
            if (path.length === 0) {
                continue;
            }
            resolvedPath = path + '/' + resolvedPath;
            resolvedAbsolute = path.charCodeAt(0) === 47 /*/*/;
        }
        // At this point the path should be resolved to a full absolute path, but
        // handle relative paths to be safe (might happen when process.cwd() fails)
        // Normalize the path
        resolvedPath = this.normalizeStringPosix(resolvedPath, !resolvedAbsolute);
        if (resolvedAbsolute) {
            if (resolvedPath.length > 0)
                return '/' + resolvedPath;
            else
                return '/';
        }
        else if (resolvedPath.length > 0) {
            return resolvedPath;
        }
        else {
            return '.';
        }
    }
    static relative(from, to) {
        if (from === to)
            return '';
        from = this.posixResolve(from);
        to = this.posixResolve(to);
        if (from === to)
            return '';
        // Trim any leading backslashes
        var fromStart = 1;
        for (; fromStart < from.length; ++fromStart) {
            if (from.charCodeAt(fromStart) !== 47 /*/*/)
                break;
        }
        var fromEnd = from.length;
        var fromLen = fromEnd - fromStart;
        // Trim any leading backslashes
        var toStart = 1;
        for (; toStart < to.length; ++toStart) {
            if (to.charCodeAt(toStart) !== 47 /*/*/)
                break;
        }
        var toEnd = to.length;
        var toLen = toEnd - toStart;
        // Compare paths to find the longest common path from root
        var length = fromLen < toLen ? fromLen : toLen;
        var lastCommonSep = -1;
        var i = 0;
        for (; i <= length; ++i) {
            if (i === length) {
                if (toLen > length) {
                    if (to.charCodeAt(toStart + i) === 47 /*/*/) {
                        // We get here if `from` is the exact base path for `to`.
                        // For example: from='/foo/bar'; to='/foo/bar/baz'
                        return to.slice(toStart + i + 1);
                    }
                    else if (i === 0) {
                        // We get here if `from` is the root
                        // For example: from='/'; to='/foo'
                        return to.slice(toStart + i);
                    }
                }
                else if (fromLen > length) {
                    if (from.charCodeAt(fromStart + i) === 47 /*/*/) {
                        // We get here if `to` is the exact base path for `from`.
                        // For example: from='/foo/bar/baz'; to='/foo/bar'
                        lastCommonSep = i;
                    }
                    else if (i === 0) {
                        // We get here if `to` is the root.
                        // For example: from='/foo'; to='/'
                        lastCommonSep = 0;
                    }
                }
                break;
            }
            var fromCode = from.charCodeAt(fromStart + i);
            var toCode = to.charCodeAt(toStart + i);
            if (fromCode !== toCode)
                break;
            else if (fromCode === 47 /*/*/)
                lastCommonSep = i;
        }
        var out = '';
        // Generate the relative path based on the path difference between `to`
        // and `from`
        for (i = fromStart + lastCommonSep + 1; i <= fromEnd; ++i) {
            if (i === fromEnd || from.charCodeAt(i) === 47 /*/*/) {
                if (out.length === 0)
                    out += '..';
                else
                    out += '/..';
            }
        }
        // Lastly, append the rest of the destination (`to`) path that comes after
        // the common path parts
        if (out.length > 0)
            return out + to.slice(toStart + lastCommonSep);
        else {
            toStart += lastCommonSep;
            if (to.charCodeAt(toStart) === 47 /*/*/)
                ++toStart;
            return to.slice(toStart);
        }
    }
}

//simple regex
// const markdownLinkOrEmbedRegexSimple = /\[(.*?)\]\((.*?)\)/gim
// const markdownLinkRegexSimple = /(?<!\!)\[(.*?)\]\((.*?)\)/gim;
// const markdownEmbedRegexSimple = /\!\[(.*?)\]\((.*?)\)/gim
// const wikiLinkOrEmbedRegexSimple = /\[\[(.*?)\]\]/gim
// const wikiLinkRegexSimple = /(?<!\!)\[\[(.*?)\]\]/gim;
// const wikiEmbedRegexSimple = /\!\[\[(.*?)\]\]/gim
//with escaping \ characters
const markdownLinkOrEmbedRegexG = /(?<!\\)\[(.*?)(?<!\\)\]\((.*?)(?<!\\)\)/gim;
const markdownLinkRegexG = /(?<!\!)(?<!\\)\[(.*?)(?<!\\)\]\((.*?)(?<!\\)(?:#(.*?))?\)/gim;
const markdownEmbedRegexG = /(?<!\\)\!\[(.*?)(?<!\\)\]\((.*?)(?<!\\)\)/gim;
const wikiLinkOrEmbedRegexG = /(?<!\\)\[\[(.*?)(?<!\\)\]\]/gim;
const wikiLinkRegexG = /(?<!\!)(?<!\\)\[\[(.*?)(?<!\\)\]\]/gim;
const wikiEmbedRegexG = /(?<!\\)\!\[\[(.*?)(?<!\\)\]\]/gim;
const markdownLinkOrEmbedRegex = /(?<!\\)\[(.*?)(?<!\\)\]\((.*?)(?<!\\)\)/im;
const markdownLinkRegex = /(?<!\!)(?<!\\)\[(.*?)(?<!\\)\]\((.*?)(?<!\\)\)/im;
class LinksHandler {
    constructor(app, consoleLogPrefix = "", ignoreFolders = [], ignoreFilesRegex = []) {
        this.app = app;
        this.consoleLogPrefix = consoleLogPrefix;
        this.ignoreFolders = ignoreFolders;
        this.ignoreFilesRegex = ignoreFilesRegex;
    }
    isPathIgnored(path) {
        if (path.startsWith("./"))
            path = path.substring(2);
        for (let folder of this.ignoreFolders) {
            if (path.startsWith(folder)) {
                return true;
            }
        }
        for (let fileRegex of this.ignoreFilesRegex) {
            if (fileRegex.test(path)) {
                return true;
            }
        }
    }
    checkIsCorrectMarkdownEmbed(text) {
        let elements = text.match(markdownEmbedRegexG);
        return (elements != null && elements.length > 0);
    }
    checkIsCorrectMarkdownLink(text) {
        let elements = text.match(markdownLinkRegexG);
        return (elements != null && elements.length > 0);
    }
    checkIsCorrectMarkdownEmbedOrLink(text) {
        let elements = text.match(markdownLinkOrEmbedRegexG);
        return (elements != null && elements.length > 0);
    }
    checkIsCorrectWikiEmbed(text) {
        let elements = text.match(wikiEmbedRegexG);
        return (elements != null && elements.length > 0);
    }
    checkIsCorrectWikiLink(text) {
        let elements = text.match(wikiLinkRegexG);
        return (elements != null && elements.length > 0);
    }
    checkIsCorrectWikiEmbedOrLink(text) {
        let elements = text.match(wikiLinkOrEmbedRegexG);
        return (elements != null && elements.length > 0);
    }
    getFileByLink(link, owningNotePath, allowInvalidLink = true) {
        link = this.splitLinkToPathAndSection(link).link;
        if (allowInvalidLink) {
            return this.app.metadataCache.getFirstLinkpathDest(link, owningNotePath);
        }
        let fullPath = this.getFullPathForLink(link, owningNotePath);
        return this.getFileByPath(fullPath);
    }
    getFileByPath(path) {
        path = Utils.normalizePathForFile(path);
        return app.vault.getAbstractFileByPath(path);
    }
    getFullPathForLink(link, owningNotePath) {
        link = this.splitLinkToPathAndSection(link).link;
        link = Utils.normalizePathForFile(link);
        owningNotePath = Utils.normalizePathForFile(owningNotePath);
        let parentFolder = owningNotePath.substring(0, owningNotePath.lastIndexOf("/"));
        let fullPath = path.join(parentFolder, link);
        fullPath = Utils.normalizePathForFile(fullPath);
        return fullPath;
    }
    getAllCachedLinksToFile(filePath) {
        return __awaiter(this, void 0, void 0, function* () {
            let allLinks = {};
            let notes = this.app.vault.getMarkdownFiles();
            if (notes) {
                for (let note of notes) {
                    if (note.path == filePath)
                        continue;
                    let links = (yield Utils.getCacheSafe(note.path)).links;
                    if (links) {
                        for (let link of links) {
                            let linkFullPath = this.getFullPathForLink(link.link, note.path);
                            if (linkFullPath == filePath) {
                                if (!allLinks[note.path])
                                    allLinks[note.path] = [];
                                allLinks[note.path].push(link);
                            }
                        }
                    }
                }
            }
            return allLinks;
        });
    }
    getAllCachedEmbedsToFile(filePath) {
        return __awaiter(this, void 0, void 0, function* () {
            let allEmbeds = {};
            let notes = this.app.vault.getMarkdownFiles();
            if (notes) {
                for (let note of notes) {
                    if (note.path == filePath)
                        continue;
                    //!!! this can return undefined if note was just updated
                    let embeds = (yield Utils.getCacheSafe(note.path)).embeds;
                    if (embeds) {
                        for (let embed of embeds) {
                            let linkFullPath = this.getFullPathForLink(embed.link, note.path);
                            if (linkFullPath == filePath) {
                                if (!allEmbeds[note.path])
                                    allEmbeds[note.path] = [];
                                allEmbeds[note.path].push(embed);
                            }
                        }
                    }
                }
            }
            return allEmbeds;
        });
    }
    getAllBadLinks() {
        return __awaiter(this, void 0, void 0, function* () {
            let allLinks = {};
            let notes = this.app.vault.getMarkdownFiles();
            if (notes) {
                for (let note of notes) {
                    if (this.isPathIgnored(note.path))
                        continue;
                    //!!! this can return undefined if note was just updated
                    let links = (yield Utils.getCacheSafe(note.path)).links;
                    if (links) {
                        for (let link of links) {
                            if (link.link.startsWith("#")) //internal section link
                                continue;
                            if (this.checkIsCorrectWikiLink(link.original))
                                continue;
                            let file = this.getFileByLink(link.link, note.path, false);
                            if (!file) {
                                if (!allLinks[note.path])
                                    allLinks[note.path] = [];
                                allLinks[note.path].push(link);
                            }
                        }
                    }
                }
            }
            return allLinks;
        });
    }
    getAllBadEmbeds() {
        return __awaiter(this, void 0, void 0, function* () {
            let allEmbeds = {};
            let notes = this.app.vault.getMarkdownFiles();
            if (notes) {
                for (let note of notes) {
                    if (this.isPathIgnored(note.path))
                        continue;
                    //!!! this can return undefined if note was just updated
                    let embeds = (yield Utils.getCacheSafe(note.path)).embeds;
                    if (embeds) {
                        for (let embed of embeds) {
                            if (this.checkIsCorrectWikiEmbed(embed.original))
                                continue;
                            let file = this.getFileByLink(embed.link, note.path, false);
                            if (!file) {
                                if (!allEmbeds[note.path])
                                    allEmbeds[note.path] = [];
                                allEmbeds[note.path].push(embed);
                            }
                        }
                    }
                }
            }
            return allEmbeds;
        });
    }
    getAllGoodLinks() {
        return __awaiter(this, void 0, void 0, function* () {
            let allLinks = {};
            let notes = this.app.vault.getMarkdownFiles();
            if (notes) {
                for (let note of notes) {
                    if (this.isPathIgnored(note.path))
                        continue;
                    //!!! this can return undefined if note was just updated
                    let links = (yield Utils.getCacheSafe(note.path)).links;
                    if (links) {
                        for (let link of links) {
                            if (link.link.startsWith("#")) //internal section link
                                continue;
                            if (this.checkIsCorrectWikiLink(link.original))
                                continue;
                            let file = this.getFileByLink(link.link, note.path);
                            if (file) {
                                if (!allLinks[note.path])
                                    allLinks[note.path] = [];
                                allLinks[note.path].push(link);
                            }
                        }
                    }
                }
            }
            return allLinks;
        });
    }
    getAllBadSectionLinks() {
        return __awaiter(this, void 0, void 0, function* () {
            let allLinks = {};
            let notes = this.app.vault.getMarkdownFiles();
            if (notes) {
                for (let note of notes) {
                    if (this.isPathIgnored(note.path))
                        continue;
                    //!!! this can return undefined if note was just updated
                    let links = (yield Utils.getCacheSafe(note.path)).links;
                    if (links) {
                        for (let link of links) {
                            if (this.checkIsCorrectWikiLink(link.original))
                                continue;
                            let li = this.splitLinkToPathAndSection(link.link);
                            if (!li.hasSection)
                                continue;
                            let file = this.getFileByLink(link.link, note.path, false);
                            if (file) {
                                if (file.extension === "pdf" && li.section.startsWith("page=")) {
                                    continue;
                                }
                                let text = yield this.app.vault.read(file);
                                let section = Utils.normalizeLinkSection(li.section);
                                if (section.startsWith("^")) //skip ^ links
                                    continue;
                                let regex = /[ !@$%^&*()-=_+\\/;'\[\]\"\|\?.\,\<\>\`\~\{\}]/gim;
                                text = text.replace(regex, '');
                                section = section.replace(regex, '');
                                if (!text.contains("#" + section)) {
                                    if (!allLinks[note.path])
                                        allLinks[note.path] = [];
                                    allLinks[note.path].push(link);
                                }
                            }
                        }
                    }
                }
            }
            return allLinks;
        });
    }
    getAllGoodEmbeds() {
        return __awaiter(this, void 0, void 0, function* () {
            let allEmbeds = {};
            let notes = this.app.vault.getMarkdownFiles();
            if (notes) {
                for (let note of notes) {
                    if (this.isPathIgnored(note.path))
                        continue;
                    //!!! this can return undefined if note was just updated
                    let embeds = (yield Utils.getCacheSafe(note.path)).embeds;
                    if (embeds) {
                        for (let embed of embeds) {
                            if (this.checkIsCorrectWikiEmbed(embed.original))
                                continue;
                            let file = this.getFileByLink(embed.link, note.path);
                            if (file) {
                                if (!allEmbeds[note.path])
                                    allEmbeds[note.path] = [];
                                allEmbeds[note.path].push(embed);
                            }
                        }
                    }
                }
            }
            return allEmbeds;
        });
    }
    getAllWikiLinks() {
        return __awaiter(this, void 0, void 0, function* () {
            let allLinks = {};
            let notes = this.app.vault.getMarkdownFiles();
            if (notes) {
                for (let note of notes) {
                    if (this.isPathIgnored(note.path))
                        continue;
                    //!!! this can return undefined if note was just updated
                    let links = (yield Utils.getCacheSafe(note.path)).links;
                    if (links) {
                        for (let link of links) {
                            if (!this.checkIsCorrectWikiLink(link.original))
                                continue;
                            if (!allLinks[note.path])
                                allLinks[note.path] = [];
                            allLinks[note.path].push(link);
                        }
                    }
                }
            }
            return allLinks;
        });
    }
    getAllWikiEmbeds() {
        return __awaiter(this, void 0, void 0, function* () {
            let allEmbeds = {};
            let notes = this.app.vault.getMarkdownFiles();
            if (notes) {
                for (let note of notes) {
                    if (this.isPathIgnored(note.path))
                        continue;
                    //!!! this can return undefined if note was just updated
                    let embeds = (yield Utils.getCacheSafe(note.path)).embeds;
                    if (embeds) {
                        for (let embed of embeds) {
                            if (!this.checkIsCorrectWikiEmbed(embed.original))
                                continue;
                            if (!allEmbeds[note.path])
                                allEmbeds[note.path] = [];
                            allEmbeds[note.path].push(embed);
                        }
                    }
                }
            }
            return allEmbeds;
        });
    }
    updateLinksToRenamedFile(oldNotePath, newNotePath, changelinksAlt = false, useBuiltInObsidianLinkCaching = false) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isPathIgnored(oldNotePath) || this.isPathIgnored(newNotePath))
                return;
            let notes = useBuiltInObsidianLinkCaching ? yield this.getCachedNotesThatHaveLinkToFile(oldNotePath) : yield this.getNotesThatHaveLinkToFile(oldNotePath);
            let links = [{ oldPath: oldNotePath, newPath: newNotePath }];
            if (notes) {
                for (let note of notes) {
                    yield this.updateChangedPathsInNote(note, links, changelinksAlt);
                }
            }
        });
    }
    updateChangedPathInNote(notePath, oldLink, newLink, changelinksAlt = false) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isPathIgnored(notePath))
                return;
            let changes = [{ oldPath: oldLink, newPath: newLink }];
            return yield this.updateChangedPathsInNote(notePath, changes, changelinksAlt);
        });
    }
    updateChangedPathsInNote(notePath, changedLinks, changelinksAlt = false) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isPathIgnored(notePath))
                return;
            let file = this.getFileByPath(notePath);
            if (!file) {
                console.error(this.consoleLogPrefix + "cant update links in note, file not found: " + notePath);
                return;
            }
            let text = yield this.app.vault.read(file);
            let dirty = false;
            let elements = text.match(markdownLinkOrEmbedRegexG);
            if (elements != null && elements.length > 0) {
                for (let el of elements) {
                    let alt = el.match(markdownLinkOrEmbedRegex)[1];
                    let link = el.match(markdownLinkOrEmbedRegex)[2];
                    let li = this.splitLinkToPathAndSection(link);
                    if (li.hasSection) // for links with sections like [](note.md#section)
                        link = li.link;
                    let fullLink = this.getFullPathForLink(link, notePath);
                    for (let changedLink of changedLinks) {
                        if (fullLink == changedLink.oldPath) {
                            let newRelLink = path.relative(notePath, changedLink.newPath);
                            newRelLink = Utils.normalizePathForLink(newRelLink);
                            if (newRelLink.startsWith("../")) {
                                newRelLink = newRelLink.substring(3);
                            }
                            if (changelinksAlt && newRelLink.endsWith(".md")) {
                                //rename only if old alt == old note name
                                if (alt === path.basename(changedLink.oldPath, path.extname(changedLink.oldPath))) {
                                    let ext = path.extname(newRelLink);
                                    let baseName = path.basename(newRelLink, ext);
                                    alt = Utils.normalizePathForFile(baseName);
                                }
                            }
                            if (li.hasSection)
                                text = text.replace(el, '[' + alt + ']' + '(' + newRelLink + '#' + li.section + ')');
                            else
                                text = text.replace(el, '[' + alt + ']' + '(' + newRelLink + ')');
                            dirty = true;
                            console.log(this.consoleLogPrefix + "link updated in cached note [note, old link, new link]: \n   "
                                + file.path + "\n   " + link + "\n   " + newRelLink);
                        }
                    }
                }
            }
            if (dirty)
                yield this.app.vault.modify(file, text);
        });
    }
    updateInternalLinksInMovedNote(oldNotePath, newNotePath, attachmentsAlreadyMoved) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isPathIgnored(oldNotePath) || this.isPathIgnored(newNotePath))
                return;
            let file = this.getFileByPath(newNotePath);
            if (!file) {
                console.error(this.consoleLogPrefix + "can't update internal links, file not found: " + newNotePath);
                return;
            }
            let text = yield this.app.vault.read(file);
            let dirty = false;
            let elements = text.match(markdownLinkOrEmbedRegexG);
            if (elements != null && elements.length > 0) {
                for (let el of elements) {
                    let alt = el.match(markdownLinkOrEmbedRegex)[1];
                    let link = el.match(markdownLinkOrEmbedRegex)[2];
                    let li = this.splitLinkToPathAndSection(link);
                    if (link.startsWith("#")) //internal section link
                        continue;
                    if (li.hasSection) // for links with sections like [](note.md#section)
                        link = li.link;
                    //startsWith("../") - for not skipping files that not in the note dir
                    if (attachmentsAlreadyMoved && !link.endsWith(".md") && !link.startsWith("../"))
                        continue;
                    let file = this.getFileByLink(link, oldNotePath);
                    if (!file) {
                        file = this.getFileByLink(link, newNotePath);
                        if (!file) {
                            console.error(this.consoleLogPrefix + newNotePath + " has bad link (file does not exist): " + link);
                            continue;
                        }
                    }
                    let newRelLink = path.relative(newNotePath, file.path);
                    newRelLink = Utils.normalizePathForLink(newRelLink);
                    if (newRelLink.startsWith("../")) {
                        newRelLink = newRelLink.substring(3);
                    }
                    if (li.hasSection)
                        text = text.replace(el, '[' + alt + ']' + '(' + newRelLink + '#' + li.section + ')');
                    else
                        text = text.replace(el, '[' + alt + ']' + '(' + newRelLink + ')');
                    dirty = true;
                    console.log(this.consoleLogPrefix + "link updated in moved note [note, old link, new link]: \n   "
                        + file.path + "\n   " + link + "   \n" + newRelLink);
                }
            }
            if (dirty)
                yield this.app.vault.modify(file, text);
        });
    }
    getCachedNotesThatHaveLinkToFile(filePath) {
        return __awaiter(this, void 0, void 0, function* () {
            let notes = [];
            let allNotes = this.app.vault.getMarkdownFiles();
            if (allNotes) {
                for (let note of allNotes) {
                    if (this.isPathIgnored(note.path))
                        continue;
                    let notePath = note.path;
                    if (note.path == filePath)
                        continue;
                    //!!! this can return undefined if note was just updated
                    let embeds = (yield Utils.getCacheSafe(notePath)).embeds;
                    if (embeds) {
                        for (let embed of embeds) {
                            let linkPath = this.getFullPathForLink(embed.link, note.path);
                            if (linkPath == filePath) {
                                if (!notes.contains(notePath))
                                    notes.push(notePath);
                            }
                        }
                    }
                    //!!! this can return undefined if note was just updated
                    let links = (yield Utils.getCacheSafe(notePath)).links;
                    if (links) {
                        for (let link of links) {
                            let linkPath = this.getFullPathForLink(link.link, note.path);
                            if (linkPath == filePath) {
                                if (!notes.contains(notePath))
                                    notes.push(notePath);
                            }
                        }
                    }
                }
            }
            return notes;
        });
    }
    getNotesThatHaveLinkToFile(filePath) {
        return __awaiter(this, void 0, void 0, function* () {
            let notes = [];
            let allNotes = this.app.vault.getMarkdownFiles();
            if (allNotes) {
                for (let note of allNotes) {
                    if (this.isPathIgnored(note.path))
                        continue;
                    let notePath = note.path;
                    if (notePath == filePath)
                        continue;
                    let links = yield this.getLinksFromNote(notePath);
                    for (let link of links) {
                        let li = this.splitLinkToPathAndSection(link.link);
                        let linkFullPath = this.getFullPathForLink(li.link, notePath);
                        if (linkFullPath == filePath) {
                            if (!notes.contains(notePath))
                                notes.push(notePath);
                        }
                    }
                }
            }
            return notes;
        });
    }
    splitLinkToPathAndSection(link) {
        let res = {
            hasSection: false,
            link: link,
            section: ""
        };
        if (!link.contains('#'))
            return res;
        let linkBeforeHash = link.match(/(.*?)#(.*?)$/)[1];
        let section = link.match(/(.*?)#(.*?)$/)[2];
        let isMarkdownSection = section != "" && linkBeforeHash.endsWith(".md"); // for links with sections like [](note.md#section)
        let isPdfPageSection = section.startsWith("page=") && linkBeforeHash.endsWith(".pdf"); // for links with sections like [](note.pdf#page=42)
        if (isMarkdownSection || isPdfPageSection) {
            res = {
                hasSection: true,
                link: linkBeforeHash,
                section: section
            };
        }
        return res;
    }
    getFilePathWithRenamedBaseName(filePath, newBaseName) {
        return Utils.normalizePathForFile(path.join(path.dirname(filePath), newBaseName + path.extname(filePath)));
    }
    getLinksFromNote(notePath) {
        return __awaiter(this, void 0, void 0, function* () {
            let file = this.getFileByPath(notePath);
            if (!file) {
                console.error(this.consoleLogPrefix + "can't get embeds, file not found: " + notePath);
                return;
            }
            let text = yield this.app.vault.read(file);
            let links = [];
            let elements = text.match(markdownLinkOrEmbedRegexG);
            if (elements != null && elements.length > 0) {
                for (let el of elements) {
                    let alt = el.match(markdownLinkOrEmbedRegex)[1];
                    let link = el.match(markdownLinkOrEmbedRegex)[2];
                    let emb = {
                        link: link,
                        displayText: alt,
                        original: el,
                        position: {
                            start: {
                                col: 0,
                                line: 0,
                                offset: 0
                            },
                            end: {
                                col: 0,
                                line: 0,
                                offset: 0
                            }
                        }
                    };
                    links.push(emb);
                }
            }
            return links;
        });
    }
    convertAllNoteEmbedsPathsToRelative(notePath) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isPathIgnored(notePath))
                return;
            let changedEmbeds = [];
            let embeds = (yield Utils.getCacheSafe(notePath)).embeds;
            if (embeds) {
                for (let embed of embeds) {
                    let isMarkdownEmbed = this.checkIsCorrectMarkdownEmbed(embed.original);
                    let isWikiEmbed = this.checkIsCorrectWikiEmbed(embed.original);
                    if (isMarkdownEmbed || isWikiEmbed) {
                        let file = this.getFileByLink(embed.link, notePath);
                        if (file)
                            continue;
                        file = this.app.metadataCache.getFirstLinkpathDest(embed.link, notePath);
                        if (file) {
                            let newRelLink = path.relative(notePath, file.path);
                            newRelLink = isMarkdownEmbed ? Utils.normalizePathForLink(newRelLink) : Utils.normalizePathForFile(newRelLink);
                            if (newRelLink.startsWith("../")) {
                                newRelLink = newRelLink.substring(3);
                            }
                            changedEmbeds.push({ old: embed, newLink: newRelLink });
                        }
                        else {
                            console.error(this.consoleLogPrefix + notePath + " has bad embed (file does not exist): " + embed.link);
                        }
                    }
                    else {
                        console.error(this.consoleLogPrefix + notePath + " has bad embed (format of link is not markdown or wiki link): " + embed.original);
                    }
                }
            }
            yield this.updateChangedEmbedInNote(notePath, changedEmbeds);
            return changedEmbeds;
        });
    }
    convertAllNoteLinksPathsToRelative(notePath) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isPathIgnored(notePath))
                return;
            let changedLinks = [];
            let links = (yield Utils.getCacheSafe(notePath)).links;
            if (links) {
                for (let link of links) {
                    let isMarkdownLink = this.checkIsCorrectMarkdownLink(link.original);
                    let isWikiLink = this.checkIsCorrectWikiLink(link.original);
                    if (isMarkdownLink || isWikiLink) {
                        if (link.link.startsWith("#")) //internal section link
                            continue;
                        let file = this.getFileByLink(link.link, notePath);
                        if (file)
                            continue;
                        //!!! link.displayText is always "" - OBSIDIAN BUG?, so get display text manualy
                        if (isMarkdownLink) {
                            let elements = link.original.match(markdownLinkRegex);
                            if (elements)
                                link.displayText = elements[1];
                        }
                        file = this.app.metadataCache.getFirstLinkpathDest(link.link, notePath);
                        if (file) {
                            let newRelLink = path.relative(notePath, file.path);
                            newRelLink = isMarkdownLink ? Utils.normalizePathForLink(newRelLink) : Utils.normalizePathForFile(newRelLink);
                            if (newRelLink.startsWith("../")) {
                                newRelLink = newRelLink.substring(3);
                            }
                            changedLinks.push({ old: link, newLink: newRelLink });
                        }
                        else {
                            console.error(this.consoleLogPrefix + notePath + " has bad link (file does not exist): " + link.link);
                        }
                    }
                    else {
                        console.error(this.consoleLogPrefix + notePath + " has bad link (format of link is not markdown or wiki link): " + link.original);
                    }
                }
            }
            yield this.updateChangedLinkInNote(notePath, changedLinks);
            return changedLinks;
        });
    }
    updateChangedEmbedInNote(notePath, changedEmbeds) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isPathIgnored(notePath))
                return;
            let noteFile = this.getFileByPath(notePath);
            if (!noteFile) {
                console.error(this.consoleLogPrefix + "can't update embeds in note, file not found: " + notePath);
                return;
            }
            let text = yield this.app.vault.read(noteFile);
            let dirty = false;
            if (changedEmbeds && changedEmbeds.length > 0) {
                for (let embed of changedEmbeds) {
                    if (embed.old.link == embed.newLink)
                        continue;
                    if (this.checkIsCorrectMarkdownEmbed(embed.old.original)) {
                        text = text.replace(embed.old.original, '![' + embed.old.displayText + ']' + '(' + embed.newLink + ')');
                    }
                    else if (this.checkIsCorrectWikiEmbed(embed.old.original)) {
                        text = text.replace(embed.old.original, '![[' + embed.newLink + ']]');
                    }
                    else {
                        console.error(this.consoleLogPrefix + notePath + " has bad embed (format of link is not maekdown or wiki link): " + embed.old.original);
                        continue;
                    }
                    console.log(this.consoleLogPrefix + "embed updated in note [note, old link, new link]: \n   "
                        + noteFile.path + "\n   " + embed.old.link + "\n   " + embed.newLink);
                    dirty = true;
                }
            }
            if (dirty)
                yield this.app.vault.modify(noteFile, text);
        });
    }
    updateChangedLinkInNote(notePath, chandedLinks) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isPathIgnored(notePath))
                return;
            let noteFile = this.getFileByPath(notePath);
            if (!noteFile) {
                console.error(this.consoleLogPrefix + "can't update links in note, file not found: " + notePath);
                return;
            }
            let text = yield this.app.vault.read(noteFile);
            let dirty = false;
            if (chandedLinks && chandedLinks.length > 0) {
                for (let link of chandedLinks) {
                    if (link.old.link == link.newLink)
                        continue;
                    if (this.checkIsCorrectMarkdownLink(link.old.original)) {
                        text = text.replace(link.old.original, '[' + link.old.displayText + ']' + '(' + link.newLink + ')');
                    }
                    else if (this.checkIsCorrectWikiLink(link.old.original)) {
                        text = text.replace(link.old.original, '[[' + link.newLink + ']]');
                    }
                    else {
                        console.error(this.consoleLogPrefix + notePath + " has bad link (format of link is not maekdown or wiki link): " + link.old.original);
                        continue;
                    }
                    console.log(this.consoleLogPrefix + "cached link updated in note [note, old link, new link]: \n   "
                        + noteFile.path + "\n   " + link.old.link + "\n   " + link.newLink);
                    dirty = true;
                }
            }
            if (dirty)
                yield this.app.vault.modify(noteFile, text);
        });
    }
    replaceAllNoteWikilinksWithMarkdownLinks(notePath) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isPathIgnored(notePath))
                return;
            let res = {
                links: [],
                embeds: [],
            };
            let noteFile = this.getFileByPath(notePath);
            if (!noteFile) {
                console.error(this.consoleLogPrefix + "can't update wikilinks in note, file not found: " + notePath);
                return;
            }
            const cache = yield Utils.getCacheSafe(notePath);
            let links = cache.links;
            let embeds = cache.embeds;
            let text = yield this.app.vault.read(noteFile);
            let dirty = false;
            if (embeds) { //embeds must go first!
                for (let embed of embeds) {
                    if (this.checkIsCorrectWikiEmbed(embed.original)) {
                        let newPath = Utils.normalizePathForLink(embed.link);
                        let newLink = '![' + ']' + '(' + newPath + ')';
                        text = text.replace(embed.original, newLink);
                        console.log(this.consoleLogPrefix + "wiki link (embed) replaced in note [note, old link, new link]: \n   "
                            + noteFile.path + "\n   " + embed.original + "\n   " + newLink);
                        res.embeds.push({ old: embed, newLink: newLink });
                        dirty = true;
                    }
                }
            }
            if (links) {
                for (let link of links) {
                    if (this.checkIsCorrectWikiLink(link.original)) {
                        let newPath = Utils.normalizePathForLink(link.link);
                        let file = this.app.metadataCache.getFirstLinkpathDest(link.link, notePath);
                        if (file && file.extension == "md" && !newPath.endsWith(".md"))
                            newPath = newPath + ".md";
                        let newLink = '[' + link.displayText + ']' + '(' + newPath + ')';
                        text = text.replace(link.original, newLink);
                        console.log(this.consoleLogPrefix + "wiki link replaced in note [note, old link, new link]: \n   "
                            + noteFile.path + "\n   " + link.original + "\n   " + newLink);
                        res.links.push({ old: link, newLink: newLink });
                        dirty = true;
                    }
                }
            }
            if (dirty)
                yield this.app.vault.modify(noteFile, text);
            return res;
        });
    }
}

class FilesHandler {
    constructor(app, lh, consoleLogPrefix = "", ignoreFolders = [], ignoreFilesRegex = []) {
        this.app = app;
        this.lh = lh;
        this.consoleLogPrefix = consoleLogPrefix;
        this.ignoreFolders = ignoreFolders;
        this.ignoreFilesRegex = ignoreFilesRegex;
    }
    isPathIgnored(path) {
        if (path.startsWith("./"))
            path = path.substring(2);
        for (let folder of this.ignoreFolders) {
            if (path.startsWith(folder)) {
                return true;
            }
        }
        for (let fileRegex of this.ignoreFilesRegex) {
            let testResult = fileRegex.test(path);
            // console.log(path,fileRegex,testResult)
            if (testResult) {
                return true;
            }
        }
    }
    createFolderForAttachmentFromLink(link, owningNotePath) {
        return __awaiter(this, void 0, void 0, function* () {
            let newFullPath = this.lh.getFullPathForLink(link, owningNotePath);
            return yield this.createFolderForAttachmentFromPath(newFullPath);
        });
    }
    createFolderForAttachmentFromPath(filePath) {
        return __awaiter(this, void 0, void 0, function* () {
            let newParentFolder = filePath.substring(0, filePath.lastIndexOf("/"));
            try {
                //todo check filder exist
                yield this.app.vault.createFolder(newParentFolder);
            }
            catch (_a) { }
        });
    }
    generateFileCopyName(originalName) {
        let ext = path.extname(originalName);
        let baseName = path.basename(originalName, ext);
        let dir = path.dirname(originalName);
        for (let i = 1; i < 100000; i++) {
            let newName = dir + "/" + baseName + " " + i + ext;
            let existFile = this.lh.getFileByPath(newName);
            if (!existFile)
                return newName;
        }
        return "";
    }
    moveCachedNoteAttachments(oldNotePath, newNotePath, deleteExistFiles, attachmentsSubfolder) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isPathIgnored(oldNotePath) || this.isPathIgnored(newNotePath))
                return;
            //try to get embeds for old or new path (metadataCache can be updated or not)
            //!!! this can return undefined if note was just updated
            let embeds = (yield Utils.getCacheSafe(newNotePath)).embeds;
            if (!embeds)
                return;
            let result = {
                movedAttachments: [],
                renamedFiles: []
            };
            for (let embed of embeds) {
                let link = embed.link;
                let oldLinkPath = this.lh.getFullPathForLink(link, oldNotePath);
                if (result.movedAttachments.findIndex(x => x.oldPath == oldLinkPath) != -1)
                    continue; //already moved
                let file = this.lh.getFileByLink(link, oldNotePath);
                if (!file) {
                    file = this.lh.getFileByLink(link, newNotePath);
                    if (!file) {
                        console.error(this.consoleLogPrefix + oldNotePath + " has bad embed (file does not exist): " + link);
                        continue;
                    }
                }
                //if attachment not in the note folder, skip it
                // = "." means that note was at root path, so do not skip it
                if (path.dirname(oldNotePath) != "." && !path.dirname(oldLinkPath).startsWith(path.dirname(oldNotePath)))
                    continue;
                let newLinkPath = this.getNewAttachmentPath(file.path, newNotePath, attachmentsSubfolder);
                if (newLinkPath == file.path) //nothing to move
                    continue;
                let res = yield this.moveAttachment(file, newLinkPath, [oldNotePath, newNotePath], deleteExistFiles);
                result.movedAttachments = result.movedAttachments.concat(res.movedAttachments);
                result.renamedFiles = result.renamedFiles.concat(res.renamedFiles);
            }
            return result;
        });
    }
    getNewAttachmentPath(oldAttachmentPath, notePath, subfolderName) {
        let resolvedSubFolderName = subfolderName.replace(/\${filename}/g, path.basename(notePath, ".md"));
        let newPath = (resolvedSubFolderName == "") ? path.dirname(notePath) : path.join(path.dirname(notePath), resolvedSubFolderName);
        newPath = Utils.normalizePathForFile(path.join(newPath, path.basename(oldAttachmentPath)));
        return newPath;
    }
    collectAttachmentsForCachedNote(notePath, subfolderName, deleteExistFiles) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isPathIgnored(notePath))
                return;
            let result = {
                movedAttachments: [],
                renamedFiles: []
            };
            const cache = yield Utils.getCacheSafe(notePath);
            const linkObjs = [...((_a = cache.embeds) !== null && _a !== void 0 ? _a : []), ...((_b = cache.links) !== null && _b !== void 0 ? _b : [])];
            for (let linkObj of linkObjs) {
                let link = this.lh.splitLinkToPathAndSection(linkObj.link).link;
                if (link.startsWith("#")) {
                    // internal section link
                    continue;
                }
                let fullPathLink = this.lh.getFullPathForLink(link, notePath);
                if (result.movedAttachments.findIndex(x => x.oldPath == fullPathLink) != -1) {
                    // already moved
                    continue;
                }
                let file = this.lh.getFileByLink(link, notePath);
                if (!file) {
                    const type = linkObj.original.startsWith("!") ? "embed" : "link";
                    console.error(`${this.consoleLogPrefix}${notePath} has bad ${type} (file does not exist): ${link}`);
                    continue;
                }
                const extension = file.extension.toLowerCase();
                if (extension === "md" || file.extension === "canvas") {
                    // internal file link
                    continue;
                }
                let newPath = this.getNewAttachmentPath(file.path, notePath, subfolderName);
                if (newPath == file.path) {
                    // nothing to move
                    continue;
                }
                let res = yield this.moveAttachment(file, newPath, [notePath], deleteExistFiles);
                result.movedAttachments = result.movedAttachments.concat(res.movedAttachments);
                result.renamedFiles = result.renamedFiles.concat(res.renamedFiles);
            }
            return result;
        });
    }
    moveAttachment(file, newLinkPath, parentNotePaths, deleteExistFiles) {
        return __awaiter(this, void 0, void 0, function* () {
            const path = file.path;
            let result = {
                movedAttachments: [],
                renamedFiles: []
            };
            if (this.isPathIgnored(path))
                return result;
            if (path == newLinkPath) {
                console.warn(this.consoleLogPrefix + "Can't move file. Source and destination path the same.");
                return result;
            }
            yield this.createFolderForAttachmentFromPath(newLinkPath);
            let linkedNotes = yield this.lh.getCachedNotesThatHaveLinkToFile(path);
            if (parentNotePaths) {
                for (let notePath of parentNotePaths) {
                    linkedNotes.remove(notePath);
                }
            }
            if (path !== file.path) {
                console.warn(this.consoleLogPrefix + "File was moved already");
                return yield this.moveAttachment(file, newLinkPath, parentNotePaths, deleteExistFiles);
            }
            //if no other file has link to this file - try to move file
            //if file already exist at new location - delete or move with new name
            if (linkedNotes.length == 0) {
                let existFile = this.lh.getFileByPath(newLinkPath);
                if (!existFile) {
                    //move
                    console.log(this.consoleLogPrefix + "move file [from, to]: \n   " + path + "\n   " + newLinkPath);
                    result.movedAttachments.push({ oldPath: path, newPath: newLinkPath });
                    yield this.app.vault.rename(file, newLinkPath);
                }
                else {
                    if (deleteExistFiles) {
                        //delete
                        console.log(this.consoleLogPrefix + "delete file: \n   " + path);
                        result.movedAttachments.push({ oldPath: path, newPath: newLinkPath });
                        yield this.app.vault.trash(file, true);
                    }
                    else {
                        //move with new name
                        let newFileCopyName = this.generateFileCopyName(newLinkPath);
                        console.log(this.consoleLogPrefix + "copy file with new name [from, to]: \n   " + path + "\n   " + newFileCopyName);
                        result.movedAttachments.push({ oldPath: path, newPath: newFileCopyName });
                        yield this.app.vault.rename(file, newFileCopyName);
                        result.renamedFiles.push({ oldPath: newLinkPath, newPath: newFileCopyName });
                    }
                }
            }
            //if some other file has link to this file - try to copy file
            //if file already exist at new location - copy file with new name or do nothing
            else {
                let existFile = this.lh.getFileByPath(newLinkPath);
                if (!existFile) {
                    //copy
                    console.log(this.consoleLogPrefix + "copy file [from, to]: \n   " + path + "\n   " + newLinkPath);
                    result.movedAttachments.push({ oldPath: path, newPath: newLinkPath });
                    yield this.app.vault.copy(file, newLinkPath);
                }
                else {
                    if (deleteExistFiles) ;
                    else {
                        //copy with new name
                        let newFileCopyName = this.generateFileCopyName(newLinkPath);
                        console.log(this.consoleLogPrefix + "copy file with new name [from, to]: \n   " + path + "\n   " + newFileCopyName);
                        result.movedAttachments.push({ oldPath: file.path, newPath: newFileCopyName });
                        yield this.app.vault.copy(file, newFileCopyName);
                        result.renamedFiles.push({ oldPath: newLinkPath, newPath: newFileCopyName });
                    }
                }
            }
            return result;
        });
    }
    deleteEmptyFolders(dirName) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isPathIgnored(dirName))
                return;
            if (dirName.startsWith("./"))
                dirName = dirName.substring(2);
            let list = yield this.app.vault.adapter.list(dirName);
            for (let folder of list.folders) {
                yield this.deleteEmptyFolders(folder);
            }
            list = yield this.app.vault.adapter.list(dirName);
            if (list.files.length == 0 && list.folders.length == 0) {
                console.log(this.consoleLogPrefix + "delete empty folder: \n   " + dirName);
                if (yield this.app.vault.adapter.exists(dirName))
                    yield this.app.vault.adapter.rmdir(dirName, false);
            }
        });
    }
    deleteUnusedAttachmentsForCachedNote(notePath) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isPathIgnored(notePath))
                return;
            //!!! this can return undefined if note was just updated
            let embeds = (yield Utils.getCacheSafe(notePath)).embeds;
            if (embeds) {
                for (let embed of embeds) {
                    let link = embed.link;
                    let fullPath = this.lh.getFullPathForLink(link, notePath);
                    let linkedNotes = yield this.lh.getCachedNotesThatHaveLinkToFile(fullPath);
                    if (linkedNotes.length == 0) {
                        let file = this.lh.getFileByLink(link, notePath, false);
                        if (file) {
                            try {
                                yield this.app.vault.trash(file, true);
                            }
                            catch (_a) { }
                        }
                    }
                }
            }
        });
    }
}

class ConsistentAttachmentsAndLinks extends obsidian.Plugin {
    constructor() {
        super(...arguments);
        this.recentlyRenamedFiles = [];
        this.currentlyRenamingFiles = [];
        this.renamingIsActive = false;
    }
    onload() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.loadSettings();
            this.addSettingTab(new SettingTab(this.app, this));
            this.registerEvent(this.app.vault.on('delete', (file) => this.handleDeletedFile(file)));
            this.registerEvent(this.app.vault.on('rename', (file, oldPath) => this.handleRenamedFile(file, oldPath)));
            this.addCommand({
                id: 'collect-all-attachments',
                name: 'Collect All Attachments',
                callback: () => this.collectAllAttachments()
            });
            this.addCommand({
                id: 'collect-attachments-current-note',
                name: 'Collect Attachments in Current Note',
                editorCallback: (editor, view) => this.collectAttachmentsCurrentNote(editor, view)
            });
            this.addCommand({
                id: 'delete-empty-folders',
                name: 'Delete Empty Folders',
                callback: () => this.deleteEmptyFolders()
            });
            this.addCommand({
                id: 'convert-all-link-paths-to-relative',
                name: 'Convert All Link Paths to Relative',
                callback: () => this.convertAllLinkPathsToRelative()
            });
            this.addCommand({
                id: 'convert-all-embed-paths-to-relative',
                name: 'Convert All Embed Paths to Relative',
                callback: () => this.convertAllEmbedsPathsToRelative()
            });
            this.addCommand({
                id: 'replace-all-wikilinks-with-markdown-links',
                name: 'Replace All Wiki Links with Markdown Links',
                callback: () => this.replaceAllWikilinksWithMarkdownLinks()
            });
            this.addCommand({
                id: 'reorganize-vault',
                name: 'Reorganize Vault',
                callback: () => this.reorganizeVault()
            });
            this.addCommand({
                id: 'check-consistency',
                name: 'Check Vault consistency',
                callback: () => this.checkConsistency()
            });
            // make regex from given strings 
            this.settings.ignoreFilesRegex = this.settings.ignoreFiles.map(val => RegExp(val));
            this.lh = new LinksHandler(this.app, "Consistent Attachments and Links: ", this.settings.ignoreFolders, this.settings.ignoreFilesRegex);
            this.fh = new FilesHandler(this.app, this.lh, "Consistent Attachments and Links: ", this.settings.ignoreFolders, this.settings.ignoreFilesRegex);
        });
    }
    isPathIgnored(path) {
        if (path.startsWith("./"))
            path = path.substring(2);
        for (let folder of this.settings.ignoreFolders) {
            if (path.startsWith(folder)) {
                return true;
            }
        }
        for (let fileRegex of this.settings.ignoreFilesRegex) {
            if (fileRegex.test(path)) {
                return true;
            }
        }
    }
    handleDeletedFile(file) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isPathIgnored(file.path))
                return;
            let fileExt = file.path.substring(file.path.lastIndexOf("."));
            if (fileExt == ".md") {
                if (this.settings.deleteAttachmentsWithNote) {
                    yield this.fh.deleteUnusedAttachmentsForCachedNote(file.path);
                }
                //delete child folders (do not delete parent)
                if (this.settings.deleteEmptyFolders) {
                    if (yield this.app.vault.adapter.exists(path.dirname(file.path))) {
                        let list = yield this.app.vault.adapter.list(path.dirname(file.path));
                        for (let folder of list.folders) {
                            yield this.fh.deleteEmptyFolders(folder);
                        }
                    }
                }
            }
        });
    }
    handleRenamedFile(file, oldPath) {
        return __awaiter(this, void 0, void 0, function* () {
            this.recentlyRenamedFiles.push({ oldPath: oldPath, newPath: file.path });
            clearTimeout(this.timerId);
            this.timerId = setTimeout(() => { this.HandleRecentlyRenamedFiles(); }, 3000);
        });
    }
    HandleRecentlyRenamedFiles() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.recentlyRenamedFiles || this.recentlyRenamedFiles.length == 0) //nothing to rename
                return;
            if (this.renamingIsActive) //already started
                return;
            this.renamingIsActive = true;
            this.currentlyRenamingFiles = this.recentlyRenamedFiles; //clear array for pushing new files async
            this.recentlyRenamedFiles = [];
            new obsidian.Notice("Fixing consistency for " + this.currentlyRenamingFiles.length + " renamed files" + "...");
            console.log("Consistent Attachments and Links:\nFixing consistency for " + this.currentlyRenamingFiles.length + " renamed files" + "...");
            try {
                for (let file of this.currentlyRenamingFiles) {
                    if (this.isPathIgnored(file.newPath) || this.isPathIgnored(file.oldPath))
                        return;
                    // await Utils.delay(10); //waiting for update vault
                    let result;
                    let fileExt = file.oldPath.substring(file.oldPath.lastIndexOf("."));
                    if (fileExt == ".md") {
                        // await Utils.delay(500);//waiting for update metadataCache
                        if ((path.dirname(file.oldPath) != path.dirname(file.newPath)) || (this.settings.attachmentsSubfolder.contains("${filename}"))) {
                            if (this.settings.moveAttachmentsWithNote) {
                                result = yield this.fh.moveCachedNoteAttachments(file.oldPath, file.newPath, this.settings.deleteExistFilesWhenMoveNote, this.settings.attachmentsSubfolder);
                                if (this.settings.updateLinks && result) {
                                    let changedFiles = result.renamedFiles.concat(result.movedAttachments);
                                    if (changedFiles.length > 0) {
                                        yield this.lh.updateChangedPathsInNote(file.newPath, changedFiles);
                                    }
                                }
                            }
                            if (this.settings.updateLinks) {
                                yield this.lh.updateInternalLinksInMovedNote(file.oldPath, file.newPath, this.settings.moveAttachmentsWithNote);
                            }
                            //delete child folders (do not delete parent)
                            if (this.settings.deleteEmptyFolders) {
                                if (yield this.app.vault.adapter.exists(path.dirname(file.oldPath))) {
                                    let list = yield this.app.vault.adapter.list(path.dirname(file.oldPath));
                                    for (let folder of list.folders) {
                                        yield this.fh.deleteEmptyFolders(folder);
                                    }
                                }
                            }
                        }
                    }
                    let updateAlts = this.settings.changeNoteBacklinksAlt && fileExt == ".md";
                    if (this.settings.updateLinks) {
                        yield this.lh.updateLinksToRenamedFile(file.oldPath, file.newPath, updateAlts, this.settings.useBuiltInObsidianLinkCaching);
                    }
                    if (result && result.movedAttachments && result.movedAttachments.length > 0) {
                        new obsidian.Notice("Moved " + result.movedAttachments.length + " attachment" + (result.movedAttachments.length > 1 ? "s" : ""));
                    }
                }
            }
            catch (e) {
                console.error("Consistent Attachments and Links: \n" + e);
            }
            new obsidian.Notice("Fixing Consistency Complete");
            console.log("Consistent Attachments and Links:\nFixing consistency complete");
            this.renamingIsActive = false;
            if (this.recentlyRenamedFiles && this.recentlyRenamedFiles.length > 0) {
                clearTimeout(this.timerId);
                this.timerId = setTimeout(() => { this.HandleRecentlyRenamedFiles(); }, 500);
            }
        });
    }
    collectAttachmentsCurrentNote(editor, view) {
        return __awaiter(this, void 0, void 0, function* () {
            let note = view.file;
            if (this.isPathIgnored(note.path)) {
                new obsidian.Notice("Note path is ignored");
                return;
            }
            let result = yield this.fh.collectAttachmentsForCachedNote(note.path, this.settings.attachmentsSubfolder, this.settings.deleteExistFilesWhenMoveNote);
            if (result && result.movedAttachments && result.movedAttachments.length > 0) {
                yield this.lh.updateChangedPathsInNote(note.path, result.movedAttachments);
            }
            if (result.movedAttachments.length == 0)
                new obsidian.Notice("No files found that need to be moved");
            else
                new obsidian.Notice("Moved " + result.movedAttachments.length + " attachment" + (result.movedAttachments.length > 1 ? "s" : ""));
        });
    }
    collectAllAttachments() {
        return __awaiter(this, void 0, void 0, function* () {
            let movedAttachmentsCount = 0;
            let processedNotesCount = 0;
            let notes = this.app.vault.getMarkdownFiles();
            if (notes) {
                for (let note of notes) {
                    if (this.isPathIgnored(note.path))
                        continue;
                    let result = yield this.fh.collectAttachmentsForCachedNote(note.path, this.settings.attachmentsSubfolder, this.settings.deleteExistFilesWhenMoveNote);
                    if (result && result.movedAttachments && result.movedAttachments.length > 0) {
                        yield this.lh.updateChangedPathsInNote(note.path, result.movedAttachments);
                        movedAttachmentsCount += result.movedAttachments.length;
                        processedNotesCount++;
                    }
                }
            }
            if (movedAttachmentsCount == 0)
                new obsidian.Notice("No files found that need to be moved");
            else
                new obsidian.Notice("Moved " + movedAttachmentsCount + " attachment" + (movedAttachmentsCount > 1 ? "s" : "")
                    + " from " + processedNotesCount + " note" + (processedNotesCount > 1 ? "s" : ""));
        });
    }
    convertAllEmbedsPathsToRelative() {
        return __awaiter(this, void 0, void 0, function* () {
            let changedEmbedCount = 0;
            let processedNotesCount = 0;
            let notes = this.app.vault.getMarkdownFiles();
            if (notes) {
                for (let note of notes) {
                    if (this.isPathIgnored(note.path))
                        continue;
                    let result = yield this.lh.convertAllNoteEmbedsPathsToRelative(note.path);
                    if (result && result.length > 0) {
                        changedEmbedCount += result.length;
                        processedNotesCount++;
                    }
                }
            }
            if (changedEmbedCount == 0)
                new obsidian.Notice("No embeds found that need to be converted");
            else
                new obsidian.Notice("Converted " + changedEmbedCount + " embed" + (changedEmbedCount > 1 ? "s" : "")
                    + " from " + processedNotesCount + " note" + (processedNotesCount > 1 ? "s" : ""));
        });
    }
    convertAllLinkPathsToRelative() {
        return __awaiter(this, void 0, void 0, function* () {
            let changedLinksCount = 0;
            let processedNotesCount = 0;
            let notes = this.app.vault.getMarkdownFiles();
            if (notes) {
                for (let note of notes) {
                    if (this.isPathIgnored(note.path))
                        continue;
                    let result = yield this.lh.convertAllNoteLinksPathsToRelative(note.path);
                    if (result && result.length > 0) {
                        changedLinksCount += result.length;
                        processedNotesCount++;
                    }
                }
            }
            if (changedLinksCount == 0)
                new obsidian.Notice("No links found that need to be converted");
            else
                new obsidian.Notice("Converted " + changedLinksCount + " link" + (changedLinksCount > 1 ? "s" : "")
                    + " from " + processedNotesCount + " note" + (processedNotesCount > 1 ? "s" : ""));
        });
    }
    replaceAllWikilinksWithMarkdownLinks() {
        return __awaiter(this, void 0, void 0, function* () {
            let changedLinksCount = 0;
            let processedNotesCount = 0;
            let notes = this.app.vault.getMarkdownFiles();
            if (notes) {
                for (let note of notes) {
                    if (this.isPathIgnored(note.path))
                        continue;
                    let result = yield this.lh.replaceAllNoteWikilinksWithMarkdownLinks(note.path);
                    if (result && (result.links.length > 0 || result.embeds.length > 0)) {
                        changedLinksCount += result.links.length;
                        changedLinksCount += result.embeds.length;
                        processedNotesCount++;
                    }
                }
            }
            if (changedLinksCount == 0)
                new obsidian.Notice("No wiki links found that need to be replaced");
            else
                new obsidian.Notice("Replaced " + changedLinksCount + " wikilink" + (changedLinksCount > 1 ? "s" : "")
                    + " from " + processedNotesCount + " note" + (processedNotesCount > 1 ? "s" : ""));
        });
    }
    deleteEmptyFolders() {
        this.fh.deleteEmptyFolders("/");
    }
    checkConsistency() {
        return __awaiter(this, void 0, void 0, function* () {
            let badLinks = yield this.lh.getAllBadLinks();
            let badSectionLinks = yield this.lh.getAllBadSectionLinks();
            let badEmbeds = yield this.lh.getAllBadEmbeds();
            let wikiLinks = yield this.lh.getAllWikiLinks();
            let wikiEmbeds = yield this.lh.getAllWikiEmbeds();
            let text = "";
            let badLinksCount = Object.keys(badLinks).length;
            let badEmbedsCount = Object.keys(badEmbeds).length;
            let badSectionLinksCount = Object.keys(badSectionLinks).length;
            let wikiLinksCount = Object.keys(wikiLinks).length;
            let wikiEmbedsCount = Object.keys(wikiEmbeds).length;
            if (badLinksCount > 0) {
                text += "# Bad links (" + badLinksCount + " files)\n";
                for (let note in badLinks) {
                    text += "[" + note + "](" + Utils.normalizePathForLink(note) + "): " + "\n";
                    for (let link of badLinks[note]) {
                        text += "- (line " + (link.position.start.line + 1) + "): `" + link.link + "`\n";
                    }
                    text += "\n\n";
                }
            }
            else {
                text += "# Bad links \n";
                text += "No problems found\n\n";
            }
            if (badSectionLinksCount > 0) {
                text += "\n\n# Bad note link sections (" + badSectionLinksCount + " files)\n";
                for (let note in badSectionLinks) {
                    text += "[" + note + "](" + Utils.normalizePathForLink(note) + "): " + "\n";
                    for (let link of badSectionLinks[note]) {
                        let li = this.lh.splitLinkToPathAndSection(link.link);
                        let section = Utils.normalizeLinkSection(li.section);
                        text += "- (line " + (link.position.start.line + 1) + "): `" + li.link + "#" + section + "`\n";
                    }
                    text += "\n\n";
                }
            }
            else {
                text += "\n\n# Bad note link sections\n";
                text += "No problems found\n\n";
            }
            if (badEmbedsCount > 0) {
                text += "\n\n# Bad embeds (" + badEmbedsCount + " files)\n";
                for (let note in badEmbeds) {
                    text += "[" + note + "](" + Utils.normalizePathForLink(note) + "): " + "\n";
                    for (let link of badEmbeds[note]) {
                        text += "- (line " + (link.position.start.line + 1) + "): `" + link.link + "`\n";
                    }
                    text += "\n\n";
                }
            }
            else {
                text += "\n\n# Bad embeds \n";
                text += "No problems found\n\n";
            }
            if (wikiLinksCount > 0) {
                text += "# Wiki links (" + wikiLinksCount + " files)\n";
                for (let note in wikiLinks) {
                    text += "[" + note + "](" + Utils.normalizePathForLink(note) + "): " + "\n";
                    for (let link of wikiLinks[note]) {
                        text += "- (line " + (link.position.start.line + 1) + "): `" + link.original + "`\n";
                    }
                    text += "\n\n";
                }
            }
            else {
                text += "# Wiki links \n";
                text += "No problems found\n\n";
            }
            if (wikiEmbedsCount > 0) {
                text += "\n\n# Wiki embeds (" + wikiEmbedsCount + " files)\n";
                for (let note in wikiEmbeds) {
                    text += "[" + note + "](" + Utils.normalizePathForLink(note) + "): " + "\n";
                    for (let link of wikiEmbeds[note]) {
                        text += "- (line " + (link.position.start.line + 1) + "): `" + link.original + "`\n";
                    }
                    text += "\n\n";
                }
            }
            else {
                text += "\n\n# Wiki embeds \n";
                text += "No problems found\n\n";
            }
            let notePath = this.settings.consistencyReportFile;
            yield this.app.vault.adapter.write(notePath, text);
            let fileOpened = false;
            this.app.workspace.iterateAllLeaves(leaf => {
                if (leaf.getDisplayText() != "" && notePath.startsWith(leaf.getDisplayText())) {
                    fileOpened = true;
                }
            });
            if (!fileOpened)
                this.app.workspace.openLinkText(notePath, "/", false);
        });
    }
    reorganizeVault() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.replaceAllWikilinksWithMarkdownLinks();
            yield this.convertAllEmbedsPathsToRelative();
            yield this.convertAllLinkPathsToRelative();
            //- Rename all attachments (using Unique attachments, optional)
            yield this.collectAllAttachments();
            yield this.deleteEmptyFolders();
            new obsidian.Notice("Reorganization of the vault completed");
        });
    }
    loadSettings() {
        return __awaiter(this, void 0, void 0, function* () {
            this.settings = Object.assign({}, DEFAULT_SETTINGS, yield this.loadData());
        });
    }
    saveSettings() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.saveData(this.settings);
            this.lh = new LinksHandler(this.app, "Consistent Attachments and Links: ", this.settings.ignoreFolders, this.settings.ignoreFilesRegex);
            this.fh = new FilesHandler(this.app, this.lh, "Consistent Attachments and Links: ", this.settings.ignoreFolders, this.settings.ignoreFilesRegex);
        });
    }
}

module.exports = ConsistentAttachmentsAndLinks;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXMiOlsibm9kZV9tb2R1bGVzL3RzbGliL3RzbGliLmVzNi5qcyIsInNyYy9zZXR0aW5ncy50cyIsInNyYy91dGlscy50cyIsInNyYy9wYXRoLnRzIiwic3JjL2xpbmtzLWhhbmRsZXIudHMiLCJzcmMvZmlsZXMtaGFuZGxlci50cyIsInNyYy9tYWluLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qISAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG5Db3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi5cclxuXHJcblBlcm1pc3Npb24gdG8gdXNlLCBjb3B5LCBtb2RpZnksIGFuZC9vciBkaXN0cmlidXRlIHRoaXMgc29mdHdhcmUgZm9yIGFueVxyXG5wdXJwb3NlIHdpdGggb3Igd2l0aG91dCBmZWUgaXMgaGVyZWJ5IGdyYW50ZWQuXHJcblxyXG5USEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiIEFORCBUSEUgQVVUSE9SIERJU0NMQUlNUyBBTEwgV0FSUkFOVElFUyBXSVRIXHJcblJFR0FSRCBUTyBUSElTIFNPRlRXQVJFIElOQ0xVRElORyBBTEwgSU1QTElFRCBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWVxyXG5BTkQgRklUTkVTUy4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUiBCRSBMSUFCTEUgRk9SIEFOWSBTUEVDSUFMLCBESVJFQ1QsXHJcbklORElSRUNULCBPUiBDT05TRVFVRU5USUFMIERBTUFHRVMgT1IgQU5ZIERBTUFHRVMgV0hBVFNPRVZFUiBSRVNVTFRJTkcgRlJPTVxyXG5MT1NTIE9GIFVTRSwgREFUQSBPUiBQUk9GSVRTLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgTkVHTElHRU5DRSBPUlxyXG5PVEhFUiBUT1JUSU9VUyBBQ1RJT04sIEFSSVNJTkcgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgVVNFIE9SXHJcblBFUkZPUk1BTkNFIE9GIFRISVMgU09GVFdBUkUuXHJcbioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqICovXHJcbi8qIGdsb2JhbCBSZWZsZWN0LCBQcm9taXNlICovXHJcblxyXG52YXIgZXh0ZW5kU3RhdGljcyA9IGZ1bmN0aW9uKGQsIGIpIHtcclxuICAgIGV4dGVuZFN0YXRpY3MgPSBPYmplY3Quc2V0UHJvdG90eXBlT2YgfHxcclxuICAgICAgICAoeyBfX3Byb3RvX186IFtdIH0gaW5zdGFuY2VvZiBBcnJheSAmJiBmdW5jdGlvbiAoZCwgYikgeyBkLl9fcHJvdG9fXyA9IGI7IH0pIHx8XHJcbiAgICAgICAgZnVuY3Rpb24gKGQsIGIpIHsgZm9yICh2YXIgcCBpbiBiKSBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGIsIHApKSBkW3BdID0gYltwXTsgfTtcclxuICAgIHJldHVybiBleHRlbmRTdGF0aWNzKGQsIGIpO1xyXG59O1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fZXh0ZW5kcyhkLCBiKSB7XHJcbiAgICBpZiAodHlwZW9mIGIgIT09IFwiZnVuY3Rpb25cIiAmJiBiICE9PSBudWxsKVxyXG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJDbGFzcyBleHRlbmRzIHZhbHVlIFwiICsgU3RyaW5nKGIpICsgXCIgaXMgbm90IGEgY29uc3RydWN0b3Igb3IgbnVsbFwiKTtcclxuICAgIGV4dGVuZFN0YXRpY3MoZCwgYik7XHJcbiAgICBmdW5jdGlvbiBfXygpIHsgdGhpcy5jb25zdHJ1Y3RvciA9IGQ7IH1cclxuICAgIGQucHJvdG90eXBlID0gYiA9PT0gbnVsbCA/IE9iamVjdC5jcmVhdGUoYikgOiAoX18ucHJvdG90eXBlID0gYi5wcm90b3R5cGUsIG5ldyBfXygpKTtcclxufVxyXG5cclxuZXhwb3J0IHZhciBfX2Fzc2lnbiA9IGZ1bmN0aW9uKCkge1xyXG4gICAgX19hc3NpZ24gPSBPYmplY3QuYXNzaWduIHx8IGZ1bmN0aW9uIF9fYXNzaWduKHQpIHtcclxuICAgICAgICBmb3IgKHZhciBzLCBpID0gMSwgbiA9IGFyZ3VtZW50cy5sZW5ndGg7IGkgPCBuOyBpKyspIHtcclxuICAgICAgICAgICAgcyA9IGFyZ3VtZW50c1tpXTtcclxuICAgICAgICAgICAgZm9yICh2YXIgcCBpbiBzKSBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHMsIHApKSB0W3BdID0gc1twXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHQ7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gX19hc3NpZ24uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fcmVzdChzLCBlKSB7XHJcbiAgICB2YXIgdCA9IHt9O1xyXG4gICAgZm9yICh2YXIgcCBpbiBzKSBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHMsIHApICYmIGUuaW5kZXhPZihwKSA8IDApXHJcbiAgICAgICAgdFtwXSA9IHNbcF07XHJcbiAgICBpZiAocyAhPSBudWxsICYmIHR5cGVvZiBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzID09PSBcImZ1bmN0aW9uXCIpXHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIHAgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKHMpOyBpIDwgcC5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBpZiAoZS5pbmRleE9mKHBbaV0pIDwgMCAmJiBPYmplY3QucHJvdG90eXBlLnByb3BlcnR5SXNFbnVtZXJhYmxlLmNhbGwocywgcFtpXSkpXHJcbiAgICAgICAgICAgICAgICB0W3BbaV1dID0gc1twW2ldXTtcclxuICAgICAgICB9XHJcbiAgICByZXR1cm4gdDtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fZGVjb3JhdGUoZGVjb3JhdG9ycywgdGFyZ2V0LCBrZXksIGRlc2MpIHtcclxuICAgIHZhciBjID0gYXJndW1lbnRzLmxlbmd0aCwgciA9IGMgPCAzID8gdGFyZ2V0IDogZGVzYyA9PT0gbnVsbCA/IGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHRhcmdldCwga2V5KSA6IGRlc2MsIGQ7XHJcbiAgICBpZiAodHlwZW9mIFJlZmxlY3QgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIFJlZmxlY3QuZGVjb3JhdGUgPT09IFwiZnVuY3Rpb25cIikgciA9IFJlZmxlY3QuZGVjb3JhdGUoZGVjb3JhdG9ycywgdGFyZ2V0LCBrZXksIGRlc2MpO1xyXG4gICAgZWxzZSBmb3IgKHZhciBpID0gZGVjb3JhdG9ycy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkgaWYgKGQgPSBkZWNvcmF0b3JzW2ldKSByID0gKGMgPCAzID8gZChyKSA6IGMgPiAzID8gZCh0YXJnZXQsIGtleSwgcikgOiBkKHRhcmdldCwga2V5KSkgfHwgcjtcclxuICAgIHJldHVybiBjID4gMyAmJiByICYmIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGtleSwgciksIHI7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX3BhcmFtKHBhcmFtSW5kZXgsIGRlY29yYXRvcikge1xyXG4gICAgcmV0dXJuIGZ1bmN0aW9uICh0YXJnZXQsIGtleSkgeyBkZWNvcmF0b3IodGFyZ2V0LCBrZXksIHBhcmFtSW5kZXgpOyB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX21ldGFkYXRhKG1ldGFkYXRhS2V5LCBtZXRhZGF0YVZhbHVlKSB7XHJcbiAgICBpZiAodHlwZW9mIFJlZmxlY3QgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIFJlZmxlY3QubWV0YWRhdGEgPT09IFwiZnVuY3Rpb25cIikgcmV0dXJuIFJlZmxlY3QubWV0YWRhdGEobWV0YWRhdGFLZXksIG1ldGFkYXRhVmFsdWUpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19hd2FpdGVyKHRoaXNBcmcsIF9hcmd1bWVudHMsIFAsIGdlbmVyYXRvcikge1xyXG4gICAgZnVuY3Rpb24gYWRvcHQodmFsdWUpIHsgcmV0dXJuIHZhbHVlIGluc3RhbmNlb2YgUCA/IHZhbHVlIDogbmV3IFAoZnVuY3Rpb24gKHJlc29sdmUpIHsgcmVzb2x2ZSh2YWx1ZSk7IH0pOyB9XHJcbiAgICByZXR1cm4gbmV3IChQIHx8IChQID0gUHJvbWlzZSkpKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcclxuICAgICAgICBmdW5jdGlvbiBmdWxmaWxsZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3IubmV4dCh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XHJcbiAgICAgICAgZnVuY3Rpb24gcmVqZWN0ZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3JbXCJ0aHJvd1wiXSh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XHJcbiAgICAgICAgZnVuY3Rpb24gc3RlcChyZXN1bHQpIHsgcmVzdWx0LmRvbmUgPyByZXNvbHZlKHJlc3VsdC52YWx1ZSkgOiBhZG9wdChyZXN1bHQudmFsdWUpLnRoZW4oZnVsZmlsbGVkLCByZWplY3RlZCk7IH1cclxuICAgICAgICBzdGVwKChnZW5lcmF0b3IgPSBnZW5lcmF0b3IuYXBwbHkodGhpc0FyZywgX2FyZ3VtZW50cyB8fCBbXSkpLm5leHQoKSk7XHJcbiAgICB9KTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fZ2VuZXJhdG9yKHRoaXNBcmcsIGJvZHkpIHtcclxuICAgIHZhciBfID0geyBsYWJlbDogMCwgc2VudDogZnVuY3Rpb24oKSB7IGlmICh0WzBdICYgMSkgdGhyb3cgdFsxXTsgcmV0dXJuIHRbMV07IH0sIHRyeXM6IFtdLCBvcHM6IFtdIH0sIGYsIHksIHQsIGc7XHJcbiAgICByZXR1cm4gZyA9IHsgbmV4dDogdmVyYigwKSwgXCJ0aHJvd1wiOiB2ZXJiKDEpLCBcInJldHVyblwiOiB2ZXJiKDIpIH0sIHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiAoZ1tTeW1ib2wuaXRlcmF0b3JdID0gZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzOyB9KSwgZztcclxuICAgIGZ1bmN0aW9uIHZlcmIobikgeyByZXR1cm4gZnVuY3Rpb24gKHYpIHsgcmV0dXJuIHN0ZXAoW24sIHZdKTsgfTsgfVxyXG4gICAgZnVuY3Rpb24gc3RlcChvcCkge1xyXG4gICAgICAgIGlmIChmKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiR2VuZXJhdG9yIGlzIGFscmVhZHkgZXhlY3V0aW5nLlwiKTtcclxuICAgICAgICB3aGlsZSAoXykgdHJ5IHtcclxuICAgICAgICAgICAgaWYgKGYgPSAxLCB5ICYmICh0ID0gb3BbMF0gJiAyID8geVtcInJldHVyblwiXSA6IG9wWzBdID8geVtcInRocm93XCJdIHx8ICgodCA9IHlbXCJyZXR1cm5cIl0pICYmIHQuY2FsbCh5KSwgMCkgOiB5Lm5leHQpICYmICEodCA9IHQuY2FsbCh5LCBvcFsxXSkpLmRvbmUpIHJldHVybiB0O1xyXG4gICAgICAgICAgICBpZiAoeSA9IDAsIHQpIG9wID0gW29wWzBdICYgMiwgdC52YWx1ZV07XHJcbiAgICAgICAgICAgIHN3aXRjaCAob3BbMF0pIHtcclxuICAgICAgICAgICAgICAgIGNhc2UgMDogY2FzZSAxOiB0ID0gb3A7IGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSA0OiBfLmxhYmVsKys7IHJldHVybiB7IHZhbHVlOiBvcFsxXSwgZG9uZTogZmFsc2UgfTtcclxuICAgICAgICAgICAgICAgIGNhc2UgNTogXy5sYWJlbCsrOyB5ID0gb3BbMV07IG9wID0gWzBdOyBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgIGNhc2UgNzogb3AgPSBfLm9wcy5wb3AoKTsgXy50cnlzLnBvcCgpOyBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCEodCA9IF8udHJ5cywgdCA9IHQubGVuZ3RoID4gMCAmJiB0W3QubGVuZ3RoIC0gMV0pICYmIChvcFswXSA9PT0gNiB8fCBvcFswXSA9PT0gMikpIHsgXyA9IDA7IGNvbnRpbnVlOyB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG9wWzBdID09PSAzICYmICghdCB8fCAob3BbMV0gPiB0WzBdICYmIG9wWzFdIDwgdFszXSkpKSB7IF8ubGFiZWwgPSBvcFsxXTsgYnJlYWs7IH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAob3BbMF0gPT09IDYgJiYgXy5sYWJlbCA8IHRbMV0pIHsgXy5sYWJlbCA9IHRbMV07IHQgPSBvcDsgYnJlYWs7IH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAodCAmJiBfLmxhYmVsIDwgdFsyXSkgeyBfLmxhYmVsID0gdFsyXTsgXy5vcHMucHVzaChvcCk7IGJyZWFrOyB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRbMl0pIF8ub3BzLnBvcCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIF8udHJ5cy5wb3AoKTsgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgb3AgPSBib2R5LmNhbGwodGhpc0FyZywgXyk7XHJcbiAgICAgICAgfSBjYXRjaCAoZSkgeyBvcCA9IFs2LCBlXTsgeSA9IDA7IH0gZmluYWxseSB7IGYgPSB0ID0gMDsgfVxyXG4gICAgICAgIGlmIChvcFswXSAmIDUpIHRocm93IG9wWzFdOyByZXR1cm4geyB2YWx1ZTogb3BbMF0gPyBvcFsxXSA6IHZvaWQgMCwgZG9uZTogdHJ1ZSB9O1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgdmFyIF9fY3JlYXRlQmluZGluZyA9IE9iamVjdC5jcmVhdGUgPyAoZnVuY3Rpb24obywgbSwgaywgazIpIHtcclxuICAgIGlmIChrMiA9PT0gdW5kZWZpbmVkKSBrMiA9IGs7XHJcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkobywgazIsIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBmdW5jdGlvbigpIHsgcmV0dXJuIG1ba107IH0gfSk7XHJcbn0pIDogKGZ1bmN0aW9uKG8sIG0sIGssIGsyKSB7XHJcbiAgICBpZiAoazIgPT09IHVuZGVmaW5lZCkgazIgPSBrO1xyXG4gICAgb1trMl0gPSBtW2tdO1xyXG59KTtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2V4cG9ydFN0YXIobSwgbykge1xyXG4gICAgZm9yICh2YXIgcCBpbiBtKSBpZiAocCAhPT0gXCJkZWZhdWx0XCIgJiYgIU9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvLCBwKSkgX19jcmVhdGVCaW5kaW5nKG8sIG0sIHApO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX192YWx1ZXMobykge1xyXG4gICAgdmFyIHMgPSB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgU3ltYm9sLml0ZXJhdG9yLCBtID0gcyAmJiBvW3NdLCBpID0gMDtcclxuICAgIGlmIChtKSByZXR1cm4gbS5jYWxsKG8pO1xyXG4gICAgaWYgKG8gJiYgdHlwZW9mIG8ubGVuZ3RoID09PSBcIm51bWJlclwiKSByZXR1cm4ge1xyXG4gICAgICAgIG5leHQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgaWYgKG8gJiYgaSA+PSBvLmxlbmd0aCkgbyA9IHZvaWQgMDtcclxuICAgICAgICAgICAgcmV0dXJuIHsgdmFsdWU6IG8gJiYgb1tpKytdLCBkb25lOiAhbyB9O1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKHMgPyBcIk9iamVjdCBpcyBub3QgaXRlcmFibGUuXCIgOiBcIlN5bWJvbC5pdGVyYXRvciBpcyBub3QgZGVmaW5lZC5cIik7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX3JlYWQobywgbikge1xyXG4gICAgdmFyIG0gPSB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgb1tTeW1ib2wuaXRlcmF0b3JdO1xyXG4gICAgaWYgKCFtKSByZXR1cm4gbztcclxuICAgIHZhciBpID0gbS5jYWxsKG8pLCByLCBhciA9IFtdLCBlO1xyXG4gICAgdHJ5IHtcclxuICAgICAgICB3aGlsZSAoKG4gPT09IHZvaWQgMCB8fCBuLS0gPiAwKSAmJiAhKHIgPSBpLm5leHQoKSkuZG9uZSkgYXIucHVzaChyLnZhbHVlKTtcclxuICAgIH1cclxuICAgIGNhdGNoIChlcnJvcikgeyBlID0geyBlcnJvcjogZXJyb3IgfTsgfVxyXG4gICAgZmluYWxseSB7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgaWYgKHIgJiYgIXIuZG9uZSAmJiAobSA9IGlbXCJyZXR1cm5cIl0pKSBtLmNhbGwoaSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZpbmFsbHkgeyBpZiAoZSkgdGhyb3cgZS5lcnJvcjsgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIGFyO1xyXG59XHJcblxyXG4vKiogQGRlcHJlY2F0ZWQgKi9cclxuZXhwb3J0IGZ1bmN0aW9uIF9fc3ByZWFkKCkge1xyXG4gICAgZm9yICh2YXIgYXIgPSBbXSwgaSA9IDA7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspXHJcbiAgICAgICAgYXIgPSBhci5jb25jYXQoX19yZWFkKGFyZ3VtZW50c1tpXSkpO1xyXG4gICAgcmV0dXJuIGFyO1xyXG59XHJcblxyXG4vKiogQGRlcHJlY2F0ZWQgKi9cclxuZXhwb3J0IGZ1bmN0aW9uIF9fc3ByZWFkQXJyYXlzKCkge1xyXG4gICAgZm9yICh2YXIgcyA9IDAsIGkgPSAwLCBpbCA9IGFyZ3VtZW50cy5sZW5ndGg7IGkgPCBpbDsgaSsrKSBzICs9IGFyZ3VtZW50c1tpXS5sZW5ndGg7XHJcbiAgICBmb3IgKHZhciByID0gQXJyYXkocyksIGsgPSAwLCBpID0gMDsgaSA8IGlsOyBpKyspXHJcbiAgICAgICAgZm9yICh2YXIgYSA9IGFyZ3VtZW50c1tpXSwgaiA9IDAsIGpsID0gYS5sZW5ndGg7IGogPCBqbDsgaisrLCBrKyspXHJcbiAgICAgICAgICAgIHJba10gPSBhW2pdO1xyXG4gICAgcmV0dXJuIHI7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX3NwcmVhZEFycmF5KHRvLCBmcm9tLCBwYWNrKSB7XHJcbiAgICBpZiAocGFjayB8fCBhcmd1bWVudHMubGVuZ3RoID09PSAyKSBmb3IgKHZhciBpID0gMCwgbCA9IGZyb20ubGVuZ3RoLCBhcjsgaSA8IGw7IGkrKykge1xyXG4gICAgICAgIGlmIChhciB8fCAhKGkgaW4gZnJvbSkpIHtcclxuICAgICAgICAgICAgaWYgKCFhcikgYXIgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChmcm9tLCAwLCBpKTtcclxuICAgICAgICAgICAgYXJbaV0gPSBmcm9tW2ldO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiB0by5jb25jYXQoYXIgfHwgQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoZnJvbSkpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19hd2FpdCh2KSB7XHJcbiAgICByZXR1cm4gdGhpcyBpbnN0YW5jZW9mIF9fYXdhaXQgPyAodGhpcy52ID0gdiwgdGhpcykgOiBuZXcgX19hd2FpdCh2KTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fYXN5bmNHZW5lcmF0b3IodGhpc0FyZywgX2FyZ3VtZW50cywgZ2VuZXJhdG9yKSB7XHJcbiAgICBpZiAoIVN5bWJvbC5hc3luY0l0ZXJhdG9yKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiU3ltYm9sLmFzeW5jSXRlcmF0b3IgaXMgbm90IGRlZmluZWQuXCIpO1xyXG4gICAgdmFyIGcgPSBnZW5lcmF0b3IuYXBwbHkodGhpc0FyZywgX2FyZ3VtZW50cyB8fCBbXSksIGksIHEgPSBbXTtcclxuICAgIHJldHVybiBpID0ge30sIHZlcmIoXCJuZXh0XCIpLCB2ZXJiKFwidGhyb3dcIiksIHZlcmIoXCJyZXR1cm5cIiksIGlbU3ltYm9sLmFzeW5jSXRlcmF0b3JdID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpczsgfSwgaTtcclxuICAgIGZ1bmN0aW9uIHZlcmIobikgeyBpZiAoZ1tuXSkgaVtuXSA9IGZ1bmN0aW9uICh2KSB7IHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAoYSwgYikgeyBxLnB1c2goW24sIHYsIGEsIGJdKSA+IDEgfHwgcmVzdW1lKG4sIHYpOyB9KTsgfTsgfVxyXG4gICAgZnVuY3Rpb24gcmVzdW1lKG4sIHYpIHsgdHJ5IHsgc3RlcChnW25dKHYpKTsgfSBjYXRjaCAoZSkgeyBzZXR0bGUocVswXVszXSwgZSk7IH0gfVxyXG4gICAgZnVuY3Rpb24gc3RlcChyKSB7IHIudmFsdWUgaW5zdGFuY2VvZiBfX2F3YWl0ID8gUHJvbWlzZS5yZXNvbHZlKHIudmFsdWUudikudGhlbihmdWxmaWxsLCByZWplY3QpIDogc2V0dGxlKHFbMF1bMl0sIHIpOyB9XHJcbiAgICBmdW5jdGlvbiBmdWxmaWxsKHZhbHVlKSB7IHJlc3VtZShcIm5leHRcIiwgdmFsdWUpOyB9XHJcbiAgICBmdW5jdGlvbiByZWplY3QodmFsdWUpIHsgcmVzdW1lKFwidGhyb3dcIiwgdmFsdWUpOyB9XHJcbiAgICBmdW5jdGlvbiBzZXR0bGUoZiwgdikgeyBpZiAoZih2KSwgcS5zaGlmdCgpLCBxLmxlbmd0aCkgcmVzdW1lKHFbMF1bMF0sIHFbMF1bMV0pOyB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2FzeW5jRGVsZWdhdG9yKG8pIHtcclxuICAgIHZhciBpLCBwO1xyXG4gICAgcmV0dXJuIGkgPSB7fSwgdmVyYihcIm5leHRcIiksIHZlcmIoXCJ0aHJvd1wiLCBmdW5jdGlvbiAoZSkgeyB0aHJvdyBlOyB9KSwgdmVyYihcInJldHVyblwiKSwgaVtTeW1ib2wuaXRlcmF0b3JdID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpczsgfSwgaTtcclxuICAgIGZ1bmN0aW9uIHZlcmIobiwgZikgeyBpW25dID0gb1tuXSA/IGZ1bmN0aW9uICh2KSB7IHJldHVybiAocCA9ICFwKSA/IHsgdmFsdWU6IF9fYXdhaXQob1tuXSh2KSksIGRvbmU6IG4gPT09IFwicmV0dXJuXCIgfSA6IGYgPyBmKHYpIDogdjsgfSA6IGY7IH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fYXN5bmNWYWx1ZXMobykge1xyXG4gICAgaWYgKCFTeW1ib2wuYXN5bmNJdGVyYXRvcikgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlN5bWJvbC5hc3luY0l0ZXJhdG9yIGlzIG5vdCBkZWZpbmVkLlwiKTtcclxuICAgIHZhciBtID0gb1tTeW1ib2wuYXN5bmNJdGVyYXRvcl0sIGk7XHJcbiAgICByZXR1cm4gbSA/IG0uY2FsbChvKSA6IChvID0gdHlwZW9mIF9fdmFsdWVzID09PSBcImZ1bmN0aW9uXCIgPyBfX3ZhbHVlcyhvKSA6IG9bU3ltYm9sLml0ZXJhdG9yXSgpLCBpID0ge30sIHZlcmIoXCJuZXh0XCIpLCB2ZXJiKFwidGhyb3dcIiksIHZlcmIoXCJyZXR1cm5cIiksIGlbU3ltYm9sLmFzeW5jSXRlcmF0b3JdID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpczsgfSwgaSk7XHJcbiAgICBmdW5jdGlvbiB2ZXJiKG4pIHsgaVtuXSA9IG9bbl0gJiYgZnVuY3Rpb24gKHYpIHsgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHsgdiA9IG9bbl0odiksIHNldHRsZShyZXNvbHZlLCByZWplY3QsIHYuZG9uZSwgdi52YWx1ZSk7IH0pOyB9OyB9XHJcbiAgICBmdW5jdGlvbiBzZXR0bGUocmVzb2x2ZSwgcmVqZWN0LCBkLCB2KSB7IFByb21pc2UucmVzb2x2ZSh2KS50aGVuKGZ1bmN0aW9uKHYpIHsgcmVzb2x2ZSh7IHZhbHVlOiB2LCBkb25lOiBkIH0pOyB9LCByZWplY3QpOyB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX21ha2VUZW1wbGF0ZU9iamVjdChjb29rZWQsIHJhdykge1xyXG4gICAgaWYgKE9iamVjdC5kZWZpbmVQcm9wZXJ0eSkgeyBPYmplY3QuZGVmaW5lUHJvcGVydHkoY29va2VkLCBcInJhd1wiLCB7IHZhbHVlOiByYXcgfSk7IH0gZWxzZSB7IGNvb2tlZC5yYXcgPSByYXc7IH1cclxuICAgIHJldHVybiBjb29rZWQ7XHJcbn07XHJcblxyXG52YXIgX19zZXRNb2R1bGVEZWZhdWx0ID0gT2JqZWN0LmNyZWF0ZSA/IChmdW5jdGlvbihvLCB2KSB7XHJcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkobywgXCJkZWZhdWx0XCIsIHsgZW51bWVyYWJsZTogdHJ1ZSwgdmFsdWU6IHYgfSk7XHJcbn0pIDogZnVuY3Rpb24obywgdikge1xyXG4gICAgb1tcImRlZmF1bHRcIl0gPSB2O1xyXG59O1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9faW1wb3J0U3Rhcihtb2QpIHtcclxuICAgIGlmIChtb2QgJiYgbW9kLl9fZXNNb2R1bGUpIHJldHVybiBtb2Q7XHJcbiAgICB2YXIgcmVzdWx0ID0ge307XHJcbiAgICBpZiAobW9kICE9IG51bGwpIGZvciAodmFyIGsgaW4gbW9kKSBpZiAoayAhPT0gXCJkZWZhdWx0XCIgJiYgT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG1vZCwgaykpIF9fY3JlYXRlQmluZGluZyhyZXN1bHQsIG1vZCwgayk7XHJcbiAgICBfX3NldE1vZHVsZURlZmF1bHQocmVzdWx0LCBtb2QpO1xyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9faW1wb3J0RGVmYXVsdChtb2QpIHtcclxuICAgIHJldHVybiAobW9kICYmIG1vZC5fX2VzTW9kdWxlKSA/IG1vZCA6IHsgZGVmYXVsdDogbW9kIH07XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2NsYXNzUHJpdmF0ZUZpZWxkR2V0KHJlY2VpdmVyLCBzdGF0ZSwga2luZCwgZikge1xyXG4gICAgaWYgKGtpbmQgPT09IFwiYVwiICYmICFmKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiUHJpdmF0ZSBhY2Nlc3NvciB3YXMgZGVmaW5lZCB3aXRob3V0IGEgZ2V0dGVyXCIpO1xyXG4gICAgaWYgKHR5cGVvZiBzdGF0ZSA9PT0gXCJmdW5jdGlvblwiID8gcmVjZWl2ZXIgIT09IHN0YXRlIHx8ICFmIDogIXN0YXRlLmhhcyhyZWNlaXZlcikpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgcmVhZCBwcml2YXRlIG1lbWJlciBmcm9tIGFuIG9iamVjdCB3aG9zZSBjbGFzcyBkaWQgbm90IGRlY2xhcmUgaXRcIik7XHJcbiAgICByZXR1cm4ga2luZCA9PT0gXCJtXCIgPyBmIDoga2luZCA9PT0gXCJhXCIgPyBmLmNhbGwocmVjZWl2ZXIpIDogZiA/IGYudmFsdWUgOiBzdGF0ZS5nZXQocmVjZWl2ZXIpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19jbGFzc1ByaXZhdGVGaWVsZFNldChyZWNlaXZlciwgc3RhdGUsIHZhbHVlLCBraW5kLCBmKSB7XHJcbiAgICBpZiAoa2luZCA9PT0gXCJtXCIpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJQcml2YXRlIG1ldGhvZCBpcyBub3Qgd3JpdGFibGVcIik7XHJcbiAgICBpZiAoa2luZCA9PT0gXCJhXCIgJiYgIWYpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJQcml2YXRlIGFjY2Vzc29yIHdhcyBkZWZpbmVkIHdpdGhvdXQgYSBzZXR0ZXJcIik7XHJcbiAgICBpZiAodHlwZW9mIHN0YXRlID09PSBcImZ1bmN0aW9uXCIgPyByZWNlaXZlciAhPT0gc3RhdGUgfHwgIWYgOiAhc3RhdGUuaGFzKHJlY2VpdmVyKSkgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCB3cml0ZSBwcml2YXRlIG1lbWJlciB0byBhbiBvYmplY3Qgd2hvc2UgY2xhc3MgZGlkIG5vdCBkZWNsYXJlIGl0XCIpO1xyXG4gICAgcmV0dXJuIChraW5kID09PSBcImFcIiA/IGYuY2FsbChyZWNlaXZlciwgdmFsdWUpIDogZiA/IGYudmFsdWUgPSB2YWx1ZSA6IHN0YXRlLnNldChyZWNlaXZlciwgdmFsdWUpKSwgdmFsdWU7XHJcbn1cclxuIiwiaW1wb3J0IHsgQXBwLCBub3JtYWxpemVQYXRoLCBQbHVnaW5TZXR0aW5nVGFiLCBTZXR0aW5nLCB9IGZyb20gJ29ic2lkaWFuJztcclxuaW1wb3J0IENvbnNpc3RlbnRBdHRhY2htZW50c0FuZExpbmtzIGZyb20gJy4vbWFpbic7XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIFBsdWdpblNldHRpbmdzIHtcclxuICAgIG1vdmVBdHRhY2htZW50c1dpdGhOb3RlOiBib29sZWFuO1xyXG4gICAgZGVsZXRlQXR0YWNobWVudHNXaXRoTm90ZTogYm9vbGVhbjtcclxuICAgIHVwZGF0ZUxpbmtzOiBib29sZWFuO1xyXG4gICAgZGVsZXRlRW1wdHlGb2xkZXJzOiBib29sZWFuO1xyXG4gICAgZGVsZXRlRXhpc3RGaWxlc1doZW5Nb3ZlTm90ZTogYm9vbGVhbjtcclxuICAgIGNoYW5nZU5vdGVCYWNrbGlua3NBbHQ6IGJvb2xlYW47XHJcbiAgICBpZ25vcmVGb2xkZXJzOiBzdHJpbmdbXTtcclxuICAgIGlnbm9yZUZpbGVzOiBzdHJpbmdbXTtcclxuICAgIGlnbm9yZUZpbGVzUmVnZXg6IFJlZ0V4cFtdO1xyXG4gICAgYXR0YWNobWVudHNTdWJmb2xkZXI6IHN0cmluZztcclxuICAgIGNvbnNpc3RlbmN5UmVwb3J0RmlsZTogc3RyaW5nO1xyXG4gICAgdXNlQnVpbHRJbk9ic2lkaWFuTGlua0NhY2hpbmc6IGJvb2xlYW47XHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBERUZBVUxUX1NFVFRJTkdTOiBQbHVnaW5TZXR0aW5ncyA9IHtcclxuICAgIG1vdmVBdHRhY2htZW50c1dpdGhOb3RlOiB0cnVlLFxyXG4gICAgZGVsZXRlQXR0YWNobWVudHNXaXRoTm90ZTogdHJ1ZSxcclxuICAgIHVwZGF0ZUxpbmtzOiB0cnVlLFxyXG4gICAgZGVsZXRlRW1wdHlGb2xkZXJzOiB0cnVlLFxyXG4gICAgZGVsZXRlRXhpc3RGaWxlc1doZW5Nb3ZlTm90ZTogdHJ1ZSxcclxuICAgIGNoYW5nZU5vdGVCYWNrbGlua3NBbHQ6IGZhbHNlLFxyXG4gICAgaWdub3JlRm9sZGVyczogW1wiLmdpdC9cIiwgXCIub2JzaWRpYW4vXCJdLFxyXG4gICAgaWdub3JlRmlsZXM6IFtcImNvbnNpc3RlbmN5XFxcXC1yZXBvcnRcXFxcLm1kXCJdLFxyXG4gICAgaWdub3JlRmlsZXNSZWdleDogWy9jb25zaXN0ZW5jeVxcLXJlcG9ydFxcLm1kL10sXHJcbiAgICBhdHRhY2htZW50c1N1YmZvbGRlcjogXCJcIixcclxuICAgIGNvbnNpc3RlbmN5UmVwb3J0RmlsZTogXCJjb25zaXN0ZW5jeS1yZXBvcnQubWRcIixcclxuICAgIHVzZUJ1aWx0SW5PYnNpZGlhbkxpbmtDYWNoaW5nOiBmYWxzZSxcclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIFNldHRpbmdUYWIgZXh0ZW5kcyBQbHVnaW5TZXR0aW5nVGFiIHtcclxuICAgIHBsdWdpbjogQ29uc2lzdGVudEF0dGFjaG1lbnRzQW5kTGlua3M7XHJcblxyXG4gICAgY29uc3RydWN0b3IoYXBwOiBBcHAsIHBsdWdpbjogQ29uc2lzdGVudEF0dGFjaG1lbnRzQW5kTGlua3MpIHtcclxuICAgICAgICBzdXBlcihhcHAsIHBsdWdpbik7XHJcbiAgICAgICAgdGhpcy5wbHVnaW4gPSBwbHVnaW47XHJcbiAgICB9XHJcblxyXG4gICAgZGlzcGxheSgpOiB2b2lkIHtcclxuICAgICAgICBsZXQgeyBjb250YWluZXJFbCB9ID0gdGhpcztcclxuXHJcbiAgICAgICAgY29udGFpbmVyRWwuZW1wdHkoKTtcclxuXHJcbiAgICAgICAgY29udGFpbmVyRWwuY3JlYXRlRWwoJ2gyJywgeyB0ZXh0OiAnQ29uc2lzdGVudCBhdHRhY2htZW50cyBhbmQgbGlua3MgLSBTZXR0aW5ncycgfSk7XHJcblxyXG5cclxuICAgICAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcclxuICAgICAgICAgICAgLnNldE5hbWUoJ01vdmUgQXR0YWNobWVudHMgd2l0aCBOb3RlJylcclxuICAgICAgICAgICAgLnNldERlc2MoJ0F1dG9tYXRpY2FsbHkgbW92ZSBhdHRhY2htZW50cyB3aGVuIGEgbm90ZSBpcyByZWxvY2F0ZWQuIFRoaXMgaW5jbHVkZXMgYXR0YWNobWVudHMgbG9jYXRlZCBpbiB0aGUgc2FtZSBmb2xkZXIgb3IgYW55IG9mIGl0cyBzdWJmb2xkZXJzLicpXHJcbiAgICAgICAgICAgIC5hZGRUb2dnbGUoY2IgPT4gY2Iub25DaGFuZ2UodmFsdWUgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MubW92ZUF0dGFjaG1lbnRzV2l0aE5vdGUgPSB2YWx1ZTtcclxuICAgICAgICAgICAgICAgIHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICkuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3MubW92ZUF0dGFjaG1lbnRzV2l0aE5vdGUpKTtcclxuXHJcblxyXG4gICAgICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxyXG4gICAgICAgICAgICAuc2V0TmFtZSgnRGVsZXRlIFVudXNlZCBBdHRhY2htZW50cyB3aXRoIE5vdGUnKVxyXG4gICAgICAgICAgICAuc2V0RGVzYygnQXV0b21hdGljYWxseSByZW1vdmUgYXR0YWNobWVudHMgdGhhdCBhcmUgbm8gbG9uZ2VyIHJlZmVyZW5jZWQgaW4gb3RoZXIgbm90ZXMgd2hlbiB0aGUgbm90ZSBpcyBkZWxldGVkLicpXHJcbiAgICAgICAgICAgIC5hZGRUb2dnbGUoY2IgPT4gY2Iub25DaGFuZ2UodmFsdWUgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MuZGVsZXRlQXR0YWNobWVudHNXaXRoTm90ZSA9IHZhbHVlO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgKS5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5zZXR0aW5ncy5kZWxldGVBdHRhY2htZW50c1dpdGhOb3RlKSk7XHJcblxyXG5cclxuICAgICAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcclxuICAgICAgICAgICAgLnNldE5hbWUoJ1VwZGF0ZSBMaW5rcycpXHJcbiAgICAgICAgICAgIC5zZXREZXNjKCdBdXRvbWF0aWNhbGx5IHVwZGF0ZSBsaW5rcyB0byBhdHRhY2htZW50cyBhbmQgb3RoZXIgbm90ZXMgd2hlbiBtb3Zpbmcgbm90ZXMgb3IgYXR0YWNobWVudHMuJylcclxuICAgICAgICAgICAgLmFkZFRvZ2dsZShjYiA9PiBjYi5vbkNoYW5nZSh2YWx1ZSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy51cGRhdGVMaW5rcyA9IHZhbHVlO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgKS5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5zZXR0aW5ncy51cGRhdGVMaW5rcykpO1xyXG5cclxuICAgICAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcclxuICAgICAgICAgICAgLnNldE5hbWUoJ0RlbGV0ZSBFbXB0eSBGb2xkZXJzJylcclxuICAgICAgICAgICAgLnNldERlc2MoJ0F1dG9tYXRpY2FsbHkgcmVtb3ZlIGVtcHR5IGZvbGRlcnMgYWZ0ZXIgbW92aW5nIG5vdGVzIHdpdGggYXR0YWNobWVudHMuJylcclxuICAgICAgICAgICAgLmFkZFRvZ2dsZShjYiA9PiBjYi5vbkNoYW5nZSh2YWx1ZSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5kZWxldGVFbXB0eUZvbGRlcnMgPSB2YWx1ZTtcclxuICAgICAgICAgICAgICAgIHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICkuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3MuZGVsZXRlRW1wdHlGb2xkZXJzKSk7XHJcblxyXG5cclxuICAgICAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcclxuICAgICAgICAgICAgLnNldE5hbWUoJ0RlbGV0ZSBEdXBsaWNhdGUgQXR0YWNobWVudHMgb24gTm90ZSBNb3ZlJylcclxuICAgICAgICAgICAgLnNldERlc2MoJ0F1dG9tYXRpY2FsbHkgZGVsZXRlIGF0dGFjaG1lbnRzIHdoZW4gbW92aW5nIGEgbm90ZSBpZiBhIGZpbGUgd2l0aCB0aGUgc2FtZSBuYW1lIGV4aXN0cyBpbiB0aGUgZGVzdGluYXRpb24gZm9sZGVyLiBJZiBkaXNhYmxlZCwgdGhlIGZpbGUgd2lsbCBiZSByZW5hbWVkIGFuZCBtb3ZlZC4nKVxyXG4gICAgICAgICAgICAuYWRkVG9nZ2xlKGNiID0+IGNiLm9uQ2hhbmdlKHZhbHVlID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmRlbGV0ZUV4aXN0RmlsZXNXaGVuTW92ZU5vdGUgPSB2YWx1ZTtcclxuICAgICAgICAgICAgICAgIHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICkuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3MuZGVsZXRlRXhpc3RGaWxlc1doZW5Nb3ZlTm90ZSkpO1xyXG5cclxuXHJcbiAgICAgICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXHJcbiAgICAgICAgICAgIC5zZXROYW1lKCdVcGRhdGUgQmFja2xpbmsgVGV4dCBvbiBOb3RlIFJlbmFtZScpXHJcbiAgICAgICAgICAgIC5zZXREZXNjKCdXaGVuIGEgbm90ZSBpcyByZW5hbWVkLCBpdHMgbGlua2VkIHJlZmVyZW5jZXMgYXJlIGF1dG9tYXRpY2FsbHkgdXBkYXRlZC4gSWYgdGhpcyBvcHRpb24gaXMgZW5hYmxlZCwgdGhlIHRleHQgb2YgYmFja2xpbmtzIHRvIHRoaXMgbm90ZSB3aWxsIGFsc28gYmUgbW9kaWZpZWQuJylcclxuICAgICAgICAgICAgLmFkZFRvZ2dsZShjYiA9PiBjYi5vbkNoYW5nZSh2YWx1ZSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5jaGFuZ2VOb3RlQmFja2xpbmtzQWx0ID0gdmFsdWU7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICApLnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLmNoYW5nZU5vdGVCYWNrbGlua3NBbHQpKTtcclxuXHJcblxyXG5cclxuICAgICAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcclxuICAgICAgICAgICAgLnNldE5hbWUoXCJJZ25vcmUgRm9sZGVyc1wiKVxyXG4gICAgICAgICAgICAuc2V0RGVzYyhcIlNwZWNpZnkgYSBsaXN0IG9mIGZvbGRlcnMgdG8gaWdub3JlLiBFbnRlciBlYWNoIGZvbGRlciBvbiBhIG5ldyBsaW5lLlwiKVxyXG4gICAgICAgICAgICAuYWRkVGV4dEFyZWEoY2IgPT4gY2JcclxuICAgICAgICAgICAgICAgIC5zZXRQbGFjZWhvbGRlcihcIkV4YW1wbGU6IC5naXQsIC5vYnNpZGlhblwiKVxyXG4gICAgICAgICAgICAgICAgLnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLmlnbm9yZUZvbGRlcnMuam9pbihcIlxcblwiKSlcclxuICAgICAgICAgICAgICAgIC5vbkNoYW5nZSgodmFsdWUpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgcGF0aHMgPSB2YWx1ZS50cmltKCkuc3BsaXQoXCJcXG5cIikubWFwKHZhbHVlID0+IHRoaXMuZ2V0Tm9ybWFsaXplZFBhdGgodmFsdWUpICsgXCIvXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmlnbm9yZUZvbGRlcnMgPSBwYXRocztcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcclxuICAgICAgICAgICAgICAgIH0pKTtcclxuXHJcbiAgICAgICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXHJcbiAgICAgICAgICAgIC5zZXROYW1lKFwiSWdub3JlIEZpbGVzXCIpXHJcbiAgICAgICAgICAgIC5zZXREZXNjKFwiU3BlY2lmeSBhIGxpc3Qgb2YgZmlsZXMgdG8gaWdub3JlLiBFbnRlciBlYWNoIGZpbGUgb24gYSBuZXcgbGluZS5cIilcclxuICAgICAgICAgICAgLmFkZFRleHRBcmVhKGNiID0+IGNiXHJcbiAgICAgICAgICAgICAgICAuc2V0UGxhY2Vob2xkZXIoXCJFeGFtcGxlOiBjb25zaXN0YW50LXJlcG9ydC5tZFwiKVxyXG4gICAgICAgICAgICAgICAgLnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLmlnbm9yZUZpbGVzLmpvaW4oXCJcXG5cIikpXHJcbiAgICAgICAgICAgICAgICAub25DaGFuZ2UoKHZhbHVlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHBhdGhzID0gdmFsdWUudHJpbSgpLnNwbGl0KFwiXFxuXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmlnbm9yZUZpbGVzID0gcGF0aHM7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MuaWdub3JlRmlsZXNSZWdleCA9IHBhdGhzLm1hcChmaWxlID0+IFJlZ0V4cChmaWxlKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XHJcbiAgICAgICAgICAgICAgICB9KSk7XHJcblxyXG4gICAgICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxyXG4gICAgICAgICAgICAuc2V0TmFtZShcIkF0dGFjaG1lbnQgU3ViZm9sZGVyXCIpXHJcbiAgICAgICAgICAgIC5zZXREZXNjKFwiU3BlY2lmeSB0aGUgc3ViZm9sZGVyIHdpdGhpbiB0aGUgbm90ZSBmb2xkZXIgdG8gY29sbGVjdCBhdHRhY2htZW50cyBpbnRvIHdoZW4gdXNpbmcgdGhlIFxcXCJDb2xsZWN0IEFsbCBBdHRhY2htZW50c1xcXCIgaG90a2V5LiBMZWF2ZSBlbXB0eSB0byBjb2xsZWN0IGF0dGFjaG1lbnRzIGRpcmVjdGx5IGludG8gdGhlIG5vdGUgZm9sZGVyLiBZb3UgY2FuIHVzZSAke2ZpbGVuYW1lfSBhcyBhIHBsYWNlaG9sZGVyIGZvciB0aGUgY3VycmVudCBub3RlIG5hbWUuXCIpXHJcbiAgICAgICAgICAgIC5hZGRUZXh0KGNiID0+IGNiXHJcbiAgICAgICAgICAgICAgICAuc2V0UGxhY2Vob2xkZXIoXCJFeGFtcGxlOiBfYXR0YWNobWVudHNcIilcclxuICAgICAgICAgICAgICAgIC5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5zZXR0aW5ncy5hdHRhY2htZW50c1N1YmZvbGRlcilcclxuICAgICAgICAgICAgICAgIC5vbkNoYW5nZSgodmFsdWUpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5hdHRhY2htZW50c1N1YmZvbGRlciA9IHZhbHVlO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xyXG4gICAgICAgICAgICAgICAgfSkpO1xyXG5cclxuXHJcbiAgICAgICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXHJcbiAgICAgICAgICAgIC5zZXROYW1lKFwiQ29uc2lzdGVuY3kgUmVwb3J0IEZpbGVuYW1lXCIpXHJcbiAgICAgICAgICAgIC5zZXREZXNjKFwiU3BlY2lmeSB0aGUgbmFtZSBvZiB0aGUgZmlsZSBmb3IgdGhlIGNvbnNpc3RlbmN5IHJlcG9ydC5cIilcclxuICAgICAgICAgICAgLmFkZFRleHQoY2IgPT4gY2JcclxuICAgICAgICAgICAgICAgIC5zZXRQbGFjZWhvbGRlcihcIkV4YW1wbGU6IGNvbnNpc3RlbmN5LXJlcG9ydC5tZFwiKVxyXG4gICAgICAgICAgICAgICAgLnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLmNvbnNpc3RlbmN5UmVwb3J0RmlsZSlcclxuICAgICAgICAgICAgICAgIC5vbkNoYW5nZSgodmFsdWUpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5jb25zaXN0ZW5jeVJlcG9ydEZpbGUgPSB2YWx1ZTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcclxuICAgICAgICAgICAgICAgIH0pKTtcclxuXHJcblxyXG4gICAgICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxyXG4gICAgICAgICAgICAuc2V0TmFtZShcIkVYUEVSSU1FTlRBTDogVXNlIEJ1aWx0LWluIE9ic2lkaWFuIExpbmsgQ2FjaGluZyBmb3IgTW92ZWQgTm90ZXNcIilcclxuICAgICAgICAgICAgLnNldERlc2MoXCJFbmFibGUgdGhpcyBvcHRpb24gdG8gdXNlIHRoZSBleHBlcmltZW50YWwgYnVpbHQtaW4gT2JzaWRpYW4gbGluayBjYWNoaW5nIGZvciBwcm9jZXNzaW5nIG1vdmVkIG5vdGVzLiBUdXJuIGl0IG9mZiBpZiB0aGUgcGx1Z2luIG1pc2JlaGF2ZXMuXCIpXHJcbiAgICAgICAgICAgIC5hZGRUb2dnbGUoY2IgPT4gY2Iub25DaGFuZ2UodmFsdWUgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MudXNlQnVpbHRJbk9ic2lkaWFuTGlua0NhY2hpbmcgPSB2YWx1ZTtcclxuICAgICAgICAgICAgICAgIHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICkuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3MudXNlQnVpbHRJbk9ic2lkaWFuTGlua0NhY2hpbmcpKTtcclxuICAgIH1cclxuXHJcbiAgICBnZXROb3JtYWxpemVkUGF0aChwYXRoOiBzdHJpbmcpOiBzdHJpbmcge1xyXG4gICAgICAgIHJldHVybiBwYXRoLmxlbmd0aCA9PSAwID8gcGF0aCA6IG5vcm1hbGl6ZVBhdGgocGF0aCk7XHJcbiAgICB9XHJcbn0iLCJpbXBvcnQgeyBURmlsZSB9IGZyb20gXCJvYnNpZGlhblwiO1xyXG5cclxuZXhwb3J0IGNsYXNzIFV0aWxzIHtcclxuXHJcblx0c3RhdGljIGFzeW5jIGRlbGF5KG1zOiBudW1iZXIpIHtcclxuXHRcdHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHNldFRpbWVvdXQocmVzb2x2ZSwgbXMpKTtcclxuXHR9XHJcblxyXG5cclxuXHRzdGF0aWMgbm9ybWFsaXplUGF0aEZvckZpbGUocGF0aDogc3RyaW5nKTogc3RyaW5nIHtcclxuXHRcdHBhdGggPSBwYXRoLnJlcGxhY2UoL1xcXFwvZ2ksIFwiL1wiKTsgLy9yZXBsYWNlIFxcIHRvIC9cclxuXHRcdHBhdGggPSBwYXRoLnJlcGxhY2UoLyUyMC9naSwgXCIgXCIpOyAvL3JlcGxhY2UgJTIwIHRvIHNwYWNlXHJcblx0XHRyZXR1cm4gcGF0aDtcclxuXHR9XHJcblxyXG5cclxuXHRzdGF0aWMgbm9ybWFsaXplUGF0aEZvckxpbmsocGF0aDogc3RyaW5nKTogc3RyaW5nIHtcclxuXHRcdHBhdGggPSBwYXRoLnJlcGxhY2UoL1xcXFwvZ2ksIFwiL1wiKTsgLy9yZXBsYWNlIFxcIHRvIC9cclxuXHRcdHBhdGggPSBwYXRoLnJlcGxhY2UoLyAvZ2ksIFwiJTIwXCIpOyAvL3JlcGxhY2Ugc3BhY2UgdG8gJTIwXHJcblx0XHRyZXR1cm4gcGF0aDtcclxuXHR9XHJcblxyXG5cdHN0YXRpYyBub3JtYWxpemVMaW5rU2VjdGlvbihzZWN0aW9uOiBzdHJpbmcpOiBzdHJpbmcge1xyXG5cdFx0c2VjdGlvbiA9IGRlY29kZVVSSShzZWN0aW9uKTtcclxuXHRcdHJldHVybiBzZWN0aW9uO1xyXG5cdH1cclxuXHJcblx0c3RhdGljIGFzeW5jIGdldENhY2hlU2FmZShmaWxlT3JQYXRoOiBURmlsZSB8IHN0cmluZykge1xyXG5cdFx0Y29uc3QgZmlsZSA9IFV0aWxzLmdldEZpbGUoZmlsZU9yUGF0aCk7XHJcblxyXG5cdFx0d2hpbGUgKHRydWUpIHtcclxuXHRcdFx0Y29uc3QgY2FjaGUgPSBhcHAubWV0YWRhdGFDYWNoZS5nZXRGaWxlQ2FjaGUoZmlsZSk7XHJcblx0XHRcdGlmIChjYWNoZSkge1xyXG5cdFx0XHRcdHJldHVybiBjYWNoZTtcclxuXHRcdFx0fVxyXG5cdFxyXG5cdFx0XHRhd2FpdCBVdGlscy5kZWxheSgxMDApO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0c3RhdGljIGdldEZpbGUoZmlsZU9yUGF0aDogVEZpbGUgfCBzdHJpbmcpIHtcclxuXHRcdGlmIChmaWxlT3JQYXRoIGluc3RhbmNlb2YgVEZpbGUpIHtcclxuXHRcdFx0cmV0dXJuIGZpbGVPclBhdGg7XHJcblx0XHR9XHJcblxyXG5cdFx0Y29uc3QgYWJzdHJhY3RGaWxlID0gYXBwLnZhdWx0LmdldEFic3RyYWN0RmlsZUJ5UGF0aChmaWxlT3JQYXRoKTtcclxuXHRcdGlmICghYWJzdHJhY3RGaWxlKSB7XHJcblx0XHRcdHRocm93IGBGaWxlICR7ZmlsZU9yUGF0aH0gZG9lcyBub3QgZXhpc3RgO1xyXG5cdFx0fVxyXG5cclxuXHRcdGlmICghKGFic3RyYWN0RmlsZSBpbnN0YW5jZW9mIFRGaWxlKSkge1xyXG5cdFx0XHR0aHJvdyBgJHtmaWxlT3JQYXRofSBpcyBub3QgYSBmaWxlYDtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gYWJzdHJhY3RGaWxlO1xyXG5cdH1cclxufSIsImV4cG9ydCBjbGFzcyBwYXRoIHtcclxuICAgIHN0YXRpYyBqb2luKC4uLnBhcnRzOiBzdHJpbmdbXSkge1xyXG4gICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKVxyXG4gICAgICAgICAgICByZXR1cm4gJy4nO1xyXG4gICAgICAgIHZhciBqb2luZWQ7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyArK2kpIHtcclxuICAgICAgICAgICAgdmFyIGFyZyA9IGFyZ3VtZW50c1tpXTtcclxuICAgICAgICAgICAgaWYgKGFyZy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoam9pbmVkID09PSB1bmRlZmluZWQpXHJcbiAgICAgICAgICAgICAgICAgICAgam9pbmVkID0gYXJnO1xyXG4gICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgICAgIGpvaW5lZCArPSAnLycgKyBhcmc7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGpvaW5lZCA9PT0gdW5kZWZpbmVkKVxyXG4gICAgICAgICAgICByZXR1cm4gJy4nO1xyXG4gICAgICAgIHJldHVybiB0aGlzLnBvc2l4Tm9ybWFsaXplKGpvaW5lZCk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIGRpcm5hbWUocGF0aDogc3RyaW5nKSB7XHJcbiAgICAgICAgaWYgKHBhdGgubGVuZ3RoID09PSAwKSByZXR1cm4gJy4nO1xyXG4gICAgICAgIHZhciBjb2RlID0gcGF0aC5jaGFyQ29kZUF0KDApO1xyXG4gICAgICAgIHZhciBoYXNSb290ID0gY29kZSA9PT0gNDcgLyovKi87XHJcbiAgICAgICAgdmFyIGVuZCA9IC0xO1xyXG4gICAgICAgIHZhciBtYXRjaGVkU2xhc2ggPSB0cnVlO1xyXG4gICAgICAgIGZvciAodmFyIGkgPSBwYXRoLmxlbmd0aCAtIDE7IGkgPj0gMTsgLS1pKSB7XHJcbiAgICAgICAgICAgIGNvZGUgPSBwYXRoLmNoYXJDb2RlQXQoaSk7XHJcbiAgICAgICAgICAgIGlmIChjb2RlID09PSA0NyAvKi8qLykge1xyXG4gICAgICAgICAgICAgICAgaWYgKCFtYXRjaGVkU2xhc2gpIHtcclxuICAgICAgICAgICAgICAgICAgICBlbmQgPSBpO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgLy8gV2Ugc2F3IHRoZSBmaXJzdCBub24tcGF0aCBzZXBhcmF0b3JcclxuICAgICAgICAgICAgICAgIG1hdGNoZWRTbGFzaCA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoZW5kID09PSAtMSkgcmV0dXJuIGhhc1Jvb3QgPyAnLycgOiAnLic7XHJcbiAgICAgICAgaWYgKGhhc1Jvb3QgJiYgZW5kID09PSAxKSByZXR1cm4gJy8vJztcclxuICAgICAgICByZXR1cm4gcGF0aC5zbGljZSgwLCBlbmQpO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBiYXNlbmFtZShwYXRoOiBzdHJpbmcsIGV4dD86IHN0cmluZykge1xyXG4gICAgICAgIGlmIChleHQgIT09IHVuZGVmaW5lZCAmJiB0eXBlb2YgZXh0ICE9PSAnc3RyaW5nJykgdGhyb3cgbmV3IFR5cGVFcnJvcignXCJleHRcIiBhcmd1bWVudCBtdXN0IGJlIGEgc3RyaW5nJyk7XHJcblxyXG4gICAgICAgIHZhciBzdGFydCA9IDA7XHJcbiAgICAgICAgdmFyIGVuZCA9IC0xO1xyXG4gICAgICAgIHZhciBtYXRjaGVkU2xhc2ggPSB0cnVlO1xyXG4gICAgICAgIHZhciBpO1xyXG5cclxuICAgICAgICBpZiAoZXh0ICE9PSB1bmRlZmluZWQgJiYgZXh0Lmxlbmd0aCA+IDAgJiYgZXh0Lmxlbmd0aCA8PSBwYXRoLmxlbmd0aCkge1xyXG4gICAgICAgICAgICBpZiAoZXh0Lmxlbmd0aCA9PT0gcGF0aC5sZW5ndGggJiYgZXh0ID09PSBwYXRoKSByZXR1cm4gJyc7XHJcbiAgICAgICAgICAgIHZhciBleHRJZHggPSBleHQubGVuZ3RoIC0gMTtcclxuICAgICAgICAgICAgdmFyIGZpcnN0Tm9uU2xhc2hFbmQgPSAtMTtcclxuICAgICAgICAgICAgZm9yIChpID0gcGF0aC5sZW5ndGggLSAxOyBpID49IDA7IC0taSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGNvZGUgPSBwYXRoLmNoYXJDb2RlQXQoaSk7XHJcbiAgICAgICAgICAgICAgICBpZiAoY29kZSA9PT0gNDcgLyovKi8pIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBJZiB3ZSByZWFjaGVkIGEgcGF0aCBzZXBhcmF0b3IgdGhhdCB3YXMgbm90IHBhcnQgb2YgYSBzZXQgb2YgcGF0aFxyXG4gICAgICAgICAgICAgICAgICAgIC8vIHNlcGFyYXRvcnMgYXQgdGhlIGVuZCBvZiB0aGUgc3RyaW5nLCBzdG9wIG5vd1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICghbWF0Y2hlZFNsYXNoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXJ0ID0gaSArIDE7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGZpcnN0Tm9uU2xhc2hFbmQgPT09IC0xKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFdlIHNhdyB0aGUgZmlyc3Qgbm9uLXBhdGggc2VwYXJhdG9yLCByZW1lbWJlciB0aGlzIGluZGV4IGluIGNhc2VcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gd2UgbmVlZCBpdCBpZiB0aGUgZXh0ZW5zaW9uIGVuZHMgdXAgbm90IG1hdGNoaW5nXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hdGNoZWRTbGFzaCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmaXJzdE5vblNsYXNoRW5kID0gaSArIDE7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChleHRJZHggPj0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBUcnkgdG8gbWF0Y2ggdGhlIGV4cGxpY2l0IGV4dGVuc2lvblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY29kZSA9PT0gZXh0LmNoYXJDb2RlQXQoZXh0SWR4KSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKC0tZXh0SWR4ID09PSAtMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFdlIG1hdGNoZWQgdGhlIGV4dGVuc2lvbiwgc28gbWFyayB0aGlzIGFzIHRoZSBlbmQgb2Ygb3VyIHBhdGhcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBjb21wb25lbnRcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbmQgPSBpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gRXh0ZW5zaW9uIGRvZXMgbm90IG1hdGNoLCBzbyBvdXIgcmVzdWx0IGlzIHRoZSBlbnRpcmUgcGF0aFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gY29tcG9uZW50XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBleHRJZHggPSAtMTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVuZCA9IGZpcnN0Tm9uU2xhc2hFbmQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChzdGFydCA9PT0gZW5kKSBlbmQgPSBmaXJzdE5vblNsYXNoRW5kOyBlbHNlIGlmIChlbmQgPT09IC0xKSBlbmQgPSBwYXRoLmxlbmd0aDtcclxuICAgICAgICAgICAgcmV0dXJuIHBhdGguc2xpY2Uoc3RhcnQsIGVuZCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgZm9yIChpID0gcGF0aC5sZW5ndGggLSAxOyBpID49IDA7IC0taSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHBhdGguY2hhckNvZGVBdChpKSA9PT0gNDcgLyovKi8pIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBJZiB3ZSByZWFjaGVkIGEgcGF0aCBzZXBhcmF0b3IgdGhhdCB3YXMgbm90IHBhcnQgb2YgYSBzZXQgb2YgcGF0aFxyXG4gICAgICAgICAgICAgICAgICAgIC8vIHNlcGFyYXRvcnMgYXQgdGhlIGVuZCBvZiB0aGUgc3RyaW5nLCBzdG9wIG5vd1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICghbWF0Y2hlZFNsYXNoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXJ0ID0gaSArIDE7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoZW5kID09PSAtMSkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIFdlIHNhdyB0aGUgZmlyc3Qgbm9uLXBhdGggc2VwYXJhdG9yLCBtYXJrIHRoaXMgYXMgdGhlIGVuZCBvZiBvdXJcclxuICAgICAgICAgICAgICAgICAgICAvLyBwYXRoIGNvbXBvbmVudFxyXG4gICAgICAgICAgICAgICAgICAgIG1hdGNoZWRTbGFzaCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgIGVuZCA9IGkgKyAxO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoZW5kID09PSAtMSkgcmV0dXJuICcnO1xyXG4gICAgICAgICAgICByZXR1cm4gcGF0aC5zbGljZShzdGFydCwgZW5kKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIGV4dG5hbWUocGF0aDogc3RyaW5nKSB7XHJcbiAgICAgICAgdmFyIHN0YXJ0RG90ID0gLTE7XHJcbiAgICAgICAgdmFyIHN0YXJ0UGFydCA9IDA7XHJcbiAgICAgICAgdmFyIGVuZCA9IC0xO1xyXG4gICAgICAgIHZhciBtYXRjaGVkU2xhc2ggPSB0cnVlO1xyXG4gICAgICAgIC8vIFRyYWNrIHRoZSBzdGF0ZSBvZiBjaGFyYWN0ZXJzIChpZiBhbnkpIHdlIHNlZSBiZWZvcmUgb3VyIGZpcnN0IGRvdCBhbmRcclxuICAgICAgICAvLyBhZnRlciBhbnkgcGF0aCBzZXBhcmF0b3Igd2UgZmluZFxyXG4gICAgICAgIHZhciBwcmVEb3RTdGF0ZSA9IDA7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IHBhdGgubGVuZ3RoIC0gMTsgaSA+PSAwOyAtLWkpIHtcclxuICAgICAgICAgICAgdmFyIGNvZGUgPSBwYXRoLmNoYXJDb2RlQXQoaSk7XHJcbiAgICAgICAgICAgIGlmIChjb2RlID09PSA0NyAvKi8qLykge1xyXG4gICAgICAgICAgICAgICAgLy8gSWYgd2UgcmVhY2hlZCBhIHBhdGggc2VwYXJhdG9yIHRoYXQgd2FzIG5vdCBwYXJ0IG9mIGEgc2V0IG9mIHBhdGhcclxuICAgICAgICAgICAgICAgIC8vIHNlcGFyYXRvcnMgYXQgdGhlIGVuZCBvZiB0aGUgc3RyaW5nLCBzdG9wIG5vd1xyXG4gICAgICAgICAgICAgICAgaWYgKCFtYXRjaGVkU2xhc2gpIHtcclxuICAgICAgICAgICAgICAgICAgICBzdGFydFBhcnQgPSBpICsgMTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChlbmQgPT09IC0xKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBXZSBzYXcgdGhlIGZpcnN0IG5vbi1wYXRoIHNlcGFyYXRvciwgbWFyayB0aGlzIGFzIHRoZSBlbmQgb2Ygb3VyXHJcbiAgICAgICAgICAgICAgICAvLyBleHRlbnNpb25cclxuICAgICAgICAgICAgICAgIG1hdGNoZWRTbGFzaCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgZW5kID0gaSArIDE7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGNvZGUgPT09IDQ2IC8qLiovKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBJZiB0aGlzIGlzIG91ciBmaXJzdCBkb3QsIG1hcmsgaXQgYXMgdGhlIHN0YXJ0IG9mIG91ciBleHRlbnNpb25cclxuICAgICAgICAgICAgICAgIGlmIChzdGFydERvdCA9PT0gLTEpXHJcbiAgICAgICAgICAgICAgICAgICAgc3RhcnREb3QgPSBpO1xyXG4gICAgICAgICAgICAgICAgZWxzZSBpZiAocHJlRG90U3RhdGUgIT09IDEpXHJcbiAgICAgICAgICAgICAgICAgICAgcHJlRG90U3RhdGUgPSAxO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHN0YXJ0RG90ICE9PSAtMSkge1xyXG4gICAgICAgICAgICAgICAgLy8gV2Ugc2F3IGEgbm9uLWRvdCBhbmQgbm9uLXBhdGggc2VwYXJhdG9yIGJlZm9yZSBvdXIgZG90LCBzbyB3ZSBzaG91bGRcclxuICAgICAgICAgICAgICAgIC8vIGhhdmUgYSBnb29kIGNoYW5jZSBhdCBoYXZpbmcgYSBub24tZW1wdHkgZXh0ZW5zaW9uXHJcbiAgICAgICAgICAgICAgICBwcmVEb3RTdGF0ZSA9IC0xO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoc3RhcnREb3QgPT09IC0xIHx8IGVuZCA9PT0gLTEgfHxcclxuICAgICAgICAgICAgLy8gV2Ugc2F3IGEgbm9uLWRvdCBjaGFyYWN0ZXIgaW1tZWRpYXRlbHkgYmVmb3JlIHRoZSBkb3RcclxuICAgICAgICAgICAgcHJlRG90U3RhdGUgPT09IDAgfHxcclxuICAgICAgICAgICAgLy8gVGhlIChyaWdodC1tb3N0KSB0cmltbWVkIHBhdGggY29tcG9uZW50IGlzIGV4YWN0bHkgJy4uJ1xyXG4gICAgICAgICAgICBwcmVEb3RTdGF0ZSA9PT0gMSAmJiBzdGFydERvdCA9PT0gZW5kIC0gMSAmJiBzdGFydERvdCA9PT0gc3RhcnRQYXJ0ICsgMSkge1xyXG4gICAgICAgICAgICByZXR1cm4gJyc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBwYXRoLnNsaWNlKHN0YXJ0RG90LCBlbmQpO1xyXG4gICAgfVxyXG5cclxuXHJcblxyXG4gICAgc3RhdGljIHBhcnNlKHBhdGg6IHN0cmluZykge1xyXG5cclxuICAgICAgICB2YXIgcmV0ID0geyByb290OiAnJywgZGlyOiAnJywgYmFzZTogJycsIGV4dDogJycsIG5hbWU6ICcnIH07XHJcbiAgICAgICAgaWYgKHBhdGgubGVuZ3RoID09PSAwKSByZXR1cm4gcmV0O1xyXG4gICAgICAgIHZhciBjb2RlID0gcGF0aC5jaGFyQ29kZUF0KDApO1xyXG4gICAgICAgIHZhciBpc0Fic29sdXRlID0gY29kZSA9PT0gNDcgLyovKi87XHJcbiAgICAgICAgdmFyIHN0YXJ0O1xyXG4gICAgICAgIGlmIChpc0Fic29sdXRlKSB7XHJcbiAgICAgICAgICAgIHJldC5yb290ID0gJy8nO1xyXG4gICAgICAgICAgICBzdGFydCA9IDE7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgc3RhcnQgPSAwO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgc3RhcnREb3QgPSAtMTtcclxuICAgICAgICB2YXIgc3RhcnRQYXJ0ID0gMDtcclxuICAgICAgICB2YXIgZW5kID0gLTE7XHJcbiAgICAgICAgdmFyIG1hdGNoZWRTbGFzaCA9IHRydWU7XHJcbiAgICAgICAgdmFyIGkgPSBwYXRoLmxlbmd0aCAtIDE7XHJcblxyXG4gICAgICAgIC8vIFRyYWNrIHRoZSBzdGF0ZSBvZiBjaGFyYWN0ZXJzIChpZiBhbnkpIHdlIHNlZSBiZWZvcmUgb3VyIGZpcnN0IGRvdCBhbmRcclxuICAgICAgICAvLyBhZnRlciBhbnkgcGF0aCBzZXBhcmF0b3Igd2UgZmluZFxyXG4gICAgICAgIHZhciBwcmVEb3RTdGF0ZSA9IDA7XHJcblxyXG4gICAgICAgIC8vIEdldCBub24tZGlyIGluZm9cclxuICAgICAgICBmb3IgKDsgaSA+PSBzdGFydDsgLS1pKSB7XHJcbiAgICAgICAgICAgIGNvZGUgPSBwYXRoLmNoYXJDb2RlQXQoaSk7XHJcbiAgICAgICAgICAgIGlmIChjb2RlID09PSA0NyAvKi8qLykge1xyXG4gICAgICAgICAgICAgICAgLy8gSWYgd2UgcmVhY2hlZCBhIHBhdGggc2VwYXJhdG9yIHRoYXQgd2FzIG5vdCBwYXJ0IG9mIGEgc2V0IG9mIHBhdGhcclxuICAgICAgICAgICAgICAgIC8vIHNlcGFyYXRvcnMgYXQgdGhlIGVuZCBvZiB0aGUgc3RyaW5nLCBzdG9wIG5vd1xyXG4gICAgICAgICAgICAgICAgaWYgKCFtYXRjaGVkU2xhc2gpIHtcclxuICAgICAgICAgICAgICAgICAgICBzdGFydFBhcnQgPSBpICsgMTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChlbmQgPT09IC0xKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBXZSBzYXcgdGhlIGZpcnN0IG5vbi1wYXRoIHNlcGFyYXRvciwgbWFyayB0aGlzIGFzIHRoZSBlbmQgb2Ygb3VyXHJcbiAgICAgICAgICAgICAgICAvLyBleHRlbnNpb25cclxuICAgICAgICAgICAgICAgIG1hdGNoZWRTbGFzaCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgZW5kID0gaSArIDE7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGNvZGUgPT09IDQ2IC8qLiovKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBJZiB0aGlzIGlzIG91ciBmaXJzdCBkb3QsIG1hcmsgaXQgYXMgdGhlIHN0YXJ0IG9mIG91ciBleHRlbnNpb25cclxuICAgICAgICAgICAgICAgIGlmIChzdGFydERvdCA9PT0gLTEpIHN0YXJ0RG90ID0gaTsgZWxzZSBpZiAocHJlRG90U3RhdGUgIT09IDEpIHByZURvdFN0YXRlID0gMTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChzdGFydERvdCAhPT0gLTEpIHtcclxuICAgICAgICAgICAgICAgIC8vIFdlIHNhdyBhIG5vbi1kb3QgYW5kIG5vbi1wYXRoIHNlcGFyYXRvciBiZWZvcmUgb3VyIGRvdCwgc28gd2Ugc2hvdWxkXHJcbiAgICAgICAgICAgICAgICAvLyBoYXZlIGEgZ29vZCBjaGFuY2UgYXQgaGF2aW5nIGEgbm9uLWVtcHR5IGV4dGVuc2lvblxyXG4gICAgICAgICAgICAgICAgcHJlRG90U3RhdGUgPSAtMTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHN0YXJ0RG90ID09PSAtMSB8fCBlbmQgPT09IC0xIHx8XHJcbiAgICAgICAgICAgIC8vIFdlIHNhdyBhIG5vbi1kb3QgY2hhcmFjdGVyIGltbWVkaWF0ZWx5IGJlZm9yZSB0aGUgZG90XHJcbiAgICAgICAgICAgIHByZURvdFN0YXRlID09PSAwIHx8XHJcbiAgICAgICAgICAgIC8vIFRoZSAocmlnaHQtbW9zdCkgdHJpbW1lZCBwYXRoIGNvbXBvbmVudCBpcyBleGFjdGx5ICcuLidcclxuICAgICAgICAgICAgcHJlRG90U3RhdGUgPT09IDEgJiYgc3RhcnREb3QgPT09IGVuZCAtIDEgJiYgc3RhcnREb3QgPT09IHN0YXJ0UGFydCArIDEpIHtcclxuICAgICAgICAgICAgaWYgKGVuZCAhPT0gLTEpIHtcclxuICAgICAgICAgICAgICAgIGlmIChzdGFydFBhcnQgPT09IDAgJiYgaXNBYnNvbHV0ZSkgcmV0LmJhc2UgPSByZXQubmFtZSA9IHBhdGguc2xpY2UoMSwgZW5kKTsgZWxzZSByZXQuYmFzZSA9IHJldC5uYW1lID0gcGF0aC5zbGljZShzdGFydFBhcnQsIGVuZCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBpZiAoc3RhcnRQYXJ0ID09PSAwICYmIGlzQWJzb2x1dGUpIHtcclxuICAgICAgICAgICAgICAgIHJldC5uYW1lID0gcGF0aC5zbGljZSgxLCBzdGFydERvdCk7XHJcbiAgICAgICAgICAgICAgICByZXQuYmFzZSA9IHBhdGguc2xpY2UoMSwgZW5kKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJldC5uYW1lID0gcGF0aC5zbGljZShzdGFydFBhcnQsIHN0YXJ0RG90KTtcclxuICAgICAgICAgICAgICAgIHJldC5iYXNlID0gcGF0aC5zbGljZShzdGFydFBhcnQsIGVuZCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0LmV4dCA9IHBhdGguc2xpY2Uoc3RhcnREb3QsIGVuZCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoc3RhcnRQYXJ0ID4gMCkgcmV0LmRpciA9IHBhdGguc2xpY2UoMCwgc3RhcnRQYXJ0IC0gMSk7IGVsc2UgaWYgKGlzQWJzb2x1dGUpIHJldC5kaXIgPSAnLyc7XHJcblxyXG4gICAgICAgIHJldHVybiByZXQ7XHJcbiAgICB9XHJcblxyXG5cclxuXHJcblxyXG4gICAgc3RhdGljIHBvc2l4Tm9ybWFsaXplKHBhdGg6IHN0cmluZykge1xyXG5cclxuICAgICAgICBpZiAocGF0aC5sZW5ndGggPT09IDApIHJldHVybiAnLic7XHJcblxyXG4gICAgICAgIHZhciBpc0Fic29sdXRlID0gcGF0aC5jaGFyQ29kZUF0KDApID09PSA0NyAvKi8qLztcclxuICAgICAgICB2YXIgdHJhaWxpbmdTZXBhcmF0b3IgPSBwYXRoLmNoYXJDb2RlQXQocGF0aC5sZW5ndGggLSAxKSA9PT0gNDcgLyovKi87XHJcblxyXG4gICAgICAgIC8vIE5vcm1hbGl6ZSB0aGUgcGF0aFxyXG4gICAgICAgIHBhdGggPSB0aGlzLm5vcm1hbGl6ZVN0cmluZ1Bvc2l4KHBhdGgsICFpc0Fic29sdXRlKTtcclxuXHJcbiAgICAgICAgaWYgKHBhdGgubGVuZ3RoID09PSAwICYmICFpc0Fic29sdXRlKSBwYXRoID0gJy4nO1xyXG4gICAgICAgIGlmIChwYXRoLmxlbmd0aCA+IDAgJiYgdHJhaWxpbmdTZXBhcmF0b3IpIHBhdGggKz0gJy8nO1xyXG5cclxuICAgICAgICBpZiAoaXNBYnNvbHV0ZSkgcmV0dXJuICcvJyArIHBhdGg7XHJcbiAgICAgICAgcmV0dXJuIHBhdGg7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIG5vcm1hbGl6ZVN0cmluZ1Bvc2l4KHBhdGg6IHN0cmluZywgYWxsb3dBYm92ZVJvb3Q6IGJvb2xlYW4pIHtcclxuICAgICAgICB2YXIgcmVzID0gJyc7XHJcbiAgICAgICAgdmFyIGxhc3RTZWdtZW50TGVuZ3RoID0gMDtcclxuICAgICAgICB2YXIgbGFzdFNsYXNoID0gLTE7XHJcbiAgICAgICAgdmFyIGRvdHMgPSAwO1xyXG4gICAgICAgIHZhciBjb2RlO1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDw9IHBhdGgubGVuZ3RoOyArK2kpIHtcclxuICAgICAgICAgICAgaWYgKGkgPCBwYXRoLmxlbmd0aClcclxuICAgICAgICAgICAgICAgIGNvZGUgPSBwYXRoLmNoYXJDb2RlQXQoaSk7XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKGNvZGUgPT09IDQ3IC8qLyovKVxyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgIGNvZGUgPSA0NyAvKi8qLztcclxuICAgICAgICAgICAgaWYgKGNvZGUgPT09IDQ3IC8qLyovKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAobGFzdFNsYXNoID09PSBpIC0gMSB8fCBkb3RzID09PSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gTk9PUFxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChsYXN0U2xhc2ggIT09IGkgLSAxICYmIGRvdHMgPT09IDIpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAocmVzLmxlbmd0aCA8IDIgfHwgbGFzdFNlZ21lbnRMZW5ndGggIT09IDIgfHwgcmVzLmNoYXJDb2RlQXQocmVzLmxlbmd0aCAtIDEpICE9PSA0NiAvKi4qLyB8fCByZXMuY2hhckNvZGVBdChyZXMubGVuZ3RoIC0gMikgIT09IDQ2IC8qLiovKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZXMubGVuZ3RoID4gMikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGxhc3RTbGFzaEluZGV4ID0gcmVzLmxhc3RJbmRleE9mKCcvJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobGFzdFNsYXNoSW5kZXggIT09IHJlcy5sZW5ndGggLSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGxhc3RTbGFzaEluZGV4ID09PSAtMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXMgPSAnJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFzdFNlZ21lbnRMZW5ndGggPSAwO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcyA9IHJlcy5zbGljZSgwLCBsYXN0U2xhc2hJbmRleCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhc3RTZWdtZW50TGVuZ3RoID0gcmVzLmxlbmd0aCAtIDEgLSByZXMubGFzdEluZGV4T2YoJy8nKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFzdFNsYXNoID0gaTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkb3RzID0gMDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChyZXMubGVuZ3RoID09PSAyIHx8IHJlcy5sZW5ndGggPT09IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcyA9ICcnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFzdFNlZ21lbnRMZW5ndGggPSAwO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFzdFNsYXNoID0gaTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvdHMgPSAwO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGFsbG93QWJvdmVSb290KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZXMubGVuZ3RoID4gMClcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcyArPSAnLy4uJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzID0gJy4uJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGFzdFNlZ21lbnRMZW5ndGggPSAyO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlcy5sZW5ndGggPiAwKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXMgKz0gJy8nICsgcGF0aC5zbGljZShsYXN0U2xhc2ggKyAxLCBpKTtcclxuICAgICAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlcyA9IHBhdGguc2xpY2UobGFzdFNsYXNoICsgMSwgaSk7XHJcbiAgICAgICAgICAgICAgICAgICAgbGFzdFNlZ21lbnRMZW5ndGggPSBpIC0gbGFzdFNsYXNoIC0gMTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGxhc3RTbGFzaCA9IGk7XHJcbiAgICAgICAgICAgICAgICBkb3RzID0gMDtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChjb2RlID09PSA0NiAvKi4qLyAmJiBkb3RzICE9PSAtMSkge1xyXG4gICAgICAgICAgICAgICAgKytkb3RzO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgZG90cyA9IC0xO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiByZXM7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIHBvc2l4UmVzb2x2ZSguLi5hcmdzOiBzdHJpbmdbXSkge1xyXG4gICAgICAgIHZhciByZXNvbHZlZFBhdGggPSAnJztcclxuICAgICAgICB2YXIgcmVzb2x2ZWRBYnNvbHV0ZSA9IGZhbHNlO1xyXG4gICAgICAgIHZhciBjd2Q7XHJcblxyXG4gICAgICAgIGZvciAodmFyIGkgPSBhcmdzLmxlbmd0aCAtIDE7IGkgPj0gLTEgJiYgIXJlc29sdmVkQWJzb2x1dGU7IGktLSkge1xyXG4gICAgICAgICAgICB2YXIgcGF0aDtcclxuICAgICAgICAgICAgaWYgKGkgPj0gMClcclxuICAgICAgICAgICAgICAgIHBhdGggPSBhcmdzW2ldO1xyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGlmIChjd2QgPT09IHVuZGVmaW5lZClcclxuICAgICAgICAgICAgICAgICAgICBjd2QgPSBwcm9jZXNzLmN3ZCgpO1xyXG4gICAgICAgICAgICAgICAgcGF0aCA9IGN3ZDtcclxuICAgICAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgICAgIC8vIFNraXAgZW1wdHkgZW50cmllc1xyXG4gICAgICAgICAgICBpZiAocGF0aC5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXNvbHZlZFBhdGggPSBwYXRoICsgJy8nICsgcmVzb2x2ZWRQYXRoO1xyXG4gICAgICAgICAgICByZXNvbHZlZEFic29sdXRlID0gcGF0aC5jaGFyQ29kZUF0KDApID09PSA0NyAvKi8qLztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEF0IHRoaXMgcG9pbnQgdGhlIHBhdGggc2hvdWxkIGJlIHJlc29sdmVkIHRvIGEgZnVsbCBhYnNvbHV0ZSBwYXRoLCBidXRcclxuICAgICAgICAvLyBoYW5kbGUgcmVsYXRpdmUgcGF0aHMgdG8gYmUgc2FmZSAobWlnaHQgaGFwcGVuIHdoZW4gcHJvY2Vzcy5jd2QoKSBmYWlscylcclxuXHJcbiAgICAgICAgLy8gTm9ybWFsaXplIHRoZSBwYXRoXHJcbiAgICAgICAgcmVzb2x2ZWRQYXRoID0gdGhpcy5ub3JtYWxpemVTdHJpbmdQb3NpeChyZXNvbHZlZFBhdGgsICFyZXNvbHZlZEFic29sdXRlKTtcclxuXHJcbiAgICAgICAgaWYgKHJlc29sdmVkQWJzb2x1dGUpIHtcclxuICAgICAgICAgICAgaWYgKHJlc29sdmVkUGF0aC5sZW5ndGggPiAwKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuICcvJyArIHJlc29sdmVkUGF0aDtcclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuICcvJztcclxuICAgICAgICB9IGVsc2UgaWYgKHJlc29sdmVkUGF0aC5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgIHJldHVybiByZXNvbHZlZFBhdGg7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuICcuJztcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIHJlbGF0aXZlKGZyb206IHN0cmluZywgdG86IHN0cmluZykge1xyXG5cclxuICAgICAgICBpZiAoZnJvbSA9PT0gdG8pIHJldHVybiAnJztcclxuXHJcbiAgICAgICAgZnJvbSA9IHRoaXMucG9zaXhSZXNvbHZlKGZyb20pO1xyXG4gICAgICAgIHRvID0gdGhpcy5wb3NpeFJlc29sdmUodG8pO1xyXG5cclxuICAgICAgICBpZiAoZnJvbSA9PT0gdG8pIHJldHVybiAnJztcclxuXHJcbiAgICAgICAgLy8gVHJpbSBhbnkgbGVhZGluZyBiYWNrc2xhc2hlc1xyXG4gICAgICAgIHZhciBmcm9tU3RhcnQgPSAxO1xyXG4gICAgICAgIGZvciAoOyBmcm9tU3RhcnQgPCBmcm9tLmxlbmd0aDsgKytmcm9tU3RhcnQpIHtcclxuICAgICAgICAgICAgaWYgKGZyb20uY2hhckNvZGVBdChmcm9tU3RhcnQpICE9PSA0NyAvKi8qLylcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgZnJvbUVuZCA9IGZyb20ubGVuZ3RoO1xyXG4gICAgICAgIHZhciBmcm9tTGVuID0gZnJvbUVuZCAtIGZyb21TdGFydDtcclxuXHJcbiAgICAgICAgLy8gVHJpbSBhbnkgbGVhZGluZyBiYWNrc2xhc2hlc1xyXG4gICAgICAgIHZhciB0b1N0YXJ0ID0gMTtcclxuICAgICAgICBmb3IgKDsgdG9TdGFydCA8IHRvLmxlbmd0aDsgKyt0b1N0YXJ0KSB7XHJcbiAgICAgICAgICAgIGlmICh0by5jaGFyQ29kZUF0KHRvU3RhcnQpICE9PSA0NyAvKi8qLylcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgdG9FbmQgPSB0by5sZW5ndGg7XHJcbiAgICAgICAgdmFyIHRvTGVuID0gdG9FbmQgLSB0b1N0YXJ0O1xyXG5cclxuICAgICAgICAvLyBDb21wYXJlIHBhdGhzIHRvIGZpbmQgdGhlIGxvbmdlc3QgY29tbW9uIHBhdGggZnJvbSByb290XHJcbiAgICAgICAgdmFyIGxlbmd0aCA9IGZyb21MZW4gPCB0b0xlbiA/IGZyb21MZW4gOiB0b0xlbjtcclxuICAgICAgICB2YXIgbGFzdENvbW1vblNlcCA9IC0xO1xyXG4gICAgICAgIHZhciBpID0gMDtcclxuICAgICAgICBmb3IgKDsgaSA8PSBsZW5ndGg7ICsraSkge1xyXG4gICAgICAgICAgICBpZiAoaSA9PT0gbGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodG9MZW4gPiBsZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodG8uY2hhckNvZGVBdCh0b1N0YXJ0ICsgaSkgPT09IDQ3IC8qLyovKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFdlIGdldCBoZXJlIGlmIGBmcm9tYCBpcyB0aGUgZXhhY3QgYmFzZSBwYXRoIGZvciBgdG9gLlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBGb3IgZXhhbXBsZTogZnJvbT0nL2Zvby9iYXInOyB0bz0nL2Zvby9iYXIvYmF6J1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdG8uc2xpY2UodG9TdGFydCArIGkgKyAxKTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGkgPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gV2UgZ2V0IGhlcmUgaWYgYGZyb21gIGlzIHRoZSByb290XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIEZvciBleGFtcGxlOiBmcm9tPScvJzsgdG89Jy9mb28nXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0by5zbGljZSh0b1N0YXJ0ICsgaSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChmcm9tTGVuID4gbGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGZyb20uY2hhckNvZGVBdChmcm9tU3RhcnQgKyBpKSA9PT0gNDcgLyovKi8pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gV2UgZ2V0IGhlcmUgaWYgYHRvYCBpcyB0aGUgZXhhY3QgYmFzZSBwYXRoIGZvciBgZnJvbWAuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIEZvciBleGFtcGxlOiBmcm9tPScvZm9vL2Jhci9iYXonOyB0bz0nL2Zvby9iYXInXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhc3RDb21tb25TZXAgPSBpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoaSA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBXZSBnZXQgaGVyZSBpZiBgdG9gIGlzIHRoZSByb290LlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBGb3IgZXhhbXBsZTogZnJvbT0nL2Zvbyc7IHRvPScvJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsYXN0Q29tbW9uU2VwID0gMDtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB2YXIgZnJvbUNvZGUgPSBmcm9tLmNoYXJDb2RlQXQoZnJvbVN0YXJ0ICsgaSk7XHJcbiAgICAgICAgICAgIHZhciB0b0NvZGUgPSB0by5jaGFyQ29kZUF0KHRvU3RhcnQgKyBpKTtcclxuICAgICAgICAgICAgaWYgKGZyb21Db2RlICE9PSB0b0NvZGUpXHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgZWxzZSBpZiAoZnJvbUNvZGUgPT09IDQ3IC8qLyovKVxyXG4gICAgICAgICAgICAgICAgbGFzdENvbW1vblNlcCA9IGk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB2YXIgb3V0ID0gJyc7XHJcbiAgICAgICAgLy8gR2VuZXJhdGUgdGhlIHJlbGF0aXZlIHBhdGggYmFzZWQgb24gdGhlIHBhdGggZGlmZmVyZW5jZSBiZXR3ZWVuIGB0b2BcclxuICAgICAgICAvLyBhbmQgYGZyb21gXHJcbiAgICAgICAgZm9yIChpID0gZnJvbVN0YXJ0ICsgbGFzdENvbW1vblNlcCArIDE7IGkgPD0gZnJvbUVuZDsgKytpKSB7XHJcbiAgICAgICAgICAgIGlmIChpID09PSBmcm9tRW5kIHx8IGZyb20uY2hhckNvZGVBdChpKSA9PT0gNDcgLyovKi8pIHtcclxuICAgICAgICAgICAgICAgIGlmIChvdXQubGVuZ3RoID09PSAwKVxyXG4gICAgICAgICAgICAgICAgICAgIG91dCArPSAnLi4nO1xyXG4gICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgICAgIG91dCArPSAnLy4uJztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gTGFzdGx5LCBhcHBlbmQgdGhlIHJlc3Qgb2YgdGhlIGRlc3RpbmF0aW9uIChgdG9gKSBwYXRoIHRoYXQgY29tZXMgYWZ0ZXJcclxuICAgICAgICAvLyB0aGUgY29tbW9uIHBhdGggcGFydHNcclxuICAgICAgICBpZiAob3V0Lmxlbmd0aCA+IDApXHJcbiAgICAgICAgICAgIHJldHVybiBvdXQgKyB0by5zbGljZSh0b1N0YXJ0ICsgbGFzdENvbW1vblNlcCk7XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHRvU3RhcnQgKz0gbGFzdENvbW1vblNlcDtcclxuICAgICAgICAgICAgaWYgKHRvLmNoYXJDb2RlQXQodG9TdGFydCkgPT09IDQ3IC8qLyovKVxyXG4gICAgICAgICAgICAgICAgKyt0b1N0YXJ0O1xyXG4gICAgICAgICAgICByZXR1cm4gdG8uc2xpY2UodG9TdGFydCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59IiwiaW1wb3J0IHsgQXBwLCBUQWJzdHJhY3RGaWxlLCBURmlsZSwgRW1iZWRDYWNoZSwgTGlua0NhY2hlLCBQb3MgfSBmcm9tICdvYnNpZGlhbic7XHJcbmltcG9ydCB7IFV0aWxzIH0gZnJvbSAnLi91dGlscyc7XHJcbmltcG9ydCB7IHBhdGggfSBmcm9tICcuL3BhdGgnO1xyXG5cclxuZXhwb3J0IGludGVyZmFjZSBQYXRoQ2hhbmdlSW5mbyB7XHJcblx0b2xkUGF0aDogc3RyaW5nLFxyXG5cdG5ld1BhdGg6IHN0cmluZyxcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBFbWJlZENoYW5nZUluZm8ge1xyXG5cdG9sZDogRW1iZWRDYWNoZSxcclxuXHRuZXdMaW5rOiBzdHJpbmcsXHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgTGlua0NoYW5nZUluZm8ge1xyXG5cdG9sZDogTGlua0NhY2hlLFxyXG5cdG5ld0xpbms6IHN0cmluZyxcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBMaW5rc0FuZEVtYmVkc0NoYW5nZWRJbmZvIHtcclxuXHRlbWJlZHM6IEVtYmVkQ2hhbmdlSW5mb1tdXHJcblx0bGlua3M6IExpbmtDaGFuZ2VJbmZvW11cclxufVxyXG5cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgTGlua1NlY3Rpb25JbmZvIHtcclxuXHRoYXNTZWN0aW9uOiBib29sZWFuXHJcblx0bGluazogc3RyaW5nXHJcblx0c2VjdGlvbjogc3RyaW5nXHJcbn1cclxuXHJcblxyXG4vL3NpbXBsZSByZWdleFxyXG4vLyBjb25zdCBtYXJrZG93bkxpbmtPckVtYmVkUmVnZXhTaW1wbGUgPSAvXFxbKC4qPylcXF1cXCgoLio/KVxcKS9naW1cclxuLy8gY29uc3QgbWFya2Rvd25MaW5rUmVnZXhTaW1wbGUgPSAvKD88IVxcISlcXFsoLio/KVxcXVxcKCguKj8pXFwpL2dpbTtcclxuLy8gY29uc3QgbWFya2Rvd25FbWJlZFJlZ2V4U2ltcGxlID0gL1xcIVxcWyguKj8pXFxdXFwoKC4qPylcXCkvZ2ltXHJcblxyXG4vLyBjb25zdCB3aWtpTGlua09yRW1iZWRSZWdleFNpbXBsZSA9IC9cXFtcXFsoLio/KVxcXVxcXS9naW1cclxuLy8gY29uc3Qgd2lraUxpbmtSZWdleFNpbXBsZSA9IC8oPzwhXFwhKVxcW1xcWyguKj8pXFxdXFxdL2dpbTtcclxuLy8gY29uc3Qgd2lraUVtYmVkUmVnZXhTaW1wbGUgPSAvXFwhXFxbXFxbKC4qPylcXF1cXF0vZ2ltXHJcblxyXG4vL3dpdGggZXNjYXBpbmcgXFwgY2hhcmFjdGVyc1xyXG5jb25zdCBtYXJrZG93bkxpbmtPckVtYmVkUmVnZXhHID0gLyg/PCFcXFxcKVxcWyguKj8pKD88IVxcXFwpXFxdXFwoKC4qPykoPzwhXFxcXClcXCkvZ2ltXHJcbmNvbnN0IG1hcmtkb3duTGlua1JlZ2V4RyA9IC8oPzwhXFwhKSg/PCFcXFxcKVxcWyguKj8pKD88IVxcXFwpXFxdXFwoKC4qPykoPzwhXFxcXCkoPzojKC4qPykpP1xcKS9naW07XHJcbmNvbnN0IG1hcmtkb3duRW1iZWRSZWdleEcgPSAvKD88IVxcXFwpXFwhXFxbKC4qPykoPzwhXFxcXClcXF1cXCgoLio/KSg/PCFcXFxcKVxcKS9naW1cclxuXHJcbmNvbnN0IHdpa2lMaW5rT3JFbWJlZFJlZ2V4RyA9IC8oPzwhXFxcXClcXFtcXFsoLio/KSg/PCFcXFxcKVxcXVxcXS9naW1cclxuY29uc3Qgd2lraUxpbmtSZWdleEcgPSAvKD88IVxcISkoPzwhXFxcXClcXFtcXFsoLio/KSg/PCFcXFxcKVxcXVxcXS9naW07XHJcbmNvbnN0IHdpa2lFbWJlZFJlZ2V4RyA9IC8oPzwhXFxcXClcXCFcXFtcXFsoLio/KSg/PCFcXFxcKVxcXVxcXS9naW1cclxuXHJcbmNvbnN0IG1hcmtkb3duTGlua09yRW1iZWRSZWdleCA9IC8oPzwhXFxcXClcXFsoLio/KSg/PCFcXFxcKVxcXVxcKCguKj8pKD88IVxcXFwpXFwpL2ltXHJcbmNvbnN0IG1hcmtkb3duTGlua1JlZ2V4ID0gLyg/PCFcXCEpKD88IVxcXFwpXFxbKC4qPykoPzwhXFxcXClcXF1cXCgoLio/KSg/PCFcXFxcKVxcKS9pbTtcclxuY29uc3QgbWFya2Rvd25FbWJlZFJlZ2V4ID0gLyg/PCFcXFxcKVxcIVxcWyguKj8pKD88IVxcXFwpXFxdXFwoKC4qPykoPzwhXFxcXClcXCkvaW1cclxuXHJcbmNvbnN0IHdpa2lMaW5rT3JFbWJlZFJlZ2V4ID0gLyg/PCFcXFxcKVxcW1xcWyguKj8pKD88IVxcXFwpXFxdXFxdL2ltXHJcbmNvbnN0IHdpa2lMaW5rUmVnZXggPSAvKD88IVxcISkoPzwhXFxcXClcXFtcXFsoLio/KSg/PCFcXFxcKVxcXVxcXS9pbTtcclxuY29uc3Qgd2lraUVtYmVkUmVnZXggPSAvKD88IVxcXFwpXFwhXFxbXFxbKC4qPykoPzwhXFxcXClcXF1cXF0vaW1cclxuXHJcblxyXG5leHBvcnQgY2xhc3MgTGlua3NIYW5kbGVyIHtcclxuXHJcblx0Y29uc3RydWN0b3IoXHJcblx0XHRwcml2YXRlIGFwcDogQXBwLFxyXG5cdFx0cHJpdmF0ZSBjb25zb2xlTG9nUHJlZml4OiBzdHJpbmcgPSBcIlwiLFxyXG5cdFx0cHJpdmF0ZSBpZ25vcmVGb2xkZXJzOiBzdHJpbmdbXSA9IFtdLFxyXG5cdFx0cHJpdmF0ZSBpZ25vcmVGaWxlc1JlZ2V4OiBSZWdFeHBbXSA9IFtdLFxyXG5cdCkgeyB9XHJcblxyXG5cdGlzUGF0aElnbm9yZWQocGF0aDogc3RyaW5nKTogYm9vbGVhbiB7XHJcblx0XHRpZiAocGF0aC5zdGFydHNXaXRoKFwiLi9cIikpXHJcblx0XHRcdHBhdGggPSBwYXRoLnN1YnN0cmluZygyKTtcclxuXHJcblx0XHRmb3IgKGxldCBmb2xkZXIgb2YgdGhpcy5pZ25vcmVGb2xkZXJzKSB7XHJcblx0XHRcdGlmIChwYXRoLnN0YXJ0c1dpdGgoZm9sZGVyKSkge1xyXG5cdFx0XHRcdHJldHVybiB0cnVlO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0Zm9yIChsZXQgZmlsZVJlZ2V4IG9mIHRoaXMuaWdub3JlRmlsZXNSZWdleCkge1xyXG5cdFx0XHRpZiAoZmlsZVJlZ2V4LnRlc3QocGF0aCkpIHtcclxuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0Y2hlY2tJc0NvcnJlY3RNYXJrZG93bkVtYmVkKHRleHQ6IHN0cmluZykge1xyXG5cdFx0bGV0IGVsZW1lbnRzID0gdGV4dC5tYXRjaChtYXJrZG93bkVtYmVkUmVnZXhHKTtcclxuXHRcdHJldHVybiAoZWxlbWVudHMgIT0gbnVsbCAmJiBlbGVtZW50cy5sZW5ndGggPiAwKVxyXG5cdH1cclxuXHJcblx0Y2hlY2tJc0NvcnJlY3RNYXJrZG93bkxpbmsodGV4dDogc3RyaW5nKSB7XHJcblx0XHRsZXQgZWxlbWVudHMgPSB0ZXh0Lm1hdGNoKG1hcmtkb3duTGlua1JlZ2V4Ryk7XHJcblx0XHRyZXR1cm4gKGVsZW1lbnRzICE9IG51bGwgJiYgZWxlbWVudHMubGVuZ3RoID4gMClcclxuXHR9XHJcblxyXG5cdGNoZWNrSXNDb3JyZWN0TWFya2Rvd25FbWJlZE9yTGluayh0ZXh0OiBzdHJpbmcpIHtcclxuXHRcdGxldCBlbGVtZW50cyA9IHRleHQubWF0Y2gobWFya2Rvd25MaW5rT3JFbWJlZFJlZ2V4Ryk7XHJcblx0XHRyZXR1cm4gKGVsZW1lbnRzICE9IG51bGwgJiYgZWxlbWVudHMubGVuZ3RoID4gMClcclxuXHR9XHJcblxyXG5cdGNoZWNrSXNDb3JyZWN0V2lraUVtYmVkKHRleHQ6IHN0cmluZykge1xyXG5cdFx0bGV0IGVsZW1lbnRzID0gdGV4dC5tYXRjaCh3aWtpRW1iZWRSZWdleEcpO1xyXG5cdFx0cmV0dXJuIChlbGVtZW50cyAhPSBudWxsICYmIGVsZW1lbnRzLmxlbmd0aCA+IDApXHJcblx0fVxyXG5cclxuXHRjaGVja0lzQ29ycmVjdFdpa2lMaW5rKHRleHQ6IHN0cmluZykge1xyXG5cdFx0bGV0IGVsZW1lbnRzID0gdGV4dC5tYXRjaCh3aWtpTGlua1JlZ2V4Ryk7XHJcblx0XHRyZXR1cm4gKGVsZW1lbnRzICE9IG51bGwgJiYgZWxlbWVudHMubGVuZ3RoID4gMClcclxuXHR9XHJcblxyXG5cdGNoZWNrSXNDb3JyZWN0V2lraUVtYmVkT3JMaW5rKHRleHQ6IHN0cmluZykge1xyXG5cdFx0bGV0IGVsZW1lbnRzID0gdGV4dC5tYXRjaCh3aWtpTGlua09yRW1iZWRSZWdleEcpO1xyXG5cdFx0cmV0dXJuIChlbGVtZW50cyAhPSBudWxsICYmIGVsZW1lbnRzLmxlbmd0aCA+IDApXHJcblx0fVxyXG5cclxuXHJcblx0Z2V0RmlsZUJ5TGluayhsaW5rOiBzdHJpbmcsIG93bmluZ05vdGVQYXRoOiBzdHJpbmcsIGFsbG93SW52YWxpZExpbms6IGJvb2xlYW4gPSB0cnVlKTogVEZpbGUge1xyXG5cdFx0bGluayA9IHRoaXMuc3BsaXRMaW5rVG9QYXRoQW5kU2VjdGlvbihsaW5rKS5saW5rO1xyXG5cdFx0aWYgKGFsbG93SW52YWxpZExpbmspIHtcclxuXHRcdFx0cmV0dXJuIHRoaXMuYXBwLm1ldGFkYXRhQ2FjaGUuZ2V0Rmlyc3RMaW5rcGF0aERlc3QobGluaywgb3duaW5nTm90ZVBhdGgpO1xyXG5cdFx0fVxyXG5cdFx0bGV0IGZ1bGxQYXRoID0gdGhpcy5nZXRGdWxsUGF0aEZvckxpbmsobGluaywgb3duaW5nTm90ZVBhdGgpO1xyXG5cdFx0cmV0dXJuIHRoaXMuZ2V0RmlsZUJ5UGF0aChmdWxsUGF0aCk7XHJcblx0fVxyXG5cclxuXHJcblx0Z2V0RmlsZUJ5UGF0aChwYXRoOiBzdHJpbmcpOiBURmlsZSB7XHJcblx0XHRwYXRoID0gVXRpbHMubm9ybWFsaXplUGF0aEZvckZpbGUocGF0aCk7XHJcblx0XHRyZXR1cm4gYXBwLnZhdWx0LmdldEFic3RyYWN0RmlsZUJ5UGF0aChwYXRoKSBhcyBURmlsZTtcclxuXHR9XHJcblxyXG5cclxuXHRnZXRGdWxsUGF0aEZvckxpbmsobGluazogc3RyaW5nLCBvd25pbmdOb3RlUGF0aDogc3RyaW5nKTogc3RyaW5nIHtcclxuXHRcdGxpbmsgPSB0aGlzLnNwbGl0TGlua1RvUGF0aEFuZFNlY3Rpb24obGluaykubGluaztcclxuXHRcdGxpbmsgPSBVdGlscy5ub3JtYWxpemVQYXRoRm9yRmlsZShsaW5rKTtcclxuXHRcdG93bmluZ05vdGVQYXRoID0gVXRpbHMubm9ybWFsaXplUGF0aEZvckZpbGUob3duaW5nTm90ZVBhdGgpO1xyXG5cclxuXHRcdGxldCBwYXJlbnRGb2xkZXIgPSBvd25pbmdOb3RlUGF0aC5zdWJzdHJpbmcoMCwgb3duaW5nTm90ZVBhdGgubGFzdEluZGV4T2YoXCIvXCIpKTtcclxuXHRcdGxldCBmdWxsUGF0aCA9IHBhdGguam9pbihwYXJlbnRGb2xkZXIsIGxpbmspO1xyXG5cclxuXHRcdGZ1bGxQYXRoID0gVXRpbHMubm9ybWFsaXplUGF0aEZvckZpbGUoZnVsbFBhdGgpO1xyXG5cdFx0cmV0dXJuIGZ1bGxQYXRoO1xyXG5cdH1cclxuXHJcblxyXG5cdGFzeW5jIGdldEFsbENhY2hlZExpbmtzVG9GaWxlKGZpbGVQYXRoOiBzdHJpbmcpOiBQcm9taXNlPHsgW25vdGVQYXRoOiBzdHJpbmddOiBMaW5rQ2FjaGVbXTsgfT4ge1xyXG5cdFx0bGV0IGFsbExpbmtzOiB7IFtub3RlUGF0aDogc3RyaW5nXTogTGlua0NhY2hlW107IH0gPSB7fTtcclxuXHRcdGxldCBub3RlcyA9IHRoaXMuYXBwLnZhdWx0LmdldE1hcmtkb3duRmlsZXMoKTtcclxuXHJcblx0XHRpZiAobm90ZXMpIHtcclxuXHRcdFx0Zm9yIChsZXQgbm90ZSBvZiBub3Rlcykge1xyXG5cdFx0XHRcdGlmIChub3RlLnBhdGggPT0gZmlsZVBhdGgpXHJcblx0XHRcdFx0XHRjb250aW51ZTtcclxuXHJcblx0XHRcdFx0bGV0IGxpbmtzID0gKGF3YWl0IFV0aWxzLmdldENhY2hlU2FmZShub3RlLnBhdGgpKS5saW5rcztcclxuXHJcblx0XHRcdFx0aWYgKGxpbmtzKSB7XHJcblx0XHRcdFx0XHRmb3IgKGxldCBsaW5rIG9mIGxpbmtzKSB7XHJcblx0XHRcdFx0XHRcdGxldCBsaW5rRnVsbFBhdGggPSB0aGlzLmdldEZ1bGxQYXRoRm9yTGluayhsaW5rLmxpbmssIG5vdGUucGF0aCk7XHJcblx0XHRcdFx0XHRcdGlmIChsaW5rRnVsbFBhdGggPT0gZmlsZVBhdGgpIHtcclxuXHRcdFx0XHRcdFx0XHRpZiAoIWFsbExpbmtzW25vdGUucGF0aF0pXHJcblx0XHRcdFx0XHRcdFx0XHRhbGxMaW5rc1tub3RlLnBhdGhdID0gW107XHJcblx0XHRcdFx0XHRcdFx0YWxsTGlua3Nbbm90ZS5wYXRoXS5wdXNoKGxpbmspO1xyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIGFsbExpbmtzO1xyXG5cdH1cclxuXHJcblxyXG5cdGFzeW5jIGdldEFsbENhY2hlZEVtYmVkc1RvRmlsZShmaWxlUGF0aDogc3RyaW5nKTogUHJvbWlzZTx7IFtub3RlUGF0aDogc3RyaW5nXTogRW1iZWRDYWNoZVtdOyB9PiB7XHJcblx0XHRsZXQgYWxsRW1iZWRzOiB7IFtub3RlUGF0aDogc3RyaW5nXTogRW1iZWRDYWNoZVtdOyB9ID0ge307XHJcblx0XHRsZXQgbm90ZXMgPSB0aGlzLmFwcC52YXVsdC5nZXRNYXJrZG93bkZpbGVzKCk7XHJcblxyXG5cdFx0aWYgKG5vdGVzKSB7XHJcblx0XHRcdGZvciAobGV0IG5vdGUgb2Ygbm90ZXMpIHtcclxuXHRcdFx0XHRpZiAobm90ZS5wYXRoID09IGZpbGVQYXRoKVxyXG5cdFx0XHRcdFx0Y29udGludWU7XHJcblxyXG5cdFx0XHRcdC8vISEhIHRoaXMgY2FuIHJldHVybiB1bmRlZmluZWQgaWYgbm90ZSB3YXMganVzdCB1cGRhdGVkXHJcblx0XHRcdFx0bGV0IGVtYmVkcyA9IChhd2FpdCBVdGlscy5nZXRDYWNoZVNhZmUobm90ZS5wYXRoKSkuZW1iZWRzO1xyXG5cclxuXHRcdFx0XHRpZiAoZW1iZWRzKSB7XHJcblx0XHRcdFx0XHRmb3IgKGxldCBlbWJlZCBvZiBlbWJlZHMpIHtcclxuXHRcdFx0XHRcdFx0bGV0IGxpbmtGdWxsUGF0aCA9IHRoaXMuZ2V0RnVsbFBhdGhGb3JMaW5rKGVtYmVkLmxpbmssIG5vdGUucGF0aCk7XHJcblx0XHRcdFx0XHRcdGlmIChsaW5rRnVsbFBhdGggPT0gZmlsZVBhdGgpIHtcclxuXHRcdFx0XHRcdFx0XHRpZiAoIWFsbEVtYmVkc1tub3RlLnBhdGhdKVxyXG5cdFx0XHRcdFx0XHRcdFx0YWxsRW1iZWRzW25vdGUucGF0aF0gPSBbXTtcclxuXHRcdFx0XHRcdFx0XHRhbGxFbWJlZHNbbm90ZS5wYXRoXS5wdXNoKGVtYmVkKTtcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiBhbGxFbWJlZHM7XHJcblx0fVxyXG5cclxuXHJcblxyXG5cdGFzeW5jIGdldEFsbEJhZExpbmtzKCk6IFByb21pc2U8eyBbbm90ZVBhdGg6IHN0cmluZ106IExpbmtDYWNoZVtdOyB9PiB7XHJcblx0XHRsZXQgYWxsTGlua3M6IHsgW25vdGVQYXRoOiBzdHJpbmddOiBMaW5rQ2FjaGVbXTsgfSA9IHt9O1xyXG5cdFx0bGV0IG5vdGVzID0gdGhpcy5hcHAudmF1bHQuZ2V0TWFya2Rvd25GaWxlcygpO1xyXG5cclxuXHRcdGlmIChub3Rlcykge1xyXG5cdFx0XHRmb3IgKGxldCBub3RlIG9mIG5vdGVzKSB7XHJcblx0XHRcdFx0aWYgKHRoaXMuaXNQYXRoSWdub3JlZChub3RlLnBhdGgpKVxyXG5cdFx0XHRcdFx0Y29udGludWU7XHJcblxyXG5cdFx0XHRcdC8vISEhIHRoaXMgY2FuIHJldHVybiB1bmRlZmluZWQgaWYgbm90ZSB3YXMganVzdCB1cGRhdGVkXHJcblx0XHRcdFx0bGV0IGxpbmtzID0gKGF3YWl0IFV0aWxzLmdldENhY2hlU2FmZShub3RlLnBhdGgpKS5saW5rcztcclxuXHJcblx0XHRcdFx0aWYgKGxpbmtzKSB7XHJcblx0XHRcdFx0XHRmb3IgKGxldCBsaW5rIG9mIGxpbmtzKSB7XHJcblx0XHRcdFx0XHRcdGlmIChsaW5rLmxpbmsuc3RhcnRzV2l0aChcIiNcIikpIC8vaW50ZXJuYWwgc2VjdGlvbiBsaW5rXHJcblx0XHRcdFx0XHRcdFx0Y29udGludWU7XHJcblxyXG5cdFx0XHRcdFx0XHRpZiAodGhpcy5jaGVja0lzQ29ycmVjdFdpa2lMaW5rKGxpbmsub3JpZ2luYWwpKVxyXG5cdFx0XHRcdFx0XHRcdGNvbnRpbnVlO1xyXG5cclxuXHRcdFx0XHRcdFx0bGV0IGZpbGUgPSB0aGlzLmdldEZpbGVCeUxpbmsobGluay5saW5rLCBub3RlLnBhdGgsIGZhbHNlKTtcclxuXHRcdFx0XHRcdFx0aWYgKCFmaWxlKSB7XHJcblx0XHRcdFx0XHRcdFx0aWYgKCFhbGxMaW5rc1tub3RlLnBhdGhdKVxyXG5cdFx0XHRcdFx0XHRcdFx0YWxsTGlua3Nbbm90ZS5wYXRoXSA9IFtdO1xyXG5cdFx0XHRcdFx0XHRcdGFsbExpbmtzW25vdGUucGF0aF0ucHVzaChsaW5rKTtcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiBhbGxMaW5rcztcclxuXHR9XHJcblxyXG5cdGFzeW5jIGdldEFsbEJhZEVtYmVkcygpOiBQcm9taXNlPHsgW25vdGVQYXRoOiBzdHJpbmddOiBFbWJlZENhY2hlW107IH0+IHtcclxuXHRcdGxldCBhbGxFbWJlZHM6IHsgW25vdGVQYXRoOiBzdHJpbmddOiBFbWJlZENhY2hlW107IH0gPSB7fTtcclxuXHRcdGxldCBub3RlcyA9IHRoaXMuYXBwLnZhdWx0LmdldE1hcmtkb3duRmlsZXMoKTtcclxuXHJcblx0XHRpZiAobm90ZXMpIHtcclxuXHRcdFx0Zm9yIChsZXQgbm90ZSBvZiBub3Rlcykge1xyXG5cdFx0XHRcdGlmICh0aGlzLmlzUGF0aElnbm9yZWQobm90ZS5wYXRoKSlcclxuXHRcdFx0XHRcdGNvbnRpbnVlO1xyXG5cclxuXHRcdFx0XHQvLyEhISB0aGlzIGNhbiByZXR1cm4gdW5kZWZpbmVkIGlmIG5vdGUgd2FzIGp1c3QgdXBkYXRlZFxyXG5cdFx0XHRcdGxldCBlbWJlZHMgPSAoYXdhaXQgVXRpbHMuZ2V0Q2FjaGVTYWZlKG5vdGUucGF0aCkpLmVtYmVkcztcclxuXHJcblx0XHRcdFx0aWYgKGVtYmVkcykge1xyXG5cdFx0XHRcdFx0Zm9yIChsZXQgZW1iZWQgb2YgZW1iZWRzKSB7XHJcblx0XHRcdFx0XHRcdGlmICh0aGlzLmNoZWNrSXNDb3JyZWN0V2lraUVtYmVkKGVtYmVkLm9yaWdpbmFsKSlcclxuXHRcdFx0XHRcdFx0XHRjb250aW51ZTtcclxuXHJcblx0XHRcdFx0XHRcdGxldCBmaWxlID0gdGhpcy5nZXRGaWxlQnlMaW5rKGVtYmVkLmxpbmssIG5vdGUucGF0aCwgZmFsc2UpO1xyXG5cdFx0XHRcdFx0XHRpZiAoIWZpbGUpIHtcclxuXHRcdFx0XHRcdFx0XHRpZiAoIWFsbEVtYmVkc1tub3RlLnBhdGhdKVxyXG5cdFx0XHRcdFx0XHRcdFx0YWxsRW1iZWRzW25vdGUucGF0aF0gPSBbXTtcclxuXHRcdFx0XHRcdFx0XHRhbGxFbWJlZHNbbm90ZS5wYXRoXS5wdXNoKGVtYmVkKTtcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiBhbGxFbWJlZHM7XHJcblx0fVxyXG5cclxuXHJcblx0YXN5bmMgZ2V0QWxsR29vZExpbmtzKCk6IFByb21pc2U8eyBbbm90ZVBhdGg6IHN0cmluZ106IExpbmtDYWNoZVtdOyB9PiB7XHJcblx0XHRsZXQgYWxsTGlua3M6IHsgW25vdGVQYXRoOiBzdHJpbmddOiBMaW5rQ2FjaGVbXTsgfSA9IHt9O1xyXG5cdFx0bGV0IG5vdGVzID0gdGhpcy5hcHAudmF1bHQuZ2V0TWFya2Rvd25GaWxlcygpO1xyXG5cclxuXHRcdGlmIChub3Rlcykge1xyXG5cdFx0XHRmb3IgKGxldCBub3RlIG9mIG5vdGVzKSB7XHJcblx0XHRcdFx0aWYgKHRoaXMuaXNQYXRoSWdub3JlZChub3RlLnBhdGgpKVxyXG5cdFx0XHRcdFx0Y29udGludWU7XHJcblxyXG5cdFx0XHRcdC8vISEhIHRoaXMgY2FuIHJldHVybiB1bmRlZmluZWQgaWYgbm90ZSB3YXMganVzdCB1cGRhdGVkXHJcblx0XHRcdFx0bGV0IGxpbmtzID0gKGF3YWl0IFV0aWxzLmdldENhY2hlU2FmZShub3RlLnBhdGgpKS5saW5rcztcclxuXHJcblx0XHRcdFx0aWYgKGxpbmtzKSB7XHJcblx0XHRcdFx0XHRmb3IgKGxldCBsaW5rIG9mIGxpbmtzKSB7XHJcblx0XHRcdFx0XHRcdGlmIChsaW5rLmxpbmsuc3RhcnRzV2l0aChcIiNcIikpIC8vaW50ZXJuYWwgc2VjdGlvbiBsaW5rXHJcblx0XHRcdFx0XHRcdFx0Y29udGludWU7XHJcblxyXG5cdFx0XHRcdFx0XHRpZiAodGhpcy5jaGVja0lzQ29ycmVjdFdpa2lMaW5rKGxpbmsub3JpZ2luYWwpKVxyXG5cdFx0XHRcdFx0XHRcdGNvbnRpbnVlO1xyXG5cclxuXHRcdFx0XHRcdFx0bGV0IGZpbGUgPSB0aGlzLmdldEZpbGVCeUxpbmsobGluay5saW5rLCBub3RlLnBhdGgpO1xyXG5cdFx0XHRcdFx0XHRpZiAoZmlsZSkge1xyXG5cdFx0XHRcdFx0XHRcdGlmICghYWxsTGlua3Nbbm90ZS5wYXRoXSlcclxuXHRcdFx0XHRcdFx0XHRcdGFsbExpbmtzW25vdGUucGF0aF0gPSBbXTtcclxuXHRcdFx0XHRcdFx0XHRhbGxMaW5rc1tub3RlLnBhdGhdLnB1c2gobGluayk7XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gYWxsTGlua3M7XHJcblx0fVxyXG5cclxuXHRhc3luYyBnZXRBbGxCYWRTZWN0aW9uTGlua3MoKTogUHJvbWlzZTx7IFtub3RlUGF0aDogc3RyaW5nXTogTGlua0NhY2hlW107IH0+IHtcclxuXHRcdGxldCBhbGxMaW5rczogeyBbbm90ZVBhdGg6IHN0cmluZ106IExpbmtDYWNoZVtdOyB9ID0ge307XHJcblx0XHRsZXQgbm90ZXMgPSB0aGlzLmFwcC52YXVsdC5nZXRNYXJrZG93bkZpbGVzKCk7XHJcblxyXG5cdFx0aWYgKG5vdGVzKSB7XHJcblx0XHRcdGZvciAobGV0IG5vdGUgb2Ygbm90ZXMpIHtcclxuXHRcdFx0XHRpZiAodGhpcy5pc1BhdGhJZ25vcmVkKG5vdGUucGF0aCkpXHJcblx0XHRcdFx0XHRjb250aW51ZTtcclxuXHJcblx0XHRcdFx0Ly8hISEgdGhpcyBjYW4gcmV0dXJuIHVuZGVmaW5lZCBpZiBub3RlIHdhcyBqdXN0IHVwZGF0ZWRcclxuXHRcdFx0XHRsZXQgbGlua3MgPSAoYXdhaXQgVXRpbHMuZ2V0Q2FjaGVTYWZlKG5vdGUucGF0aCkpLmxpbmtzO1xyXG5cdFx0XHRcdGlmIChsaW5rcykge1xyXG5cdFx0XHRcdFx0Zm9yIChsZXQgbGluayBvZiBsaW5rcykge1xyXG5cdFx0XHRcdFx0XHRpZiAodGhpcy5jaGVja0lzQ29ycmVjdFdpa2lMaW5rKGxpbmsub3JpZ2luYWwpKVxyXG5cdFx0XHRcdFx0XHRcdGNvbnRpbnVlO1xyXG5cclxuXHRcdFx0XHRcdFx0bGV0IGxpID0gdGhpcy5zcGxpdExpbmtUb1BhdGhBbmRTZWN0aW9uKGxpbmsubGluayk7XHJcblx0XHRcdFx0XHRcdGlmICghbGkuaGFzU2VjdGlvbilcclxuXHRcdFx0XHRcdFx0XHRjb250aW51ZTtcclxuXHJcblx0XHRcdFx0XHRcdGxldCBmaWxlID0gdGhpcy5nZXRGaWxlQnlMaW5rKGxpbmsubGluaywgbm90ZS5wYXRoLCBmYWxzZSk7XHJcblx0XHRcdFx0XHRcdGlmIChmaWxlKSB7XHJcblx0XHRcdFx0XHRcdFx0aWYgKGZpbGUuZXh0ZW5zaW9uID09PSBcInBkZlwiICYmIGxpLnNlY3Rpb24uc3RhcnRzV2l0aChcInBhZ2U9XCIpKSB7XHJcblx0XHRcdFx0XHRcdFx0XHRjb250aW51ZTtcclxuXHRcdFx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0XHRcdGxldCB0ZXh0ID0gYXdhaXQgdGhpcy5hcHAudmF1bHQucmVhZChmaWxlKTtcclxuXHRcdFx0XHRcdFx0XHRsZXQgc2VjdGlvbiA9IFV0aWxzLm5vcm1hbGl6ZUxpbmtTZWN0aW9uKGxpLnNlY3Rpb24pO1xyXG5cclxuXHRcdFx0XHRcdFx0XHRpZiAoc2VjdGlvbi5zdGFydHNXaXRoKFwiXlwiKSkgLy9za2lwIF4gbGlua3NcclxuXHRcdFx0XHRcdFx0XHRcdGNvbnRpbnVlO1xyXG5cclxuXHRcdFx0XHRcdFx0XHRsZXQgcmVnZXggPSAvWyAhQCQlXiYqKCktPV8rXFxcXC87J1xcW1xcXVxcXCJcXHxcXD8uXFwsXFw8XFw+XFxgXFx+XFx7XFx9XS9naW07XHJcblx0XHRcdFx0XHRcdFx0dGV4dCA9IHRleHQucmVwbGFjZShyZWdleCwgJycpO1xyXG5cdFx0XHRcdFx0XHRcdHNlY3Rpb24gPSBzZWN0aW9uLnJlcGxhY2UocmVnZXgsICcnKTtcclxuXHJcblx0XHRcdFx0XHRcdFx0aWYgKCF0ZXh0LmNvbnRhaW5zKFwiI1wiICsgc2VjdGlvbikpIHtcclxuXHRcdFx0XHRcdFx0XHRcdGlmICghYWxsTGlua3Nbbm90ZS5wYXRoXSlcclxuXHRcdFx0XHRcdFx0XHRcdFx0YWxsTGlua3Nbbm90ZS5wYXRoXSA9IFtdO1xyXG5cdFx0XHRcdFx0XHRcdFx0YWxsTGlua3Nbbm90ZS5wYXRoXS5wdXNoKGxpbmspO1xyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiBhbGxMaW5rcztcclxuXHR9XHJcblxyXG5cdGFzeW5jIGdldEFsbEdvb2RFbWJlZHMoKTogUHJvbWlzZTx7IFtub3RlUGF0aDogc3RyaW5nXTogRW1iZWRDYWNoZVtdOyB9PiB7XHJcblx0XHRsZXQgYWxsRW1iZWRzOiB7IFtub3RlUGF0aDogc3RyaW5nXTogRW1iZWRDYWNoZVtdOyB9ID0ge307XHJcblx0XHRsZXQgbm90ZXMgPSB0aGlzLmFwcC52YXVsdC5nZXRNYXJrZG93bkZpbGVzKCk7XHJcblxyXG5cdFx0aWYgKG5vdGVzKSB7XHJcblx0XHRcdGZvciAobGV0IG5vdGUgb2Ygbm90ZXMpIHtcclxuXHRcdFx0XHRpZiAodGhpcy5pc1BhdGhJZ25vcmVkKG5vdGUucGF0aCkpXHJcblx0XHRcdFx0XHRjb250aW51ZTtcclxuXHJcblx0XHRcdFx0Ly8hISEgdGhpcyBjYW4gcmV0dXJuIHVuZGVmaW5lZCBpZiBub3RlIHdhcyBqdXN0IHVwZGF0ZWRcclxuXHRcdFx0XHRsZXQgZW1iZWRzID0gKGF3YWl0IFV0aWxzLmdldENhY2hlU2FmZShub3RlLnBhdGgpKS5lbWJlZHM7XHJcblxyXG5cdFx0XHRcdGlmIChlbWJlZHMpIHtcclxuXHRcdFx0XHRcdGZvciAobGV0IGVtYmVkIG9mIGVtYmVkcykge1xyXG5cdFx0XHRcdFx0XHRpZiAodGhpcy5jaGVja0lzQ29ycmVjdFdpa2lFbWJlZChlbWJlZC5vcmlnaW5hbCkpXHJcblx0XHRcdFx0XHRcdFx0Y29udGludWU7XHJcblxyXG5cdFx0XHRcdFx0XHRsZXQgZmlsZSA9IHRoaXMuZ2V0RmlsZUJ5TGluayhlbWJlZC5saW5rLCBub3RlLnBhdGgpO1xyXG5cdFx0XHRcdFx0XHRpZiAoZmlsZSkge1xyXG5cdFx0XHRcdFx0XHRcdGlmICghYWxsRW1iZWRzW25vdGUucGF0aF0pXHJcblx0XHRcdFx0XHRcdFx0XHRhbGxFbWJlZHNbbm90ZS5wYXRoXSA9IFtdO1xyXG5cdFx0XHRcdFx0XHRcdGFsbEVtYmVkc1tub3RlLnBhdGhdLnB1c2goZW1iZWQpO1xyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIGFsbEVtYmVkcztcclxuXHR9XHJcblxyXG5cdGFzeW5jIGdldEFsbFdpa2lMaW5rcygpOiBQcm9taXNlPHsgW25vdGVQYXRoOiBzdHJpbmddOiBMaW5rQ2FjaGVbXTsgfT4ge1xyXG5cdFx0bGV0IGFsbExpbmtzOiB7IFtub3RlUGF0aDogc3RyaW5nXTogTGlua0NhY2hlW107IH0gPSB7fTtcclxuXHRcdGxldCBub3RlcyA9IHRoaXMuYXBwLnZhdWx0LmdldE1hcmtkb3duRmlsZXMoKTtcclxuXHJcblx0XHRpZiAobm90ZXMpIHtcclxuXHRcdFx0Zm9yIChsZXQgbm90ZSBvZiBub3Rlcykge1xyXG5cdFx0XHRcdGlmICh0aGlzLmlzUGF0aElnbm9yZWQobm90ZS5wYXRoKSlcclxuXHRcdFx0XHRcdGNvbnRpbnVlO1xyXG5cclxuXHRcdFx0XHQvLyEhISB0aGlzIGNhbiByZXR1cm4gdW5kZWZpbmVkIGlmIG5vdGUgd2FzIGp1c3QgdXBkYXRlZFxyXG5cdFx0XHRcdGxldCBsaW5rcyA9IChhd2FpdCBVdGlscy5nZXRDYWNoZVNhZmUobm90ZS5wYXRoKSkubGlua3M7XHJcblxyXG5cdFx0XHRcdGlmIChsaW5rcykge1xyXG5cdFx0XHRcdFx0Zm9yIChsZXQgbGluayBvZiBsaW5rcykge1xyXG5cdFx0XHRcdFx0XHRpZiAoIXRoaXMuY2hlY2tJc0NvcnJlY3RXaWtpTGluayhsaW5rLm9yaWdpbmFsKSlcclxuXHRcdFx0XHRcdFx0XHRjb250aW51ZTtcclxuXHJcblx0XHRcdFx0XHRcdGlmICghYWxsTGlua3Nbbm90ZS5wYXRoXSlcclxuXHRcdFx0XHRcdFx0XHRhbGxMaW5rc1tub3RlLnBhdGhdID0gW107XHJcblx0XHRcdFx0XHRcdGFsbExpbmtzW25vdGUucGF0aF0ucHVzaChsaW5rKTtcclxuXHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIGFsbExpbmtzO1xyXG5cdH1cclxuXHJcblx0YXN5bmMgZ2V0QWxsV2lraUVtYmVkcygpOiBQcm9taXNlPHsgW25vdGVQYXRoOiBzdHJpbmddOiBFbWJlZENhY2hlW107IH0+IHtcclxuXHRcdGxldCBhbGxFbWJlZHM6IHsgW25vdGVQYXRoOiBzdHJpbmddOiBFbWJlZENhY2hlW107IH0gPSB7fTtcclxuXHRcdGxldCBub3RlcyA9IHRoaXMuYXBwLnZhdWx0LmdldE1hcmtkb3duRmlsZXMoKTtcclxuXHJcblx0XHRpZiAobm90ZXMpIHtcclxuXHRcdFx0Zm9yIChsZXQgbm90ZSBvZiBub3Rlcykge1xyXG5cdFx0XHRcdGlmICh0aGlzLmlzUGF0aElnbm9yZWQobm90ZS5wYXRoKSlcclxuXHRcdFx0XHRcdGNvbnRpbnVlO1xyXG5cclxuXHRcdFx0XHQvLyEhISB0aGlzIGNhbiByZXR1cm4gdW5kZWZpbmVkIGlmIG5vdGUgd2FzIGp1c3QgdXBkYXRlZFxyXG5cdFx0XHRcdGxldCBlbWJlZHMgPSAoYXdhaXQgVXRpbHMuZ2V0Q2FjaGVTYWZlKG5vdGUucGF0aCkpLmVtYmVkcztcclxuXHJcblx0XHRcdFx0aWYgKGVtYmVkcykge1xyXG5cdFx0XHRcdFx0Zm9yIChsZXQgZW1iZWQgb2YgZW1iZWRzKSB7XHJcblx0XHRcdFx0XHRcdGlmICghdGhpcy5jaGVja0lzQ29ycmVjdFdpa2lFbWJlZChlbWJlZC5vcmlnaW5hbCkpXHJcblx0XHRcdFx0XHRcdFx0Y29udGludWU7XHJcblxyXG5cdFx0XHRcdFx0XHRpZiAoIWFsbEVtYmVkc1tub3RlLnBhdGhdKVxyXG5cdFx0XHRcdFx0XHRcdGFsbEVtYmVkc1tub3RlLnBhdGhdID0gW107XHJcblx0XHRcdFx0XHRcdGFsbEVtYmVkc1tub3RlLnBhdGhdLnB1c2goZW1iZWQpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiBhbGxFbWJlZHM7XHJcblx0fVxyXG5cclxuXHJcblx0YXN5bmMgdXBkYXRlTGlua3NUb1JlbmFtZWRGaWxlKG9sZE5vdGVQYXRoOiBzdHJpbmcsIG5ld05vdGVQYXRoOiBzdHJpbmcsIGNoYW5nZWxpbmtzQWx0ID0gZmFsc2UsIHVzZUJ1aWx0SW5PYnNpZGlhbkxpbmtDYWNoaW5nID0gZmFsc2UpIHtcclxuXHRcdGlmICh0aGlzLmlzUGF0aElnbm9yZWQob2xkTm90ZVBhdGgpIHx8IHRoaXMuaXNQYXRoSWdub3JlZChuZXdOb3RlUGF0aCkpXHJcblx0XHRcdHJldHVybjtcclxuXHJcblx0XHRsZXQgbm90ZXMgPSB1c2VCdWlsdEluT2JzaWRpYW5MaW5rQ2FjaGluZyA/IGF3YWl0IHRoaXMuZ2V0Q2FjaGVkTm90ZXNUaGF0SGF2ZUxpbmtUb0ZpbGUob2xkTm90ZVBhdGgpIDogYXdhaXQgdGhpcy5nZXROb3Rlc1RoYXRIYXZlTGlua1RvRmlsZShvbGROb3RlUGF0aCk7XHJcblx0XHRsZXQgbGlua3M6IFBhdGhDaGFuZ2VJbmZvW10gPSBbeyBvbGRQYXRoOiBvbGROb3RlUGF0aCwgbmV3UGF0aDogbmV3Tm90ZVBhdGggfV07XHJcblxyXG5cdFx0aWYgKG5vdGVzKSB7XHJcblx0XHRcdGZvciAobGV0IG5vdGUgb2Ygbm90ZXMpIHtcclxuXHRcdFx0XHRhd2FpdCB0aGlzLnVwZGF0ZUNoYW5nZWRQYXRoc0luTm90ZShub3RlLCBsaW5rcywgY2hhbmdlbGlua3NBbHQpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHJcblx0YXN5bmMgdXBkYXRlQ2hhbmdlZFBhdGhJbk5vdGUobm90ZVBhdGg6IHN0cmluZywgb2xkTGluazogc3RyaW5nLCBuZXdMaW5rOiBzdHJpbmcsIGNoYW5nZWxpbmtzQWx0ID0gZmFsc2UpIHtcclxuXHRcdGlmICh0aGlzLmlzUGF0aElnbm9yZWQobm90ZVBhdGgpKVxyXG5cdFx0XHRyZXR1cm47XHJcblxyXG5cdFx0bGV0IGNoYW5nZXM6IFBhdGhDaGFuZ2VJbmZvW10gPSBbeyBvbGRQYXRoOiBvbGRMaW5rLCBuZXdQYXRoOiBuZXdMaW5rIH1dO1xyXG5cdFx0cmV0dXJuIGF3YWl0IHRoaXMudXBkYXRlQ2hhbmdlZFBhdGhzSW5Ob3RlKG5vdGVQYXRoLCBjaGFuZ2VzLCBjaGFuZ2VsaW5rc0FsdCk7XHJcblx0fVxyXG5cclxuXHJcblx0YXN5bmMgdXBkYXRlQ2hhbmdlZFBhdGhzSW5Ob3RlKG5vdGVQYXRoOiBzdHJpbmcsIGNoYW5nZWRMaW5rczogUGF0aENoYW5nZUluZm9bXSwgY2hhbmdlbGlua3NBbHQgPSBmYWxzZSkge1xyXG5cdFx0aWYgKHRoaXMuaXNQYXRoSWdub3JlZChub3RlUGF0aCkpXHJcblx0XHRcdHJldHVybjtcclxuXHJcblx0XHRsZXQgZmlsZSA9IHRoaXMuZ2V0RmlsZUJ5UGF0aChub3RlUGF0aCk7XHJcblx0XHRpZiAoIWZpbGUpIHtcclxuXHRcdFx0Y29uc29sZS5lcnJvcih0aGlzLmNvbnNvbGVMb2dQcmVmaXggKyBcImNhbnQgdXBkYXRlIGxpbmtzIGluIG5vdGUsIGZpbGUgbm90IGZvdW5kOiBcIiArIG5vdGVQYXRoKTtcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0fVxyXG5cclxuXHRcdGxldCB0ZXh0ID0gYXdhaXQgdGhpcy5hcHAudmF1bHQucmVhZChmaWxlKTtcclxuXHRcdGxldCBkaXJ0eSA9IGZhbHNlO1xyXG5cclxuXHRcdGxldCBlbGVtZW50cyA9IHRleHQubWF0Y2gobWFya2Rvd25MaW5rT3JFbWJlZFJlZ2V4Ryk7XHJcblx0XHRpZiAoZWxlbWVudHMgIT0gbnVsbCAmJiBlbGVtZW50cy5sZW5ndGggPiAwKSB7XHJcblx0XHRcdGZvciAobGV0IGVsIG9mIGVsZW1lbnRzKSB7XHJcblx0XHRcdFx0bGV0IGFsdCA9IGVsLm1hdGNoKG1hcmtkb3duTGlua09yRW1iZWRSZWdleClbMV07XHJcblx0XHRcdFx0bGV0IGxpbmsgPSBlbC5tYXRjaChtYXJrZG93bkxpbmtPckVtYmVkUmVnZXgpWzJdO1xyXG5cdFx0XHRcdGxldCBsaSA9IHRoaXMuc3BsaXRMaW5rVG9QYXRoQW5kU2VjdGlvbihsaW5rKTtcclxuXHJcblx0XHRcdFx0aWYgKGxpLmhhc1NlY3Rpb24pICAvLyBmb3IgbGlua3Mgd2l0aCBzZWN0aW9ucyBsaWtlIFtdKG5vdGUubWQjc2VjdGlvbilcclxuXHRcdFx0XHRcdGxpbmsgPSBsaS5saW5rO1xyXG5cclxuXHRcdFx0XHRsZXQgZnVsbExpbmsgPSB0aGlzLmdldEZ1bGxQYXRoRm9yTGluayhsaW5rLCBub3RlUGF0aCk7XHJcblxyXG5cdFx0XHRcdGZvciAobGV0IGNoYW5nZWRMaW5rIG9mIGNoYW5nZWRMaW5rcykge1xyXG5cdFx0XHRcdFx0aWYgKGZ1bGxMaW5rID09IGNoYW5nZWRMaW5rLm9sZFBhdGgpIHtcclxuXHRcdFx0XHRcdFx0bGV0IG5ld1JlbExpbms6IHN0cmluZyA9IHBhdGgucmVsYXRpdmUobm90ZVBhdGgsIGNoYW5nZWRMaW5rLm5ld1BhdGgpO1xyXG5cdFx0XHRcdFx0XHRuZXdSZWxMaW5rID0gVXRpbHMubm9ybWFsaXplUGF0aEZvckxpbmsobmV3UmVsTGluayk7XHJcblxyXG5cdFx0XHRcdFx0XHRpZiAobmV3UmVsTGluay5zdGFydHNXaXRoKFwiLi4vXCIpKSB7XHJcblx0XHRcdFx0XHRcdFx0bmV3UmVsTGluayA9IG5ld1JlbExpbmsuc3Vic3RyaW5nKDMpO1xyXG5cdFx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0XHRpZiAoY2hhbmdlbGlua3NBbHQgJiYgbmV3UmVsTGluay5lbmRzV2l0aChcIi5tZFwiKSkge1xyXG5cdFx0XHRcdFx0XHRcdC8vcmVuYW1lIG9ubHkgaWYgb2xkIGFsdCA9PSBvbGQgbm90ZSBuYW1lXHJcblx0XHRcdFx0XHRcdFx0aWYgKGFsdCA9PT0gcGF0aC5iYXNlbmFtZShjaGFuZ2VkTGluay5vbGRQYXRoLCBwYXRoLmV4dG5hbWUoY2hhbmdlZExpbmsub2xkUGF0aCkpKSB7XHJcblx0XHRcdFx0XHRcdFx0XHRsZXQgZXh0ID0gcGF0aC5leHRuYW1lKG5ld1JlbExpbmspO1xyXG5cdFx0XHRcdFx0XHRcdFx0bGV0IGJhc2VOYW1lID0gcGF0aC5iYXNlbmFtZShuZXdSZWxMaW5rLCBleHQpO1xyXG5cdFx0XHRcdFx0XHRcdFx0YWx0ID0gVXRpbHMubm9ybWFsaXplUGF0aEZvckZpbGUoYmFzZU5hbWUpO1xyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRcdFx0aWYgKGxpLmhhc1NlY3Rpb24pXHJcblx0XHRcdFx0XHRcdFx0dGV4dCA9IHRleHQucmVwbGFjZShlbCwgJ1snICsgYWx0ICsgJ10nICsgJygnICsgbmV3UmVsTGluayArICcjJyArIGxpLnNlY3Rpb24gKyAnKScpO1xyXG5cdFx0XHRcdFx0XHRlbHNlXHJcblx0XHRcdFx0XHRcdFx0dGV4dCA9IHRleHQucmVwbGFjZShlbCwgJ1snICsgYWx0ICsgJ10nICsgJygnICsgbmV3UmVsTGluayArICcpJyk7XHJcblxyXG5cdFx0XHRcdFx0XHRkaXJ0eSA9IHRydWU7XHJcblxyXG5cdFx0XHRcdFx0XHRjb25zb2xlLmxvZyh0aGlzLmNvbnNvbGVMb2dQcmVmaXggKyBcImxpbmsgdXBkYXRlZCBpbiBjYWNoZWQgbm90ZSBbbm90ZSwgb2xkIGxpbmssIG5ldyBsaW5rXTogXFxuICAgXCJcclxuXHRcdFx0XHRcdFx0XHQrIGZpbGUucGF0aCArIFwiXFxuICAgXCIgKyBsaW5rICsgXCJcXG4gICBcIiArIG5ld1JlbExpbmspXHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKGRpcnR5KVxyXG5cdFx0XHRhd2FpdCB0aGlzLmFwcC52YXVsdC5tb2RpZnkoZmlsZSwgdGV4dCk7XHJcblx0fVxyXG5cclxuXHJcblx0YXN5bmMgdXBkYXRlSW50ZXJuYWxMaW5rc0luTW92ZWROb3RlKG9sZE5vdGVQYXRoOiBzdHJpbmcsIG5ld05vdGVQYXRoOiBzdHJpbmcsIGF0dGFjaG1lbnRzQWxyZWFkeU1vdmVkOiBib29sZWFuKSB7XHJcblx0XHRpZiAodGhpcy5pc1BhdGhJZ25vcmVkKG9sZE5vdGVQYXRoKSB8fCB0aGlzLmlzUGF0aElnbm9yZWQobmV3Tm90ZVBhdGgpKVxyXG5cdFx0XHRyZXR1cm47XHJcblxyXG5cdFx0bGV0IGZpbGUgPSB0aGlzLmdldEZpbGVCeVBhdGgobmV3Tm90ZVBhdGgpO1xyXG5cdFx0aWYgKCFmaWxlKSB7XHJcblx0XHRcdGNvbnNvbGUuZXJyb3IodGhpcy5jb25zb2xlTG9nUHJlZml4ICsgXCJjYW4ndCB1cGRhdGUgaW50ZXJuYWwgbGlua3MsIGZpbGUgbm90IGZvdW5kOiBcIiArIG5ld05vdGVQYXRoKTtcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0fVxyXG5cclxuXHRcdGxldCB0ZXh0ID0gYXdhaXQgdGhpcy5hcHAudmF1bHQucmVhZChmaWxlKTtcclxuXHRcdGxldCBkaXJ0eSA9IGZhbHNlO1xyXG5cclxuXHRcdGxldCBlbGVtZW50cyA9IHRleHQubWF0Y2gobWFya2Rvd25MaW5rT3JFbWJlZFJlZ2V4Ryk7XHJcblx0XHRpZiAoZWxlbWVudHMgIT0gbnVsbCAmJiBlbGVtZW50cy5sZW5ndGggPiAwKSB7XHJcblx0XHRcdGZvciAobGV0IGVsIG9mIGVsZW1lbnRzKSB7XHJcblx0XHRcdFx0bGV0IGFsdCA9IGVsLm1hdGNoKG1hcmtkb3duTGlua09yRW1iZWRSZWdleClbMV07XHJcblx0XHRcdFx0bGV0IGxpbmsgPSBlbC5tYXRjaChtYXJrZG93bkxpbmtPckVtYmVkUmVnZXgpWzJdO1xyXG5cdFx0XHRcdGxldCBsaSA9IHRoaXMuc3BsaXRMaW5rVG9QYXRoQW5kU2VjdGlvbihsaW5rKTtcclxuXHJcblx0XHRcdFx0aWYgKGxpbmsuc3RhcnRzV2l0aChcIiNcIikpIC8vaW50ZXJuYWwgc2VjdGlvbiBsaW5rXHJcblx0XHRcdFx0XHRjb250aW51ZTtcclxuXHJcblx0XHRcdFx0aWYgKGxpLmhhc1NlY3Rpb24pICAvLyBmb3IgbGlua3Mgd2l0aCBzZWN0aW9ucyBsaWtlIFtdKG5vdGUubWQjc2VjdGlvbilcclxuXHRcdFx0XHRcdGxpbmsgPSBsaS5saW5rO1xyXG5cclxuXHJcblx0XHRcdFx0Ly9zdGFydHNXaXRoKFwiLi4vXCIpIC0gZm9yIG5vdCBza2lwcGluZyBmaWxlcyB0aGF0IG5vdCBpbiB0aGUgbm90ZSBkaXJcclxuXHRcdFx0XHRpZiAoYXR0YWNobWVudHNBbHJlYWR5TW92ZWQgJiYgIWxpbmsuZW5kc1dpdGgoXCIubWRcIikgJiYgIWxpbmsuc3RhcnRzV2l0aChcIi4uL1wiKSlcclxuXHRcdFx0XHRcdGNvbnRpbnVlO1xyXG5cclxuXHRcdFx0XHRsZXQgZmlsZSA9IHRoaXMuZ2V0RmlsZUJ5TGluayhsaW5rLCBvbGROb3RlUGF0aCk7XHJcblx0XHRcdFx0aWYgKCFmaWxlKSB7XHJcblx0XHRcdFx0XHRmaWxlID0gdGhpcy5nZXRGaWxlQnlMaW5rKGxpbmssIG5ld05vdGVQYXRoKTtcclxuXHRcdFx0XHRcdGlmICghZmlsZSkge1xyXG5cdFx0XHRcdFx0XHRjb25zb2xlLmVycm9yKHRoaXMuY29uc29sZUxvZ1ByZWZpeCArIG5ld05vdGVQYXRoICsgXCIgaGFzIGJhZCBsaW5rIChmaWxlIGRvZXMgbm90IGV4aXN0KTogXCIgKyBsaW5rKTtcclxuXHRcdFx0XHRcdFx0Y29udGludWU7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cclxuXHJcblx0XHRcdFx0bGV0IG5ld1JlbExpbms6IHN0cmluZyA9IHBhdGgucmVsYXRpdmUobmV3Tm90ZVBhdGgsIGZpbGUucGF0aCk7XHJcblx0XHRcdFx0bmV3UmVsTGluayA9IFV0aWxzLm5vcm1hbGl6ZVBhdGhGb3JMaW5rKG5ld1JlbExpbmspO1xyXG5cclxuXHRcdFx0XHRpZiAobmV3UmVsTGluay5zdGFydHNXaXRoKFwiLi4vXCIpKSB7XHJcblx0XHRcdFx0XHRuZXdSZWxMaW5rID0gbmV3UmVsTGluay5zdWJzdHJpbmcoMyk7XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRpZiAobGkuaGFzU2VjdGlvbilcclxuXHRcdFx0XHRcdHRleHQgPSB0ZXh0LnJlcGxhY2UoZWwsICdbJyArIGFsdCArICddJyArICcoJyArIG5ld1JlbExpbmsgKyAnIycgKyBsaS5zZWN0aW9uICsgJyknKTtcclxuXHRcdFx0XHRlbHNlXHJcblx0XHRcdFx0XHR0ZXh0ID0gdGV4dC5yZXBsYWNlKGVsLCAnWycgKyBhbHQgKyAnXScgKyAnKCcgKyBuZXdSZWxMaW5rICsgJyknKTtcclxuXHJcblx0XHRcdFx0ZGlydHkgPSB0cnVlO1xyXG5cclxuXHRcdFx0XHRjb25zb2xlLmxvZyh0aGlzLmNvbnNvbGVMb2dQcmVmaXggKyBcImxpbmsgdXBkYXRlZCBpbiBtb3ZlZCBub3RlIFtub3RlLCBvbGQgbGluaywgbmV3IGxpbmtdOiBcXG4gICBcIlxyXG5cdFx0XHRcdFx0KyBmaWxlLnBhdGggKyBcIlxcbiAgIFwiICsgbGluayArIFwiICAgXFxuXCIgKyBuZXdSZWxMaW5rKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdGlmIChkaXJ0eSlcclxuXHRcdFx0YXdhaXQgdGhpcy5hcHAudmF1bHQubW9kaWZ5KGZpbGUsIHRleHQpO1xyXG5cdH1cclxuXHJcblxyXG5cdGFzeW5jIGdldENhY2hlZE5vdGVzVGhhdEhhdmVMaW5rVG9GaWxlKGZpbGVQYXRoOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZ1tdPiB7XHJcblx0XHRsZXQgbm90ZXM6IHN0cmluZ1tdID0gW107XHJcblx0XHRsZXQgYWxsTm90ZXMgPSB0aGlzLmFwcC52YXVsdC5nZXRNYXJrZG93bkZpbGVzKCk7XHJcblxyXG5cdFx0aWYgKGFsbE5vdGVzKSB7XHJcblx0XHRcdGZvciAobGV0IG5vdGUgb2YgYWxsTm90ZXMpIHtcclxuXHRcdFx0XHRpZiAodGhpcy5pc1BhdGhJZ25vcmVkKG5vdGUucGF0aCkpXHJcblx0XHRcdFx0XHRjb250aW51ZTtcclxuXHJcblx0XHRcdFx0bGV0IG5vdGVQYXRoID0gbm90ZS5wYXRoO1xyXG5cdFx0XHRcdGlmIChub3RlLnBhdGggPT0gZmlsZVBhdGgpXHJcblx0XHRcdFx0XHRjb250aW51ZTtcclxuXHJcblx0XHRcdFx0Ly8hISEgdGhpcyBjYW4gcmV0dXJuIHVuZGVmaW5lZCBpZiBub3RlIHdhcyBqdXN0IHVwZGF0ZWRcclxuXHRcdFx0XHRsZXQgZW1iZWRzID0gKGF3YWl0IFV0aWxzLmdldENhY2hlU2FmZShub3RlUGF0aCkpLmVtYmVkcztcclxuXHRcdFx0XHRpZiAoZW1iZWRzKSB7XHJcblx0XHRcdFx0XHRmb3IgKGxldCBlbWJlZCBvZiBlbWJlZHMpIHtcclxuXHRcdFx0XHRcdFx0bGV0IGxpbmtQYXRoID0gdGhpcy5nZXRGdWxsUGF0aEZvckxpbmsoZW1iZWQubGluaywgbm90ZS5wYXRoKTtcclxuXHRcdFx0XHRcdFx0aWYgKGxpbmtQYXRoID09IGZpbGVQYXRoKSB7XHJcblx0XHRcdFx0XHRcdFx0aWYgKCFub3Rlcy5jb250YWlucyhub3RlUGF0aCkpXHJcblx0XHRcdFx0XHRcdFx0XHRub3Rlcy5wdXNoKG5vdGVQYXRoKTtcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0Ly8hISEgdGhpcyBjYW4gcmV0dXJuIHVuZGVmaW5lZCBpZiBub3RlIHdhcyBqdXN0IHVwZGF0ZWRcclxuXHRcdFx0XHRsZXQgbGlua3MgPSAoYXdhaXQgVXRpbHMuZ2V0Q2FjaGVTYWZlKG5vdGVQYXRoKSkubGlua3M7XHJcblx0XHRcdFx0aWYgKGxpbmtzKSB7XHJcblx0XHRcdFx0XHRmb3IgKGxldCBsaW5rIG9mIGxpbmtzKSB7XHJcblx0XHRcdFx0XHRcdGxldCBsaW5rUGF0aCA9IHRoaXMuZ2V0RnVsbFBhdGhGb3JMaW5rKGxpbmsubGluaywgbm90ZS5wYXRoKTtcclxuXHRcdFx0XHRcdFx0aWYgKGxpbmtQYXRoID09IGZpbGVQYXRoKSB7XHJcblx0XHRcdFx0XHRcdFx0aWYgKCFub3Rlcy5jb250YWlucyhub3RlUGF0aCkpXHJcblx0XHRcdFx0XHRcdFx0XHRub3Rlcy5wdXNoKG5vdGVQYXRoKTtcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiBub3RlcztcclxuXHR9XHJcblxyXG5cclxuXHRhc3luYyBnZXROb3Rlc1RoYXRIYXZlTGlua1RvRmlsZShmaWxlUGF0aDogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmdbXT4ge1xyXG5cdFx0bGV0IG5vdGVzOiBzdHJpbmdbXSA9IFtdO1xyXG5cdFx0bGV0IGFsbE5vdGVzID0gdGhpcy5hcHAudmF1bHQuZ2V0TWFya2Rvd25GaWxlcygpO1xyXG5cclxuXHRcdGlmIChhbGxOb3Rlcykge1xyXG5cdFx0XHRmb3IgKGxldCBub3RlIG9mIGFsbE5vdGVzKSB7XHJcblx0XHRcdFx0aWYgKHRoaXMuaXNQYXRoSWdub3JlZChub3RlLnBhdGgpKVxyXG5cdFx0XHRcdFx0Y29udGludWU7XHJcblxyXG5cdFx0XHRcdGxldCBub3RlUGF0aCA9IG5vdGUucGF0aDtcclxuXHRcdFx0XHRpZiAobm90ZVBhdGggPT0gZmlsZVBhdGgpXHJcblx0XHRcdFx0XHRjb250aW51ZTtcclxuXHJcblx0XHRcdFx0bGV0IGxpbmtzID0gYXdhaXQgdGhpcy5nZXRMaW5rc0Zyb21Ob3RlKG5vdGVQYXRoKTtcclxuXHRcdFx0XHRmb3IgKGxldCBsaW5rIG9mIGxpbmtzKSB7XHJcblx0XHRcdFx0XHRsZXQgbGkgPSB0aGlzLnNwbGl0TGlua1RvUGF0aEFuZFNlY3Rpb24obGluay5saW5rKTtcclxuXHRcdFx0XHRcdGxldCBsaW5rRnVsbFBhdGggPSB0aGlzLmdldEZ1bGxQYXRoRm9yTGluayhsaS5saW5rLCBub3RlUGF0aCk7XHJcblx0XHRcdFx0XHRpZiAobGlua0Z1bGxQYXRoID09IGZpbGVQYXRoKSB7XHJcblx0XHRcdFx0XHRcdGlmICghbm90ZXMuY29udGFpbnMobm90ZVBhdGgpKVxyXG5cdFx0XHRcdFx0XHRcdG5vdGVzLnB1c2gobm90ZVBhdGgpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiBub3RlcztcclxuXHR9XHJcblxyXG5cdHNwbGl0TGlua1RvUGF0aEFuZFNlY3Rpb24obGluazogc3RyaW5nKTogTGlua1NlY3Rpb25JbmZvIHtcclxuXHRcdGxldCByZXM6IExpbmtTZWN0aW9uSW5mbyA9IHtcclxuXHRcdFx0aGFzU2VjdGlvbjogZmFsc2UsXHJcblx0XHRcdGxpbms6IGxpbmssXHJcblx0XHRcdHNlY3Rpb246IFwiXCJcclxuXHRcdH1cclxuXHJcblx0XHRpZiAoIWxpbmsuY29udGFpbnMoJyMnKSlcclxuXHRcdFx0cmV0dXJuIHJlcztcclxuXHJcblxyXG5cdFx0bGV0IGxpbmtCZWZvcmVIYXNoID0gbGluay5tYXRjaCgvKC4qPykjKC4qPykkLylbMV07XHJcblx0XHRsZXQgc2VjdGlvbiA9IGxpbmsubWF0Y2goLyguKj8pIyguKj8pJC8pWzJdO1xyXG5cclxuXHRcdGxldCBpc01hcmtkb3duU2VjdGlvbiA9IHNlY3Rpb24gIT0gXCJcIiAmJiBsaW5rQmVmb3JlSGFzaC5lbmRzV2l0aChcIi5tZFwiKTsgLy8gZm9yIGxpbmtzIHdpdGggc2VjdGlvbnMgbGlrZSBbXShub3RlLm1kI3NlY3Rpb24pXHJcblx0XHRsZXQgaXNQZGZQYWdlU2VjdGlvbiA9IHNlY3Rpb24uc3RhcnRzV2l0aChcInBhZ2U9XCIpICYmIGxpbmtCZWZvcmVIYXNoLmVuZHNXaXRoKFwiLnBkZlwiKTsgLy8gZm9yIGxpbmtzIHdpdGggc2VjdGlvbnMgbGlrZSBbXShub3RlLnBkZiNwYWdlPTQyKVxyXG5cclxuXHRcdGlmIChpc01hcmtkb3duU2VjdGlvbiB8fCBpc1BkZlBhZ2VTZWN0aW9uKSB7XHJcblx0XHRcdHJlcyA9IHtcclxuXHRcdFx0XHRoYXNTZWN0aW9uOiB0cnVlLFxyXG5cdFx0XHRcdGxpbms6IGxpbmtCZWZvcmVIYXNoLFxyXG5cdFx0XHRcdHNlY3Rpb246IHNlY3Rpb25cclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiByZXM7XHJcblx0fVxyXG5cclxuXHJcblx0Z2V0RmlsZVBhdGhXaXRoUmVuYW1lZEJhc2VOYW1lKGZpbGVQYXRoOiBzdHJpbmcsIG5ld0Jhc2VOYW1lOiBzdHJpbmcpOiBzdHJpbmcge1xyXG5cdFx0cmV0dXJuIFV0aWxzLm5vcm1hbGl6ZVBhdGhGb3JGaWxlKHBhdGguam9pbihwYXRoLmRpcm5hbWUoZmlsZVBhdGgpLCBuZXdCYXNlTmFtZSArIHBhdGguZXh0bmFtZShmaWxlUGF0aCkpKTtcclxuXHR9XHJcblxyXG5cclxuXHRhc3luYyBnZXRMaW5rc0Zyb21Ob3RlKG5vdGVQYXRoOiBzdHJpbmcpOiBQcm9taXNlPExpbmtDYWNoZVtdPiB7XHJcblx0XHRsZXQgZmlsZSA9IHRoaXMuZ2V0RmlsZUJ5UGF0aChub3RlUGF0aCk7XHJcblx0XHRpZiAoIWZpbGUpIHtcclxuXHRcdFx0Y29uc29sZS5lcnJvcih0aGlzLmNvbnNvbGVMb2dQcmVmaXggKyBcImNhbid0IGdldCBlbWJlZHMsIGZpbGUgbm90IGZvdW5kOiBcIiArIG5vdGVQYXRoKTtcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0fVxyXG5cclxuXHRcdGxldCB0ZXh0ID0gYXdhaXQgdGhpcy5hcHAudmF1bHQucmVhZChmaWxlKTtcclxuXHJcblx0XHRsZXQgbGlua3M6IExpbmtDYWNoZVtdID0gW107XHJcblxyXG5cdFx0bGV0IGVsZW1lbnRzID0gdGV4dC5tYXRjaChtYXJrZG93bkxpbmtPckVtYmVkUmVnZXhHKTtcclxuXHRcdGlmIChlbGVtZW50cyAhPSBudWxsICYmIGVsZW1lbnRzLmxlbmd0aCA+IDApIHtcclxuXHRcdFx0Zm9yIChsZXQgZWwgb2YgZWxlbWVudHMpIHtcclxuXHRcdFx0XHRsZXQgYWx0ID0gZWwubWF0Y2gobWFya2Rvd25MaW5rT3JFbWJlZFJlZ2V4KVsxXTtcclxuXHRcdFx0XHRsZXQgbGluayA9IGVsLm1hdGNoKG1hcmtkb3duTGlua09yRW1iZWRSZWdleClbMl07XHJcblxyXG5cdFx0XHRcdGxldCBlbWI6IExpbmtDYWNoZSA9IHtcclxuXHRcdFx0XHRcdGxpbms6IGxpbmssXHJcblx0XHRcdFx0XHRkaXNwbGF5VGV4dDogYWx0LFxyXG5cdFx0XHRcdFx0b3JpZ2luYWw6IGVsLFxyXG5cdFx0XHRcdFx0cG9zaXRpb246IHtcclxuXHRcdFx0XHRcdFx0c3RhcnQ6IHtcclxuXHRcdFx0XHRcdFx0XHRjb2w6IDAsLy90b2RvXHJcblx0XHRcdFx0XHRcdFx0bGluZTogMCxcclxuXHRcdFx0XHRcdFx0XHRvZmZzZXQ6IDBcclxuXHRcdFx0XHRcdFx0fSxcclxuXHRcdFx0XHRcdFx0ZW5kOiB7XHJcblx0XHRcdFx0XHRcdFx0Y29sOiAwLC8vdG9kb1xyXG5cdFx0XHRcdFx0XHRcdGxpbmU6IDAsXHJcblx0XHRcdFx0XHRcdFx0b2Zmc2V0OiAwXHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9O1xyXG5cclxuXHRcdFx0XHRsaW5rcy5wdXNoKGVtYik7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdHJldHVybiBsaW5rcztcclxuXHR9XHJcblxyXG5cclxuXHJcblxyXG5cdGFzeW5jIGNvbnZlcnRBbGxOb3RlRW1iZWRzUGF0aHNUb1JlbGF0aXZlKG5vdGVQYXRoOiBzdHJpbmcpOiBQcm9taXNlPEVtYmVkQ2hhbmdlSW5mb1tdPiB7XHJcblx0XHRpZiAodGhpcy5pc1BhdGhJZ25vcmVkKG5vdGVQYXRoKSlcclxuXHRcdFx0cmV0dXJuO1xyXG5cclxuXHRcdGxldCBjaGFuZ2VkRW1iZWRzOiBFbWJlZENoYW5nZUluZm9bXSA9IFtdO1xyXG5cclxuXHRcdGxldCBlbWJlZHMgPSAoYXdhaXQgVXRpbHMuZ2V0Q2FjaGVTYWZlKG5vdGVQYXRoKSkuZW1iZWRzO1xyXG5cclxuXHRcdGlmIChlbWJlZHMpIHtcclxuXHRcdFx0Zm9yIChsZXQgZW1iZWQgb2YgZW1iZWRzKSB7XHJcblx0XHRcdFx0bGV0IGlzTWFya2Rvd25FbWJlZCA9IHRoaXMuY2hlY2tJc0NvcnJlY3RNYXJrZG93bkVtYmVkKGVtYmVkLm9yaWdpbmFsKTtcclxuXHRcdFx0XHRsZXQgaXNXaWtpRW1iZWQgPSB0aGlzLmNoZWNrSXNDb3JyZWN0V2lraUVtYmVkKGVtYmVkLm9yaWdpbmFsKTtcclxuXHRcdFx0XHRpZiAoaXNNYXJrZG93bkVtYmVkIHx8IGlzV2lraUVtYmVkKSB7XHJcblx0XHRcdFx0XHRsZXQgZmlsZSA9IHRoaXMuZ2V0RmlsZUJ5TGluayhlbWJlZC5saW5rLCBub3RlUGF0aCk7XHJcblx0XHRcdFx0XHRpZiAoZmlsZSlcclxuXHRcdFx0XHRcdFx0Y29udGludWU7XHJcblxyXG5cdFx0XHRcdFx0ZmlsZSA9IHRoaXMuYXBwLm1ldGFkYXRhQ2FjaGUuZ2V0Rmlyc3RMaW5rcGF0aERlc3QoZW1iZWQubGluaywgbm90ZVBhdGgpO1xyXG5cdFx0XHRcdFx0aWYgKGZpbGUpIHtcclxuXHRcdFx0XHRcdFx0bGV0IG5ld1JlbExpbms6IHN0cmluZyA9IHBhdGgucmVsYXRpdmUobm90ZVBhdGgsIGZpbGUucGF0aCk7XHJcblx0XHRcdFx0XHRcdG5ld1JlbExpbmsgPSBpc01hcmtkb3duRW1iZWQgPyBVdGlscy5ub3JtYWxpemVQYXRoRm9yTGluayhuZXdSZWxMaW5rKSA6IFV0aWxzLm5vcm1hbGl6ZVBhdGhGb3JGaWxlKG5ld1JlbExpbmspO1xyXG5cclxuXHRcdFx0XHRcdFx0aWYgKG5ld1JlbExpbmsuc3RhcnRzV2l0aChcIi4uL1wiKSkge1xyXG5cdFx0XHRcdFx0XHRcdG5ld1JlbExpbmsgPSBuZXdSZWxMaW5rLnN1YnN0cmluZygzKTtcclxuXHRcdFx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRcdFx0Y2hhbmdlZEVtYmVkcy5wdXNoKHsgb2xkOiBlbWJlZCwgbmV3TGluazogbmV3UmVsTGluayB9KVxyXG5cdFx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdFx0Y29uc29sZS5lcnJvcih0aGlzLmNvbnNvbGVMb2dQcmVmaXggKyBub3RlUGF0aCArIFwiIGhhcyBiYWQgZW1iZWQgKGZpbGUgZG9lcyBub3QgZXhpc3QpOiBcIiArIGVtYmVkLmxpbmspO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRjb25zb2xlLmVycm9yKHRoaXMuY29uc29sZUxvZ1ByZWZpeCArIG5vdGVQYXRoICsgXCIgaGFzIGJhZCBlbWJlZCAoZm9ybWF0IG9mIGxpbmsgaXMgbm90IG1hcmtkb3duIG9yIHdpa2kgbGluayk6IFwiICsgZW1iZWQub3JpZ2luYWwpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdGF3YWl0IHRoaXMudXBkYXRlQ2hhbmdlZEVtYmVkSW5Ob3RlKG5vdGVQYXRoLCBjaGFuZ2VkRW1iZWRzKTtcclxuXHRcdHJldHVybiBjaGFuZ2VkRW1iZWRzO1xyXG5cdH1cclxuXHJcblxyXG5cdGFzeW5jIGNvbnZlcnRBbGxOb3RlTGlua3NQYXRoc1RvUmVsYXRpdmUobm90ZVBhdGg6IHN0cmluZyk6IFByb21pc2U8TGlua0NoYW5nZUluZm9bXT4ge1xyXG5cdFx0aWYgKHRoaXMuaXNQYXRoSWdub3JlZChub3RlUGF0aCkpXHJcblx0XHRcdHJldHVybjtcclxuXHJcblx0XHRsZXQgY2hhbmdlZExpbmtzOiBMaW5rQ2hhbmdlSW5mb1tdID0gW107XHJcblxyXG5cdFx0bGV0IGxpbmtzID0gKGF3YWl0IFV0aWxzLmdldENhY2hlU2FmZShub3RlUGF0aCkpLmxpbmtzO1xyXG5cclxuXHRcdGlmIChsaW5rcykge1xyXG5cdFx0XHRmb3IgKGxldCBsaW5rIG9mIGxpbmtzKSB7XHJcblx0XHRcdFx0bGV0IGlzTWFya2Rvd25MaW5rID0gdGhpcy5jaGVja0lzQ29ycmVjdE1hcmtkb3duTGluayhsaW5rLm9yaWdpbmFsKTtcclxuXHRcdFx0XHRsZXQgaXNXaWtpTGluayA9IHRoaXMuY2hlY2tJc0NvcnJlY3RXaWtpTGluayhsaW5rLm9yaWdpbmFsKTtcclxuXHRcdFx0XHRpZiAoaXNNYXJrZG93bkxpbmsgfHwgaXNXaWtpTGluaykge1xyXG5cdFx0XHRcdFx0aWYgKGxpbmsubGluay5zdGFydHNXaXRoKFwiI1wiKSkgLy9pbnRlcm5hbCBzZWN0aW9uIGxpbmtcclxuXHRcdFx0XHRcdFx0Y29udGludWU7XHJcblxyXG5cdFx0XHRcdFx0bGV0IGZpbGUgPSB0aGlzLmdldEZpbGVCeUxpbmsobGluay5saW5rLCBub3RlUGF0aCk7XHJcblx0XHRcdFx0XHRpZiAoZmlsZSlcclxuXHRcdFx0XHRcdFx0Y29udGludWU7XHJcblxyXG5cdFx0XHRcdFx0Ly8hISEgbGluay5kaXNwbGF5VGV4dCBpcyBhbHdheXMgXCJcIiAtIE9CU0lESUFOIEJVRz8sIHNvIGdldCBkaXNwbGF5IHRleHQgbWFudWFseVxyXG5cdFx0XHRcdFx0aWYgKGlzTWFya2Rvd25MaW5rKSB7XHJcblx0XHRcdFx0XHRcdGxldCBlbGVtZW50cyA9IGxpbmsub3JpZ2luYWwubWF0Y2gobWFya2Rvd25MaW5rUmVnZXgpO1xyXG5cdFx0XHRcdFx0XHRpZiAoZWxlbWVudHMpXHJcblx0XHRcdFx0XHRcdFx0bGluay5kaXNwbGF5VGV4dCA9IGVsZW1lbnRzWzFdO1xyXG5cdFx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRcdGZpbGUgPSB0aGlzLmFwcC5tZXRhZGF0YUNhY2hlLmdldEZpcnN0TGlua3BhdGhEZXN0KGxpbmsubGluaywgbm90ZVBhdGgpO1xyXG5cdFx0XHRcdFx0aWYgKGZpbGUpIHtcclxuXHRcdFx0XHRcdFx0bGV0IG5ld1JlbExpbms6IHN0cmluZyA9IHBhdGgucmVsYXRpdmUobm90ZVBhdGgsIGZpbGUucGF0aCk7XHJcblx0XHRcdFx0XHRcdG5ld1JlbExpbmsgPSBpc01hcmtkb3duTGluayA/IFV0aWxzLm5vcm1hbGl6ZVBhdGhGb3JMaW5rKG5ld1JlbExpbmspIDogVXRpbHMubm9ybWFsaXplUGF0aEZvckZpbGUobmV3UmVsTGluayk7XHJcblxyXG5cdFx0XHRcdFx0XHRpZiAobmV3UmVsTGluay5zdGFydHNXaXRoKFwiLi4vXCIpKSB7XHJcblx0XHRcdFx0XHRcdFx0bmV3UmVsTGluayA9IG5ld1JlbExpbmsuc3Vic3RyaW5nKDMpO1xyXG5cdFx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0XHRjaGFuZ2VkTGlua3MucHVzaCh7IG9sZDogbGluaywgbmV3TGluazogbmV3UmVsTGluayB9KVxyXG5cdFx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdFx0Y29uc29sZS5lcnJvcih0aGlzLmNvbnNvbGVMb2dQcmVmaXggKyBub3RlUGF0aCArIFwiIGhhcyBiYWQgbGluayAoZmlsZSBkb2VzIG5vdCBleGlzdCk6IFwiICsgbGluay5saW5rKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0Y29uc29sZS5lcnJvcih0aGlzLmNvbnNvbGVMb2dQcmVmaXggKyBub3RlUGF0aCArIFwiIGhhcyBiYWQgbGluayAoZm9ybWF0IG9mIGxpbmsgaXMgbm90IG1hcmtkb3duIG9yIHdpa2kgbGluayk6IFwiICsgbGluay5vcmlnaW5hbCk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0YXdhaXQgdGhpcy51cGRhdGVDaGFuZ2VkTGlua0luTm90ZShub3RlUGF0aCwgY2hhbmdlZExpbmtzKTtcclxuXHRcdHJldHVybiBjaGFuZ2VkTGlua3M7XHJcblx0fVxyXG5cclxuXHJcblx0YXN5bmMgdXBkYXRlQ2hhbmdlZEVtYmVkSW5Ob3RlKG5vdGVQYXRoOiBzdHJpbmcsIGNoYW5nZWRFbWJlZHM6IEVtYmVkQ2hhbmdlSW5mb1tdKSB7XHJcblx0XHRpZiAodGhpcy5pc1BhdGhJZ25vcmVkKG5vdGVQYXRoKSlcclxuXHRcdFx0cmV0dXJuO1xyXG5cclxuXHRcdGxldCBub3RlRmlsZSA9IHRoaXMuZ2V0RmlsZUJ5UGF0aChub3RlUGF0aCk7XHJcblx0XHRpZiAoIW5vdGVGaWxlKSB7XHJcblx0XHRcdGNvbnNvbGUuZXJyb3IodGhpcy5jb25zb2xlTG9nUHJlZml4ICsgXCJjYW4ndCB1cGRhdGUgZW1iZWRzIGluIG5vdGUsIGZpbGUgbm90IGZvdW5kOiBcIiArIG5vdGVQYXRoKTtcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0fVxyXG5cclxuXHRcdGxldCB0ZXh0ID0gYXdhaXQgdGhpcy5hcHAudmF1bHQucmVhZChub3RlRmlsZSk7XHJcblx0XHRsZXQgZGlydHkgPSBmYWxzZTtcclxuXHJcblx0XHRpZiAoY2hhbmdlZEVtYmVkcyAmJiBjaGFuZ2VkRW1iZWRzLmxlbmd0aCA+IDApIHtcclxuXHRcdFx0Zm9yIChsZXQgZW1iZWQgb2YgY2hhbmdlZEVtYmVkcykge1xyXG5cdFx0XHRcdGlmIChlbWJlZC5vbGQubGluayA9PSBlbWJlZC5uZXdMaW5rKVxyXG5cdFx0XHRcdFx0Y29udGludWU7XHJcblxyXG5cdFx0XHRcdGlmICh0aGlzLmNoZWNrSXNDb3JyZWN0TWFya2Rvd25FbWJlZChlbWJlZC5vbGQub3JpZ2luYWwpKSB7XHJcblx0XHRcdFx0XHR0ZXh0ID0gdGV4dC5yZXBsYWNlKGVtYmVkLm9sZC5vcmlnaW5hbCwgJyFbJyArIGVtYmVkLm9sZC5kaXNwbGF5VGV4dCArICddJyArICcoJyArIGVtYmVkLm5ld0xpbmsgKyAnKScpO1xyXG5cdFx0XHRcdH0gZWxzZSBpZiAodGhpcy5jaGVja0lzQ29ycmVjdFdpa2lFbWJlZChlbWJlZC5vbGQub3JpZ2luYWwpKSB7XHJcblx0XHRcdFx0XHR0ZXh0ID0gdGV4dC5yZXBsYWNlKGVtYmVkLm9sZC5vcmlnaW5hbCwgJyFbWycgKyBlbWJlZC5uZXdMaW5rICsgJ11dJyk7XHJcblx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdGNvbnNvbGUuZXJyb3IodGhpcy5jb25zb2xlTG9nUHJlZml4ICsgbm90ZVBhdGggKyBcIiBoYXMgYmFkIGVtYmVkIChmb3JtYXQgb2YgbGluayBpcyBub3QgbWFla2Rvd24gb3Igd2lraSBsaW5rKTogXCIgKyBlbWJlZC5vbGQub3JpZ2luYWwpO1xyXG5cdFx0XHRcdFx0Y29udGludWU7XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRjb25zb2xlLmxvZyh0aGlzLmNvbnNvbGVMb2dQcmVmaXggKyBcImVtYmVkIHVwZGF0ZWQgaW4gbm90ZSBbbm90ZSwgb2xkIGxpbmssIG5ldyBsaW5rXTogXFxuICAgXCJcclxuXHRcdFx0XHRcdCsgbm90ZUZpbGUucGF0aCArIFwiXFxuICAgXCIgKyBlbWJlZC5vbGQubGluayArIFwiXFxuICAgXCIgKyBlbWJlZC5uZXdMaW5rKVxyXG5cclxuXHRcdFx0XHRkaXJ0eSA9IHRydWU7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHRpZiAoZGlydHkpXHJcblx0XHRcdGF3YWl0IHRoaXMuYXBwLnZhdWx0Lm1vZGlmeShub3RlRmlsZSwgdGV4dCk7XHJcblx0fVxyXG5cclxuXHJcblx0YXN5bmMgdXBkYXRlQ2hhbmdlZExpbmtJbk5vdGUobm90ZVBhdGg6IHN0cmluZywgY2hhbmRlZExpbmtzOiBMaW5rQ2hhbmdlSW5mb1tdKSB7XHJcblx0XHRpZiAodGhpcy5pc1BhdGhJZ25vcmVkKG5vdGVQYXRoKSlcclxuXHRcdFx0cmV0dXJuO1xyXG5cclxuXHRcdGxldCBub3RlRmlsZSA9IHRoaXMuZ2V0RmlsZUJ5UGF0aChub3RlUGF0aCk7XHJcblx0XHRpZiAoIW5vdGVGaWxlKSB7XHJcblx0XHRcdGNvbnNvbGUuZXJyb3IodGhpcy5jb25zb2xlTG9nUHJlZml4ICsgXCJjYW4ndCB1cGRhdGUgbGlua3MgaW4gbm90ZSwgZmlsZSBub3QgZm91bmQ6IFwiICsgbm90ZVBhdGgpO1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblxyXG5cdFx0bGV0IHRleHQgPSBhd2FpdCB0aGlzLmFwcC52YXVsdC5yZWFkKG5vdGVGaWxlKTtcclxuXHRcdGxldCBkaXJ0eSA9IGZhbHNlO1xyXG5cclxuXHRcdGlmIChjaGFuZGVkTGlua3MgJiYgY2hhbmRlZExpbmtzLmxlbmd0aCA+IDApIHtcclxuXHRcdFx0Zm9yIChsZXQgbGluayBvZiBjaGFuZGVkTGlua3MpIHtcclxuXHRcdFx0XHRpZiAobGluay5vbGQubGluayA9PSBsaW5rLm5ld0xpbmspXHJcblx0XHRcdFx0XHRjb250aW51ZTtcclxuXHJcblx0XHRcdFx0aWYgKHRoaXMuY2hlY2tJc0NvcnJlY3RNYXJrZG93bkxpbmsobGluay5vbGQub3JpZ2luYWwpKSB7XHJcblx0XHRcdFx0XHR0ZXh0ID0gdGV4dC5yZXBsYWNlKGxpbmsub2xkLm9yaWdpbmFsLCAnWycgKyBsaW5rLm9sZC5kaXNwbGF5VGV4dCArICddJyArICcoJyArIGxpbmsubmV3TGluayArICcpJyk7XHJcblx0XHRcdFx0fSBlbHNlIGlmICh0aGlzLmNoZWNrSXNDb3JyZWN0V2lraUxpbmsobGluay5vbGQub3JpZ2luYWwpKSB7XHJcblx0XHRcdFx0XHR0ZXh0ID0gdGV4dC5yZXBsYWNlKGxpbmsub2xkLm9yaWdpbmFsLCAnW1snICsgbGluay5uZXdMaW5rICsgJ11dJyk7XHJcblx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdGNvbnNvbGUuZXJyb3IodGhpcy5jb25zb2xlTG9nUHJlZml4ICsgbm90ZVBhdGggKyBcIiBoYXMgYmFkIGxpbmsgKGZvcm1hdCBvZiBsaW5rIGlzIG5vdCBtYWVrZG93biBvciB3aWtpIGxpbmspOiBcIiArIGxpbmsub2xkLm9yaWdpbmFsKTtcclxuXHRcdFx0XHRcdGNvbnRpbnVlO1xyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0Y29uc29sZS5sb2codGhpcy5jb25zb2xlTG9nUHJlZml4ICsgXCJjYWNoZWQgbGluayB1cGRhdGVkIGluIG5vdGUgW25vdGUsIG9sZCBsaW5rLCBuZXcgbGlua106IFxcbiAgIFwiXHJcblx0XHRcdFx0XHQrIG5vdGVGaWxlLnBhdGggKyBcIlxcbiAgIFwiICsgbGluay5vbGQubGluayArIFwiXFxuICAgXCIgKyBsaW5rLm5ld0xpbmspXHJcblxyXG5cdFx0XHRcdGRpcnR5ID0gdHJ1ZTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdGlmIChkaXJ0eSlcclxuXHRcdFx0YXdhaXQgdGhpcy5hcHAudmF1bHQubW9kaWZ5KG5vdGVGaWxlLCB0ZXh0KTtcclxuXHR9XHJcblxyXG5cclxuXHRhc3luYyByZXBsYWNlQWxsTm90ZVdpa2lsaW5rc1dpdGhNYXJrZG93bkxpbmtzKG5vdGVQYXRoOiBzdHJpbmcpOiBQcm9taXNlPExpbmtzQW5kRW1iZWRzQ2hhbmdlZEluZm8+IHtcclxuXHRcdGlmICh0aGlzLmlzUGF0aElnbm9yZWQobm90ZVBhdGgpKVxyXG5cdFx0XHRyZXR1cm47XHJcblxyXG5cdFx0bGV0IHJlczogTGlua3NBbmRFbWJlZHNDaGFuZ2VkSW5mbyA9IHtcclxuXHRcdFx0bGlua3M6IFtdLFxyXG5cdFx0XHRlbWJlZHM6IFtdLFxyXG5cdFx0fVxyXG5cclxuXHRcdGxldCBub3RlRmlsZSA9IHRoaXMuZ2V0RmlsZUJ5UGF0aChub3RlUGF0aCk7XHJcblx0XHRpZiAoIW5vdGVGaWxlKSB7XHJcblx0XHRcdGNvbnNvbGUuZXJyb3IodGhpcy5jb25zb2xlTG9nUHJlZml4ICsgXCJjYW4ndCB1cGRhdGUgd2lraWxpbmtzIGluIG5vdGUsIGZpbGUgbm90IGZvdW5kOiBcIiArIG5vdGVQYXRoKTtcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0fVxyXG5cclxuXHRcdGNvbnN0IGNhY2hlID0gYXdhaXQgVXRpbHMuZ2V0Q2FjaGVTYWZlKG5vdGVQYXRoKTtcclxuXHRcdGxldCBsaW5rcyA9IGNhY2hlLmxpbmtzO1xyXG5cdFx0bGV0IGVtYmVkcyA9IGNhY2hlLmVtYmVkcztcclxuXHRcdGxldCB0ZXh0ID0gYXdhaXQgdGhpcy5hcHAudmF1bHQucmVhZChub3RlRmlsZSk7XHJcblx0XHRsZXQgZGlydHkgPSBmYWxzZTtcclxuXHJcblx0XHRpZiAoZW1iZWRzKSB7IC8vZW1iZWRzIG11c3QgZ28gZmlyc3QhXHJcblx0XHRcdGZvciAobGV0IGVtYmVkIG9mIGVtYmVkcykge1xyXG5cdFx0XHRcdGlmICh0aGlzLmNoZWNrSXNDb3JyZWN0V2lraUVtYmVkKGVtYmVkLm9yaWdpbmFsKSkge1xyXG5cclxuXHRcdFx0XHRcdGxldCBuZXdQYXRoID0gVXRpbHMubm9ybWFsaXplUGF0aEZvckxpbmsoZW1iZWQubGluaylcclxuXHRcdFx0XHRcdGxldCBuZXdMaW5rID0gJyFbJyArICddJyArICcoJyArIG5ld1BhdGggKyAnKSdcclxuXHRcdFx0XHRcdHRleHQgPSB0ZXh0LnJlcGxhY2UoZW1iZWQub3JpZ2luYWwsIG5ld0xpbmspO1xyXG5cclxuXHRcdFx0XHRcdGNvbnNvbGUubG9nKHRoaXMuY29uc29sZUxvZ1ByZWZpeCArIFwid2lraSBsaW5rIChlbWJlZCkgcmVwbGFjZWQgaW4gbm90ZSBbbm90ZSwgb2xkIGxpbmssIG5ldyBsaW5rXTogXFxuICAgXCJcclxuXHRcdFx0XHRcdFx0KyBub3RlRmlsZS5wYXRoICsgXCJcXG4gICBcIiArIGVtYmVkLm9yaWdpbmFsICsgXCJcXG4gICBcIiArIG5ld0xpbmspXHJcblxyXG5cdFx0XHRcdFx0cmVzLmVtYmVkcy5wdXNoKHsgb2xkOiBlbWJlZCwgbmV3TGluazogbmV3TGluayB9KVxyXG5cclxuXHRcdFx0XHRcdGRpcnR5ID0gdHJ1ZTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHRpZiAobGlua3MpIHtcclxuXHRcdFx0Zm9yIChsZXQgbGluayBvZiBsaW5rcykge1xyXG5cdFx0XHRcdGlmICh0aGlzLmNoZWNrSXNDb3JyZWN0V2lraUxpbmsobGluay5vcmlnaW5hbCkpIHtcclxuXHRcdFx0XHRcdGxldCBuZXdQYXRoID0gVXRpbHMubm9ybWFsaXplUGF0aEZvckxpbmsobGluay5saW5rKVxyXG5cclxuXHRcdFx0XHRcdGxldCBmaWxlID0gdGhpcy5hcHAubWV0YWRhdGFDYWNoZS5nZXRGaXJzdExpbmtwYXRoRGVzdChsaW5rLmxpbmssIG5vdGVQYXRoKTtcclxuXHRcdFx0XHRcdGlmIChmaWxlICYmIGZpbGUuZXh0ZW5zaW9uID09IFwibWRcIiAmJiAhbmV3UGF0aC5lbmRzV2l0aChcIi5tZFwiKSlcclxuXHRcdFx0XHRcdFx0bmV3UGF0aCA9IG5ld1BhdGggKyBcIi5tZFwiO1xyXG5cclxuXHRcdFx0XHRcdGxldCBuZXdMaW5rID0gJ1snICsgbGluay5kaXNwbGF5VGV4dCArICddJyArICcoJyArIG5ld1BhdGggKyAnKSdcclxuXHRcdFx0XHRcdHRleHQgPSB0ZXh0LnJlcGxhY2UobGluay5vcmlnaW5hbCwgbmV3TGluayk7XHJcblxyXG5cdFx0XHRcdFx0Y29uc29sZS5sb2codGhpcy5jb25zb2xlTG9nUHJlZml4ICsgXCJ3aWtpIGxpbmsgcmVwbGFjZWQgaW4gbm90ZSBbbm90ZSwgb2xkIGxpbmssIG5ldyBsaW5rXTogXFxuICAgXCJcclxuXHRcdFx0XHRcdFx0KyBub3RlRmlsZS5wYXRoICsgXCJcXG4gICBcIiArIGxpbmsub3JpZ2luYWwgKyBcIlxcbiAgIFwiICsgbmV3TGluaylcclxuXHJcblx0XHRcdFx0XHRyZXMubGlua3MucHVzaCh7IG9sZDogbGluaywgbmV3TGluazogbmV3TGluayB9KVxyXG5cclxuXHRcdFx0XHRcdGRpcnR5ID0gdHJ1ZTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHRpZiAoZGlydHkpXHJcblx0XHRcdGF3YWl0IHRoaXMuYXBwLnZhdWx0Lm1vZGlmeShub3RlRmlsZSwgdGV4dCk7XHJcblxyXG5cdFx0cmV0dXJuIHJlcztcclxuXHR9XHJcbn1cclxuIiwiaW1wb3J0IHsgQXBwLCBUQWJzdHJhY3RGaWxlLCBURmlsZSB9IGZyb20gJ29ic2lkaWFuJztcclxuaW1wb3J0IHsgTGlua3NIYW5kbGVyLCBQYXRoQ2hhbmdlSW5mbyB9IGZyb20gJy4vbGlua3MtaGFuZGxlcic7XHJcbmltcG9ydCB7IFV0aWxzIH0gZnJvbSAnLi91dGlscyc7XHJcbmltcG9ydCB7IHBhdGggfSBmcm9tICcuL3BhdGgnO1xyXG5cclxuZXhwb3J0IGludGVyZmFjZSBNb3ZlZEF0dGFjaG1lbnRSZXN1bHQge1xyXG5cdG1vdmVkQXR0YWNobWVudHM6IFBhdGhDaGFuZ2VJbmZvW11cclxuXHRyZW5hbWVkRmlsZXM6IFBhdGhDaGFuZ2VJbmZvW10sXHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBGaWxlc0hhbmRsZXIge1xyXG5cdGNvbnN0cnVjdG9yKFxyXG5cdFx0cHJpdmF0ZSBhcHA6IEFwcCxcclxuXHRcdHByaXZhdGUgbGg6IExpbmtzSGFuZGxlcixcclxuXHRcdHByaXZhdGUgY29uc29sZUxvZ1ByZWZpeDogc3RyaW5nID0gXCJcIixcclxuXHRcdHByaXZhdGUgaWdub3JlRm9sZGVyczogc3RyaW5nW10gPSBbXSxcclxuXHRcdHByaXZhdGUgaWdub3JlRmlsZXNSZWdleDogUmVnRXhwW10gPSBbXSxcclxuXHQpIHsgfVxyXG5cclxuXHRpc1BhdGhJZ25vcmVkKHBhdGg6IHN0cmluZyk6IGJvb2xlYW4ge1xyXG5cdFx0aWYgKHBhdGguc3RhcnRzV2l0aChcIi4vXCIpKVxyXG5cdFx0XHRwYXRoID0gcGF0aC5zdWJzdHJpbmcoMik7XHJcblxyXG5cdFx0Zm9yIChsZXQgZm9sZGVyIG9mIHRoaXMuaWdub3JlRm9sZGVycykge1xyXG5cdFx0XHRpZiAocGF0aC5zdGFydHNXaXRoKGZvbGRlcikpIHtcclxuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdGZvciAobGV0IGZpbGVSZWdleCBvZiB0aGlzLmlnbm9yZUZpbGVzUmVnZXgpIHtcclxuXHRcdFx0bGV0IHRlc3RSZXN1bHQgPSBmaWxlUmVnZXgudGVzdChwYXRoKVxyXG5cdFx0XHQvLyBjb25zb2xlLmxvZyhwYXRoLGZpbGVSZWdleCx0ZXN0UmVzdWx0KVxyXG5cdFx0XHRpZih0ZXN0UmVzdWx0KSB7XHJcblx0XHRcdFx0cmV0dXJuIHRydWU7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGFzeW5jIGNyZWF0ZUZvbGRlckZvckF0dGFjaG1lbnRGcm9tTGluayhsaW5rOiBzdHJpbmcsIG93bmluZ05vdGVQYXRoOiBzdHJpbmcpIHtcclxuXHRcdGxldCBuZXdGdWxsUGF0aCA9IHRoaXMubGguZ2V0RnVsbFBhdGhGb3JMaW5rKGxpbmssIG93bmluZ05vdGVQYXRoKTtcclxuXHRcdHJldHVybiBhd2FpdCB0aGlzLmNyZWF0ZUZvbGRlckZvckF0dGFjaG1lbnRGcm9tUGF0aChuZXdGdWxsUGF0aCk7XHJcblx0fVxyXG5cclxuXHRhc3luYyBjcmVhdGVGb2xkZXJGb3JBdHRhY2htZW50RnJvbVBhdGgoZmlsZVBhdGg6IHN0cmluZykge1xyXG5cdFx0bGV0IG5ld1BhcmVudEZvbGRlciA9IGZpbGVQYXRoLnN1YnN0cmluZygwLCBmaWxlUGF0aC5sYXN0SW5kZXhPZihcIi9cIikpO1xyXG5cdFx0dHJ5IHtcclxuXHRcdFx0Ly90b2RvIGNoZWNrIGZpbGRlciBleGlzdFxyXG5cdFx0XHRhd2FpdCB0aGlzLmFwcC52YXVsdC5jcmVhdGVGb2xkZXIobmV3UGFyZW50Rm9sZGVyKVxyXG5cdFx0fSBjYXRjaCB7IH1cclxuXHR9XHJcblxyXG5cdGdlbmVyYXRlRmlsZUNvcHlOYW1lKG9yaWdpbmFsTmFtZTogc3RyaW5nKTogc3RyaW5nIHtcclxuXHRcdGxldCBleHQgPSBwYXRoLmV4dG5hbWUob3JpZ2luYWxOYW1lKTtcclxuXHRcdGxldCBiYXNlTmFtZSA9IHBhdGguYmFzZW5hbWUob3JpZ2luYWxOYW1lLCBleHQpO1xyXG5cdFx0bGV0IGRpciA9IHBhdGguZGlybmFtZShvcmlnaW5hbE5hbWUpO1xyXG5cdFx0Zm9yIChsZXQgaSA9IDE7IGkgPCAxMDAwMDA7IGkrKykge1xyXG5cdFx0XHRsZXQgbmV3TmFtZSA9IGRpciArIFwiL1wiICsgYmFzZU5hbWUgKyBcIiBcIiArIGkgKyBleHQ7XHJcblx0XHRcdGxldCBleGlzdEZpbGUgPSB0aGlzLmxoLmdldEZpbGVCeVBhdGgobmV3TmFtZSk7XHJcblx0XHRcdGlmICghZXhpc3RGaWxlKVxyXG5cdFx0XHRcdHJldHVybiBuZXdOYW1lO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIFwiXCI7XHJcblx0fVxyXG5cclxuXHRhc3luYyBtb3ZlQ2FjaGVkTm90ZUF0dGFjaG1lbnRzKG9sZE5vdGVQYXRoOiBzdHJpbmcsIG5ld05vdGVQYXRoOiBzdHJpbmcsXHJcblx0XHRkZWxldGVFeGlzdEZpbGVzOiBib29sZWFuLCBhdHRhY2htZW50c1N1YmZvbGRlcjogc3RyaW5nKTogUHJvbWlzZTxNb3ZlZEF0dGFjaG1lbnRSZXN1bHQ+IHtcclxuXHJcblx0XHRpZiAodGhpcy5pc1BhdGhJZ25vcmVkKG9sZE5vdGVQYXRoKSB8fCB0aGlzLmlzUGF0aElnbm9yZWQobmV3Tm90ZVBhdGgpKVxyXG5cdFx0XHRyZXR1cm47XHJcblxyXG5cdFx0Ly90cnkgdG8gZ2V0IGVtYmVkcyBmb3Igb2xkIG9yIG5ldyBwYXRoIChtZXRhZGF0YUNhY2hlIGNhbiBiZSB1cGRhdGVkIG9yIG5vdClcclxuXHRcdC8vISEhIHRoaXMgY2FuIHJldHVybiB1bmRlZmluZWQgaWYgbm90ZSB3YXMganVzdCB1cGRhdGVkXHJcblxyXG5cdFx0bGV0IGVtYmVkcyA9IChhd2FpdCBVdGlscy5nZXRDYWNoZVNhZmUobmV3Tm90ZVBhdGgpKS5lbWJlZHM7XHJcblxyXG5cdFx0aWYgKCFlbWJlZHMpXHJcblx0XHRcdHJldHVybjtcclxuXHJcblx0XHRsZXQgcmVzdWx0OiBNb3ZlZEF0dGFjaG1lbnRSZXN1bHQgPSB7XHJcblx0XHRcdG1vdmVkQXR0YWNobWVudHM6IFtdLFxyXG5cdFx0XHRyZW5hbWVkRmlsZXM6IFtdXHJcblx0XHR9O1xyXG5cclxuXHRcdGZvciAobGV0IGVtYmVkIG9mIGVtYmVkcykge1xyXG5cdFx0XHRsZXQgbGluayA9IGVtYmVkLmxpbms7XHJcblx0XHRcdGxldCBvbGRMaW5rUGF0aCA9IHRoaXMubGguZ2V0RnVsbFBhdGhGb3JMaW5rKGxpbmssIG9sZE5vdGVQYXRoKTtcclxuXHJcblx0XHRcdGlmIChyZXN1bHQubW92ZWRBdHRhY2htZW50cy5maW5kSW5kZXgoeCA9PiB4Lm9sZFBhdGggPT0gb2xkTGlua1BhdGgpICE9IC0xKVxyXG5cdFx0XHRcdGNvbnRpbnVlOy8vYWxyZWFkeSBtb3ZlZFxyXG5cclxuXHRcdFx0bGV0IGZpbGUgPSB0aGlzLmxoLmdldEZpbGVCeUxpbmsobGluaywgb2xkTm90ZVBhdGgpO1xyXG5cdFx0XHRpZiAoIWZpbGUpIHtcclxuXHRcdFx0XHRmaWxlID0gdGhpcy5saC5nZXRGaWxlQnlMaW5rKGxpbmssIG5ld05vdGVQYXRoKTtcclxuXHRcdFx0XHRpZiAoIWZpbGUpIHtcclxuXHRcdFx0XHRcdGNvbnNvbGUuZXJyb3IodGhpcy5jb25zb2xlTG9nUHJlZml4ICsgb2xkTm90ZVBhdGggKyBcIiBoYXMgYmFkIGVtYmVkIChmaWxlIGRvZXMgbm90IGV4aXN0KTogXCIgKyBsaW5rKTtcclxuXHRcdFx0XHRcdGNvbnRpbnVlO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0Ly9pZiBhdHRhY2htZW50IG5vdCBpbiB0aGUgbm90ZSBmb2xkZXIsIHNraXAgaXRcclxuXHRcdFx0Ly8gPSBcIi5cIiBtZWFucyB0aGF0IG5vdGUgd2FzIGF0IHJvb3QgcGF0aCwgc28gZG8gbm90IHNraXAgaXRcclxuXHRcdFx0aWYgKHBhdGguZGlybmFtZShvbGROb3RlUGF0aCkgIT0gXCIuXCIgJiYgIXBhdGguZGlybmFtZShvbGRMaW5rUGF0aCkuc3RhcnRzV2l0aChwYXRoLmRpcm5hbWUob2xkTm90ZVBhdGgpKSlcclxuXHRcdFx0XHRjb250aW51ZTtcclxuXHJcblx0XHRcdGxldCBuZXdMaW5rUGF0aCA9IHRoaXMuZ2V0TmV3QXR0YWNobWVudFBhdGgoZmlsZS5wYXRoLCBuZXdOb3RlUGF0aCwgYXR0YWNobWVudHNTdWJmb2xkZXIpO1xyXG5cclxuXHRcdFx0aWYgKG5ld0xpbmtQYXRoID09IGZpbGUucGF0aCkgLy9ub3RoaW5nIHRvIG1vdmVcclxuXHRcdFx0XHRjb250aW51ZTtcclxuXHJcblx0XHRcdGxldCByZXMgPSBhd2FpdCB0aGlzLm1vdmVBdHRhY2htZW50KGZpbGUsIG5ld0xpbmtQYXRoLCBbb2xkTm90ZVBhdGgsIG5ld05vdGVQYXRoXSwgZGVsZXRlRXhpc3RGaWxlcyk7XHJcblx0XHRcdHJlc3VsdC5tb3ZlZEF0dGFjaG1lbnRzID0gcmVzdWx0Lm1vdmVkQXR0YWNobWVudHMuY29uY2F0KHJlcy5tb3ZlZEF0dGFjaG1lbnRzKTtcclxuXHRcdFx0cmVzdWx0LnJlbmFtZWRGaWxlcyA9IHJlc3VsdC5yZW5hbWVkRmlsZXMuY29uY2F0KHJlcy5yZW5hbWVkRmlsZXMpO1xyXG5cclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gcmVzdWx0O1xyXG5cdH1cclxuXHJcblx0Z2V0TmV3QXR0YWNobWVudFBhdGgob2xkQXR0YWNobWVudFBhdGg6IHN0cmluZywgbm90ZVBhdGg6IHN0cmluZywgc3ViZm9sZGVyTmFtZTogc3RyaW5nKTogc3RyaW5nIHtcclxuXHRcdGxldCByZXNvbHZlZFN1YkZvbGRlck5hbWUgPSBzdWJmb2xkZXJOYW1lLnJlcGxhY2UoL1xcJHtmaWxlbmFtZX0vZywgcGF0aC5iYXNlbmFtZShub3RlUGF0aCwgXCIubWRcIikpO1xyXG5cdFx0bGV0IG5ld1BhdGggPSAocmVzb2x2ZWRTdWJGb2xkZXJOYW1lID09IFwiXCIpID8gcGF0aC5kaXJuYW1lKG5vdGVQYXRoKSA6IHBhdGguam9pbihwYXRoLmRpcm5hbWUobm90ZVBhdGgpLCByZXNvbHZlZFN1YkZvbGRlck5hbWUpO1xyXG5cdFx0bmV3UGF0aCA9IFV0aWxzLm5vcm1hbGl6ZVBhdGhGb3JGaWxlKHBhdGguam9pbihuZXdQYXRoLCBwYXRoLmJhc2VuYW1lKG9sZEF0dGFjaG1lbnRQYXRoKSkpO1xyXG5cdFx0cmV0dXJuIG5ld1BhdGg7XHJcblx0fVxyXG5cclxuXHJcblx0YXN5bmMgY29sbGVjdEF0dGFjaG1lbnRzRm9yQ2FjaGVkTm90ZShub3RlUGF0aDogc3RyaW5nLCBzdWJmb2xkZXJOYW1lOiBzdHJpbmcsXHJcblx0XHRkZWxldGVFeGlzdEZpbGVzOiBib29sZWFuKTogUHJvbWlzZTxNb3ZlZEF0dGFjaG1lbnRSZXN1bHQ+IHtcclxuXHJcblx0XHRpZiAodGhpcy5pc1BhdGhJZ25vcmVkKG5vdGVQYXRoKSlcclxuXHRcdFx0cmV0dXJuO1xyXG5cclxuXHRcdGxldCByZXN1bHQ6IE1vdmVkQXR0YWNobWVudFJlc3VsdCA9IHtcclxuXHRcdFx0bW92ZWRBdHRhY2htZW50czogW10sXHJcblx0XHRcdHJlbmFtZWRGaWxlczogW11cclxuXHRcdH07XHJcblxyXG5cdFx0Y29uc3QgY2FjaGUgPSBhd2FpdCBVdGlscy5nZXRDYWNoZVNhZmUobm90ZVBhdGgpO1xyXG5cclxuXHRcdGNvbnN0IGxpbmtPYmpzID0gWy4uLihjYWNoZS5lbWJlZHMgPz8gW10pLCAuLi4oY2FjaGUubGlua3MgPz8gW10pXTtcclxuXHJcblx0XHRmb3IgKGxldCBsaW5rT2JqIG9mIGxpbmtPYmpzKSB7XHJcblx0XHRcdGxldCBsaW5rID0gdGhpcy5saC5zcGxpdExpbmtUb1BhdGhBbmRTZWN0aW9uKGxpbmtPYmoubGluaykubGluaztcclxuXHJcblx0XHRcdGlmIChsaW5rLnN0YXJ0c1dpdGgoXCIjXCIpKSB7XHJcblx0XHRcdFx0Ly8gaW50ZXJuYWwgc2VjdGlvbiBsaW5rXHJcblx0XHRcdFx0Y29udGludWU7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGxldCBmdWxsUGF0aExpbmsgPSB0aGlzLmxoLmdldEZ1bGxQYXRoRm9yTGluayhsaW5rLCBub3RlUGF0aCk7XHJcblx0XHRcdGlmIChyZXN1bHQubW92ZWRBdHRhY2htZW50cy5maW5kSW5kZXgoeCA9PiB4Lm9sZFBhdGggPT0gZnVsbFBhdGhMaW5rKSAhPSAtMSkge1xyXG5cdFx0XHRcdC8vIGFscmVhZHkgbW92ZWRcclxuXHRcdFx0XHRjb250aW51ZTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0bGV0IGZpbGUgPSB0aGlzLmxoLmdldEZpbGVCeUxpbmsobGluaywgbm90ZVBhdGgpXHJcblx0XHRcdGlmICghZmlsZSkge1xyXG5cdFx0XHRcdGNvbnN0IHR5cGUgPSBsaW5rT2JqLm9yaWdpbmFsLnN0YXJ0c1dpdGgoXCIhXCIpID8gXCJlbWJlZFwiIDogXCJsaW5rXCI7XHJcblx0XHRcdFx0Y29uc29sZS5lcnJvcihgJHt0aGlzLmNvbnNvbGVMb2dQcmVmaXh9JHtub3RlUGF0aH0gaGFzIGJhZCAke3R5cGV9IChmaWxlIGRvZXMgbm90IGV4aXN0KTogJHtsaW5rfWApO1xyXG5cdFx0XHRcdGNvbnRpbnVlO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRjb25zdCBleHRlbnNpb24gPSBmaWxlLmV4dGVuc2lvbi50b0xvd2VyQ2FzZSgpO1xyXG5cclxuXHRcdFx0aWYgKGV4dGVuc2lvbiA9PT0gXCJtZFwiIHx8IGZpbGUuZXh0ZW5zaW9uID09PSBcImNhbnZhc1wiKSB7XHJcblx0XHRcdFx0Ly8gaW50ZXJuYWwgZmlsZSBsaW5rXHJcblx0XHRcdFx0Y29udGludWU7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGxldCBuZXdQYXRoID0gdGhpcy5nZXROZXdBdHRhY2htZW50UGF0aChmaWxlLnBhdGgsIG5vdGVQYXRoLCBzdWJmb2xkZXJOYW1lKTtcclxuXHJcblx0XHRcdGlmIChuZXdQYXRoID09IGZpbGUucGF0aCkge1xyXG5cdFx0XHRcdC8vIG5vdGhpbmcgdG8gbW92ZVxyXG5cdFx0XHRcdGNvbnRpbnVlO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRsZXQgcmVzID0gYXdhaXQgdGhpcy5tb3ZlQXR0YWNobWVudChmaWxlLCBuZXdQYXRoLCBbbm90ZVBhdGhdLCBkZWxldGVFeGlzdEZpbGVzKTtcclxuXHJcblx0XHRcdHJlc3VsdC5tb3ZlZEF0dGFjaG1lbnRzID0gcmVzdWx0Lm1vdmVkQXR0YWNobWVudHMuY29uY2F0KHJlcy5tb3ZlZEF0dGFjaG1lbnRzKTtcclxuXHRcdFx0cmVzdWx0LnJlbmFtZWRGaWxlcyA9IHJlc3VsdC5yZW5hbWVkRmlsZXMuY29uY2F0KHJlcy5yZW5hbWVkRmlsZXMpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiByZXN1bHQ7XHJcblx0fVxyXG5cclxuXHJcblx0YXN5bmMgbW92ZUF0dGFjaG1lbnQoZmlsZTogVEZpbGUsIG5ld0xpbmtQYXRoOiBzdHJpbmcsIHBhcmVudE5vdGVQYXRoczogc3RyaW5nW10sIGRlbGV0ZUV4aXN0RmlsZXM6IGJvb2xlYW4pOiBQcm9taXNlPE1vdmVkQXR0YWNobWVudFJlc3VsdD4ge1xyXG5cdFx0Y29uc3QgcGF0aCA9IGZpbGUucGF0aDtcclxuXHJcblx0XHRsZXQgcmVzdWx0OiBNb3ZlZEF0dGFjaG1lbnRSZXN1bHQgPSB7XHJcblx0XHRcdG1vdmVkQXR0YWNobWVudHM6IFtdLFxyXG5cdFx0XHRyZW5hbWVkRmlsZXM6IFtdXHJcblx0XHR9O1xyXG5cclxuXHRcdGlmICh0aGlzLmlzUGF0aElnbm9yZWQocGF0aCkpXHJcblx0XHRcdHJldHVybiByZXN1bHQ7XHJcblxyXG5cclxuXHRcdGlmIChwYXRoID09IG5ld0xpbmtQYXRoKSB7XHJcblx0XHRcdGNvbnNvbGUud2Fybih0aGlzLmNvbnNvbGVMb2dQcmVmaXggKyBcIkNhbid0IG1vdmUgZmlsZS4gU291cmNlIGFuZCBkZXN0aW5hdGlvbiBwYXRoIHRoZSBzYW1lLlwiKVxyXG5cdFx0XHRyZXR1cm4gcmVzdWx0O1xyXG5cdFx0fVxyXG5cclxuXHRcdGF3YWl0IHRoaXMuY3JlYXRlRm9sZGVyRm9yQXR0YWNobWVudEZyb21QYXRoKG5ld0xpbmtQYXRoKTtcclxuXHJcblx0XHRsZXQgbGlua2VkTm90ZXMgPSBhd2FpdCB0aGlzLmxoLmdldENhY2hlZE5vdGVzVGhhdEhhdmVMaW5rVG9GaWxlKHBhdGgpO1xyXG5cdFx0aWYgKHBhcmVudE5vdGVQYXRocykge1xyXG5cdFx0XHRmb3IgKGxldCBub3RlUGF0aCBvZiBwYXJlbnROb3RlUGF0aHMpIHtcclxuXHRcdFx0XHRsaW5rZWROb3Rlcy5yZW1vdmUobm90ZVBhdGgpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKHBhdGggIT09IGZpbGUucGF0aCkge1xyXG5cdFx0XHRjb25zb2xlLndhcm4odGhpcy5jb25zb2xlTG9nUHJlZml4ICsgXCJGaWxlIHdhcyBtb3ZlZCBhbHJlYWR5XCIpXHJcblx0XHRcdHJldHVybiBhd2FpdCB0aGlzLm1vdmVBdHRhY2htZW50KGZpbGUsIG5ld0xpbmtQYXRoLCBwYXJlbnROb3RlUGF0aHMsIGRlbGV0ZUV4aXN0RmlsZXMpO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8vaWYgbm8gb3RoZXIgZmlsZSBoYXMgbGluayB0byB0aGlzIGZpbGUgLSB0cnkgdG8gbW92ZSBmaWxlXHJcblx0XHQvL2lmIGZpbGUgYWxyZWFkeSBleGlzdCBhdCBuZXcgbG9jYXRpb24gLSBkZWxldGUgb3IgbW92ZSB3aXRoIG5ldyBuYW1lXHJcblx0XHRpZiAobGlua2VkTm90ZXMubGVuZ3RoID09IDApIHtcclxuXHRcdFx0bGV0IGV4aXN0RmlsZSA9IHRoaXMubGguZ2V0RmlsZUJ5UGF0aChuZXdMaW5rUGF0aCk7XHJcblx0XHRcdGlmICghZXhpc3RGaWxlKSB7XHJcblx0XHRcdFx0Ly9tb3ZlXHJcblx0XHRcdFx0Y29uc29sZS5sb2codGhpcy5jb25zb2xlTG9nUHJlZml4ICsgXCJtb3ZlIGZpbGUgW2Zyb20sIHRvXTogXFxuICAgXCIgKyBwYXRoICsgXCJcXG4gICBcIiArIG5ld0xpbmtQYXRoKVxyXG5cdFx0XHRcdHJlc3VsdC5tb3ZlZEF0dGFjaG1lbnRzLnB1c2goeyBvbGRQYXRoOiBwYXRoLCBuZXdQYXRoOiBuZXdMaW5rUGF0aCB9KVxyXG5cdFx0XHRcdGF3YWl0IHRoaXMuYXBwLnZhdWx0LnJlbmFtZShmaWxlLCBuZXdMaW5rUGF0aCk7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0aWYgKGRlbGV0ZUV4aXN0RmlsZXMpIHtcclxuXHRcdFx0XHRcdC8vZGVsZXRlXHJcblx0XHRcdFx0XHRjb25zb2xlLmxvZyh0aGlzLmNvbnNvbGVMb2dQcmVmaXggKyBcImRlbGV0ZSBmaWxlOiBcXG4gICBcIiArIHBhdGgpXHJcblx0XHRcdFx0XHRyZXN1bHQubW92ZWRBdHRhY2htZW50cy5wdXNoKHsgb2xkUGF0aDogcGF0aCwgbmV3UGF0aDogbmV3TGlua1BhdGggfSlcclxuXHRcdFx0XHRcdGF3YWl0IHRoaXMuYXBwLnZhdWx0LnRyYXNoKGZpbGUsIHRydWUpO1xyXG5cdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHQvL21vdmUgd2l0aCBuZXcgbmFtZVxyXG5cdFx0XHRcdFx0bGV0IG5ld0ZpbGVDb3B5TmFtZSA9IHRoaXMuZ2VuZXJhdGVGaWxlQ29weU5hbWUobmV3TGlua1BhdGgpXHJcblx0XHRcdFx0XHRjb25zb2xlLmxvZyh0aGlzLmNvbnNvbGVMb2dQcmVmaXggKyBcImNvcHkgZmlsZSB3aXRoIG5ldyBuYW1lIFtmcm9tLCB0b106IFxcbiAgIFwiICsgcGF0aCArIFwiXFxuICAgXCIgKyBuZXdGaWxlQ29weU5hbWUpXHJcblx0XHRcdFx0XHRyZXN1bHQubW92ZWRBdHRhY2htZW50cy5wdXNoKHsgb2xkUGF0aDogcGF0aCwgbmV3UGF0aDogbmV3RmlsZUNvcHlOYW1lIH0pXHJcblx0XHRcdFx0XHRhd2FpdCB0aGlzLmFwcC52YXVsdC5yZW5hbWUoZmlsZSwgbmV3RmlsZUNvcHlOYW1lKTtcclxuXHRcdFx0XHRcdHJlc3VsdC5yZW5hbWVkRmlsZXMucHVzaCh7IG9sZFBhdGg6IG5ld0xpbmtQYXRoLCBuZXdQYXRoOiBuZXdGaWxlQ29weU5hbWUgfSlcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdC8vaWYgc29tZSBvdGhlciBmaWxlIGhhcyBsaW5rIHRvIHRoaXMgZmlsZSAtIHRyeSB0byBjb3B5IGZpbGVcclxuXHRcdC8vaWYgZmlsZSBhbHJlYWR5IGV4aXN0IGF0IG5ldyBsb2NhdGlvbiAtIGNvcHkgZmlsZSB3aXRoIG5ldyBuYW1lIG9yIGRvIG5vdGhpbmdcclxuXHRcdGVsc2Uge1xyXG5cdFx0XHRsZXQgZXhpc3RGaWxlID0gdGhpcy5saC5nZXRGaWxlQnlQYXRoKG5ld0xpbmtQYXRoKTtcclxuXHRcdFx0aWYgKCFleGlzdEZpbGUpIHtcclxuXHRcdFx0XHQvL2NvcHlcclxuXHRcdFx0XHRjb25zb2xlLmxvZyh0aGlzLmNvbnNvbGVMb2dQcmVmaXggKyBcImNvcHkgZmlsZSBbZnJvbSwgdG9dOiBcXG4gICBcIiArIHBhdGggKyBcIlxcbiAgIFwiICsgbmV3TGlua1BhdGgpXHJcblx0XHRcdFx0cmVzdWx0Lm1vdmVkQXR0YWNobWVudHMucHVzaCh7IG9sZFBhdGg6IHBhdGgsIG5ld1BhdGg6IG5ld0xpbmtQYXRoIH0pXHJcblx0XHRcdFx0YXdhaXQgdGhpcy5hcHAudmF1bHQuY29weShmaWxlLCBuZXdMaW5rUGF0aCk7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0aWYgKGRlbGV0ZUV4aXN0RmlsZXMpIHtcclxuXHRcdFx0XHRcdC8vZG8gbm90aGluZ1xyXG5cdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHQvL2NvcHkgd2l0aCBuZXcgbmFtZVxyXG5cdFx0XHRcdFx0bGV0IG5ld0ZpbGVDb3B5TmFtZSA9IHRoaXMuZ2VuZXJhdGVGaWxlQ29weU5hbWUobmV3TGlua1BhdGgpXHJcblx0XHRcdFx0XHRjb25zb2xlLmxvZyh0aGlzLmNvbnNvbGVMb2dQcmVmaXggKyBcImNvcHkgZmlsZSB3aXRoIG5ldyBuYW1lIFtmcm9tLCB0b106IFxcbiAgIFwiICsgcGF0aCArIFwiXFxuICAgXCIgKyBuZXdGaWxlQ29weU5hbWUpXHJcblx0XHRcdFx0XHRyZXN1bHQubW92ZWRBdHRhY2htZW50cy5wdXNoKHsgb2xkUGF0aDogZmlsZS5wYXRoLCBuZXdQYXRoOiBuZXdGaWxlQ29weU5hbWUgfSlcclxuXHRcdFx0XHRcdGF3YWl0IHRoaXMuYXBwLnZhdWx0LmNvcHkoZmlsZSwgbmV3RmlsZUNvcHlOYW1lKTtcclxuXHRcdFx0XHRcdHJlc3VsdC5yZW5hbWVkRmlsZXMucHVzaCh7IG9sZFBhdGg6IG5ld0xpbmtQYXRoLCBuZXdQYXRoOiBuZXdGaWxlQ29weU5hbWUgfSlcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdHJldHVybiByZXN1bHQ7XHJcblx0fVxyXG5cclxuXHJcblxyXG5cclxuXHRhc3luYyBkZWxldGVFbXB0eUZvbGRlcnMoZGlyTmFtZTogc3RyaW5nKSB7XHJcblx0XHRpZiAodGhpcy5pc1BhdGhJZ25vcmVkKGRpck5hbWUpKVxyXG5cdFx0XHRyZXR1cm47XHJcblxyXG5cdFx0aWYgKGRpck5hbWUuc3RhcnRzV2l0aChcIi4vXCIpKVxyXG5cdFx0XHRkaXJOYW1lID0gZGlyTmFtZS5zdWJzdHJpbmcoMik7XHJcblxyXG5cclxuXHRcdGxldCBsaXN0ID0gYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5saXN0KGRpck5hbWUpO1xyXG5cdFx0Zm9yIChsZXQgZm9sZGVyIG9mIGxpc3QuZm9sZGVycykge1xyXG5cdFx0XHRhd2FpdCB0aGlzLmRlbGV0ZUVtcHR5Rm9sZGVycyhmb2xkZXIpXHJcblx0XHR9XHJcblxyXG5cdFx0bGlzdCA9IGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIubGlzdChkaXJOYW1lKTtcclxuXHRcdGlmIChsaXN0LmZpbGVzLmxlbmd0aCA9PSAwICYmIGxpc3QuZm9sZGVycy5sZW5ndGggPT0gMCkge1xyXG5cdFx0XHRjb25zb2xlLmxvZyh0aGlzLmNvbnNvbGVMb2dQcmVmaXggKyBcImRlbGV0ZSBlbXB0eSBmb2xkZXI6IFxcbiAgIFwiICsgZGlyTmFtZSlcclxuXHRcdFx0aWYgKGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIuZXhpc3RzKGRpck5hbWUpKVxyXG5cdFx0XHRcdGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIucm1kaXIoZGlyTmFtZSwgZmFsc2UpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0YXN5bmMgZGVsZXRlVW51c2VkQXR0YWNobWVudHNGb3JDYWNoZWROb3RlKG5vdGVQYXRoOiBzdHJpbmcpIHtcclxuXHRcdGlmICh0aGlzLmlzUGF0aElnbm9yZWQobm90ZVBhdGgpKVxyXG5cdFx0XHRyZXR1cm47XHJcblxyXG5cdFx0Ly8hISEgdGhpcyBjYW4gcmV0dXJuIHVuZGVmaW5lZCBpZiBub3RlIHdhcyBqdXN0IHVwZGF0ZWRcclxuXHRcdGxldCBlbWJlZHMgPSAoYXdhaXQgVXRpbHMuZ2V0Q2FjaGVTYWZlKG5vdGVQYXRoKSkuZW1iZWRzO1xyXG5cdFx0aWYgKGVtYmVkcykge1xyXG5cdFx0XHRmb3IgKGxldCBlbWJlZCBvZiBlbWJlZHMpIHtcclxuXHRcdFx0XHRsZXQgbGluayA9IGVtYmVkLmxpbms7XHJcblxyXG5cdFx0XHRcdGxldCBmdWxsUGF0aCA9IHRoaXMubGguZ2V0RnVsbFBhdGhGb3JMaW5rKGxpbmssIG5vdGVQYXRoKTtcclxuXHRcdFx0XHRsZXQgbGlua2VkTm90ZXMgPSBhd2FpdCB0aGlzLmxoLmdldENhY2hlZE5vdGVzVGhhdEhhdmVMaW5rVG9GaWxlKGZ1bGxQYXRoKTtcclxuXHRcdFx0XHRpZiAobGlua2VkTm90ZXMubGVuZ3RoID09IDApIHtcclxuXHRcdFx0XHRcdGxldCBmaWxlID0gdGhpcy5saC5nZXRGaWxlQnlMaW5rKGxpbmssIG5vdGVQYXRoLCBmYWxzZSk7XHJcblx0XHRcdFx0XHRpZiAoZmlsZSkge1xyXG5cdFx0XHRcdFx0XHR0cnkge1xyXG5cdFx0XHRcdFx0XHRcdGF3YWl0IHRoaXMuYXBwLnZhdWx0LnRyYXNoKGZpbGUsIHRydWUpO1xyXG5cdFx0XHRcdFx0XHR9IGNhdGNoIHsgfVxyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHR9XHJcbn1cclxuXHJcblxyXG4iLCJpbXBvcnQgeyBBcHAsIFBsdWdpbiwgVEFic3RyYWN0RmlsZSwgVEZpbGUsIEVtYmVkQ2FjaGUsIExpbmtDYWNoZSwgTm90aWNlLCBFZGl0b3IsIE1hcmtkb3duVmlldyB9IGZyb20gJ29ic2lkaWFuJztcclxuaW1wb3J0IHsgUGx1Z2luU2V0dGluZ3MsIERFRkFVTFRfU0VUVElOR1MsIFNldHRpbmdUYWIgfSBmcm9tICcuL3NldHRpbmdzJztcclxuaW1wb3J0IHsgVXRpbHMgfSBmcm9tICcuL3V0aWxzJztcclxuaW1wb3J0IHsgTGlua3NIYW5kbGVyLCBQYXRoQ2hhbmdlSW5mbyB9IGZyb20gJy4vbGlua3MtaGFuZGxlcic7XHJcbmltcG9ydCB7IEZpbGVzSGFuZGxlciwgTW92ZWRBdHRhY2htZW50UmVzdWx0IH0gZnJvbSAnLi9maWxlcy1oYW5kbGVyJztcclxuaW1wb3J0IHsgcGF0aCB9IGZyb20gJy4vcGF0aCc7XHJcblxyXG5cclxuXHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDb25zaXN0ZW50QXR0YWNobWVudHNBbmRMaW5rcyBleHRlbmRzIFBsdWdpbiB7XHJcblx0c2V0dGluZ3M6IFBsdWdpblNldHRpbmdzO1xyXG5cdGxoOiBMaW5rc0hhbmRsZXI7XHJcblx0Zmg6IEZpbGVzSGFuZGxlcjtcclxuXHJcblx0cmVjZW50bHlSZW5hbWVkRmlsZXM6IFBhdGhDaGFuZ2VJbmZvW10gPSBbXTtcclxuXHRjdXJyZW50bHlSZW5hbWluZ0ZpbGVzOiBQYXRoQ2hhbmdlSW5mb1tdID0gW107XHJcblx0dGltZXJJZDogTm9kZUpTLlRpbWVvdXQ7XHJcblx0cmVuYW1pbmdJc0FjdGl2ZSA9IGZhbHNlO1xyXG5cclxuXHRhc3luYyBvbmxvYWQoKSB7XHJcblx0XHRhd2FpdCB0aGlzLmxvYWRTZXR0aW5ncygpO1xyXG5cclxuXHRcdHRoaXMuYWRkU2V0dGluZ1RhYihuZXcgU2V0dGluZ1RhYih0aGlzLmFwcCwgdGhpcykpO1xyXG5cclxuXHRcdHRoaXMucmVnaXN0ZXJFdmVudChcclxuXHRcdFx0dGhpcy5hcHAudmF1bHQub24oJ2RlbGV0ZScsIChmaWxlKSA9PiB0aGlzLmhhbmRsZURlbGV0ZWRGaWxlKGZpbGUpKSxcclxuXHRcdCk7XHJcblxyXG5cdFx0dGhpcy5yZWdpc3RlckV2ZW50KFxyXG5cdFx0XHR0aGlzLmFwcC52YXVsdC5vbigncmVuYW1lJywgKGZpbGUsIG9sZFBhdGgpID0+IHRoaXMuaGFuZGxlUmVuYW1lZEZpbGUoZmlsZSwgb2xkUGF0aCkpLFxyXG5cdFx0KTtcclxuXHJcblx0XHR0aGlzLmFkZENvbW1hbmQoe1xyXG5cdFx0XHRpZDogJ2NvbGxlY3QtYWxsLWF0dGFjaG1lbnRzJyxcclxuXHRcdFx0bmFtZTogJ0NvbGxlY3QgQWxsIEF0dGFjaG1lbnRzJyxcclxuXHRcdFx0Y2FsbGJhY2s6ICgpID0+IHRoaXMuY29sbGVjdEFsbEF0dGFjaG1lbnRzKClcclxuXHRcdH0pO1xyXG5cclxuXHRcdHRoaXMuYWRkQ29tbWFuZCh7XHJcblx0XHRcdGlkOiAnY29sbGVjdC1hdHRhY2htZW50cy1jdXJyZW50LW5vdGUnLFxyXG5cdFx0XHRuYW1lOiAnQ29sbGVjdCBBdHRhY2htZW50cyBpbiBDdXJyZW50IE5vdGUnLFxyXG5cdFx0XHRlZGl0b3JDYWxsYmFjazogKGVkaXRvcjogRWRpdG9yLCB2aWV3OiBNYXJrZG93blZpZXcpID0+IHRoaXMuY29sbGVjdEF0dGFjaG1lbnRzQ3VycmVudE5vdGUoZWRpdG9yLCB2aWV3KVxyXG5cdFx0fSk7XHJcblxyXG5cdFx0dGhpcy5hZGRDb21tYW5kKHtcclxuXHRcdFx0aWQ6ICdkZWxldGUtZW1wdHktZm9sZGVycycsXHJcblx0XHRcdG5hbWU6ICdEZWxldGUgRW1wdHkgRm9sZGVycycsXHJcblx0XHRcdGNhbGxiYWNrOiAoKSA9PiB0aGlzLmRlbGV0ZUVtcHR5Rm9sZGVycygpXHJcblx0XHR9KTtcclxuXHJcblx0XHR0aGlzLmFkZENvbW1hbmQoe1xyXG5cdFx0XHRpZDogJ2NvbnZlcnQtYWxsLWxpbmstcGF0aHMtdG8tcmVsYXRpdmUnLFxyXG5cdFx0XHRuYW1lOiAnQ29udmVydCBBbGwgTGluayBQYXRocyB0byBSZWxhdGl2ZScsXHJcblx0XHRcdGNhbGxiYWNrOiAoKSA9PiB0aGlzLmNvbnZlcnRBbGxMaW5rUGF0aHNUb1JlbGF0aXZlKClcclxuXHRcdH0pO1xyXG5cclxuXHRcdHRoaXMuYWRkQ29tbWFuZCh7XHJcblx0XHRcdGlkOiAnY29udmVydC1hbGwtZW1iZWQtcGF0aHMtdG8tcmVsYXRpdmUnLFxyXG5cdFx0XHRuYW1lOiAnQ29udmVydCBBbGwgRW1iZWQgUGF0aHMgdG8gUmVsYXRpdmUnLFxyXG5cdFx0XHRjYWxsYmFjazogKCkgPT4gdGhpcy5jb252ZXJ0QWxsRW1iZWRzUGF0aHNUb1JlbGF0aXZlKClcclxuXHRcdH0pO1xyXG5cclxuXHRcdHRoaXMuYWRkQ29tbWFuZCh7XHJcblx0XHRcdGlkOiAncmVwbGFjZS1hbGwtd2lraWxpbmtzLXdpdGgtbWFya2Rvd24tbGlua3MnLFxyXG5cdFx0XHRuYW1lOiAnUmVwbGFjZSBBbGwgV2lraSBMaW5rcyB3aXRoIE1hcmtkb3duIExpbmtzJyxcclxuXHRcdFx0Y2FsbGJhY2s6ICgpID0+IHRoaXMucmVwbGFjZUFsbFdpa2lsaW5rc1dpdGhNYXJrZG93bkxpbmtzKClcclxuXHRcdH0pO1xyXG5cclxuXHRcdHRoaXMuYWRkQ29tbWFuZCh7XHJcblx0XHRcdGlkOiAncmVvcmdhbml6ZS12YXVsdCcsXHJcblx0XHRcdG5hbWU6ICdSZW9yZ2FuaXplIFZhdWx0JyxcclxuXHRcdFx0Y2FsbGJhY2s6ICgpID0+IHRoaXMucmVvcmdhbml6ZVZhdWx0KClcclxuXHRcdH0pO1xyXG5cclxuXHRcdHRoaXMuYWRkQ29tbWFuZCh7XHJcblx0XHRcdGlkOiAnY2hlY2stY29uc2lzdGVuY3knLFxyXG5cdFx0XHRuYW1lOiAnQ2hlY2sgVmF1bHQgY29uc2lzdGVuY3knLFxyXG5cdFx0XHRjYWxsYmFjazogKCkgPT4gdGhpcy5jaGVja0NvbnNpc3RlbmN5KClcclxuXHRcdH0pO1xyXG5cclxuXHRcdC8vIG1ha2UgcmVnZXggZnJvbSBnaXZlbiBzdHJpbmdzIFxyXG5cdFx0dGhpcy5zZXR0aW5ncy5pZ25vcmVGaWxlc1JlZ2V4ID0gdGhpcy5zZXR0aW5ncy5pZ25vcmVGaWxlcy5tYXAodmFsPT5SZWdFeHAodmFsKSlcclxuXHJcblx0XHR0aGlzLmxoID0gbmV3IExpbmtzSGFuZGxlcihcclxuXHRcdFx0dGhpcy5hcHAsXHJcblx0XHRcdFwiQ29uc2lzdGVudCBBdHRhY2htZW50cyBhbmQgTGlua3M6IFwiLFxyXG5cdFx0XHR0aGlzLnNldHRpbmdzLmlnbm9yZUZvbGRlcnMsXHJcblx0XHRcdHRoaXMuc2V0dGluZ3MuaWdub3JlRmlsZXNSZWdleFxyXG5cdFx0KTtcclxuXHJcblx0XHR0aGlzLmZoID0gbmV3IEZpbGVzSGFuZGxlcihcclxuXHRcdFx0dGhpcy5hcHAsXHJcblx0XHRcdHRoaXMubGgsXHJcblx0XHRcdFwiQ29uc2lzdGVudCBBdHRhY2htZW50cyBhbmQgTGlua3M6IFwiLFxyXG5cdFx0XHR0aGlzLnNldHRpbmdzLmlnbm9yZUZvbGRlcnMsXHJcblx0XHRcdHRoaXMuc2V0dGluZ3MuaWdub3JlRmlsZXNSZWdleFxyXG5cdFx0KTtcclxuXHR9XHJcblxyXG5cdGlzUGF0aElnbm9yZWQocGF0aDogc3RyaW5nKTogYm9vbGVhbiB7XHJcblx0XHRpZiAocGF0aC5zdGFydHNXaXRoKFwiLi9cIikpXHJcblx0XHRcdHBhdGggPSBwYXRoLnN1YnN0cmluZygyKTtcclxuXHJcblx0XHRmb3IgKGxldCBmb2xkZXIgb2YgdGhpcy5zZXR0aW5ncy5pZ25vcmVGb2xkZXJzKSB7XHJcblx0XHRcdGlmIChwYXRoLnN0YXJ0c1dpdGgoZm9sZGVyKSkge1xyXG5cdFx0XHRcdHJldHVybiB0cnVlO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0Zm9yIChsZXQgZmlsZVJlZ2V4IG9mIHRoaXMuc2V0dGluZ3MuaWdub3JlRmlsZXNSZWdleCkge1xyXG5cdFx0XHRpZiAoZmlsZVJlZ2V4LnRlc3QocGF0aCkpIHtcclxuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxuXHJcblxyXG5cdGFzeW5jIGhhbmRsZURlbGV0ZWRGaWxlKGZpbGU6IFRBYnN0cmFjdEZpbGUpIHtcclxuXHRcdGlmICh0aGlzLmlzUGF0aElnbm9yZWQoZmlsZS5wYXRoKSlcclxuXHRcdFx0cmV0dXJuO1xyXG5cclxuXHRcdGxldCBmaWxlRXh0ID0gZmlsZS5wYXRoLnN1YnN0cmluZyhmaWxlLnBhdGgubGFzdEluZGV4T2YoXCIuXCIpKTtcclxuXHRcdGlmIChmaWxlRXh0ID09IFwiLm1kXCIpIHtcclxuXHRcdFx0aWYgKHRoaXMuc2V0dGluZ3MuZGVsZXRlQXR0YWNobWVudHNXaXRoTm90ZSkge1xyXG5cdFx0XHRcdGF3YWl0IHRoaXMuZmguZGVsZXRlVW51c2VkQXR0YWNobWVudHNGb3JDYWNoZWROb3RlKGZpbGUucGF0aCk7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdC8vZGVsZXRlIGNoaWxkIGZvbGRlcnMgKGRvIG5vdCBkZWxldGUgcGFyZW50KVxyXG5cdFx0XHRpZiAodGhpcy5zZXR0aW5ncy5kZWxldGVFbXB0eUZvbGRlcnMpIHtcclxuXHRcdFx0XHRpZiAoYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5leGlzdHMocGF0aC5kaXJuYW1lKGZpbGUucGF0aCkpKSB7XHJcblx0XHRcdFx0XHRsZXQgbGlzdCA9IGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIubGlzdChwYXRoLmRpcm5hbWUoZmlsZS5wYXRoKSk7XHJcblx0XHRcdFx0XHRmb3IgKGxldCBmb2xkZXIgb2YgbGlzdC5mb2xkZXJzKSB7XHJcblx0XHRcdFx0XHRcdGF3YWl0IHRoaXMuZmguZGVsZXRlRW1wdHlGb2xkZXJzKGZvbGRlcik7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRhc3luYyBoYW5kbGVSZW5hbWVkRmlsZShmaWxlOiBUQWJzdHJhY3RGaWxlLCBvbGRQYXRoOiBzdHJpbmcpIHtcclxuXHRcdHRoaXMucmVjZW50bHlSZW5hbWVkRmlsZXMucHVzaCh7IG9sZFBhdGg6IG9sZFBhdGgsIG5ld1BhdGg6IGZpbGUucGF0aCB9KTtcclxuXHJcblx0XHRjbGVhclRpbWVvdXQodGhpcy50aW1lcklkKTtcclxuXHRcdHRoaXMudGltZXJJZCA9IHNldFRpbWVvdXQoKCkgPT4geyB0aGlzLkhhbmRsZVJlY2VudGx5UmVuYW1lZEZpbGVzKCkgfSwgMzAwMCk7XHJcblx0fVxyXG5cclxuXHRhc3luYyBIYW5kbGVSZWNlbnRseVJlbmFtZWRGaWxlcygpIHtcclxuXHRcdGlmICghdGhpcy5yZWNlbnRseVJlbmFtZWRGaWxlcyB8fCB0aGlzLnJlY2VudGx5UmVuYW1lZEZpbGVzLmxlbmd0aCA9PSAwKSAvL25vdGhpbmcgdG8gcmVuYW1lXHJcblx0XHRcdHJldHVybjtcclxuXHJcblx0XHRpZiAodGhpcy5yZW5hbWluZ0lzQWN0aXZlKSAvL2FscmVhZHkgc3RhcnRlZFxyXG5cdFx0XHRyZXR1cm47XHJcblxyXG5cdFx0dGhpcy5yZW5hbWluZ0lzQWN0aXZlID0gdHJ1ZTtcclxuXHJcblx0XHR0aGlzLmN1cnJlbnRseVJlbmFtaW5nRmlsZXMgPSB0aGlzLnJlY2VudGx5UmVuYW1lZEZpbGVzOyAvL2NsZWFyIGFycmF5IGZvciBwdXNoaW5nIG5ldyBmaWxlcyBhc3luY1xyXG5cdFx0dGhpcy5yZWNlbnRseVJlbmFtZWRGaWxlcyA9IFtdO1xyXG5cclxuXHRcdG5ldyBOb3RpY2UoXCJGaXhpbmcgY29uc2lzdGVuY3kgZm9yIFwiICsgdGhpcy5jdXJyZW50bHlSZW5hbWluZ0ZpbGVzLmxlbmd0aCArIFwiIHJlbmFtZWQgZmlsZXNcIiArIFwiLi4uXCIpO1xyXG5cdFx0Y29uc29sZS5sb2coXCJDb25zaXN0ZW50IEF0dGFjaG1lbnRzIGFuZCBMaW5rczpcXG5GaXhpbmcgY29uc2lzdGVuY3kgZm9yIFwiICsgdGhpcy5jdXJyZW50bHlSZW5hbWluZ0ZpbGVzLmxlbmd0aCArIFwiIHJlbmFtZWQgZmlsZXNcIiArIFwiLi4uXCIpO1xyXG5cclxuXHRcdHRyeSB7XHJcblx0XHRcdGZvciAobGV0IGZpbGUgb2YgdGhpcy5jdXJyZW50bHlSZW5hbWluZ0ZpbGVzKSB7XHJcblx0XHRcdFx0aWYgKHRoaXMuaXNQYXRoSWdub3JlZChmaWxlLm5ld1BhdGgpIHx8IHRoaXMuaXNQYXRoSWdub3JlZChmaWxlLm9sZFBhdGgpKVxyXG5cdFx0XHRcdFx0cmV0dXJuO1xyXG5cclxuXHRcdFx0XHQvLyBhd2FpdCBVdGlscy5kZWxheSgxMCk7IC8vd2FpdGluZyBmb3IgdXBkYXRlIHZhdWx0XHJcblxyXG5cdFx0XHRcdGxldCByZXN1bHQ6IE1vdmVkQXR0YWNobWVudFJlc3VsdDtcclxuXHJcblx0XHRcdFx0bGV0IGZpbGVFeHQgPSBmaWxlLm9sZFBhdGguc3Vic3RyaW5nKGZpbGUub2xkUGF0aC5sYXN0SW5kZXhPZihcIi5cIikpO1xyXG5cclxuXHRcdFx0XHRpZiAoZmlsZUV4dCA9PSBcIi5tZFwiKSB7XHJcblx0XHRcdFx0XHQvLyBhd2FpdCBVdGlscy5kZWxheSg1MDApOy8vd2FpdGluZyBmb3IgdXBkYXRlIG1ldGFkYXRhQ2FjaGVcclxuXHJcblx0XHRcdFx0XHRpZiAoKHBhdGguZGlybmFtZShmaWxlLm9sZFBhdGgpICE9IHBhdGguZGlybmFtZShmaWxlLm5ld1BhdGgpKSB8fCAodGhpcy5zZXR0aW5ncy5hdHRhY2htZW50c1N1YmZvbGRlci5jb250YWlucyhcIiR7ZmlsZW5hbWV9XCIpKSkge1xyXG5cdFx0XHRcdFx0XHRpZiAodGhpcy5zZXR0aW5ncy5tb3ZlQXR0YWNobWVudHNXaXRoTm90ZSkge1xyXG5cdFx0XHRcdFx0XHRcdHJlc3VsdCA9IGF3YWl0IHRoaXMuZmgubW92ZUNhY2hlZE5vdGVBdHRhY2htZW50cyhcclxuXHRcdFx0XHRcdFx0XHRcdGZpbGUub2xkUGF0aCxcclxuXHRcdFx0XHRcdFx0XHRcdGZpbGUubmV3UGF0aCxcclxuXHRcdFx0XHRcdFx0XHRcdHRoaXMuc2V0dGluZ3MuZGVsZXRlRXhpc3RGaWxlc1doZW5Nb3ZlTm90ZSxcclxuXHRcdFx0XHRcdFx0XHRcdHRoaXMuc2V0dGluZ3MuYXR0YWNobWVudHNTdWJmb2xkZXJcclxuXHRcdFx0XHRcdFx0XHQpXHJcblxyXG5cdFx0XHRcdFx0XHRcdGlmICh0aGlzLnNldHRpbmdzLnVwZGF0ZUxpbmtzICYmIHJlc3VsdCkge1xyXG5cdFx0XHRcdFx0XHRcdFx0bGV0IGNoYW5nZWRGaWxlcyA9IHJlc3VsdC5yZW5hbWVkRmlsZXMuY29uY2F0KHJlc3VsdC5tb3ZlZEF0dGFjaG1lbnRzKTtcclxuXHRcdFx0XHRcdFx0XHRcdGlmIChjaGFuZ2VkRmlsZXMubGVuZ3RoID4gMCkge1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRhd2FpdCB0aGlzLmxoLnVwZGF0ZUNoYW5nZWRQYXRoc0luTm90ZShmaWxlLm5ld1BhdGgsIGNoYW5nZWRGaWxlcylcclxuXHRcdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHRcdGlmICh0aGlzLnNldHRpbmdzLnVwZGF0ZUxpbmtzKSB7XHJcblx0XHRcdFx0XHRcdFx0YXdhaXQgdGhpcy5saC51cGRhdGVJbnRlcm5hbExpbmtzSW5Nb3ZlZE5vdGUoZmlsZS5vbGRQYXRoLCBmaWxlLm5ld1BhdGgsIHRoaXMuc2V0dGluZ3MubW92ZUF0dGFjaG1lbnRzV2l0aE5vdGUpXHJcblx0XHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHRcdC8vZGVsZXRlIGNoaWxkIGZvbGRlcnMgKGRvIG5vdCBkZWxldGUgcGFyZW50KVxyXG5cdFx0XHRcdFx0XHRpZiAodGhpcy5zZXR0aW5ncy5kZWxldGVFbXB0eUZvbGRlcnMpIHtcclxuXHRcdFx0XHRcdFx0XHRpZiAoYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5leGlzdHMocGF0aC5kaXJuYW1lKGZpbGUub2xkUGF0aCkpKSB7XHJcblx0XHRcdFx0XHRcdFx0XHRsZXQgbGlzdCA9IGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIubGlzdChwYXRoLmRpcm5hbWUoZmlsZS5vbGRQYXRoKSk7XHJcblx0XHRcdFx0XHRcdFx0XHRmb3IgKGxldCBmb2xkZXIgb2YgbGlzdC5mb2xkZXJzKSB7XHJcblx0XHRcdFx0XHRcdFx0XHRcdGF3YWl0IHRoaXMuZmguZGVsZXRlRW1wdHlGb2xkZXJzKGZvbGRlcik7XHJcblx0XHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRsZXQgdXBkYXRlQWx0cyA9IHRoaXMuc2V0dGluZ3MuY2hhbmdlTm90ZUJhY2tsaW5rc0FsdCAmJiBmaWxlRXh0ID09IFwiLm1kXCI7XHJcblx0XHRcdFx0aWYgKHRoaXMuc2V0dGluZ3MudXBkYXRlTGlua3MpIHtcclxuXHRcdFx0XHRcdGF3YWl0IHRoaXMubGgudXBkYXRlTGlua3NUb1JlbmFtZWRGaWxlKGZpbGUub2xkUGF0aCwgZmlsZS5uZXdQYXRoLCB1cGRhdGVBbHRzLCB0aGlzLnNldHRpbmdzLnVzZUJ1aWx0SW5PYnNpZGlhbkxpbmtDYWNoaW5nKTtcclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdGlmIChyZXN1bHQgJiYgcmVzdWx0Lm1vdmVkQXR0YWNobWVudHMgJiYgcmVzdWx0Lm1vdmVkQXR0YWNobWVudHMubGVuZ3RoID4gMCkge1xyXG5cdFx0XHRcdFx0bmV3IE5vdGljZShcIk1vdmVkIFwiICsgcmVzdWx0Lm1vdmVkQXR0YWNobWVudHMubGVuZ3RoICsgXCIgYXR0YWNobWVudFwiICsgKHJlc3VsdC5tb3ZlZEF0dGFjaG1lbnRzLmxlbmd0aCA+IDEgPyBcInNcIiA6IFwiXCIpKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH0gY2F0Y2ggKGUpIHtcclxuXHRcdFx0Y29uc29sZS5lcnJvcihcIkNvbnNpc3RlbnQgQXR0YWNobWVudHMgYW5kIExpbmtzOiBcXG5cIiArIGUpO1xyXG5cdFx0fVxyXG5cclxuXHRcdG5ldyBOb3RpY2UoXCJGaXhpbmcgQ29uc2lzdGVuY3kgQ29tcGxldGVcIik7XHJcblx0XHRjb25zb2xlLmxvZyhcIkNvbnNpc3RlbnQgQXR0YWNobWVudHMgYW5kIExpbmtzOlxcbkZpeGluZyBjb25zaXN0ZW5jeSBjb21wbGV0ZVwiKTtcclxuXHJcblx0XHR0aGlzLnJlbmFtaW5nSXNBY3RpdmUgPSBmYWxzZTtcclxuXHJcblx0XHRpZiAodGhpcy5yZWNlbnRseVJlbmFtZWRGaWxlcyAmJiB0aGlzLnJlY2VudGx5UmVuYW1lZEZpbGVzLmxlbmd0aCA+IDApIHtcclxuXHRcdFx0Y2xlYXJUaW1lb3V0KHRoaXMudGltZXJJZCk7XHJcblx0XHRcdHRoaXMudGltZXJJZCA9IHNldFRpbWVvdXQoKCkgPT4geyB0aGlzLkhhbmRsZVJlY2VudGx5UmVuYW1lZEZpbGVzKCkgfSwgNTAwKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cclxuXHRhc3luYyBjb2xsZWN0QXR0YWNobWVudHNDdXJyZW50Tm90ZShlZGl0b3I6IEVkaXRvciwgdmlldzogTWFya2Rvd25WaWV3KSB7XHJcblx0XHRsZXQgbm90ZSA9IHZpZXcuZmlsZTtcclxuXHRcdGlmICh0aGlzLmlzUGF0aElnbm9yZWQobm90ZS5wYXRoKSkge1xyXG5cdFx0XHRuZXcgTm90aWNlKFwiTm90ZSBwYXRoIGlzIGlnbm9yZWRcIik7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH1cclxuXHJcblx0XHRsZXQgcmVzdWx0ID0gYXdhaXQgdGhpcy5maC5jb2xsZWN0QXR0YWNobWVudHNGb3JDYWNoZWROb3RlKFxyXG5cdFx0XHRub3RlLnBhdGgsXHJcblx0XHRcdHRoaXMuc2V0dGluZ3MuYXR0YWNobWVudHNTdWJmb2xkZXIsXHJcblx0XHRcdHRoaXMuc2V0dGluZ3MuZGVsZXRlRXhpc3RGaWxlc1doZW5Nb3ZlTm90ZSk7XHJcblxyXG5cdFx0aWYgKHJlc3VsdCAmJiByZXN1bHQubW92ZWRBdHRhY2htZW50cyAmJiByZXN1bHQubW92ZWRBdHRhY2htZW50cy5sZW5ndGggPiAwKSB7XHJcblx0XHRcdGF3YWl0IHRoaXMubGgudXBkYXRlQ2hhbmdlZFBhdGhzSW5Ob3RlKG5vdGUucGF0aCwgcmVzdWx0Lm1vdmVkQXR0YWNobWVudHMpXHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKHJlc3VsdC5tb3ZlZEF0dGFjaG1lbnRzLmxlbmd0aCA9PSAwKVxyXG5cdFx0XHRuZXcgTm90aWNlKFwiTm8gZmlsZXMgZm91bmQgdGhhdCBuZWVkIHRvIGJlIG1vdmVkXCIpO1xyXG5cdFx0ZWxzZVxyXG5cdFx0XHRuZXcgTm90aWNlKFwiTW92ZWQgXCIgKyByZXN1bHQubW92ZWRBdHRhY2htZW50cy5sZW5ndGggKyBcIiBhdHRhY2htZW50XCIgKyAocmVzdWx0Lm1vdmVkQXR0YWNobWVudHMubGVuZ3RoID4gMSA/IFwic1wiIDogXCJcIikpO1xyXG5cdH1cclxuXHJcblxyXG5cdGFzeW5jIGNvbGxlY3RBbGxBdHRhY2htZW50cygpIHtcclxuXHRcdGxldCBtb3ZlZEF0dGFjaG1lbnRzQ291bnQgPSAwO1xyXG5cdFx0bGV0IHByb2Nlc3NlZE5vdGVzQ291bnQgPSAwO1xyXG5cclxuXHRcdGxldCBub3RlcyA9IHRoaXMuYXBwLnZhdWx0LmdldE1hcmtkb3duRmlsZXMoKTtcclxuXHJcblx0XHRpZiAobm90ZXMpIHtcclxuXHRcdFx0Zm9yIChsZXQgbm90ZSBvZiBub3Rlcykge1xyXG5cdFx0XHRcdGlmICh0aGlzLmlzUGF0aElnbm9yZWQobm90ZS5wYXRoKSlcclxuXHRcdFx0XHRcdGNvbnRpbnVlO1xyXG5cclxuXHRcdFx0XHRsZXQgcmVzdWx0ID0gYXdhaXQgdGhpcy5maC5jb2xsZWN0QXR0YWNobWVudHNGb3JDYWNoZWROb3RlKFxyXG5cdFx0XHRcdFx0bm90ZS5wYXRoLFxyXG5cdFx0XHRcdFx0dGhpcy5zZXR0aW5ncy5hdHRhY2htZW50c1N1YmZvbGRlcixcclxuXHRcdFx0XHRcdHRoaXMuc2V0dGluZ3MuZGVsZXRlRXhpc3RGaWxlc1doZW5Nb3ZlTm90ZSk7XHJcblxyXG5cclxuXHRcdFx0XHRpZiAocmVzdWx0ICYmIHJlc3VsdC5tb3ZlZEF0dGFjaG1lbnRzICYmIHJlc3VsdC5tb3ZlZEF0dGFjaG1lbnRzLmxlbmd0aCA+IDApIHtcclxuXHRcdFx0XHRcdGF3YWl0IHRoaXMubGgudXBkYXRlQ2hhbmdlZFBhdGhzSW5Ob3RlKG5vdGUucGF0aCwgcmVzdWx0Lm1vdmVkQXR0YWNobWVudHMpXHJcblx0XHRcdFx0XHRtb3ZlZEF0dGFjaG1lbnRzQ291bnQgKz0gcmVzdWx0Lm1vdmVkQXR0YWNobWVudHMubGVuZ3RoO1xyXG5cdFx0XHRcdFx0cHJvY2Vzc2VkTm90ZXNDb3VudCsrO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdGlmIChtb3ZlZEF0dGFjaG1lbnRzQ291bnQgPT0gMClcclxuXHRcdFx0bmV3IE5vdGljZShcIk5vIGZpbGVzIGZvdW5kIHRoYXQgbmVlZCB0byBiZSBtb3ZlZFwiKTtcclxuXHRcdGVsc2VcclxuXHRcdFx0bmV3IE5vdGljZShcIk1vdmVkIFwiICsgbW92ZWRBdHRhY2htZW50c0NvdW50ICsgXCIgYXR0YWNobWVudFwiICsgKG1vdmVkQXR0YWNobWVudHNDb3VudCA+IDEgPyBcInNcIiA6IFwiXCIpXHJcblx0XHRcdFx0KyBcIiBmcm9tIFwiICsgcHJvY2Vzc2VkTm90ZXNDb3VudCArIFwiIG5vdGVcIiArIChwcm9jZXNzZWROb3Rlc0NvdW50ID4gMSA/IFwic1wiIDogXCJcIikpO1xyXG5cdH1cclxuXHJcblxyXG5cdGFzeW5jIGNvbnZlcnRBbGxFbWJlZHNQYXRoc1RvUmVsYXRpdmUoKSB7XHJcblx0XHRsZXQgY2hhbmdlZEVtYmVkQ291bnQgPSAwO1xyXG5cdFx0bGV0IHByb2Nlc3NlZE5vdGVzQ291bnQgPSAwO1xyXG5cclxuXHRcdGxldCBub3RlcyA9IHRoaXMuYXBwLnZhdWx0LmdldE1hcmtkb3duRmlsZXMoKTtcclxuXHJcblx0XHRpZiAobm90ZXMpIHtcclxuXHRcdFx0Zm9yIChsZXQgbm90ZSBvZiBub3Rlcykge1xyXG5cdFx0XHRcdGlmICh0aGlzLmlzUGF0aElnbm9yZWQobm90ZS5wYXRoKSlcclxuXHRcdFx0XHRcdGNvbnRpbnVlO1xyXG5cclxuXHRcdFx0XHRsZXQgcmVzdWx0ID0gYXdhaXQgdGhpcy5saC5jb252ZXJ0QWxsTm90ZUVtYmVkc1BhdGhzVG9SZWxhdGl2ZShub3RlLnBhdGgpO1xyXG5cclxuXHRcdFx0XHRpZiAocmVzdWx0ICYmIHJlc3VsdC5sZW5ndGggPiAwKSB7XHJcblx0XHRcdFx0XHRjaGFuZ2VkRW1iZWRDb3VudCArPSByZXN1bHQubGVuZ3RoO1xyXG5cdFx0XHRcdFx0cHJvY2Vzc2VkTm90ZXNDb3VudCsrO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdGlmIChjaGFuZ2VkRW1iZWRDb3VudCA9PSAwKVxyXG5cdFx0XHRuZXcgTm90aWNlKFwiTm8gZW1iZWRzIGZvdW5kIHRoYXQgbmVlZCB0byBiZSBjb252ZXJ0ZWRcIik7XHJcblx0XHRlbHNlXHJcblx0XHRcdG5ldyBOb3RpY2UoXCJDb252ZXJ0ZWQgXCIgKyBjaGFuZ2VkRW1iZWRDb3VudCArIFwiIGVtYmVkXCIgKyAoY2hhbmdlZEVtYmVkQ291bnQgPiAxID8gXCJzXCIgOiBcIlwiKVxyXG5cdFx0XHRcdCsgXCIgZnJvbSBcIiArIHByb2Nlc3NlZE5vdGVzQ291bnQgKyBcIiBub3RlXCIgKyAocHJvY2Vzc2VkTm90ZXNDb3VudCA+IDEgPyBcInNcIiA6IFwiXCIpKTtcclxuXHR9XHJcblxyXG5cclxuXHRhc3luYyBjb252ZXJ0QWxsTGlua1BhdGhzVG9SZWxhdGl2ZSgpIHtcclxuXHRcdGxldCBjaGFuZ2VkTGlua3NDb3VudCA9IDA7XHJcblx0XHRsZXQgcHJvY2Vzc2VkTm90ZXNDb3VudCA9IDA7XHJcblxyXG5cdFx0bGV0IG5vdGVzID0gdGhpcy5hcHAudmF1bHQuZ2V0TWFya2Rvd25GaWxlcygpO1xyXG5cclxuXHRcdGlmIChub3Rlcykge1xyXG5cdFx0XHRmb3IgKGxldCBub3RlIG9mIG5vdGVzKSB7XHJcblx0XHRcdFx0aWYgKHRoaXMuaXNQYXRoSWdub3JlZChub3RlLnBhdGgpKVxyXG5cdFx0XHRcdFx0Y29udGludWU7XHJcblxyXG5cdFx0XHRcdGxldCByZXN1bHQgPSBhd2FpdCB0aGlzLmxoLmNvbnZlcnRBbGxOb3RlTGlua3NQYXRoc1RvUmVsYXRpdmUobm90ZS5wYXRoKTtcclxuXHJcblx0XHRcdFx0aWYgKHJlc3VsdCAmJiByZXN1bHQubGVuZ3RoID4gMCkge1xyXG5cdFx0XHRcdFx0Y2hhbmdlZExpbmtzQ291bnQgKz0gcmVzdWx0Lmxlbmd0aDtcclxuXHRcdFx0XHRcdHByb2Nlc3NlZE5vdGVzQ291bnQrKztcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHRpZiAoY2hhbmdlZExpbmtzQ291bnQgPT0gMClcclxuXHRcdFx0bmV3IE5vdGljZShcIk5vIGxpbmtzIGZvdW5kIHRoYXQgbmVlZCB0byBiZSBjb252ZXJ0ZWRcIik7XHJcblx0XHRlbHNlXHJcblx0XHRcdG5ldyBOb3RpY2UoXCJDb252ZXJ0ZWQgXCIgKyBjaGFuZ2VkTGlua3NDb3VudCArIFwiIGxpbmtcIiArIChjaGFuZ2VkTGlua3NDb3VudCA+IDEgPyBcInNcIiA6IFwiXCIpXHJcblx0XHRcdFx0KyBcIiBmcm9tIFwiICsgcHJvY2Vzc2VkTm90ZXNDb3VudCArIFwiIG5vdGVcIiArIChwcm9jZXNzZWROb3Rlc0NvdW50ID4gMSA/IFwic1wiIDogXCJcIikpO1xyXG5cdH1cclxuXHJcblx0YXN5bmMgcmVwbGFjZUFsbFdpa2lsaW5rc1dpdGhNYXJrZG93bkxpbmtzKCkge1xyXG5cdFx0bGV0IGNoYW5nZWRMaW5rc0NvdW50ID0gMDtcclxuXHRcdGxldCBwcm9jZXNzZWROb3Rlc0NvdW50ID0gMDtcclxuXHJcblx0XHRsZXQgbm90ZXMgPSB0aGlzLmFwcC52YXVsdC5nZXRNYXJrZG93bkZpbGVzKCk7XHJcblxyXG5cdFx0aWYgKG5vdGVzKSB7XHJcblx0XHRcdGZvciAobGV0IG5vdGUgb2Ygbm90ZXMpIHtcclxuXHRcdFx0XHRpZiAodGhpcy5pc1BhdGhJZ25vcmVkKG5vdGUucGF0aCkpXHJcblx0XHRcdFx0XHRjb250aW51ZTtcclxuXHJcblx0XHRcdFx0bGV0IHJlc3VsdCA9IGF3YWl0IHRoaXMubGgucmVwbGFjZUFsbE5vdGVXaWtpbGlua3NXaXRoTWFya2Rvd25MaW5rcyhub3RlLnBhdGgpO1xyXG5cclxuXHRcdFx0XHRpZiAocmVzdWx0ICYmIChyZXN1bHQubGlua3MubGVuZ3RoID4gMCB8fCByZXN1bHQuZW1iZWRzLmxlbmd0aCA+IDApKSB7XHJcblx0XHRcdFx0XHRjaGFuZ2VkTGlua3NDb3VudCArPSByZXN1bHQubGlua3MubGVuZ3RoO1xyXG5cdFx0XHRcdFx0Y2hhbmdlZExpbmtzQ291bnQgKz0gcmVzdWx0LmVtYmVkcy5sZW5ndGg7XHJcblx0XHRcdFx0XHRwcm9jZXNzZWROb3Rlc0NvdW50Kys7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKGNoYW5nZWRMaW5rc0NvdW50ID09IDApXHJcblx0XHRcdG5ldyBOb3RpY2UoXCJObyB3aWtpIGxpbmtzIGZvdW5kIHRoYXQgbmVlZCB0byBiZSByZXBsYWNlZFwiKTtcclxuXHRcdGVsc2VcclxuXHRcdFx0bmV3IE5vdGljZShcIlJlcGxhY2VkIFwiICsgY2hhbmdlZExpbmtzQ291bnQgKyBcIiB3aWtpbGlua1wiICsgKGNoYW5nZWRMaW5rc0NvdW50ID4gMSA/IFwic1wiIDogXCJcIilcclxuXHRcdFx0XHQrIFwiIGZyb20gXCIgKyBwcm9jZXNzZWROb3Rlc0NvdW50ICsgXCIgbm90ZVwiICsgKHByb2Nlc3NlZE5vdGVzQ291bnQgPiAxID8gXCJzXCIgOiBcIlwiKSk7XHJcblx0fVxyXG5cclxuXHRkZWxldGVFbXB0eUZvbGRlcnMoKSB7XHJcblx0XHR0aGlzLmZoLmRlbGV0ZUVtcHR5Rm9sZGVycyhcIi9cIilcclxuXHR9XHJcblxyXG5cdGFzeW5jIGNoZWNrQ29uc2lzdGVuY3koKSB7XHJcblx0XHRsZXQgYmFkTGlua3MgPSBhd2FpdCB0aGlzLmxoLmdldEFsbEJhZExpbmtzKCk7XHJcblx0XHRsZXQgYmFkU2VjdGlvbkxpbmtzID0gYXdhaXQgdGhpcy5saC5nZXRBbGxCYWRTZWN0aW9uTGlua3MoKTtcclxuXHRcdGxldCBiYWRFbWJlZHMgPSBhd2FpdCB0aGlzLmxoLmdldEFsbEJhZEVtYmVkcygpO1xyXG5cdFx0bGV0IHdpa2lMaW5rcyA9IGF3YWl0IHRoaXMubGguZ2V0QWxsV2lraUxpbmtzKCk7XHJcblx0XHRsZXQgd2lraUVtYmVkcyA9IGF3YWl0IHRoaXMubGguZ2V0QWxsV2lraUVtYmVkcygpO1xyXG5cclxuXHRcdGxldCB0ZXh0ID0gXCJcIjtcclxuXHJcblx0XHRsZXQgYmFkTGlua3NDb3VudCA9IE9iamVjdC5rZXlzKGJhZExpbmtzKS5sZW5ndGg7XHJcblx0XHRsZXQgYmFkRW1iZWRzQ291bnQgPSBPYmplY3Qua2V5cyhiYWRFbWJlZHMpLmxlbmd0aDtcclxuXHRcdGxldCBiYWRTZWN0aW9uTGlua3NDb3VudCA9IE9iamVjdC5rZXlzKGJhZFNlY3Rpb25MaW5rcykubGVuZ3RoO1xyXG5cdFx0bGV0IHdpa2lMaW5rc0NvdW50ID0gT2JqZWN0LmtleXMod2lraUxpbmtzKS5sZW5ndGg7XHJcblx0XHRsZXQgd2lraUVtYmVkc0NvdW50ID0gT2JqZWN0LmtleXMod2lraUVtYmVkcykubGVuZ3RoO1xyXG5cclxuXHRcdGlmIChiYWRMaW5rc0NvdW50ID4gMCkge1xyXG5cdFx0XHR0ZXh0ICs9IFwiIyBCYWQgbGlua3MgKFwiICsgYmFkTGlua3NDb3VudCArIFwiIGZpbGVzKVxcblwiO1xyXG5cdFx0XHRmb3IgKGxldCBub3RlIGluIGJhZExpbmtzKSB7XHJcblx0XHRcdFx0dGV4dCArPSBcIltcIiArIG5vdGUgKyBcIl0oXCIgKyBVdGlscy5ub3JtYWxpemVQYXRoRm9yTGluayhub3RlKSArIFwiKTogXCIgKyBcIlxcblwiXHJcblx0XHRcdFx0Zm9yIChsZXQgbGluayBvZiBiYWRMaW5rc1tub3RlXSkge1xyXG5cdFx0XHRcdFx0dGV4dCArPSBcIi0gKGxpbmUgXCIgKyAobGluay5wb3NpdGlvbi5zdGFydC5saW5lICsgMSkgKyBcIik6IGBcIiArIGxpbmsubGluayArIFwiYFxcblwiO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHR0ZXh0ICs9IFwiXFxuXFxuXCJcclxuXHRcdFx0fVxyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0dGV4dCArPSBcIiMgQmFkIGxpbmtzIFxcblwiO1xyXG5cdFx0XHR0ZXh0ICs9IFwiTm8gcHJvYmxlbXMgZm91bmRcXG5cXG5cIlxyXG5cdFx0fVxyXG5cclxuXHJcblx0XHRpZiAoYmFkU2VjdGlvbkxpbmtzQ291bnQgPiAwKSB7XHJcblx0XHRcdHRleHQgKz0gXCJcXG5cXG4jIEJhZCBub3RlIGxpbmsgc2VjdGlvbnMgKFwiICsgYmFkU2VjdGlvbkxpbmtzQ291bnQgKyBcIiBmaWxlcylcXG5cIjtcclxuXHRcdFx0Zm9yIChsZXQgbm90ZSBpbiBiYWRTZWN0aW9uTGlua3MpIHtcclxuXHRcdFx0XHR0ZXh0ICs9IFwiW1wiICsgbm90ZSArIFwiXShcIiArIFV0aWxzLm5vcm1hbGl6ZVBhdGhGb3JMaW5rKG5vdGUpICsgXCIpOiBcIiArIFwiXFxuXCJcclxuXHRcdFx0XHRmb3IgKGxldCBsaW5rIG9mIGJhZFNlY3Rpb25MaW5rc1tub3RlXSkge1xyXG5cdFx0XHRcdFx0bGV0IGxpID0gdGhpcy5saC5zcGxpdExpbmtUb1BhdGhBbmRTZWN0aW9uKGxpbmsubGluayk7XHJcblx0XHRcdFx0XHRsZXQgc2VjdGlvbiA9IFV0aWxzLm5vcm1hbGl6ZUxpbmtTZWN0aW9uKGxpLnNlY3Rpb24pO1xyXG5cdFx0XHRcdFx0dGV4dCArPSBcIi0gKGxpbmUgXCIgKyAobGluay5wb3NpdGlvbi5zdGFydC5saW5lICsgMSkgKyBcIik6IGBcIiArIGxpLmxpbmsgKyBcIiNcIiArIHNlY3Rpb24gKyBcImBcXG5cIjtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0dGV4dCArPSBcIlxcblxcblwiXHJcblx0XHRcdH1cclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHRleHQgKz0gXCJcXG5cXG4jIEJhZCBub3RlIGxpbmsgc2VjdGlvbnNcXG5cIlxyXG5cdFx0XHR0ZXh0ICs9IFwiTm8gcHJvYmxlbXMgZm91bmRcXG5cXG5cIlxyXG5cdFx0fVxyXG5cclxuXHJcblx0XHRpZiAoYmFkRW1iZWRzQ291bnQgPiAwKSB7XHJcblx0XHRcdHRleHQgKz0gXCJcXG5cXG4jIEJhZCBlbWJlZHMgKFwiICsgYmFkRW1iZWRzQ291bnQgKyBcIiBmaWxlcylcXG5cIjtcclxuXHRcdFx0Zm9yIChsZXQgbm90ZSBpbiBiYWRFbWJlZHMpIHtcclxuXHRcdFx0XHR0ZXh0ICs9IFwiW1wiICsgbm90ZSArIFwiXShcIiArIFV0aWxzLm5vcm1hbGl6ZVBhdGhGb3JMaW5rKG5vdGUpICsgXCIpOiBcIiArIFwiXFxuXCJcclxuXHRcdFx0XHRmb3IgKGxldCBsaW5rIG9mIGJhZEVtYmVkc1tub3RlXSkge1xyXG5cdFx0XHRcdFx0dGV4dCArPSBcIi0gKGxpbmUgXCIgKyAobGluay5wb3NpdGlvbi5zdGFydC5saW5lICsgMSkgKyBcIik6IGBcIiArIGxpbmsubGluayArIFwiYFxcblwiO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHR0ZXh0ICs9IFwiXFxuXFxuXCJcclxuXHRcdFx0fVxyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0dGV4dCArPSBcIlxcblxcbiMgQmFkIGVtYmVkcyBcXG5cIjtcclxuXHRcdFx0dGV4dCArPSBcIk5vIHByb2JsZW1zIGZvdW5kXFxuXFxuXCJcclxuXHRcdH1cclxuXHJcblxyXG5cdFx0aWYgKHdpa2lMaW5rc0NvdW50ID4gMCkge1xyXG5cdFx0XHR0ZXh0ICs9IFwiIyBXaWtpIGxpbmtzIChcIiArIHdpa2lMaW5rc0NvdW50ICsgXCIgZmlsZXMpXFxuXCI7XHJcblx0XHRcdGZvciAobGV0IG5vdGUgaW4gd2lraUxpbmtzKSB7XHJcblx0XHRcdFx0dGV4dCArPSBcIltcIiArIG5vdGUgKyBcIl0oXCIgKyBVdGlscy5ub3JtYWxpemVQYXRoRm9yTGluayhub3RlKSArIFwiKTogXCIgKyBcIlxcblwiXHJcblx0XHRcdFx0Zm9yIChsZXQgbGluayBvZiB3aWtpTGlua3Nbbm90ZV0pIHtcclxuXHRcdFx0XHRcdHRleHQgKz0gXCItIChsaW5lIFwiICsgKGxpbmsucG9zaXRpb24uc3RhcnQubGluZSArIDEpICsgXCIpOiBgXCIgKyBsaW5rLm9yaWdpbmFsICsgXCJgXFxuXCI7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdHRleHQgKz0gXCJcXG5cXG5cIlxyXG5cdFx0XHR9XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHR0ZXh0ICs9IFwiIyBXaWtpIGxpbmtzIFxcblwiO1xyXG5cdFx0XHR0ZXh0ICs9IFwiTm8gcHJvYmxlbXMgZm91bmRcXG5cXG5cIlxyXG5cdFx0fVxyXG5cclxuXHRcdGlmICh3aWtpRW1iZWRzQ291bnQgPiAwKSB7XHJcblx0XHRcdHRleHQgKz0gXCJcXG5cXG4jIFdpa2kgZW1iZWRzIChcIiArIHdpa2lFbWJlZHNDb3VudCArIFwiIGZpbGVzKVxcblwiO1xyXG5cdFx0XHRmb3IgKGxldCBub3RlIGluIHdpa2lFbWJlZHMpIHtcclxuXHRcdFx0XHR0ZXh0ICs9IFwiW1wiICsgbm90ZSArIFwiXShcIiArIFV0aWxzLm5vcm1hbGl6ZVBhdGhGb3JMaW5rKG5vdGUpICsgXCIpOiBcIiArIFwiXFxuXCJcclxuXHRcdFx0XHRmb3IgKGxldCBsaW5rIG9mIHdpa2lFbWJlZHNbbm90ZV0pIHtcclxuXHRcdFx0XHRcdHRleHQgKz0gXCItIChsaW5lIFwiICsgKGxpbmsucG9zaXRpb24uc3RhcnQubGluZSArIDEpICsgXCIpOiBgXCIgKyBsaW5rLm9yaWdpbmFsICsgXCJgXFxuXCI7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdHRleHQgKz0gXCJcXG5cXG5cIlxyXG5cdFx0XHR9XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHR0ZXh0ICs9IFwiXFxuXFxuIyBXaWtpIGVtYmVkcyBcXG5cIjtcclxuXHRcdFx0dGV4dCArPSBcIk5vIHByb2JsZW1zIGZvdW5kXFxuXFxuXCJcclxuXHRcdH1cclxuXHJcblxyXG5cclxuXHRcdGxldCBub3RlUGF0aCA9IHRoaXMuc2V0dGluZ3MuY29uc2lzdGVuY3lSZXBvcnRGaWxlO1xyXG5cdFx0YXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci53cml0ZShub3RlUGF0aCwgdGV4dCk7XHJcblxyXG5cdFx0bGV0IGZpbGVPcGVuZWQgPSBmYWxzZTtcclxuXHRcdHRoaXMuYXBwLndvcmtzcGFjZS5pdGVyYXRlQWxsTGVhdmVzKGxlYWYgPT4ge1xyXG5cdFx0XHRpZiAobGVhZi5nZXREaXNwbGF5VGV4dCgpICE9IFwiXCIgJiYgbm90ZVBhdGguc3RhcnRzV2l0aChsZWFmLmdldERpc3BsYXlUZXh0KCkpKSB7XHJcblx0XHRcdFx0ZmlsZU9wZW5lZCA9IHRydWU7XHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cclxuXHRcdGlmICghZmlsZU9wZW5lZClcclxuXHRcdFx0dGhpcy5hcHAud29ya3NwYWNlLm9wZW5MaW5rVGV4dChub3RlUGF0aCwgXCIvXCIsIGZhbHNlKTtcclxuXHR9XHJcblxyXG5cdGFzeW5jIHJlb3JnYW5pemVWYXVsdCgpIHtcclxuXHRcdGF3YWl0IHRoaXMucmVwbGFjZUFsbFdpa2lsaW5rc1dpdGhNYXJrZG93bkxpbmtzKClcclxuXHRcdGF3YWl0IHRoaXMuY29udmVydEFsbEVtYmVkc1BhdGhzVG9SZWxhdGl2ZSgpXHJcblx0XHRhd2FpdCB0aGlzLmNvbnZlcnRBbGxMaW5rUGF0aHNUb1JlbGF0aXZlKClcclxuXHRcdC8vLSBSZW5hbWUgYWxsIGF0dGFjaG1lbnRzICh1c2luZyBVbmlxdWUgYXR0YWNobWVudHMsIG9wdGlvbmFsKVxyXG5cdFx0YXdhaXQgdGhpcy5jb2xsZWN0QWxsQXR0YWNobWVudHMoKVxyXG5cdFx0YXdhaXQgdGhpcy5kZWxldGVFbXB0eUZvbGRlcnMoKVxyXG5cdFx0bmV3IE5vdGljZShcIlJlb3JnYW5pemF0aW9uIG9mIHRoZSB2YXVsdCBjb21wbGV0ZWRcIik7XHJcblx0fVxyXG5cclxuXHJcblx0YXN5bmMgbG9hZFNldHRpbmdzKCkge1xyXG5cdFx0dGhpcy5zZXR0aW5ncyA9IE9iamVjdC5hc3NpZ24oe30sIERFRkFVTFRfU0VUVElOR1MsIGF3YWl0IHRoaXMubG9hZERhdGEoKSk7XHJcblx0fVxyXG5cclxuXHRhc3luYyBzYXZlU2V0dGluZ3MoKSB7XHJcblx0XHRhd2FpdCB0aGlzLnNhdmVEYXRhKHRoaXMuc2V0dGluZ3MpO1xyXG5cclxuXHRcdHRoaXMubGggPSBuZXcgTGlua3NIYW5kbGVyKFxyXG5cdFx0XHR0aGlzLmFwcCxcclxuXHRcdFx0XCJDb25zaXN0ZW50IEF0dGFjaG1lbnRzIGFuZCBMaW5rczogXCIsXHJcblx0XHRcdHRoaXMuc2V0dGluZ3MuaWdub3JlRm9sZGVycyxcclxuXHRcdFx0dGhpcy5zZXR0aW5ncy5pZ25vcmVGaWxlc1JlZ2V4XHJcblx0XHQpO1xyXG5cclxuXHRcdHRoaXMuZmggPSBuZXcgRmlsZXNIYW5kbGVyKFxyXG5cdFx0XHR0aGlzLmFwcCxcclxuXHRcdFx0dGhpcy5saCxcclxuXHRcdFx0XCJDb25zaXN0ZW50IEF0dGFjaG1lbnRzIGFuZCBMaW5rczogXCIsXHJcblx0XHRcdHRoaXMuc2V0dGluZ3MuaWdub3JlRm9sZGVycyxcclxuXHRcdFx0dGhpcy5zZXR0aW5ncy5pZ25vcmVGaWxlc1JlZ2V4LFxyXG5cdFx0KTtcclxuXHR9XHJcblxyXG5cclxufVxyXG5cclxuXHJcblxyXG5cclxuIl0sIm5hbWVzIjpbIlBsdWdpblNldHRpbmdUYWIiLCJTZXR0aW5nIiwibm9ybWFsaXplUGF0aCIsIlRGaWxlIiwiUGx1Z2luIiwiTm90aWNlIl0sIm1hcHBp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
