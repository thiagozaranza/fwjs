FW.components.Form = function(domr, controller) {

    "Use Strict";

    var Form = FW.components.Component('Form', domr, controller); 

    var loadId

    function init(domr)
    {   
        loadId = Form.domr.attr('fw-load');

        scan();

        if (loadId)
            Form.load(loadId);

        return Form;
    };

    Form.load = function( id, callbacks ) {

        Form.clean();

        if (!callbacks)
            callbacks = [];

        if (!callbacks.hasOwnProperty('beforeSend')) {
            callbacks['beforeSend'] = function( xhr ) {
                Form.disableButtons();
            };
        }

        if (!callbacks.hasOwnProperty('done')) {
            callbacks['done'] = function (xhr) {
                Form.fill(xhr);
            };
        }

        if (!callbacks.hasOwnProperty('always')) {
            callbacks['always'] = function (xhr) {
                Form.enableButtons();
            };
        }

        FW.helpers.Rest.get(Form.getController(), callbacks, id);
    };

    Form.disableButtons = function() {
        Form.domr.find('button').prop("disabled",true);
    };

    Form.enableButtons = function() {
        Form.domr.find('button').prop("disabled",false);
    };

    Form.fill = function ( obj ) {

        for (var field in obj) {
            Form.domr.find('input').each(function() {
                var type = $(this).attr('type');
                if ($(this).attr('name') == field) {
                    if (type == 'text') {
                        var value = FW.helpers.Parser.parse(Form.getModule(), $(this).attr('fw-parse'), obj, $(this).attr('name'));
                        if (typeof value == 'string')
                            $(this).val(value.trim());
                    }
                    else if (type == 'checkbox') { 
                        if (obj[field] == 'true' || obj[field] == true || obj[field] == 1)
                            $(this).prop('checked', true);
                        else
                            $(this).prop('checked', false);
                    } 
                    else if (type == 'hidden') {
                        $(this).val(obj[field]);
                    }
                }
            });

            Form.domr.find('textarea').each(function() {
                var id = $(this).attr('id');
                var name = $(this).attr('name');
                
                if (id && CKEDITOR && CKEDITOR.instances.hasOwnProperty(id))
                    CKEDITOR.instances[id].setData(obj[name]);
            });

            Form.domr.find('select').each(function() {
                if ($(this).attr('name') == field) {
                    var combo = FW.getRegisteredComponent('combo', $(this));   
                    if (combo)                    
                        combo.setValue(obj[field]);
                }
            });

            Form.domr.find('[fw-component="add"]').each(function() {
                if ($(this).attr('name') == field) {
                    var component = FW.getRegisteredComponent('add', $(this)); 
                    if(!component) return;
                    component.setValue(obj[field]);
                }
            });
        }
    };

    Form.clean = function() {

        Form.domr.find('input').each(function() {
            
            var type = $(this).attr('type');

            if (type == 'checkbox')
                $(this).prop('checked', false);
            else if (type != 'hidden')
                $(this).val('');
        });

        Form.domr.find('textarea').each(function() {
            var input = $(this);
            if (CKEDITOR && CKEDITOR.instances.hasOwnProperty(input.attr('id')))
                CKEDITOR.instances[input.attr('id')].setData('');
            else
                input.val('');
        });

        Form.domr.find('select').each(function() {

            var combo = FW.getRegisteredComponent('combo', $(this));

            if (!combo) return;

            if ($(this).attr('fw-reference'))
                combo.clean();

            var options = $(this).find('option');

            if (options.length == 2)
                $(options[1]).attr('selected', 'selected');
            else
                $(this).val('');

             combo.domr.selectpicker('refresh');
        });

        Form.domr.find('[fw-component="add"]').each(function() {
            var component = FW.getRegisteredComponent('add', $(this));
            if (component)
                component.clean();
        });
    };

    Form.getValue = function() {

        var obj = {};

        Form.domr.find('input, select').each(function() {
            var input = $(this);

            if (input.parent().data('provide') == 'datepicker')
                obj[input[0].name] = dateDBFormat(input.val());
            else if (input[0].type == 'checkbox')
                obj[input[0].name] = (input[0].checked)? true : false;
            else         
                obj[input[0].name] = input.val();
        });

        Form.domr.find('textarea').each(function() {
            var input = $(this);
            obj[input[0].name] = (CKEDITOR && CKEDITOR.instances.hasOwnProperty(input.attr('id'))) ? CKEDITOR.instances[input.attr('id')].getData() : input.val();
        });

        Form.domr.find('[fw-component="add"]').each(function() {
            var component = FW.getRegisteredComponent('add', $(this));
            obj[component.name] = component.val();
        });

        Form.domr.find('checkbox').each(function() {
            
        });

        return obj;
    }

    Form.refresh = function() {
        Form.domr.find('select').each(function() {
            var value = $(this).val();
            var combo = FW.getRegisteredComponent('combo', $(this));

            if (!combo) return;
            combo.load({'done': function (xhr) {
                combo.clean().fill(xhr).setValue(value);
            }});
        });

        var idHidden = Form.domr.find('input[type="hidden"][name="id"]');
        if (idHidden.length)
            Form.load(idHidden.val());
    }

    Form.addParam = function(key, value) {

        if (Form.domr.attr('fw-no-params') !== undefined)
            return;

        var hiddenParam = Form.domr.find('input[type="hidden"][name="'+ key +'"]');

        if (hiddenParam.length)
            hiddenParam.val(value);
        else 
            Form.domr.append('<input type="hidden" name="' + key + '" value="' + value + '" />');
    }

    Form.addParams = function(params) {
        for (var key in params) {
            Form.addParam(key, params[key]);
        }
    }

    function scan() {
        Form.domr.find('select[fw-create-button]').each(function() {
            
            var controller = $(this).attr('fw-controller');
            
            FW.components.ButtonFactory.make({
                icon: 'plus',                
                size: 'xs',
                align: 'right',
                attrs: {
                    'fw-action': 'modalCreate',
                    'fw-controller': controller
                }
            }).insertBefore($(this));            
        });        
    };

    function dateDBFormat(date) {

        var parts = date.split(' ');
        var dateParts = parts[0].split('/');

        var dia = dateParts[0];
        var mes = dateParts[1];
        var ano = dateParts[2];
        var hora = (parts.length > 1)? ' ' + parts[1] : '';

        return ano + '-' + mes + '-' + dia + hora;
    }

    return init(domr, controller);
};