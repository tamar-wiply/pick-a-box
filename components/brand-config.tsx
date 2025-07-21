// Brand Configuration Component
// This makes it easy for clients to customize the game

export interface BrandConfig {
  name: string //brand name 
  primaryColor: string //theme color
  secondaryColor: string //theme color
  accentColor: string //theme color
  backgroundColor: string //theme color
  textColor: string //theme color
  logo: string //path to image logo
  boxImage: string //path or Url to JSON animation 
  prizes: Prize[] //list of prize objects
  probabilityWeights: ProbabilityWeights //determins how likely are different prize values
  gameAreaBg: string; //class string for the style of background
  text: { //holds all text contect shown in the games UI
  gameTitle: string; 
  //subtitle: string;
  readyTitle: string;
  readyDescription: string;
  startButton: string;
  pickTitle: string;
  poweredBy: string;
  };
  boxCount: { //defines how many boxes should be on mobile or desktop
    desktop: number;
    mobile: number;
  };
}

export interface Prize {
  id: number //unique identifier
  type: "prize" | "try-again" //either an actual prize or a try again message
  title: string //what the user sees
 // description: string
  value: "HIGH" | "MEDIUM" | "LOW" //value for wieghted probability 
  icon: string //emoji or image presenting the prize 
  image:string
}

export interface ProbabilityWeights { //controls the relative chance of a rpize being selected
  HIGH: number
  MEDIUM: number
  LOW: number
}

// Default Wiply-style configuration CAN BE CHANGED AND UPDATED TO ALLOCATE FOR OTHER CLIENTS
export const DEFAULT_BRAND_CONFIG: BrandConfig = { //brandset up for the defult of wiply brand
  name: "Wiply Demo",
  primaryColor: "from-purple-500 to-indigo-600", // button for Start game
  secondaryColor: "from-purple-200 to-blue-200", // box front gradient
  accentColor: "from-purple-600 to-violet-600", // not directly used, keep for future
  backgroundColor: "bg-gradient-to-br from-green-100 to-indigo-300", // main background
  textColor: "text-purple-700", // main header text
  logo: "/WiplyLogo.png", //brand logo
  boxImage: "/mysteryBOX.webp", //box image
  gameAreaBg: "bg-indigo-300 bg-opacity-80", // game area background like where the boxes are
  text: { //change any text here to customize for a specifc client
    gameTitle: "Pick-a-Box Game", //title
    //subtitle: "Choose your box!",  
    readyTitle: "Ready to Play?",
    readyDescription: "Click start to reveal {numBoxes} mystery boxes. Pick one to see your prize!",
    startButton: "Start Game",
    pickTitle: "Pick a Box!",
    poweredBy: "Powered by Wiply Demo • Demo for client campaigns",
  }, 
  boxCount: { //boxcount setting
    desktop: 6,
    mobile: 4,
  },
  prizes: [
    {
      id: 1, //pirze #1
      type: "prize", //prize
      title: "20% Off Coupon Code", //title for prize or loss
      value: "LOW", //weight
      icon: "🎟️", //can change logo based on brand
      image: "/prizes/shoppingCart.png",
    },
    {
      id: 2,
      type: "prize",
      title: "Buy one Get two Free pairs of earrings",
      value: "MEDIUM",
      icon: "🚚",
      image: "/prizes/jewl.png",
    },
    {
      id: 3,
      type: "prize",
      title: "Buy one get one 50% off any pair of Jeans",
      value: "HIGH",
      icon: "🎁",
      image: "/prizes/jeanss.png",
    },
    {
      id: 4,
      type: "prize",
      title: "25% off any frangrance",
      value: "HIGH",
      icon: "⭐",
      image: "/prizes/perfumeee.png",
    },
    {
      id: 5,
      type: "try-again",
      title: "Try Again Tomorrow!",
      value: "MEDIUM",
      icon: "🔄",
      image: "/prizes/TRY.png",
    },
    {
      id: 6,
      type: "try-again",
      title: "Sorry unlucky pick! Try Again!",
      value: "LOW",
      icon: "😈",
      image: "/prizes/RedX.png",
    },
  ],
  probabilityWeights: { HIGH: 1, MEDIUM: 3, LOW: 6 },//used to bias of the random selection 
} 

// Example brand configurations for different clients
export const BRAND_CONFIGS: Record<string, BrandConfig> = {  //stores many brandConfigs in a look up object by brand key
  wiply: DEFAULT_BRAND_CONFIG, //currently only contains wiply but you can add as many as you want 

}