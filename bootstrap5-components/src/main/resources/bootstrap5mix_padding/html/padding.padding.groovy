package bootstrap5mix_padding.html

def where = currentNode.properties['paddingWhere'].string
def size = currentNode.properties['paddingSize'].string
    if (where == "all") {
        where = '';
    }
print "p${where}-${size}"
