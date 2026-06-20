# Changelog

本檔記錄 **Carbon Lens 碳排鏡菱** 的重要變更。格式參考 [Keep a Changelog](https://keepachangelog.com/);專案為 pre-1.0,尚未發行版本標籤,條目以開發輪次(round)分段。

貫穿原則 — **資料紅線**:法規數字標一手來源、不編造未驗證值;無官方數據者(如台灣 ETS 總量/配額/額度價格)只做明標假設的情境試算,絕不假裝算得出。

---

## R4 — 扣件廠走查修復 + 台灣碳市場三軌前瞻 (2026-06-20)

由「鋐昌金屬工業」(虛構,台/越/泰三廠扣件廠)ESG 從業人員 persona 走完整 ESG 管理週期所驅動的一輪修復,加上回應環境部「三軌並進」(碳費 → ETS → 國際碳權)政策的前瞻能力。所有走查批評均經反方代理對抗式覆核(嘗試推翻、舉證),確認為真才修;並推翻 2 條誤報。

- 6 個 PR([#37](https://github.com/JLO916/carbonlens/pull/37)–[#42](https://github.com/JLO916/carbonlens/pull/42)),全數合併並部署。
- 測試 **278 通過**(本輪 +24);`tsc --noEmit`、`next build` 乾淨;正式站逐筆部署確認。

### Added — 台灣碳市場三軌前瞻

回應環境部三軌並進政策(碳費 → ETS 2028 試行 → 國際碳權 Article 6)。

- **義務行事曆 ETS 里程碑**([#41](https://github.com/JLO916/carbonlens/pull/41)):三個有源里程碑(2026 下半年試行計畫、2026 年底交易平台上線碳交所×EEX、2028 試行總量管制交易),以「制度里程碑」標籤插入時間軸——僅台灣廠、過期即移除、永不標「逾期」。
- **碳費 → ETS 轉型前瞻**([#42](https://github.com/JLO916/carbonlens/pull/42)):使用者設定「額度價格 + 免費配額占比」,並排比較費率制碳費(真引擎)vs 總量管制買額度(假設)。
- **碳資產正面框架**([#42](https://github.com/JLO916/carbonlens/pull/42)):減量低於免費配額 → 剩餘額度=可賣出≈潛在收益,呼應「低排碳企業可創造新收益」。
- **碳權 / Article 6 抵換路徑**([#42](https://github.com/JLO916/carbonlens/pull/42)):殘餘排放的三路徑(國內自願減量額度、Article 6 國際碳權含台×巴拉圭、減量優先),質性、無編造價格。
- **三軌敘事 + SEO**([#42](https://github.com/JLO916/carbonlens/pull/42)):glossary 新增 `ets`、`carbonCredit`(Art. 6)雙層次術語;方法論新增有源三軌段;SEO 關鍵字(台灣ETS、總量管制、碳費轉ETS、碳權、Article 6、碳資產);延伸閱讀 feed 已配對 ETS/碳權新聞。

### Fixed — 走查發現的問題

**Blocker**

- **泰國碳稅課錯稅基**([#37](https://github.com/JLO916/carbonlens/pull/37)):純用電的泰國廠被課 THB 855,000 幻影碳稅(泰稅僅及油品),灌水 P&L 美元總額約 38%、污染 CBAM 交叉抵扣。改為稅基=盤查中的油品燃燒排放;直填總數無法拆分油品占比 → 課 0、UI 說明、絕不亂猜。
- **年份輸入凍頁**([#37](https://github.com/JLO916/carbonlens/pull/37)):目標年全選重打「2050」被逐鍵夾成 2000050,軌跡迴圈建出約 200 萬點、整頁凍死。改為失焦才夾限 [2000, 2100];引擎端再硬夾 [1990, 2100]。

**Top 10 — 資料正確性與可信度**

- **CBAM 分攤 SEE 分母錯用出口量**([#38](https://github.com/JLO916/carbonlens/pull/38)):高估近 7 倍。改用「廠年總產量」(Reg (EU) 2023/1773 activity level);未填則退回出口量並亮警示。
- **PCF 把全組織足跡攤到部分料號**([#38](https://github.com/JLO916/carbonlens/pull/38)):每支高估近 10 倍。新增「產出涵蓋比例 %」;留空視同 100% 且卡片/聲明明說。
- **CBAM 逐年圖把「盤查分攤」線當鎖定 → 空白**([#40](https://github.com/JLO916/carbonlens/pull/40)):ramp 與 P&L/抵扣一致解析分攤線,假「待解鎖」消失。
- **SBTi 一律套 4.2%/年**([#40](https://github.com/JLO916/carbonlens/pull/40)):改依範疇/期程分流(近期 S1+2 4.2% / 近期 S3 2.5% / 長期淨零 −90%);−90%/2050 不再被誤判未達。
- **記分卡 SBTi 門票未承諾也給綠勾**([#40](https://github.com/JLO916/carbonlens/pull/40)):改需自評承諾;速率達標但未承諾顯示為 🟡(需補強),不再讓業務對客戶誤稱「我們是 SBTi」。
- **盤查低於原填總數無聲歸零碳費**([#39](https://github.com/JLO916/carbonlens/pull/39)):盤查比原填低 ≥20%(或跌破碳費門檻)亮「漏源檢查」紅旗,點名常見漏源(鍛造、熱處理、含氟氣體)。
- **EN 匯出夾中文**([#40](https://github.com/JLO916/carbonlens/pull/40)):記分卡 `have`/`need` 與問卷值雙語化。

被反方覆核**推翻的 2 條誤報**:「CBAM 抵扣未乘因子」(其實符合 §9 level-playing-field)、「製程係數零引導」(熱處理本質為燃氣、官方無扣件製程係數,硬給反而違反紅線)。

### Changed — 行為變更(升級者須注意)

1. **義務行事曆日期**:CBAM 年度申報 5/31 → **9/30**(Omnibus Reg (EU) 2025/2083);永續報告書 3/31 → **8/31**(§6A-1 普遍義務)。日期改吃資料層單一事實來源([#38](https://github.com/JLO916/carbonlens/pull/38))。
2. **P&L 碳費卡**:不再把台灣 NT$ 與海外 USD 混為一個數字;台灣 NT$ 只配自己的 USD,海外碳價獨立一行([#39](https://github.com/JLO916/carbonlens/pull/39))。
3. **記分卡 SBTi 門票**:未承諾不再顯示 ✅;請在「⑩ 客戶記分卡」自評區填「SBTi 承諾狀態」([#40](https://github.com/JLO916/carbonlens/pull/40))。
4. **結轉下一年**:會自動拍一張年結快照、把週期狀態歸位「盤查中」,再推進年度;快照歷史新增「年度」欄([#40](https://github.com/JLO916/carbonlens/pull/40))。
5. **泰國純用電廠碳稅**:現為 NT$0(原為幻影稅)([#37](https://github.com/JLO916/carbonlens/pull/37))。
6. **語言**:會記住你的選擇(localStorage),並支援 `?lang=en` 分享連結([#40](https://github.com/JLO916/carbonlens/pull/40))。
7. **舊 localStorage 殘留的壞年份值**(如 2000050)現會被安全夾限,不再凍頁([#37](https://github.com/JLO916/carbonlens/pull/37))。

### 後續可選方向

- ETS 轉型情境可再加「逐年免費配額收緊」軌跡(待官方總量公布前仍為假設)。
- 碳資產管理:抵換組合的成本/收益試算(待碳權行情成形)。
- 換新 persona(如半導體 / 化工)再走一輪挑破口。
