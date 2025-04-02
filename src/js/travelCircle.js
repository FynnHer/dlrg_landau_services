class TravelCircle {
    constructor(center, radius, color, description) {
        this.center = center;
        this.radius = radius;
        this.color = color;
        this.description = description;
        this.circleElement = null;
    }

    // Create the description for display
    getDescription() {
        return this.description;
    }

    // Get the radius in kilometers
    getRadius() {
        return this.radius;
    }

    // Get the circle color
    getColor() {
        return this.color;
    }
}