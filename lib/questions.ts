import { Question, Category, Difficulty } from "@/types";

// Hardcoded questions for MVP — will be replaced with MongoDB in Phase 3
const QUESTIONS: Omit<Question, "_id">[] = [
  // Week 1
  {
    date: "2026-02-09",
    questionNumber: 1,
    question: "How long is 1 billion seconds?",
    answer: 31.7,
    unit: "years",
    explanation:
      "There are about 31.5 million seconds in a year, making 1 billion seconds roughly 31.7 years. For comparison, 1 million seconds is only about 11.5 days.",
    source: "https://en.wikipedia.org/wiki/1,000,000,000",
    category: "TIME" as Category,
    difficulty: "medium" as Difficulty,
  },
  {
    date: "2026-02-10",
    questionNumber: 2,
    question: "How many times does your heart beat in one day?",
    answer: 100000,
    unit: "beats",
    explanation:
      "At roughly 70 beats per minute, your heart beats about 100,000 times every single day — that's over 2.5 billion beats in an average lifetime.",
    source: "https://www.heart.org/en/health-topics/heart-failure/what-is-heart-failure",
    category: "HUMAN_BODY" as Category,
    difficulty: "medium" as Difficulty,
  },
  {
    date: "2026-02-11",
    questionNumber: 3,
    question: "How many photos are taken worldwide every day?",
    answer: 1400000000,
    unit: "photos",
    explanation:
      "Roughly 1.4 billion photos are taken every day worldwide — that's about 16,000 photos every second, mostly on smartphones.",
    source: "https://focus.mylio.com/tech-today/how-many-photos-are-taken-per-day",
    category: "SCALE" as Category,
    difficulty: "hard" as Difficulty,
  },
  {
    date: "2026-02-12",
    questionNumber: 4,
    question: "How many times does lightning strike Earth every day?",
    answer: 8000000,
    unit: "strikes",
    explanation:
      "Lightning strikes Earth about 8 million times per day — roughly 100 strikes every single second. About 70% occur in the tropics.",
    source: "https://www.cdc.gov/lightning/about/index.html",
    category: "NATURE" as Category,
    difficulty: "hard" as Difficulty,
  },
  {
    date: "2026-02-13",
    questionNumber: 5,
    question: "How far away is the Moon in miles?",
    answer: 238900,
    unit: "miles",
    explanation:
      "The Moon is about 238,900 miles away. You could fit all 7 other planets in our solar system side by side in that gap — with room to spare.",
    source: "https://moon.nasa.gov/about/in-depth/",
    category: "SPACE" as Category,
    difficulty: "medium" as Difficulty,
  },
  {
    date: "2026-02-14",
    questionNumber: 6,
    question: "How many Google searches happen every day?",
    answer: 8500000000,
    unit: "searches",
    explanation:
      "Google processes over 8.5 billion searches per day — that's roughly 99,000 searches every single second. It handles more queries daily than the entire world population.",
    source: "https://blog.hubspot.com/marketing/google-search-statistics",
    category: "SCALE" as Category,
    difficulty: "hard" as Difficulty,
  },
  {
    date: "2026-02-15",
    questionNumber: 7,
    question: "How fast does a sneeze travel in miles per hour?",
    answer: 100,
    unit: "mph",
    explanation:
      "A sneeze can travel at up to 100 mph and send about 100,000 germs into the air. That's faster than most highway speed limits.",
    source: "https://www.lung.org/blog/facts-about-the-common-cold",
    category: "WILD_CARD" as Category,
    difficulty: "easy" as Difficulty,
  },
  // Week 2
  {
    date: "2026-02-16",
    questionNumber: 8,
    question: "How many years would it take to walk to the Moon?",
    answer: 9,
    unit: "years",
    explanation:
      "Walking non-stop at 3 mph, 24/7, it would take about 9 years to walk the 238,900 miles to the Moon. Better pack a lot of snacks.",
    source: "https://www.spaceanswers.com/space-exploration/how-long-would-it-take-to-walk-to-the-moon/",
    category: "TIME" as Category,
    difficulty: "medium" as Difficulty,
  },
  {
    date: "2026-02-17",
    questionNumber: 9,
    question: "How many cells are in the human body?",
    answer: 37200000000000,
    unit: "cells",
    explanation:
      "Your body contains roughly 37.2 trillion cells. Even more mind-blowing: bacterial cells in and on your body roughly equal that number.",
    source: "https://pubmed.ncbi.nlm.nih.gov/23829164/",
    category: "HUMAN_BODY" as Category,
    difficulty: "hard" as Difficulty,
  },
  {
    date: "2026-02-18",
    questionNumber: 10,
    question: "How many emails are sent worldwide every day?",
    answer: 333000000000,
    unit: "emails",
    explanation:
      "Over 333 billion emails are sent and received globally each day. About half are spam. That's roughly 40 emails per person on Earth per day.",
    source: "https://www.statista.com/statistics/456500/daily-number-of-e-mails-worldwide/",
    category: "SCALE" as Category,
    difficulty: "hard" as Difficulty,
  },
  {
    date: "2026-02-19",
    questionNumber: 11,
    question: "How many trees are on Earth?",
    answer: 3000000000000,
    unit: "trees",
    explanation:
      "There are roughly 3 trillion trees on Earth — about 400 trees for every person. But we're losing about 10 billion per year to deforestation.",
    source: "https://www.nature.com/articles/nature14967",
    category: "NATURE" as Category,
    difficulty: "hard" as Difficulty,
  },
  {
    date: "2026-02-20",
    questionNumber: 12,
    question: "How many Earths could fit inside the Sun?",
    answer: 1300000,
    unit: "Earths",
    explanation:
      "About 1.3 million Earths could fit inside the Sun. The Sun's diameter is 109 times that of Earth, and it contains 99.86% of all mass in the solar system.",
    source: "https://solarsystem.nasa.gov/solar-system/sun/overview/",
    category: "SPACE" as Category,
    difficulty: "hard" as Difficulty,
  },
  {
    date: "2026-02-21",
    questionNumber: 13,
    question: "How many dimples are on a standard golf ball?",
    answer: 336,
    unit: "dimples",
    explanation:
      "Most golf balls have 300-500 dimples, with 336 being the most common. The dimples reduce drag and help the ball fly up to 3x farther than a smooth ball would.",
    source: "https://www.usga.org/",
    category: "WILD_CARD" as Category,
    difficulty: "easy" as Difficulty,
    hotRange: 0.08,
    warmRange: 0.25,
  },
  {
    date: "2026-02-22",
    questionNumber: 14,
    question: "How many hours does the average person spend eating in their lifetime?",
    answer: 32000,
    unit: "hours",
    explanation:
      "The average person spends about 32,000 hours eating over a lifetime — that's roughly 3.6 years of non-stop eating. About 67 minutes per day.",
    source: "https://www.usda.gov/",
    category: "TIME" as Category,
    difficulty: "medium" as Difficulty,
  },
  // Week 3
  {
    date: "2026-02-23",
    questionNumber: 15,
    question: "How many miles of blood vessels are in the human body?",
    answer: 60000,
    unit: "miles",
    explanation:
      "Your body has about 60,000 miles of blood vessels — enough to wrap around the Earth nearly 2.5 times. Most are tiny capillaries thinner than a hair.",
    source: "https://www.fi.edu/heart/blood-vessels",
    category: "HUMAN_BODY" as Category,
    difficulty: "medium" as Difficulty,
  },
  {
    date: "2026-02-24",
    questionNumber: 16,
    question: "How many songs are on Spotify?",
    answer: 100000000,
    unit: "songs",
    explanation:
      "Spotify's library has over 100 million tracks. About 100,000 new songs are uploaded every single day. At 3 minutes per song, it would take over 570 years to listen to them all.",
    source: "https://newsroom.spotify.com/company-info/",
    category: "SCALE" as Category,
    difficulty: "hard" as Difficulty,
  },
  {
    date: "2026-02-25",
    questionNumber: 17,
    question: "How deep is the deepest point in the ocean, in feet?",
    answer: 36161,
    unit: "feet",
    explanation:
      "The Mariana Trench's Challenger Deep reaches 36,161 feet — nearly 7 miles down. If you dropped Mount Everest into it, the peak would still be over a mile underwater.",
    source: "https://oceanservice.noaa.gov/facts/oceandepth.html",
    category: "NATURE" as Category,
    difficulty: "medium" as Difficulty,
  },
  {
    date: "2026-02-26",
    questionNumber: 18,
    question: "How long does it take sunlight to reach Earth, in minutes?",
    answer: 8.3,
    unit: "minutes",
    explanation:
      "Light from the Sun takes about 8 minutes and 20 seconds to reach Earth, traveling at 186,000 miles per second across 93 million miles. The sunlight you see is already 8 minutes old.",
    source: "https://solarsystem.nasa.gov/solar-system/sun/overview/",
    category: "SPACE" as Category,
    difficulty: "easy" as Difficulty,
    hotRange: 0.1,
    warmRange: 0.3,
  },
  {
    date: "2026-02-27",
    questionNumber: 19,
    question: "How many licks does it take to get to the center of a Tootsie Pop?",
    answer: 364,
    unit: "licks",
    explanation:
      "Engineering students at Purdue University built a licking machine and found it takes an average of 364 licks. Human tests averaged 252, since people tend to bite before finishing.",
    source: "https://tootsie.com/howmanylick-experiments",
    category: "WILD_CARD" as Category,
    difficulty: "easy" as Difficulty,
    hotRange: 0.1,
    warmRange: 0.3,
  },
  {
    date: "2026-02-28",
    questionNumber: 20,
    question: "How many days old is a 30-year-old person?",
    answer: 10950,
    unit: "days",
    explanation:
      "A 30-year-old has lived about 10,950 days. That number feels shockingly small when you realize the average lifespan is only about 28,000-30,000 days.",
    source: "https://www.cdc.gov/nchs/fastats/life-expectancy.htm",
    category: "TIME" as Category,
    difficulty: "medium" as Difficulty,
  },
  {
    date: "2026-03-01",
    questionNumber: 21,
    question: "How many taste buds does the average adult have?",
    answer: 10000,
    unit: "taste buds",
    explanation:
      "Adults have about 10,000 taste buds, each containing 50-100 taste receptor cells. They regenerate every 1-2 weeks. By age 60, you may have only half as many.",
    source: "https://www.ncbi.nlm.nih.gov/books/NBK279408/",
    category: "HUMAN_BODY" as Category,
    difficulty: "medium" as Difficulty,
  },
  // Week 4
  {
    date: "2026-03-02",
    questionNumber: 22,
    question: "How many hours of video are uploaded to YouTube every minute?",
    answer: 500,
    unit: "hours",
    explanation:
      "Over 500 hours of video are uploaded to YouTube every single minute. That's 30,000 hours per hour — you could never watch it all even at 100x speed.",
    source: "https://blog.youtube/press/",
    category: "SCALE" as Category,
    difficulty: "medium" as Difficulty,
  },
  {
    date: "2026-03-03",
    questionNumber: 23,
    question: "How old is the oldest known living tree, in years?",
    answer: 4856,
    unit: "years",
    explanation:
      "A Great Basin bristlecone pine named Methuselah in California's White Mountains is over 4,856 years old. It was already ancient when the Egyptian pyramids were being built.",
    source: "https://www.fs.usda.gov/detail/inyo/home/?cid=stelprdb5129900",
    category: "NATURE" as Category,
    difficulty: "medium" as Difficulty,
  },
  {
    date: "2026-03-04",
    questionNumber: 24,
    question: "How many stars are estimated to be in the Milky Way galaxy?",
    answer: 200000000000,
    unit: "stars",
    explanation:
      "The Milky Way contains an estimated 100-400 billion stars, with 200 billion as the commonly cited middle estimate. And there are roughly 2 trillion galaxies in the observable universe.",
    source: "https://asd.gsfc.nasa.gov/blueshift/index.php/2015/07/22/how-many-stars-in-the-milky-way/",
    category: "SPACE" as Category,
    difficulty: "hard" as Difficulty,
  },
  {
    date: "2026-03-05",
    questionNumber: 25,
    question: "How many years ago were the Egyptian pyramids built?",
    answer: 4500,
    unit: "years ago",
    explanation:
      "The Great Pyramid of Giza was built around 2560 BC — roughly 4,500 years ago. Cleopatra lived closer in time to the Moon landing than to the building of the pyramids.",
    source: "https://www.britannica.com/topic/Pyramids-of-Giza",
    category: "HISTORY" as Category,
    difficulty: "medium" as Difficulty,
  },
  {
    date: "2026-03-06",
    questionNumber: 26,
    question: "How many pounds of food does the average American eat per year?",
    answer: 1996,
    unit: "pounds",
    explanation:
      "The average American eats about 1,996 pounds of food per year — nearly a ton. That's roughly 5.5 pounds of food per day, including about 2,000 pounds of water content.",
    source: "https://www.usda.gov/",
    category: "WILD_CARD" as Category,
    difficulty: "medium" as Difficulty,
  },
  {
    date: "2026-03-07",
    questionNumber: 27,
    question: "How many minutes does the average person spend on their phone each day?",
    answer: 235,
    unit: "minutes",
    explanation:
      "The average person spends about 3 hours and 55 minutes on their phone daily — that adds up to roughly 60 full days per year staring at your screen.",
    source: "https://www.statista.com/statistics/1045353/mobile-device-daily-usage-time-in-the-us/",
    category: "TIME" as Category,
    difficulty: "easy" as Difficulty,
  },
  {
    date: "2026-03-08",
    questionNumber: 28,
    question: "How many breaths does the average person take in one day?",
    answer: 22000,
    unit: "breaths",
    explanation:
      "You take about 22,000 breaths every day — roughly 15-20 per minute. Over a lifetime, that adds up to about 600 million breaths.",
    source: "https://www.lung.org/lung-health-diseases/how-lungs-work",
    category: "HUMAN_BODY" as Category,
    difficulty: "medium" as Difficulty,
  },
  {
    date: "2026-03-09",
    questionNumber: 29,
    question: "How many species of insects have been discovered on Earth?",
    answer: 900000,
    unit: "species",
    explanation:
      "Scientists have identified about 900,000 insect species — but estimate there may be 5-10 million total. Insects make up roughly 80% of all known animal species.",
    source: "https://www.si.edu/spotlight/buginfo/bugnos",
    category: "NATURE" as Category,
    difficulty: "hard" as Difficulty,
  },
  {
    date: "2026-03-10",
    questionNumber: 30,
    question: "How many grains of sand are on Earth?",
    answer: 7.5e18,
    unit: "grains",
    explanation:
      "Earth has roughly 7.5 quintillion (7.5 × 10\u00B9\u2078) grains of sand. That's more than the number of stars visible from Earth, but fewer than the estimated stars in the observable universe.",
    source: "https://www.npr.org/sections/krulwich/2012/09/17/161096233/",
    category: "WILD_CARD" as Category,
    difficulty: "hard" as Difficulty,
    hotRange: 0.1,
    warmRange: 0.35,
  },
];

export function getTodayQuestion(): Question {
  const today = new Date().toISOString().split("T")[0];

  let question = QUESTIONS.find((q) => q.date === today);

  if (!question) {
    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
        86400000
    );
    question = QUESTIONS[dayOfYear % QUESTIONS.length];
  }

  return { _id: question.date, ...question };
}
