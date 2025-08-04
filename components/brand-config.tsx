// Brand Configuration Component
// This makes it easy for clients to customize the game

export interface BrandConfig {
  name: string //brand name 
  primaryColor: string //theme color
  accentColor: string //theme color
  backgroundColor: string //theme color
  textColor: string //theme color
  logo: string //path to image logo
  logoSize: { //logo size configuration
    mobile: number;
    desktop: number;
  }
  boxImage: string //path or Url to JSON animation 
  prizes: Prize[] //list of prize objects
  probabilityWeights: ProbabilityWeights //determins how likely are different prize values
  startScreenImage?: string; // Path to a friendly image or animation for the start screen
  //gameAreaBg: string; //class string for the style of background
  text: { //holds all text contect shown in the games UI
  gameTitle: string; 
  //readyTitle: string;
  readyDescription: string;
  startButton: string;
  pickTitle: string;
  welcomeMessage?: string; // Friendly subtitle for the start screen
  titleColor?: string; // Dynamic title color
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
  primaryColor: "from-violet-700 to-violet-700", // button for Start game (not used)
  accentColor: "from-purple-600 to-violet-600", // not directly used, keep for future
  backgroundColor: "bg-gradient-to-br from-sky-50 to-sky-50", // main background
  textColor: "text-violet-700", // main header text
  logo: "/wiply.png", //brand logo 
  logoSize: { //logo size configuration
    mobile: 32, //size of logo on mobile for boxes
    desktop: 64, //size of logo on desktop for boxes 
  },
  boxImage: "/placeholder.png", //box image if user wants to use an image instead of animation but in this case not used. 
  startScreenImage: "/mysteryBOX.webp", // Use a fun, game-like image (replace with your asset)
  //gameAreaBg: "bg-indigo-300 bg-opacity-80", // game area background like where the boxes are
  text: { //change any text here to customize for a specifc client
    gameTitle: "Pick-a-Box Game", //title of the game (not used in this case)
    readyDescription: "Ready to uncover a surprise? Click start and see what’s inside!", //not used in this case 
    startButton: "Start Game", //also not used
    pickTitle: "Choose a box!", //only title that is used in this case (in playing state)
    welcomeMessage: "Ready to play? Pick a box and see what you win!", // Friendly subtitle not used in this case
    titleColor: "text-violet-700", // Dynamic title color
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
      image: "/prizes/shoppingCart.png",
    },
    {
      id: 2,
      type: "prize",
      title: "Buy one Get two Free pairs of earrings",
      value: "MEDIUM",
      image: "/prizes/jewl.png",
    },
    {
      id: 3,
      type: "prize",
      title: "Buy one get one 50% off any pair of Jeans",
      value: "MEDIUM",
      image: "/prizes/jeanss.png",
    },
    {
      id: 4,
      type: "prize",
      title: "25% off any frangrance",
      value: "HIGH",
      image: "/prizes/perfumeee.png",
    },
    {
      id: 5,
      type: "try-again",
      title: "Try Again Tomorrow!",
      value: "MEDIUM",
      image: "/prizes/TRY.png",
    },
    {
      id: 6,
      type: "try-again",
      title: "Sorry unlucky pick! Try Again!",
      value: "LOW",
      image: "/prizes/RedX.png",
    },
  ],
  probabilityWeights: { HIGH: 1, MEDIUM: 3, LOW: 6 },//used to bias of the random selection 
} 

// Example brand configurations for different clients
export const BRAND_CONFIGS: Record<string, BrandConfig> = {  //stores many brandConfigs in a look up object by brand key
  wiply: DEFAULT_BRAND_CONFIG, //currently only contains wiply but you can add as many as you want 

}