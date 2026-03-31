const vscode = require('vscode');

// ============================================================
// BASE DE DADOS DE COMANDOS: Linux/Mac → Windows
// Adicionar mais comandos aqui no futuro é só copiar o padrão
// ============================================================
const COMANDOS = [
  // Ficheiros e pastas
  { linux: 'ls',        windows: 'dir',               descricao: 'Listar ficheiros' },
  { linux: 'ls -la',    windows: 'dir /a',             descricao: 'Listar ficheiros com detalhes' },
  { linux: 'pwd',       windows: 'cd',                 descricao: 'Ver pasta atual' },
  { linux: 'mkdir',     windows: 'mkdir',              descricao: 'Criar pasta (igual!)' },
  { linux: 'rm -rf',    windows: 'rmdir /s /q',        descricao: 'Apagar pasta inteira' },
  { linux: 'rm ',       windows: 'del ',               descricao: 'Apagar ficheiro' },
  { linux: 'cp ',       windows: 'copy ',              descricao: 'Copiar ficheiro' },
  { linux: 'mv ',       windows: 'move ',              descricao: 'Mover ficheiro' },
  { linux: 'cat ',      windows: 'type ',              descricao: 'Ver conteúdo de ficheiro' },
  { linux: 'touch ',    windows: 'echo.>',             descricao: 'Criar ficheiro vazio' },

  // Rede
  { linux: 'curl ',     windows: 'Invoke-WebRequest ', descricao: 'Fazer pedido HTTP' },
  { linux: 'wget ',     windows: 'Invoke-WebRequest -OutFile ', descricao: 'Descarregar ficheiro' },
  { linux: 'ifconfig',  windows: 'ipconfig',           descricao: 'Ver configuração de rede' },
  { linux: 'ping ',     windows: 'ping ',              descricao: 'Testar ligação (igual!)' },
  { linux: 'ssh ',      windows: 'ssh ',               descricao: 'Ligação SSH (igual no Win10+)' },

  // Sistema
  { linux: 'sudo ',     windows: '(Executar como Admin) ', descricao: 'Permissões de administrador' },
  { linux: 'chmod ',    windows: 'icacls ',            descricao: 'Mudar permissões' },
  { linux: 'chown ',    windows: 'icacls /setowner',   descricao: 'Mudar proprietário' },
  { linux: 'ps aux',    windows: 'tasklist',           descricao: 'Ver processos a correr' },
  { linux: 'kill ',     windows: 'taskkill /PID ',     descricao: 'Terminar processo' },
  { linux: 'top',       windows: 'Get-Process | Sort-Object CPU -Descending', descricao: 'Monitor de processos' },
  { linux: 'df -h',     windows: 'Get-PSDrive',        descricao: 'Ver espaço em disco' },
  { linux: 'du -sh',    windows: 'Get-ChildItem | Measure-Object -Sum Length', descricao: 'Ver tamanho de pasta' },
  { linux: 'free -h',   windows: 'Get-CimInstance Win32_OperatingSystem', descricao: 'Ver memória RAM' },
  { linux: 'uname -a',  windows: 'systeminfo',         descricao: 'Ver info do sistema' },
  { linux: 'echo $PATH','windows': 'echo %PATH%',      descricao: 'Ver variável PATH' },
  { linux: 'export ',   windows: 'set ',               descricao: 'Definir variável de ambiente' },

  // Instaladores
  { linux: 'apt install',   windows: 'winget install',   descricao: 'Instalar programa' },
  { linux: 'apt-get install', windows: 'winget install', descricao: 'Instalar programa' },
  { linux: 'brew install',  windows: 'winget install',   descricao: 'Instalar programa' },
  { linux: 'apt update',    windows: 'winget upgrade --all', descricao: 'Atualizar programas' },
  { linux: 'snap install',  windows: 'winget install',   descricao: 'Instalar programa' },

  // Scripts
  { linux: 'chmod +x ',     windows: '(ficheiros .bat executam direto)', descricao: 'Tornar executável' },
  { linux: 'bash ',         windows: 'powershell -File ', descricao: 'Executar script' },
  { linux: 'sh ',           windows: 'powershell -File ', descricao: 'Executar script shell' },
  { linux: '#!/bin/bash',   windows: '# Script PowerShell', descricao: 'Cabeçalho de script' },
  { linux: 'source ',       windows: '. ',                descricao: 'Executar script no contexto atual' },
  { linux: 'which ',        windows: 'where ',            descricao: 'Encontrar localização de programa' },
  { linux: 'grep ',         windows: 'findstr ',          descricao: 'Procurar texto' },
  { linux: 'find ',         windows: 'Get-ChildItem -Recurse -Filter ', descricao: 'Encontrar ficheiros' },
  { linux: 'tar -xzf',      windows: 'tar -xzf',          descricao: 'Extrair .tar.gz (igual no Win10+)' },
  { linux: 'unzip ',        windows: 'Expand-Archive ',   descricao: 'Extrair .zip' },
  { linux: 'zip ',          windows: 'Compress-Archive ',  descricao: 'Comprimir ficheiros' },
  { linux: 'history',       windows: 'Get-History',        descricao: 'Ver histórico de comandos' },
  { linux: 'clear',         windows: 'cls',                descricao: 'Limpar terminal' },
  { linux: 'man ',          windows: 'Get-Help ',          descricao: 'Ver ajuda de comando' },
  { linux: 'open ',         windows: 'start ',             descricao: 'Abrir ficheiro/programa' },
  { linux: 'xdg-open',      windows: 'start',              descricao: 'Abrir com programa padrão' },
  { linux: 'nohup ',        windows: 'start /B ',          descricao: 'Executar em background' },
  { linux: '>> ',           windows: '>> ',                descricao: 'Redirecionar output (igual!)' },
  { linux: '| grep',        windows: '| findstr',          descricao: 'Filtrar resultado' },
];

