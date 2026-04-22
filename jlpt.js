// ===== JLPT PRACTICE SYSTEM =====
// Practice JLPT N5-N1 questions organized by level and question type
// Integrates with MoeBucks economy, expedition loot, and XP systems

// ===== QUESTION TYPES =====
// mondai1: Kanji Reading - given kanji, pick correct hiragana
// mondai2: Kanji Writing - given hiragana, pick correct kanji
// mondai3: Vocabulary/Context - fill in blank with correct word
// mondai4: Paraphrase - pick closest meaning
// mondai5: Word Usage - pick correct usage of word in sentences
// mondai6: Grammar Fill - pick correct grammar for blank
// mondai7: Sentence Order - (N1/N2 style) arrange sentence parts

const JLPT_QUESTIONS = {
  N5: {
    mondai1: [
      { q: '山田さんは毎朝七時に起きます。', target: '七時', options: ['しちじ','ななじ','しちどき','ひちじ'], answer: 0 },
      { q: 'この花は白いです。', target: '白い', options: ['くろい','あかい','しろい','あおい'], answer: 2 },
      { q: '来週の月曜日にテストがあります。', target: '来週', options: ['らいしゅう','きしゅう','こんしゅう','せんしゅう'], answer: 0 },
      { q: '駅の東口で待っています。', target: '東口', options: ['ひがしくち','ひがしぐち','とうぐち','あずまぐち'], answer: 1 },
      { q: '毎日三十分歩きます。', target: '三十分', options: ['さんじっぷん','さんじゅっぷん','さんじゅうぶん','みそふん'], answer: 0 },
      { q: '父は会社で働いています。', target: '会社', options: ['かいしゃ','かいさ','がいしゃ','がいさ'], answer: 0 },
      { q: '先生は教室にいます。', target: '教室', options: ['きょうしつ','きょしつ','きょうしゅつ','がくしつ'], answer: 0 },
      { q: '夏休みに海へ行きました。', target: '夏休み', options: ['なつやすみ','かきゅうみ','なつきゅうみ','なつやみ'], answer: 0 },
      { q: '電車で学校に通います。', target: '電車', options: ['でんしゃ','でんち','てんしゃ','じどうしゃ'], answer: 0 },
      { q: 'お姉さんは大学生です。', target: '大学生', options: ['だいがくせい','おおがくせい','たいがくせい','だいがくしょう'], answer: 0 },
      { q: '天気がいい日に公園で遊びます。', target: '天気', options: ['てんき','あまき','てんぎ','そらき'], answer: 0 },
      { q: '図書館で本を読みました。', target: '図書館', options: ['としょかん','ずしょかん','としょがん','とかん'], answer: 0 },
    ],
    mondai2: [
      { q: 'きのうデパートでかいものをしました。', target: 'かいもの', options: ['買物','買い物','貝物','飼い物'], answer: 1 },
      { q: 'わたしのへやは二かいにあります。', target: 'へや', options: ['部家','都屋','部屋','室屋'], answer: 2 },
      { q: 'あのみせはやすくておいしいです。', target: 'みせ', options: ['見せ','店','身せ','味せ'], answer: 1 },
      { q: 'にちようびにともだちとあそびます。', target: 'にちようび', options: ['日曜日','日要日','日用日','日陽日'], answer: 0 },
      { q: 'おかあさんにてがみをかきました。', target: 'てがみ', options: ['手紙','手書','手髪','手上'], answer: 0 },
      { q: 'がっこうまであるいていきます。', target: 'あるいて', options: ['走いて','歩いて','足いて','歩て'], answer: 1 },
      { q: 'やまのうえからうみがみえます。', target: 'うみ', options: ['湖','海','池','川'], answer: 1 },
      { q: 'しんぶんをよみます。', target: 'しんぶん', options: ['新開','新文','新聞','親文'], answer: 2 },
      { q: 'あしたのあさはやくおきます。', target: 'あさ', options: ['朝','昼','夕','晩'], answer: 0 },
      { q: 'ちちはびょういんではたらいています。', target: 'びょういん', options: ['病因','病院','美容院','病員'], answer: 1 },
    ],
    mondai3: [
      { q: 'テストの前に（　　）勉強しました。', options: ['たくさん','たいてい','だんだん','ときどき'], answer: 0 },
      { q: 'この問題は（　　）です。わかりません。', options: ['やさしい','むずかしい','おもしろい','つまらない'], answer: 1 },
      { q: '暑いですから、窓を（　　）ください。', options: ['しめて','あけて','つけて','けして'], answer: 1 },
      { q: '（　　）が降っているので、傘を持っていきます。', options: ['雪','風','雨','雲'], answer: 2 },
      { q: 'お茶を（　　）飲みませんか。', options: ['一度','一杯','一本','一台'], answer: 1 },
      { q: '友達の誕生日に（　　）をあげました。', options: ['おかし','プレゼント','きっぷ','しゅくだい'], answer: 1 },
      { q: 'この辞書は（　　）から、かばんに入れます。', options: ['大きい','小さい','重い','長い'], answer: 1 },
      { q: '駅は家から（　　）歩いて10分です。', options: ['だいたい','ちょうど','まっすぐ','もっと'], answer: 0 },
      { q: '毎晩シャワーを（　　）。', options: ['あらいます','あびます','つかいます','みがきます'], answer: 1 },
      { q: '日本語がまだ（　　）です。', options: ['じょうず','へた','だめ','すき'], answer: 1 },
    ],
    mondai4: [
      { q: 'このりんごはとてもおいしいです。', target: 'とても', options: ['すこし','たいへん','あまり','ちょっと'], answer: 1 },
      { q: '田中さんは毎日はやく起きます。', target: 'はやく', options: ['おそく','ゆっくり','あさ はやい じかんに','よる おそい じかんに'], answer: 2 },
      { q: 'もう一度言ってください。', target: 'もう一度', options: ['はじめて','また','はじめに','さいごに'], answer: 1 },
      { q: 'あの映画はつまらなかったです。', target: 'つまらなかった', options: ['おもしろかった','たのしかった','おもしろくなかった','むずかしかった'], answer: 2 },
      { q: 'すぐに来てください。', target: 'すぐに', options: ['はやく','ゆっくり','あとで','まえに'], answer: 0 },
      { q: '少し休みましょう。', target: '少し', options: ['たくさん','ちょっと','ぜんぶ','とても'], answer: 1 },
      { q: '彼は背が高いです。', target: '背が高い', options: ['せが ひくい','からだが おおきい','からだが ながい','せが おおきい'], answer: 1 },
      { q: 'この本はたいへんおもしろいです。', target: 'たいへん', options: ['あまり','とても','ちょっと','すこし'], answer: 1 },
    ],
    mondai5: [
      { q: 'まっすぐ', options: [
        'この道をまっすぐ行ってください。',
        'まっすぐ料理を作りました。',
        'まっすぐテレビを見ています。',
        'まっすぐ友達に会いました。'
      ], answer: 0 },
      { q: 'ちょうど', options: [
        'ちょうど走って学校に行きます。',
        '今ちょうど３時です。',
        'ちょうど大きいかばんです。',
        'ちょうど雨が好きです。'
      ], answer: 1 },
      { q: 'だんだん', options: [
        'だんだん学校に行きました。',
        'だんだん朝ごはんを食べました。',
        '日本語がだんだん上手になりました。',
        'だんだんテストを受けました。'
      ], answer: 2 },
      { q: 'はっきり', options: [
        'はっきり寝ました。',
        'もっとはっきり言ってください。',
        'はっきり食べました。',
        'はっきり走りました。'
      ], answer: 1 },
    ],
    mondai6: [
      { q: '明日テストがある（　　）、今日は勉強します。', options: ['ので','のに','けど','でも'], answer: 0 },
      { q: '日本語は英語（　　）むずかしいです。', options: ['まで','から','より','ほど'], answer: 2 },
      { q: 'まだごはんを食べて（　　）。', options: ['います','あります','いません','ありません'], answer: 2 },
      { q: '明日は雨が降る（　　）思います。', options: ['を','に','と','で'], answer: 2 },
      { q: '友達に本を（　　）もらいました。', options: ['かして','かりて','あげて','くれて'], answer: 0 },
      { q: '駅の前（　　）バスに乗ります。', options: ['に','で','を','が'], answer: 1 },
      { q: 'このケーキは甘（　　）ておいしいです。', options: ['い','く','くて','い'], answer: 2 },
      { q: '田中さんは今勉強（　　）いるところです。', options: ['を','が','して','の'], answer: 2 },
    ],
  },
  N4: {
    mondai1: [
      { q: '世界中の人々が平和をのぞんでいます。', target: '世界中', options: ['せかいちゅう','せかいじゅう','せいかいちゅう','よかいちゅう'], answer: 1 },
      { q: '最近忙しくてなかなか会えません。', target: '最近', options: ['さいきん','さいちか','もっとも','さっきん'], answer: 0 },
      { q: '去年の夏に引っ越しました。', target: '引っ越し', options: ['ひっこし','いっこし','ひきこし','ぬきこし'], answer: 0 },
      { q: 'この建物は有名な建築家が設計しました。', target: '建物', options: ['たてもの','けんぶつ','けんもの','たちもの'], answer: 0 },
      { q: '彼は試合に勝って喜んでいます。', target: '試合', options: ['しあい','しごう','けんあい','しけん'], answer: 0 },
      { q: '必ず約束を守ってください。', target: '必ず', options: ['かならず','ひつず','いそず','たしず'], answer: 0 },
      { q: '駅前の交差点で事故がありました。', target: '交差点', options: ['こうさてん','こうさどう','こうちてん','こさてん'], answer: 0 },
      { q: '彼女は優しい性格です。', target: '性格', options: ['せいかく','しょうかく','せかく','しんかく'], answer: 0 },
      { q: '今月の売り上げは先月より増えました。', target: '増えました', options: ['ふえました','ましました','そえました','くわえました'], answer: 0 },
      { q: 'この問題の答えを教えてください。', target: '答え', options: ['こたえ','とうえ','あたえ','おしえ'], answer: 0 },
    ],
    mondai2: [
      { q: '来月からあたらしい仕事をはじめます。', target: 'あたらしい', options: ['新しい','荒しい','改しい','親しい'], answer: 0 },
      { q: 'にわにきれいなはなが咲いています。', target: 'にわ', options: ['庭','園','畑','原'], answer: 0 },
      { q: '電車のなかでおんがくをきいています。', target: 'おんがく', options: ['音学','音楽','恩楽','温学'], answer: 1 },
      { q: 'あのかどをまがってください。', target: 'まがって', options: ['曲がって','回がって','折がって','巻がって'], answer: 0 },
      { q: 'このくすりを一日三回のんでください。', target: 'くすり', options: ['草','楽','薬','薫'], answer: 2 },
      { q: 'きょねんの夏はとてもあつかったです。', target: 'あつかった', options: ['暑かった','熱かった','厚かった','篤かった'], answer: 0 },
      { q: 'せんたくものをほしました。', target: 'せんたく', options: ['洗たく','洗択','選択','洗濯'], answer: 3 },
      { q: 'きのうびょういんにいきました。', target: 'びょういん', options: ['病因','病院','美容院','病員'], answer: 1 },
    ],
    mondai3: [
      { q: '授業に遅れないように、（　　）家を出ます。', options: ['ゆっくり','はやめに','おそく','しずかに'], answer: 1 },
      { q: '大切な書類を（　　）しまいました。', options: ['なくして','みつけて','ひろって','ならべて'], answer: 0 },
      { q: '先生のおかげで、日本語が（　　）なりました。', options: ['じょうずに','へたに','すきに','きらいに'], answer: 0 },
      { q: 'すみません、道を（　　）いただけませんか。', options: ['おしえて','つたえて','はなして','よんで'], answer: 0 },
      { q: 'この部屋は（　　）が足りないので暗いです。', options: ['あかり','かぜ','おと','におい'], answer: 0 },
      { q: '兄は（　　）が広くて友達がたくさんいます。', options: ['かお','こころ','て','あし'], answer: 0 },
      { q: '子どもが熱を出したので、（　　）します。', options: ['けんがく','しんさつ','よやく','りょこう'], answer: 1 },
      { q: '忘れないうちに（　　）をしておきましょう。', options: ['メモ','テスト','ゲーム','スピーチ'], answer: 0 },
      { q: 'この本は内容が（　　）ので、何度も読み返しました。', options: ['かんたん','ふくざつ','たんじゅん','すなお'], answer: 1 },
      { q: '食べ物がないので、（　　）に行きましょう。', options: ['かいもの','さんぽ','りょこう','べんきょう'], answer: 0 },
    ],
    mondai4: [
      { q: 'この料理はあっさりしていておいしい。', target: 'あっさり', options: ['こってり','さっぱり','しっかり','すっきり'], answer: 1 },
      { q: '会議の日程を調整しなければなりません。', target: '調整', options: ['ちょうせい','あわせること','ただすこと','しらべること'], answer: 1 },
      { q: 'こんなにたくさん食べられません。', target: 'こんなに', options: ['こんなふうに','これほど','このように','あんなに'], answer: 1 },
      { q: 'もうすぐ届くと思います。', target: 'もうすぐ', options: ['ずっとまえに','まもなく','いつか','そのうち'], answer: 1 },
      { q: '彼のやり方はいつもていねいです。', target: 'ていねい', options: ['らんぼう','しんせつ','きちんとした','おおざっぱ'], answer: 2 },
      { q: '散歩のついでに買い物をしました。', target: 'ついでに', options: ['あとで','いっしょに','そのときに','するときに'], answer: 2 },
    ],
    mondai5: [
      { q: 'しっかり', options: [
        'しっかり勉強して、テストに合格しました。',
        'しっかり天気がいいですね。',
        'しっかり電車が来ました。',
        'しっかりりんごが赤いです。'
      ], answer: 0 },
      { q: 'うっかり', options: [
        'うっかり走って学校に行きました。',
        'うっかり電車に乗りました。',
        'うっかり約束を忘れてしまいました。',
        'うっかり天気が良かったです。'
      ], answer: 2 },
      { q: 'そろそろ', options: [
        'そろそろ去年の夏は暑かったです。',
        'そろそろ帰る時間です。',
        'そろそろこの本は高いです。',
        'そろそろ東京は大きいです。'
      ], answer: 1 },
      { q: 'のんびり', options: [
        'のんびりテストを受けます。',
        '休みの日はのんびりすごします。',
        'のんびり電車が速いです。',
        'のんびり雨が降りました。'
      ], answer: 1 },
    ],
    mondai6: [
      { q: '母に手伝って（　　）と思います。', options: ['もらおう','あげよう','くれよう','やろう'], answer: 0 },
      { q: '友達が来る前に部屋を（　　）おきます。', options: ['かたづけて','かたづけ','かたづけた','かたづける'], answer: 0 },
      { q: '日本へ行った（　　）、富士山に登りたいです。', options: ['とき','こと','ら','もの'], answer: 2 },
      { q: '先生の話（　　）よると、明日は休みだそうです。', options: ['を','が','に','で'], answer: 2 },
      { q: '疲れている（　　）、もう少し頑張りましょう。', options: ['ので','のに','けど','から'], answer: 2 },
      { q: '電気をつけた（　　）寝てしまいました。', options: ['ため','まま','ほど','ばかり'], answer: 1 },
      { q: '彼は風邪を（　　）そうな顔をしています。', options: ['ひき','ひいた','ひく','ひいて'], answer: 0 },
      { q: '勉強すれば（　　）ほど日本語が上手になります。', options: ['した','する','して','しよう'], answer: 1 },
    ],
  },
  N3: {
    mondai1: [
      { q: '山本さんはクラスの代表に選ばれた。', target: '代表', options: ['たいひょう','だいひょ','だいひょう','たいひょ'], answer: 2 },
      { q: '３日前から雨が続いている。', target: '続いて', options: ['ういて','うごいて','ついて','つづいて'], answer: 3 },
      { q: '彼の意見に反対する人が多い。', target: '反対', options: ['はんたい','はんだい','はったい','ほんたい'], answer: 0 },
      { q: '地球の環境を守ることが大切です。', target: '環境', options: ['かんきょう','かんけい','がんきょう','かんけん'], answer: 0 },
      { q: '子どもたちは元気に遊んでいる。', target: '元気', options: ['げんき','がんき','もとき','けんき'], answer: 0 },
      { q: '会議の結果を報告してください。', target: '結果', options: ['けっか','けつか','けいか','けいが'], answer: 0 },
      { q: '彼女は自分の経験を話してくれた。', target: '経験', options: ['けいけん','けんけん','きょうけん','けいげん'], answer: 0 },
      { q: '先生は生徒の質問に答えました。', target: '質問', options: ['しつもん','しもん','しつぶん','ちもん'], answer: 0 },
      { q: 'この商品の値段を確認しました。', target: '値段', options: ['ねだん','ちだん','かだん','あたいだん'], answer: 0 },
      { q: '彼は将来医者になりたいそうです。', target: '将来', options: ['しょうらい','しょうかい','しょうたい','じょうらい'], answer: 0 },
    ],
    mondai2: [
      { q: 'アルバイトのめんせつは来週の土曜日だ。', target: 'めんせつ', options: ['面接','面投','両接','両投'], answer: 0 },
      { q: '困っているときに、先生にたすけていただきました。', target: 'たすけて', options: ['助けて','守けて','支けて','協けて'], answer: 0 },
      { q: 'この漢字のいみがわかりません。', target: 'いみ', options: ['意見','意味','意思','意外'], answer: 1 },
      { q: '来月からかいがいに出張します。', target: 'かいがい', options: ['海外','会外','開外','回外'], answer: 0 },
      { q: 'このきかいの使い方を教えてください。', target: 'きかい', options: ['期会','機械','機会','気会'], answer: 1 },
      { q: 'かれは政治にきょうみがある。', target: 'きょうみ', options: ['共味','興見','興味','教味'], answer: 2 },
      { q: 'このへんは夜になるとしずかです。', target: 'しずか', options: ['静か','清か','性か','精か'], answer: 0 },
      { q: 'けいざいの勉強をしています。', target: 'けいざい', options: ['経在','経済','計済','形済'], answer: 1 },
    ],
    mondai3: [
      { q: '（　　）寝たので、気持ちがいい。', options: ['すっかり','ぐっすり','はっきり','びったり'], answer: 1 },
      { q: 'ここのパソコンは誰でも使えますが、コピーは（　　）です。', options: ['会費','費用','有料','料金'], answer: 2 },
      { q: '彼は仕事に（　　）がないので、ミスが多い。', options: ['関心','注意','責任','信用'], answer: 1 },
      { q: '電車の中で（　　）人の足を踏んでしまいました。', options: ['わざと','うっかり','しっかり','はっきり'], answer: 1 },
      { q: '最近、体の（　　）が悪いので、病院に行きます。', options: ['調子','機嫌','様子','加減'], answer: 0 },
      { q: 'この契約は来月（　　）します。', options: ['期限','満了','終了','完成'], answer: 2 },
      { q: '仕事で（　　）したことを上司に報告しました。', options: ['失敗','成功','努力','経験'], answer: 0 },
      { q: 'レストランを（　　）してから行きましょう。', options: ['予約','予定','予想','予告'], answer: 0 },
    ],
    mondai4: [
      { q: '次々に新しいゲームが作られる。', target: '次々に', options: ['だんだん','これから','いつでも','どんどん'], answer: 3 },
      { q: '明日の飛行機の予約を確認してください。', target: '確認', options: ['変えて','調べて','行って','頼んで'], answer: 1 },
      { q: 'この問題はかなり複雑です。', target: 'かなり', options: ['すこし','ずいぶん','あまり','ちょっと'], answer: 1 },
      { q: '彼は仕事に熱心です。', target: '熱心', options: ['冷たい','一生懸命','退屈','のんき'], answer: 1 },
      { q: '残念ながら、参加できません。', target: '残念', options: ['うれしい','かなしい','くやしい','くるしい'], answer: 2 },
      { q: 'もっと具体的に説明してください。', target: '具体的', options: ['かんたん','くわしく','みじかく','あいまい'], answer: 1 },
    ],
    mondai5: [
      { q: '今ごろ', options: [
        'それでは、今ごろテストを始めます。',
        '今ごろ東京では桜が咲いているでしょう。',
        '今ごろ現金で支払うことが少なくなった。',
        '今ごろ雨が降りそうな天気だ。'
      ], answer: 1 },
      { q: 'かわいがる', options: [
        '山田さんは子どもをとてもかわいがっています。',
        'あの人は親をとてもかわいがっています。',
        '田中さんは、いただいた時計をとてもかわいがっています。',
        'あの人は自分の家をとてもかわいがっています。'
      ], answer: 0 },
      { q: 'たまたま', options: [
        'たまたま毎日練習しています。',
        '駅でたまたま友達に会いました。',
        'たまたまいつも遅刻します。',
        '彼はたまたま真面目な人です。'
      ], answer: 1 },
      { q: 'いきいき', options: [
        '彼女はいきいきと話していました。',
        'いきいきと雨が降っています。',
        '道がいきいきしています。',
        'いきいき電車が来ました。'
      ], answer: 0 },
    ],
    mondai6: [
      { q: '忙しい（　　）、健康に気をつけてください。', options: ['うちに','ところで','からこそ','としても'], answer: 2 },
      { q: 'この仕事は経験が（　　）やれません。', options: ['あれば','なければ','あっても','なくても'], answer: 1 },
      { q: '来週中にレポートを（　　）ことになっています。', options: ['出す','出した','出して','出そう'], answer: 0 },
      { q: '天気予報（　　）よると、明日は晴れるそうです。', options: ['に','で','が','を'], answer: 0 },
      { q: '彼は疲れている（　　）、まだ働いています。', options: ['ので','のに','から','ため'], answer: 1 },
      { q: '母に言われた（　　）に掃除をしました。', options: ['こと','もの','とおり','ところ'], answer: 2 },
      { q: '新しい先生は厳しい（　　）、とても優しい。', options: ['くせに','反面','以上','ように'], answer: 1 },
      { q: '練習を続けた（　　）、やっと上手になった。', options: ['おかげで','せいで','かわりに','わりに'], answer: 0 },
    ],
  },
  N2: {
    mondai1: [
      { q: '戦後、日本は貧しい時代を経験した。', target: '貧しい', options: ['まずしい','きびしい','けわしい','はげしい'], answer: 0 },
      { q: 'この黒い種からどんな花がさくのだろうか。', target: '種', options: ['だね','たね','じゅ','しゅ'], answer: 1 },
      { q: '日本の伝統文化を受け継いでいく。', target: '伝統', options: ['でんとう','てんとう','でんづう','てんづう'], answer: 0 },
      { q: '彼の才能は周囲に認められている。', target: '周囲', options: ['しゅうい','しゅうかい','ちゅうい','しゅうへん'], answer: 0 },
      { q: '彼女の提案は非常に合理的だ。', target: '合理的', options: ['ごうりてき','あいりてき','がっりてき','かつりてき'], answer: 0 },
      { q: '新しい法律が施行された。', target: '施行', options: ['しこう','せこう','せいこう','しぎょう'], answer: 0 },
      { q: '交渉の結果、契約が成立した。', target: '交渉', options: ['こうしょう','こうせつ','きょうしょう','こうりゅう'], answer: 0 },
      { q: '国民の義務を果たす。', target: '義務', options: ['ぎむ','きむ','ぎぶ','きぶ'], answer: 0 },
    ],
    mondai2: [
      { q: '今日は、ごみのしゅうしゅう日ですか。', target: 'しゅうしゅう', options: ['拾集','修集','取集','収集'], answer: 3 },
      { q: 'このカメラはデザインも性能もすぐれている。', target: 'すぐれて', options: ['超れて','恵れて','秀れて','優れて'], answer: 3 },
      { q: 'この問題のかいけつ方法を考えましょう。', target: 'かいけつ', options: ['解決','開決','回決','改決'], answer: 0 },
      { q: 'けいかくを立ててから行動しましょう。', target: 'けいかく', options: ['経画','計画','係画','形画'], answer: 1 },
      { q: '彼のたいどは失礼だ。', target: 'たいど', options: ['対度','態度','体度','大度'], answer: 1 },
      { q: '友達にしょうたいされました。', target: 'しょうたい', options: ['紹対','招体','招待','称帯'], answer: 2 },
    ],
    mondai3: [
      { q: '新しい商品を売るために、彼は毎日忙しく飛び（　　）いる。', options: ['かかって','かけて','まわって','まわして'], answer: 2 },
      { q: 'あの映画の最後は（　　）場面として知られている。', options: ['名','高','良','真'], answer: 0 },
      { q: '彼女のスピーチは聴衆の心を（　　）。', options: ['うった','たたいた','はった','ぬった'], answer: 0 },
      { q: 'この問題については（　　）議論が必要です。', options: ['軽い','浅い','深い','薄い'], answer: 2 },
      { q: '彼の意見は（　　）的で分かりやすい。', options: ['具体','抽象','一般','基本'], answer: 0 },
      { q: '新しいプロジェクトの（　　）を立てましょう。', options: ['計画','会計','設計','企画'], answer: 0 },
    ],
    mondai4: [
      { q: '日本人の平均（　　）は、男性が79歳、女性が86歳である。', options: ['生命','寿命','人生','一生'], answer: 1 },
      { q: 'CDの売り上げは3年（　　）で減少しているそうだ。', options: ['連続','接続','持続','相続'], answer: 0 },
      { q: '田中さんは単なる友人です。', target: '単なる', options: ['大切な','一生の','ただの','唯一の'], answer: 2 },
      { q: 'あの人のお母さんはいつもほがらかです。', target: 'ほがらか', options: ['おとなしい','まじめ','りっぱ','あかるい'], answer: 3 },
      { q: '彼は非常に優秀な学生です。', target: '優秀', options: ['すぐれた','ふつうの','おとった','あたらしい'], answer: 0 },
      { q: '彼女の態度はぞんざいだ。', target: 'ぞんざい', options: ['ていねい','いいかげん','しんけん','まじめ'], answer: 1 },
    ],
    mondai5: [
      { q: '余計', options: [
        '一人暮らしだと野菜がすぐ余計になってしまう。',
        '話が複雑になるから、余計なことは言わないで。',
        '余計があったら、ひとつ貸してもらえませんか。',
        'このごろ仕事が忙しくて、遊びに行く余計がない。'
      ], answer: 1 },
      { q: '率直', options: [
        'あの人は率直に仕事をしているので、評判がいい。',
        'この申込書にはあなたの住所を率直に書いてください。',
        'このアンケートには、皆様のご意見を率直にお書きください。',
        'お客様からの苦情には率直に対応する必要がある。'
      ], answer: 2 },
      { q: 'かえって', options: [
        '薬を飲んだら、かえって元気になった。',
        '説明を聞いたら、かえって分からなくなった。',
        '日本にかえって仕事を始めた。',
        'かえって友達に会いに行った。'
      ], answer: 1 },
    ],
    mondai6: [
      { q: '最終のバスに間に合わなくて困っていた（　　）、運よくタクシーが通りかかり、無事帰宅できた。', options: ['あげくに','ために','とたんに','ところに'], answer: 3 },
      { q: '親が他人をいつも（　　）子どもも人をうらやむようになるというのが父の口癖だった。', options: ['うらやんでばかりいると','うらやんでばかりいても','うらやんだだけだと','うらやんだだけでも'], answer: 0 },
      { q: '努力した（　　）、結果がついてくるものだ。', options: ['からには','だけに','からこそ','ばかりに'], answer: 2 },
      { q: '彼女は忙しい（　　）、いつも笑顔で対応してくれる。', options: ['にもかかわらず','にしたがって','につれて','において'], answer: 0 },
      { q: '今さら後悔した（　　）、もうどうにもならない。', options: ['ところで','ところが','ところに','ところを'], answer: 0 },
      { q: 'この仕事は経験者（　　）できない難しい仕事だ。', options: ['しか','だけ','にしか','でしか'], answer: 2 },
    ],
  },
  N1: {
    mondai1: [
      { q: '彼は今、新薬の研究開発に挑んでいる。', target: '挑んで', options: ['はげんで','のぞんで','からんで','いどんで'], answer: 3 },
      { q: '住民が建設会社を相手に、訴訟を起こした。', target: '訴訟', options: ['そしょう','せきしょう','そこう','せっこう'], answer: 0 },
      { q: '災害の被害を最小限に抑える対策が必要だ。', target: '抑える', options: ['おさえる','ひかえる','そなえる','かまえる'], answer: 0 },
      { q: '彼は長年の功績が認められ、表彰された。', target: '功績', options: ['こうせき','くうせき','こうせい','くせき'], answer: 0 },
      { q: 'この地域の風習は独特だ。', target: '風習', options: ['ふうしゅう','かぜならい','ふしゅう','ふうじゅう'], answer: 0 },
      { q: '彼の主張は一貫している。', target: '一貫', options: ['いっかん','いちかん','いつかん','ひとかん'], answer: 0 },
      { q: '膨大な資料を整理する。', target: '膨大', options: ['ぼうだい','ほうだい','ぼだい','はくだい'], answer: 0 },
      { q: '彼女の洞察力は素晴らしい。', target: '洞察', options: ['どうさつ','とうさつ','どうさい','どうさく'], answer: 0 },
    ],
    mondai2: [
      { q: '私の主張は単なる（　　）ではなく、確たる証拠に基づいている。', options: ['模索','思索','推測','推移'], answer: 2 },
      { q: '事故の原因は、機械の（　　）作動にあると考えられている。', options: ['偽','誤','被','乱'], answer: 1 },
      { q: '環境問題への（　　）が高まっている。', options: ['意識','意志','意欲','意見'], answer: 0 },
      { q: '彼の（　　）な態度が周囲を不快にさせた。', options: ['横暴','横柄','横断','横行'], answer: 1 },
      { q: '研究の（　　）を発表した。', options: ['成果','効果','結果','戦果'], answer: 0 },
      { q: '彼はその問題に（　　）的に取り組んでいる。', options: ['積極','消極','肯定','否定'], answer: 0 },
    ],
    mondai3: [
      { q: 'このマニュアルの説明はややこしい。', target: 'ややこしい', options: ['明確だ','奇妙だ','複雑だ','簡潔だ'], answer: 2 },
      { q: '人をあざむいて、利益を得てはいけない。', target: 'あざむいて', options: ['くるしませて','だまして','きずつけて','まよわせて'], answer: 1 },
      { q: '彼の演説は聴衆を魅了した。', target: '魅了', options: ['退屈させた','感動させた','混乱させた','失望させた'], answer: 1 },
      { q: '彼女はいつもてきぱきと仕事をする。', target: 'てきぱき', options: ['ゆっくり','すばやく','のんびり','おそく'], answer: 1 },
      { q: '彼の態度は不遜だ。', target: '不遜', options: ['けんきょ','ごうまん','しょうじき','しんけん'], answer: 1 },
      { q: '彼女は抜け目のない人だ。', target: '抜け目のない', options: ['おっちょこちょいの','しっかりした','だらしない','おとなしい'], answer: 1 },
    ],
    mondai4: [
      { q: 'いたわる', options: [
        '弱い立場の人をいたわるのは大切なことです。',
        '山田さんはこれまでの努力をいたわってくれました。',
        '母は孫が遊びに来たら、いつもいたわっていました。',
        '政治家は国民の生活をいたわるべきです。'
      ], answer: 0 },
      { q: 'キャリア', options: [
        'その分野のキャリアになるには、長い間の努力が必要だ。',
        '先月賞を取ったあの歌手のキャリアは苦労続きだったそうだ。',
        '昨日、異動の発表があって、兄のキャリアは部長になった。',
        '彼のキャリアはそれほど長くないが、この仕事をよく理解している。'
      ], answer: 3 },
      { q: 'めっきり', options: [
        'めっきり朝ご飯を食べました。',
        '秋になって、めっきり涼しくなった。',
        'めっきり電車に乗りました。',
        'めっきりテストの点数が100点でした。'
      ], answer: 1 },
    ],
    mondai5: [
      { q: 'いまさら後悔してみた（　　）、してしまったことは取り返しがつかない。', options: ['ところで','といえども','にせよ','ばかりに'], answer: 0 },
      { q: '勝ったから（　　）、今日の試合の内容は決してほめられるものではなかった。', options: ['いいようなことに','よさそうなものを','いいようなものの','よさそうなことで'], answer: 2 },
      { q: '彼女は仕事（　　）、家事も完璧にこなしている。', options: ['はおろか','はもとより','をよそに','にひきかえ'], answer: 1 },
      { q: '約束した（　　）、必ず実行しなければならない。', options: ['からには','ばかりに','にしても','とはいえ'], answer: 0 },
      { q: '彼の才能は（　　）、努力もまた素晴らしい。', options: ['さることながら','ともかく','ともあれ','はさておき'], answer: 0 },
      { q: '経済が悪化する（　　）、失業率も上昇した。', options: ['につれて','において','にあたって','にかけて'], answer: 0 },
    ],
    mondai6: [
      { q: '人類は、生物学的存在である ＿＿ ＿＿ ★ ＿＿ 文化的存在でもある。', options: ['にもまして','他の','と同時に','どの種'], answer: 2 },
      { q: '休みの ＿＿ ＿＿ ★ ＿＿ 実際にはなかなか実行できない。', options: ['片付けようと','たびに','思いながらも','今日こそ'], answer: 2 },
      { q: '環境問題は ＿＿ ＿＿ ★ ＿＿ 取り組むべきだ。', options: ['一人一人が','真剣に','他人事ではなく','自分のこととして'], answer: 1 },
    ],
  }
};

