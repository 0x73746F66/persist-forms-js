/**
 * @class persistJS
 * @verson 1.1 [dev]
 * @author Christopher D Langton <chris@codewiz.biz>
 * @classDescription Automatically Persist Forms across page refreshes
 * @compatibility:
 *        IE 8+
 *        Firefox 21+
 *        Chrome 27+
 *        Safari 5.1+
 *        Opera 15+
 *        iOS Safari 4.0+
 *        Android Browser 2.1+
 *        Chrome for Android 28+
 *        Firefox for Android 23+
 *        Blackberry Browser 7.0+
 */
(function (window, undefined) {
    if ("localStorage" in window && "querySelectorAll" in document && "JSON" in window) {
        var persist = function () {
            if (window === this) {
                return new persist();
            }
            this.isNodeOfType = function (ele, type) {
                return (
                    ele.nodeName.toLowerCase() === type.toLowerCase() ? true : false
                    );
            };
            this.getAncestorOfType = function (ele, type) {
                return (
                    this.isNodeOfType(ele.parentNode, type) ) ? ele.parentNode :
                    this.getAncestorOfType(ele.parentNode, type
                    );
            };
            this.isNode = function (o) {
                return (
                    typeof Node === "object" ? o instanceof Node :
                        o && typeof o === "object" && typeof o.nodeType === "number" && typeof o.nodeName === "string"
                    );
            };
            this.isElement = function (o) {
                return (
                    typeof HTMLElement === "object" ? o instanceof HTMLElement :
                        o && typeof o === "object" && o !== null && o.nodeType === 1 && typeof o.nodeName === "string"
                    );
            };
            if (this.isElement(this) || this.isNode(this)) {
                var form = this.getAncestorOfType(this, 'form');
                persist().dbSave(form.id, this.name, this.value);
            }
            return this;
        };
        persist.fn = persist.prototype = {
            dbSave: function (form, input, value) {
                this.validJsonString = function (str) {
                    try {
                        JSON.parse(str);
                    } catch (e) {
                        return false;
                    }
                    return true;
                };
                var formJson = "";
                var formObj = {};
                var db = window.localStorage;
                if (db.getItem(form)) {
                    formJson = db.getItem(form);
                    if (this.validJsonString(formJson)) formObj = JSON.parse(formJson);
                }
                formObj[input] = value;
                db.setItem(form, JSON.stringify(formObj));

                return this;
            },
            updateDomFromDb: function (index, key) {
                this.validJsonString = function (str) {
                    try {
                        JSON.parse(str);
                    } catch (e) {
                        return false;
                    }
                    return true;
                };
                var formJson = "";
                var formObj = {};
                var db = window.localStorage;
                if (db.getItem(index)) {
                    formJson = db.getItem(index);
                    if (this.validJsonString(formJson)) formObj = JSON.parse(formJson);
                    var eleNode = document.querySelectorAll('form#' + index + ' [name="' + key + '"]');
                    if (typeof formObj[key] !== "undefined")
                        if (eleNode.length > 1) {
                            var ele;
                            for (var n = 0; n < eleNode.length; n++) {
                                ele = eleNode[n];
                                if (ele.value === formObj[key])
                                    ele.checked = true;
                            }
                        } else {
                            if (eleNode[0].nodeName.toLowerCase() === "textarea")
                                eleNode[0].text = formObj[key];
                            else if (eleNode[0].nodeName.toLowerCase() === "select") {
                                var options = eleNode[0].options;
                                for (var o = 0; o < options.length; o++) {
                                    if (options[o].value === formObj[key]) {
                                        options[o].selected = true;
                                    }
                                }
                            } else
                                eleNode[0].value = formObj[key];
                        }
                }

                return this;
            },
            serialize: function (selector) {
                if (typeof selector === "undefined") selector = "form[persist]";
                var forms = document.querySelectorAll(selector);
                var persistTemp = [];
                var formNode;
                var formId = "";
                var eleNode;
                var eleNodeName = "";
                for (var f = 0; f < forms.length; f++) {
                    formNode = forms[f];
                    formId = formNode.id;
                    persistTemp[formId] = {};
                    for (var i = 0; i < formNode.length; i++) {
                        eleNode = formNode[i];
                        eleNodeName = eleNode.nodeName.toLowerCase();
                        if (eleNodeName === "input" || eleNodeName === "select" || eleNodeName === "textarea") {
                            if (eleNode.name.length > 0) {
                                if ((eleNode.type === "radio" || eleNode.type === "checkbox")) {
                                    if (eleNode.checked)
                                        persistTemp[formId][eleNode.name] = eleNode.value;
                                } else if (eleNode.name === "select") {
                                    persistTemp[formId][eleNode.name] = eleNode.value;
                                } else if (eleNode.name === "textarea") {
                                    if (eleNode.length > 0)
                                        persistTemp[formId][eleNode.name] = eleNode.text;
                                } else {
                                    if (eleNode.length > 0)
                                        persistTemp[formId][eleNode.name] = eleNode.value;
                                }
                            }
                        }
                    }
                }
                return persistTemp;
            },
            dbClean: function (form, f) {
                var db = window.localStorage;
                if (db.getItem(form).length > 0) db.removeItem(form);
                if ('function' === typeof f) f();
                return this;
            },
            dbClear: function (f) {
                var db = window.localStorage;
                for (index in localStorage)
                    if (document.querySelectorAll("form#" + index).length > 0)
                        db.removeItem(index);
                if ('function' === typeof f) f();
                return this;
            },
            formClear: function (form, f) {
                var nodes = ( "string" !== typeof form ) ? document.querySelectorAll("form[persist] *") :
                    document.querySelectorAll("form#" + form + " *");
                var eleNodeName = "";
                for (var i = 0; i < nodes.length; i++) {
                    eleNodeName = nodes[i].nodeName.toLowerCase();
                    if ((eleNodeName === "input" || eleNodeName === "select" || eleNodeName === "textarea") && (nodes[i].name.length > 0))
                        nodes[i].value = "";
                }
                if ('function' === typeof f) f();
                return this;
            },
            init: function () {
                var nodes = document.querySelectorAll("form[persist] *");
                var eleNodeName = "";
                for (var i = 0; i < nodes.length; i++) {
                    eleNodeName = nodes[i].nodeName.toLowerCase();
                    if ((eleNodeName === "input" || eleNodeName === "select" || eleNodeName === "textarea") && (nodes[i].name.length > 0))
                        nodes[i].onchange = persist;
                }
                var db = window.localStorage;
                var forms = document.querySelectorAll("form[persist]");
                var formNode;
                var formId = "";
                var eleNode;
                for (var f = 0; f < forms.length; f++) {
                    formNode = forms[f];
                    if (formNode.id.length > 0) {
                        formId = formNode.id;
                        if (db.getItem(formId))
                            for (var n = 0; n < formNode.length; n++) {
                                eleNode = formNode[n];
                                eleNodeName = eleNode.nodeName.toLowerCase();
                                if ((eleNodeName === "input" || eleNodeName === "select" || eleNodeName === "textarea") && (eleNode.name.length > 0))
                                    this.updateDomFromDb(formId, eleNode.name);
                            } else {
                            var serialized = this.serialize("form[persist]#" + formId);
                            db.setItem(formId, JSON.stringify(serialized[formId]));
                        }
                    }
                }
                return this;
            }
        };
        window.persist = persist;
        persist().init();
    }
})(window);