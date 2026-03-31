# WindowsDevKit

**Nunca mais perca horas a adaptar tutoriais feitos para Mac/Linux.**

A extensão detecta automaticamente comandos que não funcionam no Windows e mostra a solução certa — sem pesquisar, sem Stack Overflow, sem frustração.

---

## O que faz

- **Sublinha a vermelho** qualquer comando Linux/Mac no teu ficheiro
- **Mostra o equivalente Windows** com 1 clique
- **Substitui automaticamente** todos os comandos de uma vez
- **50+ comandos** na base de dados (ls, curl, grep, apt, sudo, e muito mais)

## Como usar

1. Abre qualquer ficheiro com comandos de terminal (`.sh`, `.md`, `.txt`, etc.)
2. Os comandos Linux ficam sublinhados a vermelho automaticamente
3. Pressiona **Ctrl+Shift+W** para ver todas as soluções Windows
4. Clica **"Substituir Tudo"** para corrigir o ficheiro inteiro

Ou clica com o botão direito no editor → **"WindowsDevKit: Traduzir comandos"**

## Comandos cobertos

| Linux / Mac | Windows | O quê |
|-------------|---------|-------|
| `ls` | `dir` | Listar ficheiros |
| `rm -rf` | `rmdir /s /q` | Apagar pasta |
| `curl` | `Invoke-WebRequest` | Pedido HTTP |
| `grep` | `findstr` | Procurar texto |
| `sudo` | (Admin) | Permissões |
| `apt install` | `winget install` | Instalar programas |
| `chmod` | `icacls` | Permissões de ficheiro |
| `ps aux` | `tasklist` | Ver processos |
| ... | ... | 50+ no total |

## Instalar

### Opção A — Da loja do VSCode (em breve)
Procura "WindowsDevKit" na loja de extensões do VSCode.

### Opção B — Manual (já disponível)
1. Descarrega o ficheiro `windowsdevkit-1.0.0.vsix`
2. Abre o VSCode
3. Vai a **Extensões** (Ctrl+Shift+X)
4. Clica nos **...** no topo → **"Instalar a partir de VSIX"**
5. Escolhe o ficheiro descarregado
6. Reinicia o VSCode

---

Feito para os milhões de programadores que usam Windows e merecem ferramentas que funcionem.
