FW.components.Grid = function(domr) {

    "Use Strict";

    var Grid = Grid || {};

    Grid.domr = $(domr);
    Grid.table = Grid.domr.find('table');
    Grid.controller = Grid.domr.attr('fw-controller');

    var module = FW.getModule(Grid.domr.attr('fw-controller'));

    function init() {

        $(document).ready(function($) {
            scan();
            Grid.paginate(1);
        });

        return Grid;
    };

    Grid.paginate = function(page) {

        var data = {};

        if (page)
            data['page'] = page;

        var orderEl = Grid.table.find("th[fw-order]");
        if (orderEl.length)
            data['orderBy'] = orderEl.attr('fw-col-name') + ',' + orderEl.attr('fw-order');

        $.extend(data, getFilters());

        var limit = getLimit();

        if (limit)
            data['limit'] = limit;

        var url = FW.config.url;

        if (Grid.domr.attr('fw-url'))
            url = Grid.domr.attr('fw-url')

        $.ajax({
            url: url + '/' + Grid.controller,
            method: "GET",
            context: document.body,
            data: data,
            accepts: {
                json: 'application/json'
            },
            dataType: 'json',
            beforeSend: function( xhr ) {
                beforeSend();
            }
        }).done(function(xhr) {
            if (module && module.callbacks.hasOwnProperty('paginateDone') && typeof module.callbacks['paginateDone'] == 'function')
                module.callbacks['paginateDone'](xhr);
            else {
                if (xhr.hasOwnProperty('list'))
                    renderTable(xhr.list);

                if (xhr.hasOwnProperty('paginator'))
                    renderPaginator(xhr.paginator);
            }
        }).fail(function(xhr) {
            if (module.callbacks.hasOwnProperty('paginateFail') && typeof module.callbacks['paginateFail'] == 'function')
                module.callbacks['paginateFail'](xhr);
        }).always(function(xhr) {
            if (module && module.callbacks.hasOwnProperty('paginateAlways') && typeof module.callbacks['paginateAlways'] == 'function')
                module.callbacks['paginateAlways'](xhr);
            else
                paginateDone();
        });
    };

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
                if (fields[item].value)
                    filters[fields[item].name + '.LK'] = fields[item].value;
            }
        }

        return filters;
    }

    function getColumns() {

        var head = Grid.table.find('thead');

        var columns = [];

        head.find('th').each(function() {
            var fieldName = $(this).attr('fw-col-name');

            if (fieldName)
                columns.push(fieldName);
        });

        return columns;
    };

    function renderTh() {

        Grid.table.find('th').each(function() {

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

                Grid.paginate(getPage());
            });
        });
    };

    function getPage() {

        return Grid.domr.find('.active').find('a').attr('fw-page');
    }

    function getLimit() {

        return Grid.domr.find('.grid-limit').val();
    }

    function renderTable(list) {

        var body = Grid.table.find('tbody');

        body.find('tr').remove();

        var columns = getColumns();

        for (item in list) {

            body.append('<tr></tr>');

            var line = body.find('tr:last-child');

            for (var col in columns) {

                var propParts = columns[col].split('.');
                var source = list[item];

                for (part in propParts) {
                    source = source[propParts[part]];
                }

                line.append('<td>' + source + '</td>');
            }
            line.append('<td></td>');
        }

        renderTh();
    };

    function renderPaginator(paginator) {

        Grid.domr.find('.paginator').remove();

        Grid.table.parent().append('<div class="row paginator">'
            + '<div class="col-sm-4 col-md-2 col-lg-2 paginator-info" style="margin-top: 15px"></div>'
            + '<div class="col-sm-6 col-md-8 col-lg-9">'
            + '     <div class="text-center"><nav><ul class="pagination"></ul></nav></div>'
            + '</div>'
            + '<div class="col-sm-2 col-md-2 col-lg-1 paginator-options">'
            + ' <div class="form-group">'
            + '     <label>Limite:</label>'
            + '     <select class="form-control grid-limit" style="width: 75px;">'
            + '         <option></option>'
            + '         <option>5</option>'
            + '         <option>10</option>'
            + '         <option>20</option>'
            + '         <option>50</option>'
            + '         <option>100</option>'
            + '     </select>'
            + ' </div>'
            + '</div>'
            + '</div>');

        Grid.domr.find('.grid-limit').val(paginator.limit).on('change', function() {
            Grid.paginate(1);
        });

        var final = (paginator.offset + paginator.limit);
        if (final > paginator.total)
            final = paginator.total;

        Grid.domr.find('.paginator-info').html('Exibindo '+ (paginator.offset+1) + ' a ' + final + ' de ' + paginator.total + ' resultados.');

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

    function scan() {

        Grid.domr.find('form').find('input').each(function() {
            $(this).keyup(function( event ) {
                ;
            }).keydown(function( event ) {
                if ( event.which == 13 ) {
                    event.preventDefault();
                    Grid.paginate(1);
                }
            })
        });
    }

    return init();
};