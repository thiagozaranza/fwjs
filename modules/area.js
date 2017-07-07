FW.modules.Area = (function($, FW) {

    "Use Strict";

    var Area = Area || {};

    Area.config = {
        controller: 'area',
        name: 'Área'
    };

    function init()
    {
        Area = FW.components.Module($, Area);

        return Area;
    };

    return init();

}(jQuery, FW));