// ============================================================
// FUNÇÃO PRINCIPAL: analisa o texto e encontra comandos Linux
// ============================================================
function analisarTexto(texto) {
  const linhas = texto.split('\n');
  const resultados = [];

  linhas.forEach((linha, numero) => {
    const linhaLimpa = linha.trim();
    if (!linhaLimpa) return;

    // Ignora linhas que já são PowerShell/Windows
    if (linhaLimpa.startsWith('#') && linhaLimpa.includes('PowerShell')) return;
    if (linhaLimpa.startsWith('Get-') || linhaLimpa.startsWith('Set-')) return;

    COMANDOS.forEach(cmd => {
      if (linhaLimpa.includes(cmd.linux) && cmd.linux !== cmd.windows) {
        resultados.push({
          linha: numero,
          original: linha,
          linuxCmd: cmd.linux.trim(),
          windowsCmd: cmd.windows.trim(),
          descricao: cmd.descricao,
        });
      }
    });
  });

  // Remove duplicados na mesma linha
  return resultados.filter((r, i, arr) =>
    arr.findIndex(x => x.linha === r.linha && x.linuxCmd === r.linuxCmd) === i
  );
}

// ============================================================
// ATIVAÇÃO DA EXTENSÃO
// ============================================================
function activate(context) {
  console.log('WindowsDevKit está ativo!');

  // Decoração visual: sublinha a vermelho os comandos Linux detetados
  const decoracaoLinux = vscode.window.createTextEditorDecorationType({
    backgroundColor: 'rgba(220, 50, 50, 0.12)',
    border: '1px solid rgba(220, 50, 50, 0.4)',
    borderRadius: '3px',
    after: {
      contentText: ' ⚠ Linux',
      color: 'rgba(220, 50, 50, 0.8)',
      fontSize: '11px',
      margin: '0 0 0 6px',
    }
  });

  // Decoração verde: confirma que há solução Windows disponível
  const decoracaoWindows = vscode.window.createTextEditorDecorationType({
    after: {
      contentText: ' ✓ Solução Windows disponível',
      color: 'rgba(0, 180, 80, 0.7)',
      fontSize: '11px',
      margin: '0 0 0 6px',
    }
  });

  // Atualiza as decorações sempre que o ficheiro muda
  function atualizarDecoracoes(editor) {
    if (!editor) return;

    const texto = editor.document.getText();
    const resultados = analisarTexto(texto);
    const rangosVermelhos = [];
    const rangosVerdes = [];

    resultados.forEach(r => {
      const linha = editor.document.lineAt(r.linha);
      const inicio = linha.text.indexOf(r.linuxCmd);
      if (inicio === -1) return;

      const range = new vscode.Range(
        r.linha, inicio,
        r.linha, inicio + r.linuxCmd.length
      );
      rangosVermelhos.push({ range });
      rangosVerdes.push({ range: new vscode.Range(r.linha, linha.text.length, r.linha, linha.text.length) });
    });

    editor.setDecorations(decoracaoLinux, rangosVermelhos);
    editor.setDecorations(decoracaoWindows, rangosVerdes);
  }

  // Comando: "Traduzir Ficheiro para Windows"
  const cmdTraduzir = vscode.commands.registerCommand('windowsdevkit.traduzir', async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showWarningMessage('Abre um ficheiro primeiro!');
      return;
    }

    const texto = editor.document.getText();
    const resultados = analisarTexto(texto);

    if (resultados.length === 0) {
      vscode.window.showInformationMessage('Ótimo! Não encontrei comandos Linux neste ficheiro.');
      return;
    }

    // Mostra painel com todos os problemas encontrados
    const painel = vscode.window.createWebviewPanel(
      'windowsdevkit',
      'WindowsDevKit — Comandos encontrados',
      vscode.ViewColumn.Beside,
      { enableScripts: true }
    );

    painel.webview.html = gerarHTML(resultados);

    // Recebe mensagem do painel quando o dev clica "Copiar"
    painel.webview.onDidReceiveMessage(msg => {
      if (msg.comando === 'copiar') {
        vscode.env.clipboard.writeText(msg.texto);
        vscode.window.showInformationMessage(`Copiado: ${msg.texto}`);
      }
      if (msg.comando === 'substituir') {
        const edit = new vscode.WorkspaceEdit();
        resultados.forEach(r => {
          const linha = editor.document.lineAt(r.linha);
          const novaLinha = linha.text.replace(r.linuxCmd, r.windowsCmd);
          edit.replace(editor.document.uri, linha.range, novaLinha);
        });
        vscode.workspace.applyEdit(edit);
        vscode.window.showInformationMessage('Todos os comandos foram substituídos!');
        painel.dispose();
      }
    });
  });

  // Comando: "Verificar Ficheiro Atual"
  const cmdVerificar = vscode.commands.registerCommand('windowsdevkit.verificar', () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;

    const texto = editor.document.getText();
    const resultados = analisarTexto(texto);

    if (resultados.length === 0) {
      vscode.window.showInformationMessage('WindowsDevKit: Ficheiro 100% compatível com Windows!');
    } else {
      vscode.window.showWarningMessage(
        `WindowsDevKit: Encontrei ${resultados.length} comando(s) Linux. Clica para ver.`,
        'Ver soluções'
      ).then(sel => {
        if (sel === 'Ver soluções') {
          vscode.commands.executeCommand('windowsdevkit.traduzir');
        }
      });
    }
  });

  // Atualiza automaticamente ao mudar de ficheiro ou editar
  vscode.window.onDidChangeActiveTextEditor(atualizarDecoracoes, null, context.subscriptions);
  vscode.workspace.onDidChangeTextDocument(e => {
    if (vscode.window.activeTextEditor?.document === e.document) {
      atualizarDecoracoes(vscode.window.activeTextEditor);
    }
  }, null, context.subscriptions);

  if (vscode.window.activeTextEditor) {
    atualizarDecoracoes(vscode.window.activeTextEditor);
  }

  context.subscriptions.push(cmdTraduzir, cmdVerificar);
}

