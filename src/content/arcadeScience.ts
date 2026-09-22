/** Lab Blitz arcade bank — Cambridge Primary Science Stage 2 (0097) facts.
 *  Kid-safe emoji MCQs across biology / chemistry / physics / earth+space.
 *  Rounds pick entries at random; 4 options shuffled. */
export interface LabBlitzEntry {
  emoji: string
  q: string
  answer: string
  wrong: [string, string, string]
}

export const LAB_BLITZ_BANK: LabBlitzEntry[] = [
  { emoji: '🌱', q: 'What do plants need to grow?', answer: 'Light and water', wrong: ['Chocolate and milk', 'Sand and stones', 'Wind and noise'] },
  { emoji: '☀️', q: 'Which part of a plant drinks water?', answer: 'The roots', wrong: ['The flower', 'The fruit', 'The bark'] },
  { emoji: '🦋', q: 'What do caterpillars turn into?', answer: 'Butterflies', wrong: ['Birds', 'Beetles', 'Bats'] },
  { emoji: '🐸', q: 'A frog starts life as a…', answer: 'Tadpole', wrong: ['Kitten', 'Chick', 'Cub'] },
  { emoji: '🐻', q: 'Which of these is a mammal?', answer: 'A bear', wrong: ['A shark', 'A crocodile', 'A frog'] },
  { emoji: '🐧', q: 'Penguins are birds that can…', answer: 'Swim', wrong: ['Fly south', 'Climb trees', 'Run faster than cheetahs'] },
  { emoji: '🌙', q: 'What do we see in the sky at night?', answer: 'The moon', wrong: ['The sun', 'A rainbow', 'A cloud'] },
  { emoji: '🌍', q: 'What gives Earth light during the day?', answer: 'The sun', wrong: ['The moon', 'Stars', 'Lightning'] },
  { emoji: '🌧️', q: 'What do we call frozen rain that falls as ice?', answer: 'Hail', wrong: ['Dew', 'Fog', 'Mist'] },
  { emoji: '❄️', q: 'Water turns to ice below…', answer: '0°C', wrong: ['100°C', '50°C', '37°C'] },
  { emoji: '♨️', q: 'Heating water turns it into…', answer: 'Steam', wrong: ['Ice', 'Sand', 'Milk'] },
  { emoji: '🧊', q: 'Ice is water in which state?', answer: 'Solid', wrong: ['Liquid', 'Gas', 'Plasma'] },
  { emoji: '💨', q: 'Water vapour is water in which state?', answer: 'Gas', wrong: ['Solid', 'Liquid', 'Frozen'] },
  { emoji: '🧪', q: 'Which material is a magnet attracted to?', answer: 'Iron', wrong: ['Wood', 'Rubber', 'Plastic'] },
  { emoji: '🪨', q: 'Which of these is a rock?', answer: 'Granite', wrong: ['Cotton', 'Foam', 'Sponge'] },
  { emoji: '🪵', q: 'Wood comes from…', answer: 'Trees', wrong: ['Rivers', 'Mountains', 'The sea'] },
  { emoji: '🎈', q: 'Which material stretches the most?', answer: 'Rubber', wrong: ['Glass', 'Brick', 'Stone'] },
  { emoji: '🧲', q: 'A magnet pushes away from…', answer: 'The same pole', wrong: ['Every metal', 'Water', 'Wood'] },
  { emoji: '🔌', q: 'What do we need for a light bulb to glow?', answer: 'Electricity', wrong: ['Magnetism', 'Sunlight', 'Sound'] },
  { emoji: '🔦', q: 'A torch changes electricity into…', answer: 'Light', wrong: ['Water', 'Heat only', 'Sound'] },
  { emoji: '🥁', q: 'Sound is made when something…', answer: 'Vibrates', wrong: ['Glows', 'Melts', 'Floats'] },
  { emoji: '🚫', q: 'In space, where there is no air, sound cannot…', answer: 'Travel', wrong: ['Exist', 'Be fast', 'Be loud'] },
  { emoji: '🌈', q: 'Rainbows appear when light passes through…', answer: 'Raindrops', wrong: ['Rocks', 'Leaves', 'Sand'] },
  { emoji: '⏳', q: 'Which is used to measure time?', answer: 'A clock', wrong: ['A ruler', 'A scale', 'A thermometer'] },
  { emoji: '📏', q: 'Which instrument measures length?', answer: 'A ruler', wrong: ['A clock', 'A compass', 'A balance'] },
  { emoji: '🌡️', q: 'Which instrument measures temperature?', answer: 'A thermometer', wrong: ['A ruler', 'A scale', 'A rain gauge'] },
  { emoji: '⚖️', q: 'Which instrument measures mass?', answer: 'A balance', wrong: ['A compass', 'A clock', 'A ruler'] },
  { emoji: '🐶', q: 'Which sense do we use to smell?', answer: 'Nose', wrong: ['Ears', 'Fingers', 'Tongue'] },
  { emoji: '👅', q: 'Which sense tells us something is sweet?', answer: 'Taste', wrong: ['Touch', 'Hearing', 'Sight'] },
  { emoji: '👁️', q: 'Which organ helps us see?', answer: 'Eyes', wrong: ['Ears', 'Nose', 'Skin'] },
  { emoji: '🏃', q: 'Humans have how many legs?', answer: 'Two', wrong: ['Four', 'Six', 'Eight'] },
  { emoji: '🐛', q: 'An insect has how many legs?', answer: 'Six', wrong: ['Two', 'Four', 'Eight'] },
  { emoji: '🕷️', q: 'A spider has how many legs?', answer: 'Eight', wrong: ['Six', 'Four', 'Ten'] },
  { emoji: '🪶', q: 'Birds cover their bodies with…', answer: 'Feathers', wrong: ['Fur', 'Scales', 'Shell'] },
  { emoji: '🐟', q: 'Fish breathe underwater using…', answer: 'Gills', wrong: ['Lungs', 'Skin', 'Fins'] },
  { emoji: '🌳', q: 'In autumn, many trees…', answer: 'Lose their leaves', wrong: ['Grow flowers', 'Turn blue', 'Sleep in soil'] },
  { emoji: '🌞', q: 'Which season is the hottest in the UK?', answer: 'Summer', wrong: ['Winter', 'Autumn', 'Spring'] },
  { emoji: '🍂', q: 'Which season do leaves fall?', answer: 'Autumn', wrong: ['Summer', 'Winter', 'Spring'] },
  { emoji: '🌺', q: 'Which season do flowers bloom?', answer: 'Spring', wrong: ['Winter', 'Autumn', 'Summer'] },
  { emoji: '🦷', q: 'Which of these is an input? (inputs of a torch)', answer: 'Electricity', wrong: ['Light', 'Heat', 'Sound'] },
]

export function rollLabQuestion(rand: () => number = Math.random) {
  const e = LAB_BLITZ_BANK[Math.floor(rand() * LAB_BLITZ_BANK.length)]
  const options = [e.answer, ...e.wrong].sort(() => rand() - 0.5)
  return { emoji: e.emoji, text: e.q, answer: e.answer, options }
}
