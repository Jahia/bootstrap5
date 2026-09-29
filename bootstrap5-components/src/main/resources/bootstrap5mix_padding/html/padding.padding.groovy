package bootstrap5mix_padding.html

def where = currentNode.properties['paddingWhere'].string
def size = currentNode.properties['paddingSize'].string
    if (where == "all") {
        where = '';
    }
// Both values end up in a class attribute: keep only characters valid in a Bootstrap spacing class
print "p${where}-${size}".replaceAll(/[^A-Za-z0-9-]/, '')
