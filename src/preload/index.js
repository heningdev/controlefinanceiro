import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// 1. Crie os métodos que o React poderá chamar
const api = {
  getExpenses: () => ipcRenderer.invoke('get-expenses'),
  addExpense: (expense) => ipcRenderer.invoke('add-expense', expense),
  deleteExpense: (id) => ipcRenderer.invoke('delete-expense', id),
  onFocusInput: (callback) => ipcRenderer.on('focus-amount-input', () => callback()),
  saveFile: (fileData) => ipcRenderer.invoke('save-file', fileData)
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    // 2. A API customizada já está sendo exposta aqui pelo template
    contextBridge.exposeInMainWorld('api', api) 
  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = electronAPI
  window.api = api
}