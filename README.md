persistJS
=========

Automatically Persist Forms across page refreshes

== Setup

add persistJS to your html head;

```html
<script src="persistForms.js" type="text/javascript"></script>
```

== Usage

Any form you wish to persist, simply add the attribute "persist" to the form element;

```html
<form id="my_form" persist
          method="POST"
          action=""
          accept-charset="utf-8">
  <input type="text" name="my_input" />
</form>
```
