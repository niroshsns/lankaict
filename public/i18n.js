// Interface copy is authored locally; question translations are separate JSON data.
const si = {
  'Toggle navigation':'සංචාලන මෙනුව විවෘත කරන්න','Main navigation':'ප්‍රධාන සංචාලනය','Question filters':'ප්‍රශ්න පෙරහන්','Session mode':'පුහුණු ක්‍රමය','Current question':'වත්මන් ප්‍රශ්නය','Question figure':'ප්‍රශ්නයේ රූප සටහන','Skip to content':'අන්තර්ගතයට යන්න',
  'questions available':'ප්‍රශ්න තිබේ','question available':'ප්‍රශ්නයක් තිබේ',
  'Questions answered':'පිළිතුරු දුන් ප්‍රශ්න','Independently solved; not an official marking key':'ස්වාධීනව විසඳා ඇත; නිල ලකුණු පත්‍රයක් නොවේ',
  'Practice':'පුහුණුව','Question bank':'ප්‍රශ්න බැංකුව','Saved questions':'සුරැකි ප්‍රශ්න','My progress':'මගේ ප්‍රගතිය','Source papers':'මුල් ප්‍රශ්න පත්‍ර','ICT glossary':'ICT පාරිභාෂික පද',
  'YOUR WORKSPACE':'ඔබේ අධ්‍යයන අවකාශය','LEARN. PRACTISE. PROGRESS.':'ඉගෙන ගන්න. පුහුණු වන්න. ඉදිරියට යන්න.',
  'A little, every day.':'සෑම දිනකම මඳක්.','Every question is a step towards feeling ready.':'සෑම ප්‍රශ්නයක්ම විභාගයට සූදානම් වීමට තවත් පියවරකි.',
  'See your progress':'ඔබේ ප්‍රගතිය බලන්න','Made for Sri Lankan':'ශ්‍රී ලාංකික සිසුන් සඳහා','A/L ICT students':'උ/පෙළ ICT සිසුන්',
  'G.C.E. Advanced Level':'අ.පො.ස. උසස් පෙළ','Information & Communication Technology':'තොරතුරු හා සන්නිවේදන තාක්ෂණය',
  'English medium':'ඉංග්‍රීසි මාධ්‍යය','Sinhala study translation':'සිංහල අධ්‍යයන පරිවර්තනය','Language':'භාෂාව',
  'A LITTLE PRACTICE. A LOT OF PROGRESS.':'දිනපතා පුහුණුවෙන් ඉදිරියට.','Small steps.':'කුඩා පියවර.','Stronger answers.':'සාර්ථක පිළිතුරු.',
  'Your A/L ICT revision, all in one place. Pick a topic, find your rhythm,':'උ/පෙළ ICT පුනරීක්ෂණය එකම තැනකින්. මාතෘකාවක් තෝරන්න,',
  'and turn what you know into confidence.':'ඔබේ දැනුම වර්ධනය කර ගන්න.',
  'past paper questions':'පසුගිය විභාග ප්‍රශ්න','extra practice questions':'අමතර පුහුණු ප්‍රශ්න','topic areas to explore':'විෂය ක්ෂේත්‍ර',
  'Make this session yours':'ඔබේ පුහුණුව සකස් කරන්න','Find your next question':'ප්‍රශ්නයක් සොයන්න','Paper year':'ප්‍රශ්න පත්‍ර වර්ෂය','All years':'සියලු වර්ෂ',
  'Topic area':'විෂය ක්ෂේත්‍රය','All topic areas':'සියලු විෂය ක්ෂේත්‍ර','Question source':'ප්‍රශ්න මූලාශ්‍රය','All questions':'සියලු ප්‍රශ්න','Past papers':'පසුගිය ප්‍රශ්න පත්‍ර','Extra practice':'අමතර පුහුණුව',
  'Session length':'ප්‍රශ්න ගණන','All matching':'ගැළපෙන සියල්ල','Search questions':'ප්‍රශ්න සොයන්න','Keyword, concept or question ID…':'පදයක්, සංකල්පයක් හෝ ප්‍රශ්න අංකයක්…',
  'Timed test':'කාල සීමා පරීක්ෂණය','Shuffle questions':'ප්‍රශ්න අහඹු පිළිවෙළට','Start new session':'නව පුහුණුවක් අරඹන්න',
  'Your practice space':'ඔබේ පුහුණු අවකාශය','Learn as you go. No pressure.':'ඔබේ වේගයෙන් ඉගෙන ගන්න.','Answers revealed when you finish':'අවසන් කළ පසු පිළිතුරු පෙන්වයි',
  'Your next step starts here':'ඔබේ ඊළඟ පියවර මෙතැනින්','Choose your filters and start a session.':'අවශ්‍ය තේරීම් සකසා පුහුණුව අරඹන්න.',
  'A FOCUSED LITTLE SESSION':'තෝරාගත් මාතෘකාවකින් පුහුණුව','Explore by topic':'මාතෘකාව අනුව සොයන්න','View question bank':'ප්‍රශ්න බැංකුව බලන්න',
  'Save question':'ප්‍රශ්නය සුරකින්න','Saved':'සුරකින ලදී','Additional practice':'අමතර පුහුණුව','Choose one answer':'එක් පිළිතුරක් තෝරන්න',
  'Needs review · not graded':'සමාලෝචනය අවශ්‍යයි · ලකුණු නොදේ','Needs review':'සමාලෝචනය අවශ්‍යයි',
  'This answer needs a teacher’s review':'මෙම පිළිතුර ගුරුවරයෙකු විසින් සමාලෝචනය කළ යුතුය','That’s right. Nicely done!':'නිවැරදියි. ඉතා හොඳයි!',
  'Official answer':'නිල පිළිතුර','Worked answer':'විසඳා ලබාගත් පිළිතුර','Practice answer':'පුහුණු ප්‍රශ්නයේ පිළිතුර','Answer needs review':'පිළිතුර සමාලෝචනය කළ යුතුය',
  '· Independently solved; not an official marking key':'· ස්වාධීනව විසඳා ඇත; නිල ලකුණු ක්‍රමයක් නොවේ',
  'Previous':'පෙර','Next':'ඊළඟ','Skip for now':'දැනට මඟ හරින්න','Check answer':'පිළිතුර පරීක්ෂා කරන්න','Next question':'ඊළඟ ප්‍රශ්නය','Finish session':'පුහුණුව අවසන් කරන්න',
  'Tip: use keys 1–5 to select an answer, then Enter to check.':'1–5 යතුරු මඟින් පිළිතුර තෝරා Enter ඔබා පරීක්ෂා කරන්න.',
  'You can change any answer until you finish.':'අවසන් කරන තෙක් ඕනෑම පිළිතුරක් වෙනස් කළ හැක.',
  'View original':'මුල් ස්කෑන් පිටපත','English original':'මුල් ඉංග්‍රීසි පෙළ','Key ICT terms':'අදාළ ICT පද','Selected glossary terms':'තෝරාගත් පාරිභාෂික පද',
  'Study translation · compare with the English original.':'අධ්‍යයන පරිවර්තනයකි · මුල් ඉංග්‍රීසි පෙළ සමඟ සසඳන්න.',
  'Translation not yet available. The English text is shown.':'පරිවර්තනය තවම නොමැත. මුල් ඉංග්‍රීසි පෙළ පෙන්වයි.',
  'This session':'මෙම පුහුණුව','PRACTICE':'පුහුණුව','TIMED':'කාල සීමාවක් සහිතයි','Current':'වත්මන්','Answered':'පිළිතුරු දුන්','To do':'ඉතිරි',
  'Time remaining':'ඉතිරි කාලය','Time in this session':'ගත වූ කාලය','Take your time. Your answers are saved as you go.':'ඔබේ පිළිතුරු ස්වයංක්‍රීයව සුරැකේ.',
  '2 min 24 sec per question. Your test finishes when time runs out.':'ප්‍රශ්නයකට මිනිත්තු 2 තත්පර 24කි. කාලය අවසන් වූ විට පරීක්ෂණය අවසන් වේ.',
  'KEEP THE GOOD QUESTIONS CLOSE':'නැවත පුහුණුව සඳහා සුරකින්න','YOUR REVISION LIBRARY':'ඔබේ පුනරීක්ෂණ එකතුව','The question bank':'ප්‍රශ්න බැංකුව',
  'Come back to the questions you want to spend a little more time with.':'තවත් කාලයක් යොදවා පුහුණු වීමට අවශ්‍ය ප්‍රශ්න නැවත බලන්න.',
  'Three past papers. More ways to practise. Find a question and make it click.':'පසුගිය ප්‍රශ්න පත්‍ර තුනකින් සහ අමතර ප්‍රශ්නවලින් පුහුණු වන්න.',
  'Practise these':'මේවායින් පුහුණු වන්න','Practise question':'මෙම ප්‍රශ්නයෙන් පුහුණු වන්න','5 answer choices':'පිළිතුරු විකල්ප 5කි','· Includes a figure':'· රූප සටහනක් ඇත',
  'A place for your tricky questions':'නැවත බැලීමට අවශ්‍ය ප්‍රශ්න සඳහා','No questions found':'ප්‍රශ්න හමු නොවීය',
  'Save a question with the bookmark button and find it here.':'සුරැකුම් බොත්තම මඟින් සුරැකි ප්‍රශ්න මෙතැනින් බලන්න.',
  'Try a different year, topic or search term.':'වෙනත් වර්ෂයක්, මාතෘකාවක් හෝ සෙවුම් පදයක් උත්සාහ කරන්න.','Browse question bank':'ප්‍රශ්න බැංකුව බලන්න','Clear filters':'තේරීම් ඉවත් කරන්න',
  'ANOTHER STEP FORWARD':'තවත් ඉදිරි පියවරක්','Practice makes progress':'පුහුණුවෙන් ප්‍රගතියට','Time’s up. Let’s review.':'කාලය අවසන්. පිළිතුරු බලමු.',
  'session score':'ලබාගත් ලකුණු','not graded':'ලකුණු දී නොමැත','This session needs a review.':'මෙම පුහුණුව සමාලෝචනය කළ යුතුය.',
  'You’re finding your rhythm.':'ඔබ හොඳින් ඉදිරියට යමින් සිටී.','You’re building a solid foundation.':'ඔබ හොඳ පදනමක් ගොඩනඟමින් සිටී.',
  'Every answer is a chance to learn.':'සෑම පිළිතුරක්ම ඉගෙනීමට අවස්ථාවකි.','No questions in this session can be graded yet.':'මෙම පුහුණුවේ ප්‍රශ්නවලට තවම ලකුණු දිය නොහැක.',
  'Practise missed questions':'මඟහැරුණු ප්‍රශ්නවලින් පුහුණු වන්න','New session':'නව පුහුණුවක්','Your answer review':'ඔබේ පිළිතුරු සමාලෝචනය','Your answer':'ඔබේ පිළිතුර','✓ Correct':'✓ නිවැරදියි',
  'Past paper answers are independently worked, unless labelled official. Questions awaiting review are excluded from the score. Additional questions are original practice material.':'නිල ලෙස දක්වා නොමැති පසුගිය ප්‍රශ්න පත්‍ර පිළිතුරු ස්වාධීනව විසඳා ඇත. සමාලෝචනය අවශ්‍ය ප්‍රශ්නවලට ලකුණු නොදේ. අමතර ප්‍රශ්න පුහුණුව සඳහා සකසා ඇත.',
  'SEE HOW FAR YOU’VE COME':'ඔබේ ප්‍රගතිය බලන්න','Your effort adds up':'ඔබේ උත්සාහයෙන් ප්‍රතිඵල ලැබේ',
  'A small record of the questions you’ve tackled and the topics you’re growing in.':'ඔබ පිළිතුරු දුන් ප්‍රශ්න සහ විෂය ක්ෂේත්‍රවල ප්‍රගතිය මෙතැනින් බලන්න.',
  'Completed sessions':'අවසන් කළ පුහුණු','Unique questions answered':'පිළිතුරු දුන් වෙනස් ප්‍රශ්න','Overall score':'සමස්ත ලකුණු','Questions saved':'සුරැකි ප්‍රශ්න',
  'By topic area':'විෂය ක්ෂේත්‍රය අනුව','Correct / graded':'නිවැරදි / ලකුණු දුන්','Recent sessions':'මෑත පුහුණු','Your story starts with a session':'පළමු පුහුණුවෙන් අරඹන්න',
  'Finish a practice session to see your progress here.':'මෙහි ප්‍රගතිය බැලීමට පුහුණුවක් අවසන් කරන්න.','Let’s practise':'පුහුණු වෙමු',
  'Progress is stored in this browser. It does not sync between devices. Overall scores include unanswered graded questions in completed sessions.':'ප්‍රගතිය මෙම බ්‍රවුසරයේ සුරැකේ. වෙනත් උපාංග සමඟ සමමුහුර්ත නොවේ. අවසන් කළ පුහුණුවල පිළිතුරු නොදුන්, ලකුණු දිය හැකි ප්‍රශ්න ද සමස්ත ලකුණට අදාළ වේ.',
  'BACK TO THE ORIGINALS':'මුල් ලේඛන බලන්න','The source papers':'මුල් ප්‍රශ්න පත්‍ර','The three papers behind this question bank, kept close for reference.':'ප්‍රශ්න බැංකුව සැකසීමට භාවිත කළ මුල් ප්‍රශ්න පත්‍ර තුන මෙතැනින් බලන්න.',
  'G.C.E. ADVANCED LEVEL':'අ.පො.ස. උසස් පෙළ','Information &':'තොරතුරු හා','Communication Technology':'සන්නිවේදන තාක්ෂණය','PAPER I · ENGLISH':'I පත්‍රය · ඉංග්‍රීසි',
  '50 questions · 5 choices per question':'ප්‍රශ්න 50කි · එක් ප්‍රශ්නයකට විකල්ප 5කි','Open original PDF':'මුල් PDF පිටපත බලන්න','Practise this paper':'මෙම පත්‍රයෙන් පුහුණු වන්න',
  'A note on the answers':'පිළිතුරු පිළිබඳ සටහන','Built for focused revision':'පුනරීක්ෂණය සඳහා සකසා ඇත',
  'The supplied files contain the question papers, without a separate official answer key. Past paper answers and explanations are independently worked and labelled accordingly.':'ලබාදුන් ගොනුවල වෙනම නිල පිළිතුරු පත්‍රයක් නොමැත. පිළිතුරු සහ පැහැදිලි කිරීම් ස්වාධීනව විසඳා සකසා ඇත.',
  'because the wording or available options are ambiguous. They can be studied, but do not contribute to your score.':'ප්‍රකාශ හෝ විකල්ප අපැහැදිලි බැවින් සමාලෝචනය අවශ්‍යය. ඒවා අධ්‍යයනය කළ හැකි නමුත් ලකුණට අදාළ නොවේ.',
  'The 2025 file includes a marking-scheme header; that header alone is not an official answer key. A teacher should review the bank before high-stakes assessment.':'2025 ගොනුවේ ලකුණු ක්‍රමයක් පිළිබඳ ශීර්ෂයක් තිබුණ ද නිල පිළිතුරු පත්‍රයක් දක්වා නොමැත. ඇගයීම් සඳහා භාවිතයට පෙර ගුරුවරයෙකු විසින් පරීක්ෂා කළ යුතුය.',
  'Extra practice questions are newly authored and clearly separated from past papers. Original scans are available beside transcribed questions so you can check diagrams, notation and wording.':'අමතර පුහුණු ප්‍රශ්න අලුතින් සකසා වෙන්කර දක්වා ඇත. රූප සටහන්, සංකේත සහ වචන පරීක්ෂා කිරීමට මුල් ස්කෑන් පිටපත් ද ලබා දී ඇත.',
  'Source papers belong to their respective rights holders. Keep their original attribution when sharing.':'මුල් ප්‍රශ්න පත්‍රවල අයිතිය අදාළ හිමිකරුවන් සතුය. බෙදාගැනීමේදී මුල් මූලාශ්‍ර සඳහන් කරන්න.',
  'Download the JSON question bank':'JSON ප්‍රශ්න බැංකුව බාගන්න','Build your confidence, one question at a time.':'ප්‍රශ්නයෙන් ප්‍රශ්නයට ඔබේ විශ්වාසය වැඩි කර ගන්න.',
  'Progress is saved on this device':'ප්‍රගතිය මෙම උපාංගයේ සුරැකේ','Browser storage unavailable · progress will not be saved':'බ්‍රවුසර ආචයනය නොමැත · ප්‍රගතිය සුරැකෙන්නේ නැත',
  'Question saved for later.':'ප්‍රශ්නය පසුව සඳහා සුරැකිණි.','Question removed from saved.':'ප්‍රශ්නය සුරැකි එකතුවෙන් ඉවත් කෙරිණි.','No questions match. Try a different filter.':'ගැළපෙන ප්‍රශ්න නොමැත. වෙනත් තේරීමක් උත්සාහ කරන්න.',
  'Mixed practice':'මිශ්‍ර පුහුණුව','Missed questions':'මඟහැරුණු ප්‍රශ්න','Resumed practice':'නැවත ඇරඹූ පුහුණුව','A fresh start':'නව ආරම්භයක්',
  'ICT fundamentals':'ICT මූලික සංකල්ප','Computer systems':'පරිගණක පද්ධති','Data representation':'දත්ත නිරූපණය','Digital logic':'අංකිත තර්කනය',
  'Operating systems':'මෙහෙයුම් පද්ධති','Data communication & networks':'දත්ත සන්නිවේදනය හා ජාල','Networks':'ජාල','Systems analysis & design':'පද්ධති විශ්ලේෂණය හා නිර්මාණය','Systems analysis':'පද්ධති විශ්ලේෂණය',
  'Database management':'දත්ත සමුදාය කළමනාකරණය','Databases':'දත්ත සමුදාය','Programming & algorithms':'ක්‍රමලේඛනය හා ඇල්ගොරිතම','Programming':'ක්‍රමලේඛනය',
  'Web development':'වෙබ් සංවර්ධනය','Information systems & society':'තොරතුරු පද්ධති හා සමාජය','Information systems':'තොරතුරු පද්ධති','Emerging technologies':'නැගී එන තාක්ෂණ',
  'ICT TERMS, IN BOTH LANGUAGES':'ICT පද භාෂා දෙකෙන්ම','Your ICT word companion':'ඔබේ ICT පද සහායකයා','Search glossary':'පාරිභාෂික පද සොයන්න','English or Sinhala term…':'ඉංග්‍රීසි හෝ සිංහල පදයක්…',
  'English term':'ඉංග්‍රීසි පදය','Sinhala term':'සිංහල පදය','Source page':'මූලාශ්‍ර පිටුව','Open supplied glossary':'ලබාදුන් පාරිභාෂික පද මාලාව බලන්න',
  'Selected terms adapted from the supplied English–Sinhala–Tamil glossary. The original PDF includes additional terms and Tamil equivalents.':'ලබාදුන් ඉංග්‍රීසි–සිංහල–දෙමළ පාරිභාෂික පද මාලාවෙන් තෝරාගත් පද මෙහි ඇත. මුල් PDF ගොනුවේ තවත් පද සහ දෙමළ අර්ථ ද ඇතුළත් වේ.',
  'No glossary terms found.':'ගැළපෙන පාරිභාෂික පද හමු නොවීය.',
  'Sinhala translations are study aids prepared with Google Translate and selected glossary terms. Code, identifiers and formulas remain in their original form. Compare any uncertain wording with the English original.':'සිංහල අධ්‍යයන පරිවර්තන Google Translate සහ තෝරාගත් පාරිභාෂික පද යොදා සකසා ඇත. කේත, හඳුන්වන සහ සූත්‍ර මුල් ආකාරයෙන් තබා ඇත. අපැහැදිලි වචන මුල් ඉංග්‍රීසි පෙළ සමඟ සසඳන්න.'
};

