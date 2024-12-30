"use client";

import { useEffect, useRef, useState } from "react";

const StarfieldBackground = () => {
  const canvasRef = useRef(null);
  const starsRef = useRef([]);
  // const wordsRef = useRef([]);
  const animationFrameRef = useRef(null);
  const [isLargeScreen, setIsLargeScreen] = useState(false);

  // // Define a list of words to display
  // const words = [
  //   "m&ms with obstacles",
  //   "we're costco guys",
  //   "want to watch me get stuck in a door",
  //   "a creature feature featuring the creature",
  //   "i exclaimed with excitement",
  //   "walk off like a g",
  //   "catch out",
  //   "look like steve harvey",
  //   "needs some more cream",
  //   "crack my finger backwards",
  //   "dr bronners",
  //   "good job blockin the bike lane",
  //   "wheres the no hammock sign",
  //   "mouse in baked beans",
  //   "like a eclair",
  //   "you just read my mind",
  //   "talking ben",
  //   "worst creation of all time",
  //   "scary soda",
  //   "screaaaam for ice cream",
  //   "cetaphil on me",
  //   "I can't believe I came back from the dead for this",
  //   "barnetts mega sour lemon",
  //   "something is taking place right here",
  //   "found out the hard way",
  //   "dvdvdvdvdvdvdvdvd",
  //   "busting a move",
  //   "funky burger",
  //   "time machine",
  //   "juice of perpetual sadness",
  //   "not a big fan of the government",
  //   "smokey scary skibidis",
  //   "mr jackson was a great guy",
  // ];

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    // let wordInitTimeout;

    // Set canvas size to window size
    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    // Initialize stars
    const initStars = () => {
      const stars = [];
      // i is how many stars are created
      for (let i = 0; i < 400; i++) {
        stars.push({
          x: Math.random() * canvas.width - canvas.width / 2,
          y: Math.random() * canvas.height - canvas.height / 2,
          z: Math.random() * 1500,
          size: 1,
        });
      }
      starsRef.current = stars;
    };

    // Debounce resize to prevent multiple rapid calls
    let resizeTimeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        // Only update canvas dimensions
        setCanvasSize();
      }, 250); // 250ms debounce
    };

    // // Initialize words
    // const initWords = () => {
    //   const wordObjects = [];
    //   const minDistance = 200; // Minimum distance between words

    //   // i is number of words
    //   while (wordObjects.length < 6) {
    //     const newWord = {
    //       text: words[Math.floor(Math.random() * words.length)],
    //       x: Math.random() * canvas.width - canvas.width / 2,
    //       y: Math.random() * canvas.height - canvas.height / 2,
    //       z: 1500,
    //       opacity: 1,
    //     };

    //     // Check if the new word is far enough from existing words
    //     const isFarEnough = wordObjects.every((existingWord) => {
    //       const dx = newWord.x - existingWord.x;
    //       const dy = newWord.y - existingWord.y;
    //       const distance = Math.sqrt(dx * dx + dy * dy);
    //       return distance >= minDistance;
    //     });

    //     // Add the word if it's far enough from others
    //     if (isFarEnough) {
    //       wordObjects.push(newWord);
    //     }
    //   }

    //   wordsRef.current = wordObjects;
    // };

    // Animation function
    const animate = () => {
      // Color and opacity of background.
      ctx.fillStyle = "rgba(8, 4, 2, 0.8)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Center of the screen
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // Draw and update stars
      ctx.fillStyle = "white";
      starsRef.current.forEach((star) => {
        // Move star closer (decrease z), reduced from 10 to 3 for slower movement
        star.z = star.z - 1;

        if (star.z <= 0) {
          star.z = 1500;
          star.x = Math.random() * canvas.width - centerX;
          star.y = Math.random() * canvas.height - centerY;
        }

        // Project 3D coordinates to 2D
        const scale = 300 / star.z;
        const x2d = centerX + star.x * scale;
        const y2d = centerY + star.y * scale;

        // Calculate size based on distance
        const size = Math.max(Math.min(((400 - star.z) / 400) * 3, 3), 0.1);

        // Only draw if star is within canvas bounds and has positive size
        if (
          x2d >= 0 &&
          x2d <= canvas.width &&
          y2d >= 0 &&
          y2d <= canvas.height &&
          size > 0
        ) {
          ctx.beginPath();
          ctx.arc(x2d, y2d, size, 0, Math.PI * 2);
          ctx.fill();

          // Add a subtle glow effect
          if (star.z < 400) {
            ctx.globalAlpha = (400 - star.z) / 400;
            const gradient = ctx.createRadialGradient(
              x2d,
              y2d,
              0,
              x2d,
              y2d,
              size * 2
            );
            gradient.addColorStop(0, "rgba(255, 255, 255, 0.3)");
            gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
            ctx.fillStyle = gradient;
            ctx.arc(x2d, y2d, size * 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "white";
            ctx.globalAlpha = 1;
          }
        }
      });

      // // Draw and update words
      // ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
      // ctx.font = "bold 16px Arial";
      // wordsRef.current.forEach((word) => {
      //   // Move word closer (decrease z)
      //   word.z = word.z - 1;

      //   if (word.z <= 0) {
      //     word.z = 1500;
      //     word.x = Math.random() * canvas.width - centerX;
      //     word.y = Math.random() * canvas.height - centerY;
      //   }

      //   // Project 3D coordinates to 2D
      //   const scale = 300 / word.z;
      //   const x2d = centerX + word.x * scale;
      //   const y2d = centerY + word.y * scale;

      //   // Calculate opacity based on distance
      //   const opacityStart = 1500; // Start
      //   const opacityEnd = 300; // End closer to the viewer
      //   const opacityPower = 3; // Exponential falloff for more dramatic effect

      //   const opacity =
      //     word.z > opacityStart
      //       ? 0
      //       : Math.max(
      //           Math.min(
      //             Math.pow(
      //               (opacityStart - word.z) / (opacityStart - opacityEnd),
      //               opacityPower
      //             ),
      //             0.7
      //           ),
      //           0.0
      //         );

      //   // Measure text width to improve boundary check
      //   const textWidth = ctx.measureText(word.text).width;

      //   // Draw word if it has any visibility within or just outside canvas
      //   if (
      //     x2d + textWidth >= -textWidth &&
      //     x2d <= canvas.width + textWidth &&
      //     y2d >= -20 &&
      //     y2d <= canvas.height + 20
      //   ) {
      //     ctx.globalAlpha = opacity;
      //     ctx.fillText(word.text, x2d, y2d);
      //     ctx.globalAlpha = 1;
      //   }
      // });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    // Initialize
    setCanvasSize();
    initStars();

    // // Add a delay before initializing words
    // wordInitTimeout = setTimeout(() => {
    //   initWords();
    // }, 100);

    animate();

    // Handle resize
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      // clearTimeout(wordInitTimeout);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full -z-10"
      style={{ background: "rgb(2, 0, 36)" }}
    />
  );
};

export default StarfieldBackground;
