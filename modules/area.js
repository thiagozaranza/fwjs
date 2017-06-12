FW.modules.Area = (function($, FW) {

    "Use Strict";

    var Area = Area || {};

    Area.config = {
        controller: 'area'
    };

    function init()
    {
        Area = FW.components.Module($, Area);

        Area.actions.favorito = function(domr) {
            alert('Favoritar ' + $(domr).attr('fw-id'));
        };

        Area.parsers.date = function(txt) {
            var parts = txt.split(' ');

            var dateParts = parts[0].split('-');

            txt = dateParts[2] + '/' + dateParts[1] + '/' + dateParts[0];

            return txt;
        };

        $(document).ready(function($) {
            FW.scan();
        });

        return Area;
    };

    return init();

}(jQuery, FW));