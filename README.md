# AI Drawing Book 🎨✨

**Live at:** [https://aidrawingbook.manideep.info/](https://aidrawingbook.manideep.info/)

<table>
  <tr>
    <td width="70%">
      <h2>Text-to-Coloring-Page generator using DALL-E 3, React 19, and in-browser OpenCV processing (Pyodide).</h2>
      <p></p>
    </td>
    <td width="30%">
      <img src="./elephant_transparent%20copy.png" width="100%" />
    </td>
  </tr>
</table>

<video controls style="max-width: 100%;">
  <source src="https://github.com/1manideep/AI-Drawing-Book/issues/1#issue-3811242033" type="video/mp4">
  Your browser does not support the video tag.
</video>

<video src="https://github.com/1manideep/AI-Drawing-Book/blob/main/AI-Drawing-Book.mp4?raw=true" controls="controls" style="max-width: 100%;">
</video>

<video src="https://github.com/1manideep/AI-Drawing-Book/raw/main/AI-Drawing-Book.mp4" controls="controls" style="max-width: 100%;">
</video>


## Building an AI Christmas Gift 🎄

Growing up, a fresh coloring book was my ultimate escape. There was something magical about a blank page and a box of crayons.

With Christmas approaching, I’ve been thinking about what to give my cousin’s kids. Instead of a store-bought toy, I decided to use my AI engineering skills to build something that captures the same childhood magic, but with a modern twist.

**The concept is simple:**
1.  **Dream it:** The kids type in anything their imagination dreams up (e.g., "A dragon eating a slice of pizza").
2.  **Create it:** The AI generates a clean, custom outline.
3.  **Color it:** They get to color it in right then and there.

---

## 🏗️ The Architecture: A Backend in the Browser

![System Architecture](./Architecture.jpeg)

Most AI apps send images to a heavy Python server. I decided to do the opposite: I’m bringing the server to the user.

*   **Pyodide & WASM:** I'm using WebAssembly to load a full Python 3.11 environment directly in the browser.
*   **Zero-Cost Compute:** By running the "backend" logic on the client's machine, I pay $0 for image processing servers, and the user's data stays private on their device.
*   **Firebase Hosting:** The entire stack is deployed as a lightning-fast Static Site (SPA), using Firebase’s global CDN for sub-second load times.

### 🧪 The Computer Vision Pipeline
Turning a raw DALL-E 3 (by OpenAI) generation into a colorable outline requires more than just a filter. Inside the browser-side Python environment, I’ve setup a specialized processing pipe:

1.  **Zhang-Suen Thinning:** This algorithm "skeletonizes" thick AI-generated lines into clean, 1-pixel paths. This ensures the coloring "boundaries" are precise and clean.
2.  **K-Means Clustering (OpenCV):** The system analyzes the original AI image to automatically extract a 5-color palette, giving kids a "suggested colors" tray.

---

## 🎨 The Journey from Idea to Reality

**Day 1: The Foundation**
Solved the "expensive backend" problem by bringing the logic into the browser using **Pyodide and WASM**.

**Day 2: The Logic**
Optimized the **BFS Flood Fill** and **Guo-Hall Thinning** algorithms for a snappy, real-time coloring experience.

**Day 3: The Experience**
Integrated **Firebase Authentication** and a **Firestore** gallery using a custom **JPEG compression hack** to keep things lightweight.

**Day 4: The Launch**
Finalized the UI polish (massive thanks to Esha More for the design expertise!) and **launched for the kids!**

---

## 🛠️ Tech Stack

*   **Frontend:** React 19 + Vite
*   **Styling:** Tailwind CSS 4.0
*   **Rendering:** Rough.js (for that "hand-drawn" feel)
*   **Compute:** WebAssembly (Pyodide) + OpenCV
*   **AI:** OpenAI DALL-E 3
*   **Infrastructure:** Firebase Hosting & Firestore