// ===== JLPT CONFIG =====
const JLPT_LEVEL_CONFIG = {
  N5: { color: '#7bed9f', label: 'Beginner', mbReward: 20, xpReward: 15, lootTier: 5, questionCount: 10 },
  N4: { color: '#70a1ff', label: 'Elementary', mbReward: 40, xpReward: 25, lootTier: 8, questionCount: 12 },
  N3: { color: '#ffa502', label: 'Intermediate', mbReward: 70, xpReward: 40, lootTier: 12, questionCount: 15 },
  N2: { color: '#ff6b81', label: 'Upper-Int', mbReward: 120, xpReward: 60, lootTier: 16, questionCount: 15 },
  N1: { color: '#ff4757', label: 'Advanced', mbReward: 200, xpReward: 100, lootTier: 20, questionCount: 15 },
};

const JLPT_MONDAI_LABELS = {
  mondai1: { name: 'Kanji Reading', icon: '📖', desc: 'Pick the correct reading' },
  mondai2: { name: 'Kanji Writing', icon: '✍️', desc: 'Pick the correct kanji' },
  mondai3: { name: 'Vocabulary', icon: '💬', desc: 'Fill in the blank' },
  mondai4: { name: 'Paraphrase', icon: '🔄', desc: 'Closest meaning' },
  mondai5: { name: 'Word Usage', icon: '📝', desc: 'Correct usage in context' },
  mondai6: { name: 'Grammar', icon: '📐', desc: 'Pick correct grammar' },
  mondai7: { name: 'Sentence Order', icon: '🧩', desc: 'Arrange the sentence' },
};

