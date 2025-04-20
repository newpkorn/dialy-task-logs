# 📝 Daily Task Log with Google Apps Script

![Google Apps Script](https://img.shields.io/badge/Google%20Apps%20Script-4285F4?logo=google&logoColor=white)
![Google Sheets](https://img.shields.io/badge/Google%20Sheets-34A853?logo=google-sheets&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)

A complete daily task logging system that automatically organizes data in Google Sheets.

## ✨ Key Features

-   📅 Comprehensive daily task logging
-   🔍 Filterable reports with multiple criteria
-   ✏️ Edit or delete existing entries
-   📊 Automatic monthly sheet organization
-   📱 Fully responsive design

## ⚙️ Installation

### Method 1: Manual Setup

1. **Create a new Google Sheet**

    - Go to [Google Sheets](https://sheets.google.com)
    - Create a new blank spreadsheet
    - Rename it (e.g., "Daily Task Log")

2. **Open Apps Script Editor**

    - Click `Extensions` > `Apps Script`
    - Delete any default code

3. **Add Project Files**

    - Create these files in the Apps Script editor:
        - `code.gs` (copy from this repository)
        - `index.html` (copy from this repository)
        - `scripts.html` (copy from this repository)
        - `styles.html` (copy from this repository)
        - `appsscript.json` (copy from this repository)

4. **Deploy Web App**
    - Click `Deploy` > `New deployment`
    - Select type `Web app`
    - Set "Execute as" to `Me`
    - Set "Who has access" to `Anyone` (or your preferred access level)
    - Click `Deploy`
    - Copy the web app URL

### Method 2: Using Clasp (Advanced)

1. **Install Clasp**

```
npm install -g @google/clasp
```

2. **Login to Clasp**

```
clasp login
```

3. **Clone this repository**

```
git clone https://github.com/newpkorn/daily-task-log.git
cd daily-task-log
```

4. **Create a new Apps Script project**

```
clasp create --type sheets --title "Daily Task Log"
```

5. **Push the code**

```
clasp push
```

6. **Open the project in the editor**

```
clasp open
```

7. **Deploy the web app**

```
clasp deploy
```

Or

     - In the Apps Script editor, click `Deploy` > `New deployment`
     - Follow the same steps as in Method 1

## Project Structure

```

├── appsscript.json      # Apps Script configuration
├── code.gs              # Main server-side code
├── index.html           # Main HTML interface
├── scripts.html         # Client-side JavaScript
└── styles.html          # CSS styles

```

## 🚀 How to Use

1. **Create New Log**

    - Fill out the form with task details
    - Click "Submit Log"
    - Data will be saved to Google Sheets in monthly sheets

2. **View Reports**
    - Switch to the "View Reports" tab
    - Filter by:
        - Month
        - Year
        - Name
    - Edit or delete entries as needed

## ⚙️ Configuration

You can customize the following in `code.gs`:

-   Default values for name and department
-   Date format preferences
-   Sheet naming conventions

## 💡 Tips & Tricks

-   Configure default values in `code.gs`
-   Data is automatically organized by month
-   Export data directly from Google Sheets

## 🔧 Troubleshooting

-   **Authorization issues**: Click "Review Permissions"
-   **Data not saving**: Verify script is bound to correct sheet
-   **UI issues**: Clear browser cache and reload

```
| Issue                   | Solution                                              |
|-------------------------|-------------------------------------------------------|
| "Script not authorized" | Click "Review Permissions" and grant necessary access |
| Data not saving         | Verify the script is bound to the correct spreadsheet |
| UI not loading properly | Clear browser cache and reload the app                |
```

## 📝 Credits

---

Developed by pakorn
[![GitHub](https://img.shields.io/badge/GitHub-Profile-blue?style=flat&logo=github)](https://github.com/newpkorn)

```

```
