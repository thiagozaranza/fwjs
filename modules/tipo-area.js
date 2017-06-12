FW.modules.TipoArea = (function($, FW) {

    "Use Strict";

    var TipoArea = TipoArea || {};

    TipoArea.config = {
        controller: 'tipo-area'
    };

    function init()
    {
        TipoArea = FW.components.Module($, TipoArea);

        $(document).ready(function($) {
            FW.scan();
        });

        TipoArea.actions.jonaneto = function(domr) {
            alert ('O pombão!' + domr.attr('fw-id'));
        }

        return TipoArea;
    };

    return init();

}(jQuery, FW));