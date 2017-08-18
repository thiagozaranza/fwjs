FW.helpers.Parser = (function($, FW) {

    "Use Strict";

    var Parser = Parser || {};

    function init() {
        return Parser;
    };

    Parser.isValid = function (module, parser) {
        return parser && (Parser.hasOwnProperty(parser) && typeof Parser[parser] == 'function')
            || (module.parsers.hasOwnProperty(parser) && typeof module.parsers[parser] == 'function');
    };

    Parser.parse = function (module, parser, obj, path) {

        var fullObj = obj;
        var propParts = path.split('.');

        for (part in propParts) {
            if (obj && obj.hasOwnProperty(propParts[part]))
                obj = obj[propParts[part]];
        }

        if (!parser)
            return obj;

        var parserParts = parser.split(' ');
        var parsed = obj;

        for (var p in parserParts) {
            var _parser = parserParts[p];

            if (module && module.parsers.hasOwnProperty(_parser) && typeof module.parsers[_parser] == 'function')
                parsed = module.parsers[_parser](fullObj, parsed);

            if (Parser.hasOwnProperty(_parser) && typeof Parser[_parser] == 'function')
                parsed = Parser[_parser](fullObj, parsed);
        }

        return parsed;
    };

    Parser.show = function(fullObj, obj) {
        if (!obj)
            return '';

        var link = $(document.createElement('a'));
        link.attr('href', 'javascript:;');
        link.html(obj);
        link.attr('fw-action', 'show');
        link.attr('fw-id', fullObj.id);

        return link;
    };

    Parser.dateFormat = function(fullObj, obj) {
        if (!obj || typeof obj != 'string')
            return '';

        var parts = obj.split(' ');
        var dateParts = parts[0].split('-');

        if (dateParts.length == 3)
            obj = dateParts[2] + '/' + dateParts[1] + '/' + dateParts[0];

        var timeParts = parts[1].split('.');

        if (parts.length > 0 && timeParts.length > 0)
            obj += ' ' +  timeParts[0];

        return obj;
    };

    Parser.dateTime = Parser.dateFormat;
    Parser.datetime = Parser.dateFormat;

    Parser.date = function(fullObj, obj) {
        return Parser.dateFormat(fullObj, obj).split(' ')[0];
    };

    Parser.uppercase = function(fullObj, obj) {
        return (obj && typeof obj == 'string')? obj.toUpperCase() : null;
    };

    Parser.lowercase = function(fullObj, obj) {
        return (obj && typeof obj == 'string')? obj.toLowerCase() : null;
    };

    Parser.bool = function(fullObj, obj) {
        return (obj == 'true' || obj == true || obj == 1)? 'SIM' : 'NÃO';
    };

    Parser.modalShow = function(fullObj, obj) {
        if (!obj)
            return '';

        var link = $(document.createElement('a'));
        link.attr('href', 'javascript:;');
        link.html(obj);
        link.attr('fw-action', 'modalShow');
        link.attr('fw-id', fullObj.id);

        return link;
    };

    return init();

})($, FW);