// ===== JLPT STATE =====
let jlptState = {
  active: false,
  level: null,
  mondaiType: null,     // null = mixed, or specific mondai type
  questions: [],
  currentIndex: 0,
  score: 0,
  answers: [],          // { questionIdx, chosen, correct, isCorrect }
  startTime: null,
};

// ===== DATA =====
function getJlptData() {
  if (!data.jlpt) {
    data.jlpt = {
      totalQuizzes: 0,
      totalCorrect: 0,
      totalAnswered: 0,
      bestScores: {},    // { 'N5': { score, total, date }, ... }
      levelStats: {},    // { 'N5': { attempts: 0, correct: 0, total: 0 }, ... }
      mondaiStats: {},   // { 'mondai1': { correct: 0, total: 0 }, ... }
      lastQuizDate: null,
      streak: 0,
    };
    saveData();
  }
  return data.jlpt;
}

// ===== QUIZ ENGINE =====
function buildJlptQuiz(level, mondaiType) {
  const levelQs = JLPT_QUESTIONS[level];
  if (!levelQs) return [];

  let pool = [];
  if (mondaiType && levelQs[mondaiType]) {
    pool = levelQs[mondaiType].map((q, i) => ({ ...q, _mondai: mondaiType, _idx: i }));
  } else {
    // Mixed: pull from all available mondai types
    for (const [mt, qs] of Object.entries(levelQs)) {
      qs.forEach((q, i) => pool.push({ ...q, _mondai: mt, _idx: i }));
    }
  }

  // Shuffle
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  const config = JLPT_LEVEL_CONFIG[level];
  return pool.slice(0, config.questionCount);
}

