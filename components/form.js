FW.components.Form = function(domr) {

    "Use Strict";

    var Form = Form || {};

    Form.domr = $(domr);

    function init()
    {
        $(document).ready(function($) {
            scan();
        });

        return Form;
    };

    var module = FW.getModule(Form.domr.attr('fw-controller'));

    function getFilledObject() {

        var inputs = [];

        Form.domr.find('input').each(function() {
            inputs.push(this);
        });

        Form.domr.find('select').each(function() {
            inputs.push(this);
        });

        Form.domr.find('textarea').each(function() {
            inputs.push(this);
        });

        var obj = {};

        for (i in inputs) {
            obj[inputs[i].name] = $(inputs[i]).val();
        }

        return obj;
    }

    function scan() {

        Form.domr.find("button[fw-action='store']").on('click', function() {
            module.actions.store(getFilledObject());
        });

        Form.domr.find("button[fw-action='update']").on('click', function() {
            module.actions.update(getFilledObject());
        });
    };

    return init();
};