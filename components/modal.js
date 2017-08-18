FW.components.Modal = function(config) {

    "Use Strict";

    var Modal = Modal || {};

    Modal.config = config;

    var content;
    var form;

    function init() {

        Modal = FW.components.Component(Modal);

        var modalRegistered = FW.getRegisteredComponent('modal', Modal.domr);
        
        if (modalRegistered) 
            return modalRegistered;
        
        FW.registerComponent('modal', Modal);

        return Modal;
    };

    Modal.load = function( callbacks ) {

        $.ajax({
            url: FW.config.url + '/' + config.url,
            method: "GET",
            context: document.body,
            beforeSend: function( xhr ) {
                if (callbacks && callbacks.hasOwnProperty('beforeSend'))
                    callbacks['beforeSend'](xhr);
            }
        }).done(function(xhr, textStatus) {

            $('body').append(buildHtml(xhr));

            if (callbacks && callbacks.hasOwnProperty('done'))
                callbacks['done'](xhr, textStatus);

        }).fail(function(xhr, textStatus) {
            if (callbacks && callbacks.hasOwnProperty('fail'))
                callbacks['fail'](xhr, textStatus);
        }).always(function(xhr) {
            if (callbacks && callbacks.hasOwnProperty('always'))
                callbacks['always'](xhr);
        });
    };

    function buildHtml( content ) {

        var buttons = [];

        buttons.push(FW.components.ButtonFactory.make({
            text: 'Cancelar',
            attrs: {
                'data-dismiss': 'modal'
            }
        }));

        for (var item in config.actionButtons.reverse()) {
            var buttonConfig = config.actionButtons[item];
            if (typeof buttonConfig == 'string' && FW.actionButtons.hasOwnProperty(buttonConfig))
                buttonConfig = FW.actionButtons[buttonConfig];            

            buttons.push(FW.components.ButtonFactory.make(buttonConfig));
        }

        Modal.domr = $(document.createElement('div'))
            .attr('id', config.id)
            .addClass('modal fade')
            .attr('tabindex', -1)
            .attr('role', 'dialog')
            .append('<div class="modal-dialog" role="document">'
                + ' <div class="modal-content">'
                + '     <div class="modal-header">'
                + '         <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>'
                + '         <h4 class="modal-title">' + config.title + '</h4>'
                + '     </div>'
                + '     <div class="modal-body">'
                + '     </div>'
                + '     <div class="modal-footer">'
                + '     </div>'
                + ' </div>'
                + '</div>');

        Modal.domr.find('.modal-body').append(content);

        for (var item in buttons) {

            if (buttons[item].attr('fw-action')) {
                buttons[item].on('click', function () {
                    var action = $(this).attr('fw-action');

                    if (Modal.domr.find('form').length) {
                        var module = null;                        
                        var obj = null;

                        var form = FW.getRegisteredComponent('form', Modal.domr.find('form'));

                        if (form) {
                            module = FW.getModule(form.getController());
                            obj = form.getFilledObject();
                        } else {
                            var gridComponent = FW.getRegisteredComponent('grid', Modal.domr.find('div[fw-component="grid"]'));
                            module = FW.getModule(gridComponent.getController());
                            obj = {
                                controller: gridComponent.getController(),
                                list: gridComponent.checkedList
                            };

                            var addComponent = FW.getRegisteredComponent('add', Modal.domr.find('div[fw-component="add"]')); 

                            if (addComponent) {
                                obj['parentController'] = addComponent.parentController;
                                obj['parentId'] = addComponent.parentId;
                            }
                        }

                        if (!module) return;

                        if (module.actions.hasOwnProperty(action) && typeof module.actions[action] == 'function')
                            module.actions[action](obj);
                    }
                });
            }

            Modal.domr.find('.modal-footer').append(buttons[item]);
        }

        $('body').append(Modal.domr);
    }

    function isLoaded() {
        return $('#' + config.id).length > 0;
    }

    Modal.isOpened = function() {
        return $(Modal.domr).css('display') == 'block';
    };

    Modal.open = function( params ) {

        if (!isLoaded())
            Modal.load({                
                done: function() {
                    $(Modal.domr)
                        .off('shown.bs.modal').on('shown.bs.modal', function (evt) {
                            onModalShown(evt);
                        })
                        .off('hidden.bs.modal').on('hidden.bs.modal', function (evt) {                            
                            onModalHidden(evt);                          
                        });

                    onModalReady(params);                    
                }
            });
        else 
            onModalReady(params);                    
    };

    function show() {
        $(Modal.domr).modal('show');   
    }

    function onModalShown(evt) {
        var inputs = $(Modal.domr).find('input, select');
        if (inputs.length > 0)
            inputs[0].focus();
    }

    function onModalHidden(evt) {
        $(Modal.domr).find('form').each(function() {
            var form = FW.getRegisteredComponent('form', $(this));
            if (form)
                form.clean();
        });

        for (var i in FW.registry.modal) {
            if (FW.registry.modal[i].isOpened()) {
                //FW.registry.modal[i].refresh();                                    
            }
        };  
    }

    function onModalReady(params) {

        sendParentModalsToBack();

        appendHiddenParametersOnForms(params);

        if (params.hasOwnProperty('id')) {
            appendIdParameterOnShowComponents(params.id);
            appendIdParameterOnModalButtons(params.id);
        }

        FW.scan($(Modal.domr));
        
        if (hasForm()) {
            if (hasIdHiddenOnForm())
                loadForm();
            else {
                var form = getForm();
                if (form)
                    form.fill(params);
                show();
            }
        } else {
            show();         
        }
    }

    function getForm() {
        return FW.getRegisteredComponent('form', getFormDom());
    }

    function getFormDom() {
        return $(Modal.domr).find('form');
    }

    function hasForm() {
        return getFormDom().length;
    }

    function hasIdHiddenOnForm() {
        return $(Modal.domr).find('[type="hidden"][name="id"]').length;
    }

    function loadForm() {

        var form = FW.getRegisteredComponent('form', getFormDom());

        if (!form) return;

        var callbacks = [];
        callbacks['done'] = function(xhr) {
            form.fill(xhr);
            show();
        };

        form.load($(Modal.domr).find('[type="hidden"][name="id"]').val(), callbacks);    
    }

    function sendParentModalsToBack() {
        for (var i in FW.registry.modal) {
            if (FW.registry.modal[i].isOpened()) {
                var modalReference = FW.registry.modal[i];
                $(modalReference.domr).attr('z-index', $(modalReference.domr).attr('z-index')-10);
            }
        };
    }

    function appendHiddenParametersOnForms(params) {
        $(Modal.domr).find('form').each(function() {
            for (var key in params) {
                var hiddenParam = $(this).find('[type="hidden"][name="'+ key +'"]');
                if (hiddenParam.length)
                    hiddenParam.val(params[key]);
                else 
                    $(this).append('<input type="hidden" name="' + key + '" value="' + params[key] + '" />');
            }
        });
    }

    function appendIdParameterOnShowComponents(id) {
        $(Modal.domr).find('[fw-component="show"]').each(function() {                        
            $(this).attr('fw-id', id);
        });
    }

    function appendIdParameterOnModalButtons(id) {
        $(Modal.domr).find('button[fw-controller]').each(function() {
            var action = $(this).attr('fw-action');
            if (action && action.indexOf('modal'))
                $(this).attr('fw-id', id);
        });
    }

    Modal.close = function() {
        $(Modal.domr).modal('hide');
    };

    Modal.refresh = function() {
        var form = FW.getRegisteredComponent('form', $(Modal.domr).find('form'));
        if (form) form.refresh();
    };

    return init();
};