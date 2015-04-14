/**
 * @class persistJS
 * @verson 1.1
 * @author Christopher D Langton <chris@codewiz.biz>
 * @classDescription Automatically Persist Forms across page refreshes
 */
// PersistFormsOptions = {autoPersistAll: false};
(function (window, $, undefined) {
  var PersistForms = function PersistForms(options) {
    if (window === this) {
      return new PersistForms(options);
    }
    var defaults = {
      autoPersistAll: true,
      keyPropName: 'id', // define which form property to use for the key when persisting form data
      watching: []
    };
    this.options = $.extend({}, defaults, window.PersistFormsOptions||{}, options);
    $.fn.serializeObject = function serializeObject(){
      var self = this,
          json = {},
          push_counters = {},
          patterns = {
            "validate": /^[a-zA-Z][a-zA-Z0-9_]*(?:\[(?:\d*|[a-zA-Z0-9_]+)\])*$/,
            "key":      /[a-zA-Z0-9_]+|(?=\[\])/g,
            "push":     /^$/,
            "fixed":    /^\d+$/,
            "named":    /^[a-zA-Z0-9_]+$/
          };
      this.build = function (base, key, value) {
        base[key] = value;
        return base;
      };
      this.push_counter = function (key) {
        if (push_counters[key] === undefined)
          push_counters[key] = 0;
        return push_counters[key]++;
      };
      $.each($(this).serializeArray(), function() {
        if (!patterns.validate.test(this.name))
          return;
        var k,
            keys = this.name.match(patterns.key),
            merge = this.value,
            reverse_key = this.name;
        while ((k = keys.pop()) !== undefined) {
          reverse_key = reverse_key.replace(new RegExp("\\[" + k + "\\]$"), '');
          if (k.match(patterns.push))
            merge = self.build([], self.push_counter(reverse_key), merge);
          else if (k.match(patterns.fixed))
            merge = self.build([], k, merge);
          else if (k.match(patterns.named))
            merge = self.build({}, k, merge);
        }
        json = $.extend(true, json, merge);
      });
      return json;
    };
    return this;
  };
  PersistForms.fn = PersistForms.prototype = {
    /**
     * starts the form watcher
     * @returns {PersistForms}
     */
    init: function init(){
      var $that = this,
          keyPropName = $that.options.keyPropName;
      $(document).on('input change','form['+keyPropName+'] input,form['+keyPropName+'] select,form['+keyPropName+'] textarea',function(){
        var $form = $(this).parent('form');
        PersistFormsInstance.set($form.prop($that.options.keyPropName), $form.serializeObject());
      });
      $('form['+keyPropName+']').each(function(){
        var key = $(this).prop(keyPropName);
        $that.options.watching.push(key);
        if ($that.options.autoPersistAll) {
          $that.restore(key);
        }
      });
      return this;
    },
    /**
     * tests if a variable is a valid JSON string
     * @param test string
     * @returns {boolean}
     */
    isJSON: function isJSON(test) {
      if ("string" !== typeof test || '' === test) return false;
      return /^[\],:{}\s]*$/.test(test.replace(/\\["\\\/bfnrtu]/g, '@').
        replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').
        replace(/(?:^|:|,)(?:\s*\[)+/g, ''));
    },
    /**
     * retrieves values from persistent store
     * @param key string
     * @returns {string|int|Array|Object}
     */
    get: function get(key) {
      return PersistFormsInstance.db.call(this, key);
    },
    /**
     * saves values to the persistent store
     * @param key string
     * @param value {string|int|Array|Object}
     * @returns {PersistForms}
     */
    set: function get(key, value) {
      return PersistFormsInstance.db.call(this, key, value);
    },
    /**
     * restores form values from persistent store
     * @param key string
     * @param fn callback when restoring is complete
     * @returns {PersistForms}
     */
    restore: function restore(key, fn) {
      var that = this,
          formData = this.get(key),
          keyPropName = this.options.keyPropName;
      $.when($('form['+keyPropName+'="'+key+'"] input,form['+keyPropName+'="'+key+'"] select,form['+keyPropName+'="'+key+'"] textarea').each(function(){
        var $field = $(this),
            fieldName = $field.prop('name').replace(/\[\]+$/,'');
        if (formData !== null && formData[fieldName]) {
          if (this.tagName === 'SELECT' && this.multiple) {
            for (var i=0; i<formData[fieldName].length;i++) {
              $field.children('option').filter('[value="'+formData[fieldName][i]+'"]').prop('selected', 'selected');
            }
          } else if (this.type === 'radio' || this.type === 'checkbox') {
            for (var k=0; k<formData[fieldName].length;k++) {
              $field.filter('[value="'+formData[fieldName][k]+'"]').prop('checked', 'checked');
            }
          } else {
            $field.val(formData[fieldName]);
          }
        }
      })).then(function(){
        if ('function' === typeof fn){
          fn.call(that, formData, keyPropName);
        }
      });

      return this;
    },
    /**
     * @param name string
     * @param value string|int|Array|Object
     * @param expires int|Date optional default 365 days
     * @param path string optional
     * @param domain string optional
     * @returns {string} cookie
     */
    createCookie: function createCookie(name, value, expires, path, domain) {
      if ('undefined' === typeof expires) expires = 365;
      if ('string' !== typeof value) value = JSON.stringify(value);
      var cookie = name + "=" + escape(value) + ";";
      if (expires) {
        if(expires instanceof Date) {// If it's a date
          if (isNaN(expires.getTime()))// If it isn't a valid date
            expires = new Date();
        } else
          expires = new Date(new Date().getTime() + parseInt(expires) * 1000 * 60 * 60 * 24);
        cookie += "expires=" + expires.toGMTString() + ";";
      }
      if (path)
        cookie += "path=" + path + ";";
      if (domain)
        cookie += "domain=" + domain + ";";

      document.cookie = cookie;
      return cookie;
    },
    /**
     * @param name string
     * @returns {string|int|Array|Object}
     */
    getCookie: function getCookie(name) {
      var regexp = new RegExp("(?:^" + name + "|;\s*"+ name + ")=(.*?)(?:;|$)", "g");
      var result = regexp.exec(document.cookie);
      return (result === null) ? null : (this.isJSON(unescape(result[1]))) ? JSON.parse(unescape(result[1])) : unescape(result[1]);
    },
    /**
     * attempt to use LocalStorage or fallback to cookie
     * @param key string
     * @param item string|int|Array|Object optional if passed the method saves data, if omitted the method returns data
     * @returns {string}
     */
    db: function db(key,item) {
      var text;
      if ((function(){var mod='testHasLocalStorage';try{window.localStorage.setItem(mod,mod);window.localStorage.removeItem(mod);return true;}catch(e){return false;}})() === true){
        if ("undefined" === typeof item) {
          text = window.localStorage.getItem(key);
          return (this.isJSON(text) ? JSON.parse(text) : text);
        } else {
          return window.localStorage.setItem(key, 'string' !== typeof item ? JSON.stringify(item) : item);
        }
      } else {
        if ("undefined" === typeof item) {
          text = this.getCookie(key);
          return (this.isJSON(text) ? JSON.parse(text) : text);
        } else {
          return this.createCookie(key, 'string' !== typeof item ? JSON.stringify(item) : item);
        }
      }
    }
  };
  window.PersistForms = PersistForms;
  PersistFormsInstance = (new PersistForms()).init();
})(window, jQuery);