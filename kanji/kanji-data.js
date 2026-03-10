// ============================================================
// KANJI LEARNING DATA
// Covers JLPT N5–N3 level kanji essential for daily Japanese
// ============================================================

const KANJI_DB = [
  // ── NUMBERS ──
  { kanji:"一", readings:["いち","ひと(つ)"], meaning:"one", strokes:1, level:"N5", category:"Numbers" },
  { kanji:"二", readings:["に","ふた(つ)"], meaning:"two", strokes:2, level:"N5", category:"Numbers" },
  { kanji:"三", readings:["さん","みっ(つ)"], meaning:"three", strokes:3, level:"N5", category:"Numbers" },
  { kanji:"四", readings:["し","よっ(つ)"], meaning:"four", strokes:5, level:"N5", category:"Numbers" },
  { kanji:"五", readings:["ご","いつ(つ)"], meaning:"five", strokes:4, level:"N5", category:"Numbers" },
  { kanji:"六", readings:["ろく","むっ(つ)"], meaning:"six", strokes:4, level:"N5", category:"Numbers" },
  { kanji:"七", readings:["しち","なな(つ)"], meaning:"seven", strokes:2, level:"N5", category:"Numbers" },
  { kanji:"八", readings:["はち","やっ(つ)"], meaning:"eight", strokes:2, level:"N5", category:"Numbers" },
  { kanji:"九", readings:["く・きゅう","ここの(つ)"], meaning:"nine", strokes:2, level:"N5", category:"Numbers" },
  { kanji:"十", readings:["じゅう","とお"], meaning:"ten", strokes:2, level:"N5", category:"Numbers" },
  { kanji:"百", readings:["ひゃく"], meaning:"hundred", strokes:6, level:"N5", category:"Numbers" },
  { kanji:"千", readings:["せん"], meaning:"thousand", strokes:3, level:"N5", category:"Numbers" },
  { kanji:"万", readings:["まん","ばん"], meaning:"ten-thousand", strokes:3, level:"N5", category:"Numbers" },
  // ── TIME ──
  { kanji:"日", readings:["にち・じつ","ひ・か"], meaning:"day / sun", strokes:4, level:"N5", category:"Time" },
  { kanji:"月", readings:["げつ・がつ","つき"], meaning:"month / moon", strokes:4, level:"N5", category:"Time" },
  { kanji:"年", readings:["ねん","とし"], meaning:"year", strokes:6, level:"N5", category:"Time" },
  { kanji:"時", readings:["じ","とき"], meaning:"time / hour", strokes:10, level:"N5", category:"Time" },
  { kanji:"分", readings:["ふん・ぶん","わか(る)"], meaning:"minute / understand", strokes:4, level:"N5", category:"Time" },
  { kanji:"今", readings:["こん・きん","いま"], meaning:"now", strokes:4, level:"N5", category:"Time" },
  { kanji:"週", readings:["しゅう"], meaning:"week", strokes:11, level:"N5", category:"Time" },
  { kanji:"午", readings:["ご"], meaning:"noon", strokes:4, level:"N5", category:"Time" },
  { kanji:"前", readings:["ぜん","まえ"], meaning:"before / front", strokes:9, level:"N5", category:"Time" },
  { kanji:"後", readings:["ご・こう","あと・うし(ろ)"], meaning:"after / behind", strokes:9, level:"N5", category:"Time" },
  { kanji:"朝", readings:["ちょう","あさ"], meaning:"morning", strokes:12, level:"N4", category:"Time" },
  { kanji:"昼", readings:["ちゅう","ひる"], meaning:"daytime / noon", strokes:9, level:"N4", category:"Time" },
  { kanji:"夜", readings:["や","よる・よ"], meaning:"night", strokes:8, level:"N4", category:"Time" },
  { kanji:"晩", readings:["ばん"], meaning:"evening", strokes:12, level:"N4", category:"Time" },
  { kanji:"毎", readings:["まい"], meaning:"every", strokes:6, level:"N5", category:"Time" },
  { kanji:"先", readings:["せん","さき"], meaning:"ahead / previous", strokes:6, level:"N5", category:"Time" },
  { kanji:"来", readings:["らい","く(る)"], meaning:"come", strokes:7, level:"N5", category:"Time" },
  { kanji:"去", readings:["きょ","さ(る)"], meaning:"go away / last", strokes:5, level:"N4", category:"Time" },
  { kanji:"間", readings:["かん","あいだ・ま"], meaning:"interval / between", strokes:12, level:"N5", category:"Time" },
  // ── PEOPLE ──
  { kanji:"人", readings:["じん・にん","ひと"], meaning:"person", strokes:2, level:"N5", category:"People" },
  { kanji:"男", readings:["だん・なん","おとこ"], meaning:"man / male", strokes:7, level:"N5", category:"People" },
  { kanji:"女", readings:["じょ・にょ","おんな"], meaning:"woman / female", strokes:3, level:"N5", category:"People" },
  { kanji:"子", readings:["し・す","こ"], meaning:"child", strokes:3, level:"N5", category:"People" },
  { kanji:"父", readings:["ふ","ちち"], meaning:"father", strokes:4, level:"N5", category:"People" },
  { kanji:"母", readings:["ぼ","はは"], meaning:"mother", strokes:5, level:"N5", category:"People" },
  { kanji:"兄", readings:["けい・きょう","あに"], meaning:"older brother", strokes:5, level:"N5", category:"People" },
  { kanji:"姉", readings:["し","あね"], meaning:"older sister", strokes:8, level:"N5", category:"People" },
  { kanji:"弟", readings:["てい","おとうと"], meaning:"younger brother", strokes:7, level:"N5", category:"People" },
  { kanji:"妹", readings:["まい","いもうと"], meaning:"younger sister", strokes:8, level:"N5", category:"People" },
  { kanji:"友", readings:["ゆう","とも"], meaning:"friend", strokes:4, level:"N5", category:"People" },
  { kanji:"先生", readings:["せんせい"], meaning:"teacher", strokes:0, level:"N5", category:"People" },
  { kanji:"学生", readings:["がくせい"], meaning:"student", strokes:0, level:"N5", category:"People" },
  { kanji:"医者", readings:["いしゃ"], meaning:"doctor", strokes:0, level:"N5", category:"People" },
  { kanji:"家族", readings:["かぞく"], meaning:"family", strokes:0, level:"N4", category:"People" },
  // ── BODY ──
  { kanji:"目", readings:["もく","め"], meaning:"eye", strokes:5, level:"N5", category:"Body" },
  { kanji:"耳", readings:["じ","みみ"], meaning:"ear", strokes:6, level:"N5", category:"Body" },
  { kanji:"口", readings:["こう・く","くち"], meaning:"mouth", strokes:3, level:"N5", category:"Body" },
  { kanji:"手", readings:["しゅ","て"], meaning:"hand", strokes:4, level:"N5", category:"Body" },
  { kanji:"足", readings:["そく","あし"], meaning:"foot / leg", strokes:7, level:"N5", category:"Body" },
  { kanji:"頭", readings:["とう・ず","あたま"], meaning:"head", strokes:16, level:"N4", category:"Body" },
  { kanji:"顔", readings:["がん","かお"], meaning:"face", strokes:18, level:"N4", category:"Body" },
  { kanji:"心", readings:["しん","こころ"], meaning:"heart / mind", strokes:4, level:"N4", category:"Body" },
  { kanji:"体", readings:["たい","からだ"], meaning:"body", strokes:7, level:"N4", category:"Body" },
  { kanji:"声", readings:["せい・しょう","こえ"], meaning:"voice", strokes:7, level:"N4", category:"Body" },
  // ── NATURE ──
  { kanji:"山", readings:["さん","やま"], meaning:"mountain", strokes:3, level:"N5", category:"Nature" },
  { kanji:"川", readings:["せん","かわ"], meaning:"river", strokes:3, level:"N5", category:"Nature" },
  { kanji:"木", readings:["もく・ぼく","き"], meaning:"tree / wood", strokes:4, level:"N5", category:"Nature" },
  { kanji:"火", readings:["か","ひ"], meaning:"fire", strokes:4, level:"N5", category:"Nature" },
  { kanji:"水", readings:["すい","みず"], meaning:"water", strokes:4, level:"N5", category:"Nature" },
  { kanji:"土", readings:["ど・と","つち"], meaning:"earth / soil", strokes:3, level:"N5", category:"Nature" },
  { kanji:"金", readings:["きん・こん","かね"], meaning:"gold / money", strokes:8, level:"N5", category:"Nature" },
  { kanji:"空", readings:["くう","そら・あ(く)"], meaning:"sky / empty", strokes:8, level:"N5", category:"Nature" },
  { kanji:"海", readings:["かい","うみ"], meaning:"sea / ocean", strokes:9, level:"N5", category:"Nature" },
  { kanji:"花", readings:["か","はな"], meaning:"flower", strokes:7, level:"N5", category:"Nature" },
  { kanji:"雨", readings:["う","あめ"], meaning:"rain", strokes:8, level:"N5", category:"Nature" },
  { kanji:"雪", readings:["せつ","ゆき"], meaning:"snow", strokes:11, level:"N4", category:"Nature" },
  { kanji:"風", readings:["ふう","かぜ"], meaning:"wind", strokes:9, level:"N4", category:"Nature" },
  { kanji:"草", readings:["そう","くさ"], meaning:"grass", strokes:9, level:"N4", category:"Nature" },
  { kanji:"石", readings:["せき","いし"], meaning:"stone", strokes:5, level:"N4", category:"Nature" },
  { kanji:"星", readings:["せい","ほし"], meaning:"star", strokes:9, level:"N4", category:"Nature" },
  { kanji:"光", readings:["こう","ひかり"], meaning:"light", strokes:6, level:"N4", category:"Nature" },
  { kanji:"森", readings:["しん","もり"], meaning:"forest", strokes:12, level:"N4", category:"Nature" },
  // ── DIRECTIONS & PLACES ──
  { kanji:"上", readings:["じょう","うえ・あ(げる)"], meaning:"up / above", strokes:3, level:"N5", category:"Directions" },
  { kanji:"下", readings:["か・げ","した・さ(げる)"], meaning:"down / below", strokes:3, level:"N5", category:"Directions" },
  { kanji:"右", readings:["う・ゆう","みぎ"], meaning:"right", strokes:5, level:"N5", category:"Directions" },
  { kanji:"左", readings:["さ","ひだり"], meaning:"left", strokes:5, level:"N5", category:"Directions" },
  { kanji:"中", readings:["ちゅう","なか"], meaning:"middle / inside", strokes:4, level:"N5", category:"Directions" },
  { kanji:"外", readings:["がい","そと"], meaning:"outside", strokes:5, level:"N5", category:"Directions" },
  { kanji:"東", readings:["とう","ひがし"], meaning:"east", strokes:8, level:"N5", category:"Directions" },
  { kanji:"西", readings:["せい・さい","にし"], meaning:"west", strokes:6, level:"N5", category:"Directions" },
  { kanji:"南", readings:["なん","みなみ"], meaning:"south", strokes:9, level:"N5", category:"Directions" },
  { kanji:"北", readings:["ほく","きた"], meaning:"north", strokes:5, level:"N5", category:"Directions" },
  { kanji:"国", readings:["こく","くに"], meaning:"country", strokes:8, level:"N5", category:"Directions" },
  { kanji:"町", readings:["ちょう","まち"], meaning:"town", strokes:7, level:"N5", category:"Directions" },
  { kanji:"村", readings:["そん","むら"], meaning:"village", strokes:7, level:"N5", category:"Directions" },
  { kanji:"道", readings:["どう・みち"], meaning:"road / way", strokes:12, level:"N5", category:"Directions" },
  // ── HOME & BUILDINGS ──
  { kanji:"家", readings:["か","いえ・うち"], meaning:"house / home", strokes:10, level:"N5", category:"Home" },
  { kanji:"部屋", readings:["へや"], meaning:"room", strokes:0, level:"N5", category:"Home" },
  { kanji:"門", readings:["もん","かど"], meaning:"gate", strokes:8, level:"N5", category:"Home" },
  { kanji:"店", readings:["てん","みせ"], meaning:"shop / store", strokes:8, level:"N5", category:"Home" },
  { kanji:"校", readings:["こう"], meaning:"school", strokes:10, level:"N5", category:"Home" },
  { kanji:"駅", readings:["えき"], meaning:"station", strokes:14, level:"N5", category:"Home" },
  { kanji:"病院", readings:["びょういん"], meaning:"hospital", strokes:0, level:"N5", category:"Home" },
  { kanji:"会社", readings:["かいしゃ"], meaning:"company / office", strokes:0, level:"N5", category:"Home" },
  { kanji:"銀行", readings:["ぎんこう"], meaning:"bank", strokes:0, level:"N5", category:"Home" },
  { kanji:"図書館", readings:["としょかん"], meaning:"library", strokes:0, level:"N4", category:"Home" },
  { kanji:"公園", readings:["こうえん"], meaning:"park", strokes:0, level:"N5", category:"Home" },
  // ── FOOD & DRINK ──
  { kanji:"食", readings:["しょく","た(べる)"], meaning:"eat / food", strokes:9, level:"N5", category:"Food" },
  { kanji:"飲", readings:["いん","の(む)"], meaning:"drink", strokes:12, level:"N5", category:"Food" },
  { kanji:"米", readings:["べい・まい","こめ"], meaning:"rice (uncooked)", strokes:6, level:"N5", category:"Food" },
  { kanji:"肉", readings:["にく"], meaning:"meat", strokes:6, level:"N5", category:"Food" },
  { kanji:"魚", readings:["ぎょ","さかな"], meaning:"fish", strokes:11, level:"N5", category:"Food" },
  { kanji:"茶", readings:["ちゃ・さ"], meaning:"tea", strokes:9, level:"N5", category:"Food" },
  { kanji:"酒", readings:["しゅ","さけ"], meaning:"sake / alcohol", strokes:10, level:"N4", category:"Food" },
  { kanji:"料理", readings:["りょうり"], meaning:"cooking / cuisine", strokes:0, level:"N5", category:"Food" },
  // ── VERBS ──
  { kanji:"見", readings:["けん","み(る)"], meaning:"see / look", strokes:7, level:"N5", category:"Verbs" },
  { kanji:"聞", readings:["ぶん","き(く)"], meaning:"hear / listen / ask", strokes:14, level:"N5", category:"Verbs" },
  { kanji:"言", readings:["げん","い(う)"], meaning:"say / speak", strokes:7, level:"N5", category:"Verbs" },
  { kanji:"話", readings:["わ","はな(す)"], meaning:"talk / speak", strokes:13, level:"N5", category:"Verbs" },
  { kanji:"読", readings:["どく","よ(む)"], meaning:"read", strokes:14, level:"N5", category:"Verbs" },
  { kanji:"書", readings:["しょ","か(く)"], meaning:"write", strokes:10, level:"N5", category:"Verbs" },
  { kanji:"出", readings:["しゅつ","で(る)・だ(す)"], meaning:"exit / put out", strokes:5, level:"N5", category:"Verbs" },
  { kanji:"入", readings:["にゅう","い(る)・はい(る)"], meaning:"enter", strokes:2, level:"N5", category:"Verbs" },
  { kanji:"行", readings:["こう","い(く)"], meaning:"go", strokes:6, level:"N5", category:"Verbs" },
  { kanji:"来", readings:["らい","く(る)"], meaning:"come", strokes:7, level:"N5", category:"Verbs" },
  { kanji:"帰", readings:["き","かえ(る)"], meaning:"return home", strokes:10, level:"N5", category:"Verbs" },
  { kanji:"起", readings:["き","お(きる)"], meaning:"wake up / rise", strokes:10, level:"N5", category:"Verbs" },
  { kanji:"寝", readings:["しん","ね(る)"], meaning:"sleep / lie down", strokes:13, level:"N5", category:"Verbs" },
  { kanji:"立", readings:["りつ","た(つ)"], meaning:"stand", strokes:5, level:"N5", category:"Verbs" },
  { kanji:"座", readings:["ざ","すわ(る)"], meaning:"sit", strokes:10, level:"N4", category:"Verbs" },
  { kanji:"待", readings:["たい","ま(つ)"], meaning:"wait", strokes:9, level:"N5", category:"Verbs" },
  { kanji:"買", readings:["ばい","か(う)"], meaning:"buy", strokes:12, level:"N5", category:"Verbs" },
  { kanji:"売", readings:["ばい","う(る)"], meaning:"sell", strokes:7, level:"N5", category:"Verbs" },
  { kanji:"使", readings:["し","つか(う)"], meaning:"use", strokes:8, level:"N4", category:"Verbs" },
  { kanji:"思", readings:["し","おも(う)"], meaning:"think / feel", strokes:9, level:"N4", category:"Verbs" },
  { kanji:"知", readings:["ち","し(る)"], meaning:"know", strokes:8, level:"N5", category:"Verbs" },
  { kanji:"会", readings:["かい","あ(う)"], meaning:"meet / meeting", strokes:6, level:"N5", category:"Verbs" },
  { kanji:"開", readings:["かい","あ(ける)"], meaning:"open", strokes:12, level:"N5", category:"Verbs" },
  { kanji:"閉", readings:["へい","し(める)"], meaning:"close", strokes:11, level:"N5", category:"Verbs" },
  { kanji:"始", readings:["し","はじ(める)"], meaning:"begin / start", strokes:8, level:"N5", category:"Verbs" },
  { kanji:"終", readings:["しゅう","お(わる)"], meaning:"end / finish", strokes:11, level:"N5", category:"Verbs" },
  { kanji:"作", readings:["さく","つく(る)"], meaning:"make / create", strokes:7, level:"N5", category:"Verbs" },
  { kanji:"着", readings:["ちゃく","き(る)・つ(く)"], meaning:"wear / arrive", strokes:12, level:"N5", category:"Verbs" },
  { kanji:"泳", readings:["えい","およ(ぐ)"], meaning:"swim", strokes:8, level:"N5", category:"Verbs" },
  { kanji:"走", readings:["そう","はし(る)"], meaning:"run", strokes:7, level:"N5", category:"Verbs" },
  { kanji:"歩", readings:["ほ","ある(く)"], meaning:"walk", strokes:8, level:"N5", category:"Verbs" },
  // ── ADJECTIVES ──
  { kanji:"大", readings:["だい・たい","おお(きい)"], meaning:"big / large", strokes:3, level:"N5", category:"Adjectives" },
  { kanji:"小", readings:["しょう","ちい(さい)・こ"], meaning:"small / little", strokes:3, level:"N5", category:"Adjectives" },
  { kanji:"高", readings:["こう","たか(い)"], meaning:"tall / expensive / high", strokes:10, level:"N5", category:"Adjectives" },
  { kanji:"低", readings:["てい","ひく(い)"], meaning:"low / short", strokes:7, level:"N5", category:"Adjectives" },
  { kanji:"長", readings:["ちょう","なが(い)"], meaning:"long", strokes:8, level:"N5", category:"Adjectives" },
  { kanji:"短", readings:["たん","みじか(い)"], meaning:"short", strokes:12, level:"N4", category:"Adjectives" },
  { kanji:"多", readings:["た","おお(い)"], meaning:"many / much", strokes:6, level:"N5", category:"Adjectives" },
  { kanji:"少", readings:["しょう","すく(ない)・すこ(し)"], meaning:"few / a little", strokes:4, level:"N5", category:"Adjectives" },
  { kanji:"新", readings:["しん","あたら(しい)・あら(た)"], meaning:"new", strokes:13, level:"N5", category:"Adjectives" },
  { kanji:"古", readings:["こ","ふる(い)"], meaning:"old (things)", strokes:5, level:"N5", category:"Adjectives" },
  { kanji:"若", readings:["じゃく","わか(い)"], meaning:"young", strokes:8, level:"N4", category:"Adjectives" },
  { kanji:"好", readings:["こう","す(き)"], meaning:"like / fond of", strokes:6, level:"N5", category:"Adjectives" },
  { kanji:"悪", readings:["あく","わる(い)"], meaning:"bad / evil", strokes:11, level:"N5", category:"Adjectives" },
  { kanji:"良", readings:["りょう","よ(い)・い(い)"], meaning:"good", strokes:7, level:"N4", category:"Adjectives" },
  { kanji:"白", readings:["はく","しろ(い)"], meaning:"white", strokes:5, level:"N5", category:"Adjectives" },
  { kanji:"黒", readings:["こく","くろ(い)"], meaning:"black", strokes:11, level:"N5", category:"Adjectives" },
  { kanji:"赤", readings:["せき","あか(い)"], meaning:"red", strokes:7, level:"N5", category:"Adjectives" },
  { kanji:"青", readings:["せい","あお(い)"], meaning:"blue / green", strokes:8, level:"N5", category:"Adjectives" },
  { kanji:"暑", readings:["しょ","あつ(い)"], meaning:"hot (weather)", strokes:12, level:"N5", category:"Adjectives" },
  { kanji:"寒", readings:["かん","さむ(い)"], meaning:"cold (weather)", strokes:12, level:"N5", category:"Adjectives" },
  { kanji:"暖", readings:["だん","あたた(かい)"], meaning:"warm", strokes:13, level:"N4", category:"Adjectives" },
  { kanji:"涼", readings:["りょう","すず(しい)"], meaning:"cool / refreshing", strokes:11, level:"N4", category:"Adjectives" },
  // ── SCHOOL & STUDY ──
  { kanji:"学", readings:["がく","まな(ぶ)"], meaning:"study / learn", strokes:8, level:"N5", category:"School" },
  { kanji:"教", readings:["きょう","おし(える)"], meaning:"teach", strokes:11, level:"N5", category:"School" },
  { kanji:"本", readings:["ほん","もと"], meaning:"book / origin", strokes:5, level:"N5", category:"School" },
  { kanji:"字", readings:["じ","あざ"], meaning:"character / letter", strokes:6, level:"N5", category:"School" },
  { kanji:"文", readings:["ぶん・もん","ふみ"], meaning:"sentence / writing", strokes:4, level:"N5", category:"School" },
  { kanji:"語", readings:["ご","かた(る)"], meaning:"language / word", strokes:14, level:"N5", category:"School" },
  { kanji:"英", readings:["えい"], meaning:"England / English", strokes:8, level:"N5", category:"School" },
  { kanji:"国語", readings:["こくご"], meaning:"Japanese language", strokes:0, level:"N5", category:"School" },
  { kanji:"算数", readings:["さんすう"], meaning:"arithmetic / math", strokes:0, level:"N5", category:"School" },
  { kanji:"問題", readings:["もんだい"], meaning:"problem / question", strokes:0, level:"N4", category:"School" },
  { kanji:"答", readings:["とう","こた(える)"], meaning:"answer / reply", strokes:12, level:"N5", category:"School" },
  { kanji:"試験", readings:["しけん"], meaning:"exam / test", strokes:0, level:"N4", category:"School" },
  // ── TRANSPORT ──
  { kanji:"車", readings:["しゃ","くるま"], meaning:"car / vehicle", strokes:7, level:"N5", category:"Transport" },
  { kanji:"電", readings:["でん"], meaning:"electricity", strokes:13, level:"N5", category:"Transport" },
  { kanji:"電車", readings:["でんしゃ"], meaning:"train / electric train", strokes:0, level:"N5", category:"Transport" },
  { kanji:"飛行機", readings:["ひこうき"], meaning:"airplane", strokes:0, level:"N5", category:"Transport" },
  { kanji:"船", readings:["せん","ふね"], meaning:"ship / boat", strokes:11, level:"N4", category:"Transport" },
  { kanji:"自転車", readings:["じてんしゃ"], meaning:"bicycle", strokes:0, level:"N5", category:"Transport" },
  { kanji:"道路", readings:["どうろ"], meaning:"road / street", strokes:0, level:"N4", category:"Transport" },
  // ── DAILY LIFE ──
  { kanji:"名前", readings:["なまえ"], meaning:"name", strokes:0, level:"N5", category:"Daily Life" },
  { kanji:"電話", readings:["でんわ"], meaning:"telephone", strokes:0, level:"N5", category:"Daily Life" },
  { kanji:"仕事", readings:["しごと"], meaning:"work / job", strokes:0, level:"N5", category:"Daily Life" },
  { kanji:"生活", readings:["せいかつ"], meaning:"daily life / living", strokes:0, level:"N4", category:"Daily Life" },
  { kanji:"休", readings:["きゅう","やす(む)"], meaning:"rest / holiday", strokes:6, level:"N5", category:"Daily Life" },
  { kanji:"働", readings:["どう","はたら(く)"], meaning:"work / labor", strokes:13, level:"N4", category:"Daily Life" },
  { kanji:"服", readings:["ふく"], meaning:"clothes", strokes:8, level:"N4", category:"Daily Life" },
  { kanji:"金", readings:["きん","かね"], meaning:"money / gold", strokes:8, level:"N5", category:"Daily Life" },
  { kanji:"物", readings:["ぶつ","もの"], meaning:"thing / object", strokes:8, level:"N5", category:"Daily Life" },
  { kanji:"所", readings:["しょ","ところ"], meaning:"place", strokes:8, level:"N5", category:"Daily Life" },
  { kanji:"意味", readings:["いみ"], meaning:"meaning", strokes:0, level:"N4", category:"Daily Life" },
  { kanji:"言葉", readings:["ことば"], meaning:"word / language", strokes:0, level:"N4", category:"Daily Life" },
  { kanji:"天気", readings:["てんき"], meaning:"weather", strokes:0, level:"N5", category:"Daily Life" },
  { kanji:"気持ち", readings:["きもち"], meaning:"feeling", strokes:0, level:"N4", category:"Daily Life" },
];

