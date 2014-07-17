// Responsive 5E JavaScript

/**
 * TOGGLE BUTTON PLUGIN
 */
(function($) {
    var ToggleButton = function(element, options) {
        this.element = $(element);
        if (options.hasOwnProperty("isEditMode")) {
            this.isEditMode = options.isEditMode;
        }
        if (options.hasOwnProperty("changeButtonText")) {
            this.changeButtonText = options.changeButtonText;
            this.textTrue = options.textTrue;
            this.textFalse = options.textFalse;
        }
        this.init();
    }
    ToggleButton.prototype = {
        name: "plugin.Responsive5e.ToggleButton",
        element: null,
        checkbox: null,
        isSelected: false,
        titleTrue: null,
        titleFalse: null,
        changeButtonText: false,
        textTrue: "",
        textFalse: "",
        isEditMode: false,
        init: function() {
            if (this.element) {
                var fieldName = this.element.attr("data-fieldname");
                this.checkbox = this.element.parent(".toggle-container").find("." + fieldName + " input");
                this.titleFalse = this.element.attr("title");
                this.titleTrue = this.titleFalse.replace("Not ", "");
                if (this.checkbox.is(":checked")) {
                    this.isSelected = true;
                } else {
                    this.isSelected = false;
                }
                this.updateView();
                if (this.isEditMode) {
                    this.element.on("click", null, {plugin:this}, function(event) {
                        event.data.plugin.onClick();
                    });
                }
            }
        },
        onClick: function() {
            if (this.isSelected) {
                this.isSelected = false;
            } else {
                this.isSelected = true;
            }
            this.updateView();
            this.updateCheckbox();
        },
        updateView: function() {
            if (this.isSelected) {
                this.element.addClass("active");
                this.element.attr("title", this.titleTrue);
                if (this.changeButtonText) {
                    this.element.text(this.textTrue);
                }
            } else {
                this.element.removeClass("active");
                this.element.attr("title", this.titleFalse);
                if (this.changeButtonText) {
                    this.element.text(this.textFalse);
                }
                if (!this.isEditMode) {
                    this.element.hide();
                }
            }
        },
        updateCheckbox: function() {
            if (this.isSelected) {
                this.checkbox.attr("checked", "checked");
                this.checkbox.val(1);
            } else {
                this.checkbox.attr("checked", null);
                this.checkbox.val(0);
            }
            this.checkbox.trigger("change");
        },
        destroy: function() {
            this.element.off("click");
            this.name = null;
            this.titleFalse = null;
            this.titleTrue = null;
            this.textTrue = null;
            this.textFalse = null;
            this.changeButtonText = false;
            this.isEditMode = false;
            this.isSelected = false;
            this.checkbox = null;
            this.element = null;
        }
    }
    $.fn.basicRulesToggleButton = function(target) {
        return this.each(function() {
            var plugin = $.data(this, ToggleButton.prototype.name);
            if (!plugin) {
                $.data(this, ToggleButton.prototype.name, new ToggleButton(this, target));
            } else {
                if (target == "destroy") {
                    plugin.destroy();
                    $.removeData(this, ToggleButton.prototype.name);
                    plugin = null;
                }
            }
        });
    }
})(jQuery);

/**
 * EDITABLELIST PLUGIN
 */
