import { React, useEffect, useRef, useState } from "react";

/** General Variables */
const PI = Math.PI,
  radius = 0.1,
  radius2 = 2 * radius,
  cos = Math.cos,
  sin = Math.sin,
  pow = Math.pow,
  random = Math.random;

let ctx = null,
  canvas = null;

/** Specification Variables */
// Range of Confetto width
const widthMin = 3,
  widthMax = 15,
  // Range of Confetto height.
  heightMin = 5,
  heightMax = 15,
  // The vertical acceleration
  gravity = 20,
  // The horizontal acceleration range [0 - 100]
  deviation = 100,
  // The initial vertical speed range
  vvMin = 15,
  vvMax = 30,
  // The initial horizontal speed range
  vhMin = -1,
  vhMax = 1,
  timeRatio = 100,
  // The wiggle frequency of confetto, lower the quicker.
  motionFrequency = 7777,
  confettiColors = ["#EF2964", "#00C09D", "#2D87B0", "#48485E", "#EFFF1D"];

// Global Helper functions
function randomRange(min, max) {
  return Math.random() * (max - min) + min;
}

class Confetto {
  /**
   * The constructor.
   * @param {*} width
   * @param {*} height
   * @param {*} color
   * @param {*} x : The initial horizontal position.
   * @param {*} y : The initial vertical position.
   * @param {*} ivx : The initial horizontal velocity.
   * @param {*} ivy : THe initial vertical velocity.
   */
  constructor(width, height, color, x, y, ivx, ivy) {
    let randomTemp = random();
    // Dimensions of the Confetto
    this.dimensions = {
      width_: width,
      height_: height,
    };
    // The initial position where the confetto is first rendered on the screen
    this.position = {
      x_: x,
      y_: y,
    };
    this.color_ = color;
    // The initial speed.
    this.velocity = {
      x_: ivx,
      y_: ivy,
    };
    // The amount of resistance to all directions [0 - 100%]
    this.drag = random();
    this.scale = {
      x_: 1,
      y_: 1,
    };
    this.skew = {
      x_: randomRange(-0.2, 0.2),
      y_: 0,
    };
    // splines over [0 - 1]
    this.splineX = this.createPoisson();
    // splineX is basically used as a reference to determine which splineY to use
    this.splineY = this.splineX.map((x) => deviation * random());
  }

  /**
   * Render the confetto on the canvas.
   */
  draw() {
    let width = this.dimensions.width_ * this.scale.x_;
    let height = this.dimensions.height_ * this.scale.y_;
    // The rotation effect is achieved by scaling.
    this.scale.y_ = cos(this.position.y_ * 0.01);
    this.scale.x_ = sin(this.position.x_ * 0.01);

    ctx.translate(this.position.x_, this.position.y_);
    ctx.fillStyle = this.color_;
    ctx.transform(1, this.skew.x_, this.skew.y_, 1, 0, 0);
    ctx.fillRect(-width / 2, -height / 2, width, height);

    // Reset canvas
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }

  /**
   * Update the position of a confetto.
   * @param {*} timeStamp : The time elapsed since the beginning of the animation.
   * @param {*} deltaT : The time interval since last update.
   */
  update(timeStamp, deltaT) {
    // A random variable from 0 - 1 represents the direction of an external acceleration.
    let phi = (timeStamp % motionFrequency) / motionFrequency,
      i = 0,
      j = 1;

    while (phi >= this.splineX[j]) {
      i = j++;
    }
    // The amount of the external acceleration.
    var rho = this.cosInterpolation(
      this.splineY[i],
      this.splineY[j],
      (phi - this.splineX[i]) / (this.splineX[j] - this.splineX[i])
    );

    // The additional movement caused by the external acceleration on X axis and Y axis.
    let mvmntX = 0.5 * (rho * cos(phi * 2 * PI)) * deltaT * deltaT * this.drag,
      mvmntY =
        0.5 * (gravity + rho * sin(phi * 2 * PI)) * deltaT * deltaT * this.drag;
    // Update position and velocity.
    this.position.x_ += this.velocity.x_ * deltaT + mvmntX;
    this.velocity.x_ += mvmntX * deltaT * this.drag;

    this.position.y_ += this.velocity.y_ * deltaT + mvmntY;
    this.velocity.y_ += mvmntY * deltaT;
  }

