/* TND Guides – Sinhala and Tamil translations for the student pages.
   How it works: pages are written in English. This file swaps any English
   text it knows for the chosen language, including text the pages add later.
   To add or fix a translation, change the lines in SI or TA below. */

const LANGS = [["en", "EN"], ["si", "සිං"], ["ta", "த"]];
let lang = "en";
try { lang = localStorage.getItem("guruhub_lang") || "en"; } catch (e) { /* ignore */ }
if (!LANGS.some(l => l[0] === lang)) lang = "en";

export const getLang = () => lang;
export const locale = () => ({ si: "si-LK", ta: "ta-LK" }[lang] || "en-GB");

/* ---------- Words that appear on their own (subjects, grades, days …) ---------- */
const WORDS = {
  si: {
    "Maths": "ගණිතය", "Sinhala": "සිංහල", "Tamil": "දෙමළ", "English": "ඉංග්‍රීසි", "Environment": "පරිසරය",
    "Religion": "ආගම", "Science": "විද්‍යාව", "History": "ඉතිහාසය", "Geography": "භූගෝල විද්‍යාව", "Civics": "පුරවැසි අධ්‍යාපනය",
    "ICT": "ICT", "Health": "සෞඛ්‍යය", "Commerce": "වාණිජ්‍යය", "Combined Maths": "සංයුක්ත ගණිතය", "Physics": "භෞතික විද්‍යාව",
    "Chemistry": "රසායන විද්‍යාව", "Biology": "ජීව විද්‍යාව", "Agriculture": "කෘෂි විද්‍යාව", "Accounting": "ගිණුම්කරණය",
    "Business Studies": "ව්‍යාපාර අධ්‍යයනය", "Economics": "ආර්ථික විද්‍යාව", "Political Science": "දේශපාලන විද්‍යාව", "Logic": "තර්ක ශාස්ත්‍රය",
    "Engineering Tech": "ඉංජිනේරු තාක්ෂණවේදය", "Science for Tech": "තාක්ෂණවේදය සඳහා විද්‍යාව", "Bio-systems Tech": "ජෛව පද්ධති තාක්ෂණවේදය",
    "Art": "චිත්‍ර", "Music": "සංගීතය", "Dancing": "නර්තනය",
    "O/Level": "සාමාන්‍ය පෙළ", "A/Level": "උසස් පෙළ", "A/L Maths": "උ/පෙ ගණිත", "A/L Science": "උ/පෙ විද්‍යා", "A/L Commerce": "උ/පෙ වාණිජ",
    "A/L Arts": "උ/පෙ කලා", "A/L Technology": "උ/පෙ තාක්ෂණ", "Primary": "ප්‍රාථමික", "Secondary": "ද්විතීයික", "Other": "වෙනත්",
    "Monday": "සඳුදා", "Tuesday": "අඟහරුවාදා", "Wednesday": "බදාදා", "Thursday": "බ්‍රහස්පතින්දා", "Friday": "සිකුරාදා", "Saturday": "සෙනසුරාදා", "Sunday": "ඉරිදා",
    "Morning": "උදේ", "Afternoon": "දවල්", "Evening": "සවස",
    "Past papers": "පසුගිය ප්‍රශ්න පත්‍ර", "Marking schemes": "ලකුණු දීමේ පටිපාටි", "Model papers": "ආදර්ශ ප්‍රශ්න පත්‍ර",
    "School papers": "පාසල් ප්‍රශ්න පත්‍ර", "Notes": "සටහන්", "Past paper": "පසුගිය ප්‍රශ්න පත්‍රය", "Marking scheme": "ලකුණු දීමේ පටිපාටිය",
    "Model paper": "ආදර්ශ ප්‍රශ්න පත්‍රය", "School paper": "පාසල් ප්‍රශ්න පත්‍රය"
  },
  ta: {
    "Maths": "கணிதம்", "Sinhala": "சிங்களம்", "Tamil": "தமிழ்", "English": "ஆங்கிலம்", "Environment": "சுற்றாடல்",
    "Religion": "சமயம்", "Science": "விஞ்ஞானம்", "History": "வரலாறு", "Geography": "புவியியல்", "Civics": "குடியியல்",
    "ICT": "ICT", "Health": "சுகாதாரம்", "Commerce": "வர்த்தகம்", "Combined Maths": "இணைந்த கணிதம்", "Physics": "பௌதிகவியல்",
    "Chemistry": "இரசாயனவியல்", "Biology": "உயிரியல்", "Agriculture": "விவசாய விஞ்ஞானம்", "Accounting": "கணக்கீடு",
    "Business Studies": "வணிகக் கல்வி", "Economics": "பொருளியல்", "Political Science": "அரசறிவியல்", "Logic": "அளவையியல்",
    "Engineering Tech": "பொறியியல் தொழில்நுட்பவியல்", "Science for Tech": "தொழில்நுட்பவியலுக்கான விஞ்ஞானம்", "Bio-systems Tech": "உயிர் முறைமைகள் தொழில்நுட்பவியல்",
    "Art": "சித்திரம்", "Music": "சங்கீதம்", "Dancing": "நடனம்",
    "O/Level": "சாதாரண தரம்", "A/Level": "உயர் தரம்", "A/L Maths": "உ/த கணிதம்", "A/L Science": "உ/த விஞ்ஞானம்", "A/L Commerce": "உ/த வர்த்தகம்",
    "A/L Arts": "உ/த கலை", "A/L Technology": "உ/த தொழில்நுட்பம்", "Primary": "ஆரம்பப் பிரிவு", "Secondary": "இடைநிலைப் பிரிவு", "Other": "மற்றவை",
    "Monday": "திங்கள்", "Tuesday": "செவ்வாய்", "Wednesday": "புதன்", "Thursday": "வியாழன்", "Friday": "வெள்ளி", "Saturday": "சனி", "Sunday": "ஞாயிறு",
    "Morning": "காலை", "Afternoon": "மதியம்", "Evening": "மாலை",
    "Past papers": "கடந்தகால வினாத்தாள்கள்", "Marking schemes": "புள்ளியிடல் திட்டங்கள்", "Model papers": "மாதிரி வினாத்தாள்கள்",
    "School papers": "பாடசாலை வினாத்தாள்கள்", "Notes": "குறிப்புகள்", "Past paper": "கடந்தகால வினாத்தாள்", "Marking scheme": "புள்ளியிடல் திட்டம்",
    "Model paper": "மாதிரி வினாத்தாள்", "School paper": "பாடசாலை வினாத்தாள்"
  }
};

