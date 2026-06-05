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

## Walking Speed Calculations

Die mathematische Formel
v=v0⋅(1+fT+fR+fW+fZ+fE+fA)v = v_0 \cdot (1 + f_T + f_R + f_W + f_Z + f_E + f_A)v=v0​⋅(1+fT​+fR​+fW​+fZ​+fE​+fA​)
SymbolBedeutungv0v_0
v0​Basisgeschwindigkeit = 1,34 m/sfTf_T
fT​TemperaturfaktorfRf_R
fR​NiederschlagsfaktorfWf_W
fW​WindfaktorfZf_Z
fZ​TageszeitfaktorfEf_E
fE​EilefaktorfAf_A
fA​Altersfaktor
Einzelfaktoren:

fTf_T
fT​: +0,10+0{,}10
+0,10 wenn T<0°CT < 0°C
T<0°C; +0,05+0{,}05
+0,05 wenn 0≤T<100 \leq T < 10
0≤T<10; 00
0 wenn 10≤T≤2510 \leq T \leq 25
10≤T≤25; +0,04+0{,}04
+0,04 wenn 25<T≤3225 < T \leq 32
25<T≤32; +0,07+0{,}07
+0,07 wenn T>32T > 32
T>32
fRf_R
fR​: trocken =0= 0
=0; leichter Regen =−0,04= -0{,}04
=−0,04; Starkregen =−0,08= -0{,}08
=−0,08; Schnee/Eis =−0,15= -0{,}15
=−0,15
fWf_W
fW​: 00
0 wenn vWind≤20v_{Wind} \leq 20
vWind​≤20 km/h; sonst −0,015⋅min⁡ ⁣(vWind−2010, 3)-0{,}015 \cdot \min\!\left(\frac{v_{Wind}-20}{10},\ 3\right)
−0,015⋅min(10vWind​−20​, 3)
fZf_Z
fZ​: Morgens +0,07+0{,}07
+0,07; Mittags 00
0; Nachmittags +0,02+0{,}02
+0,02; Abends −0,02-0{,}02
−0,02; Nachts −0,06-0{,}06
−0,06
fEf_E
fE​: kein Zeitdruck =0= 0
=0; normal =0= 0
=0; Eile =+0,17= +0{,}17
=+0,17
fAf_A
fA​: unter 20 J. =−0,05= -0{,}05
=−0,05; 20–50 J. =0= 0
=0; 51–65 J. =−0,06= -0{,}06
=−0,06; über 65 J. =−0,15−0,003⋅(Alter−65)= -0{,}15 - 0{,}003 \cdot (Alter - 65)
=−0,15−0,003⋅(Alter−65)


## Contributing

Feel free to submit issues or pull requests for improvements or bug fixes.