(function($, window) {
    var EditableList = function(element, options) {
        this.element = $(element);
        this.defaults.editableSettings.placeholder = aisleten.characters.jeditablePlaceholder;
        this.options = $.extend({}, this.defaults, options);
        this.init();
    }
    EditableList.prototype = {
        name: "plugin.Responsive5e.EditableList",
        options: null,
        element: null,
        list: null,
        addBtn: null,
        field: null,
        items: [],
        defaults: {
            isEditMode: true,
            itemMarkup: '<li class="addlist-item"> <span class="marker">-</span><span class="content" data-index="{{{INDEX}}}">{{{CONTENT}}}</span>{{{BUTTON}}}</li>',
            removeBtnMarkup: '<button type="button" class="btn btn-default removebtn" data-index="{{{INDEX}}}">&#10005;</button>',
            confirmMessage: 'Are you sure you want to remove this item?',
            editableSettings: {
                submit: "OK",
                cssclass : 'jeditable_input',
                placeholder : aisleten.characters.jeditablePlaceholder
            }
        },
        editableReturnFunc: function(value, settings) {
                return value;
        },
        init: function() {
            if (this.element) {
                this.list = this.element.find("ul.addlist");
                this.addBtn = this.element.find("button.addbtn");
                this.field = this.element.find("div.addlist-field span.dsf");
                this.items = [];
                var itemstr = this.field.text();
                // set up button
                if (this.options.isEditMode) {
                    this.addBtn.on("click", null, {plugin:this}, function(event) {
                        event.data.plugin.onAddItem();
                    });
                } else {
                    this.addBtn.remove();
                }
                // get items
                if (itemstr !== null && itemstr !== "" && itemstr !== aisleten.characters.jeditablePlaceholder) {
                    this.items = JSON.parse(itemstr);
                }
                this.renderList();
            }
        },
        onAddItem: function() {
            var removeBtnMarkup = this.options.removeBtnMarkup.replace("{{{INDEX}}}", this.items.length),
                markup = this.options.itemMarkup.replace("{{{CONTENT}}}","").replace("{{{INDEX}}}", this.items.length).replace("{{{BUTTON}}}", removeBtnMarkup),
                newItem = $(markup).appendTo(this.list),
                editableOptions = $.extend({}, this.options.editableSettings);
            editableOptions.origin = this;
            editableOptions.callback = function(value, settings) {
                    settings.origin.onUpdateItem(this, value);
            }
            newItem.find("span.content").editable(this.editableReturnFunc, editableOptions);
            newItem.find("button.removebtn").on("click", null, {plugin:this}, function(event) {
                event.data.plugin.onRemoveItem(this);
            });
        },
        renderList: function() {
            this.list.empty();
            var len = this.items.length,
                markup = "",
                btnMarkup = "",
                totalMarkup = "",
                myItems = null;
            if (len > 0) {
                for (var i=0; i<len; i++) {
                    markup = this.options.itemMarkup.replace("{{{CONTENT}}}", this.items[i]).replace("{{{INDEX}}}", i);
                    if (this.options.isEditMode) {
                        btnMarkup = this.options.removeBtnMarkup.replace("{{{INDEX}}}", i);
                        markup = markup.replace("{{{BUTTON}}}", btnMarkup);
                    } else {
                        markup = markup.replace("{{{BUTTON}}}", "");
                    }
                    totalMarkup += markup;
                }
                myItems = $(totalMarkup).appendTo(this.list);
                if (this.options.isEditMode) {
                    myItems.find("button.removebtn").on("click", null, {plugin:this}, function(event) {
                        event.data.plugin.onRemoveItem(this);
                    });
                    var editableopts = $.extend({}, this.options.editableSettings);
                    editableopts.origin = this;
                    editableopts.callback = function(value, settings) {
                        settings.origin.onUpdateItem(this, value);
                    }
                    myItems.find("span.content").editable(this.editableReturnFunc, editableopts);
                }
            }
        },
        onUpdateItem: function(item, value) {
            var itemIndex = parseInt(item.getAttribute("data-index"));
            if (itemIndex !== null && !isNaN(itemIndex)) {
                this.items[itemIndex] = value;
                this._updateField();
            }
        },
        onRemoveItem: function(button) {
            var index = parseInt(button.getAttribute("data-index")),
                child = null,
                content = null,
                isConfirmed = true,
                isActualItem = true;
            if (index !== null && !isNaN(index)) {
                child = this.list.children("li.addlist-item").eq(index);
                content = child.find("span.content").text();
                if (content !== "" && content !== aisleten.characters.jeditablePlaceholder) {
                    isConfirmed = window.confirm(this.options.confirmMessage);
                    isActualItem = false;
                }
                if (isConfirmed) {
                    // remove view item
                    child.remove();
                    // remove from array
                    if (isActualItem) {
                        this.items.splice(index, 1);
                        this._updateField();
                    }
                    this._updateListIndices();
                }
            }
        },
        destroy: function() {

        },
        _updateListIndices: function() {
            var len = this.items.length,
                str = "";
            if (len > 0) {
                for (var i=0; i<len; i++) {
                    str = this.items[i];
                    this.list.find("span.content").each(function(myIndex) {
                        if ($(this).text() === str) {
                            this.setAttribute("data-index", i);
                            $(this).parent().children("button.removebtn").attr("data-index", i);
                        }
                    });
                }
            }
        },
        _updateField: function() {
            var jsonText = JSON.stringify(this.items);
            this.field.text(jsonText);
        }
    }

    $.fn.basicRulesEditableList = function(target, options) {
        return this.each(function() {
            var plugin = $.data(this, EditableList.prototype.name);
            if (!plugin) {
                $.data(this, EditableList.prototype.name, new EditableList(this, target));
            } else {
                if (target == "destroy") {
                    plugin.destroy();
                    $.removeData(this, EditableList.prototype.name);
                    plugin = null;
                } else if (target == "renderList") {
                    plugin.renderList();
                }
            }
        });
    }
})(jQuery, window);

