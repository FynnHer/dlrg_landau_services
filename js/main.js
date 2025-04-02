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
        
        try {
            if (obstaclesEnabled) {
                // Show loading indicator
                showLoadingIndicator(true);
                
                // Get the active transport mode
                const transportMode = activeTransportMode;
                
                // Generate search area with barriers
                const searchArea = await isochroneService.generateSearchArea(
                    selectedPoint,
                    speed,
                    time,
                    transportMode
                );
                
                showLoadingIndicator(false);
                
                if (!searchArea) {
                    throw new Error('Fehler bei der Berechnung der Suchzone');
                }
                
                // Add to map
                const color = getRandomColor();
                const description = `${speed.toFixed(1)} km/h für ${time} Min. (mit Hindernissen)`;
                
                const searchAreaLayer = L.geoJSON(searchArea, {
                    style: {
                        color: color,
                        weight: 3,
                        fillColor: color,
                        fillOpacity: 0.2,
                        dashArray: '5, 5'
                    }
                }).addTo(map);
                
                searchAreaLayer.bindTooltip(description);
                circles.push({ circle: searchAreaLayer, description });
                
                // Add to UI list
                addCircleToList({ circle: searchAreaLayer, description }, circles.length - 1);
            } else {
                // Use simple circle for basic search area
                const radius = calculateDistance(speed, time);
                const circleObj = addTravelCircle(radius, getRandomColor(), 
                    `${speed.toFixed(1)} km/h für ${time} Min. (${radius.toFixed(2)} km)`);
                
                if (circleObj) {
                    addCircleToList(circleObj, circles.length - 1);
                }
            }
        } catch (error) {
            console.error('Error calculating search area:', error);
            showLoadingIndicator(false);
            alert('Fehler beim Berechnen der Suchzone: ' + error.message);
            
            // Fall back to simple circle
            const radius = calculateDistance(speed, time);
            const circleObj = addTravelCircle(radius, getRandomColor(), 
                `${speed.toFixed(1)} km/h für ${time} Min. (${radius.toFixed(2)} km)`);
            
            if (circleObj) {
                addCircleToList(circleObj, circles.length - 1);
            }
        }
    });
    
    function showLoadingIndicator(show) {
        let loadingEl = document.getElementById('loading-indicator');
        
        if (!loadingEl) {
            loadingEl = document.createElement('div');
            loadingEl.id = 'loading-indicator';
            loadingEl.innerHTML = '<div class="spinner"></div><p>Berechne Suchbereich...</p>';
            document.body.appendChild(loadingEl);
        }
        
        loadingEl.style.display = show ? 'flex' : 'none';
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
        
        // Handle different circle types (basic circle vs. geoJSON)
        let color = circleObj.circle.options.color;
        if (!color && circleObj.circle.options.style) {
            color = circleObj.circle.options.style.color;
        }
        
        li.innerHTML = `
            <span style="color: ${color}">■</span> 
            ${circleObj.description}
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
});