/* ---------- Sentences and labels: [English, Sinhala, Tamil] ---------- */
const LINES = [
  // menus
  ["Home", "මුල් පිටුව", "முகப்பு"],
  ["My lessons", "මගේ පාඩම්", "என் பாடங்கள்"],
  ["Teachers", "ගුරුවරු", "ஆசிரியர்கள்"],
  ["Ask the class", "පන්තියෙන් අහන්න", "வகுப்பிடம் கேளுங்கள்"],
  ["Ask class", "පන්තියෙන් අහන්න", "வகுப்பிடம் கேள்"],
  ["Log in", "ඇතුල් වන්න", "உள்நுழை"],
  ["Admin", "පරිපාලක", "நிர்வாகி"],
  ["Demo mode: data is saved on this device only. See SETUP.md to go live.", "ආදර්ශ ප්‍රකාරය: දත්ත මෙම උපාංගයේ පමණක් සුරැකේ.", "மாதிரி முறை: தரவு இந்தச் சாதனத்தில் மட்டுமே சேமிக்கப்படும்."],
  // home
  ["Grade 1 to A/L · Sri Lanka", "1 ශ්‍රේණියේ සිට උසස් පෙළ දක්වා · ශ්‍රී ලංකාව", "தரம் 1 முதல் உ/த வரை · இலங்கை"],
  ["Papers, marking schemes and", "ප්‍රශ්න පත්‍ර, ලකුණු දීමේ පටිපාටි සහ", "வினாத்தாள்கள், புள்ளியிடல் திட்டங்கள் மற்றும்"],
  ["teachers", "ගුරුවරු", "ஆசிரியர்கள்"],
  ["Tap your grade, then your subject. Get past papers, or ask for a teacher.", "ඔබේ ශ්‍රේණිය ඔබන්න, ඉන්පසු විෂය ඔබන්න. පසුගිය ප්‍රශ්න පත්‍ර ලබාගන්න, නැත්නම් ගුරුවරයෙක් ඉල්ලන්න.", "உங்கள் தரத்தைத் தட்டுங்கள், பின்னர் பாடத்தைத் தட்டுங்கள். கடந்தகால வினாத்தாள்களைப் பெறுங்கள், அல்லது ஆசிரியரைக் கேளுங்கள்."],
  ["Start here", "මෙතැනින් අරඹන්න", "இங்கே தொடங்குங்கள்"],
  ["Choose your grade", "ඔබේ ශ්‍රේණිය තෝරන්න", "உங்கள் தரத்தைத் தேர்ந்தெடுங்கள்"],
  ["Loading grades…", "ශ්‍රේණි පූරණය වෙමින්…", "தரங்கள் ஏற்றப்படுகின்றன…"],
  ["Loading…", "පූරණය වෙමින්…", "ஏற்றப்படுகிறது…"],
  ["Requests and stars", "ඉල්ලීම් සහ තරු", "கோரிக்கைகளும் நட்சத்திரங்களும்"],
  ["See our teachers", "අපේ ගුරුවරු බලන්න", "எங்கள் ஆசிரியர்களைப் பாருங்கள்"],
  ["Questions and answers", "ප්‍රශ්න සහ පිළිතුරු", "கேள்விகளும் பதில்களும்"],
  ["Papers", "ප්‍රශ්න පත්‍ර", "வினாத்தாள்கள்"],
  ["Pick a grade below", "පහළින් ශ්‍රේණියක් තෝරන්න", "கீழே ஒரு தரத்தைத் தேர்ந்தெடுங்கள்"],
  ["Never share your phone number. The admin talks to the teacher for you.", "ඔබේ දුරකථන අංකය කිසිවිටෙක බෙදා නොගන්න. පරිපාලක ඔබ වෙනුවෙන් ගුරුවරයා සමඟ කතා කරයි.", "உங்கள் தொலைபேசி எண்ணை ஒருபோதும் பகிர வேண்டாம். நிர்வாகி உங்களுக்காக ஆசிரியருடன் பேசுவார்."],
  // subjects page
  ["All grades", "සියලු ශ්‍රේණි", "அனைத்து தரங்களும்"],
  ["Choose a subject.", "විෂයක් තෝරන්න.", "ஒரு பாடத்தைத் தேர்ந்தெடுங்கள்."],
  ["Get a teacher", "ගුරුවරයෙක් ලබාගන්න", "ஆசிரியரைப் பெறுங்கள்"],
  ["The admin finds a teacher for you", "පරිපාලක ඔබට ගුරුවරයෙක් සොයා දෙයි", "நிர்வாகி உங்களுக்கு ஆசிரியரைத் தேடித் தருவார்"],
  ["Papers and marking schemes", "ප්‍රශ්න පත්‍ර සහ ලකුණු දීමේ පටිපාටි", "வினாத்தாள்களும் புள்ளியிடல் திட்டங்களும்"],
  ["All", "සියල්ල", "அனைத்தும்"],
  ["All mediums", "සියලු මාධ්‍ය", "அனைத்து மொழிமூலங்களும்"],
  ["Nothing for this choice. Try \"All\".", "මෙම තේරීමට කිසිවක් නැත. \"සියල්ල\" උත්සාහ කරන්න.", "இந்தத் தேர்வுக்கு எதுவும் இல்லை. \"அனைத்தும்\" முயற்சிக்கவும்."],
  ["No subjects yet for this grade.", "මෙම ශ්‍රේණියට තවම විෂය නැත.", "இந்தத் தரத்திற்கு இன்னும் பாடங்கள் இல்லை."],
  // request form
  ["Tell us what you need", "ඔබට අවශ්‍ය දේ කියන්න", "உங்களுக்கு என்ன தேவை என்று சொல்லுங்கள்"],
  ["Your first name", "ඔබේ මුල් නම", "உங்கள் முதல் பெயர்"],
  ["What do you need help with?", "ඔබට උදව් අවශ්‍ය කුමකටද?", "உங்களுக்கு எதில் உதவி தேவை?"],
  ["Teacher you would like", "ඔබ කැමති ගුරුවරයා", "நீங்கள் விரும்பும் ஆசிரியர்"],
  ["(optional)", "(අවශ්‍ය නම් පමණක්)", "(விரும்பினால்)"],
  ["Any good teacher (admin chooses)", "ඕනෑම හොඳ ගුරුවරයෙක් (පරිපාලක තෝරයි)", "எந்த நல்ல ஆசிரியரும் (நிர்வாகி தேர்வு செய்வார்)"],
  ["Where do you want the lesson?", "පාඩම කොහේද අවශ්‍ය?", "பாடம் எங்கே வேண்டும்?"],
  ["Online", "ඔන්ලයින්", "இணையவழி"],
  ["phone or computer", "දුරකථනය හෝ පරිගණකය", "தொலைபேசி அல்லது கணினி"],
  ["At school", "පාසලේදී", "பாடசாலையில்"],
  ["in a classroom", "පන්ති කාමරයක", "வகுப்பறையில்"],
  ["When are you free?", "ඔබට නිදහස් කවදාද?", "நீங்கள் எப்போது ஓய்வாக இருப்பீர்கள்?"],
  ["Tap all the days and times that are OK.", "ඔබට හැකි සියලු දින සහ වේලාවන් ඔබන්න.", "உங்களுக்குப் பொருத்தமான அனைத்து நாட்களையும் நேரங்களையும் தட்டுங்கள்."],
  ["around 9 am", "පෙ.ව. 9 පමණ", "காலை 9 மணியளவில்"],
  ["around 2 pm", "ප.ව. 2 පමණ", "பிற்பகல் 2 மணியளவில்"],
  ["around 6 pm", "ප.ව. 6 පමණ", "மாலை 6 மணியளவில்"],
  ["Send my request", "මගේ ඉල්ලීම යවන්න", "என் கோரிக்கையை அனுப்பு"],
  ["Sending…", "යවමින්…", "அனுப்பப்படுகிறது…"],
  ["Please type your first name.", "කරුණාකර ඔබේ මුල් නම ලියන්න.", "தயவுசெய்து உங்கள் முதல் பெயரை எழுதுங்கள்."],
  ["Please tell us what you need help with.", "ඔබට උදව් අවශ්‍ය දේ කියන්න.", "உங்களுக்கு என்ன உதவி தேவை என்று சொல்லுங்கள்."],
  ["Please tap at least one day and one time.", "අවම වශයෙන් එක් දිනයක් සහ එක් වේලාවක් ඔබන්න.", "குறைந்தது ஒரு நாளையும் ஒரு நேரத்தையும் தட்டுங்கள்."],
  ["Please remove phone numbers, emails or app names. The admin will contact the teacher for you.", "දුරකථන අංක, ඊමේල් හෝ ඇප් නම් ඉවත් කරන්න. පරිපාලක ඔබ වෙනුවෙන් ගුරුවරයා අමතයි.", "தொலைபேசி எண்கள், மின்னஞ்சல்கள் அல்லது செயலிப் பெயர்களை நீக்குங்கள். நிர்வாகி உங்களுக்காக ஆசிரியரைத் தொடர்புகொள்வார்."],
  ["Could not send. Check your internet and try again.", "යැවිය නොහැකි විය. අන්තර්ජාලය පරීක්ෂා කර නැවත උත්සාහ කරන්න.", "அனுப்ப முடியவில்லை. இணையத்தைச் சரிபார்த்து மீண்டும் முயற்சிக்கவும்."],
  // sent + my lessons
  ["Sent", "යවා ඇත", "அனுப்பப்பட்டது"],
  ["Done! Your request was sent.", "හරි! ඔබේ ඉල්ලීම යැව්වා.", "முடிந்தது! உங்கள் கோரிக்கை அனுப்பப்பட்டது."],
  ["Your request number is", "ඔබේ ඉල්ලීම් අංකය", "உங்கள் கோரிக்கை எண்"],
  ["The admin got an alert. They will choose a teacher and book a day for you. Check", "පරිපාලකට දැනුම්දීමක් ලැබුණා. ඔවුන් ගුරුවරයෙක් තෝරා ඔබට දිනයක් වෙන් කරයි. බලන්න:", "நிர்வாகிக்கு அறிவிப்பு கிடைத்தது. அவர் ஆசிரியரைத் தேர்ந்தெடுத்து உங்களுக்கு ஒரு நாளை முன்பதிவு செய்வார். பாருங்கள்:"],
  ["See my lessons", "මගේ පාඩම් බලන්න", "என் பாடங்களைப் பாருங்கள்"],
  ["Back to home", "මුල් පිටුවට", "முகப்புக்குத் திரும்பு"],
  ["My requests and lessons", "මගේ ඉල්ලීම් සහ පාඩම්", "என் கோரிக்கைகளும் பாடங்களும்"],
  ["From your account.", "ඔබේ ගිණුමෙන්.", "உங்கள் கணக்கிலிருந்து."],
  ["You have not asked for a teacher yet.", "ඔබ තවම ගුරුවරයෙක් ඉල්ලා නැත.", "நீங்கள் இன்னும் ஆசிரியரைக் கேட்கவில்லை."],
  ["Choose a grade", "ශ්‍රේණියක් තෝරන්න", "ஒரு தரத்தைத் தேர்ந்தெடுங்கள்"],
  ["Choosing a teacher", "ගුරුවරයෙක් තෝරමින්", "ஆசிரியர் தேர்வு நடைபெறுகிறது"],
  ["Lesson booked", "පාඩම වෙන් කළා", "பாடம் முன்பதிவு செய்யப்பட்டது"],
  ["Finished", "අවසන්", "முடிந்தது"],
  ["No.", "අංකය", "எண்"],
  ["Your teacher:", "ඔබේ ගුරුවරයා:", "உங்கள் ஆசிரியர்:"],
  ["Lesson on", "පාඩම:", "பாடம்:"],
  [". The admin will send the lesson link or room number before it starts.", ". පාඩම පටන් ගැනීමට පෙර පරිපාලක සබැඳිය හෝ කාමර අංකය එවයි.", ". பாடம் தொடங்கும் முன் நிர்வாகி இணைப்பையோ அறை எண்ணையோ அனுப்புவார்."],
  ["How was your lesson?", "ඔබේ පාඩම කොහොමද?", "உங்கள் பாடம் எப்படி இருந்தது?"],
  ["Anything to say?", "කියන්න දෙයක් තිබේද?", "ஏதாவது சொல்ல வேண்டுமா?"],
  ["Send stars", "තරු යවන්න", "நட்சத்திரங்களை அனுப்பு"],
  ["You gave", "ඔබ දුන්නා", "நீங்கள் கொடுத்தது"],
  ["Thank you! Your stars were sent.", "ස්තූතියි! ඔබේ තරු යැව්වා.", "நன்றி! உங்கள் நட்சத்திரங்கள் அனுப்பப்பட்டன."],
  ["Log in first", "පළමුව ඇතුල් වන්න", "முதலில் உள்நுழையுங்கள்"],
  ["Log in with Google or your email to ask for a teacher. It takes one minute.", "ගුරුවරයෙක් ඉල්ලීමට Google හෝ ඔබේ ඊමේල් මගින් ඇතුල් වන්න. විනාඩියක් ගතවේ.", "ஆசிரியரைக் கேட்க Google அல்லது உங்கள் மின்னஞ்சல் மூலம் உள்நுழையுங்கள். ஒரு நிமிடம் ஆகும்."],
  ["Log in with Google or your email to see your lessons. It takes one minute.", "ඔබේ පාඩම් බැලීමට Google හෝ ඔබේ ඊමේල් මගින් ඇතුල් වන්න. විනාඩියක් ගතවේ.", "உங்கள் பாடங்களைப் பார்க்க Google அல்லது உங்கள் மின்னஞ்சல் மூலம் உள்நுழையுங்கள். ஒரு நிமிடம் ஆகும்."],
  ["Log in or create account", "ඇතුල් වන්න හෝ ගිණුමක් සාදන්න", "உள்நுழையுங்கள் அல்லது கணக்கை உருவாக்குங்கள்"],
  ["Confirm your email", "ඔබේ ඊමේල් තහවුරු කරන්න", "உங்கள் மின்னஞ்சலை உறுதிப்படுத்துங்கள்"],
  ["We sent a link to", "අපි සබැඳියක් එව්වා:", "இணைப்பை அனுப்பினோம்:"],
  [". Open it to ask for a teacher.", ". ගුරුවරයෙක් ඉල්ලීමට එය විවෘත කරන්න.", ". ஆசிரியரைக் கேட்க அதைத் திறக்கவும்."],
  [". Open it to see your lessons.", ". ඔබේ පාඩම් බැලීමට එය විවෘත කරන්න.", ". உங்கள் பாடங்களைப் பார்க்க அதைத் திறக்கவும்."],
  ["I confirmed it / send again", "තහවුරු කළා / නැවත යවන්න", "உறுதிப்படுத்தினேன் / மீண்டும் அனுப்பு"],
  ["just now", "දැන්", "இப்போது"],
  // teachers page
  ["Checked by the admin", "පරිපාලක විසින් පරීක්ෂා කළ", "நிர்வாகியால் சரிபார்க்கப்பட்டது"],
  ["Our", "අපේ", "எங்கள்"],
  ["Tap a subject under a teacher to ask for a lesson with them. The admin arranges everything.", "ගුරුවරයෙකු යටතේ ඇති විෂයක් ඔබා ඔවුන් සමඟ පාඩමක් ඉල්ලන්න. සියල්ල පරිපාලක සංවිධානය කරයි.", "ஆசிரியரின் கீழுள்ள பாடத்தைத் தட்டி அவருடன் பாடம் கேளுங்கள். அனைத்தையும் நிர்வாகி ஏற்பாடு செய்வார்."],
  ["Find a teacher or subject", "ගුරුවරයෙක් හෝ විෂයක් සොයන්න", "ஆசிரியர் அல்லது பாடத்தைத் தேடுங்கள்"],
  ["e.g. Physics or Perera", "උදා: භෞතික විද්‍යාව හෝ පෙරේරා", "எ.கா. பௌதிகவியல் அல்லது பெரேரா"],
  ["Loading teachers…", "ගුරුවරු පූරණය වෙමින්…", "ஆசிரியர்கள் ஏற்றப்படுகின்றனர்…"],
  ["New teacher", "නව ගුරුවරයා", "புதிய ஆசிரியர்"],
  ["Ask for a lesson in:", "පාඩමක් ඉල්ලන්න:", "பாடம் கேட்க:"],
  ["No teachers found.", "ගුරුවරු හමු නොවීය.", "ஆசிரியர்கள் இல்லை."],
  ["No subjects yet", "තවම විෂය නැත", "இன்னும் பாடங்கள் இல்லை"],
  ["Teachers' phone numbers are private. Ask for a lesson and the admin will arrange it.", "ගුරුවරුන්ගේ දුරකථන අංක පෞද්ගලිකයි. පාඩමක් ඉල්ලන්න, පරිපාලක එය සංවිධානය කරයි.", "ஆசிரியர்களின் தொலைபேசி எண்கள் தனிப்பட்டவை. பாடம் கேளுங்கள், நிர்வாகி ஏற்பாடு செய்வார்."],
  // forum
  ["Forum", "සංසදය", "மன்றம்"],
  ["Ask the", "පන්තියෙන්", "வகுப்பிடம்"],
  ["class", "අහන්න", "கேளுங்கள்"],
  ["Post a school question. Other students can answer. Be kind, and never post your phone number.", "පාසල් ප්‍රශ්නයක් පළ කරන්න. වෙනත් සිසුන්ට පිළිතුරු දිය හැක. කාරුණික වන්න, ඔබේ දුරකථන අංකය කිසිදා පළ නොකරන්න.", "பாடசாலைக் கேள்வியைப் பதிவிடுங்கள். மற்ற மாணவர்கள் பதிலளிக்கலாம். அன்பாக இருங்கள், உங்கள் தொலைபேசி எண்ணை ஒருபோதும் பதிவிடாதீர்கள்."],
  ["Ask a question", "ප්‍රශ්නයක් අහන්න", "கேள்வி கேளுங்கள்"],
  ["Grade", "ශ්‍රේණිය", "தரம்"],
  ["Subject", "විෂය", "பாடம்"],
  ["Your question", "ඔබේ ප්‍රශ්නය", "உங்கள் கேள்வி"],
  ["e.g. What is photosynthesis?", "උදා: ප්‍රභාසංස්ලේෂණය යනු කුමක්ද?", "எ.கா. ஒளித்தொகுப்பு என்றால் என்ன?"],
  ["More details", "වැඩි විස්තර", "மேலும் விவரங்கள்"],
  ["Post question", "ප්‍රශ්නය පළ කරන්න", "கேள்வியைப் பதிவிடு"],
  ["Cancel", "අවලංගු කරන්න", "ரத்து செய்"],
  ["Questions", "ප්‍රශ්න", "கேள்விகள்"],
  ["Everyone", "සියලු දෙනා", "அனைவரும்"],
  ["Hide answers", "පිළිතුරු සඟවන්න", "பதில்களை மறை"],
  ["Your name", "ඔබේ නම", "உங்கள் பெயர்"],
  ["Your answer", "ඔබේ පිළිතුර", "உங்கள் பதில்"],
  ["Explain it simply", "සරලව පැහැදිලි කරන්න", "எளிமையாக விளக்குங்கள்"],
  ["Post answer", "පිළිතුර පළ කරන්න", "பதிலைப் பதிவிடு"],
  ["Your question is posted!", "ඔබේ ප්‍රශ්නය පළ කළා!", "உங்கள் கேள்வி பதிவிடப்பட்டது!"],
  ["Thanks for helping!", "උදව් කළාට ස්තූතියි!", "உதவியதற்கு நன்றி!"],
  ["No questions here yet. Be the first to ask!", "මෙහි තවම ප්‍රශ්න නැත. පළමුවැන්නා වන්න!", "இங்கே இன்னும் கேள்விகள் இல்லை. முதலில் கேளுங்கள்!"],
  ["Please type your question.", "කරුණාකර ඔබේ ප්‍රශ්නය ලියන්න.", "தயவுசெய்து உங்கள் கேள்வியை எழுதுங்கள்."],
  ["Please choose a grade and subject.", "ශ්‍රේණියක් සහ විෂයක් තෝරන්න.", "தரத்தையும் பாடத்தையும் தேர்ந்தெடுங்கள்."],
  ["Please type your name.", "කරුණාකර ඔබේ නම ලියන්න.", "தயவுசெய்து உங்கள் பெயரை எழுதுங்கள்."],
  ["Please type your answer.", "කරුණාකර ඔබේ පිළිතුර ලියන්න.", "தயவுசெய்து உங்கள் பதிலை எழுதுங்கள்."],
  ["Please remove phone numbers, emails or app names. Posts must stay inside TND Guides.", "දුරකථන අංක, ඊමේල් හෝ ඇප් නම් ඉවත් කරන්න. පළ කිරීම් TND Guides තුළම තිබිය යුතුය.", "தொலைபேசி எண்கள், மின்னஞ்சல்கள் அல்லது செயலிப் பெயர்களை நீக்குங்கள். பதிவுகள் TND Guides உள்ளேயே இருக்க வேண்டும்."],
  ["Please remove phone numbers, emails or app names.", "දුරකථන අංක, ඊමේල් හෝ ඇප් නම් ඉවත් කරන්න.", "தொலைபேசி எண்கள், மின்னஞ்சல்கள் அல்லது செயலிப் பெயர்களை நீக்குங்கள்."],
  ["Could not post. Check your internet and try again.", "පළ කළ නොහැකි විය. අන්තර්ජාලය පරීක්ෂා කර නැවත උත්සාහ කරන්න.", "பதிவிட முடியவில்லை. இணையத்தைச் சரிபார்த்து மீண்டும் முயற்சிக்கவும்."],
  ["Could not post. Try again.", "පළ කළ නොහැකි විය. නැවත උත්සාහ කරන්න.", "பதிவிட முடியவில்லை. மீண்டும் முயற்சிக்கவும்."],
  ["Need a private teacher? Choose your grade on the", "පෞද්ගලික ගුරුවරයෙක් අවශ්‍යද? ඔබේ ශ්‍රේණිය තෝරන්න:", "தனிப்பட்ட ஆசிரியர் வேண்டுமா? உங்கள் தரத்தைத் தேர்ந்தெடுங்கள்:"],
  ["home page", "මුල් පිටුව", "முகப்புப் பக்கம்"],
  [". The admin will arrange it.", ". පරිපාලක එය සංවිධානය කරයි.", ". நிர்வாகி ஏற்பாடு செய்வார்."],
  // login
  ["Create account", "ගිණුමක් සාදන්න", "கணக்கை உருவாக்கு"],
  ["Continue with Google", "Google සමඟ ඉදිරියට", "Google மூலம் தொடரவும்"],
  ["or use your email", "නැත්නම් ඔබේ ඊමේල් භාවිතා කරන්න", "அல்லது உங்கள் மின்னஞ்சலைப் பயன்படுத்துங்கள்"],
  ["Email", "ඊමේල්", "மின்னஞ்சல்"],
  ["Password", "මුරපදය", "கடவுச்சொல்"],
  ["Show", "පෙන්වන්න", "காட்டு"],
  ["Hide", "සඟවන්න", "மறை"],
  ["Type the password again", "මුරපදය නැවත ලියන්න", "கடவுச்சொல்லை மீண்டும் எழுதுங்கள்"],
  ["At least 6 letters or numbers.", "අවම වශයෙන් අකුරු හෝ ඉලක්කම් 6ක්.", "குறைந்தது 6 எழுத்துகள் அல்லது எண்கள்."],
  ["Forgot password?", "මුරපදය අමතකද?", "கடவுச்சொல் மறந்துவிட்டதா?"],
  ["Forgot your password?", "ඔබේ මුරපදය අමතකද?", "உங்கள் கடவுச்சொல் மறந்துவிட்டதா?"],
  ["Type your email. We will send you a link to make a new password.", "ඔබේ ඊමේල් ලියන්න. නව මුරපදයක් සෑදීමට අපි සබැඳියක් එවන්නෙමු.", "உங்கள் மின்னஞ்சலை எழுதுங்கள். புதிய கடவுச்சொல்லை உருவாக்க இணைப்பை அனுப்புவோம்."],
  ["Send reset link", "යළි සැකසීමේ සබැඳිය යවන්න", "மீட்டமைப்பு இணைப்பை அனுப்பு"],
  ["Back to log in", "ඇතුල්වීමට ආපසු", "உள்நுழைவுக்குத் திரும்பு"],
  ["Check your email", "ඔබේ ඊමේල් බලන්න", "உங்கள் மின்னஞ்சலைப் பாருங்கள்"],
  ["We sent a confirm link to", "අපි තහවුරු කිරීමේ සබැඳියක් එව්වා:", "உறுதிப்படுத்தும் இணைப்பை அனுப்பினோம்:"],
  [". Open it, then come back and press the button below.", ". එය විවෘත කර, ආපසු පැමිණ පහත බොත්තම ඔබන්න.", ". அதைத் திறந்து, திரும்பி வந்து கீழே உள்ள பொத்தானை அழுத்துங்கள்."],
  ["Can't find it? Look in the Spam or Promotions folder.", "හමු නොවුණාද? Spam හෝ Promotions ෆෝල්ඩරය බලන්න.", "கிடைக்கவில்லையா? Spam அல்லது Promotions கோப்புறையைப் பாருங்கள்."],
  ["I confirmed my email", "මම ඊමේල් තහවුරු කළා", "என் மின்னஞ்சலை உறுதிப்படுத்தினேன்"],
  ["Send the email again", "ඊමේල් නැවත යවන්න", "மின்னஞ்சலை மீண்டும் அனுப்பு"],
  ["Demo: confirm now", "ආදර්ශ: දැන් තහවුරු කරන්න", "மாதிரி: இப்போது உறுதிப்படுத்து"],
  ["Use another account", "වෙනත් ගිණුමක් භාවිතා කරන්න", "வேறு கணக்கைப் பயன்படுத்து"],
  ["You are logged in.", "ඔබ ඇතුල් වී ඇත.", "நீங்கள் உள்நுழைந்துள்ளீர்கள்."],
  ["Continue", "ඉදිරියට", "தொடரவும்"],
  ["Log out", "ඉවත් වන්න", "வெளியேறு"],
  ["Open admin", "පරිපාලක විවෘත කරන්න", "நிர்வாகியைத் திற"],
  ["TND Guides keeps your email private. Teachers never see it.", "TND Guides ඔබේ ඊමේල් රහසිගතව තබයි. ගුරුවරුන්ට එය නොපෙනේ.", "TND Guides உங்கள் மின்னஞ்சலைத் தனிப்பட்டதாக வைத்திருக்கும். ஆசிரியர்கள் அதைப் பார்க்க மாட்டார்கள்."],
  ["Logging in…", "ඇතුල් වෙමින්…", "உள்நுழைகிறது…"],
  ["Creating…", "සාදමින්…", "உருவாக்கப்படுகிறது…"],
  ["Please type your email address.", "කරුණාකර ඔබේ ඊමේල් ලිපිනය ලියන්න.", "தயவுசெய்து உங்கள் மின்னஞ்சல் முகவரியை எழுதுங்கள்."],
  ["Please type your password.", "කරුණාකර ඔබේ මුරපදය ලියන්න.", "தயவுசெய்து உங்கள் கடவுச்சொல்லை எழுதுங்கள்."],
  ["The password needs at least 6 letters or numbers.", "මුරපදයට අවම වශයෙන් අකුරු හෝ ඉලක්කම් 6ක් අවශ්‍යයි.", "கடவுச்சொல்லுக்குக் குறைந்தது 6 எழுத்துகள் அல்லது எண்கள் தேவை."],
  ["The two passwords are not the same.", "මුරපද දෙක සමාන නැත.", "இரண்டு கடவுச்சொற்களும் ஒன்றாக இல்லை."],
  ["Not confirmed yet. Open the link in the email first.", "තවම තහවුරු කර නැත. පළමුව ඊමේල් එකේ සබැඳිය විවෘත කරන්න.", "இன்னும் உறுதிப்படுத்தப்படவில்லை. முதலில் மின்னஞ்சலில் உள்ள இணைப்பைத் திறக்கவும்."],
  ["Sent again. Check your email.", "නැවත යැව්වා. ඔබේ ඊමේල් බලන්න.", "மீண்டும் அனுப்பப்பட்டது. உங்கள் மின்னஞ்சலைப் பாருங்கள்."],
  ["If", "මෙම ලිපිනයට", "இந்த முகவரிக்கு"],
  ["has an account, a reset link is on its way. Check your email (and the Spam folder).", "ගිණුමක් තිබේ නම්, යළි සැකසීමේ සබැඳියක් එවනු ඇත. ඔබේ ඊමේල් (සහ Spam ෆෝල්ඩරය) බලන්න.", "கணக்கு இருந்தால், மீட்டமைப்பு இணைப்பு அனுப்பப்படும். உங்கள் மின்னஞ்சலைப் (Spam கோப்புறையையும்) பாருங்கள்."],
  ["Wrong email or password.", "ඊමේල් හෝ මුරපදය වැරදියි.", "மின்னஞ்சல் அல்லது கடவுச்சொல் தவறு."],
  ["That email address doesn't look right.", "එම ඊමේල් ලිපිනය නිවැරදි නැති බව පෙනේ.", "அந்த மின்னஞ்சல் முகவரி சரியாகத் தெரியவில்லை."],
  ["This email already has an account. Choose Log in instead.", "මෙම ඊමේල් එකට දැනටමත් ගිණුමක් ඇත. \"ඇතුල් වන්න\" තෝරන්න.", "இந்த மின்னஞ்சலுக்கு ஏற்கனவே கணக்கு உள்ளது. \"உள்நுழை\" என்பதைத் தேர்ந்தெடுங்கள்."],
  ["Too many tries. Wait a few minutes and try again.", "උත්සාහයන් වැඩියි. විනාඩි කිහිපයක් රැඳී නැවත උත්සාහ කරන්න.", "அதிக முயற்சிகள். சில நிமிடங்கள் காத்திருந்து மீண்டும் முயற்சிக்கவும்."],
  ["No internet connection. Check it and try again.", "අන්තර්ජාල සම්බන්ධතාවක් නැත. පරීක්ෂා කර නැවත උත්සාහ කරන්න.", "இணைய இணைப்பு இல்லை. சரிபார்த்து மீண்டும் முயற்சிக்கவும்."],
  ["The Google window was closed. Try again.", "Google කවුළුව වැසුණා. නැවත උත්සාහ කරන්න.", "Google சாளரம் மூடப்பட்டது. மீண்டும் முயற்சிக்கவும்."],
  ["Something went wrong. Please try again.", "යමක් වැරදුණා. කරුණාකර නැවත උත්සාහ කරන්න.", "ஏதோ தவறு நடந்தது. மீண்டும் முயற்சிக்கவும்."],
  ["e.g. Nimali", "උදා: නිමාලි", "எ.கா. நிமாலி"],
  ["e.g. Nimali Perera", "උදා: නිමාලි පෙරේරා", "எ.கா. நிமாலி பெரேரா"],
  ["e.g. I don't understand fractions.", "උදා: මට භාග තේරෙන්නේ නැහැ.", "எ.கா. எனக்குப் பின்னங்கள் புரியவில்லை."],
  ["e.g. The teacher explained well.", "උදා: ගුරුවරයා හොඳින් පැහැදිලි කළා.", "எ.கா. ஆசிரியர் நன்றாக விளக்கினார்."]
];

