function togglePanel(id){
  var p = document.getElementById(id);
  if(!p) return;
  var open = p.classList.contains('open');
  var panels = document.getElementsByClassName('side-panel');
  for(var i=0;i<panels.length;i++){ panels[i].classList.remove('open'); }
  if(!open){ p.classList.add('open'); }
}


window.addEventListener('click', function(e){
  var t = e.target;
  if(t.closest && (t.closest('.icon-btn') || t.closest('.side-panel'))) return;
  var panels = document.getElementsByClassName('side-panel');
  for(var i=0;i<panels.length;i++){ panels[i].classList.remove('open'); }
});


function initCharts(){
  var line = document.getElementById('monthlyChart');
  var pie  = document.getElementById('shareChart');
  if(typeof Chart === 'undefined') return; 

  if(line){
    var ctx1 = line.getContext('2d');
    new Chart(ctx1, {
      type: 'line',
      data: {
        labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
        datasets: [{
          label: 'Tickets',
          data: [120,160,140,200,240,210,260,230,250,300,290,340],
          borderColor: '#2c7b72',
          backgroundColor: 'rgba(44,123,114,.12)',
          pointRadius: 3,
          pointHoverRadius: 5,
          tension: .35
        }]
      },
      options: {
        maintainAspectRatio: false, 
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: '#50746f' }, grid: { color: '#eef4f3' } },
          y: { ticks: { color: '#50746f' }, grid: { color: '#eef4f3' }, beginAtZero:true }
        }
      }
    });
  }

  if(pie){
    var ctx2 = pie.getContext('2d');
    new Chart(ctx2, {
      type: 'doughnut',
      data: {
        labels: ['Qatar','Emirates','Turkish','Other'],
        datasets: [{
          data: [35, 28, 22, 15],
          backgroundColor: ['#2c7b72','#d4a13c','#3b7d9a','#a7c6c1'],
          borderWidth: 2,
          borderColor: '#fff'
        }]
      },
      options: {
        maintainAspectRatio: false,
        cutout: '68%',
        plugins: { legend: { position:'bottom', labels:{ color:'#355b55' } } }
      }
    });
  }
}


function goToFlights(){
  var form = document.getElementById('search-form');
  var data = { from:'', to:'', date:'', cls:'' };
  if(form){
    data.from = form.elements['from'].value.trim();
    data.to   = form.elements['to'].value.trim();
    data.date = form.elements['date'].value;
    data.cls  = form.elements['cls'].value;
  }
  try { localStorage.setItem('search', JSON.stringify(data)); } catch(e){}
  window.location.href = 'flights.html';
}


var FLIGHTS = [
  {from:'هرات', to:'کابل', time:'09:00 — 10:00', duration:'1h', price:120, airline:'Qatar', cls:'Economy', code:'QA-210'},
  {from:'کابل', to:'هرات', time:'12:30 — 13:30', duration:'1h', price:135, airline:'Emirates', cls:'Business', code:'EM-611'},
  {from:'هرات', to:'مزار', time:'08:15 — 09:05', duration:'50m', price:95, airline:'Turkish', cls:'Economy', code:'TK-045'},
  {from:'کابل', to:'مزار', time:'18:00 — 18:50', duration:'50m', price:105, airline:'Qatar', cls:'Economy', code:'QA-333'},
  {from:'هرات', to:'کابل', time:'21:00 — 22:00', duration:'1h', price:140, airline:'Emirates', cls:'Economy', code:'EM-912'}
];

function readInitialFilters(){
  var s = null;
  try { s = JSON.parse(localStorage.getItem('search')); } catch(e){}
  if(!s) return;
  var fFrom = document.getElementById('f-from');
  var fTo   = document.getElementById('f-to');
  var fDate = document.getElementById('f-date');
  var fClass= document.getElementById('f-class');
  if(fFrom) fFrom.value = s.from || '';
  if(fTo)   fTo.value   = s.to   || '';
  if(fDate) fDate.value = s.date || '';
  if(fClass)fClass.value= (s.cls==='business'?'Business': s.cls==='economy'?'Economy':'');
}

function renderFlights(list){
  var box = document.getElementById('results');
  if(!box) return;
  box.innerHTML = '';
  for(var i=0;i<list.length;i++){
    var f = list[i];
    var el = document.createElement('div');
    el.className = 'result-card';
    el.innerHTML =
      '<div>' +
        '<div class="route">✈️ ' + f.from + ' → ' + f.to + '</div>' +
        '<div class="meta">' +
          '<span>' + f.time + '</span>' +
          '<span>مدت: ' + f.duration + '</span>' +
          '<span class="tag">' + f.airline + '</span>' +
          '<span class="tag">' + f.cls + '</span>' +
          '<span class="tag">کد: ' + f.code + '</span>' +
        '</div>' +
      '</div>' +
      '<div class="actions">' +
        '<div class="price">$' + f.price + '</div>' +
        '<a class="btn primary" href="ticket.html" onclick="selectFlight(' + i + ')">رزرو</a>' +
      '</div>';
    box.appendChild(el);
  }
}

function selectFlight(idx){
  try { localStorage.setItem('selectedFlight', JSON.stringify(FLIGHTS[idx])); } catch(e){}
}

function applyFilters(){
  var from = (document.getElementById('f-from').value || '').trim();
  var to   = (document.getElementById('f-to').value   || '').trim();
  var cls  = document.getElementById('f-class').value || '';
  var filtered = [];
  for(var i=0;i<FLIGHTS.length;i++){
    var it = FLIGHTS[i];
    var ok = true;
    if(from && it.from.indexOf(from) === -1) ok = false;
    if(to && it.to.indexOf(to) === -1) ok = false;
    if(cls && it.cls !== cls) ok = false;
    if(ok) filtered.push(it);
  }
  renderFlights(filtered);
}

function resetFilters(){
  var ids = ['f-from','f-to','f-date','f-class'];
  for(var i=0;i<ids.length;i++){
    var el = document.getElementById(ids[i]);
    if(!el) continue;
    if(el.tagName === 'SELECT') el.value = '';
    else el.value = '';
  }
  renderFlights(FLIGHTS);
}


function hydrateTicket(){
  var t = null;
  try { t = JSON.parse(localStorage.getItem('selectedFlight')); } catch(e){}
  if(!t) return;
  
  var cities = document.querySelector('.route');
  if(cities){
    cities.innerHTML = '<span class="city from">' + (t.fromCode || 'DXB') + '</span>'
      + '<span class="arrow">→</span>'
      + '<span class="city to">' + (t.toCode || 'LHE') + '</span>';
  }
  
  var pricePair = document.querySelector('.pair:last-child strong');
  if(pricePair){ pricePair.textContent = '$' + t.price; }
}


window.addEventListener('load', function(){
 
  initCharts();

  
  if(document.getElementById('results')){
    readInitialFilters();
    renderFlights(FLIGHTS);
  }

  
  if(document.body && document.body.classList.contains('ticket-body')){
    hydrateTicket();
  }
});