const KEY="masari-v1";
const defaultData={tasks:[],exams:[],notes:[],schedule:[],courses:[]};
let data=JSON.parse(localStorage.getItem(KEY)||"null")||structuredClone(defaultData);
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
function save(){localStorage.setItem(KEY,JSON.stringify(data));renderAll()}
function esc(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
function switchSection(id){$$(".section").forEach(x=>x.classList.toggle("active",x.id===id));$$(".nav-item").forEach(x=>x.classList.toggle("active",x.dataset.section===id));$("#pageTitle").textContent={dashboard:"الرئيسية",schedule:"الجدول",tasks:"المهام",exams:"الاختبارات",notes:"الملاحظات",gpa:"حاسبة المعدل"}[id];$(".sidebar").classList.remove("open")}
$$(".nav-item").forEach(b=>b.onclick=()=>switchSection(b.dataset.section));
$$("[data-go]").forEach(b=>b.onclick=()=>switchSection(b.dataset.go));
$("#menuBtn").onclick=()=>$(".sidebar").classList.toggle("open");

function renderDashboard(){
  $("#statTasks").textContent=data.tasks.filter(x=>!x.done).length;
  $("#statExams").textContent=data.exams.filter(x=>new Date(x.date)>=new Date()).length;
  $("#statNotes").textContent=data.notes.length;
  const day=new Date().getDay(); const arDay=(day+1)%7;
  $("#statClasses").textContent=data.schedule.filter(x=>x.day===arDay).length;
  const tasks=[...data.tasks].filter(x=>!x.done).sort((a,b)=>a.date.localeCompare(b.date)).slice(0,4);
  $("#dashboardTasks").innerHTML=tasks.length?tasks.map(x=>`<div class="list-item"><span>${esc(x.title)}</span><span class="muted">${esc(x.date||"بدون موعد")}</span></div>`).join(""):'<div class="empty">لا توجد مهام قادمة 🎯</div>';
  const exams=[...data.exams].sort((a,b)=>a.date.localeCompare(b.date)).slice(0,4);
  $("#dashboardExams").innerHTML=exams.length?exams.map(x=>`<div class="list-item"><span>${esc(x.subject)}</span><span class="muted">${esc(x.date)}</span></div>`).join(""):'<div class="empty">لا توجد اختبارات مسجلة</div>';
}
function renderTasks(){
  $("#tasksList").innerHTML=data.tasks.length?data.tasks.map((x,i)=>`<article class="task-card ${x.done?"done":""}"><div><div class="task-title"><b>${esc(x.title)}</b></div><div class="muted">${esc(x.course||"")} ${x.date?"• "+esc(x.date):""}</div></div><div class="actions"><button class="icon-btn" onclick="toggleTask(${i})">${x.done?"↩":"✓"}</button><button class="icon-btn danger" onclick="del('tasks',${i})">×</button></div></article>`).join(""):'<div class="empty">ابدأ بإضافة أول مهمة.</div>';
}
function renderExams(){
  $("#examsList").innerHTML=data.exams.length?data.exams.map((x,i)=>`<article class="exam-card"><div><b>${esc(x.subject)}</b><div class="muted">${esc(x.date)} ${x.time?"• "+esc(x.time):""} ${x.room?"• "+esc(x.room):""}</div></div><button class="icon-btn danger" onclick="del('exams',${i})">×</button></article>`).join(""):'<div class="empty">لا توجد اختبارات مسجلة.</div>';
}
function renderNotes(){
  $("#notesList").innerHTML=data.notes.length?data.notes.map((x,i)=>`<article class="note-card"><div class="card-head"><h3>${esc(x.title)}</h3><button class="icon-btn danger" onclick="del('notes',${i})">×</button></div><p>${esc(x.body)}</p><div class="muted">${esc(x.date)}</div></article>`).join(""):'<div class="empty">مساحة فارغة لأفكارك وملاحظاتك.</div>';
}
const days=["السبت","الأحد","الإثنين","الثلاثاء","الأربعاء","الخميس","الجمعة"], times=["8:00–10:00","10:00–12:00","12:00–2:00","2:00–4:00","4:00–6:00"];
function renderSchedule(){
  let html='<div class="schedule-head">الوقت</div>'+days.map(d=>`<div class="schedule-head">${d}</div>`).join("");
  for(let t=0;t<5;t++){html+=`<div class="slot">${times[t]}</div>`;for(let d=0;d<7;d++){let items=data.schedule.filter(x=>x.day===d&&x.time===t);html+=`<div>${items.map(x=>`<div class="class-chip" title="اضغط للحذف" onclick="delSchedule(${data.schedule.indexOf(x)})"><strong>${esc(x.subject)}</strong>${esc(x.teacher||"")}</div>`).join("")}</div>`}}
  $("#scheduleGrid").innerHTML=html;
}
function renderGpa(){
  $("#coursesList").innerHTML=data.courses.length?data.courses.map((x,i)=>`<div class="course-row"><span>${esc(x.name)}</span><span>${x.hours} س</span><b>${x.grade}</b><button class="icon-btn danger" onclick="del('courses',${i})">×</button></div>`).join(""):'<div class="empty">أضف المواد لحساب المعدل.</div>';
  let h=data.courses.reduce((s,x)=>s+x.hours,0), p=data.courses.reduce((s,x)=>s+x.hours*x.grade,0), g=h?p/h:0;$("#gpaValue").textContent=g.toFixed(2);$("#gpaBar").style.width=(g/4*100)+"%";
}
function renderAll(){renderDashboard();renderTasks();renderExams();renderNotes();renderSchedule();renderGpa()}
function del(type,i){data[type].splice(i,1);save()} function toggleTask(i){data.tasks[i].done=!data.tasks[i].done;save()} function delSchedule(i){data.schedule.splice(i,1);save()}
function modal(title,fields,onSave){$("#modalTitle").textContent=title;$("#modalBody").innerHTML=fields.map(f=>`<div class="field"><label>${f.label}</label>${f.type==="textarea"?`<textarea name="${f.name}" rows="6" placeholder="${f.ph||""}"></textarea>`:`<input name="${f.name}" type="${f.type||"text"}" value="${f.value||""}" placeholder="${f.ph||""}">`}</div>`).join("");const form=$("#modalForm");form.onsubmit=e=>{e.preventDefault();const o=Object.fromEntries(new FormData(form));onSave(o);$("#modal").close();};$("#modal").showModal()}
$("#addTaskBtn").onclick=()=>modal("مهمة جديدة",[{name:"title",label:"عنوان المهمة",ph:"مثال: تسليم مشروع الشبكات"},{name:"course",label:"المادة",ph:"مثال: شبكات الحاسوب"},{name:"date",label:"موعد التسليم",type:"date"}],o=>{data.tasks.push({...o,done:false});save()});
$("#addExamBtn").onclick=()=>modal("اختبار جديد",[{name:"subject",label:"المادة",ph:"مثال: معمارية الحاسوب"},{name:"date",label:"التاريخ",type:"date"},{name:"time",label:"الوقت",ph:"10:00 صباحًا"},{name:"room",label:"المكان",ph:"قاعة 3"}],o=>{data.exams.push(o);save()});
$("#addNoteBtn").onclick=()=>modal("ملاحظة جديدة",[{name:"title",label:"العنوان",ph:"عنوان مختصر"},{name:"body",label:"المحتوى",type:"textarea",ph:"اكتب ملاحظتك هنا..."}],o=>{data.notes.unshift({...o,date:new Date().toLocaleDateString("ar-YE")});save()});
$("#addScheduleBtn").onclick=()=>{modal("إضافة محاضرة",[{name:"subject",label:"اسم المادة",ph:"مثال: قواعد البيانات"},{name:"teacher",label:"الدكتور",ph:"اختياري"},{name:"day",label:"رقم اليوم (0 السبت - 6 الجمعة)",type:"number",value:"0"},{name:"time",label:"الفترة (0 إلى 4)",type:"number",value:"0"}],o=>{data.schedule.push({...o,day:Number(o.day),time:Number(o.time)});save()})};
$("#addCourse").onclick=()=>{let n=$("#courseName").value.trim(),h=Number($("#courseHours").value),g=Number($("#courseGrade").value);if(n&&h>0){data.courses.push({name:n,hours:h,grade:g});$("#courseName").value="";$("#courseHours").value="";save()}};
$("#clearGpa").onclick=()=>{if(confirm("مسح جميع مواد المعدل؟")){data.courses=[];save()}};
renderAll();
