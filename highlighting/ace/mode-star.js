define("ace/mode/star_highlight_rules", ["require", "exports", "module", "ace/lib/oop", "ace/mode/text_highlight_rules"], function (require, exports, module) {
    "use strict";

    var oop = require("../lib/oop");
    var TextHighlightRules = require("./text_highlight_rules").TextHighlightRules;

    var StarHighlightRules = function () {

        var keywordMapper = this.createKeywordMapper({
            "variable.language":
                "Array|Boolean|Date|Function|Iterator|Number|Object|RegExp|String|Proxy|KeyValue|number|object|BigNumber|BlockchainArray|BlockchainArraySafe|TypedKeyValue|BlockchainObject|" + // Constructors
                "Namespace|QName|XML|XMLList|" + // E4X
                "ArrayBuffer|Float32Array|Float64Array|Int16Array|Int32Array|Int8Array|" +
                "Uint16Array|Uint32Array|Uint8Array|Uint8ClampedArray|" +
                "Error|EvalError|InternalError|RangeError|ReferenceError|StopIteration|" + // Errors
                "SyntaxError|TypeError|URIError|" +
                "decodeURI|decodeURIComponent|encodeURI|encodeURIComponent|eval|isFinite|" + // Non-constructor functions
                "isNaN|parseFloat|parseInt|" +
                "JSON|Math|" + // Other
                "this|arguments|prototype|that|storage|console|contracts|Events|assert|global", // Pseudo
            "keyword":
                "const|get|set|" +
                "break|case|catch|continue|default|delete|do|else|finally|for|function|" +
                "if|in|of|instanceof|new|return|switch|throw|try|typeof|let|var|while|with|debugger|" +
                "__parent__|__count__|escape|unescape|with|__proto__|" +
                "class|enum|extends|super|export|implements|private|public|interface|package|protected|static",
            "storage.type":
                "const|let|var|function",
            "constant.language":
                "null|Infinity|NaN|undefined",
            "support.function":
                "alert",
            "constant.language.boolean": "true|false"
        }, "identifier");
        var identifierRe = "[a-zA-Z\\$_\u00a1-\uffff][a-zA-Z\\d\\$_\u00a1-\uffff]*";

        this.$rules = {
            start:
                [
                    /*{
                        token: 'support.constant.Star.2',
                        regex: '\\b(?:emit)\\b'
                    },*/
                    {
                        token: 'keyword.control.Star.2',
                        regex: '\\b(?:dynamic|extends|import|implements|interface|public|private|new|static|super|var|for|in|break|continue|while|do|return|if|else|case|switch|emit|Event|Storage|Property)\\b'
                    },
                    {
                        token: 'storage.type.Star.2',
                        regex: '\\b(?:Boolean|Number|String|Void|Array|Object|KeyValue|BlockchainArraySafe|BlockchainArray|TypedKeyValue|BlockchainObject|number|string|object|BigNumber|array|Array)\\b'
                    },
                    {
                        token: 'constant.language.Star.2',
                        regex: '\\b(?:null|undefined|true|false)\\b'
                    },
                    {
                        token: 'constant.numeric.Star.2',
                        regex: '\\b(?:0(?:x|X)[0-9a-fA-F]*|(?:[0-9]+\\.?[0-9]*|\\.[0-9]+)(?:(?:e|E)(?:\\+|-)?[0-9]+)?)(?:L|l|UL|ul|u|U|F|f)?\\b'
                    },
                    {
                        token: 'punctuation.definition.string.begin.Star.2',
                        regex: '"',
                        push:
                            [{
                                token: 'punctuation.definition.string.end.Star.2',
                                regex: '"',
                                next: 'pop'
                            },
                                {
                                    token: 'constant.character.escape.Star.2',
                                    regex: '\\\\.'
                                },
                                {defaultToken: 'string.quoted.double.Star.2'}]
                    },
                    {
                        token: 'punctuation.definition.string.begin.Star.2',
                        regex: '\'',
                        push:
                            [{
                                token: 'punctuation.definition.string.end.Star.2',
                                regex: '\'',
                                next: 'pop'
                            },
                                {
                                    token: 'constant.character.escape.Star.2',
                                    regex: '\\\\.'
                                },
                                {defaultToken: 'string.quoted.single.Star.2'}]
                    },
                    {
                        token: 'punctuation.definition.comment.Star.2',
                        regex: '/\\*',
                        push:
                            [{
                                token: 'punctuation.definition.comment.Star.2',
                                regex: '\\*/',
                                next: 'pop'
                            },
                                {defaultToken: 'comment.block.Star.2'}]
                    },
                    {
                        token: 'punctuation.definition.comment.Star.2',
                        regex: '//.*$',
                        push_:
                            [{
                                token: 'comment.line.double-slash.Star.2',
                                regex: '$',
                                next: 'pop'
                            },
                                {defaultToken: 'comment.line.double-slash.Star.2'}]
                    },
                    {
                        token: 'keyword.operator.Star.2',
                        regex: '\\binstanceof\\b'
                    },
                    {
                        token: 'keyword.operator.symbolic.Star.2',
                        regex: '[-!%&*+=/?:]'
                    },
                    {
                        token:
                            ['meta.preprocessor.Star.2',
                                'punctuation.definition.preprocessor.Star.2',
                                'meta.preprocessor.Star.2'],
                        regex: '^([ \\t]*)(#)([a-zA-Z]+)'
                    },
                    {
                        token:
                            ['storage.type.function.Star.2',
                                'meta.function.Star.2',
                                'entity.name.function.Star.2',
                                'meta.function.Star.2',
                                'punctuation.definition.parameters.begin.Star.2'],
                        regex: '\\b(function)(\\s+)([a-zA-Z_]\\w*)(\\s*)(\\()',
                        push:
                            [{
                                token: 'punctuation.definition.parameters.end.Star.2',
                                regex: '\\)',
                                next: 'pop'
                            },
                                {
                                    token: 'variable.parameter.function.Star.2',
                                    regex: '[^,)$]+'
                                },
                                {defaultToken: 'meta.function.Star.2'}]
                    },
                    {
                        token:
                            ['storage.type.class.Star.2',
                                'meta.class.Star.2',
                                'entity.name.type.class.Star.2',
                                'meta.class.Star.2',
                                'storage.modifier.extends.Star.2',
                                'meta.class.Star.2',
                                'entity.other.inherited-class.Star.2'],
                        regex: '\\b(class)(\\s+)([a-zA-Z_](?:\\w|\\.)*)(?:(\\s+)(extends)(\\s+)([a-zA-Z_](?:\\w|\\.)*))?'
                    },
                    {
                        token: keywordMapper,
                        regex: identifierRe
                    }]
        };

        this.normalizeRules();
    };

    StarHighlightRules.metaData = {
        fileTypes: ['as'],
        keyEquivalent: '^~A',
        name: 'Star',
        scopeName: 'source.Star.2'
    };


    oop.inherits(StarHighlightRules, TextHighlightRules);

    exports.StarHighlightRules = StarHighlightRules;
});

