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

    Parser.parse = function (module, parser, source) {
        if (!module || !parser || !source)
            return '';

        if (module.parsers.hasOwnProperty(parser) && typeof module.parsers[parser] == 'function')
            return module.parsers[parser](source);

        if (Parser.hasOwnProperty(parser) && typeof Parser[parser] == 'function')
            return Parser[parser](source);
    };

    Parser.show = function(obj) {
        if (!obj)
            return '';

        var link = $(document.createElement('a'));
        link.attr('href', 'javascript:;');
        link.html(obj);
        link.attr('fw-id', obj);

        return link;
    };

    Parser.dateFormat = function(obj) {
        if (!obj)
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

    Parser.date = function(obj) {
        return Parser.dateFormat(obj).split(' ')[0];
    };

    Parser.uppercase = function(obj) {
        return (obj)? obj.toUpperCase() : null;
    };

    Parser.lowercase = function(obj) {
        return (obj)? obj.toLowerCase() : null;
    };

    Parser.bool = function(obj) {
        return (obj == 'true' || obj == true || obj == 1)? 'SIM' : 'NÃO';
    };

    return init();

})($, FW);