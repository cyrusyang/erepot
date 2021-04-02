const { ipcRenderer } = require('electron')

function getToken(params){
  ipcRenderer.sendSync('authorization_code', params)
}

export {getToken}