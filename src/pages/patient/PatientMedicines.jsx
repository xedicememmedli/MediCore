import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API = process.env.REACT_APP_API_URL;
const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

// ─── Dərman şəkilləri — Wikimedia Commons (CORS-free, etibarlı) ───
const MEDICINE_IMAGES = {
  // Antibiotiklər
  "Amoksisilin 500mg":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Amoxicillin_500mg_Capsules.jpg/320px-Amoxicillin_500mg_Capsules.jpg",
  "Augmentin 625mg":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Augmentin_625.jpg/320px-Augmentin_625.jpg",
  "Sefuroksim 500mg":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Cefuroxime_500_mg_tablets.jpg/320px-Cefuroxime_500_mg_tablets.jpg",

  // Ağrıkəsicilər
  "İbuprofen 400mg":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/Ibuprofen_200mg_Tablets.jpg/320px-Ibuprofen_200mg_Tablets.jpg",
  "Paracetamol 500mg":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Paracetamol_tablets.jpg/320px-Paracetamol_tablets.jpg",
  "Diclofenac 50mg":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Diclofenac_sodium_50mg.jpg/320px-Diclofenac_sodium_50mg.jpg",

  // Vitaminlər
  "Vitamin D3 1000IU":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Dietary_supplements.jpg/320px-Dietary_supplements.jpg",
  "Vitamin C 1000mg":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Vitamin_C_effervescent_tablets.jpg/320px-Vitamin_C_effervescent_tablets.jpg",
  "Omega 3":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Omega_3_capsules.jpg/320px-Omega_3_capsules.jpg",

  // Kardioloji
  "Metoprolol 50mg":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/Metoprolol_succinate_50mg.jpg/320px-Metoprolol_succinate_50mg.jpg",
  "Bisoprolol 5mg":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Bisoprolol_tablets.jpg/320px-Bisoprolol_tablets.jpg",
  "Amlodipin 10mg":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Amlodipine_10mg.jpg/320px-Amlodipine_10mg.jpg",

  // Mədə-Bağırsaq
  "Omeprazol 20mg":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Omeprazole_20mg_capsules.jpg/320px-Omeprazole_20mg_capsules.jpg",
  "Pantoprazol 40mg":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Pantoprazole_40mg.jpg/320px-Pantoprazole_40mg.jpg",
  "Smecta":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Smecta_sachets.jpg/320px-Smecta_sachets.jpg",

  // Allergiya
  "Cetirizine 10mg":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Cetirizine_10mg_tablet.jpg/320px-Cetirizine_10mg_tablet.jpg",
  "Loratadine 10mg":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Loratadine_10_mg_tablets.jpg/320px-Loratadine_10_mg_tablets.jpg",

  // Burun-Boğaz
  "Nazivin":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Nasal_drops.jpg/320px-Nasal_drops.jpg",
  "Otrivin":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Nasal_spray_bottle.jpg/320px-Nasal_spray_bottle.jpg",
  "Tantum Verde":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/Throat_spray.jpg/320px-Throat_spray.jpg",
};

// Şəkil yüklənməsə fallback — rəngli emoji kartı
const FALLBACK_COLORS = {
  "Antibiotiklər":  { bg:"#FEF0F0", emoji:"🧫" },
  "Ağrıkəsicilər":  { bg:"#EBF5FB", emoji:"💊" },
  "Vitaminlər":     { bg:"#EAFAF1", emoji:"🌿" },
  "Kardioloji":     { bg:"#FDEDEC", emoji:"❤️" },
  "Mədə-Bağırsaq": { bg:"#EAF2F8", emoji:"🫃" },
  "Allergiya":      { bg:"#F5EEF8", emoji:"🌼" },
  "Burun-Boğaz":    { bg:"#EAF2F8", emoji:"👃" },
};

function getMedImage(med) {
  if (med.imageUrl && !med.imageUrl.includes("placehold")) return med.imageUrl;
  return MEDICINE_IMAGES[med.name] || null;
}

