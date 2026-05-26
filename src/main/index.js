import { app, shell, BrowserWindow, ipcMain, globalShortcut, dialog } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { autoUpdater } from 'electron-updater';
import icon from '../../resources/icon.png?asset'
import fs from 'fs' // <-- NOVO: Import do File System

// 1. O import do Store fica AQUI no backend
import Store from 'electron-store';
const StoreClass = Store.default ? Store.default : Store;
const store = new StoreClass();

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // 2. Os ouvintes do ipcMain ficam AQUI no backend
  ipcMain.handle('get-expenses', () => {
    return store.get('expenses', []);
  });

  ipcMain.handle('add-expense', (event, expense) => {
    const currentExpenses = store.get('expenses', []);
    store.set('expenses', [...currentExpenses, expense]);
    return true;
  });

  ipcMain.handle('delete-expense', (event, id) => {
    const currentExpenses = store.get('expenses', []);
    const filteredExpenses = currentExpenses.filter(exp => exp.id !== id);
    store.set('expenses', filteredExpenses);
    return true;
  });

  ipcMain.handle('save-file', async (event, { buffer, defaultPath, filters }) => {
    // Abre a janela nativa para o usuário escolher onde salvar
    const { canceled, filePath } = await dialog.showSaveDialog({
      defaultPath,
      filters
    });

    if (!canceled && filePath) {
      // Escreve o arquivo no disco rígido
      fs.writeFileSync(filePath, Buffer.from(buffer));
      return true;
    }
    return false;
  });

  createWindow()

  // ==========================================
  // LÓGICA DE AUTO-ATUALIZAÇÃO
  // ==========================================
  
  // 1. Verifica por atualizações em segundo plano assim que o app inicia
  autoUpdater.checkForUpdatesAndNotify();

  // 2. Quando o download da nova versão terminar, exibe o aviso nativo
  autoUpdater.on('update-downloaded', () => {
    dialog.showMessageBox({
      type: 'info',
      title: 'Atualização Pronta',
      message: 'Uma nova versão do Controle Financeiro foi baixada em segundo plano. O aplicativo será reiniciado agora para aplicar as melhorias.',
      buttons: ['Reiniciar e Atualizar']
    }).then((result) => {
      if (result.response === 0) {
        // Encerra a versão atual e aplica a instalação da nova
        autoUpdater.quitAndInstall();
      }
    });
  });

  // 2. NOVO: Registrar o atalho global
  const ret = globalShortcut.register('CommandOrControl+Shift+Space', () => {
    const windows = BrowserWindow.getAllWindows();
    if (windows.length > 0) {
      const win = windows[0];
      
      // Se a janela estiver minimizada, restaura
      if (win.isMinimized()) win.restore();
      
      // Puxa a janela para frente e foca nela
      win.show();
      win.focus();
      
      // Envia uma mensagem para o React focar no input de valor
      win.webContents.send('focus-amount-input');
    }
  });

  if (!ret) {
    console.error('Falha ao registrar o atalho de teclado');
  }

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// 3. NOVO: Limpar atalhos quando fechar o app
app.on('will-quit', () => {
  globalShortcut.unregisterAll();
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})