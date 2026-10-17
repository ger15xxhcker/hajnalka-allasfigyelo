# 🎯 Hajnalka Állásfigyelő & Tanuló Karrier Asszisztens

Egy automatizált, intelligens álláskereső és tanuló rendszer **Purczeld Hajnalka** számára, amely a csatolt szakmai önéletrajza alapján fésüli át a magyar állásportálokat, kiszámítja az illeszkedést, e-mail értesítést küld a releváns állásokról, és **minden egyes elutasítás indoklásából tanulva azonnal finomhangolja a keresési algoritmusát**.

A teljes rendszer **100%-ban ingyenes Cloudflare tárhelyen (Cloudflare Pages + D1 SQLite adatbázis)** futtatható.

---

## 🌟 Főbb Funkciók

1. **Önéletrajz alapú pontos profilillesztés**:
   - **Jelölt**: Purczeld Hajnalka (`purczeld.hajnalka@gmail.com`)
   - **Szakterület**: 4+ év projektpénzügyi referens, **EPTK-rendszer haladó szint**, EU-s támogatások és kifizetési kérelmek elszámolása, kontírozás, szállítói számlák.
   - **Végzettség**: Pénzügy és számvitel BSc (MATE Gyöngyös • 2026), OKJ Pénzügyi-számviteli ügyintéző (Hatvan • 2017).
   - **Bázisállomás & Körzet**: **Hatvan és 100 km-es vonzáskörzete** (Budapest M3 / Kelet-Pest, Gödöllő, Gyöngyös, Jászberény, Vác, Eger) + **100% Távmunka / Home Office**.
   - **Bérigény**: Bruttó 700.000 Ft.
   - **Nyelvtudás**: Alapszintű angol (a rendszer automatikusan lepontozza a szigorú C1/tárgyalási szintű angol elvárásokat).

2. **Többportálos automatikus álláskereső (Scraper)**:
   - Közvetlenül és megbízhatóan monitorozza a legfontosabb magyar portálokat:
     - **Profession.hu**: Strukturált adatbázis-szintű kinyerés (`dataLayer` ecommerce feed).
     - **Közigállás / Közszféra**: Kifejezetten az egyetemi (pl. MATE Gyöngyös, ELTE), kutatóintézeti (HUN-REN), államigazgatási (KSH, NKFIH) és nonprofit (Máltai, Vöröskereszt) EPTK-s projektállásokra.
     - **Dreamjo.bs & Jobinfo.hu & AllasOrias**: Hibrid és távmunkás pénzügyi ajánlatok.

3. **Tanuló Algoritmus (Visszajelzés alapú finomhangolás)**:
   - A felületen minden álláskártyán két fő gomb található:
     - 🟢 **„Elvileg jó lehet”**: Egy kattintással a mentett listába teszi, növeli a hasonló kulcsszavak és cégek súlyát.
     - 🔴 **„Elutasítás”**: Megnyit egy visszajelző modális ablakot, ahol Hajnalka kiválaszthat egy gyors kategóriát (pl. *Túl messze van / Nincs HO*, *Kevés a fizetés*, *Túl sok az angol*, *Nem vág a profilba*), és egy **szabad szöveges mezőbe saját szavaival leírhatja, miért nem jó**.
   - **Azonnali tanulás**: A rendszer a megadott indoklásból automatikusan új negatív mintákat és pontlevonási szabályokat hoz létre, és **azonnal újraszámolja az összes többi és a jövőbeli állás egyezési pontszámát**!
   - **🧠 Tanulási Központ fül**: Teljes átláthatóság – Hajnalka bármikor láthatja, módosíthatja, ki/bekapcsolhatja vagy törölheti a rendszer által megtanult szabályokat.

4. **Automatikus E-mail Értesítő & 1-kattintásos Link**:
   - A rendszer időzítve vagy gombnyomásra egy összefoglaló, reszponzív HTML e-mailt készít a legrelevánsabb állásokról.
   - Az e-mailben szerepel a közvetlen link a webes felületre, ahol Hajnalka egyetlen érintéssel értékelheti az ajánlatokat mobilról vagy számítógépről.
   - Ingyenes **Resend** integráció (havi 3000 e-mail teljesen ingyen) vagy szimulált előnézet.

---

## 🚀 Helyi Futtatás (Windows)

1. Nyiss egy terminált vagy kattints duplán az `INDITAS.cmd` fájlra:
   ```powershell
   pnpm dev
   ```
2. Nyisd meg a böngésződben a megjelenő címet:
   `http://localhost:5175`

---

## ☁️ Cloudflare Ingyenes Tárhelyre Telepítés

A projekt kifejezetten a Cloudflare ingyenes infrastruktúrájára (Cloudflare Pages + D1 SQLite) készült.

### 1. Build készítése
```powershell
pnpm build
```

### 2. Cloudflare D1 adatbázis létrehozása (Ingyenes)
```powershell
npx wrangler d1 create hajnalka_jobs_db
```
A parancs kiír egy `database_id`-t. Másold be a `wrangler.jsonc` fájlba a `database_id` helyére!

Futtasd le a séma inicializálását:
```powershell
npx wrangler d1 execute hajnalka_jobs_db --file=./d1_schema.sql
```

### 3. Telepítés Cloudflare Pages-re
```powershell
npx wrangler pages deploy ./dist --project-name=hajnalka-allasfigyelo
```
Néhány másodperc múlva kapsz egy ingyenes, biztonságos HTTPS címet (pl. `https://hajnalka-allasfigyelo.pages.dev`), amit közvetlenül átküldhetsz a tesódnak!

---

## ⏰ Napi Automatikus Ütemezés (Cron)

A Cloudflare ingyenes fiókjában beállítható egy Scheduled Worker vagy egy ingyenes külső ütemező (pl. GitHub Actions vagy [cron-job.org](https://cron-job.org)), ami minden reggel 08:00-kor meghívja az endpointot:
```http
POST https://hajnalka-allasfigyelo.pages.dev/api/scrape
POST https://hajnalka-allasfigyelo.pages.dev/api/send-email
```
Így Hajnalka minden reggel automatikusan megkapja az új ajánlatokat anélkül, hogy neked kézzel kellene bármit indítanod!
