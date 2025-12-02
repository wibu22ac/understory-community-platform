# Understory Community Platform

Understory Community Platform er en prototype på et digitalt community-univers udviklet som led i faget *Computernetværk og Distribuerede Systemer* på CBS. Projektet demonstrerer, hvordan en moderne webapplikation kan bygges med et klart skel mellem klient, backend og database, samtidig med at centrale netværksprincipper implementeres i praksis.

## Funktionalitet

- Oprettelse af bruger
- Login med session-håndtering
- Velkomstmail til nye brugere
- SMS-besked ved brugeroprettelse (Twilio-integration)
- Adskilt frontend og backend
- Database koblet på gennem SQL (DataGrip-projekt)
- Sikker kommunikation over HTTPS (TLS)

## Teknologier

### **Frontend**
- React
- TypeScript
- Fetch API til HTTP-anmodninger
- Cookie-baseret sessionhåndtering

### **Backend**
- TypeScript  
- Node.js  
- Express  
- Sessions og cookies  
- Twilio (SMS)
- Nodemailer (mail)

### **Database**
- Relationsdatabase (SQL)
- Bruger-tabeller og community-data

### **Hosting**
- DigitalOcean droplet (selvfinansieret)
- Domæne: understorycommunity.dk  
- HTTPS med TLS-certifikat

## Netværksaspekter

Projektet er udviklet specifikt for at demonstrere netværkslagene i praksis:

- **DNS:** Opslag af domæne → IP ved hver forespørgsel  
- **TCP:** Trevejs håndtryk mellem klient og server  
- **TLS:** Krypteret kanal etableret før dataoverførsel  
- **HTTP:** GET og POST-anmodninger i JSON-format  
- **RTT-måling:** Forbindelsesforsinkelse mellem Danmark og datacenter i Frankfurt

Alle relevante Wireshark-målinger fremgår af bilag i den tilhørende rapport.

## Twilio & Mail

Ved oprettelse af en ny bruger udføres to automatiske handlinger:

- En **SMS** sendes via Twilio som kvittering for oprettelsen  
- En **e-mail** sendes som velkomstbesked  

Begge services er konfigureret gennem selvfinansierede udviklingskonti.

## 🔧 Installation & Opsætning

1. Klon projektet:
   ```bash
   git clone https://github.com/wibu22ac/understory-community-platform


cd FrontEnd
npm install

cd ../BackEnd
npm install


Start frontend:
npm run dev

Start backend:
npm run start


