<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.md">English</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/dogfood-labs/readme.png" width="400" alt="dogfood-labs" />
</p>

<p align="center">
  <a href="https://github.com/mcp-tool-shop-org/dogfood-labs/actions/workflows/dogfood.yml"><img src="https://github.com/mcp-tool-shop-org/dogfood-labs/actions/workflows/dogfood.yml/badge.svg" alt="CI" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT License" /></a>
  <a href="https://mcp-tool-shop-org.github.io/dogfood-labs/"><img src="https://img.shields.io/badge/Landing_Page-live-brightgreen" alt="Landing Page" /></a>
</p>

सेंट्रलाइज्ड डॉगफूड एविडेंस सिस्टम, mcp-tool-shop-org के लिए।

यह प्रमाणित करता है, ऑडिट योग्य सबूतों के साथ, कि प्रत्येक रिपॉजिटरी को वास्तव में "डॉगफूड" के योग्य तरीके से उपयोग किया गया है। यह संगठन में इस स्थिति को जांचने योग्य बनाता है।

## कवरेज

8 उत्पाद क्षेत्रों में 13 रिपॉजिटरी, सभी सत्यापित, सभी का अनुपालन अनिवार्य है।

| क्षेत्र | रिपॉजिटरी |
|---------|-------|
| cli | shipcheck, ai-loadout, tool-scan, zip-meta-map, code-batch |
| डेस्कटॉप | glyphstudio |
| mcp-server | claude-guardian, repo-crawler-mcp |
| एपीआई | vocal-synth-engine |
| npm-package | site-theme |
| लाइब्रेरी | voice-soundboard |
| वेब | a11y-demo-site |
| प्लगइन | polyglot-vscode |

## आर्किटेक्चर

- **सोर्स रिपॉजिटरी** परिदृश्यों को परिभाषित करते हैं (`dogfood/scenarios/*.yaml`) और डॉगफूड वर्कफ़्लो चलाते हैं।
- **सोर्स वर्कफ़्लो** `repository_dispatch` के माध्यम से संरचित डेटा भेजते हैं।
- **सेंट्रल वेरीफायर** स्कीमा, उत्पत्ति (GitHub API) और नीति अनुपालन को मान्य करता है।
- **स्वीकृत रिकॉर्ड** `records/<org>/<repo>/YYYY/MM/DD/` में संग्रहीत होते हैं।
- **अस्वीकृत रिकॉर्ड** मशीन-पठनीय कारणों के साथ `records/_rejected/` में संग्रहीत होते हैं।
- **उत्पन्न इंडेक्स** इतिहास को स्कैन किए बिना तेज़ खोज प्रदान करते हैं।

## अनुबंध

उत्पाद को तीन अनुबंधों द्वारा परिभाषित किया गया है:

| अनुबंध | यह क्या परिभाषित करता है | स्कीमा |
|----------|----------------|--------|
| [Record](docs/record-contract.md) | एक डॉगफूड रन कैसा दिखता है | `schemas/dogfood-record.schema.json` |
| [Scenario](docs/scenario-contract.md) | एक वास्तविक डॉगफूड अभ्यास क्या है | `schemas/scenario.schema.json` |
| [Policy](docs/policy-contract.md) | वेरीफायर द्वारा लागू किए जाने वाले नियम | `schemas/policy.schema.json` |

## अनुपालन स्तर

| मोड | व्यवहार | कब उपयोग करें |
|------|----------|-------------|
| `required` | उल्लंघन होने पर विफल | सभी रिपॉजिटरी के लिए डिफ़ॉल्ट |
| `warn-only` | चेतावनी दें लेकिन ब्लॉक न करें | नए रिपॉजिटरी, जिसमें प्रलेखित कारण और समीक्षा तिथि हो |
| `exempt` | मूल्यांकन छोड़ें | रिपॉजिटरी जिसमें कारण और समीक्षा तिथि हो |

विस्तृत जानकारी के लिए, [enforcement-tiers.md](docs/enforcement-tiers.md) देखें।

## एकीकरण