/**
 * ATTACKS LIST PLUGIN
 */
 (function($, window) {
     var AttackList = function(element, options) {
         this.element = $(element);
         this.defaults.editableSettings.placeholder = aisleten.characters.jeditablePlaceholder;
         this.options = $.extend({}, this.defaults, options);
         this.init();
     }
     AttackList.prototype = {
         name: "plugin.Responsive5e.AttackList",
         options: null,
         element: null,
         list: null,
         addBtn: null,
         field: null,
         items: [],
         defaults: {
             isEditMode: true,
             numPlaceholders: 3,
             itemMarkup: '<li class="clearfix" data-index="{{{INDEX}}}"><div class="attack-stats"><span class="attack-name">{{{NAME}}}</span><span class="attack-bonus">{{{BONUS}}}</span><span class="attack-damage">{{{DAMAGE}}}</span></div>{{{BUTTON}}}</li>',
             removeBtnMarkup: '<button class="btn btn-default removebtn">&#10005;</button>',
             confirmMessage: 'Are you sure you want to remove this attack?',
             editableSettings: {
                 submit: "OK",
                 cssclass : 'jeditable_input',
                 placeholder : aisleten.characters.jeditablePlaceholder
             }
         },
         editableReturnFunc: function(value, settings) {
                 return value;
         },
         init: function() {
             if (this.element) {
                 this.list = this.element.find("ul.attacks-list");
                 this.addBtn = this.element.find("button.addbtn");
                 this.field = this.element.find("div.attacks-list-field span.dsf");
                 var self = this,
                     itemstr = this.field.text();
                 // set up button
                 if (this.options.isEditMode) {
                    this.list.addClass("attacks-list-editable");
                    this.addBtn.click(function(event) {
                        self.onAddItem();
                    });
                 } else {
                     this.addBtn.remove();
                 }
                 // get items
                 if (itemstr !== null && itemstr !== "" && itemstr !== aisleten.characters.jeditablePlaceholder) {
                    var rawItems = JSON.parse(itemstr),
                        len = rawItems.length;
                    for (var i=0; i<len; i++) {
                        if (rawItems[i] !== null) {
                            var attack = new AttackObj(rawItems[i]);
                            this.items[i] = attack;
                        }
                    }
                 }
                 this.renderList();
             }
         },
         onAddItem: function() {
            var markup = this.options.itemMarkup.replace("{{{INDEX}}}", this.items.length).replace("{{{NAME}}}","").replace("{{{BONUS}}}","").replace("{{{DAMAGE}}}","").replace("{{{BUTTON}}}", this.options.removeBtnMarkup),
                newItem = $(markup).appendTo(this.list),
                editableOpts = $.extend({}, this.options.editableSettings),
                self = this;
            editableOpts.callback = function(value, settings) {
                self.onUpdateItem($(this), value);
            }
            newItem.find("span.attack-name").editable(this.editableReturnFunc, $.extend({}, editableOpts, {'placeholder':'Click to edit name'}));
            newItem.find("span.attack-bonus").editable(this.editableReturnFunc, $.extend({}, editableOpts, {'placeholder':'bonus'}));
            newItem.find("span.attack-damage").editable(this.editableReturnFunc, $.extend({}, editableOpts, {'placeholder':'damage'}));
            newItem.find("button.removebtn").click(function() {
                self.onRemoveItem($(this));
            });
            if (this.items.length === 0) {
                this.list.children("li.header").show();
            }
         },
         renderList: function() {
            this.list.find("li").not(".header").remove();
            var attack = null,
                markup = "",
                totalMarkup = "",
                len = this.items.length,
                self = this;
            if (len > 0) {
                for (var i=0; i<len; i++) {
                    attack = this.items[i];
                    markup = this.options.itemMarkup.replace("{{{INDEX}}}", i).replace("{{{NAME}}}", attack.name);
                    markup = markup.replace("{{{BONUS}}}", attack.bonus).replace("{{{DAMAGE}}}", attack.damage);
                    if (this.options.isEditMode) {
                        markup = markup.replace("{{{BUTTON}}}", this.options.removeBtnMarkup);
                    } else {
                        markup = markup.replace("{{{BUTTON}}}", "");
                    }
                    totalMarkup += markup;
                }
                myItems = $(totalMarkup).appendTo(this.list);
                if (this.options.isEditMode) {
                    myItems.find("button.removebtn").click(function() {
                        self.onRemoveItem($(this));
                    });
                    var editableopts = $.extend({}, this.options.editableSettings);
                    editableopts.callback = function(value, settings) {
                        self.onUpdateItem($(this), value);
                    }
                    myItems.find("span.attack-name").editable(this.editableReturnFunc, editableopts);
                    myItems.find("span.attack-bonus").editable(this.editableReturnFunc, editableopts);
                    myItems.find("span.attack-damage").editable(this.editableReturnFunc, editableopts);
                }
            } else if (len === 0 && this.options.numPlaceholders > 0 && this.options.isEditMode) {
                for (var n=0; n<this.options.numPlaceholders; n++) {
                    this.onAddItem();
                    this.items[n] = null;
                }
                this._updateListIndices();
            } else if (len === 0) {
                this.list.children("li.header").hide();
            }
         },
         onUpdateItem: function(item, value) {
            var index = parseInt(item.parent().parent().attr("data-index")),
                attack = null;
            if (index > this.items.length || this.items[index] === undefined || this.items[index] === null) {
                attack = new AttackObj(null);
            } else {
                attack = this.items[index];
            }
            if (item.hasClass("attack-bonus")) {
                attack.bonus = value;
            } else if (item.hasClass("attack-damage")) {
                attack.damage = value;
            } else {
                attack.name = value;
            }
            this.items[index] = attack;
            this._updateField();
         },
         onRemoveItem: function(button) {
            var li = button.parent(),
                index = parseInt(li.attr("data-index")),
                isConfirmed = window.confirm(this.options.confirmMessage);
            if (isConfirmed && index !== null && !isNaN(index)) {
                // remove list item
                li.remove();
                // remove from array
                if (index < this.items.length) {
                    this.items.splice(index, 1);
                    this._updateField();
                }
                this._updateListIndices();
                // hide header if necessary
                if (this.items.length === 0) {
                    this.list.children("li.header").hide();
                }
            }
         },
         destroy: function() {

         },
         _updateListIndices: function() {
            this.list.find("li").not(".header").each(function(index) {
                this.setAttribute("data-index", index);
            });
         },
         _updateField: function() {
            var list = this.items.filter(function(element) {
                return (element !== null);
            });
            if (list.length > 0) {
                var jsonText = JSON.stringify(list);
                this.field.text(jsonText);
            } else {
                this.field.text("");
            }
         }
     }

     /* Attack Data Object */
     var AttackObj = function(args) {
        if (args !== null) {
            this.name = args.name;
            this.bonus = args.bonus;
            this.damage = args.damage;
        }
     }
     AttackObj.prototype = {
        name:'',
        bonus:'',
        damage:''
     }

     $.fn.basicRulesAttackList = function(target, options) {
         return this.each(function() {
             var plugin = $.data(this, AttackList.prototype.name);
             if (!plugin) {
                 $.data(this, AttackList.prototype.name, new AttackList(this, target));
             } else {
                 if (target == "destroy") {
                     plugin.destroy();
                     $.removeData(this, AttackList.prototype.name);
                     plugin = null;
                 } else if (target == "renderList") {
                     plugin.renderList();
                 }
             }
         });
     }
 })(jQuery, window);

