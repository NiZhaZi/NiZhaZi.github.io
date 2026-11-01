# 深海食物链 · Ocean Feast — Nature Edition 2.0

致敬《Feeding Frenzy》一代吞食成长玩法的原创浏览器游戏。并非官方作品，也没有使用原游戏素材。

## 运行

离线压缩包解压后，直接打开 `index.html` 即可。不需要安装依赖、登录或连接网络。离线包内附带图像数据脚本，避免本地文件的 Canvas 跨源限制。

本地运行仓库源码时，在 `` 目录运行 `python -m http.server 8000`，然后打开 `http://localhost:8000`。

## 内容

- 8 个海域、48 个可直接选择的关卡，每关分三段成长。
- 36 种海洋生物原型与可搜索图鉴；玩家在不同海域控制不同的鱼。
- 鼠标、WASD、方向键、触控拖动；空格或右键冲刺，E 吸食附近较小的鱼，Esc / P 暂停。
- 连续吞食奖励、十连吃狂潮、珍珠、充能气泡、捕食者追逐、生命及星级结算。
- 自由探索没有倒计时；每次填满成长条开启新一轮并保留本次分数，生命仍有限。
- 浏览器本地保存成绩、星级、发现记录和设置；不同浏览器与不同站点地址的存档互不共享。清理浏览器数据会移除存档。
- 高/节能画质、减少动态效果、危险提示、声音与音量设置。

## 美术与生态范围

海域与生物素材由内置图像生成工具制作，采用写实自然史插画 / 水下摄影风格。它们不是科学级生物模型。体型比例、捕食关系、地域组合和出现深度按街机玩法作了调整；深海章节沿用部分头足类轮廓并加入艺术化微光。素材是 2D 透明图集，鱼尾通过实时变形驱动，并非完整 3D 模型。

现实生态资料参考：
- https://www.montereybayaquarium.org/visit/exhibits/open-sea/
- https://www.montereybayaquarium.org/visit/exhibits/kelp-forest
- https://www.montereybayaquarium.org/animals-the-ocean/animals-a-to-z/moon-jelly

鲸鲨、蝠鲼、绿海龟、宽吻海豚和座头鲸在本作中仅作为安全的环境生物。蓑鲉、水母为接触障碍，其余互动按相对游戏体型决定。

## 生成离线包

`python scripts/package-offline.py /absolute/path/Ocean_Feast_Wild_v2.0.zip`

## 源文件

- `data.js`：生物、地图、关卡和难度。
- `engine.js`：移动、追逐、成长、技能、碰撞、音效及结算。
- `render.js`：生物图集提取、鱼尾动画、海域背景与粒子。
- `app.js`：界面、输入、图鉴、本地存档。
- `assets/`：原始生成 PNG、图集边界元数据。
- `fauna-assets.md`、`biome-assets.md`：素材提示词及生成说明。

Canvas 渲染按设备分辨率缩放；原图只在载入时分离一次，静态背景按海域缓存。游戏暂停或浏览器切至后台时停止玩法模拟。
