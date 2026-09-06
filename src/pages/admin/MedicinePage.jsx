import { useState, useEffect } from "react";
import axios from "axios";

const API = process.env.REACT_APP_API_URL;
const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

const mockCategories = [
  { id: 1, name: "Antibiotiklər" },
  { id: 2, name: "Ağrıkəsicilər" },
  { id: 3, name: "Vitaminlər" },
  { id: 4, name: "Kardioloji" },
  { id: 5, name: "Dermatoloji" },
  { id: 6, name: "Mədə-bağırsaq" },
  { id: 7, name: "Soyuqdəymə və qrip" },
  { id: 8, name: "Allergiya" },
  { id: 9, name: "Nevroloji" },
  { id: 10, name: "Endokrinoloji" },
  { id: 11, name: "Uşaq dərmanları" },
  { id: 12, name: "Qadın sağlamlığı" },
  { id: 13, name: "Göz damcıları" },
  { id: 14, name: "Burun-boğaz" },
  { id: 15, name: "Antiseptiklər" },
];

const mockMedicines = [
  {
    id: 1,
    name: "Amoksisilin 500mg",
    description: "Geniş spektrli antibiotik",
    price: 8.5,
    stockCount: 120,
    activeIngredient: "Amoxicillin",
    isPrescriptionRequired: true,
    expireDate: "2026-12-01",
    categoryIds: [1],
    sideEffects: "Ürəkbulanma, ishal, allergik reaksiya",
    substituteIds: [2, 3],
    imageUrl: "",
  },
  {
    id: 2,
    name: "Augmentin 625mg",
    description: "Antibiotik, infeksiyalara qarşı istifadə olunur",
    price: 11.2,
    stockCount: 70,
    activeIngredient: "Amoxicillin + Clavulanic acid",
    isPrescriptionRequired: true,
    expireDate: "2026-10-15",
    categoryIds: [1],
    sideEffects: "Mədə narahatlığı, ishal, allergiya",
    substituteIds: [1, 3],
    imageUrl: "",
  },
  {
    id: 3,
    name: "Sefuroksim 500mg",
    description: "Bakterial infeksiyalar üçün antibiotik",
    price: 14.0,
    stockCount: 65,
    activeIngredient: "Cefuroxime",
    isPrescriptionRequired: true,
    expireDate: "2027-01-10",
    categoryIds: [1],
    sideEffects: "Baş ağrısı, ürəkbulanma, dəri səpgisi",
    substituteIds: [1, 2],
    imageUrl: "",
  },
  {
    id: 4,
    name: "İbuprofen 400mg",
    description: "Ağrıkəsici və iltihab əleyhinə dərman",
    price: 4.2,
    stockCount: 250,
    activeIngredient: "Ibuprofen",
    isPrescriptionRequired: false,
    expireDate: "2027-06-15",
    categoryIds: [2],
    sideEffects: "Mədə ağrısı, başgicəllənmə",
    substituteIds: [5, 6],
    imageUrl: "",
  },
  {
    id: 5,
    name: "Paracetamol 500mg",
    description: "Qızdırma və ağrının azaldılması üçün",
    price: 3.5,
    stockCount: 300,
    activeIngredient: "Paracetamol",
    isPrescriptionRequired: false,
    expireDate: "2027-08-01",
    categoryIds: [2, 7],
    sideEffects: "Nadir hallarda allergiya, qaraciyər yükü",
    substituteIds: [4, 6],
    imageUrl: "",
  },
  {
    id: 6,
    name: "Diclofenac 50mg",
    description: "Güclü ağrıkəsici və iltihab əleyhinə",
    price: 5.6,
    stockCount: 90,
    activeIngredient: "Diclofenac",
    isPrescriptionRequired: false,
    expireDate: "2026-11-20",
    categoryIds: [2],
    sideEffects: "Mədə yanması, ürəkbulanma, təzyiq artımı",
    substituteIds: [4, 5],
    imageUrl: "",
  },
  {
    id: 7,
    name: "Vitamin D3 1000IU",
    description: "D vitamini əlavəsi",
    price: 12.0,
    stockCount: 80,
    activeIngredient: "Cholecalciferol",
    isPrescriptionRequired: false,
    expireDate: "2027-03-01",
    categoryIds: [3],
    sideEffects: "Nadir hallarda ürəkbulanma",
    substituteIds: [8, 9],
    imageUrl: "",
  },
  {
    id: 8,
    name: "Maqnezium + B6",
    description: "Əzələ və sinir sistemi dəstəyi üçün",
    price: 9.8,
    stockCount: 140,
    activeIngredient: "Magnesium, Vitamin B6",
    isPrescriptionRequired: false,
    expireDate: "2027-05-22",
    categoryIds: [3, 9],
    sideEffects: "Yüngül mədə narahatlığı",
    substituteIds: [7, 9],
    imageUrl: "",
  },
  {
    id: 9,
    name: "Vitamin C 1000mg",
    description: "İmmunitet dəstəyi üçün vitamin",
    price: 7.0,
    stockCount: 210,
    activeIngredient: "Ascorbic acid",
    isPrescriptionRequired: false,
    expireDate: "2027-07-18",
    categoryIds: [3, 7],
    sideEffects: "Mədə narahatlığı, turşuluq",
    substituteIds: [7, 8],
    imageUrl: "",
  },
  {
    id: 10,
    name: "Metoprolol 50mg",
    description: "Beta-blokator",
    price: 6.8,
    stockCount: 60,
    activeIngredient: "Metoprolol",
    isPrescriptionRequired: true,
    expireDate: "2026-09-30",
    categoryIds: [4],
    sideEffects: "Başgicəllənmə, yorğunluq, təzyiq düşməsi",
    substituteIds: [11, 12],
    imageUrl: "",
  },
  {
    id: 11,
    name: "Bisoprolol 5mg",
    description: "Təzyiq və ürək ritmi üçün dərman",
    price: 8.9,
    stockCount: 55,
    activeIngredient: "Bisoprolol",
    isPrescriptionRequired: true,
    expireDate: "2026-12-12",
    categoryIds: [4],
    sideEffects: "Yorğunluq, nəbzin zəifləməsi",
    substituteIds: [10, 12],
    imageUrl: "",
  },
  {
    id: 12,
    name: "Amlodipin 10mg",
    description: "Yüksək təzyiq üçün istifadə olunur",
    price: 7.9,
    stockCount: 100,
    activeIngredient: "Amlodipine",
    isPrescriptionRequired: true,
    expireDate: "2027-02-14",
    categoryIds: [4],
    sideEffects: "Ayaqlarda şişkinlik, baş ağrısı",
    substituteIds: [10, 11],
    imageUrl: "",
  },
  {
    id: 13,
    name: "Fenistil Gel",
    description: "Dəri qaşınması və allergiya üçün gel",
    price: 10.4,
    stockCount: 44,
    activeIngredient: "Dimetindene",
    isPrescriptionRequired: false,
    expireDate: "2027-01-01",
    categoryIds: [5, 8],
    sideEffects: "Dəri quruluğu, yüngül qıcıqlanma",
    substituteIds: [14, 15],
    imageUrl: "",
  },
  {
    id: 14,
    name: "Bepanthen Cream",
    description: "Dərini bərpa edən krem",
    price: 13.0,
    stockCount: 75,
    activeIngredient: "Dexpanthenol",
    isPrescriptionRequired: false,
    expireDate: "2027-04-05",
    categoryIds: [5],
    sideEffects: "Nadir hallarda allergiya",
    substituteIds: [13, 15],
    imageUrl: "",
  },
  {
    id: 15,
    name: "Fucidin Cream",
    description: "Dəri infeksiyalarına qarşı krem",
    price: 15.5,
    stockCount: 32,
    activeIngredient: "Fusidic acid",
    isPrescriptionRequired: true,
    expireDate: "2026-08-19",
    categoryIds: [5, 1],
    sideEffects: "Dəri qızarması, yanma hissi",
    substituteIds: [13, 14],
    imageUrl: "",
  },
  {
    id: 16,
    name: "Omeprazol 20mg",
    description: "Mədə turşusunu azaldır",
    price: 6.2,
    stockCount: 150,
    activeIngredient: "Omeprazole",
    isPrescriptionRequired: false,
    expireDate: "2027-03-10",
    categoryIds: [6],
    sideEffects: "Baş ağrısı, qarında köp",
    substituteIds: [17, 18],
    imageUrl: "",
  },
  {
    id: 17,
    name: "Pantoprazol 40mg",
    description: "Mədə problemləri üçün proton pompa inhibitoru",
    price: 7.8,
    stockCount: 95,
    activeIngredient: "Pantoprazole",
    isPrescriptionRequired: false,
    expireDate: "2027-06-11",
    categoryIds: [6],
    sideEffects: "Başgicəllənmə, qarın ağrısı",
    substituteIds: [16, 18],
    imageUrl: "",
  },
  {
    id: 18,
    name: "Smecta",
    description: "İshal və mədə-bağırsaq narahatlığı üçün",
    price: 5.9,
    stockCount: 125,
    activeIngredient: "Diosmectite",
    isPrescriptionRequired: false,
    expireDate: "2027-09-21",
    categoryIds: [6],
    sideEffects: "Qəbizlik",
    substituteIds: [16, 17],
    imageUrl: "",
  },
  {
    id: 19,
    name: "Theraflu",
    description: "Soyuqdəymə simptomları üçün toz",
    price: 9.2,
    stockCount: 86,
    activeIngredient: "Paracetamol + Phenylephrine",
    isPrescriptionRequired: false,
    expireDate: "2027-01-28",
    categoryIds: [7],
    sideEffects: "Yuxululuq, ağız quruluğu",
    substituteIds: [20, 21],
    imageUrl: "",
  },
  {
    id: 20,
    name: "Coldrex",
    description: "Qrip və soyuqdəymə üçün kompleks dərman",
    price: 8.7,
    stockCount: 94,
    activeIngredient: "Paracetamol + Vitamin C",
    isPrescriptionRequired: false,
    expireDate: "2027-02-16",
    categoryIds: [7],
    sideEffects: "Mədə narahatlığı, ürəkbulanma",
    substituteIds: [19, 21],
    imageUrl: "",
  },
  {
    id: 21,
    name: "Strepsils",
    description: "Boğaz ağrısı üçün pastil",
    price: 4.9,
    stockCount: 180,
    activeIngredient: "Amylmetacresol",
    isPrescriptionRequired: false,
    expireDate: "2027-08-30",
    categoryIds: [7, 14],
    sideEffects: "Ağızda qıcıqlanma",
    substituteIds: [19, 20],
    imageUrl: "",
  },
  {
    id: 22,
    name: "Cetirizine 10mg",
    description: "Allergiya üçün antihistamin",
    price: 4.8,
    stockCount: 132,
    activeIngredient: "Cetirizine",
    isPrescriptionRequired: false,
    expireDate: "2027-03-25",
    categoryIds: [8],
    sideEffects: "Yuxululuq, ağız quruluğu",
    substituteIds: [23, 24],
    imageUrl: "",
  },
  {
    id: 23,
    name: "Loratadine 10mg",
    description: "Mövsümi allergiya üçün dərman",
    price: 5.1,
    stockCount: 114,
    activeIngredient: "Loratadine",
    isPrescriptionRequired: false,
    expireDate: "2027-04-18",
    categoryIds: [8],
    sideEffects: "Baş ağrısı, ağız quruluğu",
    substituteIds: [22, 24],
    imageUrl: "",
  },
  {
    id: 24,
    name: "Desloratadine 5mg",
    description: "Allergik simptomların azaldılması üçün",
    price: 7.4,
    stockCount: 68,
    activeIngredient: "Desloratadine",
    isPrescriptionRequired: false,
    expireDate: "2026-12-28",
    categoryIds: [8],
    sideEffects: "Yorğunluq, boğaz quruluğu",
    substituteIds: [22, 23],
    imageUrl: "",
  },
  {
    id: 25,
    name: "Glycine",
    description: "Sinir sistemi üçün yüngül dəstək",
    price: 6.0,
    stockCount: 73,
    activeIngredient: "Glycine",
    isPrescriptionRequired: false,
    expireDate: "2027-07-07",
    categoryIds: [9],
    sideEffects: "Nadir hallarda yuxululuq",
    substituteIds: [26, 27],
    imageUrl: "",
  },
  {
    id: 26,
    name: "Noofen",
    description: "Sinir gərginliyi və narahatlıq üçün",
    price: 13.6,
    stockCount: 40,
    activeIngredient: "Phenibut",
    isPrescriptionRequired: true,
    expireDate: "2026-10-09",
    categoryIds: [9],
    sideEffects: "Yuxululuq, başgicəllənmə",
    substituteIds: [25, 27],
    imageUrl: "",
  },
  {
    id: 27,
    name: "Magne B6",
    description: "Stres və sinir sistemi üçün dəstək",
    price: 10.2,
    stockCount: 89,
    activeIngredient: "Magnesium lactate + Vitamin B6",
    isPrescriptionRequired: false,
    expireDate: "2027-05-17",
    categoryIds: [3, 9],
    sideEffects: "Mədə narahatlığı",
    substituteIds: [25, 26],
    imageUrl: "",
  },
  {
    id: 28,
    name: "Metformin 500mg",
    description: "Şəkərli diabet üçün istifadə olunur",
    price: 7.3,
    stockCount: 102,
    activeIngredient: "Metformin",
    isPrescriptionRequired: true,
    expireDate: "2027-01-22",
    categoryIds: [10],
    sideEffects: "İshal, qarın köpü, ürəkbulanma",
    substituteIds: [29, 30],
    imageUrl: "",
  },
  {
    id: 29,
    name: "Glucophage 850mg",
    description: "Diabet xəstələri üçün metformin əsaslı dərman",
    price: 9.9,
    stockCount: 57,
    activeIngredient: "Metformin",
    isPrescriptionRequired: true,
    expireDate: "2026-11-02",
    categoryIds: [10],
    sideEffects: "Mədə-bağırsaq narahatlığı",
    substituteIds: [28, 30],
    imageUrl: "",
  },
  {
    id: 30,
    name: "Siofor 500mg",
    description: "Qanda şəkəri tənzimləmək üçün",
    price: 8.6,
    stockCount: 63,
    activeIngredient: "Metformin",
    isPrescriptionRequired: true,
    expireDate: "2027-02-09",
    categoryIds: [10],
    sideEffects: "Ürəkbulanma, ishal",
    substituteIds: [28, 29],
    imageUrl: "",
  },
  {
    id: 31,
    name: "Nurofen Kids",
    description: "Uşaqlar üçün qızdırmasalıcı sirop",
    price: 11.5,
    stockCount: 110,
    activeIngredient: "Ibuprofen",
    isPrescriptionRequired: false,
    expireDate: "2027-03-30",
    categoryIds: [11],
    sideEffects: "Mədə narahatlığı",
    substituteIds: [32, 33],
    imageUrl: "",
  },
  {
    id: 32,
    name: "Panadol Baby",
    description: "Uşaqlar üçün paracetamol sirop",
    price: 10.8,
    stockCount: 96,
    activeIngredient: "Paracetamol",
    isPrescriptionRequired: false,
    expireDate: "2027-06-03",
    categoryIds: [11],
    sideEffects: "Nadir hallarda allergiya",
    substituteIds: [31, 33],
    imageUrl: "",
  },
  {
    id: 33,
    name: "Otrivin Baby",
    description: "Uşaqlar üçün burun damcısı",
    price: 8.1,
    stockCount: 84,
    activeIngredient: "Sodium chloride",
    isPrescriptionRequired: false,
    expireDate: "2027-01-14",
    categoryIds: [11, 14],
    sideEffects: "Burunda yüngül qıcıqlanma",
    substituteIds: [31, 32],
    imageUrl: "",
  },
  {
    id: 34,
    name: "Femibion",
    description: "Qadın sağlamlığı üçün vitamin kompleksi",
    price: 19.5,
    stockCount: 42,
    activeIngredient: "Folic acid + vitamins",
    isPrescriptionRequired: false,
    expireDate: "2027-08-19",
    categoryIds: [12, 3],
    sideEffects: "Yüngül ürəkbulanma",
    substituteIds: [35, 36],
    imageUrl: "",
  },
  {
    id: 35,
    name: "Fol turşusu 5mg",
    description: "Folat çatışmazlığı üçün istifadə olunur",
    price: 4.0,
    stockCount: 155,
    activeIngredient: "Folic acid",
    isPrescriptionRequired: false,
    expireDate: "2027-09-01",
    categoryIds: [12, 3],
    sideEffects: "Nadir hallarda allergiya",
    substituteIds: [34, 36],
    imageUrl: "",
  },
  {
    id: 36,
    name: "Iron Complex",
    description: "Dəmir çatışmazlığına qarşı kompleks",
    price: 12.7,
    stockCount: 77,
    activeIngredient: "Iron + Vitamins",
    isPrescriptionRequired: false,
    expireDate: "2027-04-27",
    categoryIds: [12, 3],
    sideEffects: "Qəbizlik, ürəkbulanma",
    substituteIds: [34, 35],
    imageUrl: "",
  },
  {
    id: 37,
    name: "Systane Ultra",
    description: "Göz quruluğu üçün damcı",
    price: 16.9,
    stockCount: 59,
    activeIngredient: "Polyethylene glycol",
    isPrescriptionRequired: false,
    expireDate: "2027-02-06",
    categoryIds: [13],
    sideEffects: "Gözdə qıcıqlanma",
    substituteIds: [38, 39],
    imageUrl: "",
  },
  {
    id: 38,
    name: "Refresh Tears",
    description: "Göz nəmləndirici damcı",
    price: 15.4,
    stockCount: 71,
    activeIngredient: "Carboxymethylcellulose",
    isPrescriptionRequired: false,
    expireDate: "2027-06-24",
    categoryIds: [13],
    sideEffects: "Qısa müddətli bulanıq görmə",
    substituteIds: [37, 39],
    imageUrl: "",
  },
  {
    id: 39,
    name: "Tobrex",
    description: "Göz infeksiyaları üçün antibiotik damcı",
    price: 18.2,
    stockCount: 35,
    activeIngredient: "Tobramycin",
    isPrescriptionRequired: true,
    expireDate: "2026-12-03",
    categoryIds: [13, 1],
    sideEffects: "Göz yanması, qıcıqlanma",
    substituteIds: [37, 38],
    imageUrl: "",
  },
  {
    id: 40,
    name: "Nazivin",
    description: "Burun tutulmasına qarşı damcı",
    price: 6.7,
    stockCount: 118,
    activeIngredient: "Oxymetazoline",
    isPrescriptionRequired: false,
    expireDate: "2027-03-13",
    categoryIds: [14],
    sideEffects: "Burun quruluğu, qıcıqlanma",
    substituteIds: [41, 42],
    imageUrl: "",
  },
  {
    id: 41,
    name: "Otrivin",
    description: "Burun tutulması üçün sprey",
    price: 7.5,
    stockCount: 97,
    activeIngredient: "Xylometazoline",
    isPrescriptionRequired: false,
    expireDate: "2027-05-11",
    categoryIds: [14],
    sideEffects: "Burunda yanma, quruluq",
    substituteIds: [40, 42],
    imageUrl: "",
  },
  {
    id: 42,
    name: "Tantum Verde",
    description: "Boğaz ağrısı üçün sprey",
    price: 11.3,
    stockCount: 69,
    activeIngredient: "Benzydamine",
    isPrescriptionRequired: false,
    expireDate: "2027-07-29",
    categoryIds: [14],
    sideEffects: "Ağızda keyimə, qıcıqlanma",
    substituteIds: [40, 41],
    imageUrl: "",
  },
  {
    id: 43,
    name: "Xlorheksidin",
    description: "Antiseptik məhlul",
    price: 3.8,
    stockCount: 205,
    activeIngredient: "Chlorhexidine",
    isPrescriptionRequired: false,
    expireDate: "2027-09-09",
    categoryIds: [15],
    sideEffects: "Dəri quruluğu",
    substituteIds: [44, 45],
    imageUrl: "",
  },
  {
    id: 44,
    name: "Betadine",
    description: "Yaralar üçün antiseptik məhlul",
    price: 8.4,
    stockCount: 88,
    activeIngredient: "Povidone-iodine",
    isPrescriptionRequired: false,
    expireDate: "2027-02-20",
    categoryIds: [15],
    sideEffects: "Dəri qıcıqlanması",
    substituteIds: [43, 45],
    imageUrl: "",
  },
  {
    id: 45,
    name: "Hydrogen Peroxide",
    description: "Dezinfeksiya üçün antiseptik",
    price: 2.9,
    stockCount: 160,
    activeIngredient: "Hydrogen peroxide",
    isPrescriptionRequired: false,
    expireDate: "2027-01-05",
    categoryIds: [15],
    sideEffects: "Dəridə yüngül ağarma",
    substituteIds: [43, 44],
    imageUrl: "",
  },
];

