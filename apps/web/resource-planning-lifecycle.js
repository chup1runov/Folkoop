/* R1 lifecycle argument/page contract only. No I/O, storage, auth or UI activation.
   An export page is owner-scoped server data, not a complete account snapshot. */
(() => {
  'use strict';
  const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  const fail=code=>Object.assign(new Error(code),{code});
  function id(value) {
    if (typeof value!=='string'||!UUID.test(value)) throw fail('INVALID_ID');
    return value.toLowerCase();
  }
  function revision(value) {
    if (!Number.isInteger(value)||value<1||value>=2147483647) throw fail('INVALID_REVISION');
    return value;
  }
  function kind(value) {
    if (!['requirements','availability'].includes(value)) throw fail('INVALID_EXPORT_KIND');
    return value;
  }
  function removeRequirementArgs(projectId,requirementId,expectedRevision) {
    return Object.freeze({p_project:id(projectId),p_id:id(requirementId),p_expected_revision:revision(expectedRevision)});
  }
  function removeAvailabilityArgs(resourceId,expectedRevision) {
    return Object.freeze({p_resource:id(resourceId),p_expected_revision:revision(expectedRevision)});
  }
  function availabilityRevisionArgs(resourceId) {return Object.freeze({p_resource:id(resourceId)});}
  function exportArgs(exportKind,after=null,limit=100) {
    if (!Number.isInteger(limit)||limit<1||limit>100) throw fail('INVALID_PAGE_SIZE');
    return Object.freeze({p_kind:kind(exportKind),p_after:after===null?null:id(after),p_limit:limit});
  }
  function exportPage(value,expectedKind) {
    kind(expectedKind);
    if (!value||typeof value!=='object'||Array.isArray(value)||value.schema_version!==1
      ||value.kind!==expectedKind||value.scope!=='own_resource_planning_only'||value.snapshot!==false
      ||typeof value.has_more!=='boolean'||!Array.isArray(value.records)||value.records.length>100) throw fail('INVALID_EXPORT_PAGE');
    let previous=null;
    const records=value.records.map(row=>{
      if (!row||typeof row!=='object'||Array.isArray(row)) throw fail('INVALID_EXPORT_PAGE');
      const key=id(expectedKind==='requirements'?row.id:row.resource_id);
      if (previous!==null&&key<=previous) throw fail('INVALID_EXPORT_ORDER');
      previous=key;
      if (typeof row.quantity!=='string'||!/^(0|[1-9][0-9]*)(\.[0-9]{1,3})?$/.test(row.quantity)) throw fail('INVALID_EXPORT_QUANTITY');
      // Never coerce decimal data to binary floating-point for export.
      return Object.freeze({...row});
    });
    let next=null;
    if (value.has_more) {
      if (!records.length||id(value.next_cursor)!==previous) throw fail('INVALID_EXPORT_CURSOR');
      next=previous;
    } else if (value.next_cursor!==null) throw fail('INVALID_EXPORT_CURSOR');
    return Object.freeze({schema_version:1,kind:expectedKind,scope:value.scope,snapshot:false,
      records:Object.freeze(records),has_more:value.has_more,next_cursor:next});
  }
  globalThis.FolkoopResourceLifecycle=Object.freeze({removeRequirementArgs,removeAvailabilityArgs,availabilityRevisionArgs,exportArgs,exportPage});
})();