const mockMedicines = [
  { id:1,  name:"Amoksisilin 500mg",  description:"Geniş spektrli antibiotik. Bakterial infeksiyaların müalicəsində istifadə olunur.", price:8.5,  stockCount:120, activeIngredient:"Amoxicillin",              isPrescriptionRequired:true,  imageUrl:"", categoryIds:[1], sideEffects:"Ürəkbulanma, ishal, allergik reaksiya, dəri səpgisi. Nadir hallarda anafilaksiya.", substitutes:["Augmentin 625mg","Sefuroksim 500mg"], dosageForm:"Kapsul",         manufacturer:"PharmaMed",   usageInfo:"Gündə 3 dəfə, yeməkdən sonra. Müalicə kursunu tamamlayın.", contraindications:"Penitsilinə allergiya olanlarda qadağandır." },
  { id:2,  name:"İbuprofen 400mg",    description:"Ağrıkəsici və iltihab əleyhinə dərman. Baş ağrısı, diş ağrısı, isti üçün.",       price:4.2,  stockCount:250, activeIngredient:"Ibuprofen",               isPrescriptionRequired:false, imageUrl:"", categoryIds:[2], sideEffects:"Mədə ağrısı, başgicəllənmə, mədə qanaxması (uzun müddətli istifadədə).",        substitutes:["Paracetamol 500mg","Diclofenac 50mg"],  dosageForm:"Tablet",         manufacturer:"WellCare",    usageInfo:"Gündə 3 dəfə, yeməkdən sonra. Maksimum 1200mg/gün.",         contraindications:"Mədə xorası, böyrək çatışmazlığı olanlarda ehtiyatla." },
  { id:3,  name:"Vitamin D3 1000IU",  description:"D vitamini əlavəsi. Sümük sağlamlığı və immun sistem üçün vacibdir.",              price:12,   stockCount:80,  activeIngredient:"Cholecalciferol",         isPrescriptionRequired:false, imageUrl:"", categoryIds:[3], sideEffects:"Nadir hallarda ürəkbulanma, yuxululuq (artıq dozada).",                          substitutes:["Vitamin C 1000mg","Omega 3"],            dosageForm:"Kapsul",         manufacturer:"NutriLife",   usageInfo:"Gündə 1 kapsul, yeməkdən sonra.",                             contraindications:"Hiperkalsiuriya olanlarda ehtiyatla." },
  { id:4,  name:"Metoprolol 50mg",    description:"Beta-blokator. Yüksək təzyiq, ürək ritm pozğunluqları üçün.",                     price:6.8,  stockCount:60,  activeIngredient:"Metoprolol tartrate",     isPrescriptionRequired:true,  imageUrl:"", categoryIds:[4], sideEffects:"Yorğunluq, başgicəllənmə, təzyiq düşməsi, bradikardiya.",                         substitutes:["Bisoprolol 5mg","Amlodipin 10mg"],       dosageForm:"Tablet",         manufacturer:"CardioPlus",  usageInfo:"Gündə 1-2 dəfə, həkim göstərişi ilə.",                        contraindications:"Astma, bradikardiya, AV blok olanlarda qadağandır." },
  { id:5,  name:"Paracetamol 500mg",  description:"Qızdırma və ağrı üçün. Uşaqlar və böyüklər üçün təhlükəsiz.",                     price:3.2,  stockCount:300, activeIngredient:"Paracetamol",             isPrescriptionRequired:false, imageUrl:"", categoryIds:[2], sideEffects:"Nadir allergiya, qaraciyər yükü (artıq dozada).",                                substitutes:["İbuprofen 400mg","Diclofenac 50mg"],     dosageForm:"Tablet",         manufacturer:"WellCare",    usageInfo:"4-6 saatda bir, maksimum 4q/gün.",                            contraindications:"Ağır qaraciyər xəstəliyi olanlarda." },
  { id:6,  name:"Omeprazol 20mg",     description:"Mədə turşuluğuna qarşı. Mədə yanması, refluks üçün.",                             price:9.5,  stockCount:150, activeIngredient:"Omeprazole",              isPrescriptionRequired:true,  imageUrl:"", categoryIds:[5], sideEffects:"Baş ağrısı, qarında köp, ishal, qəbizlik.",                                       substitutes:["Pantoprazol 40mg","Smecta"],             dosageForm:"Kapsul",         manufacturer:"GastroMed",   usageInfo:"Yeməkdən 30 dəqiqə əvvəl, gündə 1 dəfə.",                     contraindications:"Uzun müddətli istifadədə maqnezium çatışmazlığı." },
  { id:7,  name:"Augmentin 625mg",    description:"Güclü antibiotik. Respirator, urinar infeksiyalar üçün.",                          price:11.2, stockCount:70,  activeIngredient:"Amoxicillin + Clavulanic", isPrescriptionRequired:true, imageUrl:"", categoryIds:[1], sideEffects:"Mədə narahatlığı, ishal, qaraçiyər fermentlərinin artması.",                   substitutes:["Amoksisilin 500mg","Sefuroksim 500mg"], dosageForm:"Tablet",         manufacturer:"PharmaMed",   usageInfo:"Gündə 2 dəfə, 12 saatda bir, yeməklə.",                       contraindications:"Penitsilinə allergiya, sarılıq tarixi olanlarda." },
  { id:8,  name:"Sefuroksim 500mg",   description:"2-ci nəsil sefalosporin. Ciddi bakterial infeksiyalar üçün.",                     price:14,   stockCount:65,  activeIngredient:"Cefuroxime",              isPrescriptionRequired:true,  imageUrl:"", categoryIds:[1], sideEffects:"Baş ağrısı, dəri səpgisi, mədə-bağırsaq pozğunluğu.",                          substitutes:["Amoksisilin 500mg","Augmentin 625mg"],  dosageForm:"Tablet",         manufacturer:"AntiBio",     usageInfo:"Gündə 2 dəfə, yeməkdən sonra.",                               contraindications:"Sefalosporinlərə allergiya olanlarda." },
  { id:9,  name:"Diclofenac 50mg",    description:"Güclü ağrıkəsici. Oynaq, əzələ ağrıları üçün.",                                  price:5.6,  stockCount:90,  activeIngredient:"Diclofenac sodium",       isPrescriptionRequired:false, imageUrl:"", categoryIds:[2], sideEffects:"Mədə yanması, ürəkbulanma, mədə qanaxması riski.",                              substitutes:["İbuprofen 400mg","Paracetamol 500mg"],  dosageForm:"Tablet",         manufacturer:"WellCare",    usageInfo:"Gündə 2-3 dəfə, yeməkdən sonra.",                             contraindications:"Mədə xorası, ürək çatışmazlığı olanlarda." },
  { id:10, name:"Vitamin C 1000mg",   description:"İmmunitet dəstəyi. Soyuqdəymə, infeksiya profilaktikası üçün.",                  price:7,    stockCount:210, activeIngredient:"Ascorbic acid",           isPrescriptionRequired:false, imageUrl:"", categoryIds:[3], sideEffects:"Mədə narahatlığı, turşuluq, böyrək daşı riski (çox dozada).",                  substitutes:["Vitamin D3 1000IU","Omega 3"],           dosageForm:"Şipşak tablet",  manufacturer:"NutriLife",   usageInfo:"Gündə 1 tablet, suda həll edərək.",                            contraindications:"Böyrək daşı tarixi olanlarda ehtiyatla." },
  { id:11, name:"Omega 3",            description:"Ürək və beyin dəstəyi. Triqliserid səviyyəsini normallaşdırır.",                  price:18,   stockCount:95,  activeIngredient:"Fish Oil (EPA+DHA)",      isPrescriptionRequired:false, imageUrl:"", categoryIds:[3,4], sideEffects:"Balıq qoxusu, yüngül mədə narahatlığı.",                                    substitutes:["Vitamin D3 1000IU","Vitamin C 1000mg"], dosageForm:"Softgel",        manufacturer:"NutriLife",   usageInfo:"Gündə 1-2 kapsul, yeməkdən sonra.",                           contraindications:"Balıq alleriyası olanlarda." },
  { id:12, name:"Bisoprolol 5mg",     description:"Seçici beta-blokator. Xronik ürək çatışmazlığı, hipertenziya üçün.",             price:8.9,  stockCount:55,  activeIngredient:"Bisoprolol fumarate",     isPrescriptionRequired:true,  imageUrl:"", categoryIds:[4], sideEffects:"Yorğunluq, nəbzin zəifləməsi, soyuq əl-ayaqlar.",                               substitutes:["Metoprolol 50mg","Amlodipin 10mg"],      dosageForm:"Tablet",         manufacturer:"CardioPlus",  usageInfo:"Gündə 1 dəfə, səhər.",                                        contraindications:"Astma, 2-3-cü dərəcə AV blok." },
  { id:13, name:"Amlodipin 10mg",     description:"Kalsium kanal blokoru. Yüksək arterial təzyiq üçün.",                            price:7.9,  stockCount:100, activeIngredient:"Amlodipine besylate",     isPrescriptionRequired:true,  imageUrl:"", categoryIds:[4], sideEffects:"Ayaqlarda şişkinlik, baş ağrısı, üz qızarması.",                                 substitutes:["Metoprolol 50mg","Bisoprolol 5mg"],      dosageForm:"Tablet",         manufacturer:"CardioPlus",  usageInfo:"Gündə 1 dəfə, istənilən vaxt.",                               contraindications:"Ağır aorta stenozu olanlarda." },
  { id:14, name:"Pantoprazol 40mg",   description:"Proton pompa inhibitoru. Mədə xorası, refluks esofaqiti üçün.",                  price:7.8,  stockCount:95,  activeIngredient:"Pantoprazole",            isPrescriptionRequired:false, imageUrl:"", categoryIds:[5], sideEffects:"Başgicəllənmə, qarın ağrısı, baş ağrısı.",                                       substitutes:["Omeprazol 20mg","Smecta"],               dosageForm:"Tablet",         manufacturer:"GastroMed",   usageInfo:"Yeməkdən 30-60 dəq əvvəl, gündə 1 dəfə.",                     contraindications:"Uzun müddətli istifadədə osteoporoz riski." },
  { id:15, name:"Smecta",             description:"Natural mənşəli. İshal, mədə-bağırsaq narahatlığı üçün.",                        price:5.9,  stockCount:125, activeIngredient:"Diosmectite",             isPrescriptionRequired:false, imageUrl:"", categoryIds:[5], sideEffects:"Qəbizlik (artıq dozada).",                                                       substitutes:["Omeprazol 20mg","Pantoprazol 40mg"],     dosageForm:"Paket toz",      manufacturer:"GastroMed",   usageInfo:"Gündə 3 paket, suda həll edərək.",                             contraindications:"Xronik qəbizlik olanlarda ehtiyatla." },
  { id:16, name:"Cetirizine 10mg",    description:"2-ci nəsil antihistamin. Mövsümi allergiya, ürtikər üçün.",                      price:4.8,  stockCount:132, activeIngredient:"Cetirizine HCl",         isPrescriptionRequired:false, imageUrl:"", categoryIds:[6], sideEffects:"Yuxululuq, ağız quruluğu, baş ağrısı.",                                          substitutes:["Loratadine 10mg"],                       dosageForm:"Tablet",         manufacturer:"AllerFree",   usageInfo:"Gündə 1 tablet, axşam.",                                      contraindications:"Ağır böyrək xəstəliyi olanlarda." },
  { id:17, name:"Loratadine 10mg",    description:"Yuxusuzkəsən antihistamin. Günlük istifadə üçün uyğun.",                         price:5.1,  stockCount:114, activeIngredient:"Loratadine",              isPrescriptionRequired:false, imageUrl:"", categoryIds:[6], sideEffects:"Baş ağrısı, ağız quruluğu (nadir).",                                             substitutes:["Cetirizine 10mg"],                       dosageForm:"Tablet",         manufacturer:"AllerFree",   usageInfo:"Gündə 1 tablet, istənilən vaxt.",                             contraindications:"Qaraciyər çatışmazlığında doz azaldılmalı." },
  { id:18, name:"Nazivin",            description:"Burun tutulmasına qarşı damcı. Tez effekt.",                                     price:6.7,  stockCount:118, activeIngredient:"Oxymetazoline 0.05%",    isPrescriptionRequired:false, imageUrl:"", categoryIds:[7], sideEffects:"Burun quruluğu, qıcıqlanma, uzun müddətli istifadədə asılılıq.",               substitutes:["Otrivin"],                               dosageForm:"Damcı",          manufacturer:"ENTCare",     usageInfo:"Günə 2-3 dəfə, 3 gündən çox istifadə etməyin.",               contraindications:"Qapalı bucaq glokoması, xronik rinit." },
  { id:19, name:"Otrivin",            description:"Burun tutulması üçün sprey. Yumuşaq formula.",                                   price:7.5,  stockCount:97,  activeIngredient:"Xylometazoline 0.1%",    isPrescriptionRequired:false, imageUrl:"", categoryIds:[7], sideEffects:"Burunda yanma, quruluq.",                                                        substitutes:["Nazivin"],                               dosageForm:"Sprey",          manufacturer:"ENTCare",     usageInfo:"Günə 2-3 dəfə, 5 gündən çox istifadə etməyin.",               contraindications:"Hipertiroidizm olanlarda ehtiyatla." },
  { id:20, name:"Tantum Verde",       description:"Boğaz ağrısı üçün antiseptik sprey. Iltihab əleyhinə.",                          price:11.3, stockCount:69,  activeIngredient:"Benzydamine HCl",        isPrescriptionRequired:false, imageUrl:"", categoryIds:[7], sideEffects:"Ağızda keyimə, qıcıqlanma (keçici).",                                            substitutes:["Otrivin","Nazivin"],                     dosageForm:"Sprey",          manufacturer:"ENTCare",     usageInfo:"Hər 1.5-3 saatda bir, 4-8 püskürtmə.",                        contraindications:"12 yaşdan kiçiklərdə ehtiyatla." },
];

