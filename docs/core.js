export const MAX_BYTES=2*1024*1024;
export class CSVError extends Error{constructor(code,line=1){super(code);this.line=line;}}
export function decodeBytes(bytes,encoding){if(bytes.length>MAX_BYTES)throw new CSVError('tooLarge');try{return new TextDecoder(encoding,{fatal:true}).decode(bytes);}catch{throw new CSVError('decodeError');}}
export function detectDelimiter(text){const counts={',':0,';':0,'\t':0,'|':0};let quoted=false;for(let i=0;i<text.length;i++){const c=text[i];if(c==='"'){if(quoted&&text[i+1]==='"'){i++;continue;}quoted=!quoted;}else if(!quoted&&(c==='\n'||c==='\r'))break;else if(!quoted&&c in counts)counts[c]++;}return Object.keys(counts).sort((a,b)=>counts[b]-counts[a])[0];}
export function parseCSV(input,delimiter=','){
 if(typeof input!=='string'||!input.length)throw new CSVError('empty');if(input.length>MAX_BYTES)throw new CSVError('tooLarge');if(![',',';','\t','|'].includes(delimiter))throw new CSVError('delimiterError');
 const text=input.replace(/^\uFEFF/,''),rows=[],lines=[];let row=[],field='',state='start',line=1,startLine=1,ended=false,cells=0;
 const pushField=()=>{row.push(field);field='';if(row.length>200)throw new CSVError('columnsLimit',line);if(++cells>200000)throw new CSVError('cellsLimit',line);};
 const pushRow=()=>{pushField();rows.push(row);lines.push(startLine);row=[];if(rows.length>10000)throw new CSVError('rowsLimit',line);};
 for(let i=0;i<text.length;i++){
  const c=text[i],nl=c==='\n'||c==='\r';ended=false;
  if(state==='quoted'){
   if(c==='"'){if(text[i+1]==='"'){field+='"';i++;}else state='closed';}
   else if(nl){if(c==='\r'&&text[i+1]==='\n'){field+='\r\n';i++;}else field+=c;line++;}
   else field+=c;continue;
  }
  if(c===delimiter){pushField();state='start';continue;}
  if(nl){pushRow();if(c==='\r'&&text[i+1]==='\n')i++;line++;startLine=line;state='start';ended=true;continue;}
  if(state==='closed')throw new CSVError('afterQuote',line);
  if(c==='"'){if(state!=='start')throw new CSVError('unexpectedQuote',line);state='quoted';continue;}
  field+=c;state='plain';
 }
 if(state==='quoted')throw new CSVError('unclosedQuote',startLine);if(!ended)pushRow();if(!rows.length)throw new CSVError('empty');return {rows,lines};
}
export function diagnose(parsed,expected=parsed.rows[0].length){if(!Number.isInteger(expected)||expected<1||expected>200)throw new CSVError('expectedError');return parsed.rows.flatMap((r,i)=>r.length===expected?[]:[{record:i+1,line:parsed.lines[i],actual:r.length,expected}]);}
export function exportCSV(rows,{safe=false,bom=true}={}){const quote=v=>{let s=String(v);if(safe&&/^\s*[=+@-]/.test(s))s="'"+s;return /[",\r\n]/.test(s)?'"'+s.replaceAll('"','""')+'"':s;};return (bom?'\uFEFF':'')+rows.map(row=>row.map(quote).join(',')).join('\r\n')+'\r\n';}
