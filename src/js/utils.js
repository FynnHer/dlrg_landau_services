// Convert speed and time to distance in kilometers
function calculateDistance(speedKmh, timeMinutes) {
    // Distance = Speed × Time
    // If speed is in km/h and time is in minutes, convert time to hours
    const timeHours = timeMinutes / 60;
    return speedKmh * timeHours;
}

// Get a random color for the circle
function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

// Default speeds for transportation modes in km/h
const transportSpeeds = {
    walking: 5,  // Zu Fuß
    biking: 15,  // Fahrrad
    driving: 60  // Auto
};

// Validate numeric input
function validateNumericInput(value, min = 1) {
    const num = parseFloat(value);
    return !isNaN(num) && num >= min;
}