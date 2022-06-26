// The purpose of Point to be an easy way to convert the single quadrant used with JS Canvas to a Cartesian plane with all quadrants and normalized to be between -1 and 1 on both axes
class Point {
    constructor(x, y, scale_x, scale_y) {
        this.x = 2 * x / scale_x - 1;
        this.y = 2 * y / scale_y - 1;
        this.scale_x = scale_x;
        this.scale_y = scale_y;
    }

    // Undo the normalization that underwent when the point was created
    unwrap() {
        return [Math.round((this.x + 1) / 2 * this.scale_x), Math.round((this.y + 1) / 2 * this.scale_y)]
    }

    // Calculate the angle of this point based on its x and y coordinates
    // More specifically, it uses inverse tangent in the full cartesian plane to do this
    // Instead of regular units, it uses a value between 0 and 1
    // https://www.desmos.com/calculator/hes3iqczpc
    angle() {
        return Math.atan2(this.y, this.x) / (Math.PI * 2) + 0.4999
    }

    // Determine whether the angle of this point is in between 2 specified angles
    inArc(start, end) {
        let angle = this.angle();
        return angle < start + end && angle > start
    }

    // Based on a relative radius and a squareness factor, calculate whether or not the point would lie within the "circle"
    // https://www.desmos.com/calculator/rqiwfktl1i
    inCircle(radius = 1, squareness = 2) {
        return Math.abs(this.x)**squareness + Math.abs(this.y)**squareness < radius**squareness
    }
}

module.exports = Point;