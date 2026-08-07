# 仙途 · 素材授权台账（2V）

> 维护规则：每一张新增图片在此登记「来源 / 作者 / 授权类型 / 是否需署名 / 下载日期」。
> 本作素材统一要求：免费可商用、无水印、风格统一（水墨仙侠半身像 + 同款边框）。

## 一、AI 生成素材（默认主力管线）

- **来源**：本地 AI 图像生成（用户授权，按次调用）
- **授权**：生成即所有，可商用，无署名要求
- **水印**：无
- **覆盖范围**：角色立绘（出身/宗门/NPC/道侣）、场景背景、图标
- **命名规范**：`assets/portraits/{type}_{name}_{emotion}.jpg`（表情后缀：default/happy/angry/sad/shy/doubt 等）
- **目录**：`assets/portraits/`、`assets/scenes/`、`icons/`

## 二、免费可商用渠道（补充管线，按需接入）

| 渠道 | 授权类型 | 是否需署名 | 用途建议 | 状态 |
|---|---|---|---|---|
| itch.io 仙侠/VN 立绘包（LinXueLian / Miscel240 等） | 各包独立（多数免费） | 以包内说明为准 | 立绘补充 | 待接入 |
| Pixabay 水墨山水 / 纹理 | Pixabay License | 否 | 场景背景 | 待接入 |
| OpenGameArt | CC0 / OGA-BY / GPL | CC0 否 / OGA-BY 需署名 | 角色/场景/音效 | 待接入 |
| Kenney.nl | CC0 | 否 | UI 图标、通用元素、音效 | 待接入 |
| 爱给网（仙侠背景/免抠立绘） | CCE 可商用-署名 | 是（游戏内鸣谢页列名） | 背景补缺 | 待接入 |
| summerengine.com | 免费无限制 | 否 | 批量补缺图 | 待接入 |

## 三、需署名素材登记表

> 引入任何需署名素材时，在此追加一行，并在「设置 → 素材鸣谢」页同步展示。

| 图片 | 来源 | 作者 | 授权 | 署名方式 | 下载日期 |
|---|---|---|---|---|---|
| （暂无） | — | — | — | — | — |

## 三·补、2026-08-06 新增 AI 生成立绘（免署名）

| 图片 | 来源 | 授权 | 水印 | 用途 | 生成日期 |
|---|---|---|---|---|---|
| assets/portraits/child_m.jpg | LuckyAPI gpt-image-2（按次，用户授权） | 生成即所有，可商用免署名 | 无（视觉抽查确认） | 子嗣·男童立绘 | 2026-08-06 |
| assets/portraits/child_f.jpg | LuckyAPI gpt-image-2（按次，用户授权） | 同上 | 无（视觉抽查确认） | 子嗣·女童立绘 | 2026-08-06 |
| assets/portraits/npc_shengnv.jpg | LuckyAPI gpt-image-2（按次，用户授权） | 同上 | 无（视觉抽查确认） | 魔道圣女立绘 | 2026-08-06 |
| assets/portraits/npc_binggong.jpg | LuckyAPI gpt-image-2（按次，用户授权） | 同上 | 无 | 冰宫仙子立绘 | 2026-08-06 |
| assets/portraits/npc_qinshuang.jpg | LuckyAPI gpt-image-2（按次，用户授权） | 同上 | 无 | 琴阁双姝立绘 | 2026-08-06 |
| assets/portraits/npc_caishen.jpg | LuckyAPI gpt-image-2（按次，用户授权） | 同上 | 无 | 商道女财神立绘 | 2026-08-06 |
| assets/portraits/npc_jianshi.jpg | LuckyAPI gpt-image-2（按次，用户授权） | 同上 | 无 | 昆仑剑侍立绘 | 2026-08-06 |
| assets/portraits/npc_baonv.jpg | LuckyAPI gpt-image-2（按次，用户授权） | 同上 | 无 | 妖族豹女立绘 | 2026-08-06 |
| assets/scenes/map.jpg | AnyaIGC gpt-image-2（用户授权，备用额度） | 同上 | 无（视觉桥抽查确认） | 九州舆图底图（SVG 标记叠加用） | 2026-08-06 |
| assets/scenes/tianyan.jpg | AnyaIGC gpt-image-2（用户授权，备用额度） | 同上 | 无（视觉桥抽查确认） | 主线·天衍祭坛场景 | 2026-08-06 |
| assets/scenes/ghostgate.jpg | AnyaIGC gpt-image-2（用户授权，备用额度） | 同上 | 无（视觉桥抽查确认） | 主线·幽冥之门场景 | 2026-08-06 |

