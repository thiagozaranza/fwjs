FW.components.Combo = function(domr) {

    "Use Strict";

    var Combo = Combo || {};

    Combo.domr = $(domr);
    Combo.controller = Combo.domr.attr('fw-controller');

    var module = FW.getModule(Combo.controller);

    function init() {

        $(document).ready(function($) {
            Combo.load();
        });

        return Combo;
    };

    function fill(obj) {
        Combo.domr.find('option').remove();
        Combo.domr.append('<option></option>');
        for (var i in obj.list) {
            Combo.domr.append('<option value="'+obj.list[i].id+'">'+obj.list[i].nome+'</option>')
        }
    };

    Combo.load = function() {

        var data = {};

        var url = FW.config.url;

        if (Combo.domr.attr('fw-url'))
            url = Combo.domr.attr('fw-url');

        var jwt = FW.getJWT();
        if (jwt)
            data['jwt'] = jwt;

        $.ajax({
            url: FW.config.url + '/' + Combo.controller,
            method: "GET",
            context: document.body,
            data: {
                limit: 999999,
                orderBy: 'nome'
            },
            accepts: {
                json: 'application/json'
            },
            dataType: 'json',
            beforeSend: function( xhr ) {
                Combo.domr.find('option').remove();
                Combo.domr.append('<option>carregando opções...</option>');
            }
        }).done(function(xhr) {
            fill(xhr);
        }).fail(function(xhr, textStatus) {
            alert(textStatus);
        });
    };

    return init();
};