// Sample educational content for the interactive ebook
// Covers Science, History, and Math topics

export const sampleChapters = [
  {
    id: "science-1",
    title: "The Wonders of Photosynthesis",
    subject: "science",
    description: "Discover how plants turn sunlight into food",
    topics: [
      {
        id: "photosynthesis-intro",
        title: "How Photosynthesis Works",
        subtitle: "Nature's Solar-Powered Food Factory",
        illustration: "https://customer-assets.emergentagent.com/job_storyscape-29/artifacts/hffdaa1p_Infogrph%20photosynthesis.jpg",
        content: "Photosynthesis is the remarkable process by which plants convert sunlight, water, and carbon dioxide into glucose (sugar) and oxygen. This process is essential for life on Earth, providing food for plants and oxygen for all living creatures.",
        hotspots: [
          {
            id: "sunlight",
            x: 8,
            y: 15,
            label: "Sunlight",
            icon: "sun",
            color: "warning",
            title: "Light Energy",
            description: "The sun provides light energy that powers the entire photosynthesis process. Plants capture this energy through special molecules called chlorophyll in their leaves.",
            funFact: "Plants use only about 1-2% of the sunlight that reaches their leaves!"
          },
          {
            id: "leaf",
            x: 45,
            y: 28,
            label: "Leaf",
            icon: "leaf",
            color: "secondary",
            title: "Chlorophyll Factory",
            description: "Leaves contain chlorophyll, a green pigment that captures light energy. The chlorophyll is stored in tiny structures called chloroplasts.",
            funFact: "A single leaf can contain up to 500,000 chloroplasts per square millimeter!"
          },
          {
            id: "co2",
            x: 12,
            y: 55,
            label: "CO₂",
            icon: "wind",
            color: "muted",
            title: "Carbon Dioxide Intake",
            description: "Plants absorb carbon dioxide (CO₂) from the air through tiny pores called stomata on their leaves. This gas is essential for making glucose.",
            funFact: "A large tree can absorb up to 48 pounds of CO₂ per year!"
          },
          {
            id: "water",
            x: 15,
            y: 80,
            label: "H₂O",
            icon: "droplets",
            color: "primary",
            title: "Water Absorption",
            description: "Roots absorb water from the soil and transport it up through the stem to the leaves. Water provides the hydrogen atoms needed to make glucose.",
            funFact: "A sunflower can drink up to a quart of water per day!"
          },
          {
            id: "glucose",
            x: 78,
            y: 70,
            label: "Sugar",
            icon: "sparkles",
            color: "accent",
            title: "Glucose Creation",
            description: "The end product of photosynthesis is glucose, a type of sugar that provides energy for the plant to grow, produce flowers, and make seeds.",
            funFact: "A single leaf can produce about 5 grams of glucose per day!"
          },
          {
            id: "oxygen",
            x: 85,
            y: 20,
            label: "O₂",
            icon: "cloud",
            color: "secondary",
            title: "Oxygen Release",
            description: "As a byproduct of photosynthesis, plants release oxygen into the air. This is the oxygen that humans and animals breathe!",
            funFact: "A single tree can produce enough oxygen for 2-4 people daily!"
          }
        ]
      }
    ]
  },
  {
    id: "history-1",
    title: "Ancient Egyptian Civilization",
    subject: "history",
    description: "Journey through the land of pharaohs and pyramids",
    topics: [
      {
        id: "egypt-pyramids",
        title: "The Great Pyramids",
        subtitle: "Monuments That Touch the Sky",
        illustration: "/api/placeholder/pyramid",
        illustrationBg: "from-amber-100 via-orange-50 to-yellow-100",
        content: "The Great Pyramids of Giza are among the most impressive structures ever built by humans. These ancient tombs were constructed over 4,500 years ago to house the bodies of Egyptian pharaohs.",
        hotspots: [
          {
            id: "pyramid-top",
            x: 50,
            y: 10,
            label: "Capstone",
            icon: "triangle",
            color: "warning",
            title: "The Pyramidion",
            description: "The capstone at the top of the pyramid was often covered in gold or electrum (gold-silver alloy) to catch the first rays of the rising sun.",
            funFact: "The original capstone of the Great Pyramid is missing and was likely made of solid gold!"
          },
          {
            id: "pharaoh-chamber",
            x: 50,
            y: 40,
            label: "Chamber",
            icon: "crown",
            color: "accent",
            title: "King's Chamber",
            description: "Deep inside the pyramid lies the King's Chamber, where the pharaoh's mummified body was placed in a stone sarcophagus.",
            funFact: "The King's Chamber is made of red granite blocks transported from Aswan, over 500 miles away!"
          },
          {
            id: "stone-blocks",
            x: 25,
            y: 65,
            label: "Blocks",
            icon: "box",
            color: "muted",
            title: "Limestone Blocks",
            description: "The pyramid is built from over 2.3 million stone blocks, each weighing an average of 2.5 tons. Some blocks weigh up to 80 tons!",
            funFact: "It's estimated that 20,000 workers took 20 years to build the Great Pyramid!"
          },
          {
            id: "sphinx",
            x: 80,
            y: 75,
            label: "Sphinx",
            icon: "cat",
            color: "history",
            title: "The Great Sphinx",
            description: "The Great Sphinx guards the pyramids with the body of a lion and the head of a pharaoh. It's the largest single-stone statue in the world.",
            funFact: "The Sphinx's nose is missing, possibly knocked off by Napoleon's soldiers, though this is debated!"
          },
          {
            id: "desert",
            x: 15,
            y: 85,
            label: "Desert",
            icon: "sun",
            color: "primary",
            title: "The Sahara Desert",
            description: "The pyramids were built on the edge of the Sahara Desert, west of the Nile River. The desert helped preserve these ancient structures.",
            funFact: "When the pyramids were built, the Sahara was actually greener with more vegetation!"
          }
        ]
      }
    ]
  },
  {
    id: "math-1",
    title: "The Magic of Geometry",
    subject: "math",
    description: "Explore shapes and their secrets",
    topics: [
      {
        id: "geometry-shapes",
        title: "Understanding Shapes",
        subtitle: "Building Blocks of Our World",
        illustration: "/api/placeholder/geometry",
        illustrationBg: "from-blue-50 via-indigo-50 to-purple-50",
        content: "Geometry is the branch of mathematics that studies shapes, sizes, and the properties of space. From the circles in wheels to the triangles in bridges, geometry is everywhere around us!",
        hotspots: [
          {
            id: "circle",
            x: 20,
            y: 30,
            label: "Circle",
            icon: "circle",
            color: "primary",
            title: "The Perfect Circle",
            description: "A circle is a shape where every point on its edge is the same distance from the center. This distance is called the radius.",
            funFact: "Pi (π) is the ratio of a circle's circumference to its diameter, approximately 3.14159!"
          },
          {
            id: "triangle",
            x: 50,
            y: 25,
            label: "Triangle",
            icon: "triangle",
            color: "secondary",
            title: "The Stable Triangle",
            description: "A triangle has three sides and three angles that always add up to 180 degrees. Triangles are the strongest shape in construction.",
            funFact: "The ancient Egyptians used the 3-4-5 triangle to create perfect right angles!"
          },
          {
            id: "square",
            x: 80,
            y: 30,
            label: "Square",
            icon: "square",
            color: "accent",
            title: "The Equal Square",
            description: "A square has four equal sides and four right angles (90 degrees each). It's a special type of rectangle.",
            funFact: "A square's diagonal is √2 (about 1.414) times longer than its side!"
          },
          {
            id: "hexagon",
            x: 35,
            y: 70,
            label: "Hexagon",
            icon: "hexagon",
            color: "math",
            title: "Nature's Favorite",
            description: "A hexagon has six sides. Bees use hexagons in their honeycomb because it's the most efficient shape for storing honey.",
            funFact: "Hexagons tessellate perfectly, meaning they fit together with no gaps!"
          },
          {
            id: "pentagon",
            x: 65,
            y: 70,
            label: "Pentagon",
            icon: "pentagon",
            color: "warning",
            title: "The Five-Sided Shape",
            description: "A pentagon has five sides. Regular pentagons have internal angles of 108 degrees each.",
            funFact: "The Pentagon building in Washington D.C. is one of the world's largest office buildings!"
          }
        ]
      }
    ]
  },
  {
    id: "science-2",
    title: "The Solar System",
    subject: "science",
    description: "Explore our cosmic neighborhood",
    topics: [
      {
        id: "solar-system-tour",
        title: "Our Solar System",
        subtitle: "A Journey Through Space",
        illustration: "/api/placeholder/solar-system",
        illustrationBg: "from-slate-900 via-indigo-900 to-slate-900",
        darkMode: true,
        content: "Our solar system consists of the Sun, eight planets, dwarf planets, moons, asteroids, and comets. It formed about 4.6 billion years ago from a giant cloud of gas and dust.",
        hotspots: [
          {
            id: "sun",
            x: 10,
            y: 50,
            label: "Sun",
            icon: "sun",
            color: "warning",
            title: "Our Star",
            description: "The Sun is a giant ball of hot gas at the center of our solar system. It provides light and heat to all the planets.",
            funFact: "The Sun contains 99.86% of all the mass in our solar system!"
          },
          {
            id: "earth",
            x: 45,
            y: 45,
            label: "Earth",
            icon: "globe",
            color: "secondary",
            title: "Our Home Planet",
            description: "Earth is the third planet from the Sun and the only known planet with liquid water on its surface and life.",
            funFact: "Earth is the only planet not named after a Greek or Roman god!"
          },
          {
            id: "mars",
            x: 58,
            y: 55,
            label: "Mars",
            icon: "planet",
            color: "destructive",
            title: "The Red Planet",
            description: "Mars is called the Red Planet due to iron oxide (rust) on its surface. It has the largest volcano in the solar system.",
            funFact: "A day on Mars is only 37 minutes longer than a day on Earth!"
          },
          {
            id: "jupiter",
            x: 75,
            y: 40,
            label: "Jupiter",
            icon: "circle-dot",
            color: "accent",
            title: "The Giant Planet",
            description: "Jupiter is the largest planet in our solar system. Its Great Red Spot is a storm that has been raging for over 400 years.",
            funFact: "Jupiter has 95 known moons, including the four large Galilean moons!"
          },
          {
            id: "saturn",
            x: 88,
            y: 50,
            label: "Saturn",
            icon: "orbit",
            color: "primary",
            title: "The Ringed Planet",
            description: "Saturn is famous for its beautiful rings made of ice, rock, and dust particles. It's the second-largest planet.",
            funFact: "Saturn is so light it would float in water if you had a big enough bathtub!"
          }
        ]
      }
    ]
  }
];

export const getChapterById = (id) => {
  return sampleChapters.find(chapter => chapter.id === id);
};

export const getTopicById = (chapterId, topicId) => {
  const chapter = getChapterById(chapterId);
  if (!chapter) return null;
  return chapter.topics.find(topic => topic.id === topicId);
};

export const getAllTopics = () => {
  return sampleChapters.flatMap(chapter => 
    chapter.topics.map(topic => ({
      ...topic,
      chapterId: chapter.id,
      chapterTitle: chapter.title,
      subject: chapter.subject
    }))
  );
};

export const getSubjectColor = (subject) => {
  const colors = {
    science: 'secondary',
    history: 'accent',
    math: 'primary'
  };
  return colors[subject] || 'primary';
};

export const getSubjectIcon = (subject) => {
  const icons = {
    science: 'flask-conical',
    history: 'landmark',
    math: 'calculator'
  };
  return icons[subject] || 'book';
};
