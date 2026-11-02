# 深海食物链 · Ocean Feast — Nature Edition 2.1

致敬《Feeding Frenzy》一代吞食成长玩法的原创浏览器游戏。并非官方作品，也没有使用原游戏素材。

## 运行

离线压缩包解压后，直接打开 `index.html` 即可。不需要安装依赖、登录或连接网络。离线包内附带图像数据脚本，避免本地文件的 Canvas 跨源限制。

本地运行仓库源码时，在 `` 目录运行 `python -m http.server 8000`，然后打开 `http://localhost:8000`。

## 内容

- 8 个海域、48 个可直接选择的关卡，每关分三段成长。
- 72 个可遇见的海洋生物图鉴条目。海域选择页可切换推荐主角或五种一代主角的写实原型。
- 海鲂可在海带森林与沉船遗迹遇见。图鉴支持按经典原型和海域筛选，按中文名、英文名、学名或主角名搜索。
- 嘴部与较小猎物的躯干相交才会吞食。每种生物有独立口部位置，随朝向、倾斜和大小变化。冲刺沿嘴部路径连续检测，吸食把小鱼拉到嘴边。大型捕食者也用嘴攻击，水母按身体接触判定。
- 鼠标、WASD、方向键、触控拖动；空格或右键冲刺，E 吸食附近较小的鱼，Esc / P 暂停。
- 连续吞食奖励、十连吃狂潮、珍珠、充能气泡、捕食者追逐、生命及星级结算。
- 自由探索没有倒计时；每次填满成长条开启新一轮并保留本次分数，生命仍有限。
- 浏览器本地保存成绩、星级、发现记录和设置；不同浏览器与不同站点地址的存档互不共享。清理浏览器数据会移除存档。
- 高/节能画质、减少动态效果、危险提示、声音与音量设置。

## 美术与生态范围

海域与生物素材由内置图像生成工具制作，采用写实自然史插画 / 水下摄影风格。它们不是科学级生物模型。体型比例、捕食关系、地域组合和出现深度按街机玩法作了调整；暮光与深渊海域加入蝰鱼、灯笼鱼、宽咽鱼、管眼鱼、吸血鬼乌贼、具足虫和热泉底栖生物，照明经过艺术化处理。素材是 2D 透明图集，鱼尾通过实时变形驱动，并非完整 3D 模型。

现实原型与经典角色资料

- https://australian.museum/learn/animals/fishes/john-dory-zeus-faber/
- https://www.mbari.org/education/animals-of-the-deep/
- https://fishdb.sinica.edu.tw/taxon/382980-fishdb
- https://wiki-origin.giantbomb.com/wiki/Games/Feeding_Frenzy
- https://www.montereybayaquarium.org/visit/exhibits/open-sea/
- https://www.montereybayaquarium.org/visit/exhibits/kelp-forest
- https://www.montereybayaquarium.org/animals-the-ocean/animals-a-to-z/moon-jelly

鲸鲨、座头鲸、宽吻海豚、砗磲、蓝指海星、吸血鬼乌贼和海猪等为安全环境生物。蓑鲉按游戏内相对大小参与食物链。生物类群的现实代表与原作角色名分别记录。原有浏览器存档沿用同一个键，旧版星级、最佳成绩和图鉴记录均可继续使用。

## 生成离线包

`python scripts/package-offline.py /absolute/path/Ocean_Feast_Wild_v2.1.zip`

## 源文件

- `data.js`：生物、地图、关卡和难度。
- `geometry.js`：共享的嘴部、躯干与移动路径判定。
- `engine.js`：移动、追逐、成长、技能、碰撞、音效及结算。
- `render.js`：生物图集提取、鱼尾动画、海域背景与粒子。
- `app.js`：界面、输入、图鉴、本地存档。
- `assets/`：原始生成 PNG、图集边界元数据。
- `fauna-assets.md`、`biome-assets.md`：素材提示词及生成说明。

Canvas 渲染按设备分辨率缩放；原图只在载入时分离一次，静态背景按海域缓存。游戏暂停或浏览器切至后台时停止玩法模拟。
