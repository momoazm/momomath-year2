/** Syllabus matching support — FUNCTION WORDS (not curriculum vocabulary).
 *  Tokens in these sets are grammatical glue, never flagged by the audit,
 *  so lessons can form real sentences without living in a word list.
 *  (PLAN 143 / 144.) */

export const EN_STOP = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'if', 'then', 'than', 'so', 'because',
  'is', 'are', 'was', 'were', 'be', 'been', 'being', 'am', 'do', 'does', 'did',
  'done', 'doing', 'have', 'has', 'had', 'will', 'would', 'can', 'could',
  'shall', 'should', 'may', 'might', 'must', 'i', 'you', 'he', 'she', 'it',
  'we', 'they', 'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his', 'its',
  'our', 'their', 'mine', 'yours', 'this', 'that', 'these', 'those', 'what',
  'which', 'who', 'whom', 'whose', 'when', 'where', 'why', 'how', 'not', 'no',
  'yes', 'there', 'here', 'too', 'very', 'just', 'about', 'into', 'over',
  'under', 'again', 'all', 'any', 'each', 'few', 'more', 'most', 'other',
  'some', 'such', 'only', 'own', 'same', 'also', 'as', 'at', 'by', 'from',
  'up', 'down', 'out', 'off', 'on', 'in', 'to', 'of', 'for', 'with', 'let',
  's', 't', 're', 've', 'll', 'd', 'm',
  // indefinite pronouns / reflexives (PLAN 145)
  'something', 'anything', 'everything', 'nothing', 'someone', 'anyone',
  'everyone', 'nobody', 'somebody', 'anybody', 'everybody', 'myself',
  'yourself', 'himself', 'herself', 'itself', 'ourselves', 'themselves',
])

export const DE_STOP = new Set([
  'und', 'ich', 'du', 'er', 'sie', 'es', 'wir', 'ihr', 'mir', 'mich', 'dir',
  'dich', 'ihm', 'ihnen', 'uns', 'euch', 'mein', 'meine', 'dein', 'deine',
  'sein', 'seine', 'ihr', 'ihre', 'unser', 'euer', 'dieser', 'diese', 'dies',
  'das', 'der', 'die', 'ein', 'eine', 'einen', 'einem', 'einer', 'oder',
  'aber', 'nicht', 'kein', 'keine', 'keinen', 'ja', 'nein', 'was', 'wer',
  'wie', 'wo', 'wann', 'warum', 'wenn', 'denn', 'auch', 'noch', 'nur',
  'sehr', 'zu', 'von', 'vor', 'nach', 'mit', 'auf', 'an', 'aus', 'bei',
  'für', 'gegen', 'ohne', 'um', 'über', 'unter', 'zwischen', 'in', 'am',
  'im', 'zum', 'zur', 'als', 'dass', 'sich', 'man', 'kann', 'muss', 'soll',
  'wird', 'werde', 'habe', 'hat', 'haben', 'sind', 'bin', 'bist', 'war',
  'waren', 'viel', 'mehr', 'hier', 'da', 'dort', 'jetzt', 'dann', 'so',
  'immer', 'nie', 'oft', 'schon', 'mal', 'wieder', 'bis', 'seit', 'ohne',
  'doch', 'mal', 'uns', 'dir', 'one',
  // common conjugated forms of sein/mögen (PLAN 145)
  'ist', 'mag',
])

export const AR_STOP = new Set([
  'و', 'في', 'من', 'إلى', 'على', 'عن', 'مع', 'هذا', 'هذه', 'ذلك', 'تلك',
  'أن', 'إن', 'كان', 'كانت', 'يكون', 'لا', 'ما', 'الذي', 'التي', 'الذين',
  'ثم', 'أو', 'بل', 'قد', 'كل', 'بعد', 'قبل', 'بين', 'عند', 'حتى', 'إذا',
  'لأن', 'كما', 'غير', 'حيث', 'أثناء', 'منذ', 'لدى', 'أمام', 'وراء',
  // kid-sentence glue + question words (PLAN 145)
  'فيها', 'أين', 'متى', 'هل', 'بما', 'أي', 'أنا', 'أنت', 'هو', 'هي',
  'هنا', 'هناك', 'أيضا', 'فقط', 'لكن', 'بعض', 'نفس',
  'nga', 'y',
])
