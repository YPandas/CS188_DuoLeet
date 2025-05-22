## DuoLeet - Programming Practice App

A full-stack application for practicing programming interview questions with an interactive leaderboard and pet system.

---

### 🚀 Quick Start

#### Prerequisites

* Node.js (v14 or higher)
* npm (comes with Node.js)
* OpenAI API key (platform.openai.com)

#### Setup and Installation

1. **Clone the repository**

   ```bash
   git clone git@github.com:YPandas/CS188_DuoLeet.git
   cd CS188_DuoLeet
   ```

2. **Set up the backend**

   ```bash
   cd server
   npm install
   ```

   Create a `.env` file in the `server` directory with the following:

   ```env
   OPENAI_API_KEY=your_api_key_here
   PORT=5001
   ```

3. **Set up the frontend**

   ```bash
   cd client
   npm install
   ```

---

### Running the Application

1. **Start the backend server**

   ```bash
   cd server
   npm start
   ```

   The server will run on `http://localhost:5001`.

2. **Start the frontend** (in a new terminal)

   ```bash
   cd client
   npm start
   ```

   The client will run on `http://localhost:3000`.

---

### 🎯 Features

* **Practice programming interview questions**
* **Get instant feedback** on your solutions
* **Track your daily streak** to stay on track for your coding interview
* **Compete on the leaderboard**
* **Level up your virtual pet** as you practice

---

### Authors

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

DuoLeet was developed as a project for CS 188 in Spring 2025 by David Wang, Yiran Wu, Yuki Huang, and Emily Ou.

