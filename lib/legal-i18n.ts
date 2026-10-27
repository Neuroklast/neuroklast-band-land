export const LEGAL_LOCALES = ['en', 'de', 'uk', 'it', 'es', 'pt', 'ja', 'ko'] as const
export type LegalLocale = (typeof LEGAL_LOCALES)[number]

export const NOTICE_DOC_TITLE: Record<LegalLocale, string> = {
  en: 'Legal Notice',
  de: 'Impressum',
  uk: 'Правова інформація',
  it: 'Note legali',
  es: 'Aviso legal',
  pt: 'Aviso legal',
  ja: '特定商取引・運営者情報',
  ko: '법적 고지',
}

export const PRIVACY_DOC_TITLE: Record<LegalLocale, string> = {
  en: 'Privacy Policy',
  de: 'Datenschutzerklärung',
  uk: 'Політика конфіденційності',
  it: 'Informativa sulla privacy',
  es: 'Política de privacidad',
  pt: 'Política de privacidade',
  ja: 'プライバシーポリシー',
  ko: '개인정보 처리방침',
}

export const NOTICE_STREAM: Record<LegalLocale, string> = {
  en: '// LEGAL.INFORMATION',
  de: '// IMPRESSUM',
  uk: '// LEGAL.NOTICE',
  it: '// NOTE.LEGALI',
  es: '// AVISO.LEGAL',
  pt: '// AVISO.LEGAL',
  ja: '// LEGAL.NOTICE',
  ko: '// LEGAL.NOTICE',
}

export const PRIVACY_STREAM: Record<LegalLocale, string> = {
  en: '// PRIVACY.POLICY',
  de: '// DATENSCHUTZ',
  uk: '// PRIVACY.POLICY',
  it: '// PRIVACY',
  es: '// PRIVACIDAD',
  pt: '// PRIVACIDADE',
  ja: '// PRIVACY.POLICY',
  ko: '// PRIVACY.POLICY',
}

export const INCOMPLETE_NOTICE: Record<LegalLocale, string> = {
  en: 'Notice: Required operator details are incomplete. Please complete them under Admin → Legal & Privacy.',
  de: 'Hinweis: Pflichtangaben im Impressum sind noch unvollständig. Bitte im Admin unter Legal & Privacy ergänzen.',
  uk: 'Увага: обовʼязкові дані оператора неповні. Доповніть їх у Admin → Legal & Privacy.',
  it: 'Avviso: i dati obbligatori dell’operatore sono incompleti. Completali in Admin → Legal & Privacy.',
  es: 'Aviso: faltan datos obligatorios del operador. Complétalos en Admin → Legal & Privacy.',
  pt: 'Aviso: os dados obrigatórios do operador estão incompletos. Complete-os em Admin → Legal & Privacy.',
  ja: '注意: 運営者の必須情報が未記入です。Admin → Legal & Privacy で入力してください。',
  ko: '안내: 운영자 필수 정보가 불완전합니다. Admin → Legal & Privacy에서 입력하세요.'
}

export const FIELD_LABEL: Record<LegalLocale, { phone: string; email: string; vat: string; postal: string; configureOperator: string; configureResponsible: string }> = {
  en: { phone: 'Phone', email: 'Email', vat: 'VAT ID', postal: 'Postal address', configureOperator: 'Please configure operator details in the admin panel under Legal & Privacy.', configureResponsible: 'Please configure the responsible person in the admin panel.' },
  de: { phone: 'Telefon', email: 'E-Mail', vat: 'USt-IdNr.', postal: 'Postanschrift', configureOperator: 'Bitte vervollständigen Sie die Betreiberangaben im Admin unter Legal & Privacy.', configureResponsible: 'Bitte verantwortliche Person im Admin hinterlegen.' },
  uk: { phone: 'Телефон', email: 'Електронна пошта', vat: 'ІПН / VAT', postal: 'Поштова адреса', configureOperator: 'Будь ласка, заповніть дані оператора в Admin → Legal & Privacy.', configureResponsible: 'Будь ласка, вкажіть відповідальну особу в адмінці.' },
  it: { phone: 'Telefono', email: 'E-mail', vat: 'P. IVA', postal: 'Indirizzo postale', configureOperator: 'Completa i dati dell’operatore in Admin → Legal & Privacy.', configureResponsible: 'Indica la persona responsabile nel pannello admin.' },
  es: { phone: 'Teléfono', email: 'Correo', vat: 'NIF / IVA', postal: 'Dirección postal', configureOperator: 'Completa los datos del operador en Admin → Legal & Privacy.', configureResponsible: 'Configura la persona responsable en el panel de admin.' },
  pt: { phone: 'Telefone', email: 'E-mail', vat: 'NIF / IVA', postal: 'Morada', configureOperator: 'Preencha os dados do operador em Admin → Legal & Privacy.', configureResponsible: 'Indique a pessoa responsável no painel de admin.' },
  ja: { phone: '電話', email: 'メール', vat: 'VAT番号', postal: '所在地', configureOperator: 'Admin → Legal & Privacy で運営者情報を入力してください。', configureResponsible: '管理画面で責任者を設定してください。' },
  ko: { phone: '전화', email: '이메일', vat: '부가세 ID', postal: '우편 주소', configureOperator: 'Admin → Legal & Privacy에서 운영자 정보를 입력하세요.', configureResponsible: '관리자 화면에서 책임자를 설정하세요.' },
}

export interface LegalCopySection {
  title: string
  paragraphs: string[]
}

export const NOTICE_COPY: Record<LegalLocale, Record<string, LegalCopySection>> = {
  en: {
    operator: { title: 'Information pursuant to § 5 DDG (Digital Services Act)', paragraphs: [] },
    responsible: { title: 'Responsible for editorial content pursuant to § 18 (2) MStV', paragraphs: [] },
    dispute: {
      title: 'Consumer dispute resolution',
      paragraphs: [
        'We are not willing or obliged to participate in dispute resolution proceedings before a consumer arbitration board.',
      ],
    },
    copyright: {
      title: 'Copyright',
      paragraphs: [
        'The content and works on these pages created by the site operators are subject to German copyright law. Duplication, processing, distribution, and any form of exploitation beyond the scope of copyright law require the written consent of the respective author or creator.',
        'Downloads and copies of this page are only permitted for private, non-commercial use. Where content on this site was not created by the operator, third-party copyrights are respected and marked accordingly.',
        'Further information on data processing is available in our Privacy Policy (/privacy-policy).',
      ],
    },
  },
  de: {
    operator: { title: 'Angaben gemäß § 5 DDG (Digitale-Dienste-Gesetz)', paragraphs: [] },
    responsible: { title: 'Verantwortlich für journalistisch-redaktionelle Inhalte gemäß § 18 Abs. 2 MStV', paragraphs: [] },
    dispute: {
      title: 'Verbraucherstreitbeilegung',
      paragraphs: [
        'Wir sind nicht bereit und nicht verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.',
      ],
    },
    copyright: {
      title: 'Urheberrecht',
      paragraphs: [
        'Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.',
        'Downloads und Kopien dieser Seite sind nur für den privaten, nicht kommerziellen Gebrauch gestattet. Soweit die Inhalte auf dieser Seite nicht vom Betreiber erstellt wurden, werden die Urheberrechte Dritter beachtet und entsprechend gekennzeichnet.',
        'Weitere Hinweise zur Datenverarbeitung finden Sie in der Datenschutzerklärung (/privacy-policy).',
      ],
    },
  },
  uk: {
    operator: { title: 'Відомості згідно з § 5 DDG (закон Німеччини про цифрові послуги)', paragraphs: [] },
    responsible: { title: 'Відповідальний за редакційний контент згідно з § 18 (2) MStV', paragraphs: [] },
    dispute: {
      title: 'Вирішення спорів в ЄС',
      paragraphs: [
        'Ми не зобов’язані і не згодні брати участь у процедурах вирішення спорів перед споживчим арбітражем.',
      ],
    },
    copyright: {
      title: 'Авторське право',
      paragraphs: [
        'Контент і твори, створені операторами цього сайту, охороняються німецьким авторським правом. Відтворення, обробка, поширення та будь-яке використання поза межами авторського права потребують письмової згоди автора.',
        'Завантаження та копії цієї сторінки дозволені лише для приватного некомерційного використання. Контент третіх осіб позначено відповідно.',
        'Додаткова інформація про обробку даних — у Політиці конфіденційності (/privacy-policy).',
      ],
    },
  },
  it: {
    operator: { title: 'Informazioni ai sensi del § 5 DDG (legge tedesca sui servizi digitali)', paragraphs: [] },
    responsible: { title: 'Responsabile dei contenuti editoriali ai sensi del § 18 (2) MStV', paragraphs: [] },
    dispute: {
      title: 'Risoluzione delle controversie UE',
      paragraphs: [
        'Non siamo obbligati né disponibili a partecipare a procedimenti dinanzi a un organismo di conciliazione dei consumatori.',
      ],
    },
    copyright: {
      title: 'Diritto d’autore',
      paragraphs: [
        'I contenuti e le opere creati dagli operatori del sito sono tutelati dal diritto d’autore tedesco. Riproduzione, elaborazione, distribuzione e ogni sfruttamento oltre i limiti di legge richiedono il consenso scritto dell’autore.',
        'Download e copie di questa pagina sono consentiti solo per uso privato non commerciale. I diritti di terzi sono rispettati e segnalati.',
        'Ulteriori informazioni sul trattamento dei dati sono nella Informativa sulla privacy (/privacy-policy).',
      ],
    },
  },
  es: {
    operator: { title: 'Información conforme al § 5 DDG (Ley alemana de servicios digitales)', paragraphs: [] },
    responsible: { title: 'Responsable del contenido editorial conforme al § 18 (2) MStV', paragraphs: [] },
    dispute: {
      title: 'Resolución de litigios de la UE',
      paragraphs: [
        'No estamos dispuestos ni obligados a participar en procedimientos ante una junta arbitral de consumo.',
      ],
    },
    copyright: {
      title: 'Derechos de autor',
      paragraphs: [
        'Los contenidos y obras creados por los operadores de este sitio están sujetos al derecho de autor alemán. La reproducción, el tratamiento, la distribución y cualquier explotación más allá de la ley requieren el consentimiento escrito del autor.',
        'Las descargas y copias de esta página solo se permiten para uso privado no comercial. Se respetan y marcan los derechos de terceros.',
        'Más información sobre el tratamiento de datos en la Política de privacidad (/privacy-policy).',
      ],
    },
  },
  pt: {
    operator: { title: 'Informações nos termos do § 5 DDG (lei alemã de serviços digitais)', paragraphs: [] },
    responsible: { title: 'Responsável pelo conteúdo editorial nos termos do § 18 (2) MStV', paragraphs: [] },
    dispute: {
      title: 'Resolução de litígios da UE',
      paragraphs: [
        'Não estamos dispostos nem obrigados a participar em processos perante um centro de arbitragem de consumo.',
      ],
    },
    copyright: {
      title: 'Direitos de autor',
      paragraphs: [
        'Os conteúdos e obras criados pelos operadores deste sítio estão sujeitos ao direito de autor alemão. A reprodução, o tratamento, a distribuição e qualquer exploração para além da lei exigem o consentimento escrito do autor.',
        'Transferências e cópias desta página só são permitidas para uso privado não comercial. Os direitos de terceiros são respeitados e assinalados.',
        'Mais informações sobre o tratamento de dados na Política de privacidade (/privacy-policy).',
      ],
    },
  },
  ja: {
    operator: { title: 'ドイツデジタルサービス法（DDG）第5条に基づく情報', paragraphs: [] },
    responsible: { title: 'MStV 第18条第2項に基づく編集責任者', paragraphs: [] },
    dispute: {
      title: 'EUにおける紛争解決',
      paragraphs: [
        '消費者仲裁機関における紛争解決手続に参加する意思も義務もありません。',
      ],
    },
    copyright: {
      title: '著作権',
      paragraphs: [
        'サイト運営者が作成したコンテンツおよび著作物はドイツ著作権法の対象です。複製、改変、頒布および著作権法の範囲を超える利用には、各著作者の書面による同意が必要です。',
        '本ページのダウンロードおよびコピーは私的かつ非営利の利用に限り許可されます。第三者の著作権は尊重し、適切に表示します。',
        'データ処理の詳細はプライバシーポリシー（/privacy-policy）をご覧ください。',
      ],
    },
  },
  ko: {
    operator: { title: '독일 디지털서비스법(DDG) 제5조에 따른 정보', paragraphs: [] },
    responsible: { title: 'MStV 제18조 제2항에 따른 편집 책임자', paragraphs: [] },
    dispute: {
      title: 'EU 분쟁 해결',
      paragraphs: [
        '소비자 중재 기구의 분쟁 해결 절차에 참여할 의사나 의무가 없습니다.',
      ],
    },
    copyright: {
      title: '저작권',
      paragraphs: [
        '사이트 운영자가 작성한 콘텐츠와 저작물은 독일 저작권법의 적용을 받습니다. 복제, 가공, 배포 및 저작권법 범위를 넘는 이용에는 해당 저작자의 서면 동의가 필요합니다.',
        '이 페이지의 다운로드와 복사는 사적·비상업적 용도로만 허용됩니다. 제3자 저작권은 존중되며 표시됩니다.',
        '데이터 처리에 관한 추가 정보는 개인정보 처리방침(/privacy-policy)을 참조하세요.',
      ],
    },
  },
}

