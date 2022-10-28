# Tabs and pills

> Bootstrap’s tabs and pills are quasi-navigation components which can highly improve website clarity and increase user experience.


![alt_text](../images/tabs.png "tabs" )

## Tabs properties

| Label                     | Name         | Description                                                                             | Default value |
|---------------------------|--------------|-----------------------------------------------------------------------------------------|---------------|
| **Type**                  | `type`       | Layout. This can be "Tab" or "Pill"                                                     | Tab           |
| **Fade effect**                 | `fade`       | To make tabs fade in                                                                    | true          | 
| **Horizontal alignment**             | `align`      | Change the horizontal alignment of your nav. Can be Start, Center, End, Fill, Justified | Start         |
| **Use list name as anchor**                | `useListNameAsAnchor`     | If set, uses the list name as the anchor (else, it uses the UUID)                       | true          | 

## Add a list of tabs on your page

In order to add tabs or pills on your page, you need to

1. Add the main tabs component
1. Then add as many content list as you need. The title of the contentent lists will be used as tab label
1. To add content to your tab, first click on the tab then add your content on the selected list

![alt_text](../images/tabs-add.gif "Edit tabs" )

## FAQ

### How to change the alignment or the type once the main tab componement has been created?

You simply need to right click / edit on the "Content list" button that you use create a new tab entry

![alt_text](../images/edit-tabs.png "Edit tabs" )

### How to changfe the label of a tab?

You simply need to right click / edit on the "+ Any content" button of your list

![alt_text](../images/edit-tab.png "Edit tab" )

## Tabs Definition

Here is the definition of the card:

```cnd
[bootstrap5nt:tabs] > jnt:content, bootstrap5mix:component, jmix:manuallyOrderable, jmix:list, jmix:siteContent, jmix:browsableInEditorialPicker orderable
- type (string, choicelist[resourceBundle, moduleImage='png']) = 'tab' autocreated indexed=no < 'tab', 'pill','link'
- fade (boolean) = 'true' autocreated indexed=no
- align (string, choicelist[resourceBundle,moduleImage='svg']) = 'justify-content-start' indexed=no < 'justify-content-start', 'justify-content-center', 'justify-content-end', 'nav-fill', 'nav-justified'
- useListNameAsAnchor (boolean) = 'true' autocreated indexed=no
+ * (jnt:contentList) = jnt:contentList
```


[Back to README](../README.md)