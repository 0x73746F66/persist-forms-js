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

Any form you wish to persist, simply add the attribute "persist" to the form element;

```html
<form id="my_form" persist
          method="POST"
          action=""
          accept-charset="utf-8">
  <input type="text" name="my_input" />
</form>
```

NB1:      ensure the form has an id or it cannot be referenced by the script.

NB2:      ensure all input, select, and textarea have a name attribute.
          These are standard practice and there should never be any reason for these to not exist on any form.
