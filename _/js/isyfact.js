var links = document.querySelectorAll("a[href$='.xml'], a[href$='.json'], a[href$='.pdf']");
for(var i= 0; i< links.length; i++)
    links[i].setAttribute('download','');


/*
 * Scrollbar for tables with width too large.
 * Could happen if <code> is used in table cells.
 * Overflow-Scrollbar can only be introduced to parent node of table node therefore script is needed.
 * Only apply for tables created via markup (class: tableblock).
 */
{
    var tableNodes = document.getElementsByTagName("table");
    for (let tableNode of tableNodes) {
        if (tableNode.classList.contains("tableblock")) {
            const range = document.createRange();

            const newParentForTable = document.createElement('div');
            newParentForTable.classList.add("scrollbar-table");

            range.selectNode(tableNode);
            range.surroundContents(newParentForTable);
        }
    }
}

