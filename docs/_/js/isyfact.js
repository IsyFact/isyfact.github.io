var links = document.querySelectorAll("a[href$='.xml'], a[href$='.json'], a[href$='.pdf']");
for(var i= 0; i< links.length; i++)
    links[i].setAttribute('download','');

const elements = document.getElementsByClassName("imageblock text-center");
for (let element of elements) {
  element.setAttribute("style", "text-align:center;");
}
