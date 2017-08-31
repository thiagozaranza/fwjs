FW.components.Component = function(component, domr, controller) {

    "Use Strict";

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

    component.waiting = function(title) {
        return component.hasOwnProperty('_waiting') && component._waiting.hasOwnProperty('title') && component._waiting.title == title;
    };

    component.execute = function(params) {
        if (component._waiting.hasOwnProperty('action') && typeof component._waiting.action == 'function')
            component._waiting.action(params);
    }

    return component; 
};    