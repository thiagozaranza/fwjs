FW.components.Modal = function(config) {

    "Use Strict";

    var Modal = Modal || {};

    Modal.config = config;
    Modal.formReady = false;

    var content;
    var form;

    function init() {

        Modal = FW.components.Component(Modal);
        
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

    function getButtons() {

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

        return buttons;
    };

    function buildHtml( content ) {

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

        var buttons = getButtons();

        for (var item in buttons) {

            var action = buttons[item].attr('fw-action');

            if (action) {       
                buttons[item].on('click', function () {                    
                    
                    var controller = $(this).attr('fw-controller');
                    var mainComponent = Modal.getMainComponent();

                    if (!controller && mainComponent)
                        controller = mainComponent.getController();

                    if (!controller) return;

                    var module = FW.getModule(controller);

                    if (!module) return;

                    if (module.actions.hasOwnProperty(action) && typeof module.actions[action] == 'function')
                        module.actions[action](mainComponent.getValue());
                });
            }

            Modal.domr.find('.modal-footer').append(buttons[item]);
        }

        $('body').append(Modal.domr);
    }

    function isLoaded() {
        return $('#' + config.id).length > 0;
    }

    Modal.getMainComponent = function() {

        var components = FW.scan($(Modal.domr));

        if (components.hasOwnProperty('grid') && components.grid.length) 
            return components.grid[0];        

        if (components.hasOwnProperty('form') && components.form.length) 
            return components.form[0];

        if (components.hasOwnProperty('show') && components.show.length) 
            return components.show[0];
    }

    Modal.isOpened = function() {
        return $(Modal.domr).css('display') == 'block';
    };

    Modal.open = function( params ) {

        if (!isLoaded())
            Modal.load({                
                done: function() {                    
                    $(Modal.domr)
                        .off('show.bs.modal').on('show.bs.modal', function (evt) {
                            disableActions();
                            FW.modalStack.push(Modal);
                        })
                        .off('hide.bs.modal').on('hide.bs.modal', function (evt) {
                            FW.modalStack.pop();                            
                        })
                        .off('shown.bs.modal').on('shown.bs.modal', function (evt) {
                            onModalShown(evt);
                            enableActions();
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

    function disableActions() {
        Modal.domr.find('button[fw-action]').each(function() {
            $(this).prop('disabled', true);
        });
    }

    function enableActions() {
        var loadingCombos = Modal.domr.find('.btn-loading').length;

        if (loadingCombos) {
            var interval = window.setInterval(function() {
                if (Modal.domr.find('.btn-loading').length == 0) {
                    Modal.domr.find('button[fw-action]').each(function() {
                        $(this).prop('disabled', false);
                    });
                    clearInterval(interval);
                }
            }, 100);
        } else {
            Modal.domr.find('button[fw-action]').each(function() {
                $(this).prop('disabled', false);
            });
        }     
    }

    function show() {
        Modal.formReady = false;
        $(Modal.domr).modal('show');   
    }

    function onModalShown(evt) {        
        var inputs = $(Modal.domr).find('input, select');
        if (inputs.length > 0)
            inputs[0].focus();
    }

    function onModalHidden(evt) {        
        Modal.clean();
    }

    function onModalReady(params) {

        sendParentModalsToBack();

        var components = FW.scan($(Modal.domr));

        Modal.addParams(params, components);
        Modal.refresh(components);
        
        show();
    }

    function sendParentModalsToBack() {
        for (var i in FW.registry.modal) {
            if (FW.registry.modal[i].isOpened()) {
                var modalReference = FW.registry.modal[i];
                $(modalReference.domr).attr('z-index', $(modalReference.domr).attr('z-index')-10);
            }
        };
    }

    Modal.close = function() {
        $(Modal.domr).modal('hide');
    };

    Modal.addParams = function(params, components) {

        if (!components)
            components = FW.scan($(Modal.domr));

        for (var type in components) {
            if (type != 'form' && type != 'show' && type != 'button')
                continue;            
            for (var component in components[type]) {                                
                components[type][component].addParams(params);
            }
        }
    };

    Modal.clean = function(components) {

        if (!components)
            components = FW.scan($(Modal.domr));

        for (var type in components) {
            if (type != 'form' && type != 'show' && type != 'grid' && type != 'add')
                continue;
            for (var component in components[type]) {
                components[type][component].clean();
            }
        }  
    };

    Modal.refresh = function(components) {

        if (!components)
            components = FW.scan($(Modal.domr));

        for (var type in components) {
            if (type != 'form' && type != 'show')
                continue;
            for (var component in components[type]) {
                components[type][component].refresh();
            }
        }  
    };

    return init();
};