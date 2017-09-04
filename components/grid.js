FW.components.Grid = function(domr, controller) {

    "Use Strict";

    var Grid = FW.components.Component('Grid', domr, controller);

    Grid.pageResponse;
    Grid.checkedList = [];
    
    Grid.defaultOperations = {
        'edit': {
            'text': 'Editar',
            'icon': 'pencil',
            'class': 'default'
        },
        'modalEdit': {
            'text': 'Editar',
            'icon': 'pencil',
            'class': 'default'
        },
        'destroy': {
            'text': 'Deletar',
            'icon': 'trash',
            'class': 'danger'
        }
    };

    function init(domr, controller) {

        Grid.table = Grid.domr.find('table');

        $(document).ready(function() {
            scan();
            Grid.paginate(1);
        });

        return Grid;
    };

    function getPage() {
        $page = Grid.domr.find('.pagination li.active a');
        return ($page.length)? $page.text() : 1;
    };

    function getLimit() {
        $limit = Grid.domr.find('.grid-limit');
        return ($limit.length)? $limit.val() : 10;
    };

    function getOrder() {
        $order = Grid.table.find("th[fw-order]");
        if ($order.length) {
            var way = $order.attr('fw-order');
            var colName = $order.attr('fw-col-name');
            if (colName.indexOf('-') > 0)
                colName = colName.split('-')[0] + '_id';
            return colName + ',' + way;
        }
    };

    Grid.clean = function() {
        Grid.checkedList = [];
        Grid.domr.find("input[type='checkbox']").each(function() {
            $(this).prop("checked", false); 
        });
    };

    Grid.refresh = function() {
        Grid.paginate(getPage());
    };

    Grid.getValue = function() {
        return {
            controller: Grid.getController(),
            list: Grid.checkedList
        }
    };

    function getWithList() {

        var withList = [];

        var columns = getColumns();

        for (var item in columns) {

            if (!columns[item].name)
                continue;

            var withParts = columns[item].name.split('-');

            if (withParts.length == 2)
                withList.push(withParts[0]);
            else if (withParts.length == 3)
                withList.push(withParts[0] + '-' + withParts[1]);
            else if (withParts.length == 4)
                withList.push(withParts[0] + '-' + withParts[1] + '-' + withParts[2]);
            else if (withParts.length == 5)
                withList.push(withParts[0] + '-' + withParts[1] + '-' + withParts[2] + '-' + withParts[3]);
            else if (withParts.length == 6)
                withList.push(withParts[0] + '-' + withParts[1] + '-' + withParts[2] + '-' + withParts[3] + '-' + withParts[4]);
        }

        return withList.join(',');
    }

    Grid.download = function() {
        var data = {};
               
        data['jwt'] = FW.getJWT();
        data['with'] = getWithList();
        data['orderBy'] = getOrder(); 
        data['download'] = true;
        
        $.extend(data, getFilters());

        var callbacks = {            
            'done': function(xhr) {
                if (xhr.hasOwnProperty('message'))
                    alert(xhr.message);
            },
            'fail': function(xhr, textStatus) {
                if (xhr.hasOwnProperty('message'))
                    alert(xhr.message);
            }            
        };

        request(data, 'text/csv', callbacks);
    }

    Grid.paginate = function (page) {

        var data = {};
        
        data['page'] = page;
        data['orderBy'] = getOrder();
        data['limit'] = getLimit();
        data['jwt'] = FW.getJWT();
        data['with'] = getWithList();
        
        $.extend(data, getFilters());

        var callbacks = {
            'before': function() {
                beforeSend();
            },
            'done': function(xhr) {

                Grid.pageResponse = xhr;

                if (Grid.getModule() && Grid.getModule().callbacks.hasOwnProperty('paginateDone') && typeof Grid.getModule().callbacks['paginateDone'] == 'function')
                    Grid.getModule().callbacks['paginateDone'](xhr);

                if (xhr.hasOwnProperty('list'))
                    renderTable(xhr.list);

                if (xhr.hasOwnProperty('paginator'))
                    renderPaginator(xhr.paginator);
            },
            'fail': function(xhr, textStatus) {
                if (Grid.getModule().callbacks.hasOwnProperty('paginateFail') && typeof Grid.getModule().callbacks['paginateFail'] == 'function')
                    Grid.getModule().callbacks['paginateFail'](xhr);
                else if (xhr.status == 401)
                    alert('Operação não autorizada! Verifique se seu login expirou.');
                else if (xhr.hasOwnProperty('responseJSON') && xhr.responseJSON.hasOwnProperty('message'))
                    alert(xhr.responseJSON.message);
                else 
                    alert(textStatus);
            },
            'always': function(xhr) {
                if (Grid.getModule() && Grid.getModule().callbacks.hasOwnProperty('paginateAlways') && typeof Grid.getModule().callbacks['paginateAlways'] == 'function')
                    Grid.getModule().callbacks['paginateAlways'](xhr);
                else
                    paginateDone();
            }
        };

        request(data, 'application/json', callbacks);
    };

    function request (data, accept, callbacks) {

        var url = (Grid.domr.attr('fw-url'))? Grid.domr.attr('fw-url') : FW.config.url;

        $.ajax({
            url: url + '/' + Grid.getController(),
            method: "GET",
            context: document.body,
            data: data,
            accepts: {
                json: accept
            },
            dataType: 'json',
            beforeSend: function(xhr) {
                if (callbacks.hasOwnProperty('before'))
                    callbacks['before']();
            }
        }).done(function(xhr) {            
            if (callbacks.hasOwnProperty('done'))
                callbacks['done'](xhr);
        }).fail(function(xhr, textStatus) {
            if (callbacks.hasOwnProperty('fail'))
                callbacks['fail'](xhr, textStatus);
        }).always(function(xhr) {
            if (callbacks.hasOwnProperty('always'))
                callbacks['always'](xhr);
        });
    }

    function beforeSend () {
        Grid.table.find('tr').css('opacity', 0.3);
    };

    function paginateDone () {
        Grid.table.find('tr').css('opacity', 1);
    };

    function getFilters() {

        var filters = {};

        var form = Grid.domr.find('form');

        if (form.length) {
            var fields = form.serializeArray();
            for (var item in fields) {

                var name = fields[item].name;
                var nameParts = fields[item].name.split('-');
                
                if (nameParts.length == 1) {
                    var field = form.find('[name="'+fields[item].name+'"]')[0];
                    if (field.localName == 'input' && field.type == 'text')
                        op = 'LK';
                    else 
                        op = 'EQ';
                } else {
                    op = nameParts[nameParts.length-1];
                    if (['EQ', 'NEQ', 'LK', 'GT', 'GTE', 'LT', 'LTE'].indexOf(op) !== -1) {
                        nameParts.pop()
                        name = nameParts.join('-');                        ;
                    } else {
                        name = nameParts.join('-');
                        op = 'EQ';
                    }                    
                } 

                if (fields[item].value && fields[item].value != 'Carregando opções...')
                    filters[name + '-' + op] = fields[item].value;
            }
        }

        Grid.domr.each(function() {
            $.each(this.attributes, function() {
                if(this.specified) {
                    if (this.name == 'fw-id')
                        filters['id.EQ'] = this.value;
                    else if (this.name.indexOf('fw-param-') >= 0)
                        filters[this.name.substring('fw-param-'.length, this.name.length) + '.EQ'] = this.value;
                }
            });
        });

        return filters;
    };

    function getColumns() {

        var columns = [];

        Grid.table.find('thead').find('th').each(function() {
            columns.push({
                name: $(this).attr('fw-col-name'),
                parse: $(this).attr('fw-parse'),
                widget: $(this).attr('fw-widget'),
                buttons: $(this).attr('fw-col-buttons')                
            });
        });

        return columns;
    };

    function getOperations() {

        var thOp = Grid.table.find('th[fw-col-buttons]');

        var operationsDef = thOp.attr('fw-col-buttons');

        if (!operationsDef)
            return;

        operationsParts = operationsDef.split(' ');
        operationsParts.reverse();

        var buttons = [];

        for (var item in operationsParts) {
            var op = operationsParts[item];
            var opParts = op.split('_');

            var opName  = '';
            var opClass = 'default';
            var opIcon  = null;
            var opText  = '';

            if (opParts.length > 0)
                opName  = opParts[0];

            if (Grid.defaultOperations.hasOwnProperty(opName)) {
                opClass = Grid.defaultOperations[opName].class;
                opIcon = Grid.defaultOperations[opName].icon;
                opText = Grid.defaultOperations[opName].text;
            } else if (Grid.getModule().operations.hasOwnProperty(opName)) {
                opClass = Grid.getModule().operations[opName].class;
                opIcon = Grid.getModule().operations[opName].icon;
                opText = Grid.getModule().operations[opName].text;
            } else {
                if (opParts.length > 1)
                    opClass = opParts[1];
                if (opParts.length > 2)
                    opIcon  = opParts[2];
                if (opParts.length > 3)
                    opText = opParts[3];
            }

            if (!opName)
                return;

            var button = $(document.createElement('button'));
            button.addClass('btn btn-' + opClass + ' btn-xs pull-right');
            button.attr('fw-action', opName);
            button.css('margin-left', '10px');
            button.html(opText);

            if (opIcon) {
                var icon = $(document.createElement('span'));
                icon.addClass('glyphicon');
                icon.addClass('glyphicon-' + opIcon);
                icon.attr('aria-hidden', "true");
                if (opText)
                    icon.css('margin-right', '5px');
                button.prepend(icon);
            }

            buttons.push(button);
        }

        return buttons;
    };

    function renderTh() {

        Grid.table.find('th').each(function() {

            var widget = $(this).attr("fw-widget");

            if (widget && widget == 'check') {                
                $(this).html('<input type="checkbox" fw-id="all">');
            } else {

                var text = $(this).html();

                $(this).html('<a class="ordenable" href="javascript:;">' + text + '</a>');
                $(this).find('a').on('click', function() {

                    var tr = $(this).parent();
                    var way = tr.attr('fw-order');

                    if (!way || way=='DESC')
                        way = 'ASC';
                    else
                        way = 'DESC';

                    Grid.table.find('th[fw-order]').each(function() {
                        if ($(this) !== tr)
                            $(this).removeAttr('fw-order');
                    });

                    Grid.table.find('.caret').each(function() {
                        $(this).remove();
                    });

                    tr.attr('fw-order', way);

                    if (way == 'DESC')
                        $(this).addClass('dropup');
                    else
                        $(this).removeClass('dropup');

                    $(this).append('<span class="caret"></span>');

                    Grid.refresh();
                });
            }
        });
    };

    function renderTable( list ) {

        if (!Grid.table.find('tbody').length)
            Grid.table.append($(document.createElement('tbody')));

        Grid.table.css('margin-bottom', '5px');
        Grid.table.addClass('table-condensed table-bordered table-hover table-striped');

        var body = Grid.table.find('tbody');

        body.find('tr').remove();

        var columns = getColumns();

        var operations = getOperations();

        if (list.length == 0) {
            var tr = $(document.createElement('tr'));
            var td = $(document.createElement('td')).attr('colspan', 99).css('color', 'red').css('text-align', 'center').text('Nenhum registro encontrado.');
            body.append(tr.append(td));
        }

        for (item in list) {

            var tr = $(document.createElement('tr'));

            for (var col in columns) {
                if (columns[col].name)
                    tr.append($(document.createElement('td')).append(                    
                        FW.helpers.Parser.parse(Grid.getModule(), columns[col].parse, list[item], columns[col].name)
                    ));

                if (columns[col].widget == 'check') {
                    var checkbox = $(document.createElement('input'))
                        .attr('type', "checkbox")
                        .attr('fw-id', list[item].id);
                    
                    if (Grid.checkedList.indexOf(list[item].id+"") != -1)
                        checkbox.prop("checked", true);

                    tr.append($(document.createElement('td'))
                        .append(checkbox));                
                }
            }

            var tdOperations = $(document.createElement('td'));

            for (var op in operations) {
                var op = operations[op];
                var id = null;
                if (list[item].hasOwnProperty('id'))
                    id = list[item].id;
                else if (list[item].hasOwnProperty('codigo'))
                    id = list[item].codigo;

                op.attr('fw-id', id);
                
                tdOperations.append(op);
            }            
            
            if (operations && operations.length > 0)
                tr.append(tdOperations.clone());

            body.append(tr);
        };

        Grid.table.find('button, a').on('click', function() {
            var action = $(this).attr('fw-action');
            var module = FW.getModule(Grid.getController());

            if (module && module.actions.hasOwnProperty(action) && typeof module.actions[action] == 'function') {
                module.actions[action]({ id: $(this).attr('fw-id') });
            }
        });

        renderTh();

        Grid.domr.find("input[type='checkbox']").each(function() {
            $(this).on('change', function( event ) {
                event.preventDefault(); 

                var id = $(this).attr('fw-id');   

                $(this).attr("checked", this.checked); 

                if(this.checked)
                    addToCheckedList(id);
                else 
                    removeFromCheckedList(id);
            });
        });
    };

    function getPageItem (id) {
        for (item in Grid.pageResponse.list) {
            if (Grid.pageResponse.list[item].id == id)
                return Grid.pageResponse.list[item];
        }
        return null;
    }

    function addToCheckedList(id) {
        
        if (id == 'all')
            Grid.domr.find("input[type='checkbox']").each(function() {
                var id = $(this).attr('fw-id');
                if (id != 'all') {
                    $(this).prop("checked", true);                      
                    addToCheckedList(id);
                }
            });
        else if (!inCheckedList(id)) {
            Grid.checkedList.push(getPageItem(id));
            checkAllTest();
        }

    }    

    function removeFromCheckedList(id) {
        
        if (id == 'all')
            Grid.domr.find("input[type='checkbox']").each(function() {
                var id = $(this).attr('fw-id');
                if (id != 'all') {
                    $(this).prop("checked", false); 
                    removeFromCheckedList(id);  
                }
            });
        else if (inCheckedList(id)) {
            Grid.checkedList.splice(Grid.checkedList.indexOf(getPageItem(id)), 1);   
            checkAllTest();
        }        
    }

    function checkAllTest() {
        
        var allChecked = true;        

        $('tbody').find('[type="checkbox"]').each(function() {
            if (!$(this).prop('checked')) {
                allChecked = false;
                return;                
            }
        });

        $('thead').find('[type="checkbox"]').prop('checked', allChecked);
    }       

    function inCheckedList(id) {
        for (item in Grid.checkedList) {
            if (Grid.checkedList[item].id == id)
                return true;
        }   
        return false;
    }

    function renderPaginator( paginator ) {

        Grid.domr.find('.paginator').remove();

        if (!paginator.total)
            return;

        Grid.table.parent().append(
              '<div class="row paginator">'
            + '     <div class="col-xs-2 col-sm-2 col-md-2 col-lg-1 paginator-info" style="margin-top: 15px; padding-right: 0px"></div>'
            + '     <div class="col-xs-8 col-sm-8 col-md-8 col-lg-10" style="" >'
            + '         <div class="text-center"><nav><ul class="pagination"></ul></nav></div>'
            + '     </div>'
            + '     <div class="col-xs-2 col-sm-2 col-md-2 col-lg-1 paginator-options" style="padding-left: 0px">'
            + '         <div class="form-group">'
            + '             <label>Limite:</label>'
            + '             <select class="form-control grid-limit" style="width: 75px;">'
            + '                 <option></option>'
            + '                 <option>5</option>'
            + '                 <option>10</option>'
            + '                 <option>20</option>'
            + '                 <option>50</option>'
            + '                 <option>100</option>'
            + '             </select>'
            + '         </div>'
            + '     </div>'            
            + '</div>');

        Grid.domr.find('.grid-limit').val(paginator.limit).on('change', function() {
            Grid.paginate(1);
        });

        var final = (paginator.offset + paginator.limit);
        if (final > paginator.total)
            final = paginator.total;

        Grid.domr.find('.paginator-info').html('<small>'+ (paginator.offset+1) + ' a ' + final + ' de ' + paginator.total + '</small>');

        var pagination = Grid.domr.find('.pagination');

        var limit_viewd_pages = 15;
        var half_limit_viewd_pages = (limit_viewd_pages-1)/2;

        var start = 1;
        var finish = paginator.page.total;

        if (finish > limit_viewd_pages) {
            if (paginator.page.current > half_limit_viewd_pages) {
                start = paginator.page.current - half_limit_viewd_pages;
                finish = paginator.page.current + half_limit_viewd_pages;
                if (finish > paginator.page.total) {
                    finish = paginator.page.total;
                    if (finish - start < limit_viewd_pages)
                        start = finish - limit_viewd_pages;
                }
            } else {
                finish = limit_viewd_pages;
            }
        }

        if (start > 1)
            pagination.append('<li><a fw-action="paginate" href="javascript:;" fw-page="1" aria-label="Previous"><span aria-hidden="true">&laquo;</span></a></li>');

        for (var i=start; i<=finish; i++) {
            if (i==paginator.page.current)
                pagination.append('<li class="active"><a fw-action="paginate" fw-page="'+ i +'" href="javascript:;">'+ i +'</a></li>')
            else
                pagination.append('<li><a fw-action="paginate" fw-page="'+ i +'" href="javascript:;">'+ i +'</a></li>')
        }

        if (finish < paginator.page.total)
            pagination.append('<li><a fw-action="paginate" href="javascript:;" fw-page="' + paginator.page.total + '" aria-label="Next"><span aria-hidden="true">&raquo;</span></a></li>');

        pagination.find("a[fw-action='paginate']").on('click', function() {
            var page = $(this).attr('fw-page');
            Grid.paginate(page)
        });
    }

    function refreshMap() {
        Grid.domr.find('[fw-component="map"]').each(function() {
            var map = FW.getRegisteredComponent('map', $(this));

            map.clearParams().addParams(getFilters()).refresh();
        });
    }

    function scan() {

        FW.scan(Grid.domr);

        Grid.domr.find('form').find('input').each(function() {
            $(this).keyup(function( event ) {
                ;
            }).keydown(function( event ) {
                if ( event.which == 13 ) {
                    event.preventDefault();
                    Grid.domr.find('form').find('button[fw-action="erase-filters"]').show();
                    Grid.paginate(1);

                    refreshMap();
                }
            })
        });

        Grid.domr.find('form').find('select, input').each(function() {
            $(this).on('change', function( event ) {
                event.preventDefault();
                Grid.domr.find('form').find('button[fw-action="erase-filters"]').show();
                Grid.paginate(1);

                refreshMap();
            });
        });

        Grid.domr.find('form').find('button[fw-action="erase-filters"]').on('click', function() {
            Grid.domr.find('form').find('input').each(function() {
                $(this).val('');
            });
            Grid.domr.find('form').find('select').each(function() {
                $(this).val('');
                $(this).selectpicker('refresh');
            });
            $(this).hide();
            Grid.paginate(1);

            refreshMap();
        });

        Grid.domr.find("button[fw-action='download']").each(function() {
            $(this).on('click', function( event ) {
                event.preventDefault();                
                Grid.download();
            });
        });
    }

    return init(domr, controller);
};