> 说明：以上立绘与场景图均由用户授权的图像生成接口生成（LuckyAPI / AnyaIGC 的 gpt-image-2），
> 生成提示均含「无文字、无水印」，并已用视觉桥抽查确认画面干净；场景图为 1536×1024 压缩 JPG 入仓。

## 四、无水印规则

1. 优先使用原生无水印渠道（Pixabay / itch.io 包内文件 / OGA / Kenney / summerengine）；
2. 转载站素材一律人工核验水印与授权后方可使用；
3. AI 生成图检查无品牌水印（本作管线已保证）。

## 五、风格统一

- 立绘统一半身像 + 同款边框/底纹；场景统一水墨风；
- 用 CSS filter（sepia / hue-rotate）统一色调；
- 需统一裁切 512-1024px、优化体积（WebP 可选）。

## 三·补·2、2026-08-07 六页导航图卡（AnyaIGC gpt-image-2）

| 图片 | 来源 | 授权 | 水印 | 用途 | 生成日期 |
|---|---|---|---|---|---|
| assets/pages/biz.jpg | AnyaIGC gpt-image-2（用户授权，备用额度） | 生成即所有，可商用免署名 | 无（视觉抽查） | 六页导航·页面横幅 | 2026-08-07 |
| assets/pages/cult.jpg | AnyaIGC gpt-image-2（用户授权，备用额度） | 生成即所有，可商用免署名 | 无（视觉抽查） | 六页导航·页面横幅 | 2026-08-07 |
| assets/pages/me.jpg | AnyaIGC gpt-image-2（用户授权，备用额度） | 生成即所有，可商用免署名 | 无（视觉抽查） | 六页导航·页面横幅 | 2026-08-07 |
| assets/pages/sect.jpg | AnyaIGC gpt-image-2（用户授权，备用额度） | 生成即所有，可商用免署名 | 无（视觉抽查） | 六页导航·页面横幅 | 2026-08-07 |
| assets/pages/social.jpg | AnyaIGC gpt-image-2（用户授权，备用额度） | 生成即所有，可商用免署名 | 无（视觉抽查） | 六页导航·页面横幅 | 2026-08-07 |
| assets/pages/world.jpg | AnyaIGC gpt-image-2（用户授权，备用额度） | 生成即所有，可商用免署名 | 无（视觉抽查） | 六页导航·页面横幅 | 2026-08-07 |
| assets/modules/biz_bag.jpg | AnyaIGC gpt-image-2（用户授权，备用额度） | 生成即所有，可商用免署名 | 无（视觉抽查） | 六页导航·模块图卡 | 2026-08-07 |
| assets/modules/biz_craft.jpg | AnyaIGC gpt-image-2（用户授权，备用额度） | 生成即所有，可商用免署名 | 无（视觉抽查） | 六页导航·模块图卡 | 2026-08-07 |
| assets/modules/biz_equip.jpg | AnyaIGC gpt-image-2（用户授权，备用额度） | 生成即所有，可商用免署名 | 无（视觉抽查） | 六页导航·模块图卡 | 2026-08-07 |
| assets/modules/biz_home.jpg | AnyaIGC gpt-image-2（用户授权，备用额度） | 生成即所有，可商用免署名 | 无（视觉抽查） | 六页导航·模块图卡 | 2026-08-07 |
| assets/modules/biz_market.jpg | AnyaIGC gpt-image-2（用户授权，备用额度） | 生成即所有，可商用免署名 | 无（视觉抽查） | 六页导航·模块图卡 | 2026-08-07 |
| assets/modules/cult_break.jpg | AnyaIGC gpt-image-2（用户授权，备用额度） | 生成即所有，可商用免署名 | 无（视觉抽查） | 六页导航·模块图卡 | 2026-08-07 |
| assets/modules/cult_dao.jpg | AnyaIGC gpt-image-2（用户授权，备用额度） | 生成即所有，可商用免署名 | 无（视觉抽查） | 六页导航·模块图卡 | 2026-08-07 |
| assets/modules/cult_dual.jpg | AnyaIGC gpt-image-2（用户授权，备用额度） | 生成即所有，可商用免署名 | 无（视觉抽查） | 六页导航·模块图卡 | 2026-08-07 |
| assets/modules/cult_heart.jpg | AnyaIGC gpt-image-2（用户授权，备用额度） | 生成即所有，可商用免署名 | 无（视觉抽查） | 六页导航·模块图卡 | 2026-08-07 |
| assets/modules/cult_mind.jpg | AnyaIGC gpt-image-2（用户授权，备用额度） | 生成即所有，可商用免署名 | 无（视觉抽查） | 六页导航·模块图卡 | 2026-08-07 |
| assets/modules/cult_pet.jpg | AnyaIGC gpt-image-2（用户授权，备用额度） | 生成即所有，可商用免署名 | 无（视觉抽查） | 六页导航·模块图卡 | 2026-08-07 |
| assets/modules/cult_tech.jpg | AnyaIGC gpt-image-2（用户授权，备用额度） | 生成即所有，可商用免署名 | 无（视觉抽查） | 六页导航·模块图卡 | 2026-08-07 |
| assets/modules/cult_x.jpg | AnyaIGC gpt-image-2（用户授权，备用额度） | 生成即所有，可商用免署名 | 无（视觉抽查） | 六页导航·模块图卡 | 2026-08-07 |
| assets/modules/me_atlas.jpg | AnyaIGC gpt-image-2（用户授权，备用额度） | 生成即所有，可商用免署名 | 无（视觉抽查） | 六页导航·模块图卡 | 2026-08-07 |
| assets/modules/me_career.jpg | AnyaIGC gpt-image-2（用户授权，备用额度） | 生成即所有，可商用免署名 | 无（视觉抽查） | 六页导航·模块图卡 | 2026-08-07 |
| assets/modules/me_char.jpg | AnyaIGC gpt-image-2（用户授权，备用额度） | 生成即所有，可商用免署名 | 无（视觉抽查） | 六页导航·模块图卡 | 2026-08-07 |
| assets/modules/me_save.jpg | AnyaIGC gpt-image-2（用户授权，备用额度） | 生成即所有，可商用免署名 | 无（视觉抽查） | 六页导航·模块图卡 | 2026-08-07 |
| assets/modules/me_setting.jpg | AnyaIGC gpt-image-2（用户授权，备用额度） | 生成即所有，可商用免署名 | 无（视觉抽查） | 六页导航·模块图卡 | 2026-08-07 |
| assets/modules/me_tome.jpg | AnyaIGC gpt-image-2（用户授权，备用额度） | 生成即所有，可商用免署名 | 无（视觉抽查） | 六页导航·模块图卡 | 2026-08-07 |
| assets/modules/me_update.jpg | AnyaIGC gpt-image-2（用户授权，备用额度） | 生成即所有，可商用免署名 | 无（视觉抽查） | 六页导航·模块图卡 | 2026-08-07 |
| assets/modules/sect_big.jpg | AnyaIGC gpt-image-2（用户授权，备用额度） | 生成即所有，可商用免署名 | 无（视觉抽查） | 六页导航·模块图卡 | 2026-08-07 |
| assets/modules/sect_home.jpg | AnyaIGC gpt-image-2（用户授权，备用额度） | 生成即所有，可商用免署名 | 无（视觉抽查） | 六页导航·模块图卡 | 2026-08-07 |
| assets/modules/sect_pay.jpg | AnyaIGC gpt-image-2（用户授权，备用额度） | 生成即所有，可商用免署名 | 无（视觉抽查） | 六页导航·模块图卡 | 2026-08-07 |
| assets/modules/social_dual.jpg | AnyaIGC gpt-image-2（用户授权，备用额度） | 生成即所有，可商用免署名 | 无（视觉抽查） | 六页导航·模块图卡 | 2026-08-07 |
| assets/modules/social_family.jpg | AnyaIGC gpt-image-2（用户授权，备用额度） | 生成即所有，可商用免署名 | 无（视觉抽查） | 六页导航·模块图卡 | 2026-08-07 |
| assets/modules/social_master.jpg | AnyaIGC gpt-image-2（用户授权，备用额度） | 生成即所有，可商用免署名 | 无（视觉抽查） | 六页导航·模块图卡 | 2026-08-07 |
| assets/modules/social_people.jpg | AnyaIGC gpt-image-2（用户授权，备用额度） | 生成即所有，可商用免署名 | 无（视觉抽查） | 六页导航·模块图卡 | 2026-08-07 |
| assets/modules/social_tea.jpg | AnyaIGC gpt-image-2（用户授权，备用额度） | 生成即所有，可商用免署名 | 无（视觉抽查） | 六页导航·模块图卡 | 2026-08-07 |
| assets/modules/social_travel.jpg | AnyaIGC gpt-image-2（用户授权，备用额度） | 生成即所有，可商用免署名 | 无（视觉抽查） | 六页导航·模块图卡 | 2026-08-07 |
| assets/modules/world_boss.jpg | AnyaIGC gpt-image-2（用户授权，备用额度） | 生成即所有，可商用免署名 | 无（视觉抽查） | 六页导航·模块图卡 | 2026-08-07 |
| assets/modules/world_dungeon.jpg | AnyaIGC gpt-image-2（用户授权，备用额度） | 生成即所有，可商用免署名 | 无（视觉抽查） | 六页导航·模块图卡 | 2026-08-07 |
| assets/modules/world_main.jpg | AnyaIGC gpt-image-2（用户授权，备用额度） | 生成即所有，可商用免署名 | 无（视觉抽查） | 六页导航·模块图卡 | 2026-08-07 |
| assets/modules/world_map.jpg | AnyaIGC gpt-image-2（用户授权，备用额度） | 生成即所有，可商用免署名 | 无（视觉抽查） | 六页导航·模块图卡 | 2026-08-07 |
| assets/modules/world_season.jpg | AnyaIGC gpt-image-2（用户授权，备用额度） | 生成即所有，可商用免署名 | 无（视觉抽查） | 六页导航·模块图卡 | 2026-08-07 |
| assets/modules/world_sword.jpg | AnyaIGC gpt-image-2（用户授权，备用额度） | 生成即所有，可商用免署名 | 无（视觉抽查） | 六页导航·模块图卡 | 2026-08-07 |
| assets/modules/world_wander.jpg | AnyaIGC gpt-image-2（用户授权，备用额度） | 生成即所有，可商用免署名 | 无（视觉抽查） | 六页导航·模块图卡（v55 云游悟道） | 2026-08-07 |
| assets/modules/world_tower.jpg | AnyaIGC gpt-image-2（用户授权，备用额度） | 生成即所有，可商用免署名 | 无（视觉抽查） | 六页导航·模块图卡 | 2026-08-07 |

