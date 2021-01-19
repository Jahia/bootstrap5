# Pagination

>This component will paginate long lists by indicating a series of related content exists across multiple pages.


![alt_text](../images/pagination.png "Pagination" )

## Add a pagination above your list

Pagination in Jahia is not something very trivial to use. So here is a quick video to illustrate how to integrate pagination **above** a list.

1. First, you need to add pagination after the Jahia content list you want to paginate,
1. Then you need to move it above your list, and
1. Finally, you need to link (bind) the pagination to the list, by clicking on the "pin" icon and selecting the list you want to link to

![alt_text](../images/pagination-before.gif "Pagination before" )

## Add a pagination before your list

In order to add pagination **afte** your list, you need to

1. First you need to have a working pagination above your list (see the previous example)
1. Copy your pagination component and paste it after your list
1. Remove the Display the pagination of the first pagination (the component before the list)

![alt_text](../images/pagination-after.gif "Pagination after" )


## Properties

In Jahia the component needs to be set up before the list you want to paginate, even if you want to display the bar after the list. So, if you want to display the pagination bar after your list (not before), you still need to put a component before and choose to not display the pagination bar.

| Label | Name | Description | Default value |
| --- | --- | --- | --- |
| Display the pagination | `displayPager` | will display the pagination bar. If set to `false`, it only initializes the pagination | `true` |



## Advanced properties

There are a few advanced properties that you can set on the pagination bar.
Note that you only want to display pagination after your list, you still need to set the same values on the pagination (not displayed) before the list, at least the Size of the menu
and the number of items are shown

| Label | Name | Description | Default value |
| --- | --- | --- | --- |
| How many items are shown | `pageSize` | How many items are shown in a page | 10|
| Size of the menu | `nbOfPages` | How many links to pages to display on the menu.<br/>  On this example the size is set to 3 even if there are more pages.<br/> ![alt_text](../images/pagination-size.png "Pagination site" )| 10|
| How many items are shown (edition mode) | `nbOfPagesInEdit`  | You can limit the number of item to show on edit mode | 100|
| Alignement | `align`  | Position of the pagination bar. Can be on Start, Center or End |  Center|
| Size | `layout` | Size of the buttons | It can be set smaller or larger | Default |

## Definition

```cnd
[bootstrap5mix:advancedPagination] mixin
 extends = bootstrap5nt:pagination
 itemtype = content
 - pageSize (long) = '10' autocreated mandatory indexed=no
 - nbOfPages (long) = '10' autocreated mandatory indexed=no
 - nbOfPagesInEdit (long) = '100' autocreated mandatory indexed=no
 - align (string, choicelist[resourceBundle]) = 'justify-content-center' autocreated indexed=no  < 'justify-content-center', 'justify-content-start', 'justify-content-end'
 - layout (string, choicelist[resourceBundle]) = 'default' autocreated indexed=no   < 'pagination-lg', 'default', 'pagination-sm'

[bootstrap5nt:pagination] > jnt:content, bootstrap5mix:component, jmix:bindedComponent
 - displayPager (boolean) = 'true' autocreated indexed=no
```
[Back to README](../README.md)