  /**
   * Cosine Interpolation
   * @param {*} p1: The first end point.
   * @param {*} p2: The second end point.
   * @param {*} mu: The mastery to points from 0 to 1 where 0 means exactly p1, and 1 means exactly p2
   * @returns A point on the cosine wave that connects p1 and p2.
   */
  cosInterpolation(p1, p2, mu) {
    return ((1 - cos(PI * mu)) / 2) * (p2 - p1) + p1;
  }

  /**
   * Create a Poisson sampling over 0 - 1.
   * @returns An array of points over 0 - 1 with radius 0.1
   */
  createPoisson() {
    // domain is the set of points which are still available to pick from
    // D = union{ [d_i, d_i+1] | i is even }
    // domain = [0.1, 0.9], measure = 0.8
    var domain = [radius, 1 - radius],
      measure = 1 - radius2,
      spline = [0, 1];
    while (measure) {
      var dart = measure * random(),
        i,
        l,
        interval,
        a,
        b,
        c,
        d;
      // Find where dart lies
      for (i = 0, l = domain.length, measure = 0; i < l; i += 2) {
        a = domain[i];
        b = domain[i + 1];
        interval = b - a;

        if (dart < measure + interval) {
          spline.push((dart += a - measure));
          break;
        }
        measure += interval;
      }

      c = dart - radius;
      d = dart + radius;

      // Update the domain
      for (i = domain.length - 1; i > 0; i -= 2) {
        l = i - 1;
        a = domain[l];
        b = domain[i];
        // c---d          c---d  Do nothing
        //   c-----d  c-----d    Move interior
        //   c--------------d    Delete interval
        //         c--d          Split interval
        //       a------b
        if (a >= c && a < d)
          if (b > d) domain[l] = d; // Move interior (Left case)
          else domain.splice(l, 2);
        // Delete interval
        else if (a < c && b > c)
          if (b <= d) domain[i] = c; // Move interior (Right case)
          else domain.splice(i, 0, c, d); // Split interval
      }

      // Re-measure the domain
      for (i = 0, l = domain.length, measure = 0; i < l; i += 2)
        measure += domain[i + 1] - domain[i];
    }
    return spline.sort();
  }
}

function Confetti({ canvasWidth, canvasHeight, confettiCount }) {
  const confetti = [];
  // Used to calculate deltaT, the time interval between updates.
  let prevStamp = undefined;
  // The reference to the canvas.
  const canvasRef = useRef(null);

  const initConfetti = () => {
    for (let i = 0; i < confettiCount; i++) {
      let confetto = new Confetto(
        randomRange(widthMin, widthMax), // width
        randomRange(heightMin, heightMax), // height
        // TODO: uncomment
        // confettiColors[Math.floor(randomRange(0, confettiColors.length))], // color

        "#EF2964",
        randomRange(0, canvas.width),
        // canvas.width / 2, // position x
        -10, // position y
        randomRange(vhMin, vhMax), // ivx
        randomRange(vvMin, vvMax) // ivy
      );

      confetti.push(confetto);
    }
  };

  const infiniteConfetti = () => {
    let confetto = new Confetto(
      randomRange(widthMin, widthMax), // width
      randomRange(heightMin, heightMax), // height
      confettiColors[Math.floor(randomRange(0, confettiColors.length))], // color
      randomRange(0, canvas.width), // position x
      0, // position y
      randomRange(vhMin, vhMax), // ivx
      randomRange(vvMin, vvMax) // ivy
    );
    confetti.push(confetto);
    setTimeout(infiniteConfetti, 75 * random());
  };
  /**
   * Render all confetti
   * @param {*} timeStamp : The time elapsed since the beginning of the animation.
   */
  const renderConfetti = (timeStamp) => {
    // time interval
    let deltaT = prevStamp ? (timeStamp - prevStamp) / timeRatio : 0;
    prevStamp = timeStamp;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    confetti.forEach((confetto, index) => {
      // Remove the confetto if out of bound
      if (confetto.position.y_ >= canvas.height) {
        confetti.splice(index, 1);
      } else {
        confetto.draw();
        confetto.update(timeStamp, deltaT);
      }
    });
    requestAnimationFrame(renderConfetti);
  };

  // On mounted.
  useEffect(() => {
    canvas = canvasRef.current;
    ctx = canvas.getContext("2d");
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    infiniteConfetti();
    requestAnimationFrame(renderConfetti);
  }, []); // empty brace to tell react never re-run this block of code.

  return <canvas ref={canvasRef} className="absolute"></canvas>;
}

export default Confetti;
