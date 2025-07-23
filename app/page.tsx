"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { CouponPopup } from "@/components/couponCard"
import { DEFAULT_BRAND_CONFIG } from "@/components/brand-config"
import ReactConfetti from "react-confetti"
import Lottie from "lottie-react"
import openBOX from "@/components/openBOX.json"
import questionAnim from "@/components/question.json"

function useIsMobile() { //react hook that helps know when the screen is mobile size
  const [isMobile, setIsMobile] = useState(false) //a boolean that tracks if the function is mobile or not setIsMobile is what updates and its set to false right now
  useEffect(() => { //runs when the component in the hook is being used
    const checkMobile = () => setIsMobile(window.innerWidth < 768) //if the screen is mobile size it setsIsMobile true
    checkMobile() //get current size screen
    window.addEventListener("resize", checkMobile) //if screen is resized it checks checkMobile again
    return () => window.removeEventListener("resize", checkMobile) //removes resize linear
  }, [])  //ensures the useEffect is run once atleast
  return isMobile //true or false 
}

export default function PickABoxGame() { 
  const config = DEFAULT_BRAND_CONFIG//get the brand configuration
  const isMobile = useIsMobile()  //checks if device is mobile
  const numBoxes = isMobile ? config.boxCount.mobile : config.boxCount.desktop // Determine the number of boxes based on device
  const [gameState, setGameState] = useState<"waiting" | "playing" | "finished">("waiting")// Game state: waiting (start screen), playing, or finished (coupon)
  const [selectedBox, setSelectedBox] = useState<number | null>(null) // Index of the selected box
  const [revealedPrize, setRevealedPrize] = useState<typeof config.prizes[0] | null>(null) // The prize revealed after selecting a box
  const [boxPrizes, setBoxPrizes] = useState<typeof config.prizes[0][]>([]) // The prizes assigned to each box for this round
  const [showCoupon, setShowCoupon] = useState(false) // Whether to show the coupon popup
  const [showConfetti, setShowConfetti] = useState(false) // Whether to show confetti animation
  const [showPrizeFlyout, setShowPrizeFlyout] = useState(false);
  const [flyoutStyle, setFlyoutStyle] = useState<any>(null);
  const boxRefs = useRef<(HTMLDivElement | null)[]>([]);
  const errorAudioRef = useRef<HTMLAudioElement | null>(null) // Ref for error sound
  const winningAudioRef = useRef<HTMLAudioElement | null>(null) // Ref for winning sound
  const gameAreaRef = useRef<HTMLDivElement | null>(null);

  // Generate a random prize for a box, using the brand-config weights of high medium low
  const getRandomPrize = () => { //return random prize
    const pool = config.prizes.flatMap((prize) => { //this creats a pool of all the prizes and based by their weight how many times they are repeated in the pool. Flatmap makes a flattened array of the pool.
      let weight = 1 // prizes have atleats one change by default
      if (prize.value && config.probabilityWeights) { // looks up the prizes weights and adds it to the pool
        weight = config.probabilityWeights[prize.value]
      }
      return Array(weight).fill(prize) //creates an array of length weight then this array gets flattened by the pool
    })
    // Pick a random prize from the pool
    return pool[Math.floor(Math.random() * pool.length)] //gives u a float between 0 and 1 then multiplies this value by pool.length round down and it gives u a random index
  }

  // Start the game gets triggered when the play button is pressed: assign prizes and reset state
  const startGame = () => {  
    setBoxPrizes(Array(numBoxes).fill(null).map(getRandomPrize)) // creates a new array with numbox slots so if 6 boxes then 6 slots then runs .map on randomPrize and generates a new array of prizes per box 
    setSelectedBox(null) // No box selected
    setRevealedPrize(null) // No prize revealed
    setGameState("playing") // Set state to playing
  }

  // Handle box selection
  const selectBox = (idx: number) => { //takes in an idx (the index of the box) handles the prize and animation 
    if (selectedBox !== null) return; // Prevent selecting more than once
    setSelectedBox(idx); // Set selected box with the index of the clicked box
    setRevealedPrize(boxPrizes[idx]); // saves the image that was in the box, and saves it so the UI knows what image to show
    // Get box position for flyout animation
    const boxRect = boxRefs.current[idx]?.getBoundingClientRect(); //gets exact screen position and size of the clicked box
    const areaRect = gameAreaRef.current?.getBoundingClientRect(); //gets the exact size of the game area which is used for calculating the center
    // Calculate the center of the game area (or viewport fallback) adding window.scroll ensures it works when the user scrolls the page
    const centerX = areaRect ? areaRect.left + areaRect.width / 2 + window.scrollX : window.innerWidth / 2 + window.scrollX; //centerX means horizontal center
    const centerY = areaRect ? areaRect.top + areaRect.height / 2 + window.scrollY : window.innerHeight / 2 + window.scrollY; //centerY mean Vertical center
    if (boxRect) { //only continue if the box position was found 
      // setTimeout ensures we wait for the box opening animation (Lottie) to finish (e.g., 600ms)
      // This ensures the image emerges only after the box is visually open
      setTimeout(() => {
       
        // Step 2: Show image at scale 0 (hidden) and translateY(30%) (pushed downward) (inside box, hidden)
        
        // The image starts hidden and slightly lower, as if inside the box
        setFlyoutStyle({
          position: 'fixed',
          left: boxRect.left + boxRect.width / 2 + window.scrollX, // Center horizontally above the box
          top: boxRect.top + 10 + window.scrollY, // Position just above the box
          width: isMobile ? 85 : 200,
          height: isMobile ? 85 : 200,
          zIndex: 50,
          pointerEvents: 'none',
          transform: 'translate(-50%, 30%) scale(0)', // Hidden and lower (inside box)
          transition: 'none', // No animation yet
        });
        setShowPrizeFlyout(true); // Shows the prize image in DOM

        // Step 3: Animate image to scale 1 and translateY(0) (emerge from box, 0.25s)
        
        // The image scales up and rises out of the box for a smooth "emerging" effect
        setTimeout(() => {
          setFlyoutStyle((style: any) => ({
            ...style,
            transform: 'translate(-50%, 0) scale(1)', // Move up and scale to normal size
            transition: 'transform 0.25s cubic-bezier(0.22, 1, 0.36, 1)', // Smooth pop/emerge animation style
          }));
        }, 10); // Short delay to trigger transition

        // Step 4: Pause for 0.25s at full size, then fly to center

        // After the image is fully out, pause briefly before flying out
        setTimeout(() => {
          setFlyoutStyle({
            position: 'fixed',
            left: centerX, // Center of game area (or viewport)
            top: centerY,
            width: isMobile ? 120 : 220,
            height: isMobile ? 120 : 220,
            zIndex: 50,
            pointerEvents: 'none',
            transform: 'translate(-50%, -50%) scale(1.8)', // Scale up as it flies out to 1.8x 
            transition: 'all 1.2s cubic-bezier(0.22, 1, 0.36, 1)', // Smooth flyout for 1.2 seconds 
          });
        }, 501); // 0.5s pop + 0.01s buffer
        
        // Step 5: Hide the flyout and show the coupon after the animation completes after 1.76 seconds 

        // After the flyout animation, hide the image and show the coupon popup
        setTimeout(() => {
          setShowPrizeFlyout(false);
          setShowCoupon(true);
        }, 2000); 
      }, 600); // Wait for box opening animation
      // Play confetti and sounds as before
      if (boxPrizes[idx].type === "prize") { //if prize play confetti and win sound
        setShowConfetti(true);
        if (winningAudioRef.current) {
          winningAudioRef.current.currentTime = 0;
          winningAudioRef.current.play();
        }
      } else { //else play lose sound
        if (errorAudioRef.current) {
          errorAudioRef.current.pause();
          errorAudioRef.current.currentTime = 0;
          errorAudioRef.current.load();
          setTimeout(() => {
            errorAudioRef.current && errorAudioRef.current.play();
          }, 50);
        }
      }
    }
  }

  // Reset game state when box count changes (responsive)
  useEffect(() => {
    setBoxPrizes([]) // Clear prizes
    setSelectedBox(null) // Clear selection
    setRevealedPrize(null) // Clear revealed prize
    setGameState("waiting") // Reset to waiting
    setShowCoupon(false) // Hide coupon
    setShowConfetti(false) // Hide confetti
  }, [numBoxes])

  // Render the game UI
  return (
    // Main background and layout
    <div className={`min-h-screen ${config.backgroundColor} flex flex-col items-center justify-center p-6`}>
      {/* Show confetti animation if needed */}
      {showConfetti && (
        <ReactConfetti 
          width={window.innerWidth} // Full width of screen
          height={window.innerHeight} // Full height
          recycle={false} // Don't loop
          numberOfPieces={400} // Amount of confetti
          onConfettiComplete={() => setShowConfetti(false)} // Hide after done
        />
      )} 
      <audio ref={errorAudioRef} src="/error-2-36058.mp3" preload="auto" /> 
      <audio ref={winningAudioRef} src="/winner.mp3" preload="auto" />
      {/* Logo and header */}
      {gameState === "waiting" && (
        <div className="flex flex-col items-center justify-center min-h-screen">
          <div className="text-center mb-4 relative z-10">
            <Image src={config.logo} alt="Brand logo" width={200} height={200} className="mx-auto mb-4" />
            <h1 className="text-2xl font-bold bg-gradient-to-r bg-clip-text text-transparent">
              {config.text.gameTitle}
            </h1>
          </div>
          {/* Game area background and card */}
          <div className={`w-full max-w-4xl text-center`}>
            {/* Replace Gift icon with Lottie box animation */}
            <div className="mx-auto mb-8" style={{ width: 120, height: 120 }}>
              <Lottie animationData={openBOX} loop={true} autoplay={true} />
            </div>
            <h2 className="text-4xl font-bold text-indigo-700 mb-6">{config.text.gameTitle}</h2> {/* Ready title */}
            <p className="text-gray-600 font-semibold mb-20">{config.text.readyDescription.replace("{numBoxes}", numBoxes.toString())}</p> {/* Ready description */}
            <button
              onClick={startGame} // Start the game button, made to bounce color purple into indigo, with a hover over with cursor it goeds lighter to indicate to click it. 
              className={`bounce-text bg-gradient-to-r ${config.primaryColor} hover:opacity-70 text-white font-semibold px-8 py-3 rounded-full transition`}
            >
              {config.text.startButton} {/* Start button text */}
            </button>
          </div>
        </div>
      )}

      {/* Playing state: show boxes */}
      {gameState === "playing" && (
        <>
          {/* Question marks for mobile screen only */}
          {/* Indigo-900 */}
          {isMobile ? (
            <>
              <div style={{ position: 'fixed', top: '10%', left: '5%', fontSize: '2.5rem', color: '#312e81', opacity: 0.25, transform: 'rotate(-10deg)', zIndex: 0 }}>?</div>
              <div style={{ position: 'fixed', top: '50%', right: '10%', fontSize: '2.2rem', color: '#3730a3', opacity: 0.22, transform: 'rotate(-20deg)', zIndex: 0 }}>?</div>
              <div style={{ position: 'fixed', top: '40%', left: '60%', fontSize: '2.8rem', color: '#312e81', opacity: 0.18, transform: 'rotate(12deg)', zIndex: 0 }}>?</div>
              <div style={{ position: 'fixed', top: '80%', right: '7%', fontSize: '2.8rem', color: '#312e81', opacity: 0.33, transform: 'rotate(-10deg)', zIndex: 0 }}>?</div>
              <div style={{ position: 'fixed', top: '38%', left: '13%', fontSize: '3.6rem', color: '#312e81', opacity: 0.25, transform: 'rotate(-8deg)', zIndex: 0 }}>?</div>
              <div style={{ position: 'fixed', top: '30%', right: '1%', fontSize: '2.3rem', color: '#3730a3', opacity: 0.31, transform: 'rotate(10deg)', zIndex: 0 }}>?</div>
              <div style={{ position: 'fixed', top: '8%', left: '60%', fontSize: '3.8rem', color: '#312e81', opacity: 0.27, transform: 'rotate(15deg)', zIndex: 0 }}>?</div>
              <div style={{ position: 'fixed', top: '83%', left: '20%', fontSize: '3.5rem', color: '#3730a3', opacity: 0.35, transform: 'rotate(25deg)', zIndex: 0 }}>?</div>
              <div style={{ position: 'fixed', top: '90%', right: '35%', fontSize: '2.5rem', color: '#3730a3', opacity: 0.25, transform: 'rotate(-10deg)', zIndex: 0 }}>?</div>
              <div style={{ position: 'fixed', top: '53%', left: '30%', fontSize: '2.2rem', color: '#312e81', opacity: 0.30, transform: 'rotate(3deg)', zIndex: 0 }}>?</div>
              <div style={{ position: 'fixed', top: '60%', left: '5%', fontSize: '1.5rem', color: '#312e81', opacity: 0.25, transform: 'rotate(-20deg)', zIndex: 0 }}>?</div>
              <div style={{ position: 'fixed', top: '8%', right: '5%', fontSize: '2.1rem', color: '#312e81', opacity: 0.25, transform: 'rotate(-8deg)', zIndex: 0 }}>?</div>
              <div style={{ position: 'fixed', top: '6%', left: '22%', fontSize: '2.0rem', color: '#312e81', opacity: 0.30, transform: 'rotate(18deg)', zIndex: 0 }}>?</div>
              <div style={{ position: 'fixed', top: '93%', left: '7%', fontSize: '2.0rem', color: '#312e81', opacity: 0.30, transform: 'rotate(-18deg)', zIndex: 0 }}>?</div>
            </>
          ) : (
            <>
            {/* question marks for desktop screen only*/ }
              <div style={{ position: 'fixed', top: '8%', left: '3%', fontSize: '4.5rem', color: '#312e81', opacity: 0.22, transform: 'rotate(-20deg)', zIndex: 0 }}>?</div>
              <div style={{ position: 'fixed', top: '55%', left: '7%', fontSize: '3.2rem', color: '#312e81', opacity: 0.30, transform: 'rotate(10deg)', zIndex: 0 }}>?</div>
              <div style={{ position: 'fixed', top: '25%', right: '40%', fontSize: '5.5rem', color: '#312e81', opacity: 0.25, transform: 'rotate(15deg)', zIndex: 0 }}>?</div>
              <div style={{ position: 'fixed', top: '75%', right: '7%', fontSize: '2.8rem', color: '#312e81', opacity: 0.33, transform: 'rotate(-10deg)', zIndex: 0 }}>?</div>
              <div style={{ position: 'fixed', top: '38%', left: '13%', fontSize: '3.8rem', color: '#312e81', opacity: 0.25, transform: 'rotate(-8deg)', zIndex: 0 }}>?</div>
              <div style={{ position: 'fixed', top: '85%', left: '15%', fontSize: '5rem', color: '#312e81', opacity: 0.20, transform: 'rotate(12deg)', zIndex: 0 }}>?</div>
              <div style={{ position: 'fixed', top: '10%', right: '13%', fontSize: '4.2rem', color: '#312e81', opacity: 0.31, transform: 'rotate(7deg)', zIndex: 0 }}>?</div>
              <div style={{ position: 'fixed', top: '90%', right: '15%', fontSize: '5rem', color: '#312e81', opacity: 0.20, transform: 'rotate(-14deg)', zIndex: 0 }}>?</div>
              <div style={{ position: 'fixed', top: '80%', right: '75%', fontSize: '4.1rem', color: '#312e81', opacity: 0.20, transform: 'rotate(-10deg)', zIndex: 0 }}>?</div>
              {/* Indigo-800 */}
              <div style={{ position: 'fixed', top: '15%', left: '20%', fontSize: '2.8rem', color: '#3730a3', opacity: 0.34, transform: 'rotate(-12deg)', zIndex: 0 }}>?</div>
              <div style={{ position: 'fixed', top: '60%', left: '25%', fontSize: '3.5rem', color: '#3730a3', opacity: 0.22, transform: 'rotate(8deg)', zIndex: 0 }}>?</div>
              <div style={{ position: 'fixed', top: '30%', right: '10%', fontSize: '4.1rem', color: '#3730a3', opacity: 0.20, transform: 'rotate(11deg)', zIndex: 0 }}>?</div>
              <div style={{ position: 'fixed', top: '30%', right: '30%', fontSize: '2.3rem', color: '#3730a3', opacity: 0.31, transform: 'rotate(10deg)', zIndex: 0 }}>?</div>
              <div style={{ position: 'fixed', top: '60%', left: '60%', fontSize: '5rem', color: '#312e81', opacity: 0.27, transform: 'rotate(0deg)', zIndex: 0 }}>?</div>
              <div style={{ position: 'fixed', top: '10%', right: '55%', fontSize: '3.5rem', color: '#3730a3', opacity: 0.30, transform: 'rotate(5deg)', zIndex: 0 }}>?</div>
              <div style={{ position: 'fixed', top: '90%', left: '45%', fontSize: '2.8rem', color: '#3730a3', opacity: 0.25, transform: 'rotate(-5deg)', zIndex: 0 }}>?</div>
              <div style={{ position: 'fixed', top: '70%', left: '40%', fontSize: '2.5rem', color: '#3730a3', opacity: 0.35, transform: 'rotate(-9deg)', zIndex: 0 }}>?</div>
              <div style={{ position: 'fixed', top: '40%', right: '55%', fontSize: '2.5rem', color: '#3730a3', opacity: 0.25, transform: 'rotate(-5deg)', zIndex: 0 }}>?</div>
              <div style={{ position: 'fixed', top: '20%', right: '30%', fontSize: '3.5rem', color: '#3730a3', opacity: 0.25, transform: 'rotate(-8deg)', zIndex: 0 }}>?</div>
            </>
          )}
          <h2 className={`bounce-text text-2xl font-semibold mb-4 ${config.textColor}`}>{config.text.pickTitle}</h2> {/* Pick a box title */}
          <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-${numBoxes} gap-4`}>
            {/* Render each box */}
            {boxPrizes.map((prize, i) => {
              // Determine if this box is selected
              const isSelected = selectedBox === i
              // Determine if this is a win or try again
              const isWin = prize.type === "prize"
              return (
                <div
                  key={i} // Unique key
                  ref={el => { boxRefs.current[i] = el; }}
                  className={`relative box-glow cursor-pointer w-full aspect-square rounded-xl flex flex-col items-center justify-end text-3xl font-bold transition transform
                  hover:scale-105 
                  ${isSelected ? "ring-4 ring-purple-400" : ""}
                  ${selectedBox === null ? "rocking-box" : ""} 
                `} //makes the box glow when the cursor points onto it with the color purple. 
                  onClick={() => selectBox(i)} // Handle box click
                >
                  {/* Lottie animation for box (paused if not selected, plays if selected) */}
                  <div style={{ position: 'relative', zIndex: 1 }}> 
                      <Lottie 
                        key={selectedBox === i ? `selected-${i}` : `closed-${i}`} // Only depend on selectedBox, i=specifc box index, selectedbox is prob which tells which box is selected, so animation only plays when selectedBox===i means 
                        animationData={openBOX}  //type of Lottie animation that was imported, can be switched if a different animation is imported
                        loop={false} //only plays once and not repeated 
                        autoplay={isSelected} // Only play if selected
                        style={isSelected //if selected it gets a scale boost of 1.2 which makes the image slightly bigger
                           ? { width: isMobile ? 250 : 430, height: isMobile ? 250 : 420, margin: "0 auto", transform: "scale(1.2)" } //Box sizes
                           : { width: isMobile ? 250 : 430, height: isMobile ? 250 : 420, margin: "0 auto" } //Box sizes 
                              }
                                />
                                 <Image
                                   src={config.logo} //overlays the logo above the box
                                   alt="Box Logo"
                                   width={isMobile ? 32 : 64} //logo size 
                                   height={isMobile ? 32 : 64} //logo size 
                                   style={{ 
                                   position: 'absolute', //placed relative to to parent container 
                                   top: '50%', //centered
                                   left: isMobile ? '60%' : '65%',
                                   transform: isMobile ? 'translate(-50%, -50%)' : 'translate(-60%, -50%)',
                                   opacity: 0.5, //fades logo
                                   pointerEvents: 'none', // none clickable
                                   filter: 'grayscale(1) contrast(1.2)' //makes it readable but not overpowering 
                                     }}
                                       className="select-none"
                                       draggable={false} 
                                     />
                                   </div>
                                 </div>
                               )
                             })}
                           </div>
                         </>
                       )}

                       {/* Coupon popup for prize/try again */}
                       <CouponPopup
                         isOpen={showCoupon} // Show/hide popup
                         onClose={() => {
                           setShowCoupon(false) // Hide popup
                           if (revealedPrize && revealedPrize.type === "try-again") {
                             setGameState("waiting") // Reset for try again
                             setSelectedBox(null)
                             setRevealedPrize(null)
                             setBoxPrizes([])
                             setShowConfetti(false)
                           } else {
                             setGameState("finished") // End game for win
                           }
                         }}
                         prize={revealedPrize} // Prize to show
                       />

                       {/* Flyout prize image animation (from box to center, scaling up)
                           - Rendered at the root of the game area, as the last child
                           - Only render when showPrizeFlyout is true (animation is active)
                           - Uses the selected prize image (revealedPrize?.image)
                           - flyoutStyle controls the position and scaling for the animation
                           - This image first appears above the box, pauses, then animates to the center
                           - Only one flyout image is rendered at a time (for the selected box)
                       */}
                       {showPrizeFlyout && revealedPrize?.image && flyoutStyle && ( //only show flyout image when we in animation, there is an image toreveal and we have a position
                         <div style={flyoutStyle}>
                           <Image
                             src={revealedPrize.image} //prize image URL
                             alt={revealedPrize.title} //incase image does not show it shows title
                             width={flyoutStyle.width} //same as defined in flyoutStyle
                             height={flyoutStyle.height}//^^
                             style={{ objectFit: 'contain', filter: 'drop-shadow(0 0 32px #fbbf24)' }} //objectFit contained means the image fits in the box without streching and adds a glow around the image
                             className="select-none" //prevents users from actually clicking on the image
                             draggable={false} //nonedraggable 
                           />
                         </div>
                       )}
                     </div>
  )
}
