window.FW = {
    config: {
        url: location.href.split('/public')[0] + '/public'
    },
    modules: [],
    components: [],
    helpers: [],
    registry: {
        button: [],
        combo: [],
        form: [],
        grid: [],
        show: [],
        modal: [],
        upload: []
    },

    actionButtons: {
        storeSave: {
            align: 'right',
            color: 'primary',
            icon: 'save',
            text: 'Salvar',
            attrs: {
                'fw-action': 'store'
            }
        },
        updateSave: {
            align: 'right',
            color: 'primary',
            icon: 'save',
            text: 'Salvar',
            attrs: {
                'fw-action': 'update'
            }            
        }, 
        destroy: {          
            align: 'right',
            color: 'danger',
            icon: 'trash',
            text: 'Deletar',
            attrs: {
                'fw-action': 'destroy'
            }
        }, 
        modalEdit: {        
            align: 'right',
            color: 'default',
            icon: 'pencil',
            text: 'Editar',
            attrs: {                    
                'fw-action': 'modalEdit',
            }            
        }       
    },

    registerComponent: function ( type, component ) {
        if (!FW.getRegisteredComponent(type, component.domr))
            FW.registry[type].push(component);
    },

    getRegisteredComponent: function( type, domr ) {
        for (var component in FW.registry[type]) {
            if (domr && FW.registry[type][component].hasOwnProperty('domr') && FW.registry[type][component].domr[0] === domr[0])
                return FW.registry[type][component];
        }

        return null;
    },

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

    getParams: function(domr) {
        var params = {};
        domr.each(function() {
            $.each(this.attributes, function() {
                if (this.specified && this.name.indexOf('fw-param-') >= 0)
                    params[this.name.substring('fw-param-'.length, this.name.length)] = this.value;                
            });
        });
        return params;
    },

    scan: function(domr) {

        if (!domr)
            domr = $('body');

        domr.find("form").each(function() {
            new FW.components.Form($(this));
        });

        domr.find("select").each(function() {
            new FW.components.Combo($(this));
        });

        domr.find("textarea").each(function() {
            var id = $(this).attr('id');
            for (var instanceId in CKEDITOR.instances) {
                if (id == instanceId)
                    return;
            }
            CKEDITOR.replace(id);
        });

        domr.find("[fw-component='grid']").each(function() {
            new FW.components.Grid($(this));
        });

        domr.find("[fw-component='show']").each(function() {
            new FW.components.Show($(this));
        });

        domr.find("div[fw-component='upload']").each(function() {
            new FW.components.Upload($(this));
        });

        domr.find("button, a").each(function() {
            new FW.components.Button($(this));
        });
    },

    clean: function() {

        FW.registry = {
            button: [],
            combo: [],
            form: [],
            grid: [],
            show: [],
            modal: []
        };

        return FW.registry;
    }
};