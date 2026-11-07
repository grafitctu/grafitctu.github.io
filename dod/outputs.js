// Additional exhibits for the Open Day only. Shared Games data has already loaded.
(() => {
  const lang = document.documentElement.lang;
  const i = {cs: 0, en: 1, ja: 2}[lang] ?? 0;
  const works = [
    [["Neonový ray tracing", "Neon ray tracing", "ネオンのレイトレーシング"], "PG1", "Ray tracing", "https://www.youtube.com/shorts/N34eEzIDqtI", "neon.jpg",
      ["Králík v neonovém světle, zlatý drak a odrazy: scény vykreslené studentským rendererem Matěje Zemana.", "A neon-lit rabbit, a golden dragon and reflections rendered by Matěj Zeman’s student renderer.", "Matěj Zemanが自作したレンダラーで、ネオンに照らされたウサギや金色のドラゴン、光の反射を描きます。"]],
    [["Jak se dopočítává světlo", "How light converges", "光の計算が収束するまで"], "PG1", "Path tracing", "https://gitlab.fit.cvut.cz/NI-PG1/b252/krejct20/-/blob/6ac0a4145807523b0ada48151f394e0e77c7ba9d/showcase.mp4", "path-tracer-scenes.png",
      ["Tomáš Krejčík napsal vlastní path tracer v C++. Čtyři scény ukazují, jak se světlo odráží od různých tvarů a materiálů.", "Tomáš Krejčík wrote his own path tracer in C++. Four scenes show how light bounces off different shapes and materials.", "Tomáš KrejčíkがC++で自作したパストレーサーです。4つのシーンで、形状や材質によって光の反射がどう変わるかを示します。"]],
    [["Fotka mění šířku", "Resizing a photo along seams", "写真の幅を変える"], "PGA", "GIMP", "https://gitlab.fit.cvut.cz/BI-PGA/b201/kolemrad/-/blob/fd55b9a3ccd335d80e731520c7f80e59650154b2/semestralka_gimp/video/citron.mp4", "seam-carving.jpg",
      ["Jak zúžit fotku, aniž by se všechno zmáčklo? Ukázka metody seam carving v GIMPu.", "How can a photo get narrower without squeezing everything in it? A seam-carving demonstration in GIMP.", "写真全体を押し縮めずに幅を変えるには？ GIMPでシームカービングの効果を実演します。"]],
    [["Jak vypadá hudba?", "What does music look like?", "音楽はどう見える？"], "LED", "RGB LED", "https://www.youtube.com/shorts/1UottFsNYnQ", "led-panel.jpg",
      ["Ondřej Švejstil ve své bakalářské práci proměnil zvuk ve světelné vzory na panelu z adresovatelných RGB diod.", "Ondřej Švejstil’s bachelor’s project translates sound into patterns on an addressable RGB LED panel.", "Ondřej Švejstilの卒業制作。音をアドレス指定可能なRGB LEDパネルの光の模様に変換します。"]]
  ];
  works.push(
    [["Fourierova transformace ve 3D","The Fourier transform in 3D","3Dで見るフーリエ変換"],"PGA","Blender","https://gitlab.fit.cvut.cz/BI-PGA/b201/valkojo1/tree/master/3D","valko.png",["Vizualizace Fourierovy transformace v Blenderu.","A Blender visualisation of the Fourier transform.","Blenderでフーリエ変換を立体的に可視化します。"]],
    [["Parametrické věže","Parametric towers","パラメトリックな塔"],"PGA","Blender","https://gitlab.fit.cvut.cz/BI-PGA/b201/trzasmar/blob/master/3D-object_generator/dokumentace3.adoc","trzasmar.jpg",["Generátor skládá v Blenderu věže podle zadaných parametrů.","A Blender generator builds towers from adjustable parameters.","パラメーターに従ってBlenderで塔を自動生成します。"]],
    [["Mandelbulb","Mandelbulb","マンデルバルブ"],"PGA","Blender","https://gitlab.fit.cvut.cz/BI-PGA/b201/svejsond/blob/master/3D/dokumentace3.adoc","svejstil.jpg",["Trojrozměrný fraktál zobrazený v Blenderu.","A three-dimensional fractal visualised in Blender.","Blenderで描く三次元フラクタルです。"]],
    [["Generování dřevěné textury","Generating wood grain","木目テクスチャの生成"],"PGA","Plugin","https://dspace.cvut.cz/entities/publication/c80c55df-ff24-40a7-bf6e-f0ac6747fb29","jechdrevo.png",["Bakalářská práce představuje plugin pro vytváření umělé kresby dřeva.","A bachelor’s project on a plugin for synthesising wood grain.","木目を合成するプラグインを制作した卒業研究です。"]]
  );
  const tuples = works.map(([title, course, tool, href, file, description]) =>
    [title[i], course, tool, href, "/dod/media/" + file, 1, description[i], description[i], "graphics"]);
  window.GRAFIT_GAMES.splice(4, 0, ...tuples);
  // Remaining student projects from the homepage. Some distinct Blender works share one gallery URL.
  const showcase = [
    [["AI textura do 3D (StableGen)","AI textures in 3D (StableGen)","StableGen：AIテクスチャと3D"],"PGA","ai","https://stablegen.ai","/assets/showcase/stablegen.jpg",["Nástroj pro generování 3D z AI textur.","Tool for generating 3D from AI textures.","AIテクスチャを用いる3D制作ツールです。"],"graphics"],
    [["Editace textur","Texture editing","テクスチャ編集"],"PGA","gimp","https://gitlab.fit.cvut.cz/BI-PGA/stud/svabosa1/blob/master/dokumentace1.adoc","/assets/showcase/svabova.png",["Rozšířené nástroje pro práci s texturami v GIMPu.","Extended tools for working with textures in GIMP.","GIMPでテクスチャを編集するための拡張ツールです。"],"graphics"],
    [["Vizualizace voleb","Elections visualisation","選挙結果の可視化"],"PGA","visualization","https://gitlab.fit.cvut.cz/BI-PGA/stud/milecold/blob/master/dokumentace2.adoc","/assets/showcase/milec.png",["Datová vizualizace výsledků voleb s využitím SAGE.","Data visualisation of election results using SAGE.","SAGEを使って選挙結果を可視化します。"],"graphics"],
    [["Detektory hran","Edge detectors","エッジ検出"],"PGA","gimp","https://gitlab.fit.cvut.cz/BI-PGA/stud/hoskorad/blob/master/dokumentace1.adoc","/assets/showcase/hoskorad.jpg",["Sada materiálů a filtrů pro detekci hran.","A set of materials and filters for edge detection.","画像の輪郭を抽出するフィルターの比較です。"],"graphics"],
    [["Linky – animace","Linky animation","線のアニメーション"],"PGA","gimp","https://gitlab.fit.cvut.cz/BI-PGA/b201/spaneada/blob/master/gimp/dokumentace1.md","/assets/showcase/cvut2.gif",["Animace v GIMPu založená na kreslených linkách.","GIMP-based animation built on stylised lines.","GIMPで線を使って制作したアニメーションです。"],"graphics"],
    [["Materiál Edge Detect","Edge Detect Material","輪郭を強調するマテリアル"],"PGA","blender","https://gitlab.fit.cvut.cz/BI-PGA/b201/poncaada","/assets/showcase/poncaada.png",["Blender materiál pro zdůraznění hran v 3D scéně.","Blender material to emphasise edges in a 3D scene.","Blenderの3Dシーンでエッジを際立たせます。"],"graphics"],
    [["Gallifreyský překladač","Gallifreyan translator","ガリフレイ語の翻訳機"],"Blender","simulation","https://gitlab.fit.cvut.cz/BI-PGA/b201/kyselba1","/assets/showcase/kyselova.png",["Blender projekt inspirovaný Doctor Who a kruhovým písmem.","Blender project inspired by Doctor Who and circular writing.","『ドクター・フー』の円形文字に着想を得たBlender作品です。"],"graphics"],
    [["Sníh v Blenderu","Blender Snow","Blenderの雪"],"PGA","blender","https://gitlab.fit.cvut.cz/BI-PGA/b201/kacervik","/assets/showcase/kacer.jpg",["Simulace sněhu v prostředí Blenderu.","Snow simulation in Blender.","Blenderで雪をシミュレーションします。"],"graphics"],
    [["Decimace meshů","Decimation","メッシュの簡略化"],"PGA","blender","https://gitlab.fit.cvut.cz/BI-PGA/b201/kvasnric","/assets/showcase/kvasnica.jpg",["Optimalizace složitosti 3D modelů pomocí decimačních algoritmů.","Optimising 3D model complexity using decimation algorithms.","デシメーションで3Dモデルの複雑さを減らします。"],"graphics"],
    [["Magnificent 7","Magnificent 7","Magnificent 7"],"VHS","unity","https://youtu.be/SN_Pse347iI","/assets/showcase/img_vhs_1.png",["Studentská hra vytvořená v Unity v rámci BI-VHS.","Student Unity game created in BI-VHS.","BI-VHSの授業で制作したUnityゲームです。"],"other"],
    [["Pointless Pointers","Pointless Pointers","Pointless Pointers"],"VHS","pixel-art","https://www.youtube.com/watch?v=4u3qrxFuULM&t=1s","/assets/showcase/img_vhs_2.png",["Pixelartová hra z předmětu Virtuální herní světy.","Pixel-art game developed in the Virtual Game Worlds course.","仮想ゲーム世界の授業で開発したピクセルアートゲームです。"],"other"],
    [["Golf Town","Golf Town","Golf Town"],"VHS","unity","https://www.youtube.com/watch?v=OB7_UmOI_2U&t=6s","/assets/showcase/img_vhs_4.png",["VR hra vytvořená v Unity.","Unity-based VR game.","Unityで制作したVRゲームです。"],"other"],
    [["Path of Exile Ripoff","Path of Exile Ripoff","Path of Exile Ripoff"],"VHS","unity","https://www.youtube.com/watch?v=7P3N3s81QqU&t=20s","/assets/showcase/img_vhs_5.png",["MMORPG styl inspirovaný Path of Exile.","MMORPG-style prototype inspired by Path of Exile.","Path of Exileを参考にしたMMORPG風の試作です。"],"other"],
    [["Ardaestra Magitech","Ardaestra Magitech","Ardaestra Magitech"],"VHS","unity","https://youtu.be/Zz09tvnLEuo?list=PLXhipPFpvUWH24SDRyFNhCUIuf8zIkM-m","/assets/showcase/img_vhs_6.png",["Fantasy RPG projekt v Unity.","Fantasy RPG project in Unity.","Unityで制作したファンタジーRPGです。"],"other"],
    [["Honza","Honza","Honza"],"VHS","pixel-art","https://www.youtube.com/watch?v=dhuMuopxlio&list=PLXhipPFpvUWEhSxw79CDOdjFFm5D6b3us&index=4&ab_channel=GrafitCTUFITPrague","/assets/showcase/honzaDetail.png",["Krátká studentská hra z prostředí FITu.","Short student game set at FIT.","FITを舞台にした短編学生ゲームです。"],"other"],
    [["Music Wave – sonifikace obrazu","Music Wave – image sonification","Music Wave：画像の音響化"],"CCC","sonification","https://ni-ccc.github.io/projects/music_wave/","/assets/showcase/niccc_sc5.png",["Konverze obrázků do zvuku a zpět.","Converting images into sound and back.","画像を音に、音を画像に変換します。"],"graphics"],
    [["Zvuk vymírání","The sound of extinction","絶滅の音"],"CCC","audio","https://ni-ccc.github.io/projects/veronika_krystof/","/assets/showcase/niccc_sc6.png",["Audio-vizuální projekt o ohrožených druzích.","Audio-visual project about endangered species.","絶滅危惧種を題材にした映像と音の作品です。"],"graphics"],
    [["Detekce pulsu","Pulse detection","脈拍の検出"],"CCC","computer-vision","https://ni-ccc.github.io/projects/pavel/","/assets/showcase/niccc_sc2.png",["Detekce srdečního tepu z webkamery.","Detecting heart rate from a webcam signal.","ウェブカメラ映像から心拍数を検出します。"],"graphics"],
    [["Vizualizace Covidu","Covid visualisation","コロナ禍の人流の可視化"],"CCC","visualization","https://ni-ccc.github.io/projects/vizualizace_covid/","/assets/showcase/niccc_sc4.png",["Vizualizace pohybu lidí během pandemie Covid-19.","Visualisation of people movement during the Covid-19 pandemic.","パンデミック中の人の移動を可視化します。"],"graphics"],
    [["Renoir – přenos stylu","Renoir style transfer","ルノワールの画風変換"],"CCC","style-transfer","https://ni-ccc.github.io/projects/martin_honza/","/assets/showcase/niccc_sc3.png",["Přenos malířského stylu Augusta Renoira na fotografie.","Transferring the painterly style of Auguste Renoir onto photos.","写真にルノワールの絵画のスタイルを適用します。"],"graphics"],
    [["Fantasy scéna se stromem","Fantasy tree scene","木のある幻想風景"],"BLE","3d","https://iga.ksi.fit.cvut.cz/bi-ble/gallery","/assets/showcase/img_ble_1.png",["Ilustrovaná fantasy scéna v Blenderu.","Illustrated fantasy scene created in Blender.","Blenderで制作したファンタジー風景です。"],"graphics"],
    [["Abstraktní scéna","Abstract scene","抽象的なシーン"],"BLE","animation","https://iga.ksi.fit.cvut.cz/bi-ble/gallery","/assets/showcase/img_ble_2.png",["Experimenty s animovanými abstraktními tvary.","Experiments with animated abstract shapes.","動く抽象形態を探求した作品です。"],"graphics"],
    [["Herní scéna","Game scene","ゲーム向けのシーン"],"BLE","materials","https://iga.ksi.fit.cvut.cz/bi-ble/gallery","/assets/showcase/img_ble_3.png",["Kompletní herní scéna s materiály a světly.","Complete game-ready scene with materials and lighting.","マテリアルと照明を備えたゲーム用シーンです。"],"graphics"]
  ];
  window.GRAFIT_GAMES.push(...showcase.map(([title, course, topic, href, image, description, category]) =>
    [title[i], course, topic, href, image, 1, description[i], description[i], category]));
  // Already in the Games catalogue; include it in the DOD loop without duplicating its card.
  const vivid = window.GRAFIT_GAMES.find(game => game[0] === "Vivid Dreams");
  if (vivid) vivid[5] = 1;
  const strahov = window.GRAFIT_GAMES.find(game => game[0] === "Strahov Gang");
  if (strahov) strahov[3] = "https://youtu.be/n1OENc6Fc2M?list=PLXhipPFpvUWH24SDRyFNhCUIuf8zIkM-m";
})();
