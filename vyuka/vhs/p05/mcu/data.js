// Vlastní odečet přehrávače Disney+ a interpretace scén, 26. 10. 2026.
// Čas je poloha uloženého snímku, nikoli přesný začátek celého dramaturgického bodu.
window.MCU = {
  date: '2026-10-26',
  columns: [
    ['inciting', 'Podnět', 'Inciting incident'],
    ['plot1', 'První obrat', 'Plot point 1 / vstup do II. aktu'],
    ['midpoint', 'Střední zlom', 'Midpoint: změna situace, ne nutně nejhorší chvíle'],
    ['low', 'Krize / low point', 'Srovnávací sloupec navíc — ne vždy pozdní a ne synonymum midpointu'],
    ['plot2', 'Druhý obrat', 'Plot point 2 / nové jednání před finále'],
    ['climax', 'Vyvrcholení', 'Climax / rozhodující sekvence']
  ],
  films: [
    {
      id:'iron-man', title:'Iron Man', year:2008, duration:7656,
      source:'https://www.disneyplus.com/cs-cz/browse/entity-0c520152-b81f-4c20-9310-003debd1947e',
      note:'Linie Tonyho proměny. Hranici prvního aktu lze položit už k útěku z jeskyně; zde porovnáváme jeho veřejný závazek po návratu. První let jako midpoint je také čtení rozboru Save the Cat!, nikoli údaj od scenáristů.',
      shots: {
        inciting:{file:'iron-man-inciting-000336.jpg', time:'00:03:36', scene:'Tony zraněný při přepadení konvoje.', reading:'Útok přeruší dosavadní život a vede k zajetí.'},
        plot1:{file:'iron-man-plot1-004520.jpg', time:'00:45:20', scene:'Tisková konference po návratu ze zajetí.', reading:'Tony odmítá pokračovat v dosavadní zbrojní výrobě. Závazek mění další směr.'},
        midpoint:{file:'iron-man-midpoint-010159.jpg', time:'01:01:59', scene:'Funkční Mark II v dílně, sekvence prvního zkušebního letu.', reading:'Kandidát: pocit nově získané síly a úspěchu, nikoli absolutní porážka.', polarity:'Zdánlivý úspěch'},
        low:{file:'iron-man-low-013957.jpg', time:'01:39:57', scene:'Tony v dílně v sekvenci po odcizení reaktoru.', reading:'Ohrožení života a ztráta hlavního zdroje síly přicházejí až podstatně později.'},
        plot2:{file:'iron-man-plot2.jpg', time:'01:42:27', scene:'Tony v obleku, Rhodey v dílně.', reading:'Se slabším náhradním reaktorem vyráží k závěrečné konfrontaci.'},
        climax:{file:'iron-man-climax.jpg', time:'01:51:44', scene:'Závěrečný střet u velkého reaktoru.', reading:'Reprezentativní záběr sekvence přetížení reaktoru proti Iron Mongerovi; ne snímek samotné exploze.'}
      }
    },
    {
      id:'thor', title:'Thor', year:2011, duration:7030,
      source:'https://www.disneyplus.com/cs-cz/browse/entity-479d41e3-8438-4ba4-b93d-8223220e069c',
      note:'Vlastní analytické čtení Thorovy proměny z nároku na moc k odpovědnosti. Selhání u Mjolniru je střední zlom; pozdější dobrovolná oběť je jiný moment. Paralelní Lokiho linie má vlastní zvraty.',
      shots: {
        inciting:{file:'thor-inciting.jpg', time:'00:11:00', scene:'Odin při korunovaci v sekvenci jejího narušení.', reading:'Vpád ledových obrů podnítí Thorovu odvetu; ta rozjede řetěz následků.'},
        plot1:{file:'thor-plot1.jpg', time:'00:28:02', scene:'Odin kárá Thora po návratu z Jötunheimu.', reading:'Sekvence rozsudku a vyhnání: Thor přijde o moc i domov a musí žít na Zemi.'},
        midpoint:{file:'thor-midpoint.jpg', time:'00:58:55', scene:'Thor v dešti u Mjolniru.', reading:'Kandidát: kladivo nezvedne. Původní plán „vezmu si moc zpět silou“ selže.', polarity:'Neúspěch / změna cíle'},
        low:{file:'thor-low.jpg', time:'01:26:28', scene:'Thor leží zraněný na ulici po zásahu Ničitele.', reading:'Vědomě se vystaví nebezpečí pro druhé; bezprostředně působí jako poražený. Pro vnitřní proměnu je to ale úspěch.'},
        plot2:{file:'thor-plot2.jpg', time:'01:29:49', scene:'Thor znovu v brnění s Jane po střetu s Ničitelem.', reading:'Získal zpět moc; další cíl je návrat do Asgardu a zastavení Lokiho. Snímek reprezentuje přechodovou sekvenci.'},
        climax:{file:'thor-climax.jpg', time:'01:39:35', scene:'Rozpad Bifröstu v závěrečném střetu.', reading:'Thor zastaví ničení Jötunheimu za cenu přerušení cesty k Jane. Síla už slouží jinému rozhodnutí než na začátku.'}
      }
    },
    {
      id:'avengers', title:'The Avengers', year:2012, duration:8777,
      source:'https://www.disneyplus.com/cs-cz/browse/entity-d2ab699b-67da-4906-a7a4-5bc542c953cf',
      note:'Hlavní linie: ze souboru jednotlivců vzniká tým. Pro midpoint jsou doložena dvě čtení i v diskusi u Save the Cat!: zajetí Lokiho jako zdánlivé vítězství, nebo pozdější hádka a hrozba Hulka. Matice ukazuje druhou možnost; první je níže.',
      shots: {
        inciting:{file:'avengers-inciting.jpg', time:'00:06:27', scene:'Loki bere Tesseract ze zařízení S.H.I.E.L.D.', reading:'Krádež vyvolá vnější hrozbu; odpovědí je Furyho iniciativa sestavit tým.'},
        plot1:{file:'avengers-plot1.jpg', time:'00:35:04', scene:'Fury na palubě helicarrieru při shromažďování hrdinů.', reading:'Postavy vstupují do společné operace. Ještě nespolupracují jako skutečný tým.'},
        midpoint:{file:'avengers-midpoint.jpg', time:'01:08:05', scene:'Banner ukazuje zbraňový výzkum S.H.I.E.L.D.; hádka v laboratoři.', reading:'Kandidát B: nedůvěra a hrozící vnitřní rozpad před útokem. Nikoli ještě pozdější krize po Coulsonově smrti.', polarity:'Nedůvěra / eskalace'},
        low:{file:'avengers-low.jpg', time:'01:30:06', scene:'Tony a Fury po útoku na helicarrier a Coulsonově smrti.', reading:'Tým je rozptýlený a utrpěl osobní ztrátu. Pozdní krize není totožná s hádkou uprostřed.'},
        plot2:{file:'avengers-plot2.jpg', time:'01:35:30', scene:'Tony a Steve mluví po Coulsonově smrti.', reading:'Sekvence hledání nového společného postupu: odhalení cíle ve Stark Tower vede k cestě do New Yorku.'},
        climax:{file:'avengers-climax.jpg', time:'02:05:58', scene:'Tony uvnitř helmy v sekvenci odklonění jaderné střely.', reading:'Dobrovolně riskuje život; odklonění střely a uzavření portálu rozhodnou bitvu.'}
      },
      alternative:{file:'avengers-midpoint-alternative.jpg', time:'00:52:32', scene:'Zajatý Loki v cele na helicarrieru.', reading:'Kandidát A: protivník je zdánlivě pod kontrolou. Je to reprezentativní snímek stavu po zajetí, nikoli okamžik zatčení.'}
    }
  ],
  extras: [
    {film:'ultron',file:'ultron-final-dialogue.jpg',time:'02:05:24',scene:'Vision a poslední Ultron v lese.',reading:'Dozvuk vítězství: hodnotový spor se uzavírá rozhovorem, nikoli jen explozí.'},
    {film:'infinity',file:'infinity-hero-low.jpg',time:'02:01:20',scene:'Tony v závěrečné konfrontaci s Thanosem na Titanu.',reading:'Z hlediska Avengers další prohloubení porážky; z hlediska Thanose překonání odporu.'},
    {film:'infinity',file:'infinity-snap-aftermath.jpg',time:'02:15:21',scene:'Peter se rozpadá v Tonyho náručí.',reading:'Důsledek Snapu: pro Avengers katastrofa, ačkoli Thanos právě dosáhl svého cíle.'},
    {film:'endgame',file:'endgame-stones-gone.jpg',time:'00:18:21',scene:'Natasha se v Thanosově obydlí ptá na kameny.',reading:'Sekvence zjištění, že kameny byly zničeny: zabít Thanose nestačí k nápravě. Záběr je otázka, nikoli samotné zničení kamenů.'}
  ],
  sources:[
    ['Iron Man — beat sheet (interpretace Save the Cat!)','https://savethecat.com/beat-sheets/iron-man-beat-sheet'],
    ['The Avengers — beat sheet a diskuse alternativ midpointu','https://savethecat.com/beat-sheets/the-avengers-beat-sheet'],
    ['Save the Cat! — pojmy: midpoint a all is lost jsou odlišné body','https://savethecat.com/wp-content/uploads/2019/07/STC_Crash_Course_Essential_Vocabulary.pdf'],
    ['Thor — oficiální přehled filmu Marvel','https://www.marvel.com/movies/thor'],
    ['The Avengers — oficiální přehled D23','https://d23.com/a-to-z/avengers-marvels-the-film/'],
    ['Guardians of the Galaxy — rozbor K. M. Weiland (interpretace)','https://www.helpingwritersbecomeauthors.com/movie-storystructure/guardians-of-the-galaxy/'],
    ['Infinity War — rozbor Coryho Millese (Thanosova perspektiva)','https://savethecat.com/beat-sheets/avengers-infinity-war-beat-sheet'],
    ['Joe a Anthony Russo: Infinity War jako uzavřený Thanosův oblouk — rozhovor','https://editorial.rottentomatoes.com/article/joe-and-anthony-russo-go-deep-on-avengers-endgame-and-infinity-war/']
  ]
};

