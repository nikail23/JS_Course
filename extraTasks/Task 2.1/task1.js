function handleClick1() {
  document.getElementById("dlg").style.cssText = "visibility: hidden";
  document.getElementById("shadow").style.cssText = "display: none";
}
function handleClick2() {
  document.getElementById("dlg").style.cssText =
    "visibility: visible; z-index: 2";
  document.getElementById("shadow").style.cssText = "display: block";
}
