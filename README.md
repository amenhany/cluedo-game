# 🎩 Cluedo

A multiplayer board game, created with a webstack. But don't let that fool you as the game feels like a normal game, with a beautiful 1930s aesthetic inspired by Cuphead, and other vintage rubberhose styles.

This game was literally created because I wanted to play the game remotely with my friends but I couldn't find a good online version.

---

## ✨ Features

- 🎨 **1930s Noir Aesthetic**
- 🧠 **Interactive Game Board & Pieces**
- 🎭 **Custom Game Setup & Rules**
- 🌐 **Multiplayer Lobby System**
- 🔈 **Dynamic AudioManager**
- 🌒 **Cinematic Scene Transitions**
- ⚙️ **Persistent Settings**
- 🗣️ **Arabic Language Support**
- 🧩 **Robust Drag & Drop** (using [dnd kit](https://dndkit.com))
- 🧪 **Unit Tested** (using [Vitest](https://vitest.dev))
- ⚡ **Continuous Integration & Deployment** (using [GitHub Actions](https://github.com/features/actions))
- 🖥️ **Cross-Platform Support**
- 🔒 **Type-Safe Electron Bridge**
- 🧭 **Custom Menu Bar**

---

## 🧰 Tech Stack

Built using:
- ⚛️ **React + Electron + TypeScript**
- 🎞️ **Framer Motion** for transitions and animations
- 🧲 **Dnd Kit** for drag-and-drop interactivity
- 🎧 **Web Audio API** for my custom AudioManager class
- 🎨 **Sass (SCSS)** for styling
- ⚙️ **boardgame.io** for multiplayer state management
- 🔧 **GitHub Actions** for CI/CD automation

---

## 📦 Installation

### 1. Download the Latest Release

Go to the **[Releases](https://github.com/amenhany/cluedo-game/releases)** section and download the build for your operating system.

> ⚠️ On macOS, since the app is not yet notarized, you may need to remove the quarantine attribute to open it:

```bash
xattr -d com.apple.quarantine /path/to/Cluedo.app
```

Then open it normally.

---

## 🖼️ Screenshots

<img width="1470" height="916" alt="image" src="https://github.com/user-attachments/assets/50b9aac7-8346-44e4-ba2c-c748c2e7fbbf" />
<img width="1470" height="917" alt="image" src="https://github.com/user-attachments/assets/245d3582-0f03-4aae-af37-3d3b9a29a1a4" />
<img width="1470" height="918" alt="image" src="https://github.com/user-attachments/assets/9318866b-3e37-4059-b68c-c3a43a2d9885" />
<img width="1470" height="918" alt="image" src="https://github.com/user-attachments/assets/2b1b8751-6497-4122-a038-62c9b02c11f0" />
<img width="1470" height="914" alt="image" src="https://github.com/user-attachments/assets/b488bbf8-9d22-48a9-a12b-1a6a7923c5b2" />
<img width="1470" height="956" alt="image" src="https://github.com/user-attachments/assets/18fc9af2-40b5-4ebc-a6de-a0637656b0e0" />


---

## 🧩 Roadmap

- [x] Game Logic
- [x] Game UI
- [x] Game Lobby
- [x] Audio layering and transitions
- [x] Arabic localization
- [ ] WebGL Wobble Shaders on interactive pieces
- [ ] Custom Resources Path
