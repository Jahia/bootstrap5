package bootstrap5mix_padding.html

def where = currentNode.properties['marginWhere'].string
def size = currentNode.properties['marginSize'].string
if (where == "all") {
    where = '';
}
print "m${where}-${size}"
