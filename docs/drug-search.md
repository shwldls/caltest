# Drug-name search

`lib/data/drug_names.dart` holds a curated search dictionary. It is not a product
inventory or a substitution rule. Matching only filters the selected department's
existing presets; it never merges concentrations, routes, IDs, or dosing data.
The visible preset name and reservoir summary remain authoritative for selection.

Known product names are linked to an ingredient in English and Korean. Matching
requires a complete leading name so that similar names do not inherit each other's
aliases. Exact names rank before prefixes and partial matches. Pressing Enter only
selects when there is exactly one result; a multi-concentration search requires
explicit selection. All results remain accessible in the scrolling list.

The following sources support product/ingredient name associations (checked
2026-10-29; no dosing guidance was imported):

- Precedex / dexmedetomidine: [Pfizer product brochure](https://webinar2cdnstorage.blob.core.windows.net/cdn/ksem2024s/upload/booth/broc_62_1718935226.pdf).
- Norpin / norepinephrine: [Pohang St. Mary's Hospital nursing education, module 5-1](https://pch24.or.kr/wp-content/uploads/2024/06/신입간호사를-위한-중환자-간호-e-Learning-학습자료_Module-5-1.pdf). `norphin` retains the spelling already used in this repository.
- Ultiva / remifentanil: [FDA label](https://www.accessdata.fda.gov/drugsatfda_docs/label/2026/020630s031s033lbl.pdf).
- Diprivan / propofol: [DailyMed manufacturer label](https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=e3105799-a4b6-f3f4-e6e2-b2b29bbdb538).
- Cordarone / amiodarone: [Sanofi injection label](https://www.sanofi.com/assets/countries/india/docs/science-and-innovation/for-healthcare-professionals/product-information/pharmaceuticals/cordarone-injection-api.pdf).
- Labesin / labetalol: [Thai FDA registration for Myungmoon Pharm's injection](https://ndi.fda.moph.go.th/drug_detail/index/?rcno=6300002&rctype=1C&register=MUMgMi82MyhQKQ%3D%3D).
- Novastan / argatroban: [Tanabe product announcement](https://www.tanabe-pharma.com/en/news/storage/20240617103013/pdf/e_MTPC240617.pdf).
- Eglandin / alprostadil: [Tanabe Korea product information](https://kr.tanabe-pharma.com/sub02_02_view.html). PGE1 and lipo-PGE1 preset variants stay separate.
- Dopamix / dopamine: [HK inno.N product-label notice](https://www.inno-n.com/pr/notice/medicine/view/26).
- Herben / diltiazem: [HK inno.N product information](https://www.inno-n.com/business/medicine/view?bpc_cd=P107&no=191).
- Perdipine / nicardipine: [ConnectDI injection information](https://www.connectdi.com/cont/drug/?dl_idx=4939&pap=detail).
- Brevibloc / esmolol: [Jeil product-label change notice](https://www.jeilpharm.co.kr/jeilpharm/product_change_point_view.asp?codes=&idx=266&page=10&skey=&sword=).
- Primacor / milrinone: [Sanofi Korea product information](https://www.sanofi.com/ko/south-korea/product-information/primacor-milrinone).
- Esmeron / rocuronium: [Korea Pharmaceutical Information Center](https://www.health.kr/drug/2016120100047).
- Vecaron / vecuronium: [Sejong Hospital formulary notice](https://hyewon.sejongh.co.kr/notice/9281). This historical name association does not establish current availability.
- Pantoloc / pantoprazole: [Korea Pharmaceutical Information Center](https://www.health.kr/drug/A11ABBBBB2147).

Only the seven selected additional brands above were added. Perlinganit, Vascam,
Byfavo, Solu-Cortef, and Aggrastat were not selected; their existing ingredient
presets remain unchanged.

Other entries supply Korean spellings for existing generic names. Dobutamix is
currently searchable by its existing name and Korean spelling only; its ingredient
link is intentionally not inferred without an identified product source.
This dictionary does not cover every marketed product or hospital nickname.

Additional names can be saved as a comma-separated list under medication settings.
They are stored in each preset's optional `searchAliases` field, copied during ID
repair and persisted in the existing browser storage. Old records without this
field load with an empty list. New catalog entries also work on old saved presets
without resetting users' customized concentrations.
