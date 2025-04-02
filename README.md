# Travel Radius Map

This project is a web application that allows users to visualize travel distances on a map based on selected transportation modes, speed, and time. Users can select a point on the map and draw circles representing the maximum area that can be traveled within a specified time.

## Features

- Full-screen interactive map
- Select a point on the map
- Input speed (in km/h) or select a mode of transportation (walking, biking, driving)
- Enter a time to calculate the travel radius
- Draw multiple circles with different travel statistics
- Highlight streets for better visualization

## Project Structure

```
travel-radius-map
├── src
│   ├── index.html        # Main HTML document
│   ├── css
│   │   └── styles.css    # Styles for the webpage
│   ├── js
│   │   ├── main.js       # Entry point for JavaScript functionality
│   │   ├── map.js        # Functions for map rendering and manipulation
│   │   ├── travelCircle.js # Class for managing travel circles
│   │   └── utils.js      # Utility functions for calculations
│   └── assets
│       └── icons
│           ├── walking.svg # Icon for walking mode
│           ├── biking.svg  # Icon for biking mode
│           └── driving.svg # Icon for driving mode
├── README.md              # Documentation for the project
└── package.json           # npm configuration file
```

## Setup Instructions

1. Clone the repository:
   ```
   git clone <repository-url>
   cd travel-radius-map
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Open `src/index.html` in a web browser to view the application.

## Usage Guidelines

- Click on the map to select a point.
- Enter the desired speed or select a mode of transportation.
- Input the time to calculate the travel radius.
- The application will draw circles on the map representing the maximum travel area.

## Contributing

Feel free to submit issues or pull requests for improvements or bug fixes.