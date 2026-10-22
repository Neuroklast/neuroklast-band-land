import type { LegalLocale } from './legal-i18n'

/** Consumer information. Must be reviewed against the seller's actual order flow. */
export const WITHDRAWAL_COPY: Record<LegalLocale, { heading: string; period: string; refunds: string; exception: string; details: string }> = {
  de: {
    heading: 'Frist, Erklärung und Folgen',
    period: 'Verbraucher können einen Vertrag über digitale Inhalte grundsätzlich innerhalb von vierzehn Tagen ab Vertragsschluss ohne Angabe von Gründen widerrufen. Zur Wahrung der Frist genügt die rechtzeitige Absendung einer eindeutigen Erklärung per Online-Formular oder E-Mail.',
    refunds: 'Bei wirksamem Widerruf werden erhaltene Zahlungen unverzüglich, spätestens innerhalb von vierzehn Tagen nach Eingang der Erklärung, grundsätzlich über dasselbe Zahlungsmittel und ohne Erstattungsentgelt zurückgezahlt.',
    exception: 'Bei digitalen Inhalten ohne körperlichen Datenträger kann das Widerrufsrecht nur dann vorzeitig erlöschen, wenn sämtliche Voraussetzungen des § 356 Abs. 6 BGB erfüllt sind. Ein Download allein genügt nicht.',
    details: 'Eine Widerrufsbegründung ist nicht erforderlich. Die elektronische Widerrufsfunktion ist ohne Anmeldung erreichbar.',
  },
  en: {
    heading: 'Period, notice and consequences',
    period: 'Consumers may generally withdraw from a digital content contract within fourteen days from its conclusion without giving reasons. It is sufficient to send a clear withdrawal declaration online or by email before the deadline.',
    refunds: 'Following an effective withdrawal, payments received will normally be refunded using the original payment method without fees, promptly and no later than fourteen days after receipt of the declaration.',
    exception: 'For non-tangible digital content, the right may end early only if all statutory conditions under § 356(6) BGB are met. Downloading alone is not enough.',
    details: 'You do not have to give a reason. The electronic withdrawal form is accessible without signing in.',
  },
  uk: {
    heading: 'Строк, повідомлення та наслідки',
    period: 'Споживач може зазвичай відмовитися від договору про цифровий контент протягом 14 днів після його укладення без пояснення причин. Достатньо надіслати чітку заяву через онлайн-форму або електронною поштою до завершення строку.',
    refunds: 'У разі дійсної відмови отримані кошти повертаються без додаткової плати, зазвичай тим самим способом оплати, невідкладно й не пізніше 14 днів після отримання заяви.',
    exception: 'Для цифрового контенту без фізичного носія право може припинитися достроково лише за виконання всіх законних умов § 356 абз. 6 BGB. Сам факт завантаження недостатній.',
    details: 'Причину зазначати не потрібно. Онлайн-формою можна скористатися без входу до облікового запису.',
  },
  it: {
    heading: 'Termine, comunicazione ed effetti',
    period: 'Il consumatore può di norma recedere da un contratto per contenuti digitali entro 14 giorni dalla sua conclusione, senza indicarne il motivo. È sufficiente inviare una dichiarazione inequivocabile online o via email entro il termine.',
    refunds: 'In caso di recesso valido, i pagamenti ricevuti sono rimborsati senza costi, di norma con lo stesso mezzo di pagamento, tempestivamente e comunque entro 14 giorni dal ricevimento della dichiarazione.',
    exception: 'Per contenuti digitali non forniti su supporto materiale, il diritto può estinguersi anticipatamente solo se sono soddisfatte tutte le condizioni del § 356 comma 6 BGB. Il solo download non basta.',
    details: 'Non è necessaria alcuna motivazione. Il modulo online è utilizzabile senza accesso.',
  },
  es: {
    heading: 'Plazo, comunicación y consecuencias',
    period: 'El consumidor puede, por regla general, desistir de un contrato de contenido digital dentro de los 14 días siguientes a su celebración, sin indicar motivo. Basta enviar una declaración inequívoca mediante el formulario o por correo electrónico antes de que finalice el plazo.',
    refunds: 'En caso de desistimiento válido, se reembolsarán los pagos recibidos sin costes, normalmente por el mismo medio de pago y como máximo dentro de los 14 días desde la recepción de la declaración.',
    exception: 'En contenidos digitales sin soporte material, el derecho puede extinguirse anticipadamente solo si se cumplen todos los requisitos legales del § 356 apartado 6 BGB. La descarga por sí sola no basta.',
    details: 'No se requiere justificación. El formulario electrónico está disponible sin iniciar sesión.',
  },
  pt: {
    heading: 'Prazo, declaração e efeitos',
    period: 'O consumidor pode, em regra, resolver um contrato de conteúdos digitais nos 14 dias após a sua celebração, sem indicar motivo. Basta enviar uma declaração inequívoca pelo formulário online ou por email antes de terminar o prazo.',
    refunds: 'Em caso de resolução válida, os pagamentos recebidos serão reembolsados sem custos, em regra pelo mesmo meio de pagamento, prontamente e até 14 dias após a receção da declaração.',
    exception: 'Nos conteúdos digitais sem suporte material, o direito só pode cessar antecipadamente se forem cumpridos todos os requisitos legais do § 356, n.º 6, BGB. A transferência por si só não basta.',
    details: 'Não é necessário indicar motivo. O formulário online funciona sem iniciar sessão.',
  },
  ja: {
    heading: '期間、通知、返金について',
    period: '消費者は原則としてデジタルコンテンツ契約の成立から14日以内であれば、理由を示さずに契約を撤回できます。期間内にオンラインフォームまたはメールで明確な撤回の意思を送信すれば足ります。',
    refunds: '有効な撤回の場合、受領済みの代金は追加手数料なしで、原則として元の決済方法により、通知の受領から遅くとも14日以内に返金します。',
    exception: '物理的媒体を伴わないデジタルコンテンツの場合、ドイツ民法第356条第6項の法定要件をすべて満たす場合に限り、撤回権が早期に消滅することがあります。ダウンロードだけでは消滅しません。',
    details: '撤回理由は不要です。オンラインフォームはログインなしで利用できます。',
  },
  ko: {
    heading: '기간, 통지 및 환불',
    period: '소비자는 원칙적으로 디지털 콘텐츠 계약 체결 후 14일 이내에 이유 없이 계약을 철회할 수 있습니다. 기한 내에 온라인 양식 또는 이메일로 명확한 의사를 보내면 됩니다.',
    refunds: '유효한 철회의 경우 이미 수령한 금액은 추가 수수료 없이 원래 결제 수단을 통해, 철회 통지를 받은 후 늦어도 14일 이내에 환불합니다.',
    exception: '유형의 매체 없이 제공되는 디지털 콘텐츠의 철회권은 독일 민법 제356조 제6항의 법적 요건이 모두 충족된 경우에만 조기에 소멸할 수 있습니다. 다운로드만으로 소멸하지 않습니다.',
    details: '철회 사유는 필요하지 않습니다. 온라인 양식은 로그인 없이 이용할 수 있습니다.',
  },
}


