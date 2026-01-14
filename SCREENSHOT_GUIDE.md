# Screenshot Guide for GrindMap

## How to Add Visual Previews

To enhance the project's visual appeal and help users understand GrindMap better, follow these steps:

### 1. Taking Screenshots

Run the application and capture:

1. **Dashboard Overview** (`dashboard.png`)
   - Main page with all platform cards
   - Overall progress circle
   - Username input section

2. **Platform Details** (`platform-details.png`)
   - Expanded platform card showing detailed stats
   - Difficulty breakdown (for LeetCode)
   - Rating and rank information

3. **Activity Heatmap** (`heatmap.png`)
   - LeetCode submission calendar
   - Color-coded activity visualization

4. **Today's Activity** (`today-activity.png`)
   - Daily activity tracker
   - Status indicators for each platform

5. **Demo Mode** (`demo-mode.png`)
   - Demo banner and sample data view

### 2. Organizing Screenshots

Create the following directory structure:

```
GrindMap/
└── public/
    └── screenshots/
        ├── dashboard.png
        ├── platform-details.png
        ├── heatmap.png
        ├── today-activity.png
        └── demo-mode.png
```

### 3. Recommended Tools

- **Windows**: Snipping Tool, Snip & Sketch (Win + Shift + S)
- **macOS**: Screenshot (Cmd + Shift + 4)
- **Linux**: GNOME Screenshot, Flameshot

### 4. Screenshot Specifications

- **Format**: PNG (for transparency and quality)
- **Resolution**: 1920x1080 or higher
- **File Size**: Optimize to < 500KB per image
- **Aspect Ratio**: 16:9 preferred

### 5. Creating GIFs/Videos

For animated demos:

- **GIF Creation**: Use ScreenToGif, LICEcap, or Gifox
- **Video Recording**: OBS Studio, Loom, or QuickTime
- **Duration**: 30-60 seconds per feature
- **File Size**: Keep under 10MB

### 6. Updating README

Once screenshots are added, update the README.md:

```markdown
### Visual Preview

![Dashboard Overview](./public/screenshots/dashboard.png)
*Main dashboard showing multi-platform tracking*

![Platform Details](./public/screenshots/platform-details.png)
*Detailed statistics with expandable cards*

![Activity Heatmap](./public/screenshots/heatmap.png)
*Submission calendar and activity tracking*
```

### 7. Hosting Demo (Optional)

Consider deploying to:
- **Vercel**: Free hosting for React apps
- **Netlify**: Automatic deployments from GitHub
- **GitHub Pages**: Simple static hosting

Update README with live demo link:
```markdown
[🎯 Live Demo](https://your-demo-url.vercel.app)
```

## Tips for Great Screenshots

✅ Use consistent browser window size
✅ Clear browser cache for clean UI
✅ Use demo mode for consistent data
✅ Capture at 100% zoom level
✅ Include mouse cursor for interactive elements
✅ Add annotations if needed (arrows, highlights)

## Need Help?

If you need assistance with screenshots or visual assets, open an issue or reach out to the maintainers!
