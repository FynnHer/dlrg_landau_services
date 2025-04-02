document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const speedInput = document.getElementById('speed');
    const timeInput = document.getElementById('time');
    const calculateBtn = document.getElementById('calculate-btn');
    const clearBtn = document.getElementById('clear-btn');
    const circlesContainer = document.getElementById('circles-container');
    const controlPanel = document.getElementById('control-panel');
    const minimizeBtn = document.getElementById('minimize-btn');
    const panelHeader = document.querySelector('.panel-header');
    
    // Transport mode buttons
    const walkingBtn = document.getElementById('walking');
    const bikingBtn = document.getElementById('biking');
    const drivingBtn = document.getElementById('driving');
    
    // Map type buttons
    const standardMapBtn = document.getElementById('standard-map');
    const satelliteMapBtn = document.getElementById('satellite-map');
    const streetsMapBtn = document.getElementById('streets-map');
    
    let activeTransportMode = 'walking';
    
    // Minimize/maximize panel
    panelHeader.addEventListener('click', function(e) {
        // Prevent action when clicking on the minimize button specifically
        // (it has its own handler)
        if (e.target === minimizeBtn || e.target.closest('.minimize-btn')) {
            return;
        }
        
        togglePanel();
    });
    
    minimizeBtn.addEventListener('click', togglePanel);
    
    function togglePanel() {
        controlPanel.classList.toggle('minimized');
    }
    
    // Map type selection
    standardMapBtn.addEventListener('click', function() {
        setActiveMapType('standard');
        changeMapType('standard');
    });
    
    satelliteMapBtn.addEventListener('click', function() {
        setActiveMapType('satellite');
        changeMapType('satellite');
    });
    
    streetsMapBtn.addEventListener('click', function() {
        setActiveMapType('streets');
        changeMapType('streets');
    });
    
    function setActiveMapType(type) {
        // Update UI
        [standardMapBtn, satelliteMapBtn, streetsMapBtn].forEach(btn => {
            btn.classList.remove('active');
        });
        
        document.getElementById(`${type}-map`).classList.add('active');
    }
    
    // Transport mode selection
    walkingBtn.addEventListener('click', function() {
        setActiveMode('walking');
        speedInput.value = transportSpeeds.walking;
    });
    
    bikingBtn.addEventListener('click', function() {
        setActiveMode('biking');
        speedInput.value = transportSpeeds.biking;
    });
    
    drivingBtn.addEventListener('click', function() {
        setActiveMode('driving');
        speedInput.value = transportSpeeds.driving;
    });
    
    function setActiveMode(mode) {
        activeTransportMode = mode;
        
        // Update UI
        [walkingBtn, bikingBtn, drivingBtn].forEach(btn => {
            btn.classList.remove('active');
        });
        
        document.getElementById(mode).classList.add('active');
    }
    
    // Add collapsible advanced options section
    const advancedOptionsSection = document.createElement('div');
    advancedOptionsSection.className = 'collapsible-section';
    advancedOptionsSection.innerHTML = `
        <div class="section-header" id="advanced-options-header">
            <h3>Erweiterte Optionen</h3>
            <span class="toggle-icon">▼</span>
        </div>
        <div class="section-content" id="advanced-options-content">
            <div class="option-group">
                <button id="consider-obstacles" class="btn btn-secondary">Hindernisse berücksichtigen</button>
                <p class="option-description">Berücksichtigt Flüsse, Autobahnen und andere Barrieren bei der Berechnung</p>
            </div>
            <div class="option-group">
                <label>Geländemodus:</label>
                <div class="terrain-mode-buttons">
                    <button id="all-terrain" class="btn btn-secondary active">Querfeldein</button>
                    <button id="roads-only" class="btn btn-secondary">Nur Straßen</button>
                </div>
                <p class="option-description">Querfeldein: kann über Felder gehen. Nur Straßen: bleibt auf Wegen</p>
            </div>
        </div>
    `;
    
    // Insert after transport modes
    document.querySelector('.transport-modes').parentNode.after(advancedOptionsSection);
    
    // Toggle collapsible section
    document.getElementById('advanced-options-header').addEventListener('click', function() {
        const content = document.getElementById('advanced-options-content');
        const icon = this.querySelector('.toggle-icon');
        
        if (content.style.display === 'none') {
            content.style.display = 'block';
            icon.textContent = '▼';
        } else {
            content.style.display = 'none';
            icon.textContent = '►';
        }
    });
    
    // Initialize the isochrone service
    const isochroneService = new IsochroneService();
    
    // Consider obstacles button handler
    const obstaclesBtn = document.getElementById('consider-obstacles');
    let obstaclesEnabled = false;
    
    obstaclesBtn.addEventListener('click', function() {
        obstaclesEnabled = !obstaclesEnabled;
        
        if (obstaclesEnabled) {
            this.classList.add('btn-active');
            this.textContent = 'Hindernisse werden berücksichtigt';
        } else {
            this.classList.remove('btn-active');
            this.textContent = 'Hindernisse berücksichtigen';
        }
    });
    
    // Terrain mode selection
    const allTerrainBtn = document.getElementById('all-terrain');
    const roadsOnlyBtn = document.getElementById('roads-only');
    let useRoadsOnly = false;
    
    allTerrainBtn.addEventListener('click', function() {
        if (!this.classList.contains('active')) {
            this.classList.add('active');
            roadsOnlyBtn.classList.remove('active');
            useRoadsOnly = false;
        }
    });
    
    roadsOnlyBtn.addEventListener('click', function() {
        if (!this.classList.contains('active')) {
            this.classList.add('active');
            allTerrainBtn.classList.remove('active');
            useRoadsOnly = true;
        }
    });
    
    // Calculate radius button
    calculateBtn.addEventListener('click', async function() {
        // Validate inputs
        if (!validateNumericInput(speedInput.value) || !validateNumericInput(timeInput.value)) {
            alert('Bitte geben Sie gültige Werte für Geschwindigkeit und Zeit ein.');
            return;
        }
        
        if (!selectedPoint) {
            alert('Bitte wählen Sie zuerst einen Punkt auf der Karte aus.');
            return;
        }
        
        // Get input values
        const speed = parseFloat(speedInput.value);
        const time = parseFloat(timeInput.value);
        
        // Get the current transport mode
        // Fix: Ensure we get the mode properly
        let transportMode = activeTransportMode;
        
        console.log(`Active transport mode: ${transportMode}`);
        
        // Loading indicator
        const oldButtonText = this.textContent;
        this.textContent = 'Berechne...';
        this.disabled = true;
        
        try {
            if (obstaclesEnabled) {
                console.log(`Calculating with obstacles: mode=${transportMode}, speed=${speed}, time=${time}, roadsOnly=${useRoadsOnly}`);
                
                // Generate search area with obstacles
                const searchArea = await isochroneService.generateSearchArea(
                    selectedPoint,
                    speed,
                    time,
                    transportMode,
                    useRoadsOnly
                );
                
                // Check if result is a fallback circle
                const isFallback = searchArea.features && 
                                  searchArea.features[0] && 
                                  searchArea.features[0].properties && 
                                  searchArea.features[0].properties.isFallback;
                
                if (isFallback) {
                    console.warn('Using fallback circle - API response could not be processed');
                }
                
                // Random color
                const color = getRandomColor();
                
                // Create description
                const terrainModeText = useRoadsOnly ? 'Nur Straßen' : 'Querfeldein';
                let description = `${speed.toFixed(1)} km/h für ${time} Min. (${terrainModeText})`;
                
                // Add area if available
                if (searchArea.features[0].properties && searchArea.features[0].properties.area) {
                    const area = searchArea.features[0].properties.area;
                    description += ` - ${area.toFixed(2)} km²`;
                }
                
                // Add fallback note if it's a fallback
                if (isFallback) {
                    description += ' [Fallback-Kreis]';
                }
                
                // Add GeoJSON to map
                const searchAreaLayer = L.geoJSON(searchArea, {
                    style: {
                        color: color,
                        weight: 3,
                        fillColor: color,
                        fillOpacity: 0.2,
                        dashArray: useRoadsOnly ? '5, 5' : ''  // Dashed line for "Roads Only"
                    }
                }).addTo(map);
                
                // Add tooltip
                searchAreaLayer.bindTooltip(description);
                
                // Save circle
                const circleObj = { 
                    circle: searchAreaLayer, 
                    description, 
                    isAdvanced: true,
                    terrainMode: terrainModeText,
                    isFallback: isFallback
                };
                
                circles.push(circleObj);
                
                // Add to UI list
                addCircleToList(circleObj, circles.length - 1);
                
                // Fit map to show the entire area
                map.fitBounds(searchAreaLayer.getBounds());
            } else {
                // Basic circle function
                const radius = calculateDistance(speed, time);
                const circleObj = addTravelCircle(radius, getRandomColor(), 
                    `${speed.toFixed(1)} km/h für ${time} Min. (${radius.toFixed(2)} km)`);
                
                if (circleObj) {
                    addCircleToList(circleObj, circles.length - 1);
                }
            }
        } catch (error) {
            console.error('Error calculating search area:', error);
            alert(`Fehler bei der Berechnung: ${error.message}`);
            
            // Create simple circle as fallback
            const radius = calculateDistance(speed, time);
            const circleObj = addTravelCircle(radius, getRandomColor(), 
                `${speed.toFixed(1)} km/h für ${time} Min. (${radius.toFixed(2)} km) [Fallback]`);
            
            if (circleObj) {
                addCircleToList(circleObj, circles.length - 1);
            }
        } finally {
            // Always restore button state
            this.textContent = oldButtonText;
            this.disabled = false;
        }
    });
    
    // Function to show a loading spinner
    function showLoadingSpinner(show) {
        // Check if the spinner already exists
        let spinner = document.getElementById('loading-spinner');
        
        if (show) {
            if (!spinner) {
                // Create a new spinner
                spinner = document.createElement('div');
                spinner.id = 'loading-spinner';
                spinner.className = 'loading-spinner';
                spinner.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Berechne...';
                document.body.appendChild(spinner);
            }
            spinner.style.display = 'flex';
        } else if (spinner) {
            // Hide the spinner
            spinner.style.display = 'none';
        }
    }
    
    // Clear all button
    clearBtn.addEventListener('click', function() {
        clearAll();
        // Clear the list in UI
        circlesContainer.innerHTML = '';
    });
    
    // Add circle to the list in UI
    function addCircleToList(circleObj, index) {
        const li = document.createElement('li');
        li.className = 'circle-item';
        
        // Determine color
        let color;
        if (circleObj.circle.options && circleObj.circle.options.color) {
            color = circleObj.circle.options.color;
        } else if (circleObj.circle.options && circleObj.circle.options.style) {
            color = circleObj.circle.options.style.color;
        } else {
            color = '#3388ff'; // Default color
        }
        
        // Show icon depending on terrain mode
        let terrainIcon = '';
        if (circleObj.isAdvanced) {
            terrainIcon = circleObj.terrainMode === 'Nur Straßen' 
                ? '<i class="fas fa-road" title="Nur Straßen"></i> ' 
                : '<i class="fas fa-mountain" title="Querfeldein"></i> ';
        }
        
        li.innerHTML = `
            <span class="color-box" style="background-color: ${color}"></span>
            ${terrainIcon}${circleObj.description}
            <button class="delete-btn" data-index="${index}">×</button>
        `;
        
        circlesContainer.appendChild(li);
        
        // Add delete event
        li.querySelector('.delete-btn').addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            removeCircle(index);
            updateCirclesList();
        });
    }
    
    // Update the circles list after deletion
    function updateCirclesList() {
        circlesContainer.innerHTML = '';
        circles.forEach((circle, index) => {
            addCircleToList(circle, index);
        });
    }
    
    // Initialize the POI service
    const poiService = new POIService();
    
    // Create the Show POIs button
    const showPoisBtn = document.createElement('button');
    showPoisBtn.id = 'show-pois-btn';
    showPoisBtn.textContent = 'POIs im letzten Kreis anzeigen';
    showPoisBtn.disabled = true; // Initially disabled
    
    // Create a container for POI status
    const poiStatusContainer = document.createElement('div');
    poiStatusContainer.className = 'poi-status';
    
    // Add button after the clear button
    clearBtn.after(showPoisBtn);
    showPoisBtn.after(poiStatusContainer);
    
    // Enable/disable POI button when circles change
    function updatePoiButtonState() {
        showPoisBtn.disabled = circles.length === 0;
    }
    
    // Add event to show POIs
    showPoisBtn.addEventListener('click', async function() {
        if (circles.length === 0) {
            alert('Bitte erstellen Sie zuerst einen Suchbereich.');
            return;
        }
        
        // Show loading state
        const originalText = this.textContent;
        this.textContent = 'Lade POIs...';
        this.classList.add('loading');
        this.disabled = true;
        poiStatusContainer.textContent = 'Suche nach wichtigen Punkten...';
        
        try {
            // Get the last created circle
            const lastCircle = circles[circles.length - 1].circle;
            
            // Clear any existing POIs
            poiService.clearPOIs(map);
            
            // Get POIs in the circle
            const poisData = await poiService.getPOIsInCircle(lastCircle);
            
            // Display POIs on the map
            poiService.displayPOIs(poisData, map);
            
            // Update status
            if (poisData.features && poisData.features.length > 0) {
                poiStatusContainer.textContent = `${poisData.features.length} POIs gefunden`;
            } else {
                poiStatusContainer.textContent = 'Keine POIs in diesem Bereich gefunden';
            }
        } catch (error) {
            console.error('Error showing POIs:', error);
            poiStatusContainer.textContent = 'Fehler beim Laden der POIs';
            alert('Es gab einen Fehler beim Laden der POIs. Bitte versuchen Sie es später erneut.');
        } finally {
            // Restore button state
            this.textContent = originalText;
            this.classList.remove('loading');
            this.disabled = false;
        }
    });
    
    // Update POI button when circles change
    const originalAddCircleToList = addCircleToList;
    addCircleToList = function(circleObj, index) {
        originalAddCircleToList(circleObj, index);
        updatePoiButtonState();
    };
    
    const originalUpdateCirclesList = updateCirclesList;
    updateCirclesList = function() {
        originalUpdateCirclesList();
        updatePoiButtonState();
    };
    
    // Clear POIs when all circles are cleared
    const originalClearAll = clearAll;
    clearAll = function() {
        originalClearAll();
        poiService.clearPOIs(map);
        updatePoiButtonState();
        poiStatusContainer.textContent = '';
    };
});