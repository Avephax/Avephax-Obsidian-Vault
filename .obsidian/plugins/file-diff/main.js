/*
THIS IS A GENERATED/BUNDLED FILE BY ESBUILD
if you want to view the source, please visit the github repository of this plugin
*/

var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/main.ts
var main_exports = {};
__export(main_exports, {
  default: () => FileDiffPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian5 = require("obsidian");

// node_modules/diff/lib/index.mjs
function Diff() {
}
Diff.prototype = {
  diff: function diff(oldString, newString) {
    var options = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
    var callback = options.callback;
    if (typeof options === "function") {
      callback = options;
      options = {};
    }
    this.options = options;
    var self = this;
    function done(value) {
      if (callback) {
        setTimeout(function() {
          callback(void 0, value);
        }, 0);
        return true;
      } else {
        return value;
      }
    }
    oldString = this.castInput(oldString);
    newString = this.castInput(newString);
    oldString = this.removeEmpty(this.tokenize(oldString));
    newString = this.removeEmpty(this.tokenize(newString));
    var newLen = newString.length, oldLen = oldString.length;
    var editLength = 1;
    var maxEditLength = newLen + oldLen;
    if (options.maxEditLength) {
      maxEditLength = Math.min(maxEditLength, options.maxEditLength);
    }
    var bestPath = [{
      newPos: -1,
      components: []
    }];
    var oldPos = this.extractCommon(bestPath[0], newString, oldString, 0);
    if (bestPath[0].newPos + 1 >= newLen && oldPos + 1 >= oldLen) {
      return done([{
        value: this.join(newString),
        count: newString.length
      }]);
    }
    function execEditLength() {
      for (var diagonalPath = -1 * editLength; diagonalPath <= editLength; diagonalPath += 2) {
        var basePath = void 0;
        var addPath = bestPath[diagonalPath - 1], removePath = bestPath[diagonalPath + 1], _oldPos = (removePath ? removePath.newPos : 0) - diagonalPath;
        if (addPath) {
          bestPath[diagonalPath - 1] = void 0;
        }
        var canAdd = addPath && addPath.newPos + 1 < newLen, canRemove = removePath && 0 <= _oldPos && _oldPos < oldLen;
        if (!canAdd && !canRemove) {
          bestPath[diagonalPath] = void 0;
          continue;
        }
        if (!canAdd || canRemove && addPath.newPos < removePath.newPos) {
          basePath = clonePath(removePath);
          self.pushComponent(basePath.components, void 0, true);
        } else {
          basePath = addPath;
          basePath.newPos++;
          self.pushComponent(basePath.components, true, void 0);
        }
        _oldPos = self.extractCommon(basePath, newString, oldString, diagonalPath);
        if (basePath.newPos + 1 >= newLen && _oldPos + 1 >= oldLen) {
          return done(buildValues(self, basePath.components, newString, oldString, self.useLongestToken));
        } else {
          bestPath[diagonalPath] = basePath;
        }
      }
      editLength++;
    }
    if (callback) {
      (function exec() {
        setTimeout(function() {
          if (editLength > maxEditLength) {
            return callback();
          }
          if (!execEditLength()) {
            exec();
          }
        }, 0);
      })();
    } else {
      while (editLength <= maxEditLength) {
        var ret = execEditLength();
        if (ret) {
          return ret;
        }
      }
    }
  },
  pushComponent: function pushComponent(components, added, removed) {
    var last = components[components.length - 1];
    if (last && last.added === added && last.removed === removed) {
      components[components.length - 1] = {
        count: last.count + 1,
        added,
        removed
      };
    } else {
      components.push({
        count: 1,
        added,
        removed
      });
    }
  },
  extractCommon: function extractCommon(basePath, newString, oldString, diagonalPath) {
    var newLen = newString.length, oldLen = oldString.length, newPos = basePath.newPos, oldPos = newPos - diagonalPath, commonCount = 0;
    while (newPos + 1 < newLen && oldPos + 1 < oldLen && this.equals(newString[newPos + 1], oldString[oldPos + 1])) {
      newPos++;
      oldPos++;
      commonCount++;
    }
    if (commonCount) {
      basePath.components.push({
        count: commonCount
      });
    }
    basePath.newPos = newPos;
    return oldPos;
  },
  equals: function equals(left, right) {
    if (this.options.comparator) {
      return this.options.comparator(left, right);
    } else {
      return left === right || this.options.ignoreCase && left.toLowerCase() === right.toLowerCase();
    }
  },
  removeEmpty: function removeEmpty(array) {
    var ret = [];
    for (var i = 0; i < array.length; i++) {
      if (array[i]) {
        ret.push(array[i]);
      }
    }
    return ret;
  },
  castInput: function castInput(value) {
    return value;
  },
  tokenize: function tokenize(value) {
    return value.split("");
  },
  join: function join(chars) {
    return chars.join("");
  }
};
function buildValues(diff2, components, newString, oldString, useLongestToken) {
  var componentPos = 0, componentLen = components.length, newPos = 0, oldPos = 0;
  for (; componentPos < componentLen; componentPos++) {
    var component = components[componentPos];
    if (!component.removed) {
      if (!component.added && useLongestToken) {
        var value = newString.slice(newPos, newPos + component.count);
        value = value.map(function(value2, i) {
          var oldValue = oldString[oldPos + i];
          return oldValue.length > value2.length ? oldValue : value2;
        });
        component.value = diff2.join(value);
      } else {
        component.value = diff2.join(newString.slice(newPos, newPos + component.count));
      }
      newPos += component.count;
      if (!component.added) {
        oldPos += component.count;
      }
    } else {
      component.value = diff2.join(oldString.slice(oldPos, oldPos + component.count));
      oldPos += component.count;
      if (componentPos && components[componentPos - 1].added) {
        var tmp = components[componentPos - 1];
        components[componentPos - 1] = components[componentPos];
        components[componentPos] = tmp;
      }
    }
  }
  var lastComponent = components[componentLen - 1];
  if (componentLen > 1 && typeof lastComponent.value === "string" && (lastComponent.added || lastComponent.removed) && diff2.equals("", lastComponent.value)) {
    components[componentLen - 2].value += lastComponent.value;
    components.pop();
  }
  return components;
}
function clonePath(path) {
  return {
    newPos: path.newPos,
    components: path.components.slice(0)
  };
}
var characterDiff = new Diff();
var extendedWordChars = /^[A-Za-z\xC0-\u02C6\u02C8-\u02D7\u02DE-\u02FF\u1E00-\u1EFF]+$/;
var reWhitespace = /\S/;
var wordDiff = new Diff();
wordDiff.equals = function(left, right) {
  if (this.options.ignoreCase) {
    left = left.toLowerCase();
    right = right.toLowerCase();
  }
  return left === right || this.options.ignoreWhitespace && !reWhitespace.test(left) && !reWhitespace.test(right);
};
wordDiff.tokenize = function(value) {
  var tokens = value.split(/([^\S\r\n]+|[()[\]{}'"\r\n]|\b)/);
  for (var i = 0; i < tokens.length - 1; i++) {
    if (!tokens[i + 1] && tokens[i + 2] && extendedWordChars.test(tokens[i]) && extendedWordChars.test(tokens[i + 2])) {
      tokens[i] += tokens[i + 2];
      tokens.splice(i + 1, 2);
      i--;
    }
  }
  return tokens;
};
var lineDiff = new Diff();
lineDiff.tokenize = function(value) {
  var retLines = [], linesAndNewlines = value.split(/(\n|\r\n)/);
  if (!linesAndNewlines[linesAndNewlines.length - 1]) {
    linesAndNewlines.pop();
  }
  for (var i = 0; i < linesAndNewlines.length; i++) {
    var line = linesAndNewlines[i];
    if (i % 2 && !this.options.newlineIsToken) {
      retLines[retLines.length - 1] += line;
    } else {
      if (this.options.ignoreWhitespace) {
        line = line.trim();
      }
      retLines.push(line);
    }
  }
  return retLines;
};
function diffLines(oldStr, newStr, callback) {
  return lineDiff.diff(oldStr, newStr, callback);
}
var sentenceDiff = new Diff();
sentenceDiff.tokenize = function(value) {
  return value.split(/(\S.+?[.!?])(?=\s+|$)/);
};
var cssDiff = new Diff();
cssDiff.tokenize = function(value) {
  return value.split(/([{}:;,]|\s+)/);
};
function _typeof(obj) {
  "@babel/helpers - typeof";
  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    _typeof = function(obj2) {
      return typeof obj2;
    };
  } else {
    _typeof = function(obj2) {
      return obj2 && typeof Symbol === "function" && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
    };
  }
  return _typeof(obj);
}
function _toConsumableArray(arr) {
  return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
}
function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr))
    return _arrayLikeToArray(arr);
}
function _iterableToArray(iter) {
  if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter))
    return Array.from(iter);
}
function _unsupportedIterableToArray(o, minLen) {
  if (!o)
    return;
  if (typeof o === "string")
    return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor)
    n = o.constructor.name;
  if (n === "Map" || n === "Set")
    return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))
    return _arrayLikeToArray(o, minLen);
}
function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length)
    len = arr.length;
  for (var i = 0, arr2 = new Array(len); i < len; i++)
    arr2[i] = arr[i];
  return arr2;
}
function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
var objectPrototypeToString = Object.prototype.toString;
var jsonDiff = new Diff();
jsonDiff.useLongestToken = true;
jsonDiff.tokenize = lineDiff.tokenize;
jsonDiff.castInput = function(value) {
  var _this$options = this.options, undefinedReplacement = _this$options.undefinedReplacement, _this$options$stringi = _this$options.stringifyReplacer, stringifyReplacer = _this$options$stringi === void 0 ? function(k, v) {
    return typeof v === "undefined" ? undefinedReplacement : v;
  } : _this$options$stringi;
  return typeof value === "string" ? value : JSON.stringify(canonicalize(value, null, null, stringifyReplacer), stringifyReplacer, "  ");
};
jsonDiff.equals = function(left, right) {
  return Diff.prototype.equals.call(jsonDiff, left.replace(/,([\r\n])/g, "$1"), right.replace(/,([\r\n])/g, "$1"));
};
function canonicalize(obj, stack, replacementStack, replacer, key) {
  stack = stack || [];
  replacementStack = replacementStack || [];
  if (replacer) {
    obj = replacer(key, obj);
  }
  var i;
  for (i = 0; i < stack.length; i += 1) {
    if (stack[i] === obj) {
      return replacementStack[i];
    }
  }
  var canonicalizedObj;
  if ("[object Array]" === objectPrototypeToString.call(obj)) {
    stack.push(obj);
    canonicalizedObj = new Array(obj.length);
    replacementStack.push(canonicalizedObj);
    for (i = 0; i < obj.length; i += 1) {
      canonicalizedObj[i] = canonicalize(obj[i], stack, replacementStack, replacer, key);
    }
    stack.pop();
    replacementStack.pop();
    return canonicalizedObj;
  }
  if (obj && obj.toJSON) {
    obj = obj.toJSON();
  }
  if (_typeof(obj) === "object" && obj !== null) {
    stack.push(obj);
    canonicalizedObj = {};
    replacementStack.push(canonicalizedObj);
    var sortedKeys = [], _key;
    for (_key in obj) {
      if (obj.hasOwnProperty(_key)) {
        sortedKeys.push(_key);
      }
    }
    sortedKeys.sort();
    for (i = 0; i < sortedKeys.length; i += 1) {
      _key = sortedKeys[i];
      canonicalizedObj[_key] = canonicalize(obj[_key], stack, replacementStack, replacer, _key);
    }
    stack.pop();
    replacementStack.pop();
  } else {
    canonicalizedObj = obj;
  }
  return canonicalizedObj;
}
var arrayDiff = new Diff();
arrayDiff.tokenize = function(value) {
  return value.slice();
};
arrayDiff.join = arrayDiff.removeEmpty = function(value) {
  return value;
};
function structuredPatch(oldFileName, newFileName, oldStr, newStr, oldHeader, newHeader, options) {
  if (!options) {
    options = {};
  }
  if (typeof options.context === "undefined") {
    options.context = 4;
  }
  var diff2 = diffLines(oldStr, newStr, options);
  if (!diff2) {
    return;
  }
  diff2.push({
    value: "",
    lines: []
  });
  function contextLines(lines) {
    return lines.map(function(entry) {
      return " " + entry;
    });
  }
  var hunks = [];
  var oldRangeStart = 0, newRangeStart = 0, curRange = [], oldLine = 1, newLine = 1;
  var _loop = function _loop2(i2) {
    var current = diff2[i2], lines = current.lines || current.value.replace(/\n$/, "").split("\n");
    current.lines = lines;
    if (current.added || current.removed) {
      var _curRange;
      if (!oldRangeStart) {
        var prev = diff2[i2 - 1];
        oldRangeStart = oldLine;
        newRangeStart = newLine;
        if (prev) {
          curRange = options.context > 0 ? contextLines(prev.lines.slice(-options.context)) : [];
          oldRangeStart -= curRange.length;
          newRangeStart -= curRange.length;
        }
      }
      (_curRange = curRange).push.apply(_curRange, _toConsumableArray(lines.map(function(entry) {
        return (current.added ? "+" : "-") + entry;
      })));
      if (current.added) {
        newLine += lines.length;
      } else {
        oldLine += lines.length;
      }
    } else {
      if (oldRangeStart) {
        if (lines.length <= options.context * 2 && i2 < diff2.length - 2) {
          var _curRange2;
          (_curRange2 = curRange).push.apply(_curRange2, _toConsumableArray(contextLines(lines)));
        } else {
          var _curRange3;
          var contextSize = Math.min(lines.length, options.context);
          (_curRange3 = curRange).push.apply(_curRange3, _toConsumableArray(contextLines(lines.slice(0, contextSize))));
          var hunk = {
            oldStart: oldRangeStart,
            oldLines: oldLine - oldRangeStart + contextSize,
            newStart: newRangeStart,
            newLines: newLine - newRangeStart + contextSize,
            lines: curRange
          };
          if (i2 >= diff2.length - 2 && lines.length <= options.context) {
            var oldEOFNewline = /\n$/.test(oldStr);
            var newEOFNewline = /\n$/.test(newStr);
            var noNlBeforeAdds = lines.length == 0 && curRange.length > hunk.oldLines;
            if (!oldEOFNewline && noNlBeforeAdds && oldStr.length > 0) {
              curRange.splice(hunk.oldLines, 0, "\\ No newline at end of file");
            }
            if (!oldEOFNewline && !noNlBeforeAdds || !newEOFNewline) {
              curRange.push("\\ No newline at end of file");
            }
          }
          hunks.push(hunk);
          oldRangeStart = 0;
          newRangeStart = 0;
          curRange = [];
        }
      }
      oldLine += lines.length;
      newLine += lines.length;
    }
  };
  for (var i = 0; i < diff2.length; i++) {
    _loop(i);
  }
  return {
    oldFileName,
    newFileName,
    oldHeader,
    newHeader,
    hunks
  };
}