function startJlptQuiz(level, mondaiType) {
  const questions = buildJlptQuiz(level, mondaiType);
  if (questions.length === 0) return;

  jlptState = {
    active: true,
    level,
    mondaiType,
    questions,
    currentIndex: 0,
    score: 0,
    answers: [],
    startTime: Date.now(),
  };

  renderJlptQuiz();
}

function renderJlptQuiz() {
  const container = document.getElementById('jlpt-quiz-area');
  if (!container) return;

  if (!jlptState.active) {
    container.innerHTML = '';
    return;
  }

  const q = jlptState.questions[jlptState.currentIndex];
  const config = JLPT_LEVEL_CONFIG[jlptState.level];
  const mondaiInfo = JLPT_MONDAI_LABELS[q._mondai] || { name: 'Question', icon: '❓' };
  const progress = jlptState.currentIndex + 1;
  const total = jlptState.questions.length;

  // Build question display based on mondai type
  let questionHtml = '';

  if (q._mondai === 'mondai1') {
    // Kanji reading: show sentence with target highlighted
    const sentence = q.q.replace(q.target, `<span class="jlpt-highlight">${q.target}</span>`);
    questionHtml = `
      <div class="jlpt-q-sentence">${sentence}</div>
      <div class="jlpt-q-instruction">What is the reading of <strong>${q.target}</strong>?</div>
    `;
  } else if (q._mondai === 'mondai2') {
    // Kanji writing: show sentence with target in hiragana
    const sentence = q.q.replace(q.target, `<span class="jlpt-highlight-hira">${q.target}</span>`);
    questionHtml = `
      <div class="jlpt-q-sentence">${sentence}</div>
      <div class="jlpt-q-instruction">Pick the correct kanji for <strong>${q.target}</strong></div>
    `;
  } else if (q._mondai === 'mondai3') {
    // Vocabulary fill-in
    questionHtml = `
      <div class="jlpt-q-sentence">${q.q}</div>
      <div class="jlpt-q-instruction">Choose the best word for the blank</div>
    `;
  } else if (q._mondai === 'mondai4') {
    // Paraphrase
    if (q.target) {
      const sentence = q.q.replace(q.target, `<span class="jlpt-highlight">${q.target}</span>`);
      questionHtml = `
        <div class="jlpt-q-sentence">${sentence}</div>
        <div class="jlpt-q-instruction">Which has the closest meaning to <strong>${q.target}</strong>?</div>
      `;
    } else {
      questionHtml = `
        <div class="jlpt-q-sentence">${q.q}</div>
        <div class="jlpt-q-instruction">Choose the word that best fits</div>
      `;
    }
  } else if (q._mondai === 'mondai5') {
    // Word usage
    questionHtml = `
      <div class="jlpt-q-word">${q.q}</div>
      <div class="jlpt-q-instruction">Which sentence uses this word correctly?</div>
    `;
  } else if (q._mondai === 'mondai6') {
    // Grammar
    if (q.q.includes('★')) {
      questionHtml = `
        <div class="jlpt-q-sentence">${q.q}</div>
        <div class="jlpt-q-instruction">Which goes in the ★ position?</div>
      `;
    } else {
      questionHtml = `
        <div class="jlpt-q-sentence">${q.q}</div>
        <div class="jlpt-q-instruction">Choose the best grammar</div>
      `;
    }
  } else {
    questionHtml = `
      <div class="jlpt-q-sentence">${q.q}</div>
      <div class="jlpt-q-instruction">Choose the best answer</div>
    `;
  }

  // Options
  const optionsHtml = q.options.map((opt, i) => `
    <button class="jlpt-option-btn glass" onclick="submitJlptAnswer(${i})">
      <span class="jlpt-opt-num">${i + 1}</span>
      <span class="jlpt-opt-text">${opt}</span>
    </button>
  `).join('');

  container.innerHTML = `
    <div class="jlpt-quiz-container glass-dark">
      <div class="jlpt-quiz-header">
        <div class="jlpt-level-badge" style="background:${config.color}; color:#000;">${jlptState.level}</div>
        <div class="jlpt-mondai-badge">${mondaiInfo.icon} ${mondaiInfo.name}</div>
        <div class="jlpt-progress">${progress} / ${total}</div>
        <div class="jlpt-score-live">Score: ${jlptState.score}</div>
      </div>
      <div class="jlpt-progress-bar">
        <div class="jlpt-progress-fill" style="width:${(progress / total) * 100}%; background:${config.color};"></div>
      </div>
      <div class="jlpt-question-area">
        ${questionHtml}
      </div>
      <div class="jlpt-options-grid">
        ${optionsHtml}
      </div>
    </div>
  `;
}