export const PRIVACY_COPY: Record<LegalLocale, Record<string, LegalCopySection>> = {
  en: {
    overview: {
      title: '1. Data protection at a glance',
      paragraphs: [
        'The following information provides a simple overview of what happens to your personal data when you visit this website. Personal data is any data that can be used to identify you personally.',
        'Data processing on this website is carried out by the website operator: {controller}.',
        'Some data is collected because you provide it to us (e.g. contact form). Other data is recorded automatically by our IT systems when you visit the website (e.g. browser type, operating system, or time of access).',
        'Optional analytics are only collected if you explicitly consent via the cookie banner. No third-party advertising or tracking cookies are used.',
      ],
    },
    hosting: {
      title: '2. Hosting and infrastructure',
      paragraphs: [
        "Our website is delivered through Vercel. To show the pages and protect the service, connection details such as your IP address and the time of access are processed. This is based on our legitimate interest in operating a secure website (Art. 6(1)(f) GDPR). Vercel privacy information: https://vercel.com/legal/privacy-policy.",
        "We use Supabase for customer accounts, software licences and website data. Its main database is located in the United Kingdom. Cloudflare delivers some images and software downloads. Resend sends our contact and purchase emails. These providers receive only the data required for the respective service. More information about transfers abroad is provided below.",
      ],
    },
    controller: {
      title: '3. Data controller and general information',
      paragraphs: [
        'The data controller for this website is: {controller}.',
        'We process personal data in accordance with the GDPR, the German BDSG, and the TDDDG (Telecommunications Digital Services Data Protection Act).',
        'Unless a specific retention period is stated below, personal data is deleted when the purpose of processing no longer applies, or when you withdraw consent or request erasure, unless statutory retention obligations apply.',
        'Legal bases: Art. 6(1)(a) GDPR (consent), Art. 6(1)(b) GDPR (contract/pre-contractual measures), Art. 6(1)(c) GDPR (legal obligation), Art. 6(1)(f) GDPR (legitimate interests).',
      ],
    },
    storage: {
      title: '4. Browser storage, cookies, and local data',
      paragraphs: [
        "We remember choices such as your language, website appearance and cookie preferences on your device. Essential cookies and similar storage also keep sign-in and security features working. Legal basis: Art. 6(1)(f) GDPR and, where applicable, § 25(2) TDDDG.",
        "Optional website statistics are collected only with your consent (Art. 6(1)(a) GDPR). If you agree, we record which pages and sections are viewed and which links or buttons are used. Click positions may be recorded without recording the content of your input. These statistics are stored for up to 90 days. You can change your choice in the cookie settings at any time.",
        "Images may be saved temporarily on your device so the site loads faster. Customer and administrator logins use cookies required for authentication.",
      ],
    },
    contact: {
      title: '5. Contact form',
      paragraphs: [
        "If you contact us through the form, we use your name, email address, subject and message to respond. Resend delivers the message to our email inbox. Legal basis: Art. 6(1)(b) GDPR for enquiries about a contract, otherwise Art. 6(1)(f) GDPR.",
        "We keep the correspondence only as long as necessary to handle it, unless legal retention obligations apply. To protect the form from spam, we may briefly process connection information such as your IP address (Art. 6(1)(f) GDPR).",
      ],
    },
    newsletter: {
      title: '6. No newsletter',
      paragraphs: [
        "We do not currently offer an email newsletter or mailing list. Contact and purchase emails are not used to subscribe you to advertising.",
      ],
    },
    news: {
      title: '7. News and blog content',
      paragraphs: [
        "You can read our news without creating an account. Images in articles may be delivered by Cloudflare or the image service wsrv.nl. These providers may receive your IP address when the images are displayed (Art. 6(1)(f) GDPR).",
      ],
    },
    cdn: {
      title: '8. Image CDN (wsrv.nl) and web fonts',
      paragraphs: [
        "Some images are delivered through the external service wsrv.nl so they load faster. Your IP address is technically transferred when you load such images. Our legitimate interest in reliable page delivery is the legal basis (Art. 6(1)(f) GDPR). Details: https://wsrv.nl.",
        "Website fonts are loaded from our own website, not directly from Google's font service.",
      ],
    },
    embeds: {
      title: '9. Third-party embeds (Spotify, YouTube)',
      paragraphs: [
        "Music and video players from Spotify and YouTube are loaded only after you choose to display them. Until then, the embedded players do not connect to those providers.",
        "Once activated, Spotify or YouTube may receive your IP address and browser information and may use their own cookies. The legal basis for loading the content is your consent (Art. 6(1)(a) GDPR). Spotify: https://www.spotify.com/legal/privacy-policy/ · Google: https://policies.google.com/privacy.",
      ],
    },
    'external-links': {
      title: '10. External links and social media',
      paragraphs: [
        'Our footer and content may contain links to external social media profiles and stores. When you click these links, you leave our website and the respective third-party privacy policies apply.',
        'We have no control over third-party websites and accept no responsibility for their content or data processing.',
      ],
    },
    transfers: {
      title: '11. International data transfers',
      paragraphs: [
        "Some service providers operate outside the EU and EEA, including in the United Kingdom and the United States. When personal data is transferred, we rely on an applicable adequacy decision or appropriate safeguards such as EU standard contractual clauses. You can contact us for further information about the safeguards relevant to your data.",
      ],
    },
    rights: {
      title: '12. Your rights',
      paragraphs: [
        'Under the GDPR you have the right to: access (Art. 15), rectification (Art. 16), erasure (Art. 17), restriction (Art. 18), data portability (Art. 20), and objection (Art. 21).',
        'If processing is based on consent, you may withdraw consent at any time without affecting the lawfulness of prior processing.',
        'You may lodge a complaint with a supervisory authority. In Germany, contact your local Landesdatenschutzbehörde.',
        'To exercise your rights, contact us using the email address in the Legal Notice / Impressum.',
      ],
    },
  },
  de: {
    overview: {
      title: '1. Datenschutz auf einen Blick',
      paragraphs: [
        'Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten passiert, wenn Sie diese Website besuchen. Personenbezogene Daten sind alle Daten, mit denen Sie persönlich identifiziert werden können.',
        'Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber: {controller}.',
        'Ein Teil der Daten wird erhoben, indem Sie uns diese mitteilen (z. B. Kontaktformular). Andere Daten werden automatisch beim Besuch der Website durch unsere IT-Systeme erfasst (z. B. Browsertyp, Betriebssystem oder Uhrzeit des Seitenaufrufs).',
        'Optionale Analyse-/Nutzungsdaten werden nur erhoben, wenn Sie im Cookie-Banner ausdrücklich zustimmen. Es werden keine Werbe- oder Tracking-Cookies Dritter eingesetzt.',
      ],
    },
    hosting: {
      title: '2. Hosting und Infrastruktur',
      paragraphs: [
        "Unsere Website wird über Vercel bereitgestellt. Beim Aufruf werden Verbindungsdaten wie deine IP-Adresse und der Zeitpunkt des Zugriffs verarbeitet. Das ist notwendig, damit die Seite funktioniert und wir sie vor Angriffen schützen können. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO. Informationen zu Vercel: https://vercel.com/legal/privacy-policy.",
        "Für Kundenkonten, Softwarelizenzen und Website-Daten nutzen wir Supabase. Die zugehörige Datenbank befindet sich im Vereinigten Königreich. Cloudflare liefert einen Teil der Bilder und Softwaredownloads aus. Resend versendet Nachrichten aus dem Kontaktformular sowie E-Mails zu Bestellungen. Diese Anbieter erhalten die Daten, die sie für die jeweilige Aufgabe benötigen. Hinweise zu Übermittlungen ins Ausland findest du weiter unten.",
      ],
    },
    controller: {
      title: '3. Verantwortlicher und allgemeine Hinweise',
      paragraphs: [
        'Verantwortlicher für die Datenverarbeitung auf dieser Website ist: {controller}.',
        'Wir verarbeiten personenbezogene Daten im Einklang mit der DSGVO, dem BDSG und dem TDDDG.',
        'Soweit nachfolgend keine spezielle Speicherdauer genannt wird, verbleiben personenbezogene Daten bei uns, bis der Zweck der Verarbeitung entfällt oder Sie Ihre Einwilligung widerrufen bzw. Löschung verlangen, sofern keine gesetzlichen Aufbewahrungspflichten entgegenstehen.',
        'Rechtsgrundlagen: Art. 6 Abs. 1 lit. a DSGVO (Einwilligung), lit. b (Vertrag/vorvertraglich), lit. c (rechtliche Verpflichtung), lit. f (berechtigte Interessen).',
      ],
    },
    storage: {
      title: '4. Browser-Speicher, Cookies und lokale Daten',
      paragraphs: [
        "Wir speichern Einstellungen wie Sprache, Darstellung und deine Cookie-Auswahl auf deinem Gerät. Notwendige Cookies und ähnliche Speicherfunktionen halten außerdem Anmeldung und Sicherheitsfunktionen am Laufen. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO und, soweit anwendbar, § 25 Abs. 2 TDDDG.",
        "Wenn du ausdrücklich zustimmst, erfassen wir zur Verbesserung der Website, welche Seiten und Bereiche angesehen und welche Links oder Schaltflächen genutzt werden. Dabei können auch Klickpositionen erfasst werden, nicht aber eingegebene Texte. Rechtsgrundlage ist Art. 6 Abs. 1 lit. a DSGVO. Die Auswertungsdaten werden höchstens 90 Tage gespeichert. Deine Einwilligung kannst du jederzeit in den Cookie-Einstellungen ändern.",
        "Bilder können vorübergehend auf deinem Gerät gespeichert werden, damit sie schneller laden. Für Kunden- und Administratoranmeldungen werden technisch notwendige Cookies eingesetzt.",
      ],
    },
    contact: {
      title: '5. Kontaktformular',
      paragraphs: [
        "Wenn du uns über das Kontaktformular schreibst, verarbeiten wir deinen Namen, deine E-Mail-Adresse, den Betreff und deine Nachricht, um dir antworten zu können. Resend übermittelt die Anfrage an unser E-Mail-Postfach. Rechtsgrundlage ist bei vertragsbezogenen Anfragen Art. 6 Abs. 1 lit. b DSGVO, ansonsten Art. 6 Abs. 1 lit. f DSGVO.",
        "Die Korrespondenz bewahren wir nur so lange auf, wie sie für die Bearbeitung erforderlich ist oder gesetzliche Pflichten dies verlangen. Zum Schutz vor Spam können wir Verbindungsdaten wie die IP-Adresse kurzzeitig verarbeiten (Art. 6 Abs. 1 lit. f DSGVO).",
      ],
    },
    newsletter: {
      title: '6. Kein Newsletter',
      paragraphs: [
        "Wir bieten derzeit keinen E-Mail-Newsletter und keine Mailingliste an. Nachrichten über das Kontaktformular oder zu Bestellungen sind keine Anmeldung zu Werbung.",
      ],
    },
    news: {
      title: '7. News und redaktionelle Inhalte',
      paragraphs: [
        "Unsere News kannst du ohne Kundenkonto lesen. Artikelbilder können über Cloudflare oder den Bilddienst wsrv.nl geladen werden. Dabei kann deine IP-Adresse an diese Anbieter übermittelt werden (Art. 6 Abs. 1 lit. f DSGVO).",
      ],
    },
    cdn: {
      title: '8. Bild-CDN (wsrv.nl) und Webfonts',
      paragraphs: [
        "Einige Bilder werden über den externen Dienst wsrv.nl ausgeliefert, damit sie schneller laden. Beim Abruf wird deine IP-Adresse aus technischen Gründen übermittelt. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO. Weitere Informationen: https://wsrv.nl.",
        "Die Schriftarten der Website werden von unserer eigenen Website geladen. Dabei wird keine Verbindung zum Schriftendienst von Google aufgebaut.",
      ],
    },
    embeds: {
      title: '9. Drittanbieter-Embeds (Spotify, YouTube)',
      paragraphs: [
        "Musik- und Videoplayer von Spotify und YouTube werden erst geladen, wenn du sie selbst aktivierst. Vorher wird keine Verbindung über diese eingebetteten Player zu den Anbietern hergestellt.",
        "Nach der Aktivierung können Spotify oder YouTube deine IP-Adresse und Browserdaten erhalten und eigene Cookies einsetzen. Grundlage für das Laden ist deine Einwilligung (Art. 6 Abs. 1 lit. a DSGVO). Spotify: https://www.spotify.com/legal/privacy-policy/ · Google: https://policies.google.com/privacy.",
      ],
    },
    'external-links': {
      title: '10. Externe Links und Social Media',
      paragraphs: [
        'Footer und Inhalte können Links zu externen Social-Media-Profilen und Shops enthalten. Beim Anklicken verlassen Sie unsere Website; es gelten die Datenschutzbestimmungen der jeweiligen Anbieter.',
        'Wir haben keinen Einfluss auf Drittwebsites und übernehmen keine Verantwortung für deren Inhalte oder Datenverarbeitung.',
      ],
    },
    transfers: {
      title: '11. Internationale Datenübermittlungen',
      paragraphs: [
        "Einige unserer Dienstleister verarbeiten Daten außerhalb der EU und des EWR, insbesondere im Vereinigten Königreich und in den USA. Für solche Übermittlungen gelten, je nach Anbieter, ein Angemessenheitsbeschluss der EU oder geeignete Schutzmaßnahmen wie EU-Standardvertragsklauseln. Weitere Informationen zu den für deine Daten geltenden Schutzmaßnahmen kannst du bei uns anfordern.",
      ],
    },
    rights: {
      title: '12. Ihre Rechte',
      paragraphs: [
        'Sie haben nach der DSGVO das Recht auf: Auskunft (Art. 15), Berichtigung (Art. 16), Löschung (Art. 17), Einschränkung (Art. 18), Datenübertragbarkeit (Art. 20) und Widerspruch (Art. 21).',
        'Soweit die Verarbeitung auf Einwilligung beruht, können Sie diese jederzeit widerrufen, ohne die Rechtmäßigkeit der bis dahin erfolgten Verarbeitung zu berühren.',
        'Sie können sich bei einer Aufsichtsbehörde beschweren. In Deutschland wenden Sie sich an Ihre zuständige Landesdatenschutzbehörde.',
        'Zur Ausübung Ihrer Rechte kontaktieren Sie uns über die E-Mail-Adresse im Impressum.',
      ],
    },
  },
  uk: {
    overview: {
      title: '1. Захист даних коротко',
      paragraphs: [
        'Нижче — короткий огляд того, що відбувається з вашими персональними даними під час відвідування цього сайту. Персональні дані — будь-які дані, за якими вас можна ідентифікувати.',
        'Обробку даних здійснює оператор сайту: {controller}.',
        'Частину даних ви надаєте самі (наприклад, контактна форма). Інші дані фіксуються автоматично (тип браузера, ОС, час доступу).',
        'Аналітика збирається лише за явною згодою в банері cookies. Сторонні рекламні чи трекінгові cookies не використовуються.',
      ],
    },
    hosting: {
      title: '2. Хостинг та інфраструктура',
      paragraphs: [
        "Сайт працює на платформі Vercel. Під час відвідування обробляються технічні дані з’єднання, зокрема IP-адреса та час доступу, для роботи й захисту сайту (ст. 6(1)(f) GDPR). Деталі: https://vercel.com/legal/privacy-policy.",
        "Supabase обслуговує облікові записи та ліцензії; основні дані розміщено у Великій Британії. Cloudflare доставляє деякі файли, а Resend надсилає листи щодо контактів і покупок. Ці постачальники отримують лише потрібні для послуги дані.",
      ],
    },
    controller: {
      title: '3. Контролер даних і загальні відомості',
      paragraphs: [
        'Контролер даних цього сайту: {controller}.',
        'Ми обробляємо персональні дані відповідно до GDPR, німецького BDSG та TDDDG.',
        'Якщо нижче не вказано інший строк, дані видаляються, коли мета обробки відпадає, або коли ви відкликаєте згоду чи вимагаєте видалення, якщо немає законних строків зберігання.',
        'Підстави: ст. 6(1)(a) GDPR (згода), (b) договір, (c) юридичний обов’язок, (f) законні інтереси.',
      ],
    },
    storage: {
      title: '4. Браузерне сховище, cookies і локальні дані',
      paragraphs: [
        "На пристрої зберігаються вибрані мова, оформлення та налаштування cookie. Необхідні cookie підтримують вхід і безпеку сайту (ст. 6(1)(f) GDPR і § 25(2) TDDDG).",
        "За вашою згодою ми збираємо статистику відвідування сторінок, розділів та натискань на кнопки й посилання. Ми не зберігаємо введений текст. Дані видаляються не пізніше ніж через 90 днів. Згоду можна відкликати в налаштуваннях cookie (ст. 6(1)(a) GDPR).",
        "Зображення можуть тимчасово зберігатися на пристрої для швидшого завантаження.",
      ],
    },
    contact: {
      title: '5. Контактна форма',
      paragraphs: [
        "Для відповіді на запит ми обробляємо ім’я, email, тему та повідомлення. Resend надсилає його до нашої пошти (ст. 6(1)(b) або (f) GDPR).",
        "Листування зберігається на час розгляду або визначений законом строк. Для захисту від спаму можуть короткочасно оброблятися дані з’єднання, наприклад IP-адреса (ст. 6(1)(f) GDPR).",
      ],
    },
    newsletter: {
      title: '6. Немає розсилки',
      paragraphs: [
        "Наразі ми не пропонуємо електронну розсилку. Контактні та службові листи не означають підписку на рекламу.",
      ],
    },
    news: {
      title: '7. Новини та редакційний контент',
      paragraphs: [
        "Новини доступні без облікового запису. Зображення можуть завантажуватися через Cloudflare або wsrv.nl, які при цьому отримують IP-адресу (ст. 6(1)(f) GDPR).",
      ],
    },
    cdn: {
      title: '8. CDN зображень (wsrv.nl) і вебшрифти',
      paragraphs: [
        "Деякі зображення постачає сервіс wsrv.nl. Для їх показу він отримує IP-адресу (ст. 6(1)(f) GDPR). Деталі: https://wsrv.nl.",
        "Шрифти завантажуються з нашого сайту без прямого підключення до Google Fonts.",
      ],
    },
    embeds: {
      title: '9. Сторонні вбудови (Spotify, YouTube)',
      paragraphs: [
        "Програвачі Spotify й YouTube завантажуються лише після вашого натискання.",
        "Після активації постачальники можуть отримувати IP-адресу й дані браузера та встановлювати власні cookie. Підстава: ваша згода (ст. 6(1)(a) GDPR). Spotify: https://www.spotify.com/legal/privacy-policy/ · Google: https://policies.google.com/privacy.",
      ],
    },
    'external-links': {
      title: '10. Зовнішні посилання та соцмережі',
      paragraphs: [
        'У футері та контенті можуть бути посилання на зовнішні профілі й магазини. Після кліку ви залишаєте наш сайт; діють політики відповідних сервісів.',
        'Ми не контролюємо сторонні сайти й не відповідаємо за їхній контент чи обробку даних.',
      ],
    },
    transfers: {
      title: '11. Міжнародна передача даних',
      paragraphs: [
        "Деякі постачальники обробляють дані за межами ЄС/ЄЕЗ, зокрема у Великій Британії та США. Для захисту використовуються відповідні рішення про належний рівень захисту або стандартні договірні положення ЄС. Інформацію про гарантії можна запитати у нас.",
      ],
    },
    rights: {
      title: '12. Ваші права',
      paragraphs: [
        'За GDPR ви маєте права на: доступ (ст. 15), виправлення (ст. 16), видалення (ст. 17), обмеження (ст. 18), портативність (ст. 20) та заперечення (ст. 21).',
        'Якщо обробка ґрунтується на згоді, ви можете відкликати її будь-коли, не впливаючи на законність попередньої обробки.',
        'Ви можете подати скаргу до наглядового органу. У Німеччині — до відповідного Landesdatenschutzbehörde.',
        'Щоб скористатися правами, напишіть на e-mail з правової інформації / Impressum.',
      ],
    },
  },
  it: {
    overview: {
      title: '1. Protezione dei dati in sintesi',
      paragraphs: [
        'Le seguenti informazioni offrono una panoramica semplice di cosa accade ai tuoi dati personali quando visiti questo sito. Dati personali sono tutti i dati che permettono di identificarti.',
        'Il trattamento è effettuato dal gestore del sito: {controller}.',
        'Alcuni dati li fornisci tu (es. modulo di contatto). Altri sono rilevati automaticamente (tipo di browser, sistema operativo, orario di accesso).',
        'Le analitiche opzionali sono raccolte solo con consenso esplicito nel banner cookie. Non usiamo cookie pubblicitari o di tracciamento di terzi.',
      ],
    },
    hosting: {
      title: '2. Hosting e infrastruttura',
      paragraphs: [
        "Il sito è gestito tramite Vercel. Per il funzionamento e la sicurezza sono trattati dati di connessione, inclusi indirizzo IP e orario (art. 6(1)(f) GDPR). Informativa: https://vercel.com/legal/privacy-policy.",
        "Supabase gestisce account e licenze; il database principale si trova nel Regno Unito. Cloudflare distribuisce alcuni file e Resend invia email relative a contatti e acquisti. Ogni fornitore riceve solo i dati necessari.",
      ],
    },
    controller: {
      title: '3. Titolare del trattamento e informazioni generali',
      paragraphs: [
        'Il titolare del trattamento di questo sito è: {controller}.',
        'Trattiamo i dati personali in conformità al GDPR, al BDSG tedesco e al TDDDG.',
        'Salvo un periodo di conservazione specifico indicato sotto, i dati sono cancellati quando cessa lo scopo del trattamento o quando revochi il consenso o chiedi la cancellazione, salvo obblighi di legge.',
        'Basi giuridiche: art. 6(1)(a) GDPR (consenso), (b) contratto, (c) obbligo legale, (f) interessi legittimi.',
      ],
    },
    storage: {
      title: '4. Archiviazione nel browser, cookie e dati locali',
      paragraphs: [
        "Sul dispositivo ricordiamo lingua, aspetto del sito e preferenze sui cookie. I cookie necessari consentono accesso e sicurezza (art. 6(1)(f) GDPR e, ove applicabile, § 25(2) TDDDG).",
        "Solo con il consenso raccogliamo statistiche su pagine, sezioni e pulsanti o link utilizzati, senza registrare il testo digitato. I dati sono conservati fino a 90 giorni. Il consenso è revocabile dalle impostazioni cookie (art. 6(1)(a) GDPR).",
        "Le immagini possono essere salvate temporaneamente sul dispositivo per velocizzare il sito.",
      ],
    },
    contact: {
      title: '5. Modulo di contatto',
      paragraphs: [
        "Trattiamo nome, email, oggetto e messaggio per rispondere alle richieste. Resend consegna il messaggio alla nostra casella email (art. 6(1)(b) o (f) GDPR).",
        "Conserviamo la corrispondenza per il tempo necessario o previsto dalla legge. Per prevenire spam, i dati di connessione, compreso l'IP, possono essere trattati brevemente (art. 6(1)(f) GDPR).",
      ],
    },
    newsletter: {
      title: '6. Nessuna newsletter',
      paragraphs: [
        "Attualmente non offriamo una newsletter. I messaggi di contatto e acquisto non iscrivono a comunicazioni pubblicitarie.",
      ],
    },
    news: {
      title: '7. News e contenuti editoriali',
      paragraphs: [
        "Le notizie sono leggibili senza account. Le immagini possono essere caricate tramite Cloudflare o wsrv.nl, che ricevono l'indirizzo IP (art. 6(1)(f) GDPR).",
      ],
    },
    cdn: {
      title: '8. CDN immagini (wsrv.nl) e web font',
      paragraphs: [
        "Alcune immagini vengono distribuite tramite wsrv.nl, che riceve l'indirizzo IP per mostrarle (art. 6(1)(f) GDPR). Dettagli: https://wsrv.nl.",
        "I caratteri vengono caricati dal nostro sito, senza collegarsi direttamente a Google Fonts.",
      ],
    },
    embeds: {
      title: '9. Incorporamenti di terzi (Spotify, YouTube)',
      paragraphs: [
        "I lettori Spotify e YouTube vengono caricati solo dopo una tua scelta.",
        "Dopo l'attivazione possono ricevere IP e dati del browser e utilizzare cookie propri. Base: consenso (art. 6(1)(a) GDPR). Spotify: https://www.spotify.com/legal/privacy-policy/ · Google: https://policies.google.com/privacy.",
      ],
    },
    'external-links': {
      title: '10. Link esterni e social',
      paragraphs: [
        'Footer e contenuti possono contenere link a profili social e negozi esterni. Cliccando lasci il nostro sito; si applicano le informative dei terzi.',
        'Non controlliamo i siti terzi e non siamo responsabili dei loro contenuti o trattamenti.',
      ],
    },
    transfers: {
      title: '11. Trasferimenti internazionali',
      paragraphs: [
        "Alcuni fornitori trattano dati fuori dall'UE/SEE, anche nel Regno Unito e negli USA. Si applicano decisioni di adeguatezza o garanzie come le clausole contrattuali standard UE. Puoi richiedere maggiori informazioni.",
      ],
    },
    rights: {
      title: '12. I tuoi diritti',
      paragraphs: [
        'Ai sensi del GDPR hai diritto di: accesso (art. 15), rettifica (art. 16), cancellazione (art. 17), limitazione (art. 18), portabilità (art. 20) e opposizione (art. 21).',
        'Se il trattamento si basa sul consenso, puoi revocarlo in qualsiasi momento senza pregiudicare la liceità precedente.',
        'Puoi presentare reclamo a un’autorità di controllo. In Germania, alla Landesdatenschutzbehörde competente.',
        'Per esercitare i diritti, contattaci all’e-mail indicata nelle Note legali / Impressum.',
      ],
    },
  },
  es: {
    overview: {
      title: '1. Protección de datos de un vistazo',
      paragraphs: [
        'La siguiente información ofrece una visión sencilla de qué ocurre con tus datos personales al visitar este sitio. Datos personales son todos los que permiten identificarte.',
        'El tratamiento lo realiza el operador del sitio: {controller}.',
        'Algunos datos los facilitas tú (p. ej. formulario de contacto). Otros se registran automáticamente (tipo de navegador, sistema operativo u hora de acceso).',
        'Las analíticas opcionales solo se recogen si consientes expresamente en el banner de cookies. No se usan cookies publicitarias o de seguimiento de terceros.',
      ],
    },
    hosting: {
      title: '2. Alojamiento e infraestructura',
      paragraphs: [
        "El sitio se ofrece mediante Vercel. Para funcionar y protegerse procesa datos de conexión, como la dirección IP y la hora de acceso (art. 6.1.f RGPD). Política: https://vercel.com/legal/privacy-policy.",
        "Supabase gestiona cuentas y licencias; los datos principales se alojan en el Reino Unido. Cloudflare distribuye algunos archivos y Resend entrega correos sobre consultas y compras. Los proveedores reciben los datos necesarios para prestar sus servicios.",
      ],
    },
    controller: {
      title: '3. Responsable del tratamiento e información general',
      paragraphs: [
        'El responsable del tratamiento de este sitio es: {controller}.',
        'Tratamos datos personales conforme al RGPD, la BDSG alemana y la TDDDG.',
        'Salvo un plazo específico más abajo, los datos se eliminan cuando deja de aplicarse la finalidad, o cuando retiras el consentimiento o pides la supresión, salvo obligaciones legales de conservación.',
        'Bases: art. 6(1)(a) RGPD (consentimiento), (b) contrato, (c) obligación legal, (f) intereses legítimos.',
      ],
    },
    storage: {
      title: '4. Almacenamiento del navegador, cookies y datos locales',
      paragraphs: [
        "Guardamos en tu dispositivo las preferencias de idioma, aspecto y cookies. Las cookies necesarias permiten el acceso y la seguridad (art. 6.1.f RGPD y, cuando corresponda, § 25.2 TDDDG).",
        "Solo con tu consentimiento recopilamos estadísticas de páginas, secciones, enlaces y botones usados, sin guardar lo que escribes. Los datos se conservan hasta 90 días. Puedes retirar tu consentimiento en los ajustes de cookies (art. 6.1.a RGPD).",
        "Las imágenes pueden guardarse temporalmente en tu dispositivo para mejorar la carga.",
      ],
    },
    contact: {
      title: '5. Formulario de contacto',
      paragraphs: [
        "Tratamos tu nombre, correo, asunto y mensaje para responder. Resend entrega la consulta a nuestro buzón (art. 6.1.b o f RGPD).",
        "Guardamos la correspondencia el tiempo necesario o exigido por ley. Para evitar el spam podemos procesar brevemente datos de conexión como la dirección IP (art. 6.1.f RGPD).",
      ],
    },
    newsletter: {
      title: '6. Sin boletín',
      paragraphs: [
        "Actualmente no ofrecemos un boletín por correo. Las consultas y compras no te suscriben a publicidad.",
      ],
    },
    news: {
      title: '7. Noticias y contenido editorial',
      paragraphs: [
        "Puedes leer las noticias sin cuenta. Las imágenes pueden cargarse a través de Cloudflare o wsrv.nl, que reciben la dirección IP (art. 6.1.f RGPD).",
      ],
    },
    cdn: {
      title: '8. CDN de imágenes (wsrv.nl) y fuentes web',
      paragraphs: [
        "Algunas imágenes se muestran mediante wsrv.nl, que recibe la dirección IP para entregarlas (art. 6.1.f RGPD). Más información: https://wsrv.nl.",
        "Las fuentes se cargan desde nuestro propio sitio y no directamente desde Google Fonts.",
      ],
    },
    embeds: {
      title: '9. Incrustaciones de terceros (Spotify, YouTube)',
      paragraphs: [
        "Los reproductores de Spotify y YouTube solo se cargan cuando decides activarlos.",
        "Después pueden recibir IP y datos del navegador y usar sus propias cookies. Base: consentimiento (art. 6.1.a RGPD). Spotify: https://www.spotify.com/legal/privacy-policy/ · Google: https://policies.google.com/privacy.",
      ],
    },
    'external-links': {
      title: '10. Enlaces externos y redes sociales',
      paragraphs: [
        'El pie y el contenido pueden contener enlaces a perfiles y tiendas externas. Al hacer clic abandonas nuestro sitio; se aplican las políticas de esos terceros.',
        'No controlamos sitios de terceros ni asumimos responsabilidad por su contenido o tratamiento de datos.',
      ],
    },
    transfers: {
      title: '11. Transferencias internacionales',
      paragraphs: [
        "Algunos proveedores tratan datos fuera de la UE/EEE, como en el Reino Unido y Estados Unidos. Se aplican decisiones de adecuación o garantías como las cláusulas contractuales tipo de la UE. Puedes solicitarnos más información.",
      ],
    },
    rights: {
      title: '12. Tus derechos',
      paragraphs: [
        'Conforme al RGPD tienes derecho de: acceso (art. 15), rectificación (art. 16), supresión (art. 17), limitación (art. 18), portabilidad (art. 20) y oposición (art. 21).',
        'Si el tratamiento se basa en el consentimiento, puedes retirarlo en cualquier momento sin afectar la licitud anterior.',
        'Puedes presentar una reclamación ante una autoridad de control. En Alemania, ante tu Landesdatenschutzbehörde.',
        'Para ejercer tus derechos, contáctanos en el correo del Aviso legal / Impressum.',
      ],
    },
  },
  pt: {
    overview: {
      title: '1. Proteção de dados em resumo',
      paragraphs: [
        'As informações seguintes dão uma visão simples do que acontece aos seus dados pessoais quando visita este sítio. Dados pessoais são todos os dados que permitem identificá-lo.',
        'O tratamento é efetuado pelo operador do sítio: {controller}.',
        'Alguns dados são fornecidos por si (p. ex. formulário de contacto). Outros são registados automaticamente (tipo de browser, sistema operativo ou hora de acesso).',
        'As análises opcionais só são recolhidas com consentimento explícito no banner de cookies. Não se usam cookies publicitários ou de rastreio de terceiros.',
      ],
    },
    hosting: {
      title: '2. Alojamento e infraestrutura',
      paragraphs: [
        "O site é disponibilizado pela Vercel. Para funcionar e manter-se seguro, são tratados dados de ligação como o endereço IP e a hora de acesso (artigo 6.º, n.º 1, alínea f), RGPD). Detalhes: https://vercel.com/legal/privacy-policy.",
        "A Supabase gere contas e licenças, com dados principais no Reino Unido. A Cloudflare disponibiliza alguns ficheiros e a Resend envia emails relativos a contactos e compras. Cada prestador recebe os dados necessários ao serviço.",
      ],
    },
    controller: {
      title: '3. Responsável pelo tratamento e informações gerais',
      paragraphs: [
        'O responsável pelo tratamento deste sítio é: {controller}.',
        'Tratamos dados pessoais em conformidade com o RGPD, a BDSG alemã e a TDDDG.',
        'Salvo um prazo específico abaixo, os dados são apagados quando cessa a finalidade, ou quando retira o consentimento ou pede o apagamento, salvo obrigações legais de conservação.',
        'Bases: art. 6.º(1)(a) RGPD (consentimento), (b) contrato, (c) obrigação legal, (f) interesses legítimos.',
      ],
    },
    storage: {
      title: '4. Armazenamento no browser, cookies e dados locais',
      paragraphs: [
        "Guardamos no dispositivo as preferências de idioma, apresentação e cookies. Os cookies necessários permitem iniciar sessão e proteger o site (artigo 6.º, n.º 1, alínea f), RGPD e, quando aplicável, § 25(2) TDDDG).",
        "Só com consentimento recolhemos estatísticas de páginas e secções visitadas e de botões e links utilizados, sem guardar texto escrito. Os dados são conservados até 90 dias. Podes retirar o consentimento nas definições de cookies (artigo 6.º, n.º 1, alínea a), RGPD).",
        "Algumas imagens podem ser guardadas temporariamente no dispositivo para carregarem mais depressa.",
      ],
    },
    contact: {
      title: '5. Formulário de contacto',
      paragraphs: [
        "Tratamos nome, email, assunto e mensagem para responder às tuas questões. A Resend entrega a mensagem à nossa caixa de correio (artigo 6.º, n.º 1, alíneas b) ou f), RGPD).",
        "Guardamos a correspondência durante o período necessário ou imposto por lei. Para combater spam, podemos tratar brevemente dados de ligação como o IP (artigo 6.º, n.º 1, alínea f), RGPD).",
      ],
    },
    newsletter: {
      title: '6. Sem newsletter',
      paragraphs: [
        "Atualmente não temos newsletter. Os emails de contacto ou compra não implicam subscrição de publicidade.",
      ],
    },
    news: {
      title: '7. Notícias e conteúdo editorial',
      paragraphs: [
        "As notícias podem ser lidas sem conta. As imagens podem ser fornecidas pela Cloudflare ou wsrv.nl, que recebem o endereço IP (artigo 6.º, n.º 1, alínea f), RGPD).",
      ],
    },
    cdn: {
      title: '8. CDN de imagens (wsrv.nl) e tipos de letra web',
      paragraphs: [
        "Algumas imagens são fornecidas pelo serviço wsrv.nl, que recebe o IP para as apresentar (artigo 6.º, n.º 1, alínea f), RGPD). Mais informações: https://wsrv.nl.",
        "Os tipos de letra são carregados a partir do nosso site, sem ligação direta ao Google Fonts.",
      ],
    },
    embeds: {
      title: '9. Incorporações de terceiros (Spotify, YouTube)',
      paragraphs: [
        "Os leitores Spotify e YouTube só carregam após a tua escolha.",
        "Depois da ativação podem receber o IP, dados do navegador e utilizar cookies próprios. Fundamento: consentimento (artigo 6.º, n.º 1, alínea a), RGPD). Spotify: https://www.spotify.com/legal/privacy-policy/ · Google: https://policies.google.com/privacy.",
      ],
    },
    'external-links': {
      title: '10. Ligações externas e redes sociais',
      paragraphs: [
        'O rodapé e o conteúdo podem conter ligações a perfis e lojas externas. Ao clicar sai do nosso sítio; aplicam-se as políticas desses terceiros.',
        'Não controlamos sítios de terceiros nem assumimos responsabilidade pelo respetivo conteúdo ou tratamento de dados.',
      ],
    },
    transfers: {
      title: '11. Transferências internacionais',
      paragraphs: [
        "Alguns prestadores tratam dados fora da UE/EEE, incluindo o Reino Unido e os EUA. Aplicam-se decisões de adequação ou garantias como as cláusulas contratuais-tipo da UE. Podes pedir-nos informações adicionais.",
      ],
    },
    rights: {
      title: '12. Os seus direitos',
      paragraphs: [
        'Nos termos do RGPD tem direito de: acesso (art. 15.º), retificação (art. 16.º), apagamento (art. 17.º), limitação (art. 18.º), portabilidade (art. 20.º) e oposição (art. 21.º).',
        'Se o tratamento se basear no consentimento, pode retirá-lo a qualquer momento sem afetar a licitude anterior.',
        'Pode apresentar uma reclamação a uma autoridade de controlo. Na Alemanha, à Landesdatenschutzbehörde competente.',
        'Para exercer os seus direitos, contacte-nos no e-mail do Aviso legal / Impressum.',
      ],
    },
  },
  ja: {
    overview: {
      title: '1. データ保護の概要',
      paragraphs: [
        '本サイトを訪問した際に個人データがどのように扱われるかの簡単な概要です。個人データとは、あなたを識別できるあらゆるデータです。',
        '本サイトでのデータ処理は運営者 {controller} が行います。',
        '一部のデータはあなたが提供します（例: お問い合わせフォーム）。その他は訪問時に自動記録されます（ブラウザ種別、OS、アクセス時刻など）。',
        '任意の分析はクッキーバナーで明示的に同意した場合にのみ収集します。第三者の広告・トラッキングCookieは使用しません。',
      ],
    },
    hosting: {
      title: '2. ホスティングとインフラ',
      paragraphs: [
        "当サイトはVercelを通じて提供しています。表示と安全確保のため、IPアドレスやアクセス時刻などの接続情報を処理します（GDPR第6条第1項(f)）。詳細: https://vercel.com/legal/privacy-policy。",
        "Supabaseは顧客アカウントとライセンスを管理し、主要データは英国にあります。Cloudflareは一部のファイルを配信し、Resendはお問い合わせや購入に関するメールを送信します。各事業者には必要な情報のみを提供します。",
      ],
    },
    controller: {
      title: '3. 管理者および一般情報',
      paragraphs: [
        '本サイトの管理者は {controller} です。',
        '個人データはGDPR、ドイツBDSGおよびTDDDGに従って処理します。',
        '下記に保管期間の定めがない限り、処理目的が終了したとき、または同意の撤回・削除請求時に削除します（法定保存義務がある場合を除く）。',
        '根拠: GDPR第6条1項(a)同意、(b)契約、(c)法的義務、(f)正当な利益。',
      ],
    },
    storage: {
      title: '4. ブラウザ保存、Cookie、ローカルデータ',
      paragraphs: [
        "言語、表示設定、Cookieの選択は端末に保存します。ログインと安全確保には必要なCookieを使います（GDPR第6条第1項(f)、該当する場合はTDDDG第25条第2項）。",
        "同意した場合のみ、閲覧ページ、セクション、利用したリンクやボタンの統計を集めます。入力した文章は記録しません。データは最長90日保存し、Cookie設定からいつでも同意を取り消せます（GDPR第6条第1項(a)）。",
        "画像をすばやく表示するため、端末に一時保存する場合があります。",
      ],
    },
    contact: {
      title: '5. お問い合わせフォーム',
      paragraphs: [
        "お問い合わせへの回答のため、氏名、メールアドレス、件名、本文を処理します。Resendが当社のメールボックスへ送信します（GDPR第6条第1項(b)または(f)）。",
        "通信内容は対応に必要な期間または法定期間保存します。迷惑送信を防ぐためIPアドレスなどの接続情報を短期間扱うことがあります（GDPR第6条第1項(f)）。",
      ],
    },
    newsletter: {
      title: '6. ニュースレターはありません',
      paragraphs: [
        "現在、メールニュースレターは提供していません。お問い合わせや購入に関するメールで広告配信へ登録されることはありません。",
      ],
    },
    news: {
      title: '7. ニュースと編集コンテンツ',
      paragraphs: [
        "ニュースはアカウントなしで読めます。画像はCloudflareまたはwsrv.nlから配信される場合があり、IPアドレスが送られます（GDPR第6条第1項(f)）。",
      ],
    },
    cdn: {
      title: '8. 画像CDN（wsrv.nl）とウェブフォント',
      paragraphs: [
        "一部の画像はwsrv.nlから配信され、表示に必要なIPアドレスが渡ります（GDPR第6条第1項(f)）。詳細: https://wsrv.nl。",
        "フォントは当サイトから読み込み、Google Fontsへ直接接続しません。",
      ],
    },
    embeds: {
      title: '9. 第三者埋め込み（Spotify、YouTube）',
      paragraphs: [
        "SpotifyとYouTubeのプレーヤーは、ご自身で表示を選んだ場合にのみ読み込まれます。",
        "有効化後はIPアドレスやブラウザ情報が送られ、各サービスのCookieが使われる場合があります。根拠は同意（GDPR第6条第1項(a)）。Spotify: https://www.spotify.com/legal/privacy-policy/ · Google: https://policies.google.com/privacy。",
      ],
    },
    'external-links': {
      title: '10. 外部リンクとソーシャルメディア',
      paragraphs: [
        'フッターやコンテンツに外部プロフィールや店舗へのリンクがある場合があります。クリックすると当サイトを離れ、各第三者の方針が適用されます。',
        '第三者サイトを管理しておらず、その内容やデータ処理について責任を負いません。',
      ],
    },
    transfers: {
      title: '11. 国際的なデータ移転',
      paragraphs: [
        "一部の事業者は英国や米国などEU/EEA域外でデータを処理します。該当する十分性認定またはEU標準契約条項などの保護措置を利用します。詳しい情報はお問い合わせください。",
      ],
    },
    rights: {
      title: '12. あなたの権利',
      paragraphs: [
        'GDPRに基づき、アクセス（15条）、訂正（16条）、削除（17条）、制限（18条）、ポータビリティ（20条）、異議（21条）の権利があります。',
        '同意に基づく処理の場合、いつでも撤回できます。撤回前の適法性には影響しません。',
        '監督当局に苦情を申し立てできます。ドイツでは所轄のLandesdatenschutzbehördeです。',
        '権利行使は、運営者情報／Impressum記載のメールアドレスまでご連絡ください。',
      ],
    },
  },
  ko: {
    overview: {
      title: '1. 개인정보 보호 한눈에 보기',
      paragraphs: [
        '이 사이트를 방문할 때 개인정보가 어떻게 처리되는지 간단히 안내합니다. 개인정보는 귀하를 식별할 수 있는 모든 데이터입니다.',
        '이 사이트의 데이터 처리는 운영자 {controller}가 수행합니다.',
        '일부 데이터는 귀하가 제공합니다(예: 문의 양식). 그 외는 방문 시 자동 기록됩니다(브라우저 종류, OS, 접속 시각 등).',
        '선택적 분석은 쿠키 배너에서 명시적으로 동의한 경우에만 수집합니다. 제3자 광고·추적 쿠키는 사용하지 않습니다.',
      ],
    },
    hosting: {
      title: '2. 호스팅 및 인프라',
      paragraphs: [
        "이 사이트는 Vercel을 통해 제공됩니다. 화면 표시와 보안을 위해 IP 주소 및 접속 시간 등의 연결 정보를 처리합니다(GDPR 제6조 제1항 (f)). 정책: https://vercel.com/legal/privacy-policy.",
        "Supabase는 계정과 라이선스를 관리하며 주요 데이터는 영국에 있습니다. Cloudflare는 일부 파일을 제공하고 Resend는 문의 및 구매 관련 이메일을 보냅니다. 각 업체는 서비스에 필요한 정보만 받습니다.",
      ],
    },
    controller: {
      title: '3. 컨트롤러 및 일반 정보',
      paragraphs: [
        '이 사이트의 컨트롤러는 {controller}입니다.',
        '개인정보는 GDPR, 독일 BDSG 및 TDDDG에 따라 처리합니다.',
        '아래에 별도 보관 기간이 없으면 처리 목적이 종료되거나 동의를 철회·삭제를 요청하면 삭제합니다(법정 보관 의무가 있는 경우 제외).',
        '근거: GDPR 제6조 1항 (a) 동의, (b) 계약, (c) 법적 의무, (f) 정당한 이익.',
      ],
    },
    storage: {
      title: '4. 브라우저 저장소, 쿠키 및 로컬 데이터',
      paragraphs: [
        "언어, 화면 설정, 쿠키 선택을 기기에 저장합니다. 로그인과 보안을 위해 필수 쿠키를 사용합니다(GDPR 제6조 제1항 (f), 해당되는 경우 TDDDG 제25조 제2항).",
        "동의한 경우에만 방문 페이지와 섹션, 이용한 링크 및 버튼의 통계를 수집하며 입력한 글은 저장하지 않습니다. 데이터는 최대 90일 보관하며 쿠키 설정에서 언제든 동의를 철회할 수 있습니다(GDPR 제6조 제1항 (a)).",
        "이미지를 빠르게 표시하기 위해 기기에 임시 저장할 수 있습니다.",
      ],
    },
    contact: {
      title: '5. 문의 양식',
      paragraphs: [
        "문의에 답하기 위해 이름, 이메일, 제목, 메시지를 처리합니다. Resend가 당사의 이메일로 전달합니다(GDPR 제6조 제1항 (b) 또는 (f)).",
        "문의 내역은 처리에 필요한 기간 또는 법정 기간 보관합니다. 스팸 방지를 위해 IP 주소 등 연결 정보를 잠시 처리할 수 있습니다(GDPR 제6조 제1항 (f)).",
      ],
    },
    newsletter: {
      title: '6. 뉴스레터 없음',
      paragraphs: [
        "현재 이메일 뉴스레터는 운영하지 않습니다. 문의나 구매 관련 메일이 광고 구독으로 이어지지 않습니다.",
      ],
    },
    news: {
      title: '7. 뉴스 및 편집 콘텐츠',
      paragraphs: [
        "뉴스는 계정 없이 볼 수 있습니다. 일부 이미지는 Cloudflare 또는 wsrv.nl에서 제공하며 IP 주소가 전달될 수 있습니다(GDPR 제6조 제1항 (f)).",
      ],
    },
    cdn: {
      title: '8. 이미지 CDN(wsrv.nl) 및 웹 글꼴',
      paragraphs: [
        "일부 이미지는 wsrv.nl에서 제공하며 이를 위해 IP 주소가 전달됩니다(GDPR 제6조 제1항 (f)). 자세히: https://wsrv.nl.",
        "글꼴은 당사 사이트에서 불러오며 Google Fonts에 직접 연결하지 않습니다.",
      ],
    },
    embeds: {
      title: '9. 제3자 임베드(Spotify, YouTube)',
      paragraphs: [
        "Spotify와 YouTube 플레이어는 사용자가 표시를 선택한 뒤에만 불러옵니다.",
        "활성화 후에는 IP 주소와 브라우저 정보가 전송되고 해당 서비스의 쿠키가 사용될 수 있습니다. 근거는 동의(GDPR 제6조 제1항 (a))입니다. Spotify: https://www.spotify.com/legal/privacy-policy/ · Google: https://policies.google.com/privacy.",
      ],
    },
    'external-links': {
      title: '10. 외부 링크 및 소셜 미디어',
      paragraphs: [
        '푸터와 콘텐츠에 외부 프로필 및 상점 링크가 있을 수 있습니다. 클릭하면 본 사이트를 떠나며 해당 제3자의 정책이 적용됩니다.',
        '제3자 사이트를 통제하지 않으며 그 내용이나 데이터 처리에 책임을 지지 않습니다.',
      ],
    },
    transfers: {
      title: '11. 국제 이전',
      paragraphs: [
        "일부 업체는 영국과 미국 등 EU/EEA 밖에서 데이터를 처리합니다. 해당 적정성 결정 또는 EU 표준계약조항 등의 보호 조치를 적용합니다. 자세한 정보를 요청할 수 있습니다.",
      ],
    },
    rights: {
      title: '12. 귀하의 권리',
      paragraphs: [
        'GDPR에 따라 접근(제15조), 정정(제16조), 삭제(제17조), 제한(제18조), 이동(제20조), 반대(제21조)의 권리가 있습니다.',
        '동의를 근거로 한 처리는 언제든 철회할 수 있으며, 철회 이전의 적법성에는 영향을 주지 않습니다.',
        '감독 기관에 민원을 제기할 수 있습니다. 독일에서는 관할 Landesdatenschutzbehörde입니다.',
        '권리 행사는 법적 고지/Impressum의 이메일로 연락하세요.',
      ],
    },
  },
}

