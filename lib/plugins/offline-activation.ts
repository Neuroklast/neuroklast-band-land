import type { LegalLocale } from '@/lib/legal-i18n'

const KEY = /^NK-[A-F0-9]{48}$/
const DEVICE = /^v2:[a-f0-9]{64}$/

export type OfflineCopy = {
  title: string
  lead: string
  step1: string
  step2: string
  step3: string
  keyLabel: string
  deviceLabel: string
  submit: string
  working: string
  success: string
  failed: string
  badKey: string
  badDevice: string
  note: string
  account: string
}

export const OFFLINE_COPY: Record<LegalLocale, OfflineCopy> = {
  de: {
    title: 'Offline-Lizenzdatei',
    lead: 'Für einen Rechner ohne Internet. Die Datei gilt nur für die System-ID aus dem Plug-in und höchstens 30 Tage.',
    step1: 'Am Studio-Rechner NEUROKORE öffnen, Settings → License, und die System-ID kopieren. Sie beginnt mit v2:.',
    step2: 'Hier den Lizenzschlüssel und diese System-ID eintragen und die Datei herunterladen.',
    step3: 'Die Datei am Studio-Rechner unter Settings → License auf Offline .lic ziehen oder Install .lic wählen.',
    keyLabel: 'Lizenzschlüssel',
    deviceLabel: 'System-ID',
    submit: 'Lizenzdatei herunterladen',
    working: 'Datei wird erstellt…',
    success: 'Download gestartet. Installiere die Datei auf dem Studio-Rechner.',
    failed: 'Aktivierung fehlgeschlagen. Prüfe Schlüssel und System-ID. Ein Schlüssel gilt für zwei Geräte.',
    badKey: 'Der Schlüssel beginnt mit NK- und hat danach 48 Zeichen.',
    badDevice: 'Die System-ID beginnt mit v2: und steht im Plug-in unter Settings → License.',
    note: 'Dieselbe System-ID mit demselben Schlüssel zu erneuern verbraucht keinen zweiten Platz.',
    account: 'Zu meinen Lizenzen',
  },
  en: {
    title: 'Offline licence file',
    lead: 'For a computer without internet. The file works only for the system ID copied from the plug-in, for up to 30 days.',
    step1: 'On the studio computer, open NEUROKORE, go to Settings → License, and copy the system ID. It starts with v2:.',
    step2: 'Paste the licence key and that system ID here, then download the file.',
    step3: 'On the studio computer, drop the file on Offline .lic in Settings → License, or choose Install .lic.',
    keyLabel: 'Licence key',
    deviceLabel: 'System ID',
    submit: 'Download licence file',
    working: 'Creating the file…',
    success: 'Download started. Install the file on the studio computer.',
    failed: 'Activation failed. Check the key and the system ID. One key covers two devices.',
    badKey: 'The key starts with NK- and has 48 characters after that.',
    badDevice: 'The system ID starts with v2: and is shown in the plug-in under Settings → License.',
    note: 'Renewing the same system ID with the same key does not use a second device seat.',
    account: 'My licences',
  },
  uk: {
    title: 'Офлайн-файл ліцензії',
    lead: 'Для комп’ютера без інтернету. Файл діє лише для System ID з плагіна і не довше 30 днів.',
    step1: 'На студійному комп’ютері відкрийте NEUROKORE, Settings → License, і скопіюйте System ID. Вона починається з v2:.',
    step2: 'Вставте ключ і цю System ID тут, потім завантажте файл.',
    step3: 'На студійному комп’ютері перетягніть файл у Offline .lic або натисніть Install .lic.',
    keyLabel: 'Ключ ліцензії',
    deviceLabel: 'System ID',
    submit: 'Завантажити файл ліцензії',
    working: 'Створення файлу…',
    success: 'Завантаження почалося. Встановіть файл на студійному комп’ютері.',
    failed: 'Активація не вдалася. Перевірте ключ і System ID. Один ключ — два пристрої.',
    badKey: 'Ключ починається з NK- і має ще 48 символів.',
    badDevice: 'System ID починається з v2: і показана в Settings → License.',
    note: 'Повтор тієї самої System ID з тим самим ключем не займає друге місце.',
    account: 'Мої ліцензії',
  },
  it: {
    title: 'File di licenza offline',
    lead: 'Per un computer senza internet. Il file vale solo per l’ID di sistema del plug-in, per al massimo 30 giorni.',
    step1: 'Sul computer in studio apri NEUROKORE, Settings → License, e copia l’ID di sistema. Inizia con v2:.',
    step2: 'Incolla qui la chiave e quell’ID, poi scarica il file.',
    step3: 'Sul computer in studio trascina il file su Offline .lic oppure scegli Install .lic.',
    keyLabel: 'Chiave di licenza',
    deviceLabel: 'ID di sistema',
    submit: 'Scarica il file di licenza',
    working: 'Creazione del file…',
    success: 'Download avviato. Installa il file sul computer in studio.',
    failed: 'Attivazione non riuscita. Controlla chiave e ID. Una chiave vale per due dispositivi.',
    badKey: 'La chiave inizia con NK- e ha altri 48 caratteri.',
    badDevice: 'L’ID inizia con v2: ed è in Settings → License nel plug-in.',
    note: 'Rinnovare lo stesso ID con la stessa chiave non usa un secondo posto.',
    account: 'Le mie licenze',
  },
  es: {
    title: 'Archivo de licencia sin conexión',
    lead: 'Para un ordenador sin internet. El archivo solo vale para el ID del sistema copiado del plugin, como máximo 30 días.',
    step1: 'En el ordenador del estudio abre NEUROKORE, Settings → License, y copia el ID del sistema. Empieza por v2:.',
    step2: 'Pega aquí la clave y ese ID, y descarga el archivo.',
    step3: 'En el ordenador del estudio suelta el archivo en Offline .lic o pulsa Install .lic.',
    keyLabel: 'Clave de licencia',
    deviceLabel: 'ID del sistema',
    submit: 'Descargar archivo de licencia',
    working: 'Creando el archivo…',
    success: 'Descarga iniciada. Instala el archivo en el ordenador del estudio.',
    failed: 'La activación falló. Revisa la clave y el ID. Una clave cubre dos equipos.',
    badKey: 'La clave empieza por NK- y tiene 48 caracteres más.',
    badDevice: 'El ID empieza por v2: y aparece en Settings → License.',
    note: 'Renovar el mismo ID con la misma clave no ocupa un segundo equipo.',
    account: 'Mis licencias',
  },
  pt: {
    title: 'Ficheiro de licença offline',
    lead: 'Para um computador sem internet. O ficheiro só vale para o ID do sistema copiado do plug-in, no máximo 30 dias.',
    step1: 'No computador do estúdio abra o NEUROKORE, Settings → License, e copie o ID do sistema. Começa por v2:.',
    step2: 'Cole aqui a chave e esse ID e transfira o ficheiro.',
    step3: 'No computador do estúdio largue o ficheiro em Offline .lic ou escolha Install .lic.',
    keyLabel: 'Chave de licença',
    deviceLabel: 'ID do sistema',
    submit: 'Transferir ficheiro de licença',
    working: 'A criar o ficheiro…',
    success: 'Transferência iniciada. Instale o ficheiro no computador do estúdio.',
    failed: 'A ativação falhou. Confirme a chave e o ID. Uma chave cobre dois dispositivos.',
    badKey: 'A chave começa por NK- e tem mais 48 caracteres.',
    badDevice: 'O ID começa por v2: e está em Settings → License.',
    note: 'Renovar o mesmo ID com a mesma chave não ocupa um segundo lugar.',
    account: 'As minhas licenças',
  },
  ja: {
    title: 'オフライン用ライセンスファイル',
    lead: 'インターネットのないコンピュータ向けです。ファイルはそのプラグインのシステムIDでのみ、最長30日有効です。',
    step1: 'スタジオのコンピュータで NEUROKORE を開き、Settings → License からシステムIDをコピーします。v2: で始まります。',
    step2: 'ここにライセンスキーとそのシステムIDを貼り付け、ファイルをダウンロードします。',
    step3: 'スタジオのコンピュータで Settings → License の Offline .lic にドロップするか、Install .lic を選びます。',
    keyLabel: 'ライセンスキー',
    deviceLabel: 'システムID',
    submit: 'ライセンスファイルをダウンロード',
    working: 'ファイルを作成しています…',
    success: 'ダウンロードを開始しました。スタジオのコンピュータにインストールしてください。',
    failed: '認証に失敗しました。キーとシステムIDを確認してください。1つのキーは2台までです。',
    badKey: 'キーは NK- の後に48文字です。',
    badDevice: 'システムIDは v2: で始まり、Settings → License に表示されます。',
    note: '同じシステムIDと同じキーの更新は、2台目の枠を使いません。',
    account: 'ライセンス一覧',
  },
  ko: {
    title: '오프라인 라이선스 파일',
    lead: '인터넷이 없는 컴퓨터용입니다. 파일은 플러그인에서 복사한 시스템 ID에만, 최대 30일 동안 유효합니다.',
    step1: '스튜디오 컴퓨터에서 NEUROKORE를 열고 Settings → License에서 시스템 ID를 복사합니다. v2: 로 시작합니다.',
    step2: '여기에 라이선스 키와 그 시스템 ID를 붙여 넣고 파일을 받습니다.',
    step3: '스튜디오 컴퓨터의 Settings → License에서 Offline .lic에 놓거나 Install .lic를 선택합니다.',
    keyLabel: '라이선스 키',
    deviceLabel: '시스템 ID',
    submit: '라이선스 파일 다운로드',
    working: '파일을 만드는 중…',
    success: '다운로드가 시작되었습니다. 스튜디오 컴퓨터에 설치하세요.',
    failed: '활성화에 실패했습니다. 키와 시스템 ID를 확인하세요. 키 하나당 기기 두 대입니다.',
    badKey: '키는 NK- 뒤에 문자 48자입니다.',
    badDevice: '시스템 ID는 v2: 로 시작하며 Settings → License에 있습니다.',
    note: '같은 시스템 ID와 같은 키로 갱신하면 두 번째 자리를 쓰지 않습니다.',
    account: '내 라이선스',
  },
}

export function normalizeLicenceKey(value: string): string {
  return value.trim().replace(/\s+/g, '').toUpperCase()
}

export function normalizeSystemId(value: string): string {
  const compact = value.trim().replace(/\s+/g, '')
  if (!compact.toLowerCase().startsWith('v2:')) return compact
  return 'v2:' + compact.slice(3).toLowerCase()
}

export function offlineFieldError(key: string, device: string, copy: OfflineCopy): string | null {
  if (!KEY.test(normalizeLicenceKey(key))) return copy.badKey
  if (!DEVICE.test(normalizeSystemId(device))) return copy.badDevice
  return null
}

export function licenceDocumentFromActivateBody(body: unknown): string | null {
  if (!body || typeof body !== 'object') return null
  const license = (body as { license?: unknown }).license
  if (typeof license !== 'string') return null
  if (!license.includes('NEUROKORE LICENSE') && !license.includes('NEUROKLAST LICENSE')) return null
  return license
}
