/**
 * @class persistJS
 * @verson 1.0
 * @author Christopher D Langton <chris@codewiz.biz>
 * @classDescription Automatically Persist Forms across page refreshes
 * @compatibility:
 * 		IE 8+
 * 		Firefox 21+
 * 		Chrome 27+
 * 		Safari 5.1+
 * 		Opera 15+
 * 		iOS Safari 4.0+
 * 		Android Browser 2.1+
 * 		Chrome for Android 28+
 * 		Firefox for Android 23+
 * 		Blackberry Browser 7.0+
*/
(function(window, undefined){ if ( "sessionStorage" in window && "querySelectorAll" in document && "JSON" in window ) {
    var persist = function (){
		if ( window === this ) {
            return new persist();
        }
		this.isNodeOfType = function(ele,type) {
			return ( ele.nodeName.toLowerCase() === type.toLowerCase() ) ? true : false;
		};
		this.getAncestorOfType = function(ele,type) {
			if ( this.isNodeOfType(ele.parentNode,type) ) return ele.parentNode;
			else return this.getAncestorOfType(ele.parentNode,type);
		};
		this.isNode = function(o){
			return (
				typeof Node === "object" ? o instanceof Node :
					o && typeof o === "object" && typeof o.nodeType === "number" && typeof o.nodeName==="string"
				);
		};
		this.isElement = function(o){
			return (
				typeof HTMLElement === "object" ? o instanceof HTMLElement :
					o && typeof o === "object" && o !== null && o.nodeType === 1 && typeof o.nodeName==="string"
				);
		};
		if ( this.isElement(this) || this.isNode(this) ) {
			var form = this.getAncestorOfType( this , 'form' );
			persist().dbSave( form.id , this.name , this.value );
		}
		return this;
	};
	persist.fn = persist.prototype = {
		dbSave: function( index , key , value ){
			this.validJsonString = function(str) {
				try {
					JSON.parse(str);
				} catch (e) {
					return false;
				}
				return true;
			};
			var formJson = "";
			var formObj = {};
			var db = window.sessionStorage;
			if ( db.getItem( index ) ) {
				formJson = db.getItem( index );
				if ( this.validJsonString(formJson) ) formObj = JSON.parse(formJson);
			}
			formObj[key] = value;
			db.setItem( index, JSON.stringify(formObj));
			
			return this;
		},
		updateDomFromDb: function( index , key ){
			this.validJsonString = function(str) {
				try {
					JSON.parse(str);
				} catch (e) {
					return false;
				}
				return true;
			};
			var formJson = "";
			var formObj = {};
			var db = window.sessionStorage;
			if ( db.getItem( index ) ) {
				formJson = db.getItem( index );
				if ( this.validJsonString(formJson) ) formObj = JSON.parse(formJson);
				var eleNode = document.querySelectorAll('form#'+index+' [name="'+key+'"]');
				if ( typeof formObj[key] !== "undefined" )
				if ( eleNode.length > 1 ) {
					var ele;
					for ( var n = 0; n < eleNode.length; n++ ) {
						ele = eleNode[n];
						if ( ele.value === formObj[key] )
							ele.checked = true;
					}
				} else {
					if ( eleNode[0].name === "textarea" )
						eleNode[0].text = formObj[key];
					else
						eleNode[0].value = formObj[key];
				}
			}
			
			return this;
		},
		serialize: function(selector){
			if ( typeof selector === "undefined" ) selector = "form[persist]";
			var forms = document.querySelectorAll(selector);
			var db = window.sessionStorage;
			var persistTemp = [];
			var formNode;
			var formId = "";
			var eleNode;
			var eleNodeName = "";
			for ( var f = 0; f < forms.length; f++ ) {
				formNode = forms[f];
				formId = formNode.id;
				persistTemp[formId] = {};
				for ( var i = 0; i < formNode.length; i++ ) {
					eleNode = formNode[i];
					eleNodeName = eleNode.nodeName.toLowerCase();
					if ( eleNodeName === "input" || eleNodeName === "select" || eleNodeName === "textarea" ) {
						if ( eleNode.name.length > 0 ) {
							if ( ( eleNode.type === "radio" || eleNode.type === "checkbox" ) ) {
								if ( eleNode.checked )
								persistTemp[formId][eleNode.name] = eleNode.value;
							}
							else if ( eleNode.name === "select" ) {
								persistTemp[formId][eleNode.name] = eleNode.value;
							}
							else if ( eleNode.name === "textarea" ) {
								if ( eleNode.length > 0 )
								persistTemp[formId][eleNode.name] = eleNode.text;
							}
							else {
								if ( eleNode.length > 0 )
								persistTemp[formId][eleNode.name] = eleNode.value;
							}
						}
					}
				}
			}
			return persistTemp;
		},
		init: function(){
			var nodes = document.querySelectorAll("form[persist] input,textarea,select");
			for ( var i = 0; i < nodes.length; i++ ) {
				nodes[i].onchange = persist;
			}
			var db = window.sessionStorage;
			var forms = document.querySelectorAll("form[persist]");
			var formNode;
			var formId = "";
			var eleNode;
			var eleNodeName = "";
			for ( var f = 0; f < forms.length; f++ ) {
				formNode = forms[f];
				formId = formNode.id;
				if ( db.getItem( formId ) )
					for ( var n = 0; n < formNode.length; n++ ) {
						eleNode = formNode[n];
						eleNodeName = eleNode.nodeName.toLowerCase();
						if ( ( eleNodeName === "input" || eleNodeName === "select" || eleNodeName === "textarea" ) && ( eleNode.name.length > 0 ) )
							this.updateDomFromDb( formId , eleNode.name );
					}
				else {
					var serialized = this.serialize("form[persist]#"+formId);
					db.setItem( formId, JSON.stringify(serialized[formId]));
				}
			}
			return this;
		}
    };
	window.persist = persist;
	persist().init();
} })(window);