// Synthetic component inputs only; this is not an authenticated server-flow fixture.
module.exports=function(){
 const now=Date.now(),coop={id:'p',owner_id:'owner',kind:'project',status:'active'},user={id:'owner'},name=id=>id||'—';
 const snapshot={loadedAt:now,terms_version:1,needs:[{id:'n',cooperation_id:'p',title:'Fixture',kind:'items',amount:200}],contributions:[],expenses:[],events:[],terms:[],documents:[],consents:[]};
 const policy={resource_id:'r',owner_id:'owner',revision:1,capacity:2,unit:'piece',available_from:new Date(now-3600000).toISOString(),available_until:new Date(now+3600000).toISOString(),conditions:'Fixture'};
 const row={id:'b',resource_id:'r',project_id:'p',resource_owner_id:'owner',requester_id:'member',revision:1,handoff_revision:1,state:'agreed',booking_policy_revision:1,booking_policy:policy,booking_unit:'piece',booking_quantity:2,starts_at:policy.available_from,ends_at:policy.available_until,issued:1,received:1,return_claimed:1,return_confirmed:0,note:'Fixture'};
 return {
 terms:FolkoopBudget.render({coop,user,owner:true,snapshot,name,documents:{rows:[{document_id:'d',revision:1,kind:'rules',title:'Fixture'}]}}),
 booking:FolkoopRooms.renderBookings({coop:{id:'r',kind:'resource',status:'active'},user,owner:true,member:true,rows:[row],resources:[{id:'r',owner_id:'owner',title:'Fixture'},{id:'p',owner_id:'member',title:'Fixture'}],policies:{loadedAt:now,rows:[policy]},name}),
 path:FolkoopDecisions.renderPath({id:'d',created_by:'author',rules_version:1,decision_maker:'owner'},{organizer:'owner',name,responses:[],objections:[],tasks:[{id:'t',source_decision_id:'d',title:'Fixture',assignee_id:'member'}],taskBases:{loadedAt:now,rows:[]}}),
 progress:FolkoopDecisions.renderProgress({coop,user,name,loadedAt:now,tasks:[],taskBases:{loadedAt:now,rows:[]},roomRequests:[row],meeting:null}),
 exchange:FolkoopExchange.render({user,rows:[{id:'00000000-0000-4000-8000-000000000001',owner_id:'owner',kind:'need',title:'Fixture',status:'open'}]})
 };
};