const TABLE = { si: { ...WORDS.si }, ta: { ...WORDS.ta } };
LINES.forEach(([en, si, ta]) => { TABLE.si[en] = si; TABLE.ta[en] = ta; });

const UNIT = {
  si: { grade: n => `${n} ශ්‍රේණිය`, subjects: n => `විෂය ${n}`, papers: n => `ප්‍රශ්න පත්‍ර ${n}`, lessons: n => `පාඩම් ${n}`, years: n => `වසර ${n}`,
        reviews: n => `(සමාලෝචන ${n})`, answers: n => `පිළිතුරු ${n} · පිළිතුරු දෙන්න`, min: n => `මිනිත්තු ${n}කට පෙර`, hours: n => `පැය ${n}කට පෙර`,
        days: n => `දින ${n}කට පෙර`, medium: m => `${m} මාධ්‍ය`, nopapers: s => `${s} සඳහා තවම ප්‍රශ්න පත්‍ර නැත. පරිපාලක නිතර නව ප්‍රශ්න පත්‍ර එක් කරයි.` },
  ta: { grade: n => `தரம் ${n}`, subjects: n => `${n} பாடங்கள்`, papers: n => `${n} வினாத்தாள்கள்`, lessons: n => `${n} பாடங்கள்`, years: n => `${n} ஆண்டுகள்`,
        reviews: n => `(${n} மதிப்புரைகள்)`, answers: n => `${n} பதில்கள் · பதிலளி`, min: n => `${n} நிமிடங்களுக்கு முன்`, hours: n => `${n} மணிநேரத்திற்கு முன்`,
        days: n => `${n} நாட்களுக்கு முன்`, medium: m => `${m} மொழிமூலம்`, nopapers: s => `${s} பாடத்திற்கு இன்னும் வினாத்தாள்கள் இல்லை. நிர்வாகி அடிக்கடி புதியவற்றைச் சேர்ப்பார்.` }
};
const PATTERNS = [
  [/^Grade (\d+)$/, (m, u) => u.grade(m[1])],
  [/^(\d+) subjects?$/, (m, u) => u.subjects(m[1])],
  [/^(\d+) subjects · edit$/, (m, u) => u.subjects(m[1])],
  [/^(\d+) papers?$/, (m, u) => u.papers(m[1])],
  [/^(\d+) lessons?$/, (m, u) => u.lessons(m[1])],
  [/^(\d+) years?$/, (m, u) => u.years(m[1])],
  [/^\((\d+) reviews?\)$/, (m, u) => u.reviews(m[1])],
  [/^(\d+) answers? · Answer$/, (m, u) => u.answers(m[1])],
  [/^(\d+) min ago$/, (m, u) => u.min(m[1])],
  [/^(\d+) hours ago$/, (m, u) => u.hours(m[1])],
  [/^(\d+) days ago$/, (m, u) => u.days(m[1])],
  [/^(Sinhala|English|Tamil) medium$/, (m, u) => u.medium(tr(m[1]))],
  [/^No papers for (.+) yet\. The admin adds new papers often\.$/, (m, u) => u.nopapers(tr(m[1]))]
];

