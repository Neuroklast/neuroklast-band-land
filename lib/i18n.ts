/**
 * Global i18n utility for the site.
 * Built-in locales: en, de, uk, it, es, pt, ja, ko. Additional codes via site_config.languages.
 */

export type BuiltinLocale = 'en' | 'de' | 'uk' | 'it' | 'es' | 'pt' | 'ja' | 'ko'

/** Any locale code (built-in or admin-configured). */
export type Locale = string

export interface SiteLanguage {
  code: string
  label: string
  flag: string
}

export const BUILTIN_LOCALES: SiteLanguage[] = [
  { code: 'en', label: 'English',    flag: '' },
  { code: 'de', label: 'Deutsch',    flag: '' },
  { code: 'uk', label: 'Українська', flag: '' },
  { code: 'it', label: 'Italiano',   flag: '' },
  { code: 'es', label: 'Español',    flag: '' },
  { code: 'pt', label: 'Português',  flag: '' },
  { code: 'ja', label: '日本語',      flag: '' },
  { code: 'ko', label: '한국어',      flag: '' },
]

/** @deprecated Use BUILTIN_LOCALES or configured languages from LocaleProvider. */
export const LOCALES = BUILTIN_LOCALES

const translations: Record<string, Record<string, string>> = {
  // ── Footer ──────────────────────────────────────────────────────────
  'footer.section':            { en: 'FOOTER_SECTION', de: 'FOOTER_BEREICH', uk: 'СЕКЦІЯ_ПІДВАЛУ', it: 'SEZIONE_PIÈ_DI_PAGINA', es: 'SECCIÓN_PIE_DE_PÁGINA', pt: 'SECÇÃO_RODAPÉ', ja: 'フッター_セクション', ko: '푸터_섹션' },
  'footer.protocol':           { en: 'PROTOCOL: HELLFIRE', de: 'PROTOKOLL: HELLFIRE', uk: 'ПРОТОКОЛ: HELLFIRE', it: 'PROTOCOLLO: HELLFIRE', es: 'PROTOCOLO: HELLFIRE', pt: 'PROTOCOLO: HELLFIRE', ja: 'プロトコル: HELLFIRE', ko: '프로토콜: HELLFIRE' },
  'footer.defaultGenres':      { en: 'HARD TECHNO · CYBERPUNK · DNB · DARK ELECTRO', de: 'HARD TECHNO · CYBERPUNK · DNB · DARK ELECTRO', uk: 'HARD TECHNO · CYBERPUNK · DNB · DARK ELECTRO', it: 'HARD TECHNO · CYBERPUNK · DNB · DARK ELECTRO', es: 'HARD TECHNO · CYBERPUNK · DNB · DARK ELECTRO', pt: 'HARD TECHNO · CYBERPUNK · DNB · DARK ELECTRO', ja: 'HARD TECHNO · CYBERPUNK · DNB · DARK ELECTRO', ko: 'HARD TECHNO · CYBERPUNK · DNB · DARK ELECTRO' },
  'footer.label':              { en: 'LABEL: {0}', de: 'LABEL: {0}', uk: 'ЛЕЙБЛ: {0}', it: 'ETICHETTA: {0}', es: 'SELLO: {0}', pt: 'SELO: {0}', ja: 'レーベル: {0}', ko: '레이블: {0}' },
  'footer.copyright':          { en: '© {0} All rights reserved.', de: '© {0} Alle Rechte vorbehalten.', uk: '© {0} Усі права захищено.', it: '© {0} Tutti i diritti riservati.', es: '© {0} Todos los derechos reservados.', pt: '© {0} Todos os direitos reservados.', ja: '© {0} 全著作権所有。', ko: '© {0} 모든 권리 보유.' },
  'footer.copyrightLine':      { en: '© {0} Neuroklast', de: '© {0} Neuroklast', uk: '© {0} Neuroklast', it: '© {0} Neuroklast', es: '© {0} Neuroklast', pt: '© {0} Neuroklast', ja: '© {0} Neuroklast', ko: '© {0} Neuroklast' },
  'footer.legalNotice':        { en: 'LEGAL NOTICE', de: 'IMPRESSUM', uk: 'ПРАВОВА ІНФОРМАЦІЯ', it: 'NOTE LEGALI', es: 'AVISO LEGAL', pt: 'AVISO LEGAL', ja: '運営者情報', ko: '법적 고지' },
  'footer.datenschutz':        { en: 'PRIVACY POLICY', de: 'DATENSCHUTZ', uk: 'ПОЛІТИКА КОНФІДЕНЦІЙНОСТІ', it: 'PRIVACY', es: 'POLÍTICA DE PRIVACIDAD', pt: 'POLÍTICA DE PRIVACIDADE', ja: 'プライバシーポリシー', ko: '개인정보 처리방침' },
  'footer.admin':              { en: 'ADMIN', de: 'ADMIN', uk: 'ADMIN', it: 'ADMIN', es: 'ADMIN', pt: 'ADMIN', ja: 'ADMIN', ko: 'ADMIN' },
  'footer.adminLogin':         { en: 'Admin login', de: 'Admin-Login', uk: 'Вхід адміністратора', it: 'Accesso amministratore', es: 'Acceso de administrador', pt: 'Login de administrador', ja: '管理者ログイン', ko: '관리자 로그인' },
  'footer.backToTop':          { en: 'BACK TO TOP', de: 'NACH OBEN', uk: 'НАГОРУ', it: 'TORNA SU', es: 'VOLVER ARRIBA', pt: 'VOLTAR AO TOPO', ja: '上に戻る', ko: '맨 위로' },

  // ── Navigation ──────────────────────────────────────────────────────
  'nav.home':                  { en: 'HOME', de: 'STARTSEITE', uk: 'ГОЛОВНА', it: 'HOME', es: 'INICIO', pt: 'INÍCIO', ja: 'ホーム', ko: '홈' },
  'nav.news':                  { en: 'NEWS', de: 'NEUIGKEITEN', uk: 'НОВИНИ', it: 'NOTIZIE', es: 'NOTICIAS', pt: 'NOTÍCIAS', ja: 'ニュース', ko: '뉴스' },
  'nav.biography':             { en: 'BIOGRAPHY', de: 'BIOGRAFIE', uk: 'БІОГРАФІЯ', it: 'BIOGRAFIA', es: 'BIOGRAFÍA', pt: 'BIOGRAFIA', ja: '経歴', ko: '바이오그래피' },
  'nav.bio':                   { en: 'BIO', de: 'BIO', uk: 'БІО', it: 'BIO', es: 'BIO', pt: 'BIO', ja: 'BIO', ko: 'BIO' },
  'nav.music':                 { en: 'MUSIC', de: 'MUSIK', uk: 'МУЗИКА', it: 'MUSICA', es: 'MÚSICA', pt: 'MÚSICA', ja: '音楽', ko: '음악' },
  'nav.gallery':               { en: 'GALLERY', de: 'GALERIE', uk: 'ГАЛЕРЕЯ', it: 'GALLERIA', es: 'GALERÍA', pt: 'GALERIA', ja: 'ギャラリー', ko: '갤러리' },
  'nav.gigs':                  { en: 'GIGS', de: 'AUFTRITTE', uk: 'КОНЦЕРТИ', it: 'CONCERTI', es: 'CONCIERTOS', pt: 'CONCERTOS', ja: 'ライブ', ko: '공연' },
  'nav.events':                { en: 'EVENTS', de: 'EVENTS', uk: 'ПОДІЇ', it: 'EVENTI', es: 'EVENTOS', pt: 'EVENTOS', ja: 'イベント', ko: '이벤트' },
  'nav.releases':              { en: 'RELEASES', de: 'RELEASES', uk: 'РЕЛІЗИ', it: 'USCITE', es: 'LANZAMIENTOS', pt: 'LANÇAMENTOS', ja: 'リリース', ko: '릴리즈' },
  'nav.merch':                 { en: 'MERCH', de: 'MERCH', uk: 'МЕРЧ', it: 'MERCH', es: 'MERCH', pt: 'MERCH', ja: 'グッズ', ko: '머치' },
  'nav.credits':               { en: 'CREDITS', de: 'CREDITS', uk: 'КРЕДИТИ', it: 'CREDITI', es: 'CRÉDITOS', pt: 'CRÉDITOS', ja: 'クレジット', ko: '크레딧' },
  'nav.soundpacks':            { en: 'SOUNDPACKS', de: 'SOUNDPACKS', uk: 'САУНДПАКИ', it: 'SOUNDPACK', es: 'SOUNDPACKS', pt: 'SOUNDPACKS', ja: 'サウンドパック', ko: '사운드팩' },
  'nav.contact':               { en: 'CONTACT', de: 'KONTAKT', uk: 'КОНТАКТ', it: 'CONTATTO', es: 'CONTACTO', pt: 'CONTACTO', ja: 'コンタクト', ko: '연락처' },
  'nav.media':                 { en: 'MEDIA', de: 'MEDIEN', uk: 'МЕДІА', it: 'MEDIA', es: 'MEDIA', pt: 'MEDIA', ja: 'メディア', ko: '미디어' },
  'nav.connect':               { en: 'CONNECT', de: 'VERBINDEN', uk: 'КОНТАКТ', it: 'CONTATTA', es: 'CONTACTO', pt: 'CONTACTO', ja: 'コンタクト', ko: '연결' },
  /* Full words only — desktop hover labels must never clip (nav CSS width:max-content). */
  'nav.newsletter':            { en: 'Newsletter', de: 'Newsletter', uk: 'Розсилка', it: 'Newsletter', es: 'Newsletter', pt: 'Newsletter', ja: 'ニュース', ko: '뉴스레터' },
  'nav.language':              { en: 'Language', de: 'Sprache', uk: 'Мова', it: 'Lingua', es: 'Idioma', pt: 'Idioma', ja: '言語', ko: '언어' },
  'nav.closePlayer':           { en: 'Close music player', de: 'Musik-Player schließen', uk: 'Закрити плеєр', it: 'Chiudi il lettore musicale', es: 'Cerrar el reproductor de música', pt: 'Fechar o leitor de música', ja: '音楽プレイヤーを閉じる', ko: '음악 플레이어 닫기' },
  'nav.openPlayer':            { en: 'Open music player', de: 'Musik-Player öffnen', uk: 'Відкрити плеєр', it: 'Apri il lettore musicale', es: 'Abrir el reproductor de música', pt: 'Abrir o leitor de música', ja: '音楽プレイヤーを開く', ko: '음악 플레이어 열기' },

  // ── Footer (public chrome) ──────────────────────────────────────────
  'footer.legal':              { en: 'Legal Notice', de: 'Impressum', uk: 'Правова інформація', it: 'Note legali', es: 'Aviso legal', pt: 'Aviso legal', ja: '特定商取引法', ko: '법적 고지' },
  'footer.privacy':            { en: 'Privacy Policy', de: 'Datenschutz', uk: 'Конфіденційність', it: 'Privacy', es: 'Privacidad', pt: 'Privacidade', ja: 'プライバシー', ko: '개인정보' },
  'footer.socialNav':          { en: 'Social media links', de: 'Social-Media-Links', uk: 'Посилання на соцмережі', it: 'Link social', es: 'Enlaces de redes sociales', pt: 'Ligações de redes sociais', ja: 'ソーシャルメディア', ko: '소셜 미디어 링크' },
  'footer.legalNav':           { en: 'Legal links', de: 'Rechtliche Links', uk: 'Юридичні посилання', it: 'Link legali', es: 'Enlaces legales', pt: 'Ligações legais', ja: '法的リンク', ko: '법적 링크' },

  // ── ARIA (public) ───────────────────────────────────────────────────
  'aria.mainNav':              { en: 'Main navigation', de: 'Hauptnavigation', uk: 'Основна навігація', it: 'Navigazione principale', es: 'Navegación principal', pt: 'Navegação principal', ja: 'メインナビゲーション', ko: '기본 탐색' },
  'aria.mobileNav':            { en: 'Mobile navigation', de: 'Mobile Navigation', uk: 'Мобільна навігація', it: 'Navigazione mobile', es: 'Navegación móvil', pt: 'Navegação móvel', ja: 'モバイルナビゲーション', ko: '모바일 탐색' },
  'aria.openMenu':             { en: 'Open menu', de: 'Menü öffnen', uk: 'Відкрити меню', it: 'Apri menu', es: 'Abrir menú', pt: 'Abrir menu', ja: 'メニューを開く', ko: '메뉴 열기' },
  'aria.closeMenu':            { en: 'Close menu', de: 'Menü schließen', uk: 'Закрити меню', it: 'Chiudi menu', es: 'Cerrar menú', pt: 'Fechar menu', ja: 'メニューを閉じる', ko: '메뉴 닫기' },
  'aria.closeOverlay':         { en: 'Close dialog', de: 'Dialog schließen', uk: 'Закрити діалог', it: 'Chiudi finestra', es: 'Cerrar diálogo', pt: 'Fechar diálogo', ja: 'ダイアログを閉じる', ko: '대화 상자 닫기' },
  'common.close':              { en: 'CLOSE', de: 'SCHLIESSEN', uk: 'ЗАКРИТИ', it: 'CHIUDI', es: 'CERRAR', pt: 'FECHAR', ja: '閉じる', ko: '닫기' },
  'aria.openGallery':          { en: 'Open image in lightbox', de: 'Bild in Lightbox öffnen', uk: 'Відкрити зображення', it: 'Apri immagine in lightbox', es: 'Abrir imagen en lightbox', pt: 'Abrir imagem em lightbox', ja: 'ライトボックスで画像を開く', ko: '라이트박스에서 이미지 열기' },
  'aria.skipToContent':        { en: 'Skip to content', de: 'Zum Inhalt springen', uk: 'До вмісту', it: 'Vai al contenuto', es: 'Saltar al contenido', pt: 'Saltar para o conteúdo', ja: 'コンテンツへ', ko: '본문으로 건너뛰기' },
  'browse.prev':               { en: 'Prev', de: 'Zurück', uk: 'Назад', it: 'Prec', es: 'Ant', pt: 'Ant', ja: '前', ko: '이전' },
  'browse.next':               { en: 'Next', de: 'Weiter', uk: 'Далі', it: 'Succ', es: 'Sig', pt: 'Seg', ja: '次', ko: '다음' },
  'browse.pagination':         { en: 'Pagination', de: 'Seitennavigation', uk: 'Сторінки', it: 'Paginazione', es: 'Paginación', pt: 'Paginação', ja: 'ページ送り', ko: '페이지' },
  'browse.prevPage':           { en: 'Previous page', de: 'Vorherige Seite', uk: 'Попередня сторінка', it: 'Pagina precedente', es: 'Página anterior', pt: 'Página anterior', ja: '前のページ', ko: '이전 페이지' },
  'browse.nextPage':           { en: 'Next page', de: 'Nächste Seite', uk: 'Наступна сторінка', it: 'Pagina successiva', es: 'Página siguiente', pt: 'Página seguinte', ja: '次のページ', ko: '다음 페이지' },
  'browse.pageN':              { en: 'Page {0}', de: 'Seite {0}', uk: 'Сторінка {0}', it: 'Pagina {0}', es: 'Página {0}', pt: 'Página {0}', ja: 'ページ {0}', ko: '페이지 {0}' },
  'browse.search':             { en: 'Search', de: 'Suche', uk: 'Пошук', it: 'Cerca', es: 'Buscar', pt: 'Pesquisar', ja: '検索', ko: '검색' },
  'browse.clearSearch':        { en: 'Clear search', de: 'Suche leeren', uk: 'Очистити пошук', it: 'Cancella ricerca', es: 'Borrar búsqueda', pt: 'Limpar pesquisa', ja: '検索をクリア', ko: '검색 지우기' },
  'browse.result':             { en: 'result', de: 'Ergebnis', uk: 'результат', it: 'risultato', es: 'resultado', pt: 'resultado', ja: '件', ko: '결과' },
  'browse.results':            { en: 'results', de: 'Ergebnisse', uk: 'результатів', it: 'risultati', es: 'resultados', pt: 'resultados', ja: '件', ko: '결과' },
  'browse.searchEllipsis':     { en: 'Search…', de: 'Suchen…', uk: 'Пошук…', it: 'Cerca…', es: 'Buscar…', pt: 'Pesquisar…', ja: '検索…', ko: '검색…' },
  'gigs.searchPlaceholder':    { en: 'Search events by venue, city, or festival…', de: 'Events nach Location, Stadt oder Festival suchen…', uk: 'Шукати події за майданчиком, містом або фестивалем…', it: 'Cerca eventi per venue, città o festival…', es: 'Buscar eventos por venue, ciudad o festival…', pt: 'Procurar eventos por venue, cidade ou festival…', ja: '会場・都市・フェスで検索…', ko: '공연장, 도시, 페스티벌로 검색…' },
  'gigs.noSearchResults':      { en: 'No events match your search', de: 'Keine Events für diese Suche', uk: 'Немає подій за запитом', it: 'Nessun evento corrisponde alla ricerca', es: 'Ningún evento coincide con la búsqueda', pt: 'Nenhum evento corresponde à pesquisa', ja: '一致するイベントがありません', ko: '검색과 일치하는 이벤트가 없습니다' },
  'releases.searchPlaceholder': { en: 'Search releases by title or type…', de: 'Releases nach Titel oder Typ suchen…', uk: 'Шукати релізи за назвою або типом…', it: 'Cerca uscite per titolo o tipo…', es: 'Buscar lanzamientos por título o tipo…', pt: 'Procurar lançamentos por título ou tipo…', ja: 'タイトル・タイプで検索…', ko: '제목 또는 유형으로 검색…' },
  'releases.noSearchResults':  { en: 'No releases match your search', de: 'Keine Releases für diese Suche', uk: 'Немає релізів за запитом', it: 'Nessuna uscita corrisponde alla ricerca', es: 'Ningún lanzamiento coincide con la búsqueda', pt: 'Nenhum lançamento corresponde à pesquisa', ja: '一致するリリースがありません', ko: '검색과 일치하는 릴리즈가 없습니다' },
  'releases.noArt':            { en: 'NO ART', de: 'KEIN COVER', uk: 'НЕМАЄ ОБКЛАДИНКИ', it: 'NESSUNA COPERTINA', es: 'SIN PORTADA', pt: 'SEM CAPA', ja: 'アートなし', ko: '커버 없음' },
  'releases.filterSingleEp':   { en: 'Single / EP', de: 'Single / EP', uk: 'Сингл / EP', it: 'Single / EP', es: 'Single / EP', pt: 'Single / EP', ja: 'シングル / EP', ko: '싱글 / EP' },
  'section.empty':             { en: 'Coming soon', de: 'Demnächst', uk: 'Скоро', it: 'Prossimamente', es: 'Próximamente', pt: 'Em breve', ja: '近日公開', ko: '곧 공개' },

  // ── CookieBanner ────────────────────────────────────────────────────
  'cookie.notice':             { en: 'SYSTEM_NOTICE', de: 'SYSTEM_HINWEIS', uk: 'СИСТЕМНОЕ_УВЕДОМЛЕНИЕ', it: 'AVVISO_DI_SISTEMA', es: 'AVISO_DEL_SISTEMA', pt: 'AVISO_DO_SISTEMA', ja: 'システム通知', ko: '시스템_알림' },
  'cookie.text':               { en: 'This website uses technically necessary local storage (Local Storage, IndexedDB) for settings and image caching. No tracking cookies are set. For more information, see our privacy policy.', de: 'Diese Website verwendet technisch notwendige lokale Speicherung (Local Storage, IndexedDB) für Einstellungen und Bildcaching. Es werden keine Tracking-Cookies gesetzt. Weitere Informationen finden Sie in unserer Datenschutzerklärung.', uk: 'Этот сайт использует технически необходимое локальное хранилище (Local Storage, IndexedDB) для настроек и кэширования изображений. Файлы отслеживания не устанавливаются. Подробнее в нашей политике конфиденциальности.', it: 'Questo sito web utilizza la memorizzazione locale tecnicamente necessaria (Local Storage, IndexedDB) per impostazioni e cache delle immagini. Non vengono impostati cookie di tracciamento. Per ulteriori informazioni, consultare la nostra informativa sulla privacy.', es: 'Este sitio web utiliza almacenamiento local técnicamente necesario (Local Storage, IndexedDB) para configuraciones y caché de imágenes. No se establecen cookies de seguimiento. Para más información, consulte nuestra política de privacidad.', pt: 'Este website utiliza armazenamento local tecnicamente necessário (Local Storage, IndexedDB) para definições e cache de imagens. Não são definidos cookies de rastreamento. Para mais informações, consulte a nossa política de privacidade.', ja: 'このウェブサイトは、設定および画像のキャッシュのために技術的に必要なローカルストレージ（Local Storage、IndexedDB）を使用しています。トラッキングクッキーは設定されていません。詳細については、プライバシーポリシーをご覧ください。', ko: '이 웹사이트는 설정 및 이미지 캐싱을 위해 기술적으로 필요한 로컬 스토리지(Local Storage, IndexedDB)를 사용합니다. 추적 쿠키는 설정되지 않습니다. 자세한 내용은 개인정보 처리방침을 참조하십시오.' },
  'cookie.decline':            { en: 'DECLINE', de: 'ABLEHNEN', uk: 'ОТКЛОНИТЬ', it: 'RIFIUTA', es: 'RECHAZAR', pt: 'RECUSAR', ja: '拒否', ko: '거절' },
  'cookie.accept':             { en: 'ACCEPT', de: 'AKZEPTIEREN', uk: 'ПРИНЯТЬ', it: 'ACCETTA', es: 'ACEPTAR', pt: 'ACEITAR', ja: '承認', ko: '수락' },
  'cookie.title':              { en: 'PRIVACY & DATA', de: 'DATENSCHUTZ & COOKIES', uk: 'КОНФИДЕНЦИАЛЬНОСТЬ', it: 'PRIVACY & DATI', es: 'PRIVACIDAD & DATOS', pt: 'PRIVACIDADE & DADOS', ja: 'プライバシーとデータ', ko: '개인정보 및 데이터' },
  'cookie.bannerText':         { en: 'We use optional analytics to improve this site. Essential storage (image cache, settings) is always active. See our', de: 'Wir verwenden optionale Analyse-Tools zur Verbesserung dieser Seite. Notwendiger Speicher (Bild-Cache, Einstellungen) ist immer aktiv. Siehe unsere', uk: 'Мы используем необязательную аналитику для улучшения сайта. Основное хранилище (кэш изображений, настройки) всегда активно. Смотрите нашу', it: 'Utilizziamo analisi opzionali per migliorare questo sito. Lo storage essenziale (cache immagini, impostazioni) è sempre attivo. Vedi la nostra', es: 'Usamos análisis opcionales para mejorar este sitio. El almacenamiento esencial (caché de imágenes, configuraciones) siempre está activo. Consulta nuestra', pt: 'Usamos análises opcionais para melhorar este site. O armazenamento essencial (cache de imagens, definições) está sempre ativo. Consulte a nossa', ja: 'このサイトを改善するためにオプションのアナリティクスを使用しています。必須ストレージ（画像キャッシュ、設定）は常にアクティブです。', ko: '이 사이트를 개선하기 위해 선택적 분석을 사용합니다. 필수 저장소(이미지 캐시, 설정)는 항상 활성화되어 있습니다.' },
  'cookie.privacyPolicyLink':  { en: 'Privacy Policy.', de: 'Datenschutzerklärung.', uk: 'Политику конфиденциальности.', it: 'Informativa sulla privacy.', es: 'Política de privacidad.', pt: 'Política de Privacidade.', ja: 'プライバシーポリシー。', ko: '개인정보 처리방침.' },
  'cookie.privacyPrefs':       { en: 'PRIVACY PREFERENCES', de: 'DATENSCHUTZ-EINSTELLUNGEN', uk: 'НАСТРОЙКИ КОНФИДЕНЦИАЛЬНОСТИ', it: 'PREFERENZE PRIVACY', es: 'PREFERENCIAS DE PRIVACIDAD', pt: 'PREFERÊNCIAS DE PRIVACIDADE', ja: 'プライバシー設定', ko: '개인정보 설정' },
  'cookie.essentialLabel':     { en: 'Technically Necessary', de: 'Technisch notwendig', uk: 'Технически необходимое', it: 'Tecnicamente necessario', es: 'Técnicamente necesario', pt: 'Tecnicamente necessário', ja: '技術的に必要', ko: '기술적으로 필요' },
  'cookie.alwaysOn':           { en: 'ALWAYS ON', de: 'IMMER AN', uk: 'ВСЕГДА ВКЛ', it: 'SEMPRE ATTIVO', es: 'SIEMPRE ACTIVO', pt: 'SEMPRE ATIVO', ja: '常に有効', ko: '항상 켜짐' },
  'cookie.analyticsLabel':     { en: 'Analytics (optional)', de: 'Analytik (optional)', uk: 'Аналитика (необязательно)', it: 'Analisi (opzionale)', es: 'Análisis (opcional)', pt: 'Análise (opcional)', ja: 'アナリティクス（任意）', ko: '분석 (선택)' },
  'cookie.analyticsDesc':      { en: 'Tracks page views, section views and heatmap clicks to improve user experience. No personal data is stored.', de: 'Erfasst Seitenaufrufe, Abschnittsansichten und Heatmap-Klicks zur Verbesserung der Benutzererfahrung. Keine personenbezogenen Daten werden gespeichert.', uk: 'Отслеживает просмотры страниц, разделов и клики для улучшения пользовательского опыта. Личные данные не сохраняются.', it: 'Traccia visualizzazioni di pagina, sezioni e clic heatmap per migliorare l\'esperienza utente. Nessun dato personale viene memorizzato.', es: 'Rastrea vistas de página, secciones y clics de mapa de calor para mejorar la experiencia. No se almacenan datos personales.', pt: 'Rastreia visualizações de página, secções e cliques de mapa de calor para melhorar a experiência. Nenhum dado pessoal é armazenado.', ja: 'ページビュー、セクションビュー、ヒートマップクリックを追跡してユーザー体験を改善します。個人データは保存されません。', ko: '사용자 경험을 개선하기 위해 페이지 뷰, 섹션 뷰, 히트맵 클릭을 추적합니다. 개인 데이터는 저장되지 않습니다.' },
  'cookie.analyticsBasis':     { en: 'Legal basis: Art. 6(1)(a) GDPR (consent)', de: 'Rechtsgrundlage: Art. 6 Abs. 1 lit. a DSGVO (Einwilligung)', uk: 'Правовое основание: ст. 6(1)(а) GDPR (согласие)', it: 'Base giuridica: Art. 6(1)(a) GDPR (consenso)', es: 'Base legal: Art. 6(1)(a) RGPD (consentimiento)', pt: 'Base legal: Art. 6.º(1)(a) RGPD (consentimento)', ja: '法的根拠：GDPR第6条第1項(a)（同意）', ko: '법적 근거: GDPR 제6조 제1항 (a) (동의)' },
  'cookie.essentialDesc':      { en: 'Image caching (IndexedDB), locale preference, admin session. Images are loaded via wsrv.nl CDN (IP transmitted). No consent required — Art. 6(1)(f) GDPR / TTDSG § 25(2).', de: 'Bild-Caching (IndexedDB), Spracheinstellung, Admin-Session. Bilder werden über wsrv.nl CDN geladen (IP-Übermittlung). Keine Einwilligung erforderlich — Art. 6 Abs. 1 lit. f DSGVO / § 25 Abs. 2 TTDSG.', uk: 'Кэш изображений (IndexedDB), настройка языка, сессия администратора. Изображения загружаются через CDN wsrv.nl (передача IP). Согласие не требуется — ст. 6(1)(f) GDPR / TTDSG § 25(2).', it: 'Cache immagini (IndexedDB), preferenza lingua, sessione admin. Le immagini vengono caricate tramite CDN wsrv.nl (trasmissione IP). Nessun consenso richiesto — Art. 6(1)(f) GDPR / TTDSG § 25(2).', es: 'Caché de imágenes (IndexedDB), preferencia de idioma, sesión de administrador. Las imágenes se cargan mediante CDN wsrv.nl (transmisión de IP). Sin consentimiento requerido — Art. 6(1)(f) RGPD / TTDSG § 25(2).', pt: 'Cache de imagens (IndexedDB), preferência de idioma, sessão de administrador. As imagens são carregadas via CDN wsrv.nl (transmissão de IP). Sem consentimento necessário — Art. 6.º(1)(f) RGPD / TTDSG § 25(2).', ja: '画像キャッシュ（IndexedDB）、ロケール設定、管理セッション。画像はwsrv.nl CDN経由で読み込まれます（IP転送）。同意不要 — GDPR第6条第1項(f) / TTDSG § 25(2)。', ko: '이미지 캐싱(IndexedDB), 언어 설정, 관리 세션. 이미지는 wsrv.nl CDN을 통해 로드됩니다(IP 전송). 동의 불필요 — GDPR 제6조 제1항 (f) / TTDSG § 25(2).' },
  'cookie.cookieText':         { en: 'We use browser storage to analyze site usage and improve your experience. Your data is processed anonymously.', de: 'Wir verwenden Browser-Speicher zur Analyse der Nutzung und Verbesserung Ihres Erlebnisses. Ihre Daten werden anonymisiert verarbeitet.', uk: 'Мы используем хранилище браузера для анализа использования сайта и улучшения вашего опыта. Ваши данные обрабатываются анонимно.', it: "Utilizziamo la memoria del browser per analizzare l'utilizzo del sito e migliorare la tua esperienza. I tuoi dati vengono elaborati in modo anonimo.", es: 'Usamos el almacenamiento del navegador para analizar el uso del sitio y mejorar tu experiencia. Tus datos se procesan de forma anónima.', pt: 'Usamos o armazenamento do browser para analisar o uso do site e melhorar a sua experiência. Os seus dados são processados de forma anónima.', ja: 'ブラウザストレージを使用してサイトの利用状況を分析し、エクスペリエンスを向上させます。データは匿名で処理されます。', ko: '브라우저 저장소를 사용하여 사이트 사용 현황을 분석하고 경험을 개선합니다. 귀하의 데이터는 익명으로 처리됩니다.' },
  'cookie.acceptAll':          { en: 'Accept All', de: 'Alle akzeptieren', uk: 'Принять всё', it: 'Accetta tutto', es: 'Aceptar todo', pt: 'Aceitar tudo', ja: 'すべて承認', ko: '모두 수락' },
  'cookie.rejectAll':          { en: 'Reject All', de: 'Alle ablehnen', uk: 'Отклонить всё', it: 'Rifiuta tutto', es: 'Rechazar todo', pt: 'Rejeitar tudo', ja: 'すべて拒否', ko: '모두 거부' },
  'cookie.essentialOnly':      { en: 'Essential Only', de: 'Nur Essenzielle', uk: 'Только основные', it: 'Solo essenziali', es: 'Solo esenciales', pt: 'Apenas essenciais', ja: '必須のみ', ko: '필수만' },
  'cookie.customize':          { en: 'Customize', de: 'Anpassen', uk: 'Настроить', it: 'Personalizza', es: 'Personalizar', pt: 'Personalizar', ja: 'カスタマイズ', ko: '사용자 설정' },
  'cookie.savePrefs':          { en: 'Save Preferences', de: 'Einstellungen speichern', uk: 'Сохранить настройки', it: 'Salva preferenze', es: 'Guardar preferencias', pt: 'Guardar preferências', ja: '設定を保存', ko: '설정 저장' },
  'cookie.managePrefs':        { en: 'Cookie Preferences', de: 'Cookie-Einstellungen', uk: 'Настройки cookie', it: 'Preferenze cookie', es: 'Preferencias de cookies', pt: 'Preferências de cookies', ja: 'Cookie設定', ko: '쿠키 설정' },
  'cookie.closeDetails':       { en: 'Close preferences', de: 'Einstellungen schließen', uk: 'Закрыть настройки', it: 'Chiudi preferenze', es: 'Cerrar preferencias', pt: 'Fechar preferências', ja: '設定を閉じる', ko: '설정 닫기' },
  'cookie.on':                 { en: 'ON', de: 'AN', uk: 'ВКЛ', it: 'ON', es: 'ON', pt: 'ON', ja: 'オン', ko: '켜짐' },
  'cookie.off':                { en: 'OFF', de: 'AUS', uk: 'ВЫКЛ', it: 'OFF', es: 'OFF', pt: 'OFF', ja: 'オフ', ko: '꺼짐' },

  // ── Hero ────────────────────────────────────────────────────────────
  'hero.sysLabel':             { en: 'SYS: NK-MAIN', de: 'SYS: NK-MAIN', uk: 'SYS: NK-MAIN', it: 'SYS: NK-MAIN', es: 'SYS: NK-MAIN', pt: 'SYS: NK-MAIN', ja: 'SYS: NK-MAIN', ko: 'SYS: NK-MAIN' },
  'hero.online':               { en: 'ONLINE', de: 'ONLINE', uk: 'ONLINE', it: 'ONLINE', es: 'ONLINE', pt: 'ONLINE', ja: 'ONLINE', ko: 'ONLINE' },
  'hero.freq':                 { en: 'FREQ: 140-180', de: 'FREQ: 140-180', uk: 'FREQ: 140-180', it: 'FREQ: 140-180', es: 'FREQ: 140-180', pt: 'FREQ: 140-180', ja: 'FREQ: 140-180', ko: 'FREQ: 140-180' },
  'hero.mode':                 { en: 'MODE: HARD', de: 'MODE: HARD', uk: 'MODE: HARD', it: 'MODE: HARD', es: 'MODE: HARD', pt: 'MODE: HARD', ja: 'MODE: HARD', ko: 'MODE: HARD' },
  'hero.logoAlt':              { en: 'Logo', de: 'Logo', uk: 'Логотип', it: 'Logo', es: 'Logo', pt: 'Logótipo', ja: 'ロゴ', ko: '로고' },
  'hero.titleAlt':             { en: 'NEUROKLAST', de: 'NEUROKLAST', uk: 'NEUROKLAST', it: 'NEUROKLAST', es: 'NEUROKLAST', pt: 'NEUROKLAST', ja: 'NEUROKLAST', ko: 'NEUROKLAST' },
  'hero.editInfo':             { en: 'Edit Info', de: 'Info bearbeiten', uk: 'Редактировать информацию', it: 'Modifica Info', es: 'Editar Info', pt: 'Editar Info', ja: '情報を編集', ko: '정보 편집' },
  'hero.enter':                { en: 'ENTER', de: 'EINTRETEN', uk: 'ВОЙТИ', it: 'ENTRA', es: 'ENTRAR', pt: 'ENTRAR', ja: '入る', ko: '입장' },
  'hero.listenNow':            { en: 'LISTEN NOW', de: 'JETZT HÖREN', uk: 'СЛУШАТЬ СЕЙЧАС', it: 'ASCOLTA ORA', es: 'ESCUCHA AHORA', pt: 'OUVIR AGORA', ja: '今すぐ聴く', ko: '지금 듣기' },
  'hero.tourDates':            { en: 'TOUR DATES', de: 'TOURDATEN', uk: 'ДАТЫ ТУРА', it: 'DATE DEL TOUR', es: 'FECHAS DE GIRA', pt: 'DATAS DE DIGRESSÃO', ja: 'ツアー日程', ko: '투어 일정' },
  'hero.merch':                { en: 'MERCH', de: 'MERCH', uk: 'МЕРЧ', it: 'MERCH', es: 'MERCH', pt: 'MERCH', ja: 'マーチ', ko: '머치' },
  'hero.uploadImage':          { en: 'Upload Hero Image', de: 'Hero-Bild hochladen', uk: 'Загрузить изображение Hero', it: 'Carica immagine Hero', es: 'Subir imagen Hero', pt: 'Carregar imagem Hero', ja: 'ヒーロー画像をアップロード', ko: '히어로 이미지 업로드' },
  'hero.editLinks':            { en: 'Edit Links', de: 'Links bearbeiten', uk: 'Редактировать ссылки', it: 'Modifica link', es: 'Editar enlaces', pt: 'Editar links', ja: 'リンクを編集', ko: '링크 편집' },
  'hero.scrollSection':        { en: 'Scroll to section', de: 'Zum Abschnitt scrollen', uk: 'Прокрутить к разделу', it: 'Scorri alla sezione', es: 'Desplazar a la sección', pt: 'Rolar para a secção', ja: 'セクションにスクロール', ko: '섹션으로 스크롤' },
  'hero.externalUrl':          { en: 'External URL', de: 'Externe URL', uk: 'Внешний URL', it: 'URL esterno', es: 'URL externo', pt: 'URL externo', ja: '外部URL', ko: '외부 URL' },
  'hero.sectionId':            { en: 'Section ID', de: 'Abschnitts-ID', uk: 'ID раздела', it: 'ID sezione', es: 'ID de sección', pt: 'ID da secção', ja: 'セクションID', ko: '섹션 ID' },
  'hero.urlPlaceholder':       { en: 'https://...', de: 'https://...', uk: 'https://...', it: 'https://...', es: 'https://...', pt: 'https://...', ja: 'https://...', ko: 'https://...' },
  'hero.linksEditor':          { en: '// HERO.LINKS.EDITOR', de: '// HERO.LINKS.EDITOR', uk: '// HERO.LINKS.EDITOR', it: '// HERO.LINKS.EDITOR', es: '// HERO.LINKS.EDITOR', pt: '// HERO.LINKS.EDITOR', ja: '// HERO.LINKS.EDITOR', ko: '// HERO.LINKS.EDITOR' },
  'hero.buttonLabel':          { en: 'Button label', de: 'Schaltflächen-Beschriftung', uk: 'Метка кнопки', it: 'Etichetta pulsante', es: 'Etiqueta del botón', pt: 'Etiqueta do botão', ja: 'ボタンラベル', ko: '버튼 레이블' },
  'hero.newLink':              { en: 'New Link', de: 'Neuer Link', uk: 'Новая ссылка', it: 'Nuovo link', es: 'Nuevo enlace', pt: 'Novo link', ja: '新しいリンク', ko: '새 링크' },
  'hero.addLink':              { en: 'Add Link', de: 'Link hinzufügen', uk: 'Добавить ссылку', it: 'Aggiungi link', es: 'Agregar enlace', pt: 'Adicionar link', ja: 'リンクを追加', ko: '링크 추가' },
  'hero.save':                 { en: 'Save', de: 'Speichern', uk: 'Сохранить', it: 'Salva', es: 'Guardar', pt: 'Guardar', ja: '保存', ko: '저장' },

  // ── NewsSection ─────────────────────────────────────────────────────
  'news.defaultTitle':         { en: 'NEWS', de: 'NEUIGKEITEN', uk: 'НОВОСТИ', it: 'NOTIZIE', es: 'NOTICIAS', pt: 'NOTÍCIAS', ja: 'ニュース', ko: '뉴스' },
  'news.link':                 { en: 'LINK', de: 'LINK', uk: 'ССЫЛКА', it: 'LINK', es: 'ENLACE', pt: 'LINK', ja: 'リンク', ko: '링크' },
  'news.readMore':             { en: 'CLICK TO READ MORE', de: 'KLICKEN UM MEHR ZU LESEN', uk: 'НАЖМИТЕ ДЛЯ ЧТЕНИЯ', it: 'CLICCA PER LEGGERE DI PIÙ', es: 'CLICK PARA LEER MÁS', pt: 'CLIQUE PARA LER MAIS', ja: 'クリックして続きを読む', ko: '더 읽으려면 클릭' },
  'news.noNews':               { en: 'No news yet.', de: 'Noch keine Neuigkeiten.', uk: 'Новостей пока нет.', it: 'Nessuna notizia ancora.', es: 'Sin noticias aún.', pt: 'Sem notícias ainda.', ja: 'まだニュースはありません。', ko: '아직 뉴스가 없습니다.' },
  'news.showLess':             { en: 'Show Less', de: 'Weniger anzeigen', uk: 'Показать меньше', it: 'Mostra meno', es: 'Mostrar menos', pt: 'Mostrar menos', ja: '表示を減らす', ko: '덜 보기' },
  'news.showMore':             { en: 'Show More ({0} more)', de: 'Mehr anzeigen ({0} weitere)', uk: 'Показать больше ({0} ещё)', it: 'Mostra altro ({0} in più)', es: 'Mostrar más ({0} más)', pt: 'Mostrar mais ({0} mais)', ja: 'もっと見る (あと{0}件)', ko: '더 보기 ({0}개 더)' },
  'news.share':                { en: 'SHARE', de: 'TEILEN', uk: 'ПОДЕЛИТЬСЯ', it: 'CONDIVIDI', es: 'COMPARTIR', pt: 'PARTILHAR', ja: 'シェア', ko: '공유' },
  'news.copied':               { en: 'COPIED', de: 'KOPIERT', uk: 'СКОПИРОВАНО', it: 'COPIATO', es: 'COPIADO', pt: 'COPIADO', ja: 'コピー済み', ko: '복사됨' },
  'news.openLink':             { en: 'OPEN LINK', de: 'LINK ÖFFNEN', uk: 'ОТКРЫТЬ ССЫЛКУ', it: 'APRI LINK', es: 'ABRIR ENLACE', pt: 'ABRIR LINK', ja: 'リンクを開く', ko: '링크 열기' },
  'news.entry':                { en: 'NEWS ENTRY', de: 'NACHRICHTEN-EINTRAG', uk: 'ЗАПИСЬ НОВОСТЕЙ', it: 'VOCE NOTIZIE', es: 'ENTRADA DE NOTICIAS', pt: 'ENTRADA DE NOTÍCIA', ja: 'ニュースエントリ', ko: '뉴스 항목' },
  'news.version':              { en: 'NK-NEWS v1.0', de: 'NK-NEWS v1.0', uk: 'NK-NEWS v1.0', it: 'NK-NEWS v1.0', es: 'NK-NEWS v1.0', pt: 'NK-NEWS v1.0', ja: 'NK-NEWS v1.0', ko: 'NK-NEWS v1.0' },
  'news.editTitle':            { en: 'EDIT NEWS', de: 'NEUIGKEITEN BEARBEITEN', uk: 'РЕДАКТИРОВАТЬ НОВОСТЬ', it: 'MODIFICA NOTIZIE', es: 'EDITAR NOTICIAS', pt: 'EDITAR NOTÍCIAS', ja: 'ニュースを編集', ko: '뉴스 편집' },
  'news.addTitle':             { en: 'ADD NEWS', de: 'NEUIGKEIT HINZUFÜGEN', uk: 'ДОБАВИТЬ НОВОСТЬ', it: 'AGGIUNGI NOTIZIA', es: 'AGREGAR NOTICIA', pt: 'ADICIONAR NOTÍCIA', ja: 'ニュースを追加', ko: '뉴스 추가' },

  // ── Public section titles (homepage chrome) ─────────────────────────
  'section.bio':               { en: 'Biography', de: 'Biografie', uk: 'Біографія', it: 'Biografia', es: 'Biografía', pt: 'Biografia', ja: '経歴', ko: '바이오그래피' },
  'section.credits':           { en: 'Credits & Partners', de: 'Credits & Partner', uk: 'Кредити та партнери', it: 'Credits e partner', es: 'Créditos y partners', pt: 'Créditos e parceiros', ja: 'クレジット＆パートナー', ko: '크레딧 & 파트너' },
  'section.gallery':           { en: 'Gallery', de: 'Galerie', uk: 'Галерея', it: 'Galleria', es: 'Galería', pt: 'Galeria', ja: 'ギャラリー', ko: '갤러리' },
  'section.musicHighlights':   { en: 'Music Highlights', de: 'Musik-Highlights', uk: 'Музичні хіти', it: 'Highlight musicali', es: 'Destacados musicales', pt: 'Destaques musicais', ja: 'ミュージックハイライト', ko: '뮤직 하이라이트' },
  'section.releases':          { en: 'Discography', de: 'Diskografie', uk: 'Дискографія', it: 'Discografia', es: 'Discografía', pt: 'Discografia', ja: 'ディスコグラフィ', ko: '디스코그래피' },
  'section.merchandise':       { en: 'Merchandise', de: 'Merchandise', uk: 'Мерч', it: 'Merchandise', es: 'Merchandise', pt: 'Merchandise', ja: 'グッズ', ko: '머천다이즈' },
  'section.soundpacks':        { en: 'Soundpacks', de: 'Soundpacks', uk: 'Саундпаки', it: 'Soundpack', es: 'Soundpacks', pt: 'Soundpacks', ja: 'サウンドパック', ko: '사운드팩' },
  'section.gigs':              { en: 'Events', de: 'Events', uk: 'Події', it: 'Eventi', es: 'Eventos', pt: 'Eventos', ja: 'イベント', ko: '이벤트' },
  'section.social':            { en: 'Connect', de: 'Connect', uk: 'Контакт', it: 'Connect', es: 'Connect', pt: 'Connect', ja: 'コネクト', ko: '연결' },
  'section.news':              { en: 'News', de: 'Neuigkeiten', uk: 'Новини', it: 'Notizie', es: 'Noticias', pt: 'Notícias', ja: 'ニュース', ko: '뉴스' },
  'section.newsletter':        { en: 'Stay Connected', de: 'Bleib verbunden', uk: 'Залишайтесь на звʼязку', it: 'Resta connesso', es: 'Mantente conectado', pt: 'Fique ligado', ja: 'つながる', ko: '연결 유지' },
  'section.media':             { en: 'Media', de: 'Medien', uk: 'Медіа', it: 'Media', es: 'Media', pt: 'Media', ja: 'メディア', ko: '미디어' },
  'section.contact':           { en: 'Contact', de: 'Kontakt', uk: 'Контакт', it: 'Contatto', es: 'Contacto', pt: 'Contacto', ja: 'コンタクト', ko: '연락처' },
  'section.spotify':           { en: 'Listen', de: 'Hören', uk: 'Слухати', it: 'Ascolta', es: 'Escuchar', pt: 'Ouvir', ja: '聴く', ko: '듣기' },
  'spotify.loadPlayer':        { en: 'Load Spotify player', de: 'Spotify-Player laden', uk: 'Завантажити Spotify-плеєр', it: 'Carica player Spotify', es: 'Cargar reproductor de Spotify', pt: 'Carregar leitor Spotify', ja: 'Spotifyプレーヤーを読み込む', ko: 'Spotify 플레이어 로드' },
  'spotify.consentHint':       { en: 'Loads content from Spotify. Your IP address may be sent to Spotify.', de: 'Lädt Inhalte von Spotify. Deine IP-Adresse kann an Spotify übermittelt werden.', uk: 'Завантажує контент зі Spotify. Ваша IP-адреса може бути передана Spotify.', it: 'Carica contenuti da Spotify. Il tuo indirizzo IP può essere inviato a Spotify.', es: 'Carga contenido de Spotify. Tu IP puede enviarse a Spotify.', pt: 'Carrega conteúdo do Spotify. O seu IP pode ser enviado à Spotify.', ja: 'Spotifyからコンテンツを読み込みます。IPアドレスが送信される場合があります。', ko: 'Spotify에서 콘텐츠를 로드합니다. IP 주소가 전송될 수 있습니다.' },
  'spotify.failed':            { en: 'Spotify player could not be loaded.', de: 'Spotify-Player konnte nicht geladen werden.', uk: 'Spotify-плеєр не вдалося завантажити.', it: 'Impossibile caricare il player Spotify.', es: 'No se pudo cargar el reproductor de Spotify.', pt: 'Não foi possível carregar o leitor Spotify.', ja: 'Spotifyプレーヤーを読み込めませんでした。', ko: 'Spotify 플레이어를 로드할 수 없습니다.' },
  'spotify.retry':             { en: 'Try again', de: 'Erneut versuchen', uk: 'Спробувати знову', it: 'Riprova', es: 'Reintentar', pt: 'Tentar novamente', ja: '再試行', ko: '다시 시도' },
  'spotify.loading':           { en: 'Loading Spotify player', de: 'Spotify-Player wird geladen', uk: 'Завантаження Spotify-плеєра', it: 'Caricamento player Spotify', es: 'Cargando reproductor de Spotify', pt: 'A carregar leitor Spotify', ja: 'Spotifyプレーヤーを読み込み中', ko: 'Spotify 플레이어 로드 중' },
  'section.errorRender':       { en: 'Failed to render', de: 'Darstellung fehlgeschlagen', uk: 'Помилка відображення', it: 'Errore di rendering', es: 'Error al renderizar', pt: 'Falha ao renderizar', ja: '表示に失敗しました', ko: '렌더링 실패' },
  'section.errorRetry':        { en: 'Retry', de: 'Erneut versuchen', uk: 'Повторити', it: 'Riprova', es: 'Reintentar', pt: 'Tentar novamente', ja: '再試行', ko: '다시 시도' },

  // ── BiographySection ────────────────────────────────────────────────
  'bio.defaultTitle':          { en: 'BIOGRAPHY', de: 'BIOGRAFIE', uk: 'БИОГРАФИЯ', it: 'BIOGRAFIA', es: 'BIOGRAFÍA', pt: 'BIOGRAFIA', ja: '経歴', ko: '바이오그래피' },
  'bio.editButton':            { en: 'Edit Bio', de: 'Bio bearbeiten', uk: 'Редактировать биографию', it: 'Modifica Bio', es: 'Editar Bio', pt: 'Editar Bio', ja: '経歴を編集', ko: '바이오 편집' },
  'bio.readMore':              { en: 'Read More', de: 'Mehr lesen', uk: 'Читать дальше', it: 'Leggi di più', es: 'Leer más', pt: 'Ler mais', ja: '続きを読む', ko: '더 읽기' },
  'bio.showLess':              { en: 'Show Less', de: 'Weniger anzeigen', uk: 'Показать меньше', it: 'Mostra meno', es: 'Mostrar menos', pt: 'Mostrar menos', ja: '表示を減らす', ko: '덜 보기' },
  'bio.empty':                 { en: 'Biography coming soon.', de: 'Biografie folgt in Kürze.', uk: 'Биография скоро появится.', it: 'Biografia in arrivo.', es: 'Biografía próximamente.', pt: 'Biografia em breve.', ja: '経歴は近日公開。', ko: '바이오그래피 준비 중.' },
  'bio.members':               { en: 'Line-up', de: 'Line-up', uk: 'Состав', it: 'Formazione', es: 'Formación', pt: 'Formação', ja: 'メンバー', ko: '멤버' },
  'bio.achievements':          { en: 'Achievements', de: 'Erfolge', uk: 'Достижения', it: 'Risultati', es: 'Logros', pt: 'Conquistas', ja: '実績', ko: '업적' },
  'bio.collabs':               { en: 'Collaborations', de: 'Kollaborationen', uk: 'Совместные работы', it: 'Collaborazioni', es: 'Colaboraciones', pt: 'Colaborações', ja: 'コラボレーション', ko: '콜라보레이션' },

  // ── GigsSection ─────────────────────────────────────────────────────
  'gigs.defaultTitle':         { en: 'UPCOMING GIGS', de: 'ANSTEHENDE AUFTRITTE', uk: 'ПРЕДСТОЯЩИЕ КОНЦЕРТЫ', it: 'PROSSIMI CONCERTI', es: 'PRÓXIMAS ACTUACIONES', pt: 'PRÓXIMOS CONCERTOS', ja: 'ライブ情報', ko: '다가오는 공연' },
  'gigs.noGigs':               { en: 'No upcoming gigs scheduled.', de: 'Keine anstehenden Auftritte geplant.', uk: 'Концертов не запланировано.', it: 'Nessun concerto in programma.', es: 'No hay actuaciones programadas.', pt: 'Sem concertos agendados.', ja: '予定されているライブはありません。', ko: '예정된 공연이 없습니다.' },
  'gigs.upcoming':             { en: 'Upcoming', de: 'Bevorstehend', uk: 'Предстоящие', it: 'In arrivo', es: 'Próximos', pt: 'Próximos', ja: '今後', ko: '예정' },
  'gigs.past':                 { en: 'Past', de: 'Vergangen', uk: 'Прошедшие', it: 'Passati', es: 'Pasados', pt: 'Passados', ja: '過去', ko: '지난' },
  'gigs.viewAll':              { en: 'View All Events ({0})', de: 'Alle Events anzeigen ({0})', uk: 'Все события ({0})', it: 'Vedi tutti gli eventi ({0})', es: 'Ver todos los eventos ({0})', pt: 'Ver todos os eventos ({0})', ja: 'すべてのイベント ({0})', ko: '모든 이벤트 ({0})' },
  'gigs.empty':                { en: 'Tour dates coming soon', de: 'Tourdaten folgen in Kürze', uk: 'Даты тура скоро', it: 'Date del tour in arrivo', es: 'Fechas de gira pronto', pt: 'Datas de digressão em breve', ja: 'ツアー日程は近日公開', ko: '투어 일정 준비 중' },
  'gigs.noEvents':             { en: 'No upcoming events.', de: 'Keine bevorstehenden Events.', uk: 'Нет предстоящих событий.', it: 'Nessun evento in programma.', es: 'No hay eventos próximos.', pt: 'Sem eventos próximos.', ja: '今後のイベントはありません。', ko: '예정된 이벤트가 없습니다.' },
  'gigs.tickets':              { en: 'TICKETS', de: 'TICKETS', uk: 'БИЛЕТЫ', it: 'BIGLIETTI', es: 'ENTRADAS', pt: 'BILHETES', ja: 'チケット', ko: '티켓' },
  'gigs.addGig':               { en: 'Add Gig', de: 'Auftritt hinzufügen', uk: 'Добавить концерт', it: 'Aggiungi concerto', es: 'Agregar actuación', pt: 'Adicionar concerto', ja: 'ライブを追加', ko: '공연 추가' },
  'gigs.sync':                 { en: 'Sync Gigs', de: 'Auftritte synchronisieren', uk: 'Синхронизировать концерты', it: 'Sincronizza concerti', es: 'Sincronizar actuaciones', pt: 'Sincronizar concertos', ja: 'ライブを同期', ko: '공연 동기화' },
  'gigs.support':              { en: 'Support:', de: 'Support:', uk: 'Поддержка:', it: 'Supporto:', es: 'Soporte:', pt: 'Suporte:', ja: 'サポート:', ko: '서포트:' },
  'gigs.showLess':             { en: 'Show Less', de: 'Weniger anzeigen', uk: 'Показать меньше', it: 'Mostra meno', es: 'Mostrar menos', pt: 'Mostrar menos', ja: '表示を減らす', ko: '덜 보기' },
  'gigs.seeMore':              { en: 'See More', de: 'Mehr sehen', uk: 'Посмотреть больше', it: 'Vedi altro', es: 'Ver más', pt: 'Ver mais', ja: 'もっと見る', ko: '더 보기' },

  // ── Media downloads ─────────────────────────────────────────────────
  'media.empty':               { en: 'Downloads coming soon', de: 'Downloads folgen in Kürze', uk: 'Загрузки скоро', it: 'Download in arrivo', es: 'Descargas pronto', pt: 'Downloads em breve', ja: 'ダウンロード近日公開', ko: '다운로드 준비 중' },
  'media.viewAll':             { en: 'View All Downloads ({0})', de: 'Alle Downloads anzeigen ({0})', uk: 'Все загрузки ({0})', it: 'Vedi tutti i download ({0})', es: 'Ver todas las descargas ({0})', pt: 'Ver todos os downloads ({0})', ja: 'すべてのダウンロード ({0})', ko: '모든 다운로드 ({0})' },
  'media.download':            { en: 'Download', de: 'Download', uk: 'Скачать', it: 'Scarica', es: 'Descargar', pt: 'Descarregar', ja: 'ダウンロード', ko: '다운로드' },
  'media.categoryAll':         { en: 'All', de: 'Alle', uk: 'Все', it: 'Tutti', es: 'Todos', pt: 'Todos', ja: 'すべて', ko: '전체' },
  'media.categoryPhoto':       { en: 'Photos', de: 'Fotos', uk: 'Фото', it: 'Foto', es: 'Fotos', pt: 'Fotos', ja: '写真', ko: '사진' },
  'media.categoryLogo':        { en: 'Logos', de: 'Logos', uk: 'Логотипы', it: 'Loghi', es: 'Logos', pt: 'Logótipos', ja: 'ロゴ', ko: '로고' },
  'media.categoryDocument':    { en: 'Documents', de: 'Dokumente', uk: 'Документы', it: 'Documenti', es: 'Documentos', pt: 'Documentos', ja: '資料', ko: '문서' },
  'media.categoryAudio':       { en: 'Audio', de: 'Audio', uk: 'Аудио', it: 'Audio', es: 'Audio', pt: 'Áudio', ja: 'オーディオ', ko: '오디오' },
  'media.categoryOther':       { en: 'Other', de: 'Sonstiges', uk: 'Другое', it: 'Altro', es: 'Otros', pt: 'Outros', ja: 'その他', ko: '기타' },
  'media.noResults':           { en: 'No matching downloads.', de: 'Keine passenden Downloads.', uk: 'Нет подходящих загрузок.', it: 'Nessun download corrispondente.', es: 'Sin descargas coincidentes.', pt: 'Sem downloads correspondentes.', ja: '一致するダウンロードはありません。', ko: '일치하는 다운로드가 없습니다.' },
  'media.searchPlaceholder':   { en: 'Search downloads…', de: 'Downloads suchen…', uk: 'Искать загрузки…', it: 'Cerca download…', es: 'Buscar descargas…', pt: 'Procurar downloads…', ja: 'ダウンロードを検索…', ko: '다운로드 검색…' },
  'media.preview':             { en: 'Preview', de: 'Vorschau', uk: 'Просмотр', it: 'Anteprima', es: 'Vista previa', pt: 'Pré-visualização', ja: 'プレビュー', ko: '미리보기' },
  'media.initFS':              { en: 'INITIALIZING FILESYSTEM...', de: 'INITIALIZING FILESYSTEM...', uk: 'INITIALIZING FILESYSTEM...', it: 'INITIALIZING FILESYSTEM...', es: 'INITIALIZING FILESYSTEM...', pt: 'INITIALIZING FILESYSTEM...', ja: 'INITIALIZING FILESYSTEM...', ko: 'INITIALIZING FILESYSTEM...' },
  'media.decrypt':             { en: 'DECRYPTING ARCHIVES...', de: 'DECRYPTING ARCHIVES...', uk: 'DECRYPTING ARCHIVES...', it: 'DECRYPTING ARCHIVES...', es: 'DECRYPTING ARCHIVES...', pt: 'DECRYPTING ARCHIVES...', ja: 'DECRYPTING ARCHIVES...', ko: 'DECRYPTING ARCHIVES...' },
  'media.accessGranted':       { en: 'ACCESS GRANTED', de: 'ACCESS GRANTED', uk: 'ACCESS GRANTED', it: 'ACCESS GRANTED', es: 'ACCESS GRANTED', pt: 'ACCESS GRANTED', ja: 'ACCESS GRANTED', ko: 'ACCESS GRANTED' },
  'media.explorerTitle':       { en: 'MEDIA EXPLORER', de: 'MEDIA EXPLORER', uk: 'MEDIA EXPLORER', it: 'MEDIA EXPLORER', es: 'MEDIA EXPLORER', pt: 'MEDIA EXPLORER', ja: 'MEDIA EXPLORER', ko: 'MEDIA EXPLORER' },
  'media.directory':           { en: 'DIRECTORY', de: 'DIRECTORY', uk: 'DIRECTORY', it: 'DIRECTORY', es: 'DIRECTORY', pt: 'DIRECTORY', ja: 'DIRECTORY', ko: 'DIRECTORY' },
  'media.root':                { en: 'ROOT', de: 'ROOT', uk: 'ROOT', it: 'ROOT', es: 'ROOT', pt: 'ROOT', ja: 'ROOT', ko: 'ROOT' },
  'media.selectFile':          { en: 'SELECT A FILE', de: 'SELECT A FILE', uk: 'SELECT A FILE', it: 'SELECT A FILE', es: 'SELECT A FILE', pt: 'SELECT A FILE', ja: 'SELECT A FILE', ko: 'SELECT A FILE' },
  'media.fileDataPrefix':      { en: 'FILE:', de: 'FILE:', uk: 'FILE:', it: 'FILE:', es: 'FILE:', pt: 'FILE:', ja: 'FILE:', ko: 'FILE:' },
  'media.close':               { en: 'CLOSE', de: 'CLOSE', uk: 'CLOSE', it: 'CLOSE', es: 'CLOSE', pt: 'CLOSE', ja: 'CLOSE', ko: 'CLOSE' },
  'media.folderLabel':         { en: 'FOLDER:', de: 'FOLDER:', uk: 'FOLDER:', it: 'FOLDER:', es: 'FOLDER:', pt: 'FOLDER:', ja: 'FOLDER:', ko: 'FOLDER:' },
  'media.downloading':         { en: 'DOWNLOADING…', de: 'DOWNLOADING…', uk: 'DOWNLOADING…', it: 'DOWNLOADING…', es: 'DOWNLOADING…', pt: 'DOWNLOADING…', ja: 'DOWNLOADING…', ko: 'DOWNLOADING…' },
  'media.downloaded':          { en: 'DOWNLOADED', de: 'DOWNLOADED', uk: 'DOWNLOADED', it: 'DOWNLOADED', es: 'DOWNLOADED', pt: 'DOWNLOADED', ja: 'DOWNLOADED', ko: 'DOWNLOADED' },
  'media.downloadProgress':    { en: '{0}%', de: '{0}%', uk: '{0}%', it: '{0}%', es: '{0}%', pt: '{0}%', ja: '{0}%', ko: '{0}%' },
  'media.downloadComplete':    { en: 'TRANSFER COMPLETE', de: 'TRANSFER COMPLETE', uk: 'TRANSFER COMPLETE', it: 'TRANSFER COMPLETE', es: 'TRANSFER COMPLETE', pt: 'TRANSFER COMPLETE', ja: 'TRANSFER COMPLETE', ko: 'TRANSFER COMPLETE' },
  'media.error':               { en: 'ERROR: {0}', de: 'ERROR: {0}', uk: 'ERROR: {0}', it: 'ERROR: {0}', es: 'ERROR: {0}', pt: 'ERROR: {0}', ja: 'ERROR: {0}', ko: 'ERROR: {0}' },
  'media.fileReady':           { en: 'FILE READY', de: 'FILE READY', uk: 'FILE READY', it: 'FILE READY', es: 'FILE READY', pt: 'FILE READY', ja: 'FILE READY', ko: 'FILE READY' },
  'media.version':             { en: 'v1.0', de: 'v1.0', uk: 'v1.0', it: 'v1.0', es: 'v1.0', pt: 'v1.0', ja: 'v1.0', ko: 'v1.0' },

  // ── Credits (public chrome) ─────────────────────────────────────────
  'credits.groupCredits':      { en: 'Credits', de: 'Credits', uk: 'Кредиты', it: 'Crediti', es: 'Créditos', pt: 'Créditos', ja: 'クレジット', ko: '크레딧' },
  'credits.groupEndorsements': { en: 'Endorsements', de: 'Endorsements', uk: 'Эндорменты', it: 'Endorsement', es: 'Endorsements', pt: 'Endorsements', ja: 'エンドースメント', ko: '엔도스먼트' },
  'credits.groupPartners':     { en: 'Partners', de: 'Partner', uk: 'Партнёры', it: 'Partner', es: 'Partners', pt: 'Parceiros', ja: 'パートナー', ko: '파트너' },
  'credits.empty':             { en: 'Credits coming soon', de: 'Credits folgen in Kürze', uk: 'Кредиты скоро', it: 'Crediti in arrivo', es: 'Créditos pronto', pt: 'Créditos em breve', ja: 'クレジット近日公開', ko: '크레딧 준비 중' },
  'credits.overlayLabel':      { en: '// PARTNER.PROFILE', de: '// PARTNER.PROFIL', uk: '// PARTNER.PROFILE', it: '// PARTNER.PROFILO', es: '// PARTNER.PERFIL', pt: '// PARTNER.PERFIL', ja: '// PARTNER.PROFILE', ko: '// PARTNER.PROFILE' },
  'credits.overlayLink':       { en: 'Open website', de: 'Website öffnen', uk: 'Открыть сайт', it: 'Apri sito', es: 'Abrir sitio', pt: 'Abrir site', ja: 'サイトを開く', ko: '웹사이트 열기' },

  // ── Secret Terminal ─────────────────────────────────────────────────
  'secretTerminal.initVersion': { en: 'TERMINAL v1.3.37', de: 'TERMINAL v1.3.37', uk: 'TERMINAL v1.3.37', it: 'TERMINAL v1.3.37', es: 'TERMINAL v1.3.37', pt: 'TERMINAL v1.3.37', ja: 'TERMINAL v1.3.37', ko: 'TERMINAL v1.3.37' },
  'secretTerminal.initSystem': { en: 'SYSTEM INITIALIZED', de: 'SYSTEM INITIALISIERT', uk: 'СИСТЕМА ИНИЦИАЛИЗИРОВАНА', it: 'SISTEMA INIZIALIZZATO', es: 'SISTEMA INICIALIZADO', pt: 'SISTEMA INICIALIZADO', ja: 'システム初期化完了', ko: '시스템 초기화됨' },
  'secretTerminal.initHelp': { en: 'TYPE "help" FOR AVAILABLE COMMANDS', de: '"help" FÜR VERFÜGBARE BEFEHLE EINGEBEN', uk: 'ВВЕДИТЕ "help" ДЛЯ СПИСКА КОМАНД', it: 'DIGITA "help" PER I COMANDI', es: 'ESCRIBE "help" PARA VER COMANDOS', pt: 'ESCREVE "help" PARA VER COMANDOS', ja: '"help" でコマンド一覧', ko: '"help" 입력 시 명령 목록' },
  'secretTerminal.cleared': { en: 'TERMINAL CLEARED', de: 'TERMINAL GELEERT', uk: 'ТЕРМИНАЛ ОЧИЩЕН', it: 'TERMINALE SVUOTATO', es: 'TERMINAL LIMPIADO', pt: 'TERMINAL LIMPO', ja: 'ターミナルをクリア', ko: '터미널 지워짐' },
  'secretTerminal.apiError': { en: 'TERMINAL API ERROR', de: 'TERMINAL API FEHLER', uk: 'ОШИБКА API ТЕРМИНАЛА', it: 'ERRORE API TERMINALE', es: 'ERROR API TERMINAL', pt: 'ERRO API TERMINAL', ja: 'ターミナルAPIエラー', ko: '터미널 API 오류' },
  'secretTerminal.helpDesc': { en: 'Show this message', de: 'Diese Meldung anzeigen', uk: 'Показать это сообщение', it: 'Mostra questo messaggio', es: 'Mostrar este mensaje', pt: 'Mostrar esta mensagem', ja: 'このメッセージを表示', ko: '이 메시지 표시' },
  'secretTerminal.clearDesc': { en: 'Clear terminal', de: 'Terminal leeren', uk: 'Очистить терминал', it: 'Svuota terminale', es: 'Limpiar terminal', pt: 'Limpar terminal', ja: 'ターミナルをクリア', ko: '터미널 지우기' },
  'secretTerminal.exitDesc': { en: 'Close terminal', de: 'Terminal schließen', uk: 'Закрыть терминал', it: 'Chiudi terminale', es: 'Cerrar terminal', pt: 'Fechar terminal', ja: 'ターミナルを閉じる', ko: '터미널 닫기' },
  'secretTerminal.availableCommands': { en: 'AVAILABLE COMMANDS:', de: 'VERFÜGBARE BEFEHLE:', uk: 'ДОСТУПНЫЕ КОМАНДЫ:', it: 'COMANDI DISPONIBILI:', es: 'COMANDOS DISPONIBLES:', pt: 'COMANDOS DISPONÍVEIS:', ja: '利用可能なコマンド:', ko: '사용 가능한 명령:' },
  'secretTerminal.commandNotFound': { en: 'COMMAND NOT FOUND', de: 'BEFEHL NICHT GEFUNDEN', uk: 'КОМАНДА НЕ НАЙДЕНА', it: 'COMANDO NON TROVATO', es: 'COMANDO NO ENCONTRADO', pt: 'COMANDO NÃO ENCONTRADO', ja: 'コマンドが見つかりません', ko: '명령을 찾을 수 없음' },
  'secretTerminal.typeHelp': { en: 'TYPE "help" FOR AVAILABLE COMMANDS', de: '"help" FÜR VERFÜGBARE BEFEHLE EINGEBEN', uk: 'ВВЕДИТЕ "help" ДЛЯ СПИСКА КОМАНД', it: 'DIGITA "help" PER I COMANDI', es: 'ESCRIBE "help" PARA VER COMANDOS', pt: 'ESCREVE "help" PARA VER COMANDOS', ja: '"help" でコマンド一覧', ko: '"help" 입력 시 명령 목록' },
  'secretTerminal.initiatingDownload': { en: 'INITIATING DOWNLOAD', de: 'DOWNLOAD WIRD GESTARTET', uk: 'ЗАПУСК ЗАГРУЗКИ', it: 'AVVIO DOWNLOAD', es: 'INICIANDO DESCARGA', pt: 'A INICIAR DOWNLOAD', ja: 'ダウンロード開始', ko: '다운로드 시작' },
  'secretTerminal.connectionError': { en: 'CONNECTION ERROR', de: 'VERBINDUNGSFEHLER', uk: 'ОШИБКА СОЕДИНЕНИЯ', it: 'ERRORE DI CONNESSIONE', es: 'ERROR DE CONEXIÓN', pt: 'ERRO DE LIGAÇÃO', ja: '接続エラー', ko: '연결 오류' },
  'secretTerminal.terminalActive': { en: 'TERMINAL ACTIVE', de: 'TERMINAL AKTIV', uk: 'ТЕРМИНАЛ АКТИВЕН', it: 'TERMINALE ATTIVO', es: 'TERMINAL ACTIVO', pt: 'TERMINAL ATIVO', ja: 'ターミナル稼働中', ko: '터미널 활성' },
  'secretTerminal.cursorChar': { en: '▌', de: '▌', uk: '▌', it: '▌', es: '▌', pt: '▌', ja: '▌', ko: '▌' },
  'secretTerminal.transferComplete': { en: 'TRANSFER COMPLETE', de: 'TRANSFER ABGESCHLOSSEN', uk: 'ПЕРЕДАЧА ЗАВЕРШЕНА', it: 'TRASFERIMENTO COMPLETATO', es: 'TRANSFERENCIA COMPLETA', pt: 'TRANSFERÊNCIA CONCLUÍDA', ja: '転送完了', ko: '전송 완료' },
  'secretTerminal.inputPlaceholder': { en: 'Enter command...', de: 'Befehl eingeben...', uk: 'Введите команду...', it: 'Inserisci comando...', es: 'Escribe un comando...', pt: 'Introduz um comando...', ja: 'コマンドを入力...', ko: '명령 입력...' },

  // ── ReleasesSection ─────────────────────────────────────────────────
  'releases.defaultTitle':     { en: 'RELEASES', de: 'VERÖFFENTLICHUNGEN', uk: 'РЕЛИЗЫ', it: 'USCITE', es: 'LANZAMIENTOS', pt: 'LANÇAMENTOS', ja: 'リリース', ko: '릴리즈' },
  'releases.noReleases':       { en: 'No releases yet.', de: 'Noch keine Veröffentlichungen.', uk: 'Релизов пока нет.', it: 'Nessuna uscita ancora.', es: 'Sin lanzamientos aún.', pt: 'Sem lançamentos ainda.', ja: 'まだリリースはありません。', ko: '아직 릴리즈가 없습니다.' },
  'releases.addRelease':       { en: 'Add Release', de: 'Release hinzufügen', uk: 'Добавить релиз', it: 'Aggiungi uscita', es: 'Agregar lanzamiento', pt: 'Adicionar lançamento', ja: 'リリースを追加', ko: '릴리즈 추가' },
  'releases.syncAndEnrich':    { en: 'Sync & Enrich', de: 'Synchronisieren & Anreichern', uk: 'Синхронизировать и обогатить', it: 'Sincronizza e arricchisci', es: 'Sincronizar y enriquecer', pt: 'Sincronizar e enriquecer', ja: '同期・補完', ko: '동기화 및 보강' },
  'releases.showLess':         { en: 'Show Less', de: 'Weniger anzeigen', uk: 'Показать меньше', it: 'Mostra meno', es: 'Mostrar menos', pt: 'Mostrar menos', ja: '表示を減らす', ko: '덜 보기' },
  'releases.showAll':          { en: 'Show All', de: 'Alle anzeigen', uk: 'Показать все', it: 'Mostra tutto', es: 'Mostrar todo', pt: 'Mostrar tudo', ja: 'すべて表示', ko: '모두 보기' },

  // ── ContactInboxDialog ──────────────────────────────────────────────
  'inbox.title':               { en: 'INBOX', de: 'POSTFACH', uk: 'ВХОДЯЩИЕ', it: 'POSTA IN ARRIVO', es: 'BANDEJA DE ENTRADA', pt: 'CAIXA DE ENTRADA', ja: '受信トレイ', ko: '받은 편지함' },
  'inbox.loading':             { en: 'Loading...', de: 'Laden...', uk: 'Загрузка...', it: 'Caricamento...', es: 'Cargando...', pt: 'A carregar...', ja: '読み込み中...', ko: '로딩 중...' },
  'inbox.noMessages':          { en: 'No messages', de: 'Keine Nachrichten', uk: 'Нет сообщений', it: 'Nessun messaggio', es: 'Sin mensajes', pt: 'Sem mensagens', ja: 'メッセージなし', ko: '메시지 없음' },
  'inbox.deleteMessage':       { en: 'Delete message', de: 'Nachricht löschen', uk: 'Удалить сообщение', it: 'Elimina messaggio', es: 'Eliminar mensaje', pt: 'Eliminar mensagem', ja: 'メッセージを削除', ko: '메시지 삭제' },

  // ── Contact ─────────────────────────────────────────────────────────
  'contact.defaultTitle':      { en: 'CONTACT', de: 'KONTAKT', uk: 'КОНТАКТ', it: 'CONTATTO', es: 'CONTACTO', pt: 'CONTACTO', ja: 'コンタクト', ko: '연락처' },
  'contact.description':       { en: 'Get in touch with us.', de: 'Nimm Kontakt mit uns auf.', uk: 'Свяжитесь с нами.', it: 'Mettiti in contatto con noi.', es: 'Contáctanos.', pt: 'Entre em contacto connosco.', ja: 'お問い合わせください。', ko: '저희에게 연락하세요.' },
  'contact.nameLabel':         { en: 'NAME', de: 'NAME', uk: 'ИМЯ', it: 'NOME', es: 'NOMBRE', pt: 'NOME', ja: '名前', ko: '이름' },
  'contact.namePlaceholder':   { en: 'Your name...', de: 'Dein Name...', uk: 'Ваше имя...', it: 'Il tuo nome...', es: 'Tu nombre...', pt: 'O seu nome...', ja: 'お名前...', ko: '이름...' },
  'contact.emailLabel':        { en: 'EMAIL', de: 'E-MAIL', uk: 'ЭЛЕКТРОННАЯ ПОЧТА', it: 'EMAIL', es: 'CORREO ELECTRÓNICO', pt: 'E-MAIL', ja: 'メール', ko: '이메일' },
  'contact.emailPlaceholder':  { en: 'your@email.com', de: 'deine@email.com', uk: 'ваша@почта.com', it: 'tua@email.com', es: 'tu@email.com', pt: 'o.seu@email.com', ja: 'your@email.com', ko: 'your@email.com' },
  'contact.subjectLabel':      { en: 'SUBJECT', de: 'BETREFF', uk: 'ТЕМА', it: 'OGGETTO', es: 'ASUNTO', pt: 'ASSUNTO', ja: '件名', ko: '제목' },
  'contact.subjectPlaceholder': { en: 'Subject...', de: 'Betreff...', uk: 'Тема...', it: 'Oggetto...', es: 'Asunto...', pt: 'Assunto...', ja: '件名...', ko: '제목...' },
  'contact.messageLabel':      { en: 'MESSAGE', de: 'NACHRICHT', uk: 'СООБЩЕНИЕ', it: 'MESSAGGIO', es: 'MENSAJE', pt: 'MENSAGEM', ja: 'メッセージ', ko: '메시지' },
  'contact.messagePlaceholder': { en: 'Your message...', de: 'Deine Nachricht...', uk: 'Ваше сообщение...', it: 'Il tuo messaggio...', es: 'Tu mensaje...', pt: 'A sua mensagem...', ja: 'メッセージ...', ko: '메시지...' },
  'contact.send':              { en: 'SEND MESSAGE', de: 'NACHRICHT SENDEN', uk: 'ОТПРАВИТЬ СООБЩЕНИЕ', it: 'INVIA MESSAGGIO', es: 'ENVIAR MENSAJE', pt: 'ENVIAR MENSAGEM', ja: 'メッセージを送る', ko: '메시지 보내기' },
  'contact.sending':           { en: 'SENDING...', de: 'WIRD GESENDET...', uk: 'ОТПРАВКА...', it: 'INVIO...', es: 'ENVIANDO...', pt: 'A ENVIAR...', ja: '送信中...', ko: '전송 중...' },
  'contact.success':           { en: 'Message sent successfully!', de: 'Nachricht erfolgreich gesendet!', uk: 'Сообщение успешно отправлено!', it: 'Messaggio inviato con successo!', es: '¡Mensaje enviado con éxito!', pt: 'Mensagem enviada com sucesso!', ja: 'メッセージが送信されました！', ko: '메시지가 성공적으로 전송되었습니다!' },
  'contact.sendError':         { en: 'Failed to send message. Please try again.', de: 'Nachricht konnte nicht gesendet werden. Bitte versuche es erneut.', uk: 'Не удалось отправить сообщение. Пожалуйста, попробуйте снова.', it: 'Invio del messaggio fallito. Riprova.', es: 'Error al enviar el mensaje. Por favor, inténtalo de nuevo.', pt: 'Falha ao enviar mensagem. Por favor, tente novamente.', ja: 'メッセージの送信に失敗しました。もう一度お試しください。', ko: '메시지 전송에 실패했습니다. 다시 시도해 주세요.' },
  'contact.errorInvalid':      { en: 'Please fill in all required fields correctly.', de: 'Bitte fülle alle Pflichtfelder korrekt aus.', uk: 'Заполните все обязательные поля.', it: 'Compila correttamente tutti i campi obbligatori.', es: 'Rellena todos los campos obligatorios correctamente.', pt: 'Preencha todos os campos obrigatórios corretamente.', ja: '必須項目を正しく入力してください。', ko: '필수 항목을 올바르게 입력해 주세요.' },
  'contact.errorRateLimit':    { en: 'Too many messages. Please try again in a few minutes.', de: 'Zu viele Nachrichten. Bitte versuche es in ein paar Minuten erneut.', uk: 'Слишком много сообщений. Попробуйте через несколько минут.', it: 'Troppi messaggi. Riprova tra qualche minuto.', es: 'Demasiados mensajes. Inténtalo de nuevo en unos minutos.', pt: 'Demasiadas mensagens. Tente novamente dentro de alguns minutos.', ja: '送信が多すぎます。数分後にもう一度お試しください。', ko: '메시지가 너무 많습니다. 몇 분 후에 다시 시도해 주세요.' },
  'contact.newMessage':        { en: 'SEND ANOTHER', de: 'WEITERE SENDEN', uk: 'ОТПРАВИТЬ ЕЩЁ', it: 'INVIA UN ALTRO', es: 'ENVIAR OTRO', pt: 'ENVIAR OUTRO', ja: 'もう一件送る', ko: '다른 메시지 보내기' },
  'contact.settings':          { en: 'CONTACT SETTINGS', de: 'KONTAKT-EINSTELLUNGEN', uk: 'НАСТРОЙКИ КОНТАКТА', it: 'IMPOSTAZIONI CONTATTO', es: 'CONFIGURACIÓN DE CONTACTO', pt: 'DEFINIÇÕES DE CONTACTO', ja: 'コンタクト設定', ko: '연락처 설정' },
  'contact.titleLabel':        { en: 'Section Title', de: 'Abschnittstitel', uk: 'Заголовок раздела', it: 'Titolo sezione', es: 'Título de sección', pt: 'Título da secção', ja: 'セクションタイトル', ko: '섹션 제목' },
  'contact.titlePlaceholder':  { en: 'CONTACT', de: 'KONTAKT', uk: 'КОНТАКТ', it: 'CONTATTO', es: 'CONTACTO', pt: 'CONTACTO', ja: 'コンタクト', ko: '연락처' },
  'contact.emailForward':      { en: 'Forward to Email', de: 'Weiterleiten an E-Mail', uk: 'Переслать на email', it: 'Inoltra a email', es: 'Reenviar a email', pt: 'Encaminhar para email', ja: 'メールに転送', ko: '이메일로 전달' },
  'contact.emailForwardPlaceholder': { en: 'admin@example.com', de: 'admin@example.com', uk: 'admin@example.com', it: 'admin@example.com', es: 'admin@example.com', pt: 'admin@example.com', ja: 'admin@example.com', ko: 'admin@example.com' },
  'contact.descriptionLabel':  { en: 'Description', de: 'Beschreibung', uk: 'Описание', it: 'Descrizione', es: 'Descripción', pt: 'Descrição', ja: '説明', ko: '설명' },
  'contact.descriptionPlaceholder': { en: 'Get in touch...', de: 'Kontaktiere uns...', uk: 'Свяжитесь с нами...', it: 'Mettiti in contatto...', es: 'Contáctanos...', pt: 'Entre em contacto...', ja: 'お問い合わせ...', ko: '연락하기...' },
  'contact.successLabel':      { en: 'Success Message', de: 'Erfolgsnachricht', uk: 'Сообщение об успехе', it: 'Messaggio di successo', es: 'Mensaje de éxito', pt: 'Mensagem de sucesso', ja: '成功メッセージ', ko: '성공 메시지' },
  'contact.successPlaceholder': { en: 'Thanks for reaching out!', de: 'Danke für deine Nachricht!', uk: 'Спасибо за обращение!', it: 'Grazie per averci contattato!', es: '¡Gracias por contactarnos!', pt: 'Obrigado pelo contacto!', ja: 'お問い合わせありがとうございます！', ko: '연락해 주셔서 감사합니다!' },
  'contact.closePanel':        { en: 'CLOSE', de: 'SCHLIESSEN', uk: 'ЗАКРЫТЬ', it: 'CHIUDI', es: 'CERRAR', pt: 'FECHAR', ja: '閉じる', ko: '닫기' },
  'contact.editSection':       { en: 'EDIT SECTION', de: 'ABSCHNITT BEARBEITEN', uk: 'РЕДАКТИРОВАТЬ РАЗДЕЛ', it: 'MODIFICA SEZIONE', es: 'EDITAR SECCIÓN', pt: 'EDITAR SECÇÃO', ja: 'セクションを編集', ko: '섹션 편집' },
  'contact.formFieldLabels':   { en: 'Form Field Labels', de: 'Formularfeld-Beschriftungen', uk: 'Метки полей формы', it: 'Etichette dei campi del modulo', es: 'Etiquetas de campos del formulario', pt: 'Etiquetas dos campos do formulário', ja: 'フォームフィールドラベル', ko: '양식 필드 레이블' },
  'contact.nameLabelField':    { en: 'Name Label', de: 'Name-Beschriftung', uk: 'Метка имени', it: 'Etichetta nome', es: 'Etiqueta de nombre', pt: 'Etiqueta do nome', ja: '名前ラベル', ko: '이름 레이블' },
  'contact.namePlaceholderField': { en: 'Name Placeholder', de: 'Name-Platzhalter', uk: 'Заполнитель имени', it: 'Segnaposto nome', es: 'Marcador de posición de nombre', pt: 'Marcador do nome', ja: '名前プレースホルダー', ko: '이름 플레이스홀더' },
  'contact.emailLabelField':   { en: 'Email Label', de: 'E-Mail-Beschriftung', uk: 'Метка email', it: 'Etichetta email', es: 'Etiqueta de email', pt: 'Etiqueta do email', ja: 'メールラベル', ko: '이메일 레이블' },
  'contact.emailPlaceholderField': { en: 'Email Placeholder', de: 'E-Mail-Platzhalter', uk: 'Заполнитель email', it: 'Segnaposto email', es: 'Marcador de posición de email', pt: 'Marcador do email', ja: 'メールプレースホルダー', ko: '이메일 플레이스홀더' },
  'contact.subjectLabelField': { en: 'Subject Label', de: 'Betreff-Beschriftung', uk: 'Метка темы', it: 'Etichetta oggetto', es: 'Etiqueta de asunto', pt: 'Etiqueta do assunto', ja: '件名ラベル', ko: '제목 레이블' },
  'contact.subjectPlaceholderField': { en: 'Subject Placeholder', de: 'Betreff-Platzhalter', uk: 'Заполнитель темы', it: 'Segnaposto oggetto', es: 'Marcador de posición de asunto', pt: 'Marcador do assunto', ja: '件名プレースホルダー', ko: '제목 플레이스홀더' },
  'contact.messageLabelField': { en: 'Message Label', de: 'Nachrichten-Beschriftung', uk: 'Метка сообщения', it: 'Etichetta messaggio', es: 'Etiqueta de mensaje', pt: 'Etiqueta da mensagem', ja: 'メッセージラベル', ko: '메시지 레이블' },
  'contact.messagePlaceholderField': { en: 'Message Placeholder', de: 'Nachrichten-Platzhalter', uk: 'Заполнитель сообщения', it: 'Segnaposto messaggio', es: 'Marcador de posición de mensaje', pt: 'Marcador da mensagem', ja: 'メッセージプレースホルダー', ko: '메시지 플레이스홀더' },
  'contact.submitButtonField': { en: 'Submit Button Text', de: 'Schaltfläche Senden Text', uk: 'Текст кнопки отправки', it: 'Testo pulsante invio', es: 'Texto del botón de envío', pt: 'Texto do botão de envio', ja: '送信ボタンテキスト', ko: '제출 버튼 텍스트' },

  // ── Media ────────────────────────────────────────────────────────────
  'media.openArchive':         { en: 'OPEN ARCHIVE', de: 'OPEN ARCHIVE', uk: 'OPEN ARCHIVE', it: 'OPEN ARCHIVE', es: 'OPEN ARCHIVE', pt: 'OPEN ARCHIVE', ja: 'OPEN ARCHIVE', ko: 'OPEN ARCHIVE' },
  'media.pressKits':           { en: '// PRESS KITS · LOGOS · ASSETS', de: '// PRESSEMAPPEN · LOGOS · ASSETS', uk: '// ПРЕСС-КИТЫ · ЛОГОТИПЫ · РЕСУРСЫ', it: '// PRESS KIT · LOGHI · RISORSE', es: '// KITS DE PRENSA · LOGOS · RECURSOS', pt: '// KITS DE IMPRENSA · LOGOS · RECURSOS', ja: '// プレスキット · ロゴ · アセット', ko: '// 프레스 킷 · 로고 · 에셋' },
  'media.filesAvailable':      { en: '{0} FILE{1} AVAILABLE // PRESS KITS · LOGOS · ASSETS', de: '{0} DATEI{1} VERFÜGBAR // PRESSEMAPPEN · LOGOS · ASSETS', uk: '{0} ФАЙЛ{1} ДОСТУПНО // ПРЕСС-КИТЫ · ЛОГОТИПЫ', it: '{0} FILE{1} DISPONIBILI // PRESS KIT · LOGHI', es: '{0} ARCHIVO{1} DISPONIBLE // KITS DE PRENSA', pt: '{0} FICHEIRO{1} DISPONÍVEL // KITS DE IMPRENSA', ja: '{0}個のファイルが利用可能 // プレスキット', ko: '{0}개 파일 사용 가능 // 프레스 킷' },
  'media.clickToAccess':       { en: 'CLICK TO ACCESS ARCHIVE', de: 'CLICK TO ACCESS ARCHIVE', uk: 'CLICK TO ACCESS ARCHIVE', it: 'CLICK TO ACCESS ARCHIVE', es: 'CLICK TO ACCESS ARCHIVE', pt: 'CLICK TO ACCESS ARCHIVE', ja: 'CLICK TO ACCESS ARCHIVE', ko: 'CLICK TO ACCESS ARCHIVE' },
  'media.noFiles':             { en: 'NO FILES AVAILABLE', de: 'KEINE DATEIEN VERFÜGBAR', uk: 'НЕТ ДОСТУПНЫХ ФАЙЛОВ', it: 'NESSUN FILE DISPONIBILE', es: 'SIN ARCHIVOS DISPONIBLES', pt: 'SEM FICHEIROS DISPONÍVEIS', ja: 'ファイルなし', ko: '파일 없음' },

  // ── Social buttons ────────────────────────────────────────────────────
  'social.merchShop':          { en: 'Merch Shop', de: 'Merch-Shop', uk: 'Магазин мерча', it: 'Negozio Merch', es: 'Tienda de Merch', pt: 'Loja de Merch', ja: 'マーチショップ', ko: '머치 샵' },
  'social.contactButton':      { en: 'Contact', de: 'Kontakt', uk: 'Контакт', it: 'Contatto', es: 'Contacto', pt: 'Contacto', ja: 'コンタクト', ko: '연락처' },
  'social.editLinks':          { en: 'Edit Links', de: 'Links bearbeiten', uk: 'Редактировать ссылки', it: 'Modifica link', es: 'Editar enlaces', pt: 'Editar links', ja: 'リンクを編集', ko: '링크 편집' },

  // ── Newsletter ──────────────────────────────────────────────────────
  'newsletter.title':          { en: 'STAY CONNECTED', de: 'BLEIB VERBUNDEN', uk: 'ОСТАВАЙСЯ НА СВЯЗИ', it: 'RESTA CONNESSO', es: 'PERMANECE CONECTADO', pt: 'FICA LIGADO', ja: 'つながり続ける', ko: '연결 유지' },
  'newsletter.description':    { en: 'Get the latest news, releases and gig updates.', de: 'Erhalte die neuesten News, Releases und Gig-Updates.', uk: 'Получай последние новости, релизы и обновления о концертах.', it: 'Ricevi le ultime notizie, uscite e aggiornamenti sui concerti.', es: 'Recibe las últimas noticias, lanzamientos y actualizaciones de conciertos.', pt: 'Recebe as últimas notícias, lançamentos e actualizações de concertos.', ja: '最新ニュース、リリース、ライブ情報を受け取る。', ko: '최신 뉴스, 릴리즈 및 공연 업데이트를 받아보세요.' },
  'newsletter.placeholder':    { en: 'your@email.com', de: 'deine@email.com', uk: 'ваша@почта.com', it: 'tua@email.com', es: 'tu@email.com', pt: 'o.seu@email.com', ja: 'your@email.com', ko: 'your@email.com' },
  'newsletter.subscribe':      { en: 'SUBSCRIBE', de: 'ABONNIEREN', uk: 'ПОДПИСАТЬСЯ', it: 'ISCRIVITI', es: 'SUSCRIBIRSE', pt: 'SUBSCREVER', ja: '登録する', ko: '구독하기' },
  'newsletter.signupError':    { en: 'Error signing up', de: 'Fehler beim Anmelden', uk: 'Ошибка при регистрации', it: "Errore durante l'iscrizione", es: 'Error al registrarse', pt: 'Erro ao subscrever', ja: '登録エラー', ko: '가입 오류' },
  'newsletter.networkError':   { en: 'Network error. Please try again later.', de: 'Netzwerkfehler. Bitte versuche es später erneut.', uk: 'Ошибка сети. Пожалуйста, попробуйте позже.', it: 'Errore di rete. Riprova più tardi.', es: 'Error de red. Por favor, inténtalo más tarde.', pt: 'Erro de rede. Por favor, tente novamente mais tarde.', ja: 'ネットワークエラー。後でもう一度お試しください。', ko: '네트워크 오류. 나중에 다시 시도하세요.' },
  'newsletter.pendingConfirm': { en: 'Check your email to confirm your subscription.', de: 'Bitte bestätige deine Anmeldung über den Link in deiner E-Mail.', uk: 'Подтвердите подписку по ссылке в письме.', it: 'Conferma l\'iscrizione tramite il link nell\'email.', es: 'Confirma tu suscripción con el enlace del correo.', pt: 'Confirma a subscrição através do link no email.', ja: 'メールのリンクから登録を確認してください。', ko: '이메일의 링크로 구독을 확인해 주세요.' },
  'newsletter.success':        { en: "You're subscribed. Thank you.", de: 'Du bist angemeldet. Danke!', uk: 'Вы подписаны. Спасибо!', it: 'Iscrizione confermata. Grazie!', es: 'Suscripción confirmada. Gracias.', pt: 'Subscrição confirmada. Obrigado.', ja: '登録が完了しました。ありがとうございます。', ko: '구독이 완료되었습니다. 감사합니다.' },
  'newsletter.unsubscribe':    { en: 'You can unsubscribe at any time.', de: 'Du kannst dich jederzeit abmelden.', uk: 'Вы можете отписаться в любое время.', it: "Puoi annullare l'iscrizione in qualsiasi momento.", es: 'Puedes darte de baja en cualquier momento.', pt: 'Podes cancelar a subscrição a qualquer momento.', ja: 'いつでも登録解除できます。', ko: '언제든지 구독을 취소할 수 있습니다.' },
  'newsletter.consentPrefix':  { en: 'I agree to receive emails and accept the', de: 'Ich stimme dem Erhalt von E-Mails zu und akzeptiere die', uk: 'Я согласен получать письма и принимаю', it: 'Accetto di ricevere email e accetto la', es: 'Acepto recibir correos y la', pt: 'Aceito receber emails e a', ja: 'メールの受信と', ko: '이메일 수신에 동의하며' },
  'newsletter.consentLink':    { en: 'privacy policy', de: 'Datenschutzerklärung', uk: 'политику конфиденциальности', it: 'informativa sulla privacy', es: 'política de privacidad', pt: 'política de privacidade', ja: 'プライバシーポリシー', ko: '개인정보 처리방침' },
  'newsletter.unsubscribeConfirm': { en: 'Unsubscribe', de: 'Abmelden', uk: 'Отписаться', it: 'Annulla iscrizione', es: 'Darse de baja', pt: 'Cancelar subscrição', ja: '登録解除', ko: '구독 취소' },
  'newsletter.unsubscribePrompt': { en: 'Click below to unsubscribe from the mailing list.', de: 'Klicke unten, um dich von der Mailingliste abzumelden.', uk: 'Нажмите ниже, чтобы отписаться от рассылки.', it: 'Clicca qui sotto per annullare l\'iscrizione.', es: 'Haz clic abajo para darte de baja.', pt: 'Clica abaixo para cancelar a subscrição.', ja: '下のボタンで登録を解除できます。', ko: '아래 버튼을 눌러 구독을 취소하세요.' },
  'newsletter.unsubscribeSuccess': { en: 'You have been unsubscribed.', de: 'Du wurdest abgemeldet.', uk: 'Вы отписаны от рассылки.', it: 'Iscrizione annullata.', es: 'Te has dado de baja.', pt: 'Subscrição cancelada.', ja: '登録を解除しました。', ko: '구독이 취소되었습니다.' },
  'newsletter.confirmSuccessTitle': { en: 'SUBSCRIPTION CONFIRMED', de: 'ANMELDUNG BESTÄTIGT', uk: 'ПОДПИСКА ПОДТВЕРЖДЕНА', it: 'ISCRIZIONE CONFERMATA', es: 'SUSCRIPCIÓN CONFIRMADA', pt: 'SUBSCRIÇÃO CONFIRMADA', ja: '登録が確認されました', ko: '구독이 확인되었습니다' },
  'newsletter.confirmSuccess': { en: "You're subscribed. Thank you — watch your inbox for news and releases.", de: 'Du bist angemeldet. Danke — halte Ausschau nach News und Releases in deinem Postfach.', uk: 'Вы подписаны. Спасибо — следите за новостями и релизами в почте.', it: 'Iscrizione confermata. Grazie — controlla la posta per news e uscite.', es: 'Suscripción confirmada. Gracias — revisa tu correo para noticias y lanzamientos.', pt: 'Subscrição confirmada. Obrigado — fica atento ao email para novidades e lançamentos.', ja: '登録が完了しました。ニュースとリリース情報をお楽しみに。', ko: '구독이 완료되었습니다. 뉴스와 릴리즈 소식을 기대해 주세요.' },
  'newsletter.confirmFailedTitle': { en: 'CONFIRMATION FAILED', de: 'BESTÄTIGUNG FEHLGESCHLAGEN', uk: 'ОШИБКА ПОДТВЕРЖДЕНИЯ', it: 'CONFERMA NON RIUSCITA', es: 'CONFIRMACIÓN FALLIDA', pt: 'CONFIRMAÇÃO FALHOU', ja: '確認に失敗しました', ko: '확인 실패' },
  'newsletter.confirmFailed': { en: 'Confirmation failed. Please try again.', de: 'Bestätigung fehlgeschlagen. Bitte versuche es erneut.', uk: 'Не удалось подтвердить. Попробуйте снова.', it: 'Conferma non riuscita. Riprova.', es: 'La confirmación falló. Inténtalo de nuevo.', pt: 'A confirmação falhou. Tenta novamente.', ja: '確認に失敗しました。もう一度お試しください。', ko: '확인에 실패했습니다. 다시 시도해 주세요.' },
  'newsletter.confirmMissingToken': { en: 'Missing confirmation token. Please use the link from your email.', de: 'Bestätigungslink fehlt. Bitte nutze den Link aus deiner E-Mail.', uk: 'Отсутствует токен подтверждения. Используйте ссылку из письма.', it: 'Token di conferma mancante. Usa il link nell\'email.', es: 'Falta el token de confirmación. Usa el enlace del correo.', pt: 'Token de confirmação em falta. Usa o link do email.', ja: '確認トークンがありません。メールのリンクを使用してください。', ko: '확인 토큰이 없습니다. 이메일의 링크를 사용하세요.' },
  'newsletter.unsubscribeTitle': { en: 'UNSUBSCRIBE', de: 'ABMELDEN', uk: 'ОТПИСКА', it: 'ANNULLA ISCRIZIONE', es: 'DARSE DE BAJA', pt: 'CANCELAR SUBSCRIÇÃO', ja: '登録解除', ko: '구독 취소' },
  'newsletter.unsubscribeInvalid': { en: 'Invalid unsubscribe link. Please use the link from a newsletter email.', de: 'Ungültiger Abmeldelink. Bitte nutze den Link aus einer Newsletter-E-Mail.', uk: 'Недействительная ссылка отписки. Используйте ссылку из письма рассылки.', it: 'Link di annullamento non valido. Usa il link da un\'email della newsletter.', es: 'Enlace de baja no válido. Usa el enlace de un correo del newsletter.', pt: 'Link de cancelamento inválido. Usa o link de um email da newsletter.', ja: '無効な登録解除リンクです。ニュースレターメールのリンクを使用してください。', ko: '유효하지 않은 구독 취소 링크입니다. 뉴스레터 이메일의 링크를 사용하세요.' },
  'newsletter.backHome': { en: 'Back to home', de: 'Zur Startseite', uk: 'На главную', it: 'Torna alla home', es: 'Volver al inicio', pt: 'Voltar ao início', ja: 'ホームに戻る', ko: '홈으로 돌아가기' },

  // ── ErrorFallback ───────────────────────────────────────────────────
  'error.title':               { en: 'Runtime Error', de: 'Laufzeitfehler', uk: 'Ошибка выполнения', it: 'Errore di esecuzione', es: 'Error de ejecución', pt: 'Erro de execução', ja: '実行時エラー', ko: '런타임 오류' },
  'error.description':         { en: 'Something unexpected happened while running the application.', de: 'Beim Ausführen der Anwendung ist ein unerwarteter Fehler aufgetreten.', uk: 'Произошла непредвиденная ошибка при запуске приложения.', it: "Qualcosa di inatteso è accaduto durante l'esecuzione dell'applicazione.", es: 'Algo inesperado ocurrió mientras se ejecutaba la aplicación.', pt: 'Algo inesperado aconteceu enquanto a aplicação estava a correr.', ja: 'アプリケーションの実行中に予期しないエラーが発生しました。', ko: '애플리케이션 실행 중 예기치 않은 오류가 발생했습니다.' },
  'error.details':             { en: 'Error Details:', de: 'Fehlerdetails:', uk: 'Подробности ошибки:', it: 'Dettagli errore:', es: 'Detalles del error:', pt: 'Detalhes do erro:', ja: 'エラー詳細:', ko: '오류 세부사항:' },
  'error.tryAgain':            { en: 'Try Again', de: 'Erneut versuchen', uk: 'Попробовать снова', it: 'Riprova', es: 'Intentar de nuevo', pt: 'Tentar novamente', ja: 'もう一度試す', ko: '다시 시도' },

  // ── Gallery ─────────────────────────────────────────────────────────
  'gallery.defaultTitle':      { en: 'GALLERY', de: 'GALERIE', uk: 'ГАЛЕРЕЯ', it: 'GALLERIA', es: 'GALERÍA', pt: 'GALERIA', ja: 'ギャラリー', ko: '갤러리' },
  'gallery.subtitle':          { en: 'Visual identity', de: 'Visuelle Identität', uk: 'Визуальная идентичность', it: 'Identità visiva', es: 'Identidad visual', pt: 'Identidade visual', ja: 'ビジュアルアイデンティティ', ko: '시각적 정체성' },
  'gallery.noImages':          { en: 'No images found in gallery', de: 'Keine Bilder in der Galerie gefunden', uk: 'Изображений в галерее нет', it: 'Nessuna immagine trovata nella galleria', es: 'No se encontraron imágenes en la galería', pt: 'Sem imagens na galeria', ja: 'ギャラリーに画像がありません', ko: '갤러리에 이미지가 없습니다' },

  // ── Partners ────────────────────────────────────────────────────────
  'partners.defaultTitle':     { en: 'PARTNERS & FRIENDS', de: 'PARTNER & FREUNDE', uk: 'ПАРТНЁРЫ И ДРУЗЬЯ', it: 'PARTNER & AMICI', es: 'SOCIOS Y AMIGOS', pt: 'PARCEIROS E AMIGOS', ja: 'パートナー＆フレンズ', ko: '파트너 & 친구들' },

  // ── EditControls ────────────────────────────────────────────────────
  'edit.export':               { en: 'EXPORT', de: 'EXPORT', uk: 'ЭКСПОРТ', it: 'ESPORTA', es: 'EXPORTAR', pt: 'EXPORTAR', ja: 'エクスポート', ko: '내보내기' },
  'edit.import':               { en: 'IMPORT', de: 'IMPORT', uk: 'ИМПОРТ', it: 'IMPORTA', es: 'IMPORTAR', pt: 'IMPORTAR', ja: 'インポート', ko: '가져오기' },
  'edit.config':               { en: 'CONFIG', de: 'KONFIG', uk: 'КОНФИГ', it: 'CONFIG', es: 'CONFIG', pt: 'CONFIG', ja: '設定', ko: '구성' },
  'edit.analytics':            { en: 'ANALYTICS', de: 'ANALYTIK', uk: 'АНАЛИТИКА', it: 'ANALISI', es: 'ANÁLISIS', pt: 'ANÁLISE', ja: 'アナリティクス', ko: '애널리틱스' },
  'edit.security':             { en: 'SECURITY', de: 'SICHERHEIT', uk: 'БЕЗОПАСНОСТЬ', it: 'SICUREZZA', es: 'SEGURIDAD', pt: 'SEGURANÇA', ja: 'セキュリティ', ko: '보안' },
  'edit.theme':                { en: 'THEME', de: 'DESIGN', uk: 'ТЕМА', it: 'TEMA', es: 'TEMA', pt: 'TEMA', ja: 'テーマ', ko: '테마' },
  'edit.terminal':             { en: 'TERMINAL', de: 'TERMINAL', uk: 'ТЕРМИНАЛ', it: 'TERMINALE', es: 'TERMINAL', pt: 'TERMINAL', ja: 'ターミナル', ko: '터미널' },
  'edit.inbox':                { en: 'INBOX', de: 'POSTFACH', uk: 'ВХОДЯЩИЕ', it: 'POSTA IN ARRIVO', es: 'BANDEJA DE ENTRADA', pt: 'CAIXA DE ENTRADA', ja: '受信トレイ', ko: '받은 편지함' },
  'edit.subscribers':          { en: 'SUBSCRIBERS', de: 'ABONNENTEN', uk: 'ПОДПИСЧИКИ', it: 'ABBONATI', es: 'SUSCRIPTORES', pt: 'SUBSCRITORES', ja: '購読者', ko: '구독자' },
  'edit.password':             { en: 'PASSWORD', de: 'PASSWORT', uk: 'ПАРОЛЬ', it: 'PASSWORD', es: 'CONTRASEÑA', pt: 'PALAVRA-PASSE', ja: 'パスワード', ko: '비밀번호' },
  'edit.logout':               { en: 'LOGOUT', de: 'ABMELDEN', uk: 'ВЫЙТИ', it: 'DISCONNETTERSI', es: 'CERRAR SESIÓN', pt: 'SAIR', ja: 'ログアウト', ko: '로그아웃' },

  // ── CyberpunkLoader ─────────────────────────────────────────────────
  'loader.bootSequence':       { en: 'NK-SYS [v2.0] // BOOT SEQUENCE', de: 'NK-SYS [v2.0] // STARTSEQUENZ', uk: 'NK-SYS [v2.0] // ПОСЛЕДОВАТЕЛЬНОСТЬ ЗАГРУЗКИ', it: 'NK-SYS [v2.0] // SEQUENZA DI AVVIO', es: 'NK-SYS [v2.0] // SECUENCIA DE ARRANQUE', pt: 'NK-SYS [v2.0] // SEQUÊNCIA DE ARRANQUE', ja: 'NK-SYS [v2.0] // 起動シーケンス', ko: 'NK-SYS [v2.0] // 부팅 시퀀스' },

  // ── Admin Panel Tabs ─────────────────────────────────────────────────
  'admin.tabOverview':         { en: 'Overview', de: 'Übersicht', uk: 'Обзор', it: 'Panoramica', es: 'Resumen', pt: 'Visão geral', ja: '概要', ko: '개요' },
  'admin.tabContent':          { en: 'Content', de: 'Inhalte', uk: 'Контент', it: 'Contenuto', es: 'Contenido', pt: 'Conteúdo', ja: 'コンテンツ', ko: '콘텐츠' },
  'admin.tabAppearance':       { en: 'Appearance', de: 'Erscheinungsbild', uk: 'Внешний вид', it: 'Aspetto', es: 'Apariencia', pt: 'Aparência', ja: '外観', ko: '외관' },
  'admin.tabBackground':       { en: 'Background', de: 'Hintergrund', uk: 'Фон', it: 'Sfondo', es: 'Fondo', pt: 'Plano de fundo', ja: '背景', ko: '배경' },
  'admin.tabSections':         { en: 'Sections', de: 'Abschnitte', uk: 'Разделы', it: 'Sezioni', es: 'Secciones', pt: 'Secções', ja: 'セクション', ko: '섹션' },
  'admin.tabSectionConfig':    { en: 'Section Config', de: 'Abschnitts-Konfiguration', uk: 'Конфигурация разделов', it: 'Config sezione', es: 'Config de sección', pt: 'Config de secção', ja: 'セクション設定', ko: '섹션 설정' },
  'admin.tabSecurity':         { en: 'Security', de: 'Sicherheit', uk: 'Безопасность', it: 'Sicurezza', es: 'Seguridad', pt: 'Segurança', ja: 'セキュリティ', ko: '보안' },
  'admin.tabAnalytics':        { en: 'Analytics', de: 'Analytik', uk: 'Аналитика', it: 'Analisi', es: 'Análisis', pt: 'Análise', ja: 'アナリティクス', ko: '애널리틱스' },
  'admin.tabData':             { en: 'Data', de: 'Daten', uk: 'Данные', it: 'Dati', es: 'Datos', pt: 'Dados', ja: 'データ', ko: '데이터' },
  'admin.tabTranslations':     { en: 'Translations', de: 'Übersetzungen', uk: 'Переводы', it: 'Traduzioni', es: 'Traducciones', pt: 'Traduções', ja: '翻訳', ko: '번역' },

  // ── i18n / Translation Manager ──────────────────────────────────────
  'i18n.exportTitle':          { en: 'Export Translations', de: 'Übersetzungen exportieren', uk: 'Экспортировать переводы', it: 'Esporta traduzioni', es: 'Exportar traducciones', pt: 'Exportar traduções', ja: '翻訳をエクスポート', ko: '번역 내보내기' },
  'i18n.importTitle':          { en: 'Import Translations', de: 'Übersetzungen importieren', uk: 'Импортировать переводы', it: 'Importa traduzioni', es: 'Importar traducciones', pt: 'Importar traduções', ja: '翻訳をインポート', ko: '번역 가져오기' },
  'i18n.exportDesc':           { en: 'Download all translation keys as a JSON file for editing.', de: 'Alle Übersetzungsschlüssel als JSON-Datei herunterladen.', uk: 'Скачать все ключи перевода в виде JSON-файла для редактирования.', it: 'Scarica tutte le chiavi di traduzione come file JSON per la modifica.', es: 'Descarga todas las claves de traducción como archivo JSON para editar.', pt: 'Transferir todas as chaves de tradução como ficheiro JSON para edição.', ja: 'すべての翻訳キーをJSONファイルとしてダウンロード。', ko: '모든 번역 키를 JSON 파일로 다운로드하여 편집하세요.' },
  'i18n.importDesc':           { en: 'Upload a translation JSON file to add or override translations.', de: 'JSON-Datei mit Übersetzungen hochladen, um Übersetzungen hinzuzufügen oder zu überschreiben.', uk: 'Загрузить JSON-файл с переводами для добавления или замены переводов.', it: 'Carica un file JSON di traduzione per aggiungere o sovrascrivere le traduzioni.', es: 'Sube un archivo JSON de traducción para agregar o reemplazar traducciones.', pt: 'Carregue um ficheiro JSON de tradução para adicionar ou substituir traduções.', ja: '翻訳JSONファイルをアップロードして翻訳を追加または上書きします。', ko: '번역 JSON 파일을 업로드하여 번역을 추가하거나 재정의하세요.' },
  'i18n.exportButton':         { en: 'Export JSON', de: 'JSON exportieren', uk: 'Экспорт JSON', it: 'Esporta JSON', es: 'Exportar JSON', pt: 'Exportar JSON', ja: 'JSONをエクスポート', ko: 'JSON 내보내기' },
  'i18n.importButton':         { en: 'Import JSON', de: 'JSON importieren', uk: 'Импорт JSON', it: 'Importa JSON', es: 'Importar JSON', pt: 'Importar JSON', ja: 'JSONをインポート', ko: 'JSON 가져오기' },
  'i18n.importSuccess':        { en: 'Translations imported successfully!', de: 'Übersetzungen erfolgreich importiert!', uk: 'Переводы успешно импортированы!', it: 'Traduzioni importate con successo!', es: '¡Traducciones importadas con éxito!', pt: 'Traduções importadas com sucesso!', ja: '翻訳が正常にインポートされました！', ko: '번역이 성공적으로 가져와졌습니다!' },
  'i18n.importError':          { en: 'Invalid translation file format.', de: 'Ungültiges Übersetzungsdateiformat.', uk: 'Неверный формат файла перевода.', it: 'Formato del file di traduzione non valido.', es: 'Formato de archivo de traducción no válido.', pt: 'Formato de ficheiro de tradução inválido.', ja: '無効な翻訳ファイル形式。', ko: '유효하지 않은 번역 파일 형식.' },
  'i18n.resetButton':          { en: 'Reset to Defaults', de: 'Auf Standard zurücksetzen', uk: 'Сбросить к значениям по умолчанию', it: 'Ripristina impostazioni predefinite', es: 'Restablecer valores predeterminados', pt: 'Repor predefinições', ja: 'デフォルトにリセット', ko: '기본값으로 재설정' },
}

/** Get a translated string for a key and locale */
export function t(key: string, locale: Locale): string {
  const entry = translations[key]
  if (!entry) return key
  return entry[locale] ?? entry.en ?? key
}

/** Accessible name helper for ARIA labels on public UI. */
export function ariaLabel(key: string, locale: Locale = 'en'): string {
  return t(key, locale)
}

/** Return a deep copy of all translations for JSON export */
export function getTranslations(): Record<string, Record<string, string>> {
  return structuredClone(translations) as Record<string, Record<string, string>>
}

/**
 * Format a file count with correct singular/plural for the media section.
 * e.g. formatFileCount(1, 'en') → '1 FILE AVAILABLE'
 *      formatFileCount(3, 'de') → '3 DATEIEN VERFÜGBAR'
 */
export function formatFileCount(count: number, locale: Locale): string {
  if (locale === 'de') {
    const plural = count !== 1 ? 'EN' : ''
    return `${count} DATEI${plural} VERFÜGBAR // PRESSEMAPPEN · LOGOS · ASSETS`
  }
  const plural = count !== 1 ? 'S' : ''
  return `${count} FILE${plural} AVAILABLE // PRESS KITS · LOGOS · ASSETS`
}
