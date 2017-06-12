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

    getJWT: function() {
        var tokenEl = $('[fw-jwt]');
        if (tokenEl)
            return tokenEl.attr('fw-jwt');
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

        $("select").each(function() {
            var controller = $(this).attr('fw-controller');
            if (!controller)
                return;

            new FW.components.Combo($(this));
        });

        $("[fw-component='grid']").each(function() {
            new FW.components.Grid($(this));
        });

        $("[fw-component='show']").each(function() {
            new FW.components.Show($(this));
        });

        $("button, a").each(function() {
            $(this).on('click', function() {
                var controller = $(this).attr('fw-controller');
                var action = $(this).attr('fw-action');

                var module = FW.getModule(controller);

                if (controller && action && module.actions.hasOwnProperty(action) && typeof module.actions[action] == 'function')
                    module.actions[action]($(this));
            });
        });
    }
};