// Doplněné filmy mají vlastní popisy pozorovaného obrazu. Funkce scén je interpretace.
window.MCU.films.push(
  {
    id:'guardians',title:'Guardians of the Galaxy',year:2014,duration:7379,
    source:'https://www.disneyplus.com/cs-cz/browse/entity-c9ee959b-7249-4a4c-9708-9ffd1ddb00f1',
    note:'Od jednotlivců sledujících zisk ke skupině, která chrání druhé. Srovnáno s rozborem K. M. Weiland; nejde o Gunnův oficiální rozpis. Druhý obrat nemusí obsahovat další samostatnou hlubokou porážku: skupina přijme společný plán.',
    shots:{
      inciting:{file:'guardians-inciting.jpg',time:'00:18:01',scene:'Gamora oslovuje Quilla po neúspěchu u obchodníka.',reading:'Orb přitáhne soupeře; prodej přestává být jednoduchou zakázkou.'},
      plot1:{file:'guardians-plot1.jpg',time:'00:28:06',scene:'Quill ve vězeňské cele.',reading:'Vězení spojí dosavadní soupeře a vynutí spolupráci.'},
      midpoint:{file:'guardians-midpoint.jpg',time:'00:59:41',scene:'Odhalený Kámen nekonečna v Collectorově zařízení.',reading:'Zjištění, co Orb obsahuje, mění význam obchodu i morální sázky.',polarity:'Nové poznání / změna motivace'},
      low:{file:'guardians-low.jpg',time:'01:10:24',scene:'Zraněný Drax s Rocketem a Grootem po útoku na Knowhere.',reading:'Ronan získá Orb, skupina je rozdělená. Následuje přeskupení, ne návrat k prodeji.'},
      plot2:{file:'guardians-plot2.jpg',time:'01:19:40',scene:'Rocket se přidává ke stojícím členům skupiny.',reading:'Rozhodnou se riskovat život pro Xandar; už je nespojuje jen zisk.'},
      climax:{file:'guardians-climax.jpg',time:'01:44:11',scene:'Quill, Gamora a Drax sdílejí energii kamene.',reading:'Dřívější soupeři přežijí díky spolupráci, která uzavírá týmovou proměnu.'}
    }
  },
  {
    id:'ultron',title:'Avengers: Age of Ultron',year:2015,duration:8687,
    source:'https://www.disneyplus.com/cs-cz/browse/entity-42329b99-0953-4f1a-9420-a0dbf7733e95',
    note:'Vlastní čtení linie odpovědnosti za ochranu světa. Farma bezprostředně zpracovává porážku uprostřed filmu: nejde o druhý, oddělený pozdní low point. Závěr zahrnuje rozhodující akci v Sokovii i následný rozhovor Visiona s Ultronem.',
    shots:{
      inciting:{file:'ultron-inciting.jpg',time:'00:08:55',scene:'Tonyho vize padlých Avengers; detail Hulkova těla.',reading:'Strach ze selhání motivuje další pokus vytvořit obranu. Je to vize, nikoli skutečná smrt týmu.'},
      plot1:{file:'ultron-plot1.jpg',time:'00:31:17',scene:'Robot Iron Legion během útoku na večírku.',reading:'Projekt ochrany se obrátí proti tvůrcům; Ultron vystoupí jako protivník.'},
      midpoint:{file:'ultron-midpoint.jpg',time:'00:59:07',scene:'Banner zabalený do deky na palubě Quinjetu.',reading:'Po destrukci v Johannesburgu nefungují hrdinové jako bezpečná ochrana světa.',polarity:'Veřejné selhání / ústup'},
      low:{file:'ultron-low.jpg',time:'01:03:23',scene:'Clint a Laura na farmě.',reading:'Ústup a přehodnocení po midpointu. Není to další oddělená pozdní krize.'},
      plot2:{file:'ultron-plot2.jpg',time:'01:38:21',scene:'Steve promlouvá k týmu před akcí v Sokovii.',reading:'Nový závazek: měřítkem vítězství je také ochrana civilistů.'},
      climax:{file:'ultron-climax.jpg',time:'02:03:33',scene:'Destrukce vznášejícího se kusu Sokovie.',reading:'Záchrana obyvatel a zastavení pádu města rozhodnou hlavní katastrofický konflikt.'}
    }
  },
  {
    id:'infinity',title:'Avengers: Infinity War',year:2018,duration:9262,
    source:'https://www.disneyplus.com/cs-cz/browse/entity-9a136e06-852a-41bf-b71d-fa061cb43225',
    note:'Záměrně sledujeme Thanosovu výpravu, ne morálního hrdinu. Russoovi v rozhovoru označují Thanose za hlavní postavu s uzavřeným obloukem; přiřazení konkrétních bodů je analytické, srovnané s rozborem Coryho Millese. První obrat ukazujeme zástupným záběrem sekvence Knowhere, nikoli přesným začátkem výpravy.',
    shots:{
      inciting:{file:'infinity-inciting.jpg',time:'00:11:15',scene:'Strange a Wong nad místem Bannerova dopadu.',reading:'Varování Země organizuje odpor proti Thanosovu plánu; Banner sám není v záběru.'},
      plot1:{file:'infinity-plot1.jpg',time:'00:52:44',scene:'Quill míří na Knowhere v sekvenci Thanosova únosu Gamory.',reading:'Thanos osobně postupuje po kamenech; zisk Gamory otevře cestu k hledanému kameni.'},
      midpoint:{file:'infinity-midpoint.jpg',time:'01:10:11',scene:'Nebula v mučicím zařízení, Thanosova rukavice v popředí.',reading:'Gamora prozradí Vormir. Thanos získá klíčovou informaci za cenu další zrady blízkých.',polarity:'Thanosův postup / pro druhé katastrofa'},
      low:{file:'infinity-low.jpg',time:'01:51:09',scene:'Thanos znehybněný Mantis na Titanu.',reading:'Z jeho hlediska hrozí porážka: protivníci mu téměř stáhnou rukavici.'},
      plot2:{file:'infinity-plot2.jpg',time:'02:02:38',scene:'Strange drží zelený Kámen času.',reading:'Výměna kamene za Tonyho život umožní Thanosovi pokračovat k poslednímu cíli.'},
      climax:{file:'infinity-climax.jpg',time:'02:11:06',scene:'Thanos po Thorově zásahu v závěrečné sekvenci ve Wakandě.',reading:'Přežije odpor a uskuteční Snap. Snímek reprezentuje sekvenci, ne samotné gesto lusknutí.'}
    }
  },
  {
    id:'endgame',title:'Avengers: Endgame',year:2019,duration:11132,
    source:'https://www.disneyplus.com/cs-cz/browse/entity-b39aa962-be56-4b09-a536-98617031717f',
    note:'Vlastní čtení nové linie časové loupeže. Úvodní likvidace původního Thanose je dohra předchozího neúspěchu, nikoli vyřešení Snapu. Midpoint není přesně polovina stopáže: označujeme změnu plánu v průběhu loupeže. Smrt Natashy je nevratná cena, ale současně umožní splnit cíl. Přechod do finále tvoří návrat zmizelých a útok Thanose.',
    shots:{
      inciting:{file:'endgame-inciting.jpg',time:'00:30:32',scene:'Steve v rozhovoru po Scottově návratu a vysvětlení kvantové říše.',reading:'Objeví se možnost vrátit zmizelé. Záběr není samotný Scottův příchod.'},
      plot1:{file:'endgame-plot1.jpg',time:'01:06:25',scene:'Hulk u zařízení pro časovou loupež.',reading:'Tým uskutečňuje cestu do minulosti, místo aby jen uvažoval o nápravě.'},
      midpoint:{file:'endgame-midpoint.jpg',time:'01:40:51',scene:'Tony u Tesseractu v zařízení v roce 1970.',reading:'Po ztrátě Tesseractu v New Yorku improvizují novou cestu; minulost se stává i osobní konfrontací.',polarity:'Selhání plánu → improvizace'},
      low:{file:'endgame-low.jpg',time:'01:53:33',scene:'Natasha na okraji propasti na Vormiru.',reading:'Sekvence dobrovolné oběti: získání kamene má nevratnou osobní cenu.'},
      plot2:{file:'endgame-plot2.jpg',time:'02:02:28',scene:'Clint přijímá telefonát od Laury.',reading:'Potvrzení návratu zmizelých po Hulkovi. Následující bombardování mění nápravu ve finální boj.'},
      climax:{file:'endgame-climax.jpg',time:'02:30:13',scene:'Tony se všemi kameny ve své rukavici.',reading:'Sekvence jeho lusknutí rozhodne bitvu za cenu vlastního života.'}
    }
  }
);