// Expanded service-specific disclosures complement the hosting, local-storage and rights sections above.
const PRIVACY_SERVICE_DETAILS: Record<LegalLocale, Record<string, LegalCopySection>> = {
  "en": {
    "accounts": {
      "title": "Customer accounts and license activation",
      "paragraphs": [
        "To log in to the software customer portal, we process your email address, a Supabase user ID and technically necessary session information. Sign-in codes are sent by email. The legal basis is Art. 6(1)(b) GDPR.",
        "For issued software licenses we process the purchased product, license status, order reference, activation times and device-related identifiers. Activation records help enforce the agreed number of devices and provide offline authorizations. The legal basis is Art. 6(1)(b) GDPR.",
        "Account and license records are kept for as long as needed to perform the license agreement, handle support and protect legal claims, subject to applicable retention and deletion requirements."
      ]
    },
    "purchases": {
      "title": "Purchases, payment processing and invoices",
      "paragraphs": [
        "When you buy software, we process your contact email, product and price, order/payment references, billing details and the agreed contract and license version. Stripe processes the payment. We do not receive or store complete payment-card numbers. The legal bases are Art. 6(1)(b) and (c) GDPR.",
        "Stripe's privacy notice is at https://stripe.com/privacy. We use Resend to email contractual confirmations and relevant customer notifications. Invoices and other records subject to statutory retention are kept for the applicable statutory period. Refunds and chargebacks may also require processing transaction data."
      ]
    },
    "requests": {
      "title": "Withdrawal, customer support and data-subject requests",
      "paragraphs": [
        "For online withdrawal requests, we collect your name, email, contract details, the time received and a reference number, and send an acknowledgement through Resend. This is required to meet legal obligations and handle the contract (Art. 6(1)(c) and (b) GDPR).",
        "To handle access, rectification and deletion requests we process the information necessary to verify entitlement, respond and document our legal compliance (Art. 6(1)(c) GDPR). Data held by payment and email providers may need to be checked separately."
      ]
    },
    "diagnostics": {
      "title": "Optional NEUROKORE beta diagnostics",
      "paragraphs": [
        "In beta versions, you can separately opt in to technical diagnostic reports inside the plugin. This option is off by default and can be disabled at any time. The reports contain plugin version, operating system and audio host categories, plugin format, coarse CPU/RAM classes, sample rate, buffer size and error category, sometimes a JavaScript bundle filename and line number.",
        "No audio, presets, license keys, usernames, file paths or free-text error messages are included in the defined report payload. The server uses temporary IP-based abuse protection, and transport providers may process IP addresses in connection logs. Accordingly the reports are data-minimized, not guaranteed to be anonymous. The legal basis for optional diagnostics is Art. 6(1)(a) GDPR. Stored diagnostic reports are deleted after at most 90 days by the configured cleanup process."
      ]
    },
    "updates": {
      "title": "Software downloads and update checks",
      "paragraphs": [
        "Published software files and media may be delivered through Cloudflare R2 or GitHub. Download and server infrastructure can technically process IP address, requested file, request time and browser/device information (Art. 6(1)(f) GDPR).",
        "If you manually request or enable automatic update checks in NEUROKORE, the plugin contacts the GitHub releases API. GitHub may receive technical connection data. Automatic checks are optional. Updates are not installed without your confirmation. See https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement."
      ]
    }
  },
  "de": {
    "accounts": {
      "title": "Kundenkonto und Lizenzaktivierung",
      "paragraphs": [
        "Für die Anmeldung am Software-Kundenkonto verarbeiten wir die E-Mail-Adresse, eine Supabase-Benutzerkennung und technisch notwendige Sitzungsinformationen. Anmeldecodes werden per E-Mail versendet. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO.",
        "Für Softwarelizenzen verarbeiten wir das erworbene Produkt, Lizenzstatus, Bestellreferenzen, Aktivierungszeitpunkte und gerätebezogene Kennungen. Diese Daten ermöglichen die vereinbarte Anzahl von Geräteaktivierungen und zeitlich begrenzte Offline-Berechtigungen. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO.",
        "Konto- und Lizenzdaten speichern wir, soweit dies für die Vertragserfüllung, Unterstützung und die Abwicklung rechtlicher Ansprüche erforderlich ist. Gesetzliche Aufbewahrungs- und Löschpflichten bleiben unberührt."
      ]
    },
    "purchases": {
      "title": "Softwarebestellungen, Zahlungen und Rechnungen",
      "paragraphs": [
        "Beim Softwarekauf verarbeiten wir Kontakt-E-Mail-Adresse, Produkt, Preis, Bestell- und Zahlungsreferenzen, Rechnungsangaben sowie die vereinbarten Vertrags- und Lizenzversionen. Die Zahlung wird über Stripe abgewickelt. Vollständige Kreditkartendaten erhalten und speichern wir nicht. Rechtsgrundlagen sind Art. 6 Abs. 1 lit. b und c DSGVO.",
        "Datenschutzhinweise von Stripe: https://stripe.com/de/privacy. Vertragsbestätigungen und notwendige Kundenbenachrichtigungen werden über Resend per E-Mail versendet. Steuerlich oder handelsrechtlich aufzubewahrende Belege bleiben für die jeweils vorgeschriebene Zeit gespeichert. Auch Erstattungen oder Rückbelastungen können eine weitere Verarbeitung von Transaktionsdaten erfordern."
      ]
    },
    "requests": {
      "title": "Widerrufe, Kundenanfragen und Datenschutzanfragen",
      "paragraphs": [
        "Bei einem elektronischen Widerruf verarbeiten wir Namen, E-Mail-Adresse, Vertragsangaben, Eingangszeitpunkt und eine Referenznummer. Eine Eingangsbestätigung wird über Resend versendet. Rechtsgrundlagen sind Art. 6 Abs. 1 lit. c und b DSGVO.",
        "Zur Bearbeitung von Auskunfts-, Berichtigungs- und Löschanfragen verarbeiten wir die für die Identitäts- und Berechtigungsprüfung, Beantwortung und Dokumentation erforderlichen Angaben (Art. 6 Abs. 1 lit. c DSGVO). Bei Zahlungs- und E-Mail-Dienstleistern gespeicherte Daten müssen gegebenenfalls gesondert geprüft werden."
      ]
    },
    "diagnostics": {
      "title": "Optionale NEUROKORE-Betadiagnose",
      "paragraphs": [
        "In Betaversionen von NEUROKORE kannst du innerhalb des Plugins ausdrücklich in technische Diagnosemeldungen einwilligen. Diese Funktion ist standardmäßig ausgeschaltet und jederzeit deaktivierbar. Übermittelt werden Pluginversion, Kategorien von Betriebssystem und Audio-Host, Pluginformat, grobe Angaben zu CPU und Arbeitsspeicher, Samplerate, Puffergröße und Fehlerkategorie. Gegebenenfalls werden der Name einer JavaScript-Datei und die Zeilennummer übertragen.",
        "Die vorgesehenen Meldungen enthalten keine Audiodaten, Presets, Lizenzschlüssel, Benutzernamen, Dateipfade oder frei formulierte Fehlermeldungen. Der Server verwendet einen vorübergehenden IP-basierten Missbrauchsschutz. Transportdienstleister können IP-Adressen in Verbindungsprotokollen verarbeiten. Die Meldungen sind daher datenminimiert, aber nicht garantiert anonym. Rechtsgrundlage ist Art. 6 Abs. 1 lit. a DSGVO. Gespeicherte Diagnosemeldungen werden durch die konfigurierte Bereinigung spätestens nach 90 Tagen gelöscht."
      ]
    },
    "updates": {
      "title": "Softwaredownloads und Updateprüfung",
      "paragraphs": [
        "Softwaredownloads und Mediendateien können über Cloudflare R2 oder GitHub bereitgestellt werden. Bei Downloads können technisch erforderliche Verbindungsdaten wie IP-Adresse, angeforderte Datei, Zeitpunkt und Browser- oder Geräteinformationen verarbeitet werden (Art. 6 Abs. 1 lit. f DSGVO).",
        "Wenn du im NEUROKORE-Plugin manuell oder optional automatisch nach Updates suchst, wird die GitHub-Releases-API aufgerufen. GitHub kann dabei technische Verbindungsdaten erhalten. Automatische Prüfungen sind abschaltbar. Updates werden nicht ohne deine Bestätigung installiert. Datenschutzhinweise: https://docs.github.com/de/site-policy/privacy-policies/github-general-privacy-statement."
      ]
    }
  },
  "uk": {
    "accounts": {
      "title": "Обліковий запис і активація ліцензії",
      "paragraphs": [
        "Для входу до кабінету покупця програмного забезпечення ми обробляємо електронну адресу, ідентифікатор користувача Supabase та технічно необхідні дані сеансу. Коди входу надсилаються електронною поштою. Правова підстава: ст. 6(1)(b) GDPR.",
        "Для ліцензій обробляються придбаний продукт, стан ліцензії, посилання на замовлення, час активації та ідентифікатори пристроїв. Це потрібно для дотримання дозволеної кількості пристроїв та роботи офлайн-дозволів (ст. 6(1)(b) GDPR). Дані зберігаються протягом строку, необхідного для договору, підтримки та законних вимог."
      ]
    },
    "purchases": {
      "title": "Замовлення програм, платежі та рахунки",
      "paragraphs": [
        "Під час купівлі ми обробляємо email, товар, ціну, посилання на замовлення й оплату, платіжні реквізити для рахунка, редакції умов та ліцензії. Оплату здійснює Stripe. Повні номери банківських карток ми не отримуємо і не зберігаємо. Підстави: ст. 6(1)(b) і (c) GDPR.",
        "Політика Stripe: https://stripe.com/privacy. Resend надсилає підтвердження договору та необхідні повідомлення. Документи зберігаються відповідно до встановлених законом строків, включно з випадками повернення коштів."
      ]
    },
    "requests": {
      "title": "Відкликання договору та запити щодо даних",
      "paragraphs": [
        "Для відкликання договору ми обробляємо ім’я, email, відомості про договір, час надходження та номер запиту. Resend надсилає підтвердження отримання (ст. 6(1)(c) і (b) GDPR).",
        "Для запитів на доступ, виправлення й видалення даних обробляються відомості, необхідні для перевірки особи, відповіді й підтвердження виконання правових обов’язків (ст. 6(1)(c) GDPR)."
      ]
    },
    "diagnostics": {
      "title": "Необов’язкова діагностика бета-версії NEUROKORE",
      "paragraphs": [
        "У бета-версіях звіти про технічні помилки надсилаються лише після окремої згоди в плагіні. За замовчуванням функція вимкнена. Звіти містять версію плагіна, категорії ОС і аудіопрограми, формат, приблизні характеристики CPU/RAM, частоту дискретизації, буфер, тип помилки та інколи назву JS-файлу й номер рядка.",
        "Звіти не включають аудіо, пресети, ліцензійні ключі, імена користувачів, шляхи до файлів або довільний текст помилки. Для захисту від зловживань тимчасово обробляються IP-дані, тому повну анонімність не гарантовано. Підстава: ст. 6(1)(a) GDPR. Звіти видаляються не пізніше 90 днів."
      ]
    },
    "updates": {
      "title": "Завантаження та перевірка оновлень",
      "paragraphs": [
        "Файли можуть надаватися через Cloudflare R2 або GitHub. Під час завантаження обробляються технічні дані з’єднання, наприклад IP-адреса, час і запитаний файл (ст. 6(1)(f) GDPR).",
        "Ручна або ввімкнена користувачем автоматична перевірка оновлень звертається до GitHub Releases API. GitHub може отримувати технічні дані з’єднання. Оновлення встановлюються лише після підтвердження. Політика: https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement."
      ]
    }
  },
  "it": {
    "accounts": {
      "title": "Account cliente e attivazione delle licenze",
      "paragraphs": [
        "Per accedere all'account software trattiamo indirizzo email, identificativo utente Supabase e dati di sessione tecnicamente necessari. I codici di accesso sono inviati via email. Base giuridica: art. 6(1)(b) GDPR.",
        "Per le licenze trattiamo prodotto acquistato, stato della licenza, riferimento d'ordine, orari di attivazione e identificativi del dispositivo, necessari per gestire le postazioni consentite e le autorizzazioni offline (art. 6(1)(b) GDPR). Conserviamo i dati finché necessari per contratto, assistenza e obblighi di legge."
      ]
    },
    "purchases": {
      "title": "Acquisti software, pagamenti e fatture",
      "paragraphs": [
        "Per gli acquisti trattiamo email, prodotto, prezzo, riferimenti d'ordine e pagamento, dati di fatturazione e versioni delle condizioni contrattuali e di licenza. I pagamenti sono gestiti da Stripe. Non riceviamo o conserviamo i numeri completi delle carte. Basi giuridiche: art. 6(1)(b) e (c) GDPR.",
        "Informativa Stripe: https://stripe.com/privacy. Resend invia conferme contrattuali e comunicazioni necessarie. I documenti fiscali sono conservati per i periodi di legge; rimborsi e contestazioni possono richiedere ulteriori dati transazionali."
      ]
    },
    "requests": {
      "title": "Recesso, assistenza e richieste privacy",
      "paragraphs": [
        "Per il recesso online trattiamo nome, email, dettagli del contratto, data e ora di ricezione e numero di riferimento. Resend invia una ricevuta (art. 6(1)(c) e (b) GDPR).",
        "Per richieste di accesso, rettifica o cancellazione trattiamo i dati necessari per verificare l'identità, rispondere e documentare gli obblighi legali (art. 6(1)(c) GDPR)."
      ]
    },
    "diagnostics": {
      "title": "Diagnostica beta facoltativa di NEUROKORE",
      "paragraphs": [
        "Nelle versioni beta i report tecnici vengono inviati solo con consenso separato nel plugin, disattivato per impostazione predefinita e revocabile. Sono trasmessi versione, categorie del sistema operativo e della DAW, formato, classi CPU/RAM, frequenza di campionamento, buffer, categoria dell'errore ed eventualmente nome del file JavaScript e riga.",
        "Non vengono inviati audio, preset, chiavi di licenza, nomi utente, percorsi o messaggi liberi. La protezione temporanea contro abusi usa dati IP; non è quindi garantito anonimato assoluto. Base giuridica: art. 6(1)(a) GDPR. I report conservati sono cancellati entro 90 giorni."
      ]
    },
    "updates": {
      "title": "Download e controllo degli aggiornamenti",
      "paragraphs": [
        "I file possono essere distribuiti tramite Cloudflare R2 o GitHub, che possono trattare dati tecnici di connessione, come indirizzo IP, file richiesto e orario (art. 6(1)(f) GDPR).",
        "I controlli manuali o automatici facoltativi degli aggiornamenti interrogano la API GitHub Releases. GitHub può ricevere dati di connessione. Gli aggiornamenti non vengono installati senza conferma. Informativa: https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement."
      ]
    }
  },
  "es": {
    "accounts": {
      "title": "Cuenta de cliente y activación de licencias",
      "paragraphs": [
        "Para acceder a la cuenta de software tratamos el correo electrónico, identificador de usuario de Supabase y datos de sesión necesarios. Los códigos de acceso se envían por correo. Base jurídica: art. 6.1.b RGPD.",
        "Para las licencias tratamos producto adquirido, estado, referencia del pedido, fechas de activación e identificadores del dispositivo, necesarios para controlar los dispositivos autorizados y el uso sin conexión (art. 6.1.b RGPD). Los datos se conservan mientras sean necesarios para el contrato, asistencia y obligaciones legales."
      ]
    },
    "purchases": {
      "title": "Compras, pagos y facturación",
      "paragraphs": [
        "En las compras tratamos email, producto, precio, referencias de pedido y pago, datos de facturación y versiones de los términos y la licencia. Stripe gestiona los pagos. No recibimos ni almacenamos números completos de tarjetas. Bases jurídicas: art. 6.1.b y c RGPD.",
        "Política de Stripe: https://stripe.com/privacy. Resend envía confirmaciones de contrato y avisos necesarios. Los documentos fiscales se conservan durante los plazos legales y pueden tratarse datos para reembolsos y contracargos."
      ]
    },
    "requests": {
      "title": "Desistimiento y solicitudes de protección de datos",
      "paragraphs": [
        "Para desistimientos online tratamos nombre, email, datos del contrato, momento de recepción y referencia. Resend envía el acuse de recibo (art. 6.1.c y b RGPD).",
        "Para solicitudes de acceso, rectificación o supresión tratamos los datos necesarios para verificar la identidad, responder y acreditar el cumplimiento legal (art. 6.1.c RGPD)."
      ]
    },
    "diagnostics": {
      "title": "Diagnóstico beta opcional de NEUROKORE",
      "paragraphs": [
        "En versiones beta solo se envían informes técnicos tras consentimiento independiente dentro del plugin, desactivado por defecto y revocable. Incluyen versión, categorías de sistema y programa de audio, formato, clases aproximadas de CPU/RAM, frecuencia de muestreo, búfer, tipo de error y, en ocasiones, archivo JavaScript y número de línea.",
        "No incluyen audio, presets, claves de licencia, usuarios, rutas de archivos ni textos libres de errores. La protección temporal contra abusos utiliza datos IP, por lo que no se garantiza el anonimato absoluto. Base: art. 6.1.a RGPD. Los informes se eliminan en un máximo de 90 días."
      ]
    },
    "updates": {
      "title": "Descargas y comprobación de actualizaciones",
      "paragraphs": [
        "Los archivos pueden distribuirse mediante Cloudflare R2 o GitHub, que procesan datos técnicos de conexión, como IP, archivo solicitado y hora (art. 6.1.f RGPD).",
        "La comprobación manual u opcional automática consulta la API GitHub Releases. GitHub puede recibir datos de conexión. Las actualizaciones solo se instalan con confirmación. Información: https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement."
      ]
    }
  },
  "pt": {
    "accounts": {
      "title": "Conta de cliente e ativação de licenças",
      "paragraphs": [
        "Para iniciar sessão na conta de software tratamos email, identificador de utilizador Supabase e dados de sessão necessários. Os códigos de acesso são enviados por email. Fundamento: artigo 6.º, n.º 1, alínea b), RGPD.",
        "Para as licenças tratamos produto comprado, estado, referência da encomenda, datas de ativação e identificadores do dispositivo para gerir os dispositivos autorizados e permissões offline. Os dados são mantidos enquanto necessários ao contrato, apoio e obrigações legais."
      ]
    },
    "purchases": {
      "title": "Compras, pagamentos e faturação",
      "paragraphs": [
        "Nas compras tratamos email, produto, preço, referências da encomenda e pagamento, dados de faturação e versões dos termos e da licença. A Stripe processa os pagamentos. Não recebemos ou guardamos números completos de cartões. Fundamentos: artigo 6.º, n.º 1, alíneas b) e c), RGPD.",
        "Política Stripe: https://stripe.com/privacy. A Resend envia confirmações contratuais e notificações necessárias. Documentos fiscais são conservados pelos prazos legais, incluindo dados necessários a reembolsos."
      ]
    },
    "requests": {
      "title": "Resolução do contrato e pedidos de proteção de dados",
      "paragraphs": [
        "Para pedidos de livre resolução tratamos nome, email, detalhes contratuais, hora de receção e referência. A Resend envia a confirmação (artigo 6.º, n.º 1, alíneas b) e c), RGPD).",
        "Para pedidos de acesso, retificação ou apagamento tratamos os dados necessários para verificar identidade, responder e comprovar obrigações legais (artigo 6.º, n.º 1, alínea c), RGPD)."
      ]
    },
    "diagnostics": {
      "title": "Diagnóstico beta opcional do NEUROKORE",
      "paragraphs": [
        "Em versões beta, os relatórios técnicos exigem consentimento separado no plugin, desligado por defeito e revogável. Incluem versão, categorias do sistema operativo e aplicação de áudio, formato, classes CPU/RAM, frequência de amostragem, buffer, tipo de erro e, ocasionalmente, ficheiro JavaScript e linha.",
        "Não incluem áudio, presets, chaves, nomes, caminhos ou mensagens livres. A proteção temporária contra abusos processa dados IP, pelo que não se garante anonimato absoluto. Fundamento: artigo 6.º, n.º 1, alínea a), RGPD. Os relatórios são apagados em até 90 dias."
      ]
    },
    "updates": {
      "title": "Transferências e verificação de atualizações",
      "paragraphs": [
        "Os ficheiros podem ser distribuídos através da Cloudflare R2 ou GitHub, processando dados técnicos de ligação, como IP, ficheiro pedido e hora (artigo 6.º, n.º 1, alínea f), RGPD).",
        "A verificação manual ou automática opcional utiliza a API GitHub Releases. O GitHub pode receber dados de ligação. As atualizações só são instaladas após confirmação. Política: https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement."
      ]
    }
  },
  "ja": {
    "accounts": {
      "title": "顧客アカウントとライセンス認証",
      "paragraphs": [
        "ソフトウェアの顧客アカウントへのログインでは、メールアドレス、SupabaseのユーザーID、技術的に必要なセッション情報を処理します。ログインコードはメールで送信します。法的根拠はGDPR第6条第1項(b)です。",
        "ライセンス管理では、購入製品、状態、注文番号、認証日時、端末識別子を処理し、利用可能な端末数とオフライン認証を管理します。契約履行、サポート、法的義務に必要な期間保存します。"
      ]
    },
    "purchases": {
      "title": "ソフトウェア購入、支払い、請求書",
      "paragraphs": [
        "購入時にはメールアドレス、商品、価格、注文・決済番号、請求情報、契約条件とライセンスの版を処理します。決済はStripeが担当し、当サイトはカード番号全体を取得・保存しません。法的根拠はGDPR第6条第1項(b)および(c)です。",
        "Stripeのプライバシーポリシー: https://stripe.com/privacy。Resendから契約確認等の必要なメールを送信します。会計書類は法定期間保管し、返金時にも関連する取引情報を処理します。"
      ]
    },
    "requests": {
      "title": "契約撤回と個人情報に関する請求",
      "paragraphs": [
        "オンラインで契約撤回する場合、氏名、メール、契約内容、受付時刻、参照番号を処理し、Resendから受付確認を送ります（GDPR第6条第1項(b)、(c)）。",
        "開示、訂正、削除の請求では、本人確認、回答、法令遵守の記録に必要な情報を処理します（GDPR第6条第1項(c)）。"
      ]
    },
    "diagnostics": {
      "title": "NEUROKOREベータ版の任意診断",
      "paragraphs": [
        "ベータ版の技術診断は、プラグイン内で別途同意した場合にのみ送信します。初期設定はオフで、いつでも解除できます。収集項目はバージョン、OS・DAWの分類、形式、概略CPU/RAM、サンプルレート、バッファサイズ、エラー分類、場合によってはJavaScriptファイル名と行番号です。",
        "音声、プリセット、ライセンスキー、ユーザー名、ファイルパス、自由記述のエラー文は送信しません。不正利用対策では一時的にIP関連情報を使用するため、完全な匿名性は保証しません。根拠はGDPR第6条第1項(a)。保存された診断情報は90日以内に削除します。"
      ]
    },
    "updates": {
      "title": "ダウンロードと更新確認",
      "paragraphs": [
        "ファイルはCloudflare R2またはGitHub経由で配信される場合があります。配信時にはIPアドレス、要求したファイル、日時など技術的接続情報が処理されます（GDPR第6条第1項(f)）。",
        "手動または任意の自動更新確認ではGitHub Releases APIに接続します。GitHubが接続情報を取得する場合があります。更新は確認なしにインストールされません。詳細: https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement。"
      ]
    }
  },
  "ko": {
    "accounts": {
      "title": "고객 계정 및 라이선스 활성화",
      "paragraphs": [
        "소프트웨어 계정 로그인 시 이메일 주소, Supabase 사용자 ID, 기술적으로 필요한 세션 정보를 처리합니다. 로그인 코드는 이메일로 전송합니다. 법적 근거는 GDPR 제6조 제1항 (b)입니다.",
        "라이선스 관리에는 구매 제품, 라이선스 상태, 주문 참조, 활성화 시각, 장치 식별자를 사용하여 허용 장치 수와 오프라인 승인을 관리합니다. 계약 이행, 지원 및 법적 의무에 필요한 기간 동안 보관합니다."
      ]
    },
    "purchases": {
      "title": "소프트웨어 구매, 결제 및 청구",
      "paragraphs": [
        "구매 시 이메일, 제품, 가격, 주문·결제 참조, 청구 정보, 계약 및 라이선스 버전을 처리합니다. 결제는 Stripe가 담당하며, 전체 카드 번호는 당사가 수집하거나 저장하지 않습니다. 근거는 GDPR 제6조 제1항 (b) 및 (c)입니다.",
        "Stripe 정책: https://stripe.com/privacy. Resend로 계약 확인 및 필요한 안내를 발송합니다. 회계 자료는 법정 보존 기간 동안 유지하며 환불 처리에 필요한 거래 정보도 처리할 수 있습니다."
      ]
    },
    "requests": {
      "title": "계약 철회 및 개인정보 요청",
      "paragraphs": [
        "온라인 계약 철회 시 이름, 이메일, 계약 내용, 접수 시각, 참조번호를 처리하며 Resend로 접수 확인을 보냅니다(GDPR 제6조 제1항 (b), (c)).",
        "열람·정정·삭제 요청에는 신원 확인, 답변 및 법적 의무 이행 기록에 필요한 정보를 처리합니다(GDPR 제6조 제1항 (c))."
      ]
    },
    "diagnostics": {
      "title": "선택형 NEUROKORE 베타 진단",
      "paragraphs": [
        "베타 버전의 기술 오류 보고는 플러그인에서 별도로 동의한 경우에만 전송됩니다. 기본값은 꺼짐이며 언제든 철회할 수 있습니다. 버전, OS·DAW 분류, 형식, 대략적 CPU/RAM, 샘플 속도, 버퍼 크기, 오류 종류와 경우에 따라 JavaScript 파일명 및 줄 번호가 포함됩니다.",
        "오디오, 프리셋, 라이선스 키, 사용자 이름, 파일 경로 또는 자유 형식 오류 메시지는 포함되지 않습니다. 남용 방지에는 일시적으로 IP 관련 정보를 사용하므로 완전 익명은 보장되지 않습니다. 근거는 GDPR 제6조 제1항 (a)입니다. 저장된 진단 정보는 90일 이내 삭제됩니다."
      ]
    },
    "updates": {
      "title": "다운로드와 업데이트 확인",
      "paragraphs": [
        "소프트웨어 파일은 Cloudflare R2 또는 GitHub에서 제공될 수 있으며 IP 주소, 요청 파일, 시각 등 기술적 접속 정보가 처리될 수 있습니다(GDPR 제6조 제1항 (f)).",
        "수동 또는 선택형 자동 업데이트 확인은 GitHub Releases API를 호출합니다. GitHub가 기술적 접속 정보를 수신할 수 있습니다. 설치는 사용자의 확인 후에만 이루어집니다. 정책: https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement."
      ]
    }
  }
}

