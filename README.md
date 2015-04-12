persistJS
=========

Automatically Persist Forms across page refreshes

## Compatibility:
 * IE 8+
 * Firefox 21+
 * Chrome 27+
 * Safari 5.1+
 * Opera 15+
 * iOS Safari 4.0+
 * Android Browser 2.1+
 * Chrome for Android 28+
 * Firefox for Android 23+
 * Blackberry Browser 7.0+

## Setup

add persistJS to your html head;

```html
<script src="persistForms.js" type="text/javascript"></script>
```

## Usage

Any form you wish to persist, simply add the attribute "id" to the form element with a value;

```html
<form id="my_form"
          method="POST"
          action=""
          accept-charset="utf-8">
  <input type="text" name="my_input" />
</form>
```

NB:       ensure all input, select, and textarea have a name attribute. As well as option elements having an value attribute.
          These are standard practice and there should never be any reason for these to not exist on any form.
