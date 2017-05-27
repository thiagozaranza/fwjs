FW.modules.Area = (function($, FW) {

    "Use Strict";

    var Area = Area || {};

    Area.config = {
        controller: 'areas'
    };

    function init()
    {
        Area = FW.components.Module($, Area);

        //Area.actions.create = function() {
        //    alert(Area.config.controller);
        //};

        $(document).ready(function($) {
            FW.scan();
        });

        return Area;
    };

    return init();

}(jQuery, FW));