// ============================================================
// VOCABULARY WORDS (compound words & common vocabulary)
// ============================================================
const VOCABULARY = [
  // Numbers & Counting
  { word:"一つ", reading:"ひとつ", meaning:"one (thing)", example:"りんごを一つください。", exampleReading:"りんごをひとつください。", exampleMeaning:"Please give me one apple.", category:"Numbers" },
  { word:"二人", reading:"ふたり", meaning:"two people", example:"二人で映画を見た。", exampleReading:"ふたりでえいがをみた。", exampleMeaning:"We watched a movie as two people.", category:"Numbers" },
  { word:"三日", reading:"みっか", meaning:"three days / 3rd (date)", example:"三日間旅行しました。", exampleReading:"みっかかんりょこうしました。", exampleMeaning:"I traveled for three days.", category:"Numbers" },
  // Time
  { word:"今日", reading:"きょう", meaning:"today", example:"今日は晴れです。", exampleReading:"きょうははれです。", exampleMeaning:"It is sunny today.", category:"Time" },
  { word:"明日", reading:"あした", meaning:"tomorrow", example:"明日また来てください。", exampleReading:"あしたまたきてください。", exampleMeaning:"Please come again tomorrow.", category:"Time" },
  { word:"昨日", reading:"きのう", meaning:"yesterday", example:"昨日何を食べましたか？", exampleReading:"きのうなにをたべましたか？", exampleMeaning:"What did you eat yesterday?", category:"Time" },
  { word:"今年", reading:"ことし", meaning:"this year", example:"今年の夏は暑い。", exampleReading:"ことしのなつはあつい。", exampleMeaning:"This year's summer is hot.", category:"Time" },
  { word:"来年", reading:"らいねん", meaning:"next year", example:"来年日本に行きます。", exampleReading:"らいねんにほんにいきます。", exampleMeaning:"I will go to Japan next year.", category:"Time" },
  { word:"去年", reading:"きょねん", meaning:"last year", example:"去年大学を卒業しました。", exampleReading:"きょねんだいがくをそつぎょうしました。", exampleMeaning:"I graduated from university last year.", category:"Time" },
  { word:"毎日", reading:"まいにち", meaning:"every day", example:"毎日日本語を勉強しています。", exampleReading:"まいにちにほんごをべんきょうしています。", exampleMeaning:"I study Japanese every day.", category:"Time" },
  { word:"毎朝", reading:"まいあさ", meaning:"every morning", example:"毎朝コーヒーを飲みます。", exampleReading:"まいあさコーヒーをのみます。", exampleMeaning:"I drink coffee every morning.", category:"Time" },
  { word:"午前", reading:"ごぜん", meaning:"AM / morning", example:"午前十時に会議があります。", exampleReading:"ごぜんじゅうじにかいぎがあります。", exampleMeaning:"There is a meeting at 10 AM.", category:"Time" },
  { word:"午後", reading:"ごご", meaning:"PM / afternoon", example:"午後から雨が降るでしょう。", exampleReading:"ごごからあめがふるでしょう。", exampleMeaning:"It will probably rain from the afternoon.", category:"Time" },
  // People & Relationships
  { word:"友達", reading:"ともだち", meaning:"friend", example:"友達とランチを食べました。", exampleReading:"ともだちとランチをたべました。", exampleMeaning:"I ate lunch with a friend.", category:"People" },
  { word:"家族", reading:"かぞく", meaning:"family", example:"家族と一緒に住んでいます。", exampleReading:"かぞくといっしょにすんでいます。", exampleMeaning:"I live together with my family.", category:"People" },
  { word:"先生", reading:"せんせい", meaning:"teacher", example:"山田先生は親切です。", exampleReading:"やまだせんせいはしんせつです。", exampleMeaning:"Teacher Yamada is kind.", category:"People" },
  { word:"学生", reading:"がくせい", meaning:"student", example:"私は大学生です。", exampleReading:"わたしはだいがくせいです。", exampleMeaning:"I am a university student.", category:"People" },
  // Places
  { word:"東京", reading:"とうきょう", meaning:"Tokyo", example:"東京は大きい都市です。", exampleReading:"とうきょうはおおきいとしです。", exampleMeaning:"Tokyo is a big city.", category:"Places" },
  { word:"日本", reading:"にほん", meaning:"Japan", example:"日本の食べ物が好きです。", exampleReading:"にほんのたべものがすきです。", exampleMeaning:"I like Japanese food.", category:"Places" },
  { word:"外国", reading:"がいこく", meaning:"foreign country", example:"外国語を学びたい。", exampleReading:"がいこくごをまなびたい。", exampleMeaning:"I want to learn a foreign language.", category:"Places" },
  { word:"駅前", reading:"えきまえ", meaning:"in front of the station", example:"駅前のカフェで待っています。", exampleReading:"えきまえのカフェでまっています。", exampleMeaning:"I am waiting at the café in front of the station.", category:"Places" },
  // Food
  { word:"食べ物", reading:"たべもの", meaning:"food", example:"好きな食べ物は寿司です。", exampleReading:"すきなたべものはすしです。", exampleMeaning:"My favorite food is sushi.", category:"Food" },
  { word:"飲み物", reading:"のみもの", meaning:"drink / beverage", example:"何か冷たい飲み物が欲しい。", exampleReading:"なにかつめたいのみものがほしい。", exampleMeaning:"I want something cold to drink.", category:"Food" },
  { word:"朝食", reading:"ちょうしょく", meaning:"breakfast", example:"毎朝七時に朝食を食べます。", exampleReading:"まいあさしちじにちょうしょくをたべます。", exampleMeaning:"I eat breakfast at 7 AM every morning.", category:"Food" },
  { word:"昼食", reading:"ちゅうしょく", meaning:"lunch", example:"昼食は何を食べますか？", exampleReading:"ちゅうしょくはなにをたべますか？", exampleMeaning:"What do you eat for lunch?", category:"Food" },
  { word:"夕食", reading:"ゆうしょく", meaning:"dinner", example:"夕食の時間は七時です。", exampleReading:"ゆうしょくのじかんはしちじです。", exampleMeaning:"Dinner time is 7 o'clock.", category:"Food" },
  // Daily Life
  { word:"電話番号", reading:"でんわばんごう", meaning:"phone number", example:"電話番号を教えてください。", exampleReading:"でんわばんごうをおしえてください。", exampleMeaning:"Please tell me your phone number.", category:"Daily Life" },
  { word:"天気予報", reading:"てんきよほう", meaning:"weather forecast", example:"今日の天気予報を見ましたか？", exampleReading:"きょうのてんきよほうをみましたか？", exampleMeaning:"Did you see today's weather forecast?", category:"Daily Life" },
  { word:"乗り物", reading:"のりもの", meaning:"vehicle / transportation", example:"東京は乗り物が便利です。", exampleReading:"とうきょうはのりものがべんりです。", exampleMeaning:"Transportation in Tokyo is convenient.", category:"Daily Life" },
  { word:"買い物", reading:"かいもの", meaning:"shopping", example:"週末に買い物に行きます。", exampleReading:"しゅうまつにかいものにいきます。", exampleMeaning:"I will go shopping on the weekend.", category:"Daily Life" },
  { word:"仕事", reading:"しごと", meaning:"work / job", example:"仕事は何ですか？", exampleReading:"しごとはなんですか？", exampleMeaning:"What is your job?", category:"Daily Life" },
  { word:"勉強", reading:"べんきょう", meaning:"study", example:"毎日三時間勉強します。", exampleReading:"まいにちさんじかんべんきょうします。", exampleMeaning:"I study for three hours every day.", category:"Daily Life" },
  { word:"運動", reading:"うんどう", meaning:"exercise", example:"体のために運動は大切です。", exampleReading:"からだのためにうんどうはたいせつです。", exampleMeaning:"Exercise is important for the body.", category:"Daily Life" },
  { word:"旅行", reading:"りょこう", meaning:"travel / trip", example:"来月、旅行に行く予定です。", exampleReading:"らいげつ、りょこうにいくよていです。", exampleMeaning:"I plan to go on a trip next month.", category:"Daily Life" },
  { word:"音楽", reading:"おんがく", meaning:"music", example:"音楽を聴くのが好きです。", exampleReading:"おんがくをきくのがすきです。", exampleMeaning:"I like listening to music.", category:"Daily Life" },
];