// src/components/differences_view.ts
var import_obsidian2 = require("obsidian");

// src/data/difference.ts
var Difference = class {
  constructor(args) {
    this.file1Start = args.file1Start;
    this.file2Start = args.file2Start;
    this.file1Lines = args.file1Lines;
    this.file2Lines = args.file2Lines;
  }
};

// src/data/file_differences.ts
var FileDifferences = class {
  constructor(args) {
    this.file1Name = args.file1Name;
    this.file2Name = args.file2Name;
    this.differences = args.differences;
  }
  /**
   * Returns a FileDifferences object from the given ParsedDiff instance.
   *
   * Why create a new data structure if parsedDiff already exists?
   *
   * The FileDifferences class was created because there was a limitation in
   * the existing ParsedDiff class from the diff library for my use case. The
   * hunk object in the ParsedDiff class can contain multiple separated line
   * differences, which is problematic because I wanted to display a separate
   * action line for each contiguous change and thus allow for more precise
   * selection of changes. Additionally, the user needs to be able to apply
   * the changes one by one and so I have to keep a state where only one
   * contiguous change but is applied. To solve this, I considered two
   * options: removing the contiguous change directly in the hunk object or
   * introducing a new data structure with a finer granularity. I ultimately
   * chose the latter option as it seemed simpler.
   */
  static fromParsedDiff(parsedDiff) {
    const differences = [];
    parsedDiff.hunks.forEach((hunk) => {
      let line1Count = 0;
      let line2Count = 0;
      for (let i = 0; i < hunk.lines.length; i += 1) {
        const line = hunk.lines[i];
        if (line.startsWith("+") || line.startsWith("-")) {
          const start = i;
          let end = start;
          while (end < hunk.lines.length - 1 && (hunk.lines[end + 1].startsWith("+") || hunk.lines[end + 1].startsWith("-"))) {
            end += 1;
          }
          const file1Lines = hunk.lines.slice(start, end + 1).filter((l) => l.startsWith("-")).map((l) => l.slice(1));
          const file2Lines = hunk.lines.slice(start, end + 1).filter((l) => l.startsWith("+")).map((l) => l.slice(1));
          differences.push(
            new Difference({
              file1Start: hunk.oldStart + start - line2Count - 1,
              file2Start: hunk.newStart + start - line1Count - 1,
              file1Lines,
              file2Lines
            })
          );
          line1Count += file1Lines.length;
          line2Count += file2Lines.length;
          i += end - start;
        }
      }
    });
    return new this({
      file1Name: parsedDiff.oldFileName,
      file2Name: parsedDiff.newFileName,
      differences
    });
  }
};

