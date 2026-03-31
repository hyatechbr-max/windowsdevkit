# WindowsDevKit 🪟

**Cansado de comandos Linux que não funcionam no Windows?**

Cada tutorial assume que usas Linux ou Mac. `chmod +x`, `export PATH=...`, `rm -rf` — nada disto funciona no PowerShell. O WindowsDevKit detecta esses comandos automaticamente e mostra-te a solução Windows sem teres de pesquisar.

---

## Como funciona

**No terminal** — escreves um comando Linux, o Windows diz "not recognized", e aparece uma notificação imediata com o equivalente Windows e um botão para copiar.

**No editor** — abres qualquer ficheiro com comandos Linux e eles ficam sublinhados a vermelho com a solução disponível ao lado.

---

## Instalação (beta)

A extensão está em fase de testes. Para instalar agora:

**Precisas de ter instalado:**
- [VSCode](https://code.visualstudio.com/)
- [Node.js](https://nodejs.org/) — versão LTS

**Passos:**

1. Descarrega ou clona este repositório
```
git clone https://github.com/[o-teu-username]/windowsdevkit
```

2. Abre a pasta no VSCode
```
File → Open Folder → escolhe a pasta windowsdevkit
```

3. Carrega **F5** — abre uma janela nova com a extensão activa

4. Testa no terminal da janela nova:
```
chmod +x teste.sh
```

Deves ver a notificação aparecer automaticamente.

---

## O que detecta

| Linux / Mac | Windows (PowerShell) |
|-------------|---------------------|
| `chmod +x file.sh` | `icacls file.ps1 /grant Everyone:RX` |
| `export NODE_ENV=production` | `$env:NODE_ENV = "production"` |
| `rm -rf node_modules` | `rmdir /s /q node_modules` |
| `grep "error" log.txt` | `findstr "error" log.txt` |
| `cat file.txt` | `type file.txt` |
| `touch newfile.js` | `echo.> newfile.js` |
| `which node` | `where node` |
| `ls -la` | `dir /a` |
| `apt install curl` | `winget install curl` |
| `kill 1234` | `taskkill /PID 1234` |

E mais 40+ comandos na base de dados.

---

## Para vibe coders — Cursor e Windsurf

Se usas Cursor ou Windsurf, temos ficheiros de regras prontos que fazem a IA gerar código Windows directamente, sem teres de corrigir nada depois.

- Descarrega `.cursorrules` → mete na raiz do projecto → o Cursor passa a gerar PowerShell automaticamente
- Descarrega `.windsurfrules` → mesmo resultado no Windsurf

---

## Roadmap

- [ ] Publicação na loja do VSCode
- [ ] Ficheiro `.vsix` para instalação directa sem precisar de código
- [ ] Extensão de browser (funciona em qualquer tutorial online)
- [ ] Suporte para GitHub Copilot instructions

---

## Feedback

Esta extensão está em beta e preciso do teu feedback honesto.

Se encontrares um comando em falta ou algo que não funcione:
- Abre uma [issue](https://github.com/[o-teu-username]/windowsdevkit/issues)

---

## Licença

MIT — podes usar, modificar e distribuir com crédito ao projecto original.

---

*Feito para programadores Windows que estão fartos de ser tratados como cidadãos de segunda classe no mundo do desenvolvimento.*
