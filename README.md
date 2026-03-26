# 🎙️ Aura Teleprompter

A premium, dynamic dark-mode teleprompter web application built with **Java Spring Boot**. Designed for live content creators, streamers, and professionals who need a reliable, feature-rich teleprompter right in their browser.

## ✨ Features
1. **Premium Dashboard UI**: Designed with glassmorphism, smooth gradients, and deep colors for a professional studio look.
2. **Draggable Text**: Place the teleprompter text anywhere over your camera feed.
3. **Voice Tracking** 🎤: Powered by the Web Speech API. It listens to you speak and automatically scrolls the text down! 
4. **Auto Scroll & Speed Control**: Smooth, buttery scrolling using `requestAnimationFrame` with fully adjustable speed.
5. **Video & Audio Recording** ⏺️: Record your webcam and audio directly inside the app using the MediaRecorder API, and download it locally as a `.webm` file.
6. **Pro Settings Menu** ⚙️:
   - Customize **Text Color** and **Background Opacity**.
   - Adjust **Line Height** and **Reading Margins** (narrowing the text column so your eyes don't sway).
7. **Text Mirroring**: Perfect for physical teleprompter glass rigs.
8. **Focal Reading Line**: A glowing horizontal guide to keep your eyes locked on the right sentence.

## 🚀 Running Locally
Prerequisites: Java 21+

1. Clone the repository: 
```bash
git clone https://github.com/Sudhanshu-Malhotra/TELEPROMPTER.git
```
2. Navigate into the directory and run via Gradle:
```bash
./gradlew bootRun
```
3. Open your browser to [http://localhost:8080](http://localhost:8080).
4. Grant Camera & Microphone permissions when prompted.

> **Note on Voice Recognition:** The Web Speech API works best on Google Chrome or Microsoft Edge. Using this app through a secure context (localhost or HTTPS) is required for most browsers to allow continuous microphone access.


