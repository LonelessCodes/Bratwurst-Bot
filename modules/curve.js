/**
 * This is from someones JSbin pen. Can't remember who nor the link. Sorry
 */

module.exports = function (ctx, text, points) {	
    if (points.length !== 8) return;
    
    const Ribbon = {
        maxChar: 140, startX: points[0], startY: points[1],
        control1X: points[2], control1Y: points[3],
        control2X: points[4], control2Y: points[5],
        endX: points[6], endY: points[7]
    };

    /**
     * FILL RIBBON
     */
    var textCurve = [];
    var ribbon = text.substring(0, Ribbon.maxChar);
    var curveSample = 1000;

    let xDist = 0;
    var i = 0;
    for (i = 0; i < curveSample; i++) {
        const a = new bezier2(i / curveSample, Ribbon.startX, Ribbon.startY, Ribbon.control1X, Ribbon.control1Y, Ribbon.control2X, Ribbon.control2Y, Ribbon.endX, Ribbon.endY);
        const b = new bezier2((i + 1) / curveSample, Ribbon.startX, Ribbon.startY, Ribbon.control1X, Ribbon.control1Y, Ribbon.control2X, Ribbon.control2Y, Ribbon.endX, Ribbon.endY);
        const c = new bezier(a, b);
        textCurve.push({ bezier: a, curve: c.curve });
    }

    const letterPadding = ctx.measureText(" ").width / 4;
    const w = ribbon.length;
    const ww = Math.round(ctx.measureText(ribbon).width);

    const totalPadding = (w - 1) * letterPadding;
    const totalLength = ww + totalPadding;
    let p = 0;

    const cDist = textCurve[curveSample - 1].curve.cDist;

    const z = (cDist / 2) - (totalLength / 2);

    for (i = 0; i < curveSample; i++) {
        if (textCurve[i].curve.cDist >= z) {
            p = i;
            break;
        }
    }
    
    for (i = 0; i < w; i++) {
        ctx.save();
        ctx.translate(textCurve[p].bezier.point.x, textCurve[p].bezier.point.y);
        ctx.rotate(textCurve[p].curve.rad);
        ctx.fillText(ribbon[i], 0, 0);
        ctx.restore();

        const x1 = ctx.measureText(ribbon[i]).width + letterPadding;
        let x2 = 0;
        for (let j = p; j < curveSample; j++) {
            x2 = x2 + textCurve[j].curve.dist;
            if (x2 >= x1) {
                p = j;
                break;
            }
        }
    }
    //end FillRibon

    function bezier(b1, b2) {
        //Final stage which takes p, p+1 and calculates the rotation, distance on the path and accumulates the total distance
        this.rad = Math.atan(b1.point.mY / b1.point.mX);
        this.b2 = b2;
        this.b1 = b1;
        // const dx = (b2.x - b1.x);
        // const dx2 = (b2.x - b1.x) * (b2.x - b1.x);
        this.dist = Math.sqrt(((b2.x - b1.x) * (b2.x - b1.x)) + ((b2.y - b1.y) * (b2.y - b1.y)));
        xDist = xDist + this.dist;
        this.curve = { rad: this.rad, dist: this.dist, cDist: xDist };
    }

    function bezierT(t, startX, startY, control1X, control1Y, control2X, control2Y, endX, endY) {
        //calculates the tangent line to a point in the curve; later used to calculate the degrees of rotation at this point.
        this.mx = (3 * (1 - t) * (1 - t) * (control1X - startX)) + ((6 * (1 - t) * t) * (control2X - control1X)) + (3 * t * t * (endX - control2X));
        this.my = (3 * (1 - t) * (1 - t) * (control1Y - startY)) + ((6 * (1 - t) * t) * (control2Y - control1Y)) + (3 * t * t * (endY - control2Y));
    }

    function bezier2(t, startX, startY, control1X, control1Y, control2X, control2Y, endX, endY) {
        //Quadratic bezier curve plotter
        this.Bezier1 = new bezier1(t, startX, startY, control1X, control1Y, control2X, control2Y);
        this.Bezier2 = new bezier1(t, control1X, control1Y, control2X, control2Y, endX, endY);
        this.x = ((1 - t) * this.Bezier1.x) + (t * this.Bezier2.x);
        this.y = ((1 - t) * this.Bezier1.y) + (t * this.Bezier2.y);
        this.slope = new bezierT(t, startX, startY, control1X, control1Y, control2X, control2Y, endX, endY);

        this.point = { t: t, x: this.x, y: this.y, mX: this.slope.mx, mY: this.slope.my };
    }
    function bezier1(t, startX, startY, control1X, control1Y, control2X, control2Y) {
        //linear bezier curve plotter; used recursivly in the quadratic bezier curve calculation
        this.x = ((1 - t) * (1 - t) * startX) + (2 * (1 - t) * t * control1X) + (t * t * control2X);
        this.y = ((1 - t) * (1 - t) * startY) + (2 * (1 - t) * t * control1Y) + (t * t * control2Y);
    }
};