// src/utils/string_utils.ts
function insertLine(args) {
  const lines = args.fullText.split("\n");
  lines.splice(args.position, 0, args.newLine);
  return lines.join("\n");
}
function replaceLine(args) {
  const lines = args.fullText.split("\n");
  if (args.newLine === "") {
    lines.splice(args.position, args.linesToReplace);
  } else {
    lines.splice(args.position, args.linesToReplace, args.newLine);
  }
  return lines.join("\n");
}
function deleteLines(args) {
  const lines = args.fullText.split("\n");
  lines.splice(args.position, args.count);
  return lines.join("\n");
}
function preventEmptyString(text) {
  return text !== "" ? text : "\u200E";
}

// src/components/action_line_button.ts
var ActionLineButton = class {
  constructor(args) {
    this.text = args.text;
    this.onClick = args.onClick;
  }
  build(actionLine) {
    actionLine.createEl("a", {
      text: this.text,
      cls: "no-decoration text-xxs file-diff__action-line"
    }).onClickEvent(this.onClick);
  }
};

// src/components/action_line_divider.ts
var ActionLineDivider = class {
  static build(actionLine) {
    actionLine.createEl("span", {
      text: "|",
      cls: "text-xxs file-diff__action-line"
    });
  }
};

// src/components/action_line.ts
var ActionLine = class {
  constructor(args) {
    this.difference = args.difference;
    this.file1 = args.file1;
    this.file2 = args.file2;
    this.file1Content = args.file1Content;
    this.file2Content = args.file2Content;
    this.triggerRebuild = args.triggerRebuild;
  }
  build(container) {
    const actionLine = container.createDiv({
      cls: "flex flex-row gap-1 py-0-5"
    });
    const hasMinusLines = this.difference.file1Lines.length > 0;
    const hasPlusLines = this.difference.file2Lines.length > 0;
    if (hasPlusLines && hasMinusLines) {
      new ActionLineButton({
        text: "Accept Top",
        onClick: (e) => this.acceptTopClick(e, this.difference)
      }).build(actionLine);
      ActionLineDivider.build(actionLine);
      new ActionLineButton({
        text: "Accept Bottom",
        onClick: (e) => this.acceptBottomClick(e, this.difference)
      }).build(actionLine);
      ActionLineDivider.build(actionLine);
      new ActionLineButton({
        text: "Accept All",
        onClick: (e) => this.acceptAllClick(e, this.difference)
      }).build(actionLine);
      ActionLineDivider.build(actionLine);
      new ActionLineButton({
        text: "Accept None",
        onClick: (e) => this.acceptNoneClick(e, this.difference)
      }).build(actionLine);
    } else if (hasMinusLines) {
      new ActionLineButton({
        text: `Accept from ${this.file1.name}`,
        onClick: (e) => this.insertFile1Difference(e, this.difference)
      }).build(actionLine);
      ActionLineDivider.build(actionLine);
      new ActionLineButton({
        text: "Discard",
        onClick: (e) => this.discardFile1Difference(e, this.difference)
      }).build(actionLine);
    } else if (hasPlusLines) {
      new ActionLineButton({
        text: `Accept from ${this.file2.name}`,
        onClick: (e) => this.insertFile2Difference(e, this.difference)
      }).build(actionLine);
      ActionLineDivider.build(actionLine);
      new ActionLineButton({
        text: "Discard",
        onClick: (e) => this.discardFile2Difference(e, this.difference)
      }).build(actionLine);
    }
  }
  async acceptTopClick(event, difference) {
    event.preventDefault();
    const changedLines = difference.file1Lines.join("\n");
    const newContent = replaceLine({
      fullText: this.file2Content,
      newLine: changedLines,
      position: difference.file2Start,
      linesToReplace: difference.file2Lines.length
    });
    await app.vault.modify(this.file2, newContent);
    this.triggerRebuild();
  }
  async acceptBottomClick(event, difference) {
    event.preventDefault();
    const changedLines = difference.file2Lines.join("\n");
    const newContent = replaceLine({
      fullText: this.file1Content,
      newLine: changedLines,
      position: difference.file1Start,
      linesToReplace: difference.file1Lines.length
    });
    await app.vault.modify(this.file1, newContent);
    this.triggerRebuild();
  }
  async acceptAllClick(event, difference) {
    event.preventDefault();
    const changedLines = [
      ...difference.file1Lines,
      ...difference.file2Lines
    ].join("\n");
    const newFile1Content = replaceLine({
      fullText: this.file1Content,
      newLine: changedLines,
      position: difference.file1Start,
      linesToReplace: difference.file1Lines.length
    });
    await app.vault.modify(this.file1, newFile1Content);
    const newFile2Content = replaceLine({
      fullText: this.file2Content,
      newLine: changedLines,
      position: difference.file2Start,
      linesToReplace: difference.file2Lines.length
    });
    await app.vault.modify(this.file2, newFile2Content);
    this.triggerRebuild();
  }
  async acceptNoneClick(event, difference) {
    event.preventDefault();
    const newFile1Content = deleteLines({
      fullText: this.file1Content,
      position: difference.file1Start,
      count: difference.file1Lines.length
    });
    await app.vault.modify(this.file1, newFile1Content);
    const newFile2Content = deleteLines({
      fullText: this.file2Content,
      position: difference.file2Start,
      count: difference.file2Lines.length
    });
    await app.vault.modify(this.file2, newFile2Content);
    this.triggerRebuild();
  }
  async insertFile1Difference(event, difference) {
    event.preventDefault();
    const changedLines = difference.file1Lines.join("\n");
    const newContent = insertLine({
      fullText: this.file2Content,
      newLine: changedLines,
      position: difference.file2Start
    });
    await app.vault.modify(this.file2, newContent);
    this.triggerRebuild();
  }
  async insertFile2Difference(event, difference) {
    event.preventDefault();
    const changedLines = difference.file2Lines.join("\n");
    const newContent = insertLine({
      fullText: this.file1Content,
      newLine: changedLines,
      position: difference.file1Start
    });
    await app.vault.modify(this.file1, newContent);
    this.triggerRebuild();
  }
  async discardFile1Difference(event, difference) {
    event.preventDefault();
    const newContent = deleteLines({
      fullText: this.file1Content,
      position: difference.file1Start,
      count: difference.file1Lines.length
    });
    await app.vault.modify(this.file1, newContent);
    this.triggerRebuild();
  }
  async discardFile2Difference(event, difference) {
    event.preventDefault();
    const newContent = deleteLines({
      fullText: this.file2Content,
      position: difference.file2Start,
      count: difference.file2Lines.length
    });
    await app.vault.modify(this.file2, newContent);
    this.triggerRebuild();
  }
};

