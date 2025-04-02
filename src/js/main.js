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
    
    // Calculate radius button
    calculateBtn.addEventListener('click', function() {
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
        
        // Calculate distance
        const radius = calculateDistance(speed, time);
        
        // Generate a random color
        const color = getRandomColor();
        
        // Create description
        const description = `${speed} km/h für ${time} Min. (${radius.toFixed(2)} km)`;
        
        // Add circle to map
        const circleObj = addTravelCircle(radius, color, description);
        
        if (circleObj) {
            // Add to the list in UI
            addCircleToList(circleObj, circles.length - 1);
        }
    });
    
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
        li.innerHTML = `
            <span style="color: ${circleObj.circle.options.color}">■</span> 
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