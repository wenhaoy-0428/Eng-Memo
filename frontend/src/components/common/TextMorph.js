/**
 * This component is based on a codepen sharing and refactored to support in React
 * Credit for https://codepen.io/Valgo/pen/PowZaNY
 */

import { forwardRef, useEffect, useRef } from "react";
import randomWord from "random-words";

// time to transit from text1 to text2 in seconds
const MORPH_TRANSITION_DURATION = 1.5;
// time remain text1/text2 in seconds
const STATIC_DURATION = 1;

const MorphContent = forwardRef(({ children }, ref) => {
  return (
    <span
      ref={ref}
      // text-transparent and bg-clip-text to create gradient text effect
      className="absolute w-full block text-6xl text-center select-none font-extrabold top-1/2 left-1/2 
      -translate-x-1/2 -translate-y-1/2 text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500"
    >
      {children}
    </span>
  );
});

function TextMorph() {
  /*
	This pen cleverly utilizes SVG filters to create a "Morphing Text" effect. Essentially, it layers 2 text elements on top of each other, 
  and blurs them depending on which text element should be more visible. Once the blurring is applied, 
  both texts are fed through a threshold filter together, which produces the "gooey" effect. 
  */
  const text1Ref = useRef(null);
  const text2Ref = useRef(null);
  // a ref to the animation frame
  const animationRef = useRef(null);

  // the interval between a text starts to be statically shown and the next text starts.
  const loopTime = MORPH_TRANSITION_DURATION + STATIC_DURATION;
  // current timestamp in loopTime
  let progress = 0;

  // The strings to morph between. You can change these to anything you want!
  let texts = ["Hello", "World"];

  /**
   *  update morph transition states.
   * @param {*} fraction: percentage to complete of the transition.
   *                      0 means the beginning of the morph transition
   *                      1 means the end of the transition
   */
  function updateMorph(fraction) {
    text2Ref.current.style.filter = `blur(${Math.min(
      8 / fraction - 8,
      100
    )}px)`;
    text2Ref.current.style.opacity = `${Math.pow(fraction, 0.4) * 100}%`;

    fraction = 1 - fraction;
    text1Ref.current.style.filter = `blur(${Math.min(
      8 / fraction - 8,
      100
    )}px)`;
    text1Ref.current.style.opacity = `${Math.pow(fraction, 0.4) * 100}%`;

    text1Ref.current.textContent = texts[0];
    text2Ref.current.textContent = texts[1];
  }
  /**
   * Statically shows the current text by resetting styling to original.
   */
  function showStaticText() {
    text2Ref.current.style.filter = "";
    text2Ref.current.style.opacity = "100%";

    text1Ref.current.style.filter = "";
    text1Ref.current.style.opacity = "0%";
  }

  // Animation loop, which is called every frame.
  function animate(timeStamp) {
    /**  If requestAnimationFrame is called at the end of animate function, the animation loop will not work properly.
     * The animation loop works by calling requestAnimationFrame recursively, which schedules the next animation frame to be rendered.
     * If requestAnimationFrame is called at the end of animate function,
     * the next animation frame will not be scheduled until after the entire animate function has finished executing.
     * This means that there will be a delay between each frame of the animation, and the animation will not look smooth.
     * By calling requestAnimationFrame at the beginning of animate,
     * the animation loop schedules the next frame immediately after the previous frame has finished rendering, resulting in a smoother animation.
     * */

    animationRef.current = requestAnimationFrame(animate);

    // check if process switches from static to morph
    let shouldIncrementIndex = progress < STATIC_DURATION;

    // The time interval of showing static is abstracted as [0-STATIC_DURATION] (from 0 to STATIC_DURATION)
    // The time interval of morph transition is [STATIC_DURATION-loopTime]
    progress = (timeStamp / 1000) % loopTime;
    if (progress < STATIC_DURATION) {
      showStaticText();
    } else {
      // now its in morph time.
      if (shouldIncrementIndex) {
        texts.shift();
        texts.push(randomWord());
      }
      updateMorph((progress - STATIC_DURATION) / MORPH_TRANSITION_DURATION);
    }
  }

  // Start the animation on mounted.
  useEffect(() => {
    animationRef.current = animate();
    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <>
      {/* <!-- The two texts --> */}
      {/* <!-- The SVG filter used to create the merging effect --> */}
      <svg id="filters" className="hidden">
        <defs>
          <filter id="threshold">
            {/* <!-- Basically just a threshold effect - pixels with a high enough opacity are set to full opacity, and all other pixels are set to completely transparent. --> */}
            <feColorMatrix
              type="matrix"
              values="1 0 0 0 0
                      0 1 0 0 0
                      0 0 1 0 0
                      0 0 0 255 -140"
            />
          </filter>
        </defs>
      </svg>
      <div
        className="relative w-full h-full bottom-0"
        style={{ filter: "url(#threshold) blur(0.1px)" }}
      >
        <MorphContent ref={text1Ref} />
        <MorphContent ref={text2Ref} />
      </div>
    </>
  );
}

export default TextMorph;
