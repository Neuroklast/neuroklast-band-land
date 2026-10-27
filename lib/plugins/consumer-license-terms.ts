/**
 * Public consumer licence information for direct software sales.
 * This summary is deliberately narrower than any product-specific grant.
 * Mandatory consumer law always prevails; keep packaged EULAs in sync.
 */
export const SOFTWARE_LICENSE_CONDITIONS = [
  {
    title: 'Geltungsbereich',
    body: 'Diese Informationen betreffen kostenpflichtige, digital bereitgestellte NEUROKLAST Audio-Software. Maßgeblich sind außerdem die konkreten Produktangaben und die beim Kauf bereitgestellten Lizenzbedingungen.',
  },
  {
    title: 'Nutzungsrecht',
    body: 'Eine gültige Softwarelizenz gewährt das nicht ausschließliche Recht, die betreffende Software für eigene private und kommerzielle Musikproduktionen im Umfang der erworbenen Lizenz zu verwenden. Fertig produzierte Musik darf veröffentlicht werden. Ein Weiterverkauf oder die Weitergabe der Software selbst ist damit nicht gestattet, soweit gesetzlich keine abweichenden Rechte bestehen.',
  },
  {
    title: 'Aktivierung und Geräte',
    body: 'Wenn das Produkt eine Aktivierung benötigt, gelten die auf seiner Produktseite ausgewiesenen Aktivierungsplätze und technischen Voraussetzungen. Für NEUROKORE werden derzeit zwei Geräteaktivierungen und eine regelmäßig zu erneuernde Offline-Berechtigung beschrieben. Eine Änderung der Zahl aktiver Geräte kann Unterstützung durch den Anbieter erfordern.',
  },
  {
    title: 'Rechte an der Software',
    body: 'Urheberrechte und sonstige Schutzrechte an der Software verbleiben bei den jeweiligen Berechtigten. Eine Lizenzüberlassung überträgt keine Urheberrechte. Gesetzliche Rechte insbesondere auf zulässige Sicherungskopien, Interoperabilität und Fehlerbehebung bleiben unberührt.',
  },
  {
    title: 'Mängelrechte und Aktualisierungen',
    body: 'Gesetzliche Gewährleistungsrechte, Rechte auf notwendige Aktualisierungen und andere zwingende Verbraucherrechte werden durch diese Bedingungen nicht ausgeschlossen oder beschränkt. Pauschale Ausschlüsse jeglicher Haftung oder Gewährleistung gelten gegenüber Verbrauchern nicht.',
  },
  {
    title: 'Widerruf',
    body: 'Für Verbraucher gelten die gesetzlichen Widerrufsrechte. Die Widerrufsbelehrung und das Online-Widerrufsformular findest du über die Links im Shop. Eine Lizenzaktivierung allein ersetzt keine gesetzlich notwendigen Erklärungen zum vorzeitigen Erlöschen des Widerrufsrechts.',
  },
  {
    title: 'Kontakt',
    body: 'Fragen zu Aktivierung, Lizenz und Support können an den im Impressum genannten Betreiber gerichtet werden.',
  },
] as const

export function softwareLicenseEmailText(): string {
  return SOFTWARE_LICENSE_CONDITIONS.map(section => section.title + '\n' + section.body).join('\n\n')
}