const styles = `
  .pg-header {
    display: flex; align-items: flex-start;
    justify-content: space-between; margin-bottom: 22px; gap: 16px;
  }
  .pg-header h1 { font-size: 21px; font-weight: 800; color: #154360; margin-bottom: 3px; }
  .pg-header p { font-size: 13px; color: #5D8AA8; }

  .btn-primary {
    display: flex; align-items: center; gap: 7px;
    padding: 10px 18px;
    background: linear-gradient(135deg, #1F618D, #2E86C1);
    color: #fff; border: none; border-radius: 9px;
    font-size: 13px; font-weight: 700;
    font-family: 'Plus Jakarta Sans', sans-serif;
    cursor: pointer; transition: all 0.2s; white-space: nowrap; flex-shrink: 0;
  }
  .btn-primary:hover:not(:disabled) {
    background: linear-gradient(135deg, #154360, #1F618D);
    transform: translateY(-1px); box-shadow: 0 6px 16px rgba(31,97,141,0.25);
  }
  .btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }

  .toolbar {
    display: flex; align-items: center; gap: 12px; margin-bottom: 18px; flex-wrap: wrap;
  }
  .search-bar {
    display: flex; align-items: center; gap: 8px;
    background: #fff; border: 1.5px solid #D6EAF8;
    border-radius: 9px; padding: 9px 14px; flex: 1; max-width: 320px; transition: all 0.2s;
  }
  .search-bar:focus-within { border-color: #1F618D; box-shadow: 0 0 0 3px rgba(31,97,141,0.08); }
  .search-bar input {
    border: none; background: none; outline: none;
    font-size: 13px; color: #1A252F; width: 100%;
    font-family: 'Plus Jakarta Sans', sans-serif;
  }
  .search-bar input::placeholder { color: #B0C4D8; }

  .filter-select {
    padding: 9px 14px; border: 1.5px solid #D6EAF8; border-radius: 9px;
    background: #fff; font-size: 13px; color: #1A252F;
    font-family: 'Plus Jakarta Sans', sans-serif; outline: none; cursor: pointer;
  }
  .filter-select:focus { border-color: #1F618D; }

  .table-card { background: #fff; border-radius: 14px; border: 1px solid #D6EAF8; overflow: hidden; }
  .data-table { width: 100%; border-collapse: collapse; }
  .data-table th {
    font-size: 10px; font-weight: 800; color: #5D8AA8;
    text-align: left; padding: 11px 18px;
    letter-spacing: 0.8px; text-transform: uppercase;
    background: #F8FCFF; border-bottom: 1px solid #EBF5FB;
    white-space: nowrap;
  }
  .data-table td {
    font-size: 13px; color: #1A252F;
    padding: 13px 18px; border-bottom: 1px solid #F4FAFD;
    vertical-align: middle;
  }
  .data-table tr:last-child td { border-bottom: none; }
  .data-table tr:hover td { background: #F8FCFF; }

  .med-name { font-weight: 700; color: #154360; margin-bottom: 2px; }
  .med-ingredient { font-size: 11px; color: #5D8AA8; }
  .med-sidefx {
    font-size: 11px;
    color: #8B5E3C;
    margin-top: 4px;
    max-width: 240px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .price-val { font-weight: 800; color: #1F618D; font-size: 14px; }
  .stock-badge {
    display: inline-flex; align-items: center;
    padding: 3px 9px; border-radius: 20px; font-size: 11px; font-weight: 700;
  }
  .stock-ok { background: #E8FAF8; color: #17A589; }
  .stock-low { background: #FEF9E7; color: #D4AC0D; }
  .stock-out { background: #FDEDEC; color: #E74C3C; }

  .rx-badge {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 3px 8px; border-radius: 20px; font-size: 11px; font-weight: 700;
  }
  .rx-yes { background: #FDEDEC; color: #E74C3C; }
  .rx-no { background: #E8FAF8; color: #17A589; }

  .cat-tag {
    display: inline-flex; align-items: center;
    background: #EBF5FB; border: 1px solid #D6EAF8;
    color: #1F618D; font-size: 10px; font-weight: 700;
    padding: 2px 7px; border-radius: 20px; margin: 1px;
  }

  .sub-tag {
    display: inline-flex; align-items: center;
    background: #FEF9E7; border: 1px solid #F9E79F;
    color: #9A7D0A; font-size: 10px; font-weight: 700;
    padding: 2px 7px; border-radius: 20px; margin: 1px;
  }

  .action-btns { display: flex; gap: 6px; }
  .btn-sm-edit {
    padding: 6px 10px; background: #EBF5FB; border: 1.5px solid #D6EAF8;
    border-radius: 7px; color: #1F618D; font-size: 11px; font-weight: 700;
    font-family: 'Plus Jakarta Sans', sans-serif; cursor: pointer; transition: all 0.18s;
  }
  .btn-sm-edit:hover { background: #D6EAF8; }
  .btn-sm-del {
    padding: 6px 10px; background: #FDF2F2; border: 1.5px solid #FADBD8;
    border-radius: 7px; color: #E74C3C; font-size: 11px; font-weight: 700;
    font-family: 'Plus Jakarta Sans', sans-serif; cursor: pointer; transition: all 0.18s;
  }
  .btn-sm-del:hover { background: #FADBD8; }

  .count-badge {
    display: inline-flex; align-items: center;
    background: #EBF5FB; border: 1px solid #D6EAF8;
    color: #1F618D; font-size: 12px; font-weight: 700;
    padding: 2px 10px; border-radius: 20px; margin-left: 10px;
  }

  .empty-state {
    text-align: center; padding: 60px;
    background: #fff; border-radius: 14px; border: 1.5px dashed #D6EAF8;
  }
  .empty-state .ei { font-size: 48px; margin-bottom: 12px; }
  .empty-state h3 { font-size: 16px; font-weight: 700; color: #154360; margin-bottom: 6px; }
  .empty-state p { font-size: 13px; color: #5D8AA8; }

  .overlay {
    position: fixed; inset: 0;
    background: rgba(21,67,96,0.45); backdrop-filter: blur(4px);
    display: flex; align-items: center; justify-content: center;
    z-index: 999; padding: 20px; animation: fadeIn 0.18s ease; overflow-y: auto;
  }
  @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }

  .modal {
    background: #fff; border-radius: 16px;
    width: 100%; max-width: 720px;
    box-shadow: 0 24px 64px rgba(21,67,96,0.2);
    animation: slideUp 0.2s ease; margin: auto;
  }
  @keyframes slideUp { from { transform:translateY(16px);opacity:0 } to { transform:translateY(0);opacity:1 } }

  .modal-head {
    padding: 22px 24px 18px; border-bottom: 1px solid #EBF5FB;
    display: flex; align-items: center; justify-content: space-between;
  }
  .modal-title { font-size: 17px; font-weight: 800; color: #154360; }
  .modal-x {
    width: 30px; height: 30px; border-radius: 8px;
    background: #EBF5FB; border: none; cursor: pointer;
    font-size: 14px; color: #5D8AA8;
    display: flex; align-items: center; justify-content: center; transition: all 0.18s;
  }
  .modal-x:hover { background: #D6EAF8; color: #154360; }

  .modal-body {
    padding: 22px 24px; display: flex; flex-direction: column; gap: 14px;
    max-height: 70vh; overflow-y: auto;
  }

  .modal-foot {
    padding: 16px 24px; border-top: 1px solid #EBF5FB;
    display: flex; gap: 10px; justify-content: flex-end;
  }

  .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  .form-row-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 14px; }

  .fg { display: flex; flex-direction: column; gap: 7px; }
  .fl { font-size: 12px; font-weight: 700; color: #1F618D; letter-spacing: 0.5px; text-transform: uppercase; }
  .fi {
    padding: 11px 14px; border: 1.5px solid #D6EAF8; border-radius: 9px;
    font-size: 14px; color: #1A252F;
    font-family: 'Plus Jakarta Sans', sans-serif;
    background: #F8FCFF; outline: none; transition: all 0.2s;
  }
  .fi:focus { border-color: #1F618D; background: #fff; box-shadow: 0 0 0 3px rgba(31,97,141,0.09); }
  .fi::placeholder { color: #B0C4D8; }
  textarea.fi { resize: vertical; min-height: 80px; line-height: 1.5; }
  select.fi { cursor: pointer; }

  .cat-multi, .subs-multi { display: flex; flex-wrap: wrap; gap: 7px; }
  .cat-check, .subs-check {
    display: flex; align-items: center; gap: 6px;
    padding: 6px 12px; border-radius: 20px;
    border: 1.5px solid #D6EAF8; background: #F8FCFF;
    font-size: 12px; font-weight: 600; color: #5D8AA8;
    cursor: pointer; transition: all 0.18s; user-select: none;
  }
  .cat-check:hover, .subs-check:hover { border-color: #AED6F1; }
  .cat-check.checked { border-color: #1F618D; background: #EBF5FB; color: #1F618D; }
  .subs-check.checked { border-color: #D4AC0D; background: #FEF9E7; color: #9A7D0A; }

  .toggle-wrap { display: flex; align-items: center; gap: 10px; }
  .toggle {
    width: 44px; height: 24px; border-radius: 12px;
    background: #D6EAF8; border: none; cursor: pointer;
    position: relative; transition: all 0.2s; flex-shrink: 0;
  }
  .toggle.on { background: #1F618D; }
  .toggle::after {
    content: ''; position: absolute;
    width: 18px; height: 18px; border-radius: 50%;
    background: #fff; top: 3px; left: 3px;
    transition: all 0.2s;
    box-shadow: 0 1px 4px rgba(0,0,0,0.15);
  }
  .toggle.on::after { left: 23px; }
  .toggle-label { font-size: 13px; color: #1A252F; font-weight: 500; }

  .btn-cancel {
    padding: 10px 18px; background: #EBF5FB; border: 1.5px solid #D6EAF8; border-radius: 9px;
    color: #1F618D; font-size: 13px; font-weight: 700;
    font-family: 'Plus Jakarta Sans', sans-serif; cursor: pointer; transition: all 0.18s;
  }
  .btn-cancel:hover { background: #D6EAF8; }

  .err-msg {
    background: #FDF2F2; border: 1px solid #FADBD8; color: #C0392B;
    padding: 10px 14px; border-radius: 8px; font-size: 13px;
  }

  .confirm-box {
    background: #fff; border-radius: 14px; padding: 28px;
    max-width: 360px; width: 100%; text-align: center;
    box-shadow: 0 24px 64px rgba(21,67,96,0.2); animation: slideUp 0.2s ease;
  }
  .confirm-box .ci { font-size: 40px; margin-bottom: 12px; }
  .confirm-box h3 { font-size: 17px; font-weight: 800; color: #154360; margin-bottom: 8px; }
  .confirm-box p { font-size: 13px; color: #5D8AA8; margin-bottom: 22px; line-height: 1.6; }

  .confirm-btns { display: flex; gap: 10px; }
  .btn-del-confirm {
    flex: 1; padding: 11px;
    background: linear-gradient(135deg, #E74C3C, #C0392B);
    color: #fff; border: none; border-radius: 9px;
    font-size: 13px; font-weight: 700;
    font-family: 'Plus Jakarta Sans', sans-serif; cursor: pointer; transition: all 0.2s;
    display: flex; align-items: center; justify-content: center;
  }
  .btn-del-confirm:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
  .btn-del-confirm:disabled { opacity: 0.7; cursor: not-allowed; }

  .spin {
    width: 14px; height: 14px;
    border: 2px solid rgba(255,255,255,0.4);
    border-top-color: #fff; border-radius: 50%;
    animation: spin 0.7s linear infinite; display: inline-block;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  @media (max-width: 900px) {
    .form-row, .form-row-3 { grid-template-columns: 1fr; }
  }
`;