define("ace/mode/folding/cstyle", ["require", "exports", "module", "ace/lib/oop", "ace/range", "ace/mode/folding/fold_mode"], function (require, exports, module) {
    "use strict";

    var oop = require("../../lib/oop");
    var Range = require("../../range").Range;
    var BaseFoldMode = require("./fold_mode").FoldMode;

    var FoldMode = exports.FoldMode = function (commentRegex) {
        if(commentRegex) {
            this.foldingStartMarker = new RegExp(
                this.foldingStartMarker.source.replace(/\|[^|]*?$/, "|" + commentRegex.start)
            );
            this.foldingStopMarker = new RegExp(
                this.foldingStopMarker.source.replace(/\|[^|]*?$/, "|" + commentRegex.end)
            );
        }
    };
    oop.inherits(FoldMode, BaseFoldMode);

    (function () {

        this.foldingStartMarker = /([\{\[\(])[^\}\]\)]*$|^\s*(\/\*)/;
        this.foldingStopMarker = /^[^\[\{\(]*([\}\]\)])|^[\s\*]*(\*\/)/;
        this.singleLineBlockCommentRe = /^\s*(\/\*).*\*\/\s*$/;
        this.tripleStarBlockCommentRe = /^\s*(\/\*\*\*).*\*\/\s*$/;
        this.startRegionRe = /^\s*(\/\*|\/\/)#?region\b/;
        this._getFoldWidgetBase = this.getFoldWidget;
        this.getFoldWidget = function (session, foldStyle, row) {
            var line = session.getLine(row);

            if(this.singleLineBlockCommentRe.test(line)) {
                if(!this.startRegionRe.test(line) && !this.tripleStarBlockCommentRe.test(line)) {
                    return "";
                }
            }

            var fw = this._getFoldWidgetBase(session, foldStyle, row);

            if(!fw && this.startRegionRe.test(line)) {
                return "start";
            } // lineCommentRegionStart

            return fw;
        };

        this.getFoldWidgetRange = function (session, foldStyle, row, forceMultiline) {
            var line = session.getLine(row);

            if(this.startRegionRe.test(line)) {
                return this.getCommentRegionBlock(session, line, row);
            }

            var match = line.match(this.foldingStartMarker);
            if(match) {
                var i = match.index;

                if(match[1]) {
                    return this.openingBracketBlock(session, match[1], row, i);
                }

                var range = session.getCommentFoldRange(row, i + match[0].length, 1);

                if(range && !range.isMultiLine()) {
                    if(forceMultiline) {
                        range = this.getSectionRange(session, row);
                    } else if(foldStyle != "all") {
                        range = null;
                    }
                }

                return range;
            }

            if(foldStyle === "markbegin") {
                return;
            }

            var match = line.match(this.foldingStopMarker);
            if(match) {
                var i = match.index + match[0].length;

                if(match[1]) {
                    return this.closingBracketBlock(session, match[1], row, i);
                }

                return session.getCommentFoldRange(row, i, -1);
            }
        };

        this.getSectionRange = function (session, row) {
            var line = session.getLine(row);
            var startIndent = line.search(/\S/);
            var startRow = row;
            var startColumn = line.length;
            row = row + 1;
            var endRow = row;
            var maxRow = session.getLength();
            while (++row < maxRow) {
                line = session.getLine(row);
                var indent = line.search(/\S/);
                if(indent === -1) {
                    continue;
                }
                if(startIndent > indent) {
                    break;
                }
                var subRange = this.getFoldWidgetRange(session, "all", row);

                if(subRange) {
                    if(subRange.start.row <= startRow) {
                        break;
                    } else if(subRange.isMultiLine()) {
                        row = subRange.end.row;
                    } else if(startIndent == indent) {
                        break;
                    }
                }
                endRow = row;
            }

            return new Range(startRow, startColumn, endRow, session.getLine(endRow).length);
        };
        this.getCommentRegionBlock = function (session, line, row) {
            var startColumn = line.search(/\s*$/);
            var maxRow = session.getLength();
            var startRow = row;

            var re = /^\s*(?:\/\*|\/\/|--)#?(end)?region\b/;
            var depth = 1;
            while (++row < maxRow) {
                line = session.getLine(row);
                var m = re.exec(line);
                if(!m) {
                    continue;
                }
                if(m[1]) {
                    depth--;
                } else {
                    depth++;
                }

                if(!depth) {
                    break;
                }
            }

            var endRow = row;
            if(endRow > startRow) {
                return new Range(startRow, startColumn, endRow, line.length);
            }
        };

    }).call(FoldMode.prototype);

});

define("ace/mode/star", ["require", "exports", "module", "ace/lib/oop", "ace/mode/text", "ace/mode/star_highlight_rules", "ace/mode/folding/cstyle"], function (require, exports, module) {
    "use strict";

    var oop = require("../lib/oop");
    var TextMode = require("./text").Mode;
    var StarHighlightRules = require("./star_highlight_rules").StarHighlightRules;
    var FoldMode = require("./folding/cstyle").FoldMode;

    var Mode = function () {
        this.HighlightRules = StarHighlightRules;
        this.foldingRules = new FoldMode();
        this.$behaviour = this.$defaultBehaviour;
    };
    oop.inherits(Mode, TextMode);

    (function () {
        this.lineCommentStart = "//";
        this.blockComment = {start: "/*", end: "*/"};
        this.$id = "ace/mode/star";
    }).call(Mode.prototype);

    exports.Mode = Mode;
});
(function () {
    window.require(["ace/mode/star"], function (m) {
        if(typeof module == "object" && typeof exports == "object" && module) {
            module.exports = m;
        }
    });
})();
