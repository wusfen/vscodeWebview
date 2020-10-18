const vscode = require('vscode')
const { window } = vscode
const path = require('path')
const liveServer = require('live-server')

var main = new class {
  onload(context) {
    this.statusBarItem = window.createStatusBarItem()
    this.statusBarItem.text = 'webview'
    this.statusBarItem.command = 'webview.open'
    this.statusBarItem.show()

    vscode.commands.registerCommand('webview.open', e => {
      this.createServer()
      setTimeout(() => {
        this.createWebview()
      }, 10)
    })
  }
  createServer() {
    this.server = this.server || liveServer.start({
      port: 1990, // Set the server port. Defaults to 8080.
      host: "0.0.0.0", // Set the address to bind to. Defaults to 0.0.0.0 or process.env.IP.
      root: vscode.workspace.rootPath, // Set root directory that's being served. Defaults to cwd.
      open: false, // When false, it won't load your browser by default.
      wait: 0, // Waits for all changes, before reloading. Defaults to 0 sec.
    })
  }
  createWebview(file) {
    this.webviewPanel = window.createWebviewPanel('type', 'webview', vscode.ViewColumn.Beside, {
      enableScripts: true,
      enableCommandUris: true,
    })
    this.webview = this.webviewPanel.webview

    // uri
    // file: only extension's
    var uri = file || 'http://localhost:1990'
    uri = /^http:/.test(uri) ? uri : this.webview.asWebviewUri(vscode.Uri.file(uri))

    this.webview.html = `
    <!DOCTYPE html>
    <html>
    
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Document</title>
    </head>
    
    <body>
      <style>
        * {
          margin: 0;
          padding: 0;
          border: 0;
          outline: 0;
          box-sizing: border-box;
        }
    
        body {
          display: flex;
          flex-direction: column;
          height: 100vh;
        }
    
        iframe {
          flex: 1;
          width: 100%;
          height: calc(100% - 3em);
          background: #fff;
        }
    
        input {
          flex: none;
          width: 100%;
          height: 2.5em;
          padding: .5em;
          background: #ddd;
        }
    
        input:focus {
          background: #f1f1f1;
        }
      </style>
      <input id=input value="${uri}" onclick="history.back()" onchange="iframe.src=input.value" placeholder="url" />
      <iframe id=iframe src="${uri}" onload="input.value=function(){return try{this.contentWindow.location.href}catch(e){}}() ||iframe.src" />
    
    </body>
    
    </html>
    `
  }
  onunload(context) {
  }
}

module.exports = {
  activate(e) { main.onload(e) },
  deactivate(e) { main.onunload(e) },
}
