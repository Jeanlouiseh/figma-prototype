# Figma Prototype - CLASH Detection System

High-fidelity interactive prototype built from Figma designs using React and Material UI.

## 🚀 Quick Start

### Prerequisites
- Node.js (v14+)
- npm or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Jeanlouiseh/figma-prototype.git
   cd figma-prototype
   ```

2. **Set up environment variables:**
   ```bash
   # Copy the example file
   cp .env.example .env.local
   ```

3. **Add your Figma token to `.env.local`:**
   ```
   REACT_APP_FIGMA_TOKEN=figd_your_actual_token_here
   REACT_APP_FIGMA_FILE_ID=Dcm2X8Sg3HQHY0AUJOwTOg
   ```

   **How to get your Figma token:**
   - Go to [Figma Account Settings](https://www.figma.com/files/settings)
   - Scroll to "Personal Access Tokens"
   - Click "Create a new personal access token"
   - Copy it and paste it into `.env.local`

4. **Install dependencies:**
   ```bash
   npm install
   ```

5. **Start the development server:**
   ```bash
   npm start
   ```

   The app will open at `http://localhost:3000`

## 📁 Project Structure

```
src/
├── components/
│   └── Sidebar.js           # Navigation sidebar
├── pages/
│   ├── ProjectDashboard.js  # Main dashboard screen
│   └── ClashDetection.js    # Clash detection table screen
├── App.js                   # Main app component with routing
├── App.css                  # App styling
├── index.js                 # React entry point
└── index.css                # Base styles
public/
└── index.html               # HTML entry point
```

## 🎨 Screens

### 1. Project Dashboard
- Grid view of projects
- Project filtering
- Create project button

### 2. Clash Detection
- Data table with clash detection results
- iModel filtering (sidebar)
- Search functionality
- Bulk selection
- Create test button

## 🛠 Technologies

- **React 18** - UI library
- **React Router** - Client-side routing
- **Material UI (MUI)** - Component library
- **Axios** - HTTP client for Figma API

## 📝 Environment Variables

Required environment variables (set in `.env.local`):

```
REACT_APP_FIGMA_TOKEN=     # Your Figma personal access token
REACT_APP_FIGMA_FILE_ID=   # Figma file ID from the URL
```

⚠️ **Never commit `.env.local` to Git** - it's already in `.gitignore`

## 🔗 Resources

- [Figma API Documentation](https://www.figma.com/developers/api)
- [React Documentation](https://react.dev)
- [Material UI Documentation](https://mui.com)

## 📄 License

This project is private.

---

**Built with ❤️ using React and Figma**