// ============================================================
// PHRASES (common daily-use phrases)
// ============================================================
const PHRASES = [
  // Greetings
  { phrase:"おはようございます", meaning:"Good morning (polite)", romaji:"Ohayou gozaimasu", category:"Greetings", notes:"Used until around 10–11 AM. Drop ございます with friends." },
  { phrase:"こんにちは", meaning:"Hello / Good afternoon", romaji:"Konnichiwa", category:"Greetings", notes:"Standard daytime greeting." },
  { phrase:"こんばんは", meaning:"Good evening", romaji:"Konbanwa", category:"Greetings", notes:"Used after dusk." },
  { phrase:"はじめまして。よろしくお願いします。", meaning:"Nice to meet you. I look forward to working with you.", romaji:"Hajimemashite. Yoroshiku onegaishimasu.", category:"Greetings", notes:"Said when meeting someone for the first time." },
  { phrase:"お元気ですか？", meaning:"How are you?", romaji:"Ogenki desu ka?", category:"Greetings", notes:"Polite. More formal than everyday speech." },
  { phrase:"元気です。ありがとう。", meaning:"I'm fine. Thank you.", romaji:"Genki desu. Arigatou.", category:"Greetings", notes:"Response to お元気ですか" },
  { phrase:"おやすみなさい", meaning:"Good night", romaji:"Oyasumi nasai", category:"Greetings", notes:"Said before sleeping or parting at night." },
  { phrase:"さようなら", meaning:"Goodbye (formal)", romaji:"Sayounara", category:"Greetings", notes:"Formal goodbye, somewhat final. Friends use じゃあね or またね." },
  // Polite expressions
  { phrase:"ありがとうございます", meaning:"Thank you (polite)", romaji:"Arigatou gozaimasu", category:"Politeness", notes:"Standard polite thank you. ありがとう alone is casual." },
  { phrase:"どうぞよろしくお願いします。", meaning:"Please treat me well / I'm in your care.", romaji:"Douzo yoroshiku onegaishimasu.", category:"Politeness", notes:"Used when starting a relationship or asking a favour." },
  { phrase:"すみません", meaning:"Excuse me / I'm sorry", romaji:"Sumimasen", category:"Politeness", notes:"Very versatile: getting attention, apologising, expressing gratitude for trouble caused." },
  { phrase:"ごめんなさい", meaning:"I'm sorry", romaji:"Gomen nasai", category:"Politeness", notes:"Direct apology." },
  { phrase:"いただきます", meaning:"I humbly receive (before eating)", romaji:"Itadakimasu", category:"Politeness", notes:"Said before meals. Shows gratitude for the food." },
  { phrase:"ごちそうさまでした", meaning:"Thank you for the meal", romaji:"Gochisousama deshita", category:"Politeness", notes:"Said after finishing a meal." },
  { phrase:"よろしくお願いします", meaning:"Please / I'm counting on you", romaji:"Yoroshiku onegaishimasu", category:"Politeness", notes:"Multi-purpose polite request or closing." },
  // Shopping & Transactions
  { phrase:"いくらですか？", meaning:"How much is it?", romaji:"Ikura desu ka?", category:"Shopping", notes:"Basic price enquiry." },
  { phrase:"これをください", meaning:"Please give me this / I'll take this.", romaji:"Kore wo kudasai.", category:"Shopping", notes:"Used to order or purchase." },
  { phrase:"クレジットカードは使えますか？", meaning:"Can I use a credit card?", romaji:"Kurejitto kaado wa tsukaemasu ka?", category:"Shopping", notes:"Useful at shops and restaurants." },
  { phrase:"レシートをください", meaning:"Please give me a receipt.", romaji:"Reshiito wo kudasai.", category:"Shopping", notes:"Requesting a receipt." },
  { phrase:"袋は要りません", meaning:"I don't need a bag.", romaji:"Fukuro wa irimasen.", category:"Shopping", notes:"Common eco-conscious phrase." },
  // Directions & Transport
  { phrase:"〜はどこですか？", meaning:"Where is ~?", romaji:"~ wa doko desu ka?", category:"Directions", notes:"Replace 〜 with the place you're looking for." },
  { phrase:"〜駅まで、お願いします。", meaning:"To ~ station, please.", romaji:"~ eki made, onegaishimasu.", category:"Directions", notes:"Said to a taxi driver." },
  { phrase:"〜はどうやって行きますか？", meaning:"How do I get to ~?", romaji:"~ wa douyatte ikimasu ka?", category:"Directions", notes:"Asking for directions." },
  { phrase:"まっすぐ行ってください", meaning:"Please go straight ahead.", romaji:"Massugu itte kudasai.", category:"Directions", notes:"Giving or understanding directions." },
  { phrase:"右に曲がってください", meaning:"Please turn right.", romaji:"Migi ni magatte kudasai.", category:"Directions", notes:"Turning right." },
  { phrase:"左に曲がってください", meaning:"Please turn left.", romaji:"Hidari ni magatte kudasai.", category:"Directions", notes:"Turning left." },
  // Restaurants
  { phrase:"〜を一つください", meaning:"One ~ please.", romaji:"~ wo hitotsu kudasai.", category:"Restaurant", notes:"Ordering a single item." },
  { phrase:"おすすめは何ですか？", meaning:"What do you recommend?", romaji:"Osusume wa nan desu ka?", category:"Restaurant", notes:"Asking for a recommendation." },
  { phrase:"お会計をお願いします", meaning:"Check / bill please.", romaji:"Okaikei wo onegaishimasu.", category:"Restaurant", notes:"Asking for the bill." },
  { phrase:"別々に払いたいです", meaning:"I'd like to pay separately.", romaji:"Betsubetsu ni haraitai desu.", category:"Restaurant", notes:"Splitting the bill." },
  // Medical & Emergency
  { phrase:"病院はどこですか？", meaning:"Where is the hospital?", romaji:"Byouin wa doko desu ka?", category:"Emergency", notes:"Finding medical help." },
  { phrase:"救急車を呼んでください", meaning:"Please call an ambulance.", romaji:"Kyuukyuusha wo yonde kudasai.", category:"Emergency", notes:"Emergency phrase." },
  { phrase:"〜が痛いです", meaning:"My ~ hurts.", romaji:"~ ga itai desu.", category:"Emergency", notes:"Replace 〜 with the body part, e.g. 頭 (atama=head)." },
  { phrase:"日本語が少し話せます", meaning:"I can speak a little Japanese.", romaji:"Nihongo ga sukoshi hanasemasu.", category:"Communication", notes:"Useful when communicating ability." },
  { phrase:"英語が話せる人はいますか？", meaning:"Is there someone who can speak English?", romaji:"Eigo ga hanaseru hito wa imasu ka?", category:"Communication", notes:"Looking for an English speaker." },
  { phrase:"もう少しゆっくり話してください", meaning:"Please speak a little more slowly.", romaji:"Mou sukoshi yukkuri hanashite kudasai.", category:"Communication", notes:"Very useful for learners." },
  { phrase:"もう一度言ってください", meaning:"Please say that one more time.", romaji:"Mou ichido itte kudasai.", category:"Communication", notes:"Asking for repetition." },
  { phrase:"〜はどういう意味ですか？", meaning:"What does ~ mean?", romaji:"~ wa dou iu imi desu ka?", category:"Communication", notes:"Asking for the meaning of a word." },
];

