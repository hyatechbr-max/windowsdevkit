const vscode = require('vscode');

// ============================================================
// COMMAND DATABASE: Linux/Mac → Windows
// ============================================================
const COMMANDS = [
  // Files and folders
  { linux: 'ls',        windows: 'dir',               description: 'List files' },
  { linux: 'ls -la',    windows: 'dir /a',             description: 'List files with details' },
  { linux: 'pwd',       windows: 'cd',                 description: 'Show current directory' },
  { linux: 'mkdir',     windows: 'mkdir',              description: 'Create folder (same!)' },
  { linux: 'rm -rf',    windows: 'rmdir /s /q',        description: 'Delete folder recursively' },
  { linux: 'rm ',       windows: 'del ',               description: 'Delete file' },
  { linux: 'cp ',       windows: 'copy ',              description: 'Copy file' },
  { linux: 'mv ',       windows: 'move ',              description: 'Move file' },
  { linux: 'cat ',      windows: 'type ',              description: 'Show file contents' },
  { linux: 'touch ',    windows: 'echo.>',             description: 'Create empty file' },

  // Network
  { linux: 'curl ',     windows: 'Invoke-WebRequest ', description: 'Make HTTP request' },
  { linux: 'wget ',     windows: 'Invoke-WebRequest -OutFile ', description: 'Download file' },
  { linux: 'ifconfig',  windows: 'ipconfig',           description: 'Show network config' },
  { linux: 'ping ',     windows: 'ping ',              description: 'Test connection (same!)' },
  { linux: 'ssh ',      windows: 'ssh ',               description: 'SSH connection (same on Win10+)' },

  // System
  { linux: 'sudo ',     windows: '(Run as Administrator) ', description: 'Admin permissions' },
  { linux: 'chmod ',    windows: 'icacls ',            description: 'Change permissions' },
  { linux: 'chown ',    windows: 'icacls /setowner',   description: 'Change owner' },
  { linux: 'ps aux',    windows: 'tasklist',           description: 'List running processes' },
  { linux: 'kill ',     windows: 'taskkill /PID ',     description: 'Kill process' },
  { linux: 'top',       windows: 'Get-Process | Sort-Object CPU -Descending', description: 'Process monitor' },
  { linux: 'df -h',     windows: 'Get-PSDrive',        description: 'Show disk space' },
  { linux: 'du -sh',    windows: 'Get-ChildItem | Measure-Object -Sum Length', description: 'Show folder size' },
  { linux: 'free -h',   windows: 'Get-CimInstance Win32_OperatingSystem', description: 'Show RAM usage' },
  { linux: 'uname -a',  windows: 'systeminfo',         description: 'Show system info' },
  { linux: 'echo $PATH', windows: 'echo %PATH%',       description: 'Show PATH variable' },
  { linux: 'export ',   windows: '$env:',              description: 'Set environment variable' },

  // Package managers
  { linux: 'apt install',     windows: 'winget install',       description: 'Install package' },
  { linux: 'apt-get install', windows: 'winget install',       description: 'Install package' },
  { linux: 'brew install',    windows: 'winget install',       description: 'Install package' },
  { linux: 'apt update',      windows: 'winget upgrade --all', description: 'Update packages' },
  { linux: 'snap install',    windows: 'winget install',       description: 'Install package' },

  // Scripts
  { linux: 'chmod +x ',   windows: '(use .bat files instead)', description: 'Make executable' },
  { linux: 'bash ',        windows: 'powershell -File ',        description: 'Run script' },
  { linux: 'sh ',          windows: 'powershell -File ',        description: 'Run shell script' },
  { linux: '#!/bin/bash',  windows: '# PowerShell Script',      description: 'Script header' },
  { linux: 'source ',      windows: '. ',                       description: 'Run script in current context' },
  { linux: 'which ',       windows: 'where ',                   description: 'Find program location' },
  { linux: 'grep ',        windows: 'findstr ',                 description: 'Search text' },
  { linux: 'find ',        windows: 'Get-ChildItem -Recurse -Filter ', description: 'Find files' },
  { linux: 'tar -xzf',    windows: 'tar -xzf',                 description: 'Extract .tar.gz (same on Win10+)' },
  { linux: 'unzip ',       windows: 'Expand-Archive ',          description: 'Extract .zip' },
  { linux: 'zip ',         windows: 'Compress-Archive ',        description: 'Compress files' },
  { linux: 'history',      windows: 'Get-History',              description: 'Show command history' },
  { linux: 'clear',        windows: 'cls',                      description: 'Clear terminal' },
  { linux: 'man ',         windows: 'Get-Help ',                description: 'Show command help' },
  { linux: 'open ',        windows: 'start ',                   description: 'Open file/program' },
  { linux: 'xdg-open',     windows: 'start',                    description: 'Open with default program' },
  { linux: 'nohup ',       windows: 'start /B ',                description: 'Run in background' },
  { linux: '| grep',       windows: '| findstr',                description: 'Filter output' },
];

