# ההצלחות שלנו — איך להוסיף פרויקט

## 1. הוסף תמונה
שמור צילום מסך של האתר בתיקייה הזאת.
יחס מומלץ: **16:10** (למשל 1280×800 או 1600×1000).
פורמט: `.jpg` / `.png` / `.webp`.

לדוגמה: `works/acme.jpg`

## 2. הוסף בלוק HTML
פתח את `index.html`, מצא את הסקשן `<!-- WORKS -->`,
והעתק בלוק אחד של `<a class="work">` כמו דוגמה:

```html
<a class="work" href="https://acme.co.il" target="_blank" rel="noopener">
  <div class="work__frame">
    <img class="work__shot" src="works/acme.jpg" alt="ACME" loading="lazy" />
    <span class="work__ext" aria-hidden="true">↗</span>
  </div>
  <div class="work__meta">
    <h3 class="work__title">ACME</h3>
    <p class="work__domain">acme.co.il</p>
  </div>
</a>
```

עדכן:
- `href` — הלינק לאתר החי
- `src` — הנתיב לצילום המסך
- `alt` + `work__title` — שם הפרויקט
- `work__domain` — הדומיין המוצג

זהו. אין JS, אין קונפיג — רק HTML.
