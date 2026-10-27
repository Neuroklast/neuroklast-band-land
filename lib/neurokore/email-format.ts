/** Text email serialization is explicit so the terms remain readable offline. */
export function contractDocumentText(sections: readonly { title: string; paragraphs: readonly string[] }[]): string {
  return sections.map(section => [section.title, ...section.paragraphs].join('\n')).join('\n\n')
}

export function contractEmailText(lines: readonly string[]): string {
  return lines.join('\n')
}

/** Styled email that retains every line of the plain-text contract. */
function emailEscape(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;')
}

export function contractEmailHtml(input: {
  title: string; product: string; chargedAmount: string; accountUrl: string; documentText: string
}): string {
  const link = new URL(input.accountUrl)
  if (link.protocol !== 'https:' || link.username || link.password)
    throw new Error('Account link must use HTTPS')
  const legal = input.documentText.split(/\n{2,}/).map(p =>
    '<p style="margin:0 0 15px;font-size:12px;line-height:1.8;color:#bcbcc4;word-wrap:break-word;">' +
    emailEscape(p).replace(/\n/g, '<br>') + '</p>'
  ).join('')
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="dark"></head>
<body style="margin:0;padding:0;background:#050506;color:#f4f4f5;font-family:Arial,Helvetica,sans-serif;">
<table role="presentation" cellspacing="0" cellpadding="0" width="100%" style="background:#050506;">
<tr><td align="center" style="padding:42px 18px 58px;">
<table role="presentation" cellspacing="0" cellpadding="0" width="100%" style="max-width:560px;">
<tr><td style="border-bottom:1px solid #303035;padding:0 0 26px;">
<p style="margin:0;font-size:12px;letter-spacing:3px;color:#e14a55;font-weight:700;">NK / NEUROKLAST</p>
<p style="margin:9px 0 0;font-size:10px;letter-spacing:2px;color:#a7a7b0;">AUDIO &amp; SOFTWARE</p></td></tr>
<tr><td style="padding:38px 0 32px;">
<p style="font-size:11px;font-weight:700;letter-spacing:2px;color:#e14a55;margin:0 0 15px;">ORDER CONFIRMED</p>
<h1 style="font-size:32px;line-height:1.15;letter-spacing:-1px;font-weight:800;color:#ffffff;margin:0 0 17px;">${emailEscape(input.product)}</h1>
<p style="font-size:15px;line-height:1.75;color:#c7c7ce;margin:0 0 25px;">Payment confirmed. Your licence is assigned to your NEUROKLAST account.</p>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#131317;border:1px solid #33333a;">
<tr><td style="padding:20px;">
<p style="font-size:10px;letter-spacing:2px;color:#a7a7b0;margin:0 0 8px;">TOTAL PAID</p>
<p style="font-size:25px;font-weight:700;color:#ffffff;margin:0;">${emailEscape(input.chargedAmount)}</p>
</td></tr></table>
<table role="presentation" cellspacing="0" cellpadding="0" style="margin-top:26px;"><tr><td style="background:#b41123;border:1px solid #d92638;">
<a href="${emailEscape(link.href)}" style="display:inline-block;padding:17px 30px;font-size:12px;letter-spacing:1px;font-weight:800;color:#ffffff;text-decoration:none;">VIEW MY LICENCES</a>
</td></tr></table>
<p style="margin:20px 0 0;color:#a7a7b0;font-size:12px;line-height:1.7;">Your licence key can be viewed in your account. It is not exposed in this email.</p>
</td></tr>
<tr><td style="border-top:1px solid #303035;padding:25px 0 15px;">
<p style="font-size:11px;letter-spacing:2px;font-weight:700;color:#e14a55;margin:0 0 20px;">PURCHASE DETAILS &amp; LEGAL DOCUMENTS</p>
<p style="font-size:12px;color:#c7c7ce;margin:0 0 18px;">${emailEscape(input.title)}</p>
${legal}
</td></tr>
<tr><td style="border-top:1px solid #303035;padding:20px 0;">
<p style="font-size:11px;color:#84848e;line-height:1.7;margin:0;">NEUROKLAST / INDEPENDENT AUDIO SOFTWARE<br>This is a transactional purchase email.</p>
</td></tr>
</table></td></tr></table></body></html>`
}
