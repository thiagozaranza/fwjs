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

            var select = $(this);

            $.ajax({
                url: FW.config.url + '/' + controller,
                method: "GET",
                context: document.body,
                data: {
                    limit: 999999,
                    orderBy: 'nome'
                },
                accepts: {
                    json: 'application/json'
                },
                dataType: 'json',
                beforeSend: function( xhr ) {
                    select.find('option').remove();
                    select.append('<option>carregando opções...</option>');
                }
            }).done(function(xhr) {

                select.find('option').remove();
                select.append('<option></option>');
                for (var i in xhr.list) {
                    select.append('<option value="'+xhr.list[i].id+'">'+xhr.list[i].nome+'</option>')
                }

            }).fail(function(xhr, textStatus) {
                alert(textStatus);
            });
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