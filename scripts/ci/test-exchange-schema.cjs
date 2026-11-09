// Independent Draft 2020-12 validation, separate from the product runtime validator.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const modules=process.env.FK_TEST_MODULES;if(!modules)throw Error('Set FK_TEST_MODULES to isolated test dependencies');
const Ajv=require(path.join(modules,'ajv/dist/2020.js')),formats=require(path.join(modules,'ajv-formats'));
const ajv=new Ajv({strict:true,allErrors:true});formats(ajv);
const schema=JSON.parse(fs.readFileSync('docs/contracts/selected-objects-v1.schema.json','utf8')),packet=JSON.parse(fs.readFileSync('docs/contracts/selected-objects-v1.example.json','utf8'));
const validate=ajv.compile(schema);assert.equal(validate(packet),true,JSON.stringify(validate.errors));
const mutations=[p=>p.version=2,p=>p.private_messages=[],p=>p.records[0].quantity={value:1.25,unit:'kg'},p=>p.records[0].source.private_profile={},p=>p.generated_at='2026-99-99T12:00:00.000Z',p=>p.records=[],p=>p.records[0].place.precision='address'];
for(const mutate of mutations){const p=structuredClone(packet);mutate(p);assert.equal(validate(p),false,'Malformed packet accepted');}
console.log(JSON.stringify({result:'passed',engine:'Ajv '+require(path.join(modules,'ajv/package.json')).version,draft:'2020-12',positive:1,negative:mutations.length,limit:'Cross-field identity, chronology and decimal magnitude additionally enforced by runtime tests.'}));
