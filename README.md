# Machine Part Picker - Desktop Quoting Application

> A local-first desktop application built with Electron and Node.js to streamline the process of creating and managing quotes for complex machines and equipment. This project serves as a prototype to solve the inefficiencies of manual quoting, providing a centralized and reliable tool for sales and technical teams.

---

### 📸 Application Demo
![image](https://github.com/user-attachments/assets/9e220936-190d-4751-8a51-f9b847ba99c7)


---

## 📚 Table of Contents
- [🚀 Key Features](#-key-features)
- [🛠️ Tech Stack & Architecture](#️-tech-stack--architectural-concepts)
- [⚙️ Getting Started](#️-getting-started)
- [📜 Available Scripts](#-available-scripts)
- [📄 License](#-license)

---

## 🚀 Key Features

* **🗂️ Centralized Catalog:** Manage components and prices in a local SQLite database.
* **📂 Category Management:** Organize components into logical, collapsible categories.
* **✨ Full CRUD Operations:** Easily Create, Read, Update, and Delete components and categories.
* **🧾 Intuitive Quote Builder:** Add components to a quote with a single click.
* **🧮 Dynamic Calculations:** Totals and sub-totals are updated instantly.
* **💸 Flexible Discount System:** Apply percentage or fixed-value discounts using the Strategy Pattern.
* **💾 Persistent Storage:** All created quotes are saved locally for future reference.
* **⚡ Non-Blocking UI:** Built on a fully asynchronous architecture to ensure a responsive, freeze-free experience.

---

## 🛠️ Tech Stack & Architectural Concepts

This project was built with a focus on creating a stable, maintainable, and performant desktop application.

| Category          | Technology / Concept                                                                                              |
| ----------------- | ----------------------------------------------------------------------------------------------------------------- |
| **Core Framework**| [Electron](https://www.electronjs.org/)                                                                           |
| **Backend Runtime**| [Node.js](https://nodejs.org/)                                                                                    |
| **Database** | [SQLite](https://www.sqlite.org/index.html) (via the `sqlite3` npm package)                                         |
| **Frontend** | HTML5, CSS3, Vanilla JavaScript (ES6+)                                                                            |

<details>
<summary><strong>Architectural Highlights</strong></summary>

-   **Asynchronous IPC:** Uses Electron's Inter-Process Communication (IPC) model to ensure the UI (Renderer Process) never blocks while waiting for database operations handled by the Main Process.
-   **Design Patterns:**
    -   **Singleton:** Used to manage a single, controlled connection to the SQLite database.
    -   **Observer:** Implemented in pure JavaScript to make the UI instantly reactive to changes in the quote's state.
    -   **Strategy:** Applied to the discount system, allowing for different calculation methods to be added or swapped flexibly.

</details>

---

## ⚙️ Getting Started

Follow these instructions to get a copy of the project up and running on your local machine.

### Prerequisites

You need to have [Node.js](https://nodejs.org/) (which includes npm) installed on your system.

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd MachinePartPicker
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Rebuild native modules (if necessary):**
    If you encounter any issues with the SQLite module, run the `electron-rebuild` command.
    ```bash
    npm run rebuild
    ```

4.  **Set up the database:**
    This script creates the `orcamentos.db` file and its internal tables. **This step is mandatory before the first run.**
    ```bash
    npm run db:setup
    ```

5.  **Populate the database with sample data (optional):**
    To have a rich catalog of components to work with, run the populate script.
    ```bash
    npm run db:populate
    ```

### Running the Application

Once the setup is complete, you can start the application with:

```bash
npm run start
