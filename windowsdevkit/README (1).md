

# WindowsDevKit 🪟

**Tired of Linux commands that don't work on Windows?**

Every tutorial assumes you're on Linux or Mac. `chmod +x`, `export PATH=...`, `rm -rf` — none of it works in PowerShell. WindowsDevKit detects those commands automatically and shows you the Windows equivalent without having to Google it.

---

## How it works

**In the terminal** — you run a Linux command, Windows says "not recognized", and a notification appears instantly with the Windows equivalent and a copy button.

**In the editor** — open any file with Linux commands and they get underlined in red with the fix available right there.

---

## Installation (beta)

The extension is currently in beta. To install it now:

**Requirements:**
- [VSCode](https://code.visualstudio.com/)
- [Node.js](https://nodejs.org/) — LTS version

**Steps:**

1. Clone this repository
```
git clone https://github.com/[your-username]/windowsdevkit
```

2. Open the folder in VSCode
```
File → Open Folder → select the windowsdevkit folder
```

3. Press **F5** — a new window opens with the extension active

4. Test it in the terminal of the new window:
```
chmod +x test.sh
```

You should see the notification appear automatically.

---

## What it detects

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

40+ commands in the database and growing.

---

## For vibe coders — Cursor and Windsurf

If you use Cursor or Windsurf, we have ready-made rules files that make the AI generate Windows-compatible code directly — no fixing needed afterwards.

- Download `.cursorrules` → drop it in your project root → Cursor now generates PowerShell automatically
- Download `.windsurfrules` → same result in Windsurf

---

## Roadmap

- [ ] VSCode Marketplace publication
- [ ] `.vsix` file for one-click install without needing the source code
- [ ] Browser extension (works on any tutorial website)
- [ ] GitHub Copilot instructions support

---

## Feedback

This extension is in beta and I need your honest feedback.

If you find a missing command or something that doesn't work as expected:
- Open an [issue](https://github.com/[your-username]/windowsdevkit/issues)

---

## License

MIT — free to use, modify and distribute with credit to the original project.

---

*Built for Windows developers who are tired of being second-class citizens in the dev world.*