// src/components/modals/delete_file_modal.ts
var import_obsidian = require("obsidian");
var DeleteFileModal = class extends import_obsidian.Modal {
  constructor(args) {
    super(app);
    this.file1 = args.file1;
    this.file2 = args.file2;
    this.onDone = args.onDone;
  }
  onOpen() {
    this.modalEl.addClass("mb-20");
    this.contentEl.createEl("h3", {
      text: `Delete "${this.file2.name}"?`
    });
    this.contentEl.createEl("p", {
      text: `The contents of "${this.file1.name}" and "${this.file2.name}" are identical. Would you like to delete the duplicate file? Please note that this action is irreversible.`
    });
    const buttonContainer = this.contentEl.createDiv(
      "file-diff__button-container"
    );
    const deleteButton = buttonContainer.createEl("button", {
      text: "Delete",
      cls: "mod-warning mr-2"
    });
    const cancelButton = buttonContainer.createEl("button", {
      text: "Cancel"
    });
    deleteButton.addEventListener("click", () => this.handleDeleteClick());
    cancelButton.addEventListener("click", () => this.close());
  }
  handleDeleteClick() {
    this.app.vault.delete(this.file2);
    this.close();
    const leaf = this.app.workspace.getLeaf();
    if (leaf != null) {
      leaf.openFile(this.file1);
    }
    this.onDone(null);
  }
};