export function uiText(value, language='en') {
  if(language!=='si')return value;
  const leading=value.match(/^\s*/)?.[0]||'', trailing=value.match(/\s*$/)?.[0]||'', text=value.trim();
  if(!text)return value;
  if(si[text])return leading+si[text]+trailing;
  const rules=[
    [/^(\d{4}) past paper$/,m=>`${m[1]} පසුගිය ප්‍රශ්න පත්‍රය`],
    [/^(\d{4}) ICT MCQ paper$/,m=>`${m[1]} ICT බහුවරණ පත්‍රය`],
    [/^(\d+) (questions?|question) available$/,m=>`ප්‍රශ්න ${m[1]}ක් තිබේ`],
    [/^(\d+) saved questions?$/,m=>`සුරැකි ප්‍රශ්න ${m[1]}කි`],
    [/^(\d+) questions?$/,m=>`ප්‍රශ්න ${m[1]}කි`],
    [/^QUESTION (\d+)$/,m=>`ප්‍රශ්න ${m[1]}`],[/^OF (\d+)$/,m=>`/ ${m[1]}`],
    [/^Paper Q(\d+)$/,m=>`මුල් ප්‍රශ්න අංකය ${m[1]}`],
    [/^Question (\d+)(, answered)?(, checked)?$/,m=>`ප්‍රශ්න ${m[1]}${m[2]?' · පිළිතුරු දී ඇත':''}${m[3]?' · පරීක්ෂා කර ඇත':''}`],
    [/^Let’s work through this\. Answer (\d+) is correct\.$/,m=>`අපි විමසා බලමු. නිවැරදි පිළිතුර ${m[1]}යි.`],
    [/^\/ (\d+) answered$/,m=>`/ ${m[1]}කට පිළිතුරු දී ඇත`],
    [/^Page (\d+) of (\d+)$/,m=>`${m[2]}න් ${m[1]} පිටුව`],
    [/^(\d+) correct$/,m=>`${m[1]} නිවැරදියි`],[/^(\d+) incorrect$/,m=>`${m[1]} වැරදියි`],
    [/^(\d+) unanswered$/,m=>`${m[1]}කට පිළිතුරු නැත`],[/^(\d+) awaiting review$/,m=>`${m[1]}ක් සමාලෝචනයට`],
    [/^(\d+) of (\d+)$/,m=>`${m[2]}න් ${m[1]}`],
    [/^questions with an answer key answered correctly\.$/,()=> 'ලකුණු දිය හැකි ප්‍රශ්නවලට නිවැරදි පිළිතුරු ලබා දී ඇත.'],
    [/^(\d+) questions need review$/,m=>`ප්‍රශ්න ${m[1]}ක් සමාලෝචනය කළ යුතුය`],
    [/^Questions are grouped into (\d+) topic areas for easier revision\. The categories are a study aid, rather than a claim of exact syllabus unit mapping\.$/,m=>`පහසු පුනරීක්ෂණය සඳහා ප්‍රශ්න විෂය ක්ෂේත්‍ර ${m[1]}කට වෙන්කර ඇත. ඒවා නිල විෂය නිර්දේශ ඒකක වර්ගීකරණයක් ලෙස සලකනු නොලැබේ.`],
    [/^(Save|Unsave) question (.+)$/,m=>`${m[1]==='Save'?'සුරකින්න':'සුරැකීම ඉවත් කරන්න'} · ${m[2]}`],
    [/^Original paper excerpt · (\d{4}), question (\d+)$/,m=>`මුල් පත්‍රයෙන් · ${m[1]}, ප්‍රශ්න ${m[2]}`],
    [/^Open (\d{4}) paper · page (\d+)$/,m=>`${m[1]} මුල් පත්‍රය · පිටුව ${m[2]}`],
    [/^(\d+) terms$/,m=>`පද ${m[1]}කි`],
    [/^PDF page (\d+)$/,m=>`PDF පිටුව ${m[1]}`]
  ];
  for(const [pattern,replace]of rules){const match=text.match(pattern);if(match)return leading+replace(match)+trailing;}
  if(text.includes(' · '))return leading+text.split(' · ').map(t=>uiText(t,language)).join(' · ')+trailing;
  return value;
}

