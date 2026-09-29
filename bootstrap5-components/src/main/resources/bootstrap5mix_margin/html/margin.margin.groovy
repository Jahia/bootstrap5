package bootstrap5mix_margin.html

def where = currentNode.properties['marginWhere'].string
def size = currentNode.properties['marginSize'].string
if (where == "all") {
    where = '';
}
// Both values end up in a class attribute: keep only characters valid in a Bootstrap spacing class
print "m${where}-${size}".replaceAll(/[^A-Za-z0-9-]/, '')
