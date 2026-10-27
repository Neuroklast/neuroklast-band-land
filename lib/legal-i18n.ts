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
        'This website is hosted by Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, USA. When you visit our website, personal data such as your IP address may be processed on Vercel servers. This may involve transfers to the USA. See Vercel\'s privacy policy: https://vercel.com/legal/privacy-policy',
        'The legal basis is Art. 6(1)(f) GDPR (legitimate interest in reliable website presentation).',
        'We use Supabase (database and authentication for the admin area), Cloudflare R2 (media files; EU jurisdiction where configured), and Resend (transactional emails for contact requests, purchase confirmations and withdrawal receipts — no mailing list) as processors. Data processing agreements (DPAs) and storage regions should be configured in each provider dashboard. These providers process data only as necessary to operate the website.',
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
        'We store your cookie consent preferences in localStorage (key: zd-cookie-consent). This is technically necessary to remember your choice. Legal basis: Art. 6(1)(f) GDPR and § 25(2) TDDDG.',
        'Functional preferences (language, theme, sound mute state) may be stored in localStorage without analytics consent because they are strictly necessary for your chosen experience. Legal basis: Art. 6(1)(f) GDPR.',
        'An IndexedDB image cache may store compressed images locally to improve performance. No personal profiles are created. Legal basis: Art. 6(1)(f) GDPR.',
        'If you consent to analytics, we may store first-party usage events (page views, section views, clicks with relative coordinates) on our servers (Supabase table analytics_events). No advertising network is involved. Retention: events are kept for up to 90 days for reporting, then removed through a protected daily retention job when configured; you may request earlier erasure. You can revoke consent at any time via "Cookie Preferences" in the footer.',
        'Admin authentication uses HttpOnly session cookies (Supabase). These are not set for regular visitors.',
      ],
    },
    contact: {
      title: '5. Contact form',
      paragraphs: [
        'When you submit our contact form, we process: name, email address, subject, and message.',
        'Your message is transmitted to us by email via Resend. We do not operate an inbox or ticket system on this website, and we do not store contact submissions in our database. We do not sell or share this data with third parties for marketing purposes. A privacy notice with a link to this policy is shown next to the form.',
        'Legal basis: Art. 6(1)(b) GDPR (pre-contractual communication) or Art. 6(1)(f) GDPR (legitimate interest in responding to inquiries).',
        'Data is deleted after your request has been processed, unless statutory retention obligations require longer storage.',
        'Public forms are rate-limited and protected against automated abuse (pseudonymised IP hashes may be stored briefly for security). Legal basis: Art. 6(1)(f) GDPR.',
      ],
    },
    newsletter: {
      title: '6. No newsletter',
      paragraphs: [
        'This website does not offer a newsletter, mailing list, or email subscription. Contact requests are delivered through Resend email. We do not store subscriber addresses.',
      ],
    },
    news: {
      title: '7. News and blog content',
      paragraphs: [
        'Public news posts are editorial content (title, text, optional cover image). Reading news does not require an account and does not create a personal profile.',
        'Cover images may be delivered via our media CDN (Cloudflare R2) or image proxy (wsrv.nl) as described below. Legal basis: Art. 6(1)(f) GDPR.',
      ],
    },
    cdn: {
      title: '8. Image CDN (wsrv.nl) and web fonts',
      paragraphs: [
        'To improve loading speed, images may be delivered via wsrv.nl (Images.weserv.nl). When your browser requests an image, wsrv.nl may temporarily process your IP address to deliver the content.',
        'wsrv.nl does not set tracking cookies. Legal basis: Art. 6(1)(f) GDPR (legitimate interest in fast image delivery). More information: https://wsrv.nl',
        'Default website fonts (JetBrains Mono, Space Grotesk, Orbitron, Share Tech Mono and Space Mono) are self-hosted at build time. Choosing other fonts in the appearance settings does not load external Google Fonts; local fallbacks are used instead.',
      ],
    },
    embeds: {
      title: '9. Third-party embeds (Spotify, YouTube)',
      paragraphs: [
        'Embedded media players (Spotify artist player, YouTube) are NOT loaded automatically. They only load after you explicitly click a load button (two-click method). The Listen section on the homepage uses this Spotify embed.',
        'When activated, your IP address and browser data may be transmitted to Spotify AB (Sweden) or Google/YouTube (USA). Legal basis: Art. 6(1)(a) GDPR (your explicit consent).',
        'Spotify privacy policy: https://www.spotify.com/legal/privacy-policy/',
        'Google privacy policy: https://policies.google.com/privacy',
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
        'Some processors (Vercel, Cloudflare, Resend, Google/YouTube when embeds are activated, wsrv.nl) may process data outside the EU/EEA, including the USA. Transfers are based on appropriate safeguards such as EU Standard Contractual Clauses or an adequacy decision (e.g. EU-US Data Privacy Framework) where applicable. The operator should conclude DPAs with each processor.',
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
        'Diese Website wird bei Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, USA gehostet. Beim Besuch der Website können personenbezogene Daten wie Ihre IP-Adresse auf Servern von Vercel verarbeitet werden; dies kann eine Übermittlung in die USA beinhalten. Datenschutzerklärung von Vercel: https://vercel.com/legal/privacy-policy',
        'Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an einer zuverlässigen Bereitstellung der Website).',
        'Als weitere Auftragsverarbeiter nutzen wir Supabase (Datenbank und Admin-Authentifizierung), Cloudflare R2 (Mediendateien; EU-Jurisdiction soweit konfiguriert) und Resend (transaktionale E-Mails für Kontaktanfragen, Kaufbestätigungen und Widerrufsbestätigungen — keine Mailingliste). Auftragsverarbeitungsverträge (AVV/DPA) und Speicherregionen sind in den jeweiligen Anbieter-Dashboards zu konfigurieren.',
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
        'Ihre Cookie-Einstellungen speichern wir in localStorage (Schlüssel: zd-cookie-consent). Das ist technisch erforderlich, um Ihre Wahl zu merken. Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO und § 25 Abs. 2 TDDDG.',
        'Funktionale Einstellungen (Sprache, Theme, Ton) können ohne Analytics-Einwilligung in localStorage gespeichert werden, weil sie für die von Ihnen gewählte Nutzung erforderlich sind. Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO.',
        'Ein IndexedDB-Bildcache kann komprimierte Bilder lokal speichern, um die Performance zu verbessern. Es werden keine Personenprofile gebildet. Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO.',
        'Wenn Sie Analytics zustimmen, können wir First-Party-Nutzungsereignisse (Seitenaufrufe, Abschnittsansichten, Klicks mit relativen Koordinaten) auf unseren Servern speichern (Supabase-Tabelle analytics_events). Es ist kein Werbenetzwerk beteiligt. Speicherdauer: bis zu 90 Tage für Auswertungen, danach automatische Bereinigung durch einen geschützten täglichen Auftrag, sofern konfiguriert; frühere Löschung auf Anfrage. Widerruf jederzeit über „Cookie-Einstellungen“ im Footer.',
        'Admin-Authentifizierung nutzt HttpOnly-Session-Cookies (Supabase). Für normale Besucher werden diese nicht gesetzt.',
      ],
    },
    contact: {
      title: '5. Kontaktformular',
      paragraphs: [
        'Wenn Sie unser Kontaktformular nutzen, verarbeiten wir: Name, E-Mail-Adresse, Betreff und Nachricht.',
        'Die Nachricht wird per E-Mail über Resend an uns übermittelt. Es gibt kein Postfach- oder Ticketsystem auf der Website; Kontaktanfragen werden nicht in unserer Datenbank gespeichert. Eine Weitergabe zu Marketingzwecken an Dritte findet nicht statt. Am Formular wird auf diese Datenschutzerklärung hingewiesen.',
        'Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO (vorvertragliche Kommunikation) oder Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an der Beantwortung von Anfragen).',
        'Die Daten werden nach abschließender Bearbeitung Ihrer Anfrage gelöscht, sofern keine gesetzlichen Aufbewahrungspflichten bestehen.',
        'Formulare sind rate-limitiert; pseudonymisierte IP-Hashes können kurzzeitig zu Sicherheitszwecken gespeichert werden. Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO.',
      ],
    },
    newsletter: {
      title: '6. Kein Newsletter',
      paragraphs: [
        'Diese Website bietet keinen Newsletter, keine Mailingliste und kein E-Mail-Abo. Kontaktanfragen werden über Resend per E-Mail zugestellt. Es werden keine Abonnentenadressen gespeichert.',
      ],
    },
    news: {
      title: '7. News und redaktionelle Inhalte',
      paragraphs: [
        'Öffentliche News-Beiträge sind redaktionelle Inhalte. Das Lesen erfordert kein Konto und erzeugt kein Personenprofil.',
        'Titelbilder können über Cloudflare R2 oder den Bild-Proxy wsrv.nl ausgeliefert werden. Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO.',
      ],
    },
    cdn: {
      title: '8. Bild-CDN (wsrv.nl) und Webfonts',
      paragraphs: [
        'Zur Performance-Optimierung können Bilder über wsrv.nl ausgeliefert werden. Dabei kann Ihre IP-Adresse kurzzeitig verarbeitet werden.',
        'wsrv.nl setzt keine Tracking-Cookies. Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO. Weitere Informationen: https://wsrv.nl',
        'Die Standardschriften (JetBrains Mono, Space Grotesk, Orbitron, Share Tech Mono und Space Mono) werden beim Build lokal eingebunden. Für andere Schriftwahlen im Design wird keine Verbindung zu Google Fonts aufgebaut, sondern eine lokal verfügbare Ersatzschrift verwendet.',
      ],
    },
    embeds: {
      title: '9. Drittanbieter-Embeds (Spotify, YouTube)',
      paragraphs: [
        'Eingebettete Media-Player (Spotify-Artist-Player, YouTube) werden NICHT automatisch geladen. Sie laden erst nach explizitem Klick (Zwei-Klick-Lösung). Der Bereich „Hören“ auf der Startseite nutzt dieses Spotify-Embed.',
        'Nach Aktivierung können IP-Adresse und Browserdaten an Spotify AB (Schweden) bzw. Google/YouTube (USA) übermittelt werden. Rechtsgrundlage: Art. 6 Abs. 1 lit. a DSGVO (Einwilligung).',
        'Datenschutz Spotify: https://www.spotify.com/legal/privacy-policy/',
        'Datenschutz Google: https://policies.google.com/privacy',
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
        'Einige Auftragsverarbeiter (Vercel, Cloudflare, Resend, Google/YouTube bei aktivierten Embeds, wsrv.nl) können Daten außerhalb der EU/des EWR verarbeiten, einschließlich der USA. Übermittlungen erfolgen auf Grundlage geeigneter Garantien wie EU-Standardvertragsklauseln oder eines Angemessenheitsbeschlusses (z. B. EU-US Data Privacy Framework), soweit anwendbar. Der Betreiber sollte mit jedem Auftragsverarbeiter einen AVV/DPA abschließen.',
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
        'Сайт розміщено у Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, США. Під час відвідування IP-адреса може оброблятися на серверах Vercel, зокрема з передачею до США. Політика Vercel: https://vercel.com/legal/privacy-policy',
        'Правова підстава: ст. 6(1)(f) GDPR (законний інтерес у надійній роботі сайту).',
        'Як обробники також використовуються Supabase (база даних і автентифікація адмінки), Cloudflare R2 (медіа; юрисдикція ЄС за можливості) та Resend (транзакційні листи для контактів, підтверджень покупок і відкликання договорів — без розсилки). DPA та регіони зберігання налаштовуються в кабінетах провайдерів.',
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
        'Вибір щодо cookies зберігається в localStorage (ключ: zd-cookie-consent). Це технічно необхідно. Підстава: ст. 6(1)(f) GDPR і § 25(2) TDDDG.',
        'Функціональні налаштування (мова, тема, звук) можуть зберігатися без згоди на аналітику. Підстава: ст. 6(1)(f) GDPR.',
        'IndexedDB може кешувати стиснуті зображення локально. Профілі осіб не створюються. Підстава: ст. 6(1)(f) GDPR.',
        'За згодою на аналітику ми можемо зберігати first-party події (перегляди сторінок і секцій, кліки з відносними координатами) на наших серверах (таблиця analytics_events). Рекламної мережі немає. Зберігання: до 90 днів. Відкликати згоду можна в «Налаштуваннях cookies» у футері.',
        'Адмін-автентифікація використовує HttpOnly-сесійні cookies (Supabase). Для звичайних відвідувачів вони не встановлюються.',
      ],
    },
    contact: {
      title: '5. Контактна форма',
      paragraphs: [
        'Під час надсилання форми ми обробляємо ім’я, e-mail, тему та повідомлення.',
        'Повідомлення надходить нам електронною поштою через Resend. На сайті немає скриньки чи тікет-системи; заявки не зберігаються в базі. Дані не продаються третім особам для маркетингу.',
        'Підстава: ст. 6(1)(b) GDPR або ст. 6(1)(f) GDPR.',
        'Дані видаляються після обробки запиту, якщо немає законних строків зберігання.',
        'Форми мають обмеження частоти запитів; псевдонімізовані хеші IP можуть коротко зберігатися з міркувань безпеки. Підстава: ст. 6(1)(f) GDPR.',
      ],
    },
    newsletter: {
      title: '6. Немає розсилки',
      paragraphs: [
        'Цей сайт не пропонує newsletter, mailing list чи e-mail-підписку. Контактні запити доставляються через Resend. Адреси підписників не зберігаються.',
      ],
    },
    news: {
      title: '7. Новини та редакційний контент',
      paragraphs: [
        'Публічні новини — редакційний контент. Читання не потребує облікового запису й не створює профілю.',
        'Обкладинки можуть доставлятися через Cloudflare R2 або проксі wsrv.nl. Підстава: ст. 6(1)(f) GDPR.',
      ],
    },
    cdn: {
      title: '8. CDN зображень (wsrv.nl) і вебшрифти',
      paragraphs: [
        'Для швидкості зображення можуть доставлятися через wsrv.nl. При цьому IP може короткочасно оброблятися.',
        'wsrv.nl не встановлює трекінгових cookies. Підстава: ст. 6(1)(f) GDPR. Деталі: https://wsrv.nl',
        'Стандартні шрифти (JetBrains Mono, Space Grotesk, Orbitron, Share Tech Mono, Space Mono) розміщені локально. Інші налаштування використовують локальні резервні шрифти без запитів до Google Fonts.',
      ],
    },
    embeds: {
      title: '9. Сторонні вбудови (Spotify, YouTube)',
      paragraphs: [
        'Медіаплеєри (Spotify, YouTube) НЕ завантажуються автоматично. Лише після явного кліку (двокроковий метод). Розділ «Слухати» на головній використовує Spotify-вбудову.',
        'Після активації IP і дані браузера можуть передаватися Spotify AB (Швеція) або Google/YouTube (США). Підстава: ст. 6(1)(a) GDPR (згода).',
        'Політика Spotify: https://www.spotify.com/legal/privacy-policy/',
        'Політика Google: https://policies.google.com/privacy',
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
        'Деякі обробники (Vercel, Cloudflare, Resend, Google/YouTube після активації вбудов, wsrv.nl) можуть обробляти дані поза ЄС/ЄЕЗ, зокрема в США. Передача ґрунтується на SCC або рішенні про адекватність (наприклад EU-US Data Privacy Framework). Оператор має укласти DPA з кожним обробником.',
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
        'Il sito è ospitato da Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, USA. Visitando il sito, dati come l’indirizzo IP possono essere trattati su server Vercel, anche con trasferimento negli USA. Informativa Vercel: https://vercel.com/legal/privacy-policy',
        'Base giuridica: art. 6(1)(f) GDPR (interesse legittimo a una presentazione affidabile del sito).',
        'Utilizziamo come responsabili del trattamento Supabase (database e autenticazione admin), Cloudflare R2 (media; giurisdizione UE se configurata) e Resend (e-mail transazionali per contatti, conferme di acquisto e recessi — nessuna mailing list). I DPA e le regioni di archiviazione vanno configurati nei pannelli dei fornitori.',
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
        'Memorizziamo le preferenze cookie in localStorage (chiave: zd-cookie-consent). È tecnicamente necessario. Base: art. 6(1)(f) GDPR e § 25(2) TDDDG.',
        'Preferenze funzionali (lingua, tema, audio) possono essere salvate senza consenso alle analitiche. Base: art. 6(1)(f) GDPR.',
        'Una cache IndexedDB può salvare immagini compresse in locale. Non si creano profili. Base: art. 6(1)(f) GDPR.',
        'Con il consenso alle analitiche possiamo salvare eventi first-party (visite, sezioni, clic con coordinate relative) sui nostri server (tabella analytics_events). Nessuna rete pubblicitaria. Conservazione: fino a 90 giorni. Revoca in qualsiasi momento da «Preferenze cookie» nel footer.',
        'L’autenticazione admin usa cookie di sessione HttpOnly (Supabase). Non sono impostati per i visitatori ordinari.',
      ],
    },
    contact: {
      title: '5. Modulo di contatto',
      paragraphs: [
        'Inviando il modulo trattiamo: nome, e-mail, oggetto e messaggio.',
        'Il messaggio ci arriva via e-mail tramite Resend. Non gestiamo una casella o un sistema ticket sul sito e non memorizziamo i messaggi nel database. Non vendiamo i dati a terzi per marketing.',
        'Base giuridica: art. 6(1)(b) GDPR o art. 6(1)(f) GDPR.',
        'I dati sono cancellati dopo la gestione della richiesta, salvo obblighi di conservazione.',
        'I moduli sono soggetti a rate-limit; hash IP pseudonimizzati possono essere conservati brevemente per sicurezza. Base: art. 6(1)(f) GDPR.',
      ],
    },
    newsletter: {
      title: '6. Nessuna newsletter',
      paragraphs: [
        'Questo sito non offre newsletter, mailing list né abbonamento e-mail. Le richieste di contatto vengono recapitate tramite Resend. Non memorizziamo indirizzi di iscritti.',
      ],
    },
    news: {
      title: '7. News e contenuti editoriali',
      paragraphs: [
        'I post pubblici sono contenuti editoriali. La lettura non richiede un account e non crea un profilo.',
        'Le copertine possono essere consegnate via Cloudflare R2 o proxy wsrv.nl. Base: art. 6(1)(f) GDPR.',
      ],
    },
    cdn: {
      title: '8. CDN immagini (wsrv.nl) e web font',
      paragraphs: [
        'Per la velocità le immagini possono essere consegnate via wsrv.nl. L’IP può essere trattato temporaneamente.',
        'wsrv.nl non imposta cookie di tracciamento. Base: art. 6(1)(f) GDPR. Info: https://wsrv.nl',
        'I font standard (JetBrains Mono, Space Grotesk, Orbitron, Share Tech Mono e Space Mono) sono ospitati localmente. Le altre selezioni usano font sostitutivi locali e non caricano Google Fonts.',
      ],
    },
    embeds: {
      title: '9. Incorporamenti di terzi (Spotify, YouTube)',
      paragraphs: [
        'I player (Spotify, YouTube) NON si caricano automaticamente. Solo dopo un clic esplicito (metodo two-click). La sezione Ascolta in home usa questo embed Spotify.',
        'Dopo l’attivazione IP e dati del browser possono essere trasmessi a Spotify AB (Svezia) o Google/YouTube (USA). Base: art. 6(1)(a) GDPR (consenso).',
        'Privacy Spotify: https://www.spotify.com/legal/privacy-policy/',
        'Privacy Google: https://policies.google.com/privacy',
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
        'Alcuni responsabili (Vercel, Cloudflare, Resend, Google/YouTube se gli embed sono attivati, wsrv.nl) possono trattare dati fuori dallo SEE, inclusi gli USA. I trasferimenti si basano su SCC o decisioni di adeguatezza (es. EU-US Data Privacy Framework). Il gestore dovrebbe stipulare DPA con ciascun responsabile.',
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
        'Este sitio está alojado en Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, EE. UU. Al visitarlo, datos como tu IP pueden tratarse en servidores de Vercel, lo que puede implicar transferencias a EE. UU. Política de Vercel: https://vercel.com/legal/privacy-policy',
        'Base jurídica: art. 6(1)(f) RGPD (interés legítimo en una presentación fiable del sitio).',
        'Usamos como encargados Supabase (base de datos y autenticación de admin), Cloudflare R2 (medios; jurisdicción UE si está configurada) y Resend (correo transaccional para consultas, confirmaciones de compra y desistimientos — sin lista de correo). Los DPA y las regiones de almacenamiento deben configurarse en cada proveedor.',
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
        'Guardamos tus preferencias de cookies en localStorage (clave: zd-cookie-consent). Es técnicamente necesario. Base: art. 6(1)(f) RGPD y § 25(2) TDDDG.',
        'Preferencias funcionales (idioma, tema, sonido) pueden guardarse sin consentimiento de analítica. Base: art. 6(1)(f) RGPD.',
        'Una caché IndexedDB puede guardar imágenes comprimidas en local. No se crean perfiles. Base: art. 6(1)(f) RGPD.',
        'Si consientes la analítica, podemos guardar eventos first-party (páginas, secciones, clics con coordenadas relativas) en nuestros servidores (tabla analytics_events). No hay red publicitaria. Conservación: hasta 90 días. Puedes revocar el consentimiento en «Preferencias de cookies» del pie.',
        'La autenticación de admin usa cookies de sesión HttpOnly (Supabase). No se establecen para visitantes habituales.',
      ],
    },
    contact: {
      title: '5. Formulario de contacto',
      paragraphs: [
        'Al enviar el formulario tratamos: nombre, correo, asunto y mensaje.',
        'El mensaje nos llega por correo a través de Resend. No hay bandeja ni sistema de tickets en el sitio; no almacenamos envíos en la base de datos. No vendemos los datos a terceros con fines de marketing.',
        'Base jurídica: art. 6(1)(b) RGPD o art. 6(1)(f) RGPD.',
        'Los datos se eliminan tras tramitar la solicitud, salvo plazos legales de conservación.',
        'Los formularios tienen límite de frecuencia; hashes de IP seudonimizados pueden guardarse brevemente por seguridad. Base: art. 6(1)(f) RGPD.',
      ],
    },
    newsletter: {
      title: '6. Sin boletín',
      paragraphs: [
        'Este sitio no ofrece newsletter, lista de correo ni suscripción por e-mail. Los mensajes del formulario se entregan a través de Resend. No almacenamos direcciones de suscriptores.',
      ],
    },
    news: {
      title: '7. Noticias y contenido editorial',
      paragraphs: [
        'Las noticias públicas son contenido editorial. Leerlas no requiere cuenta ni crea un perfil.',
        'Las portadas pueden servirse vía Cloudflare R2 o el proxy wsrv.nl. Base: art. 6(1)(f) RGPD.',
      ],
    },
    cdn: {
      title: '8. CDN de imágenes (wsrv.nl) y fuentes web',
      paragraphs: [
        'Para la velocidad, las imágenes pueden servirse vía wsrv.nl. La IP puede tratarse temporalmente.',
        'wsrv.nl no establece cookies de seguimiento. Base: art. 6(1)(f) RGPD. Más información: https://wsrv.nl',
        'Las fuentes estándar (JetBrains Mono, Space Grotesk, Orbitron, Share Tech Mono y Space Mono) se alojan localmente. Otras fuentes utilizan alternativas locales sin cargar Google Fonts.',
      ],
    },
    embeds: {
      title: '9. Incrustaciones de terceros (Spotify, YouTube)',
      paragraphs: [
        'Los reproductores (Spotify, YouTube) NO se cargan automáticamente. Solo tras un clic explícito (método de dos clics). La sección Escuchar de la portada usa este embed de Spotify.',
        'Al activarse, la IP y datos del navegador pueden transmitirse a Spotify AB (Suecia) o Google/YouTube (EE. UU.). Base: art. 6(1)(a) RGPD (consentimiento).',
        'Privacidad de Spotify: https://www.spotify.com/legal/privacy-policy/',
        'Privacidad de Google: https://policies.google.com/privacy',
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
        'Algunos encargados (Vercel, Cloudflare, Resend, Google/YouTube si se activan los embeds, wsrv.nl) pueden tratar datos fuera del EEE, incluidos EE. UU. Las transferencias se basan en CCT o una decisión de adecuación (p. ej. EU-US Data Privacy Framework). El operador debe celebrar DPA con cada encargado.',
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
        'Este sítio é alojado pela Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, EUA. Ao visitá-lo, dados como o seu IP podem ser tratados em servidores da Vercel, o que pode implicar transferências para os EUA. Política da Vercel: https://vercel.com/legal/privacy-policy',
        'Base jurídica: art. 6.º(1)(f) RGPD (interesse legítimo numa apresentação fiável do sítio).',
        'Utilizamos como subcontratantes a Supabase (base de dados e autenticação de admin), a Cloudflare R2 (média; jurisdição da UE se configurada) e a Resend (e-mails transacionais de contactos, confirmações de compra e resolução — sem lista de correio). Os DPA e as regiões de armazenamento devem ser configurados em cada fornecedor.',
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
        'Guardamos as preferências de cookies em localStorage (chave: zd-cookie-consent). É tecnicamente necessário. Base: art. 6.º(1)(f) RGPD e § 25(2) TDDDG.',
        'Preferências funcionais (idioma, tema, som) podem ser guardadas sem consentimento de análise. Base: art. 6.º(1)(f) RGPD.',
        'Uma cache IndexedDB pode guardar imagens comprimidas localmente. Não se criam perfis. Base: art. 6.º(1)(f) RGPD.',
        'Com consentimento de análise, podemos guardar eventos first-party (páginas, secções, cliques com coordenadas relativas) nos nossos servidores (tabela analytics_events). Não há rede publicitária. Conservação: até 90 dias. Pode revogar o consentimento em «Preferências de cookies» no rodapé.',
        'A autenticação de admin usa cookies de sessão HttpOnly (Supabase). Não são definidos para visitantes habituais.',
      ],
    },
    contact: {
      title: '5. Formulário de contacto',
      paragraphs: [
        'Ao enviar o formulário tratamos: nome, e-mail, assunto e mensagem.',
        'A mensagem chega-nos por e-mail via Resend. Não há caixa de entrada nem sistema de tickets no sítio; não armazenamos envios na base de dados. Não vendemos os dados a terceiros para marketing.',
        'Base jurídica: art. 6.º(1)(b) RGPD ou art. 6.º(1)(f) RGPD.',
        'Os dados são apagados após o tratamento do pedido, salvo prazos legais de conservação.',
        'Os formulários têm limite de frequência; hashes de IP pseudonimizados podem ser guardados brevemente por segurança. Base: art. 6.º(1)(f) RGPD.',
      ],
    },
    newsletter: {
      title: '6. Sem newsletter',
      paragraphs: [
        'Este sítio não oferece newsletter, lista de correio nem subscrição por e-mail. Os pedidos de contacto são entregues através da Resend. Não armazenamos endereços de subscritores.',
      ],
    },
    news: {
      title: '7. Notícias e conteúdo editorial',
      paragraphs: [
        'As notícias públicas são conteúdo editorial. A leitura não exige conta nem cria um perfil.',
        'As capas podem ser servidas via Cloudflare R2 ou o proxy wsrv.nl. Base: art. 6.º(1)(f) RGPD.',
      ],
    },
    cdn: {
      title: '8. CDN de imagens (wsrv.nl) e tipos de letra web',
      paragraphs: [
        'Para a velocidade, as imagens podem ser servidas via wsrv.nl. O IP pode ser tratado temporariamente.',
        'A wsrv.nl não define cookies de rastreio. Base: art. 6.º(1)(f) RGPD. Mais informações: https://wsrv.nl',
        'As fontes padrão (JetBrains Mono, Space Grotesk, Orbitron, Share Tech Mono e Space Mono) são alojadas localmente. Outras escolhas usam alternativas locais, sem ligação ao Google Fonts.',
      ],
    },
    embeds: {
      title: '9. Incorporações de terceiros (Spotify, YouTube)',
      paragraphs: [
        'Os leitores (Spotify, YouTube) NÃO são carregados automaticamente. Só após um clique explícito (método de dois cliques). A secção Ouvir da página inicial usa este embed Spotify.',
        'Quando ativados, o IP e dados do browser podem ser transmitidos à Spotify AB (Suécia) ou Google/YouTube (EUA). Base: art. 6.º(1)(a) RGPD (consentimento).',
        'Privacidade Spotify: https://www.spotify.com/legal/privacy-policy/',
        'Privacidade Google: https://policies.google.com/privacy',
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
        'Alguns subcontratantes (Vercel, Cloudflare, Resend, Google/YouTube se os embeds forem ativados, wsrv.nl) podem tratar dados fora do EEE, incluindo os EUA. As transferências baseiam-se em CCT ou numa decisão de adequação (p. ex. EU-US Data Privacy Framework). O operador deve celebrar DPA com cada subcontratante.',
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
        '本サイトは Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, USA でホストされています。訪問時、IPアドレス等の個人データがVercelのサーバーで処理され、米国への移転を伴う場合があります。Vercelの方針: https://vercel.com/legal/privacy-policy',
        '法的根拠: GDPR第6条1項(f)（サイトを安定して提供する正当な利益）。',
        '処理者として Supabase（データベースと管理画面認証）、Cloudflare R2（メディア。可能な場合はEU管轄）、Resend（お問い合わせ、購入確認、契約撤回確認の取引メール。メーリングリストなし）を使用します。DPAと保存地域は各プロバイダのダッシュボードで設定します。',
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
        'Cookie同意は localStorage（キー: zd-cookie-consent）に保存します。選択を覚えるために技術的に必要です。根拠: GDPR第6条1項(f)およびTDDDG第25条2項。',
        '機能設定（言語、テーマ、ミュート）は分析同意なしで localStorage に保存できます。根拠: GDPR第6条1項(f)。',
        'IndexedDBの画像キャッシュが圧縮画像をローカル保存する場合があります。個人プロフィールは作成しません。根拠: GDPR第6条1項(f)。',
        '分析に同意した場合、ファーストパーティの利用イベント（ページ・セクション閲覧、相対座標のクリック）をサーバー（analytics_events）に保存することがあります。広告ネットワークは関与しません。保管: 最大90日。フッターの「Cookie設定」からいつでも撤回できます。',
        '管理画面認証は HttpOnly セッションCookie（Supabase）を使用します。一般訪問者には設定されません。',
      ],
    },
    contact: {
      title: '5. お問い合わせフォーム',
      paragraphs: [
        '送信時に氏名、メール、件名、本文を処理します。',
        'メッセージは Resend 経由のメールで届きます。サイト上の受信箱やチケットシステムはなく、データベースにも保存しません。マーケティング目的で第三者に販売・共有しません。',
        '根拠: GDPR第6条1項(b)または(f)。',
        '依頼処理後に削除します（法定保存義務がある場合を除く）。',
        'フォームはレート制限され、セキュリティのため仮名化IPハッシュを短期間保存する場合があります。根拠: GDPR第6条1項(f)。',
      ],
    },
    newsletter: {
      title: '6. ニュースレターはありません',
      paragraphs: [
        '本サイトはニュースレター、メーリングリスト、メール購読を提供しません。お問い合わせは Resend 経由で送信されます。購読者アドレスは保存しません。',
      ],
    },
    news: {
      title: '7. ニュースと編集コンテンツ',
      paragraphs: [
        '公開ニュースは編集コンテンツです。閲覧にアカウントは不要で、プロフィールも作成しません。',
        'カバー画像は Cloudflare R2 または画像プロキシ wsrv.nl で配信される場合があります。根拠: GDPR第6条1項(f)。',
      ],
    },
    cdn: {
      title: '8. 画像CDN（wsrv.nl）とウェブフォント',
      paragraphs: [
        '表示速度のため、画像は wsrv.nl 経由で配信される場合があります。その際IPが一時処理されることがあります。',
        'wsrv.nl はトラッキングCookieを設定しません。根拠: GDPR第6条1項(f)。詳細: https://wsrv.nl',
        '既定フォント（JetBrains Mono、Space Grotesk、Orbitron、Share Tech Mono、Space Mono）はサイト内で提供します。その他のフォント設定にはローカルの代替フォントを使用し、Google Fontsを外部から読み込みません。',
      ],
    },
    embeds: {
      title: '9. 第三者埋め込み（Spotify、YouTube）',
      paragraphs: [
        '埋め込みプレーヤー（Spotify、YouTube）は自動では読み込まれません。明示的なクリック後のみ（ツークリック方式）。ホームページの「聴く」セクションはこのSpotify埋め込みを使います。',
        '有効化後、IPおよびブラウザデータが Spotify AB（スウェーデン）または Google/YouTube（米国）に送信される場合があります。根拠: GDPR第6条1項(a)（同意）。',
        'Spotifyの方針: https://www.spotify.com/legal/privacy-policy/',
        'Googleの方針: https://policies.google.com/privacy',
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
        '一部の処理者（Vercel、Cloudflare、Resend、埋め込み有効時のGoogle/YouTube、wsrv.nl）はEU/EEA域外（米国を含む）でデータを処理する場合があります。移転はSCCまたは十分性認定（例: EU-US Data Privacy Framework）に基づきます。運営者は各処理者とDPAを締結すべきです。',
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
        '이 사이트는 Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, USA에서 호스팅됩니다. 방문 시 IP 주소 등 개인정보가 Vercel 서버에서 처리될 수 있으며 미국으로의 이전을 포함할 수 있습니다. Vercel 정책: https://vercel.com/legal/privacy-policy',
        '법적 근거: GDPR 제6조 1항 (f) (안정적인 사이트 제공에 대한 정당한 이익).',
        '처리자로 Supabase(데이터베이스 및 관리자 인증), Cloudflare R2(미디어, 가능한 경우 EU 관할), Resend(문의, 구매 확인, 계약 철회 확인용 거래 이메일 — 메일링 리스트 없음)를 사용합니다. DPA와 저장 지역은 각 제공자 대시보드에서 설정합니다.',
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
        '쿠키 동의는 localStorage(키: zd-cookie-consent)에 저장합니다. 선택을 기억하기 위해 기술적으로 필요합니다. 근거: GDPR 제6조 1항 (f) 및 TDDDG 제25조 2항.',
        '기능 설정(언어, 테마, 음소거)은 분석 동의 없이 localStorage에 저장될 수 있습니다. 근거: GDPR 제6조 1항 (f).',
        'IndexedDB 이미지 캐시가 압축 이미지를 로컬에 저장할 수 있습니다. 개인 프로필은 만들지 않습니다. 근거: GDPR 제6조 1항 (f).',
        '분석에 동의하면 퍼스트파티 이용 이벤트(페이지·섹션 조회, 상대 좌표 클릭)를 서버(analytics_events)에 저장할 수 있습니다. 광고 네트워크는 관여하지 않습니다. 보관: 최대 90일. 푸터의 「쿠키 설정」에서 언제든 철회할 수 있습니다.',
        '관리자 인증은 HttpOnly 세션 쿠키(Supabase)를 사용합니다. 일반 방문자에게는 설정되지 않습니다.',
      ],
    },
    contact: {
      title: '5. 문의 양식',
      paragraphs: [
        '제출 시 이름, 이메일, 제목, 메시지를 처리합니다.',
        '메시지는 Resend를 통해 이메일로 전달됩니다. 사이트에 받은편지함이나 티켓 시스템이 없고 데이터베이스에도 저장하지 않습니다. 마케팅 목적으로 제3자에게 판매·공유하지 않습니다.',
        '근거: GDPR 제6조 1항 (b) 또는 (f).',
        '요청 처리 후 삭제합니다(법정 보관 의무가 있는 경우 제외).',
        '양식은 요청 빈도가 제한되며, 보안을 위해 가명 처리된 IP 해시를 짧게 저장할 수 있습니다. 근거: GDPR 제6조 1항 (f).',
      ],
    },
    newsletter: {
      title: '6. 뉴스레터 없음',
      paragraphs: [
        '이 사이트는 뉴스레터, 메일링 리스트, 이메일 구독을 제공하지 않습니다. 문의는 Resend를 통해 전달됩니다. 구독자 주소는 저장하지 않습니다.',
      ],
    },
    news: {
      title: '7. 뉴스 및 편집 콘텐츠',
      paragraphs: [
        '공개 뉴스는 편집 콘텐츠입니다. 열람에 계정이 필요하지 않으며 프로필도 만들지 않습니다.',
        '커버 이미지는 Cloudflare R2 또는 이미지 프록시 wsrv.nl로 전달될 수 있습니다. 근거: GDPR 제6조 1항 (f).',
      ],
    },
    cdn: {
      title: '8. 이미지 CDN(wsrv.nl) 및 웹 글꼴',
      paragraphs: [
        '속도 향상을 위해 이미지가 wsrv.nl을 통해 전달될 수 있습니다. 이때 IP가 일시적으로 처리될 수 있습니다.',
        'wsrv.nl은 추적 쿠키를 설정하지 않습니다. 근거: GDPR 제6조 1항 (f). 자세한 내용: https://wsrv.nl',
        '기본 글꼴(JetBrains Mono, Space Grotesk, Orbitron, Share Tech Mono, Space Mono)은 자체 호스팅됩니다. 다른 설정은 Google Fonts 요청 없이 로컬 대체 글꼴을 사용합니다.',
      ],
    },
    embeds: {
      title: '9. 제3자 임베드(Spotify, YouTube)',
      paragraphs: [
        '미디어 플레이어(Spotify, YouTube)는 자동으로 로드되지 않습니다. 명시적 클릭 후에만(투클릭 방식). 홈의 「듣기」 섹션이 이 Spotify 임베드를 사용합니다.',
        '활성화 후 IP 및 브라우저 데이터가 Spotify AB(스웨덴) 또는 Google/YouTube(미국)로 전송될 수 있습니다. 근거: GDPR 제6조 1항 (a) (동의).',
        'Spotify 정책: https://www.spotify.com/legal/privacy-policy/',
        'Google 정책: https://policies.google.com/privacy',
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
        '일부 처리자(Vercel, Cloudflare, Resend, 임베드 활성화 시 Google/YouTube, wsrv.nl)는 EU/EEA 밖(미국 포함)에서 데이터를 처리할 수 있습니다. 이전은 SCC 또는 적정성 결정(예: EU-US Data Privacy Framework)에 근거합니다. 운영자는 각 처리자와 DPA를 체결해야 합니다.',
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