export function localizeQuestion(question,language='en') {
  const translated=question.translations?.[language];
  return language==='si'&&translated ? {...question,prompt:translated.prompt,options:translated.options,explanation:translated.explanation,isTranslated:true} : question;
}

export function glossaryMatches(question,terms,limit=12) {
  const text=[question.prompt,...question.options].join(' ').toLowerCase();
  return terms.filter(term=>[term.en,...(term.aliases||[])].some(word=>{
    const escaped=word.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
    return new RegExp(`\\b${escaped}(?:s)?\\b`,'i').test(text);
  })).sort((a,b)=>b.en.length-a.en.length).slice(0,limit);
}

export function localizeInterface(root,language) {
  if(language!=='si')return;
  const doc=root.ownerDocument, walker=doc.createTreeWalker(root,NodeFilter.SHOW_TEXT);
  const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
  for(const node of nodes){
    if(node.parentElement?.closest('[data-question-content],[lang="en"],svg,script,style,code,pre,.option-text,#question-title,.bank-item h3,.review-item summary strong,.review-explanation p,.feedback p'))continue;
    node.nodeValue=uiText(node.nodeValue,language);
  }
  for(const element of root.querySelectorAll('[aria-label],[title],[placeholder]')){
    if(element.closest('[data-question-content],[lang="en"]'))continue;
    for(const name of ['aria-label','title','placeholder'])if(element.hasAttribute(name))element.setAttribute(name,uiText(element.getAttribute(name),language));
  }
}