const mockCategories = [
  { id:1, name:"Antibiotiklər" },
  { id:2, name:"Ağrıkəsicilər" },
  { id:3, name:"Vitaminlər" },
  { id:4, name:"Kardioloji" },
  { id:5, name:"Mədə-Bağırsaq" },
  { id:6, name:"Allergiya" },
  { id:7, name:"Burun-Boğaz" },
];

const CAT_ICONS = {
  "Antibiotiklər":"🧫","Ağrıkəsicilər":"💊","Vitaminlər":"🌿","Kardioloji":"❤️",
  "Mədə-Bağırsaq":"🫃","Allergiya":"🌼","Burun-Boğaz":"👃",
};

const styles = `
  .pg-header { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:22px; gap:16px; }
  .pg-header h1 { font-size:21px; font-weight:800; color:#154360; margin-bottom:3px; }
  .pg-header p { font-size:13px; color:#5D8AA8; }
  .count-badge { display:inline-flex; align-items:center; background:#EAF2F8; border:1px solid #AED6F1; color:#1A5276; font-size:12px; font-weight:700; padding:2px 10px; border-radius:20px; margin-left:10px; }

  /* KATEQORİYA STORİ */
  .cat-stories { display:flex; gap:12px; margin-bottom:22px; overflow-x:auto; padding-bottom:4px; }
  .cat-stories::-webkit-scrollbar { height:0; }
  .cat-story { display:flex; flex-direction:column; align-items:center; gap:6px; cursor:pointer; flex-shrink:0; }
  .cat-story-ring { width:56px; height:56px; border-radius:50%; padding:2.5px; background:#D6EAF8; transition:all 0.2s; }
  .cat-story-ring.active { background:linear-gradient(135deg,#1A5276,#1F618D); }
  .cat-story-inner { width:100%; height:100%; border-radius:50%; background:#EBF5FB; display:flex; align-items:center; justify-content:center; font-size:22px; border:2px solid #fff; }
  .cat-story-label { font-size:10px; font-weight:700; color:#5D8AA8; text-align:center; max-width:64px; line-height:1.3; }
  .cat-story.active .cat-story-label { color:#1A5276; }

  /* AXTARIŞ */
  .toolbar { display:flex; align-items:center; gap:12px; margin-bottom:18px; flex-wrap:wrap; }
  .search-bar { display:flex; align-items:center; gap:8px; background:#fff; border:1.5px solid #D6EAF8; border-radius:9px; padding:9px 14px; flex:1; max-width:320px; transition:all 0.2s; }
  .search-bar:focus-within { border-color:#1A5276; box-shadow:0 0 0 3px rgba(31,97,141,0.08); }
  .search-bar input { border:none; background:none; outline:none; font-size:13px; color:#1A252F; width:100%; font-family:'Plus Jakarta Sans',sans-serif; }
  .search-bar input::placeholder { color:#B0C4D8; }
  .filter-select { padding:9px 14px; border:1.5px solid #D6EAF8; border-radius:9px; background:#fff; font-size:13px; color:#1A252F; font-family:'Plus Jakarta Sans',sans-serif; outline:none; cursor:pointer; }

  /* KART */
  .med-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(255px,1fr)); gap:16px; }
  .med-card { background:#fff; border-radius:16px; border:1.5px solid #D6EAF8; overflow:hidden; transition:all 0.22s; position:relative; }
  .med-card:hover { border-color:#AED6F1; transform:translateY(-3px); box-shadow:0 12px 32px rgba(31,97,141,0.12); }

  /* ŞƏKİL BÖLÜMÜ */
  .med-card-img { height:140px; display:flex; align-items:center; justify-content:center; position:relative; overflow:hidden; }
  .med-card-img img { width:110px; height:110px; object-fit:contain; display:block; transition:transform 0.3s; filter:drop-shadow(0 4px 12px rgba(0,0,0,0.12)); }
  .med-card:hover .med-card-img img { transform:scale(1.07); }
  .med-img-fallback { width:72px; height:72px; border-radius:18px; display:flex; align-items:center; justify-content:center; font-size:36px; }

  .rx-flag { position:absolute; top:10px; right:10px; display:flex; align-items:center; gap:4px; padding:4px 9px; border-radius:20px; font-size:10px; font-weight:800; }
  .rx-required { background:rgba(231,76,60,0.15); color:#C0392B; border:1px solid rgba(231,76,60,0.3); }
  .stock-flag { position:absolute; top:10px; left:10px; padding:3px 8px; border-radius:20px; font-size:9px; font-weight:800; }
  .stock-flag.out { background:rgba(231,76,60,0.15); color:#C0392B; }
  .stock-flag.low { background:rgba(212,172,13,0.15); color:#B7950B; }

  .med-card-body { padding:14px 16px; }
  .med-name { font-size:14px; font-weight:800; color:#154360; margin-bottom:3px; line-height:1.3; }
  .med-ingredient { font-size:11px; color:#8DAFC4; margin-bottom:6px; }
  .med-desc { font-size:12px; color:#5D8AA8; line-height:1.5; margin-bottom:10px; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; min-height:36px; }
  .med-meta { display:flex; flex-wrap:wrap; gap:6px; margin-bottom:12px; }
  .med-chip { display:inline-flex; align-items:center; padding:4px 8px; border-radius:20px; background:#F4FBFF; border:1px solid #D6EAF8; color:#5D8AA8; font-size:10px; font-weight:700; }

  .med-footer { display:flex; align-items:center; justify-content:space-between; gap:10px; }
  .med-price { font-size:18px; font-weight:800; color:#1A5276; }
  .med-price span { font-size:11px; font-weight:600; color:#8DAFC4; }
  .med-actions { display:flex; align-items:center; gap:6px; }

  .btn-detail { padding:7px 10px; background:#F8FCFF; color:#1F618D; border:1.5px solid #D6EAF8; border-radius:9px; font-size:11px; font-weight:700; font-family:'Plus Jakarta Sans',sans-serif; cursor:pointer; transition:all 0.18s; white-space:nowrap; }
  .btn-detail:hover { background:#EBF5FB; border-color:#AED6F1; }
  .btn-add-cart { display:flex; align-items:center; gap:5px; padding:7px 12px; background:linear-gradient(135deg,#1A5276,#1F618D); color:#fff; border:none; border-radius:9px; font-size:12px; font-weight:700; font-family:'Plus Jakarta Sans',sans-serif; cursor:pointer; transition:all 0.2s; }
  .btn-add-cart:hover:not(:disabled) { background:linear-gradient(135deg,#154360,#1A5276); transform:translateY(-1px); }
  .btn-add-cart:disabled { background:#D6EAF8; color:#8DAFC4; cursor:not-allowed; }
  .qty-ctrl { display:flex; align-items:center; gap:5px; }
  .qty-btn { width:28px; height:28px; border-radius:7px; border:1.5px solid #AED6F1; background:#EAF2F8; color:#1A5276; font-size:16px; font-weight:700; cursor:pointer; display:flex; align-items:center; justify-content:center; font-family:'Plus Jakarta Sans',sans-serif; }
  .qty-btn:hover { background:#D6EAF8; }
  .qty-num { font-size:14px; font-weight:800; color:#154360; min-width:20px; text-align:center; }

  /* UÇ ANİMASİYASI */
  .flying-pill { position:fixed; width:36px; height:36px; border-radius:50%; background:linear-gradient(135deg,#1A5276,#1F618D); display:flex; align-items:center; justify-content:center; font-size:18px; z-index:9999; pointer-events:none; transition:all 0.6s cubic-bezier(0.25,0.46,0.45,0.94); box-shadow:0 4px 12px rgba(31,97,141,0.4); }
  .toast { position:fixed; bottom:24px; left:50%; transform:translateX(-50%) translateY(80px); background:#154360; color:#fff; padding:12px 20px; border-radius:12px; font-size:13px; font-weight:700; z-index:9998; transition:transform 0.3s ease; box-shadow:0 8px 24px rgba(21,67,96,0.3); display:flex; align-items:center; gap:8px; white-space:nowrap; }
  .toast.show { transform:translateX(-50%) translateY(0); }

  /* ƏTRAFLŞ MODAL */
  .overlay { position:fixed; inset:0; background:rgba(21,67,96,0.5); backdrop-filter:blur(4px); display:flex; align-items:center; justify-content:center; z-index:999; padding:20px; animation:fadeIn 0.18s ease; }
  @keyframes fadeIn { from{opacity:0} to{opacity:1} }
  .detail-modal { background:#fff; border-radius:22px; width:100%; max-width:560px; max-height:90vh; overflow-y:auto; box-shadow:0 24px 64px rgba(21,67,96,0.2); animation:slideUp 0.22s ease; }
  .detail-modal::-webkit-scrollbar { width:4px; }
  .detail-modal::-webkit-scrollbar-thumb { background:#D6EAF8; border-radius:4px; }
  @keyframes slideUp { from{transform:translateY(16px);opacity:0} to{transform:translateY(0);opacity:1} }

  /* MODAL ŞƏKİL BAŞLIĞI */
  .dm-hero { position:relative; height:200px; display:flex; align-items:center; justify-content:center; overflow:hidden; border-radius:22px 22px 0 0; }
  .dm-hero img { width:140px; height:140px; object-fit:contain; filter:drop-shadow(0 8px 24px rgba(0,0,0,0.15)); z-index:1; position:relative; }
  .dm-hero-bg { position:absolute; inset:0; opacity:0.15; }
  .dm-close { position:absolute; top:14px; right:14px; width:32px; height:32px; border-radius:50%; background:rgba(255,255,255,0.9); border:none; cursor:pointer; font-size:14px; display:flex; align-items:center; justify-content:center; z-index:2; box-shadow:0 2px 8px rgba(0,0,0,0.1); }
  .dm-rx-tag { position:absolute; top:14px; left:14px; padding:5px 11px; border-radius:20px; font-size:11px; font-weight:800; z-index:2; background:rgba(231,76,60,0.9); color:#fff; }

  .dm-body { padding:22px 26px 28px; }
  .dm-name { font-size:20px; font-weight:800; color:#154360; margin-bottom:4px; }
  .dm-ingredient { font-size:13px; color:#8DAFC4; margin-bottom:16px; }
  .dm-price-row { display:flex; align-items:center; justify-content:space-between; margin-bottom:20px; }
  .dm-price { font-size:26px; font-weight:800; color:#1A5276; }
  .dm-stock { font-size:12px; font-weight:700; padding:4px 12px; border-radius:20px; }
  .dm-stock.ok  { background:#EAF2F8; color:#1A5276; border:1px solid #AED6F1; }
  .dm-stock.low { background:#EAF2F8; color:#D4AC0D; border:1px solid #F9E79F; }
  .dm-stock.out { background:#FDEDEC; color:#E74C3C; border:1px solid #FADBD8; }

  /* BÖLÜM BAŞLIQLARI */
  .dm-section { margin-bottom:18px; }
  .dm-section-title { font-size:12px; font-weight:800; color:#5D8AA8; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:8px; display:flex; align-items:center; gap:6px; }
  .dm-section-title::after { content:''; flex:1; height:1px; background:#EBF5FB; }
  .dm-text { font-size:13px; color:#1A252F; line-height:1.7; }

  /* YAN TƏSİRLƏR */
  .side-effects-list { display:flex; flex-wrap:wrap; gap:7px; }
  .se-chip { padding:5px 11px; background:#EAF2F8; border:1px solid #F9E79F; border-radius:20px; font-size:11px; font-weight:700; color:#7D6608; }

  /* ƏVƏZEDİCİLƏR */
  .substitutes-list { display:flex; flex-wrap:wrap; gap:8px; }
  .sub-card { padding:8px 14px; background:#EBF5FB; border:1.5px solid #D6EAF8; border-radius:10px; font-size:12px; font-weight:700; color:#1F618D; cursor:pointer; transition:all 0.18s; display:flex; align-items:center; gap:6px; }
  .sub-card:hover { background:#D6EAF8; border-color:#AED6F1; transform:translateY(-1px); }

  /* QADAĞA */
  .contra-box { background:#FDEDEC; border:1.5px solid #FADBD8; border-radius:10px; padding:11px 14px; font-size:12px; color:#922B21; line-height:1.6; display:flex; gap:8px; }

  /* İSTİFADƏ */
  .usage-box { background:#EAF2F8; border:1.5px solid #AED6F1; border-radius:10px; padding:11px 14px; font-size:12px; color:#1E8449; line-height:1.6; display:flex; gap:8px; }

  /* MODAL ALT DÜYMƏLƏRİ */
  .dm-footer { padding:16px 26px; border-top:1px solid #EBF5FB; display:flex; gap:10px; }
  .dm-btn-main { flex:1; padding:13px; background:linear-gradient(135deg,#1A5276,#1F618D); color:#fff; border:none; border-radius:10px; font-size:14px; font-weight:800; font-family:'Plus Jakarta Sans',sans-serif; cursor:pointer; transition:all 0.2s; display:flex; align-items:center; justify-content:center; gap:8px; }
  .dm-btn-main:hover { background:linear-gradient(135deg,#154360,#1A5276); }
  .dm-btn-main:disabled { background:#D6EAF8; color:#8DAFC4; cursor:not-allowed; }

  /* RESEPT XƏBƏRDARLIQ */
  .rx-warn-modal { background:#fff; border-radius:18px; padding:30px 28px; width:100%; max-width:400px; text-align:center; box-shadow:0 24px 64px rgba(21,67,96,0.2); animation:slideUp 0.22s ease; }
  .rx-warn-icon { font-size:48px; margin-bottom:14px; }
  .rx-warn-title { font-size:17px; font-weight:800; color:#154360; margin-bottom:8px; }
  .rx-warn-text  { font-size:13px; color:#5D8AA8; margin-bottom:20px; line-height:1.6; }
  .rx-warn-btns  { display:flex; gap:10px; justify-content:center; }

  .empty-state { text-align:center; padding:60px; background:#fff; border-radius:14px; border:1.5px dashed #D6EAF8; }
  .empty-state .ei { font-size:48px; margin-bottom:12px; }
  .empty-state h3 { font-size:16px; font-weight:700; color:#154360; margin-bottom:6px; }
  .empty-state p { font-size:13px; color:#5D8AA8; }

  .btn-ghost { padding:10px 18px; background:#EBF5FB; border:1.5px solid #D6EAF8; border-radius:9px; color:#1F618D; font-size:13px; font-weight:700; font-family:'Plus Jakarta Sans',sans-serif; cursor:pointer; }
  .btn-ghost:hover { background:#D6EAF8; }
  .btn-danger { padding:10px 18px; background:linear-gradient(135deg,#E74C3C,#C0392B); color:#fff; border:none; border-radius:9px; font-size:13px; font-weight:700; font-family:'Plus Jakarta Sans',sans-serif; cursor:pointer; }
`;