// src/components/differences_view.ts
var VIEW_TYPE_DIFFERENCES = "differences-view";
var DifferencesView = class extends import_obsidian2.ItemView {
  constructor(leaf) {
    super(leaf);
    this.wasDeleteModalShown = false;
    this.registerEvent(
      this.app.vault.on("modify", async (file) => {
        if (file !== this.state.file1 && file !== this.state.file2) {
          return;
        }
        await this.updateState();
        this.build();
      })
    );
  }
  getViewType() {
    return VIEW_TYPE_DIFFERENCES;
  }
  getDisplayText() {
    var _a, _b;
    if (((_a = this.state) == null ? void 0 : _a.file1) && ((_b = this.state) == null ? void 0 : _b.file2)) {
      return `File Diff: ${this.state.file1.name} and ${this.state.file2.name}`;
    }
    return `File Diff`;
  }
  async setState(state, result) {
    super.setState(state, result);
    this.state = state;
    await this.updateState();
    this.build();
  }
  async onunload() {
    var _a, _b;
    (_b = (_a = this.state).continueCallback) == null ? void 0 : _b.call(_a, false);
  }
  async updateState() {
    if (this.state.file1 == null || this.state.file2 == null) {
      return;
    }
    this.file1Content = await this.app.vault.cachedRead(this.state.file1);
    this.file2Content = await this.app.vault.cachedRead(this.state.file2);
    this.file1Lines = this.file1Content.concat("\n").split("\n").map((line) => line.trimEnd());
    this.file2Lines = this.file2Content.concat("\n").split("\n").map((line) => line.trimEnd());
    const parsedDiff = structuredPatch(
      this.state.file1.path,
      this.state.file2.path,
      this.file1Lines.join("\n"),
      this.file2Lines.join("\n")
    );
    this.fileDifferences = FileDifferences.fromParsedDiff(parsedDiff);
    this.lineCount = Math.max(
      this.file1Lines.length - // Count each difference as one line
      this.fileDifferences.differences.filter(
        (d) => d.file1Lines.length > 0
      ).length,
      this.file2Lines.length - // Count each difference as one line
      this.fileDifferences.differences.filter(
        (d) => d.file2Lines.length > 0
      ).length
    );
  }
  build() {
    this.contentEl.empty();
    const container = this.contentEl.createDiv({
      cls: "file-diff__container"
    });
    this.buildLines(container);
    this.scrollToFirstDifference();
    if (this.fileDifferences.differences.length === 0 && this.state.showMergeOption && !this.wasDeleteModalShown) {
      this.wasDeleteModalShown = true;
      this.showDeleteModal();
    }
  }
  buildLines(container) {
    let lineCount1 = 0;
    let lineCount2 = 0;
    while (lineCount1 <= this.lineCount || lineCount2 <= this.lineCount) {
      const difference = this.fileDifferences.differences.find(
        // eslint-disable-next-line no-loop-func
        (d) => d.file1Start === lineCount1 && d.file2Start === lineCount2
      );
      if (difference != null) {
        const differenceContainer = container.createDiv({
          cls: "difference"
        });
        this.buildDifferenceVisualizer(differenceContainer, difference);
        lineCount1 += difference.file1Lines.length;
        lineCount2 += difference.file2Lines.length;
      } else {
        const line = lineCount1 <= lineCount2 ? this.file1Lines[lineCount1] : this.file2Lines[lineCount2];
        container.createDiv({
          // Necessary to give the line a height when it's empty.
          text: preventEmptyString(line),
          cls: "file-diff__line"
        });
        lineCount1 += 1;
        lineCount2 += 1;
      }
    }
  }
  buildDifferenceVisualizer(container, difference) {
    const triggerRebuild = async () => {
      await this.updateState();
      this.build();
    };
    if (this.state.showMergeOption) {
      new ActionLine({
        difference,
        file1: this.state.file1,
        file2: this.state.file2,
        file1Content: this.file1Content,
        file2Content: this.file2Content,
        triggerRebuild
      }).build(container);
    }
    for (let i = 0; i < difference.file1Lines.length; i += 1) {
      const line = difference.file1Lines[i];
      container.createDiv({
        // Necessary to give the line a height when it's empty.
        text: preventEmptyString(line),
        cls: "file-diff__line file-diff__top-line__bg"
      });
    }
    for (let i = 0; i < difference.file2Lines.length; i += 1) {
      const line = difference.file2Lines[i];
      container.createDiv({
        // Necessary to give the line a height when it's empty.
        text: preventEmptyString(line),
        cls: "file-diff__line file-diff__bottom-line__bg"
        // cls: 'file-diff__line ',
      });
    }
  }
  scrollToFirstDifference() {
    if (this.fileDifferences.differences.length === 0) {
      return;
    }
    const containerRect = this.contentEl.getElementsByClassName("file-diff__container")[0].getBoundingClientRect();
    const elementRect = this.contentEl.getElementsByClassName("difference")[0].getBoundingClientRect();
    this.contentEl.scrollTo({
      top: elementRect.top - containerRect.top - 100,
      behavior: "smooth"
    });
  }
  async showDeleteModal() {
    await sleep(200);
    return new Promise((resolve, reject) => {
      new DeleteFileModal({
        file1: this.state.file1,
        file2: this.state.file2,
        onDone: (e) => {
          var _a, _b;
          if (e) {
            return reject(e);
          }
          (_b = (_a = this.state).continueCallback) == null ? void 0 : _b.call(_a, true);
          this.leaf.detach();
          return resolve();
        }
      }).open();
    });
  }
};

