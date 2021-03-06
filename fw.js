window.FW = {
    config: {
        url: location.href.split('/admin')[0] + '/admin'
    },
    modalStack : [],
    modules: {},
    components: [],
    helpers: [],
    registry: {},
    meta: {},

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
        },
        modalAdd: {        
            align: 'right',
            color: 'primary',
            icon: 'plus',
            text: 'Adicionar',
            attrs: {                    
                'fw-action': 'modalAdd',
            }            
        },
        modalFind: {        
            align: 'right',
            color: 'primary',
            icon: 'plus',
            text: 'Selecionar',
            attrs: {                    
                'fw-action': 'modalFind',
            }            
        },
        add: {        
            align: 'right',
            color: 'primary',
            icon: 'plus',
            text: 'Adicionar',
            attrs: {                    
                'fw-action': 'add',
                'data-dismiss': 'modal'
            }            
        }    
    },

    registerComponent: function (type, component) {
        if (!FW.registry.hasOwnProperty(type))
            FW.registry[type] = [];

        if (!FW.getRegisteredComponent(type, component.domr))
            FW.registry[type].push(component);

        return component;
    },

    getRegisteredComponent: function(type, domr) {
        for (var component in FW.registry[type]) {
            if (domr && FW.registry[type][component].hasOwnProperty('domr') && FW.registry[type][component].domr[0] === domr[0])
                return FW.registry[type][component];
        }

        return null;
    },

    getUrlBase: function() {

        var origin = window.location.origin;
        var path = window.location.pathname;

        if (path.indexOf('public') > 0)
            path = path.substring(0, path.indexOf('public') + 6);
        else 
            path = '';

        return origin + path;        
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

    broadcastReceiver: function (title, msg) {
        for (var item in FW.registry) {
            for (var component in FW.registry[item]) {
                if (FW.registry[item][component].waiting(title)) {
                    FW.registry[item][component].execute(msg);
                }
            }
        }
    },

    getComponents: function(domr) {

        var components = {};

        domr.find("form").each(function() {
            var component = FW.getRegisteredComponent('form', $(this));            
            if (component)
                FW.registerComponent('form', new FW.components.Form($(this), $(this).attr('fw-controller') || controller));
            else
                component.refresh();
        });

    },

    scan: function(domr, controller) {

        var components = {};

        if (!domr) {
            domr = $('body');
            var master = domr.find("[fw-controller]");

            if (master.length == 0) return;

            controller = $(domr.find("[fw-controller]")[0]).attr('fw-controller');
        }

        domr.find("[fw-controller]").each(function() {            
            var controller = $(this).attr('fw-controller');
            if (!FW.modules.hasOwnProperty(controller))
                FW.modules[controller] = new FW.components.Module(FW, controller);
        });

        domr.find("button, a").each(function() {
            var component = FW.getRegisteredComponent('button', $(this));
            if (!component)
                component = FW.registerComponent('button', new FW.components.Button($(this), $(this).attr('fw-controller') || controller));

            if (!components.hasOwnProperty('button'))
                components.button = [];

            components.button.push(component);
        });

        domr.find("form").each(function() {
            var component = FW.getRegisteredComponent('form', $(this));

            if (!component)
                component = FW.registerComponent('form', new FW.components.Form($(this), $(this).attr('fw-controller') || controller));

            $(this).find("button, a").each(function() {
                button = FW.getRegisteredComponent('button', $(this));
                button.form = component;
            });

            if (!components.hasOwnProperty('form')) 
                components.form = [];

            components.form.push(component);    
        });

        domr.find("select").each(function() {
            
            if (!$(this).attr('fw-controller'))
                return;

            var component = FW.getRegisteredComponent('combo', $(this));
            if (!component) 
                component = FW.registerComponent('combo', new FW.components.Combo($(this), $(this).attr('fw-controller')));

            if (!components.hasOwnProperty('combo'))
                components.combo = [];

            components.combo.push(component);            
        });

        domr.find("[fw-component='map']").each(function() {
            var component = FW.getRegisteredComponent('map', $(this));
            if (!component) 
                component = FW.registerComponent('map', new FW.components.Map($(this), $(this).attr('fw-controller') || controller));            

            if (!components.hasOwnProperty('map'))
                components.grid = [];

            components.grid.push(component);            
        });

        domr.find("[fw-component='grid']").each(function() {
            var component = FW.getRegisteredComponent('grid', $(this));
            if (!component) 
                component = FW.registerComponent('grid', new FW.components.Grid($(this), $(this).attr('fw-controller') || controller));            

            if (!components.hasOwnProperty('grid'))
                components.grid = [];

            components.grid.push(component);            
        });

        domr.find("[fw-component='show']").each(function() {            
            var component = FW.getRegisteredComponent('show', $(this));
            if (!component) 
                component = FW.registerComponent('show', new FW.components.Show($(this), $(this).attr('fw-controller') || controller));   

            if (!components.hasOwnProperty('show'))
                components.show = [];

            components.show.push(component);            
        });

        domr.find("[fw-component='add']").each(function() {
            var component = FW.getRegisteredComponent('add', $(this));
            if (!component) 
                component = FW.registerComponent('add', new FW.components.Add($(this), $(this).attr('fw-controller') || controller));

            if (!components.hasOwnProperty('add'))
                components.add = [];

            components.add.push(component);              
        });

        domr.find("div[fw-component='upload']").each(function() {
            var component = FW.getRegisteredComponent('upload', $(this));
            if (!component)
                component = FW.registerComponent('upload', new FW.components.Upload($(this), $(this).attr('fw-controller') || controller));

            if (!components.hasOwnProperty('upload'))
                components.upload = [];

            components.upload.push(component);         
        });

        domr.find("textarea").each(function() {
            var id = $(this).attr('id');
            for (var instanceId in CKEDITOR.instances) {
                if (id == instanceId)
                    return;
            }
            CKEDITOR.replace(id);
        });

        return components;
    },

    disableActionButtons: function() {
        $('button[fw-action]').each(function() {
            $(this).prop('disabled', true);
        });
    },

    enableActionButtons: function() {
        $('button[fw-action]').each(function() {
            $(this).prop('disabled', false);
        });
    },

    clean: function() {

        FW.registry = {};

        return FW.registry;
    }
};