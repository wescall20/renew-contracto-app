const services=[
  {id:"kitchen",label:"Kitchen Remodeling",sub:"Cabinets, countertops, layout & more",emoji:"🍳"},
  {id:"bathroom",label:"Bathroom Remodeling",sub:"Showers, vanities, tile & fixtures",emoji:"🚿"},
  {id:"deck",label:"Decks & Outdoor Living",sub:"Decks, railings, pools & gathering space",emoji:"🌳"},
  {id:"addition",label:"Additions",sub:"Sunrooms, expanded living & new space",emoji:"🏠"},
  {id:"exterior",label:"Exterior & Roofing",sub:"Roofing, siding, windows & doors",emoji:"🪟"},
  {id:"other",label:"Repairs or Other",sub:"Tell Renew what your home needs",emoji:"🛠️"}
];
const feels=["☀️ Bright & Open","🏡 Warm & Welcoming","◻️ Clean & Modern","🏛️ Classic & Timeless","🌿 Calm & Comfortable","✦ Bold & Distinctive"];
const steps=["service","details","feel","photos","contact","walkthrough","review"];
const state={service:"",feels:[],photos:[],photoNotes:"",details:{},contact:{},walkthrough:{},leadId:""};
const screens=[...document.querySelectorAll(".screen")];
const byName=name=>Object.fromEntries(new FormData(document.getElementById(name)).entries());
const escapeHtml=value=>String(value??"").replace(/[&<>'"]/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#039;",'"':"&quot;"}[ch]));

function go(name){
  screens.forEach(screen=>screen.classList.toggle("active",screen.dataset.screen===name));
  const index=steps.indexOf(name);
  document.getElementById("progress-bar").style.width=index<0?"0":`${((index+1)/steps.length)*100}%`;
  if(name==="review") renderReview();
  if(name==="status") renderStatus();
  history.replaceState(null,"",`#${name}`);
  window.scrollTo({top:0,behavior:"smooth"});
}

function renderChoices(){
  const serviceBox=document.getElementById("service-choices");
  serviceBox.innerHTML=services.map(item=>`<button class="choice" data-service="${item.id}"><span class="emoji">${item.emoji}</span><b>${item.label}</b><small>${item.sub}</small></button>`).join("");
  serviceBox.addEventListener("click",event=>{
    const button=event.target.closest("[data-service]"); if(!button)return;
    state.service=button.dataset.service;
    serviceBox.querySelectorAll(".choice").forEach(x=>x.classList.toggle("selected",x===button));
    document.querySelector('[data-screen="service"] [data-next]').disabled=false;
  });
  const feelBox=document.getElementById("feel-choices");
  feelBox.innerHTML=feels.map(item=>`<button class="choice" data-feel="${item}"><b>${item}</b></button>`).join("");
  feelBox.addEventListener("click",event=>{
    const button=event.target.closest("[data-feel]"); if(!button)return;
    const value=button.dataset.feel;
    state.feels=state.feels.includes(value)?state.feels.filter(x=>x!==value):[...state.feels,value];
    button.classList.toggle("selected",state.feels.includes(value));
    document.querySelector('[data-screen="feel"] [data-next]').disabled=state.feels.length===0;
  });
}

document.addEventListener("click",event=>{
  const nav=event.target.closest("[data-go]"); if(nav)go(nav.dataset.go);
  const next=event.target.closest("[data-next]");
  if(next){
    if(next.dataset.validate){const form=document.getElementById(next.dataset.validate);if(!form.reportValidity())return;capture(next.dataset.validate);}
    if(next.dataset.next==="details"&&!state.service)return;
    go(next.dataset.next);
  }
});

function capture(formId){
  if(formId==="details-form")state.details=byName(formId);
  if(formId==="contact-form")state.contact=byName(formId);
  if(formId==="walkthrough-form")state.walkthrough=byName(formId);
}

const photoInput=document.getElementById("photo-input");
photoInput.addEventListener("change",()=>{
  state.photos=[...photoInput.files].slice(0,10);
  renderPhotos();
});
function renderPhotos(){
  document.getElementById("photo-preview").innerHTML=state.photos.map((file,index)=>`<div class="photo-thumb"><img src="${URL.createObjectURL(file)}" alt="Selected project photo ${index+1}"><button type="button" data-remove-photo="${index}" aria-label="Remove photo ${index+1}">×</button></div>`).join("");
}
document.getElementById("photo-preview").addEventListener("click",event=>{
  const button=event.target.closest("[data-remove-photo]");if(!button)return;
  state.photos.splice(Number(button.dataset.removePhoto),1);renderPhotos();
});

function submissionPayload(){
  state.photoNotes=document.getElementById("photo-notes").value;
  const service=services.find(x=>x.id===state.service);
  return {
    schemaVersion:"1.0",
    source:"renew-home-vision-web",
    submittedAt:new Date().toISOString(),
    lead:{status:"new",source:"direct-app"},
    customer:{name:state.contact.name,email:state.contact.email,phone:state.contact.phone,preferredContact:state.contact.preferredContact},
    property:{address1:state.contact.address1,city:state.contact.city,state:state.contact.state,postalCode:state.contact.postalCode,addressValidated:false},
    project:{serviceId:state.service,serviceLabel:service?.label,problem:state.details.problem,vision:state.details.vision,timeline:state.details.timeline,budget:state.details.budget,desiredFeel:state.feels,photoNotes:state.photoNotes},
    photos:state.photos.map((file,index)=>({clientId:`photo-${index+1}`,name:file.name,type:file.type,size:file.size,storagePath:null})),
    walkthrough:{status:"requested",preferredDate:state.walkthrough.date1,preferredTime:state.walkthrough.time1,alternateDate:state.walkthrough.date2,alternateTime:state.walkthrough.time2,notes:state.walkthrough.notes,calendarEventId:null},
    consent:{contact:true,contactCapturedAt:new Date().toISOString(),sms:state.contact.smsConsent==="on",smsCapturedAt:state.contact.smsConsent==="on"?new Date().toISOString():null,source:"walkthrough-form"},
    ai:{summary:null,missingInformation:[],suggestedNextAction:null,model:null}
  };
}

function renderReview(){
  capture("details-form");capture("contact-form");capture("walkthrough-form");
  const p=submissionPayload();
  const rows=[
    ["Service",p.project.serviceLabel],["What needs changing",p.project.problem],["Desired result",p.project.vision],["Feel",p.project.desiredFeel.join(", ")],
    ["Timeline / budget",`${p.project.timeline}${p.project.budget?` · ${p.project.budget}`:""}`],["Property",`${p.property.address1}, ${p.property.city}, ${p.property.state} ${p.property.postalCode}`],
    ["Contact",`${p.customer.name} · ${p.customer.preferredContact}`],["Photos",`${p.photos.length} selected`],["Walkthrough request",`${p.walkthrough.preferredDate} · ${p.walkthrough.preferredTime}`],
    ["Text permission",p.consent.sms?"Opted in":"Not opted in"]
  ];
  document.getElementById("review-card").innerHTML=rows.map(([key,value])=>`<div class="review-row"><b>${escapeHtml(key)}</b><span>${escapeHtml(value||"Not provided")}</span></div>`).join("");
  const connected=window.RENEW_API_CONFIG.mode==="connected";
  document.getElementById("integration-note").textContent=connected?"Your information will be securely sent to Renew.":"Integration preview: the structured request is ready. Until Gemini connects the backend, the final action prepares an email to Mark; selected photos remain on your device.";
}

function emailHref(payload){
  const subject=`Home Vision: ${payload.project.serviceLabel} — ${payload.customer.name}`;
  const body=["NEW RENEW HOME VISION","",`Name: ${payload.customer.name}`,`Email: ${payload.customer.email}`,`Phone: ${payload.customer.phone}`,`Preferred contact: ${payload.customer.preferredContact}`,`Property: ${payload.property.address1}, ${payload.property.city}, ${payload.property.state} ${payload.property.postalCode}`,"",`Service: ${payload.project.serviceLabel}`,`Problem: ${payload.project.problem}`,`Vision: ${payload.project.vision}`,`Desired feel: ${payload.project.desiredFeel.join(", ")}`,`Timeline: ${payload.project.timeline}`,`Budget: ${payload.project.budget||"Not provided"}`,`Photos selected: ${payload.photos.length} (attachments require backend connection)`,`Photo notes: ${payload.project.photoNotes||"None"}`,"",`Walkthrough preference: ${payload.walkthrough.preferredDate} — ${payload.walkthrough.preferredTime}`,`Alternate: ${payload.walkthrough.alternateDate||"None"} — ${payload.walkthrough.alternateTime||""}`,`Notes: ${payload.walkthrough.notes||"None"}`,`SMS consent: ${payload.consent.sms?"Yes":"No"}`].join("\n");
  return `mailto:markkarlon@yahoo.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

document.getElementById("submit-request").addEventListener("click",async()=>{
  const submitBtn = document.getElementById("submit-request");
  const originalText = submitBtn.textContent;
  submitBtn.disabled = true;
  submitBtn.textContent = "Connecting to Renew & analyzing project...";
  
  const payload=submissionPayload();
  const config=window.RENEW_API_CONFIG;
  try {
    if(config.mode==="connected"&&config.endpoints.leadSubmission){
      const response=await fetch(config.endpoints.leadSubmission,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
      if(!response.ok){
        alert("Renew could not receive the request yet. Please try again or contact Renew directly.");
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
        return;
      }
      const result=await response.json();
      state.leadId=result.leadId;
      if(state.photos.length&&config.endpoints.photoUpload){
        submitBtn.textContent = "Uploading project photos...";
        const photoData=new FormData();
        photoData.append("leadId",state.leadId);
        state.photos.forEach(file=>photoData.append("photos",file,file.name));
        const photoResponse=await fetch(config.endpoints.photoUpload,{method:"POST",body:photoData});
        if(!photoResponse.ok){
          console.warn("Photos could not upload, but lead was saved.");
        }
      }
      document.getElementById("confirmation-copy").innerHTML=`
        Renew received your request <b>(${escapeHtml(state.leadId)})</b>. Mark Karlon will review your project details and personally confirm your walkthrough.<br><br>
        <a href="dashboard.html" class="button subtle" style="display:inline-block; width:auto; text-decoration:none; padding:10px 20px; font-size:14px; margin-top:10px;">
          Open Mark’s Dashboard to see lead & AI summary →
        </a>
      `;
      document.getElementById("email-fallback").hidden=true;
    }else{
      state.leadId=`PREVIEW-${Date.now().toString().slice(-6)}`;
      document.getElementById("email-fallback").href=emailHref(payload);
      document.getElementById("confirmation-copy").textContent="The app has prepared your complete request. Use the button below to send it to Mark while the secure backend is being connected.";
    }
    localStorage.setItem("renewLastRequest",JSON.stringify({leadId:state.leadId,service:payload.project.serviceLabel,date:payload.walkthrough.preferredDate,status:config.mode==="connected"?"Submitted":"Prepared for email"}));
    go("confirmation");
  } catch (err) {
    console.error("Submission error:", err);
    alert("Network error while submitting. Please check your connection.");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
  }
});

function renderStatus(){
  const saved=JSON.parse(localStorage.getItem("renewLastRequest")||"null");
  const box=document.getElementById("customer-status");
  if(!saved){box.innerHTML='<div class="status-head"><b>No request on this device</b><p>Start a Home Vision to create one.</p></div>';return;}
  box.innerHTML=`<div class="status-head"><b>${escapeHtml(saved.service)}</b><p>Reference ${escapeHtml(saved.leadId)}</p></div><div class="timeline"><div class="timeline-item done"><b>${escapeHtml(saved.status)}</b><span>Your structured Home Vision is ready.</span></div><div class="timeline-item"><b>Walkthrough confirmation</b><span>Mark confirms the date personally.</span></div><div class="timeline-item"><b>Project planning</b><span>Scope, estimate, documents, and updates will appear here.</span></div></div>`;
}

renderChoices();
const initial=location.hash.slice(1);go(screens.some(x=>x.dataset.screen===initial)?initial:"home");