// src/components/modals/risky_action_modal.ts
var import_obsidian3 = require("obsidian");
var RiskyActionModal = class extends import_obsidian3.Modal {
  constructor(args) {
    super(app);
    this.onAccept = args.onAccept;
  }
  onOpen() {
    this.modalEl.addClass("mb-20");
    this.contentEl.createEl("h3", { text: `Do you accept the risk?` });
    this.contentEl.createEl("p", {
      text: `The merging options alter the files irreversibly. Proceed with caution and only if you are aware and accepting of the associated risks.`
    });
    const buttonContainer = this.contentEl.createDiv(
      "file-diff__button-container"
    );
    const deleteButton = buttonContainer.createEl("button", {
      text: "Accept Risk",
      cls: "mod-warning mr-2"
    });
    const cancelButton = buttonContainer.createEl("button", {
      text: "Cancel"
    });
    cancelButton.addEventListener("click", () => this.close());
    deleteButton.addEventListener("click", () => {
      this.close();
      this.onAccept(null);
    });
  }
};

// src/components/modals/select_file_modal.ts
var import_obsidian4 = require("obsidian");
var SelectFileModal = class extends import_obsidian4.SuggestModal {
  constructor(args) {
    super(app);
    this.selectableFiles = args.selectableFiles;
    this.onChoose = args.onChoose;
  }
  getSuggestions(query) {
    return this.selectableFiles.filter((file) => {
      var _a;
      const searchQuery = query == null ? void 0 : query.toLowerCase();
      return (_a = file.name) == null ? void 0 : _a.toLowerCase().includes(searchQuery);
    }).sort((a, b) => a.stat.mtime < b.stat.mtime ? 1 : -1);
  }
  renderSuggestion(file, el) {
    el.createEl("div", { text: file.name });
  }
  onChooseSuggestion(file) {
    this.onChoose(null, file);
  }
};

