# Text

>This component provides bootstrap 5 styles and CK templates

The Bootstrap 5 components came with a custom configuration for the CK Editor. This configuration provides a list of the main Bootstrap typography styles, a custom light toolbar, and some useful CK templates.

## Toolbar

Here is the custom toolbar used for the mixin `bootstrap5mix:text`

![alt_text](../images/text.png "Toolbar" )

## CK templates

A list of CK template is available directly from the template button. It will paste some pre mashed code directly into the text area, on your cursor:

- Code blocks
- Alerts (in different colors)
- Table
- Description list
- Blockquote
- Jumbotron

## CK styles

A list of common styles is available in the style dropdown.

- Heading H1 to H6
- Lead Text
- Highlight text
- Deleted text
- No longer accurate
- Addition to the document
- Underlined
- Fine print
- Bold text
- Italicized text
- Inline Code
- Code blocks
- Blockquotes
- Variables
- User input
- Sample output
- Colored text
- Colored background
- Alerts
- Badges
- Pill
- Pre

## Proprerty

| Label | Name | Description |
| --- | --- | --- | 
| Text | `text` | Rich text internationalized | 

## Definition

```cnd
[bootstrap5mix:text] mixin
 - text (string, richtext[ckeditor.toolbar='Tinny',ckeditor.customConfig='$context/modules/bootstrap5-components/javascript/ckconfig.js']) i18n

[bootstrap5nt:text]> jnt:content, bootstrap5mix:component, bootstrap5mix:text
```

## Usage of the mixin

The mixin `bootstrap5mix:text` can be used as any mixin in your custom definition. It will provide you the custom toolbar.
To display the value of this property, you simply need to get the string value of the text property

```jsp
 \${currentNode.properties.text.string}
```



[Back to README](../README.md)
