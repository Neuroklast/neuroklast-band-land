import type { LegalLocale } from './legal-i18n'

/** Supplemental data protection information shown with a custom German policy. */
export const COMMERCE_PRIVACY: Record<LegalLocale, { title: string; paragraphs: string[] }> = {
  "de": {
    "title": "Kundenkonto, Softwarekauf und Widerruf",
    "paragraphs": [
      "Für dein Kundenkonto und deine Softwarelizenzen verarbeiten wir die E-Mail-Adresse, Bestell- und Lizenzangaben sowie die Geräte, auf denen du eine Lizenz aktivierst (Art. 6 Abs. 1 lit. b DSGVO). Unterstützte NEUROKORE-Versionen fragen, sofern eine Internetverbindung besteht, höchstens einmal täglich den Lizenzstatus ab. Dabei übertragen sie nur die Lizenz-ID und eine pseudonyme, gehashte Gerätekennung. Bei fehlender Verbindung wird keine Lizenz gesperrt. Ausschließlich ein digital signierter Widerruf wird lokal gespeichert und beim nächsten Start berücksichtigt.",
      "Zahlungen verarbeitet Stripe. Dabei erhält Stripe die für die Zahlung erforderlichen Daten. Vollständige Kartennummern speichern wir nicht. Vertragsbestätigungen werden über Resend versendet. Rechnungs- und Bestellunterlagen bewahren wir entsprechend den gesetzlichen Fristen auf (Art. 6 Abs. 1 lit. b und c DSGVO).",
      "Wenn du einen Vertrag widerrufst, verarbeiten wir deine Kontaktdaten, Vertragsangaben und den Eingang deiner Erklärung. Du erhältst eine Bestätigung per E-Mail (Art. 6 Abs. 1 lit. b und c DSGVO).",
      "Für technische NEUROKORE-Betadiagnosen können Pluginversion, Betriebssystem, DAW, Pluginformat, grobe Hardwareangaben, Abtastrate, Puffergröße und ein vordefinierter Fehlercode an unsere Website übertragen werden. Freitexte und direkte Gerätekennungen werden dabei nicht im Diagnoseeintrag gespeichert. Verbindungsdaten können beim technischen Empfang und zum Schutz vor Missbrauch verarbeitet werden. Die Diagnoseeinträge werden nach spätestens 90 Tagen planmäßig gelöscht. Ob und unter welchen Voraussetzungen der Client Diagnosen sendet, wird zusätzlich im Plugin erläutert; eine freiwillige Einwilligung ist erforderlich, soweit keine andere tragfähige Rechtsgrundlage besteht."
    ]
  },
  "en": {
    "title": "Customer account, software purchases and withdrawals",
    "paragraphs": [
      "We use your email address, order and licence details, and activated devices to provide your software account and purchased licences (Art. 6(1)(b) GDPR). Compatible NEUROKORE versions make a background licence-status check at most once per day when online, sending only the licence ID and a pseudonymous hashed device identifier. No internet connection is required to continue using a valid offline licence. Only a digitally signed revocation is stored locally and applied on the next launch.",
      "Stripe handles payments and receives the necessary payment details. We do not store complete card numbers. Resend delivers contract confirmations. We retain invoices and order records for the periods required by law (Art. 6(1)(b) and (c) GDPR).",
      "If you withdraw from a contract, we process your contact details, the contract information and the time your request was received. A confirmation is sent by email (Art. 6(1)(b) and (c) GDPR).",
      "Technical NEUROKORE beta diagnostics may transmit the plugin version, operating system, host DAW, plugin format, coarse hardware characteristics, sample rate, buffer size and a predefined error code to our website. Diagnostic records do not store free text or direct device identifiers. Connection data may be processed for delivery and abuse prevention. Diagnostic records are scheduled for deletion within 90 days. The plugin must separately explain when diagnostics are sent and obtain opt-in where required by law."
    ]
  },
  "uk": {
    "title": "Обліковий запис, покупки та відкликання договору",
    "paragraphs": [
      "Для облікового запису й придбаних ліцензій обробляємо email, дані замовлень і ліцензій та відомості про активовані пристрої (ст. 6(1)(b) GDPR). Сумісні версії NEUROKORE за наявності інтернету перевіряють статус ліцензії у фоновому режимі не частіше одного разу на день, передаючи лише ID ліцензії та псевдонімний хеш ідентифікатора пристрою. Відсутність інтернету не блокує дійсну ліцензію; лише підписане цифровим підписом відкликання діє з наступного запуску.",
      "Stripe обробляє оплату й потрібні платіжні дані. Повні номери карток ми не зберігаємо. Resend надсилає підтвердження договору. Рахунки й замовлення зберігаються протягом законних строків (ст. 6(1)(b), (c) GDPR).",
      "Для відкликання договору обробляємо контактні та договірні дані, а також час отримання запиту й надсилаємо підтвердження (ст. 6(1)(b), (c) GDPR)."
    ]
  },
  "it": {
    "title": "Account cliente, acquisti e recesso",
    "paragraphs": [
      "Per l'account e le licenze trattiamo email, dettagli di ordini e licenze e dati sui dispositivi attivati (art. 6(1)(b) GDPR). Le versioni compatibili di NEUROKORE verificano lo stato della licenza in background, se online, al massimo una volta al giorno, inviando soltanto l'ID della licenza e un identificatore pseudonimo del dispositivo con hash. Senza connessione la licenza resta utilizzabile; solo una revoca firmata digitalmente ha effetto al successivo avvio.",
      "Stripe gestisce i pagamenti e riceve i dati necessari. Non salviamo i numeri completi delle carte. Resend invia conferme contrattuali. Fatture e ordini sono conservati secondo i termini di legge (art. 6(1)(b) e (c) GDPR).",
      "Per il recesso trattiamo recapiti, contratto e momento di ricezione della richiesta e inviamo conferma per email (art. 6(1)(b) e (c) GDPR)."
    ]
  },
  "es": {
    "title": "Cuenta, compras y desistimiento",
    "paragraphs": [
      "Para la cuenta y las licencias tratamos el correo, los datos del pedido y las licencias y los dispositivos activados (art. 6.1.b RGPD). Las versiones compatibles de NEUROKORE comprueban el estado de la licencia en segundo plano como máximo una vez al día si hay conexión, enviando solo el ID de la licencia y un identificador seudónimo del dispositivo con hash. Sin conexión la licencia válida sigue funcionando; únicamente una revocación firmada digitalmente surte efecto en el siguiente inicio.",
      "Stripe gestiona los pagos y recibe los datos necesarios. No almacenamos números completos de tarjetas. Resend envía confirmaciones. Conservamos facturas y pedidos durante los plazos legales (art. 6.1.b y c RGPD).",
      "Para el desistimiento tratamos contacto, contrato y momento de recepción de la solicitud y enviamos un acuse por correo (art. 6.1.b y c RGPD)."
    ]
  },
  "pt": {
    "title": "Conta, compras e livre resolução",
    "paragraphs": [
      "Para a conta e as licenças tratamos email, encomendas, licenças e dados dos dispositivos ativados (artigo 6.º, n.º 1, alínea b), RGPD). As versões compatíveis de NEUROKORE verificam o estado da licença em segundo plano, quando há ligação, no máximo uma vez por dia, transmitindo apenas o ID da licença e um identificador pseudónimo do dispositivo sujeito a hash. A falta de ligação não bloqueia uma licença válida; só uma revogação assinada digitalmente produz efeitos no próximo arranque.",
      "A Stripe gere pagamentos e recebe dados necessários. Não guardamos números completos de cartões. A Resend envia confirmações. Faturas e encomendas são conservadas nos prazos legais (artigo 6.º, n.º 1, alíneas b) e c), RGPD).",
      "Para a livre resolução tratamos contactos, dados do contrato e momento de receção do pedido e enviamos confirmação por email (artigo 6.º, n.º 1, alíneas b) e c), RGPD)."
    ]
  },
  "ja": {
    "title": "顧客アカウント、購入、契約撤回",
    "paragraphs": [
      "アカウントと購入済みライセンスの提供に、メールアドレス、注文・ライセンス情報、認証された端末の情報を処理します（GDPR第6条第1項(b)）。対応するNEUROKOREはインターネット接続時に限り、1日1回以下の頻度でライセンス状態をバックグラウンド確認します。送信情報はライセンスIDとハッシュ化した仮名の端末識別子のみです。オフラインでも有効なライセンスは使え、電子署名付きの失効通知だけが次回起動時に適用されます。",
      "Stripeは支払いに必要な情報を処理します。当サイトはカード番号全体を保存しません。Resendから契約確認を送信します。請求書と注文記録は法定期間保管します（GDPR第6条第1項(b)、(c)）。",
      "契約撤回では、連絡先、契約内容、受付時刻を処理し、メールで確認を送信します（GDPR第6条第1項(b)、(c)）。"
    ]
  },
  "ko": {
    "title": "고객 계정, 구매 및 계약 철회",
    "paragraphs": [
      "계정과 구매한 라이선스를 제공하기 위해 이메일, 주문·라이선스 정보 및 활성화 기기 정보를 처리합니다(GDPR 제6조 제1항 (b)). NEUROKORE의 호환 버전은 인터넷 연결 시 하루에 최대 한 번 백그라운드에서 라이선스 상태를 확인하며 라이선스 ID와 해시 처리한 가명 기기 식별자만 전송합니다. 오프라인 상태에서는 유효한 라이선스를 계속 사용할 수 있고, 디지털 서명으로 확인된 철회만 다음 실행부터 적용됩니다.",
      "Stripe가 결제에 필요한 정보를 처리합니다. 전체 카드 번호는 저장하지 않습니다. Resend로 계약 확인을 보냅니다. 청구·주문 자료는 법정 기간 보관합니다(GDPR 제6조 제1항 (b), (c)).",
      "계약 철회에는 연락처, 계약 내용, 접수 시각을 처리하며 이메일로 확인을 보냅니다(GDPR 제6조 제1항 (b), (c))."
    ]
  }
}