function submitJlptAnswer(chosenIdx) {
  if (!jlptState.active) return;
  const q = jlptState.questions[jlptState.currentIndex];
  const isCorrect = chosenIdx === q.answer;

  if (isCorrect) jlptState.score++;

  jlptState.answers.push({
    questionIdx: jlptState.currentIndex,
    chosen: chosenIdx,
    correct: q.answer,
    isCorrect,
    mondai: q._mondai,
  });

  // Show feedback briefly
  const buttons = document.querySelectorAll('.jlpt-option-btn');
  buttons.forEach((btn, i) => {
    btn.disabled = true;
    if (i === q.answer) btn.classList.add('jlpt-correct');
    if (i === chosenIdx && !isCorrect) btn.classList.add('jlpt-wrong');
  });

  setTimeout(() => {
    jlptState.currentIndex++;
    if (jlptState.currentIndex >= jlptState.questions.length) {
      endJlptQuiz();
    } else {
      renderJlptQuiz();
    }
  }, 800);
}

function endJlptQuiz() {
  jlptState.active = false;
  const jd = getJlptData();
  const config = JLPT_LEVEL_CONFIG[jlptState.level];
  const total = jlptState.questions.length;
  const score = jlptState.score;
  const pct = Math.round((score / total) * 100);
  const elapsed = Math.round((Date.now() - jlptState.startTime) / 1000);

  // Grade
  let grade, gradeColor, gradeEmoji;
  if (pct >= 90) { grade = 'S'; gradeColor = '#ffd700'; gradeEmoji = '🏆'; }
  else if (pct >= 75) { grade = 'A'; gradeColor = '#7bed9f'; gradeEmoji = '🌟'; }
  else if (pct >= 60) { grade = 'B'; gradeColor = '#70a1ff'; gradeEmoji = '✨'; }
  else if (pct >= 40) { grade = 'C'; gradeColor = '#ffa502'; gradeEmoji = '📚'; }
  else { grade = 'F'; gradeColor = '#ff4757'; gradeEmoji = '💪'; }

  // Calculate rewards
  const gradeMultiplier = { S: 1.5, A: 1.2, B: 1.0, C: 0.6, F: 0.3 }[grade];
  const mbEarned = Math.round(config.mbReward * gradeMultiplier);
  const xpEarned = Math.round(config.xpReward * gradeMultiplier);

  // Apply MoeBucks
  const sd = typeof getSlotData === 'function' ? getSlotData() : null;
  if (sd) {
    sd.moeBucks += mbEarned;
    if (typeof updateSlotMoneyDisplay === 'function') updateSlotMoneyDisplay();
  }

  // Apply XP if available
  if (typeof addXP === 'function') {
    addXP(xpEarned);
  }

  // Roll loot for grade B or above
  let lootItems = [];
  if (grade !== 'F' && grade !== 'C' && typeof rollExpeditionLoot === 'function') {
    const lootTier = Math.round(config.lootTier * gradeMultiplier);
    lootItems = rollExpeditionLoot(lootTier);
    if (lootItems.length > 0 && typeof addMaterialsToInventory === 'function') {
      addMaterialsToInventory(lootItems);
    }
  }

  // Update stats
  jd.totalQuizzes++;
  jd.totalCorrect += score;
  jd.totalAnswered += total;

  if (!jd.levelStats[jlptState.level]) {
    jd.levelStats[jlptState.level] = { attempts: 0, correct: 0, total: 0 };
  }
  jd.levelStats[jlptState.level].attempts++;
  jd.levelStats[jlptState.level].correct += score;
  jd.levelStats[jlptState.level].total += total;

  // Track mondai stats
  jlptState.answers.forEach(a => {
    if (!jd.mondaiStats[a.mondai]) jd.mondaiStats[a.mondai] = { correct: 0, total: 0 };
    jd.mondaiStats[a.mondai].total++;
    if (a.isCorrect) jd.mondaiStats[a.mondai].correct++;
  });

  // Best score
  if (!jd.bestScores[jlptState.level] || pct > jd.bestScores[jlptState.level].score) {
    jd.bestScores[jlptState.level] = { score: pct, total, date: todayStr() };
  }

  // Streak
  if (jd.lastQuizDate === todayStr()) {
    // Already did one today
  } else {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yStr = yesterday.getFullYear() + '-' + String(yesterday.getMonth() + 1).padStart(2, '0') + '-' + String(yesterday.getDate()).padStart(2, '0');
    if (jd.lastQuizDate === yStr) {
      jd.streak++;
    } else {
      jd.streak = 1;
    }
  }
  jd.lastQuizDate = todayStr();

  saveData();

  // Render results
  renderJlptResults(score, total, pct, grade, gradeColor, gradeEmoji, mbEarned, xpEarned, lootItems, elapsed);
}

