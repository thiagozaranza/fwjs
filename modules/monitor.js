FW.modules.Monitor = (function($, FW) {

    "Use Strict";

    var Monitor = Monitor || {};

    Monitor.config = {
        controller: "monitor",
        name: "Monitor"    
    };

    function init()
    {
        Monitor = FW.components.Module($, Monitor);

        return Monitor;
    };

    return init();
    
}($, FW));