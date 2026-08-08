/* ============================================================
   DENNER BARBEARIA — PAINEL DO BARBEIRO
   ============================================================ */

const B = { barber:null, selectedDate: dateKey(new Date()), appts:[] };

function paintIcons(root=document){
  root.querySelectorAll('[data-icon]').forEach(el=>{
    if(!el.dataset.painted){ el.innerHTML = icon(el.dataset.icon); el.dataset.painted='1'; }
  });
}

auth.onAuthStateChanged(async user=>{
  if(!user){ showLogin(); return; }
  try{
    const doc = await db.collection('barbers').doc(user.uid).get();
    if(doc.exists){
      B.barber = { id: doc.id, ...doc.data() };
      showPanel();
      initAgenda();
    } else {
      await auth.signOut(); showLogin();
      showToast('Este login não está vinculado a nenhum barbeiro.','error');
    }
  }catch(err){ console.error(err); await auth.signOut(); showLogin(); }
});
function showLogin(){
  document.getElementById('login-screen').classList.remove('hidden');
  document.getElementById('barber-shell').classList.add('hidden');
}
function showPanel(){
  document.getElementById('login-screen').classList.add('hidden');
  document.getElementById('barber-shell').classList.remove('hidden');
  document.getElementById('barber-name-label').textContent = B.barber.name;
  paintIcons();
}
document.getElementById('btn-login').onclick = async ()=>{
  const email = document.getElementById('login-email').value.trim();
  const senha = document.getElementById('login-senha').value;
  if(!email || !senha){ showToast('Preencha login e senha.','error'); return; }
  try{ await auth.signInWithEmailAndPassword(email, senha); }
  catch(err){ showToast('Login ou senha incorretos.','error'); }
};
document.getElementById('btn-back-site').onclick = ()=> window.location.href='index.html';
document.getElementById('btn-logout').onclick = async ()=>{ await auth.signOut(); window.location.href='index.html'; };

/* ---------------- AGENDA ---------------- */
function initAgenda(){
  renderDayTabs();
  listenAgenda();
}
function renderDayTabs(){
  const el = document.getElementById('day-tabs');
  const days = [];
  for(let i=0;i<7;i++){ const d = new Date(); d.setDate(d.getDate()+i); days.push(d); }
  el.innerHTML = days.map(d=>{
    const key = dateKey(d);
    const label = i0(d) ? 'HOJE' : `${WEEKDAY_LABEL[d.getDay()]} ${pad2(d.getDate())}`;
    return `<button class="stab ${key===B.selectedDate?'active':''}" data-day="${key}">${label}</button>`;
  }).join('');
  el.querySelectorAll('[data-day]').forEach(btn=>{
    btn.onclick = ()=>{
      B.selectedDate = btn.dataset.day;
      el.querySelectorAll('.stab').forEach(s=>s.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('agenda-heading').textContent = i0(dateFromKey(B.selectedDate)) ? 'AGENDA DE HOJE' : `AGENDA — ${formatDateBR(B.selectedDate).toUpperCase()}`;
      renderAgendaList();
    };
  });
}
function i0(d){ return dateKey(d)===dateKey(new Date()); }

function listenAgenda(){
  db.collection('appointments').where('barberId','==',B.barber.id).onSnapshot(snap=>{
    B.appts = snap.docs.map(d=>({id:d.id,...d.data()}));
    renderAgendaList();
  }, err=>console.error(err));
}
function renderAgendaList(){
  const el = document.getElementById('barber-agenda');
  const list = B.appts
    .filter(a=>a.date===B.selectedDate && a.status!=='cancelled')
    .sort((a,b)=>a.startTime.localeCompare(b.startTime));
  if(!list.length){ el.innerHTML = `<div class="empty-state"><span data-icon="calendar"></span><p>Nenhum atendimento neste dia.</p></div>`; paintIcons(el); return; }
  el.innerHTML = list.map(a=>`
    <div class="appt-card">
      <div class="top-row"><span class="time">${a.startTime}</span><span class="status-pill ${a.status}">${a.status==='completed'?'Concluído':'Confirmado'}</span></div>
      <div class="client">${a.clientName}</div>
      <div class="svc">${a.serviceName} · ${a.serviceDuration} min</div>
      <div class="svc">${a.clientPhone||''}</div>
      ${a.status==='confirmed' ? `<div class="actions">
        <button class="btn btn-secondary btn-sm" data-done="${a.id}">MARCAR CONCLUÍDO</button>
        <button class="btn btn-danger btn-sm" data-absent="${a.id}">AUSÊNCIA/CANCELAR</button>
      </div>` : ''}
    </div>`).join('');
  el.querySelectorAll('[data-done]').forEach(b=>b.onclick=()=>db.collection('appointments').doc(b.dataset.done).update({status:'completed'}).then(()=>showToast('Atendimento concluído.','success')));
  el.querySelectorAll('[data-absent]').forEach(b=>b.onclick=()=>{ if(confirm('Marcar como ausência/cancelamento?')) db.collection('appointments').doc(b.dataset.absent).update({status:'cancelled'}).then(()=>showToast('Atualizado.','success')); });
}
