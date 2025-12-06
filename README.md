# SBE Android App

## Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run on Android**:
   ```bash
   npx react-native run-android
   ```

## Features

- **Sync**: Tap the "Sync" button on the home screen to fetch data from GitHub.
  - Downloads images to your Phone Gallery (`Pictures/SBE_App/BrandName`).
  - Works offline once synced.
- **Cart**: Add items with "1 Set", "2 Sets", etc. Share order as PDF via WhatsApp.
- **Navigation**: Swipe between products in the Details view. Tap image for fullscreen.

## Troubleshooting

- **Permissions**: Grant Storage permissions when prompted to enable Image Downloads.
- **PDF Generation**: If PDF share fails, ensure you have a PDF viewer or WhatsApp installed.