for (const locale of LEGAL_LOCALES) {
  Object.assign(PRIVACY_COPY[locale], PRIVACY_SERVICE_DETAILS[locale])
}

const PRIVACY_PRIMARY_REGION: Record<LegalLocale, string> = {
  "en": "The primary Supabase database for this website is currently hosted in London, United Kingdom (eu-west-2), outside the EU/EEA. The EU has an adequacy decision for the United Kingdom. Provider support access and other international transfers are addressed separately below.",
  "de": "Die primäre Supabase-Datenbank dieser Website wird derzeit in London, Vereinigtes Königreich (eu-west-2), betrieben und liegt damit außerhalb der EU und des EWR. Für das Vereinigte Königreich besteht ein Angemessenheitsbeschluss der EU. Etwaige internationale Zugriffe durch Dienstleister werden weiter unten erläutert.",
  "uk": "Основна база даних Supabase наразі розміщена в Лондоні, Велика Британія (eu-west-2), поза ЄС/ЄЕЗ. Для Великої Британії діє рішення ЄС про належний рівень захисту. Інші міжнародні передавання описані нижче.",
  "it": "Il database principale Supabase è attualmente ospitato a Londra, Regno Unito (eu-west-2), fuori dall'UE/SEE. Per il Regno Unito esiste una decisione di adeguatezza dell'UE. Altri trasferimenti internazionali sono descritti più avanti.",
  "es": "La base de datos principal de Supabase está alojada actualmente en Londres, Reino Unido (eu-west-2), fuera de la UE/EEE. El Reino Unido cuenta con una decisión de adecuación de la UE. Otros accesos y transferencias internacionales se explican más adelante.",
  "pt": "A base de dados principal Supabase está atualmente alojada em Londres, Reino Unido (eu-west-2), fora da UE/EEE. Existe uma decisão de adequação da UE para o Reino Unido. Outros acessos e transferências internacionais são explicados abaixo.",
  "ja": "Supabaseの主要データベースは現在、EU/EEA域外の英国ロンドン（eu-west-2）で運用されています。英国についてはEUの十分性認定があります。その他の国際的なデータ移転については後述します。",
  "ko": "Supabase 기본 데이터베이스는 현재 EU/EEA 외부인 영국 런던(eu-west-2)에 위치합니다. 영국에는 EU 적정성 결정이 적용됩니다. 다른 국외 이전 및 접근은 아래에서 설명합니다."
}

for (const locale of LEGAL_LOCALES) {
  PRIVACY_COPY[locale].hosting.paragraphs.push(PRIVACY_PRIMARY_REGION[locale])
  for (const [index, id] of (['accounts', 'purchases', 'requests', 'diagnostics', 'updates'] as const).entries()) {
    PRIVACY_COPY[locale][id].title = String(index + 12) + '. ' + PRIVACY_COPY[locale][id].title
  }
  PRIVACY_COPY[locale].rights.title = PRIVACY_COPY[locale].rights.title.replace(/^12\.\s*/, '17. ')
}

// Legal notices do not require blanket liability disclaimers. The former
// liability sections cited repealed/misapplied DDG provisions (§§ 8–10).
// Keep operator, editorial responsibility, dispute information and copyright.
export const NOTICE_SECTION_ORDER = [
  'operator',
  'responsible',
  'dispute',
  'copyright',
] as const

export const PRIVACY_SECTION_ORDER = [
  'overview',
  'hosting',
  'controller',
  'storage',
  'contact',
  'newsletter',
  'news',
  'cdn',
  'embeds',
  'external-links',
  'transfers',
  'accounts',
  'purchases',
  'requests',
  'diagnostics',
  'updates',
  'rights',
] as const