| सिस्टम | भूमिका |
|--------|------|
| dogfood-labs | प्रामाणिक लेखन भंडार + नीति प्राधिकरण |
| shipcheck | अनुपालन उपभोक्ता (गेट एफ) |
| repo-knowledge | क्वेरी/इंडेक्स मिरर (SQLite रीड मॉडल) |
| org ऑडिट | पोर्टफोलियो उपभोक्ता |

## सत्यापित करें

```bash
bash verify.sh
```

वेरीफायर, इंजेक्शन, रिपोर्टिंग और पोर्टफोलियो टूल (76+ परीक्षण) में सभी परीक्षण चलाता है।

## रिपॉजिटरी लेआउट

```
dogfood-labs/
├─ schemas/                          # JSON Schema contracts
├─ records/                          # Accepted records (sharded)
│  └─ _rejected/                     # Rejected records
├─ indexes/                          # Generated read indexes
├─ policies/
│  ├─ global-policy.yaml
│  └─ repos/<org>/<repo>.yaml        # Per-repo policies
├─ tools/
│  ├─ ingest/                        # Central ingestion pipeline
│  ├─ verify/                        # Verifier
│  ├─ report/                        # Submission builder
│  └─ portfolio/                     # Portfolio generator
├─ reports/                          # Generated reports
├─ docs/                             # Contract + operating docs
└─ dogfood/                          # Self-dogfood scenario
```

## ट्रस्ट मॉडल

**डेटा जिस पर कार्रवाई की जाती है:** सोर्स रिपॉजिटरी से डॉगफूड सबमिशन पेलोड (JSON), नीति YAML फ़ाइलें, उत्पन्न रिकॉर्ड और इंडेक्स फ़ाइलें। सभी डेटा Git में संग्रहीत है - कोई बाहरी डेटाबेस नहीं।

**डेटा जिस पर कार्रवाई नहीं की जाती है:** उपयोगकर्ता क्रेडेंशियल, प्रमाणीकरण टोकन (GitHub द्वारा प्रबंधित CI रहस्यों के अलावा), बाहरी एपीआई (GitHub Actions API के अलावा `repository_dispatch` के लिए), व्यक्तिगत डेटा, टेलीमेट्री, एनालिटिक्स।

**अनुमतियाँ:** इंजेक्शन बॉट द्वारा स्वीकृत रिकॉर्ड को कमिट करने के लिए GitHub Actions वर्कफ़्लो को `contents: write` की आवश्यकता होती है। सोर्स रिपॉजिटरी को डिस्पैच के लिए `DOGFOOD_TOKEN` नामक एक गुप्त कुंजी की आवश्यकता होती है। कोई अन्य उन्नत अनुमतियाँ नहीं।

**कोई टेलीमेट्री नहीं।** कोई एनालिटिक्स नहीं। GitHub API के अलावा कोई नेटवर्क कॉल नहीं।

## ऑपरेटिंग कैडेंस

- **साप्ताहिक:** ताज़ा जानकारी की समीक्षा - 14 दिनों से पुराने रिपॉजिटरी को चिह्नित करें, 30 दिनों से अधिक होने पर उल्लंघन।
- **मासिक:** नीति का समायोजन - प्रचार के लिए वार्निंग-ओनली/एक्सेंप्ट की समीक्षा करें।
- **विफलता की स्थिति में:** मूल कारण की जांच करें, केवल वास्तविक समस्याओं से ही नीति को अपडेट करें।
- **नए रिपॉजिटरी:** डिफ़ॉल्ट रूप से आवश्यक, किसी भी कमजोर स्तर के लिए कारण का दस्तावेजीकरण करें।

विस्तृत जानकारी के लिए, [operating-cadence.md](docs/operating-cadence.md) देखें।

## सिद्धांत

रोलआउट सिद्धांत में विस्तार के दौरान वास्तविक विफलताओं से सीखे गए 10 नियम शामिल हैं। [rollout-doctrine.md](docs/rollout-doctrine.md) देखें।

---

यह <a href="https://mcp-tool-shop.github.io/">MCP Tool Shop</a> द्वारा बनाया गया है।
