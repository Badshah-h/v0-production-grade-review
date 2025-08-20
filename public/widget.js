// AxonStreamAI Widget Loader
;(() => {
  window.AxonWidget = {
    init: (config) => {
      if (!config || !config.agentId) {
        console.error("AxonWidget: agentId is required")
        return
      }

      // Default configuration
      const defaultConfig = {
        position: "bottom-right",
        theme: "light",
        primaryColor: "#0891b2",
        size: "medium",
        welcomeMessage: "Hi! How can I help you today?",
        placeholder: "Type your message...",
        autoOpen: false,
        openDelay: 3000,
      }

      const widgetConfig = Object.assign({}, defaultConfig, config)

      // Create widget container
      const container = document.createElement("div")
      container.id = "axon-widget-container"
      container.style.cssText = `
        position: fixed;
        z-index: 9999;
        ${widgetConfig.position.includes("bottom") ? "bottom: 20px;" : "top: 20px;"}
        ${widgetConfig.position.includes("right") ? "right: 20px;" : "left: 20px;"}
      `

      // Create widget iframe
      const iframe = document.createElement("iframe")
      const baseUrl = "https://axonstream.ai" // In production, this would be the actual domain
      const widgetUrl =
        `${baseUrl}/widget/${widgetConfig.agentId}?` +
        `theme=${widgetConfig.theme}&` +
        `color=${encodeURIComponent(widgetConfig.primaryColor)}&` +
        `size=${widgetConfig.size}&` +
        `welcome=${encodeURIComponent(widgetConfig.welcomeMessage)}&` +
        `placeholder=${encodeURIComponent(widgetConfig.placeholder)}`

      iframe.src = widgetUrl
      iframe.style.cssText = `
        width: 400px;
        height: 600px;
        border: none;
        border-radius: 10px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        display: none;
      `

      // Create toggle button
      const button = document.createElement("button")
      button.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill="white"/>
          <path d="M12 6C8.69 6 6 8.69 6 12C6 15.31 8.69 18 12 18C15.31 18 18 15.31 18 12C18 8.69 15.31 6 12 6Z" fill="white"/>
        </svg>
      `
      button.style.cssText = `
        width: 60px;
        height: 60px;
        border-radius: 50%;
        border: none;
        background-color: ${widgetConfig.primaryColor};
        color: white;
        cursor: pointer;
        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
      `

      // Toggle functionality
      let isOpen = false
      button.addEventListener("click", () => {
        isOpen = !isOpen
        iframe.style.display = isOpen ? "block" : "none"
        button.style.transform = isOpen ? "scale(0.9)" : "scale(1)"
      })

      // Auto-open functionality
      if (widgetConfig.autoOpen) {
        setTimeout(() => {
          button.click()
        }, widgetConfig.openDelay)
      }

      // Append elements
      container.appendChild(iframe)
      container.appendChild(button)
      document.body.appendChild(container)

      console.log("AxonWidget initialized for agent:", widgetConfig.agentId)
    },
  }
})()
