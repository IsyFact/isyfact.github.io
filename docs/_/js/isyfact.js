var links = document.querySelectorAll("a[href$='.xml'], a[href$='.json'], a[href$='.pdf']");
for(var i= 0; i< links.length; i++)
    links[i].setAttribute('download','');
