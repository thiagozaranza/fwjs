FW.components.Button = function(domr) {

    "Use Strict";

    var Button = Button || {};

    Button.id = null;

    function init(domr) {

        Button = FW.components.Component(Button, domr);

        if (FW.getRegisteredComponent('button', Button.domr))
            return;

        Button.id = Button.domr.attr('id');
        Button.action = Button.domr.attr('fw-action');
        
        Button.domr.on('click', function ()
        {
            if (Button.getModule() && Button.getController() && Button.action && Button.getModule().actions.hasOwnProperty(Button.action) && typeof Button.getModule().actions[Button.action] == 'function') {

                var obj = {};

                Button.domr.each(function() {
                    $.each(this.attributes, function() {
                        if(this.specified) {
                            if (this.name == 'fw-id')
                                obj['id'] = this.value;
                            else if (this.name.indexOf('fw-param-') >= 0)
                                obj[this.name.substring('fw-param-'.length, this.name.length)] = this.value;
                        }
                    });
                });
                
                Button.getModule().actions[Button.action](obj);
            }
        });
    
        FW.registerComponent('button', Button);

        return Button;
    };

    return init(domr);
};

FW.components.ButtonFactory = (function($, FW) {

    "Use Strict";

    var ButtonFactory = ButtonFactory || {};

    function init() {
        return ButtonFactory;
    };

    ButtonFactory.make = function ( config ){

        if (!config) return;

        var button = $(document.createElement('button'));

        button.addClass('btn');

        if ((config.hasOwnProperty('color') &&  config.color))
            button.addClass('btn-' + config.color);
        else
            button.addClass('btn-default');

        if (config.hasOwnProperty('size'))
            button.addClass('btn-' + config.size);

        if (config.hasOwnProperty('align') && config.align == 'right') {
            button.addClass('pull-right');
            button.css('margin-left', '15px');
        } else {
            button.addClass('pull-left');
            button.css('margin-right', '15px');
        }

        if (config.hasOwnProperty('attrs')) {
            for (var key in config.attrs) {
                button.attr(key, config.attrs[key]);
            }
        }

        if (config.hasOwnProperty('icon')) {
            var icon = $(document.createElement('span'));
            icon.css('margin-right', '5px');
            icon.addClass('glyphicon');
            icon.addClass('glyphicon-' + config.icon);
            icon.attr('aria-hidden', 'true');

            button.append(icon);
        }

        if (config.hasOwnProperty('controller')) 
            button.attr('fw-controller', config.controller);
        
        if (config.hasOwnProperty('action')) 
            button.attr('fw-action', config.action);

        if (config.hasOwnProperty('text')) 
            button.append(config.text);        

        return button;
    };

    return init();

})($, FW);