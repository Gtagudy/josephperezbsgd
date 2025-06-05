import { Color } from 'three';

// Base card configuration
export const baseCardConfig = {
  scale: [1.2, 1.8, 1],
  material: {
    metalness: 0.5,
    roughness: 0.2,
    clearcoat: 1,
    clearcoatRoughness: 0.2
  },
  animation: {
    floatAmplitude: 0.1,
    rotationAmplitude: 0.1,
    hoverScale: 1.1
  },
  hoverInfo: {
    width: '250px',
    fontSize: '14px',
    padding: '15px',
    borderRadius: '8px',
    backgroundColor: 'rgba(0, 0, 0, 0.85)'
  },
  media: {
    thumbnailSize: [1, 1],
    hoverSize: [1.8, 1.8],
    transition: 'all 0.3s ease-in-out'
  }
};

// Individual project configurations
export const projects = {
  deckSwipe: {
    id: 'deckSwipe',
    title: "DeckSwipe",
    description: "A simple Yes or No mobile game based on Frostpunk where you have to manage a handful of resources to keep your city and its people alive. This is unfortunately set to release on Itch.IO this month so that can't be played. Unfortunately the Gif on the Github was far too large to upload to the website.",
    technologies: ["Unity 3D", "C#", "Visual Studio", "Itch.io", "Unity Mobile"],
    colors: {
      base: new Color("#4a4a4a"),
      hover: new Color("#6a6a6a"),
      glow: new Color("#8a8a8a")
    },
    media: {
      thumbnail: '/resources/looking-guy-you-are-wrong-meme.png',
      hover: '/resources/staring-meme.gif',
      isAnimated: true
    },
    phases: [
      {
        title: "Looking for a game to improve",
        description: "With a small team we decided to find an open source game to see if we can improve it and learn some stuff. That resulted in us finding DeckSwipe!",
        //media: '/resources/phase1.png'
      },
      {
        title: "Not too shabby!",
        description: "It was a pretty cool and simple game for us to play around with. We got some cool new features in it and I think since its a Mobile and Desktop game it would be a nice addition to the portfolio.",
        //media: '/resources/phase2.png'
      }
    ],
    concepts: [
      {
        title: "Resource Management",
        description: "We got to work on the resource management system. Including adding an additional resource and UI element."
      },
      {
        title: "Card Manipulation",
        description: "We took the card creation system and discovered how to both make our own cards and manipulate the stats that your decisions could make."
      },
      {
        title: "Weather System",
        description: "We added a weather system to the game, creating periods of time where your resources were consumed even further."
      }
    ],
    links: [
      {
        title: "GitHub Repository",
        url: "https://github.com/Gtagudy/deckswipe.git"
      }
    ]
  },
  portfolio3D: {
    id: 'portfolio3D',
    title: "Portfolio 3D",
    description: "I made a 3D portfolio website using React Three Fiber and Three.js. It's a work in progress, but I'm pretty happy with how it's turning out. Currently the room can be navigated by clicking the appropriate Interactable Objects depending on your section.",
    technologies: ["React", "Three.js", "React Spring", "WebGL", "React Three Fiber"],
    colors: {
      base: new Color("#2c3e50"),
      hover: new Color("#34495e"),
      glow: new Color("#7f8c8d")
    },
    media: {
      thumbnail: '/resources/PiccoloJPG.jpg',
      hover: '/resources/PiccoloRun.gif',
      isAnimated: true
    },
    phases: [
      {
        title: "React Three Fiber Research",
        description: "I started by researching React Three Fiber to see how I could use them to make a 3D portfolio website. After some research I learned that you could make some really cool stuff with this, and it is not too different from a Unity Scene!",
        //media: '/resources/phase1.png'
      },
      {
        title: "Ongoing Development",
        description: "Currently the website is a WIP, but I've been able to demonstrate some really cool stuff and learn a fair amount of React and Three.js.",
        //media: '/resources/phase2.png'
      }
    ]
  },
  gameEngine: {
    id: 'gameEngine',
    title: "Anthemum",
    description: "Anthemum is my main Portfolio Project. It is a turn-based Isometric Action game made in Unity. It was my Capstone Project that I continued and will continue working on.",
    technologies: ["Unity 3D", "C#", "Visual Studio", "Github", "Trello", "JetBrains Rider"],
    colors: {
      base: new Color("#16a085"),
      hover: new Color("#1abc9c"),
      glow: new Color("#2ecc71")
    },
    media: {
      thumbnail: '/resources/download.jfif',
      hover: '/resources/cringeComp.gif',
      isAnimated: true
    },
    phases: [
      {
        title: "Post Capstone",
        description: "When I finished Capstone all you could do was initiate combat on a button press and do some basic Turn-Based Combat with some buffing elements to it. This includes single and multi player-enemy combat.",
        //media: '/resources/phase1.png'
      },
      {
        title: "Current Development",
        description: "Now I have an improved Combat UI System, you can traverse a combat grid, you can target on the combat grid, push enemies along the combat grid and you have QTE. With inspiration from Expedition 33 I was able to get these systems in there and working well. Unfortunately due to heavy time restraints I missed out on some of my goals, including adding some animations I created for the character.",
        //media: '/resources/phase2.png'
      },
      {
        title: "The future of Anthemum",
        description: "I of course plan to continue working on this game, its a shame I couldn't give this the attention it deserved. I am currently working on the Tutorial for this game in another scene so I don't break this scene.",
        //media: '/resources/phase3.png'
      }
    ],
    concepts: [
      {
        title: "Improved Combat UI",
        description: "Research and foundation for the UI and future UI systems."
      },
      {
        title: "Improved Combat Systems",
        description: "New Moveable Combat Grid, QTE, and Push Enemies."
      },
      {
        title: "Improved Animations",
        description: "New Animations and design for the Main Character of this Prologue."
      }
    ],
    links: [
      {
        title: "GitHub Repository",
        url: "https://github.com/Gtagudy/Anthemum.git"
      }
    ]
  },
  aiAssistant: {
    id: 'aiAssistant',
    title: "Peculiar Dimension",
    description: "Peculiar Dimension is an isometric dungeon-crawler esk game made in Unity. I had to pivot from Roguelike to an Action Survival game with a focus on creating animations via Smack Studio.",
    technologies: ["Unity 3D", "C#", "Visual Studio", "Github", "Trello"],
    colors: {
      base: new Color("#8e44ad"),
      hover: new Color("#9b59b6"),
      glow: new Color("#a569bd")
    },
    media: {
      thumbnail: '/resources/Peculiar Dimension.png',
      hover: '/resources/Sqare.png',
      isAnimated: true
    },
    concepts: [
      {
        title: "Pivoting from Roguelike to Action Survival",
        description: "I had to pivot from Roguelike to an Action Survival game with a focus on creating animations via Smack Studio."
      },
      {
        title: "Survive an enemy onslaught",
        description: "I had to create a system that would allow the player to survive an enemy onslaught."
      },
      {
        title: "Defeat enemies and collect Coins",
        description: "I had to create a system that would allow the player to defeat enemies and collect Coins, and if you got attacked you dropped your coins."
      }
    ],
    links: [
      {
        title: "GitHub Repository",
        url: "https://github.com/Gtagudy/Peculiar-Dimension.git"
      }
    ]
  },
  cloudPlatform: {
    id: 'cloudPlatform',
    title: "Spider Fighter Run",
    description: "Scalable cloud infrastructure management system",
    technologies: ["AWS", "Docker", "Kubernetes", "Terraform"],
    colors: {
      base: new Color("#c0392b"),
      hover: new Color("#e74c3c"),
      glow: new Color("#e57373")
    },
    media: {
      thumbnail: '/resources/looking-guy-you-are-wrong-meme.png',
      hover: '/resources/staring-meme.gif',
      isAnimated: true
    },
    phases: [
      {
        title: "Initial Design",
        description: "Created wireframes and user flow diagrams for the flashcard system",
        media: '/resources/phase1.png'
      },
      {
        title: "Core Development",
        description: "Implemented the spaced repetition algorithm and basic UI components",
        media: '/resources/phase2.png'
      },
      {
        title: "Enhanced Features",
        description: "Added progress tracking and statistics visualization",
        media: '/resources/phase3.png'
      }
    ],
    concepts: [
      {
        title: "Spaced Repetition",
        description: "Implemented a modified version of the SuperMemo-2 algorithm for optimal learning intervals"
      },
      {
        title: "Responsive Design",
        description: "Created a mobile-first interface that works seamlessly across all devices"
      },
      {
        title: "Data Visualization",
        description: "Developed interactive charts to help users track their learning progress"
      }
    ],
    links: [
      {
        title: "GitHub Repository",
        url: "https://github.com/yourusername/deckswipe"
      },
      {
        title: "Live Demo",
        url: "https://deckswipe-demo.com"
      }
    ]
  },
  mobileApp: {
    id: 'mobileApp',
    title: "Hopscotch",
    description: "A simple Unity 3D platformer based on Momentum and collecting Coins! Feel free to play it on Itch.IO on the bottom right button! \n Your main goal is to 'HopScotch' and gain enough momentum to jump the gaps and collect the coins!",
    technologies: ["Unity 3D", "C#", "Visual Studio", "Itch.io"],
    colors: {
      base: new Color("#f39c12"),
      hover: new Color("#f1c40f"),
      glow: new Color("#f9e79f")
    },
    media: {
      thumbnail: '/resources/HopScotch.png',
      hover: '/resources/PiccoloRun.gif',
      isAnimated: true
    },
    phases: [
      {
        title: "Step by Step In-Class Beginnings",
        description: "This was an early project that I did at Neumont. So part of it was following a very simple tutorial. ",
        media: '/resources/phase1.png'
      },
      {
        title: "Idea Development",
        description: "Then we go to break off and do our own thing. My plan was to make a simple game due to our time constraints, and the simplest yet most interesting part of my project was the Physics system! So I decided to give that a spin.",
        media: '/resources/phase2.png'
      },
      {
        title: "Developing Features",
        description: "I then added a few more features to the game, such as the ability to jump, the ability to collect coins, and the ability to die and have lives. I even got the coins to explode when collected, and once you get enough coins throughout your lives you get to exit! If you can both find it and survive.",
        media: '/resources/phase3.png'
      }
    ],
    links: [
      {
        title: "GitHub Repository",
        url: "https://github.com/yourusername/deckswipe"
      },
      {
        title: "Live Demo",
        url: "https://anthemum.itch.io/hopscotch"
      }
    ]
  }
}; 