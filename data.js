/* Ocean Feast — authored game data; all dimensions are arcade scales. */
window.OceanData = (() => {
  const rows = [
    ['欧洲鳀','European anchovy','Engraulis encrasicolus','近岸鱼群','细长银色身体、半透明鱼鳍与深色背部。','school', [1,2,3], '#b8d8de'],
    ['欧洲沙丁鱼','European sardine','Sardina pilchardus','近岸鱼群','银亮的侧腹与流线形身体，适合成群巡游。','school',[1,2,3], '#b6d0cf'],
    ['大西洋鲱','Atlantic herring','Clupea harengus','冷水鱼群','蓝绿色背部与银色腹部构成典型的反荫蔽配色。','school',[1,3,5], '#99bbc8'],
    ['眼斑双锯鱼','Clownfish','Amphiprion ocellaris','热带珊瑚礁','橙色身体上有三条白色横带，边缘带黑色描边。','reef',[0], '#f6a05a'],
    ['蓝刺尾鱼','Blue tang','Paracanthurus hepatus','热带珊瑚礁','鲜蓝色体侧、黑色图案与黄色尾鳍非常醒目。','reef',[0], '#4ca1ea'],
    ['黄高鳍刺尾鱼','Yellow tang','Zebrasoma flavescens','热带珊瑚礁','侧扁的亮黄色身体，背鳍与臀鳍轮廓高而圆。','reef',[0], '#f1d65f'],
    ['镊口鱼','Copperband butterflyfish','Chelmon rostratus','热带珊瑚礁','狭长吻部与铜橙色竖纹是鲜明的外形特征。','reef',[0], '#e9bd79'],
    ['女王神仙鱼','Queen angelfish','Holacanthus ciliaris','热带珊瑚礁','蓝黄相间的侧扁体形，额部具有冠状深色斑纹。','reef',[0], '#86c9cb'],
    ['蓑鲉','Red lionfish','Pterois volitans','珊瑚礁与沉船','扇状胸鳍与醒目的鳍棘构成独特轮廓。游戏中不可吞食。','hazard',[0,4], '#c58b73'],
    ['虹彩鹦嘴鱼','Rainbow parrotfish','Scarus guacamaia','热带珊瑚礁','粗壮的身体与喙状口部，体表带蓝绿及暖色调。','reef',[0], '#72c8ae'],
    ['斑点隆头鱼','Ballan wrasse','Labrus bergylta','岩礁与海藻区','厚唇与有斑纹的鳞片，体色变化较丰富。','reef',[1], '#b49471'],
    ['欧洲海鲈','European sea bass','Dicentrarchus labrax','近岸与河口','银灰色身躯、深色背部与分明的背鳍。','hunter',[1,2], '#a1c1c9'],
    ['大西洋鲭','Atlantic mackerel','Scomber scombrus','温带上层海洋','蓝绿背部具有波浪状暗纹，尾柄细而有力。','school',[1,3], '#73b8c2'],
    ['红笛鲷','Northern red snapper','Lutjanus campechanus','近岸礁区','红粉色鳞片和轮廓清晰的背鳍。','hunter',[0,2,4], '#d79583'],
    ['褐点石斑鱼','Brown-marbled grouper','Epinephelus fuscoguttatus','珊瑚礁与礁洞','大口、厚重的身体和褐色斑驳花纹。','hunter',[0,4], '#a59c80'],
    ['珍鲹','Giant trevally','Caranx ignobilis','礁区与外海','侧扁而强壮，头部较陡，尾鳍深叉。','hunter',[0,2,3], '#96b8b9'],
    ['鲯鳅','Mahi-mahi','Coryphaena hippurus','热带与亚热带外海','蓝绿金黄的虹彩身体，长背鳍几乎延伸至尾部。','hunter',[3], '#a6d561'],
    ['大魣','Great barracuda','Sphyraena barracuda','礁区与外海','细长的鱼雷形身体与突出的下颌。','hunter',[0,2,3,4], '#afbdc3'],
    ['黄鳍金枪鱼','Yellowfin tuna','Thunnus albacares','温暖外海','纺锤形身体，黄色离鳍与弯曲的镰状鳍。','hunter',[3], '#a5bdb2'],
    ['大西洋蓝鳍金枪鱼','Atlantic bluefin tuna','Thunnus thynnus','远洋水域','厚实的纺锤形身体与新月状尾鳍。','hunter',[3,5], '#7d99a7'],
    ['大西洋鳕','Atlantic cod','Gadus morhua','冷水大陆架','带斑点的体表、三枚背鳍和下颌触须。','hunter',[5], '#b7b0a0'],
    ['大西洋鲑','Atlantic salmon','Salmo salar','北大西洋与河流','银色成鱼带深色斑点，尾前具有小脂鳍。','hunter',[2,5], '#b9c1c4'],
    ['牙鲆','Olive flounder','Paralichthys olivaceus','近岸海底','扁平的身体与斑驳伪装，双眼位于身体同侧。','bottom',[1,2,5], '#aa9c7e'],
    ['绿裸胸鳝','Green moray','Gymnothorax funebris','礁洞与缝隙','长而柔韧的鳗形身体，没有胸鳍。','hunter',[0,4], '#94a76d'],
    ['黑鳍礁鲨','Blacktip reef shark','Carcharhinus melanopterus','热带浅礁','背鳍等部位的黑色鳍尖，是辨识它的线索。','apex',[0,2,3], '#a0bbc0'],
    ['路氏双髻鲨','Scalloped hammerhead','Sphyrna lewini','热带与温带外海','横向扩展的头部形成标志性的锤形轮廓。','apex',[3,4], '#a6b7bf'],
    ['大白鲨','Great white shark','Carcharodon carcharias','沿岸与外海','背部灰色、腹部白色，躯干粗壮，尾鳍有力。','apex',[1,3,5], '#b9c5ce'],
    ['鲸鲨','Whale shark','Rhincodon typus','温暖海洋','宽阔头部、斑点与纵横浅纹。作为温和的背景巨兽出现。','neutral',[0,3], '#8dabb9'],
    ['双吻前口蝠鲼','Oceanic manta ray','Mobula birostris','温暖外海','翼状胸鳍、头鳍和修长尾部，缓慢掠过海域。','neutral',[0,3], '#92a2b1'],
    ['绿海龟','Green sea turtle','Chelonia mydas','热带与亚热带海洋','流线形龟壳与桨状前肢。游戏中只作环境生物。','neutral',[0,2,4], '#9baf85'],
    ['宽吻海豚','Bottlenose dolphin','Tursiops truncatus','沿岸与外海','弯曲背鳍、短吻与水平尾叶。游戏中不会攻击玩家。','neutral',[2,3], '#a4bec8'],
    ['虎鲸','Orca','Orcinus orca','多种海洋环境','黑白色块、高背鳍与眼后白斑。是本作大型追逐者。','apex',[3,5], '#cad2d3'],
    ['座头鲸','Humpback whale','Megaptera novaeangliae','广泛迁徙的海洋','修长胸鳍、头部结节与宽大的水平尾叶。','neutral',[3,5], '#92a5b2'],
    ['海月水母','Moon jelly','Aurelia spp.','近岸与上层海洋','半透明伞体与四个环状结构，随水流轻缓脉动。','hazard',[0,1,2,3,4,5,6], '#a9d9e2'],
    ['莱氏拟乌贼','Bigfin reef squid','Sepioteuthis lessoniana','温暖近岸水域','身体两侧的宽鳍与前端腕足，具有喷射游动的轮廓。','squid',[0,2,4], '#c1a7ae'],
    ['约氏黑角鮟鱇','Black seadevil','Melanocetus johnsonii','深海中层','雌鱼具有醒目的头部诱饵器、大口与暗色身体。','deep',[6,7], '#8d939c'],
  ];
  const species = rows.map((r,id)=>({id,name:r[0],en:r[1],latin:r[2],habitat:r[3],note:r[4],role:r[5],maps:r[6],color:r[7],sheet:id<18?0:1,cell:id%18}));
  const maps = [
    {id:0,name:'珊瑚浅海',en:'CORAL LAGOON',depth:'08 — 30 M',color:'#64dfcd',desc:'日光穿过清澈海水。穿行珊瑚之间，从一条小鱼开始。',player:13,small:[0,1,3,4,5,6],medium:[7,9,10,13],large:[14,15,17],predators:[24,17],hazards:[8,33],ambient:[28,29,27],current:0,dark:0,stages:['初入浅海','珊瑚间隙','银色鱼群','暗礁猎手','潮汐盛宴','礁区之王']},
    {id:1,name:'海带森林',en:'KELP FOREST',depth:'15 — 45 M',color:'#b3cd83',desc:'海带随浪摇曳。沿着光柱游动，小心林间悄然靠近的身影。',player:11,small:[0,1,2,12],medium:[10,11,22],large:[11,20,17],predators:[26,17],hazards:[33],ambient:[30],current:12,dark:0,stages:['林间微光','摇曳长廊','猎手的影子','金色波纹','逆流前行','森林领主']},
    {id:2,name:'红树林河口',en:'MANGROVE ESTUARY',depth:'02 — 15 M',color:'#d5c38c',desc:'根系围成隐秘的育幼场。顺应河口潮流，寻找成群的小鱼。',player:11,small:[0,1,3,34],medium:[11,13,21,22],large:[15,17,23],predators:[17,24],hazards:[33],ambient:[29,30],current:28,dark:0,stages:['根系迷宫','涨潮时分','河口快游','沙洲伏击','银鳞漩涡','潮间霸主']},
    {id:3,name:'蔚蓝远洋',en:'THE OPEN BLUE',depth:'30 — 180 M',color:'#79c9ef',desc:'离开海岸，进入无垠的蓝。金枪鱼、鲨鱼与远方的海洋巨兽。',player:16,small:[0,1,2,12],medium:[12,15,16,18],large:[17,18,19],predators:[24,25,26,31],hazards:[33],ambient:[27,28,30,32],current:18,dark:0,stages:['离岸航线','追逐蓝光','金枪鱼风暴','巨兽来访','远洋狂潮','蓝海王者']},
    {id:4,name:'沉船遗迹',en:'THE LOST WRECK',depth:'40 — 100 M',color:'#a5bbc7',desc:'被海洋收藏的遗迹。石斑鱼隐入船舱，蓑鲉守候在暗处。',player:14,small:[0,1,6,34],medium:[13,14,23],large:[14,17,23],predators:[17,25],hazards:[8,33],ambient:[29],current:6,dark:.16,stages:['无声甲板','锈色回廊','船舱藏影','海底宝藏','残骸追逐','遗迹守望']},
    {id:5,name:'极地冰海',en:'POLAR WATERS',depth:'10 — 150 M',color:'#b4e3ec',desc:'浮冰之下，冷蓝色的世界依然生机勃勃。留意虎鲸的巡游路线。',player:21,small:[0,1,2],medium:[20,21,22,12],large:[19,20,21],predators:[26,31],hazards:[33],ambient:[32],current:22,dark:.07,stages:['冰下之光','寒流鱼群','蓝色裂隙','虎鲸航迹','冰海竞速','极境生存']},
    {id:6,name:'暮光水域',en:'THE TWILIGHT ZONE',depth:'200 — 1,000 M',color:'#9eafe4',desc:'日光渐渐退去，生物微光浮现。视野收窄，保持耐心。',player:35,small:[34],medium:[34,35],large:[35,34],predators:[35],hazards:[],ambient:[],current:8,dark:.32,stages:['光的边缘','海洋之雪','微光猎手','无声迁徙','幽蓝脉冲','暮光之主']},
    {id:7,name:'深渊热泉',en:'THE ABYSS',depth:'2,000 M +',color:'#bca6df',desc:'最后的幻想挑战。沿着幽微热泉，在深色水幕中完成食物链的攀登。',player:35,small:[34],medium:[35,34],large:[35],predators:[35],hazards:[],ambient:[],current:10,dark:.43,stages:['深渊入口','黑色烟囱','热泉边缘','最后的光','寂静狂潮','深海食物链']},
  ];
  const levels=maps.flatMap(m=>m.stages.map((title,n)=>({id:m.id*6+n,map:m.id,local:n,title,goal:64+n*9+m.id*4,time:170-n*6,density:30+n*2,threats:2+Math.floor(n/2),subtitle:n===5?'海域终章':n<2?'适应海域':n<4?'成长挑战':'生存进阶'})));
  const roleNames={school:'群游鱼类',reef:'礁区鱼类',hunter:'捕食鱼类',apex:'大型追逐者',neutral:'环境生物',hazard:'接触危险',bottom:'底栖鱼类',squid:'敏捷游泳者',deep:'深水猎手'};
  return {species,maps,levels,roleNames};
})();
