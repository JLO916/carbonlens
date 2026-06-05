#!/usr/bin/env python3
"""
CBAM 預設值同步管線 — 解析器(Brief §7.1 管線一:預設值低頻同步)。

下載歐盟官方「僅供參考」Excel(定義期預設值)→ 解析 → 輸出結構化 JSON 進「暫存」。
⚠️ 這份 Excel 是「for information purposes only」;法律約束力以 IR (EU) 2025/2621 為準。
輸出值寫入 cbam-staging-values.json,狀態 pending_human_baseline——通過 §7.2 異常檢查
並經人工基線確認前,不得 promote 為 live、不得在工具顯示數字(§7.3)。

依賴:openpyxl。用法:python3 scripts/parse-cbam-defaults.py
"""
import json
import os
import sys
import urllib.request

EXCEL_URL = (
    "https://taxation-customs.ec.europa.eu/document/download/"
    "1c05d211-80cb-4aaa-8ef0-e08005a95d7e_en?filename=DVs%20as%20adopted_v20260204%20.xlsx"
)
# 工具國別下拉 → Excel 分頁名(每國一頁)
COUNTRIES = {
    "tw": "Taiwan", "cn": "China", "in": "India", "kr": "South Korea",
    "jp": "Japan", "vn": "Vietnam", "th": "Thailand", "tr": "Türkiye",
}
GROUP_MAP = {
    "cement": "cement", "fertiliser": "fertilizer", "fertilisers": "fertilizer",
    "iron and steel": "steel", "steel": "steel", "aluminium": "aluminum",
    "aluminum": "aluminum", "hydrogen": "hydrogen", "electricity": "electricity",
}
HERE = os.path.dirname(os.path.abspath(__file__))
XLSX = os.path.join(HERE, "..", ".cache", "cbam_dv.xlsx")
OUT = os.path.join(HERE, "..", "lib", "diagnose", "data", "cbam-staging-values.json")


def num(v):
    if v is None:
        return None
    if isinstance(v, (int, float)):
        return round(float(v), 4)
    s = str(v).strip()
    if s in ("–", "-", "", "see below", "\xa0", "nan"):
        return None
    try:
        return round(float(s), 4)
    except ValueError:
        return None


def main():
    import openpyxl

    os.makedirs(os.path.dirname(XLSX), exist_ok=True)
    if not os.path.exists(XLSX):
        print("downloading official Excel…")
        urllib.request.urlretrieve(EXCEL_URL, XLSX)
    wb = openpyxl.load_workbook(XLSX, read_only=True, data_only=True)

    rows = []
    for code, sheet in COUNTRIES.items():
        ws = wb[sheet]
        group = None
        for r in ws.iter_rows(min_row=3, values_only=True):
            a = str(r[0]).strip() if r[0] is not None else ""
            b = str(r[1]).strip() if len(r) > 1 and r[1] is not None else ""
            gl = a.lower()
            if gl in GROUP_MAP and b == "":
                group = GROUP_MAP[gl]
                continue
            direct = num(r[2] if len(r) > 2 else None)
            if direct is None:
                continue
            rows.append({
                "country": code, "product": group, "cnCode": a, "description": b,
                "direct": direct,
                "indirect": num(r[3] if len(r) > 3 else None),
                "total": num(r[4] if len(r) > 4 else None),
                "m2026": num(r[5] if len(r) > 5 else None),
                "m2027": num(r[6] if len(r) > 6 else None),
                "m2028": num(r[7] if len(r) > 7 else None),
            })

    out = {
        "source": "European Commission CBAM default values (definitive period), 'for information' Excel 'DVs as adopted_v20260204.xlsx', 13 Feb 2026",
        "officialDocVersion": "IR (EU) 2025/2621 Annex (default values)",
        "asOfDate": "2026-02-04",
        "status": "pending_human_baseline",
        "note": "Parsed from the official for-information Excel; NOT shown in the calculator until human baseline confirmation (Brief §7.2/§7.3). Legally binding values are in IR 2025/2621.",
        "countries": list(COUNTRIES.keys()),
        "count": len(rows),
        "values": rows,
    }
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=1)
    print(f"wrote {OUT} — {len(rows)} rows")


if __name__ == "__main__":
    try:
        main()
    except ImportError:
        sys.exit("需要 openpyxl:pip install openpyxl")
