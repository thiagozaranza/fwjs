FW.components.Modal = function(config) {

    "Use Strict";

    var Modal = Modal || {};

    Modal.config = config;

    var content;

    function init() {

        Modal = FW.components.Component(Modal);

        var modalRegistered = FW.getRegisteredComponent('modal', Modal.domr);
        
        if (modalRegistered) return modalRegistered;
        
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
                        var form = FW.getRegisteredComponent('form', Modal.domr.find('form'));
                        if (!form) return;
                        var module = FW.getModule(form.getController());
                        if (!module) return;

                        if (module.actions.hasOwnProperty(action) && typeof module.actions[action] == 'function')
                            module.actions[action](form.getFilledObject());
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

        var modalReference = FW.registry.modal[i];

        if (!isLoaded())
            Modal.load({
                beforeSend: function() {
                    for (var i in FW.registry.modal) {
                        if (FW.registry.modal[i].isOpened()) {
                            modalReference = FW.registry.modal[i];
                            $(modalReference.domr).attr('z-index', $(modalReference.domr).attr('z-index')-10);
                        }
                    };
                },
                done: function() {
                    $(Modal.domr).find('form').each(function() {
                        for (var key in params) {
                            $(this).append('<input type="hidden" name="' + key + '" value="' + params[key] + '" />');
                        }
                    });

                    $(Modal.domr).find('[fw-component="show"]').each(function() {
                        if (params.hasOwnProperty('id'))
                            $(this).attr('fw-id', params.id);
                    });

                    $(Modal.domr).find('button[fw-controller]').each(function() {
                        var action = $(this).attr('fw-action');
                        if (params.hasOwnProperty('id') && (action && action.indexOf('modal')))
                            $(this).attr('fw-id', params.id);
                    });

                    $(Modal.domr)
                        .off('shown.bs.modal')                                                
                        .on('shown.bs.modal', function (e) {
                            var inputs = $(this).find('input, select');
                            if (inputs.length > 0)
                                inputs[0].focus();
                        })
                        .off('hidden.bs.modal')
                        .on('hidden.bs.modal', function (e) {                            
                            $(Modal.domr).find('form').each(function() {
                                var form = FW.getRegisteredComponent('form', $(this));
                                if (form) ;
                                    form.clean();
                            });

                            for (var i in FW.registry.modal) {
                                if (FW.registry.modal[i].isOpened()) {
                                    FW.registry.modal[i].refresh();                                    
                                }
                            };                            
                        });

                    FW.scan($(Modal.domr));

                    if ($(Modal.domr).find('[type="hidden"][name="id"]').length) {
                        var formDOM = $(Modal.domr).find('form');
                        if (formDOM.length) {
                            var form = FW.getRegisteredComponent('form', formDOM);
                            if (!form) return;
                            var callbacks = [];
                            callbacks['done'] = function(xhr) {
                                form.fill(xhr);
                                $(Modal.domr).modal('show');
                            };
                            form.load($(Modal.domr).find('[type="hidden"][name="id"]').val(), callbacks);
                        }
                    } else {
                        $(Modal.domr).modal('show');
                    }
                }
            });
        else {
            for (var i in FW.registry.modal) {
                if (FW.registry.modal[i].isOpened())
                    modalReference = FW.registry.modal[i];
            };

            $(Modal.domr).find('button[fw-controller]').each(function() {
                var action = $(this).attr('fw-action');
                if (params.hasOwnProperty('id') && (action && action.indexOf('modal')))
                    $(this).attr('fw-id', params.id);
            });

            $(Modal.domr).find('[fw-component="show"]').each(function() {
                if (params.hasOwnProperty('id'))
                    $(this).attr('fw-id', params.id);
                FW.scan($(Modal.domr));
            });

            for (var key in params) {
                $(Modal.domr).find('[name="' + key + '"]').val(params[key]);
            }

            if ($(Modal.domr).find('[type="hidden"][name="id"]').length) {
                var formDOM = $(Modal.domr).find('form');
                if (formDOM.length) {
                    var form = FW.getRegisteredComponent('form', formDOM);
                    var callbacks = [];
                    callbacks['done'] = function(xhr) {
                        form.fill(xhr);
                        $(Modal.domr).modal('show');
                    };
                    form.load($(Modal.domr).find('[type="hidden"][name="id"]').val(), callbacks);
                }
            } else {
                $(Modal.domr).modal('show');
            }
        }
    };

    Modal.close = function() {
        $(Modal.domr).modal('hide');
    };

    Modal.refresh = function() {
        var form = FW.getRegisteredComponent('form', $(Modal.domr).find('form'));
        if (form) form.refresh();
    };

    return init();
};