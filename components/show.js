FW.components.Show = function(domr) {

    "Use Strict";

    var Show = Show || {};

    Show.domr = $(domr);
    Show.id = Show.domr.attr('fw-id');
    Show.controller = Show.domr.attr('fw-controller');

    var module = FW.getModule(Show.controller);

    function init() {

        $(document).ready(function($) {


            Show.load();
        });

        return Show;
    };

    function fill(obj) {

        Show.domr.find("[fw-field]").each(function() {

            var propParts = $(this).attr('fw-field').split('.');
            var source = obj;

            for (part in propParts) {
                if(source && propParts.hasOwnProperty(part))
                    source = source[propParts[part]];
            }

            var parser = $(this).attr('fw-parse');

            if (parser && FW.helpers.Parser.isValid(module, parser))
                source = FW.helpers.Parser.parse(module, parser, source);

            $(this).html(source);
        });
    };

    Show.load = function() {

        var data = {};

        var url = FW.config.url;

        if (Show.domr.attr('fw-url'))
            url = Show.domr.attr('fw-url');

        var jwt = FW.getJWT();
        if (jwt)
            data['jwt'] = jwt;

        $.ajax({
            url: url + '/' + Show.controller + '/' + Show.id ,
            method: "GET",
            context: document.body,
            data: data,
            accepts: {
                json: 'application/json'
            },
            dataType: 'json',
            beforeSend: function( xhr ) {

            }
        }).done(function(xhr) {
            fill(xhr);
        }).fail(function(xhr, textStatus) {

        }).always(function(xhr) {

        });
    };

    return init();
};