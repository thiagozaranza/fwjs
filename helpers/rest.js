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

    Rest.store = function(module, obj) {

        $.ajax({
            url: FW.config.url + '/' + module.config.controller,
            method: "POST",
            context: document.body,
            data: obj,
            accepts: {
                json: 'application/json'
            },
            dataType: 'json'
        }).done(function(xhr) {
            if (module.callbacks.hasOwnProperty('storeDone') && typeof module.callbacks['storeDone'] == 'function')
                module.callbacks['storeDone'](xhr);
        }).fail(function(xhr) {
            if (module.callbacks.hasOwnProperty('storeFail') && typeof module.callbacks['storeFail'] == 'function')
                module.callbacks['storeFail'](xhr);
        }).always(function(xhr) {
            if (module.callbacks.hasOwnProperty('storeAlways') && typeof module.callbacks['storeAlways'] == 'function')
                module.callbacks['storeAlways'](xhr);
        });
    };

    Rest.update = function(module, obj) {

        $.ajax({
            url: FW.config.url + '/' + module.config.controller + '/' + obj.id,
            method: "PUT",
            context: document.body,
            data: obj,
            accepts: {
                json: 'application/json'
            },
            dataType: 'json'
        }).done(function(xhr) {
            if (module.callbacks.hasOwnProperty('updateDone') && typeof module.callbacks['updateDone'] == 'function')
                module.callbacks['updateDone'](xhr);
        }).fail(function(xhr) {
            if (module.callbacks.hasOwnProperty('updateFail') && typeof module.callbacks['updateFail'] == 'function')
                module.callbacks['updateFail'](xhr);
        }).always(function(xhr) {
            if (module.callbacks.hasOwnProperty('updateAlways') && typeof module.callbacks['updateAlways'] == 'function')
                module.callbacks['updateAlways'](xhr);
        });
    };

    Rest.destroy = function(module, obj) {

        if (confirm('Deseja realmente deletar este registro?')) {

            $.ajax({
                url: FW.config.url + '/' + module.config.controller + '/' + obj.id,
                method: "DELETE",
                data: {
                    _token: obj._token
                },
                context: document.body,
                accepts: {
                    json: 'application/json'
                },
                dataType: 'json'
            }).done(function(xhr) {
                if (module.callbacks.hasOwnProperty('destroyDone') && typeof module.callbacks['destroyDone'] == 'function')
                    module.callbacks['destroyDone'](xhr);
            }).fail(function(xhr) {
                if (module.callbacks.hasOwnProperty('destroyFail') && typeof module.callbacks['destroyFail'] == 'function')
                    module.callbacks['destroyFail'](xhr);
            }).always(function(xhr) {
                if (module.callbacks.hasOwnProperty('destroyAlways') && typeof module.callbacks['destroyAlways'] == 'function')
                    module.callbacks['destroyAlways'](xhr);
            });
        }
    };

    return init();

})($, FW);