// src/main.ts
var FileDiffPlugin = class extends import_obsidian5.Plugin {
  constructor() {
    super(...arguments);
    this.fileDiffMergeWarningKey = "file-diff-merge-warning";
  }
  onload() {
    this.registerView(
      VIEW_TYPE_DIFFERENCES,
      (leaf) => new DifferencesView(leaf)
    );
    this.addCommand({
      id: "compare",
      name: "Compare",
      editorCallback: async () => {
        const activeFile = this.app.workspace.getActiveFile();
        if (activeFile == null) {
          return;
        }
        const compareFile = await this.getFileToCompare(activeFile);
        if (compareFile == null) {
          return;
        }
        this.openDifferencesView({
          file1: activeFile,
          file2: compareFile,
          showMergeOption: false
        });
      }
    });
    this.addCommand({
      id: "compare-and-merge",
      name: "Compare and merge",
      editorCallback: async () => {
        if (!localStorage.getItem(this.fileDiffMergeWarningKey)) {
          await this.showRiskyActionModal();
          if (!localStorage.getItem(this.fileDiffMergeWarningKey)) {
            return;
          }
        }
        const activeFile = this.app.workspace.getActiveFile();
        if (activeFile == null) {
          return;
        }
        const compareFile = await this.getFileToCompare(activeFile);
        if (compareFile == null) {
          return;
        }
        this.openDifferencesView({
          file1: activeFile,
          file2: compareFile,
          showMergeOption: true
        });
      }
    });
    this.addCommand({
      id: "find-sync-conflicts-and-merge",
      name: "Find sync conflicts and merge",
      callback: async () => {
        if (!localStorage.getItem(this.fileDiffMergeWarningKey)) {
          await this.showRiskyActionModal();
          if (!localStorage.getItem(this.fileDiffMergeWarningKey)) {
            return;
          }
        }
        const syncConflicts = this.findSyncConflicts();
        for await (const syncConflict of syncConflicts) {
          const continuePromise = new Promise((resolve) => {
            this.openDifferencesView({
              file1: syncConflict.originalFile,
              file2: syncConflict.syncConflictFile,
              showMergeOption: true,
              continueCallback: async (shouldContinue2) => resolve(shouldContinue2)
            });
          });
          const shouldContinue = await continuePromise;
          if (!shouldContinue) {
            break;
          }
        }
      }
    });
  }
  async onunload() {
    this.app.workspace.detachLeavesOfType(VIEW_TYPE_DIFFERENCES);
  }
  getFileToCompare(activeFile) {
    const selectableFiles = this.app.vault.getFiles();
    selectableFiles.remove(activeFile);
    return this.showSelectOtherFileModal({ selectableFiles });
  }
  showSelectOtherFileModal(args) {
    return new Promise((resolve, reject) => {
      new SelectFileModal({
        selectableFiles: args.selectableFiles,
        onChoose: (e, f) => e ? reject(e) : resolve(f)
      }).open();
    });
  }
  showRiskyActionModal() {
    return new Promise((resolve, reject) => {
      new RiskyActionModal({
        onAccept: async (e) => {
          if (e) {
            reject(e);
          } else {
            localStorage.setItem(
              this.fileDiffMergeWarningKey,
              "true"
            );
            await sleep(50);
            resolve();
          }
        }
      }).open();
    });
  }
  async openDifferencesView(state) {
    this.app.workspace.detachLeavesOfType(VIEW_TYPE_DIFFERENCES);
    const leaf = await this.app.workspace.getLeaf(true);
    leaf.setViewState({
      type: VIEW_TYPE_DIFFERENCES,
      active: true,
      state
    });
    this.app.workspace.revealLeaf(leaf);
  }
  findSyncConflicts() {
    const syncConflicts = [];
    const files = app.vault.getMarkdownFiles();
    for (const file of files) {
      if (file.name.includes("sync-conflict")) {
        const originalFileName = file.name.replace(
          /\.sync-conflict-\d{8}-\d{6}-[A-Z0-9]+/,
          ""
        );
        const originalFile = files.find(
          (f) => f.name === originalFileName
        );
        if (originalFile) {
          syncConflicts.push({
            originalFile,
            syncConflictFile: file
          });
        }
      }
    }
    return syncConflicts;
  }
};
