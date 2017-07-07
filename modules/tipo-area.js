FW.modules.TipoArea = (function($, FW) {

    "Use Strict";

    var TipoArea = TipoArea || {};

    TipoArea.config = {
        controller: 'tipo-area',
        name: 'Tipo Área'
    };

    function init()
    {
        TipoArea = FW.components.Module($, TipoArea);

        return TipoArea;
    };

    return init();

}(jQuery, FW));