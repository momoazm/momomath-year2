import type { Question, UnitDef } from '../types'
import {
  makeLesson,
  matchQ,
  mcqE,
  mcqFixed,
  orderQ,
  pick,
  say,
  shuffle,
  tilesQ,
  unitDef,
  type Rand,
} from './helpers'

const DAYS = [
  { de: 'Montag', emoji: '😴' }, { de: 'Dienstag', emoji: '📚' },
  { de: 'Mittwoch', emoji: '⚽' }, { de: 'Donnerstag', emoji: '🎵' },
  { de: 'Freitag', emoji: '🎉' }, { de: 'Samstag', emoji: '🛝' },
  { de: 'Sonntag', emoji: '⛪' },
]

const SEASONS = [
  { de: 'der Frühling', emoji: '🌸' }, { de: 'der Sommer', emoji: '☀️' },
  { de: 'der Herbst', emoji: '🍂' }, { de: 'der Winter', emoji: '❄️' },
]

const SUBJECTS = [
  { de: 'Mathe', emoji: '🔢' }, { de: 'Sport', emoji: '⚽' },
  { de: 'Musik', emoji: '🎵' }, { de: 'Kunst', emoji: '🎨' },
  { de: 'Deutsch', emoji: '🇩🇪' }, { de: 'Englisch', emoji: '🇬🇧' },
]

function gDayMatch(rand: Rand): Question {
  const pairs = shuffle(rand, DAYS.map((d) => ({ left: d.de, right: d.emoji }))).slice(0, 4)
  return matchQ(rand, 'Match the weekday', pairs)
}

function gHearDay(rand: Rand): Question {
  const item = pick(rand, DAYS)
  const others = DAYS.filter((d) => d.de !== item.de).map((d) => d.de)
  return mcqE(rand, 'Tap the day you hear', item.de, others, say(item.de))
}

function gOrderDays(rand: Rand): Question {
  void rand
  return orderQ('Montag first! Order the week', ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag'])
}

function gSeasonPicture(rand: Rand): Question {
  const item = pick(rand, SEASONS)
  const others = SEASONS.filter((s) => s.de !== item.de).map((s) => s.de)
  return mcqE(rand, 'Welche Jahreszeit ist das?', item.de, others, {
    visual: { type: 'emoji-group', emojis: [item.emoji] },
    ...say(item.de),
  })
}

function gSubjectMatch(rand: Rand): Question {
  const pairs = shuffle(rand, SUBJECTS.map((s) => ({ left: s.de, right: s.emoji }))).slice(0, 4)
  return matchQ(rand, 'Match the school subject', pairs)
}

function gSubjectTiles(rand: Rand): Question {
  const w = pick(rand, ['mathe', 'sport', 'musik', 'kunst', 'deutsch'])
  return tilesQ(`Spell the subject: ${w}`, w, 'Mein Lieblingsfach ist…')
}

function gDreamWeird(rand: Rand): Question {
  const answer = 'Ich habe Sport am Montag.'
  const choices = shuffle(rand, [
    answer,
    'Ich habe Sport am Sonntag.',
    'Ich habe Mathe am Montag.',
    'Ich habe Musik am Freitag.',
  ])
  return mcqFixed('Felix dreamed it! Which line fits?', choices, choices.indexOf(answer), {
    hint: 'Sunday = family day, no school shopping — Montag is school!',
  })
}

const g9l1 = makeLesson(
  'g9l1',
  'Die Wochentage',
  ['4Vl.01', '4Lm.01'],
  'tails',
  'Wochen-Plan!',
  'Fill Felix’s empty week before his parents visit! Montag first, Sonntag last!',
  [gDayMatch, gOrderDays],
)

const g9l2 = makeLesson(
  'g9l2',
  'Jahreszeiten',
  ['4Vl.01', '4Rm.01'],
  'knuckles',
  'Vier Zeiten!',
  'Frühling, Sommer, Herbst, Winter — hear the season, tap the picture!',
  [gSeasonPicture, gHearDay],
)

const g9l3 = makeLesson(
  'g9l3',
  'Mein Stundenplan',
  ['4Cu.01', '4Wc.01'],
  'blaze',
  'Schule!',
  'German school subjects! Mathe, Sport, Musik — spell them and crack the dream!',
  [gSubjectMatch, gSubjectTiles],
)

const g9boss = makeLesson(
  'g9boss',
  'Schul Boss',
  ['4Vl.01', '4Cu.01'],
  'eggman',
  'BOSS TIME!',
  'Week, seasons and subjects — out-plan the boss’s timetable!',
  [gOrderDays, gSeasonPicture, gSubjectMatch, gDreamWeird],
  gOrderDays,
)

export const UNIT_G9: UnitDef = unitDef(
  'g9',
  9,
  'Zeit & Schule',
  'Deutsch extra · weekdays, seasons, school subjects',
  '#4a90e2',
  '🏫',
  [g9l1, g9l2, g9l3, g9boss],
)