/* Translate one piece of English text into the current language */
export function tr(text) {
  if (lang === "en" || !text) return text;
  const t = TABLE[lang];
  if (Object.prototype.hasOwnProperty.call(t, text)) return t[text];
  for (const [re, fn] of PATTERNS) { const m = text.match(re); if (m) return fn(m, UNIT[lang]); }
  if (text.includes(" · ")) {
    const parts = text.split(" · ");
    const out = parts.map(p => tr(p));
    if (out.some((p, i) => p !== parts[i])) return out.join(" · ");
  }
  return text;
}

/* ---------- Translate the page, and anything added to it later ---------- */
const original = new WeakMap();
const SKIP = new Set(["SCRIPT", "STYLE", "TEXTAREA", "NOSCRIPT", "SVG"]);
const ATTRS = ["placeholder", "aria-label", "title"];

function doText(node) {
  let en = original.get(node);
  if (en === undefined) { en = node.nodeValue; original.set(node, en); }
  const core = en.trim();
  if (!core) return;
  const out = tr(core);
  const want = out === core ? en : en.replace(core, out);
  if (node.nodeValue !== want) node.nodeValue = want;
}
function doAttrs(el) {
  for (const a of ATTRS) {
    if (!el.hasAttribute(a)) continue;
    const key = "data-en-" + a;
    if (!el.hasAttribute(key)) el.setAttribute(key, el.getAttribute(a));
    el.setAttribute(a, tr(el.getAttribute(key)));
  }
}
function walk(root) {
  if (root.nodeType === 3) { if (!skip(root.parentElement)) doText(root); return; }
  if (root.nodeType !== 1 || skip(root)) return;
  doAttrs(root);
  const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT, {
    acceptNode: n => (n.nodeType === 1 ? (skip(n) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_SKIP) : NodeFilter.FILTER_ACCEPT)
  });
  root.querySelectorAll("[placeholder],[aria-label],[title]").forEach(el => { if (!skip(el)) doAttrs(el); });
  let n; while ((n = w.nextNode())) doText(n);
}
function skip(el) { return !el || SKIP.has(el.tagName) || SKIP.has((el.tagName || "").toUpperCase()) || el.closest("[data-notr],svg"); }

function applyAll() {
  document.documentElement.lang = lang;
  walk(document.body);
  document.querySelectorAll(".lang button").forEach(b => b.classList.toggle("on", b.dataset.lang === lang));
}

let observer = null;
export function startTranslation() {
  applyAll();
  if (observer) return;
  observer = new MutationObserver(list => {
    for (const m of list) m.addedNodes.forEach(n => walk(n));
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

/* Language buttons in the top bar: EN · සිං · த */
export function langSwitch() {
  const bar = document.querySelector(".topbar .wrap");
  if (!bar || bar.querySelector(".lang")) return;
  const box = document.createElement("div");
  box.className = "lang"; box.setAttribute("role", "group"); box.setAttribute("aria-label", "Language");
  box.setAttribute("data-notr", "");
  box.innerHTML = LANGS.map(([code, label]) => `<button type="button" data-lang="${code}" lang="${code}" class="${code === lang ? "on" : ""}">${label}</button>`).join("");
  bar.appendChild(box);
  box.addEventListener("click", e => {
    const b = e.target.closest("[data-lang]"); if (!b) return;
    lang = b.dataset.lang;
    try { localStorage.setItem("guruhub_lang", lang); } catch (er) { /* ignore */ }
    applyAll();
  });
}
