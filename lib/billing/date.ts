export function billingDateInGermany(value:Date=new Date()):string {
 const parts=new Intl.DateTimeFormat('en-US',{timeZone:'Europe/Berlin',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(value)
 const get=(type:string)=>parts.find(p=>p.type===type)?.value
 return [get('year'),get('month'),get('day')].join('-')
}
export function plusBillingDays(yyyyMmDd:string,days:number):string {
 if(!/^\d{4}-\d{2}-\d{2}$/.test(yyyyMmDd)||!Number.isInteger(days)||Math.abs(days)>3650)throw new Error('Invalid billing date')
 const value=new Date(yyyyMmDd+'T12:00:00Z')
 if(Number.isNaN(value.getTime())||value.toISOString().slice(0,10)!==yyyyMmDd)throw new Error('Invalid billing date')
 value.setUTCDate(value.getUTCDate()+days)
 return value.toISOString().slice(0,10)
}
