/**
 * Set links to XML, JSON and PDF files explicitly as download links.
 */
var links = document.querySelectorAll("a[href$='.xml'], a[href$='.json'], a[href$='.pdf']");
for(var i= 0; i< links.length; i++)
    links[i].setAttribute('download','');


/*
 * Scrollbar for tables that don't fit horizontally.
 * This can happen if <code> is used in table cells or if the table has too many columns.
 * The overflow scrollbar can only be introduced to the parent of the table node; therefore this script is needed.
 * This only applies for tables created via markup (class: tableblock), e.g. from CSV files.
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

