# Law Firms Gender Distribution Visualization

An interactive data visualization showing the distribution of law firms based on their percentage of female attorneys, total number of attorneys, and local/non-local status. The visualization uses a beeswarm plot to effectively display multiple dimensions of data.

## Features

- **Interactive Beeswarm Chart**: Displays law firms as circles positioned along an axis showing the percentage of female attorneys
- **Multi-dimensional Data Display**:
  - Circle size represents the total number of attorneys
  - Color indicates whether the firm is locally based (blue) or non-local (red)
  - X-axis shows the percentage of female attorneys
- **Interactive Features**:
  - Hover tooltips showing detailed information for each firm
  - Smooth animations and transitions
  - Force-directed layout to prevent overlap
- **Visual Elements**:
  - Center line at 50% for reference
  - Legend explaining size and color coding
  - Clear axis labels and formatting

## Technologies Used

- D3.js (v7) for data visualization
- HTML5/CSS3 for structure and styling
- JavaScript (ES6+) for interactivity
- Force simulation for bubble placement

## Setup and Running

1. Clone the repository:
   ```bash
   git clone [repository-url]
   cd beeswarm-chart
   ```

2. Start a local server. You can use any of these methods:
   ```bash
   # Using Python 3
   python -m http.server 3000

   # Using Node.js
   npx http-server -p 3000

   # Using PHP
   php -S localhost:3000
   ```

3. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

## Data Structure

The visualization expects data in the following format:
```javascript
{
    name: 'Firm Name',
    fPercentage: 0.47,        // Percentage of female attorneys (0-1)
    locallyBased: 'Y',        // 'Y' for local, 'N' for non-local
    totalAttorney: 75         // Total number of attorneys
}
```

## Customization

### Modifying Colors
- Local firms: Change `#4e79a7` in the script.js file
- Non-local firms: Change `#e15759` in the script.js file

### Adjusting Dimensions
- Chart dimensions can be modified via the `margin`, `width`, and `height` variables
- Bubble sizes can be adjusted through the `sizeScale` range

### Styling
- Additional CSS customization can be done in the style section of index.html
- Tooltip styling can be modified through the `.tooltip` class

## Browser Compatibility

- Tested and working on modern browsers:
  - Chrome (latest)
  - Firefox (latest)
  - Safari (latest)
  - Edge (latest)

## License

MIT License - feel free to use and modify for your own projects. 