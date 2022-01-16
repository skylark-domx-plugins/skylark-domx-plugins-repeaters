define([
    "skylark-langx/langx",
    "skylark-domx-browser",
    "skylark-domx-eventer",
    "skylark-domx-noder",
    "skylark-domx-geom",
    "skylark-domx-query",
    "skylark-domx-plugins-toggles/checkbox",
    "../view-type-registry",   
    "./view-base"
], function(langx, browser, eventer, noder, geom, $, Checkbox,viewTypeRegistry, ViewBase) {

  var TableView = ViewBase.inherit({
    klassName : "TableView",

    options: {
        columnRendered: null,
        columnSizing: true,
        columnSyncing: true,
        highlightSortedColumn: true,
        infiniteScroll: false,
        noItemsHTML: 'no items found',
        selectable: true,
        sortClearing: false,
        rowRendered: null,
        frozenColumns: 0,
        actions: false,

        viewClass : "repeater-table",
        tableWrapperClass : "repeater-table-wrapper",
        checkClass : "repeater-table-check",
        headingClass : "repeater-table-heading",
        actionsPlaceHolderClass : "repeater-table-actions-placeholder"
    },

    clearSelectedItems : function listClearSelectedItems () {
        this.repeater.$canvas.find(`.${this.options.checkClass}`).remove();
        this.repeater.$canvas.find(`.${this.options.viewClass} table tbody tr.selected`).removeClass('selected');
    },

    highlightColumn : function listHighlightColumn (index, force) {
        var tbody = this.repeater.$canvas.find(`.${this.options.tableWrapperClass} > table tbody`);
        if (this.options.highlightSortedColumn || force) {
            tbody.find('td.sorted').removeClass('sorted');
            tbody.find('tr').each(function eachTR () {
                var col = $(this).find('td:nth-child(' + (index + 1) + ')').filter(function filterChildren () { return !$(this).parent().hasClass('empty'); });
                col.addClass('sorted');
            });
        }
    },

    getSelectedItems : function listGetSelectedItems () {
        var selected = [];
        this.repeater.$canvas.find(`.${this.options.viewClass} .${this.options.tableWrapperClass} > table tbody tr.selected`).each(function eachSelectedTR () {
            var $item = $(this);
            selected.push({
                data: $item.data('item_data'),
                element: $item
            });
        });
        return selected;
    },

    positionHeadings : function listPositionHeadings () {
        var $wrapper = this.repeater.$().find(`.${this.options.tableWrapperClass}`);
        var offsetLeft = $wrapper.offset().left;
        var scrollLeft = $wrapper.scrollLeft();
        if (scrollLeft > 0) {
            $wrapper.find(`.${this.options.headingClass}`).each(function eachListHeading () {
                var $heading = $(this);
                var left = ($heading.parents('th:first').offset().left - offsetLeft) + 'px';
                $heading.addClass('shifted').css('left', left);
            });
        } else {
            $wrapper.find(`.${this.options.headingClass}`).each(function eachListHeading () {
                $(this).removeClass('shifted').css('left', '');
            });
        }
    },

    setSelectedItems : function listSetSelectedItems (itms, force) {
        var selectable = this.options.selectable;
        var self = this;
        var data;
        var i;
        var $item;
        var length;

        var items = itms;
        if (!$.isArray(items)) {
            items = [items];
        }

        // this function is necessary because lint yells when a function is in a loop
        var checkIfItemMatchesValue = function checkIfItemMatchesValue (rowIndex) {
            $item = $(this);

            data = $item.data('item_data') || {};
            if (data[items[i].property] === items[i].value) {
                selectItem($item, items[i].selected, rowIndex);
            }
        };

        var selectItem = function selectItem ($itm, slct, index) {
            var $frozenCols;

            var select = (slct !== undefined) ? slct : true;
            if (select) {
                if (!force && selectable !== 'multi') {
                    self.clearSelectedItems();
                }

                if (!$itm.hasClass('selected')) {
                    $itm.addClass('selected');

                    if (self.options.frozenColumns || self.options.selectable === 'multi') {
                        $frozenCols = self.repeater.$().find('.frozen-column-wrapper tr:nth-child(' + (index + 1) + ')');

                        $frozenCols.addClass('selected');
                        $frozenCols.find('.repeater-select-checkbox').addClass('checked');
                    }

                    if (self.options.actions) {
                        self.repeater.$().find('.actions-column-wrapper tr:nth-child(' + (index + 1) + ')').addClass('selected');
                    }

                    $itm.find('td:first').prepend(`<div class="${this.options.checkClass}"><span class="glyphicon glyphicon-ok"></span></div>`);
                }
            } else {
                if (self.options.frozenColumns) {
                    $frozenCols = self.repeater.$().find('.frozen-column-wrapper tr:nth-child(' + (index + 1) + ')');

                    $frozenCols.addClass('selected');
                    $frozenCols.find('.repeater-select-checkbox').removeClass('checked');
                }

                if (self.options.actions) {
                    self.repeater.$().find('.actions-column-wrapper tr:nth-child(' + (index + 1) + ')').removeClass('selected');
                }

                $itm.find(`.${this.options.checkClass}`).remove();
                $itm.removeClass('selected');
            }
        };

        if (force === true || selectable === 'multi') {
            length = items.length;
        } else if (selectable) {
            length = (items.length > 0) ? 1 : 0;
        } else {
            length = 0;
        }

        for (i = 0; i < length; i++) {
            if (items[i].index !== undefined) {
                $item = this.repeater.$canvas.find(`.${this.options.viewClass} .${this.options.tableWrapperClass} > table tbody tr:nth-child(` + (items[i].index + 1) + ')');
                if ($item.length > 0) {
                    selectItem($item, items[i].selected, items[i].index);
                }
            } else if (items[i].property !== undefined && items[i].value !== undefined) {
                this.repeater.$canvas.find(`.${this.options.viewClass} .${this.options.tableWrapperClass} > table tbody tr`).each(checkIfItemMatchesValue);
            }
        }
    },

    sizeHeadings : function listSizeHeadings () {
        var $table = this.repeater.$().find(`.${this.options.viewClass} table`);
        var self = this;
        $table.find('thead th').each(function eachTH () {
            var $th = $(this);
            var $heading = $th.find(`.${self.options.headingClass}`);
            $heading.css({ height: $th.outerHeight() });
            $heading.outerWidth($heading.data('forced-width') || $th.outerWidth());
        });
    },

    setFrozenColumns : function listSetFrozenColumns () {
        var frozenTable = this.repeater.$canvas.find('.table-frozen');
        var $wrapper = this.repeater.$().find('.repeater-canvas');
        var $table = this.repeater.$().find(`.${this.options.viewClass} .${this.options.tableWrapperClass} > table`);
        var repeaterWrapper = this.repeater.$().find(`.${this.options.viewClass}`);
        var numFrozenColumns = this.options.frozenColumns;
        var self = this;

        if (this.options.selectable === 'multi') {
            numFrozenColumns = numFrozenColumns + 1;
            $wrapper.addClass('multi-select-enabled');
        }

        if (frozenTable.length < 1) {
            // setup frozen column markup
            // main wrapper and remove unneeded columns
            var $frozenColumnWrapper = $('<div class="frozen-column-wrapper"></div>').insertBefore($table);
            var $frozenColumn = $table.clone().addClass('table-frozen');
            $frozenColumn.find('th:not(:lt(' + numFrozenColumns + '))').remove();
            $frozenColumn.find('td:not(:nth-child(n+0):nth-child(-n+' + numFrozenColumns + '))').remove();

            // need to set absolute heading for vertical scrolling
            var $frozenThead = $frozenColumn.clone().removeClass('table-frozen');
            $frozenThead.find('tbody').remove();
            var $frozenTheadWrapper = $('<div class="frozen-thead-wrapper"></div>').append($frozenThead);

            // this gets a little messy with all the cloning. We need to make sure the ID and FOR
            // attribs are unique for the 'top most' cloned checkbox
            var $checkboxLabel = $frozenTheadWrapper.find('th label.checkbox-custom.checkbox-inline');
            $checkboxLabel.attr('id', $checkboxLabel.attr('id') + '_cloned');

            $frozenColumnWrapper.append($frozenColumn);
            repeaterWrapper.append($frozenTheadWrapper);
            this.repeater.$canvas.addClass('frozen-enabled');
        }

        this.sizeFrozenColumns();

        $(`.frozen-thead-wrapper .${this.options.headingClass}`).on('click', function onClickHeading () {
            var index = $(this).parent('th').index();
            index = index + 1;
            self.repeater.$().find(`.${this.options.tableWrapperClass} > table thead th:nth-child(` + index + `) .${this.options.headingClass}`)[0].click();
        });
    },

    positionColumns : function listPositionColumns () {
        var $wrapper = this.repeater.$().find('.repeater-canvas');
        var scrollTop = $wrapper.scrollTop();
        var scrollLeft = $wrapper.scrollLeft();
        var frozenEnabled = this.options.frozenColumns || this.options.selectable === 'multi';
        var actionsEnabled = this.options.actions;

        var canvasWidth = this.repeater.$().find('.repeater-canvas').outerWidth();
        var tableWidth = this.repeater.$().find(`.${this.options.viewClass} .${this.options.tableWrapperClass} > table`).outerWidth();

        var actionsWidth = this.repeater.$().find('.table-actions') ? this.repeater.$().find('.table-actions').outerWidth() : 0;

        var shouldScroll = (tableWidth - (canvasWidth - actionsWidth)) >= scrollLeft;


        if (scrollTop > 0) {
            $wrapper.find(`.${this.options.headingClass}`).css('top', scrollTop);
        } else {
            $wrapper.find(`.${this.options.headingClass}`).css('top', '0');
        }

        if (scrollLeft > 0) {
            if (frozenEnabled) {
                $wrapper.find('.frozen-thead-wrapper').css('left', scrollLeft);
                $wrapper.find('.frozen-column-wrapper').css('left', scrollLeft);
            }
            if (actionsEnabled && shouldScroll) {
                $wrapper.find('.actions-thead-wrapper').css('right', -scrollLeft);
                $wrapper.find('.actions-column-wrapper').css('right', -scrollLeft);
            }
        } else {
            if (frozenEnabled) {
                $wrapper.find('.frozen-thead-wrapper').css('left', '0');
                $wrapper.find('.frozen-column-wrapper').css('left', '0');
            }
            if (actionsEnabled) {
                $wrapper.find('.actions-thead-wrapper').css('right', '0');
                $wrapper.find('.actions-column-wrapper').css('right', '0');
            }
        }
    },

    createItemActions : function () {
        var actionsHtml = '';
        var self = this;
        var i;
        var $table = this.repeater.$().find(`.${this.options.viewClass} .${this.options.tableWrapperClass} > table`);
        var $actionsTable = this.repeater.$canvas.find('.table-actions');
        var len = this.options.actions.items.length;
        if (len == 1) {
            var action = this.options.actions.items[0];
            actionsHtml = '<a href="javascript:void(0)" data-action="' + action.name + '" class="action-item"> ' + action.html + '</a>'
            if ($actionsTable.length < 1) {
                var $actionsColumnWrapper = $('<div class="actions-column-wrapper" style="width: ' + this.options.actions.width + 'px"></div>').insertBefore($table);
                var $actionsColumn = $table.clone().addClass('table-actions');
                $actionsColumn.find('th:not(:last-child)').remove();
                $actionsColumn.find('tr td:not(:last-child)').remove();

                var $actionsCells = $actionsColumn.find('td');

                $actionsCells.each(function (rowNumber) {
                    var id = $(this).parent().attr("id");
                    var data = $("#" + id).data("item_data")
                    if (self.options.exceptActionRows && data && langx.inArray(self.options.exceptActionRows, data.name)) {
                        $(this).html("-");
                    } else {
                        $(this).html(actionsHtml);
                    }
                    $(this).find('a').attr('data-row', rowNumber + 1);
                });
            }
        } else {
            for (i = 0; i < len; i++) {
                var action = this.options.actions.items[i];
                var html = action.html;

                actionsHtml += '<li class="' + action.name + '"><a href="javascript:void(0)" data-action="' + action.name + '" class="action-item"> ' + html + '</a></li>';
            }
            var actionsDropdown = '<ul class="ul-inline list-unstyled ul-horizontally" role="menu">' +
                actionsHtml + '</ul>';
            if ($actionsTable.length < 1) {
                var $actionsColumnWrapper = $('<div class="actions-column-wrapper" style="width: ' + this.options.actions.width + 'px"></div>').insertBefore($table);
                var $actionsColumn = $table.clone().addClass('table-actions');
                $actionsColumn.find('th:not(:last-child)').remove();
                $actionsColumn.find('tr td:not(:last-child)').remove();

                // Dont show actions dropdown in header if not multi select
                if (this.options.selectable === 'multi' || this.options.selectable === 'action') {
                    $actionsColumn.find('thead tr').html('<th><div class="repeater-list-heading">' + actionsDropdown + '</div></th>');

                    if (this.options.selectable !== 'action') {
                        // disable the header dropdown until an item is selected
                        $actionsColumn.find('thead .btn').attr('disabled', 'disabled');
                    }
                } else {
                    var label = this.options.actions.label || '<span class="actions-hidden">a</span>';
                    $actionsColumn.find('thead tr').addClass('empty-heading').html('<th>' + label + '<div class="repeater-list-heading">' + label + '</div></th>');
                }

                // Create Actions dropdown for each cell in actions table
                var $actionsCells = $actionsColumn.find('td');

                $actionsCells.each(function addActionsDropdown(rowNumber) {
                    $(this).html(actionsDropdown).addClass("r-list-action");
                    $(this).find('a').attr('data-row', rowNumber + 1);
                });
            }
        }

        $actionsColumnWrapper.append($actionsColumn);

        this.repeater.$canvas.addClass('actions-enabled');
        this.sizeActionsTable();

        // row level actions click
        this.repeater.$().find('.table-actions tbody .action-item').on('click', function onBodyActionItemClick(e) {
            if (!self.isDisabled) {
                var actionName = $(this).data('action');
                var row = $(this).data('row');
                var selected = {
                    actionName: actionName,
                    rows: [row]
                };
                self.getActionItems(selected, e);
            }
        });
        // bulk actions click
        this.repeater.$().find('.table-actions thead .action-item').on('click', function onHeadActionItemClick(e) {
            if (!self.isDisabled) {
                var actionName = $(this).data('action');
                var selected = {
                    actionName: actionName,
                    rows: []
                };

                var selector = `.${this.options.tableWrapperClass} > table .selected`;

                if ( self.options.selectable === 'action' ) {
                    selector = `.${this.options.tableWrapperClass} > table tr`;
                }

                self.repeater.$().find(selector).each(function eachSelector(selectorIndex) {
                    selected.rows.push(selectorIndex + 1);
                });

                self.getActionItems(selected, e);
            }
        });
    },

    getActionItems : function listGetActionItems (selected, e) {
        var selectedObj = [];
        var actionObj = $.grep(this.options.actions.items, function matchedActions (actions) {
            return actions.name === selected.actionName;
        })[0];
        for (var i = 0, selectedRowsL = selected.rows.length; i < selectedRowsL; i++) {
            var clickedRow = this.repeater.$canvas.find(`.${this.options.tableWrapperClass} > table tbody tr:nth-child(` + selected.rows[i] + ')');
            selectedObj.push({
                item: clickedRow,
                rowData: clickedRow.data('item_data')
            });
        }
        if (selectedObj.length === 1) {
            selectedObj = selectedObj[0];
        }

        if (actionObj.clickAction) {
            var callback = function noop () {};// for backwards compatibility. No idea why this was originally here...
            actionObj.clickAction(selectedObj, callback, e);
        }
    },

    sizeActionsTable : function listSizeActionsTable () {
        var $actionsTable = this.repeater.$().find(`.${this.options.viewClass} table.table-actions`);
        var $actionsTableHeader = $actionsTable.find('thead tr th');
        var $table = this.repeater.$().find(`.${this.options.tableWrapperClass} > table`);

        $actionsTableHeader.outerHeight($table.find('thead tr th').outerHeight());
        $actionsTableHeader.find(`.${this.options.headingClass}`).outerHeight($actionsTableHeader.outerHeight());
        $actionsTable.find('tbody tr td:first-child').each(function eachFirstChild (i) {
            $(this).outerHeight($table.find('tbody tr:eq(' + i + ') td').outerHeight());
        });
    },

    sizeFrozenColumns : function listSizeFrozenColumns () {
        var $table = this.repeater.$().find(`.${this.options.viewClass} .${this.options.tableWrapperClass} > table`);

        this.repeater.$().find(`.${this.options.viewClass} table.table-frozen tr`).each(function eachTR (i) {
            $(this).height($table.find('tr:eq(' + i + ')').height());
        });

        var columnWidth = $table.find('td:eq(0)').outerWidth();
        this.repeater.$().find('.frozen-column-wrapper, .frozen-thead-wrapper').width(columnWidth);
    },

    frozenOptionsInitialize : function listFrozenOptionsInitialize () {
        var $checkboxes = this.repeater.$().find('.frozen-column-wrapper .checkbox-inline');
        var $headerCheckbox = this.repeater.$().find('.header-checkbox .checkbox-custom');
        var $everyTable = this.repeater.$().find(`.${this.options.viewClass} table`);
        var self = this;

        // Make sure if row is hovered that it is shown in frozen column as well
        this.repeater.$().find('tr.selectable').on('mouseover mouseleave', function onMouseEvents (e) {
            var index = $(this).index();
            index = index + 1;
            if (e.type === 'mouseover') {
                $everyTable.find('tbody tr:nth-child(' + index + ')').addClass('hovered');
            } else {
                $everyTable.find('tbody tr:nth-child(' + index + ')').removeClass('hovered');
            }
        });

        $headerCheckbox.plugin("lark.toggles.checkbox");
        $checkboxes.plugin("lark.toggles.checkbox");

        // Row checkboxes
        var $rowCheckboxes = this.repeater.$().find('.table-frozen tbody .checkbox-inline');
        var $checkAll = this.repeater.$().find('.frozen-thead-wrapper thead .checkbox-inline input');
        $rowCheckboxes.on('change', function onChangeRowCheckboxes (e) {
            e.preventDefault();

            if (!self.revertingCheckbox) {
                if (self.isDisabled) {
                    revertCheckbox($(e.currentTarget));
                } else {
                    var row = $(this).attr('data-row');
                    row = parseInt(row, 10) + 1;
                    self.repeater.$().find(`.${this.options.tableWrapperClass} > table tbody tr:nth-child(` + row + ')').click();

                    var numSelected = self.repeater.$().find('.table-frozen tbody .checkbox-inline.checked').length;
                    if (numSelected === 0) {
                        $checkAll.prop('checked', false);
                        $checkAll.prop('indeterminate', false);
                    } else if (numSelected === $rowCheckboxes.length) {
                        $checkAll.prop('checked', true);
                        $checkAll.prop('indeterminate', false);
                    } else {
                        $checkAll.prop('checked', false);
                        $checkAll.prop('indeterminate', true);
                    }
                }
            }
        });

        // "Check All" checkbox
        $checkAll.on('change', function onChangeCheckAll (e) {
            if (!self.revertingCheckbox) {
                if (self.isDisabled) {
                    revertCheckbox($(e.currentTarget));
                } else if ($(this).is(':checked')) {
                    self.repeater.$().find(`.${this.options.tableWrapperClass} > table tbody tr:not(.selected)`).click();
                    self.repeater.$().trigger('selected', $checkboxes);
                } else {
                    self.repeater.$().find(`.${this.options.tableWrapperClass} > table tbody tr.selected`).click();
                    self.repeater.$().trigger('deselected', $checkboxes);
                }
            }
        });

        function revertCheckbox ($checkbox) {
            self.revertingCheckbox = true;
            $checkbox.checkbox('toggle');
            delete self.revertingCheckbox;
        }
    },

    cleared: function cleared () {
        if (this.options.columnSyncing) {
            this.sizeHeadings();
        }
    },
    dataOptions: function dataOptions (options) {
        if (this.sortDirection) {
            options.sortDirection = this.sortDirection;
        }
        if (this.sortProperty) {
            options.sortProperty = this.sortProperty;
        }
        return options;
    },
    enabled: function enabled (helpers) {
        if (this.options.actions) {
            if (!helpers.status) {
                this.repeater.$canvas.find('.repeater-actions-button').attr('disabled', 'disabled');
            } else {
                this.repeater.$canvas.find('.repeater-actions-button').removeAttr('disabled');
                this.toggleActionsHeaderButton();
            }
        }
    },
    initialize: function initialize (helpers, callback) {
        this.sortDirection = null;
        this.sortProperty = null;
        this.specialBrowserClass = this.specialBrowserClass();
        this.actions_width = (this.options.actions.width !== undefined) ? this.options.actions.width : 37;
        this.noItems = false;
        callback();
    },
    resize: function resize () {
        this.sizeColumns(this.repeater.$().find(`.${this.options.tableWrapperClass} > table thead tr`));
        if (this.options.actions) {
            this.sizeActionsTable();
        }
        if (this.options.frozenColumns || this.options.selectable === 'multi') {
            this.sizeFrozenColumns();
        }
        if (this.options.columnSyncing) {
            this.sizeHeadings();
        }
    },
    selected: function selected () {
        var infScroll = this.options.infiniteScroll;
        var opts;

        this.firstRender = true;
        this.repeater.$loader.addClass('noHeader');

        if (infScroll) {
            opts = (typeof infScroll === 'object') ? infScroll : {};
            this.repeater.infiniteScrolling(true, opts);
        }
    },
    before: function before (helpers) {
        var $listContainer = helpers.container.find(`.${this.options.viewClass}`);
        var self = this;
        var $table;

        // this is a patch, it was pulled out of `renderThead`
        if (helpers.data.count > 0) {
            this.noItems = false;
        } else {
            this.noItems = true;
        }

        if ($listContainer.length < 1) {
            $listContainer = $(`<div class="${this.options.viewClass} ` + this.specialBrowserClass() + `" data-preserve="shallow"><div class="${this.options.tableWrapperClass}" data-infinite="true" data-preserve="shallow"><table aria-readonly="true" class="table" data-preserve="shallow" role="grid"></table></div></div>`);
            $listContainer.find(`.${this.options.tableWrapperClass}`).on('scroll.lark.repeaterList', function onScrollRepeaterList () {
                if (self.options.columnSyncing) {
                    self.positionHeadings();
                }
            });
            if (self.options.frozenColumns || self.options.actions || self.options.selectable === 'multi') {
                helpers.container.on('scroll.lark.repeaterList', function onScrollRepeaterList () {
                    self.positionColumns();
                });
            }

            helpers.container.append($listContainer);
        }
        helpers.container.removeClass('actions-enabled actions-enabled multi-select-enabled');

        $table = $listContainer.find('table');
        this.renderThead($table, helpers.data);
        this.renderTbody($table, helpers.data);

        return false;
    },
    renderItem: function renderItem (helpers) {
        this.renderRow(helpers.container, helpers.subset, helpers.index);
        return false;
    },
    after: function after () {
        var $sorted;

        if ((this.options.frozenColumns || this.options.selectable === 'multi') && !this.noItems) {
            this.setFrozenColumns();
        }

        if (this.options.actions && !this.noItems) {
            this.createItemActions();
            this.sizeActionsTable();
        }

        if ((this.options.frozenColumns || this.options.actions || this.options.selectable === 'multi') && !this.noItems) {
            this.positionColumns();
            this.frozenOptionsInitialize();
        }

        if (this.options.columnSyncing) {
            this.sizeHeadings();
            this.positionHeadings();
        }

        $sorted = this.repeater.$canvas.find(`.${this.options.tableWrapperClass} > table .${this.options.headingClass}.sorted`);
        if ($sorted.length > 0) {
            this.highlightColumn($sorted.data('fu_item_index'));
        }

        return false;
    },



    // ADDITIONAL METHODS
    areDifferentColumns : function areDifferentColumns (oldCols, newCols) {
        if (!newCols) {
            return false;
        }
        if (!oldCols || (newCols.length !== oldCols.length)) {
            return true;
        }
        for (var i = 0, newColsL = newCols.length; i < newColsL; i++) {
            if (!oldCols[i]) {
                return true;
            }

            for (var j in newCols[i]) {
                if (newCols[i].hasOwnProperty(j) && oldCols[i][j] !== newCols[i][j]) {
                    return true;
                }
            }
        }
        return false;
    },

    renderColumn : function renderColumn ($row, rows, rowIndex, columns, columnIndex) {
        var className = columns[columnIndex].className;
        var content = rows[rowIndex][columns[columnIndex].property];
        var $col = $('<td></td>');
        var width = columns[columnIndex]._auto_width;

        var property = columns[columnIndex].property;
        if (this.options.actions !== false && property === '@_ACTIONS_@') {
            content = `<div class="${this.options.actionsPlaceHolderClass}" style="width: ` + this.actions_width  + 'px"></div>';
        }

        content = (content !== undefined) ? content : '';

        $col.addClass(((className !== undefined) ? className : '')).append(content);
        if (width !== undefined) {
            $col.outerWidth(width);
        }

        $row.append($col);

        if (this.options.selectable === 'multi' && columns[columnIndex].property === '@_CHECKBOX_@') {
            var checkBoxMarkup = '<label data-row="' + rowIndex + '" class="checkbox-custom checkbox-inline body-checkbox repeater-select-checkbox">' +
                '<input class="sr-only" type="checkbox"></label>';

            $col.html(checkBoxMarkup);
        }

        return $col;
    },

    renderHeader : function renderHeader ($tr, columns, index) {
        var chevDown = 'glyphicon-chevron-down';
        var chevron = '.glyphicon.rlc:first';
        var chevUp = 'glyphicon-chevron-up';
        var $div = $(`<div class="${this.options.headingClass}"><span class="glyphicon rlc"></span></div>`);
        var checkAllID = (this.repeater.$().attr('id') + '_' || '') + 'checkall';

        var checkBoxMarkup = `<div class="${this.options.headingClass} header-checkbox">` +
                '<label id="' + checkAllID + '" class="checkbox-custom checkbox-inline">' +
                    '<input class="sr-only" type="checkbox" value="">' +
                    '<span class="checkbox-label">&nbsp;</span>' +
                '</label>' +
            '</div>';

        var $header = $('<th></th>');
        var self = this;
        var $both;
        var className;
        var sortable;
        var $span;
        var $spans;

        $div.data('fu_item_index', index);
        $div.prepend(columns[index].label);
        $header.html($div.html()).find('[id]').removeAttr('id');

        if (columns[index].property !== '@_CHECKBOX_@') {
            $header.append($div);
        } else {
            $header.append(checkBoxMarkup);
        }

        $both = $header.add($div);
        $span = $div.find(chevron);
        $spans = $span.add($header.find(chevron));

        if (this.options.actions && columns[index].property === '@_ACTIONS_@') {
            var width = this.actions_width;
            $header.css('width', width);
            $div.css('width', width);
        }

        className = columns[index].className;
        if (className !== undefined) {
            $both.addClass(className);
        }


        sortable = columns[index].sortable;
        if (sortable) {
            $both.addClass('sortable');
            $div.on('click.lark.repeaterList', function onClickRepeaterList () {
                if (!self.isDisabled) {
                    self.sortProperty = (typeof sortable === 'string') ? sortable : columns[index].property;
                    if ($div.hasClass('sorted')) {
                        if ($span.hasClass(chevUp)) {
                            $spans.removeClass(chevUp).addClass(chevDown);
                            self.sortDirection = 'desc';
                        } else if (!self.options.sortClearing) {
                            $spans.removeClass(chevDown).addClass(chevUp);
                            self.sortDirection = 'asc';
                        } else {
                            $both.removeClass('sorted');
                            $spans.removeClass(chevDown);
                            self.sortDirection = null;
                            self.sortProperty = null;
                        }
                    } else {
                        $tr.find(`th, .${self.options.headingClass}`).removeClass('sorted');
                        $spans.removeClass(chevDown).addClass(chevUp);
                        self.sortDirection = 'asc';
                        $both.addClass('sorted');
                    }

                    self.repeater.render({
                        clearInfinite: true,
                        pageIncrement: null
                    });
                }
            });
        }

        if (columns[index].sortDirection === 'asc' || columns[index].sortDirection === 'desc') {
            $tr.find(`th, .${this.options.headingClass}`).removeClass('sorted');
            $both.addClass('sortable sorted');
            if (columns[index].sortDirection === 'asc') {
                $spans.addClass(chevUp);
                this.sortDirection = 'asc';
            } else {
                $spans.addClass(chevDown);
                this.sortDirection = 'desc';
            }

            this.sortProperty = (typeof sortable === 'string') ? sortable : columns[index].property;
        }

        $tr.append($header);
    },


    renderRow : function renderRow ($tbody, rows, index) {

        function onClickRowRepeaterList (repeater) {
            var isMulti = repeater.options.selectable === 'multi';
            var isActions = repeater.options.actions;
            var $repeater = repeater.$();

            if (!repeater.isDisabled) {
                var $item = $(this);
                var index = $(this).index() + 1;
                var $frozenRow = $repeater.find('.frozen-column-wrapper tr:nth-child(' + index + ')');
                var $actionsRow = $repeater.find('.actions-column-wrapper tr:nth-child(' + index + ')');
                var $checkBox = $repeater.find('.frozen-column-wrapper tr:nth-child(' + index + ') .checkbox-inline');

                if ($item.is('.selected')) {
                    $item.removeClass('selected');
                    if (isMulti) {
                        $checkBox.click();
                        $frozenRow.removeClass('selected');
                        if (isActions) {
                            $actionsRow.removeClass('selected');
                        }
                    } else {
                        $item.find(`.${this.options.checkClass}`).remove();
                    }

                    $repeater.trigger('deselected.lark.repeaterList', $item);
                } else {
                    if (!isMulti) {
                        repeater.$canvas.find(`.${this.options.checkClass}`).remove();
                        repeater.$canvas.find(`.${this.options.viewClass} tbody tr.selected`).each(function deslectRow () {
                            $(this).removeClass('selected');
                            $repeater.trigger('deselected.lark.repeaterList', $(this));
                        });
                        $item.find('td:first').prepend(`<div class="${this.options.checkClass}"><span class="glyphicon glyphicon-ok"></span></div>`);
                        $item.addClass('selected');
                        $frozenRow.addClass('selected');
                    } else {
                        $checkBox.click();
                        $item.addClass('selected');
                        $frozenRow.addClass('selected');
                        if (isActions) {
                            $actionsRow.addClass('selected');
                        }
                    }
                    $repeater.trigger('selected.lark.repeaterList', $item);
                }

                this.toggleActionsHeaderButton(repeater);
            }
        }

        var $row = $('<tr></tr>');

        if (this.options.selectable) {
            $row.data('item_data', rows[index]);

            if (this.options.selectable !== 'action') {
                $row.addClass('selectable');
                $row.attr('tabindex', 0);   // allow items to be tabbed to / focused on

                var repeater = this;
                $row.on('click.lark.repeaterList', function callOnClickRowRepeaterList() {
                    onClickRowRepeaterList.call(this, repeater);
                });

                // allow selection via enter key
                $row.keyup(function onRowKeyup (e) {
                    if (e.keyCode === 13) {
                        // triggering a standard click event to be caught by the row click handler above
                        $row.trigger('click.lark.repeaterList');
                    }
                });
            }
        }

        if (this.options.actions && !this.options.selectable) {
            $row.data('item_data', rows[index]);
        }

        var columns = [];
        for (var i = 0, length = this.columns.length; i < length; i++) {
            columns.push(this.renderColumn($row, rows, index, this.columns, i));
        }

        $tbody.append($row);

        if (this.options.columnRendered) {
            for (var columnIndex = 0, colLength = columns.length; columnIndex < colLength; columnIndex++) {
                if (!(this.columns[columnIndex].property === '@_CHECKBOX_@' || this.columns[columnIndex].property === '@_ACTIONS_@')) {
                    this.options.columnRendered({
                        container: $row,
                        columnAttr: this.columns[columnIndex].property,
                        item: columns[columnIndex],
                        rowData: rows[index]
                    }, function noop () {});
                }
            }
        }

        if (this.options.rowRendered) {
            this.options.rowRendered({
                container: $tbody,
                item: $row,
                rowData: rows[index]
            }, function noop () {});
        }
    },

    renderTbody : function renderTbody ($table, data) {
        var $tbody = $table.find('tbody');
        var $empty;

        if ($tbody.length < 1) {
            $tbody = $('<tbody data-container="true"></tbody>');
            $table.append($tbody);
        }

        if (typeof data.error === 'string' && data.error.length > 0) {
            $empty = $('<tr class="empty text-danger"><td colspan="' + this.columns.length + '"></td></tr>');
            $empty.find('td').append(data.error);
            $tbody.append($empty);
        } else if (data.items && data.items.length < 1) {
            $empty = $('<tr class="empty"><td colspan="' + this.columns.length + '"></td></tr>');
            $empty.find('td').append(this.options.noItemsHTML);
            $tbody.append($empty);
        }
    },

    renderThead : function renderThead ($table, data) {
        var columns = data.columns || [];
        var $thead = $table.find('thead');
        var i;
        var length;
        var $tr;

        if (this.firstRender || this.areDifferentColumns(this.columns, columns) || $thead.length === 0) {
            $thead.remove();

            // noItems is set in `before` method

            if (this.options.selectable === 'multi' && !this.noItems) {
                var checkboxColumn = {
                    label: 'c',
                    property: '@_CHECKBOX_@',
                    sortable: false
                };
                columns.splice(0, 0, checkboxColumn);
            }

            this.columns = columns;
            this.firstRender = false;
            this.repeater.$loader.removeClass('noHeader');

            // keep action column header even when empty, you'll need it later....
            if (this.options.actions) {
                var actionsColumn = {
                    label: this.options.actions.label || '<span class="actions-hidden">a</span>',
                    property: '@_ACTIONS_@',
                    sortable: false,
                    width: this.actions_width
                };
                columns.push(actionsColumn);
            }


            $thead = $('<thead data-preserve="deep"><tr></tr></thead>');
            $tr = $thead.find('tr');
            for (i = 0, length = columns.length; i < length; i++) {
                this.renderHeader($tr, columns, i);
            }
            $table.prepend($thead);

            if (this.options.selectable === 'multi' && !this.noItems) {
                // after checkbox column is created need to get width of checkbox column from
                // its css class
                var checkboxWidth = this.repeater.$().find(`.${this.options.tableWrapperClass} .header-checkbox`).outerWidth();
                var selectColumn = $.grep(columns, function grepColumn (column) {
                    return column.property === '@_CHECKBOX_@';
                })[0];
                selectColumn.width = checkboxWidth;
            }
            this.sizeColumns($tr);
        }
    },

    sizeColumns : function sizeColumns ($tr) {
        var automaticallyGeneratedWidths = [];
        var self = this;
        var i;
        var length;
        var newWidth;
        var widthTaken;

        if (this.options.columnSizing) {
            i = 0;
            widthTaken = 0;
            $tr.find('th').each(function eachTH () {
                var $th = $(this);
                var width;
                if (self.columns[i].width !== undefined) {
                    width = self.columns[i].width;
                    $th.outerWidth(width);
                    widthTaken += $th.outerWidth();
                    self.columns[i]._auto_width = width;
                } else {
                    var outerWidth = $th.find(`.${self.options.headingClass}`).outerWidth();
                    automaticallyGeneratedWidths.push({
                        col: $th,
                        index: i,
                        minWidth: outerWidth
                    });
                }

                i++;
            });

            length = automaticallyGeneratedWidths.length;
            if (length > 0) {
                var canvasWidth = this.repeater.$canvas.find(`.${this.options.tableWrapperClass}`).outerWidth();
                newWidth = Math.floor((canvasWidth - widthTaken) / length);
                for (i = 0; i < length; i++) {
                    if (automaticallyGeneratedWidths[i].minWidth > newWidth) {
                        newWidth = automaticallyGeneratedWidths[i].minWidth;
                    }
                    automaticallyGeneratedWidths[i].col.outerWidth(newWidth);
                    this.columns[automaticallyGeneratedWidths[i].index]._auto_width = newWidth;
                }
            }
        }
    },

    specialBrowserClass : function specialBrowserClass () {
        var ua = window.navigator.userAgent;
        var msie = ua.indexOf('MSIE ');
        var firefox = ua.indexOf('Firefox');

        if (msie > 0 ) {
            return 'ie-' + parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
        } else if (firefox > 0) {
            return 'firefox';
        }

        return '';
    },

    toggleActionsHeaderButton : function toggleActionsHeaderButton () {
        var selectedSelector = `.${this.options.tableWrapperClass} > table .selected`;
        var $actionsColumn = this.repeater.$().find('.table-actions');
        var $selected;

        if (this.options.selectable === 'action') {
            selectedSelector = `.${this.options.tableWrapperClass} > table tr`;
        }

        $selected = this.repeater.$canvas.find( selectedSelector );

        if ($selected.length > 0) {
            $actionsColumn.find('thead .btn').removeAttr('disabled');
        } else {
            $actionsColumn.find('thead .btn').attr('disabled', 'disabled');
        }
    }


  });




     viewTypeRegistry["table"] = {
        name : "table",
        ctor : TableView
    }; 

    return TableView;

});