function renderJlptResults(score, total, pct, grade, gradeColor, gradeEmoji, mbEarned, xpEarned, lootItems, elapsed) {
  const container = document.getElementById('jlpt-quiz-area');
  if (!container) return;

  const config = JLPT_LEVEL_CONFIG[jlptState.level];
  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;

  // Build review of wrong answers
  const wrongAnswers = jlptState.answers.filter(a => !a.isCorrect);
  let reviewHtml = '';
  if (wrongAnswers.length > 0) {
    reviewHtml = `
      <div class="jlpt-review-section">
        <h4 style="color:rgba(255,255,255,0.7); margin-bottom:10px;">Review Mistakes (${wrongAnswers.length})</h4>
        ${wrongAnswers.slice(0, 5).map(a => {
          const q = jlptState.questions[a.questionIdx];
          const mondaiInfo = JLPT_MONDAI_LABELS[q._mondai] || { icon: '❓' };
          return `
            <div class="jlpt-review-card glass">
              <div class="jlpt-review-type">${mondaiInfo.icon} ${q._mondai}</div>
              <div class="jlpt-review-q">${q.q.substring(0, 60)}${q.q.length > 60 ? '...' : ''}</div>
              <div class="jlpt-review-ans">
                <span class="jlpt-review-wrong">✗ ${q.options[a.chosen]}</span>
                <span class="jlpt-review-right">✓ ${q.options[q.answer]}</span>
              </div>
            </div>
          `;
        }).join('')}
        ${wrongAnswers.length > 5 ? `<div style="color:rgba(255,255,255,0.4); font-size:0.8rem; text-align:center;">...and ${wrongAnswers.length - 5} more</div>` : ''}
      </div>
    `;
  }

  // Loot display
  let lootHtml = '';
  if (lootItems.length > 0) {
    lootHtml = `
      <div class="jlpt-loot-section">
        <h4 style="color:#ffd700; margin-bottom:8px;">Loot Earned</h4>
        <div class="jlpt-loot-grid">
          ${lootItems.map(item => {
            const tc = typeof TIER_COLORS !== 'undefined' ? (TIER_COLORS[item.tier] || { text: '#fff', bg: 'rgba(255,255,255,0.1)', border: 'rgba(255,255,255,0.2)' }) : { text: '#fff', bg: 'rgba(255,255,255,0.1)', border: 'rgba(255,255,255,0.2)' };
            return `<span class="jlpt-loot-badge" style="color:${tc.text}; background:${tc.bg}; border:1px solid ${tc.border};">${item.emoji || '✦'} ${item.name}</span>`;
          }).join('')}
        </div>
      </div>
    `;
  }

  container.innerHTML = `
    <div class="jlpt-results glass-dark">
      <div class="jlpt-grade-display">
        <div class="jlpt-grade-emoji">${gradeEmoji}</div>
        <div class="jlpt-grade-letter" style="color:${gradeColor};">${grade}</div>
        <div class="jlpt-grade-sublabel">${jlptState.level} ${jlptState.mondaiType ? JLPT_MONDAI_LABELS[jlptState.mondaiType]?.name || '' : 'Mixed'}</div>
      </div>

      <div class="jlpt-results-stats">
        <div class="jlpt-stat-box glass">
          <div class="jlpt-stat-num" style="color:${config.color};">${score}/${total}</div>
          <div class="jlpt-stat-label">Correct</div>
        </div>
        <div class="jlpt-stat-box glass">
          <div class="jlpt-stat-num" style="color:${gradeColor};">${pct}%</div>
          <div class="jlpt-stat-label">Accuracy</div>
        </div>
        <div class="jlpt-stat-box glass">
          <div class="jlpt-stat-num">${minutes}:${String(seconds).padStart(2, '0')}</div>
          <div class="jlpt-stat-label">Time</div>
        </div>
      </div>

      <div class="jlpt-rewards-strip">
        <span class="jlpt-reward-badge">💰 +${mbEarned} MB</span>
        <span class="jlpt-reward-badge">⭐ +${xpEarned} XP</span>
        ${lootItems.length > 0 ? `<span class="jlpt-reward-badge">🎁 ${lootItems.length} items</span>` : ''}
      </div>

      ${lootHtml}
      ${reviewHtml}

      <div class="jlpt-results-actions">
        <button class="btn-glossy btn-green" onclick="startJlptQuiz('${jlptState.level}', ${jlptState.mondaiType ? "'" + jlptState.mondaiType + "'" : 'null'})">🔄 Retry</button>
        <button class="btn-glossy" onclick="renderJlptHome()" style="background:rgba(255,255,255,0.15);">📋 Back to Menu</button>
      </div>
    </div>
  `;
}

