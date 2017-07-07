FW.components.Combo = function(domr) {

    "Use Strict";

    var Combo = Combo || {};

    var loaded = false;
    var loading = false;
    var loadingText = 'Carregando opções...';
    
    function init(domr) {

        Combo = FW.components.Component(Combo, domr);
       
        if (!Combo.getController()) return;

        Combo.reference = Combo.domr.attr('fw-reference');
        Combo.value = Combo.domr.attr('fw-value');

        FW.registerComponent('combo', Combo);

        if (Combo.reference)
            bindReference();
        else
            Combo.load();

        return Combo;
    };

    function bindReference() {

        var form = null;

        for (var item in FW.registry.form) {
            var combos = FW.registry.form[item].domr.find('select[name="' + Combo.domr.attr('name') + '"]');
            for (var _combo in combos) {
                if (combos[_combo] === Combo.domr[0]) {
                    form = FW.registry.form[item];
                    break;
                }
            }
        }

        if (!form) return;

        var references = form.domr.find('[name="' + Combo.reference + '"]');

        if (references.length) {
            Combo.reference = $(references[0]);
            Combo.reference.off('change').on('change', function() {
                Combo.load();                
            });
        }
    }

    Combo.getController = function() {
        if (Combo.controller)
            return Combo.controller;        
        if (Combo.domr.attr("fw-controller"))             
            return Combo.controller = Combo.domr.attr("fw-controller");        
    };

    Combo.fill = function ( obj ) {

        Combo.domr.append('<option></option>');

        for (var i in obj.list) {
            if (Combo.value == obj.list[i].id)
                Combo.domr.append('<option value="'+obj.list[i].id+'" selected="selected">'+obj.list[i].nome+'</option>');
            else
                Combo.domr.append('<option value="'+obj.list[i].id+'">'+obj.list[i].nome+'</option>');
        }

        loaded = true;

        if (obj.list.length == 1)
            Combo.setValue(obj.list[0].id);

        return Combo;
    };

    Combo.clean = function () {
        Combo.domr.find('option').remove();
        loaded = false;
        return Combo;
    };

    Combo.isLoaded = function () {
        return loaded;
    };

    Combo.isLoading = function () {
        return loading;
    };

    Combo.getValue = function() {
        return $(Combo.domr).val();
    };

    Combo.load = function( callbacks ) {

        if (!callbacks)
            callbacks = [];

        if (!callbacks.hasOwnProperty('beforeSend')) {
            callbacks['beforeSend'] = function (xhr) {
                Combo.clean().domr.append('<option selected="selected">' + loadingText + '</option>');
            };
        }

        if (!callbacks.hasOwnProperty('done')) {
            callbacks['done'] = function (xhr) {
                Combo.clean().fill(xhr);
            };
        }

        var data = { limit: 999999, orderBy: 'nome'};

        if (Combo.reference) {            
            var referenceValue = Combo.reference.val();

            if (referenceValue == loadingText) {
                var interval = window.setInterval(function() {  
                    var referenceValue = Combo.reference.val();
                    if (referenceValue != loadingText) {
                        data[Combo.reference.attr('name') + '.EQ'] = referenceValue;                        
                        clearInterval(interval);
                    }                    
                }, 100);
            } else {
                data[Combo.reference.attr('name') + '.EQ'] = referenceValue;
                FW.helpers.Rest.getList(Combo.getController(), callbacks, data);    
            }           
        } else {            
            FW.helpers.Rest.getList(Combo.getController(), callbacks, data);
        }
    };

    Combo.setValue = function(value) {

        if (Combo.isLoaded()) {
            $(Combo.domr).val(value);
        } else {

            var referenceValue = (Combo.reference)? Combo.reference.val() : null; 

            if (!Combo.reference) { // Não há combo referencia
                var interval = window.setInterval(function () {
                    if (Combo.isLoaded()) {
                        $(Combo.domr).val(value);
                        clearInterval(interval);
                    }
                }, 100);
            } else if (referenceValue && referenceValue == loadingText) { // Há referencia e a referencia está carregando
                var interval = window.setInterval(function() {
                    var referenceVal = Combo.reference.val();
                    if (referenceVal &&  referenceVal != loadingText) {                        
                        Combo.load();
                        var interval2 = window.setInterval(function() {
                            if ($(Combo.domr).val() != loadingText) {
                                $(Combo.domr).val(value);
                                clearInterval(interval2);
                            }
                        }, 100);                        
                    }
                    clearInterval(interval);
                }, 100);                
            } else if (referenceValue && referenceValue != loadingText) { // Há referencia e a referencia está carregada               
                Combo.load();              
                var interval2 = window.setInterval(function() {
                    if ($(Combo.domr).val() != loadingText) {
                        $(Combo.domr).val(value);
                        clearInterval(interval2);
                    }
                }, 100);
            } else if (Combo.reference && !referenceValue) { // Há referencia e a referencia ainda não está carregando
                
                var comboReference = FW.getRegisteredComponent('combo', Combo.reference)    

                var interval = window.setInterval(function () {
                    if (comboReference.isLoaded()) {
                       var interval2 = window.setInterval(function() {
                            if ($(Combo.domr).val() != loadingText) {
                                $(Combo.domr).val(value);
                                clearInterval(interval2);
                            }
                        }, 100); 
                        Combo.load();
                        clearInterval(interval);
                    }
                    
                }, 100);
            }
        }
    };

    return init(domr);
};