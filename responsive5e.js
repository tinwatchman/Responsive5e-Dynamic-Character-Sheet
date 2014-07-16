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
                var fieldName = this.element.attr("data-fieldname"),
                    plugin = this;
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
                    this.element.click(function() {
                        plugin.onClick();
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
                var self = this,
                    itemstr = this.field.text();
                // set up button
                if (this.options.isEditMode) {
                    this.addBtn.click(function(event) {
                        self.onAddItem();
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
                editableOptions = $.extend({}, this.options.editableSettings)
                self = this;
            editableOptions.callback = function(value, settings) {
                    self.onUpdateItem(this, value);
            }
            newItem.find("span.content").editable(this.editableReturnFunc, editableOptions);
            newItem.find("button.removebtn").click(function() {
                self.onRemoveItem(this);
            });
        },
        renderList: function() {
            this.list.empty();
            var len = this.items.length,
                markup = "",
                btnMarkup = "",
                totalMarkup = "",
                myItems = null,
                self = this;
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
                    myItems.find("button.removebtn").click(function() {
                        self.onRemoveItem(this);
                    });
                    var editableopts = $.extend({}, this.options.editableSettings);
                    editableopts.callback = function(value, settings) {
                        self.onUpdateItem(this, value);
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
                isConfirmed = true;
            if (index !== null && !isNaN(index)) {
                child = this.list.children("li.addlist-item").eq(index);
                content = child.find("span.content").text();
                if (content !== "" && content !== aisleten.characters.jeditablePlaceholder) {
                    isConfirmed = window.confirm(this.options.confirmMessage);
                }
                if (isConfirmed) {
                    // remove view item
                    child.remove();
                    // remove from array
                    this.items.splice(index, 1);
                    this._updateListIndices();
                    this._updateField();
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
            if (aisleten.characters) {
                aisleten.characters.jeditableSubmit = "OK";
                aisleten.characters.jeditablePlaceholder = "click to edit";
            }
            this.updateAllAbilityModifiers();
        },
        onDataPreLoad: function(args) {
            window.console.log("onDataPreLoad");
            if (aisleten.characters) {
                aisleten.characters.jeditableSubmit = "OK";
                aisleten.characters.jeditablePlaceholder = "click to edit";
            }
            this.containerId = args.containerId;
            this.slug = args.slug;
            this.isEditMode = args.isEditable;
        },
        onDataPostLoad: function(args) {
            window.console.log("onDataPostLoad");
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
        addField: function(fieldName) {
            if (aisleten.characters) {
                aisleten.characters.bindField(fieldName, this.slug, this.containerId);
            }
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
            return (val === "X" || val === null || val === "" || val === "&ndash;" || val === "&mdash;" || val === aisleten.characters.jeditablePlaceholder);
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
/**
 * DOCUMENT READY FUNCTION
 */
$(document).ready(function() {
    $.Responsive5e.init();
});

