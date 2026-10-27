import type { LegalLocale } from './legal-i18n'

/** Supplemental data protection information shown with a custom German policy. */
export const COMMERCE_PRIVACY: Record<LegalLocale, { title: string; paragraphs: string[] }> = {
  "de": {
    "title": "Kundenkonto, Softwarekauf und Widerruf",
    "paragraphs": [
      "Für dein Kundenkonto und deine Softwarelizenzen verarbeiten wir die E-Mail-Adresse, Bestell- und Lizenzangaben sowie die Geräte, auf denen du eine Lizenz aktivierst (Art. 6 Abs. 1 lit. b DSGVO).",
      "Zahlungen verarbeitet Stripe. Dabei erhält Stripe die für die Zahlung erforderlichen Daten. Vollständige Kartennummern speichern wir nicht. Vertragsbestätigungen werden über Resend versendet. Rechnungs- und Bestellunterlagen bewahren wir entsprechend den gesetzlichen Fristen auf (Art. 6 Abs. 1 lit. b und c DSGVO).",
      "Wenn du einen Vertrag widerrufst, verarbeiten wir deine Kontaktdaten, Vertragsangaben und den Eingang deiner Erklärung. Du erhältst eine Bestätigung per E-Mail (Art. 6 Abs. 1 lit. b und c DSGVO)."
    ]
  },
  "en": {
    "title": "Customer account, software purchases and withdrawals",
    "paragraphs": [
      "We use your email address, order and licence details, and activated devices to provide your software account and purchased licences (Art. 6(1)(b) GDPR).",
      "Stripe handles payments and receives the necessary payment details. We do not store complete card numbers. Resend delivers contract confirmations. We retain invoices and order records for the periods required by law (Art. 6(1)(b) and (c) GDPR).",
      "If you withdraw from a contract, we process your contact details, the contract information and the time your request was received. A confirmation is sent by email (Art. 6(1)(b) and (c) GDPR)."
    ]
  },
  "uk": {
    "title": "Обліковий запис, покупки та відкликання договору",
    "paragraphs": [
      "Для облікового запису й придбаних ліцензій обробляємо email, дані замовлень і ліцензій та відомості про активовані пристрої (ст. 6(1)(b) GDPR).",
      "Stripe обробляє оплату й потрібні платіжні дані. Повні номери карток ми не зберігаємо. Resend надсилає підтвердження договору. Рахунки й замовлення зберігаються протягом законних строків (ст. 6(1)(b), (c) GDPR).",
      "Для відкликання договору обробляємо контактні та договірні дані, а також час отримання запиту й надсилаємо підтвердження (ст. 6(1)(b), (c) GDPR)."
    ]
  },
  "it": {
    "title": "Account cliente, acquisti e recesso",
    "paragraphs": [
      "Per l'account e le licenze trattiamo email, dettagli di ordini e licenze e dati sui dispositivi attivati (art. 6(1)(b) GDPR).",
      "Stripe gestisce i pagamenti e riceve i dati necessari. Non salviamo i numeri completi delle carte. Resend invia conferme contrattuali. Fatture e ordini sono conservati secondo i termini di legge (art. 6(1)(b) e (c) GDPR).",
      "Per il recesso trattiamo recapiti, contratto e momento di ricezione della richiesta e inviamo conferma per email (art. 6(1)(b) e (c) GDPR)."
    ]
  },
  "es": {
    "title": "Cuenta, compras y desistimiento",
    "paragraphs": [
      "Para la cuenta y las licencias tratamos el correo, los datos del pedido y las licencias y los dispositivos activados (art. 6.1.b RGPD).",
      "Stripe gestiona los pagos y recibe los datos necesarios. No almacenamos números completos de tarjetas. Resend envía confirmaciones. Conservamos facturas y pedidos durante los plazos legales (art. 6.1.b y c RGPD).",
      "Para el desistimiento tratamos contacto, contrato y momento de recepción de la solicitud y enviamos un acuse por correo (art. 6.1.b y c RGPD)."
    ]
  },
  "pt": {
    "title": "Conta, compras e livre resolução",
    "paragraphs": [
      "Para a conta e as licenças tratamos email, encomendas, licenças e dados dos dispositivos ativados (artigo 6.º, n.º 1, alínea b), RGPD).",
      "A Stripe gere pagamentos e recebe dados necessários. Não guardamos números completos de cartões. A Resend envia confirmações. Faturas e encomendas são conservadas nos prazos legais (artigo 6.º, n.º 1, alíneas b) e c), RGPD).",
      "Para a livre resolução tratamos contactos, dados do contrato e momento de receção do pedido e enviamos confirmação por email (artigo 6.º, n.º 1, alíneas b) e c), RGPD)."
    ]
  },
  "ja": {
    "title": "顧客アカウント、購入、契約撤回",
    "paragraphs": [
      "アカウントと購入済みライセンスの提供に、メールアドレス、注文・ライセンス情報、認証された端末の情報を処理します（GDPR第6条第1項(b)）。",
      "Stripeは支払いに必要な情報を処理します。当サイトはカード番号全体を保存しません。Resendから契約確認を送信します。請求書と注文記録は法定期間保管します（GDPR第6条第1項(b)、(c)）。",
      "契約撤回では、連絡先、契約内容、受付時刻を処理し、メールで確認を送信します（GDPR第6条第1項(b)、(c)）。"
    ]
  },
  "ko": {
    "title": "고객 계정, 구매 및 계약 철회",
    "paragraphs": [
      "계정과 구매한 라이선스를 제공하기 위해 이메일, 주문·라이선스 정보 및 활성화 기기 정보를 처리합니다(GDPR 제6조 제1항 (b)).",
      "Stripe가 결제에 필요한 정보를 처리합니다. 전체 카드 번호는 저장하지 않습니다. Resend로 계약 확인을 보냅니다. 청구·주문 자료는 법정 기간 보관합니다(GDPR 제6조 제1항 (b), (c)).",
      "계약 철회에는 연락처, 계약 내용, 접수 시각을 처리하며 이메일로 확인을 보냅니다(GDPR 제6조 제1항 (b), (c))."
    ]
  }
}
