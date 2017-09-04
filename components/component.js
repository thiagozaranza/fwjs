FW.components.Component = function(domr, controller) {

    "Use Strict";

    var component = {};

    component.domr = domr;  
    component._controller = controller;
    component._module;
    component._waiting;

    if (!component.hasOwnProperty('setController')) {
        component.setController = function(controller) {      
            component._module = FW.getModule(controller);      
            if (component._module)      
                component.domr.attr("fw-controller", component._controller = controller);
        };
    }

    if (!component.hasOwnProperty('getController')) {
        component.getController = function() {
            if (component._controller)
                return component._controller;        
            if (component.getAttr("fw-controller"))
                return component._controller = component.getAttr("fw-controller");            
        };  
    }

    component.getDOM = function() {
        return component.domr;
    };

    component.getAttr = function(attr) {
        return component.getDOM().attr(attr); 
    };

    component.setAttr = function(key, value) {
        return component.getDOM().attr(key, value); 
    };

    component.getModule = function(attr) {
        if (component._module)
            return component._module;        
        return FW.getModule(component.getController());    
    };

    component.broadcastRegister = function(title, action) {
        component._waiting = {
            title: title,
            action: action
        };
    };

    component.addParams = function(params, components) {        
        for (var key in params) {
            component.addParam(key, params[key]);
        }
    };

    component.addParam = function(key, value) {
        if (key == 'id')
            component.domr.attr("fw-id", value);
        else
            component.domr.attr("fw-param-" . key, value);
    };

    component.getParams = function() {  

        var obj = {};
        
        component.domr.each(function() {
            $.each(this.attributes, function() {
                if(this.specified) {
                    if (this.name == 'fw-id')
                        obj['id'] = this.value;
                    else if (this.name.indexOf('fw-param-') >= 0)
                        obj[this.name.substring('fw-param-'.length, this.name.length)] = this.value;
                }
            });
        });

        return obj;
    };

    component.waiting = function(title) {
        return component.hasOwnProperty('_waiting') && component._waiting.hasOwnProperty('title') && component._waiting.title == title;
    };

    component.execute = function(params) {
        if (component._waiting.hasOwnProperty('action') && typeof component._waiting.action == 'function')
            component._waiting.action(params);
    }

    return component; 
};    