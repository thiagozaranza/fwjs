FW.modules.TipoProdutoApoio = (function($, FW) {

    "Use Strict";

    var TipoProdutoApoio = TipoProdutoApoio || {};

    TipoProdutoApoio.config = {
        controller: 'tipo-produto-apoio',
        name: "Tipo de Produto de Apoio"
    };

    function init()
    {
        TipoProdutoApoio = FW.components.Module($, TipoProdutoApoio);

        return TipoProdutoApoio;
    };

    return init();

}(jQuery, FW));