/**
 * INVENTORY LIST PLUGIN
 */
 (function($, window) {
    var InventoryList = function(element, options) {
        this.element = $(element);
        this.isEditMode = options.isEditMode;
        this.editableSettings.placeholder = aisleten.characters.jeditablePlaceholder;
        this.editableSettings.inventoryList = this;
        this.init();
    }
    InventoryList.prototype = {
        name: "plugin.Responsive5e.InventoryList",
        options: null,
        element: null,
        field: null,
        addBtn: null,
        itemMap: null,
        isEditMode: false,
        itemMarkup: '<li class="inventory-item clearfix" data-id="{{{ID}}}">{{{HANDLE}}}<span class="item">{{{NAME}}}</span>{{{BTN}}}</li>',
        handleMarkup: '<span class="handle"><span class="pictonic icon-unordered-list"></span></span>',
        removeBtnMarkup: '<button class="btn btn-default removebtn">&#10005;</button>',
        confirmMessage: 'Remove item {{{NAME}}} from inventory?',
        lastUpdateEvent: null,
        lastResizeEvent: null,
        editableSettings: {
            submit: "OK",
            cssclass: 'jeditable_input',
            placeholder: aisleten.characters.jeditablePlaceholder,
            inventoryList: null,
            callback: function(value, settings) {
                settings.inventoryList.onUpdateItemName($(this), value);
            }
        },
        init: function() {
            var self = this;
            this.field = this.element.find(".dsf_equipment");
            this.addBtn = this.element.find("button.addbtn");
            this.itemMap = new InventoryItemMap();
            this.itemMap.fromJson(this.getFieldData());
            if (this.isEditMode) {
                this.element.find("ul.inventory-list").sortable({
                    connectWith: ".inventory-list",
                    items: "li.inventory-item",
                    opacity: 0.5,
                    placeholder: "sortable-placeholder",
                    handle: ".handle",
                    stop: function(event, ui) {
                        self.onListStop(this, event, ui);
                    },
                    receive: function(event, ui) {
                        self.onItemReceived(this, event, ui);
                    },
                    update: function(event, ui) {
                        self.onItemUpdated(this, event, ui);
                    }
                });
                this.addBtn.on("click", null, {plugin:this}, function(event) {
                    event.data.plugin.onAddItem();
                });
                $(window).on("resize", null, {plugin:this}, function(event) {
                    event.data.plugin.onResize();
                });
            }
            this.render();
        },
        render: function() {
            this.element.find("ul.inventory-list").empty();
            if (this.itemMap.getItemCount() > 0) {
                this.itemMap.resortColumns();
                var viewColumns = [this.element.find("ul.col-1-list"), this.element.find("ul.col-2-list"), this.element.find("ul.col-3-list")],
                    modelColumns = this.itemMap.getColumns(),
                    len = -1,
                    viewColumn = null,
                    modelColumn = [],
                    item = "",
                    html = null,
                    items = null;
                for (var i=0; i<3; i++) {
                    viewColumn = viewColumns[i];
                    modelColumn = modelColumns[i];
                    len = modelColumn.length;
                    if (len > 0) {
                        html = "";
                        for (var n=0; n<len; n++) {
                            item = this.renderItem(modelColumn[n]);
                            html += item;
                        }
                        items = $(html).appendTo(viewColumn);
                        if (this.isEditMode) {
                            this.addItemEventListeners(items);
                            this.adjustElementDimensions(items, viewColumn);
                        }
                    }
                }
            }
        },
        onAddItem: function() {
            var item = this.itemMap.createItem(),
                markup = this.renderItem(item),
                column = this.itemMap.getShortestColumn(),
                viewColumn = null;
            switch (column) {
                case 1:
                    viewColumn = this.element.find(".col-1-list");
                    break;
                case 2:
                    viewColumn = this.element.find(".col-2-list");
                    break;
                case 3:
                    viewColumn = this.element.find(".col-3-list");
                    break;
            }
            // add to view
            var viewItem = $(markup).appendTo(viewColumn);
            this.addItemEventListeners(viewItem);
            this.adjustElementDimensions(viewItem, viewColumn);
            // add to model
            this.itemMap.addItem(item, column);
            this.setFieldData();
        },
        onRemoveItem: function(button) {
            var li = button.parent("li.inventory-item"),
                itemId = li.attr("data-id"),
                item = this.itemMap.getItem(itemId),
                isConfirmed = true;
            if (item.name !== null && item.name !== "") {
                isConfirmed = window.confirm(this.confirmMessage.replace("{{{NAME}}}", item.name.toUpperCase()));
            }
            if (isConfirmed) {
                li.find("button.removebtn").off("click");
                li.remove();
                this.itemMap.removeItem(item);
                this.setFieldData();
            }
        },
        onItemUpdated: function(list, event, ui) {
            if (this.lastUpdateEvent === null || this.lastUpdateEvent.item !== ui.item || (event.timeStamp - this.lastUpdateEvent.time) > 20) {
                this.lastUpdateEvent = {'from':list, 'item':ui.item, 'time':event.timeStamp, 'isTransfer':false};
            }
        },
        onItemReceived: function(list, event, ui) {
            if (this.lastUpdateEvent !== null && ui.item === this.lastUpdateEvent.item && (event.timeStamp - this.lastUpdateEvent.time) < 20) {
                this.lastUpdateEvent.isTransfer = true;
                this.lastUpdateEvent.to = list;
            }
        },
        onListStop: function(list, event, ui) {
            if (this.lastUpdateEvent !== null && this.lastUpdateEvent.isTransfer && this.lastUpdateEvent.from === list && (event.timeStamp - this.lastUpdateEvent.time) < 20) {
                this.moveItem($(this.lastUpdateEvent.item), $(this.lastUpdateEvent.from), $(this.lastUpdateEvent.to));
            } else if (this.lastUpdateEvent !== null) {
                this.updateItemIndex($(this.lastUpdateEvent.item), $(this.lastUpdateEvent.from));
            }
            this.lastUpdateEvent = null;
        },
        onResize: function() {
            if (this.lastResizeEvent === null || ($.now() - this.lastResizeEvent) > 20) {
                var columns = [this.element.find("ul.col-1-list"), this.element.find("ul.col-2-list"), this.element.find("ul.col-3-list")],
                    column = null,
                    children = null;
                for (var i=0; i<3; i++) {
                    column = columns[i];
                    children = column.children("li.inventory-item");
                    this.adjustElementDimensions(children, column);
                }
                this.lastResizeEvent = $.now();
            }
        },
        onUpdateItemName: function(field, value) {
            var item = field.parent("li.inventory-item"),
                column = item.parent("ul.inventory-list"),
                itemId = item.attr("data-id"),
                itemObj = this.itemMap.getItem(itemId);
            if (itemObj !== null) {
                itemObj.name = value;
                this.setFieldData();
            }
            this.adjustElementDimensions(item, column);
        },
        moveItem: function(item, oldColumn, newColumn) {
            var itemId = parseInt(item.attr("data-id")),
                oldColumnNum = this.getColumnNumber(oldColumn),
                newColumnNum = this.getColumnNumber(newColumn);
            if (!isNaN(itemId) && oldColumn != newColumn && oldColumnNum > -1 && newColumnNum > -1) {
                var itemObj = this.itemMap.getItemFromColumn(itemId, oldColumnNum),
                    newIndex = this.getItemIndexInColumn(item, newColumn);
                this.itemMap.removeItem(itemObj);
                itemObj.index = newIndex;
                this.itemMap.addItem(itemObj, newColumnNum);
                this.setFieldData();
                this.adjustElementDimensions(item, newColumn);
            }
        },
        updateItemIndex: function(item, column) {
            var itemId = parseInt(item.attr("data-id")),
                columnNo = this.getColumnNumber(column),
                newIndex = this.getItemIndexInColumn(item, column);
            if (!isNaN(itemId) && itemId > -1 && columnNo > -1 && newIndex > -1) {
                this.itemMap.changeItemIndex(itemId, columnNo, newIndex);
                this.setFieldData();
            }
        },
        renderItem: function(item) {
            var itemstr = this.itemMarkup.replace("{{{ID}}}", item.id).replace("{{{NAME}}}", item.name);
            if (this.isEditMode) {
                itemstr = itemstr.replace("{{{HANDLE}}}", this.handleMarkup).replace("{{{BTN}}}", this.removeBtnMarkup);
            } else {
                itemstr = itemstr.replace("{{{HANDLE}}}", "").replace("{{{BTN}}}", "");
            }
            return itemstr;
        },
        addItemEventListeners: function(item) {
            item.find("button.removebtn").on("click", null, {plugin:this}, function(event) {
                event.data.plugin.onRemoveItem($(this));
            });
            item.find("span.item").editable(this.editableFunc, this.editableSettings);
        },
        adjustElementDimensions: function(item, column) {
            if (this.isEditMode) {
                var width = column.innerWidth()-94;
                item.find("span.item").width(width);
                var timeout = window.setTimeout(function() {
                    item.each(function() {
                        var height = $(this).height(),
                            itemHeight = $(this).find("span.item").outerHeight();
                        if (itemHeight < 42) {
                            $(this).find("span.handle").css("height","");
                        } else if ((height-itemHeight)>20) {
                            $(this).find("span.handle").height(itemHeight+7);
                        } else {
                            $(this).find("span.handle").height(height);
                        }
                    });
                }, 25);
            }
        },
        editableFunc: function(value, settings) {
            return value;
        },
        /**
         * gets column number, given the column's element as a jQuery object
         * @param  {jQuery} viewColumn column element as jQuery object
         * @return {int}               column number
         */
        getColumnNumber: function(viewColumn) {
            if (viewColumn.hasClass("col-1-list")) {
                return 1;
            } else if (viewColumn.hasClass("col-2-list")) {
                return 2;
            } else if (viewColumn.hasClass("col-3-list")) {
                return 3;
            }
            return -1;
        },
        /**
         * gets the index of the item element (li) within the given column (ul) element.
         * @param  {jQuery} item   item element as jQuery object
         * @param  {jQuery} column column element as jQuery object
         * @return {int}           item index if found, -1 otherwise
         */
        getItemIndexInColumn: function(item, column) {
            var children = column.children("li"),
                len = children.length;
            for (var i=0; i<len; i++) {
                if (children[i].getAttribute("data-id") === item.attr("data-id")) {
                    return i;
                }
            }
            return -1;
        },
        getFieldData: function() {
            return this.field.text();
        },
        setFieldData: function() {
            var str = this.itemMap.toJson();
            this.field.text(str);
        }
    }
    var InventoryItemMap = function() {
        this.column1 = [];
        this.column2 = [];
        this.column3 = [];
        itemsCreated = -1;
    }
    InventoryItemMap.prototype = {
        column1: null,
        column2: null,
        column3: null,
        itemsCreated: null,
        fromJson: function(str) {
            // read from json
            if (!$.Responsive5e.isValUnedited(str)) {
                var object = JSON.parse(str);
                if (object.hasOwnProperty("0")) {
                    this.column1 = this.recoverColumn(this.column1, object["0"]);
                }
                if (object.hasOwnProperty("1")) {
                    this.column2 = this.recoverColumn(this.column2, object["1"]);
                }
                if (object.hasOwnProperty("2")) {
                    this.column3 = this.recoverColumn(this.column3, object["2"]);
                }
                this.itemsCreated = this.getHighestId();
            }
        },
        toJson: function() {
            return JSON.stringify({'0':this.column1, '1':this.column2, '2':this.column3});
        },
        getItemCount: function() {
            return this.column1.length + this.column2.length + this.column3.length;
        },
        getColumns: function() {
            return [this.column1, this.column2, this.column3];
        },
        getShortestColumn: function() {
            var minlen = Math.min(this.column1.length, this.column2.length, this.column3.length);
            if (minlen === this.column1.length) {
                return 1;
            } else if (minlen === this.column2.length) {
                return 2;
            } else if (minlen === this.column3.length) {
                return 3;
            }
            return -1;
        },
        resortColumns: function() {
            this.column1.sort(this.indexSort);
            this.column2.sort(this.indexSort);
            this.column3.sort(this.indexSort);
        },
        createItem: function() {
            var item = new InventoryItem();
            this.itemsCreated++;
            item.id = this.itemsCreated;
            return item;
        },
        getItem: function(id) {
            var itemId = parseInt(id),
                item = null;
            item = this._getItemFromColumn(itemId, this.column1);
            if (item === null) {
                item = this._getItemFromColumn(itemId, this.column2);
                if (item === null) {
                    item = this._getItemFromColumn(itemId, this.column3);
                }
            }
            return item;
        },
        getItemFromColumn: function(id, columnNo) {
            var col = this.getColumnByNum(columnNo);
            if (col !== null) {
                return this._getItemFromColumn(id, col);
            }
            return null;
        },
        _getItemFromColumn: function(id, column) {
            var len = column.length;
            for (var i=0; i<len; i++) {
                if (column[i].id === id) {
                    return column[i];
                }
            }
            return null;
        },
        addItem: function(item, columnNo) {
            var col = this.getColumnByNum(columnNo);
            if (item.index < 0) {
                col.push(item);
            } else {
                col.splice(item.index, 0, item);
            }
            this.updateIndexes(col);
        },
        removeItem: function(item) {
            if (this.column1.indexOf(item) > -1) {
                this.column1.splice(item.index, 1);
                this.updateIndexes(this.column1);
            } else if (this.column2.indexOf(item) > -1) {
                this.column2.splice(item.index, 1);
                this.updateIndexes(this.column2);
            } else if (this.column3.indexOf(item) > -1) {
                this.column3.splice(item.index, 1);
                this.updateIndexes(this.column3);
            }
        },
        changeItemIndex: function(id, columnNo, newIndex) {
            var column = this.getColumnByNum(columnNo),
                item = this._getItemFromColumn(id, column);
            if (item !== null && item.index !== newIndex) {
                column.splice(item.index, 1);
                item.index = newIndex;
                column.splice(newIndex, 0, item);
                this.updateIndexes(column);
            }
        },
        recoverColumn: function(column, json) {
            if (typeof json === "object") {
                for (var key in json) {
                    column.push(json[key]);
                }
                column.sort(this.indexSort);
            } else if (typeof json === "array") {
                column = json;
            }
            return column;
        },
        updateIndexes: function(column) {
            var len = column.length;
            for (var i=0; i<len; i++) {
                column[i].index = i;
            }
        },
        getColumnByNum: function(columnNo) {
            switch (columnNo) {
                case 1:
                    return this.column1;
                    break;
                case 2:
                    return this.column2;
                    break;
                case 3:
                    return this.column3;
                    break;
            }
            return null;
        },
        getHighestId: function() {
            var cols = this.getColumns(),
                col = null,
                len = -1,
                highestId = -1;
            for (var i=0; i<3; i++) {
                col = cols[i];
                len = col.length;
                for (var n=0; n<len; n++) {
                    if (col[n].id > highestId) {
                        highestId = col[n].id;
                    }
                }
            }
            return highestId;
        },
        indexSort: function(a, b) {
            if (a.index > b.index) {
                return 1;
            } else if (b.index > a.index) {
                return -1;
            }
            return 0;
        }
    }
    var InventoryItem = function() {
    }
    InventoryItem.prototype = {
        id:-1,
        name:"",
        index:-1
    }
    $.fn.basicRulesInventory = function(target, options) {
        return this.each(function() {
            var plugin = $.data(this, InventoryList.prototype.name);
            if (!plugin) {
                $.data(this, InventoryList.prototype.name, new InventoryList(this, target));
            } else {
                if (target == "destroy") {
                    plugin.destroy();
                    $.removeData(this, InventoryList.prototype.name);
                    plugin = null;
                }
            }
        });
    }
 })(jQuery, window);

