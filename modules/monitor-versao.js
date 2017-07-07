FW.modules.MonitorVersao = (function($, FW) {

    "Use Strict";

    var MonitorVersao = MonitorVersao || {};

    MonitorVersao.config = {
        controller: 'monitor-versao',
        name: "Versão do Monitor"
    };

    function init()
    {
        MonitorVersao = FW.components.Module($, MonitorVersao);

        MonitorVersao.parsers.modalShow = function(fullObj, obj) {
            if (!obj)
                return '';

            var link = $(document.createElement('a'));
            link.attr('href', 'javascript:;');
            link.html(obj);
            link.attr('fw-action', 'modalShow');
            link.attr('fw-id', fullObj.id);

            return link;
        };

        return MonitorVersao;
    };

    return init();

}($, FW));