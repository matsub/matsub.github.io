(function() {
  var heads = document.querySelectorAll("article > h1")
  for (let node of heads) {
    let anchor = document.createElement("a")
    anchor.classList.add('octicon')
    anchor.classList.add('octicon-link')

    // set href
    let id = node.getAttribute('id')
    anchor.setAttribute('href', `#${id}`)
    node.prepend(anchor)
  }
})()