// ============================================================
// INTERFACE VISUAL DO PAINEL DE RESULTADOS
// ============================================================
function gerarHTML(resultados) {
  const linhas = resultados.map(r => `
    <div class="cmd-row">
      <div class="linha-num">Linha ${r.linha + 1}</div>
      <div class="descricao">${r.descricao}</div>
      <div class="cmd-par">
        <div class="cmd linux">
          <span class="label">Linux / Mac</span>
          <code>${r.linuxCmd}</code>
        </div>
        <div class="seta">→</div>
        <div class="cmd windows">
          <span class="label">Windows</span>
          <code>${r.windowsCmd}</code>
          <button class="btn-copiar" onclick="copiar('${r.windowsCmd.replace(/'/g, "\\'")}')">Copiar</button>
        </div>
      </div>
    </div>
  `).join('');

  return `<!DOCTYPE html>
<html lang="pt">
<head>
<meta charset="UTF-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 20px; background: #1e1e1e; color: #d4d4d4; }
  h1 { font-size: 16px; font-weight: 600; color: #fff; margin-bottom: 4px; }
  .sub { font-size: 12px; color: #888; margin-bottom: 20px; }
  .cmd-row { background: #252526; border: 1px solid #3c3c3c; border-radius: 8px; padding: 14px 16px; margin-bottom: 10px; }
  .linha-num { font-size: 11px; color: #888; margin-bottom: 4px; }
  .descricao { font-size: 13px; color: #ccc; margin-bottom: 10px; font-weight: 500; }
  .cmd-par { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
  .cmd { flex: 1; min-width: 140px; background: #1e1e1e; border-radius: 6px; padding: 8px 10px; }
  .cmd.linux { border-left: 3px solid #f44747; }
  .cmd.windows { border-left: 3px solid #4ec9b0; }
  .label { font-size: 10px; text-transform: uppercase; letter-spacing: .06em; color: #888; display: block; margin-bottom: 4px; }
  code { font-family: 'Cascadia Code', 'Courier New', monospace; font-size: 13px; color: #ce9178; word-break: break-all; }
  .cmd.windows code { color: #4ec9b0; }
  .seta { color: #888; font-size: 18px; flex-shrink: 0; }
  .btn-copiar { display: block; margin-top: 6px; font-size: 11px; padding: 3px 10px; border: 1px solid #4ec9b0; background: transparent; color: #4ec9b0; border-radius: 4px; cursor: pointer; }
  .btn-copiar:hover { background: #4ec9b0; color: #1e1e1e; }
  .btn-substituir { display: block; margin: 20px auto 0; padding: 10px 24px; background: #0078d4; color: #fff; border: none; border-radius: 6px; font-size: 14px; cursor: pointer; font-weight: 500; }
  .btn-substituir:hover { background: #106ebe; }
  .aviso { font-size: 11px; color: #888; text-align: center; margin-top: 8px; }
</style>
</head>
<body>
<h1>WindowsDevKit — ${resultados.length} comando(s) Linux encontrado(s)</h1>
<p class="sub">Clica "Copiar" para copiar um comando, ou "Substituir Tudo" para corrigir o ficheiro automaticamente.</p>
${linhas}
<button class="btn-substituir" onclick="substituirTudo()">Substituir Tudo Automaticamente</button>
<p class="aviso">Recomendado: revê as substituições antes de guardar</p>
<script>
  const vscode = acquireVsCodeApi();
  function copiar(texto) {
    vscode.postMessage({ comando: 'copiar', texto });
  }
  function substituirTudo() {
    vscode.postMessage({ comando: 'substituir' });
  }
</script>
</body>
</html>`;
}

function deactivate() {}

module.exports = { activate, deactivate };
