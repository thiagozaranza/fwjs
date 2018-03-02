FW.components.Find = function (domr, controller) {
    
    "use strict";

    var Find = FW.components.Component('Find', domr, controller);

    function init(domr, controller) {  

        return Find;
    };


    Find.clean = function() {
        
    };

    Find.refresh = function() {
        ;
    };

    Find.load = function(id, callbacks) {
        
    };

    Find.getValue = function() {
        
    };

    Find.addParams = function(params) {
        for (var key in params) {
            Find.addParam(key, params[key]);
        }
    };

    Find.addParam = function(key, value) {
        if (key == 'id')
            Find.domr.attr("fw-id", value);
        else
            Find.domr.attr("fw-param-" . key, value);
    };

    return init(domr, controller);
};