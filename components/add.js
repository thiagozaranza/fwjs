FW.components.Add = function(domr, controller) {

    "Use Strict";

    var Add = FW.components.Component('Add', domr, controller);

    Add.list = [];
    Add.name;

    var readOnly = false;
    
    function init(domr, controller) {

        if (Add.domr.attr('fw-read-only') !== undefined)
            readOnly = true;

        render();
        setButtonsListeners();

        Add.name = Add.domr.attr('name');
        
        return Add;
    };

    Add.setValue = function(list) {
        Add.list = list;
        renderList();
        return Add;
    };

    Add.getValue = function() {        
        return Add.list;        
    };

    Add.val = function() {
        var ids = [];
        for (item in Add.list) {
            ids.push(Add.list[item].id);
        }
        return ids.join(',');
    }

    Add.clean = function() {
        Add.list = [];
        renderList();
        return Add;
    }

    Add.refresh = function() {
        ;
    }

    function setButtonsListeners() {
        Add.domr.find('[fw-action="modalAdd"]').on('click', function() {            
            Add.broadcastRegister('add-' + Add.getController(), function(list) {
                for (var item in list) {
                    if (!inList(list[item].id))
                        Add.list.push(list[item]);
                }
                renderList();
            });
        });
    }

    function inList(id) {
        for (var item in Add.list) {
            if (Add.list[item].id == id)
                return true;
        }
        return false;
    }

    function render() {

        Add.domr.find('table').remove();

        var table = $(document.createElement('table'));

        table.addClass('table table-condensed table-hover table-striped table-bordered');
        table.css('margin-bottom', '0px');
        
        table.append(renderTableHead());

        var tbody = $(document.createElement('tbody'));               
        table.append(tbody);
        
        Add.domr.append(table);

        renderList();

        FW.scan(Add.domr);
    }

    function renderTableHead() {

        var tr = $(document.createElement('tr'));

        var thead = $(document.createElement('thead'));

        var th = $(document.createElement('th'));

        var label = $(document.createElement('label'));
        label.addClass('control-label');
        label.text('Nome');

        th.append(label);

        tr.append(th);

        if (!readOnly) {
            var thButtons = $(document.createElement('th'));
            thButtons.append(getAddButton());
            tr.append(thButtons);

            thead.append(tr);
        }

        return thead;
    }

    function getAddButton() {

        return FW.components.ButtonFactory.make({
            color: 'primary',
            size: 'xs',
            align: 'right',
            icon: 'plus',
            text: 'Adicionar',
            controller: Add.getController(),
            action: 'modalAdd',
            attrs: {
                id: 'button-add',
                onclick: 'javascript:;'
            }
        });
    }

    function renderEmptyTr() {

        var tbody = Add.domr.find('tbody');

        tbody.find('tr').remove();

        var tr = $(document.createElement('tr'));

        var td = $(document.createElement('td'));
        td.attr('colspan', 999);
        td.attr('align', 'center');
        td.css('color', 'red');
        td.text('Nenhum registro adicionado');

        tr.append(td);

        tbody.append(tr);        
    }

    function getItem (id) {
        for (item in Add.list) {
            if (Add.list[item].id == id)
                return Add.list[item];
        }
        return null;
    }

    function renderList() {

        if (Add.list.length == 0) {
            renderEmptyTr();
            return;
        }
        
        var tbody = Add.domr.find('tbody');
        
        tbody.find('tr').remove();

        for (var item in Add.list) {
            var tr = $(document.createElement('tr'));
            var td = $(document.createElement('td'));
            td.text(Add.list[item].nome);

            tr.append(td);

            if (!readOnly) {

                var tdOp = $(document.createElement('td'));

                var removeButton = FW.components.ButtonFactory.make({
                    color: 'danger',
                    size: 'xs',
                    align: 'right',
                    icon: 'minus',
                    text: 'Remover',
                    controller: Add.getController(),
                    action: 'remove',
                    attrs: {
                        'fw-id': Add.list[item].id                    
                    }
                });

                tdOp.append(removeButton);

                removeButton.on('click', function() {
                    Add.list.splice(Add.list.indexOf(getItem($(this).attr('fw-id'))), 1);
                    renderList();
                });

                tr.append(tdOp);
            }

            tbody.append(tr);
        }
    }

    return init(domr, controller);
};