/** Shown when a withdrawal was persisted but email acceptance is pending. */
export const WITHDRAWAL_RECEIPT_PENDING: Record<LegalLocale, string> = {
  de: 'Dein Widerruf wurde gespeichert, die E-Mail-Eingangsbestätigung steht aber noch aus. Bewahre die Referenz auf und nutze bei Bedarf die Kontaktadresse im Impressum.',
  en: 'Your withdrawal has been recorded, but the email receipt is still pending. Keep the reference and contact the seller using the Legal Notice if necessary.',
  uk: 'Вашу відмову записано, але підтвердження електронною поштою ще очікується. Збережіть номер звернення та за потреби звʼяжіться з продавцем за контактами у правовій інформації.',
  it: 'La dichiarazione è stata registrata, ma la conferma via email è ancora in sospeso. Conserva il riferimento e, se necessario, contatta il venditore attraverso le Note legali.',
  es: 'Tu desistimiento se ha registrado, pero la confirmación por correo todavía está pendiente. Conserva la referencia y, si es necesario, contacta con el vendedor mediante el Aviso legal.',
  pt: 'A declaração foi registada, mas a confirmação por email ainda está pendente. Guarde a referência e, se necessário, contacte o vendedor pelos dados do Aviso legal.',
  ja: '契約撤回の申告は記録されましたが、メールでの受領確認はまだ送信されていません。参照番号を保管し、必要に応じて法的表示の連絡先から販売者にお問い合わせください。',
  ko: '계약 철회 의사가 기록되었지만 이메일 수신 확인은 아직 전송되지 않았습니다. 참조 번호를 보관하고 필요한 경우 법적 고지의 연락처로 판매자에게 문의하세요.',
}