// Error patterns that indicate a Linux command failed on Windows
const ERROR_PATTERNS = [
  /['"]?(\S+)['"]? (is not recognized as an internal or external command)/i,
  /('(\S+)' is not recognized)/i,
  /((\S+)\s*: command not found)/i,
  /(bash: (\S+): command not found)/i,
  /(The term '(\S+)' is not recognized)/i,
];

// Extract the failed command name from the error message
function extractCommandFromError(errorText) {
  for (const pattern of ERROR_PATTERNS) {
    const match = errorText.match(pattern);
    if (match) {
      const candidates = match.slice(1).filter(Boolean);
      for (const c of candidates) {
        const clean = c.replace(/['"]/g, '').trim().split(' ')[0].toLowerCase();
        if (clean.length > 1 && !clean.includes('recognized') && !clean.includes('command')) {
          return clean;
        }
      }
    }
  }
  return null;
}

// Find the Windows solution for a Linux command
function findSolution(failedCommand) {
  const cmd = failedCommand.toLowerCase().trim();
  const found = COMMANDS.find(c => {
    const linux = c.linux.trim().toLowerCase();
    return linux === cmd || linux.startsWith(cmd) || cmd.startsWith(linux.split(' ')[0]);
  });
  return found || null;
}

// ============================================================
// EXTENSION ACTIVATION
// ============================================================
function activate(context) {
  console.log('WindowsDevKit is active!');

  const outputChannel = vscode.window.createOutputChannel('WindowsDevKit');
  let bufferOutput = '';

  // ── Terminal monitoring ──────────────────────────────────────────────
  const monitorOutput = vscode.window.onDidWriteTerminalData(event => {
    const text = event.data;
    bufferOutput += text;

    const lines = bufferOutput.split('\n');
    bufferOutput = lines.pop() || '';

    for (const line of lines) {
      const cleanLine = line.replace(/\x1b\[[0-9;]*m/g, '').trim();
      if (!cleanLine) continue;

      const hasError = ERROR_PATTERNS.some(p => p.test(cleanLine));
      if (!hasError) continue;

      const failedCommand = extractCommandFromError(cleanLine);
      if (!failedCommand) continue;

      const solution = findSolution(failedCommand);

      if (solution) {
        vscode.window.showWarningMessage(
          `⚠ WindowsDevKit: "${failedCommand}" is Linux → Windows: "${solution.windows.trim()}"`,
          'Copy Windows command',
          'See all'
        ).then(async selection => {
          if (selection === 'Copy Windows command') {
            await vscode.env.clipboard.writeText(solution.windows.trim());
            vscode.window.showInformationMessage(`✅ Copied: ${solution.windows.trim()}`);
          }
          if (selection === 'See all') {
            outputChannel.show();
          }
        });

        outputChannel.appendLine(`\n[${new Date().toLocaleTimeString()}] Linux command detected in terminal`);
        outputChannel.appendLine(`  ❌ Linux:   ${failedCommand}`);
        outputChannel.appendLine(`  ✅ Windows: ${solution.windows.trim()}`);
        outputChannel.appendLine(`  📋 What:    ${solution.description}`);

      } else {
        vscode.window.showWarningMessage(
          `⚠ WindowsDevKit: "${failedCommand}" doesn't work on Windows. No equivalent found in the database.`,
          'Suggest equivalent'
        ).then(sel => {
          if (sel === 'Suggest equivalent') {
            vscode.env.openExternal(vscode.Uri.parse(`https://github.com/windowsdevkit/windowsdevkit/issues/new?title=Missing+command:+${failedCommand}`));
          }
        });
      }
    }
  });

  // ── Editor decorations ───────────────────────────────────────────────
  const linuxDecoration = vscode.window.createTextEditorDecorationType({
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

  const windowsDecoration = vscode.window.createTextEditorDecorationType({
    after: {
      contentText: ' ✓ Windows fix available',
      color: 'rgba(0, 180, 80, 0.7)',
      fontSize: '11px',
      margin: '0 0 0 6px',
    }
  });

  function analyzeText(text) {
    const lines = text.split('\n');
    const results = [];
    lines.forEach((line, number) => {
      const cleanLine = line.trim();
      if (!cleanLine) return;
      if (cleanLine.startsWith('#') && cleanLine.includes('PowerShell')) return;
      if (cleanLine.startsWith('Get-') || cleanLine.startsWith('Set-')) return;
      COMMANDS.forEach(cmd => {
        if (cleanLine.includes(cmd.linux) && cmd.linux !== cmd.windows) {
          results.push({
            line: number,
            original: line,
            linuxCmd: cmd.linux.trim(),
            windowsCmd: cmd.windows.trim(),
            description: cmd.description,
          });
        }
      });
    });
    return results.filter((r, i, arr) =>
      arr.findIndex(x => x.line === r.line && x.linuxCmd === r.linuxCmd) === i
    );
  }

  function updateDecorations(editor) {
    if (!editor) return;
    const text = editor.document.getText();
    const results = analyzeText(text);
    const redRanges = [];
    const greenRanges = [];
    results.forEach(r => {
      const line = editor.document.lineAt(r.line);
      const start = line.text.indexOf(r.linuxCmd);
      if (start === -1) return;
      const range = new vscode.Range(r.line, start, r.line, start + r.linuxCmd.length);
      redRanges.push({ range });
      greenRanges.push({ range: new vscode.Range(r.line, line.text.length, r.line, line.text.length) });
    });
    editor.setDecorations(linuxDecoration, redRanges);
    editor.setDecorations(windowsDecoration, greenRanges);
  }

  // ── Command: Translate file ──────────────────────────────────────────
  const cmdTranslate = vscode.commands.registerCommand('windowsdevkit.traduzir', async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) { vscode.window.showWarningMessage('Open a file first!'); return; }

    const text = editor.document.getText();
    const results = analyzeText(text);

    if (results.length === 0) {
      vscode.window.showInformationMessage('Great! No Linux commands found in this file.');
      return;
    }

    const panel = vscode.window.createWebviewPanel(
      'windowsdevkit', 'WindowsDevKit — Commands found',
      vscode.ViewColumn.Beside, { enableScripts: true }
    );
    panel.webview.html = generateHTML(results);

    panel.webview.onDidReceiveMessage(async msg => {
      if (msg.comando === 'copiar') {
        await vscode.env.clipboard.writeText(msg.texto);
        vscode.window.showInformationMessage(`Copied: ${msg.texto}`);
      }
      if (msg.comando === 'substituir') {
        const edit = new vscode.WorkspaceEdit();
        const sorted = [...results].sort((a, b) => b.line - a.line);
        sorted.forEach(r => {
          const line = editor.document.lineAt(r.line);
          const newLine = line.text.replace(r.linuxCmd, r.windowsCmd);
          edit.replace(editor.document.uri, line.range, newLine);
        });
        const success = await vscode.workspace.applyEdit(edit);
        if (success) {
          await editor.document.save();
          vscode.window.showInformationMessage(`✅ ${results.length} command(s) replaced and saved!`);
          panel.dispose();
        } else {
          vscode.window.showErrorMessage('Error replacing. Try saving the file manually first.');
        }
      }
    });
  });

  // ── Command: Check current file ──────────────────────────────────────
  const cmdCheck = vscode.commands.registerCommand('windowsdevkit.verificar', () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;
    const results = analyzeText(editor.document.getText());
    if (results.length === 0) {
      vscode.window.showInformationMessage('WindowsDevKit: File is 100% Windows compatible!');
    } else {
      vscode.window.showWarningMessage(
        `WindowsDevKit: Found ${results.length} Linux command(s). Click to see fixes.`, 'See fixes'
      ).then(sel => {
        if (sel === 'See fixes') vscode.commands.executeCommand('windowsdevkit.traduzir');
      });
    }
  });

  // ── Command: Show terminal history ───────────────────────────────────
  const cmdHistory = vscode.commands.registerCommand('windowsdevkit.historico', () => {
    outputChannel.show();
  });

  vscode.window.onDidChangeActiveTextEditor(updateDecorations, null, context.subscriptions);
  vscode.workspace.onDidChangeTextDocument(e => {
    if (vscode.window.activeTextEditor?.document === e.document) {
      updateDecorations(vscode.window.activeTextEditor);
    }
  }, null, context.subscriptions);

  if (vscode.window.activeTextEditor) updateDecorations(vscode.window.activeTextEditor);

  context.subscriptions.push(cmdTranslate, cmdCheck, cmdHistory, monitorOutput, outputChannel);
}

// ============================================================
// WEBVIEW PANEL HTML
// ============================================================
function generateHTML(results) {
  const rows = results.map(r => `
    <div class="cmd-row">
      <div class="line-num">Line ${r.line + 1}</div>
      <div class="description">${r.description}</div>
      <div class="cmd-pair">
        <div class="cmd linux"><span class="label">Linux / Mac</span><code>${r.linuxCmd}</code></div>
        <div class="arrow">→</div>
        <div class="cmd windows">
          <span class="label">Windows</span>
          <code>${r.windowsCmd}</code>
          <button class="btn-copy" onclick="copy('${r.windowsCmd.replace(/'/g, "\\'")}')">Copy</button>
        </div>
      </div>
    </div>`).join('');

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 20px; background: #1e1e1e; color: #d4d4d4; }
  h1 { font-size: 16px; font-weight: 600; color: #fff; margin-bottom: 4px; }
  .sub { font-size: 12px; color: #888; margin-bottom: 20px; }
  .cmd-row { background: #252526; border: 1px solid #3c3c3c; border-radius: 8px; padding: 14px 16px; margin-bottom: 10px; }
  .line-num { font-size: 11px; color: #888; margin-bottom: 4px; }
  .description { font-size: 13px; color: #ccc; margin-bottom: 10px; font-weight: 500; }
  .cmd-pair { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
  .cmd { flex: 1; min-width: 140px; background: #1e1e1e; border-radius: 6px; padding: 8px 10px; }
  .cmd.linux { border-left: 3px solid #f44747; }
  .cmd.windows { border-left: 3px solid #4ec9b0; }
  .label { font-size: 10px; text-transform: uppercase; letter-spacing: .06em; color: #888; display: block; margin-bottom: 4px; }
  code { font-family: 'Cascadia Code', 'Courier New', monospace; font-size: 13px; color: #ce9178; word-break: break-all; }
  .cmd.windows code { color: #4ec9b0; }
  .arrow { color: #888; font-size: 18px; flex-shrink: 0; }
  .btn-copy { display: block; margin-top: 6px; font-size: 11px; padding: 3px 10px; border: 1px solid #4ec9b0; background: transparent; color: #4ec9b0; border-radius: 4px; cursor: pointer; }
  .btn-copy:hover { background: #4ec9b0; color: #1e1e1e; }
  .btn-replace { display: block; margin: 20px auto 0; padding: 10px 24px; background: #0078d4; color: #fff; border: none; border-radius: 6px; font-size: 14px; cursor: pointer; font-weight: 500; }
  .btn-replace:hover { background: #106ebe; }
  .note { font-size: 11px; color: #888; text-align: center; margin-top: 8px; }
  </style></head><body>
  <h1>WindowsDevKit — ${results.length} Linux command(s) found</h1>
  <p class="sub">Click "Copy" to copy a single command, or "Replace All" to fix the entire file automatically.</p>
  ${rows}
  <button class="btn-replace" onclick="replaceAll()">Replace All Automatically</button>
  <p class="note">Recommended: review the replacements before saving</p>
  <script>
    const vscode = acquireVsCodeApi();
    function copy(text) { vscode.postMessage({ comando: 'copiar', texto: text }); }
    function replaceAll() { vscode.postMessage({ comando: 'substituir' }); }
  </script></body></html>`;
}

function deactivate() {}
module.exports = { activate, deactivate };
