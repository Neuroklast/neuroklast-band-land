import type { LegalLocale } from '@/lib/legal-i18n'
import type { LegalSection } from '@/lib/legal-content'

type Doc = 'terms' | 'purchase' | 'withdrawal' | 'license'
type SectionId = 'scope' | 'seller' | 'contract' | 'payment' | 'delivery' | 'licence' | 'rights' | 'withdrawal' | 'support'
type LanguageText = {
  docs: Record<Doc, string>
  sections: Record<SectionId, [string, string]>
  links: { notice: string; privacy: string; withdrawal: string; licence: string; purchase: string; terms: string; confirm: string; submit: string; review: string; name: string; email: string; order: string }
}
/** Translator review required before expansion into a new jurisdiction. No invented company data. */
export const COMMERCE_LEGAL_COPY: Record<LegalLocale, LanguageText> = {
  de: {
    docs: { terms: 'Allgemeine Geschäftsbedingungen für Software', purchase: 'Informationen zum Softwarekauf', withdrawal: 'Widerrufsbelehrung für digitale Inhalte', license: 'Lizenzbedingungen für Audio-Software' },
    sections: {
      scope: ['Geltungsbereich', 'Diese Bedingungen gelten für den einmaligen Erwerb digitaler Audio-Software und Softwarelizenzen über den NEUROKLAST-Shop durch Verbraucher und Unternehmer. Für einzelne Produkte gelten die auf der Produktseite beschriebenen Eigenschaften und Nutzungsrechte.'],
      seller: ['Vertragspartner', 'Anbieter und Lizenzgeber der Software ist der im Impressum genannte Betreiber. Bei Zahlungen über Stripe Managed Payments kann Stripe beziehungsweise der im Checkout benannte Zahlungsanbieter als Merchant of Record für die Verkaufstransaktion und die Rechnungsstellung auftreten. Wer den Kaufpreis einzieht und Rechnungen ausstellt, ergibt sich aus den Angaben unmittelbar vor der Zahlung und der anschließenden Kaufbestätigung. Gesetzliche Ansprüche des Kunden bleiben unberührt.'],
      contract: ['Bestellung und Vertragsschluss', 'Die Produktseite stellt noch kein verbindliches Angebot dar. Vor der zahlungspflichtigen Bestellung können die Angaben im Checkout geprüft und korrigiert werden. Ein Vertrag kommt durch Annahme der Bestellung nach erfolgreicher Zahlung und Bestätigung zustande. Die Vertragsbestätigung wird per E-Mail übermittelt.'],
      payment: ['Preise und Zahlung', 'Es gelten die unmittelbar vor der Bestellung ausgewiesenen Gesamtpreise einschließlich anfallender Steuern. Der Checkout zeigt die verfügbaren Zahlungsmittel. Für digitale Downloads entstehen keine Versandkosten. Der Shop unterstützt derzeit ausschließlich einmalige Zahlungen.'],
      delivery: ['Digitale Bereitstellung', 'Bei Verfügbarkeit wird die Software elektronisch über die veröffentlichte Downloadseite bereitgestellt. Die erworbene Lizenz wird nach Zahlungsbestätigung dem Kundenkonto zugeordnet. Systemvoraussetzungen, verfügbare Betriebssysteme und Aktivierungsmöglichkeiten stehen auf der jeweiligen Produktseite.'],
      licence: ['Nutzungsrechte', 'Die eingeräumten Nutzungsrechte richten sich nach den Produktangaben und den gesonderten Lizenzbedingungen. Eine Lizenzüberlassung überträgt keine Urheberrechte. Gesetzlich zwingende Rechte an Computerprogrammen bleiben unberührt.'],
      rights: ['Mängel und Aktualisierungen', 'Es gelten die gesetzlichen Rechte bei Mängeln und die Vorschriften für digitale Produkte einschließlich notwendiger Aktualisierungen. Eine pauschale Freizeichnung von Gewährleistung oder Haftung gegenüber Verbrauchern findet nicht statt.'],
      withdrawal: ['Widerruf', 'Verbraucher haben grundsätzlich ein vierzehntägiges Widerrufsrecht. Die Voraussetzungen für ein mögliches vorzeitiges Erlöschen bei digitalen Inhalten werden in der Widerrufsbelehrung erläutert. Die elektronische Widerrufsfunktion steht ohne Anmeldung zur Verfügung.'],
      support: ['Kontakt und anwendbares Recht', 'Bei Fragen zu Bestellungen, Lizenzen oder Mängeln gelten die Kontaktangaben im Impressum. Es gilt deutsches Recht, soweit dadurch zwingende Verbraucherschutzbestimmungen des Staates des gewöhnlichen Aufenthalts von Verbrauchern nicht entzogen werden.'],
    },
    links: { notice: 'Impressum', privacy: 'Datenschutz', withdrawal: 'Vertrag widerrufen', licence: 'Lizenzbedingungen', purchase: 'Softwarekauf', terms: 'AGB', confirm: 'Widerruf bestätigen', submit: 'Weiter zur Bestätigung', review: 'Angaben bearbeiten', name: 'Vollständiger Name', email: 'E-Mail-Adresse', order: 'Bestellnummer oder Vertragsangaben' },
  },
  en: {
    docs: { terms: 'Terms and Conditions for Software', purchase: 'Software Purchase Information', withdrawal: 'Right of Withdrawal for Digital Content', license: 'Audio Software Licence Terms' },
    sections: {
      scope: ['Scope', 'These terms cover one-time purchases of digital audio software and software licences from the NEUROKLAST shop by consumers or businesses. Product-specific features and usage rights are described on each product page.'],
      seller: ['Seller', 'The software is supplied and licensed by the operator identified in the Legal Notice. For payments processed through Stripe Managed Payments, Stripe or the payment provider identified at checkout may act as Merchant of Record for the sale transaction and issue the receipt or invoice. The checkout and purchase confirmation identify the payment seller and invoicing party. Statutory consumer rights remain unaffected.'],
      contract: ['Ordering and contract formation', 'A product listing is not itself a binding offer. You can review and correct order details in checkout before placing an order with an obligation to pay. A contract is formed when the order is accepted following successful payment and confirmation. A confirmation is sent by email.'],
      payment: ['Prices and payment', 'The total price, including applicable taxes, is displayed immediately before placing the order. Available payment methods appear in checkout. No shipping charges apply to digital downloads. Only one-time payments are currently offered.'],
      delivery: ['Digital delivery', 'Where available, software is supplied electronically through its published download page. The purchased licence is assigned to the customer account after payment is confirmed. Supported systems and activation conditions are listed on the product page.'],
      licence: ['Usage rights', 'Your rights of use are defined by the relevant product details and separate licence terms. The licence does not transfer copyright. Non-waivable statutory software rights remain unaffected.'],
      rights: ['Defects and updates', 'Statutory rights concerning defects and digital products, including required updates, remain in force. There is no blanket exclusion of consumer warranties or liability.'],
      withdrawal: ['Withdrawal', 'Consumers generally have a fourteen-day right to withdraw. The separate withdrawal notice explains when the right may exceptionally expire early for digital content. You can submit a withdrawal online without signing in.'],
      support: ['Contact and governing law', 'For orders, licences and defects, contact the operator identified in the Legal Notice. German law applies without depriving consumers of mandatory protections available in their country of habitual residence.'],
    },
    links: { notice: 'Legal Notice', privacy: 'Privacy Policy', withdrawal: 'Withdraw from contract', licence: 'Licence Terms', purchase: 'Purchase Information', terms: 'Terms & Conditions', confirm: 'Confirm withdrawal', submit: 'Continue to confirmation', review: 'Edit details', name: 'Full name', email: 'Email address', order: 'Order number or contract details' },
  },
  uk: {
    docs: { terms: 'Загальні умови продажу програмного забезпечення', purchase: 'Інформація про придбання програм', withdrawal: 'Право на відмову від цифрового контенту', license: 'Ліцензійні умови для аудіопрограм' },
    sections: {
      scope: ['Сфера дії', 'Ці умови застосовуються до одноразового придбання цифрових аудіопрограм і ліцензій у магазині NEUROKLAST. Особливості продукту та права користування зазначені на відповідній сторінці.'],
      seller: ['Продавець', 'Стороною договору є оператор вебсайту, зазначений у розділі правової інформації, де вказані поштова адреса й електронна пошта.'],
      contract: ['Замовлення й укладення договору', 'Сторінка продукту не є обовʼязковою пропозицією. Перед оплатою можна перевірити й виправити дані. Договір укладається після прийняття замовлення, успішної оплати та підтвердження електронною поштою.'],
      payment: ['Ціни й оплата', 'Перед оформленням показується повна ціна з відповідними податками. Доступні способи оплати зазначаються під час оформлення. Доставка цифрових файлів безкоштовна. Наразі доступні лише одноразові платежі.'],
      delivery: ['Цифрове надання', 'Опубліковані версії програм доступні для електронного завантаження. Після підтвердження оплати ліцензія привʼязується до облікового запису. Системні вимоги та умови активації вказані на сторінці продукту.'],
      licence: ['Права користування', 'Права користування визначаються характеристиками продукту та окремими ліцензійними умовами. Авторські права не передаються. Обовʼязкові права, встановлені законом, зберігаються.'],
      rights: ['Недоліки й оновлення', 'Законні права щодо недоліків цифрових продуктів і необхідних оновлень залишаються чинними. Загальне виключення відповідальності перед споживачами не застосовується.'],
      withdrawal: ['Відмова від договору', 'Споживачі зазвичай можуть відмовитися від договору протягом 14 днів. У повідомленні про відмову описано умови можливого дострокового припинення цього права. Онлайн-форма доступна без входу.'],
      support: ['Звʼязок і застосовне право', 'Для питань щодо замовлень і ліцензій звертайтесь за контактами у правовій інформації. Застосовується німецьке право без обмеження обовʼязкового захисту споживача за місцем постійного проживання.'],
    },
    links: { notice: 'Правова інформація', privacy: 'Конфіденційність', withdrawal: 'Відмовитися від договору', licence: 'Ліцензія', purchase: 'Придбання', terms: 'Умови продажу', confirm: 'Підтвердити відмову', submit: 'Далі до підтвердження', review: 'Змінити дані', name: 'Повне імʼя', email: 'Електронна пошта', order: 'Номер замовлення або договір' },
  },
  it: {
    docs: { terms: 'Condizioni generali di vendita del software', purchase: 'Informazioni sull’acquisto del software', withdrawal: 'Diritto di recesso per contenuti digitali', license: 'Condizioni di licenza del software audio' },
    sections: {
      scope: ['Ambito di applicazione', 'Le presenti condizioni riguardano gli acquisti una tantum di software audio digitale e licenze nel negozio NEUROKLAST. Le caratteristiche e i diritti specifici sono indicati nella pagina del prodotto.'],
      seller: ['Venditore', 'Il contraente è il gestore indicato nelle Note legali, dove sono riportati indirizzo e recapito email.'],
      contract: ['Ordine e conclusione del contratto', 'La pagina del prodotto non costituisce un’offerta vincolante. Prima di pagare puoi verificare e correggere i dati dell’ordine. Il contratto si conclude con l’accettazione dell’ordine dopo il pagamento e la conferma inviata via email.'],
      payment: ['Prezzi e pagamenti', 'Il prezzo totale comprensivo delle imposte applicabili è mostrato prima della conferma dell’ordine. I metodi di pagamento disponibili sono indicati nel checkout. Nessun costo di spedizione per i download. Sono previsti solo pagamenti una tantum.'],
      delivery: ['Consegna digitale', 'Il software disponibile viene fornito tramite la pagina di download pubblicata. Dopo la conferma del pagamento la licenza è associata all’account cliente. Requisiti di sistema e attivazione sono indicati nella pagina del prodotto.'],
      licence: ['Diritti d’uso', 'I diritti d’uso derivano dai dettagli del prodotto e dalle condizioni di licenza separate. Non viene trasferito alcun diritto d’autore. Restano salvi i diritti inderogabili previsti dalla legge.'],
      rights: ['Difetti e aggiornamenti', 'Restano validi i diritti di legge sui difetti dei prodotti digitali e sugli aggiornamenti necessari. Non è prevista un’esclusione generale delle garanzie dei consumatori.'],
      withdrawal: ['Recesso', 'I consumatori dispongono di norma di 14 giorni per recedere. L’informativa sul recesso spiega quando questo diritto può estinguersi anticipatamente per i contenuti digitali. È disponibile un modulo senza accesso.'],
      support: ['Contatti e legge applicabile', 'Per ordini e licenze rivolgersi ai recapiti nelle Note legali. Si applica la legge tedesca, senza pregiudicare le norme inderogabili di protezione dei consumatori nel Paese di residenza abituale.'],
    },
    links: { notice: 'Note legali', privacy: 'Privacy', withdrawal: 'Recedi dal contratto', licence: 'Licenza', purchase: 'Acquisto', terms: 'Condizioni generali', confirm: 'Conferma recesso', submit: 'Procedi alla conferma', review: 'Modifica dati', name: 'Nome completo', email: 'Indirizzo email', order: 'Numero ordine o contratto' },
  },
  es: {
    docs: { terms: 'Condiciones generales de venta de software', purchase: 'Información sobre la compra de software', withdrawal: 'Derecho de desistimiento de contenido digital', license: 'Condiciones de licencia del software de audio' },
    sections: {
      scope: ['Ámbito de aplicación', 'Estas condiciones se aplican a la compra única de software de audio digital y licencias en la tienda NEUROKLAST. Las características y los derechos de uso se describen en la página de cada producto.'],
      seller: ['Vendedor', 'La otra parte del contrato es el operador identificado en el Aviso legal, donde figuran el domicilio y el correo de contacto.'],
      contract: ['Pedido y celebración', 'La página del producto no constituye una oferta vinculante. Puedes revisar y corregir los datos antes de pagar. El contrato se perfecciona cuando se acepta el pedido tras el pago y se envía la confirmación por correo electrónico.'],
      payment: ['Precios y pago', 'El precio total, incluidos los impuestos aplicables, se muestra antes de realizar el pedido. Los métodos disponibles aparecen durante el pago. No hay gastos de envío de archivos digitales. Solo se permiten pagos únicos.'],
      delivery: ['Entrega digital', 'El software disponible se facilita por descarga en la página publicada. Tras confirmarse el pago, la licencia se asigna a la cuenta del cliente. Los requisitos de sistema y activación figuran en la página del producto.'],
      licence: ['Derechos de uso', 'Los derechos de uso se regulan por la información del producto y las condiciones de licencia independientes. No se transfieren derechos de autor. Se respetan los derechos legales irrenunciables.'],
      rights: ['Defectos y actualizaciones', 'Se mantienen los derechos legales relativos a defectos de productos digitales y las actualizaciones necesarias. No se excluyen de forma general las garantías de los consumidores.'],
      withdrawal: ['Desistimiento', 'Por regla general, los consumidores disponen de 14 días para desistir. La información de desistimiento explica las circunstancias de una posible pérdida anticipada del derecho. Existe un formulario accesible sin iniciar sesión.'],
      support: ['Contacto y legislación', 'Para consultas sobre compras y licencias, utiliza los datos del Aviso legal. Se aplica la ley alemana sin privar al consumidor de las normas imperativas de protección de su país de residencia habitual.'],
    },
    links: { notice: 'Aviso legal', privacy: 'Privacidad', withdrawal: 'Desistir del contrato', licence: 'Licencia', purchase: 'Compra', terms: 'Condiciones generales', confirm: 'Confirmar desistimiento', submit: 'Continuar a confirmación', review: 'Modificar datos', name: 'Nombre completo', email: 'Correo electrónico', order: 'Pedido o datos del contrato' },
  },
  pt: {
    docs: { terms: 'Termos e condições de venda de software', purchase: 'Informações sobre a compra de software', withdrawal: 'Direito de livre resolução de conteúdos digitais', license: 'Termos de licença de software áudio' },
    sections: {
      scope: ['Âmbito', 'Estas condições aplicam-se a compras únicas de software áudio digital e licenças na loja NEUROKLAST. As características e os direitos específicos constam da página de cada produto.'],
      seller: ['Vendedor', 'A parte contratante é o operador identificado no Aviso legal, com morada e endereço de email para contacto.'],
      contract: ['Encomenda e celebração', 'A página do produto não constitui uma proposta vinculativa. Pode rever e corrigir os dados antes de pagar. O contrato é celebrado após a aceitação da encomenda, o pagamento e a confirmação por email.'],
      payment: ['Preços e pagamento', 'O preço total, incluindo os impostos aplicáveis, é apresentado antes da encomenda. Os métodos de pagamento disponíveis constam do checkout. Não existem portes para transferências digitais. Apenas estão disponíveis pagamentos únicos.'],
      delivery: ['Entrega digital', 'O software disponível é fornecido por transferência através da página publicada. Após confirmação do pagamento, a licença é atribuída à conta do cliente. Os requisitos e as condições de ativação estão na página do produto.'],
      licence: ['Direitos de utilização', 'Os direitos de utilização são definidos pelas informações do produto e pelos termos de licença separados. Não são transferidos direitos de autor. Os direitos legais imperativos mantêm-se.'],
      rights: ['Defeitos e atualizações', 'Aplicam-se os direitos legais relativos a defeitos de produtos digitais e às atualizações necessárias. Não existe exclusão geral das garantias dos consumidores.'],
      withdrawal: ['Livre resolução', 'Os consumidores dispõem, em regra, de 14 dias para resolver o contrato. A informação sobre livre resolução explica as condições de eventual perda antecipada deste direito. O formulário está disponível sem iniciar sessão.'],
      support: ['Contacto e lei aplicável', 'Para questões sobre encomendas ou licenças, utilize os contactos do Aviso legal. Aplica-se a lei alemã, sem afastar as regras imperativas de proteção do consumidor no país da sua residência habitual.'],
    },
    links: { notice: 'Aviso legal', privacy: 'Privacidade', withdrawal: 'Resolver contrato', licence: 'Licença', purchase: 'Compra', terms: 'Termos e condições', confirm: 'Confirmar resolução', submit: 'Continuar para confirmação', review: 'Alterar dados', name: 'Nome completo', email: 'Email', order: 'Encomenda ou contrato' },
  },
  ja: {
    docs: { terms: 'ソフトウェア販売利用規約', purchase: 'ソフトウェア購入について', withdrawal: 'デジタルコンテンツの撤回権', license: '音響ソフトウェアのライセンス条件' },
    sections: {
      scope: ['適用範囲', '本条件は、NEUROKLASTストアで販売するデジタル音響ソフトウェアおよびライセンスの一括購入に適用されます。製品固有の機能と利用権は各製品ページに記載します。'],
      seller: ['販売者', '契約相手は法的表示に記載されるサイト運営者です。住所と連絡用メールアドレスも同ページで確認できます。'],
      contract: ['注文と契約の成立', '製品ページの表示は拘束力のある申込みではありません。注文確定前に入力内容を確認・訂正できます。支払いが成功し、注文が承諾・確認された時点で契約が成立します。確認書はメールで送付します。'],
      payment: ['価格と支払い', '適用される税金を含む合計金額は注文確定前に表示されます。利用可能な決済方法は決済画面に表示されます。デジタル商品の送料はありません。現在は一回限りの支払いのみ対応しています。'],
      delivery: ['デジタル提供', '公開済みのソフトウェアはダウンロードページから提供します。支払い確認後にライセンスがお客様のアカウントへ割り当てられます。対応環境や認証条件は各製品ページを確認してください。'],
      licence: ['利用権', '利用範囲は製品情報と別途のライセンス条件によります。著作権は移転しません。法律上放棄できない権利は維持されます。'],
      rights: ['不具合と更新', 'デジタル製品の不具合および必要な更新に関する法定の権利は維持されます。消費者に対するすべての保証・責任を一律に免除するものではありません。'],
      withdrawal: ['契約の撤回', '消費者には原則として14日間の撤回権があります。デジタルコンテンツについて早期に消滅する場合の条件は撤回案内をご確認ください。ログイン不要の撤回フォームがあります。'],
      support: ['連絡先と準拠法', '注文やライセンスの相談は法的表示の連絡先へお願いします。ドイツ法が適用されますが、消費者の通常居住国における強行的な保護規定は妨げられません。'],
    },
    links: { notice: '運営者情報', privacy: 'プライバシー', withdrawal: '契約を撤回', licence: 'ライセンス条件', purchase: '購入情報', terms: '販売規約', confirm: '撤回を確定', submit: '確認へ進む', review: '入力内容を修正', name: '氏名', email: 'メールアドレス', order: '注文番号または契約内容' },
  },
  ko: {
    docs: { terms: '소프트웨어 판매 이용약관', purchase: '소프트웨어 구매 안내', withdrawal: '디지털 콘텐츠 계약 철회 안내', license: '오디오 소프트웨어 라이선스 조건' },
    sections: {
      scope: ['적용 범위', '이 약관은 NEUROKLAST 스토어에서 디지털 오디오 소프트웨어와 라이선스를 일회성으로 구매하는 경우에 적용됩니다. 제품별 기능과 사용 권리는 각 제품 페이지에 표시됩니다.'],
      seller: ['판매자', '계약 상대방은 법적 고지에 표시된 웹사이트 운영자이며, 해당 페이지에서 주소와 이메일을 확인할 수 있습니다.'],
      contract: ['주문 및 계약 체결', '제품 페이지 자체는 구속력 있는 청약이 아닙니다. 결제 전 주문 정보를 확인하고 수정할 수 있습니다. 결제가 완료되고 주문이 승인 및 확인되면 계약이 체결됩니다. 확인서는 이메일로 전송됩니다.'],
      payment: ['가격 및 결제', '적용되는 세금을 포함한 총액이 주문 확정 전에 표시됩니다. 사용 가능한 결제 수단은 결제 화면에 표시됩니다. 디지털 다운로드 배송비는 없습니다. 현재 일회성 결제만 지원합니다.'],
      delivery: ['디지털 제공', '공개된 소프트웨어는 다운로드 페이지에서 제공됩니다. 결제 확인 후 고객 계정에 라이선스가 할당됩니다. 시스템 요구사항과 활성화 조건은 제품 페이지를 참조하세요.'],
      licence: ['사용 권리', '사용 범위는 제품 설명과 별도 라이선스 조건에 따릅니다. 저작권은 이전되지 않습니다. 법률상 포기할 수 없는 권리는 그대로 유지됩니다.'],
      rights: ['하자 및 업데이트', '디지털 제품의 하자와 필수 업데이트에 관한 법적 권리는 유지됩니다. 소비자의 모든 보증이나 책임을 일괄 면제하지 않습니다.'],
      withdrawal: ['계약 철회', '소비자는 원칙적으로 14일 이내 계약을 철회할 수 있습니다. 디지털 콘텐츠에 대한 조기 소멸 조건은 철회 안내에서 확인할 수 있습니다. 로그인 없이 온라인 철회 양식을 이용할 수 있습니다.'],
      support: ['문의 및 준거법', '주문 및 라이선스 문의는 법적 고지의 연락처를 이용하세요. 독일법이 적용되지만 소비자의 상거소 국가에서 제공하는 강행적 소비자 보호는 제한되지 않습니다.'],
    },
    links: { notice: '법적 고지', privacy: '개인정보 처리방침', withdrawal: '계약 철회', licence: '라이선스 조건', purchase: '구매 안내', terms: '판매 약관', confirm: '철회 확인', submit: '확인 단계로', review: '내용 수정', name: '성명', email: '이메일', order: '주문 번호 또는 계약 정보' },
  },
}

export const COMMERCE_DOC_SECTIONS: Record<Doc, SectionId[]> = {
  terms: ['scope', 'seller', 'contract', 'payment', 'delivery', 'licence', 'rights', 'withdrawal', 'support'],
  purchase: ['seller', 'contract', 'payment', 'delivery', 'rights', 'withdrawal', 'support'],
  withdrawal: ['withdrawal', 'seller', 'support'],
  license: ['scope', 'licence', 'delivery', 'rights', 'withdrawal', 'support'],
}

export function commerceSections(doc: Doc, locale: LegalLocale, germanTerms?: string): LegalSection[] {
  // The same text is used for localized web routes and the contract snapshot at checkout.
  if (doc === 'terms' && locale === 'de' && germanTerms?.trim()) {
    return [{ id: 'terms', title: COMMERCE_LEGAL_COPY.de.docs.terms, paragraphs: [germanTerms.trim()] }]
  }
  return COMMERCE_DOC_SECTIONS[doc].map(id => ({
    id,
    title: COMMERCE_LEGAL_COPY[locale].sections[id][0],
    paragraphs: [COMMERCE_LEGAL_COPY[locale].sections[id][1]],
  }))
}