const emptyForm = {
  name: "",
  description: "",
  price: "",
  stockCount: "",
  imageUrl: "",
  expireDate: "",
  activeIngredient: "",
  isPrescriptionRequired: false,
  categoryIds: [],
  sideEffects: "",
  substituteIds: [],
};

function stockStatus(count) {
  if (count <= 0) return { label: "Tükənib", cls: "stock-out" };
  if (count < 20) return { label: `${count} — Az`, cls: "stock-low" };
  return { label: String(count), cls: "stock-ok" };
}

export default function MedicinePage() {
  const [data, setData] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("");
  const [filterRx, setFilterRx] = useState("");
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [medRes, catRes] = await Promise.all([
        axios.get(`${API}/api/Medicine`, { headers: authHeader() }),
        axios.get(`${API}/api/Category`, { headers: authHeader() }),
      ]);

      const medData = Array.isArray(medRes.data) ? medRes.data : medRes.data?.data || [];
      const catData = Array.isArray(catRes.data) ? catRes.data : catRes.data?.data || [];

      setData(medData.length ? medData : mockMedicines);
      setCategories(catData.length ? catData : mockCategories);
    } catch {
      setData(mockMedicines);
      setCategories(mockCategories);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();

    setFiltered(
      data.filter((d) => {
        const matchQ =
          d.name?.toLowerCase().includes(q) ||
          d.activeIngredient?.toLowerCase().includes(q) ||
          d.sideEffects?.toLowerCase().includes(q);

        const matchCat = filterCat ? d.categoryIds?.includes(Number(filterCat)) : true;
        const matchRx =
          filterRx === ""
            ? true
            : filterRx === "1"
            ? d.isPrescriptionRequired
            : !d.isPrescriptionRequired;

        return matchQ && matchCat && matchRx;
      })
    );
  }, [search, filterCat, filterRx, data]);

  const openAdd = () => {
    setEditItem(null);
    setForm(emptyForm);
    setError("");
    setModal(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    setForm({
      name: item.name || "",
      description: item.description || "",
      price: String(item.price || ""),
      stockCount: String(item.stockCount || ""),
      imageUrl: item.imageUrl || "",
      expireDate: item.expireDate ? item.expireDate.substring(0, 10) : "",
      activeIngredient: item.activeIngredient || "",
      isPrescriptionRequired: Boolean(item.isPrescriptionRequired),
      categoryIds: item.categoryIds || [],
      sideEffects: item.sideEffects || "",
      substituteIds: item.substituteIds || [],
    });
    setError("");
    setModal(true);
  };

  const closeModal = () => {
    setModal(false);
    setError("");
  };

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const toggleCat = (id) => {
    setForm((f) => ({
      ...f,
      categoryIds: f.categoryIds.includes(id)
        ? f.categoryIds.filter((c) => c !== id)
        : [...f.categoryIds, id],
    }));
  };

  const toggleSubstitute = (id) => {
    setForm((f) => ({
      ...f,
      substituteIds: f.substituteIds.includes(id)
        ? f.substituteIds.filter((s) => s !== id)
        : [...f.substituteIds, id],
    }));
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      setError("Ad sahəsi mütləqdir.");
      return;
    }

    if (!form.price || Number(form.price) <= 0) {
      setError("Qiymət düzgün daxil edilməlidir.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const fd = new FormData();

      fd.append("Name", form.name.trim());
      fd.append("Description", form.description.trim());
      fd.append("Price", String(Number(form.price)));
      fd.append("StockCount", String(Number(form.stockCount || 0)));
      fd.append("ImageUrl", form.imageUrl?.trim() || "");
      fd.append("ActiveIngredient", form.activeIngredient?.trim() || "");
      fd.append("IsPrescriptionRequired", form.isPrescriptionRequired ? "true" : "false");
      fd.append("SideEffects", form.sideEffects?.trim() || "");

      if (form.expireDate) {
        fd.append("ExpireDate", new Date(form.expireDate).toISOString());
      }

      form.categoryIds.forEach((id) => {
        fd.append("CategoryIds", String(id));
      });

      form.substituteIds.forEach((id) => {
        fd.append("SubstituteIds", String(id));
      });

      if (editItem) {
        fd.append("Id", String(editItem.id));
      }

      console.log("IS RX:", form.isPrescriptionRequired);
      console.log("FORM DATA PREVIEW:");
      for (const pair of fd.entries()) {
        console.log(pair[0], pair[1]);
      }

      if (editItem) {
        await axios.put(`${API}/api/Medicine`, fd, {
          headers: {
            ...authHeader(),
          },
        });
      } else {
        await axios.post(`${API}/api/Medicine`, fd, {
          headers: {
            ...authHeader(),
          },
        });
      }

      await fetchAll();
      closeModal();
    } catch (err) {
      console.log("MEDICINE ERROR FULL:", err);
      console.log("MEDICINE ERROR DATA:", err.response?.data);
      console.log("MEDICINE ERROR STATUS:", err.response?.status);

      const data = err.response?.data;
      let msg = "Dərman əlavə edilərkən xəta baş verdi.";

      if (typeof data === "string" && data.trim()) {
        msg = data;
      } else if (data?.message) {
        msg = data.message;
      } else if (data?.Message) {
        msg = data.Message;
      } else if (data?.ErrorMessage) {
        msg = data.ErrorMessage;
      } else if (data?.title) {
        msg = data.title;
      } else if (data?.errors && typeof data.errors === "object") {
        msg = Object.values(data.errors).flat().join(" | ");
      }

      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await axios.delete(`${API}/api/Medicine/SoftDelete/${deleteTarget.id}`, {
        headers: authHeader(),
      });
      await fetchAll();
      setDeleteTarget(null);
    } catch {
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  const getCatNames = (item) => {
    if (!item.categoryIds?.length) return null;
    return item.categoryIds.map((id) => {
      const cat = categories.find((c) => c.id === id);
      return cat ? (
        <span className="cat-tag" key={id}>
          {cat.name}
        </span>
      ) : null;
    });
  };

  const getSubstituteNames = (item) => {
    if (!item.substituteIds?.length) return null;
    return item.substituteIds.slice(0, 3).map((id) => {
      const med = data.find((m) => m.id === id);
      return med ? (
        <span className="sub-tag" key={id}>
          Əvəzedici: {med.name}
        </span>
      ) : null;
    });
  };

  const availableSubstitutes = data.filter((m) => m.id !== editItem?.id);

  return (
    <>
      <style>{styles}</style>

      <div className="pg-header">
        <div>
          <h1>
            Dərmanlar <span className="count-badge">{filtered.length}</span>
          </h1>
          <p>Dərman anbarını idarə edin</p>
        </div>
        <button className="btn-primary" onClick={openAdd}>
          ＋ Yeni Dərman
        </button>
      </div>

      <div className="toolbar">
        <div className="search-bar">
          <span style={{ color: "#B0C4D8", fontSize: 14 }}>🔍</span>
          <input
            placeholder="Dərman, aktiv maddə və ya yan təsir axtar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select className="filter-select" value={filterCat} onChange={(e) => setFilterCat(e.target.value)}>
          <option value="">Bütün kateqoriyalar</option>
          {categories.map((c) => (
            <option key={c.id} value={String(c.id)}>
              {c.name}
            </option>
          ))}
        </select>

        <select className="filter-select" value={filterRx} onChange={(e) => setFilterRx(e.target.value)}>
          <option value="">Hamısı</option>
          <option value="1">Resept tələb olunur</option>
          <option value="0">Reseptsiz</option>
        </select>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: "#5D8AA8", fontSize: 14 }}>
          ⏳ Yüklənir...
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="ei">💊</div>
          <h3>Dərman tapılmadı</h3>
          <p>Yeni dərman əlavə etmək üçün yuxarıdakı düyməyə klikləyin</p>
        </div>
      ) : (
        <div className="table-card">
          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Dərman</th>
                  <th>Qiymət</th>
                  <th>Stok</th>
                  <th>Kateqoriya</th>
                  <th>Resept</th>
                  <th>Əvəzedicilər</th>
                  <th>Son istifadə</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item, i) => {
                  const st = stockStatus(item.stockCount);
                  return (
                    <tr key={item.id}>
                      <td style={{ color: "#8DAFC4", fontWeight: 600, fontSize: 12 }}>{i + 1}</td>
                      <td>
                        <div className="med-name">{item.name}</div>
                        {item.activeIngredient && (
                          <div className="med-ingredient">{item.activeIngredient}</div>
                        )}
                        {item.sideEffects && (
                          <div className="med-sidefx">Yan təsirlər: {item.sideEffects}</div>
                        )}
                      </td>
                      <td>
                        <span className="price-val">{item.price} ₼</span>
                      </td>
                      <td>
                        <span className={`stock-badge ${st.cls}`}>{st.label}</span>
                      </td>
                      <td>{getCatNames(item)}</td>
                      <td>
                        <span className={`rx-badge ${item.isPrescriptionRequired ? "rx-yes" : "rx-no"}`}>
                          {item.isPrescriptionRequired ? "📋 Tələb olunur" : "✅ Reseptsiz"}
                        </span>
                      </td>
                      <td>{getSubstituteNames(item)}</td>
                      <td style={{ color: "#5D8AA8", fontSize: 12 }}>
                        {item.expireDate ? new Date(item.expireDate).toLocaleDateString("az-AZ") : "—"}
                      </td>
                      <td>
                        <div className="action-btns">
                          <button className="btn-sm-edit" onClick={() => openEdit(item)}>
                            ✏️
                          </button>
                          <button className="btn-sm-del" onClick={() => setDeleteTarget(item)}>
                            🗑
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modal && (
        <div className="overlay" onClick={(e) => e.target === e.currentTarget && closeModal()}>
          <div className="modal">
            <div className="modal-head">
              <div className="modal-title">{editItem ? "✏️ Dərmanı Redaktə Et" : "＋ Yeni Dərman"}</div>
              <button className="modal-x" onClick={closeModal}>
                ✕
              </button>
            </div>

            <div className="modal-body">
              {error && <div className="err-msg">⚠️ {error}</div>}

              <div className="fg">
                <label className="fl">Dərman adı *</label>
                <input
                  className="fi"
                  placeholder="Məs: Amoksisilin 500mg"
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  autoFocus
                />
              </div>

              <div className="fg">
                <label className="fl">Açıqlama</label>
                <textarea
                  className="fi"
                  rows={2}
                  placeholder="Dərman haqqında məlumat..."
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                />
              </div>

              <div className="form-row-3">
                <div className="fg">
                  <label className="fl">Qiymət (₼) *</label>
                  <input
                    className="fi"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={form.price}
                    onChange={(e) => set("price", e.target.value)}
                  />
                </div>

                <div className="fg">
                  <label className="fl">Stok miqdarı</label>
                  <input
                    className="fi"
                    type="number"
                    placeholder="0"
                    value={form.stockCount}
                    onChange={(e) => set("stockCount", e.target.value)}
                  />
                </div>

                <div className="fg">
                  <label className="fl">Son istifadə tarixi</label>
                  <input
                    className="fi"
                    type="date"
                    value={form.expireDate}
                    onChange={(e) => set("expireDate", e.target.value)}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="fg">
                  <label className="fl">Aktiv maddə</label>
                  <input
                    className="fi"
                    placeholder="Məs: Amoxicillin"
                    value={form.activeIngredient}
                    onChange={(e) => set("activeIngredient", e.target.value)}
                  />
                </div>

                <div className="fg">
                  <label className="fl">Şəkil URL</label>
                  <input
                    className="fi"
                    placeholder="https://..."
                    value={form.imageUrl}
                    onChange={(e) => set("imageUrl", e.target.value)}
                  />
                </div>
              </div>

              <div className="fg">
                <label className="fl">Yan təsirlər</label>
                <textarea
                  className="fi"
                  rows={3}
                  placeholder="Məs: Ürəkbulanma, başgicəllənmə, allergik səpgilər"
                  value={form.sideEffects}
                  onChange={(e) => set("sideEffects", e.target.value)}
                />
              </div>

              <div className="fg">
                <label className="fl">Kateqoriyalar</label>
                <div className="cat-multi">
                  {categories.map((c) => (
                    <div
                      key={c.id}
                      className={`cat-check ${form.categoryIds.includes(c.id) ? "checked" : ""}`}
                      onClick={() => toggleCat(c.id)}
                    >
                      {form.categoryIds.includes(c.id) ? "✓ " : ""}
                      {c.name}
                    </div>
                  ))}
                </div>
              </div>

              <div className="fg">
                <label className="fl">Əvəzedici dərmanlar</label>
                <div className="subs-multi">
                  {availableSubstitutes.slice(0, 20).map((m) => (
                    <div
                      key={m.id}
                      className={`subs-check ${form.substituteIds.includes(m.id) ? "checked" : ""}`}
                      onClick={() => toggleSubstitute(m.id)}
                    >
                      {form.substituteIds.includes(m.id) ? "✓ " : ""}
                      {m.name}
                    </div>
                  ))}
                </div>
              </div>

              <div className="fg">
                <label className="fl">Resept tələbi</label>
                <div className="toggle-wrap">
                  <button
                    type="button"
                    className={`toggle ${form.isPrescriptionRequired ? "on" : ""}`}
                    onClick={() => set("isPrescriptionRequired", !form.isPrescriptionRequired)}
                  />
                  <span className="toggle-label">
                    {form.isPrescriptionRequired ? "📋 Resept tələb olunur" : "✅ Reseptsiz satılır"}
                  </span>
                </div>
              </div>
            </div>

            <div className="modal-foot">
              <button className="btn-cancel" onClick={closeModal}>
                Ləğv et
              </button>
              <button className="btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? (
                  <>
                    <span className="spin" /> Saxlanır...
                  </>
                ) : editItem ? (
                  "Yenilə"
                ) : (
                  "Əlavə et"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="overlay" onClick={(e) => e.target === e.currentTarget && setDeleteTarget(null)}>
          <div className="confirm-box">
            <div className="ci">🗑️</div>
            <h3>Silinsin?</h3>
            <p>
              <strong>"{deleteTarget.name}"</strong> silinəcək.
              <br />
              Bu əməliyyat geri alına bilər.
            </p>
            <div className="confirm-btns">
              <button className="btn-cancel" style={{ flex: 1 }} onClick={() => setDeleteTarget(null)}>
                Ləğv et
              </button>
              <button className="btn-del-confirm" onClick={handleDelete} disabled={deleting}>
                {deleting ? <span className="spin" /> : "Sil"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}