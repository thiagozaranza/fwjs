FW.helpers.Rest = (function($, FW) {

    "Use Strict";

    var Rest = Rest || {};

    function init()
    {
        return Rest;
    };

    Rest.getToken = function() {
        return $("input[name='_token']").val();
    };

    Rest.get = function(controller, callbacks, id) {

        var data = [];

        data['jwt'] = FW.getJWT();

        $.ajax({
            url: FW.config.url + '/' + controller + '/' + id,
            method: "GET",
            context: document.body,
            data: data,
            accepts: {
                json: 'application/json'
            },
            dataType: 'json',
            beforeSend: function( xhr ) {
                FW.disableActionButtons();
                if (callbacks && callbacks.hasOwnProperty('beforeSend'))
                    callbacks['beforeSend'](xhr);
            }
        }).done(function(xhr, textStatus) {
            if (callbacks && callbacks.hasOwnProperty('done'))
                callbacks['done'](xhr, textStatus);            

        }).fail(function(xhr, textStatus) {
            if (callbacks && callbacks.hasOwnProperty('done'))
                callbacks['fail'](xhr, textStatus);
            else if (xhr.status > 400) 
                alert('Error (' + xhr.status + '): ' + xhr.statusText + '.');
        }).always(function(xhr) {
            FW.enableActionButtons();
            if (callbacks && callbacks.hasOwnProperty('always'))
                callbacks['always'](xhr);
        });
    };

    Rest.getList = function(controller, callbacks, data) {

        if (!data)
            data = [];

        data['jwt'] = FW.getJWT();

        $.ajax({
            url: FW.config.url + '/' + controller,
            method: "GET",
            context: document.body,
            data: data,
            accepts: {
                json: 'application/json'
            },
            dataType: 'json',
            beforeSend: function( xhr ) {
                FW.disableActionButtons();
                if (callbacks && callbacks.hasOwnProperty('beforeSend'))
                    callbacks['beforeSend'](xhr);
            }
        }).done(function(xhr, textStatus) {
            if (callbacks && callbacks.hasOwnProperty('done'))
                callbacks['done'](xhr, textStatus);
        }).fail(function(xhr, textStatus) {
            if (callbacks && callbacks.hasOwnProperty('fail'))
                callbacks['fail'](xhr, textStatus);
            else if (xhr.status > 400) 
                alert('Error (' + xhr.status + '): ' + xhr.statusText + '.');                
        }).always(function(xhr) {
            FW.enableActionButtons();
            if (callbacks && callbacks.hasOwnProperty('always'))
                callbacks['always'](xhr);
        });
    };

    Rest.store = function(module, obj) {

        if (!obj.hasOwnProperty('_token') && FW.getToken())
            obj['_token'] = FW.getToken();

        $.ajax({
            url: FW.config.url + '/' + module.config.controller,
            method: "POST",
            context: document.body,
            data: obj,
            accepts: {
                json: 'application/json'
            },
            dataType: 'json',
            beforeSend: function() {
                FW.disableActionButtons();
            }
        }).done(function(xhr) {
            if (module.callbacks.hasOwnProperty('storeDone') && typeof module.callbacks['storeDone'] == 'function')
                module.callbacks['storeDone'](xhr);
        }).fail(function(xhr, status) {
            if (module.callbacks.hasOwnProperty('storeFail') && typeof module.callbacks['storeFail'] == 'function')
                module.callbacks['storeFail'](xhr);

            if (status == 401)
                alert('Operação não autorizada! Verifique se seu login expirou.')
            else if (xhr.status > 400)                 
                alert('Error (' + xhr.status + '): ' + xhr.statusText + '.');                

        }).always(function(xhr) {
            FW.enableActionButtons();
            if (module.callbacks.hasOwnProperty('storeAlways') && typeof module.callbacks['storeAlways'] == 'function')
                module.callbacks['storeAlways'](xhr);
        });
    };

    Rest.update = function(module, obj) {

        if (!obj.hasOwnProperty('_token') && FW.getToken())
            obj['_token'] = FW.getToken();

        $.ajax({
            url: FW.config.url + '/' + module.config.controller + '/' + obj.id,
            method: "PUT",
            context: document.body,
            data: obj,
            accepts: {
                json: 'application/json'
            },
            dataType: 'json',
            beforeSend: function() {
                FW.disableActionButtons();
            }
        }).done(function(xhr) {
            if (module.callbacks.hasOwnProperty('updateDone') && typeof module.callbacks['updateDone'] == 'function')
                module.callbacks['updateDone'](xhr);
        }).fail(function(xhr) {
            if (module.callbacks.hasOwnProperty('updateFail') && typeof module.callbacks['updateFail'] == 'function')
                module.callbacks['updateFail'](xhr);
            else if (xhr.status > 400) 
                alert('Error (' + xhr.status + '): ' + xhr.statusText + '.');                
        }).always(function(xhr) {
            FW.enableActionButtons();
            if (module.callbacks.hasOwnProperty('updateAlways') && typeof module.callbacks['updateAlways'] == 'function')
                module.callbacks['updateAlways'](xhr);
        });
    };

    Rest.export = function(module, obj) {

        if (!obj.hasOwnProperty('_token') && FW.getToken())
            obj['_token'] = FW.getToken();

        $.ajax({
            url: FW.config.url + '/' + module.config.controller + '/export',
            method: "POST",
            context: document.body,
            data: obj,
            accepts: {
                json: 'application/json'
            },
            dataType: 'json',
            beforeSend: function() {
                FW.disableActionButtons();
            }
        }).done(function(xhr) {
            if (module.callbacks.hasOwnProperty('exportDone') && typeof module.callbacks['exportDone'] == 'function')
                module.callbacks['exportDone'](xhr);
            else {
                module.cleanForms();
                alert(xhr.message);
            }
        }).fail(function(xhr) {
            if (module.callbacks.hasOwnProperty('exportFail') && typeof module.callbacks['exportFail'] == 'function')
                module.callbacks['exportFail'](xhr);
            else if (xhr.status > 400)
                alert('Error (' + xhr.status + '): ' + xhr.statusText + '.');            
        }).always(function(xhr) {
            FW.enableActionButtons();
            if (module.callbacks.hasOwnProperty('exportAlways') && typeof module.callbacks['exportAlways'] == 'function')
                module.callbacks['exportAlways'](xhr);
        });
    };

    Rest.destroy = function(module, obj) {

        if (confirm('Deseja realmente deletar este registro?')) {

            if (!obj.hasOwnProperty('_token') && FW.getToken())
                obj['_token'] = FW.getToken();

            $.ajax({
                url: FW.config.url + '/' + module.config.controller + '/' + obj.id,
                method: "DELETE",
                data: obj,
                context: document.body,
                accepts: {
                    json: 'application/json'
                },
                dataType: 'json',
                beforeSend: function() {
                    FW.disableActionButtons();
                }
            }).done(function(xhr) {
                if (module.callbacks.hasOwnProperty('destroyDone') && typeof module.callbacks['destroyDone'] == 'function')
                    module.callbacks['destroyDone'](xhr);
            }).fail(function(xhr) {
                if (module.callbacks.hasOwnProperty('destroyFail') && typeof module.callbacks['destroyFail'] == 'function')
                    module.callbacks['destroyFail'](xhr);
                else if (xhr.status > 400) 
                    alert('Error (' + xhr.status + '): ' + xhr.statusText + '.');
            }).always(function(xhr) {
                FW.enableActionButtons();
                if (module.callbacks.hasOwnProperty('destroyAlways') && typeof module.callbacks['destroyAlways'] == 'function')
                    module.callbacks['destroyAlways'](xhr);
            });
        }
    };

    Rest.destroyFile = function(module, params) {

        if (confirm('Deseja realmente deletar este arquivo?')) {

            if (!params.hasOwnProperty('_token') && FW.getToken())
                params['_token'] = FW.getToken();

            $.ajax({
                url: FW.config.url + '/' + module.config.controller + '/deleteFile',
                method: "POST",
                data: params,
                context: document.body,
                accepts: {
                    json: 'application/json'
                },
                dataType: 'json',
                beforeSend: function() {
                    FW.disableActionButtons();
                }
            }).done(function(xhr) {
                if (module.callbacks.hasOwnProperty('destroyDone') && typeof module.callbacks['destroyDone'] == 'function')
                    module.callbacks['destroyDone'](xhr);
            }).fail(function(xhr) {
                if (module.callbacks.hasOwnProperty('destroyFail') && typeof module.callbacks['destroyFail'] == 'function')
                    module.callbacks['destroyFail'](xhr);
                else if (xhr.status > 400) 
                    alert('Error (' + xhr.status + '): ' + xhr.statusText + '.');
            }).always(function(xhr) {
                FW.enableActionButtons();
                if (module.callbacks.hasOwnProperty('destroyAlways') && typeof module.callbacks['destroyAlways'] == 'function')
                    module.callbacks['destroyAlways'](xhr);
            });
        }
    };

    return init();

})($, FW);