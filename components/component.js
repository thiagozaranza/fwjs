FW.components.Component = function(component, domr) {

    "Use Strict";

    component.domr = domr;  
    component._controller;
    component._module;

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

    return component; 
};    