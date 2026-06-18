
import {calls,units,statuses} from './data.js';
const c=document.getElementById('calls');
const u=document.getElementById('units');
const l=document.getElementById('log');

function log(msg){
 l.insertAdjacentHTML('afterbegin',`<div>${new Date().toLocaleTimeString()} - ${msg}</div>`);
}
function renderCalls(){
 c.innerHTML='';
 calls.forEach(x=>c.innerHTML+=`<div class="card"><b>#${x.id}</b><br>${x.type}<br>${x.location}</div>`);
}
window.setStatus=(i,s)=>{units[i].status=s;log(`${units[i].unit} → ${s}`);renderUnits();}
function renderUnits(){
 u.innerHTML='';
 units.forEach((x,i)=>{
  const btns=statuses.map(s=>`<button onclick="setStatus(${i},'${s}')">${s}</button>`).join('');
  u.innerHTML+=`<div class="card"><b>${x.unit}</b><br>${x.officer}<br>Status: ${x.status}<div class="actions">${btns}</div></div>`;
 });
}
renderCalls();renderUnits();log('EmpireCAD initialized');
