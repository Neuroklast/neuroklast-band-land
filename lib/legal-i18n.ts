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
      title: 'EU dispute resolution',
      paragraphs: [
        'The European Commission provides a platform for online dispute resolution (ODR): https://ec.europa.eu/consumers/odr/. Our email address can be found above.',
        'We are not willing or obliged to participate in dispute resolution proceedings before a consumer arbitration board.',
      ],
    },
    'liability-content': {
      title: 'Liability for content',
      paragraphs: [
        'As a service provider, we are responsible for our own content on these pages in accordance with § 7 (1) DDG and general laws. According to §§ 8 to 10 DDG, we are not obliged as a service provider to monitor transmitted or stored third-party information or to investigate circumstances that indicate illegal activity.',
        'Obligations to remove or block the use of information under general laws remain unaffected. Liability in this regard is only possible from the time of knowledge of a specific infringement. Upon becoming aware of corresponding legal violations, we will remove such content immediately.',
      ],
    },
    'liability-links': {
      title: 'Liability for links',
      paragraphs: [
        'Our website contains links to external third-party websites over whose content we have no control. Therefore, we cannot accept liability for this third-party content. The respective provider or operator of the linked pages is always responsible for their content.',
        'Linked pages were checked for possible legal violations at the time of linking. Illegal content was not recognisable at that time. Permanent monitoring of linked pages without concrete evidence of a violation is unreasonable. Upon notification of violations, we will remove such links immediately.',
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
      title: 'EU-Streitschlichtung',
      paragraphs: [
        'Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: https://ec.europa.eu/consumers/odr/. Unsere E-Mail-Adresse finden Sie oben im Impressum.',
        'Wir sind nicht bereit und nicht verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.',
      ],
    },
    'liability-content': {
      title: 'Haftung für Inhalte',
      paragraphs: [
        'Als Diensteanbieter sind wir gemäß § 7 Abs. 1 DDG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 DDG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.',
        'Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen Gesetzen bleiben unberührt. Eine diesbezügliche Haftung ist erst ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung möglich. Bei Bekanntwerden von entsprechenden Rechtsverletzungen werden wir diese Inhalte umgehend entfernen.',
      ],
    },
    'liability-links': {
      title: 'Haftung für Links',
      paragraphs: [
        'Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich.',
        'Die verlinkten Seiten wurden zum Zeitpunkt der Verlinkung auf mögliche Rechtsverstöße überprüft. Rechtswidrige Inhalte waren zum Zeitpunkt der Verlinkung nicht erkennbar. Eine permanente inhaltliche Kontrolle der verlinkten Seiten ist ohne konkrete Anhaltspunkte einer Rechtsverletzung nicht zumutbar. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Links umgehend entfernen.',
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
        'Європейська комісія надає платформу онлайн-вирішення спорів (ODR): https://ec.europa.eu/consumers/odr/. Нашу електронну адресу наведено вище.',
        'Ми не зобов’язані і не згодні брати участь у процедурах вирішення спорів перед споживчим арбітражем.',
      ],
    },
    'liability-content': {
      title: 'Відповідальність за контент',
      paragraphs: [
        'Як постачальник послуг ми відповідаємо за власний контент цих сторінок згідно з § 7 (1) DDG та загальним законодавством. Згідно з §§ 8–10 DDG ми не зобов’язані моніторити передану чи збережену сторонню інформацію або розслідувати ознаки протиправної діяльності.',
        'Обов’язки щодо видалення чи блокування інформації за загальним правом залишаються чинними. Відповідальність настає лише з моменту знання про конкретне порушення. Після отримання відомостей про порушення ми негайно видалимо відповідний контент.',
      ],
    },
    'liability-links': {
      title: 'Відповідальність за посилання',
      paragraphs: [
        'Сайт містить посилання на зовнішні сайти третіх осіб, на контент яких ми не впливаємо. Тому ми не несемо відповідальності за цей сторонній контент. Відповідальним є відповідний оператор сторінки.',
        'Посилання перевірялися на можливі порушення на момент розміщення. Постійний моніторинг без конкретних підстав є нерозумним. Після повідомлення про порушення ми негайно видалимо такі посилання.',
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
        'La Commissione europea mette a disposizione una piattaforma ODR: https://ec.europa.eu/consumers/odr/. Il nostro indirizzo e-mail è indicato sopra.',
        'Non siamo obbligati né disponibili a partecipare a procedimenti dinanzi a un organismo di conciliazione dei consumatori.',
      ],
    },
    'liability-content': {
      title: 'Responsabilità per i contenuti',
      paragraphs: [
        'In qualità di prestatore di servizi siamo responsabili dei contenuti propri di queste pagine ai sensi del § 7 (1) DDG e delle leggi generali. Ai sensi dei §§ 8–10 DDG non siamo obbligati a monitorare informazioni di terzi trasmesse o memorizzate né a indagare circostanze che indichino attività illecite.',
        'Restano salvi gli obblighi di rimozione o blocco previsti dalla legge. La responsabilità sorge solo dal momento della conoscenza di una violazione specifica. In tal caso rimuoveremo immediatamente i contenuti.',
      ],
    },
    'liability-links': {
      title: 'Responsabilità per i link',
      paragraphs: [
        'Il sito contiene link a siti di terzi sui cui contenuti non abbiamo controllo. Non possiamo quindi assumere responsabilità per tali contenuti. Ne è responsabile il rispettivo operatore.',
        'I link sono stati verificati al momento dell’inserimento. Un controllo permanente senza indizi concreti non è esigibile. In caso di segnalazione rimuoveremo i link immediatamente.',
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
        'La Comisión Europea ofrece una plataforma ODR: https://ec.europa.eu/consumers/odr/. Nuestra dirección de correo figura arriba.',
        'No estamos dispuestos ni obligados a participar en procedimientos ante una junta arbitral de consumo.',
      ],
    },
    'liability-content': {
      title: 'Responsabilidad por el contenido',
      paragraphs: [
        'Como prestador de servicios somos responsables de nuestro propio contenido en estas páginas conforme al § 7 (1) DDG y a las leyes generales. Conforme a los §§ 8 a 10 DDG no estamos obligados a supervisar información de terceros transmitida o almacenada ni a investigar indicios de actividad ilícita.',
        'Las obligaciones de retirada o bloqueo según la ley general no se ven afectadas. La responsabilidad solo es posible desde el conocimiento de una infracción concreta. En ese caso eliminaremos el contenido de inmediato.',
      ],
    },
    'liability-links': {
      title: 'Responsabilidad por enlaces',
      paragraphs: [
        'El sitio contiene enlaces a sitios de terceros sobre cuyo contenido no tenemos control. Por ello no asumimos responsabilidad por ese contenido ajeno. El responsable es siempre el operador de la página enlazada.',
        'Los enlaces se comprobaron en el momento de su inclusión. Un control permanente sin indicios concretos no es exigible. Ante notificaciones de infracciones eliminaremos esos enlaces de inmediato.',
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
        'A Comissão Europeia disponibiliza uma plataforma ODR: https://ec.europa.eu/consumers/odr/. O nosso e-mail encontra-se acima.',
        'Não estamos dispostos nem obrigados a participar em processos perante um centro de arbitragem de consumo.',
      ],
    },
    'liability-content': {
      title: 'Responsabilidade pelo conteúdo',
      paragraphs: [
        'Como prestador de serviços somos responsáveis pelos nossos próprios conteúdos nestas páginas nos termos do § 7 (1) DDG e da lei geral. Nos termos dos §§ 8 a 10 DDG não estamos obrigados a monitorizar informação de terceiros transmitida ou armazenada nem a investigar indícios de atividade ilícita.',
        'As obrigações de remoção ou bloqueio nos termos da lei geral mantêm-se. A responsabilidade só existe a partir do conhecimento de uma infração concreta. Nesse caso removeremos o conteúdo de imediato.',
      ],
    },
    'liability-links': {
      title: 'Responsabilidade por ligações',
      paragraphs: [
        'O sítio contém ligações a sítios de terceiros cujo conteúdo não controlamos. Por isso não assumimos responsabilidade por esse conteúdo. O responsável é sempre o operador da página ligada.',
        'As ligações foram verificadas no momento da inclusão. Um controlo permanente sem indícios concretos não é exigível. Após notificação de infrações removeremos essas ligações de imediato.',
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
        '欧州委員会はオンライン紛争解決（ODR）プラットフォームを提供しています: https://ec.europa.eu/consumers/odr/ メールアドレスは上記をご覧ください。',
        '消費者仲裁機関における紛争解決手続に参加する意思も義務もありません。',
      ],
    },
    'liability-content': {
      title: 'コンテンツに関する責任',
      paragraphs: [
        'サービス提供者として、DDG第7条第1項および一般法に基づき、本ページの自己コンテンツに責任を負います。DDG第8条から第10条により、送信・保存された第三者情報を監視したり、違法行為を示す事情を調査する義務はありません。',
        '一般法に基づく削除・遮断義務は影響を受けません。具体的な権利侵害を知った時点からのみ責任が生じます。該当する違反を認識した場合、直ちに当該コンテンツを削除します。',
      ],
    },
    'liability-links': {
      title: 'リンクに関する責任',
      paragraphs: [
        '本サイトには第三者が運営する外部サイトへのリンクが含まれます。その内容を管理できないため、当該第三者コンテンツについて責任を負いません。責任は常にリンク先の運営者にあります。',
        'リンク設定時に違法性を確認しました。具体的な侵害の兆候なく常時監視することは合理的ではありません。侵害の通知があれば直ちにリンクを削除します。',
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
        '유럽연합 집행위원회는 온라인 분쟁 해결(ODR) 플랫폼을 제공합니다: https://ec.europa.eu/consumers/odr/ 이메일 주소는 위에 있습니다.',
        '소비자 중재 기구의 분쟁 해결 절차에 참여할 의사나 의무가 없습니다.',
      ],
    },
    'liability-content': {
      title: '콘텐츠에 대한 책임',
      paragraphs: [
        '서비스 제공자로서 DDG 제7조 제1항 및 일반 법령에 따라 이 페이지의 자체 콘텐츠에 책임을 집니다. DDG 제8조부터 제10조에 따라 전송·저장된 제3자 정보를 감시하거나 위법 행위를 조사할 의무는 없습니다.',
        '일반법에 따른 삭제·차단 의무는 영향을 받지 않습니다. 구체적인 침해를 인지한 시점부터만 책임이 발생합니다. 해당 위반을 알게 되면 즉시 콘텐츠를 삭제합니다.',
      ],
    },
    'liability-links': {
      title: '링크에 대한 책임',
      paragraphs: [
        '본 사이트에는 당사가 통제할 수 없는 제3자 웹사이트 링크가 포함됩니다. 따라서 해당 제3자 콘텐츠에 대해 책임을 지지 않습니다. 책임은 항상 링크된 페이지의 운영자에게 있습니다.',
        '링크 시점에는 법적 위반 여부를 확인했습니다. 구체적 침해 정황 없이 상시 모니터링하는 것은 합리적이지 않습니다. 침해 통지가 있으면 즉시 링크를 삭제합니다.',
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
        'We use Supabase (database and authentication for the admin area), Cloudflare R2 (media files; EU jurisdiction where configured), and Resend (transactional email for the contact form only — no mailing list) as processors. Data processing agreements (DPAs) and storage regions should be configured in each provider dashboard. These providers process data only as necessary to operate the website.',
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
        'If you consent to analytics, we may store first-party usage events (page views, section views, clicks with relative coordinates) on our servers (Supabase table analytics_events). No advertising network is involved. Retention: events are kept for up to 90 days for reporting, then should be deleted or aggregated by the operator; you may request earlier erasure. You can revoke consent at any time via "Cookie Preferences" in the footer.',
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
        'This website does not offer a newsletter, mailing list, or email subscription. Contact is handled only through the contact form (Resend email delivery). We do not store subscriber addresses.',
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
        'Default website fonts (JetBrains Mono, Space Grotesk) are self-hosted with the site build (next/font). If the site operator selects additional typefaces in Appearance, those may be loaded from Google Fonts when applied. Legal basis for optional remote fonts: Art. 6(1)(f) GDPR (presentation of the website as configured by the operator).',
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
        'Als weitere Auftragsverarbeiter nutzen wir Supabase (Datenbank und Admin-Authentifizierung), Cloudflare R2 (Mediendateien; EU-Jurisdiction soweit konfiguriert) und Resend (nur transaktionale E-Mail für das Kontaktformular — keine Mailingliste). Auftragsverarbeitungsverträge (AVV/DPA) und Speicherregionen sind in den jeweiligen Anbieter-Dashboards zu konfigurieren.',
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
        'Wenn Sie Analytics zustimmen, können wir First-Party-Nutzungsereignisse (Seitenaufrufe, Abschnittsansichten, Klicks mit relativen Koordinaten) auf unseren Servern speichern (Supabase-Tabelle analytics_events). Es ist kein Werbenetzwerk beteiligt. Speicherdauer: bis zu 90 Tage für Auswertungen, danach Löschung oder Aggregation durch den Betreiber; frühere Löschung auf Anfrage. Widerruf jederzeit über „Cookie-Einstellungen“ im Footer.',
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
        'Diese Website bietet keinen Newsletter, keine Mailingliste und kein E-Mail-Abo. Kontakt erfolgt ausschließlich über das Kontaktformular (Zustellung per Resend). Es werden keine Abonnentenadressen gespeichert.',
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
        'Standard-Webfonts (JetBrains Mono, Space Grotesk) werden mit dem Website-Build self-hosted (next/font). Wählt der Betreiber unter Appearance weitere Schriften, können diese bei Anwendung von Google Fonts geladen werden. Rechtsgrundlage für optionale Remote-Fonts: Art. 6 Abs. 1 lit. f DSGVO (Darstellung der Website wie vom Betreiber konfiguriert).',
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
        'Як обробники також використовуються Supabase (база даних і автентифікація адмінки), Cloudflare R2 (медіа; юрисдикція ЄС за можливості) та Resend (лише транзакційна пошта контактної форми — без розсилки). DPA та регіони зберігання налаштовуються в кабінетах провайдерів.',
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
        'Цей сайт не пропонує newsletter, mailing list чи e-mail-підписку. Контакт лише через форму (Resend). Адреси підписників не зберігаються.',
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
        'Стандартні шрифти (JetBrains Mono, Space Grotesk) self-hosted (next/font). Додаткові шрифти з Appearance можуть завантажуватися з Google Fonts. Підстава: ст. 6(1)(f) GDPR.',
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
        'Utilizziamo come responsabili del trattamento Supabase (database e autenticazione admin), Cloudflare R2 (media; giurisdizione UE se configurata) e Resend (solo e-mail transazionale del modulo — nessuna mailing list). I DPA e le regioni di archiviazione vanno configurati nei pannelli dei fornitori.',
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
        'Questo sito non offre newsletter, mailing list né abbonamento e-mail. Il contatto avviene solo tramite il modulo (consegna Resend). Non memorizziamo indirizzi di iscritti.',
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
        'I font predefiniti (JetBrains Mono, Space Grotesk) sono self-hosted (next/font). Font aggiuntivi da Appearance possono essere caricati da Google Fonts. Base: art. 6(1)(f) GDPR.',
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
        'Usamos como encargados Supabase (base de datos y autenticación de admin), Cloudflare R2 (medios; jurisdicción UE si está configurada) y Resend (solo correo transaccional del formulario — sin lista de correo). Los DPA y las regiones de almacenamiento deben configurarse en cada proveedor.',
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
        'Este sitio no ofrece newsletter, lista de correo ni suscripción por e-mail. El contacto es solo por el formulario (entrega Resend). No almacenamos direcciones de suscriptores.',
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
        'Las fuentes predeterminadas (JetBrains Mono, Space Grotesk) son self-hosted (next/font). Fuentes adicionales de Appearance pueden cargarse desde Google Fonts. Base: art. 6(1)(f) RGPD.',
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
        'Utilizamos como subcontratantes a Supabase (base de dados e autenticação de admin), a Cloudflare R2 (média; jurisdição da UE se configurada) e a Resend (apenas e-mail transacional do formulário — sem lista de correio). Os DPA e as regiões de armazenamento devem ser configurados em cada fornecedor.',
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
        'Este sítio não oferece newsletter, lista de correio nem subscrição por e-mail. O contacto é apenas pelo formulário (entrega Resend). Não armazenamos endereços de subscritores.',
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
        'Os tipos de letra predefinidos (JetBrains Mono, Space Grotesk) são self-hosted (next/font). Tipos adicionais de Appearance podem ser carregados do Google Fonts. Base: art. 6.º(1)(f) RGPD.',
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
        '処理者として Supabase（データベースと管理画面認証）、Cloudflare R2（メディア。可能な場合はEU管轄）、Resend（お問い合わせフォームのトランザクションメールのみ。メーリングリストなし）を使用します。DPAと保存地域は各プロバイダのダッシュボードで設定します。',
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
        '本サイトはニュースレター、メーリングリスト、メール購読を提供しません。連絡はお問い合わせフォーム（Resend）のみです。購読者アドレスは保存しません。',
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
        '既定フォント（JetBrains Mono、Space Grotesk）は self-hosted（next/font）です。Appearanceで追加フォントを選ぶと Google Fonts から読み込まれる場合があります。根拠: GDPR第6条1項(f)。',
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
        '처리자로 Supabase(데이터베이스 및 관리자 인증), Cloudflare R2(미디어, 가능한 경우 EU 관할), Resend(문의 양식의 트랜잭션 메일만 — 메일링 리스트 없음)를 사용합니다. DPA와 저장 지역은 각 제공자 대시보드에서 설정합니다.',
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
        '이 사이트는 뉴스레터, 메일링 리스트, 이메일 구독을 제공하지 않습니다. 연락은 문의 양식(Resend)만 사용합니다. 구독자 주소는 저장하지 않습니다.',
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
        '기본 글꼴(JetBrains Mono, Space Grotesk)은 self-hosted(next/font)입니다. Appearance에서 추가 글꼴을 선택하면 Google Fonts에서 로드될 수 있습니다. 근거: GDPR 제6조 1항 (f).',
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

export const NOTICE_SECTION_ORDER = [
  'operator',
  'responsible',
  'dispute',
  'liability-content',
  'liability-links',
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
  'rights',
] as const
