export async function importElement(name, path) {
  const panel = await fetch(path)
  const html = await panel.text()

  class Loader extends HTMLElement {
    constructor() {
      super();

      const shadow = this.attachShadow({ mode: 'open' });
      this.render(html)
    }

    render() {
      const template = document.createElement('template');
      template.innerHTML = html
      this.shadowRoot.appendChild(template.content)
      this.executeScripts()
    }

    executeScripts() {
      // these need to be executed manually, for security reasons
      for (let script of this.shadowRoot.querySelectorAll('script')) {
        script.remove()
        const shadowScript = this.shadowRoot.ownerDocument.createElement('script')
        shadowScript.textContent = script.textContent
        for (let attr of script.attributes) {
          shadowScript.setAttributeNode(attr.cloneNode(true))
        }
        // Expose shadow to the underlying scripts, since
        // document.currentScript does not work, most likely due to the above
        // mentioned security features
        //
        document.__shadow__ = this.shadowRoot
        document.__currentScript__ = shadowScript
        this.shadowRoot.appendChild(shadowScript)
      }
    }
  }

  customElements.define(name, Loader);
}