// ============================================================
// SENTENCES (natural full Japanese sentences)
// ============================================================
const SENTENCES = [
  { japanese:"私の名前はジョンです。", reading:"わたしのなまえはジョンです。", english:"My name is John.", level:"Beginner", category:"Self Introduction" },
  { japanese:"日本語を勉強しています。", reading:"にほんごをべんきょうしています。", english:"I am studying Japanese.", level:"Beginner", category:"Self Introduction" },
  { japanese:"アメリカから来ました。", reading:"アメリカからきました。", english:"I came from America.", level:"Beginner", category:"Self Introduction" },
  { japanese:"今日はいい天気ですね。", reading:"きょうはいいてんきですね。", english:"The weather is nice today, isn't it?", level:"Beginner", category:"Small Talk" },
  { japanese:"少し日本語が話せます。", reading:"すこしにほんごがはなせます。", english:"I can speak a little Japanese.", level:"Beginner", category:"Small Talk" },
  { japanese:"電車は何時に来ますか？", reading:"でんしゃはなんじにきますか？", english:"What time does the train come?", level:"Beginner", category:"Transport" },
  { japanese:"新宿駅まで行きたいです。", reading:"しんじゅくえきまでいきたいです。", english:"I want to go to Shinjuku station.", level:"Beginner", category:"Transport" },
  { japanese:"すみません、このバスは渋谷に行きますか？", reading:"すみません、このバスはしぶやにいきますか？", english:"Excuse me, does this bus go to Shibuya?", level:"Intermediate", category:"Transport" },
  { japanese:"近くにコンビニはありますか？", reading:"ちかくにコンビニはありますか？", english:"Is there a convenience store nearby?", level:"Beginner", category:"Directions" },
  { japanese:"この道をまっすぐ行ってください。", reading:"このみちをまっすぐいってください。", english:"Please go straight down this road.", level:"Beginner", category:"Directions" },
  { japanese:"右に曲がると駅が見えます。", reading:"みぎにまがるとえきがみえます。", english:"If you turn right you'll see the station.", level:"Intermediate", category:"Directions" },
  { japanese:"日本料理の中で寿司が一番好きです。", reading:"にほんりょうりのなかですしがいちばんすきです。", english:"Among Japanese food, I like sushi the best.", level:"Beginner", category:"Food" },
  { japanese:"このラーメンはとてもおいしいです。", reading:"このラーメンはとてもおいしいです。", english:"This ramen is very delicious.", level:"Beginner", category:"Food" },
  { japanese:"辛い食べ物は少し苦手です。", reading:"からいたべものはすこしにがてです。", english:"I am not very good with spicy food.", level:"Intermediate", category:"Food" },
  { japanese:"昨日の夜は何を食べましたか？", reading:"きのうのよるはなにをたべましたか？", english:"What did you eat last night?", level:"Beginner", category:"Food" },
  { japanese:"熱が出ています。医者に診てもらいたいです。", reading:"ねつがでています。いしゃにみてもらいたいです。", english:"I have a fever. I'd like to see a doctor.", level:"Intermediate", category:"Health" },
  { japanese:"頭が痛くて、仕事を休みました。", reading:"あたまがいたくて、しごとをやすみました。", english:"I had a headache so I took the day off work.", level:"Intermediate", category:"Health" },
  { japanese:"毎朝ジョギングをして体を動かしています。", reading:"まいあさジョギングをしてからだをうごかしています。", english:"I jog every morning to keep my body moving.", level:"Intermediate", category:"Health" },
  { japanese:"来週の金曜日に会議があります。", reading:"らいしゅうのきんようびにかいぎがあります。", english:"There is a meeting next Friday.", level:"Intermediate", category:"Work" },
  { japanese:"このプロジェクトは来月までに終わらせる必要があります。", reading:"このプロジェクトはらいげつまでにおわらせるひつようがあります。", english:"We need to finish this project by next month.", level:"Advanced", category:"Work" },
  { japanese:"報告書を書くのに三時間かかりました。", reading:"ほうこくしょをかくのにさんじかんかかりました。", english:"It took me three hours to write the report.", level:"Intermediate", category:"Work" },
  { japanese:"今日は雨が降っているので傘を持ってきました。", reading:"きょうはあめがふっているのでかさをもってきました。", english:"Since it is raining today, I brought an umbrella.", level:"Intermediate", category:"Weather" },
  { japanese:"明日から気温が下がるそうです。", reading:"あしたからきおんがさがるそうです。", english:"I hear the temperature will drop from tomorrow.", level:"Intermediate", category:"Weather" },
  { japanese:"春は桜がとてもきれいです。", reading:"はるはさくらがとてもきれいです。", english:"Cherry blossoms are very beautiful in spring.", level:"Beginner", category:"Weather" },
  { japanese:"彼女は日本語が上手です。", reading:"かのじょはにほんごがじょうずです。", english:"She is good at Japanese.", level:"Beginner", category:"Compliments" },
  { japanese:"その映画はとても面白かったです。", reading:"そのえいがはとてもおもしろかったです。", english:"That movie was very interesting.", level:"Beginner", category:"Opinions" },
  { japanese:"東京は物価が高いと思います。", reading:"とうきょうはぶっかがたかいとおもいます。", english:"I think prices in Tokyo are expensive.", level:"Intermediate", category:"Opinions" },
  { japanese:"日本語の文法はとても難しいですが、楽しいです。", reading:"にほんごのぶんぽうはとてもむずかしいですが、たのしいです。", english:"Japanese grammar is very difficult, but it is fun.", level:"Intermediate", category:"Study" },
  { japanese:"漢字を覚えるのに毎日練習しています。", reading:"かんじをおぼえるのにまいにちれんしゅうしています。", english:"I practice every day to memorize kanji.", level:"Intermediate", category:"Study" },
  { japanese:"日本のアニメを見て日本語を勉強しました。", reading:"にほんのアニメをみてにほんごをべんきょうしました。", english:"I studied Japanese by watching Japanese anime.", level:"Intermediate", category:"Study" },
  { japanese:"週末は友達と映画を見に行く予定です。", reading:"しゅうまつはともだちとえいがをみにいくよていです。", english:"I plan to go see a movie with friends on the weekend.", level:"Intermediate", category:"Weekend" },
  { japanese:"公園でピクニックをしながら本を読みました。", reading:"こうえんでピクニックをしながらほんをよみました。", english:"I read a book while having a picnic in the park.", level:"Intermediate", category:"Weekend" },
  { japanese:"旅行中に色々な人と出会いました。", reading:"りょこうちゅうにいろいろなひととであいました。", english:"I met various people during my trip.", level:"Advanced", category:"Travel" },
  { japanese:"京都のお寺は世界中から観光客が来ます。", reading:"きょうとのおてらはせかいじゅうからかんこうきゃくがきます。", english:"Tourists come to Kyoto's temples from around the world.", level:"Advanced", category:"Travel" },
  { japanese:"新幹線に乗って大阪に行ったことがあります。", reading:"しんかんせんにのっておおさかにいったことがあります。", english:"I have been to Osaka by Shinkansen.", level:"Intermediate", category:"Travel" },
];