function MedImage({ med, size = 110, fallbackCats = [] }) {
  const [error, setError] = useState(false);
  const imgSrc = getMedImage(med);
  const catName = fallbackCats.find(c => med.categoryIds?.includes(c.id))?.name || "";
  const fb = FALLBACK_COLORS[catName] || { bg:"#EBF5FB", emoji:"💊" };

  if (!imgSrc || error) {
    return (
      <div style={{
        width: size, height: size,
        borderRadius: size > 80 ? 20 : 14,
        background: `linear-gradient(135deg, ${fb.bg}, white)`,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: 4,
      }}>
        <span style={{ fontSize: size * 0.38 }}>{fb.emoji}</span>
        <span style={{ fontSize: size * 0.09, fontWeight: 800, color: "#8DAFC4", textAlign: "center", maxWidth: size * 0.9, lineHeight: 1.2 }}>
          {med.name?.split(" ")[0]}
        </span>
      </div>
    );
  }
  return (
    <img src={imgSrc} alt={med.name} width={size} height={size}
      onError={() => setError(true)}
      style={{ objectFit:"contain", borderRadius: 8 }} />
  );
}

function SkeletonGrid() {
  return (
    <div className="med-grid">
      {[...Array(8)].map((_,i) => (
        <div key={i} style={{background:"#fff",borderRadius:16,border:"1.5px solid #D6EAF8",overflow:"hidden"}}>
          <div style={{height:140,background:"#EBF5FB"}}/>
          <div style={{padding:16}}>
            <div style={{height:14,background:"#EBF5FB",borderRadius:8,marginBottom:10}}/>
            <div style={{height:12,width:"70%",background:"#EBF5FB",borderRadius:8,marginBottom:10}}/>
            <div style={{height:12,width:"90%",background:"#EBF5FB",borderRadius:8}}/>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function PatientMedicines() {
  const navigate = useNavigate();
  const [medicines,  setMedicines]  = useState([]);
  const [categories, setCategories] = useState([]);
  const [filtered,   setFiltered]   = useState([]);
  const [search,     setSearch]     = useState("");
  const [activeCat,  setActiveCat]  = useState("");
  const [filterRx,   setFilterRx]   = useState("");
  const [loading,    setLoading]    = useState(true);
  const [cartItems,  setCartItems]  = useState({});
  const [adding,     setAdding]     = useState({});
  const [toast,      setToast]      = useState({ show:false, text:"" });
  const [flyingPill, setFlyingPill] = useState(null);
  const [rxWarning,  setRxWarning]  = useState(null);
  const [detailMed,  setDetailMed]  = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [medRes, catRes] = await Promise.all([
          axios.get(`${API}/api/Medicine`, { headers: authHeader() }),
          axios.get(`${API}/api/Category`, { headers: authHeader() }),
        ]);
        const meds = Array.isArray(medRes.data) ? medRes.data : medRes.data?.data || [];
        const cats = Array.isArray(catRes.data) ? catRes.data : catRes.data?.data || [];
        setMedicines(meds.length ? meds : mockMedicines);
        setCategories(cats.length ? cats : mockCategories);
      } catch {
        setMedicines(mockMedicines);
        setCategories(mockCategories);
      } finally { setLoading(false); }
    };
    fetchAll();
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(medicines.filter(m => {
      const matchQ = m.name?.toLowerCase().includes(q) ||
        m.activeIngredient?.toLowerCase().includes(q) ||
        m.description?.toLowerCase().includes(q);
      const matchCat = activeCat ? m.categoryIds?.includes(Number(activeCat)) : true;
      const matchRx  = filterRx === "" ? true : filterRx === "1" ? m.isPrescriptionRequired : !m.isPrescriptionRequired;
      return matchQ && matchCat && matchRx;
    }));
  }, [search, activeCat, filterRx, medicines]);

  const showToast = (text) => {
    setToast({ show:true, text });
    setTimeout(() => setToast({ show:false, text:"" }), 2500);
  };

  const triggerFly = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setFlyingPill({ x:rect.left + rect.width/2 - 18, y:rect.top - 18 });
    setTimeout(() => setFlyingPill({ x:window.innerWidth-70, y:28, shrink:true }), 50);
    setTimeout(() => setFlyingPill(null), 700);
  };

  const handleAddToCart = (med, e) => {
    if (med.isPrescriptionRequired && !cartItems[med.id]) { setRxWarning(med); return; }
    doAdd(med, e);
  };

  const doAdd = async (med, e) => {
    setRxWarning(null);
    if (e) triggerFly(e);
    setAdding(a => ({ ...a, [med.id]:true }));
    try {
      await axios.post(`${API}/api/BasketItem`, { medicineId:med.id, count:1 },
        { headers: { ...authHeader(), "Content-Type":"application/json" } });
    } catch {}
    setCartItems(c => ({ ...c, [med.id]:(c[med.id]||0)+1 }));
    showToast(`✅ ${med.name} səbətə əlavə edildi`);
    setAdding(a => ({ ...a, [med.id]:false }));
  };

  const changeQty = async (med, delta, e) => {
    const newQty = (cartItems[med.id]||0) + delta;
    if (delta > 0 && e) triggerFly(e);
    if (newQty <= 0) {
      setCartItems(c => { const n={...c}; delete n[med.id]; return n; });
      try { await axios.delete(`${API}/api/BasketItem/remove/${med.id}`, { headers:authHeader() }); } catch {}
      return;
    }
    setCartItems(c => ({ ...c, [med.id]:newQty }));
    try {
      await axios.put(`${API}/api/BasketItem/update`, { medicineId:med.id, count:newQty },
        { headers: { ...authHeader(), "Content-Type":"application/json" } });
    } catch {}
  };

  const totalInCart = Object.values(cartItems).reduce((a,b) => a+b, 0);

  // Əvəzedicini tap və karta keç
  const goToSubstitute = (name) => {
    setDetailMed(null);
    const found = medicines.find(m => m.name === name);
    if (found) setTimeout(() => setDetailMed(found), 200);
  };

  return (
    <>
      <style>{styles}</style>

      {flyingPill && (
        <div className="flying-pill" style={{
          left:flyingPill.x, top:flyingPill.y,
          transform:flyingPill.shrink?"scale(0.2)":"scale(1)",
          opacity:flyingPill.shrink?0:1,
        }}>💊</div>
      )}

      <div className={`toast ${toast.show?"show":""}`}>{toast.text}</div>

      {/* ── HEADER ── */}
      <div className="pg-header">
        <div>
          <h1>Dərmanlar <span className="count-badge">{filtered.length}</span></h1>
          <p>Onlayn aptekdən dərman sifariş edin</p>
        </div>
        {totalInCart > 0 && (
          <div style={{display:"flex",alignItems:"center",gap:8,background:"#EAF2F8",border:"1.5px solid #AED6F1",borderRadius:10,padding:"8px 16px",cursor:"pointer"}}
            onClick={()=>navigate("/patient/basket")}>
            <span style={{fontSize:20}}>🛒</span>
            <span style={{fontWeight:800,color:"#1A5276",fontSize:14}}>{totalInCart} məhsul</span>
          </div>
        )}
      </div>

      {/* ── KATEQORİYALAR ── */}
      <div className="cat-stories">
        <div className={`cat-story ${activeCat===""?"active":""}`} onClick={()=>setActiveCat("")}>
          <div className={`cat-story-ring ${activeCat===""?"active":""}`}><div className="cat-story-inner">🏥</div></div>
          <span className="cat-story-label">Hamısı</span>
        </div>
        {categories.map(c => (
          <div key={c.id} className={`cat-story ${activeCat===String(c.id)?"active":""}`}
            onClick={()=>setActiveCat(activeCat===String(c.id)?"":String(c.id))}>
            <div className={`cat-story-ring ${activeCat===String(c.id)?"active":""}`}>
              <div className="cat-story-inner">{CAT_ICONS[c.name]||"💊"}</div>
            </div>
            <span className="cat-story-label">{c.name}</span>
          </div>
        ))}
      </div>

      {/* ── AXTARIŞ + FİLTR ── */}
      <div className="toolbar">
        <div className="search-bar">
          <span style={{color:"#B0C4D8",fontSize:14}}>🔍</span>
          <input placeholder="Dərman, aktiv maddə axtar..." value={search} onChange={e=>setSearch(e.target.value)} />
        </div>
        <select className="filter-select" value={filterRx} onChange={e=>setFilterRx(e.target.value)}>
          <option value="">Bütün dərmanlar</option>
          <option value="0">Reseptsiz</option>
          <option value="1">Reseptli</option>
        </select>
      </div>

      {/* ── KART SİYAHISI ── */}
      {loading ? <SkeletonGrid /> : filtered.length === 0 ? (
        <div className="empty-state"><div className="ei">💊</div><h3>Dərman tapılmadı</h3><p>Axtarış şərtlərini dəyişin</p></div>
      ) : (
        <div className="med-grid">
          {filtered.map(med => {
            const inCart       = cartItems[med.id] || 0;
            const isOut        = med.stockCount <= 0;
            const isLow        = med.stockCount > 0 && med.stockCount < 10;
            const catBg        = FALLBACK_COLORS[categories.find(c=>med.categoryIds?.includes(c.id))?.name]?.bg || "#EBF5FB";

            return (
              <div className="med-card" key={med.id}>
                <div className="med-card-img" style={{background:`linear-gradient(135deg,${catBg},#fff)`}}>
                  <MedImage med={med} size={110} fallbackCats={categories}/>
                  {med.isPrescriptionRequired && <div className="rx-flag rx-required">📋 Reseptli</div>}
                  {isOut  && <div className="stock-flag out">Tükənib</div>}
                  {isLow && !isOut && <div className="stock-flag low">Az qalıb</div>}
                </div>
                <div className="med-card-body">
                  <div className="med-name">{med.name}</div>
                  {med.activeIngredient && <div className="med-ingredient">{med.activeIngredient}</div>}
                  {med.description && <div className="med-desc">{med.description}</div>}
                  <div className="med-meta">
                    {med.dosageForm   && <span className="med-chip">💊 {med.dosageForm}</span>}
                    {med.manufacturer && <span className="med-chip">🏭 {med.manufacturer}</span>}
                  </div>
                  <div className="med-footer">
                    <div className="med-price">{med.price} ₼<span> / ədəd</span></div>
                    <div className="med-actions">
                      <button className="btn-detail" onClick={()=>setDetailMed(med)}>📋 Ətraflı</button>
                      {inCart > 0 ? (
                        <div className="qty-ctrl">
                          <button className="qty-btn" onClick={()=>changeQty(med,-1)}>−</button>
                          <span className="qty-num">{inCart}</span>
                          <button className="qty-btn" onClick={e=>changeQty(med,1,e)}>+</button>
                        </div>
                      ) : (
                        <button className="btn-add-cart" disabled={isOut||adding[med.id]}
                          onClick={e=>handleAddToCart(med,e)}>
                          {isOut?"Tükənib":adding[med.id]?"⏳":"🛒"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ──────── ƏTRAFLŞ MODAL ──────── */}
      {detailMed && (
        <div className="overlay" onClick={e=>e.target===e.currentTarget&&setDetailMed(null)}>
          <div className="detail-modal">
            {/* HERO ŞƏKİL */}
            <div className="dm-hero" style={{
              background:`linear-gradient(135deg,${FALLBACK_COLORS[categories.find(c=>detailMed.categoryIds?.includes(c.id))?.name]?.bg||"#EBF5FB"},#fff)`
            }}>
              <MedImage med={detailMed} size={140} fallbackCats={categories}/>
              <button className="dm-close" onClick={()=>setDetailMed(null)}>✕</button>
              {detailMed.isPrescriptionRequired && <div className="dm-rx-tag">📋 Reseptli</div>}
            </div>

            <div className="dm-body">
              <div className="dm-name">{detailMed.name}</div>
              {detailMed.activeIngredient && <div className="dm-ingredient">Aktiv maddə: {detailMed.activeIngredient}</div>}

              <div className="dm-price-row">
                <div className="dm-price">{detailMed.price} ₼</div>
                <span className={`dm-stock ${detailMed.stockCount<=0?"out":detailMed.stockCount<10?"low":"ok"}`}>
                  {detailMed.stockCount<=0 ? "❌ Tükənib" : detailMed.stockCount<10 ? `⚠️ ${detailMed.stockCount} ədəd qalıb` : `✅ Stokda var (${detailMed.stockCount})`}
                </span>
              </div>

              {/* HAQQINDA */}
              <div className="dm-section">
                <div className="dm-section-title">ℹ️ Haqqında</div>
                <div className="dm-text">{detailMed.description}</div>
                {detailMed.dosageForm   && <div style={{marginTop:6,fontSize:12,color:"#5D8AA8"}}>💊 Forma: <strong style={{color:"#154360"}}>{detailMed.dosageForm}</strong></div>}
                {detailMed.manufacturer && <div style={{marginTop:4,fontSize:12,color:"#5D8AA8"}}>🏭 İstehsalçı: <strong style={{color:"#154360"}}>{detailMed.manufacturer}</strong></div>}
              </div>

              {/* İSTİFADƏ */}
              {detailMed.usageInfo && (
                <div className="dm-section">
                  <div className="dm-section-title">✅ İstifadə qaydası</div>
                  <div className="usage-box"><span>💡</span><span>{detailMed.usageInfo}</span></div>
                </div>
              )}

              {/* YAN TƏSİRLƏR */}
              {detailMed.sideEffects && (
                <div className="dm-section">
                  <div className="dm-section-title">⚠️ Yan təsirlər</div>
                  <div className="side-effects-list">
                    {detailMed.sideEffects.split(",").map((s,i) => (
                      <span key={i} className="se-chip">{s.trim()}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* QADAĞALAR */}
              {detailMed.contraindications && (
                <div className="dm-section">
                  <div className="dm-section-title">🚫 Əks göstərişlər</div>
                  <div className="contra-box"><span>⛔</span><span>{detailMed.contraindications}</span></div>
                </div>
              )}

              {/* ƏVƏZEDİCİLƏR */}
              {detailMed.substitutes?.length > 0 && (
                <div className="dm-section">
                  <div className="dm-section-title">🔄 Əvəzedici dərmanlar</div>
                  <div className="substitutes-list">
                    {detailMed.substitutes.map((sub,i) => (
                      <div key={i} className="sub-card" onClick={()=>goToSubstitute(sub)}>
                        💊 {sub} <span style={{fontSize:10,color:"#8DAFC4"}}>→</span>
                      </div>
                    ))}
                  </div>
                  <div style={{fontSize:11,color:"#B0C4D8",marginTop:8}}>* Həkiminizlə məsləhətləşmədən əvəzedici istifadə etməyin</div>
                </div>
              )}
            </div>

            <div className="dm-footer">
              <button className="btn-ghost" onClick={()=>setDetailMed(null)}>Bağla</button>
              {cartItems[detailMed.id] ? (
                <div className="qty-ctrl" style={{flex:1,justifyContent:"center"}}>
                  <button className="qty-btn" onClick={()=>changeQty(detailMed,-1)}>−</button>
                  <span className="qty-num" style={{fontSize:16}}>{cartItems[detailMed.id]}</span>
                  <button className="qty-btn" onClick={e=>changeQty(detailMed,1,e)}>+</button>
                </div>
              ) : (
                <button className="dm-btn-main"
                  disabled={detailMed.stockCount<=0}
                  onClick={e=>{handleAddToCart(detailMed,e)}}>
                  {detailMed.stockCount<=0 ? "❌ Tükənib" : "🛒 Səbətə əlavə et"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ──────── RESEPT XƏBƏRDARLIQ MODALI ──────── */}
      {rxWarning && (
        <div className="overlay" onClick={e=>e.target===e.currentTarget&&setRxWarning(null)}>
          <div className="rx-warn-modal">
            <div className="rx-warn-icon">📋</div>
            <div className="rx-warn-title">Resept tələb olunur</div>
            <div className="rx-warn-text">
              <strong>{rxWarning.name}</strong> reseptli dərmandır.<br/>
              Həkiminizin resepti olmadan bu dərmanı almaq tövsiyə edilmir.<br/>
              Yenə də səbətə əlavə etmək istəyirsinizmi?
            </div>
            <div className="rx-warn-btns">
              <button className="btn-ghost" onClick={()=>setRxWarning(null)}>Ləğv et</button>
              <button className="btn-danger" onClick={e=>doAdd(rxWarning,null)}>Yenə də əlavə et</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}