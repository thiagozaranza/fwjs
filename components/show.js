FW.components.Show = function ( domr ) {
    "use strict";

    var Show = Show || {};

    function init(domr) {  

        Show = FW.components.Component(Show, domr);      

        if (!Show.getModule()) return;

        Show.load(Show.domr.attr("fw-id"));

        FW.registerComponent("show", Show);

        return Show;
    };

    Show.fill = function( obj ) {
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

    Show.load = function( id, callbacks ) {
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

    return init(domr);
};