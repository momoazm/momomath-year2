/** Friendly pre-lesson guide lines for every English node (74 lessons + bosses),
 *  spoken by the lesson's assigned mascot in BattleScreen's guide phase (PLAN 68).
 *  Rules: 2-3 lines, each <=12 words, kid voice, tied to the unit's skill. */

export const TEACH: Record<string, string[]> = {
  // Unit 1 — Sound Detectives (phonics)
  e1l1: ['Some letters are sneaky — they say a NEW sound!', 'Listen carefully and catch the trick sound.', 'Ready, detective?'],
  e1l2: ['Long and short vowels love two tricks.', 'Long vowels say their own name!', 'Listen and pick the right one.'],
  e1l3: ['Aliens only understand one sound at a time.', 'Decode each alien word, sound by sound.', 'You can do it!'],
  e1l4: ['Every word hides sounds inside it.', 'Collect the right sound for each word.', "Let's fill your sound jar!"],
  e1l5: ['Blend sounds together to build a word.', 'Say them fast: c...a...t... cat!', 'Blending makes reading easy.'],
  e1boss: ['The Phonics Boss wants to trick you!', 'Use everything you learned about sounds.', 'Beat him — you got this!'],
  // Unit 2 — Magic e & Syllable Squad
  e2l1: ['Magic e hops at the end and makes vowels talk!', 'hat becomes hate, cap becomes cape!', 'Say it with magic power!'],
  e2l2: ['Clap the beats in each word!', 'Two claps means two syllables.', "Clap, clap — you're a star!"],
  e2l3: ['Two small words can glue into a big one!', 'sun plus flower makes sunflower!', "Let's build word monsters!"],
  e2l4: ['Big words get easier when you chunk them.', 'Break them into pieces, then read each part.', 'Chunk it and read it!'],
  e2boss: ['The Magic e Boss steals vowels!', 'Clap, chunk and beat him to it.', 'Show him who is boss!'],
  // Unit 3 — Prefix & Suffix Lab
  e3l1: ['un- means NOT or BACK.', 'un-do, un-happy, un-lock.', 'Press the undo machine!'],
  e3l2: ['dis- says NO, re- says AGAIN.', 'dis-like, re-play.', 'Remover time!'],
  e3l3: ['-er and -est compare things!', 'big, bigger, biggest.', 'Which one fits the sentence?'],
  e3l4: ['-ful, -ly and -y glue words together.', 'care plus ful makes careful!', 'Word glue is super sticky!'],
  e3l5: ['Verbs change to show when things happen.', 'play, plays, played, playing.', 'Pick the right ending!'],
  e3boss: ['The Affix Boss mixes up prefixes and suffixes.', 'Your lab skills will beat him.', 'Time to experiment!'],
  // Unit 4 — Spelling Stars
  e4l1: ['Words that rhyme share the same ending sound.', 'cat, hat, mat — a rhyme family!', 'Find the rhyme buddies!'],
  e4l2: ['Some plurals are irregular — they morph!', 'one mouse, many mice.', 'Visit the plural zoo!'],
  e4l3: ['Homophones sound the same but spell differently.', 'there goes to a place.', 'Spot the twins!'],
  e4l4: ['More homophone twins to trick your eyes!', 'their shows who owns it.', 'You know the difference!'],
  e4l5: ['Some words break the spelling rules.', 'they, said, was — learn them by heart.', 'Spelling bootcamp!'],
  e4boss: ['The Spelling Boss scrambles every word!', 'Keep your letters in order.', 'Spell your way to victory!'],
  // Unit 5 — Word Explorer
  e5l1: ['New words are treasure — hunt for meanings!', 'Read around the word to guess it.', 'Detective mode ON!'],
  e5l2: ['All 26 letters ride the alphabet train.', 'A-B-C... all aboard!', 'Say them in order!'],
  e5l3: ['Adjectives describe — they make words shine!', 'The soft cat. The big dog.', 'Add some sparkle!'],
  e5l4: ['Sparkle openers start sentences with pizzazz.', 'Suddenly... One day...', 'Open with a bang!'],
  e5l5: ['Collect your favourite words in a word hoard!', 'Use them in your writing.', 'Grow your collection!'],
  e5boss: ['The Vocabulary Boss forgot every word!', 'Teach him a lesson — with words!', 'Word power wins!'],
  // Unit 6 — Sentence Mechanics
  e6l1: ['Sentences start with a capital and end with a full stop.', 'Capitals name people and places.', 'Fix the sentence!'],
  e6l2: ['Questions ask, statements tell.', 'Endings: question mark or full stop.', 'Ask away!'],
  e6l3: ['Commands tell someone to do something.', 'Close the door! Please sit.', 'Command time!'],
  e6l4: ['Commas keep lists tidy: milk, eggs, and bread.', 'Take a tiny pause at each comma.', 'All aboard the comma train!'],
  e6l5: ['Speech marks show exactly what someone says.', '"Hello!" said Tails.', 'Spot the spoken words!'],
  e6boss: ['The Mechanics Boss breaks every sentence rule.', 'Capitals, stops and commas — attack!', 'Fix it to win it!'],
  // Unit 7 — Naming & Describing Words
  e7l1: ['Nouns name things — people, places, things.', 'Find the noun hiding in the sentence!', 'Noun hunt!'],
  e7l2: ['Grow a noun: the little red dragon!', 'Articles plus describing words plus noun.', 'Make it bigger!'],
  e7l3: ['Quantifiers say how much or how many.', 'some, many, all, few.', 'Pick the right amount!'],
  e7l4: ['Pronouns swap nouns so we do not repeat.', 'Felix runs. HE runs.', 'Swap it out!'],
  e7l5: ['Bigger, biggest — adjectives compare!', 'fun, funnier, funniest.', 'Go big!'],
  e7boss: ['The Grammar Boss locks up your nouns and verbs!', 'Free them with the right labels.', 'Name it to tame it!'],
  // Unit 8 — Verb Time Machine
  e8l1: ['Present is now, past is before.', 'play versus played.', 'Set the time machine!'],
  e8l2: ['Add -ing to show action happening now.', 'run becomes running!', 'Keep it going!'],
  e8l3: ['Mix past and present in one round!', 'Read carefully — when is it?', 'Time travel!'],
  e8boss: ['The Tense Boss jumps through time!', 'Anchor him with the right tense.', 'Catch him!'],
  // Unit 9 — Super Sentences
  e9l1: ['and, but, or join two ideas together.', 'I ran BUT I was tired.', 'Join forces!'],
  e9l2: ['because, if, when add reasons and times.', 'I slept because I was tired.', 'Build a bridge!'],
  e9l3: ['Two small ideas can become one big sentence.', 'Combine them like a superhero duo!', 'Merge!'],
  e9l4: ['Start sentences in exciting ways!', 'Under the moon, the cat yawned.', 'Showcase time!'],
  e9boss: ['The Sentence Boss splits every sentence in half.', 'Put the halves back together!', 'Reunite them!'],
  // Unit 10 — Story Quests
  e10l1: ['Stories are made up — facts are true.', 'Which one is a story?', 'Story or fact?'],
  e10l2: ['Every story has a WHO and a WHERE.', 'Find the hero and the place.', 'Look closely!'],
  e10l3: ['Retell the tale in the right order.', 'First, next, then, last.', 'Tell it back!'],
  e10l4: ['Clues hide in the words — guess the ending!', 'What happens next?', 'Crystal ball time!'],
  e10l5: ['Some meaning stays BETWEEN the lines.', 'The author does not say it directly.', 'Read between!'],
  e10l6: ['Stories follow patterns — spot them!', 'Beginning, middle, end.', 'Pattern detective!'],
  e10boss: ['The Big Story Boss tears pages apart!', 'Gather the scenes and rebuild the tale.', 'Save the story!'],
  // Unit 11 — Fact Finder
  e11l1: ['Facts are true and checkable.', 'Find the real facts in the text!', 'Fact goggles on!'],
  e11l2: ['Diagrams label the parts.', 'Read the labels to understand pictures.', 'Detective work!'],
  e11l3: ['The answer hides IN the text.', 'Point to the words that prove it.', 'Find it!'],
  e11l4: ['Everything has a purpose — what is it FOR?', 'A key opens doors.', 'Guess the job!'],
  e11l5: ['Explain it back in your own words.', 'Teach me what you learned!', 'Professor mode!'],
  e11boss: ['The Fact Boss mixes lies with truth.', 'Only true facts attack!', 'Expose him!'],
  // Unit 12 — Poetry Corner
  e12l1: ['Poems love to rhyme!', 'Match the rhyming partners.', 'Rhyme time!'],
  e12l2: ['Poems have a beat — feel it and repeat it.', 'Clap the rhythm, then say it.', 'Feel the rhythm!'],
  e12l3: ['Sound poems use tricky sounds for fun.', 'Sizzle, pop, whoosh!', 'Make some noise!'],
  e12l4: ['Perform with feeling — loud, slow, silly!', 'The stage is yours!', 'Take a bow!'],
  e12boss: ['The Poetry Boss scrambles your verses!', 'Re-rhyme and re-beat them!', 'Encore!'],
  // Unit 13 — Author Studio
  e13l1: ['Great stories start with a plan.', 'Who? What? Where?', 'Sketch your idea!'],
  e13l2: ['Beginning, middle, end — the story sandwich.', 'Order your scenes!', 'Stack it up!'],
  e13l3: ['Describe with your senses — see, hear, feel.', "Make pictures in the reader's mind.", 'Paint with words!'],
  e13l4: ['Reports tell facts clearly.', 'Heading, intro, details.', 'Build a report!'],
  e13l5: ['Every author checks their work.', 'Capitals, spaces, full stops.', 'Edit like a pro!'],
  e13boss: ['The Author Boss challenges YOU to write!', 'Plan, write and check — go!', 'Publish!'],
}
