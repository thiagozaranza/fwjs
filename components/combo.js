FW.components.Combo = function(domr, controller) {

    "Use Strict";

    var Combo = FW.components.Component('Combo', domr, controller);

    var loaded = false;
    var loading = false;
    var loadingText = 'Carregando opções...';
    
    function init(domr, controller) {

        domr.attr('data-live-search', "true");
        domr.selectpicker({
            style: 'btn-default',
            size: 8
        });
       
        Combo.reference = Combo.domr.attr('fw-reference');
        Combo.value = Combo.domr.attr('fw-value');

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
            Combo.reference.on('change', function() {
                Combo.load();                
            });
        }
    }

    Combo.getController = function() {
        if (Combo._controller)
            return Combo._controller;        
        if (Combo.domr.attr("fw-controller"))             
            return Combo._controller = Combo.domr.attr("fw-controller");        
    };

    Combo.fill = function ( obj ) {

        Combo.domr.append('<option></option>');

        for (var i in obj.list) {
            var id = obj.list[i].id;
            var nome = obj.list[i].nome;

            if (!id)
                id = nome;

            var parse = Combo.domr.attr('fw-parse');

            if (parse)
                nome = FW.helpers.Parser.parse(Combo.getModule(), parse, obj.list[i], 'nome');

            if (Combo.value == id)
                Combo.domr.append('<option value="'+id+'" selected="selected">'+nome+'</option>');
            else
                Combo.domr.append('<option value="'+id+'">'+nome+'</option>');
        }

        Combo.domr.selectpicker('refresh');

        loaded = true;

        if (obj.list.length == 1)
            Combo.setValue(obj.list[0].id);

        return Combo;
    };

    Combo.clean = function () {
        
        Combo.reference = Combo.domr.attr('fw-reference');
        Combo.value = Combo.domr.attr('fw-value');
        Combo._controller = Combo.domr.attr('fw-controller');

        Combo.domr.find('option').remove();    
        Combo.domr.selectpicker('refresh');
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

    Combo.preload = function() {
        FW.disableActionButtons();
        $(Combo.domr).attr('disabled');
        $(Combo.domr).parent().find('button').addClass('btn-loading');
        
        domr.selectpicker('refresh');
    };

    Combo.posload = function() {               
        $(Combo.domr).removeAttr('disabled');
        $(Combo.domr).parent().find('button').removeClass('btn-loading');
        domr.selectpicker('refresh');
        FW.enableActionButtons(); 
    };

    Combo.load = function( callbacks ) {

        if (!callbacks)
            callbacks = [];

        if (!callbacks.hasOwnProperty('beforeSend')) {
            callbacks['beforeSend'] = function (xhr) {
                Combo.clean().domr.append('<option selected="selected">' + loadingText + '</option>');
                Combo.preload();
            };
        }

        if (!callbacks.hasOwnProperty('done')) {
            callbacks['done'] = function (xhr) {
                Combo.clean().fill(xhr);
            };
        }

        if (!callbacks.hasOwnProperty('always')) {
            callbacks['always'] = function (xhr) {
                Combo.posload();
            };
        }

        var data = { limit: 999999, orderBy: 'nome'};

        if (Combo.reference && typeof Combo.reference.val === 'function') {
            var referenceValue = Combo.reference.val();

            if (referenceValue == loadingText) {
                var interval = window.setInterval(function() {  
                    var referenceValue = Combo.reference.val();
                    if (referenceValue != loadingText) {
                        data[Combo.reference.attr('name') + '-EQ'] = referenceValue;                                                
                        clearInterval(interval);
                    }                    
                }, 100);
            } else {
                data[Combo.reference.attr('name') + '-EQ'] = referenceValue;
                FW.helpers.Rest.getList(Combo.getController(), callbacks, data);    
            }           
        } else {            
            FW.helpers.Rest.getList(Combo.getController(), callbacks, data);
        }
    };

    Combo.refresh = function () {        
        Combo.clean().load();
    };

    Combo.setValue = function(value) {

        if (Combo.isLoaded()) {
            $(Combo.domr).val(value);
            domr.selectpicker('refresh');
        } else {

            var referenceValue = (Combo.reference)? Combo.reference.val() : null; 

            if (!Combo.reference) { // Não há combo referencia
                var interval = window.setInterval(function () {
                    if (Combo.isLoaded()) {
                        $(Combo.domr).val(value);
                        domr.selectpicker('refresh');
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
                                domr.selectpicker('refresh');
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
                        domr.selectpicker('refresh');
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
                                domr.selectpicker('refresh');
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

    return init(domr, controller);
};