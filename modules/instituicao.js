FW.modules.Instituicao = (function($, FW) {

    "Use Strict";

    var Instituicao = Instituicao || {};

    Instituicao.config = {
        controller: 'instituicao',
        name: 'Instituição'
    };

    function init()
    {
        Instituicao = FW.components.Module($, Instituicao);

        return Instituicao;
    };

    return init();

}(jQuery, FW));