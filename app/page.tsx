"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { Gift, XCircle } from "lucide-react"
import { CouponPopup } from "@/components/couponCard"
import { DEFAULT_BRAND_CONFIG } from "@/components/brand-config"
import ReactConfetti from "react-confetti"
import Lottie from "lottie-react"
import openBOX from "@/components/openBOX.json"

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
  const [showBubble, setShowBubble] = useState(false)// Add a state to control when the bubble is shown
  const errorAudioRef = useRef<HTMLAudioElement | null>(null) // Ref for error sound
  const winningAudioRef = useRef<HTMLAudioElement | null>(null) // Ref for winning sound

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
  const selectBox = (idx: number) => {
    if (selectedBox !== null) return // Prevent selecting more than once
    setSelectedBox(idx) // Set selected box with the index of the clicked box
    setRevealedPrize(boxPrizes[idx]) // Reveal the prize and save it
    setShowBubble(false) // Reset bubble
    if (boxPrizes[idx].type === "prize") { //check if the selected box shows a real prize
      setShowConfetti(true) // Show confetti if it's a prize
      if (winningAudioRef.current) { //if prize
        winningAudioRef.current.currentTime = 0 //reset audio to 0 and then 
        winningAudioRef.current.play() //play sound
      }
      setTimeout(() => { //delays showing the bubble
        setShowBubble(true) // Show the bubble after a short delay
      }, 400) // 400ms delay for bubble
      setTimeout(() => {
        setShowCoupon(true) // Show coupon popup after delay
      }, 3500) // 3.5 second delay for animation
    } else {
      if (errorAudioRef.current) { //if box has a lose then 
        errorAudioRef.current.pause(); 
        errorAudioRef.current.currentTime = 0;
        errorAudioRef.current.load();
        setTimeout(() => {
          errorAudioRef.current && errorAudioRef.current.play();
        }, 50); //this sets a tiny delay may be a problem that needs to be fixed
      }
      setTimeout(() => {
        setShowBubble(true) // Show the bubble
        // Do not show coupon yet
      }, 1000)
      setTimeout(() => {
        setShowCoupon(true) // Show coupon popup after bubble appears
      }, 2500) // 2.5s after click (1s X + 1.5s bubble)
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
    setShowBubble(false) // Hide bubble
  }, [numBoxes])

  // Render the game UI
  return (
    // Main background and layout
    <div className={`min-h-screen ${config.backgroundColor} flex flex-col items-center justify-center p-6`}>
      {/* Show confetti animation if needed */}
      {showConfetti && (
        <ReactConfetti 
          width={window.innerWidth} // Full width
          height={window.innerHeight} // Full height
          recycle={false} // Don't loop
          numberOfPieces={400} // Amount of confetti
          onConfettiComplete={() => setShowConfetti(false)} // Hide after done
        />
      )} 
      <audio ref={errorAudioRef} src="/error-2-36058.mp3" preload="auto" /> 
      <audio ref={winningAudioRef} src="/winning-218995.mp3" preload="auto" />
      {/* Logo and header */}
      <div className="text-center mb-10">
        <Image 
          src={config.logo} // Brand logo
          alt="Brand logo" 
          width={120} //size of logo
          height={60} //size of logo
          className="mx-auto mb-4" 
        />
        <h1 className={`text-4xl font-bold bg-gradient-to-r ${config.primaryColor} bg-clip-text text-transparent`}>
          {config.text.gameTitle} {/* Game title from config */}
        </h1>
        <p className="text-gray-600 mt-2">{config.text.subtitle}</p> {/* Subtitle from config */}
      </div>

      {/* Game area background and card */}
      <div className={`shadow-xl rounded-3xl p-8 w-full max-w-4xl text-center ${config.gameAreaBg}`}>
        {/* Waiting state: show start button and instructions */}
        {gameState === "waiting" && (
          <>
            <Gift className="w-16 h-16 mx-auto text-purple-400 mb-4" /> {/* Gift icon */}
            <h2 className="text-2xl font-semibold text-indigo-700 mb-4">{config.text.readyTitle}</h2> {/* Ready title */}
            <p className="text-gray-600 mb-6">{config.text.readyDescription.replace("{numBoxes}", numBoxes.toString())}</p> {/* Ready description */}
            <button
              onClick={startGame} // Start the game
              className={`bg-gradient-to-r ${config.primaryColor} hover:opacity-90 text-white font-semibold px-8 py-3 rounded-full transition`}
            >
              {config.text.startButton} {/* Start button text */}
            </button>
          </>
        )}

        {/* Playing state: show boxes */}
        {gameState === "playing" && (
          <>
            <h2 className={`text-xl font-semibold mb-6 ${config.textColor}`}>{config.text.pickTitle}</h2> {/* Pick a box title */}
            <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-${numBoxes} gap-4`}>
              {/* Render each box */}
              {boxPrizes.map((prize, i) => {
                // Determine if this box is selected
                const isSelected = selectedBox === i
                // Determine if this is a win or try again
                const isWin = prize.type === "prize"
                // Bubble color based on prize type
                const bubbleColor = isWin ? "bg-green-500" : "bg-red-500"
                // Bubble text color
                const bubbleText = isWin ? "text-white" : "text-white"
                return (
                  <div
                    key={i} // Unique key
                    className={`relative cursor-pointer w-full aspect-square rounded-xl flex flex-col items-center justify-end text-3xl font-bold transition transform
                    bg-gradient-to-br ${config.secondaryColor} hover:scale-105
                    ${isSelected ? "ring-4 ring-purple-400" : ""}
                    ${selectedBox === null ? "rocking-box" : ""}
                  `}
                    onClick={() => selectBox(i)} // Handle box click
                  >
                    {/* Prize/try-again bubble above the box when selected */}
                    {isSelected && showBubble && ( //only starts if isSelected and showBubble are true 
                      <div className={`bubble-pop px-1 py-1 rounded-full font-bold shadow-lg ${bubbleColor} ${bubbleText}`} //design of bubble
                        style={{
                          minWidth: isMobile ? 20 : 100, //if mobile is true buuble is smaller
                          maxWidth: isMobile ? 80 : 200,
                          fontSize: isMobile ? 10 : 20,
                          position: 'absolute', //positioning of bubble
                          top: isMobile ? '6px' : '10px', //appears above the box 
                          ...(isMobile
                            ? { left: 0, right: 0, margin: '0 auto', transform: 'translateY(0)' }
                            : { left: '50%', transform: 'translateX(-50%) translateY(0)' } //perfect centering 
                          ),
                          zIndex: 2 //makes sure it layers above other elements like the box if it overlaps
                        }} //inside the box u have the icon and the title from the brand-config page
                      >
                        <span className="text-2xl">{prize.icon}</span> {prize.title} 
                      </div>
                    )}
                    {/* Lottie animation for box (paused if not selected, plays if selected) */}
                    <div style={{ position: 'relative', zIndex: 1 }}> 
                      <Lottie // Lottie renders a lottie animation, zIndex: 1 places it above background but behind the bubble
                        key={selectedBox === i ? `selected-${i}` : `closed-${i}`} // Only depend on selectedBox key helps identify which animation needs to be refreshed
                        animationData={openBOX} //points to the imported JSON file
                        loop={false}  //animation only plays ONCE
                        autoplay={isSelected} // Only play if selected
                        style={isSelected //if box is selected
                          ? { width: isMobile ? 90 : 165, height: isMobile ? 90 : 165, margin: "0 auto", transform: "scale(1.2)" } // make it bigger and transform makes it pop more
                          : { width: isMobile ? 80 : 155, height: isMobile ? 80 : 155, margin: "0 auto" } //if unselected make it smaller also first option is mobile if not then desktop is bigger and margin 0 centers it
                        } 
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
      </div>

      {/* Footer text */}
      <p className="mt-8 text-gray-400 text-sm">{config.text.poweredBy}</p>
    </div>
  )
}
