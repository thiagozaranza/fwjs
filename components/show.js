FW.components.Show = function (domr, controller) {
    
    "use strict";

    var Show = FW.components.Component(domr, controller);

    function init(domr, controller) {  

        Show.load(Show.domr.attr("fw-id"));

        return Show;
    };

    Show.fill = function(obj) {
        Show.domr.find("[fw-field]").each(function() {
            $(this).html(
                FW.helpers.Parser.parse(Show.getModule(), $(this).attr("fw-parse"), obj, $(this).attr("fw-field"))
            );
        });

        Show.domr.find("[fw-component]").each(function() {            
            var type = $(this).attr("fw-component");
            var component = FW.getRegisteredComponent(type, $(this));

            if (!component) return;                
            
            if (Show.getController() && !component.getController())
                component.setController(Show.getController());

            for (var item in obj) {
                if (component.getAttr("name") == item)
                    component.clean().setValue(obj[item]);
            }            
        });
    };

    Show.clean = function() {
        Show.domr.find("[fw-field]").each(function() {
            $(this).html('');
        });
    };

    Show.refresh = function() {
        Show.load(Show.domr.attr("fw-id"));
    };

    Show.load = function(id, callbacks) {
        if (!id) return;

        Show.id = id;

        if (!callbacks)
            callbacks = [];

        if (!callbacks.hasOwnProperty("done")) {
            callbacks["done"] = function( xhr ) {
                Show.fill(xhr);                
                if (Show.getModule().callbacks.hasOwnProperty("showDone") && typeof Show.getModule().callbacks.showDone == "function")
                    Show.getModule().callbacks.showDone(xhr);
            };
        }

        FW.helpers.Rest.get(Show.getModule().config.controller, callbacks, Show.id);
    };

    Show.getValue = function() {
        return {
            id: Show.domr.attr("fw-id")            
        }
    };

    Show.addParams = function(params) {
        for (var key in params) {
            Show.addParam(key, params[key]);
        }
    };

    Show.addParam = function(key, value) {
        if (key == 'id')
            Show.domr.attr("fw-id", value);
        else
            Show.domr.attr("fw-param-" . key, value);
    };

    return init(domr, controller);
};