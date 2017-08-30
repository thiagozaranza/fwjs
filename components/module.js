FW.components.Module = function(FW, controller) {

    "Use Strict";

    var module = {};

    module.config = {
        controller: controller,
        name: controller
    };

    module.parsers = {};

    module.operations = {};

    module.callbacks = {
        storeDone: function(xhr) {
            if(module.modalCreate)
                module.modalCreate.close();

            var hasModuleGrid = false;
            var moduleController = module.getController();

            $('[fw-component="grid"]').each(function() {
                var grid = FW.getRegisteredComponent('grid', $(this));                
                if (grid && grid.getController() == moduleController) {
                    hasModuleGrid = true;
                    grid.refresh();
                }
            });

            if (!hasModuleGrid)    
                module.actions.show(xhr.model);   
        },
        storeFail: function(xhr) {
            alert('Erro ao salvar o registro');
        },
        updateDone: function(xhr) {

            if(module.modalEdit)
                module.modalEdit.close();

            var hasModuleGrid = false;
            var moduleController = module.getController();

            $('[fw-component="grid"]').each(function() {
                var grid = FW.getRegisteredComponent('grid', $(this));                
                if (grid && grid.getController() == moduleController) {
                    hasModuleGrid = true;
                    grid.refresh();
                }
            });

            if (!hasModuleGrid)    
                module.actions.show(xhr.model);

            if (FW.modalStack.length)
                FW.modalStack[FW.modalStack.length - 1].refresh();            
        },
        updateFail: function(xhr) {
            alert('Erro ao editar o registro');
        },
        destroyDone: function(xhr) {  

            if(module.modalEdit)
                module.modalEdit.close();

            if(module.modalShow)
                module.modalShow.close();

            $('[fw-component="grid"]').each(function() {
                var grid = FW.getRegisteredComponent('grid', $(this));
                if (grid.getController() == module.getController())
                    grid.refresh();
            });        
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
        create: function () {
            window.location = FW.config.url + '/' + module.config.controller + '/create';
        },
        show: function (obj) {
            window.location = FW.config.url + '/' + module.config.controller + '/' + obj.id;
        },
        edit: function (obj) {
            window.location = FW.config.url + '/' + module.config.controller + '/' + obj.id + '/edit';
        },
        store: function (obj) {
            FW.helpers.Rest.store(module, obj);
        },
        update: function (obj) {
            FW.helpers.Rest.update(module, obj);
        },
        destroy: function (obj) {
            FW.helpers.Rest.destroy(module, obj);
        },
        add: function (obj) {
            FW.broadcast('add-' + obj.controller, obj.list);
        },
        modalCreate: function(obj) {
            if (!module.modalCreate) {
                module.modalCreate = new FW.components.Modal({
                    id: 'modal-create-' + module.config.controller,
                    title: 'Cadastrar ' + module.config.name,
                    url: module.config.controller + '/modal/create-form',
                    actionButtons: [ 'storeSave' ]
                });
            }
            module.modalCreate.open(obj);
        },        
        modalEdit: function(obj) {
            if (!module.modalEdit) {
                module.modalEdit = new FW.components.Modal({
                    id: 'modal-edit-' + module.config.controller,
                    title: 'Editar ' + module.config.name,
                    url: module.config.controller + '/modal/edit-form',
                    actionButtons: [ "updateSave"]
                });
            }
            module.modalEdit.open(obj);
        },
        modalShow: function(obj) {
            if (!module.modalShow) {
                module.modalShow = new FW.components.Modal({
                    id: 'modal-show-' + module.config.controller,
                    title: 'Visualizar ' + module.config.name,
                    url: module.config.controller + '/modal/show',
                    actionButtons: [ 'modalEdit', 'destroy' ]
                });
            }
            module.modalShow.open(obj);
        },
        modalAdd: function(obj) {
            if (!module.modalAdd) {
                module.modalAdd = new FW.components.Modal({
                    id: 'modal-add-' + module.getController(),
                    title: 'Visualizar ' + module.config.name,
                    url: module.config.controller + '/modal/add',
                    actionButtons: [ 'add' ]
                });
            }
            module.modalAdd.open(obj);
        }
    };

    module.getController = function() {
        return module.config.controller;
    }

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
    };

    return module;
};