import type { Question, UnitDef } from '../types'
import {
  buildDe,
  buildEn,
  makeLesson,
  matchDeEn,
  matchQ,
  mcqDeToEn,
  mcqEnToDe,
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
  { de: 'Montag', en: 'Monday', emoji: '😴' }, { de: 'Dienstag', en: 'Tuesday', emoji: '📚' },
  { de: 'Mittwoch', en: 'Wednesday', emoji: '⚽' }, { de: 'Donnerstag', en: 'Thursday', emoji: '🎵' },
  { de: 'Freitag', en: 'Friday', emoji: '🎉' }, { de: 'Samstag', en: 'Saturday', emoji: '🛝' },
  { de: 'Sonntag', en: 'Sunday', emoji: '⛪' },
]

const SEASONS = [
  { de: 'der Frühling', en: 'spring', emoji: '🌸' }, { de: 'der Sommer', en: 'summer', emoji: '☀️' },
  { de: 'der Herbst', en: 'autumn', emoji: '🍂' }, { de: 'der Winter', en: 'winter', emoji: '❄️' },
]

const SUBJECTS = [
  { de: 'Mathe', en: 'maths', emoji: '🔢' }, { de: 'Sport', en: 'PE', emoji: '⚽' },
  { de: 'Musik', en: 'music', emoji: '🎵' }, { de: 'Kunst', en: 'art', emoji: '🎨' },
  { de: 'Deutsch', en: 'German', emoji: '🇩🇪' }, { de: 'Englisch', en: 'English', emoji: '🇬🇧' },
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
  const variants: { prompt: string; items: string[] }[] = [
    { prompt: 'Montag first! Order the week', items: ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag'] },
    { prompt: 'Order the whole week: Montag to Sonntag', items: ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'] },
    { prompt: 'Order the school week: Montag to Freitag', items: ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag'] },
    { prompt: 'Order the weekend week-days after Freitag', items: ['Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'] },
    { prompt: 'Count back: Sonntag first down to Montag', items: ['Sonntag', 'Samstag', 'Freitag', 'Donnerstag', 'Mittwoch', 'Dienstag', 'Montag'] },
  ]
  const v = pick(rand, variants)
  return orderQ(v.prompt, v.items)
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
  const w = pick(rand, ['mathe', 'sport', 'musik', 'kunst', 'deutsch', 'englisch'])
  return tilesQ(`Spell the subject: ${w}`, w, 'Mein Lieblingsfach ist…')
}

function gDreamWeird(rand: Rand): Question {
  const items = [
    { answer: 'Ich habe Sport am Montag.', wrong: ['Ich habe Sport am Sonntag.', 'Ich habe Mathe am Montag.', 'Ich habe Musik am Freitag.'] },
    { answer: 'Ich habe Mathe am Dienstag.', wrong: ['Ich habe Mathe am Sonntag.', 'Ich habe Sport am Dienstag.', 'Ich habe Kunst am Donnerstag.'] },
    { answer: 'Ich habe Musik am Mittwoch.', wrong: ['Ich habe Musik am Samstag.', 'Ich habe Deutsch am Mittwoch.', 'Ich habe Sport am Freitag.'] },
    { answer: 'Ich habe Kunst am Donnerstag.', wrong: ['Ich habe Kunst am Sonntag.', 'Ich habe Musik am Donnerstag.', 'Ich habe Mathe am Montag.'] },
    { answer: 'Ich habe Deutsch am Freitag.', wrong: ['Ich habe Deutsch am Sonntag.', 'Ich habe Englisch am Freitag.', 'Ich habe Sport am Dienstag.'] },
    { answer: 'Ich habe Sport am Samstag.', wrong: ['Ich habe Sport am Montag.', 'Ich habe Mathe am Samstag.', 'Ich habe Musik am Mittwoch.'] },
    { answer: 'Ich habe Englisch am Montag.', wrong: ['Ich habe Englisch am Sonntag.', 'Ich habe Sport am Montag.', 'Ich habe Kunst am Freitag.'] },
    { answer: 'Ich habe Mathe am Freitag.', wrong: ['Ich habe Mathe am Sonntag.', 'Ich habe Musik am Freitag.', 'Ich habe Deutsch am Dienstag.'] },
  ]
  const item = pick(rand, items)
  const choices = shuffle(rand, [item.answer, ...item.wrong])
  return mcqFixed('Felix dreamed it! Which line fits?', choices, choices.indexOf(item.answer), {
    hint: 'Sunday = family day, no school shopping — Montag is school!',
  })
}

/* ----- Duolingo-style EN ⇄ DE: both directions + sentence builds ----- */
const DAY_GLOSS = DAYS.map((d) => ({ de: d.de, en: d.en }))
const SEASON_GLOSS = SEASONS.map((s) => ({ de: s.de, en: s.en }))
const SUBJECT_GLOSS = SUBJECTS.map((s) => ({ de: s.de, en: s.en }))

function gDayDeToEn(rand: Rand): Question {
  return mcqDeToEn(rand, DAY_GLOSS)
}

function gDayEnToDe(rand: Rand): Question {
  return mcqEnToDe(rand, DAY_GLOSS)
}

function gDayMatchDeEn(rand: Rand): Question {
  return matchDeEn(rand, DAY_GLOSS, 'Match the weekday: German to English')
}

function gSeasonDeToEn(rand: Rand): Question {
  return mcqDeToEn(rand, SEASON_GLOSS)
}

function gSeasonEnToDe(rand: Rand): Question {
  return mcqEnToDe(rand, SEASON_GLOSS)
}

function gSubjectDeToEn(rand: Rand): Question {
  return mcqDeToEn(rand, SUBJECT_GLOSS)
}

function gSubjectEnToDe(rand: Rand): Question {
  return mcqEnToDe(rand, SUBJECT_GLOSS)
}

function gSubjectMatchDeEn(rand: Rand): Question {
  return matchDeEn(rand, SUBJECT_GLOSS, 'Match the subject: German to English')
}

function gBuildPlanDe(rand: Rand): Question {
  const subject = pick(rand, SUBJECTS.slice(0, 4))
  const day = pick(rand, DAYS.slice(0, 5))
  return buildDe(`I have ${subject.en} on ${day.en}.`, ['Ich', 'habe', subject.de, 'am', `${day.de}.`])
}

function gBuildPlanEn(rand: Rand): Question {
  const subject = pick(rand, SUBJECTS.slice(0, 4))
  const day = pick(rand, DAYS.slice(0, 5))
  return buildEn(`Ich habe ${subject.de} am ${day.de}.`, ['I', 'have', subject.en, 'on', `${day.en}.`])
}

const g9l1 = makeLesson(
  'g9l1',
  'Die Wochentage',
  ['4Vl.01', '4Lm.01'],
  'tails',
  'Wochen-Plan!',
  'Fill Felix’s empty week before his parents visit! Montag first, Sonntag last!',
  [gDayMatch, gOrderDays, gDayDeToEn, gDayEnToDe],
)

const g9l2 = makeLesson(
  'g9l2',
  'Jahreszeiten',
  ['4Vl.01', '4Rm.01'],
  'knuckles',
  'Vier Zeiten!',
  'Frühling, Sommer, Herbst, Winter — hear the season, tap the picture!',
  [gSeasonPicture, gHearDay, gSeasonDeToEn, gSeasonEnToDe],
)

const g9l3 = makeLesson(
  'g9l3',
  'Mein Stundenplan',
  ['4Cu.01', '4Wc.01'],
  'blaze',
  'Schule!',
  'German school subjects! Mathe, Sport, Musik — spell them and crack the dream!',
  [gSubjectMatch, gSubjectTiles, gSubjectDeToEn, gBuildPlanDe, gBuildPlanEn],
)

const g9boss = makeLesson(
  'g9boss',
  'Schul Boss',
  ['4Vl.01', '4Cu.01'],
  'eggman',
  'BOSS TIME!',
  'Week, seasons and subjects — out-plan the boss’s timetable!',
  [gDayMatchDeEn, gSubjectMatchDeEn, gDreamWeird, gBuildPlanDe, gBuildPlanEn],
  gSubjectEnToDe,
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
