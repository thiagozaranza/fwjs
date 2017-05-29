window.FW = {
    config: {
        url: location.href.split('/public')[0] + '/public'
    },
    modules: [],
    components: [],
    helpers: [],

    getModule: function(moduleController) {

        for (var module in FW.modules) {
            if (FW.modules[module].config.controller == moduleController)
                return FW.modules[module];
        }
    },

    getToken: function() {
        var tokenEl = $('[fw-token]');
        if (tokenEl)
            return tokenEl.attr('fw-token');
    },

    scan: function() {

        $("form").each(function() {
            var controller = $(this).attr('fw-controller');
            if (!controller)
                return;

            var module = FW.getModule(controller);

            if (module)
                module.addForm(new FW.components.Form(this));
        });

        $("div[fw-component='grid']").each(function() {
            new FW.components.Grid($(this));
        });

        $("button, a").each(function() {
            $(this).on('click', function() {
                var controller = $(this).attr('fw-controller');
                var action = $(this).attr('fw-action');

                var module = FW.getModule(controller);

                if (controller && action && module.config.controller == controller && module.actions.hasOwnProperty(action) && typeof module.actions[action] == 'function')
                    module.actions[action]($(this));
            });
        });
    }
};