FW.components.Module = function($, module) {

    "Use Strict";

    module.components = {
        forms: [],
        grids: [],
        buttons: []
    };

    module.callbacks = {
        storeDone: function(xhr) {
            module.actions.show(xhr.area.id);
        },
        storeFail: function(xhr) {
            alert('Erro ao salvar o registro');
        },
        updateDone: function(xhr) {
            module.actions.show(xhr.area.id);
        },
        updateFail: function(xhr) {
            alert('Erro ao editar o registro');
        },
        destroyDone: function(xhr) {
            module.actions.index();
        },
        destroyFail: function(xhr) {
            alert('Erro ao deletar o registro');
        },
    };

    module.actions = {
        index: function()
        {
            window.location = FW.config.url + '/' + module.config.controller;
        },
        show: function (id) {
            window.location = FW.config.url + '/' + module.config.controller + '/' + id;
        },
        create: function () {
            window.location = FW.config.url + '/' + module.config.controller + '/create';
        },
        store: function (obj) {
            FW.helpers.Rest.store(module, obj);
        },
        edit: function (domr) {
            var id = domr.attr('fw-id');

            if (id)
                window.location = FW.config.url + '/' + module.config.controller + '/' + id + '/edit';
        },
        update: function (obj) {
            FW.helpers.Rest.update(module, obj);
        },
        destroy: function (domr) {
            var id = domr.attr('fw-id');
            var token = FW.getToken();

            if (id && token)
                FW.helpers.Rest.destroy(module, {id: id, _token: token});
        }
    };

    module.on = function (callbackName, callbackFunction) {
        module.callbacks[callbackName] = callbackFunction;
        return module;
    };

    module.setAction = function (actionName, actionFunction) {
        module.actions[actionName] = actionFunction;
        return module;
    };

    module.addForm = function(form) {
        module.components.forms.push(form);
        return module;
    }

    return module;
};