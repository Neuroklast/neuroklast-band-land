import type { LegalLocale } from './legal-i18n'

/** Describes the implemented commerce processors. Actual contracts, transfers and retention need verification. */
export const COMMERCE_PRIVACY: Record<LegalLocale, { title: string; paragraphs: string[] }> = {
  de: {
    title: 'Kundenkonto, Softwarelizenzen, Zahlung und Widerruf',
    paragraphs: [
      'Für Anmeldung und Lizenzverwaltung verarbeiten wir deine E-Mail-Adresse und Supabase-Benutzerkennung. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO.',
      'Für Bestellungen und Aktivierung verarbeiten wir Produktzuordnung, E-Mail-Adresse, Bestell- und Zahlungsreferenzen, Lizenzstatus, Aktivierungszeitpunkte und gerätebezogene Kennungen zur Vertragserfüllung (Art. 6 Abs. 1 lit. b DSGVO).',
      'Zahlungen wickelt Stripe ab. Stripe erhält notwendige Bestell-, Kontakt- und Rechnungsdaten und verarbeitet Zahlungsdaten. Vollständige Kartendaten speichern wir nicht. Informationen: https://stripe.com/de/privacy. Abhängig vom Dienst kann eine Übermittlung in Drittländer stattfinden.',
      'Bestell- und Rechnungsunterlagen werden nach geltenden handels- und steuerrechtlichen Pflichten aufbewahrt. Lizenzdaten werden für die Vertragsdauer und die Abwicklung verbleibender Ansprüche benötigt. Andere Daten werden gelöscht, wenn sie nicht mehr erforderlich sind und keine gesetzliche Aufbewahrung entgegensteht.',
      'Bei elektronischem Widerruf werden Name, E-Mail-Adresse, Vertragsangaben, Eingang und Referenznummer für die Bearbeitung und den Nachweis verarbeitet (Art. 6 Abs. 1 lit. c DSGVO). Resend versendet die Eingangsbestätigung. Die Verarbeitung ist auf die notwendige Bearbeitung und gesetzliche Aufbewahrung beschränkt.',
    ],
  },
  en: {
    title: 'Accounts, software licences, payments and withdrawal',
    paragraphs: [
      'For sign-in and licence management we process your email address and Supabase user identifier under Art. 6(1)(b) GDPR.',
      'Orders and licence activation use product identifiers, email, order and payment references, licence status, activation dates and device identifiers to perform the contract under Art. 6(1)(b) GDPR.',
      'Stripe processes payments, necessary order, contact and billing information and payment details. We do not store complete card numbers. Details: https://stripe.com/privacy. International data transfers may occur depending on processing.',
      'Orders and invoices are retained where commercial and tax law requires it. Licence data is retained for the contract term and any necessary outstanding claims. Other data is deleted when no longer needed, unless law requires retention.',
      'Online withdrawals involve your name, email, contract details, timestamp and reference ID for handling and records (Art. 6(1)(c) GDPR). Resend emails the receipt. Records are kept only for required processing and statutory retention.',
    ],
  },
  uk: {
    title: 'Облікові записи, ліцензії, оплата та відмова',
    paragraphs: [
      'Для входу та керування ліцензією обробляються ваша електронна адреса й ідентифікатор користувача Supabase на підставі ст. 6(1)(b) GDPR.',
      'Для виконання договору обробляються дані продукту, email, посилання на замовлення й оплату, статус ліцензії, дата активації та ідентифікатори пристроїв (ст. 6(1)(b) GDPR).',
      'Платежі обробляє Stripe, отримуючи потрібні відомості про замовлення, контактні та платіжні дані. Повні номери карток ми не зберігаємо. Докладніше: https://stripe.com/privacy. Можлива міжнародна передача даних.',
      'Документи про замовлення та рахунки зберігаються згідно з торговельними й податковими вимогами. Дані ліцензій потрібні протягом договору та для вирішення залишкових вимог. Інші дані видаляються, коли відпадає потреба й немає обовʼязку їх зберігати.',
      'Для онлайн-відмови обробляємо імʼя, email, дані договору, час отримання та реєстраційний номер (ст. 6(1)(c) GDPR). Resend надсилає підтвердження. Записи зберігаються лише протягом необхідного та законного строку.',
    ],
  },
  it: {
    title: 'Account, licenze, pagamenti e recesso',
    paragraphs: [
      'Per accesso e gestione della licenza trattiamo indirizzo email e identificativo Supabase in base all’art. 6(1)(b) GDPR.',
      'Per eseguire il contratto trattiamo identificativi del prodotto, email, riferimenti d’ordine e pagamento, stato della licenza, date di attivazione e identificativi del dispositivo (art. 6(1)(b) GDPR).',
      'Stripe gestisce i pagamenti e riceve i dati necessari di ordine, contatto e fatturazione, oltre ai dati di pagamento. Non conserviamo numeri completi di carta. Informazioni: https://stripe.com/privacy. Sono possibili trasferimenti internazionali.',
      'Ordini e fatture sono conservati per gli obblighi fiscali e commerciali. I dati di licenza sono necessari durante il contratto e per eventuali pretese residue. Gli altri dati vengono eliminati quando non più necessari, salvo obblighi di conservazione.',
      'Per il recesso online trattiamo nome, email, dati contrattuali, data di ricezione e riferimento per l’adempimento legale (art. 6(1)(c) GDPR). Resend invia la conferma. I dati sono conservati per il periodo necessario e previsto dalla legge.',
    ],
  },
  es: {
    title: 'Cuentas, licencias, pagos y desistimiento',
    paragraphs: [
      'Para acceder y gestionar licencias tratamos el correo electrónico y el identificador de usuario de Supabase conforme al art. 6(1)(b) RGPD.',
      'Para ejecutar el contrato tratamos el producto, email, referencias de pedido y pago, estado de licencia, fechas de activación e identificadores del dispositivo (art. 6(1)(b) RGPD).',
      'Stripe procesa los pagos y los datos necesarios de pedido, contacto, facturación y pago. No almacenamos números completos de tarjetas. Más información: https://stripe.com/privacy. Pueden existir transferencias internacionales.',
      'Pedidos y facturas se conservan conforme a las obligaciones mercantiles y fiscales. Los datos de licencia se necesitan durante el contrato y para reclamaciones pendientes. El resto se elimina cuando deja de ser necesario, salvo obligación legal.',
      'Para el desistimiento online tratamos nombre, email, contrato, fecha de recepción y referencia (art. 6(1)(c) RGPD). Resend envía el acuse. Los registros se conservan solo para la tramitación y los plazos legales.',
    ],
  },
  pt: {
    title: 'Contas, licenças, pagamentos e livre resolução',
    paragraphs: [
      'Para entrar e gerir licenças, tratamos email e identificador de utilizador Supabase com base no art. 6(1)(b) RGPD.',
      'Para executar o contrato, tratamos produto, email, referências de encomenda e pagamento, estado da licença, datas de ativação e identificadores de dispositivo (art. 6(1)(b) RGPD).',
      'A Stripe processa pagamentos e os dados necessários da encomenda, contacto, faturação e pagamento. Não guardamos números completos de cartões. Detalhes: https://stripe.com/privacy. Podem ocorrer transferências internacionais.',
      'Encomendas e faturas são conservadas conforme as exigências comerciais e fiscais. Dados da licença são necessários durante o contrato e eventuais reclamações pendentes. Os restantes dados são apagados quando deixarem de ser necessários, salvo obrigação legal.',
      'Para a livre resolução online, tratamos nome, email, contrato, hora de receção e referência (art. 6(1)(c) RGPD). A Resend envia a confirmação. A conservação limita-se à tramitação e às obrigações legais.',
    ],
  },
  ja: {
    title: 'アカウント、ライセンス、決済、契約撤回に関するデータ',
    paragraphs: [
      'ログインとライセンス管理のため、メールアドレスとSupabaseのユーザー識別子をGDPR第6条第1項(b)に基づき処理します。',
      '契約履行のため、製品情報、メール、注文・決済参照番号、ライセンス状態、認証日時および端末識別子を処理します（GDPR第6条第1項(b)）。',
      '決済はStripeが処理し、必要な注文、連絡先、請求および決済情報を取得します。カード番号全体は保存しません。詳細: https://stripe.com/privacy。国外へのデータ移転が発生する場合があります。',
      '注文と請求記録は商法・税法上の保管義務に従って保存されます。ライセンスデータは契約期間と残存請求の処理に必要です。その他のデータは必要性がなくなり、法的保管義務がない場合に削除されます。',
      'オンラインでの契約撤回では氏名、メール、契約内容、受付時刻、参照番号を法的義務の履行のために処理します（GDPR第6条第1項(c)）。受領確認はResendを使用して送信されます。',
    ],
  },
  ko: {
    title: '계정, 라이선스, 결제 및 계약 철회 개인정보',
    paragraphs: [
      '로그인과 라이선스 관리를 위해 이메일 주소와 Supabase 사용자 식별자를 GDPR 제6조 제1항 (b)에 따라 처리합니다.',
      '계약 이행을 위해 제품 정보, 이메일, 주문 및 결제 참조, 라이선스 상태, 활성화 시각과 기기 식별자를 처리합니다(GDPR 제6조 제1항 (b)).',
      '결제는 Stripe가 처리하며 필요한 주문, 연락처, 청구 및 결제 정보를 수집합니다. 전체 카드 번호는 저장하지 않습니다. 자세한 내용: https://stripe.com/privacy. 국제 데이터 이전이 발생할 수 있습니다.',
      '주문과 청구 기록은 상거래 및 세법상 의무에 따라 보관합니다. 라이선스 데이터는 계약 기간과 잔여 청구 처리에 필요합니다. 그 밖의 데이터는 필요성이 사라지고 법적 보관 의무가 없으면 삭제합니다.',
      '온라인 철회 시 성명, 이메일, 계약 정보, 접수 시각과 참조번호를 법적 의무에 따라 처리합니다(GDPR 제6조 제1항 (c)). Resend로 접수 확인을 보냅니다.',
    ],
  },
}