// ===== HOME / LEVEL SELECT RENDERING =====
function renderJlptHome() {
  const container = document.getElementById('jlpt-quiz-area');
  if (!container) { container && (container.innerHTML = ''); return; }
  container.innerHTML = '';

  const jd = getJlptData();

  // Level cards
  const levelCardsHtml = Object.entries(JLPT_LEVEL_CONFIG).map(([level, config]) => {
    const stats = jd.levelStats[level];
    const best = jd.bestScores[level];
    const accuracy = stats ? Math.round((stats.correct / stats.total) * 100) : 0;
    const attempts = stats ? stats.attempts : 0;

    // Available mondai types for this level
    const mondaiTypes = Object.keys(JLPT_QUESTIONS[level] || {});

    return `
      <div class="jlpt-level-card glass" style="border-color:${config.color}33;">
        <div class="jlpt-level-header">
          <div class="jlpt-level-name" style="color:${config.color};">${level}</div>
          <div class="jlpt-level-sublabel">${config.label}</div>
          ${best ? `<div class="jlpt-level-best" style="color:${config.color};">Best: ${best.score}%</div>` : ''}
        </div>
        <div class="jlpt-level-stats-row">
          <span>${attempts} attempts</span>
          ${stats ? `<span>${accuracy}% accuracy</span>` : '<span>Not attempted</span>'}
          <span>💰 ${config.mbReward} MB</span>
        </div>
        <div class="jlpt-level-mondai-btns">
          <button class="jlpt-start-btn glass" onclick="startJlptQuiz('${level}', null)" style="border-color:${config.color}55; color:${config.color};">
            🎲 Mixed (${config.questionCount}q)
          </button>
          ${mondaiTypes.map(mt => {
            const info = JLPT_MONDAI_LABELS[mt] || { icon: '❓', name: mt };
            const qCount = JLPT_QUESTIONS[level][mt].length;
            return `
              <button class="jlpt-mondai-btn glass" onclick="startJlptQuiz('${level}', '${mt}')" title="${info.desc}">
                ${info.icon} ${info.name} (${qCount})
              </button>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }).join('');

  // Overall stats
  const overallAccuracy = jd.totalAnswered > 0 ? Math.round((jd.totalCorrect / jd.totalAnswered) * 100) : 0;

  // Mondai type performance
  let mondaiPerformanceHtml = '';
  const mondaiEntries = Object.entries(jd.mondaiStats);
  if (mondaiEntries.length > 0) {
    mondaiPerformanceHtml = `
      <div class="jlpt-mondai-performance glass-dark" style="margin-top:16px; padding:16px; border-radius:16px;">
        <h4 style="color:rgba(255,255,255,0.7); margin-bottom:10px; font-family:'Baloo 2',cursive;">Question Type Performance</h4>
        <div class="jlpt-perf-grid">
          ${mondaiEntries.map(([mt, stats]) => {
            const info = JLPT_MONDAI_LABELS[mt] || { icon: '❓', name: mt };
            const acc = Math.round((stats.correct / stats.total) * 100);
            const barColor = acc >= 80 ? '#7bed9f' : acc >= 60 ? '#ffa502' : '#ff4757';
            return `
              <div class="jlpt-perf-item">
                <div class="jlpt-perf-label">${info.icon} ${info.name}</div>
                <div class="jlpt-perf-bar-bg">
                  <div class="jlpt-perf-bar-fill" style="width:${acc}%; background:${barColor};"></div>
                </div>
                <div class="jlpt-perf-pct">${acc}%</div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  const mainEl = document.getElementById('jlpt-main-content');
  if (mainEl) {
    mainEl.innerHTML = `
      <div class="jlpt-overall-stats">
        <div class="jlpt-stat-pill glass">📊 ${jd.totalQuizzes} quizzes</div>
        <div class="jlpt-stat-pill glass">✅ ${overallAccuracy}% accuracy</div>
        <div class="jlpt-stat-pill glass">🔥 ${jd.streak} day streak</div>
        <div class="jlpt-stat-pill glass">📝 ${jd.totalAnswered} questions</div>
      </div>
      <div class="jlpt-level-grid">
        ${levelCardsHtml}
      </div>
      ${mondaiPerformanceHtml}
    `;
  }
  container.innerHTML = '';
}

// ===== INIT =====
function initJlpt() {
  try {
    getJlptData();
    renderJlptHome();
    console.log('[JLPT] Initialized successfully');
  } catch(e) {
    console.error('[JLPT] Init error:', e);
    const mainEl = document.getElementById('jlpt-main-content');
    if (mainEl) mainEl.innerHTML = '<p style="color:#ff4757;">JLPT failed to load: ' + e.message + '</p>';
  }
}
