const calls=[
{id:101,type:"Shots Fired",location:"Times Square",priority:"High"},
{id:102,type:"MVC Injury",location:"Brooklyn",priority:"Medium"}
];

const units=[
{unit:"1A-12",officer:"Smith",status:"Available"},
{unit:"2A-15",officer:"Jones",status:"En Route"}
];

const statuses=["Available","Dispatched","En Route","On Scene","Transport","Busy","Out of Service"];

function renderCalls(){
const c=document.getElementById("calls");
c.innerHTML="";
calls.forEach(x=>{
c.innerHTML+=`<div class="call"><b>#${x.id}</b><br>${x.type}<br>${x.location}<br>${x.priority}</div>`;
});
}

function log(msg){
const t=new Date().toLocaleTimeString();
document.getElementById("log").insertAdjacentHTML("afterbegin",`<div class="logEntry">${t} - ${msg}</div>`);
}

function renderUnits(){
const u=document.getElementById("units");
u.innerHTML="";
units.forEach((x,i)=>{
let buttons=statuses.map(s=>`<button onclick="setStatus(${i},'${s}')">${s}</button>`).join("");
u.innerHTML+=`<div class="unit">
<b>${x.unit}</b><br>
Officer: ${x.officer}<br>
Status: <span>${x.status}</span>
<div class="actions">${buttons}</div>
</div>`;
});
}

window.setStatus=function(index,status){
units[index].status=status;
log(`${units[index].unit} marked ${status}`);
renderUnits();
}

renderCalls();
renderUnits();
log("System initialized");
