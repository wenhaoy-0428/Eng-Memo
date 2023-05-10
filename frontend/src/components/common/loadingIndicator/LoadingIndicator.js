import { motion } from "framer-motion";

// number of particles
const NUM_PARTICLES = 50;
const PARTICLE_SIZE = "8px";
const SPIRAL_RADIUS = "80px";
// number of seconds taken to finish an animation lap
const LAP_DURATION = 3;
// accumulative delay for each particles to start animation
const STAGGER = LAP_DURATION / NUM_PARTICLES;

/**
 * This component builds a cloud spiral as a loading indicator.
 * This react component is adapted to react based on https://codepen.io/hakimel/pen/kawJWE.
 */
export default function LoadingIndicator() {
  // a placeholder array that is used to generate particles.
  let particles = new Array(NUM_PARTICLES).fill();
  // variant that defines the animation of the loading screen.
  const particle_container = {
    appear: {
      opacity: 0,
    },
    visible: {
      opacity: [0, 1],
      transition: {
        duration: 1,
        // defines the accumulative animation delay of children
        staggerChildren: STAGGER,
        ease: "easeInOut",
      },
    },
    hidden: {
      opacity: 0,
      transition: {
        duration: 2,
      },
    },
  };
  return (
    <motion.div
      variants={particle_container}
      initial="appear"
      animate="visible"
      exit="hidden"
      className="absolute z-[999] flex justify-center items-center w-full h-full bg-[#3e6fa3] overflow-hidden"
      style={{ perspective: "500px" }}
    >
      {particles.map((_, i) => {
        {
          /* 720 so we can have 2 layers of particles */
        }
        let angle = (i / particles.length) * 720;
        return <LoadingParticle angle={angle} key={i} />;
      })}
    </motion.div>
  );
}

function LoadingParticle({ angle }) {
  // variant that defines animation of particles.
  const animate_particle = {
    visible: {
      opacity: [0, 1, 0],
      x: 0,
      z: [0, 530],
      transition: {
        repeat: Infinity,
        duration: LAP_DURATION,
        ease: "linear",
      },
    },
    hidden: {
      opacity: 0,
      transition: {
        duration: 1,
      },
    },
  };

  /**
   * transformTemplate that changes the order of execution
   * @param {rotate, x}:  transform properties defined manually.
   * @param {generatedTransform}: automatically generated properties.
   * @returns: string that defines the transform.
   */
  function rotate_translate({ rotate, x }, generatedTransform) {
    // rotate has to proceed translate so that x axis is also rotated.
    return `rotate(${rotate}) translateX(${x})` + generatedTransform;
  }

  return (
    <motion.div
      className="circle absolute bg-white bg-opacity-75 shadow-[0_0_10px_rgba(255,255,255,1)]"
      transformTemplate={rotate_translate}
      style={{
        borderRadius: PARTICLE_SIZE,
        width: PARTICLE_SIZE,
        height: PARTICLE_SIZE,
        rotate: angle,
        x: SPIRAL_RADIUS,
      }}
      variants={animate_particle}
    />
  );
}