/**
 * RESPONSIVE 5E MAIN SINGLETON
 */
(function($) {
    var Responsive5e = function() {}
    Responsive5e.prototype = {
        abilities: ["str","dex","con","int","wis","cha"],
        containerId: null,
        slug: null,
        isEditMode: false,
        init: function() {
            // note: this gets called AFTER onDataPreLoad and onDataPostLoad!
            if (this.isEditMode) {
                this.makeEditables();
            } else {
                // at least fill in the values so that they don't look weird
                $(".ds_responsive5e .mdash-editable").each(function() {
                    if ($(this).text() === "") {
                        $(this).text("––");
                    }
                });
            }
        },
        onDataPreLoad: function(args) {
            if (aisleten.characters) {
                aisleten.characters.jeditableSubmit = "OK";
                aisleten.characters.jeditablePlaceholder = "click to edit";
            }
            this.containerId = args.containerId;
            this.slug = args.slug;
            this.isEditMode = args.isEditable;
        },
        onDataPostLoad: function(args) {
            this.updateAllAbilityModifiers();
            $("button.toggle").not(".ds_responsive5e .use-spellcasting-toggle button.toggle").basicRulesToggleButton({
                'isEditMode': this.isEditMode
            });
            $("div.addlist-container").basicRulesEditableList({
                'isEditMode': this.isEditMode
            });
            $("div.attacks-list-container").basicRulesAttackList({
                'isEditMode': this.isEditMode
            });
            $("div.inventory").basicRulesInventory({
                'isEditMode': this.isEditMode
            })
            // get biography and picture if not in edit mode
            if (!this.isEditMode && dynamic_sheet_attrs) {
                // get biography
                if (dynamic_sheet_attrs.hasOwnProperty("bio")) {
                    $(".ds_responsive5e .dst_bio").html(dynamic_sheet_attrs["bio"]);
                }
                // get image
                if (dynamic_sheet_attrs.hasOwnProperty("avatar_image")) {
                    $(".ds_responsive5e .dst_avatar_image").html(dynamic_sheet_attrs["avatar_image"]);
                }
            } else {
                $(".ds_responsive5e .biography").hide();
            }
            this.initSpellcastingPage();
        },
        onDataChange: function(fieldName, fieldValue) {
            for (var i=0; i<6; i++) {
                if (this.abilities[i] === fieldName) {
                    this.updateAbilityModifier(this.abilities[i], fieldValue);
                    return;
                }
            }
        },
        onPreSave: function() {
            var self = this;
            $(".ds_responsive5e .dsf").not(".checkbox").not(".readonly").each(function() {
                var val = $(this).text();
                if (self.isValUnedited(val)) {
                    $(this).text("");
                }
            });
        },
        initSpellcastingPage: function() {
            var isSpellcaster = $(".ds_responsive5e .dsf_use_spellcasting input").val();
            if (this.isEditMode || isSpellcaster == 1) {
                $(".ds_responsive5e .spellcasting").show();
                $(".ds_responsive5e .use-spellcasting-toggle button.toggle").basicRulesToggleButton({
                    'isEditMode': this.isEditMode,
                    'changeButtonText': true,
                    'textTrue': 'Yes',
                    'textFalse': 'No'
                });
            } else {
                $(".ds_responsive5e .spellcasting").hide();
            }
        },
        makeEditables: function() {
            var self = this;
            var editableFunc = function(value, settings) {
                return value;
            }
            var editableOpts = {
                'submit': aisleten.characters.jeditableSubmit,
                'cssclass': 'jeditable_input',
                'placeholder':"––",
                'callback': function(value, settings) {
                    // let's just cut to the chase
                    var fieldName = aisleten.characters.findDsfClass($(this));
                    self.onDataChange(fieldName, value);
                }
            }
            $(".ds_responsive5e .mdash-editable").each(function() {
                $(this).removeClass("readonly");
                $(this).editable(editableFunc, editableOpts);
            });
        },
        updateAllAbilityModifiers: function() {
            var statSelector = "",
                statVal = "",
                modSelector = "";
            for (var i=0; i<6; i++) {
                statSelector = ".dsf_" + this.abilities[i];
                statVal = $(statSelector).text();
                this.updateAbilityModifier(this.abilities[i], statVal);
            }
        },
        updateAbilityModifier: function(stat, newValue) {
            var val = parseInt(newValue);
            if (val && !isNaN(val)) {
                var mod = Math.floor((val-10)/2.0),
                    modStr = "",
                    modSelector = "." + stat + "_mod",
                    saveSelector = ".dsf_" + stat + "_save",
                    saveVal = $(saveSelector).text(),
                    skillColumnSelector = "." + stat + "_skills span.dsf",
                    skillVal = "";
                // update modifier
                if (mod > 0) {
                    modStr = "+" + mod;
                } else {
                    modStr = mod + "";
                }
                $(modSelector).text(modStr);
                // update save value
                if (this.isValUnedited(saveVal)) {
                    // if save hasn't been set yet
                    $(saveSelector).text(mod);
                }
                // update skills
                $(skillColumnSelector).each(function() {
                    skillVal = $(this).text();
                    if ($.Responsive5e.isValUnedited(skillVal)) {
                        $(this).text(mod);
                    }
                });
            }
        },
        isValUnedited: function(val) {
            return (val === null || val === "" || val === "––" || val === aisleten.characters.jeditablePlaceholder);
        }
    }
    $.Responsive5e = new Responsive5e();
})(jQuery);

function responsive5e_dataChange(options) {
    $.Responsive5e.onDataChange(options['fieldName'], options['fieldValue']);
}
function responsive5e_dataPreLoad(options) {
    $.Responsive5e.onDataPreLoad(options);
}
function responsive5e_dataPostLoad(options) {
    $.Responsive5e.onDataPostLoad(options);
}
function responsive5e_dataPreSave(options) {
    $.Responsive5e.onPreSave();
}

/**
 * DOCUMENT READY FUNCTION
 */
$(document).ready(function() {
    var timeout = window.setTimeout(function() {
        $.Responsive5e.init();
    }, 100);
});