// ============================================================
// QUIZ QUESTION GENERATORS
// ============================================================
function getRandomItems(arr, n) {
  const copy = [...arr];
  const result = [];
  while (result.length < n && copy.length > 0) {
    const idx = Math.floor(Math.random() * copy.length);
    result.push(copy.splice(idx, 1)[0]);
  }
  return result;
}

function generateKanjiQuiz(item, allItems) {
  const type = Math.random() < 0.5 ? 'meaning' : 'reading';
  const wrongs = getRandomItems(allItems.filter(k => k.kanji !== item.kanji), 3);
  let options, correct, question, hint;
  if (type === 'meaning') {
    question = `What is the meaning of "${item.kanji}"?`;
    hint = item.readings[0];
    correct = item.meaning;
    options = [correct, ...wrongs.map(k => k.meaning)];
  } else {
    question = `What is the reading of "${item.kanji}"?`;
    hint = item.meaning;
    correct = item.readings[0];
    options = [correct, ...wrongs.map(k => k.readings[0])];
  }
  return { question, hint, correct, options: options.sort(() => Math.random() - 0.5), item };
}

function generateVocabQuiz(item, allItems) {
  const type = Math.random() < 0.5 ? 'meaning' : 'reading';
  const wrongs = getRandomItems(allItems.filter(v => v.word !== item.word), 3);
  let options, correct, question, hint;
  if (type === 'meaning') {
    question = `What does "${item.word}" mean?`;
    hint = item.reading;
    correct = item.meaning;
    options = [correct, ...wrongs.map(v => v.meaning)];
  } else {
    question = `How do you read "${item.word}"?`;
    hint = item.meaning;
    correct = item.reading;
    options = [correct, ...wrongs.map(v => v.reading)];
  }
  return { question, hint, correct, options: options.sort(() => Math.random() - 0.5), item };
}
